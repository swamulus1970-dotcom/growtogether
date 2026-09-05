export type PageView = 'home' | 'about' | 'departments' | 'doctors' | 'booking' | 'portal' | 'admin';

export interface AdminSession {
  email: string;
  role: 'SuperAdmin' | 'HospitalAdmin' | 'ChiefMedicalOfficer';
  token: string;
  name: string;
  loggedInAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  specialty: string;
  title: string; // e.g. "Senior Consultant & Head of Cardiology"
  degrees: string[]; // e.g. ["MBBS", "MD (Cardiology)", "FACC (USA)"]
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  photoUrl: string;
  bio: string;
  languages: string[];
  awards: string[];
  education: string[];
  specializations: string[];
  availabilityDays: string[];
  availableSlots: string[];
  telehealthAvailable: boolean;
  roomNumber: string;
}

export interface Department {
  id: string;
  name: string;
  category: 'Critical & Surgical' | 'Medical Specialties' | 'Women & Child' | 'Diagnostics & Wellness';
  tagline: string;
  description: string;
  iconName: string; // Lucide icon key
  imageUrl: string;
  headOfDepartment: string;
  headDoctorId: string;
  doctorCount: number;
  procedures: string[];
  technologies: string[];
  facilities: string[];
  emergencySupport: boolean;
}

export type ConsultationType = 'in_person' | 'video_call' | 'home_visit';

export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  appointmentCode: string; // e.g. "GTH-2026-8942"
  userId?: string;
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
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  consultationType: ConsultationType;
  consultationFee: number;
  reasonForVisit: string;
  pastMedicalHistory?: string;
  status: AppointmentStatus;
  createdAt: string;
  notesFromDoctor?: string;
  prescriptionIssued?: boolean;
  paymentStatus?: 'paid' | 'pending' | 'insurance_claim';
  paymentMethod?: 'card' | 'upi' | 'insurance' | 'pay_at_hospital';
  paymentTransactionId?: string;
}

export interface VitalSign {
  id: string;
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  bloodSugar: number; // mg/dL
  weightKg: number;
  temperatureF: number;
  oxygenSaturation: number; // SpO2 %
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  recordType: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Radiology / Scan' | 'Vaccination';
  doctorName: string;
  department: string;
  date: string;
  summary: string;
  fileSize: string;
  status: 'Normal' | 'Needs Review' | 'Critical';
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
}

export interface PatientProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string[];
}

export interface Testimonial {
  id: string;
  patientName: string;
  age: number;
  treatment: string;
  department: string;
  doctorName: string;
  comment: string;
  rating: number;
  avatarUrl: string;
  location: string;
  date: string;
}

export interface HealthCheckPackage {
  id: string;
  title: string;
  tagline: string;
  targetAudience: string;
  originalPrice: number;
  discountedPrice: number;
  testsCount: number;
  popular?: boolean;
  badge?: string;
  includedTests: string[];
}

export interface HospitalInfo {
  name: string;
  tagline: string;
  emergencyPhone: string;
  ambulancePhone: string;
  generalInquiry: string;
  email: string;
  address: string;
  erWaitTimeMinutes: number;
  ambulancesAvailable: number;
  bedCapacity: number;
  icuBeds: number;
  operatingTheatres: number;
  roboticSurgerySuites: number;
  satisfactionRate: string;
  patientsTreatedAnnual: string;
  establishedYear: number;
  accreditations: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  announcement?: string;
  missionStatement?: string;
  aboutSummary?: string;
}
