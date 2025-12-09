import React, { useState } from 'react';
import { UserRole, User, ViewState } from '../../shared/types';
import { getUsers, saveUser, setCurrentUser } from '../../shared/services/storage';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
    onNavigate: (view: ViewState, params?: any) => void;
    notify: (msg: string, type: 'success' | 'error' | 'info') => void;
    setUser: (user: User) => void;
}

export const LoginVoyageur: React.FC<Props> = ({ onNavigate, notify, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const users = getUsers();
        const found = users.find(u => u.email === email && u.role === UserRole.CLIENT);
        if (found) {
            setCurrentUser(found);
            setUser(found);
            onNavigate('DASHBOARD_CLIENT');
            notify(`Bienvenue ${found.name} !`, 'success');
        } else notify("Identifiants incorrects.", 'error');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-emerald-50 to-red-50">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 w-full max-w-md shadow-lg">
                <form className="w-full flex flex-col items-center text-center" onSubmit={handleLogin}>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Connexion Voyageur</h2>
                    <p className="text-gray-700 font-medium mb-8 text-sm">Accédez à votre espace personnel</p>

                    <input className="neu-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <div className="pwd-wrapper">
                        <input className="neu-input w-full" type={showPwd ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="pwd-eye">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>

                    <button type="submit" className="neu-button bg-lime mt-8">SE CONNECTER</button>

                    <div className="mt-6 flex flex-col gap-2">
                        <button type="button" onClick={() => onNavigate('SIGNUP_VOYAGEUR')} className="text-sm font-bold text-[#008751] hover:underline">Pas encore de compte ? Créer un compte</button>
                        <button type="button" onClick={() => onNavigate('LANDING')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors"><ArrowLeft size={12} /> Retour à l'accueil</button>
                    </div>
                </form>
            </div>
        </div>
    );
};