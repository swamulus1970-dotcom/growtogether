import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HospitalDataProvider } from './context/HospitalDataContext';
import { AppointmentProvider, useAppointments } from './context/AppointmentContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { BookingModal } from './components/BookingModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { AppointmentSuccessModal } from './components/AppointmentSuccessModal';
import { AuthModal } from './components/AuthModal';
import { Department, Doctor, PageView, Appointment } from './types';

const MainAppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null);
  const [selectedDepartmentForModal, setSelectedDepartmentForModal] = useState<Department | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingPassAppointment, setViewingPassAppointment] = useState<Appointment | null>(null);

  const { 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    setSelectedDoctorForBooking, 
    setSelectedDepartmentForBooking,
    latestBookedAppointment,
    setLatestBookedAppointment
  } = useAppointments();

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctorForModal(doctor);
  };

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartmentForModal(department);
  };

  const handleBookWithDoctor = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setSelectedDepartmentForBooking(doctor.departmentId);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate}
            onSelectDoctor={handleSelectDoctor}
            onSelectDepartment={handleSelectDepartment}
            onBookDoctor={handleBookWithDoctor}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'departments' && (
          <DepartmentsPage 
            onSelectDepartment={handleSelectDepartment}
            onSelectDoctor={handleSelectDoctor}
            onBookWithDoctor={handleBookWithDoctor}
          />
        )}

        {currentPage === 'doctors' && (
          <DoctorsPage 
            onSelectDoctor={handleSelectDoctor}
            onBookDoctor={handleBookWithDoctor}
          />
        )}

        {currentPage === 'portal' && (
          <PatientPortalPage 
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPassModal={(appt) => setViewingPassAppointment(appt)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPortalPage 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctorForBooking(null);
        }}
        onSuccess={(bookedAppt) => {
          // Success modal automatically opens through context / state
        }}
      />

      <DoctorDetailModal 
        doctor={selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onBookDoctor={handleBookWithDoctor}
      />

      <DepartmentDetailModal 
        department={selectedDepartmentForModal}
        onClose={() => setSelectedDepartmentForModal(null)}
        onSelectDoctor={handleSelectDoctor}
        onBookWithDoctor={handleBookWithDoctor}
      />

      {/* Appointment Confirmed / Digital Pass Modal */}
      {(latestBookedAppointment || viewingPassAppointment) && (
        <AppointmentSuccessModal 
          appointment={viewingPassAppointment || latestBookedAppointment}
          onClose={() => {
            setViewingPassAppointment(null);
            setLatestBookedAppointment(null);
          }}
          onGoToPortal={() => {
            setViewingPassAppointment(null);
            setLatestBookedAppointment(null);
            handleNavigate('portal');
          }}
        />
      )}

      {/* Firebase / Demo Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          // Toast or navigate if needed
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HospitalDataProvider>
        <AppointmentProvider>
          <MainAppContent />
        </AppointmentProvider>
      </HospitalDataProvider>
    </AuthProvider>
  );
}

export default App;
