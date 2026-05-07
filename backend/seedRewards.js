require("dotenv").config();
const mongoose = require("mongoose");
const Reward = require("./models/Reward");

const sampleRewards = [
  // ── Eco Creatures ──────────────────────────────
  {
    name: "Leafling",
    description: "A tiny magical plant creature that cheers you on! Loves sunlight.",
    pointsCost: 100,
    category: "creatures",
    icon: "Sprout",
    stock: -1,
    rarity: "common",
  },
  {
    name: "AquaDrop",
    description: "A bubbly water spirit that keeps your energy flowing.",
    pointsCost: 200,
    category: "creatures",
    icon: "Droplets",
    stock: -1,
    rarity: "rare",
  },
  {
    name: "SolarFlare",
    description: "A fiery sun creature shining with unlimited renewable energy.",
    pointsCost: 350,
    category: "creatures",
    icon: "Sun",
    stock: -1,
    rarity: "epic",
  },
  {
    name: "TerraGuard",
    description: "The ancient earth guardian. The ultimate protector of nature!",
    pointsCost: 800,
    category: "creatures",
    icon: "Mountain",
    stock: -1,
    rarity: "legendary",
  },

  // ── Eco Hero Avatars ─────────────────────
  {
    name: "Eco Kid",
    description: "A bright-eyed kid ready to start their environmental journey.",
    pointsCost: 100,
    category: "avatars",
    icon: "User",
    stock: -1,
    rarity: "common",
  },
  {
    name: "Forest Explorer",
    description: "Equipped with binoculars and an unyielding sense of adventure.",
    pointsCost: 250,
    category: "avatars",
    icon: "Compass",
    stock: -1,
    rarity: "rare",
  },
  {
    name: "Recycling Ninja",
    description: "Swift, silent, and leaves zero trace behind. A master of sorting!",
    pointsCost: 300,
    category: "avatars",
    icon: "Recycle",
    stock: -1,
    rarity: "epic",
  },
  {
    name: "Ocean Protector",
    description: "Guardian of the deep. Keeps the waters pristine and safe.",
    pointsCost: 400,
    category: "avatars",
    icon: "Waves",
    stock: -1,
    rarity: "epic",
  },

  // ── Gadgets (Avatars) ─────────────────────
  {
    name: "Volt the Robot",
    description: "Gadget Buddy: Your cute personal assistant powered by 100% clean energy.",
    pointsCost: 500,
    category: "avatars",
    icon: "Bot",
    stock: -1,
    rarity: "legendary",
  },

  // ── Badges ──────────────────────────────
  {
    name: "Green Guardian Badge",
    description: "Awarded to protectors of the planet who never stop caring.",
    pointsCost: 150,
    category: "badges",
    icon: "ShieldAlert",
    stock: -1,
    rarity: "epic",
  },
  {
    name: "Earth Legend Badge",
    description: "The rarest badge — only for the most dedicated eco-warriors!",
    pointsCost: 800,
    category: "badges",
    icon: "Award",
    stock: -1,
    rarity: "legendary",
  },

  // ── Power-ups ───────────────────────────
  {
    name: "Double XP Boost",
    description: "Earn 2x XP on your next quiz for 24 hours!",
    pointsCost: 120,
    category: "power-ups",
    icon: "Zap",
    stock: -1,
    rarity: "common",
  },
  {
    name: "Streak Shield",
    description: "Protects your streak for one missed day. Keep the momentum!",
    pointsCost: 250,
    category: "power-ups",
    icon: "Flame",
    stock: -1,
    rarity: "rare",
  },
  {
    name: "Galactic Green-Ray",
    description: "Alien Power Card! Instantly solve one tough quiz question.",
    pointsCost: 450,
    category: "power-ups",
    icon: "Satellite",
    stock: -1,
    rarity: "epic",
  },

  // ── Eco Rewards (real-world items) ──────────────────────
  {
    name: "EcoQuest T‑Shirt",
    description: "Premium cotton t‑shirt with EcoQuest logo. Wear your impact!",
    pointsCost: 6000,
    category: "eco-rewards",
    icon: "Shirt",
    stock: 25,
    rarity: "rare",
  },
  {
    name: "Reusable Water Bottle",
    description: "Stainless steel bottle to reduce plastic waste (750ml).",
    pointsCost: 4500,
    category: "eco-rewards",
    icon: "CupSoda",
    stock: 40,
    rarity: "common",
  },
  {
    name: "Plant Seed Pack",
    description: "Seed pack (seasonal). Grow a plant and track your streak.",
    pointsCost: 3000,
    category: "eco-rewards",
    icon: "Sprout",
    stock: 80,
    rarity: "common",
  },
  {
    name: "Eco Plant Pot",
    description: "Biodegradable pot for your seedlings. Perfect for school gardens.",
    pointsCost: 3500,
    category: "eco-rewards",
    icon: "Flower2",
    stock: 60,
    rarity: "common",
  },
  {
    name: "Surprise Goodies Box",
    description: "Mystery eco-goodies: stickers, badges, and small surprises!",
    pointsCost: 8000,
    category: "eco-rewards",
    icon: "PackageOpen",
    stock: 15,
    rarity: "epic",
  },
  {
    name: "School Garden Kit",
    description: "Mini garden starter kit for your class (seeds + tools + guide).",
    pointsCost: 12000,
    category: "eco-rewards",
    icon: "Shovel",
    stock: 6,
    rarity: "legendary",
  },
];

const seedRewards = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project"
    );
    console.log("✅ Connected to MongoDB");

    await Reward.deleteMany({});
    console.log("🗑️  Cleared existing rewards");

    await Reward.insertMany(sampleRewards);
    console.log(`✅ Seeded ${sampleRewards.length} rewards\n`);

    const categories = [...new Set(sampleRewards.map((r) => r.category))];
    categories.forEach((cat) => {
      const items = sampleRewards.filter((r) => r.category === cat);
      console.log(`  📦 ${cat} (${items.length}):`);
      items.forEach((r) => {
        console.log(`     ${r.icon}  ${r.name} — ${r.pointsCost} XP [${r.rarity}]`);
      });
    });

    console.log("\n🎉 Rewards seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding rewards:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

seedRewards();