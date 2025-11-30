import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LeakReport } from './types';
import { LeakForm } from './components/LeakForm';
import { LeakList } from './components/LeakList';
import { Droplets, Plus, List, Map as MapIcon } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'geo_fuite_data';

const App: React.FC = () => {
  const [reports, setReports] = useState<LeakReport[]>([]);
  const [view, setView] = useState<'map' | 'list' | 'form'>('map');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local data", e);
      }
    }

    // Get current location for map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}),
        () => console.log("Loc unavailable")
      );
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const handleCreateReport = (data: Omit<LeakReport, 'id'>) => {
    const newReport: LeakReport = {
      ...data,
      id: uuidv4(),
    };
    setReports(prev => [newReport, ...prev]);
    setView('list');
  };

  const handleSelectReport = (report: LeakReport) => {
    const desc = `Détails:\n${report.address}\n\nStatut: ${report.status}\nNom: ${report.claimantName}\nTel: ${report.claimantPhone}\nCommentaire: ${report.comments}`;
    if (report.coordinates) {
        if(confirm(`${desc}\n\nVoir sur Google Maps ?`)) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${report.coordinates.latitude},${report.coordinates.longitude}`, '_blank');
        }
    } else {
        alert(desc);
    }
  };

  // Simple Embed Map View
  const MapView = () => {
    const lat = currentLocation?.lat || 48.8566;
    const lng = currentLocation?.lng || 2.3522;
    // Note: In a real production app, you need a Google Maps API Key for the embed to work reliably without watermarks/errors.
    // This is a standard embed URL structure.
    const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;

    return (
      <div className="h-full flex flex-col bg-slate-50 relative pb-20">
        <div className="flex-1 w-full bg-slate-200 relative overflow-hidden rounded-xl shadow-inner border border-slate-300">
           {/* Fallback/Embed Map */}
           <iframe 
             title="Google Map"
             width="100%" 
             height="100%" 
             frameBorder="0" 
             scrolling="no" 
             marginHeight={0} 
             marginWidth={0} 
             src={mapUrl}
             className="w-full h-full opacity-90"
           ></iframe>
           
           <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-blue-600" />
                Carte des incidents
             </h3>
             <p className="text-sm text-slate-600 mt-1">
               {reports.length} fuites signalées dans la base de données.
             </p>
             <p className="text-xs text-slate-400 mt-2">
               Centré sur votre position actuelle.
             </p>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
               <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GeoFuite</h1>
              <p className="text-xs text-blue-100 opacity-90">Tracker d'Interventions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 relative overflow-hidden flex flex-col">
        {view === 'map' && <MapView />}
        
        {view === 'list' && (
          <div className="animate-fade-in flex-1">
             <LeakList reports={reports} onSelectReport={handleSelectReport} />
          </div>
        )}

        {view === 'form' && (
          <div className="animate-slide-up flex-1">
            <LeakForm 
              onSubmit={handleCreateReport} 
              onCancel={() => setView('list')} 
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        <div className="max-w-lg mx-auto flex justify-between items-center h-16">
          
          <button 
            onClick={() => setView('map')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${view === 'map' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MapIcon className={`w-6 h-6 ${view === 'map' ? 'fill-blue-100' : ''}`} />
            <span className="text-[10px] font-medium">Carte</span>
          </button>

          {/* Center FAB for Add */}
          <div className="relative -top-6">
            <button
              onClick={() => setView('form')}
              className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all border-4 border-slate-50"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <button 
            onClick={() => setView('list')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${view === 'list' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className={`w-6 h-6 ${view === 'list' ? 'fill-blue-100' : ''}`} />
            <span className="text-[10px] font-medium">Liste</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;