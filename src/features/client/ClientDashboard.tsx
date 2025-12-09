
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Station, Reservation, ViewState } from '../../shared/types';
import { getStations, getReservations, createReservation, getUsers, saveUser } from '../../shared/services/storage';
import {
    MapPin, Search, Calendar, Clock, User as UserIcon, Settings, LogOut,
    ChevronRight, Star, Shield, Bus, ArrowRight, X, CreditCard, CheckCircle, FileText, Download, Ticket as TicketIcon,
    Camera, Mail, Phone, ChevronLeft
} from 'lucide-react';
import { NotifyFunc } from '../../App';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
import { BottomNav } from '../../shared/components/BottomNav';
import { Ticket } from '../../shared/components/Ticket';
import { SettingsModal } from '../../shared/components/SettingsModal';

interface Props {
    user: User;
    notify: NotifyFunc;
    onNavigate: (view: ViewState, params?: any) => void;
}

export const ClientDashboard: React.FC<Props> = ({ user, notify, onNavigate }) => {
    const [view, setView] = useState<'dashboard' | 'browse' | 'company_profile' | 'profile' | 'tickets' | 'settings'>('dashboard');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [allStations, setAllStations] = useState<Station[]>([]);
    const [companies, setCompanies] = useState<User[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);

    const [bookingStation, setBookingStation] = useState<Station | null>(null);
    const [bookingForm, setBookingForm] = useState({ name: user.name, email: user.email, phone: user.phone || '', date: '', timeIndex: '', ticketClass: 'STANDARD' as 'STANDARD' | 'PREMIUM' });
    const [profileForm, setProfileForm] = useState<Partial<User>>(user);

    const [viewingTicket, setViewingTicket] = useState<Reservation | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    const location = useLocation();

    useEffect(() => {
        refreshData();
    }, [user.id]);

    useEffect(() => {
        // Check for booking redirect
        const state = location.state as { bookingRouteId?: string } | null;
        if (state?.bookingRouteId && allStations.length > 0) {
            const route = allStations.find(s => s.id === state.bookingRouteId);
            if (route) {
                setBookingStation(route);
                setBookingForm(prev => ({ ...prev, date: '', timeIndex: '', ticketClass: 'STANDARD' }));
                // Clean up state to prevent reopening on refresh (optional but good practice)
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, allStations]);

    useEffect(() => {
        // Défiler vers le haut lors du changement de vue
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [view]);

    const refreshData = () => {
        const stations = getStations();
        setAllStations(stations);
        setCompanies(getUsers().filter(u => u.role === 'COMPANY' && u.status === 'APPROVED'));
        setMyReservations(getReservations().filter(r => r.clientId === user.id));
    };

    // Gestion du changement de date et validation des jours de disponibilité
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateVal = e.target.value;
        if (!bookingStation) return;

        const dayIndex = new Date(dateVal).getDay(); // 0 = Dimanche, 1 = Lundi...
        const jsDayToMockDayMap: { [key: number]: string } = {
            1: "Lun", 2: "Mar", 3: "Mer", 4: "Jeu", 5: "Ven", 6: "Sam", 0: "Dim"
        };

        const selectedDayName = jsDayToMockDayMap[dayIndex];

        if (bookingStation.workDays && bookingStation.workDays.length > 0 && !bookingStation.workDays.includes(selectedDayName)) {
            notify(`Trajet indisponible le ${selectedDayName}. Jours disponibles: ${bookingStation.workDays.join(', ')}.`, "error");
            setBookingForm({ ...bookingForm, date: '' });
            return;
        }

        setBookingForm({ ...bookingForm, date: dateVal });
    };

    // Gestion de la réservation
    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingStation || !bookingForm.timeIndex) return;

        const timeIdx = parseInt(bookingForm.timeIndex);
        const depTime = bookingStation.departureHours?.[timeIdx] || '00:00';

        const basePrice = bookingStation.price || 0;
        const price = bookingForm.ticketClass === 'PREMIUM' ? (bookingStation.pricePremium || basePrice * 1.5) : basePrice;

        const reservation: Reservation = {
            id: crypto.randomUUID(),
            stationId: bookingStation.id,
            companyId: bookingStation.companyId,
            clientId: user.id,
            clientName: bookingForm.name,
            clientEmail: bookingForm.email,
            clientPhone: bookingForm.phone,
            routeSummary: `${bookingStation.pointA} vers ${bookingStation.pointB} `,
            departureDate: bookingForm.date,
            departureTime: depTime,
            pricePaid: price,
            ticketClass: bookingForm.ticketClass,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        try {
            createReservation(reservation);
            setBookingStation(null);
            notify(`Réservation confirmée avec ${bookingStation.companyName} `, "success");
            refreshData();
            setView('dashboard');
            setViewingTicket(reservation);
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    // Mise à jour du profil utilisateur
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (profileForm.id) {
            try {
                saveUser(profileForm as User);
                notify("Profil mis à jour avec succès", "success");
            } catch (err: any) {
                notify(err.message || "Erreur lors de la sauvegarde", "error");
            }
        }
    };

    // Gestion du téléchargement de la photo de profil
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 700) {
                notify("L'image est trop lourde (Max 700Ko).", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfileForm(prev => ({ ...prev, avatarUrl: base64 }));
                if (user.id) {
                    const updatedUser = { ...user, ...profileForm, avatarUrl: base64 } as User;
                    try {
                        saveUser(updatedUser);
                        notify("Photo de profil mise à jour !", "success");
                    } catch (err: any) {
                        notify(err.message || "Impossible de sauvegarder l'image", "error");
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Fonction pour télécharger le ticket en Image (PNG)
    const downloadTicketImage = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff', // Force le fond blanc
                logging: false,
                allowTaint: false
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `VoyageBj - Ticket - ${viewingTicket?.id.substring(0, 8)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            notify("Ticket téléchargé en image !", "success");
        } catch (e: any) {
            console.error(e);
            notify("Erreur lors du téléchargement de l'image", "error");
        }
    };

    // Fonction pour télécharger le ticket en PDF
    const downloadTicketPDF = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: false
            });
            const imgData = canvas.toDataURL('image/png');

            // Configuration PDF (Paysage car le ticket est large)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculer les dimensions pour faire tenir l'image
            const ratio = imgProps.width / imgProps.height;
            let finalWidth = pdfWidth - 20; // Marge de 10mm
            let finalHeight = finalWidth / ratio;

            if (finalHeight > pdfHeight - 20) {
                finalHeight = pdfHeight - 20;
                finalWidth = finalHeight * ratio;
            }

            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`VoyageBj - Ticket - ${viewingTicket?.id.substring(0, 8)}.pdf`);
            notify("Ticket téléchargé en PDF !", "success");
        } catch (e) {
            console.error(e);
            notify("Erreur lors du téléchargement du PDF", "error");
        }
    };

    const renderProfile = () => (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#008751] to-[#006b40] px-8 py-10 text-white text-center relative">
                    <h2 className="text-2xl font-bold relative z-10">Mon Profil</h2>
                    <p className="text-green-100 text-sm mt-1 relative z-10">Gérez vos informations personnelles</p>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex justify-center -mt-20 mb-8 relative z-10">
                            <div className="relative group cursor-pointer inline-block">
                                <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-100">
                                    <img
                                        src={profileForm.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=008751&color=fff`}
                                        className="w-full h-full object-cover"
                                        alt="Profil"
                                    />
                                </div >
                                <label className="absolute bottom-1 right-1 bg-[#008751] hover:bg-[#006b40] text-white p-2.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 border-2 border-white">
                                    <Camera size={16} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                            </div >
                        </div >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Nom Complet</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3.5 pl-11 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all font-medium text-base" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" disabled className="w-full rounded-2xl border border-gray-200 bg-gray-100 p-3.5 pl-11 text-gray-500 cursor-not-allowed font-medium text-base" value={profileForm.email || ''} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Numéro NPI</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3.5 pl-11 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all font-medium text-base" value={profileForm.npi || ''} onChange={e => setProfileForm({ ...profileForm, npi: e.target.value })} placeholder="Identifiant unique" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="tel" className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3.5 pl-11 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all font-medium text-base" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+229..." />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-[#008751] hover:bg-[#006b40] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <CheckCircle size={20} /> Enregistrer
                            </button>
                        </div>
                    </form >
                </div >
            </div >
        </div >
    );

    const renderDashboard = () => (
        <div className="animate-fade-in space-y-8">
            {/* Header Section */}
            <div className="bg-[#008751] rounded-3xl p-8 text-white shadow-xl shadow-green-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2">Bonjour, {user.name.split(' ')[0]} 👋</h1>
                    <p className="text-green-100 font-medium text-lg">Prêt pour votre prochain voyage ?</p>

                    <button
                        onClick={() => setView('browse')}
                        className="mt-6 bg-white text-[#008751] px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Search size={20} strokeWidth={2.5} />
                        Rechercher un trajet
                    </button>
                </div>
            </div>

            {/* Section Contenu */}
            <div>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="text-[#008751]" size={24} />
                        Mes Derniers Voyages
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {myReservations.length > 0 ? (
                        myReservations.map(res => (
                            <div key={res.id} className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-green-50 text-[#008751] text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Confirmé</div>
                                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#008751] group-hover:text-white transition-colors">
                                            <Bus size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{res.routeSummary}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-[#008751]" /> {new Date(res.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-[#008751]" /> {res.departureTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Prix</p>
                                            <p className="font-black text-lg text-[#008751]">{res.pricePaid.toLocaleString()} FCFA</p>
                                        </div>
                                        <button
                                            onClick={() => setViewingTicket(res)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            <Download size={18} /> Ticket
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <Bus size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Aucun voyage pour le moment</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-6 text-sm">Votre historique de voyage apparaîtra ici une fois que vous aurez effectué une réservation.</p>
                            <button
                                onClick={() => setView('browse')}
                                className="px-6 py-3 bg-[#008751] text-white rounded-xl font-bold hover:bg-[#006b40] shadow-lg shadow-green-100 transition-all text-sm"
                            >
                                Trouver un trajet
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderBrowse = () => (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('dashboard')}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors border border-gray-100 shrink-0"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Compagnies</h2>
                        <p className="text-gray-500 font-medium text-sm">Sélectionnez une agence pour voir les départs.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                    <div
                        key={company.id}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                        onClick={() => { setSelectedCompanyId(company.id); setView('company_profile'); }}
                    >
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            {company.bannerUrl ? (
                                <img src={company.bannerUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Bannière" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Bus size={48} className="opacity-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <span className="bg-[#008751] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wide uppercase">Certifié</span>
                            </div>
                        </div>

                        <div className="p-6 pt-12 relative flex-1 flex flex-col">
                            <div className="absolute -top-10 left-6">
                                <img
                                    src={company.avatarUrl || `https://ui-avatars.com/api/?name=${company.companyName}&background=random`}
                                    alt={company.companyName}
                                    className="w-20 h-20 rounded-2xl object-cover border-[4px] border-white shadow-md bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{company.companyName}</h3>
                                {company.status === 'APPROVED' && (
                                    <div className="bg-blue-100 text-blue-600 p-1 rounded-full" title="Compagnie Vérifiée">
                                        <CheckCircle size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                {company.description || `Voyagez confortablement et en toute sécurité avec ${company.companyName} à travers tout le Bénin.`}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Réseau</span>
                                    <span className="text-gray-900 font-bold">{allStations.filter(s => s.companyId === company.id).length} Destinations</span>
                                </div>
                                <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#008751] group-hover:bg-[#008751] group-hover:text-white transition-colors">
                                    <ArrowRight size={20} />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCompanyProfile = () => {
        const company = companies.find(c => c.id === selectedCompanyId);
        const companyStations = allStations.filter(s => s.companyId === selectedCompanyId);

        return (
            <div className="animate-fade-in space-y-8">
                {/* En-tête Compagnie */}
                <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                    <div className="h-64 relative">
                        {company?.bannerUrl ? (
                            <img src={company.bannerUrl} className="w-full h-full object-cover opacity-70" alt="Bannière" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 opacity-70" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    </div>

                    <button
                        onClick={() => setView('browse')}
                        className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20 z-20"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center gap-6">
                        <img
                            src={company?.avatarUrl || `https://ui-avatars.com/api/?name=${company?.companyName}`}
                            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white object-cover"
                            alt="Logo"
                        />
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{company?.companyName}</h1>
                            <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <CheckCircle size={14} className="text-green-400" /> Agence Vérifiée
                                </span>
                                <span>{companyStations.length} Lignes actives</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des stations */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="w-1 h-6 bg-[#008751] rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-900">Trajets disponibles</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {companyStations.map(station => (
                            <div key={station.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group flex flex-col md:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden relative shrink-0">
                                    <img
                                        src={station.photoUrl || `https://source.unsplash.com/random/400x300/?bus,station`}
                                        alt={station.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm ${station.type === 'STATION' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                                            {station.type === 'STATION' ? 'GARE' : 'DIRECT'}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900 mb-1">{station.name}</h3>
                                                <p className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                                                    <MapPin size={14} /> {station.location}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 px-4 py-2 rounded-xl text-right border border-green-100 self-start">
                                                <span className="block font-black text-2xl text-[#008751]">{(station.price || 0).toLocaleString()} F</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
                                            <div className="flex items-center gap-3 text-gray-800 font-bold text-lg mb-2">
                                                <span className="text-[#008751]">{station.pointA}</span>
                                                <ArrowRight size={18} className="text-gray-400" />
                                                <span className="text-[#008751]">{station.pointB}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{station.description || "Profitez d'un voyage confortable dans nos bus climatisés."}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            {station.workDays.slice(0, 5).map(d => (
                                                <span key={d} className="text-xs bg-white border border-gray-200 text-gray-600 font-bold px-2.5 py-1.5 rounded-lg">
                                                    {d.substring(0, 3)}
                                                </span>
                                            ))}
                                            {station.workDays.length > 5 && <span className="text-xs text-gray-400 self-center font-medium">...</span>}
                                        </div>
                                        {station.type === 'ROUTE' && (
                                            <button
                                                onClick={() => { setBookingStation(station); setBookingForm({ ...bookingForm, date: '', timeIndex: '', ticketClass: 'STANDARD' }); }}
                                                className="w-full sm:w-auto px-8 py-3 bg-[#008751] text-white rounded-xl font-bold hover:bg-[#006b40] shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                            >
                                                Réserver <ArrowRight size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTickets = () => (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-[#008751]" size={24} />
                Mes Tickets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myReservations.length > 0 ? (
                    myReservations.map(res => (
                        <div key={res.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                            <div className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">{res.routeSummary}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${res.ticketClass === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {res.ticketClass}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} /> {res.departureDate} à {res.departureTime}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <Bus size={14} /> {companies.find(c => c.id === res.companyId)?.companyName || 'Compagnie'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => setViewingTicket(res)}
                                    className="bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-black transition-colors text-xs font-bold flex flex-col items-center gap-1"
                                >
                                    <TicketIcon size={16} />
                                    Ticket Réservation
                                </button>
                                <button
                                    onClick={() => {
                                        if (res.status === 'COMPLETED') {
                                            setViewingTicket(res); // In a real app, this might be a different ticket object
                                        } else {
                                            notify("Le voyage doit être marqué comme 'Payé & Arrivé' par la compagnie.", "info");
                                        }
                                    }}
                                    disabled={res.status !== 'COMPLETED'}
                                    className={`py-3 px-4 rounded-xl transition-colors text-xs font-bold flex flex-col items-center gap-1 border ${res.status === 'COMPLETED' ? 'bg-[#008751] text-white hover:bg-[#006b40] border-transparent' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                                >
                                    <CheckCircle size={16} />
                                    Ticket Destination
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">Aucun ticket disponible.</div>
                )}
            </div>
        </div>
    );

    const renderTicketModal = () => {
        if (!viewingTicket) return null;

        const station = allStations.find(s => s.id === viewingTicket.stationId);
        const depIndex = station?.departureHours?.indexOf(viewingTicket.departureTime) ?? 0;
        const arrivalTime = station?.arrivalHours?.[depIndex] || '--:--';
        const company = companies.find(c => c.id === viewingTicket.companyId);

        const origin = viewingTicket.routeSummary.split(' vers ')[0];
        const destination = viewingTicket.routeSummary.split(' vers ')[1];

        const ticketData = {
            id: viewingTicket.id,
            passengerName: viewingTicket.clientName,
            contact: viewingTicket.clientPhone,
            origin: origin,
            destination: destination,
            date: viewingTicket.departureDate,
            departureTime: viewingTicket.departureTime,
            arrivalTime: arrivalTime,
            price: viewingTicket.pricePaid,
            currency: 'FCFA',
            companyName: company?.companyName || 'VoyageBj',
            ticketClass: viewingTicket.ticketClass
        };

        return (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto">
                <div className="relative w-full max-w-3xl my-auto animate-scale-up">
                    {/* Bouton de fermeture amélioré */}
                    <button
                        onClick={() => setViewingTicket(null)}
                        className="absolute -top-14 right-0 md:-right-14 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm border-2 border-white/30 shadow-lg z-50 group"
                        title="Fermer"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <Ticket data={ticketData} />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">
            {/* En-tête mobile (Fixe) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm h-16">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#008751] rounded-xl flex items-center justify-center text-white shadow-md shadow-green-200">
                        <Bus size={18} />
                    </div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>
                        <span className="text-[#008751]">Voyage</span><span className="text-[#FCD116]">B</span><span className="text-[#E8112D]">j</span>
                    </h1>
                </div>
                <button onClick={() => setView('profile')} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" alt="Profil" />
                    ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500"><UserIcon size={16} /></div>
                    )}
                </button>
            </div>

            {/* Zone de contenu principal - CENTRÉ */}
            <main className="w-full max-w-5xl mx-auto p-4 pt-20 md:p-8 md:pt-10 pb-24 md:pb-12 min-h-screen flex flex-col">
                {view === 'dashboard' && renderDashboard()}
                {view === 'browse' && renderBrowse()}
                {view === 'company_profile' && renderCompanyProfile()}
                {view === 'profile' && renderProfile()}
                {view === 'tickets' && renderTickets()}
                {view === 'settings' && (
                    <>
                        {renderDashboard()}
                        <SettingsModal onClose={() => setView('dashboard')} />
                    </>
                )}
            </main>

            {/* Navigation inférieure */}
            <BottomNav user={user} activeTab={view} onTabChange={setView} />


            {/* Modal de réservation */}
            {
                bookingStation && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[50] p-0 md:p-4 animate-fade-in">
                        <div className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] animate-slide-up-mobile md:animate-scale-up">

                            {/* En-tête Modal */}
                            <div className="bg-[#008751] px-6 py-5 text-white relative shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Bus size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-wide">Réservation</h3>
                                        <p className="text-green-100 text-xs font-medium opacity-90">Veuillez compléter vos informations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setBookingStation(null)}
                                    className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Corps Modal */}
                            <div className="overflow-y-auto p-6 space-y-6">
                                {/* Carte Info Trajet */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#008751]/10 text-[#008751] text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                        {bookingStation.companyName}
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-900 font-black text-xl mb-1">
                                        {bookingStation.pointA}
                                        <ArrowRight size={20} className="text-gray-400" />
                                        {bookingStation.pointB}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {bookingStation.workDays?.map(day => (
                                            <span key={day} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase">{day.substring(0, 3)}</span>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleBook} className="space-y-6">
                                    {/* Info Passager */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <UserIcon size={14} /> Informations Passager
                                        </h4>
                                        <div className="space-y-3">
                                            <input type="text" required className="w-full rounded-2xl border-gray-200 bg-gray-50 border p-4 text-base font-semibold focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all" value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })} placeholder="Nom complet" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="tel" required className="w-full rounded-2xl border-gray-200 bg-gray-50 border p-4 text-base font-semibold focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all" value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })} placeholder="Téléphone" />
                                                <input type="email" required className="w-full rounded-2xl border-gray-200 bg-gray-50 border p-4 text-base font-semibold focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all" value={bookingForm.email} onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })} placeholder="Email" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date & Heure */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <Calendar size={14} /> Date et Heure
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full rounded-2xl border-gray-200 bg-gray-50 border p-4 text-base font-semibold focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all appearance-none"
                                                    value={bookingForm.date}
                                                    onChange={handleDateChange}
                                                />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full rounded-2xl border-gray-200 bg-gray-50 border p-4 text-base font-semibold focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all appearance-none"
                                                    value={bookingForm.timeIndex}
                                                    onChange={e => setBookingForm({ ...bookingForm, timeIndex: e.target.value })}
                                                    disabled={!bookingForm.date}
                                                >
                                                    <option value="">Heure...</option>
                                                    {(bookingStation.departureHours || []).map((h, idx) => (
                                                        <option key={idx} value={idx}>{h}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <Clock size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Classe Billet */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <CreditCard size={14} /> Type de Billet
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <label className={`relative flex items-center justify-between border-2 rounded-2xl p-4 cursor-pointer transition-all ${bookingForm.ticketClass === 'STANDARD' ? 'border-[#008751] bg-green-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${bookingForm.ticketClass === 'STANDARD' ? 'border-[#008751]' : 'border-gray-300'}`}>
                                                        {bookingForm.ticketClass === 'STANDARD' && <div className="w-2.5 h-2.5 bg-[#008751] rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">Standard</span>
                                                        <span className="text-xs text-gray-500 font-medium">1 bagage inclus • Place standard</span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-lg text-gray-900">{(bookingStation.price || 0).toLocaleString()} F</span>
                                                <input type="radio" name="class" value="STANDARD" className="hidden" checked={bookingForm.ticketClass === 'STANDARD'} onChange={() => setBookingForm({ ...bookingForm, ticketClass: 'STANDARD' })} />
                                            </label>

                                            <label className={`relative flex items-center justify-between border-2 rounded-2xl p-4 cursor-pointer transition-all ${bookingForm.ticketClass === 'PREMIUM' ? 'border-yellow-400 bg-yellow-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg">POPULAIRE</div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${bookingForm.ticketClass === 'PREMIUM' ? 'border-yellow-500' : 'border-gray-300'}`}>
                                                        {bookingForm.ticketClass === 'PREMIUM' && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">Premium</span>
                                                        <span className="text-xs text-gray-500 font-medium">Confort + • Snack inclus • Prioritaire</span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-lg text-gray-900">{(bookingStation.pricePremium || (bookingStation.price || 0) * 1.5).toLocaleString()} F</span>
                                                <input type="radio" name="class" value="PREMIUM" className="hidden" checked={bookingForm.ticketClass === 'PREMIUM'} onChange={() => setBookingForm({ ...bookingForm, ticketClass: 'PREMIUM' })} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4 pb-2">
                                        <button
                                            type="submit"
                                            className="w-full py-4 rounded-2xl bg-[#008751] text-white font-bold text-lg hover:bg-[#006b40] shadow-xl shadow-green-200 hover:shadow-green-300 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                                        >
                                            <span>Réserver</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                                                {bookingForm.ticketClass === 'PREMIUM' ? (bookingStation.pricePremium || (bookingStation.price || 0) * 1.5).toLocaleString() : (bookingStation.price || 0).toLocaleString()} FCFA
                                            </span>
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal du ticket */}
            {viewingTicket && renderTicketModal()}

            <style>{`
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up-mobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-up-mobile { animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div >
    );
};
