import React, { useState, useEffect } from 'react';
import { User } from '../../shared/types';
import { getUsers } from '../../shared/services/storage';
import { Building2, MapPin, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Footer } from '../../shared/components/Footer';

import { ViewState } from '../../shared/types';

interface Props {
    onNavigate: (page: ViewState, params?: any) => void;
}

export const CompaniesPage: React.FC<Props> = ({ onNavigate }) => {
    const [companies, setCompanies] = useState<User[]>([]);

    useEffect(() => {
        const allUsers = getUsers();
        const approvedCompanies = allUsers.filter(u => u.role === 'COMPANY' && u.status === 'APPROVED');
        setCompanies(approvedCompanies);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col pt-[70px]">
            <div className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-extrabold mb-4">Nos Compagnies Partenaires</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Découvrez les meilleures agences de transport du Bénin, vérifiées et approuvées pour votre sécurité.
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {companies.map(company => (
                        <div key={company.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                            <div className="h-40 bg-gray-200 relative">
                                {company.bannerUrl ? (
                                    <img src={company.bannerUrl} alt={company.companyName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600">
                                        <Building2 size={40} className="opacity-20" />
                                    </div>
                                )}
                                <div className="absolute -bottom-10 left-6">
                                    <img
                                        src={company.avatarUrl || `https://ui-avatars.com/api/?name=${company.companyName}&background=random`}
                                        alt={company.companyName}
                                        className="w-20 h-20 rounded-xl border-4 border-white shadow-lg bg-white object-cover"
                                    />
                                </div>
                            </div>

                            <div className="pt-12 p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{company.companyName}</h3>
                                    <CheckCircle size={16} className="text-[#008751]" fill="#e6fffa" />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <MapPin size={16} className="text-gray-400" />
                                        {company.address || 'Cotonou, Bénin'}
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <Phone size={16} className="text-gray-400" />
                                        {company.phone || 'Non renseigné'}
                                    </div>
                                </div>

                                <button onClick={() => onNavigate('LOGIN_VOYAGEUR')} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:text-[#008751] transition-colors flex items-center justify-center gap-2 group-hover:border-[#008751]">
                                    Voir les trajets <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {companies.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">Aucune compagnie partenaire pour le moment.</p>
                    </div>
                )}
            </div>


        </div>
    );
};
