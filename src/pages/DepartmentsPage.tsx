import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Stethoscope, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Department, Doctor } from '../types';
import { useAppointments } from '../context/AppointmentContext';
import { useHospitalData } from '../context/HospitalDataContext';

interface DepartmentsPageProps {
  onSelectDepartment: (dept: Department) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  onSelectDepartment,
  onSelectDoctor,
  onBookWithDoctor,
}) => {
  const { setIsBookingModalOpen, setSelectedDepartmentForBooking } = useAppointments();
  const { departments, doctors } = useHospitalData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Critical & Surgical',
    'Medical Specialties',
    'Women & Child',
  ];

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.procedures.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      dept.technologies.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || dept.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleBookInDept = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDepartmentForBooking(dept.id);
    setIsBookingModalOpen(true);
  };


  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-50/70 to-slate-50 py-12 sm:py-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            GrowTogether Centers of Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Clinical Departments & Specialties
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Explore our multidisciplinary departments offering sub-specialized clinical expertise, advanced surgical suites, and dedicated intensive care units.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="pt-4 max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search departments, procedures (e.g. TAVR, Robotic knee, Stroke, MRI)..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 shadow-xs"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No departments match your search</h3>
            <p className="text-xs text-slate-500">Try clearing filters or searching for terms like "Heart", "Joint", or "Pediatrics".</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDepartments.map((dept) => {
              const deptDoctors = doctors.filter((d) => d.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  onClick={() => onSelectDepartment(dept)}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-teal-300 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                    <img 
                      src={dept.imageUrl} 
                      alt={dept.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs">
                          {dept.category}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1.5">
                          {dept.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {dept.tagline}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold bg-teal-50/70 px-3 py-1.5 rounded-lg border border-teal-100">
                        <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Head: {dept.headOfDepartment}</span>
                      </div>

                      {/* Top Procedures Chips */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                          Key Clinical Procedures:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {dept.procedures.slice(0, 3).map((proc, i) => (
                            <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                              {proc}
                            </span>
                          ))}
                          {dept.procedures.length > 3 && (
                            <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-50 text-slate-500">
                              +{dept.procedures.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Doctors Preview */}
                      <div className="pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                          Available Specialists ({deptDoctors.length}):
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {deptDoctors.map((doc) => (
                              <img
                                key={doc.id}
                                src={doc.photoUrl}
                                alt={doc.name}
                                title={doc.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {deptDoctors.map((d) => d.name.split(' ')[1]).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDepartment(dept);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors flex items-center gap-1"
                      >
                        <span>Full Department Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleBookInDept(dept, e)}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book in Dept</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
