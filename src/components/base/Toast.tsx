
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black'
  };

  const icons = {
    success: 'ri-check-line',
    error: 'ri-error-warning-line',
    info: 'ri-information-line',
    warning: 'ri-alert-line'
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${typeStyles[type]}
    `}>
      <i className={`${icons[type]} mr-2`}></i>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsAnimating(false);
          setTimeout(onClose, 300);
        }}
        className="ml-3 hover:opacity-75"
      >
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
