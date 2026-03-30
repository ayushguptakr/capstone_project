import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Submissions from "./pages/Submissions";
import SubmitTask from "./pages/SubmitTask";
import Quizzes from "./pages/Quizzes";
import TakeQuiz from "./pages/TakeQuiz";
import Leaderboard from "./pages/Leaderboard";
import CreateQuiz from "./pages/CreateQuiz";
import EcoStore from "./pages/EcoStore";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherSubmissions from "./pages/TeacherSubmissions";
import TeacherScheduling from "./pages/TeacherScheduling";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherContent from "./pages/TeacherContent";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherSettings from "./pages/TeacherSettings";
import MiniGames from "./pages/MiniGames";
import WasteSortingGame from "./pages/WasteSortingGame";
import EcoMemoryGame from "./pages/EcoMemoryGame";
import ClimateHeroGame from "./pages/ClimateHeroGame";
import EcoTriviaRace from "./pages/EcoTriviaRace";
import PlantGrowthGame from "./pages/PlantGrowthGame";
import TeacherMissions from "./pages/TeacherMissions";
import RedemptionHistory from "./pages/RedemptionHistory";
import SustainabilityDashboard from "./pages/SustainabilityDashboard";
import GameHistory from "./pages/GameHistory";
import Profile from "./pages/Profile";
import MascotCustomize from "./pages/MascotCustomize";
import RequireAuth from "./components/RequireAuth";
import RequireStudent from "./components/RequireStudent";
import RequireTeacher from "./components/RequireTeacher";
import GuestOnly from "./components/GuestOnly";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Guest routes — no navbar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />

        {/* ============================================================
            STUDENT ROUTES — wrapped in DashboardLayout (persistent nav)
            ============================================================ */}
        <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/sustainability-dashboard" element={<SustainabilityDashboard />} />
        </Route>

        {/* Student-only routes — also wrapped in DashboardLayout */}
        <Route element={<RequireStudent><DashboardLayout /></RequireStudent>}>
          <Route path="/missions" element={<Missions />} />
          <Route path="/mysubmissions" element={<Submissions />} />
          <Route path="/submit/:taskId" element={<SubmitTask />} />
          <Route path="/store" element={<EcoStore />} />
          <Route path="/redemption-history" element={<RedemptionHistory />} />
          <Route path="/mini-games" element={<MiniGames />} />
          <Route path="/my-mascot" element={<MascotCustomize />} />
          <Route path="/game-history" element={<GameHistory />} />
        </Route>

        {/* Redirect alias */}
        <Route path="/marketplace" element={<Navigate to="/store" replace />} />

        {/* ============================================================
            FULL-SCREEN GAME ROUTES — NO navbar, immersive experience
            ============================================================ */}
        <Route path="/mini-game/waste-sorting" element={<RequireStudent><WasteSortingGame /></RequireStudent>} />
        <Route path="/mini-game/eco-memory" element={<RequireStudent><EcoMemoryGame /></RequireStudent>} />
        <Route path="/mini-game/climate-hero" element={<RequireStudent><ClimateHeroGame /></RequireStudent>} />
        <Route path="/mini-game/trivia-race" element={<RequireStudent><EcoTriviaRace /></RequireStudent>} />
        <Route path="/mini-game/plant-growth" element={<RequireStudent><PlantGrowthGame /></RequireStudent>} />

        {/* ============================================================
            TEACHER ROUTES — Teacher uses its own TeacherShell layout
            ============================================================ */}
        <Route path="/create-quiz" element={<RequireTeacher><CreateQuiz /></RequireTeacher>} />
        <Route path="/teacher-tasks" element={<RequireTeacher><TeacherMissions /></RequireTeacher>} />
        <Route path="/submissions" element={<RequireTeacher><TeacherSubmissions /></RequireTeacher>} />
        <Route path="/teacher-dashboard" element={<RequireTeacher><TeacherDashboard /></RequireTeacher>} />
        <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<Navigate to="/teacher-dashboard" replace />} />
        <Route path="/teacher/submissions" element={<RequireTeacher><TeacherSubmissions /></RequireTeacher>} />
        <Route path="/teacher/scheduling" element={<RequireTeacher><TeacherScheduling /></RequireTeacher>} />
        <Route path="/teacher/students" element={<RequireTeacher><TeacherStudents /></RequireTeacher>} />
        <Route path="/teacher/content" element={<RequireTeacher><TeacherContent /></RequireTeacher>} />
        <Route path="/teacher/quizzes" element={<RequireTeacher><TeacherContent /></RequireTeacher>} />
        <Route path="/teacher/tasks" element={<RequireTeacher><TeacherContent /></RequireTeacher>} />
        <Route path="/teacher/analytics" element={<RequireTeacher><TeacherAnalytics /></RequireTeacher>} />
        <Route path="/teacher/announcements" element={<RequireTeacher><TeacherAnnouncements /></RequireTeacher>} />
        <Route path="/teacher/classes" element={<RequireTeacher><TeacherClasses /></RequireTeacher>} />
        <Route path="/teacher/settings" element={<RequireTeacher><TeacherSettings /></RequireTeacher>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
