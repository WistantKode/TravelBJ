
import React from 'react';
import { Truck } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 p-2 rounded-lg">
                <Truck size={24} />
              </div>
              <span className="font-bold text-2xl">VoyageBj</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              La première plateforme de réservation de tickets de bus au Bénin. Nous connectons les voyageurs aux meilleures compagnies de transport.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Liens Rapides</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button onClick={() => onNavigate('LANDING')} className="hover:text-white transition-colors">Accueil</button></li>
              <li><button onClick={() => onNavigate('SIGNUP_COMPANY')} className="hover:text-white transition-colors">Devenir Partenaire</button></li>
              <li><button onClick={() => onNavigate('LOGIN_VOYAGEUR')} className="hover:text-white transition-colors">Mon Espace</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Légal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Conditions Générales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions Légales</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 VoyageBj</p>
        </div>
      </div>
    </footer>
  );
};