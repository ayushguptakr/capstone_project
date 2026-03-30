import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import EcoQuestNav from "./EcoQuestNav";
import { getStoredUser } from "../utils/authStorage";
import { apiRequest } from "../api/httpClient";

export default function DashboardLayout() {
  const [globalXp, setGlobalXp] = useState(getStoredUser()?.points || 0);

  // Sync latest XP on layout mount to ensure accuracy across tabs
  useEffect(() => {
    apiRequest("/api/users/profile")
      .then(user => {
        if (user && typeof user.points === "number") {
          setGlobalXp(user.points);
          // Sync storage silently
          const stored = getStoredUser();
          if (stored) {
            stored.points = user.points;
            localStorage.setItem("ecoQuest_user", JSON.stringify(stored));
          }
        }
      })
      .catch((err) => console.log("Silent profile fetch fail", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FBF8] flex flex-col">
      <EcoQuestNav variant="app" xp={globalXp} />
      {/* The main content area explicitly takes up remaining height minus sticky nav */}
      <main className="flex-grow w-full">
        {/* Pass down globalXp and setGlobalXp to any child route that needs to manipulate or read it */}
        <Outlet context={{ globalXp, setGlobalXp }} />
      </main>
    </div>
  );
}
