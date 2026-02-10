// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import Tasks from "./pages/Tasks";   // <-- ADD THIS
// import Submissions from "./pages/Submissions";  // <-- ADD THIS


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/dashboard" element={<Dashboard />} />

//         {/* ADD THIS ROUTE */}
//         <Route path="/tasks" element={<Tasks />} />
//         <Route path="/submissions" element={<Submissions />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;




import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import TeacherDashboard from "./pages/TeacherDashboard";
import MiniGames from "./pages/MiniGames";
import WasteSortingGame from "./pages/WasteSortingGame";
import EcoMemoryGame from "./pages/EcoMemoryGame";
import ClimateHeroGame from "./pages/ClimateHeroGame";
import EcoTriviaRace from "./pages/EcoTriviaRace";
import PlantGrowthGame from "./pages/PlantGrowthGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/mysubmissions" element={<Submissions />} />
        <Route path="/submit/:taskId" element={<SubmitTask />} /> 
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quiz/:id" element={<TakeQuiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/mini-games" element={<MiniGames />} />
        <Route path="/mini-game/waste-sorting" element={<WasteSortingGame />} />
        <Route path="/mini-game/eco-memory" element={<EcoMemoryGame />} />
        <Route path="/mini-game/climate-hero" element={<ClimateHeroGame />} />
        <Route path="/mini-game/trivia-race" element={<EcoTriviaRace />} />
        <Route path="/mini-game/plant-growth" element={<PlantGrowthGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
