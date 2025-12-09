import React, { useState, useEffect } from 'react';
import { Station, User, ViewState } from '../../shared/types';
import { getStations, getUsers } from '../../shared/services/storage';
import { MapPin, Calendar, Clock, ArrowRight, Bus, AlertCircle, ChevronLeft, Search, Building2, ChevronRight } from 'lucide-react';
import { Footer } from '../../shared/components/Footer';

interface Props {
    onNavigate: (page: ViewState, params?: any) => void;
    searchParams: { departure: string; arrival: string; date: string } | null;
    user: User | null;
}

export const SearchResultsPage: React.FC<Props> = ({ onNavigate, searchParams, user }) => {
    const [stations, setStations] = useState<Station[]>([]);
    const [routes, setRoutes] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingStationId, setViewingStationId] = useState<string | null>(null);

    // Search state
    const [departure, setDeparture] = useState(searchParams?.departure || '');
    const [arrival, setArrival] = useState(searchParams?.arrival || '');
    const [date, setDate] = useState(searchParams?.date || '');

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const allStations = getStations();
            const approvedCompanies = getUsers().filter(u => u.role === 'COMPANY' && u.status === 'APPROVED');
            const approvedCompanyIds = approvedCompanies.map(c => c.id);

            // Filter only approved company stations
            const approvedStations = allStations.filter(s => approvedCompanyIds.includes(s.companyId));

            // Separate stations and routes
            const parentStations = approvedStations.filter(s => s.type === 'STATION');
            const allRoutes = approvedStations.filter(s => s.type === 'ROUTE');

            // Filter stations logic
            let filteredStations = parentStations;

            if (departure || arrival) {
                filteredStations = parentStations.filter(station => {
                    // 1. Check if station matches departure location
                    const matchStationLoc = !departure || station.location.toLowerCase().includes(departure.toLowerCase());

                    if (!arrival) {
                        // If only departure is specified, show stations matching location
                        return matchStationLoc;
                    } else {
                        // If arrival is specified, we must check if this station has any route matching the criteria
                        // Find routes for this station
                        const stationRoutes = allRoutes.filter(r => r.parentId === station.id);

                        // Check if any route matches both departure (optional check on route point A) and arrival
                        const hasMatchingRoute = stationRoutes.some(route => {
                            const matchRouteDep = !departure || route.pointA?.toLowerCase().includes(departure.toLowerCase());
                            const matchRouteArr = route.pointB?.toLowerCase().includes(arrival.toLowerCase());
                            return matchRouteDep && matchRouteArr;
                        });

                        // If we are searching for a specific trip (Dep -> Arr), we only care about routes.
                        // However, the user might want to see the station if it's in the departure city AND has routes to arrival.
                        return matchStationLoc && hasMatchingRoute;
                    }
                });
            }

            setStations(filteredStations);
            setRoutes(allRoutes);
            setLoading(false);
        }, 800);
    }, [departure, arrival, date]); // Re-run when search state changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The effect will trigger automatically
    };

    const handleBooking = (routeId: string) => {
        if (user) {
            // User is logged in, proceed to booking (mock)
            onNavigate('DASHBOARD_CLIENT', { bookingRouteId: routeId });
        } else {
            // User not logged in, redirect to login
            onNavigate('LOGIN_VOYAGEUR');
        }
    };

    const getRoutesForStation = (stationId: string) => {
        return routes.filter(r => r.parentId === stationId);
    };

    const renderStationsList = () => (
        <div className="grid gap-6">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="text-[#008751]" /> {stations.length} Sous-stations trouvées
                </h2>
            </div>

            {stations.map(station => {
                const stationRoutes = getRoutesForStation(station.id);
                return (
                    <div key={station.id} onClick={() => setViewingStationId(station.id)} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:items-center group cursor-pointer">
                        <div className="w-full lg:w-64 h-48 lg:h-48 rounded-2xl overflow-hidden relative shrink-0 shadow-inner bg-gray-100">
                            <img src={station.photoUrl} alt={station.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black text-[#008751] uppercase tracking-wider shadow-sm">
                                {station.companyName}
                            </div>
                            <div className="absolute bottom-3 left-3 text-white">
                                <p className="text-xs font-medium opacity-90 flex items-center gap-1"><Clock size={12} /> {station.openingTime || '--:--'} - {station.closingTime || '--:--'}</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex flex-col justify-between h-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-[#008751] transition-colors">{station.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                                        <MapPin size={16} className="text-gray-400" /> {station.location}
                                    </div>
                                    {station.mapLink && (
                                        <a href={station.mapLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                            Voir sur Google Maps
                                        </a>
                                    )}
                                </div>
                                <div className="text-right mt-4 md:mt-0 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                    <div className="text-2xl font-black text-[#008751]">{stationRoutes.length}</div>
                                    <div className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Trajets disponibles</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                                <div className="flex flex-wrap gap-2 items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Jours d'ouverture:</span>
                                    {station.workDays.map(d => (
                                        <span key={d} className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-700 border border-gray-200">{d.substring(0, 3)}</span>
                                    ))}
                                </div>
                                {station.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{station.description}</p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                <button onClick={() => setViewingStationId(station.id)} className="flex-1 bg-[#008751] text-white py-4 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-green-300">
                                    Voir les trajets <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderRoutesList = () => {
        const station = stations.find(s => s.id === viewingStationId);
        if (!station) return null;

        const stationRoutes = getRoutesForStation(station.id);

        // Also filter by search params if provided
        let filteredRoutes = stationRoutes;
        if (departure || arrival) {
            filteredRoutes = stationRoutes.filter(r => {
                const matchDep = !departure || r.pointA?.toLowerCase().includes(departure.toLowerCase());
                const matchArr = !arrival || r.pointB?.toLowerCase().includes(arrival.toLowerCase());
                return matchDep && matchArr;
            });
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setViewingStationId(null)} className="flex items-center gap-2 text-gray-600 hover:text-[#008751] font-bold transition-colors">
                        <ChevronLeft size={20} /> Retour aux stations
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-start gap-4">
                        <img src={station.photoUrl} className="w-24 h-24 rounded-xl object-cover" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">{station.name}</h2>
                            <p className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> {station.location}</p>
                            <p className="text-sm text-gray-400 mt-2"><Clock size={14} className="inline mr-1" /> {station.openingTime || '--:--'} - {station.closingTime || '--:--'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Bus className="text-[#e9b400]" /> {filteredRoutes.length} Trajets disponibles
                    </h3>
                </div>

                {filteredRoutes.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredRoutes.map(route => (
                            <div key={route.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:items-center group">
                                <div className="w-full lg:w-64 h-48 lg:h-48 rounded-2xl overflow-hidden relative shrink-0 shadow-inner bg-gray-100">
                                    <img src={route.photoUrl} alt={route.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black text-[#e9b400] uppercase tracking-wider shadow-sm">
                                        {route.companyName}
                                    </div>
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <p className="text-xs font-medium opacity-90 flex items-center gap-1"><Clock size={12} /> {route.departureHours?.[0] || '--:--'}</p>
                                    </div>
                                </div>

                                <div className="flex-1 w-full flex flex-col justify-between h-full">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-[#e9b400] transition-colors">{route.name}</h3>
                                            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                                                <MapPin size={16} className="text-gray-400" /> {route.location}
                                            </div>
                                        </div>
                                        <div className="text-right mt-4 md:mt-0 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                            <div className="text-2xl font-black text-[#008751]">{route.price?.toLocaleString()} F</div>
                                            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wide">par personne</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 relative">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 hidden md:block"></div>

                                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                            <div className="bg-gray-50 md:pr-4">
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Départ</div>
                                                <div className="font-black text-gray-900 text-lg flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-[#008751]"></div> {route.pointA}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center text-gray-300">
                                                <ArrowRight size={24} className="hidden md:block" />
                                                <div className="md:hidden h-8 w-0.5 bg-gray-200 my-2 ml-1.5"></div>
                                            </div>

                                            <div className="bg-gray-50 md:pl-4 text-left md:text-right">
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Arrivée</div>
                                                <div className="font-black text-gray-900 text-lg flex items-center gap-2 md:justify-end">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400 md:order-last"></div> {route.pointB}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 items-center">
                                            <Clock size={16} className="text-gray-400 mr-2" />
                                            {route.departureHours?.slice(0, 4).map((h, i) => (
                                                <span key={i} className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 shadow-sm">{h}</span>
                                            ))}
                                            {(route.departureHours?.length || 0) > 4 && <span className="text-xs font-bold text-gray-400 ml-1">+{route.departureHours!.length - 4} horaires</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                        <button onClick={() => handleBooking(route.id)} className="flex-1 bg-[#008751] text-white py-4 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-green-300">
                                            Réserver ce trajet <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Aucun trajet trouvé</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                            Cette station n'a pas de trajet correspondant à votre recherche pour le moment.
                        </p>
                        <button onClick={() => setViewingStationId(null)} className="px-8 py-4 bg-[#008751] text-white rounded-2xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200">
                            Voir d'autres stations
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col selection:bg-green-100 selection:text-green-900">
            <div className="bg-[#008751] relative overflow-hidden text-white py-10 md:py-16 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <button onClick={() => onNavigate('LANDING')} className="mb-6 flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 w-fit px-4 py-2 rounded-full transition-all text-sm font-bold backdrop-blur-sm border border-white/20">
                        <ChevronLeft size={18} /> Retour
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        {viewingStationId ? 'Trajets disponibles' : 'Résultats de recherche'}
                    </h1>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-xl max-w-4xl">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Départ"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none text-gray-800 font-bold placeholder-gray-400"
                                    value={departure}
                                    onChange={(e) => setDeparture(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 relative">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Arrivée"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none text-gray-800 font-bold placeholder-gray-400"
                                    value={arrival}
                                    onChange={(e) => setArrival(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Calendar className="absolute left-4 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none text-gray-800 font-bold"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="bg-[#008751] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200">
                                Rechercher
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full animate-fade-in">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#008751] rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 animate-pulse">Recherche des meilleurs trajets...</h3>
                        <p className="text-gray-500 mt-2">Nous parcourons les offres de nos compagnies partenaires.</p>
                    </div>
                ) : viewingStationId ? (
                    renderRoutesList()
                ) : stations.length > 0 ? (
                    renderStationsList()
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Aucune station trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                            Désolé, nous n'avons trouvé aucune station correspondant à votre recherche pour le moment.
                        </p>
                        <button onClick={() => { setDeparture(''); setArrival(''); setDate(''); }} className="px-8 py-4 bg-[#008751] text-white rounded-2xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200">
                            Voir toutes les stations
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>


        </div>
    );
};
