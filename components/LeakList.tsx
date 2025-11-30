import React from 'react';
import { LeakReport, LeakStatus } from '../types';
import { MapPin, Calendar, CheckCircle2, AlertCircle, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface LeakListProps {
  reports: LeakReport[];
  onSelectReport: (report: LeakReport) => void;
}

const StatusIcon = ({ status }: { status: LeakStatus }) => {
  switch (status) {
    case LeakStatus.NOUVEAU: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case LeakStatus.EN_COURS: return <Clock className="w-4 h-4 text-orange-500" />;
    case LeakStatus.RESOLU: return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case LeakStatus.URGENT: return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const StatusBadge = ({ status }: { status: LeakStatus }) => {
  const colors = {
    [LeakStatus.NOUVEAU]: 'bg-blue-100 text-blue-700 border-blue-200',
    [LeakStatus.EN_COURS]: 'bg-orange-100 text-orange-700 border-orange-200',
    [LeakStatus.RESOLU]: 'bg-green-100 text-green-700 border-green-200',
    [LeakStatus.URGENT]: 'bg-red-100 text-red-700 border-red-200',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 border ${colors[status]}`}>
      <StatusIcon status={status} />
      {status}
    </span>
  );
};

export const LeakList: React.FC<LeakListProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200 mt-4 mx-4">
        <MapPin className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-lg font-medium text-slate-600">Aucun signalement</p>
        <p className="text-sm">Utilisez le bouton "+" pour signaler une fuite.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24 p-2">
      {reports.map((report) => (
        <div 
          key={report.id} 
          onClick={() => onSelectReport(report)}
          className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md flex gap-3"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0">
             {report.photo ? (
               <img src={report.photo} alt="Fuite" className="w-20 h-20 object-cover rounded-lg bg-slate-100 border border-slate-100" />
             ) : (
               <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-slate-100">
                 <ImageIcon className="w-8 h-8" />
               </div>
             )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="font-bold text-slate-800 line-clamp-1 text-sm leading-tight">{report.address}</h3>
                <StatusBadge status={report.status} />
              </div>
              
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                {report.identificationDate}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {report.comments || "Aucun commentaire."}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-1.5 mt-1">
               <span className="font-medium text-slate-500 truncate max-w-[100px]">{report.claimantName}</span>
               {report.coordinates && (
                 <span className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                   <MapPin className="w-3 h-3" />
                   GPS OK
                 </span>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};