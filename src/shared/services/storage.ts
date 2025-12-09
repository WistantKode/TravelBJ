import { Station, Reservation, User, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'vb_users',
  STATIONS: 'vb_stations',
  RESERVATIONS: 'vb_reservations',
  CURRENT_USER: 'vb_current_user'
};

// --- Utilitaire pour l'analyse sécurisée ---
const safeParse = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Data corruption detected for key "${key}". Resetting to default.`, error);
    try {
      localStorage.removeItem(key);
    } catch (e) { /* ignore */ }
    return fallback;
  }
};

// --- Utilitaire pour la sauvegarde sécurisée ---
const safeSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error: any) {
    console.error(`Storage save failed for "${key}"`, error);
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      // Tenter de libérer de l'espace en effaçant la clé spécifique s'il s'agit des données utilisateurs
      if (key === STORAGE_KEYS.USERS) {
        console.warn('Quota exceeded for users storage. Clearing existing users and retrying.');
        try {
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(data));
          return; // Succès !
        } catch (retryError) {
          console.error('Retry failed after clearing storage.', retryError);
          throw new Error('Espace de stockage plein même après nettoyage.');
        }
      } else {
        throw new Error("Espace de stockage plein. Veuillez réduire la taille des images.");
      }
    }
    throw new Error('Erreur de sauvegarde locale.');
  }
};

// --- Utilitaire pour initialiser les données si vides ---
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const users: User[] = [
      // Administrateur
      {
        id: 'admin',
        name: 'Administrateur',
        email: 'admin@voyagebj.com',
        role: UserRole.ADMIN,
        description: ''
      },
      // Compagnie Approuvée
      {
        id: 'comp1',
        name: 'Paul Manager',
        npi: '1234567890',
        companyName: 'Global Trans Co.',
        email: 'contact@global.com',
        role: UserRole.COMPANY,
        avatarUrl: 'https://picsum.photos/id/1/200/200',
        bannerUrl: 'https://picsum.photos/id/10/800/300',
        status: 'APPROVED',
        ifu: '1234567890123',
        rccm: 'RB/COT/001',
        anattUrl: 'autorisation_anatt.pdf',
        phone: '97000001',
        description: ''
      },
      // Compagnie En Attente
      {
        id: 'comp2',
        name: 'Jean Directeur',
        npi: '0987654321',
        companyName: 'Benin Express',
        email: 'new@benin.com',
        role: UserRole.COMPANY,
        avatarUrl: 'https://picsum.photos/id/3/200/200',
        bannerUrl: 'https://picsum.photos/id/11/800/300',
        status: 'PENDING',
        ifu: '9876543210987',
        rccm: 'RB/COT/002',
        anattUrl: 'demande_agrement.docx',
        phone: '66000002',
        description: ''
      },
      // Client
      {
        id: 'client1',
        name: 'Amina Client',
        npi: '1122334455',
        email: 'amina@mail.com',
        phone: '+229 97000000',
        role: UserRole.CLIENT,
        avatarUrl: 'https://picsum.photos/id/2/200/200',
        description: ''
      }
    ];
    safeSave(STORAGE_KEYS.USERS, users);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATIONS)) {
    safeSave(STORAGE_KEYS.STATIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
    safeSave(STORAGE_KEYS.RESERVATIONS, []);
  }
};

seedData();

// --- API de Stockage ---

export const getStations = (): Station[] => {
  return safeParse<Station[]>(STORAGE_KEYS.STATIONS, []);
};

export const saveStation = (station: Station) => {
  const stations = getStations();
  const index = stations.findIndex(s => s.id === station.id);
  if (index >= 0) {
    stations[index] = station;
  } else {
    stations.push(station);
  }
  safeSave(STORAGE_KEYS.STATIONS, stations);
};

export const deleteStation = (id: string) => {
  const stations = getStations().filter(s => s.id !== id);
  safeSave(STORAGE_KEYS.STATIONS, stations);
};

export const getReservations = (): Reservation[] => {
  return safeParse<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
};

export const createReservation = (reservation: Reservation) => {
  const bookings = getReservations();
  bookings.push(reservation);
  safeSave(STORAGE_KEYS.RESERVATIONS, bookings);
};

export const updateReservation = (reservation: Reservation) => {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === reservation.id);
  if (index >= 0) {
    reservations[index] = reservation;
    safeSave(STORAGE_KEYS.RESERVATIONS, reservations);
  } else {
    throw new Error('Réservation introuvable');
  }
};

export const getUsers = (): User[] => {
  return safeParse<User[]>(STORAGE_KEYS.USERS, []);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  safeSave(STORAGE_KEYS.USERS, users);

  // Mettre à jour la session si c'est soi-même
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    safeSave(STORAGE_KEYS.CURRENT_USER, user);
  }
};

export const getCurrentUser = (): User | null => {
  return safeParse<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    safeSave(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// --- Génération de Description (Dépendance IA supprimée) ---

export const generateStationDescription = async (stationData: Partial<Station>): Promise<string> => {
  // Dépendance IA supprimée - retour d'une chaîne vide
  // Utilisez plutôt les modèles de description locaux dans services/description.tsx
  return "";
};