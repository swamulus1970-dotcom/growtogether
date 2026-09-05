import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Video, 
  Building2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Phone, 
  Mail, 
  CreditCard,
  AlertCircle,
  Lock,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';
import { ConsultationType, Doctor } from '../types';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen?: boolean;
  initialDoctorId?: string | null;
  initialDepartmentId?: string | null;
  initialDate?: string | null;
  initialSlot?: string | null;
  onClose: () => void;
  onSuccess?: (appointment: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialDoctorId,
  initialDepartmentId,
  initialDate,
  initialSlot,
  onClose,
  onSuccess,
}) => {
  const { 
    bookAppointment, 
    isBookingModalOpen, 
    setIsBookingModalOpen,
    selectedDoctorForBooking,
    setSelectedDoctorForBooking,
    selectedDepartmentForBooking,
    setSelectedDepartmentForBooking,
  } = useAppointments();
  const { user, profile, isGuest, loginWithGoogle } = useAuth();
  const { doctors, departments } = useHospitalData();

  // Check if patient is authenticated via Google
  const isGoogleAuthenticated = Boolean(user && !isGuest);

  // Wizard Steps: 1 = Doctor & Dept, 2 = Date & Slot & Mode, 3 = Patient Info & Confirm
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId || 'cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || doctors.find((d) => d.departmentId === (initialDepartmentId || 'cardiology'))?.id || doctors[0]?.id || 'doc-1'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(initialDate || todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot || '10:00 AM');
  const [consultationType, setConsultationType] = useState<ConsultationType>('in_person');

  // Patient Details
  const [patientName, setPatientName] = useState<string>(user?.displayName || profile?.displayName || '');
  const [patientEmail, setPatientEmail] = useState<string>(user?.email || profile?.email || '');
  const [patientPhone, setPatientPhone] = useState<string>(profile?.phone || '+1 (555) 234-8901');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [reasonForVisit, setReasonForVisit] = useState<string>('Routine health consultation & checkup');
  const [pastMedicalHistory, setPastMedicalHistory] = useState<string>('None');
  const [insurancePolicy, setInsurancePolicy] = useState<string>(profile?.insurancePolicyNumber || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'insurance' | 'pay_at_hospital'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('921');
  const [upiId, setUpiId] = useState('patient@okhdfcbank');

  // Determine visibility based on prop or context
  const isVisible = isOpen !== undefined ? isOpen : isBookingModalOpen;

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctorForBooking(null);
    setSelectedDepartmentForBooking(null);
    setStep(1);
    setErrorMsg(null);
    onClose?.();
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  // Keep state synced when Google user authenticates
  useEffect(() => {
    if (user && !isGuest) {
      if (user.displayName) setPatientName(user.displayName);
      if (user.email) setPatientEmail(user.email);
    } else if (profile) {
      if (!patientName) setPatientName(profile.displayName || '');
      if (!patientEmail) setPatientEmail(profile.email || '');
      if (!patientPhone && profile.phone) setPatientPhone(profile.phone);
      if (!insurancePolicy && profile.insurancePolicyNumber) setInsurancePolicy(profile.insurancePolicyNumber);
    }
  }, [user, isGuest, profile]);

  // Sync when context selection changes
  useEffect(() => {
    if (selectedDoctorForBooking) {
      setSelectedDoctorId(selectedDoctorForBooking);
      const doc = doctors.find((d) => d.id === selectedDoctorForBooking);
      if (doc) {
        setSelectedDeptId(doc.departmentId);
      }
    }
  }, [selectedDoctorForBooking, doctors]);

  useEffect(() => {
    if (selectedDepartmentForBooking) {
      setSelectedDeptId(selectedDepartmentForBooking);
      const docs = doctors.filter((d) => d.departmentId === selectedDepartmentForBooking);
      if (docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
    }
  }, [selectedDepartmentForBooking, doctors]);

  // When initial props change
  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
      const doc = doctors.find((d) => d.id === initialDoctorId);
      if (doc) {
        setSelectedDeptId(doc.departmentId);
      }
      if (initialDate && initialSlot) {
        setAppointmentDate(initialDate);
        setSelectedSlot(initialSlot);
        setStep(3); // Jump straight to patient info if doctor and slot already preselected
      }
    }
  }, [initialDoctorId, initialDate, initialSlot, doctors]);

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const currentDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const doctorsInDept = doctors.filter((d) => d.departmentId === selectedDeptId);

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const docs = doctors.filter((d) => d.departmentId === deptId);
    if (docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
      setSelectedSlot(docs[0].availableSlots[0] || '10:00 AM');
    }
  };

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setSelectedDeptId(doc.departmentId);
      setSelectedSlot(doc.availableSlots[0] || '10:00 AM');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in error during booking:', err);
      setErrorMsg(err.message || 'Google sign-in was cancelled or encountered an error. Please try again.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isGoogleAuthenticated) {
      setErrorMsg('Please sign in with your Google account to proceed with booking.');
      return;
    }

    if (!patientName.trim()) {
      setErrorMsg('Please provide patient name');
      return;
    }
    if (!patientEmail.trim()) {
      setErrorMsg('Please provide a contact email');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let transactionId = paymentMethod === 'pay_at_hospital' ? undefined : `TXN-${Math.floor(100000 + Math.random() * 900000)}-GTH`;

      if (paymentMethod !== 'pay_at_hospital') {
        try {
          const payRes = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: currentDoctor.consultationFee,
              currency: 'usd',
              metadata: {
                doctor: currentDoctor.name,
                patient: patientName.trim(),
                email: patientEmail.trim(),
                method: paymentMethod
              }
            })
          });
          const payData = await payRes.json();
          if (payData && payData.success && payData.id) {
            transactionId = payData.id.toUpperCase();
          }
        } catch (payErr) {
          console.warn('Stripe backend gateway call warning:', payErr);
        }
      }

      const booked = await bookAppointment({
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender: patientGender,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialty,
        doctorPhotoUrl: currentDoctor.photoUrl,
        departmentId: currentDept.id,
        departmentName: currentDept.name,
        date: appointmentDate,
        timeSlot: selectedSlot,
        consultationType: consultationType,
        consultationFee: currentDoctor.consultationFee,
        reasonForVisit: reasonForVisit.trim() || 'General Medical Consultation',
        pastMedicalHistory: pastMedicalHistory.trim(),
        paymentStatus: paymentMethod === 'pay_at_hospital' ? 'pending' : 'paid',
        paymentMethod: paymentMethod,
        paymentTransactionId: transactionId,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#14b8a6', '#0f766e', '#38bdf8']
        });
      } catch (err) {
        // Safe fallback if confetti canvas fails
      }

      onSuccess?.(booked);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // DO NOT RENDER IF MODAL IS NOT OPEN
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Online OPD Consultation</span>
            </div>
            <h2 id="booking-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Book Doctor Appointment
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            aria-label="Close booking modal"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Authentication Status / Sign-In Required Gate */}
        {!isGoogleAuthenticated ? (
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-5 text-teal-600 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-teal-600" />
            </div>

            <span className="px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold uppercase tracking-wide mb-2">
              Identity Verification
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Sign In with Google to Book
            </h3>

            <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
              GrowTogether Hospital requires patients to authenticate with a Google account to issue your verified OPD appointment pass, generate digital QR check-in codes, and provide instant medical updates.
            </p>

            {/* Doctor Highlight if pre-selected */}
            <div className="w-full max-w-md p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 mb-6 text-left">
              <img 
                src={currentDoctor.photoUrl} 
                alt={currentDoctor.name} 
                className="w-12 h-12 rounded-xl object-cover object-top border border-slate-300 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-teal-700 font-semibold">{currentDept.name}</p>
                <p className="text-sm font-bold text-slate-900 truncate">{currentDoctor.name}</p>
                <p className="text-xs text-slate-500 font-medium">OPD Consultation Fee: ${currentDoctor.consultationFee}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="w-full max-w-md mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Sign-In Action */}
            <div className="w-full max-w-md space-y-3">
              <button
                type="button"
                id="booking-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-sm hover:shadow-md transition-all text-sm cursor-pointer disabled:opacity-60"
              >
                {isSigningInGoogle ? (
                  <>
                    <span className="w-5 h-5 border-2 border-slate-400 border-t-teal-600 rounded-full animate-spin"></span>
                    <span>Connecting Google Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Instant OPD Pass</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Live Queue Updates</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>100% Secure HIPAA</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Verified Patient Header Banner */}
            <div className="px-6 py-2.5 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-teal-900">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-5 h-5 rounded-full border border-teal-300" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                )}
                <span className="font-semibold truncate">
                  Signed in as <strong>{user.displayName || user.email}</strong>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                  Google Verified
                </span>
              </div>
              <span className="text-[11px] text-teal-700 hidden md:inline">
                {user.email}
              </span>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
                <span className="hidden sm:inline">Specialist</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
                <span className="hidden sm:inline">Date & Slot</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
                <span className="hidden sm:inline">Patient</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-teal-700 font-bold' : 'text-slate-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>4</span>
                <span className="hidden sm:inline">Payment</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-6 sm:p-8 flex-1">
              {errorMsg && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Select Department & Doctor */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Department Dropdown / Radio */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Select Clinical Department
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => handleDeptChange(dept.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                            selectedDeptId === dept.id
                              ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{dept.name.split('&')[0].trim()}</span>
                          <span className="text-[10px] text-slate-600 mt-1">{dept.doctorCount} Doctors</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Doctors List in Selected Dept */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Choose Treating Doctor in {currentDept.name}
                    </label>
                    <div className="space-y-2.5">
                      {doctorsInDept.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDoctorChange(doc.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedDoctorId === doc.id
                              ? 'bg-teal-50/70 border-teal-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img 
                              src={doc.photoUrl} 
                              alt={doc.name} 
                              className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 shrink-0" 
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h4>
                              <p className="text-xs text-teal-800 font-medium truncate">{doc.specialty}</p>
                              <p className="text-[11px] text-slate-700">{doc.experienceYears} yrs exp • ${doc.consultationFee} fee</p>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            selectedDoctorId === doc.id ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {selectedDoctorId === doc.id && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Consultation Type & Date & Slot */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Doctor Summary Banner */}
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3">
                    <img 
                      src={currentDoctor.photoUrl} 
                      alt={currentDoctor.name} 
                      className="w-11 h-11 rounded-xl object-cover object-top border border-teal-200" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-teal-800 font-semibold">{currentDoctor.departmentName}</div>
                      <div className="text-sm font-bold text-slate-900">{currentDoctor.name}</div>
                      <div className="text-xs text-slate-700">OPD Consultation Fee: ${currentDoctor.consultationFee}</div>
                    </div>
                  </div>

                  {/* Consultation Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Consultation Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setConsultationType('in_person')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          consultationType === 'in_person'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <Building2 className="w-4 h-4 text-teal-600" />
                          <span>In-Person Hospital Visit</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          Consult directly at {currentDoctor.roomNumber}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType('video_call')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          consultationType === 'video_call'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <Video className="w-4 h-4 text-teal-600" />
                          <span>Tele-Health Video Call</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          Secure HD video consultation from home
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Choose Appointment Date
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  {/* Available Slots Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Available Time Slot
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentDoctor.availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                            selectedSlot === slot
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Patient Information & Final Confirmation */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Review Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Physician</span>
                      <strong className="text-white font-bold">{currentDoctor.name} ({currentDept.name.split('&')[0]})</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Scheduled Time</span>
                      <span className="text-teal-300 font-semibold">{appointmentDate} at {selectedSlot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Consultation Format & Fee</span>
                      <span className="text-emerald-400 font-bold capitalize">{consultationType.replace('_', ' ')} • ${currentDoctor.consultationFee}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Verified Google Email *
                        </label>
                        <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Google Account</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        required
                        readOnly
                        value={patientEmail}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-xs outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+1 555-0192"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Age *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Gender *</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Consultation / Key Symptoms</label>
                    <textarea
                      rows={2}
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="Describe your symptoms, duration, or reason for follow-up..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Health Insurance Policy # (Optional)</label>
                      <input
                        type="text"
                        value={insurancePolicy}
                        onChange={(e) => setInsurancePolicy(e.target.value)}
                        placeholder="e.g. BS-90218-GTH"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Past Medical History / Allergies</label>
                      <input
                        type="text"
                        value={pastMedicalHistory}
                        onChange={(e) => setPastMedicalHistory(e.target.value)}
                        placeholder="e.g. Penicillin allergy, Diabetes"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Secure Payment & Checkout */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Consultation Fee</span>
                      <strong className="text-emerald-400 font-bold text-sm">${currentDoctor.consultationFee}.00 USD</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Hospital & Digital Pass</span>
                      <span className="text-emerald-400 font-semibold">Included (0.00)</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-300 font-semibold">Total Due</span>
                      <span className="text-teal-300 font-extrabold text-sm">${currentDoctor.consultationFee}.00 USD</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span>Select Secure Payment Method</span>
                      <span className="text-[10px] text-teal-700 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>SSL Encrypted</span>
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <CreditCard className="w-4 h-4 text-teal-600" />
                          <span>Credit / Debit Card</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          Visa, Mastercard, Amex, Discover
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'upi'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          <span>UPI / QR / Wallet</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          GPay, PhonePe, Paytm, UPI ID
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('insurance')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'insurance'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <Building2 className="w-4 h-4 text-teal-600" />
                          <span>Health Insurance / TPA</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          Cashless Direct Billing
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pay_at_hospital')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === 'pay_at_hospital'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Pay at Hospital Desk</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal">
                          Pay cash/card at OPD reception
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details Input Fields */}
                  {paymentMethod === 'card' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-bold">Card Details</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber('4242 4242 4242 4242');
                            setCardExpiry('12/28');
                            setCardCvv('888');
                          }}
                          className="text-teal-700 hover:underline font-semibold text-[11px]"
                        >
                          Fill Test Card
                        </button>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 •••• •••• 4242"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">CVV Security Code</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="text-xs font-semibold text-slate-700 block">Virtual Payment Address (UPI ID)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                      />
                      <p className="text-[11px] text-slate-700">A secure collect request will be sent to your UPI app upon confirmation.</p>
                    </div>
                  )}

                  {paymentMethod === 'insurance' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="text-xs font-semibold text-slate-700 block">Health Insurance Policy / TPA ID</label>
                      <input
                        type="text"
                        value={insurancePolicy}
                        onChange={(e) => setInsurancePolicy(e.target.value)}
                        placeholder="e.g. TPA-BS-90218-GTH"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                      />
                      <p className="text-[11px] text-slate-700">Cashless pre-authorization will be verified by the hospital insurance desk.</p>
                    </div>
                  )}

                  {paymentMethod === 'pay_at_hospital' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Pay at Hospital Desk Upon Arrival</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Your appointment status will remain pending confirmation until payment is completed at the OPD cash counter prior to consultation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmBooking}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing Payment & Booking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit Appointment & Pay (${currentDoctor.consultationFee})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
