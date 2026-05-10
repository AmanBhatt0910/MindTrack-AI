"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

interface SOSAlert {
  _id: string;
  patientId: string;
  patientName: string;
  status: string;
  createdAt: string;
}

export default function SOSAlertBanner() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // 1. Fetch any existing active alerts on mount
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/sos", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error("Failed to fetch SOS alerts", err);
      }
    };

    fetchAlerts();

    // 2. Connect to socket for real-time alerts
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketIo = io("http://localhost:3001", {
      auth: { token }
    });

    socketIo.on("connect", () => {
      setSocketConnected(true);
    });

    socketIo.on("new_sos_alert", (alert: SOSAlert) => {
      // Add the new alert to the beginning of the list if it's not already there
      setAlerts((prev) => {
        if (prev.find((a) => a._id === alert._id)) return prev;
        return [alert, ...prev];
      });
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ alertId })
      });

      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      }
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="w-full relative z-[100]">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-red-600 text-white p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between border-b-4 border-red-800 animate-pulse-slow"
          >
            <div className="flex items-center gap-4 mb-3 sm:mb-0">
              <div className="bg-white/20 p-3 rounded-full animate-bounce">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">
                  Emergency SOS Alert
                </h2>
                <p className="text-red-100 font-medium">
                  <span className="font-bold text-white text-lg">{alert.patientName}</span> has triggered an emergency SOS.
                  <span className="opacity-75 text-sm ml-2">
                    ({new Date(alert.createdAt).toLocaleTimeString()})
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleResolve(alert._id)}
              className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-lg active:scale-95"
            >
              <CheckCircle size={20} />
              Mark Resolved
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
