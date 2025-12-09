import React, { useState } from 'react';
import { X, Shield, FileText, Lock, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';

interface SettingsModalProps {
    onClose: () => void;
}



type SettingsView = 'MENU' | 'CGU' | 'PRIVACY' | 'SECURITY' | 'HELP';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [view, setView] = useState<SettingsView>('MENU');

    const settingsItems = [
        { id: 'CGU', icon: FileText, label: "Conditions Générales d'Utilisation", color: "blue" },
        { id: 'PRIVACY', icon: Lock, label: "Politique de Confidentialité", color: "green" },
        { id: 'SECURITY', icon: Shield, label: "Sécurité & Données", color: "purple" },
        { id: 'HELP', icon: HelpCircle, label: "Aide & Support", color: "orange" },
    ];

    const renderContent = () => {
        switch (view) {
            case 'CGU':
                return (
                    <div className="space-y-4 text-sm text-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg">Conditions Générales d'Utilisation</h3>
                        <p>Dernière mise à jour : 05 Décembre 2025</p>
                        <p>Bienvenue sur VoyageBj. En utilisant notre application, vous acceptez les présentes conditions.</p>
                        <h4 className="font-bold text-gray-800 mt-2">1. Objet</h4>
                        <p>VoyageBj est une plateforme de mise en relation entre voyageurs et compagnies de transport.</p>
                        <h4 className="font-bold text-gray-800 mt-2">2. Réservations</h4>
                        <p>Les réservations sont fermes et définitives après confirmation du paiement.</p>
                        <h4 className="font-bold text-gray-800 mt-2">3. Responsabilité</h4>
                        <p>VoyageBj n'est pas responsable des retards ou annulations imputables aux compagnies de transport.</p>
                    </div>
                );
            case 'PRIVACY':
                return (
                    <div className="space-y-4 text-sm text-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg">Politique de Confidentialité</h3>
                        <p>Nous accordons une grande importance à la protection de vos données personnelles.</p>
                        <h4 className="font-bold text-gray-800 mt-2">Données collectées</h4>
                        <p>Nous collectons votre nom, email, numéro de téléphone pour le bon fonctionnement du service.</p>
                        <h4 className="font-bold text-gray-800 mt-2">Utilisation</h4>
                        <p>Vos données servent uniquement à gérer vos réservations et améliorer notre service.</p>
                    </div>
                );
            case 'SECURITY':
                return (
                    <div className="space-y-4 text-sm text-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg">Sécurité & Données</h3>
                        <p>Toutes les transactions sont sécurisées et chiffrées.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Chiffrement SSL/TLS</li>
                            <li>Paiements sécurisés via partenaires agréés</li>
                            <li>Protection contre la fraude</li>
                        </ul>
                    </div>
                );
            case 'HELP':
                return (
                    <div className="space-y-4 text-sm text-gray-600">
                        <h3 className="font-bold text-gray-900 text-lg">Aide & Support</h3>
                        <p>Besoin d'aide ? Notre équipe est là pour vous.</p>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="font-bold text-gray-900">Service Client</p>
                            <p>Email: support@voyagebj.com</p>
                            <p>Tél: +229 97 00 00 00</p>
                            <p>Dispo: 24/7</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 text-blue-600';
            case 'green': return 'bg-green-50 text-green-600';
            case 'purple': return 'bg-purple-50 text-purple-600';
            case 'orange': return 'bg-orange-50 text-orange-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        {view !== 'MENU' && (
                            <button onClick={() => setView('MENU')} className="p-1.5 -ml-2 rounded-full hover:bg-white text-gray-500 hover:text-gray-900 transition-all">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-xl font-black text-gray-900">
                            {view === 'MENU' ? 'Paramètres' : 'Retour'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {view === 'MENU' ? (
                        <div className="space-y-3">
                            {settingsItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setView(item.id as SettingsView)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${getColorClasses(item.color)}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {renderContent()}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 text-center text-xs text-gray-400 font-medium border-t border-gray-100 shrink-0">
                    VoyageBj v1.0.0 • Fait avec ❤️ au Bénin
                </div>
            </div>
        </div>
    );
};
