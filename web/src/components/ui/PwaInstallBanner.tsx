"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      return; // Already installed, do nothing
    }

    if (isIOSDevice) setIsIOS(true);
    if (isAndroidDevice) setIsAndroid(true);

    // Show banner after a short delay for mobile devices if not dismissed,
    // to ensure it shows up even when testing on local IP where beforeinstallprompt doesn't fire.
    if (isIOSDevice || isAndroidDevice) {
      const timer = setTimeout(() => {
        const hasDismissed = localStorage.getItem("pwa_install_dismissed_v2");
        if (!hasDismissed) {
          setIsVisible(true);
        }
      }, 2500);
      
      // Also listen for beforeinstallprompt for Android native flow
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // It will already be set to visible by the timer, but just in case
        setIsVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    } else {
      // Desktop: Only show if beforeinstallprompt fires
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const hasDismissed = localStorage.getItem("pwa_install_dismissed_v2");
        if (!hasDismissed) {
          setIsVisible(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // If no deferred prompt (e.g. testing on local IP HTTP), show manual Android instructions
      setShowAndroidModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_install_dismissed_v2", "true");
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !showIOSModal && !showAndroidModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Download size={20} className="text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text)] truncate">Install Offline SOS</p>
                <p className="text-xs text-[var(--text-muted)] truncate">Add to home screen for quick access without internet.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-md hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-raised)] rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:bg-[var(--surface-raised)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Download size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">Install Offline SOS</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Install this app on your iPhone or iPad for instant access to SOS features even when you are offline.
                </p>
                
                <div className="w-full bg-[var(--surface-raised)] rounded-xl p-4 mb-6">
                  <ol className="text-left text-sm text-[var(--text)] space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">1</span>
                      <p>Tap the <span className="font-bold inline-flex items-center gap-1"><Share size={14} /> Share</span> button at the bottom of your screen.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">2</span>
                      <p>Scroll down and tap <span className="font-bold">"Add to Home Screen"</span>.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">3</span>
                      <p>Tap <span className="font-bold">"Add"</span> in the top right corner.</p>
                    </li>
                  </ol>
                </div>
                
                <button
                  onClick={() => { setShowIOSModal(false); setIsVisible(false); }}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Android Instructions Modal (Fallback for HTTP/Local IP testing) */}
      <AnimatePresence>
        {showAndroidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowAndroidModal(false)}
                className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:bg-[var(--surface-raised)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Download size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">Install Offline SOS</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Install this app on your Android device for instant access to SOS features even when you are offline.
                </p>
                
                <div className="w-full bg-[var(--surface-raised)] rounded-xl p-4 mb-6">
                  <ol className="text-left text-sm text-[var(--text)] space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">1</span>
                      <p>Tap the <span className="font-bold inline-flex items-center gap-1"><MoreVertical size={14} /> Menu</span> icon in the top right corner of your browser.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">2</span>
                      <p>Tap <span className="font-bold">"Add to Home screen"</span> or <span className="font-bold">"Install app"</span>.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center shrink-0 font-bold text-xs">3</span>
                      <p>Confirm the installation to access it offline later.</p>
                    </li>
                  </ol>
                </div>
                
                <button
                  onClick={() => { setShowAndroidModal(false); setIsVisible(false); }}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
