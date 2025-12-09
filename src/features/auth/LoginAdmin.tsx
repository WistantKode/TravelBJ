
import React, { useState } from 'react';
import { User, ViewState, UserRole } from '../../shared/types';
import { getUsers, saveUser, setCurrentUser } from '../../shared/services/storage';
import { Eye, EyeOff, Shield, Lock, ArrowRight, ShieldCheck, User as UserIcon, ArrowLeft } from 'lucide-react';

interface Props {
    onNavigate: (view: ViewState, params?: any) => void;
    notify: (msg: string, type: 'success' | 'error' | 'info') => void;
    setUser: (user: User) => void;
}

export const LoginAdmin: React.FC<Props> = ({ onNavigate, notify, setUser }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'VoyageBj@25benin') {
            const adminUser: User = {
                id: 'admin', name: 'Administrateur', email: 'admin@voyagebj.com', role: UserRole.ADMIN,
                description: ''
            };
            setCurrentUser(adminUser);
            setUser(adminUser);
            onNavigate('DASHBOARD_ADMIN');
            notify('Mode Admin activé.', 'success');
        } else notify("Mot de passe incorrect.", 'error');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-emerald-50 to-red-50">
            <div className="border border-gray-200 shadow-lg rounded-3xl p-8 md:p-12 w-full max-w-md bg-white">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-red-100 to-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                        <ShieldCheck className="text-[#e8112d]" size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Connexion Admin</h2>
                    <p className="text-gray-600 font-medium">Accédez au panneau d'administration</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Identifiant</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input type="text" className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#e9b400] transition-colors placeholder-gray-400" placeholder="Ex: admin" value="admin" readOnly />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input type={showPassword ? "text" : "password"} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-[#e9b400] transition-colors placeholder-gray-400" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 z-10">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button className="w-full bg-[#e8112d] hover:bg-[#c00e25] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95">CONNEXION</button>
                </form>
                <button onClick={() => onNavigate('LANDING')} className="mt-8 text-center w-full text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center justify-center gap-2"><ArrowLeft size={14} /> Retour au site</button>
            </div>
        </div>
    );
};