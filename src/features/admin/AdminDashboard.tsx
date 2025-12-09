import React, { useState, useEffect } from 'react';
import { User, UserRole, ViewState } from '../../shared/types';
import { getUsers, saveUser, getStations } from '../../shared/services/storage';
import {
    Users, Search, Filter, CheckCircle, XCircle, MoreVertical,
    Shield, AlertCircle, Download, Eye, FileText, X, ExternalLink, User as UserIcon, Building2, Phone, Mail, CreditCard, RefreshCw
} from 'lucide-react';
import { NotifyFunc } from '../../App';
import { DocumentViewerModal } from '../../shared/components/DocumentViewerModal';
import { CompanyDetailsModal } from '../../shared/components/CompanyDetailsModal';
import { BottomNav } from '../../shared/components/BottomNav';
import { SettingsModal } from '../../shared/components/SettingsModal';

interface Props {
    user: User;
    notify: NotifyFunc;
    onNavigate: (view: ViewState, params?: any) => void;
    initialTab?: 'dashboard' | 'profile';
    initialFilter?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
}

export const AdminDashboard: React.FC<Props> = ({ user, notify, onNavigate, initialTab = 'dashboard', initialFilter = 'PENDING' }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'settings'>(initialTab);
    const [companies, setCompanies] = useState<User[]>([]);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(initialFilter);
    const [searchTerm, setSearchTerm] = useState('');

    // État du visualiseur
    const [viewerState, setViewerState] = useState<{
        isOpen: boolean;
        documentUrl: string;
        documentType: 'PDF' | 'IMAGE';
        title: string;
        companyId: string | null;
    }>({
        isOpen: false,
        documentUrl: '',
        documentType: 'IMAGE',
        title: '',
        companyId: null
    });

    // État de la modale de détails
    const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean, companyId: string | null }>({
        isOpen: false,
        companyId: null
    });

    const [profileForm, setProfileForm] = useState<Partial<User>>({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || ''
    });

    useEffect(() => {
        setActiveTab(initialTab);
        if (initialFilter) setFilterStatus(initialFilter);
    }, [initialTab, initialFilter]);

    useEffect(() => {
        refreshData();
        const freshUser = getUsers().find(u => u.id === user.id);
        if (freshUser) {
            setProfileForm({
                name: freshUser.name,
                email: freshUser.email,
                phone: freshUser.phone || '',
                whatsapp: freshUser.whatsapp || '',
                address: freshUser.address || '',
                avatarUrl: freshUser.avatarUrl || ''
            });
        }
    }, [user.id]);

    const refreshData = () => {
        const allUsers = getUsers();
        const comps = allUsers.filter(u => u.role === UserRole.COMPANY);
        setCompanies(comps);
    };

    const handleStatusChange = (companyId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        const company = companies.find(c => c.id === companyId);
        if (!company) return;

        try {
            const updatedUser: User = { ...company, status: status };
            saveUser(updatedUser);
            setCompanies(prevCompanies => prevCompanies.map(c => c.id === companyId ? updatedUser : c));

            let actionText = '';
            if (status === 'APPROVED') actionText = 'validée';
            else if (status === 'REJECTED') actionText = 'refusée';
            else actionText = 'mise en attente';

            notify(`La demande de ${company.companyName} a été ${actionText}.`, status === 'APPROVED' ? 'success' : 'info');

            // Fermer la modale si ouverte et action effectuée à l'intérieur
            if (viewerState.isOpen && viewerState.companyId === companyId) {
                setViewerState(prev => ({ ...prev, isOpen: false }));
            }

            setTimeout(refreshData, 50);
        } catch (error) {
            notify("Une erreur est survenue lors de la mise à jour.", "error");
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
                notify("Photo chargée. N'oubliez pas d'enregistrer.", "info");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedAdmin: User = {
            ...user,
            name: profileForm.name || user.name,
            email: profileForm.email || user.email,
            phone: profileForm.phone,
            whatsapp: profileForm.whatsapp,
            address: profileForm.address,
            avatarUrl: profileForm.avatarUrl || user.avatarUrl
        };
        saveUser(updatedAdmin);
        notify("Vos informations de contact ont été mises à jour.", "success");
    };

    const openDocument = (url: string, title: string, companyId: string) => {
        if (!url) {
            notify("Aucun document disponible.", "error");
            return;
        }
        // Heuristique simple pour le type, dans une vraie app on vérifierait le type MIME ou l'extension
        const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');
        setViewerState({
            isOpen: true,
            documentUrl: url,
            documentType: isPdf ? 'PDF' : 'IMAGE',
            title,
            companyId
        });
    };

    const openCompanyDetails = (companyId: string) => {
        setDetailsModal({ isOpen: true, companyId });
    };

    const filteredCompanies = companies.filter(c => {
        const matchesFilter = filterStatus === 'ALL' ? true : c.status === filterStatus;
        const matchesSearch = c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const StatCard = ({ title, count, type, onClick, active }: any) => {
        const colors = {
            PENDING: 'text-yellow-600 bg-yellow-50 ring-yellow-400',
            APPROVED: 'text-green-600 bg-green-50 ring-green-500',
            REJECTED: 'text-red-600 bg-red-50 ring-red-500',
            ALL: 'text-gray-800 bg-gray-50 ring-gray-400'
        };
        // @ts-ignore
        const style = colors[type] || colors.ALL;
        const baseClass = style.split(' ')[0];
        const bgClass = style.split(' ')[1];

        return (
            <div
                onClick={onClick}
                className={`cursor-pointer p-5 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md flex items-center justify-between ${active ? `ring-2 border-transparent ${style.split(' ').pop()}` : 'border-gray-100 hover:border-gray-200'}`}
            >
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <p className={`text-3xl font-extrabold mt-1 ${baseClass}`}>{count}</p>
                </div>
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    <Users size={20} className={baseClass} />
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Administration</h1>
                        <p className="text-gray-500 mt-1">Gérez les adhésions et validez les documents.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none w-full md:w-64 shadow-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={refreshData} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors" title="Rafraîchir"><RefreshCw size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="En Attente" count={companies.filter(c => c.status === 'PENDING').length} type="PENDING" onClick={() => setFilterStatus('PENDING')} active={filterStatus === 'PENDING'} />
                    <StatCard title="Validées" count={companies.filter(c => c.status === 'APPROVED').length} type="APPROVED" onClick={() => setFilterStatus('APPROVED')} active={filterStatus === 'APPROVED'} />
                    <StatCard title="Refusées" count={companies.filter(c => c.status === 'REJECTED').length} type="REJECTED" onClick={() => setFilterStatus('REJECTED')} active={filterStatus === 'REJECTED'} />
                    <StatCard title="Total" count={companies.length} type="ALL" onClick={() => setFilterStatus('ALL')} active={filterStatus === 'ALL'} />
                </div>
            </div>

            <div className="space-y-6">
                {filteredCompanies.length === 0 && (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-300"><Search size={48} /></div>
                        <h3 className="text-xl font-bold text-gray-900">Aucune demande trouvée</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            {filterStatus === 'PENDING' ? "Aucune compagnie en attente de validation." : "Aucune compagnie ne correspond à vos critères."}
                        </p>
                    </div>
                )}

                {filteredCompanies.map(company => (
                    <div key={company.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg border ${company.status === 'PENDING' ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-gray-200'}`}>
                        <div className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${company.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-50 to-white' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100"><img src={company.avatarUrl} alt="" className="w-12 h-12 rounded-md object-cover" /></div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 leading-none">{company.companyName}</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">ID: {company.id.substring(0, 8)}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1"><AlertCircle size={10} /> {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm ${company.status === 'APPROVED' ? 'bg-green-100 text-[#008751] border border-green-200' :
                                    company.status === 'REJECTED' ? 'bg-red-100 text-[#e8112d] border border-red-200' :
                                        'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse'
                                    }`}>
                                    {company.status === 'APPROVED' && <CheckCircle size={14} />}
                                    {company.status === 'REJECTED' && <XCircle size={14} />}
                                    {company.status === 'PENDING' && <AlertCircle size={14} />}
                                    {company.status === 'PENDING' ? 'En Attente' : (company.status === 'APPROVED' ? 'Validé' : 'Rejeté')}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3"><Building2 size={14} /> Entreprise</h4>
                                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100 h-full">
                                    <div><p className="text-xs text-gray-500 font-medium mb-1">Raison Sociale</p><p className="font-bold text-gray-900 text-lg">{company.companyName}</p></div>
                                    <div className="space-y-2 pt-2 border-t border-gray-200">
                                        <div className="flex justify-between items-center"><p className="text-xs text-gray-500">IFU</p><p className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm">{company.ifu}</p></div>
                                        <div className="flex justify-between items-center"><p className="text-xs text-gray-500">RCCM</p><p className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 text-sm">{company.rccm}</p></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3"><UserIcon size={14} /> Responsable</h4>
                                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100 h-full">
                                    <div><p className="text-xs text-gray-500 font-medium mb-1">Gérant</p><p className="font-bold text-gray-900 text-lg">{company.name}</p></div>
                                    <div><p className="text-xs text-gray-500 font-medium mb-1">NPI (Identité)</p><p className="font-mono font-bold text-gray-700 flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200 w-fit"><CreditCard size={14} className="text-gray-400" /> {company.npi}</p></div>
                                    <div className="pt-3 border-t border-gray-200 space-y-2">
                                        <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors bg-white p-2 rounded-lg border border-gray-200 hover:border-indigo-200"><Phone size={16} className="text-gray-400" /> {company.phone}</a>
                                        <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors bg-white p-2 rounded-lg border border-gray-200 hover:border-indigo-200"><Mail size={16} className="text-gray-400" /> {company.email}</a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col h-full">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} /> Documents & Validation</h4>
                                <div className="flex-1 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex flex-col gap-4">
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => openDocument(company.anattUrl || '', `Attestation ANaTT - ${company.companyName}`, company.id)}
                                            className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-100 p-2 rounded text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Shield size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Attestation ANaTT</p>
                                                    <p className="text-xs text-gray-500">Cliquez pour voir</p>
                                                </div>
                                            </div>
                                            <Eye size={16} className="text-gray-400 group-hover:text-indigo-600" />
                                        </button>

                                        {company.otherDocsUrl && (
                                            <button
                                                onClick={() => openDocument(company.otherDocsUrl || '', `Autres Pièces - ${company.companyName}`, company.id)}
                                                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded text-gray-600 group-hover:bg-gray-700 group-hover:text-white transition-colors"><FileText size={18} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">Autres Pièces</p>
                                                        <p className="text-xs text-gray-500">Cliquez pour voir</p>
                                                    </div>
                                                </div>
                                                <Eye size={16} className="text-gray-400 group-hover:text-gray-700" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => openCompanyDetails(company.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                                        >
                                            <UserIcon size={16} /> Voir Profil
                                        </button>
                                        {company.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleStatusChange(company.id, 'APPROVED')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Valider">
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button onClick={() => handleStatusChange(company.id, 'REJECTED')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Rejeter">
                                                    <XCircle size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); handleStatusChange(company.id, 'PENDING'); }} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Réexaminer">
                                                <RefreshCw size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-gray-700">
                                <img src={profileForm.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute bottom-0 right-0 bg-[#008751] text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-[#006b40] transition-colors">
                                <MoreVertical size={16} />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold">Profil & Contact</h2>
                            <p className="text-gray-300 mt-2 max-w-lg">Gérez vos informations personnelles et votre photo de profil. Ces informations sont visibles par les autres utilisateurs.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Identité</h3>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Nom d'affichage</label><div className="relative"><UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="text" required className="w-full pl-10 p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors shadow-sm" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Ex: Support Admin" /></div></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Email Officiel</label><div className="relative"><Mail className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="email" required className="w-full pl-10 p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors shadow-sm" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} /></div></div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Coordonnées</h3>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label><div className="relative"><Phone className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="tel" className="w-full pl-10 p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors shadow-sm" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+229..." /></div></div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Business</label>
                                <div className="relative"><ExternalLink className="absolute left-3 top-3.5 text-green-600" size={18} /><input type="tel" placeholder="Ex: 22997000000" className="w-full pl-10 p-3.5 rounded-xl border border-green-300 focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors shadow-sm" value={profileForm.whatsapp} onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })} /></div>
                                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><CheckCircle size={10} /> Active le bouton WhatsApp pour les compagnies.</p>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Adresse du Siège</label><div className="relative"><Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="text" className="w-full pl-10 p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors shadow-sm" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Ex: Cotonou, Bénin" /></div></div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button type="submit" className="btn-benin px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-2 transform active:scale-95 transition-all"><Download size={20} /> Enregistrer les informations</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-20">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'profile' && renderProfile()}

            <DocumentViewerModal
                isOpen={viewerState.isOpen}
                onClose={() => setViewerState(prev => ({ ...prev, isOpen: false }))}
                documentUrl={viewerState.documentUrl}
                documentType={viewerState.documentType}
                title={viewerState.title}
                onApprove={viewerState.companyId && companies.find(c => c.id === viewerState.companyId)?.status === 'PENDING' ? () => handleStatusChange(viewerState.companyId!, 'APPROVED') : undefined}
                onReject={viewerState.companyId && companies.find(c => c.id === viewerState.companyId)?.status === 'PENDING' ? () => handleStatusChange(viewerState.companyId!, 'REJECTED') : undefined}
            />

            <CompanyDetailsModal
                isOpen={detailsModal.isOpen}
                onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
                company={companies.find(c => c.id === detailsModal.companyId) || null}
            />

            {activeTab === 'settings' && (
                <>
                    {renderDashboard()}
                    <SettingsModal onClose={() => setActiveTab('dashboard')} />
                </>
            )}

            <BottomNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};
