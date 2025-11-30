import React, { useState, useRef } from 'react';
import { LeakReport, LeakStatus, Coordinates } from '../types';
import { MapPin, Loader2, Wand2, Save, Camera, X } from 'lucide-react';
import { analyzeLeakDescription } from '../services/geminiService';

interface LeakFormProps {
  onSubmit: (report: Omit<LeakReport, 'id'>) => void;
  onCancel: () => void;
}

export const LeakForm: React.FC<LeakFormProps> = ({ onSubmit, onCancel }) => {
  const [address, setAddress] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<LeakStatus>(LeakStatus.NOUVEAU);
  const [comments, setComments] = useState('');
  const [photo, setPhoto] = useState<string>('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Impossible de récupérer la position. Vérifiez vos permissions GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAIAnalysis = async () => {
    if (!comments || comments.length < 5) {
      alert("Veuillez entrer un commentaire détaillé avant l'analyse.");
      return;
    }
    setIsAnalyzing(true);
    const result = await analyzeLeakDescription(comments, address);
    setIsAnalyzing(false);

    if (result) {
      if (confirm(`Analyse IA :\nSévérité : ${result.severity}\nSuggestion : ${result.recommendedStatus}\n\nAppliquer ces changements ?`)) {
        setStatus(result.recommendedStatus);
        setComments(prev => `${prev}\n\n[IA Résumé]: ${result.summary}`);
      }
    } else {
      alert("L'analyse IA a échoué. Vérifiez votre connexion.");
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compression de l'image pour éviter de saturer le stockage local
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Conversion en JPEG qualité 70%
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !claimantName || !claimantPhone) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }
    
    onSubmit({
      address,
      claimantName,
      claimantPhone,
      coordinates,
      identificationDate: date,
      status,
      comments,
      photo
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 pb-24">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Nouveau Signalement</h2>

        {/* Section Photo */}
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 transition-colors hover:bg-slate-100">
          {photo ? (
            <div className="relative w-full">
              <img src={photo} alt="Aperçu" className="w-full h-48 object-cover rounded-lg shadow-sm" />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center w-full cursor-pointer py-4" onClick={() => fileInputRef.current?.click()}>
              <div className="mx-auto w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium text-slate-700">Prendre une photo</p>
              <p className="text-xs text-slate-400 mt-1">ou choisir depuis la galerie</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </div>
          )}
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse de localisation *</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="ex: 12 Rue de la République"
          />
        </div>

        {/* Coordonnées XY */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coordonnées GPS (XY)</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={coordinates ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}` : ''}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500"
              placeholder="En attente de localisation..."
            />
            <button
              type="button"
              onClick={handleGeolocation}
              disabled={isLocating}
              className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
            </button>
          </div>
          {coordinates && <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Localisation précise acquise</p>}
        </div>

        {/* Info Réclamant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du réclamant *</label>
            <input
              type="text"
              required
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={claimantPhone}
              onChange={(e) => setClaimantPhone(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        {/* Date & Etat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d'identification</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">État de l'intervention</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeakStatus)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.values(LeakStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Commentaires & AI */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">Commentaires</label>
            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !comments}
              className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 font-medium px-2 py-1 bg-purple-50 rounded-full"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Analyser avec IA
            </button>
          </div>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Décrivez la nature de la fuite, l'importance, l'environnement..."
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};