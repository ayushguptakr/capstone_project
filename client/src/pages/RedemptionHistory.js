import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RedemptionHistory.css";
import { apiRequest } from "../api/httpClient";

function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const data = await apiRequest("/api/rewards/my-redemptions");
      setRedemptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="redemption-loading">Loading redemption history...</div>;

  return (
    <div className="redemption-history-page">
      <div className="redemption-header">
        <h1>📋 Redemption History</h1>
        <button className="eco-back-btn" onClick={() => navigate("/store")}>
          ← Back to Eco Store
        </button>
      </div>

      <div className="redemption-list">
        {redemptions.length === 0 ? (
          <div className="no-redemptions">
            <p>No redemptions yet. Start earning points and redeem eco-rewards!</p>
          </div>
        ) : (
          redemptions.map((r) => (
            <div key={r._id} className="redemption-card">
              <div className="redemption-reward">{r.reward?.name || "Reward"}</div>
              <div className="redemption-details">
                <span>{r.pointsSpent || r.reward?.pointsCost} pts</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="redemption-status">Completed</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RedemptionHistory;
