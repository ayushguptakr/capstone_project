import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Submissions from "./pages/Submissions";
import SubmitTask from "./pages/SubmitTask";
import CreateTask from "./pages/CreateTask";
import Quizzes from "./pages/Quizzes";
import TakeQuiz from "./pages/TakeQuiz";
import Leaderboard from "./pages/Leaderboard";
import CreateQuiz from "./pages/CreateQuiz";
import Marketplace from "./pages/Marketplace";
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
import TeacherTasks from "./pages/TeacherTasks";
import RedemptionHistory from "./pages/RedemptionHistory";
import SustainabilityDashboard from "./pages/SustainabilityDashboard";
import GameHistory from "./pages/GameHistory";
import Profile from "./pages/Profile";
import RequireAuth from "./components/RequireAuth";
import RequireStudent from "./components/RequireStudent";
import RequireTeacher from "./components/RequireTeacher";
import GuestOnly from "./components/GuestOnly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Logged-in: quizzes & leaderboard (students + teachers) */}
        <Route
          path="/quizzes"
          element={
            <RequireAuth>
              <Quizzes />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <RequireAuth>
              <TakeQuiz />
            </RequireAuth>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />

        {/* Student (and admin/sponsor) */}
        <Route
          path="/tasks"
          element={
            <RequireStudent>
              <Tasks />
            </RequireStudent>
          }
        />
        <Route
          path="/mysubmissions"
          element={
            <RequireStudent>
              <Submissions />
            </RequireStudent>
          }
        />
        <Route
          path="/submit/:taskId"
          element={
            <RequireStudent>
              <SubmitTask />
            </RequireStudent>
          }
        />
        <Route
          path="/store"
          element={
            <RequireStudent>
              <EcoStore />
            </RequireStudent>
          }
        />
        <Route path="/marketplace" element={<Navigate to="/store" replace />} />
        <Route
          path="/redemption-history"
          element={
            <RequireStudent>
              <RedemptionHistory />
            </RequireStudent>
          }
        />
        <Route
          path="/sustainability-dashboard"
          element={
            <RequireAuth>
              <SustainabilityDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/mini-games"
          element={
            <RequireStudent>
              <MiniGames />
            </RequireStudent>
          }
        />
        <Route
          path="/mini-game/waste-sorting"
          element={
            <RequireStudent>
              <WasteSortingGame />
            </RequireStudent>
          }
        />
        <Route
          path="/mini-game/eco-memory"
          element={
            <RequireStudent>
              <EcoMemoryGame />
            </RequireStudent>
          }
        />
        <Route
          path="/mini-game/climate-hero"
          element={
            <RequireStudent>
              <ClimateHeroGame />
            </RequireStudent>
          }
        />
        <Route
          path="/mini-game/trivia-race"
          element={
            <RequireStudent>
              <EcoTriviaRace />
            </RequireStudent>
          }
        />
        <Route
          path="/mini-game/plant-growth"
          element={
            <RequireStudent>
              <PlantGrowthGame />
            </RequireStudent>
          }
        />
        <Route
          path="/game-history"
          element={
            <RequireStudent>
              <GameHistory />
            </RequireStudent>
          }
        />

        {/* Teacher (and admin) */}
        <Route
          path="/create-task"
          element={
            <RequireTeacher>
              <CreateTask />
            </RequireTeacher>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <RequireTeacher>
              <CreateQuiz />
            </RequireTeacher>
          }
        />
        <Route
          path="/mytasks"
          element={
            <RequireTeacher>
              <TeacherTasks />
            </RequireTeacher>
          }
        />
        <Route
          path="/submissions"
          element={
            <RequireTeacher>
              <TeacherSubmissions />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />
        <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<Navigate to="/teacher-dashboard" replace />} />
        <Route
          path="/teacher/submissions"
          element={
            <RequireTeacher>
              <TeacherSubmissions />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/scheduling"
          element={
            <RequireTeacher>
              <TeacherScheduling />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <RequireTeacher>
              <TeacherStudents />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/content"
          element={
            <RequireTeacher>
              <TeacherContent />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <RequireTeacher>
              <TeacherContent />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/tasks"
          element={
            <RequireTeacher>
              <TeacherContent />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/analytics"
          element={
            <RequireTeacher>
              <TeacherAnalytics />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/announcements"
          element={
            <RequireTeacher>
              <TeacherAnnouncements />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <RequireTeacher>
              <TeacherClasses />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <RequireTeacher>
              <TeacherSettings />
            </RequireTeacher>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
