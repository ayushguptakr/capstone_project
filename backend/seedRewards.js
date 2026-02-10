require("dotenv").config();
const mongoose = require("mongoose");
const Reward = require("./models/Reward");

const sampleRewards = [
  {
    name: "Eco-Friendly Water Bottle",
    description: "Reusable stainless steel water bottle with environmental quotes",
    pointsCost: 150,
    category: "eco-products",
    stock: 50
  },
  {
    name: "Plant a Tree Certificate",
    description: "Certificate for planting a tree in your name with location details",
    pointsCost: 200,
    category: "certificates",
    stock: 100
  },
  {
    name: "Organic Cotton Tote Bag",
    description: "100% organic cotton tote bag with eco-friendly design",
    pointsCost: 120,
    category: "eco-products",
    stock: 30
  },
  {
    name: "Environmental Champion Badge",
    description: "Digital badge recognizing your environmental leadership",
    pointsCost: 300,
    category: "certificates",
    stock: 200
  },
  {
    name: "Solar Power Bank",
    description: "Portable solar-powered phone charger for sustainable energy",
    pointsCost: 400,
    category: "eco-products",
    stock: 20
  },
  {
    name: "Eco-Store Voucher (₹100)",
    description: "Voucher for eco-friendly products at partner stores",
    pointsCost: 250,
    category: "vouchers",
    stock: 75
  },
  {
    name: "Bamboo Stationery Set",
    description: "Complete stationery set made from sustainable bamboo",
    pointsCost: 180,
    category: "eco-products",
    stock: 40
  },
  {
    name: "Green Warrior T-Shirt",
    description: "Organic cotton t-shirt with environmental awareness message",
    pointsCost: 220,
    category: "merchandise",
    stock: 60
  }
];

const seedRewards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project");
    console.log("✅ Connected to MongoDB");

    await Reward.deleteMany({});
    console.log("🗑️ Cleared existing rewards");

    await Reward.insertMany(sampleRewards);
    console.log(`✅ Seeded ${sampleRewards.length} sample rewards`);

    console.log("\n🎉 Rewards seeding completed successfully!");
    sampleRewards.forEach((reward, index) => {
      console.log(`${index + 1}. ${reward.name} - ${reward.pointsCost} points (Stock: ${reward.stock})`);
    });

  } catch (error) {
    console.error("❌ Error seeding rewards:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

seedRewards();