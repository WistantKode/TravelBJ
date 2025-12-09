import React, { useState, useEffect, useRef } from 'react';
import {
  Truck, ShieldCheck, Users, ArrowRight, Clock, Map, Star, CheckCircle,
  Briefcase, Search, MapPin, Calendar, CreditCard, Ticket, Globe,
  AlertTriangle, TrendingUp, Server, Cloud, Smartphone, Mail, Facebook, Twitter, Linkedin, Instagram,
  ChevronRight, Play, Zap, Award, Heart, Bus
} from 'lucide-react';
import { User, Station, ViewState } from '../../shared/types';
import { getStations, getUsers } from '../../shared/services/storage';

interface Props {
  onNavigate: (page: ViewState, params?: any) => void;
  user: User | null;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
];

const PARTNERS = [
  "Baobab Express", "ATT Transport", "La Poste", "STM", "Rana Transport", "Confort Lines"
];

export const LandingPage: React.FC<Props> = ({ onNavigate, user }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [popularRoutes, setPopularRoutes] = useState<Station[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [workflowType, setWorkflowType] = useState<'VOYAGEUR' | 'COMPANY'>('VOYAGEUR');

  // Compteurs d'animation
  const [stats, setStats] = useState({
    partners: 0,
    cities: 0,
    travelers: 0,
    satisfaction: 0
  });
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cycle animation
  useEffect(() => {
    const maxSteps = workflowType === 'VOYAGEUR' ? 3 : 4;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % maxSteps) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [workflowType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const stations = getStations();
    const approvedCompanies = getUsers().filter(u => u.role === 'COMPANY' && u.status === 'APPROVED');
    const approvedCompanyIds = approvedCompanies.map(c => c.id);
    const approvedStations = stations.filter(s => approvedCompanyIds.includes(s.companyId) && s.type === 'STATION');
    setPopularRoutes(approvedStations.slice(0, 3));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        animateValue('partners', 50);
        animateValue('cities', 25);
        animateValue('travelers', 10000);
        animateValue('satisfaction', 98);
      }
    }, { threshold: 0.5 });

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateValue = (key: keyof typeof stats, target: number) => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setStats(prev => ({ ...prev, [key]: target }));
        clearInterval(timer);
      } else {
        setStats(prev => ({ ...prev, [key]: Math.floor(start) }));
      }
    }, 16);
  };

  const getWorkflowSteps = () => {
    if (workflowType === 'VOYAGEUR') {
      return [
        { id: 1, icon: Search, label: "Recherche", color: "blue", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-8", title: "Trouvez votre trajet", desc: "Comparez les horaires et tarifs de toutes les compagnies." },
        { id: 2, icon: CheckCircle, label: "Sélection", color: "green", pos: "bottom-0 right-0 translate-x-4 translate-y-4", title: "Choisissez votre place", desc: "Sélectionnez votre siège préféré sur le plan du bus." },
        { id: 3, icon: Ticket, label: "Voyage", color: "red", pos: "bottom-0 left-0 -translate-x-4 translate-y-4", title: "Embarquez !", desc: "Recevez votre e-billet et présentez-le au départ." }
      ];
    } else {
      return [
        { id: 1, icon: Briefcase, label: "Inscription", color: "blue", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-8", title: "Créez votre compte", desc: "Inscrivez votre compagnie en quelques clics." },
        { id: 2, icon: ShieldCheck, label: "Validation", color: "green", pos: "right-0 top-1/2 translate-x-8 -translate-y-1/2", title: "Vérification", desc: "Nous validons vos documents officiels (ANaTT)." },
        { id: 3, icon: Map, label: "Gestion", color: "yellow", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-8", title: "Publiez vos trajets", desc: "Gérez vos lignes, horaires et tarifs facilement." },
        { id: 4, icon: TrendingUp, label: "Revenus", color: "red", pos: "left-0 top-1/2 -translate-x-8 -translate-y-1/2", title: "Encaissez", desc: "Recevez vos paiements et suivez vos statistiques." }
      ];
    }
  };

  const steps = getWorkflowSteps();

  return (
    <div className="bg-white font-sans min-h-screen flex flex-col overflow-x-hidden">

      {/* 1. HERO SECTION PREMIUM V2 */}
      <div className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 z-10"></div>
            <img src={img} alt="Hero" className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="relative z-20 max-w-7xl mx-auto px-4 w-full flex flex-col items-center justify-center h-full pt-20">

          {/* Floating Grid Cards (Background Effect) */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            {/* Card 1: Ticket */}
            <div className="absolute top-1/4 left-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 transform -rotate-6 animate-float-slow">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-[#008751] rounded-full flex items-center justify-center text-white"><Bus size={20} /></div>
                <div className="text-white">
                  <div className="font-bold text-sm">Cotonou</div>
                  <div className="text-xs opacity-70">08:00</div>
                </div>
                <ArrowRight className="text-white/50" size={16} />
                <div className="text-white text-right">
                  <div className="font-bold text-sm">Parakou</div>
                  <div className="text-xs opacity-70">14:30</div>
                </div>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full mt-2"></div>
            </div>

            {/* Card 2: Reservation */}
            <div className="absolute bottom-1/3 right-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 transform rotate-3 animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=100" className="w-full h-full object-cover" />
                </div>
                <div className="text-white">
                  <div className="font-bold text-sm">Baobab Express</div>
                  <div className="text-xs text-[#FCD116] font-bold">Confirmé</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto relative z-30">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse"></span>
              <span>La référence du voyage au Bénin</span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight mb-8 drop-shadow-2xl animate-fade-in-up delay-100 font-['Dancing_Script']">
              <span className="text-[#008751]">Voyage</span>
              <span className="text-[#FCD116]">B</span>
              <span className="text-[#E8112D]">j</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
              Réservez vos billets de bus en ligne, simplement et en toute sécurité.
              <br className="hidden md:block" />
              <span className="text-[#FCD116] font-medium">Voyagez mieux, voyagez connecté.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-300">
              <button
                onClick={() => onNavigate('SIGNUP_VOYAGEUR')}
                className="group bg-[#008751] hover:bg-[#006b40] text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(0,135,81,0.4)] hover:shadow-[0_0_50px_rgba(0,135,81,0.6)] flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                <span>Je réserve mon billet</span>
                <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </button>

              <button
                onClick={() => onNavigate('SIGNUP_COMPANY')}
                className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-10 py-5 rounded-full font-bold text-lg transition-all border border-white/30 flex items-center justify-center gap-3"
              >
                <Briefcase size={20} />
                <span>Espace Compagnie</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50 z-20">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 2. CREDIBILITY MARQUEE */}
      <div className="bg-white py-10 border-b border-gray-100 overflow-hidden">
        <p className="text-center text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">Ils nous font confiance</p>
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
            {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <span key={idx} className="text-2xl font-black text-gray-300 hover:text-[#008751] transition-colors cursor-default">
                {partner}
              </span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8">
            {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <span key={`dup-${idx}`} className="text-2xl font-black text-gray-300 hover:text-[#008751] transition-colors cursor-default">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HOW IT WORKS - ROTARY CYCLE V2 */}
      <section className="py-24 bg-gray-50 overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#008751]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e9b400]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Comment ça <span className="text-[#008751] font-['Dancing_Script'] text-5xl md:text-6xl">marche ?</span>
            </h2>

            {/* Toggle Switch */}
            <div className="flex justify-center mb-8">
              <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm inline-flex">
                <button
                  onClick={() => { setWorkflowType('VOYAGEUR'); setActiveStep(1); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${workflowType === 'VOYAGEUR' ? 'bg-[#008751] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Voyageur
                </button>
                <button
                  onClick={() => { setWorkflowType('COMPANY'); setActiveStep(1); }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${workflowType === 'COMPANY' ? 'bg-[#008751] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Compagnie
                </button>
              </div>
            </div>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {workflowType === 'VOYAGEUR'
                ? "Réservez votre prochain voyage en 3 étapes simples."
                : "Digitalisez votre activité de transport et augmentez vos revenus."}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Interactive Cycle Visual */}
            <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center">
              {/* Central Circle */}
              <div className="absolute w-[280px] h-[280px] md:w-[350px] md:h-[350px] border-2 border-dashed border-gray-200 rounded-full animate-spin-slow"></div>
              <div className="absolute w-[180px] h-[180px] bg-white rounded-full shadow-2xl flex items-center justify-center z-10 p-8 text-center border-4 border-gray-50">
                <div>
                  <div className="text-[#008751] font-black text-5xl mb-2">0{activeStep}</div>
                  <div className="text-gray-400 font-bold uppercase text-sm tracking-wider">Étape</div>
                </div>
              </div>

              {/* Orbiting Steps */}
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`absolute ${step.pos} transition-all duration-500 transform ${activeStep === step.id ? 'scale-125 z-20' : 'scale-100 z-10 opacity-70'}`}
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 cursor-pointer ${activeStep === step.id ? 'bg-[#008751] text-white ring-4 ring-green-100' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <step.icon size={28} />
                  </div>
                  <div className={`text-center mt-3 font-bold text-sm md:text-base transition-colors duration-300 ${activeStep === step.id ? 'text-[#008751]' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Step Details */}
            <div className="space-y-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex gap-6 p-6 rounded-2xl transition-all duration-500 cursor-pointer ${activeStep === step.id ? 'bg-white shadow-xl border-l-4 border-[#008751] transform translate-x-2 md:translate-x-4' : 'hover:bg-white/50'}`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className={`text-2xl font-black ${activeStep === step.id ? 'text-[#008751]' : 'text-gray-300'}`}>0{step.id}</div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${activeStep === step.id ? 'text-gray-900' : 'text-gray-500'}`}>{step.title}</h3>
                    <p className={`${activeStep === step.id ? 'text-gray-600' : 'text-gray-400 hidden lg:block'}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS & IMPACT */}
      <div ref={statsRef} className="bg-[#008751] py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">{stats.partners}+</div>
              <div className="text-green-200 font-medium uppercase tracking-wider text-xs md:text-sm">Compagnies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">{stats.cities}+</div>
              <div className="text-green-200 font-medium uppercase tracking-wider text-xs md:text-sm">Villes Desservies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">{stats.travelers.toLocaleString()}</div>
              <div className="text-green-200 font-medium uppercase tracking-wider text-xs md:text-sm">Voyageurs Heureux</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">{stats.satisfaction}%</div>
              <div className="text-green-200 font-medium uppercase tracking-wider text-xs md:text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. POPULAR ROUTES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Destinations <span className="text-[#e9b400]">Populaires</span>
              </h2>
              <p className="text-gray-500 text-lg">Découvrez les gares les plus fréquentées du moment.</p>
            </div>
            <button onClick={() => onNavigate('COMPANIES_LIST')} className="text-[#008751] font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Voir toutes les gares <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {popularRoutes.length > 0 ? popularRoutes.map((station) => {
              const allStations = getStations();
              const routeCount = allStations.filter(s => s.parentId === station.id).length;

              return (
                <div key={station.id} onClick={() => onNavigate('SEARCH_RESULTS', { departure: station.location, arrival: '', date: '' })} className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img src={station.photoUrl || `https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800`} alt={station.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                    {station.companyName}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 text-[#e9b400] mb-2 font-bold">
                      <MapPin size={16} />
                      <span>{station.location}</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">{station.name}</h3>

                    <div className="flex items-center justify-between border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <div className="text-white">
                        <span className="block text-2xl font-bold">{routeCount}</span>
                        <span className="text-xs text-gray-300 uppercase">Départs / Jour</span>
                      </div>
                      <div className="w-10 h-10 bg-[#008751] rounded-full flex items-center justify-center text-white">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-3 text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Chargement des destinations...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#008751] rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#e9b400] rounded-full mix-blend-overlay blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">La parole aux <span className="text-[#e9b400]">voyageurs</span></h2>
            <p className="text-gray-400">Découvrez pourquoi des milliers de béninois nous font confiance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Jean D.", role: "Voyageur fréquent", text: "VoyageBJ a transformé ma façon de voyager. Plus besoin de me déplacer à la gare à l'avance, je réserve en ligne et j'ai mon billet sur mon téléphone.", color: "green" },
              { name: "Marie T.", role: "Directrice de compagnie", text: "Depuis que nous sommes sur VoyageBJ, notre taux d'occupation a augmenté de 30%. La plateforme nous permet de mieux gérer nos trajets et nos revenus.", color: "yellow" },
              { name: "Koffi A.", role: "Étudiant", text: "En tant qu'étudiant, les tarifs avantageux et la facilité d'utilisation de VoyageBJ me permettent de rentrer chez moi plus souvent sans me ruiner.", color: "red" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-2">
                <div className="flex items-center gap-1 mb-6 text-[#e9b400]">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed italic">"{item.text}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 flex items-center justify-center font-bold text-lg shadow-lg`}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER & RETENTION */}
      <section className="py-24 bg-[#008751] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl transform rotate-1">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-[#008751]">
              <Mail size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Ne manquez aucune <span className="text-[#008751]">offre !</span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir des codes promo exclusifs et être informé des nouvelles lignes.
            </p>

            <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#008751] outline-none font-medium"
              />
              <button className="bg-[#008751] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#006b40] transition-all shadow-lg shadow-green-200">
                S'inscrire
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">Nous respectons votre vie privée. Désabonnement à tout moment.</p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 25s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-20px) rotate(-6deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite 1s;
        }
      `}</style>

    </div>
  );
};
