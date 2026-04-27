# 🌍 EcoQuest: Gamified Environmental Education Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini-green.svg)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EcoQuest** is a cutting-edge, full-stack educational platform designed to transform environmental learning into an engaging, gamified experience. By combining real-world eco-actions with interactive digital rewards, EcoQuest empowers students to become sustainability leaders.

---

## ✨ Key "Hero" Features

### 🤖 AI-Driven Adaptive Engine
- **Dynamic Difficulty**: Automatically adjusts quiz and game difficulty based on student performance.
- **Personalized Recommendations**: Suggests eco-tasks and learning content based on identified "weak categories."
- **Behavioral Analysis**: Tracks accuracy, response time, and mistake patterns to optimize the learning curve.

### 🎮 Eco-Games Suite
- **Waste Sorting**: A fast-paced arcade game for mastering waste segregation.
- **Climate Hero**: Battle environmental threats in an interactive strategy game.
- **Eco-Memory**: Test and improve knowledge of biodiversity through memory matching.
- **Plant Growth**: Learn about botany and care by growing virtual plants with eco-points.
- **Eco-Trivia Race**: Compete against time in high-stakes sustainability trivia.

### 📉 Sustainability Analytics & Impact
- **Impact Quantification**: Converts real-world tasks (like recycling) into measurable metrics: CO₂ reduced, water saved, and waste diverted.
- **School Green Rating**: Aggregated data provides schools with a sustainability grade (A/B/C).
- **Global Leaderboards**: Real-time rankings for individuals, classes, and schools.

### 💰 Eco-Store & Green Credits
- **Green Credit System**: Earn credits for every verified eco-action.
- **Redemption Marketplace**: Spend credits on virtual rewards, profile customizations, and mascot upgrades.
- **Mascot Customization**: Unlock unique skins and items for your personal Eco-Mascot.

---

## 🛠️ Technology Stack

### Frontend
- **React.js (v19)**: Modern UI development with Hooks and Functional Components.
- **TailwindCSS**: Utility-first styling for a sleek, responsive design.
- **Framer Motion**: Smooth, high-performance animations and transitions.
- **Recharts**: Dynamic visualization of sustainability impact and progress.
- **Lucide React**: Premium, scalable iconography.

### Backend
- **Node.js & Express.js**: Scalable server-side architecture.
- **MongoDB & Mongoose**: Flexible NoSQL data modeling.
- **Google Gemini AI**: Integration via `@google/generative-ai` for adaptive intelligence.
- **Cloudinary**: Cloud-based media management for task evidence.
- **JWT & Bcrypt**: Secure authentication and data protection.

---

## 📂 Project Structure

```text
capstone_project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI & Logic Components
│   │   ├── pages/          # Full-page Views (Dashboard, Games, Store)
│   │   ├── hooks/          # Custom React Hooks (Progression, Adaptive)
│   │   └── utils/          # Helper functions
├── backend/                # Node.js Backend
│   ├── controllers/        # Business Logic (AI, Games, Impact)
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   ├── services/           # Core Engines (Adaptive Difficulty, Ranking)
│   └── repositories/       # Data Access Layer
└── docs/                   # Project Documentation & Reports
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)
- Google Gemini API Key (for AI features)

### Installation

1. **Clone the Repo**
   ```bash
   git clone <repository-url>
   cd capstone_project
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file based on the config/example.env
   npm run seed-all   # Populates quizzes and rewards
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   npm start
   ```

---

## 🔐 Role-Based Access

- **Students**: Play games, take quizzes, submit eco-tasks, and customize mascots.
- **Teachers**: Manage classes, create content, verify student tasks, and view class analytics.
- **Principals**: High-level school oversight and sustainability ratings.
- **Admins**: Platform-wide management, user moderation, and system configuration.

---

## 🏆 Acknowledgments

- **Institution**: Lovely Professional University (LPU)
- **Course**: Capstone Project 2025-2026
- **Developer**: Ayush Gupta

---

**🌱 Together, let's make environmental education engaging and impactful!**