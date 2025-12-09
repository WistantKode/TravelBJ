import React, { useState } from 'react';
import { UserRole, User, ViewState } from '../../shared/types';
import { saveUser, setCurrentUser } from '../../shared/services/storage';
import { Eye, EyeOff, ArrowLeft, ChevronRight, Upload, FileText, Check, Lock, Phone, MapPin } from 'lucide-react';
import { compressImage } from '../../shared/utils/imageUtils';
import { NotifyFunc } from '../../App';

interface Props {
    onNavigate: (view: ViewState, params?: any) => void;
    notify: NotifyFunc;
    setUser: (user: User | null) => void;
}

export const SignupCompany: React.FC<Props> = ({ onNavigate, notify, setUser }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '', phone: '', npi: '', email: '', password: '', confirmPassword: '',
        companyName: '', ifu: '', rccm: '', whatsapp: '', location: '',
        avatarUrl: '', bannerUrl: '', anattUrl: '', otherDocsUrl: ''
    });
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // Progression de validation à l'inscription d'une compagnie: avec blocage du input suivant si le précédent n'est pas renseigné
    const isFieldUnlocked = (fieldName: string): boolean => {
        const fieldOrder = ['name', 'email', 'password', 'confirmPassword', 'companyName', 'ifu', 'rccm', 'whatsapp', 'location', 'phone', 'npi'];
        const currentIndex = fieldOrder.indexOf(fieldName);
        if (currentIndex === 0) return true; 

        // Check if all previous fields are filled
        for (let i = 0; i < currentIndex; i++) {
            const prevField = fieldOrder[i] as keyof typeof form;
            if (!form[prevField] || form[prevField].trim() === '') {
                return false;
            }
        }
        return true;
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return notify('Mots de passe différents.', 'error');

        // Validation: tous les champs sont obligatoires
        if (!form.companyName || !form.name || !form.phone || !form.npi || !form.ifu || !form.rccm ||
            !form.email || !form.password || !form.whatsapp || !form.location) {
            return notify("Tous les champs sont obligatoires.", "error");
        }
        if (!form.anattUrl) return notify("L'attestation ANaTT est obligatoire à la soumission de votre dossier d'inscription.", "error");

        const newUser: User = {
            id: crypto.randomUUID(),
            name: form.name,
            companyName: form.companyName,
            email: form.email,
            phone: form.phone,
            npi: form.npi,
            role: UserRole.COMPANY,
            avatarUrl: form.avatarUrl || `https://ui-avatars.com/api/?name=${form.companyName}&background=random`,
            bannerUrl: form.bannerUrl || `https://picsum.photos/seed/${form.companyName}/800/300`,
            ifu: form.ifu,
            rccm: form.rccm,
            whatsapp: form.whatsapp,
            address: form.location, // Using address field for location
            anattUrl: form.anattUrl,
            otherDocsUrl: form.otherDocsUrl,
            status: 'PENDING',
            description: ''
        };

        try {
            saveUser(newUser);
            notify("Votre dossier à été revu et est en cours d'étude. Revenez après quelques temps.", 'success');
            setCurrentUser(null);
            setUser(null);
            setTimeout(() => {
                onNavigate('LANDING');
            }, 6000);
        }
        catch (err: any) { notify("Erreur inscription.", "error"); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024 * 5) {
                notify('Fichier trop volumineux (Max 5Mo).', 'error');
                return;
            }
            try {
                const compressedBase64 = await compressImage(file);
                setForm(prev => ({ ...prev, [field]: compressedBase64 }));
            } catch (error) {
                console.error("Compression error", error);
                notify("Erreur lors du traitement de l'image.", "error");
            }
        }
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'anattUrl' | 'otherDocsUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024 * 2) {
                notify('Fichier trop volumineux (Max 2MB).', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, [field]: reader.result as string }));
                notify(`Document "${file.name}" ajouté.`, 'info');
            };
            reader.onerror = () => {
                notify('Erreur lors du chargement du fichier.', 'error');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-50 via-emerald-50 to-red-50">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-lg shadow-lg">
                <form className="w-full flex flex-col items-center text-center" onSubmit={handleRegister}>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2 font-heading">Bienvenue à VoyageBj</h1>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2 font-heading">Enregistrer ma compagnie</h2>
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4].map(n => (<div key={n} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${n <= step ? 'bg-[#e9b400]' : 'bg-gray-300'}`}></div>))}
                    </div>

                    {step === 1 && (
                        <div className="animate-slide-right w-full flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-600 mb-4">Identité Visuelle</h3>
                            <div className="flex gap-4 mb-4">
                                <label className="cursor-pointer w-20 h-20 rounded-xl shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center overflow-hidden bg-[#f0f4f8] hover:bg-gray-200 transition-colors">
                                    {form.avatarUrl ? <img src={form.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 font-bold">Logo</span>}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatarUrl')} />
                                </label>
                                <label className="cursor-pointer w-40 h-20 rounded-xl shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center overflow-hidden bg-[#f0f4f8] hover:bg-gray-200 transition-colors">
                                    {form.bannerUrl ? <img src={form.bannerUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 font-bold">Bannière</span>}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerUrl')} />
                                </label>
                            </div>

                            {/* Progression lors de l'inscription */}
                            <div className="relative w-full">
                                <input className="neu-input" type="text" placeholder="Nom du Gérant *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                {!isFieldUnlocked('name') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <input className="neu-input" type="email" placeholder="Email Professionnel *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!isFieldUnlocked('email')} />
                                {!isFieldUnlocked('email') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="pwd-wrapper">
                                <input className="neu-input w-full" type={showPwd ? "text" : "password"} placeholder="Mot de passe *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={!isFieldUnlocked('password')} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="pwd-eye" disabled={!isFieldUnlocked('password')}>{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                {!isFieldUnlocked('password') && <Lock className="absolute right-12 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="pwd-wrapper">
                                <input className="neu-input w-full" type={showConfirmPwd ? "text" : "password"} placeholder="Confirmer mot de passe *" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required disabled={!isFieldUnlocked('confirmPassword')} />
                                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="pwd-eye" disabled={!isFieldUnlocked('confirmPassword')}>{showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                {!isFieldUnlocked('confirmPassword') && <Lock className="absolute right-12 top-3 text-gray-400" size={16} />}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slide-right w-full flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-600 mb-4">Informations Compagnie</h3>

                            <div className="relative w-full">
                                <input className="neu-input" type="text" placeholder="Nom de la Compagnie *" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required disabled={!isFieldUnlocked('companyName')} />
                                {!isFieldUnlocked('companyName') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <input className="neu-input" type="text" placeholder="L'IFU de la Compagnie*" value={form.ifu} onChange={(e) => setForm({ ...form, ifu: e.target.value })} required disabled={!isFieldUnlocked('ifu')} />
                                {!isFieldUnlocked('ifu') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <input className="neu-input" type="text" placeholder="Le numéro RCCM de la Compagnie*" value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })} required disabled={!isFieldUnlocked('rccm')} />
                                {!isFieldUnlocked('rccm') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-slide-right w-full flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-600 mb-4">Contact & Localisation</h3>

                            <div className="relative w-full">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input className="neu-input pl-10" type="tel" placeholder="Renseignez votre contact WhatsApp *" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required disabled={!isFieldUnlocked('whatsapp')} />
                                {!isFieldUnlocked('whatsapp') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input className="neu-input pl-10" type="text" placeholder="Adresse Physique *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required disabled={!isFieldUnlocked('location')} />
                                {!isFieldUnlocked('location') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input className="neu-input pl-10" type="tel" placeholder="Téléphone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required disabled={!isFieldUnlocked('phone')} />
                                {!isFieldUnlocked('phone') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>

                            <div className="relative w-full">
                                <input className="neu-input" type="text" placeholder="L'NPI du gérant *" value={form.npi} onChange={(e) => setForm({ ...form, npi: e.target.value })} required disabled={!isFieldUnlocked('npi')} />
                                {!isFieldUnlocked('npi') && <Lock className="absolute right-3 top-3 text-gray-400" size={16} />}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-slide-right w-full flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-600 mb-2">Documents Requis</h3>
                            <p className="text-xs text-gray-500 mb-6 max-w-xs">Veuillez télécharger les versions PDF ou Image de vos documents officiels.</p>

                            <div className="w-full max-w-sm space-y-4">
                                <div className="relative">
                                    <label className={`block w-full p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3 ${form.anattUrl ? 'border-[#008751] bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                                        <div className={`p-2 rounded-full ${form.anattUrl ? 'bg-[#008751] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {form.anattUrl ? <Check size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div className="text-left flex-1 overflow-hidden">
                                            <p className="font-bold text-sm text-gray-800">Attestation ANaTT *</p>
                                            <p className="text-xs text-gray-500 truncate">{form.anattUrl ? "Document ajouté" : "Cliquer pour télécharger"}</p>
                                        </div>
                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload(e, 'anattUrl')} />
                                    </label>
                                </div>

                                <div className="relative">
                                    <label className={`block w-full p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3 ${form.otherDocsUrl ? 'border-[#e9b400] bg-yellow-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
                                        <div className={`p-2 rounded-full ${form.otherDocsUrl ? 'bg-[#e9b400] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {form.otherDocsUrl ? <Check size={20} /> : <Upload size={20} />}
                                        </div>
                                        <div className="text-left flex-1 overflow-hidden">
                                            <p className="font-bold text-sm text-gray-800">Autres Pièces (Optionnel)</p>
                                            <p className="text-xs text-gray-500 truncate">{form.otherDocsUrl ? "Document ajouté" : "Statuts, Registre..."}</p>
                                        </div>
                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload(e, 'otherDocsUrl')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8 w-full justify-center">
                        {step > 1 && (<button type="button" onClick={() => setStep(step - 1)} className="neu-button secondary w-auto px-6"><ArrowLeft size={16} /> Retour</button>)}
                        {step < 4 ? (
                            <button type="button" onClick={() => setStep(step + 1)} className="neu-button bg-yellow w-auto px-8">Suivant <ChevronRight size={16} /></button>
                        ) : (
                            <button type="submit" className="neu-button bg-lime w-auto px-8 shadow-lg shadow-green-200/50">SOUMETTRE</button>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <button type="button" onClick={() => onNavigate('LOGIN_COMPANY')} className="text-sm font-bold text-[#e9b400] hover:underline">Déjà enregistré ? Connectez-vous ici</button>
                        <button type="button" onClick={() => onNavigate('LANDING')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors"><ArrowLeft size={12} /> Retour à l'accueil</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


