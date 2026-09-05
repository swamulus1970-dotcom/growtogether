import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Doctor, Department, HospitalInfo } from '../types';
import { HOSPITAL_INFO, DOCTORS_DATA, DEPARTMENTS_DATA } from '../data/hospitalData';

interface HospitalDataContextType {
  hospitalInfo: HospitalInfo;
  doctors: Doctor[];
  departments: Department[];
  loadingHospitalData: boolean;
  updateHospitalInfo: (updated: Partial<HospitalInfo>) => Promise<void>;
  updateDoctor: (doctorId: string, updatedDoctor: Partial<Doctor>) => Promise<void>;
  addDoctor: (newDoctor: Doctor) => Promise<void>;
  deleteDoctor: (doctorId: string) => Promise<void>;
  resetHospitalDataToDefault: () => Promise<void>;
}

const LOCAL_STORAGE_INFO_KEY = 'gth_custom_hospital_info_v2';
const LOCAL_STORAGE_DOCTORS_KEY = 'gth_custom_doctors_v2';
const LOCAL_STORAGE_DEPTS_KEY = 'gth_custom_depts_v2';

const defaultFullHospitalInfo: HospitalInfo = {
  ...HOSPITAL_INFO,
  heroHeadline: 'World-Class Clinical Precision & Compassionate Healing',
  heroSubheadline: 'Advanced tertiary multi-specialty healthcare with 15+ centers of excellence, robotic surgery suites, and 24/7 dedicated emergency trauma response.',
  announcement: '🌟 24/7 Emergency & Stroke Fast-Track Unit is fully operational. Book OPD consultations with zero wait time online.',
  missionStatement: 'To provide exemplary medical care by combining cutting-edge medical innovations with unwavering empathy, ensuring healthier outcomes for every individual and family.',
  aboutSummary: 'Founded in 1998, GrowTogether Hospitals has grown into one of the most respected quaternary care healthcare institutions in the region. Accredited by JCI and NABH, our multi-disciplinary medical teams provide comprehensive patient-centered treatments.',
};

const HospitalDataContext = createContext<HospitalDataContextType | undefined>(undefined);

export const HospitalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_INFO_KEY);
    if (saved) {
      try {
        return { ...defaultFullHospitalInfo, ...JSON.parse(saved) };
      } catch {
        // Ignore JSON error
      }
    }
    return defaultFullHospitalInfo;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_DOCTORS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Ignore JSON error
      }
    }
    return DOCTORS_DATA;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_DEPTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Ignore JSON error
      }
    }
    return DEPARTMENTS_DATA;
  });

  const [loadingHospitalData, setLoadingHospitalData] = useState(true);

  // Sync from Firestore on initial mount
  useEffect(() => {
    const fetchHospitalConfig = async () => {
      try {
        const infoDoc = await getDoc(doc(db, 'hospital_config', 'main_info'));
        if (infoDoc.exists()) {
          const remoteData = infoDoc.data() as HospitalInfo;
          setHospitalInfo(prev => {
            const merged = { ...prev, ...remoteData };
            localStorage.setItem(LOCAL_STORAGE_INFO_KEY, JSON.stringify(merged));
            return merged;
          });
        }

        const doctorsDoc = await getDoc(doc(db, 'hospital_config', 'doctors_list'));
        if (doctorsDoc.exists()) {
          const remoteDocs = doctorsDoc.data().doctors as Doctor[];
          if (Array.isArray(remoteDocs) && remoteDocs.length > 0) {
            setDoctors(remoteDocs);
            localStorage.setItem(LOCAL_STORAGE_DOCTORS_KEY, JSON.stringify(remoteDocs));
          }
        }
      } catch (err) {
        console.warn('Could not sync remote hospital configuration, using local/default:', err);
      } finally {
        setLoadingHospitalData(false);
      }
    };

    fetchHospitalConfig();
  }, []);

  // Update Hospital Info & texts
  const updateHospitalInfo = async (updated: Partial<HospitalInfo>) => {
    const newInfo: HospitalInfo = { ...hospitalInfo, ...updated };
    setHospitalInfo(newInfo);
    localStorage.setItem(LOCAL_STORAGE_INFO_KEY, JSON.stringify(newInfo));

    try {
      await setDoc(doc(db, 'hospital_config', 'main_info'), newInfo, { merge: true });
    } catch (e) {
      console.warn('Failed to persist hospital config to Firestore:', e);
    }
  };

  // Update a specific Doctor
  const updateDoctor = async (doctorId: string, updatedDoctor: Partial<Doctor>) => {
    const newDoctorsList = doctors.map(d => {
      if (d.id === doctorId) {
        return { ...d, ...updatedDoctor };
      }
      return d;
    });

    setDoctors(newDoctorsList);
    localStorage.setItem(LOCAL_STORAGE_DOCTORS_KEY, JSON.stringify(newDoctorsList));

    try {
      await setDoc(doc(db, 'hospital_config', 'doctors_list'), { doctors: newDoctorsList });
    } catch (e) {
      console.warn('Failed to persist doctors to Firestore:', e);
    }
  };

  // Add a new doctor
  const addDoctor = async (newDoctor: Doctor) => {
    const newDoctorsList = [newDoctor, ...doctors];
    setDoctors(newDoctorsList);
    localStorage.setItem(LOCAL_STORAGE_DOCTORS_KEY, JSON.stringify(newDoctorsList));

    try {
      await setDoc(doc(db, 'hospital_config', 'doctors_list'), { doctors: newDoctorsList });
    } catch (e) {
      console.warn('Failed to persist doctors to Firestore:', e);
    }
  };

  // Delete a doctor
  const deleteDoctor = async (doctorId: string) => {
    const newDoctorsList = doctors.filter(d => d.id !== doctorId);
    setDoctors(newDoctorsList);
    localStorage.setItem(LOCAL_STORAGE_DOCTORS_KEY, JSON.stringify(newDoctorsList));

    try {
      await setDoc(doc(db, 'hospital_config', 'doctors_list'), { doctors: newDoctorsList });
    } catch (e) {
      console.warn('Failed to persist doctors to Firestore:', e);
    }
  };

  // Reset to original system defaults
  const resetHospitalDataToDefault = async () => {
    setHospitalInfo(defaultFullHospitalInfo);
    setDoctors(DOCTORS_DATA);
    setDepartments(DEPARTMENTS_DATA);
    localStorage.removeItem(LOCAL_STORAGE_INFO_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DOCTORS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DEPTS_KEY);

    try {
      await setDoc(doc(db, 'hospital_config', 'main_info'), defaultFullHospitalInfo);
      await setDoc(doc(db, 'hospital_config', 'doctors_list'), { doctors: DOCTORS_DATA });
    } catch (e) {
      console.warn('Failed to reset Firestore config:', e);
    }
  };

  return (
    <HospitalDataContext.Provider
      value={{
        hospitalInfo,
        doctors,
        departments,
        loadingHospitalData,
        updateHospitalInfo,
        updateDoctor,
        addDoctor,
        deleteDoctor,
        resetHospitalDataToDefault,
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
};

export const useHospitalData = () => {
  const context = useContext(HospitalDataContext);
  if (!context) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
};
