"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, PhoneCall, ShieldCheck, ArrowLeft, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { io } from "socket.io-client";

export default function SOSPage() {
  const [status, setStatus] = useState<"idle" | "locating" | "contacting" | "sent_offline" | "sent_online">("idle");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleSOS = async () => {
    setStatus("locating");
    
    // Simulate slight delay for locating
    setTimeout(async () => {
      setStatus("contacting");

      setTimeout(async () => {
        if (!navigator.onLine) {
          // OFFLINE MODE: Trigger native SMS fallback
          window.location.href = "sms:112?body=EMERGENCY SOS: I need help immediately. My location is currently unavailable due to being offline.";
          setStatus("sent_offline");
        } else {
          // ONLINE MODE: Connect to socket and emit
          try {
            const token = localStorage.getItem("token");
            if (!token) {
              // If not logged in, we can't emit a patient SOS via socket
              // Fallback to SMS
              window.location.href = "sms:112?body=EMERGENCY SOS: I need help immediately.";
              setStatus("sent_offline");
              return;
            }

            const socket = io("http://localhost:3001", {
              auth: { token }
            });

            socket.on("connect", () => {
              socket.emit("trigger_sos");
              setStatus("sent_online");
              
              // Disconnect after emitting to save resources
              setTimeout(() => {
                socket.disconnect();
              }, 1000);
            });

            socket.on("connect_error", () => {
              // Fallback if socket server is down
              window.location.href = "sms:112?body=EMERGENCY SOS: I need help immediately.";
              setStatus("sent_offline");
            });

          } catch (e) {
            window.location.href = "sms:112?body=EMERGENCY SOS: I need help immediately.";
            setStatus("sent_offline");
          }
        }
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
      {/* Background radial glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${status !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-red-600/20 blur-[100px] animate-pulse" />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span>Exit</span>
        </Link>
      </div>

      {isOffline && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
          <WifiOff size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Offline Mode</span>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center z-10 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-widest uppercase">Emergency SOS</h1>
          <p className="text-slate-400 text-sm">
            Press the button below to trigger an emergency alert.
          </p>
        </div>

        <div className="relative">
          {/* Ripple effects */}
          {status !== "idle" && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
            </>
          )}

          <motion.button
            whileHover={status === "idle" ? { scale: 1.05 } : {}}
            whileTap={status === "idle" ? { scale: 0.95 } : {}}
            onClick={status === "idle" ? handleSOS : undefined}
            disabled={status !== "idle"}
            className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-2xl transition-all duration-500 ${
              status === "idle" 
                ? "bg-gradient-to-b from-red-500 to-red-700 shadow-red-600/50 hover:shadow-red-500/80 cursor-pointer border-4 border-red-400"
                : "bg-red-800 shadow-red-900/50 cursor-default border-4 border-red-600"
            }`}
          >
            {status === "idle" ? (
              <>
                <AlertTriangle className="text-white w-12 h-12 sm:w-16 sm:h-16" />
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">SOS</span>
              </>
            ) : status === "locating" ? (
              <>
                <MapPin className="text-red-200 animate-bounce w-10 h-10 sm:w-12 sm:h-12" />
                <span className="text-xs sm:text-sm font-bold text-red-200 uppercase tracking-widest">Locating...</span>
              </>
            ) : status === "contacting" ? (
              <>
                <PhoneCall className="text-red-200 animate-pulse w-10 h-10 sm:w-12 sm:h-12" />
                <span className="text-xs sm:text-sm font-bold text-red-200 uppercase tracking-widest">Connecting...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="text-green-400 w-12 h-12 sm:w-16 sm:h-16" />
                <span className="text-xs sm:text-sm font-bold text-green-400 uppercase tracking-widest">Signal Sent</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center">
          {status === "idle" ? (
            <p className="text-sm text-slate-400">
              {isOffline ? "You are offline. Triggering SOS will open your native SMS app to text emergency services." : "Triggering SOS will instantly notify your assigned doctors via the network."}
            </p>
          ) : status === "sent_online" ? (
            <p className="text-sm text-green-400 font-bold">
              Emergency alert has been sent to your connected doctors. Please stay calm.
            </p>
          ) : status === "sent_offline" ? (
            <p className="text-sm text-orange-400 font-bold">
              Network unavailable. Your native SMS app has been opened to contact emergency services.
            </p>
          ) : (
            <p className="text-sm text-slate-300 animate-pulse">
              Please wait while we establish a connection...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
