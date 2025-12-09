import React from 'react';
import { LayoutDashboard, MapPin, User, Ticket, Truck, Users, HelpCircle, Shield, Briefcase, Settings } from 'lucide-react';
import { User as UserType } from '../types';

interface BottomNavProps {
    user: UserType;
    activeTab: string;
    onTabChange: (tab: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ user, activeTab, onTabChange }) => {

    const renderNavItem = (id: string, label: string, icon: React.ReactNode) => {
        const isActive = activeTab === id;
        return (
            <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${isActive ? 'text-[#008751] -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-50 shadow-sm' : 'bg-transparent'}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, {
                        size: 24,
                        strokeWidth: isActive ? 2.5 : 2,
                        className: 'transition-all duration-300'
                    })}
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                    {label}
                </span>
            </button>
        );
    };

    const getNavItems = () => {
        if (user.role === 'CLIENT') {
            return [
                { id: 'dashboard', label: 'Mon bord', icon: <LayoutDashboard /> },
                { id: 'browse', label: 'Réserver', icon: <MapPin /> },
                { id: 'tickets', label: 'Tickets', icon: <Ticket /> },
                { id: 'settings', label: 'Paramètres', icon: <Settings /> },
            ];
        }

        if (user.role === 'COMPANY') {
            return [
                { id: 'overview', label: 'Tableau', icon: <LayoutDashboard /> },
                { id: 'stations', label: 'Stations', icon: <Truck /> },
                { id: 'reservations', label: 'Réservations', icon: <Users /> },
                { id: 'settings', label: 'Paramètres', icon: <Settings /> },
            ];
        }

        if (user.role === 'ADMIN') {
            return [
                { id: 'dashboard', label: 'Tableau', icon: <Shield /> },
                { id: 'profile', label: 'Profil', icon: <User /> },
                { id: 'settings', label: 'Paramètres', icon: <Settings /> },
            ];
        }

        return [];
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around max-w-md mx-auto px-2">
                {getNavItems().map(item => renderNavItem(item.id, item.label, item.icon))}
            </div>
        </div>
    );
};
