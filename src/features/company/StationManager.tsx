
import React, { useState, useEffect } from 'react';
import { Station, MOCK_DAYS } from '../../shared/types';
import { saveStation, getStations } from '../../shared/services/storage';
import { generateLocalDescription } from '../../shared/services/description';
import { Save, ImageIcon, Camera, Sparkles, MapPin, Clock, Link as LinkIcon, X } from 'lucide-react';

interface Props {
    user: any;
    notify: (msg: string, type: 'success' | 'error' | 'info') => void;
    onClose: () => void;
    editId?: string | null;
    initialType?: 'STATION' | 'ROUTE';
    parentId?: string;
}

export const StationManager: React.FC<Props> = ({ user, notify, onClose, editId, initialType = 'STATION', parentId }) => {
    const [station, setStation] = useState<Partial<Station>>({ type: initialType, parentId: parentId });
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editId) {
            const all = getStations();
            const found = all.find(s => s.id === editId);
            if (found) setStation(found);
        } else {
            if (parentId && initialType === 'ROUTE') {
                const all = getStations();
                const parent = all.find(s => s.id === parentId);
                if (parent) {
                    setStation(prev => ({
                        ...prev,
                        parentId: parent.id,
                        location: parent.location,
                        pointA: parent.location
                        // Routes should have their own photos
                    }));
                }
            }
        }
    }, [editId, parentId, initialType]);

    const handleSaveStation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (station.type === 'STATION') {
            if (!station.name || !station.location) {
                notify("Nom et Localisation obligatoires", "error");
                return;
            }
        } else {
            if (!station.pointA || !station.pointB || !station.price) {
                notify("Points de départ/arrivée et Prix obligatoires", "error");
                return;
            }
        }

        setIsSubmitting(true);

        const newStation: Station = {
            id: station.id || crypto.randomUUID(),
            parentId: station.parentId,
            companyId: user.id,
            companyName: user.companyName || 'Agence',
            type: station.type || 'STATION',
            name: station.name || (station.type === 'ROUTE' ? `${station.pointA} - ${station.pointB}` : 'Nouvelle Station'),
            photoUrl: station.photoUrl || `https://picsum.photos/seed/${Math.random()}/400/300`,
            location: station.location || '',
            mapLink: station.mapLink,
            description: station.description || '',
            openingTime: station.openingTime,
            closingTime: station.closingTime,
            pointA: station.pointA,
            pointB: station.pointB,
            departurePoint: station.departurePoint || '',
            workDays: station.workDays || [],
            departureHours: station.departureHours || [],
            arrivalHours: station.arrivalHours || [],
            price: Number(station.price) || 0,
            pricePremium: Number(station.pricePremium) || 0
        };

        try {
            saveStation(newStation);
            notify(station.id ? "Modification enregistrée" : (station.type === 'STATION' ? "Sous-station créée" : "Parcours créé"), "success");
            onClose();
        } catch (err: any) {
            notify("Erreur sauvegarde: " + err.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateDescription = () => {
        setIsGeneratingDesc(true);
        setTimeout(() => {
            const desc = generateLocalDescription({ ...station, companyName: user.companyName });
            setStation(prev => ({ ...prev, description: desc }));
            setIsGeneratingDesc(false);
            notify("Description générée avec succès !", "success");
        }, 600);
    };

    const handleStationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 700) {
                notify("Fichier trop volumineux (Max 700Ko).", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setStation(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const inputClass = "w-full rounded-lg border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-shadow shadow-sm text-gray-800 placeholder-gray-400 text-sm";
    const labelClass = "block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide";

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-auto animate-fade-in overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {station.type === 'STATION' ? <MapPin className="text-[#008751]" size={20} /> : <MapPin className="text-[#e9b400]" size={20} />}
                        {station.id ? 'Modifier ' : 'Créer '} 
                        {station.type === 'STATION' ? 'Sous-Station' : 'Parcours'}
                    </h2>
                    <p className="text-gray-500 text-xs">
                        {station.type === 'STATION' 
                            ? 'Configurez le profil de votre point de présence.' 
                            : 'Définissez les détails du voyage (prix, horaires).'}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
                <form onSubmit={handleSaveStation} className="space-y-6">
                    
                    {/* --- STATION MODE LAYOUT --- */}
                    {station.type === 'STATION' && (
                        <div className="grid grid-cols-12 gap-4">
                            {/* Row 1: Photo + Basic Info */}
                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Photo de la Station</label>
                                <div className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-[#008751] transition-colors bg-white h-32 flex items-center justify-center">
                                    {station.photoUrl ? (
                                        <img src={station.photoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                                            <span className="text-xs">Ajouter</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleStationImageUpload} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                                        <Camera size={16} className="mr-1" /> Photo
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-5">
                                <label className={labelClass}>Nom de la Sous-Station</label>
                                <input type="text" required className={inputClass} value={station.name || ''} onChange={e => setStation({ ...station, name: e.target.value })} placeholder="Ex: Gare Centrale Cotonou" />
                            </div>

                            <div className="col-span-12 md:col-span-4">
                                <label className={labelClass}>Ville / Localisation</label>
                                <div className="relative">
                                    <MapPin className="absolute left-2 top-2.5 text-gray-400" size={14} />
                                    <input type="text" required className={`${inputClass} pl-8`} value={station.location || ''} onChange={e => setStation({ ...station, location: e.target.value })} placeholder="Ex: Cotonou" />
                                </div>
                            </div>

                            {/* Row 2: Hours + Days */}
                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Heure d'Ouverture</label>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-2.5 text-gray-400" size={14} />
                                    <input type="time" className={`${inputClass} pl-8`} value={station.openingTime || ''} onChange={e => setStation({ ...station, openingTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Heure de Fermeture</label>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-2.5 text-gray-400" size={14} />
                                    <input type="time" className={`${inputClass} pl-8`} value={station.closingTime || ''} onChange={e => setStation({ ...station, closingTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className={labelClass}>Lien Google Maps (Optionnel)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-2 top-2.5 text-gray-400" size={14} />
                                    <input type="url" className={`${inputClass} pl-8`} value={station.mapLink || ''} onChange={e => setStation({ ...station, mapLink: e.target.value })} placeholder="https://maps.google.com/..." />
                                </div>
                            </div>

                            {/* Row 3: Work Days */}
                            <div className="col-span-12">
                                <label className={labelClass}>Jours d'Ouverture</label>
                                <div className="flex flex-wrap gap-2">
                                    {MOCK_DAYS.map(day => (
                                        <button key={day} type="button" onClick={() => { const days = station.workDays || []; const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day]; setStation({ ...station, workDays: newDays }); }} 
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${station.workDays?.includes(day) ? 'bg-[#008751] text-white border-[#008751] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 4: Description */}
                            <div className="col-span-12">
                                <div className="flex justify-between items-end mb-1">
                                    <label className={labelClass}>Description</label>
                                    <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1 font-bold transition-colors border border-purple-100">
                                        <Sparkles size={10} /> {isGeneratingDesc ? '...' : 'IA'}
                                    </button>
                                </div>
                                <textarea className="w-full rounded-lg border border-gray-300 bg-white p-2 outline-none h-20 resize-none focus:ring-2 focus:ring-[#008751] focus:border-transparent text-gray-800 text-sm" value={station.description || ''} onChange={e => setStation({ ...station, description: e.target.value })} placeholder="Description de la station..." />
                            </div>
                        </div>
                    )}

                    {/* --- ROUTE MODE LAYOUT --- */}
                    {station.type === 'ROUTE' && (
                        <div className="grid grid-cols-12 gap-4">
                            {/* Row 1: Photo + Route Points */}
                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Photo du Bus</label>
                                <div className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-[#e9b400] transition-colors bg-white h-32 flex items-center justify-center">
                                    {station.photoUrl ? (
                                        <img src={station.photoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                                            <span className="text-xs">Ajouter</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleStationImageUpload} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                                        <Camera size={16} className="mr-1" /> Photo
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Point de Départ (A)</label>
                                <input type="text" required className={inputClass} value={station.pointA || ''} onChange={e => setStation({ ...station, pointA: e.target.value })} list="cities_list" placeholder="Ex: Cotonou" />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Point d'Arrivée (B)</label>
                                <input type="text" required className={inputClass} value={station.pointB || ''} onChange={e => setStation({ ...station, pointB: e.target.value })} list="cities_list" placeholder="Ex: Parakou" />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Prix Standard (FCFA)</label>
                                <input type="number" required className={`${inputClass} font-bold text-[#008751]`} value={station.price || ''} onChange={e => setStation({ ...station, price: Number(e.target.value) })} />
                            </div>

                            <datalist id="cities_list">
                                <option value="Cotonou" /><option value="Porto-Novo" /><option value="Parakou" /><option value="Abomey-Calavi" /><option value="Bohicon" /><option value="Natitingou" /><option value="Djougou" /><option value="Kandi" /><option value="Malanville" /><option value="Ouidah" /><option value="Abomey" /><option value="Lokossa" /><option value="Dassa-Zoumè" /><option value="Savalou" />
                            </datalist>

                            {/* Row 2: Pricing + Days */}
                            <div className="col-span-12 md:col-span-3">
                                <label className={labelClass}>Prix Premium (FCFA)</label>
                                <input type="number" className={`${inputClass} font-bold text-yellow-600`} value={station.pricePremium || ''} onChange={e => setStation({ ...station, pricePremium: Number(e.target.value) })} placeholder="Optionnel" />
                            </div>

                            <div className="col-span-12 md:col-span-9">
                                <label className={labelClass}>Jours de Départ</label>
                                <div className="flex flex-wrap gap-2">
                                    {MOCK_DAYS.map(day => (
                                        <button key={day} type="button" onClick={() => { const days = station.workDays || []; const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day]; setStation({ ...station, workDays: newDays }); }} 
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${station.workDays?.includes(day) ? 'bg-[#e9b400] text-white border-[#e9b400] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 3: Hours */}
                            <div className="col-span-12 md:col-span-6">
                                <label className={labelClass}>Heures de Départ</label>
                                <input type="text" placeholder="Ex: 07:00, 14:00" className={inputClass} value={station.departureHours?.join(', ') || ''} onChange={e => setStation({ ...station, departureHours: e.target.value.split(',').map(s => s.trim()) })} />
                                <p className="text-[10px] text-gray-400 mt-0.5">Format 24h, séparées par virgules</p>
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className={labelClass}>Heures d'Arrivée (Estimées)</label>
                                <input type="text" placeholder="Ex: 12:00, 19:00" className={inputClass} value={station.arrivalHours?.join(', ') || ''} onChange={e => setStation({ ...station, arrivalHours: e.target.value.split(',').map(s => s.trim()) })} />
                                <p className="text-[10px] text-gray-400 mt-0.5">Même ordre que les départs</p>
                            </div>

                            {/* Row 4: Description */}
                            <div className="col-span-12">
                                <div className="flex justify-between items-end mb-1">
                                    <label className={labelClass}>Description du Trajet</label>
                                    <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc || (!station.pointA || !station.pointB)} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1 font-bold transition-colors border border-purple-100">
                                        <Sparkles size={10} /> IA
                                    </button>
                                </div>
                                <textarea className="w-full rounded-lg border border-gray-300 bg-white p-2 outline-none h-20 resize-none focus:ring-2 focus:ring-[#e9b400] focus:border-transparent text-gray-800 text-sm" value={station.description || ''} onChange={e => setStation({ ...station, description: e.target.value })} placeholder="Détails sur le voyage..." />
                            </div>
                        </div>
                    )}

                </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium transition-colors border border-gray-200 bg-white disabled:opacity-50 text-sm">Annuler</button>
                <button type="button" onClick={handleSaveStation} disabled={isSubmitting} className={`px-6 py-2 rounded-lg text-white font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ${station.type === 'STATION' ? 'bg-[#008751] hover:bg-[#006b40] shadow-green-200' : 'bg-[#e9b400] hover:bg-yellow-600 shadow-yellow-200'}`}>
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            <Save size={16} /> Enregistrer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
