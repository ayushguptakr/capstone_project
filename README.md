# 🌍 Gamified Environmental Education Platform

A full-stack MERN application that transforms environmental education through gamification, encouraging students to learn about sustainability while earning points, badges, and competing on leaderboards.

## 🎯 Project Overview

This platform bridges the gap between environmental knowledge and real-world action by:
- **Gamifying Learning**: Points, badges, levels, and leaderboards
- **Interactive Quizzes**: Eco-quizzes covering waste management, energy, water, climate, and biodiversity
- **Real-world Tasks**: Photo/text evidence submission for eco-actions
- **Progress Tracking**: Personal dashboards and analytics
- **Competition**: Inter-student and inter-school rankings

## 🚀 Features Implemented

### ✅ Core Gamification Features
- **Points System**: Earn points through quizzes and task completion
- **Badge System**: Achievement badges for milestones (Quiz Master, Eco Scholar, etc.)
- **Leaderboards**: Global and school-wise rankings
- **Progress Tracking**: Personal stats and performance analytics
- **Level System**: Experience points and level progression

### ✅ Educational Components
- **Eco-Quizzes**: Interactive quizzes with multiple categories
- **Task Management**: Create and submit eco-tasks with evidence
- **Knowledge Categories**: Waste Management, Energy, Water, Biodiversity, Climate

### ✅ User Roles
- **Students**: Take quizzes, submit tasks, track progress
- **Teachers**: Create quizzes/tasks, verify submissions, view analytics
- **Admin**: Platform management and oversight

### ✅ Eco-Impact & Sustainability (Extended Modules)
- **Eco-Impact Quantification Engine**: Converts eco-tasks into CO₂, water, waste, energy metrics; PSI and configurable coefficients; `eco_impact_logs` with student/class/school aggregation
- **Dynamic Sustainability Ranking**: Adjusted score (time decay, consistency, population normalizer); APIs: `/api/leaderboard/student`, `/class`, `/school`
- **Hybrid Verification**: Trust score (0–100), duplicate image detection, timestamp/geo checks; `flagForReview` for manual review
- **Sustainability Analytics**: Totals, monthly trends, category impact, School Green Rating (A/B/C); `/api/analytics/sustainability/dashboard`
- **Adaptive Recommendations**: Task suggestions by weak category and local focus; `/api/recommendations/tasks`
- **Green Credits**: Earned from impact, redeemable; balance and report: `/api/green-credits/balance`, `/report`
- **Adaptive Eco‑Game Difficulty Engine**: Tracks quiz accuracy + timing + mistakes and mini-game retries; auto-adjusts difficulty, hints, reward multiplier, and task complexity; adaptive APIs: `/api/adaptive-engine/me`, `/api/quizzes/adaptive`, `/api/mini-games/adaptive`

**How to verify:** See **`backend/docs/FEATURE_VERIFICATION.md`** for a full checklist and how to test each feature via API.

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image uploads
- **Multer** for file handling

### Frontend
- **React.js** with React Router
- **CSS3** with responsive design
- **Axios** for API calls

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd capstone_project
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with:
MONGO_URI=mongodb://localhost:27017/capstone_project
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Seed sample quizzes (optional)
npm run seed-quizzes

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start frontend development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎮 How to Use

### For Students:
1. **Register/Login** with student role
2. **Take Eco-Quizzes** to earn points and badges
3. **Complete Tasks** by submitting evidence
4. **Track Progress** on leaderboards and personal dashboard
5. **Compete** with classmates and other schools

### For Teachers:
1. **Register/Login** with teacher role
2. **Create Quizzes** with custom questions and categories
3. **Create Tasks** for students to complete
4. **Verify Submissions** and approve student work
5. **Monitor Progress** through analytics dashboard

## 🏆 Gamification Elements

### Points System
- Quiz completion: 5-15 points per question
- Task completion: 10-50 points per task
- Bonus points for perfect scores

### Badge System
- **Quiz Master**: 100% score on any quiz
- **Eco Scholar**: 500+ total points
- **Task Champion**: 10+ approved tasks
- **Streak Master**: 7-day activity streak

### Leaderboards
- **Global Rankings**: All students across platform
- **School Rankings**: School vs school competition
- **Personal Progress**: Individual achievement tracking

## 📊 Sample Data

The platform includes sample eco-quizzes covering:

1. **Waste Management Basics** (Easy) - 25 points
2. **Energy Conservation Challenge** (Medium) - 34 points  
3. **Water Conservation Expert** (Hard) - 51 points
4. **Climate Change Awareness** (Medium) - 34 points

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quizzes
- `GET /api/quizzes` - Get all active quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/submit` - Submit quiz attempt
- `POST /api/quizzes/create` - Create new quiz (Teacher/Admin)

### Leaderboard
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/progress` - User progress
- `GET /api/leaderboard/schools` - School rankings

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks/create` - Create new task
- `POST /api/submissions` - Submit task evidence

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy-to-use interface for all user types
- **Visual Feedback**: Progress bars, animations, and status indicators
- **Accessibility**: Proper contrast, keyboard navigation, screen reader support

## 🔮 Future Enhancements

- **Eco-Merchandise Store**: Redeem points for rewards
- **Social Features**: Friend system and team challenges
- **Advanced Analytics**: Detailed progress reports
- **Mobile App**: Native iOS/Android applications
- **AI Integration**: Personalized learning recommendations
- **Offline Mode**: Download quizzes for offline completion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Project Type**: Capstone Project
- **Institution**: LPU (Lovely Professional University)
- **Academic Year**: 2025-2026

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**🌱 Together, let's make environmental education engaging and impactful!**