import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  Bed, 
  Activity, 
  Stethoscope, 
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export const AdminCMSPanel: React.FC = () => {
  const { hospitalInfo, updateHospitalInfo, resetHospitalDataToDefault } = useHospitalData();

  // Local form state initialized from context
  const [formData, setFormData] = useState({
    name: hospitalInfo.name || 'GrowTogether Hospitals',
    tagline: hospitalInfo.tagline || 'Excellence in Tertiary & Quaternary Healthcare',
    emergencyPhone: hospitalInfo.emergencyPhone || '+1 (800) 911-CARE',
    ambulancePhone: hospitalInfo.ambulancePhone || '+1 (800) 911-AMBU',
    generalInquiry: hospitalInfo.generalInquiry || '+1 (555) 019-2834',
    email: hospitalInfo.email || 'care@growtogetherhospitals.com',
    address: hospitalInfo.address || '742 Healthcare Boulevard, Medical District, NY 10021',
    erWaitTimeMinutes: hospitalInfo.erWaitTimeMinutes ?? 4,
    ambulancesAvailable: hospitalInfo.ambulancesAvailable ?? 8,
    bedCapacity: hospitalInfo.bedCapacity ?? 450,
    icuBeds: hospitalInfo.icuBeds ?? 85,
    operatingTheatres: hospitalInfo.operatingTheatres ?? 18,
    roboticSurgerySuites: hospitalInfo.roboticSurgerySuites ?? 4,
    satisfactionRate: hospitalInfo.satisfactionRate || '99.4%',
    patientsTreatedAnnual: hospitalInfo.patientsTreatedAnnual || '120,000+',
    heroHeadline: hospitalInfo.heroHeadline || 'World-Class Clinical Precision & Compassionate Healing',
    heroSubheadline: hospitalInfo.heroSubheadline || 'Advanced tertiary multi-specialty healthcare with 15+ centers of excellence, robotic surgery suites, and 24/7 dedicated emergency trauma response.',
    announcement: hospitalInfo.announcement || '🌟 24/7 Emergency & Stroke Fast-Track Unit is fully operational. Book OPD consultations with zero wait time online.',
    missionStatement: hospitalInfo.missionStatement || 'To provide exemplary medical care by combining cutting-edge medical innovations with unwavering empathy, ensuring healthier outcomes for every individual and family.',
    aboutSummary: hospitalInfo.aboutSummary || 'Founded in 1998, GrowTogether Hospitals has grown into one of the most respected quaternary care healthcare institutions in the region. Accredited by JCI and NABH, our multi-disciplinary medical teams provide comprehensive patient-centered treatments.',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await updateHospitalInfo(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all website texts, hospital contact details, and facilities metrics back to original system defaults?')) {
      try {
        await resetHospitalDataToDefault();
        window.location.reload();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to reset.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Content Management System</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Website Content & Hospital Identity Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify any hospital public text, headlines, contact numbers, and capacity stats across the entire portal in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">
              Website content updated successfully! Changes are live across all pages and persistent in Firestore.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Hospital Name & Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">1. Hospital Branding & Identification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hospital Official Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Official Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Homepage Headlines & Live Announcement */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">2. Homepage Hero Headlines & Public Announcement</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hero Section Main Headline</label>
              <input
                type="text"
                name="heroHeadline"
                value={formData.heroHeadline}
                onChange={handleChange}
                placeholder="World-Class Clinical Precision & Compassionate Healing"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hero Section Subtitle / Paragraph</label>
              <textarea
                rows={2}
                name="heroSubheadline"
                value={formData.heroSubheadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Top Notice / Alert Announcement Banner</label>
              <input
                type="text"
                name="announcement"
                value={formData.announcement}
                onChange={handleChange}
                placeholder="🌟 24/7 Emergency & Stroke Fast-Track Unit is fully operational..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-teal-900 font-medium bg-teal-50/50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact & Emergency Helplines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">3. Emergency Hotlines & Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Emergency 24/7 Trauma Phone</label>
              <input
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono font-bold text-rose-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Ambulance Dispatch Helpline</label>
              <input
                type="text"
                name="ambulancePhone"
                value={formData.ambulancePhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono font-bold text-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">General OPD Inquiries Phone</label>
              <input
                type="text"
                name="generalInquiry"
                value={formData.generalInquiry}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono font-bold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Official Hospital Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Hospital Campus Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Facilities, Beds & Infrastructure Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bed className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">4. Hospital Clinical Capacity & Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">In-Patient Bed Capacity</label>
              <input
                type="number"
                name="bedCapacity"
                value={formData.bedCapacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">ICU & CCU Critical Beds</label>
              <input
                type="number"
                name="icuBeds"
                value={formData.icuBeds}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Modular Operating Theatres</label>
              <input
                type="number"
                name="operatingTheatres"
                value={formData.operatingTheatres}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Robotic Surgery Suites</label>
              <input
                type="number"
                name="roboticSurgerySuites"
                value={formData.roboticSurgerySuites}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Avg ER Wait Time (Mins)</label>
              <input
                type="number"
                name="erWaitTimeMinutes"
                value={formData.erWaitTimeMinutes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Active Mobile Ambulances</label>
              <input
                type="number"
                name="ambulancesAvailable"
                value={formData.ambulancesAvailable}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Annual Patients Treated</label>
              <input
                type="text"
                name="patientsTreatedAnnual"
                value={formData.patientsTreatedAnnual}
                onChange={handleChange}
                placeholder="120,000+"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Patient Satisfaction %</label>
              <input
                type="text"
                name="satisfactionRate"
                value={formData.satisfactionRate}
                onChange={handleChange}
                placeholder="99.4%"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Mission Statement & About Text */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">5. About Us & Mission Statement</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hospital Mission Statement</label>
              <textarea
                rows={2}
                name="missionStatement"
                value={formData.missionStatement}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">About Us Overview Summary</label>
              <textarea
                rows={3}
                name="aboutSummary"
                value={formData.aboutSummary}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving All Website Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Publish All Website & Content Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
