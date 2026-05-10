"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, PhoneCall, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SOSPage() {
  const [status, setStatus] = useState<"idle" | "locating" | "contacting" | "sent">("idle");

  const handleSOS = () => {
    setStatus("locating");
    setTimeout(() => {
      setStatus("contacting");
      setTimeout(() => {
        setStatus("sent");
      }, 2000);
    }, 2000);
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

      <div className="w-full max-w-md flex flex-col items-center z-10 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-widest uppercase">Emergency SOS</h1>
          <p className="text-slate-400 text-sm">
            Press the button below to simulate an emergency signal.
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
                <span className="text-xs sm:text-sm font-bold text-red-200 uppercase tracking-widest">Contacting...</span>
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
              This is a simulated offline interface. No actual network calls or emergency services will be contacted.
            </p>
          ) : status === "sent" ? (
            <p className="text-sm text-green-400 font-bold">
              Help is on the way. Please stay calm.
            </p>
          ) : (
            <p className="text-sm text-slate-300 animate-pulse">
              Please wait while we establish a secure offline simulation...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
