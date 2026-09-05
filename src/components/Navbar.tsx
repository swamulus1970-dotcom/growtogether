import React, { useState } from 'react';
import { 
  Building2, 
  PhoneCall, 
  Calendar, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldAlert, 
  Clock, 
  ChevronRight,
  HeartPulse,
  LogOut,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';
import { useAppointments } from '../context/AppointmentContext';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
  const { user, profile, isGuest, isAdmin, adminSession, logout, logoutAdmin } = useAuth();
  const { hospitalInfo } = useHospitalData();
  const { setIsBookingModalOpen } = useAppointments();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageView; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Emergency & Info Ticker Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>24/7 Emergency & Trauma: <a href={`tel:${hospitalInfo.emergencyPhone}`} className="text-white hover:underline ml-1 font-bold">{hospitalInfo.emergencyPhone}</a></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>Current ER Wait Time: <strong className="text-teal-300">{hospitalInfo.erWaitTimeMinutes} mins</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            {/* Admin Portal Quick Access Pill in Ticker */}
            <button
              onClick={() => onNavigate('admin')}
              id="ticker-admin-portal-btn"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{isAdmin ? 'Admin Dashboard (Active)' : 'Admin Portal'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>Ambulance:</span>
              <a href={`tel:${hospitalInfo.ambulancePhone}`} className="text-white font-medium hover:text-teal-300 transition-colors">
                {hospitalInfo.ambulancePhone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Hospital Brand & Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="brand-logo-btn"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">{hospitalInfo.name}</span>
              </div>
              <p className="text-[11px] text-slate-700 hidden sm:block font-medium">{hospitalInfo.tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => onNavigate(link.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-teal-700 bg-teal-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Admin Link in Desktop Nav */}
            <button
              id="nav-link-admin"
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'admin'
                  ? 'text-teal-800 bg-teal-100/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Admin Desk</span>
            </button>
          </nav>

          {/* Action Buttons & Patient Portal */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Book Button */}
            <button
              id="nav-quick-book-btn"
              onClick={() => setIsBookingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 active:scale-98 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Patient Portal Trigger */}
            {user || isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-patient-portal-btn"
                  onClick={() => onNavigate('portal')}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    currentPage === 'portal'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                    {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="max-w-[110px] truncate">{profile?.displayName || 'My Portal'}</span>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-portal-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-teal-600" />
                <span>Patient Portal</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            })}

            {/* Mobile Admin Link */}
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-teal-100/70 text-teal-900 font-bold'
                  : 'text-teal-700 bg-teal-50/50 hover:bg-teal-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Admin Portal & Desk</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                Admin
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => {
                setIsBookingModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-semibold shadow-sm cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              <span>Book an Appointment</span>
            </button>

            {user || isGuest ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate('portal');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  <UserIcon className="w-5 h-5 text-teal-400" />
                  <span>Go to Patient Portal ({profile?.displayName || 'Active Session'})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-rose-600 text-sm font-medium hover:underline text-center cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold cursor-pointer"
              >
                <UserIcon className="w-5 h-5 text-teal-600" />
                <span>Patient Portal Login / Sign-In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

