import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, School, Users, LogOut } from "lucide-react";
import { clearAuth } from "../utils/authStorage";
import "../pages/AdminPanel.css";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/schools", label: "Schools", icon: School },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="admin-root" style={{ display: "flex" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <h2>
            EcoQuest <span>/ Admin</span>
          </h2>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button onClick={handleLogout} className="admin-sidebar__logout">
            <LogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area — each page renders via <Outlet /> */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
