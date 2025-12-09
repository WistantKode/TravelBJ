
import React from 'react';
import { LayoutDashboard, Truck, Users, Briefcase, ShieldCheck, Wrench, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
    user: User;
    onNavigate: (view: any) => void;
    onLogout: () => void;
    mobileOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onNavigate, onLogout, mobileOpen }) => {

    const dashboardView = user.role === 'COMPANY' ? 'DASHBOARD_COMPANY' : (user.role === 'ADMIN' ? 'DASHBOARD_ADMIN' : 'DASHBOARD_CLIENT');

    return (
        <aside className={`af-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="flex flex-col py-4 gap-1">
                <div onClick={() => onNavigate(dashboardView)} className="af-sidebar-link group">
                    <div className="af-sidebar-icon"><LayoutDashboard size={20} /></div>
                    <span className="af-sidebar-text">Tableau de bord</span>
                </div>

                {user.role === 'COMPANY' && (
                    <>
                        <div onClick={() => onNavigate('STATION_MANAGER')} className="af-sidebar-link group">
                            <div className="af-sidebar-icon"><Truck size={20} /></div>
                            <span className="af-sidebar-text">Gestion Stations</span>
                        </div>
                        <div onClick={() => onNavigate(dashboardView)} className="af-sidebar-link group">
                            <div className="af-sidebar-icon"><Users size={20} /></div>
                            <span className="af-sidebar-text">Passagers</span>
                        </div>
                    </>
                )}

                {user.role === 'CLIENT' && (
                    <div onClick={() => onNavigate(dashboardView)} className="af-sidebar-link group">
                        <div className="af-sidebar-icon"><Briefcase size={20} /></div>
                        <span className="af-sidebar-text">Mes Voyages</span>
                    </div>
                )}

                {user.role === 'ADMIN' && (
                    <div onClick={() => onNavigate('ADMIN_VALIDATIONS')} className="af-sidebar-link group">
                        <div className="af-sidebar-icon"><ShieldCheck size={20} /></div>
                        <span className="af-sidebar-text">Validations</span>
                    </div>
                )}

                <div className="mt-auto border-t border-gray-600 pt-2"></div>

                <div onClick={() => onNavigate(user.role === 'ADMIN' ? 'ADMIN_PROFILE' : (user.role === 'COMPANY' ? 'COMPANY_PROFILE' : 'CLIENT_PROFILE'))} className="af-sidebar-link group">
                    <div className="af-sidebar-icon"><Wrench size={20} /></div>
                    <span className="af-sidebar-text">Mon Profil</span>
                </div>

                <div onClick={onLogout} className="af-sidebar-link hover:bg-[#e8112d] group mt-2">
                    <div className="af-sidebar-icon"><LogOut size={20} /></div>
                    <span className="af-sidebar-text">Déconnexion</span>
                </div>
            </div>
        </aside>
    );
};