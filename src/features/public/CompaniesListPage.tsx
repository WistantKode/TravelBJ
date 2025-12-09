import React, { useState, useEffect } from 'react';
import { User, Station, ViewState } from '../../shared/types';
import { getUsers, getStations } from '../../shared/services/storage';
import { Search, MapPin, Building2, ChevronRight, Filter } from 'lucide-react';
import { Footer } from '../../shared/components/Footer';

interface Props {
    onNavigate: (page: ViewState, params?: any) => void;
}

export const CompaniesListPage: React.FC<Props> = ({ onNavigate }) => {
    const [companies, setCompanies] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const allUsers = getUsers();
            const approvedCompanies = allUsers.filter(u => u.role === 'COMPANY' && u.status === 'APPROVED');
            setCompanies(approvedCompanies);
            setLoading(false);
        }, 500);
    }, []);

    const getCompanyStats = (companyId: string) => {
        const allStations = getStations();
        const companyStations = allStations.filter(s => s.companyId === companyId);
        const stations = companyStations.filter(s => s.type === 'STATION');
        const routes = companyStations.filter(s => s.type === 'ROUTE');
        return { stations: stations.length, routes: routes.length };
    };

    const filteredCompanies = companies.filter(company =>
        company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col pt-[70px] selection:bg-green-100 selection:text-green-900">
            {/* Header */}
            <div className="bg-[#008751] relative overflow-hidden text-white py-12 md:py-16 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Nos Compagnies Partenaires</h1>
                    <p className="text-green-50 text-lg max-w-2xl">Découvrez toutes les compagnies de transport approuvées et vérifiées par VoyageBJ</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 mb-8 w-full relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une compagnie ou une ville..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none bg-gray-50 focus:bg-white transition-colors text-gray-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#008751] rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-800 animate-pulse">Chargement des compagnies...</h3>
                    </div>
                ) : filteredCompanies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map(company => {
                            const stats = getCompanyStats(company.id);
                            return (
                                <div
                                    key={company.id}
                                    onClick={() => onNavigate('COMPANY_DETAILS', { companyId: company.id })}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                                >
                                    {/* Banner */}
                                    <div className="h-32 bg-gradient-to-br from-[#008751] to-[#e9b400] relative overflow-hidden">
                                        {company.bannerUrl && (
                                            <img src={company.bannerUrl} className="w-full h-full object-cover opacity-80" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 -mt-12 relative">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4">
                                            <img
                                                src={company.avatarUrl || `https://ui-avatars.com/api/?name=${company.companyName}&background=random`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Company Info */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#008751] transition-colors">
                                            {company.companyName}
                                        </h3>

                                        {company.address && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span>{company.address}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#008751]">{stats.stations}</div>
                                                <div className="text-xs text-gray-500 uppercase font-medium">Sous-stations</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#e9b400]">{stats.routes}</div>
                                                <div className="text-xs text-gray-500 uppercase font-medium">Trajets</div>
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => onNavigate('COMPANY_DETAILS', { companyId: company.id })}
                                            className="w-full bg-[#008751] text-white py-3 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
                                        >
                                            Voir détails <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Aucune compagnie trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                            {searchTerm
                                ? "Aucune compagnie ne correspond à votre recherche."
                                : "Aucune compagnie approuvée pour le moment."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-8 py-4 bg-[#008751] text-white rounded-2xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200"
                            >
                                Réinitialiser la recherche
                            </button>
                        )}
                    </div>
                )}
            </div>


        </div>
    );
};
