import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon, MessageCircle } from 'lucide-react';

// Types pour les variantes de notification
export type NotificationVariant = 'info' | 'success' | 'warning' | 'danger' | 'message';

// Interface pour l'expéditeur (cas des messages)
export interface NotificationSender {
  name: string;
  avatar: string;
}

// Interface pour un élément de notification
export interface NotificationItem {
  id: number;
  variant: NotificationVariant;
  title?: string;
  message?: string;
  sender?: NotificationSender;
}

// Props du composant système de notification
interface NotificationSystemProps {
  notifications: NotificationItem[];
  removeNotification: (id: number) => void;
}

const DISPLAY_DURATION = 2000; // Durée d'affichage en ms (2 secondes)

/**
 * Composant principal qui gère la liste des notifications.
 * Positionnement :
 * - Success : Au milieu de la page
 * - Danger : En bas à droite (avec les autres)
 */
export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  // Séparer les notifications selon leur position
  const centerNotifications = notifications.filter(n => n.variant === 'success');
  const cornerNotifications = notifications.filter(n => n.variant !== 'success');

  // Limiter le nombre de notifications affichées pour éviter l'encombrement (max 3 par zone)
  const visibleCenter = centerNotifications.slice(0, 3);
  const visibleCorner = cornerNotifications.slice(0, 3);

  return (
    <>
      {/* Zone Centrale (Succès) */}
      <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-2 p-4">
        {visibleCenter.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      {/* Zone Coin Bas-Droit (Danger, Avertissement, Info, Message) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-center gap-2 p-4 md:items-end md:top-auto md:bottom-0 md:right-0 md:max-w-sm">
        {visibleCorner.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  );
};

/**
 * Carte individuelle de notification avec gestion de l'animation et du délai.
 */
const NotificationCard: React.FC<{ notification: NotificationItem; onRemove: () => void }> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // Animation d'entrée au montage
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Gestion du compte à rebours et de la barre de progression
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    // Calcule la fin basée sur le progrès restant pour éviter les sauts lors de la pause/reprise
    const endTime = startTime + (DISPLAY_DURATION * (progress / 100));

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / DISPLAY_DURATION) * 100;

      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 16); // Mise à jour fluide (~60fps)

    return () => clearInterval(interval);
  }, [isPaused, progress]);

  // Gestion de la fermeture (animation de sortie puis suppression)
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300); // Attendre la fin de l'animation CSS (300ms)
  };

  // Configuration des styles selon la variante
  const variants = {
    info: {
      icon: <Info size={20} />,
      bg: 'bg-blue-50/95 dark:bg-blue-900/95',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-100',
      iconColor: 'text-blue-500',
      progress: 'bg-blue-500'
    },
    success: {
      icon: <CheckCircle size={20} />,
      bg: 'bg-green-50/95 dark:bg-green-900/95',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-100',
      iconColor: 'text-green-500',
      progress: 'bg-green-500'
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      bg: 'bg-yellow-50/95 dark:bg-yellow-900/95',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-100',
      iconColor: 'text-yellow-500',
      progress: 'bg-yellow-500'
    },
    danger: {
      icon: <AlertOctagon size={20} />,
      bg: 'bg-red-50/95 dark:bg-red-900/95',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-100',
      iconColor: 'text-red-500',
      progress: 'bg-red-500'
    },
    message: {
      icon: <MessageCircle size={20} />,
      bg: 'bg-white/95 dark:bg-gray-800/95',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-100',
      iconColor: 'text-gray-500',
      progress: 'bg-gray-500'
    }
  };

  const style = variants[notification.variant];

  return (
    <div
      className={`
        pointer-events-auto relative w-full overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ease-out transform
        ${style.bg} ${style.border}
        ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        {notification.variant === 'message' && notification.sender ? (
          <img src={notification.sender.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
        ) : (
          <div className={`p-2 rounded-full bg-white/50 dark:bg-black/10 ${style.iconColor} shadow-sm shrink-0`}>
            {style.icon}
          </div>
        )}

        <div className="flex-1 pt-0.5 min-w-0">
          {notification.variant === 'message' && notification.sender ? (
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5 truncate">{notification.sender.name}</h4>
          ) : notification.title && (
            <h4 className={`font-bold text-sm mb-0.5 ${style.text}`}>{notification.title}</h4>
          )}
          <p className={`text-sm leading-snug opacity-90 ${style.text} break-words`}>{notification.message}</p>
        </div>

        <button
          onClick={handleDismiss}
          className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${style.text} opacity-60 hover:opacity-100 shrink-0`}
        >
          <X size={18} />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full">
        <div
          className={`h-full transition-all duration-100 ease-linear ${style.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};