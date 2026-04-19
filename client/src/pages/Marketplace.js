import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, Trophy, Ticket, Package, ShoppingBag, ArrowLeft, ClipboardList } from "lucide-react";
import { IconBox } from "../components";
import { apiRequest } from "../api/httpClient";
import { useAlert } from "../components/ui/AlertProvider";

const categoryIcons = {
  "eco-products": Sprout,
  certificates: Trophy,
  vouchers: Ticket,
  merchandise: Package,
};

function Marketplace() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    Promise.all([
      apiRequest("/api/rewards"),
      apiRequest("/api/leaderboard/progress"),
    ])
      .then(([rewardsData, progData]) => {
        setRewards(rewardsData);
        setUserPoints(progData?.student?.points ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    if (userPoints < reward.pointsCost || reward.stock === 0) return;
    const address = prompt("Delivery address:");
    if (!address) return;

    setRedeeming(reward._id);
    try {
      await apiRequest("/api/rewards/redeem", {
        method: "POST",
        body: { rewardId: reward._id, deliveryAddress: address },
        retries: 0,
      });
      showAlert({ type: "success", message: "Redeemed!" });
      setUserPoints((p) => p - reward.pointsCost);
      setRewards((r) => r.map((x) => (x._id === reward._id ? { ...x, stock: x.stock - 1 } : x)));
    } catch (e) {
      showAlert({ type: "error", message: e.message || "Failed to redeem" });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-eco-primary flex items-center gap-2">
              <IconBox color="yellow" size="sm"><ShoppingBag className="w-5 h-5" strokeWidth={2} /></IconBox>
              Reward Shop
            </h1>
            <p className="text-gray-600">Redeem your XP for prizes!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-eco-accent/40 text-amber-800 font-bold">
              <Trophy className="w-5 h-5" /> {userPoints} XP
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-primary text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </motion.button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r, i) => {
            const canRedeem = userPoints >= r.pointsCost && r.stock > 0;
            return (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-3xl overflow-hidden shadow-card border-2 transition
                  ${canRedeem ? "border-eco-pale hover:shadow-card-hover" : "border-gray-200 opacity-80"}`}
              >
                <div className="p-6">
                  <IconBox color="green" size="lg" className="mb-2 rounded-2xl">
                    {(() => {
                      const CatIcon = categoryIcons[r.category] || Package;
                      return <CatIcon className="w-10 h-10" strokeWidth={2} />;
                    })()}
                  </IconBox>
                  <span className="text-xs font-semibold text-gray-500">Stock: {r.stock}</span>
                  <h3 className="font-display font-bold text-lg text-gray-800 mt-1">{r.name}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{r.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-eco-primary">{r.pointsCost} XP</span>
                    <motion.button
                      whileHover={canRedeem ? { scale: 1.05 } : {}}
                      whileTap={canRedeem ? { scale: 0.95 } : {}}
                      onClick={() => handleRedeem(r)}
                      disabled={!canRedeem || redeeming === r._id}
                      className={`px-4 py-2 rounded-xl font-semibold
                        ${canRedeem ? "bg-eco-primary text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                    >
                      {redeeming === r._id ? "..." : canRedeem ? "Redeem" : "Not enough XP"}
                    </motion.button>
                  </div>
                </div>
                {!canRedeem && userPoints < r.pointsCost && (
                  <div className="px-6 pb-4 text-xs text-gray-400">Need {r.pointsCost - userPoints} more XP</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-card">No rewards yet.</div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/redemption-history")}
          className="mt-6 w-full py-3 rounded-2xl border-2 border-eco-secondary text-eco-secondary font-semibold inline-flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-5 h-5" /> Redemption History
        </motion.button>
      </div>
    </div>
  );
}

export default Marketplace;
