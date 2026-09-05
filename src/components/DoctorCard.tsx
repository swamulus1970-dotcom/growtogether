import React from 'react';
import { Doctor } from '../types';
import { Star, Award, Calendar, Video, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';

interface DoctorCardProps {
  doctor: Doctor;
  onViewDetails: (doctor: Doctor) => void;
  onBookNow: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onViewDetails, onBookNow }) => {
  return (
    <div 
      id={`doctor-card-${doctor.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
    >
      {/* Top Header Card Info */}
      <div className="p-5 flex gap-4">
        {/* Doctor Photo */}
        <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
          <img 
            src={doctor.photoUrl} 
            alt={doctor.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {doctor.telehealthAvailable && (
            <div 
              title="Available for Telehealth Video Consultations"
              className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-teal-600 text-white shadow-xs"
            >
              <Video className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Doctor Main Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                {doctor.departmentName.split('&')[0].trim()}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold ml-auto">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{doctor.rating.toFixed(2)}</span>
                <span className="text-slate-600 font-normal text-[11px]">({doctor.reviewCount})</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-teal-700 transition-colors truncate">
              {doctor.name}
            </h3>

            <p className="text-xs text-teal-800 font-medium line-clamp-1 mt-0.5">
              {doctor.specialty}
            </p>

            <p className="text-[11px] text-slate-700 mt-1 truncate">
              {doctor.degrees.join(' • ')}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>{doctor.experienceYears}+ yrs exp</span>
            </div>
            <span>•</span>
            <div className="text-xs font-semibold text-slate-900">
              ${doctor.consultationFee} <span className="font-normal text-slate-600 text-[11px]">fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Slots Preview */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-b border-slate-100 text-xs flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-1.5 text-slate-600 truncate">
          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Next slot: <strong className="text-slate-800 font-medium">{doctor.availableSlots[0]} Today</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-600 shrink-0">
          <MapPin className="w-3 h-3" />
          <span>{doctor.roomNumber.split(',')[0]}</span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 mt-auto flex items-center gap-2">
        <button
          onClick={() => onViewDetails(doctor)}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center"
        >
          View Profile
        </button>
        <button
          onClick={() => onBookNow(doctor)}
          className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Now</span>
        </button>
      </div>
    </div>
  );
};
