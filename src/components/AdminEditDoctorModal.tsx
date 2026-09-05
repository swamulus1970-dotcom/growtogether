import React, { useState, useEffect } from 'react';
import { X, Check, Stethoscope, User, DollarSign, Sparkles, Building2, Clock, Award, BookOpen, AlertCircle } from 'lucide-react';
import { Doctor } from '../types';
import { useHospitalData } from '../context/HospitalDataContext';

interface AdminEditDoctorModalProps {
  isOpen: boolean;
  doctor: Doctor | null; // null means adding a new doctor
  onClose: () => void;
  onSaved?: () => void;
}

export const AdminEditDoctorModal: React.FC<AdminEditDoctorModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onSaved,
}) => {
  const { departments, updateDoctor, addDoctor } = useHospitalData();
  const isEditing = Boolean(doctor);

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('cardiology');
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [degrees, setDegrees] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [consultationFee, setConsultationFee] = useState(120);
  const [roomNumber, setRoomNumber] = useState('101');
  const [rating, setRating] = useState(4.9);
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [availableSlotsStr, setAvailableSlotsStr] = useState('09:00 AM, 10:30 AM, 02:00 PM, 04:30 PM');
  const [telehealthAvailable, setTelehealthAvailable] = useState(true);
  const [languagesStr, setLanguagesStr] = useState('English, Spanish');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name);
      setDepartmentId(doctor.departmentId);
      setTitle(doctor.title);
      setSpecialty(doctor.specialty);
      setDegrees(doctor.degrees ? doctor.degrees.join(', ') : '');
      setExperienceYears(doctor.experienceYears || 10);
      setConsultationFee(doctor.consultationFee || 120);
      setRoomNumber(doctor.roomNumber || '101');
      setRating(doctor.rating || 4.9);
      setPhotoUrl(doctor.photoUrl || '');
      setBio(doctor.bio || '');
      setAvailableSlotsStr(doctor.availableSlots ? doctor.availableSlots.join(', ') : '09:00 AM, 11:00 AM, 03:00 PM');
      setTelehealthAvailable(doctor.telehealthAvailable ?? true);
      setLanguagesStr(doctor.languages ? doctor.languages.join(', ') : 'English');
    } else {
      // Defaults for new doctor
      setName('Dr. ');
      setDepartmentId(departments[0]?.id || 'cardiology');
      setTitle('Consultant Specialist');
      setSpecialty('General Clinical Practice');
      setDegrees('MBBS, MD');
      setExperienceYears(8);
      setConsultationFee(100);
      setRoomNumber('204');
      setRating(4.9);
      setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600');
      setBio('Dedicated physician providing high quality evidence-based clinical diagnostics and care.');
      setAvailableSlotsStr('09:00 AM, 10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM');
      setTelehealthAvailable(true);
      setLanguagesStr('English');
    }
    setErrorMsg(null);
  }, [doctor, departments, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Doctor full name is required.');
      return;
    }

    const deptObj = departments.find(d => d.id === departmentId);
    const departmentName = deptObj ? deptObj.name : 'General Medicine';

    const parsedSlots = availableSlotsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedDegrees = degrees
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedLanguages = languagesStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setSaving(true);
    setErrorMsg(null);

    try {
      if (isEditing && doctor) {
        await updateDoctor(doctor.id, {
          name: name.trim(),
          departmentId,
          departmentName,
          title: title.trim(),
          specialty: specialty.trim(),
          degrees: parsedDegrees,
          experienceYears: Number(experienceYears),
          consultationFee: Number(consultationFee),
          roomNumber: roomNumber.trim(),
          rating: Number(rating),
          photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
          bio: bio.trim(),
          availableSlots: parsedSlots.length > 0 ? parsedSlots : ['10:00 AM', '02:00 PM'],
          telehealthAvailable,
          languages: parsedLanguages,
        });
      } else {
        const newDocId = `doc-${Date.now()}`;
        const newDoc: Doctor = {
          id: newDocId,
          name: name.trim(),
          departmentId,
          departmentName,
          title: title.trim(),
          specialty: specialty.trim(),
          degrees: parsedDegrees,
          experienceYears: Number(experienceYears),
          consultationFee: Number(consultationFee),
          roomNumber: roomNumber.trim(),
          rating: Number(rating),
          reviewCount: 12,
          photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
          bio: bio.trim(),
          awards: ['Distinguished Clinical Excellence Award'],
          education: ['Fellowship in Advanced Medicine'],
          specializations: [specialty.trim()],
          availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableSlots: parsedSlots.length > 0 ? parsedSlots : ['10:00 AM', '02:00 PM'],
          telehealthAvailable,
          languages: parsedLanguages,
        };
        await addDoctor(newDoc);
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save doctor details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                Hospital Physician CMS
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {isEditing ? `Edit Physician Profile: ${doctor?.name}` : 'Add New Hospital Physician'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Preview & URL */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src={photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shrink-0 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="w-full space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Physician Photo URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <p className="text-[10px] text-slate-500">Provide an image link from Unsplash, CDN, or official hospital headshots.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doctor Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Physician Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Sharma, MD"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Clinical Department *</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Title / Designation */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Designation / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Director & Senior Interventional Cardiologist"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Clinical Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Robotic Bypass, Structural Heart, TAVR"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Degrees / Qualification */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Degrees & Qualifications (comma separated)</label>
              <input
                type="text"
                value={degrees}
                onChange={(e) => setDegrees(e.target.value)}
                placeholder="MBBS, MD (Cardiology), FACC (USA)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Experience Years */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Years of Experience</label>
              <input
                type="number"
                min="1"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Consultation Fee */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">OPD Consultation Fee ($ USD)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono font-bold text-teal-800"
              />
            </div>

            {/* Room / Chamber Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">OPD Chamber / Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="OPD-204 Wing B"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Patient Rating (1.0 to 5.0)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Languages */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Languages Spoken (comma separated)</label>
              <input
                type="text"
                value={languagesStr}
                onChange={(e) => setLanguagesStr(e.target.value)}
                placeholder="English, Spanish, Hindi"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Available Slots */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Available Consultation Slots (comma separated)</label>
            <input
              type="text"
              value={availableSlotsStr}
              onChange={(e) => setAvailableSlotsStr(e.target.value)}
              placeholder="09:00 AM, 10:30 AM, 02:00 PM, 04:00 PM"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <p className="text-[10px] text-slate-500">Patients will see these time slots when booking online with this physician.</p>
          </div>

          {/* Bio / Summary */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Physician Biography & Credentials</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional profile, clinical interests, and patient philosophy..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Telehealth Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="telehealthAvailable"
              checked={telehealthAvailable}
              onChange={(e) => setTelehealthAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="telehealthAvailable" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Enable Telehealth Video Consultations for this physician
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Physician...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Physician Changes' : 'Create Physician'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
