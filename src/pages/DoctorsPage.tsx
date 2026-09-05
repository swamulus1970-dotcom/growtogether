import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Video, 
  Award, 
  Star, 
  Calendar, 
  Stethoscope, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { Doctor, PageView } from '../types';
import { DoctorCard } from '../components/DoctorCard';
import { useAppointments } from '../context/AppointmentContext';
import { useHospitalData } from '../context/HospitalDataContext';

interface DoctorsPageProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  onSelectDoctor,
  onBookDoctor,
}) => {
  const { doctors, departments } = useHospitalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.degrees.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.specializations.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDeptId === 'all' || doc.departmentId === selectedDeptId;
    const matchesTelehealth = !telehealthOnly || doc.telehealthAvailable;
    const matchesExp = doc.experienceYears >= minExperience;

    return matchesSearch && matchesDept && matchesTelehealth && matchesExp;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
    return 0;
  });


  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDeptId('all');
    setTelehealthOnly(false);
    setMinExperience(0);
    setSortBy('rating');
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-50/70 to-slate-50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Medical Staff & Faculty Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Find Your Specialist Doctor
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with board-certified physicians, senior consultants, and robotic surgeons across all 8 clinical departments.
          </p>

          {/* Search Input */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor name, medical condition, or specialty..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Sort Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
          {/* Department Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Filter by Department:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedDeptId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDeptId === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Departments ({doctors.length})
              </button>
              {departments.map((dept) => {
                const count = doctors.filter((d) => d.departmentId === dept.id).length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedDeptId === dept.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {dept.name.split('&')[0].trim()} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Filters: Telehealth, Experience, Sort */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Telehealth Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={telehealthOnly}
                  onChange={(e) => setTelehealthOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 rounded-sm"
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tele-Health Video Available</span>
                </span>
              </label>

              {/* Min Experience */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Experience:</span>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                >
                  <option value={0}>Any Experience</option>
                  <option value={10}>10+ Years</option>
                  <option value={15}>15+ Years</option>
                  <option value={20}>20+ Years</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee">Consultation Fee (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header Count */}
        <div className="flex items-center justify-between text-xs text-slate-700 px-1">
          <span>Showing <strong className="text-slate-900 font-bold">{filteredDoctors.length}</strong> verified doctors</span>
          {(searchTerm || selectedDeptId !== 'all' || telehealthOnly || minExperience > 0) && (
            <button
              onClick={clearFilters}
              className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No doctors match your active filters</h3>
            <p className="text-xs text-slate-700">Try broadening your search term or selecting another department.</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onViewDetails={onSelectDoctor}
                onBookNow={onBookDoctor}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
