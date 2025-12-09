import React, { useState } from 'react';
import { Truck, Home, Bell, Menu, LayoutDashboard, LogOut, X, ChevronRight, User as UserIcon, Briefcase, Shield } from 'lucide-react';
import { User, ViewState } from '../types';

interface NavbarProps {
    user: User | null;
    onNavigate: (view: ViewState) => void;
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout }) => {
    const [visitorMenuOpen, setVisitorMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const toggleMenu = () => {
        setVisitorMenuOpen(!visitorMenuOpen);
    };

    const handleNav = (view: ViewState) => {
        onNavigate(view);
        setVisitorMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20 gap-4">

                        {/* Section Gauche : Menu Toggle + Marque */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={toggleMenu}
                                className="p-2.5 -ml-2 text-gray-600 hover:text-[#008751] hover:bg-green-50 rounded-xl focus:outline-none lg:hidden transition-all active:scale-95"
                                title="Menu Principal"
                            >
                                <Menu size={24} strokeWidth={2.5} />
                            </button>

                            {/* Marque */}
                            <div
                                className="flex items-center gap-3 cursor-pointer group select-none"
                                onClick={() => {
                                    onNavigate('LANDING');
                                    setVisitorMenuOpen(false);
                                }}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#008751] to-[#006b40] text-white flex items-center justify-center rounded-xl shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all duration-300 transform group-hover:scale-105">
                                    <Truck size={20} className="fill-white/20" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-3xl font-black tracking-tighter leading-none transition-colors" style={{ fontFamily: '"Dancing Script", cursive' }}>
                                        <span className="text-[#008751]">Voyage</span>
                                        <span className="text-[#FCD116]">B</span>
                                        <span className="text-[#E8112D]">j</span>
                                    </h1>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-gray-600 transition-colors">Transport</p>
                                </div>
                            </div>
                        </div>

                        {/* Section Droite : Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            {/* Bouton Accueil (Visible sur toutes les tailles, raffiné) */}
                            <button
                                onClick={() => onNavigate(user?.role === 'CLIENT' ? 'COMPANIES_LIST' : 'LANDING')}
                                className="p-2.5 text-gray-400 hover:text-[#008751] hover:bg-gray-50 rounded-xl transition-all active:scale-95 hidden sm:block"
                                title="Retour à l'accueil"
                            >
                                <Home size={22} />
                            </button>

                            {user ? (
                                /* État Connecté */
                                <>
                                    {/* Notifications */}
                                    <div className="relative group cursor-pointer p-2.5 hover:bg-gray-50 rounded-xl transition-all hidden sm:block active:scale-95">
                                        <div className="relative">
                                            <Bell size={22} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e8112d] rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white font-bold shadow-sm">3</span>
                                        </div>
                                    </div>

                                    {/* Déclencheur du Menu Profil */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-3 focus:outline-none p-1.5 pl-2 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                            <div className="text-right hidden md:block">
                                                <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[120px]">{user.companyName || user.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{user.role === 'ADMIN' ? 'Admin' : (user.role === 'COMPANY' ? 'Partenaire' : 'Voyageur')}</p>
                                            </div>
                                            <img
                                                src={user.avatarUrl}
                                                alt="Profile"
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white shadow-md object-cover bg-gray-100 ring-1 ring-gray-100"
                                            />
                                        </button>

                                        {/* Menu Déroulant */}
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block z-50 animate-fade-in origin-top-right">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    onClick={() => {
                                                        onNavigate(user.role === 'COMPANY' ? 'DASHBOARD_COMPANY' : (user.role === 'ADMIN' ? 'DASHBOARD_ADMIN' : 'DASHBOARD_CLIENT'));
                                                        setVisitorMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-[#008751] font-bold rounded-xl transition-colors flex items-center gap-3"
                                                >
                                                    <LayoutDashboard size={18} /> Tableau de bord
                                                </button>
                                                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                                <button
                                                    onClick={onLogout}
                                                    className="w-full text-left px-4 py-3 text-sm text-[#e8112d] hover:bg-red-50 font-bold rounded-xl transition-colors flex items-center gap-3"
                                                >
                                                    <LogOut size={18} /> Se déconnecter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* État Visiteur (Bureau) */
                                <div className="hidden lg:flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
                                    <button
                                        onClick={() => onNavigate('LOGIN_VOYAGEUR')}
                                        className="text-sm font-bold text-gray-600 hover:text-[#008751] transition-colors px-4 py-2 rounded-full hover:bg-white"
                                    >
                                        Je voyage
                                    </button>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <button
                                        onClick={() => onNavigate('LOGIN_COMPANY')}
                                        className="text-sm font-bold text-gray-600 hover:text-[#008751] transition-colors px-4 py-2 rounded-full hover:bg-white"
                                    >
                                        Partenaires
                                    </button>

                                    <button
                                        onClick={() => onNavigate('LOGIN_ADMIN')}
                                        className="ml-2 text-xs font-bold text-gray-400 hover:text-gray-800 px-3 py-2 transition-colors border border-transparent hover:border-gray-200 rounded-full"
                                        title="Accès Administration"
                                    >
                                        Admin
                                    </button>

                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="ml-2 bg-[#008751] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-green-200 hover:bg-[#006b40] hover:shadow-green-300 transition-all transform active:scale-95"
                                    >
                                        Connexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tiroir Menu Mobile */}
            <>
                {/* Arrière-plan */}
                <div
                    className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9998] transition-opacity duration-500 lg:hidden ${visitorMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setVisitorMenuOpen(false)}
                />

                {/* Panneau Coulissant */}
                <div className={`fixed top-0 left-0 bottom-0 w-[85%] sm:w-[380px] bg-white z-[9999] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) lg:hidden ${visitorMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* En-tête du Tiroir */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#008751] text-white flex items-center justify-center rounded-xl shadow-md">
                                    <Truck size={20} />
                                </div>
                                <span className="font-black text-2xl tracking-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>
                                    <span className="text-[#008751]">Voyage</span><span className="text-[#FCD116]">B</span><span className="text-[#E8112D]">j</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setVisitorMenuOpen(false)}
                                className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Éléments du Tiroir */}
                        <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                            {!user ? (
                                <>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pl-1">Espace Membre</p>

                                    <button
                                        onClick={() => handleNav('LOGIN_VOYAGEUR')}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50 rounded-2xl group transition-all shadow-sm hover:shadow-md active:scale-98"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#008751] group-hover:scale-110 transition-transform">
                                                <UserIcon size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-base text-gray-900">Je voyage</p>
                                                <p className="text-xs font-medium text-gray-500">Connexion Client</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#008751] transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleNav('LOGIN_COMPANY')}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50 rounded-2xl group transition-all shadow-sm hover:shadow-md active:scale-98"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-[#e9b400] group-hover:scale-110 transition-transform">
                                                <Briefcase size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-base text-gray-900">Partenaire</p>
                                                <p className="text-xs font-medium text-gray-500">Espace Compagnie</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#e9b400] transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleNav('LOGIN_ADMIN')}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-300 hover:bg-gray-50 rounded-2xl group transition-all shadow-sm hover:shadow-md active:scale-98"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                                                <Shield size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-base text-gray-900">Administration</p>
                                                <p className="text-xs font-medium text-gray-500">Accès restreint</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-gray-900 transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                        <img
                                            src={user.avatarUrl}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">{user.companyName || user.name}</p>
                                            <p className="text-xs font-medium text-gray-500 uppercase">{user.role}</p>
                                        </div>
                                    </div>

                                    {user.role === 'CLIENT' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onNavigate('SEARCH_RESULTS');
                                                    setVisitorMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 text-gray-700 hover:text-[#008751] font-bold transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-green-100 text-[#008751] flex items-center justify-center">
                                                    <Truck size={18} />
                                                </div>
                                                Rechercher un trajet
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onNavigate('COMPANIES_LIST');
                                                    setVisitorMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-bold transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <Briefcase size={18} />
                                                </div>
                                                Nos Partenaires
                                            </button>

                                            <div className="h-px bg-gray-100 my-2"></div>
                                        </>
                                    )}

                                    <button
                                        onClick={() => {
                                            onNavigate(user.role === 'COMPANY' ? 'DASHBOARD_COMPANY' : (user.role === 'ADMIN' ? 'DASHBOARD_ADMIN' : 'DASHBOARD_CLIENT'));
                                            setVisitorMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 text-gray-700 hover:text-[#008751] font-bold transition-all"
                                    >
                                        <LayoutDashboard size={20} /> Tableau de bord
                                    </button>

                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 text-[#e8112d] font-bold transition-all mt-auto"
                                    >
                                        <LogOut size={20} /> Se déconnecter
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Pied de Page du Tiroir */}
                        {!user && (
                            <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-sm border border-[#008751]/20">BJ</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Support Client</p>
                                        <p className="font-black text-lg text-gray-900 tracking-tight">+229 97 00 00 00</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleNav('SIGNUP_VOYAGEUR')}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#008751] to-[#006b40] text-white font-bold text-base shadow-lg shadow-green-200 hover:shadow-green-300 active:scale-95 transition-all"
                                >
                                    Créer un compte
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </>

            {/* Modal de Sélection d'Authentification */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAuthModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 animate-scale-in relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 text-[#008751] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserIcon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Bienvenue</h3>
                            <p className="text-gray-500 font-medium">Choisissez votre espace de connexion</p>
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => { onNavigate('LOGIN_VOYAGEUR'); setShowAuthModal(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#008751] hover:bg-green-50 transition-all group text-left">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-[#008751] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Je voyage</p>
                                    <p className="text-xs text-gray-500">Espace Client</p>
                                </div>
                                <ChevronRight className="ml-auto text-gray-300 group-hover:text-[#008751]" size={20} />
                            </button>

                            <button onClick={() => { onNavigate('LOGIN_COMPANY'); setShowAuthModal(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#e9b400] hover:bg-yellow-50 transition-all group text-left">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 text-[#e9b400] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Partenaire</p>
                                    <p className="text-xs text-gray-500">Espace Compagnie</p>
                                </div>
                                <ChevronRight className="ml-auto text-gray-300 group-hover:text-[#e9b400]" size={20} />
                            </button>

                            <button onClick={() => { onNavigate('LOGIN_ADMIN'); setShowAuthModal(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-all group text-left">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Administration</p>
                                    <p className="text-xs text-gray-500">Accès Réservé</p>
                                </div>
                                <ChevronRight className="ml-auto text-gray-300 group-hover:text-gray-900" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
