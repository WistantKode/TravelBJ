import React, { useState } from 'react';
import { UserRole, User, ViewState } from '../../shared/types';
import { saveUser, setCurrentUser } from '../../shared/services/storage';
import { Eye, EyeOff, ArrowLeft, Camera, ChevronRight } from 'lucide-react';
import { compressImage } from '../../shared/utils/imageUtils';
import { NotifyFunc } from '../../App';

interface Props {
    onNavigate: (view: ViewState, params?: any) => void;
    notify: NotifyFunc;
    setUser: (user: User) => void;
}

export const SignupVoyageur: React.FC<Props> = ({ onNavigate, notify, setUser }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', phone: '', npi: '', email: '', password: '', confirmPassword: '', avatarUrl: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return notify('Mots de passe différents.', 'error');
        if (!form.name || !form.phone || !form.npi || !form.email || !form.password) {
            return notify("Tous les champs sont obligatoires.", "error");
        }

        const newUser: User = {
            id: crypto.randomUUID(), name: form.name, email: form.email, phone: form.phone, npi: form.npi, role: UserRole.CLIENT,
            avatarUrl: form.avatarUrl || `https://ui-avatars.com/api/?name=${form.name}&background=random`,
            description: ''
        };
        try {
            saveUser(newUser);
            setCurrentUser(newUser);
            setUser(newUser);
            onNavigate('DASHBOARD_CLIENT');
            notify('Compte créé !', 'success');
        }
        catch (err: any) { notify("Erreur création compte.", "error"); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024 * 5) { // 5MB limit
                notify('Fichier trop volumineux (Max 5Mo).', 'error');
                return;
            }
            try {
                const compressedBase64 = await compressImage(file);
                setForm(prev => ({ ...prev, avatarUrl: compressedBase64 }));
            } catch (error) {
                console.error("Compression error", error);
                notify("Erreur lors du traitement de l'image.", "error");
            }
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-50 via-emerald-50 to-red-50">

            <div className="bg-white/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-[90%] sm:max-w-md md:max-w-lg shadow-lg z-10 backdrop-blur-sm">

                <form className="w-full flex flex-col items-center text-center" onSubmit={handleRegister}>
                    {/* Typographie responsive */}
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Créer un Compte</h2>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-4">Commencez votre voyage avec VoyageBj</p>

                    <div className="flex gap-1 mb-6">
                        {[1, 2].map(n => (<div key={n} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${n <= step ? 'bg-[#008751]' : 'bg-gray-300'}`}></div>))}
                    </div>

                    {step === 1 && (
                        <div className="animate-slide-right w-full flex flex-col items-center gap-3 sm:gap-4">
                            <label className="cursor-pointer block mb-2 w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center overflow-hidden group bg-[#f0f4f8] hover:opacity-90 transition-opacity">
                                {form.avatarUrl ? <img src={form.avatarUrl} className="w-full h-full object-cover" alt="Avatar" /> : <Camera className="text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />}
                                <input type="file" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {/* Ajout de w-full pour garantir l'étirement sur mobile */}
                            <input className="neu-input w-full text-sm sm:text-base py-2.5" type="text" placeholder="Nom & Prénom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <input className="neu-input w-full text-sm sm:text-base py-2.5" type="tel" placeholder="Numéro de Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                            <input className="neu-input w-full text-sm sm:text-base py-2.5" type="text" placeholder="NPI (Carte d'identité)" value={form.npi} onChange={(e) => setForm({ ...form, npi: e.target.value })} required />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slide-right w-full flex flex-col items-center gap-3 sm:gap-4">
                            <input className="neu-input w-full text-sm sm:text-base py-2.5" type="email" placeholder="Adresse Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            <div className="pwd-wrapper relative w-full">
                                <input className="neu-input w-full text-sm sm:text-base py-2.5 pr-10" type={showPwd ? "text" : "password"} placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="pwd-eye absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                            <div className="pwd-wrapper relative w-full">
                                <input className="neu-input w-full text-sm sm:text-base py-2.5 pr-10" type={showConfirmPwd ? "text" : "password"} placeholder="Confirmer mot de passe" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="pwd-eye absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">{showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>
                    )}

                    <div className="flex w-full gap-3 sm:gap-4 mt-6 sm:mt-8">
                        {step > 1 && (<button type="button" onClick={() => setStep(step - 1)} className="neu-button secondary flex-1 flex items-center justify-center gap-2 text-sm sm:text-base"><ArrowLeft size={16} /> Retour</button>)}
                        {step < 2 ? (
                            <button type="button" onClick={() => setStep(step + 1)} className="neu-button bg-lime w-full flex items-center justify-center gap-2 text-sm sm:text-base">Suivant <ChevronRight size={16} /></button>
                        ) : (
                            <button type="submit" className="neu-button bg-lime flex-1 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all">S'INSCRIRE</button>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 w-full">
                        <button type="button" onClick={() => onNavigate('LOGIN_VOYAGEUR')} className="text-sm font-bold text-[#008751] hover:underline p-2">Déjà un compte ? Se connecter</button>
                        <button type="button" onClick={() => onNavigate('LANDING')} className="text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors p-2"><ArrowLeft size={14} /> Retour à l'accueil</button>
                    </div>
                </form>
            </div>
        </div>
    );
};