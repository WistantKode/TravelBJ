import React, { useState, useEffect } from 'react';
import { User, Station, ViewState } from '../../shared/types';
import { getUsers, getStations } from '../../shared/services/storage';
import { MapPin, Phone, Mail, MessageCircle, X, ChevronLeft, Building2, ArrowRight, Clock, Bus } from 'lucide-react';
import { Footer } from '../../shared/components/Footer';

interface Props {
    onNavigate: (page: ViewState, params?: any) => void;
    companyId: string;
    user: User | null;
}

export const CompanyDetailsPage: React.FC<Props> = ({ onNavigate, companyId, user }) => {
    const [company, setCompany] = useState<User | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [routes, setRoutes] = useState<Station[]>([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'stations' | 'routes'>('stations');

    useEffect(() => {
        const allUsers = getUsers();
        const foundCompany = allUsers.find(u => u.id === companyId && u.role === 'COMPANY');
        setCompany(foundCompany || null);

        if (foundCompany) {
            const allStations = getStations();
            const companyStations = allStations.filter(s => s.companyId === companyId);
            setStations(companyStations.filter(s => s.type === 'STATION'));
            setRoutes(companyStations.filter(s => s.type === 'ROUTE'));
        }
    }, [companyId]);

    if (!company) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Compagnie introuvable</h2>
                    <button onClick={() => onNavigate('COMPANIES_LIST')} className="text-[#008751] font-bold hover:underline">
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const getRoutesForStation = (stationId: string) => {
        return routes.filter(r => r.parentId === stationId);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col pt-[70px]">
            {/* Header with Banner */}
            <div className="relative h-64 bg-gradient-to-br from-[#008751] to-[#e9b400] overflow-hidden">
                {company.bannerUrl && (
                    <img src={company.bannerUrl} className="w-full h-full object-cover opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8 w-full">
                        <button
                            onClick={() => onNavigate('COMPANIES_LIST')}
                            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all text-sm font-bold border border-white/20"
                        >
                            <ChevronLeft size={18} /> Retour
                        </button>

                        <div className="flex items-end gap-6">
                            {/* Company Logo */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0">
                                <img
                                    src={company.avatarUrl || `https://ui-avatars.com/api/?name=${company.companyName}&background=random`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Company Info */}
                            <div className="flex-1 text-white pb-2">
                                <h1 className="text-3xl md:text-4xl font-black mb-2">{company.companyName}</h1>
                                {company.address && (
                                    <div className="flex items-center gap-2 text-green-50 mb-3">
                                        <MapPin size={16} />
                                        <span>{company.address}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="bg-white text-[#008751] px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Phone size={18} /> Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-[70px] z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('stations')}
                            className={`py-4 px-2 font-bold transition-colors border-b-2 ${activeTab === 'stations' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Sous-stations ({stations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('routes')}
                            className={`py-4 px-2 font-bold transition-colors border-b-2 ${activeTab === 'routes' ? 'border-[#e9b400] text-[#e9b400]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Trajets ({routes.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {activeTab === 'stations' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Sous-stations</h2>
                        {stations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stations.map(station => {
                                    const stationRoutes = getRoutesForStation(station.id);
                                    return (
                                        <div key={station.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                            <div className="h-40 overflow-hidden">
                                                <img src={station.photoUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{station.name}</h3>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                                    <MapPin size={14} />
                                                    <span>{station.location}</span>
                                                </div>
                                                {station.openingTime && station.closingTime && (
                                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                                        <Clock size={14} />
                                                        <span>{station.openingTime} - {station.closingTime}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-sm text-gray-600">{stationRoutes.length} trajet(s) disponible(s)</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500">Aucune sous-station pour cette compagnie</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'routes' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Trajets disponibles</h2>
                        {routes.length > 0 ? (
                            <div className="grid gap-6">
                                {routes.map(route => (
                                    <div key={route.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                                <img src={route.photoUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">{route.name}</h3>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <span className="font-bold">{route.pointA}</span>
                                                        <ArrowRight size={16} className="text-gray-400" />
                                                        <span className="font-bold">{route.pointB}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        <span>{route.departureHours?.slice(0, 3).join(', ')}</span>
                                                    </div>
                                                    <div className="font-bold text-[#008751] text-lg">
                                                        {route.price?.toLocaleString()} F
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => {
                                                        if (user) {
                                                            onNavigate('DASHBOARD_CLIENT', { bookingRouteId: route.id });
                                                        } else {
                                                            onNavigate('LOGIN_VOYAGEUR');
                                                        }
                                                    }}
                                                    className="bg-[#008751] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-md whitespace-nowrap"
                                                >
                                                    Réserver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <Bus size={40} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500">Aucun trajet disponible pour cette compagnie</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">Contacter {company.companyName}</h3>
                            <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Email</p>
                                    <a href={`mailto:${company.email}`} className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors truncate block">
                                        {company.email}
                                    </a>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            {company.whatsapp && (
                                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">WhatsApp</p>
                                        <a
                                            href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-base font-bold text-gray-900 hover:text-green-600 transition-colors truncate block"
                                        >
                                            {company.whatsapp}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {company.phone && (
                                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Téléphone</p>
                                        <a href={`tel:${company.phone}`} className="text-base font-bold text-gray-900 hover:text-purple-600 transition-colors truncate block">
                                            {company.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {company.address && (
                                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Localisation</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {company.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400">Compagnie vérifiée et approuvée par VoyageBJ</p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};
