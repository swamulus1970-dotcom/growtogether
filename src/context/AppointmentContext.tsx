import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Appointment, AppointmentStatus, MedicalRecord, VitalSign } from '../types';

export interface AdminCreateBookingInput {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhotoUrl: string;
  departmentId: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  consultationType: 'in_person' | 'video_call' | 'home_visit';
  consultationFee: number;
  reasonForVisit: string;
  pastMedicalHistory?: string;
  notesFromDoctor?: string;
  status?: AppointmentStatus;
}

interface AppointmentContextType {
  appointments: Appointment[];
  allHospitalAppointments: Appointment[];
  loadingAppointments: boolean;
  vitals: VitalSign[];
  records: MedicalRecord[];
  bookAppointment: (data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'status'>) => Promise<Appointment>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => Promise<void>;
  addVitalReading: (vital: Omit<VitalSign, 'id'>) => Promise<void>;
  selectedDoctorForBooking: string | null;
  setSelectedDoctorForBooking: (id: string | null) => void;
  selectedDepartmentForBooking: string | null;
  setSelectedDepartmentForBooking: (id: string | null) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  activeAppointmentSuccess: Appointment | null;
  setActiveAppointmentSuccess: (appt: Appointment | null) => void;
  latestBookedAppointment: Appointment | null;
  setLatestBookedAppointment: (appt: Appointment | null) => void;
  
