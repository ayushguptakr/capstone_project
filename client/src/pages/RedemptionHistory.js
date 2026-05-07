import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RedemptionHistory.css";
import { apiRequest, isFeatureDisabledError } from "../api/httpClient";
import { formatRedemptionStatus, toneClasses } from "../utils/statusFormat";

function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featureDisabledMessage, setFeatureDisabledMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const data = await apiRequest("/api/rewards/my-redemptions");
      setRedemptions(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      if (isFeatureDisabledError(error)) {
        setFeatureDisabledMessage("Rewards are currently disabled by admin.");
      }
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
        {featureDisabledMessage ? (
          <div className="no-redemptions">
            <p>{featureDisabledMessage}</p>
          </div>
        ) : null}
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
              <div className={`redemption-status border ${toneClasses(formatRedemptionStatus(r.status).tone)}`}>
                {formatRedemptionStatus(r.status).label}
              </div>
              <div className="redemption-helper-text">{formatRedemptionStatus(r.status).helper}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RedemptionHistory;
