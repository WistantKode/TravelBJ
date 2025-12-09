import React, { useEffect, useState } from 'react';
import { User, Station } from '../types';
import { getStations } from '../services/storage';
import { X, MapPin, Phone, Mail, Building2, CreditCard, MessageCircle, Bus, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    company: User | null;
}

export const CompanyDetailsModal: React.FC<Props> = ({ isOpen, onClose, company }) => {
    const [stations, setStations] = useState<Station[]>([]);

    useEffect(() => {
        if (company && isOpen) {
            const allStations = getStations();
            setStations(allStations.filter(s => s.companyId === company.id));
        }
    }, [company, isOpen]);

    if (!isOpen || !company) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
                {/* En-tête */}
                <div className="relative h-40 bg-gray-900 shrink-0">
                    {company.bannerUrl ? (
                        <img src={company.bannerUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                        <img
                            src={company.avatarUrl || `https://ui-avatars.com/api/?name=${company.companyName}&background=random`}
                            alt={company.companyName}
                            className="w-24 h-24 rounded-xl border-4 border-white shadow-lg bg-white object-cover"
                        />
                        <div className="mb-14 text-white">
                            <h2 className="text-2xl font-bold leading-none">{company.companyName}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${company.status === 'APPROVED' ? 'bg-green-500/20 border-green-400 text-green-100' :
                                    company.status === 'REJECTED' ? 'bg-red-500/20 border-red-400 text-red-100' :
                                        'bg-yellow-500/20 border-yellow-400 text-yellow-100'
                                    }`}>
                                    {company.status === 'APPROVED' ? 'Validé' : company.status === 'REJECTED' ? 'Refusé' : 'En Attente'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 overflow-y-auto p-8 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Informations Entreprise */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Building2 size={18} className="text-gray-400" /> Informations Entreprise
                            </h3>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">IFU</span> <span className="font-mono font-bold text-gray-700">{company.ifu || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">RCCM</span> <span className="font-mono font-bold text-gray-700">{company.rccm || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Adresse</span> <span className="font-medium text-gray-700 text-right">{company.address || 'Non renseignée'}</span></div>
                            </div>
                        </div>

                        {/* Informations Responsable */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <CreditCard size={18} className="text-gray-400" /> Responsable & Contact
                            </h3>
                            <div className="space-y-3">
                                <div><p className="text-xs text-gray-500">Gérant</p><p className="font-bold text-gray-800">{company.name}</p></div>
                                <div className="flex flex-wrap gap-2">
                                    {company.phone && (
                                        <a href={`tel:${company.phone}`} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200">
                                            <Phone size={14} /> {company.phone}
                                        </a>
                                    )}
                                    {company.email && (
                                        <a href={`mailto:${company.email}`} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200">
                                            <Mail size={14} /> {company.email}
                                        </a>
                                    )}
                                    {company.whatsapp && (
                                        <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 border border-green-200">
                                            <MessageCircle size={14} /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des Stations */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bus size={18} className="text-gray-400" /> Stations & Trajets ({stations.length})
                        </h3>
                        {stations.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {stations.map(station => (
                                    <div key={station.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-800">{station.name}</h4>
                                            <span className="text-[#008751] font-bold text-sm">{station.price} F</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium">{station.pointA}</span>
                                            <ArrowRight size={14} className="text-gray-400" />
                                            <span className="font-medium">{station.pointB}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 flex gap-1 flex-wrap">
                                            {station.departureHours?.map((h, i) => (
                                                <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-gray-200">{h}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                Aucune station créée pour le moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
