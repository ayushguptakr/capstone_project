import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SustainabilityDashboard.css";
import { apiRequest } from "../api/httpClient";

function SustainabilityDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest("/api/analytics/sustainability/dashboard");
      setDashboard(data);
    } catch (error) {
      console.error("Error fetching sustainability dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="sustainability-loading">Loading sustainability analytics...</div>;

  const totals = dashboard?.totals || {};
  const trend = dashboard?.monthlyTrend || [];
  const categoryImpact = dashboard?.categoryImpact || [];
  const greenRatings = dashboard?.greenRatings || [];

  return (
    <div className="sustainability-dashboard-page">
      <div className="sustainability-header">
        <h1>🌍 Sustainability Analytics</h1>
        <button className="eco-back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="sustainability-totals">
        <h2>Impact Totals</h2>
        <div className="totals-grid">
          <div className="total-card co2">
            <span className="total-icon">🌫️</span>
            <span className="total-value">{totals.co2Reduced?.toFixed(1) || 0} kg</span>
            <span className="total-label">CO₂ Reduced</span>
          </div>
          <div className="total-card water">
            <span className="total-icon">💧</span>
            <span className="total-value">{totals.waterSaved?.toFixed(1) || 0} L</span>
            <span className="total-label">Water Saved</span>
          </div>
          <div className="total-card waste">
            <span className="total-icon">♻️</span>
            <span className="total-value">{totals.wasteDiverted?.toFixed(1) || 0} kg</span>
            <span className="total-label">Waste Diverted</span>
          </div>
          <div className="total-card energy">
            <span className="total-icon">⚡</span>
            <span className="total-value">{totals.energySaved?.toFixed(1) || 0} kWh</span>
            <span className="total-label">Energy Saved</span>
          </div>
        </div>
      </div>

      {greenRatings.length > 0 && (
        <div className="green-ratings-section">
          <h2>🏫 School Green Ratings</h2>
          <div className="ratings-list">
            {greenRatings.map((r, i) => (
              <div key={i} className={`rating-card rating-${(r.rating || "C").toLowerCase()}`}>
                <span className="rating-grade">{r.rating || "C"}</span>
                <span className="rating-school">{r.school || "School"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {categoryImpact.length > 0 && (
        <div className="category-impact-section">
          <h2>📊 Impact by Category</h2>
          <div className="category-list">
            {categoryImpact.map((c, i) => (
              <div key={i} className="category-row">
                <span>{c.category || "Other"}</span>
                <span>{c.totalImpact?.toFixed(1) || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard && !totals.co2Reduced && !totals.waterSaved && trend.length === 0 && (
        <div className="no-sustainability-data">
          <p>Complete eco-tasks to see sustainability impact here!</p>
        </div>
      )}
    </div>
  );
}

export default SustainabilityDashboard;
