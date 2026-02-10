import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Marketplace.css";

function Marketplace() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRewards();
    fetchUserPoints();
  }, []);

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/leaderboard/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.student.points);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (userPoints < reward.pointsCost) {
      alert("Insufficient points!");
      return;
    }

    const address = prompt("Enter delivery address:");
    if (!address) return;

    setRedeeming(reward._id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rewardId: reward._id,
          deliveryAddress: address,
        }),
      });

      if (response.ok) {
        alert("Reward redeemed successfully!");
        setUserPoints(userPoints - reward.pointsCost);
        fetchRewards(); // Refresh to update stock
      } else {
        const error = await response.json();
        alert(error.message || "Failed to redeem reward");
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Failed to redeem reward");
    } finally {
      setRedeeming(null);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "eco-products": "🌱",
      "certificates": "🏆",
      "vouchers": "🎫",
      "merchandise": "🎁"
    };
    return icons[category] || "🛍️";
  };

  if (loading) return <div className="loading">Loading marketplace...</div>;

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h1>🛍️ Eco-Marketplace</h1>
        <div className="points-display">
          <span className="points-icon">🏆</span>
          <span className="points-value">{userPoints}</span>
          <span className="points-label">points</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div key={reward._id} className="reward-card">
            <div className="reward-header">
              <span className="category-icon">{getCategoryIcon(reward.category)}</span>
              <div className="stock-badge">Stock: {reward.stock}</div>
            </div>
            
            <h3 className="reward-name">{reward.name}</h3>
            <p className="reward-description">{reward.description}</p>
            
            <div className="reward-footer">
              <div className="points-cost">
                <span className="cost-value">{reward.pointsCost}</span>
                <span className="cost-label">points</span>
              </div>
              
              <button
                className={`redeem-btn ${userPoints < reward.pointsCost ? 'disabled' : ''}`}
                onClick={() => handleRedeem(reward)}
                disabled={userPoints < reward.pointsCost || redeeming === reward._id || reward.stock === 0}
              >
                {redeeming === reward._id ? "Redeeming..." : 
                 reward.stock === 0 ? "Out of Stock" :
                 userPoints < reward.pointsCost ? "Insufficient Points" : "Redeem"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="no-rewards">
          <h3>No rewards available</h3>
          <p>Check back later for new eco-rewards!</p>
        </div>
      )}

      <div className="marketplace-footer">
        <button 
          className="history-btn"
          onClick={() => navigate("/redemption-history")}
        >
          📋 View Redemption History
        </button>
      </div>
    </div>
  );
}

export default Marketplace;