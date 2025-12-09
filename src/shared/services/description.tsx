
import { Station } from '../types';

// Liste des templates de description
const templates = [
  (s: Partial<Station>) => `Voyagez confortablement de ${s.pointA} à ${s.pointB} avec ${s.companyName || 'notre compagnie'}. Un trajet sécurisé et ponctuel au départ de ${s.location || 'notre gare'}, le tout pour seulement ${s.price} FCFA. Profitez de nos services de qualité supérieure.`,

  (s: Partial<Station>) => `Découvrez l'excellence du transport sur la ligne ${s.pointA} - ${s.pointB}. Nos bus climatisés vous attendent à ${s.location || 'la gare'} pour un départ rapide. Prix du ticket : ${s.price} FCFA. Une expérience de voyage inoubliable vous attend.`,

  (s: Partial<Station>) => `${s.name} : La solution idéale pour vos déplacements vers ${s.pointB}. Profitez d'un service client irréprochable et d'un confort optimal. Réservez dès maintenant votre place à ${s.price} FCFA. Nous mettons tout en œuvre pour votre satisfaction.`,

  (s: Partial<Station>) => `Besoin d'aller à ${s.pointB} ? Partez de ${s.pointA} en toute sérénité. Nous assurons des départs réguliers les ${s.workDays?.join(', ') || 'jours ouvrables'}. Tarif exceptionnel de ${s.price} FCFA. Ponctualité et sécurité garanties.`,

  (s: Partial<Station>) => `Rejoignez ${s.pointB} depuis ${s.pointA} sans tracas. ${s.companyName || "L'agence"} vous garantit sécurité et rapidité. Rendez-vous à ${s.location} pour le départ. Embarquez pour un voyage agréable et reposant.`,

  (s: Partial<Station>) => `Offre spéciale voyage : ${s.pointA} vers ${s.pointB}. Un parcours direct pensé pour votre confort. Tickets disponibles à ${s.price} FCFA. Embarquement immédiat ! Ne manquez pas cette opportunité de voyager mieux.`,

  (s: Partial<Station>) => `🌟 Cap sur ${s.pointB} ! Au départ de ${s.pointA}, vivez une expérience de voyage unique avec ${s.companyName || 'nous'}. Confort, climatisation et sécurité sont au rendez-vous pour seulement ${s.price} FCFA. Réservez votre siège dès aujourd'hui !`,

  (s: Partial<Station>) => `🚌 Trajet ${s.pointA} ➔ ${s.pointB} : La référence du transport interurbain. Départ de ${s.location || 'notre agence'} avec des horaires respectés. ${s.pricePremium ? `Optez pour notre classe Premium à ${s.pricePremium} FCFA pour un confort absolu.` : `Un rapport qualité/prix imbattable à ${s.price} FCFA.`}`,

  (s: Partial<Station>) => `Envie de visiter ${s.pointB} ? Laissez-vous transporter depuis ${s.pointA} dans nos autocars modernes. Wi-Fi, sièges inclinables et ambiance zen. Départ garanti les ${s.workDays?.join(', ') || 'jours de semaine'}.`,

  (s: Partial<Station>) => `✨ Voyagez l'esprit léger entre ${s.pointA} et ${s.pointB}. ${s.companyName || 'Notre équipe'} s'occupe de tout. Départ : ${s.location || 'Gare centrale'}. Arrivée en toute sécurité. Tarif standard : ${s.price} FCFA.`
];

/**
 * Génère une description commerciale basée sur les données de la station/trajet
 * sans utiliser d'API externe.
 */
export const generateLocalDescription = (station: Partial<Station>): string => {
  // Vérification minimale des données
  if (!station.pointA || !station.pointB) {
    return "Veuillez d'abord renseigner les villes de départ (Point A) et d'arrivée (Point B) pour générer une description.";
  }

  // Sélection aléatoire d'un template
  const randomIndex = Math.floor(Math.random() * templates.length);
  const selectedTemplate = templates[randomIndex];

  return selectedTemplate(station);
};
