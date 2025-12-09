
export enum UserRole {
  COMPANY = 'COMPANY',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export type ViewState = 'LANDING' | 'LOGIN_VOYAGEUR' | 'SIGNUP_VOYAGEUR' | 'LOGIN_COMPANY' | 'SIGNUP_COMPANY' | 'LOGIN_ADMIN' | 'DASHBOARD_ADMIN' | 'DASHBOARD_COMPANY' | 'DASHBOARD_CLIENT' | 'STATION_MANAGER' | 'ADMIN_VALIDATIONS' | 'ADMIN_PROFILE' | 'SEARCH_RESULTS' | 'COMPANIES_LIST' | 'COMPANY_DETAILS' | 'COMPANIES';
export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  password?: string; // Mot de passe ajouté comme optionnel
  name: string; // Nom du gestionnaire pour la compagnie, Nom complet pour le client
  role: UserRole; // Enum UserRole conservé
  avatarUrl?: string;
  npi?: string; // Numéro Personnel d'Identification

  // Spécifique au client
  phone?: string;

  // Spécifique à la compagnie
  companyName?: string;
  bannerUrl?: string;
  ifu?: string;
  rccm?: string;
  anattUrl?: string; // Document d'authentification principal
  otherDocsUrl?: string; // Documents supplémentaires
  status?: CompanyStatus; // Statut d'approbation

  // Informations de contact admin
  address?: string;
  whatsapp?: string;
  description?: string;
}

export interface Station {
  id: string;
  parentId?: string; // ID de la station parente (si c'est un trajet)
  companyId: string;
  companyName: string;
  type: 'STATION' | 'ROUTE'; // Sous-station ou trajet direct
  name: string;
  photoUrl: string;
  location: string; // Ville/Zone
  mapLink?: string; // Lien Google Maps
  description?: string;

  // Horaires d'ouverture (Pour Station)
  openingTime?: string;
  closingTime?: string;

  // Détails du trajet (Pour Route)
  pointA?: string;
  pointB?: string;
  departurePoint?: string; // Point spécifique

  // Horaires
  workDays: string[]; // ["Lun", "Mar", ...]
  departureHours?: string[]; // ["08:00", "14:00"] (Pour Route)
  arrivalHours?: string[]; // ["12:00", "18:00"] (Pour Route)

  price?: number;
  pricePremium?: number;
}

export interface Reservation {
  id: string;
  stationId: string;
  companyId: string;
  clientId: string;

  // Détails du passager
  clientName: string;
  clientEmail: string;
  clientPhone: string;

  // Copie des détails du voyage (instantané au moment de la réservation)
  routeSummary: string;
  departureTime: string;
  departureDate: string; // Chaîne de date ISO
  pricePaid: number;
  ticketClass: 'STANDARD' | 'PREMIUM';

  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';
  createdAt: string;
}

export const MOCK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