  // Admin Management Actions
  adminCreateBooking: (data: AdminCreateBookingInput) => Promise<Appointment>;
  adminUpdateStatus: (id: string, newStatus: AppointmentStatus, remarks?: string) => Promise<void>;
  adminReschedule: (id: string, newDate: string, newTime: string, reason?: string) => Promise<void>;
  adminAddClinicalNotes: (id: string, notes: string, prescriptionIssued?: boolean) => Promise<void>;
  adminDeleteAppointment: (id: string) => Promise<void>;
  adminExportAppointmentsCSV: () => void;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const LOCAL_STORAGE_APPTS_KEY = 'gth_real_appointments_v4';
const LOCAL_STORAGE_VITALS_KEY = 'gth_real_vitals_v4';
const LOCAL_STORAGE_RECORDS_KEY = 'gth_real_records_v4';

/**
 * Deduplicates an array of appointments ensuring no duplicate ID, Code, or exact same patient/time slot
 */
export function deduplicateAppointments(list: Appointment[]): Appointment[] {
  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const seenExact = new Set<string>();

  return list.filter((appt) => {
    if (!appt) return false;

    // Filter duplicate IDs
    if (appt.id) {
      if (seenIds.has(appt.id)) return false;
      seenIds.add(appt.id);
    }

    // Filter duplicate Appointment Codes
    if (appt.appointmentCode) {
      if (seenCodes.has(appt.appointmentCode)) return false;
      seenCodes.add(appt.appointmentCode);
    }

    // Filter exact same patient booking with the same doctor on the same date and time
    const exactKey = `${(appt.patientName || '').trim().toLowerCase()}_${appt.doctorId}_${appt.date}_${appt.timeSlot}`;
    if (seenExact.has(exactKey)) return false;
    seenExact.add(exactKey);

    return true;
  });
}

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isGuest, isAdmin } = useAuth();
  const [allHospitalAppointments, setAllHospitalAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  
  // Quick booking trigger states
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | null>(null);
  const [selectedDepartmentForBooking, setSelectedDepartmentForBooking] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeAppointmentSuccess, setActiveAppointmentSuccess] = useState<Appointment | null>(null);
  const [latestBookedAppointment, setLatestBookedAppointment] = useState<Appointment | null>(null);

  // Load vitals & records for current user
  useEffect(() => {
    // Purge legacy demo keys
    try {
      localStorage.removeItem('gth_local_appointments_v1');
      localStorage.removeItem('gth_local_appointments_v2');
      localStorage.removeItem('gth_local_appointments_v3');
      localStorage.removeItem('gth_local_vitals_v1');
      localStorage.removeItem('gth_guest_patient');
    } catch {
      // ignore
    }

    const savedVitals = localStorage.getItem(LOCAL_STORAGE_VITALS_KEY);
    if (savedVitals) {
      try {
        setVitals(JSON.parse(savedVitals));
      } catch {
        setVitals([]);
      }
    } else {
      setVitals([]);
    }

    const savedRecords = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    } else {
      setRecords([]);
    }
  }, []);

  // Sync appointments from Firestore or Local Storage
  const loadAppointmentsData = useCallback(async () => {
    setLoadingAppointments(true);
    const savedLocal = localStorage.getItem(LOCAL_STORAGE_APPTS_KEY);
    let localAppts: Appointment[] = [];
    if (savedLocal) {
      try {
        localAppts = deduplicateAppointments(JSON.parse(savedLocal));
      } catch {
        localAppts = [];
      }
    }

    try {
      // Fetch all real appointments from Firestore
      const querySnap = await getDocs(collection(db, 'appointments'));
      const firestoreAppts: Appointment[] = [];
      querySnap.forEach((docSnap) => {
        firestoreAppts.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
      });

      const merged = deduplicateAppointments([...firestoreAppts, ...localAppts]);
      merged.sort((a, b) => new Date(b.date + ' ' + (b.timeSlot || '')).getTime() - new Date(a.date + ' ' + (a.timeSlot || '')).getTime());
      setAllHospitalAppointments(merged);
    } catch (e) {
      setAllHospitalAppointments(localAppts);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupListener = async () => {
      setLoadingAppointments(true);
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_APPTS_KEY);
      let localAppts: Appointment[] = [];
      if (savedLocal) {
        try {
          localAppts = deduplicateAppointments(JSON.parse(savedLocal));
        } catch {
          localAppts = [];
        }
      }

      try {
        // Real-time listener on appointments collection
        const apptsColRef = collection(db, 'appointments');
        unsubscribe = onSnapshot(apptsColRef, (snapshot) => {
          const firestoreAppts: Appointment[] = [];
          snapshot.forEach((docSnap) => {
            firestoreAppts.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
          });

          const merged = deduplicateAppointments([...firestoreAppts, ...localAppts]);
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setAllHospitalAppointments(merged);
          localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(merged));
          setLoadingAppointments(false);
        }, (err) => {
          console.warn('Firestore snapshot error, using local dataset:', err);
          setAllHospitalAppointments(localAppts);
          setLoadingAppointments(false);
        });
      } catch (e) {
        setAllHospitalAppointments(localAppts);
        setLoadingAppointments(false);
      }
    };

    setupListener();

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute patient-specific appointments for only logged in users (Google / Mobile OTP / Admin)
  const userAppointments = allHospitalAppointments.filter((a) => {
    if (isAdmin) return true;
    if (user) {
      const matchUid = a.userId === user.uid;
      const matchEmail = Boolean(user.email && a.patientEmail && a.patientEmail.toLowerCase() === user.email.toLowerCase());
      return matchUid || matchEmail;
    }
    if (profile) {
      const matchUid = a.userId === profile.uid;
      const matchEmail = Boolean(profile.email && a.patientEmail && a.patientEmail.toLowerCase() === profile.email.toLowerCase());
      const matchPhone = Boolean(profile.phone && a.patientPhone && a.patientPhone.replace(/\D/g, '') === profile.phone.replace(/\D/g, ''));
      return matchUid || matchEmail || matchPhone;
    }
    // If not logged in, no appointments shown
    return false;
  });

  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'status'>
  ): Promise<Appointment> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentCode = `GTH-2026-${randomSuffix}`;
    const newAppointment: Appointment = {
      ...data,
      id: `appt-${Date.now()}-${randomSuffix}`,
      appointmentCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: user?.uid || (profile?.uid || 'guest-patient')
    };

    const currentList = [...allHospitalAppointments];
    const updated = [newAppointment, ...currentList];
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...newAppointment,
        serverCreatedAt: serverTimestamp(),
      });
      newAppointment.id = docRef.id;
    } catch (e) {
      console.warn('Saved appointment to local session:', e);
    }

    setActiveAppointmentSuccess(newAppointment);
    setLatestBookedAppointment(newAppointment);
    return newAppointment;
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    const updated = allHospitalAppointments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: 'cancelled' as AppointmentStatus,
          notesFromDoctor: reason ? `Cancelled: ${reason}` : (a.notesFromDoctor || 'Cancelled by patient'),
        };
      }
      return a;
    });
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      await updateDoc(apptDocRef, {
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by patient',
        cancelledAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore cancel update fallback:', e);
    }
  };

  const rescheduleAppointment = async (id: string, newDate: string, newTime: string) => {
    const updated = allHospitalAppointments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          date: newDate,
          timeSlot: newTime,
          status: 'rescheduled' as AppointmentStatus,
        };
      }
      return a;
    });
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      await updateDoc(apptDocRef, {
        date: newDate,
        timeSlot: newTime,
        status: 'rescheduled',
        rescheduledAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore reschedule update fallback:', e);
    }
  };

  // Admin Management Actions
  const adminCreateBooking = async (data: AdminCreateBookingInput): Promise<Appointment> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentCode = `GTH-ADM-${randomSuffix}`;
    const newAppointment: Appointment = {
      ...data,
      id: `adm-appt-${Date.now()}-${randomSuffix}`,
      appointmentCode,
      status: data.status || 'confirmed',
      createdAt: new Date().toISOString(),
      userId: `admin-booked-${Date.now()}`
    };

    const currentList = [...allHospitalAppointments];
    const updated = [newAppointment, ...currentList];
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...newAppointment,
        serverCreatedAt: serverTimestamp(),
        bookedByAdmin: true,
      });
      newAppointment.id = docRef.id;
    } catch (e) {
      console.warn('Saved admin booking to local dataset:', e);
    }

    return newAppointment;
  };

  const adminUpdateStatus = async (id: string, newStatus: AppointmentStatus, remarks?: string) => {
    const updated = allHospitalAppointments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: newStatus,
          notesFromDoctor: remarks !== undefined ? remarks : a.notesFromDoctor,
        };
      }
      return a;
    });
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      const payload: any = { status: newStatus, updatedAt: new Date().toISOString() };
      if (remarks !== undefined) payload.notesFromDoctor = remarks;
      await updateDoc(apptDocRef, payload);
    } catch (e) {
      console.warn('Firestore status update fallback:', e);
    }
  };

  const adminReschedule = async (id: string, newDate: string, newTime: string, reason?: string) => {
    const updated = allHospitalAppointments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          date: newDate,
          timeSlot: newTime,
          status: 'rescheduled' as AppointmentStatus,
          notesFromDoctor: reason ? `${a.notesFromDoctor ? a.notesFromDoctor + ' | ' : ''}Rescheduled: ${reason}` : a.notesFromDoctor,
        };
      }
      return a;
    });
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      await updateDoc(apptDocRef, {
        date: newDate,
        timeSlot: newTime,
        status: 'rescheduled',
        rescheduledAt: new Date().toISOString(),
        adminRescheduleNote: reason || ''
      });
    } catch (e) {
      console.warn('Firestore reschedule fallback:', e);
    }
  };

  const adminAddClinicalNotes = async (id: string, notes: string, prescriptionIssued = false) => {
    const updated = allHospitalAppointments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          notesFromDoctor: notes,
          prescriptionIssued: prescriptionIssued,
        };
      }
      return a;
    });
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      await updateDoc(apptDocRef, {
        notesFromDoctor: notes,
        prescriptionIssued: prescriptionIssued,
        notesUpdatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore notes update fallback:', e);
    }
  };

  const adminDeleteAppointment = async (id: string) => {
    const updated = allHospitalAppointments.filter((a) => a.id !== id);
    setAllHospitalAppointments(updated);
    localStorage.setItem(LOCAL_STORAGE_APPTS_KEY, JSON.stringify(updated));

    try {
      const apptDocRef = doc(db, 'appointments', id);
      await deleteDoc(apptDocRef);
    } catch (e) {
      console.warn('Firestore delete fallback:', e);
    }
  };

  const adminExportAppointmentsCSV = () => {
    if (!allHospitalAppointments.length) return;
    const headers = [
      'Appointment Code',
      'Patient Name',
      'Email',
      'Phone',
      'Age',
      'Gender',
      'Department',
      'Doctor',
      'Date',
      'Time Slot',
      'Consultation Type',
      'Fee ($)',
      'Status',
      'Reason For Visit',
      'Doctor Notes',
      'Created At'
    ];

    const rows = allHospitalAppointments.map((a) => [
      `"${a.appointmentCode}"`,
      `"${a.patientName}"`,
      `"${a.patientEmail}"`,
      `"${a.patientPhone}"`,
      a.patientAge,
      `"${a.patientGender}"`,
      `"${a.departmentName}"`,
      `"${a.doctorName}"`,
      `"${a.date}"`,
      `"${a.timeSlot}"`,
      `"${a.consultationType}"`,
      a.consultationFee,
      `"${a.status}"`,
      `"${(a.reasonForVisit || '').replace(/"/g, '""')}"`,
      `"${(a.notesFromDoctor || '').replace(/"/g, '""')}"`,
      `"${a.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GrowTogether_Appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addVitalReading = async (vital: Omit<VitalSign, 'id'>) => {
    const newVital: VitalSign = {
      id: `vital-${Date.now()}`,
      ...vital,
    };
    const updated = [newVital, ...vitals];
    setVitals(updated);
    localStorage.setItem(LOCAL_STORAGE_VITALS_KEY, JSON.stringify(updated));

    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'vitals'), newVital);
      } catch (e) {
        console.warn('Firestore vitals save skipped:', e);
      }
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments: userAppointments,
        allHospitalAppointments,
        loadingAppointments,
        vitals,
        records,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        addVitalReading,
        selectedDoctorForBooking,
        setSelectedDoctorForBooking,
        selectedDepartmentForBooking,
        setSelectedDepartmentForBooking,
        isBookingModalOpen,
        setIsBookingModalOpen,
        activeAppointmentSuccess,
        setActiveAppointmentSuccess,
        latestBookedAppointment,
        setLatestBookedAppointment,

        // Admin
        adminCreateBooking,
        adminUpdateStatus,
        adminReschedule,
        adminAddClinicalNotes,
        adminDeleteAppointment,
        adminExportAppointmentsCSV,
        refreshAppointments: loadAppointmentsData,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) throw new Error('useAppointments must be used within an AppointmentProvider');
  return context;
};

