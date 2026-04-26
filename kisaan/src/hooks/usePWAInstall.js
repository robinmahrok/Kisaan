import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa_install_dismissed_until';
const DISMISS_DAYS = 30;

function isAlreadyInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isDismissed() {
  const until = localStorage.getItem(DISMISSED_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

function detectPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /android/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return { isIOS, isAndroid, isSafari };
}

export function usePWAInstall() {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState({ isIOS: false, isAndroid: false, isSafari: false });

  useEffect(() => {
    if (isAlreadyInstalled() || isDismissed()) return;

    const detected = detectPlatform();
    setPlatform(detected);

    if (detected.isIOS && detected.isSafari) {
      // iOS Safari: show instructions modal after a short delay
      const timer = setTimeout(() => setShowModal(true), 4000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: wait for the browser's install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowModal(false);
    if (outcome === 'dismissed') dismiss();
  };

  const dismiss = () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(until));
    setShowModal(false);
  };

  return { showModal, platform, install, dismiss };
}
