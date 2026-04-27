import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import EcoQuestNav from "./EcoQuestNav";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/httpClient";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [globalXp, setGlobalXp] = useState(user?.points || 0);

  // Sync latest XP on layout mount to ensure accuracy across tabs
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    apiRequest("/api/auth/me")
      .then(res => {
        if (cancelled) return;
        const u = res?.user || res;
        if (u && typeof u.points === "number") {
          setGlobalXp(u.points);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F7FBF8] flex flex-col">
      <EcoQuestNav variant="app" xp={globalXp} />
      <main className="flex-grow w-full">
        <Outlet context={{ globalXp, setGlobalXp }} />
      </main>
    </div>
  );
}

