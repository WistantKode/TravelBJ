
import React, { useState, useEffect } from 'react';
import { User, Station, Reservation, ViewState } from '../../shared/types';
import { getStations, deleteStation, getReservations, saveUser, getUsers, updateReservation } from '../../shared/services/storage';
import {
  Plus, MapPin, Trash2, Edit, Users,
  TrendingUp, FileText, X, ArrowRight, Save, Camera, FileJson,
  MessageCircle, Phone, Mail, HelpCircle, Image as ImageIcon, Bus,
  Download, LayoutDashboard, Edit2, ChevronRight, Clock, Calendar, DollarSign, Search, Filter, Route as RouteIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from "jspdf";
import { BottomNav } from '../../shared/components/BottomNav';
import { NotifyFunc } from '../../App';
import { SettingsModal } from '../../shared/components/SettingsModal';

interface Props {
  user: User;
  notify: NotifyFunc;
  onNavigate: (view: ViewState, params?: any) => void;
  setEditStationId: (id: string | null) => void;
  setStationManagerProps?: (props: { initialType: 'STATION' | 'ROUTE', parentId?: string }) => void;
}

const COLORS = ['#008751', '#e9b400', '#e8112d', '#292a2c']; // Benin Green, Yellow, Red, Dark

export const CompanyDashboard: React.FC<Props> = ({ user, notify, onNavigate, setEditStationId, setStationManagerProps }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stations' | 'reservations' | 'profile' | 'settings'>('overview');
  const [stations, setStations] = useState<Station[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [viewingReservationId, setViewingReservationId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');
  const [profileForm, setProfileForm] = useState<Partial<User>>({});

  const [showAdminContact, setShowAdminContact] = useState(false);
  const [viewingStationDetailsId, setViewingStationDetailsId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [user.id]);

  useEffect(() => {
    if (activeTab === 'profile') {
      setProfileForm(user);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, user]);

  const refreshData = () => {
    const allStations = getStations().filter(s => s.companyId === user.id);
    setStations(allStations);
    const allRes = getReservations().filter(r => r.companyId === user.id);
    setReservations(allRes);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette station ?')) {
      deleteStation(id);
      refreshData();
      notify("Station supprimée avec succès", "success");
    }
  };

  const handleEdit = (id: string) => {
    setEditStationId(id);
    if (setStationManagerProps) setStationManagerProps({ initialType: 'STATION' });
    onNavigate('STATION_MANAGER');
  };

  const handleCreate = (type: 'STATION' | 'ROUTE', parentId?: string) => {
    setEditStationId(null);
    if (setStationManagerProps) {
      setStationManagerProps({ initialType: type, parentId });
    }
    onNavigate('STATION_MANAGER');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.id) {
      try {
        saveUser(profileForm as User);
        notify("Profil mis à jour avec succès.", "success");
      } catch (err: any) {
        notify(err.message, "error");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 700) {
        notify("Fichier trop volumineux (Max 700Ko).", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileForm(prev => ({ ...prev, [field]: base64 }));
        if (user.id) {
          const updatedUser = { ...user, ...profileForm, [field]: base64 } as User;
          try {
            saveUser(updatedUser);
            notify("Image mise à jour !", "success");
          } catch (err: any) {
            notify("Impossible de sauvegarder : " + err.message, "error");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportReservationsPDF = (stationId?: string) => {
    let resToExport = reservations;
    let title = "Liste des passagers - Toutes les réservations";
    if (stationId) {
      const station = stations.find(s => s.id === stationId);
      resToExport = reservations.filter(r => r.stationId === stationId);
      title = `Liste des passagers - ${station?.name} `;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    let y = 30;
    resToExport.forEach((res, index) => {
      const station = stations.find(s => s.id === res.stationId);
      doc.text(`${index + 1}. ${res.clientName} - ${res.clientPhone} - ${station?.pointA} -> ${station?.pointB} - ${res.departureDate} - ${res.pricePaid} F`, 14, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save(`reservations_${stationId ? stations.find(s => s.id === stationId)?.name : 'all'}.pdf`);
    notify("Export PDF téléchargé", "success");
  };

  const exportReservationsJSON = (stationId?: string) => {
    let resToExport = reservations;
    let filename = `reservations_all.json`;
    if (stationId) {
      const station = stations.find(s => s.id === stationId);
      resToExport = reservations.filter(r => r.stationId === stationId);
      filename = `reservations_${station?.name}.json`;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    notify("Export JSON téléchargé", "success");
  };

  const renderProfile = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      <div className="relative h-48 md:h-64 bg-gray-200 group">
        {profileForm.bannerUrl ? <img src={profileForm.bannerUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 benin-gradient-bg">Pas de bannière</div>}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black/70 backdrop-blur-sm cursor-pointer flex items-center gap-2">
            <ImageIcon size={20} /> Modifier la bannière
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'bannerUrl')} />
          </label>
        </div>
      </div>
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20 mb-6 gap-6">
          <div className="relative group cursor-pointer">
            <img src={profileForm.avatarUrl} alt="Profile" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
            <label className="absolute bottom-2 right-2 bg-[#008751] p-2 rounded-full text-white shadow-md cursor-pointer hover:bg-[#006b40]">
              <Edit size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatarUrl')} />
            </label>
          </div>
          <div className="flex-1 pt-2 md:pt-0">
            <h2 className="text-3xl font-bold text-gray-800">{profileForm.companyName}</h2>
            <p className="text-gray-500">{profileForm.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="md:col-span-2"><h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 border-green-100">Informations de l'Entreprise</h3></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'Agence</label><input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#008751]" value={profileForm.companyName || ''} onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom du Responsable</label><input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#008751]" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" disabled className="w-full rounded-lg border border-gray-300 p-2.5 bg-gray-100 cursor-not-allowed" value={profileForm.email || ''} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">IFU</label><input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#008751]" value={profileForm.ifu || ''} onChange={e => setProfileForm({ ...profileForm, ifu: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">RCCM</label><input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-[#008751]" value={profileForm.rccm || ''} onChange={e => setProfileForm({ ...profileForm, rccm: e.target.value })} /></div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-[#008751] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#006b40] flex items-center gap-2 shadow-lg shadow-green-200">
              <Save size={20} /> Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderOverview = () => {
    const popularRoutes = stations.map(s => ({ name: s.name, reservations: reservations.filter(r => r.stationId === s.id).length }));
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Réservations</p><h3 className="text-3xl font-bold text-benin-green mt-1">{reservations.length}</h3></div>
              <div className="p-3 bg-green-100 rounded-full text-benin-green"><Users size={24} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Sous-stations</p><h3 className="text-3xl font-bold text-benin-yellow mt-1">{stations.filter(s => s.type === 'STATION').length}</h3></div>
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-700"><MapPin size={24} /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Parcours</p><h3 className="text-3xl font-bold text-benin-red mt-1">{stations.filter(s => s.type === 'ROUTE').length}</h3></div>
              <div className="p-3 bg-red-100 rounded-full text-red-700"><RouteIcon size={24} /></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-lg font-bold mb-4 text-gray-800">Trafic par Station/Trajet</h4>
            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={popularRoutes.slice(0, 5)}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="reservations" fill="#008751" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-lg font-bold mb-4 text-gray-800">Répartition</h4>
            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={popularRoutes} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="reservations">{popularRoutes.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          </div>
        </div>
      </div>
    );
  };

  const renderStations = () => {
    const parentStations = stations.filter(s => s.type === 'STATION');
    const standaloneRoutes = stations.filter(s => s.type === 'ROUTE' && !s.parentId);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div><h2 className="text-2xl font-bold text-gray-800">Gestion des Stations</h2><p className="text-gray-500">Gérez vos sous-stations et vos parcours.</p></div>
          <div className="flex gap-3">
            <button onClick={() => handleCreate('STATION')} className="bg-[#008751] text-white px-5 py-2.5 rounded-lg hover:bg-[#006b40] flex items-center gap-2 transition-colors shadow-md font-medium"><Plus size={20} /> Créer Sous-station</button>
            <button onClick={() => handleCreate('ROUTE')} className="bg-[#e9b400] text-white px-5 py-2.5 rounded-lg hover:bg-yellow-600 flex items-center gap-2 transition-colors shadow-md font-medium"><Plus size={20} /> Créer Parcours Direct</button>
          </div>
        </div>

        {/* --- PARENT STATIONS SECTION --- */}
        {parentStations.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Vos Sous-Stations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parentStations.map(station => (
                <div key={station.id} onClick={() => setViewingStationDetailsId(station.id)} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="h-48 overflow-hidden relative">
                    <img src={station.photoUrl} alt={station.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white w-full pr-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                          <MapPin size={18} className="text-white" />
                          {station.name}
                        </h3>
                      </div>
                      <p className="text-sm opacity-90">{station.location}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{station.openingTime || '--:--'} - {station.closingTime || '--:--'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {station.workDays.map(d => <span key={d} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{d.substring(0, 3)}</span>)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      <span>{stations.filter(s => s.parentId === station.id).length} Parcours associés</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STANDALONE ROUTES SECTION --- */}
        {standaloneRoutes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Parcours Directs (Indépendants)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standaloneRoutes.map(station => (
                <div key={station.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={station.photoUrl} alt={station.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white w-full pr-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                          <Bus size={18} className="text-white" />
                          {station.name}
                        </h3>
                      </div>
                      <p className="text-sm opacity-90">{station.location}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                      <div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-500 font-medium">Trajet</span><span className="font-bold text-gray-800 flex items-center gap-1">{station.pointA} <ArrowRight size={14} /> {station.pointB}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-gray-500 font-medium">Prix</span><div className="text-right"><span className="font-bold text-benin-green text-lg block">{station.price} F</span>{station.pricePremium && <span className="text-xs font-bold text-yellow-600 block">{station.pricePremium} F (Prem)</span>}</div></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(station.id)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2 text-sm font-bold transition-colors"><Edit size={16} /> Modifier</button>
                      <button onClick={() => handleDelete(station.id)} className="w-12 bg-red-50 border border-red-100 text-[#e8112d] rounded-lg hover:bg-red-100 flex justify-center items-center transition-colors" title="Supprimer"><Trash2 size={18} /></button>
                    </div>
                    <button onClick={() => { setViewingReservationId(station.id); setActiveTab('reservations'); }} className="w-full mt-3 bg-green-50 text-[#008751] py-2.5 rounded-lg hover:bg-green-100 text-sm font-bold transition-colors flex items-center justify-center gap-2"><Users size={16} /> Voir les Réservations</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stations.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-10 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <MapPin size={40} className="mb-2 opacity-50" />
            <p className="font-medium">Aucune station ou parcours créé.</p>
            <button onClick={() => handleCreate('STATION')} className="mt-2 text-[#008751] font-bold hover:underline">Créer maintenant</button>
          </div>
        )}
      </div>
    );
  };

  const renderStationDetailsModal = () => {
    if (!viewingStationDetailsId) return null;
    const station = stations.find(s => s.id === viewingStationDetailsId);
    if (!station) return null;

    const routes = stations.filter(s => s.parentId === station.id);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
          <div className="relative h-48">
            <img src={station.photoUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end">
              <div className="text-white">
                <h2 className="text-3xl font-bold flex items-center gap-2"><MapPin /> {station.name}</h2>
                <p className="opacity-90">{station.location}</p>
              </div>
              <button onClick={() => setViewingStationDetailsId(null)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Parcours Disponibles</h3>
              <button onClick={() => handleCreate('ROUTE', station.id)} className="bg-[#e9b400] text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2 font-bold shadow-md transition-colors">
                <Plus size={18} /> Ajouter Parcours
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map(route => (
                <div key={route.id} className="border border-gray-200 rounded-xl p-4 hover:border-yellow-400 transition-colors bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                      {route.pointA} <ArrowRight size={16} className="text-gray-400" /> {route.pointB}
                    </div>
                    <span className="bg-green-100 text-[#008751] px-2 py-1 rounded text-xs font-bold">{route.price} F</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4 space-y-1">
                    <p className="flex items-center gap-2"><Calendar size={14} /> {route.workDays.join(', ')}</p>
                    <p className="flex items-center gap-2"><Clock size={14} /> {route.departureHours?.join(', ')}</p>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button onClick={() => handleEdit(route.id)} className="flex-1 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-1"><Edit size={14} /> Modifier</button>
                    <button onClick={() => handleDelete(route.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {routes.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <RouteIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Aucun parcours configuré pour cette station.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-bold text-gray-700">Horaires:</span> {station.openingTime || '--:--'} - {station.closingTime || '--:--'}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setViewingStationDetailsId(null); handleEdit(station.id); }} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors">Modifier Station</button>
              <button onClick={() => { setViewingStationDetailsId(null); handleDelete(station.id); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors">Supprimer Station</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleMarkAsPaid = (reservationId: string) => {
    const allReservations = getReservations();
    const reservation = allReservations.find(r => r.id === reservationId);

    if (!reservation) {
      notify("Réservation introuvable", "error");
      return;
    }

    try {
      const updatedReservation = { ...reservation, status: 'COMPLETED' as const };
      updateReservation(updatedReservation);
      notify("Réservation marquée comme terminée (Payé & Arrivé).", "success");
      refreshData();
    } catch (err: any) {
      notify(err.message || "Erreur lors de la mise à jour", "error");
    }
  };

  const renderReservations = () => {
    let filteredRes = viewingReservationId ? reservations.filter(r => r.stationId === viewingReservationId) : reservations;

    if (filterDate) {
      filteredRes = filteredRes.filter(r => r.departureDate === filterDate);
    }

    const currentStation = viewingReservationId ? stations.find(s => s.id === viewingReservationId) : null;

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div><h2 className="text-2xl font-bold text-gray-800">{currentStation ? `Liste des passagers: ${currentStation.name}` : 'Toutes les Réservations'}</h2><p className="text-gray-500">Gérez les réservations de vos passagers.</p></div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008751] outline-none bg-gray-50"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button onClick={() => exportReservationsPDF(viewingReservationId || undefined)} className="flex items-center gap-2 px-4 py-2 bg-[#e8112d] text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"><FileText size={16} /> PDF</button>
            <button onClick={() => exportReservationsJSON(viewingReservationId || undefined)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium shadow-sm"><FileJson size={16} /> JSON</button>
            <button onClick={() => { setViewingReservationId(null); setFilterDate(''); }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"><X size={16} /> {viewingReservationId || filterDate ? 'Réinitialiser' : 'Filtres'}</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Passager</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Trajet</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Classe</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Statut</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRes.length > 0 ? (
                  filteredRes.map(res => {
                    const station = stations.find(s => s.id === res.stationId);
                    const routeSummary = station ? `${station.pointA} → ${station.pointB}` : 'N/A';
                    return (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{res.clientName}</p>
                          <p className="text-xs text-gray-500">{res.clientPhone}</p>
                        </td>
                        <td className="p-4 font-medium text-gray-700">{routeSummary}</td>
                        <td className="p-4 text-gray-600">{res.departureDate} <span className="text-xs text-gray-400 block">{res.departureTime}</span></td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${res.ticketClass === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {res.ticketClass}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${res.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {res.status === 'COMPLETED' ? 'Payé & Arrivé' : (res.status === 'CONFIRMED' ? 'Confirmé' : 'En Attente')}
                          </span>
                        </td>
                        <td className="p-4">
                          {res.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleMarkAsPaid(res.id)}
                              className="px-3 py-1.5 bg-[#008751] text-white text-xs font-bold rounded-lg hover:bg-[#006b40] transition-colors shadow-sm"
                            >
                              Arrivé → Payé
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Aucune réservation trouvée{filterDate ? " pour cette date" : ""}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-[70px] z-30 transition-all">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
          <button onClick={() => setShowAdminContact(true)} className="flex items-center gap-2 px-5 py-3 bg-white text-[#e8112d] rounded-xl shadow-sm hover:shadow-md font-bold border border-red-100 hover:bg-red-50 transition-colors whitespace-nowrap">
            <HelpCircle size={18} /> Contacter Admin
          </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'stations' && renderStations()}
        {activeTab === 'reservations' && renderReservations()}
      </div>

      {/* Modal Contact Admin */}
      {showAdminContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-xl text-gray-800">Contacter l'Administrateur</h3>
              <button onClick={() => setShowAdminContact(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Téléphone</p>
                  <a href="tel:+22901020304" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">+229 01 02 03 04</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Email</p>
                  <a href="mailto:admin@voyagebj.com" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors">admin@voyagebj.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">WhatsApp</p>
                  <a href="https://wa.me/22901020304" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors">Discuter sur WhatsApp</a>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">L'équipe support est disponible 24/7.</p>
            </div>
          </div>
        </div>
      )}

      {/* Station Details Modal */}
      {renderStationDetailsModal()}

      {activeTab === 'settings' && (
        <>
          {renderOverview()}
          <SettingsModal onClose={() => setActiveTab('overview')} />
        </>
      )}

      <BottomNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};