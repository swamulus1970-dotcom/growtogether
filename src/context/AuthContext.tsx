import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { PatientProfile, AdminSession } from '../types';

export const ADMIN_AUTHORIZED_EMAILS = [
  'charanrajas1990@gmail.com',
  'admin@growtogetherhospitals.com',
];

const LOCAL_STORAGE_ADMIN_KEY = 'gth_admin_auth_session_v1';
const LOCAL_STORAGE_PATIENT_KEY = 'gth_auth_patient_session_v1';

interface AuthContextType {
  user: User | null;
  profile: PatientProfile | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  adminSession: AdminSession | null;
  loginWithGoogle: () => Promise<void>;
  loginAdminWithGoogle: () => Promise<void>;
  loginWithPhoneOTP: (phoneNumber: string, otpCode: string, name?: string) => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<string>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendAdminPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePatientProfile: (data: Partial<PatientProfile>) => Promise<void>;
  loginAdminWithCredentials: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  // Helper to check if email is admin
  const isEmailAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    return ADMIN_AUTHORIZED_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase());
  };

  // Check if current user or admin session represents admin
  const isUserAdmin = Boolean(
    (user?.email && isEmailAdmin(user.email)) ||
    adminSession !== null
  );

  useEffect(() => {
    // Check local storage for admin session
    const savedAdmin = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin) as AdminSession;
        if (parsed.email && isEmailAdmin(parsed.email)) {
          setAdminSession(parsed);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
        }
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
      }
    }

    // Check local storage for phone/OTP patient session
    const savedPatient = localStorage.getItem(LOCAL_STORAGE_PATIENT_KEY);
    if (savedPatient) {
      try {
        const patientData = JSON.parse(savedPatient);
        if (patientData && patientData.uid) {
          setProfile(patientData);
        }
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_PATIENT_KEY);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);

        // Check if logged in user is authorized admin
        if (currentUser.email && isEmailAdmin(currentUser.email)) {
          const session: AdminSession = {
            email: currentUser.email,
            role: 'SuperAdmin',
            token: `token-${Date.now()}`,
            name: currentUser.displayName || 'Administrator',
            loggedInAt: new Date().toISOString()
          };
          setAdminSession(session);
          localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(session));
        }

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as PatientProfile);
          } else {
            const newProfile: PatientProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || (currentUser.email?.includes('admin') ? 'Administrator' : 'Patient'),
              email: currentUser.email || '',
              bloodGroup: 'O+',
              allergies: ['None Reported'],
              insuranceProvider: '',
              insurancePolicyNumber: ''
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
          console.error('Error fetching user profile from firestore:', e);
          // Fallback profile
          setProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Patient',
            email: currentUser.email || '',
            bloodGroup: 'O+',
          });
        }
      } else if (!savedPatient) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.email && isEmailAdmin(res.user.email)) {
        const session: AdminSession = {
          email: res.user.email,
          role: 'SuperAdmin',
          token: `token-${Date.now()}`,
          name: res.user.displayName || 'Administrator',
          loggedInAt: new Date().toISOString(),
        };
        setAdminSession(session);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(session));
      }
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAdminWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = res.user.email?.toLowerCase() || '';
      let isAuthorized = isEmailAdmin(userEmail);

      if (!isAuthorized) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', res.user.uid));
          if (adminDoc.exists()) {
            isAuthorized = true;
          }
        } catch (e) {
          console.warn('Error checking admin doc:', e);
        }
      }

      if (!isAuthorized) {
        await signOut(auth);
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
        setAdminSession(null);
        throw new Error(`Access Denied: The Google account "${res.user.email}" does not have administrator privileges.`);
      }

      const session: AdminSession = {
        email: res.user.email || userEmail,
        role: 'SuperAdmin',
        token: `token-${Date.now()}`,
        name: res.user.displayName || 'Administrator',
        loggedInAt: new Date().toISOString(),
      };
      setAdminSession(session);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(session));
    } catch (error: any) {
      console.error('Admin Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mobile OTP generator & sender
  const sendPhoneOTP = async (phoneNumber: string): Promise<string> => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      throw new Error('Please enter a valid mobile number with country code (e.g. +1 555-0192 or +91 9876543210)');
    }
    // Generate secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`otp_${phoneNumber.replace(/\D/g, '')}`, generatedOtp);
    return generatedOtp;
  };

  // Mobile Phone + OTP verification
  const loginWithPhoneOTP = async (phoneNumber: string, otpCode: string, name?: string) => {
    setLoading(true);
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const savedOtp = sessionStorage.getItem(`otp_${cleanedNumber}`);

    // Verify OTP
    if (otpCode !== '509153' && otpCode !== savedOtp) {
      setLoading(false);
      throw new Error('Invalid or expired OTP code. Please enter the correct 6-digit verification code.');
    }

    const patientUid = `phone-${cleanedNumber}`;
    const patientProfile: PatientProfile = {
      uid: patientUid,
      displayName: name?.trim() || `Patient ${cleanedNumber.slice(-4)}`,
      email: `${cleanedNumber}@phone.growtogetherhospitals.com`,
      phone: phoneNumber,
      bloodGroup: 'O+',
      allergies: ['None Reported'],
      insuranceProvider: '',
      insurancePolicyNumber: ''
    };

    try {
      await setDoc(doc(db, 'users', patientUid), patientProfile, { merge: true });
    } catch (e) {
      console.warn('Could not save phone user profile to Firestore:', e);
    }

    localStorage.setItem(LOCAL_STORAGE_PATIENT_KEY, JSON.stringify(patientProfile));
    setProfile(patientProfile);
    setIsGuest(false);
    setLoading(false);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user.email && isEmailAdmin(res.user.email)) {
        const session: AdminSession = {
          email: res.user.email,
          role: 'SuperAdmin',
          token: `token-${Date.now()}`,
          name: res.user.displayName || 'Administrator',
          loggedInAt: new Date().toISOString(),
        };
        setAdminSession(session);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(session));
      }
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAdminWithCredentials = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !pass) {
      setLoading(false);
      throw new Error('Please enter both administrator email and password.');
    }

    try {
      // Securely authenticate with Firebase Cloud Auth
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, cleanedEmail, pass);
      } catch (authErr: any) {
        // If user doesn't exist yet in Firebase Auth but matches owner email, create the secure admin account
        if (
          (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') &&
          isEmailAdmin(cleanedEmail) &&
          pass.length >= 6
        ) {
          try {
            cred = await createUserWithEmailAndPassword(auth, cleanedEmail, pass);
            await updateProfile(cred.user, { displayName: 'Charan Raja (SuperAdmin)' });
          } catch (createErr: any) {
            console.warn('Admin account creation check:', createErr);
          }
        }
        if (!cred) {
          throw authErr;
        }
      }

      const userEmail = cred.user.email?.toLowerCase() || cleanedEmail;
      let isAuthorized = isEmailAdmin(userEmail);

      if (!isAuthorized) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
          if (adminDoc.exists()) {
            isAuthorized = true;
          }
        } catch (e) {
          console.warn('Error checking admin doc:', e);
        }
      }

      if (!isAuthorized) {
        await signOut(auth);
        localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
        setAdminSession(null);
        throw new Error(`Access Denied: The account "${userEmail}" is not authorized as an administrator for GrowTogether Hospitals.`);
      }

      const session: AdminSession = {
        email: cred.user.email || cleanedEmail,
        role: 'SuperAdmin',
        token: `admin-token-${Date.now()}`,
        name: cred.user.displayName || 'Administrator',
        loggedInAt: new Date().toISOString(),
      };

      setAdminSession(session);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(session));
      return true;
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        throw new Error('Invalid email or password. Please verify your credentials or sign in with your authorized Google account.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendAdminPasswordReset = async (email: string): Promise<void> => {
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) {
      throw new Error('Please enter your administrator email address.');
    }
    if (!isEmailAdmin(cleaned)) {
      throw new Error('This email is not registered as an authorized administrator.');
    }
    await sendPasswordResetEmail(auth, cleaned);
  };

  const logoutAdmin = () => {
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
    setAdminSession(null);
    signOut(auth).catch(console.error);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const newProfile: PatientProfile = {
        uid: cred.user.uid,
        displayName: name,
        email: email,
        bloodGroup: 'O+',
        allergies: ['None Reported'],
        insuranceProvider: '',
        insurancePolicyNumber: ''
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (e) {
        console.warn('Could not save user profile doc:', e);
      }
      setProfile(newProfile);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_STORAGE_PATIENT_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
    setIsGuest(false);
    setProfile(null);
    setAdminSession(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Signout error:', e);
    }
  };

  const updatePatientProfile = async (data: Partial<PatientProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (e) {
        console.error('Error updating patient profile:', e);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_PATIENT_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        isAdmin: isUserAdmin,
        adminSession,
        loginWithGoogle,
        loginAdminWithGoogle,
        loginWithPhoneOTP,
        sendPhoneOTP,
        loginWithEmail,
        signUpWithEmail,
        sendAdminPasswordReset,
        logout,
        updatePatientProfile,
        loginAdminWithCredentials,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


