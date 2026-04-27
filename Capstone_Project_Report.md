# CAPSTONE PROJECT REPORT
*(Applicable to CSE/IT students only)*

**ECOQUEST: GAMIFIED ENVIRONMENTAL EDUCATION PLATFORM**

---

## Table of Contents
1. Introduction
2. Profile of the Problem. Rationale/Scope of the study
3. Existing System
   - Introduction
   - Existing Software
   - DFD for present system
   - What’s new in the system to be developed
4. Problem Analysis
   - Product definition
   - Feasibility Analysis
   - Project Plan
5. Software Requirement Analysis
   - Introduction
   - General Description
   - Specific Requirements
6. Design
   - System Design
   - Design Notations
   - Detailed Design
   - Flowcharts
   - Pseudo code
7. Testing
   - Functional testing
   - Structural testing
   - Levels of testing
   - Testing the project
8. Implementation
   - Implementation of the project
   - Conversion Plan
   - Post-Implementation and Software Maintenance
9. Project Legacy
   - Current Status of the project
   - Remaining Areas of concern
   - Technical and Managerial lessons learnt
10. User Manual
11. Source Code / System Snapshots
12. Bibliography

---

# 1. Introduction

Environmental education is one of the most critical requirements of the 21st century. With global temperatures rising, biodiversity declining, and natural resources depleting at unprecedented rates, the need to educate the younger generation about sustainable practices is paramount. However, traditional environmental education often relies on passive learning mechanisms—such as reading textbooks, attending lectures, or watching documentaries. While these methods disseminate information, they often fail to translate knowledge into actionable, real-world behavioral changes.

The fundamental disconnect lies in the lack of immediate reinforcement and engagement. Students understand the theory of climate change or waste management, but they lack the intrinsic or extrinsic motivation to apply this knowledge daily. This gap presents a unique opportunity for technology, specifically gamification and Artificial Intelligence, to revolutionize how environmental education is delivered and consumed.

"EcoQuest: Gamified Environmental Education Platform" is conceptualized and developed to bridge this exact gap. EcoQuest is a full-stack, AI-powered web application built using the modern MERN (MongoDB, Express.js, React.js, Node.js) stack. It transforms the mundane process of learning about the environment into an interactive, highly engaging, and competitive experience. By leveraging the principles of game design—such as points, badges, leaderboards, mini-games, and virtual economies (Green Credits)—EcoQuest encourages students not just to learn, but to act.

At its core, EcoQuest features an AI-driven Adaptive Engine powered by Google Gemini. This engine tracks a student's learning behavioral signals (quiz accuracy, time per question, mistake patterns, and category weaknesses) and dynamically adjusts the difficulty of the educational content. It ensures that students are neither bored by overly simple tasks nor overwhelmed by overly complex ones.

Furthermore, EcoQuest integrates a tangible Sustainability Analytics module. When students perform real-world eco-tasks (like sorting waste or saving energy) and upload evidence, the platform quantifies these actions into measurable impact metrics, such as CO₂ reduced, water saved, and waste diverted. These individual metrics roll up into class-wide and school-wide "Green Ratings," fostering healthy competition between educational institutions.

The primary objective of this capstone project is to deliver a production-ready, scalable, and intuitive platform that schools can adopt to integrate actionable environmental education into their curriculum seamlessly.

---

# 2. Profile of the Problem. Rationale/Scope of the study (Problem Statement)

## Problem Statement
Despite the inclusion of environmental studies in academic curricula globally, there is a stark lack of behavioral transformation among students. Existing educational models are heavily theoretical, lacking interactive, practical, and incentive-driven mechanisms to encourage students to adopt sustainable daily habits. Furthermore, educators lack the tools to effectively track, measure, and quantify the real-world environmental impact of their students.

## Rationale of the Study
The rationale for developing EcoQuest stems from the proven efficacy of gamification in behavioral psychology. When activities are gamified, dopamine release in the brain increases, leading to higher retention rates and a stronger desire to complete tasks. By associating positive environmental actions with digital rewards (Green Credits, Mascot customizations, Leaderboard rankings), the platform creates a positive feedback loop. 

Additionally, the integration of an AI-based Adaptive Engine solves the "one-size-fits-all" problem in current educational software. Students have different learning paces; an adaptive system ensures that learning is personalized, which significantly reduces frustration and abandonment rates.

## Scope of the Study
The scope of EcoQuest is limited but highly focused on primary, middle, and high school ecosystems. The system provides:
1. **For Students:** A portal to play educational mini-games (Waste Sorting, Climate Hero), take quizzes, submit real-world eco-tasks, and redeem rewards in a virtual marketplace.
2. **For Teachers:** A dashboard to assign tasks, verify student submissions (via uploaded images/text), and view granular analytics on class performance.
3. **For Principals/Admins:** A high-level dashboard to view the overall "School Green Rating" and aggregate sustainability impact metrics (e.g., total CO2 saved by the school).

The scope currently excludes direct integration with external hardware sensors (like smart energy meters) and focuses entirely on software-based verification and self-reporting mechanisms, augmented by heuristic validation (duplicate image detection and trust scores).

---

# 3. Existing System

## Introduction
Before the conceptualization of EcoQuest, a thorough analysis of existing systems and methodologies for environmental education was conducted. This section outlines how schools currently handle environmental education and the software solutions that exist in the market.

## Existing Software
The current landscape of environmental education software primarily consists of:
1. **Learning Management Systems (LMS):** Platforms like Google Classroom, Canvas, or Moodle are used by teachers to distribute PDFs or links to videos about the environment. These are purely administrative and lack gamification.
2. **Standalone Quiz Apps:** Applications like Kahoot! or Quizizz allow teachers to create environmental quizzes. While fun, they are ephemeral. Once the quiz is over, the engagement ends. There is no long-term progression or tracking of real-world actions.
3. **Information Portals:** Websites maintained by environmental NGOs (like WWF or Greenpeace) offer vast repositories of information but do not provide personalized learning paths or allow students to log their daily eco-habits.

**Limitations of Existing Systems:**
- **Zero Real-World Action Tracking:** Existing software does not allow students to prove they have taken an eco-friendly action (e.g., planting a sapling) and earn a correlated reward.
- **Static Content:** Content difficulty remains static regardless of the user's proficiency.
- **Lack of Micro-Economies:** No existing educational platform utilizes a virtual currency (like Green Credits) specifically tied to sustainability metrics to drive long-term engagement.

## DFD for Present System
In the existing (manual or basic LMS) system, the Data Flow is linear and highly fragmented:

**Level 0 DFD (Existing System):**
1. The **Teacher** assigns an environmental project (Source) -> [Manual Assignment Process].
2. The **Student** receives the assignment (Destination), completes it on paper or as a basic digital document.
3. The **Student** submits the document back to the **Teacher**.
4. The **Teacher** manually grades it and records it in a [Gradebook / Excel Sheet] (Data Store).

**Issues highlighted by the DFD:** There is no loop for continuous engagement, no data store for "Impact Metrics" (like CO2 saved), and no feedback mechanism to adjust future assignment difficulty based on current performance.

## What’s new in the system to be developed
EcoQuest introduces several paradigm-shifting features:
1. **Adaptive Difficulty Engine:** Uses an algorithm to analyze past performance and adjusts upcoming quiz/game difficulty to maintain the "Flow" state of learning.
2. **Eco-Impact Quantification Engine:** Converts verified tasks into measurable metrics (e.g., 1 tree planted = X kg of CO2 absorbed).
3. **Hybrid Verification System:** Calculates a "Trust Score" (0-100) for student submissions to prevent cheating, utilizing image duplicate detection and timestamp checking.
4. **Virtual Eco-Store:** A marketplace where students spend earned "Green Credits" to unlock Mascot customizations, creating a powerful intrinsic motivation loop.
5. **Multi-Tiered Dashboards:** Distinct User Interfaces for Students, Teachers, and Principals, each displaying role-relevant analytics.

---

# 4. Problem Analysis

## Product Definition
EcoQuest is a cloud-hosted, web-based software application. It is defined as a Gamified Environmental Education Platform (GEEP). The product serves as a supplementary educational tool that schools can license or adopt to run parallel to their standard science or environmental studies curriculum. It is accessible via any modern web browser on desktops, laptops, or tablets.

## Feasibility Analysis

**1. Technical Feasibility:**
The project is highly technically feasible. It utilizes the MERN stack, which is industry-standard, robust, and possesses a vast ecosystem of libraries.
- **Frontend:** React.js provides a responsive, single-page application (SPA) experience. Tailwind CSS ensures rapid UI development.
- **Backend:** Node.js with Express provides non-blocking, asynchronous I/O, perfect for handling multiple concurrent student connections.
- **Database:** MongoDB, a NoSQL database, is ideal for storing flexible, unstructured data like dynamic quiz formats and complex user progression profiles.
- **AI Integration:** Google Gemini API is highly accessible and well-documented for implementing the adaptive logic and recommendations.

**2. Economic Feasibility:**
Since the application relies on open-source technologies (React, Node, MongoDB Community), the primary costs are hosting and third-party API usage.
- **Hosting:** Platforms like Vercel (Frontend) and Render/Heroku (Backend) offer generous free tiers for development and low-cost scaling for production.
- **Database:** MongoDB Atlas provides a free 512MB cluster, sufficient for MVP and early adoption phases.
- **Conclusion:** The project is economically viable for academic development and low-cost deployment.

**3. Operational Feasibility:**
The target audience (students and teachers) is already highly accustomed to using web applications, smartphones, and basic LMS systems post-COVID-19. The UI/UX is designed to be intuitive, borrowing design language from popular consumer games. Therefore, the learning curve is minimal, ensuring high operational feasibility.

## Project Plan
The project was executed using an Agile methodology, broken down into sprints:
- **Sprint 1 (Weeks 1-2):** Requirement gathering, UI/UX Wireframing, Database Schema design.
- **Sprint 2 (Weeks 3-4):** Backend setup, Authentication (JWT), User Role Management.
- **Sprint 3 (Weeks 5-7):** Core Gamification Engine (Points, Badges, Leaderboards) and Quiz Module.
- **Sprint 4 (Weeks 8-10):** Task Submission, Image Upload (Cloudinary), and Teacher Verification module.
- **Sprint 5 (Weeks 11-13):** Integration of Google Gemini AI for Adaptive Engine; Development of Eco-Impact Quantification logic.
- **Sprint 6 (Weeks 14-16):** Frontend integration, React Game development (Waste Sorting, Eco-Memory).
- **Sprint 7 (Weeks 17-18):** System Testing, Bug Fixing, and Deployment.

---

# 5. Software Requirement Analysis

## Introduction
The Software Requirement Specification (SRS) establishes the basis for an agreement between the developers and the stakeholders on what the software product will do. It describes the functional and non-functional requirements of the EcoQuest platform.

## General Description
EcoQuest operates on a client-server architecture. The client is a web browser rendering a React.js application. The server is a Node.js RESTful API handling business logic and communicating with a MongoDB database. External services like Cloudinary are used for media storage.

### User Characteristics
1. **Students:** Tech-savvy but require high engagement. Short attention spans. Need immediate visual feedback and rewards.
2. **Teachers:** Need intuitive interfaces. Time-poor; require streamlined workflows for grading and verifying tasks.
3. **Principals:** Interested in high-level aggregated data. Need easy-to-read charts and overarching metrics.

## Specific Requirements

### Functional Requirements
**FR1. Authentication & Authorization:**
- The system must allow users to register and login securely using email/password.
- The system must support role-based access control (Student, Teacher, Principal, Admin).

**FR2. Gamification Module:**
- The system must award XP (Experience Points) and Green Credits for completing quizzes and tasks.
- The system must maintain a dynamic Leaderboard sorting users by XP.
- The system must unlock digital badges when specific conditions are met.

**FR3. Task and Evidence Management:**
- Students must be able to view assigned eco-tasks.
- Students must be able to upload a photo and text as evidence of task completion.
- Teachers must be able to view, approve, or reject these submissions.

**FR4. Eco-Games and Quizzes:**
- The system must host interactive mini-games (e.g., drag-and-drop waste sorting).
- The system must host multiple-choice quizzes with timed elements.

**FR5. Adaptive Engine:**
- The system must analyze a user's past quiz performance.
- The system must automatically adjust the difficulty of subsequent content based on the analysis.

### Non-Functional Requirements
**NFR1. Performance:**
- The frontend must load within 3 seconds on a standard broadband connection.
- API response times must be under 500ms for 95% of requests.

**NFR2. Security:**
- Passwords must be hashed using `bcrypt` before storage.
- All API endpoints must be secured using JSON Web Tokens (JWT).
- The system must mitigate common web vulnerabilities (XSS, CSRF, SQL/NoSQL Injection).

**NFR3. Usability:**
- The platform must be fully responsive, functioning seamlessly on mobile devices, tablets, and desktops.
- The platform must meet basic WCAG accessibility standards (proper contrast, alt text for images).

### Hardware & Software Requirements
**Development Environment:**
- OS: Windows 10/11, macOS, or Linux.
- IDE: Visual Studio Code.
- Node.js environment (v18.x or higher).

**Deployment Environment:**
- Server capable of running Node.js (e.g., AWS EC2, Heroku, Vercel).
- Managed MongoDB Instance (MongoDB Atlas).

---

# 6. Design

## System Design
EcoQuest follows a classic 3-tier architecture:
1. **Presentation Tier (Frontend):** Developed using React.js. It handles routing (`react-router-dom`), state management, and user interface rendering. It communicates with the backend via RESTful HTTP requests using `axios`.
2. **Logic Tier (Backend):** Developed using Express.js. It contains controllers and services that implement the business logic (e.g., calculating eco-impact, verifying JWTs, executing adaptive algorithms).
3. **Data Tier (Database):** MongoDB stores all persistent data. Mongoose ODM is used to define strict schemas and relationships between entities.

## Design Notations (UML Context)
While visual UML diagrams are typically drawn, the structural relationships can be defined textually:
- **Use Case:** A `Student` actor interacts with `Play Game`, `Take Quiz`, `Submit Task`, and `Buy Reward` use cases. A `Teacher` actor interacts with `Create Task`, `Verify Submission`, and `View Analytics` use cases.
- **Class Diagram Logic:** A `User` entity has a one-to-many relationship with `Submission` and `QuizAttempt`. A `Teacher` belongs to a `School`, and `Students` belong to a `Class` under that `Teacher`.

## Detailed Design (Database Schema)

**1. User Schema:**
- `username` (String, required)
- `email` (String, required, unique)
- `password` (String, hashed)
- `role` (Enum: 'student', 'teacher', 'principal', 'admin')
- `xp` (Number, default: 0)
- `greenCredits` (Number, default: 0)
- `level` (Number, default: 1)
- `schoolId` (ObjectId, ref: 'School')

**2. AdaptiveProfile Schema:**
- `student` (ObjectId, ref: 'User')
- `categories` (Map: String -> Stats Object containing attempts, totalQuestions, correct, avgTimePerQuestionSec, mistakeStreak)
- `lastAdjustments` (Object, stores current recommended difficulty)

**3. EcoImpactLog Schema:**
- `student` (ObjectId, ref: 'User')
- `task` (ObjectId, ref: 'Task')
- `co2Reduced` (Number)
- `waterSaved` (Number)
- `wasteDiverted` (Number)
- `timestamp` (Date)

## Flowcharts (Descriptive)

**Flowchart for Task Submission and Verification:**
1. Start.
2. Student selects "Submit Task".
3. Student uploads Image and adds description.
4. System uploads Image to Cloudinary and gets URL.
5. System creates `Submission` record with status "Pending".
6. System calculates baseline "Trust Score" (checks for duplicate image hashes).
7. If Trust Score < 30, flag for mandatory strict review.
8. Teacher logs in, navigates to "Submissions".
9. Teacher reviews the image and description.
10. Teacher clicks "Approve".
11. System updates Submission status to "Approved".
12. System calculates XP and Green Credits based on Task complexity.
13. System updates Student's profile (XP += Task.xp).
14. System triggers Eco-Impact calculation and creates `EcoImpactLog`.
15. End.

## Pseudo Code: Adaptive Engine Algorithm

```pseudo
FUNCTION computeAdjustments(studentId, categoryFocus):
    profile = getAdaptiveProfile(studentId)
    
    // Extract stats for the specific category
    stats = profile.categories.get(categoryFocus)
    
    IF stats IS NULL:
        RETURN default_settings(difficulty: "easy")
        
    accuracy = stats.correct / stats.totalQuestions
    avgTime = stats.avgTimePerQuestionSec
    mistakes = stats.mistakeStreak
    
    // Determine Recommended Difficulty
    IF accuracy > 0.85 AND mistakes == 0:
        recommendedDifficulty = "hard"
    ELSE IF accuracy > 0.50:
        recommendedDifficulty = "medium"
    ELSE:
        recommendedDifficulty = "easy"
        
    // Determine Hint Availability
    IF mistakes > 3 OR accuracy < 0.40:
        hintsLevel = "high"
    ELSE IF accuracy < 0.70:
        hintsLevel = "medium"
    ELSE:
        hintsLevel = "low"
        
    // Calculate Reward Multiplier
    // Faster, accurate answers give better multipliers
    multiplier = 1.0
    IF recommendedDifficulty == "hard" AND avgTime < targetTime:
        multiplier = 1.5
        
    RETURN { recommendedDifficulty, hintsLevel, multiplier }
END FUNCTION
```

---

# 7. Testing

Testing is a critical phase in the SDLC to ensure the software is robust, secure, and free of defects.

## Functional Testing
Functional testing ensures that the software operates according to the SRS.
- **Authentication Testing:** Verified that users cannot access protected routes without a valid JWT token. Tested incorrect password handling and token expiration.
- **Gamification Logic Testing:** Verified that completing a quiz correctly adds the exact specified amount of XP to the user's profile and updates their level if the threshold is crossed.
- **Upload Testing:** Tested the Cloudinary integration by uploading various image formats (JPG, PNG) and sizes. Verified that files exceeding 5MB are rejected by the Multer middleware.

## Structural Testing (White Box)
Structural testing involves testing the internal structures or workings of an application.
- **API Endpoint Testing:** Used tools like Postman to send GET, POST, PUT, and DELETE requests to the Express routes. Validated the JSON responses, status codes (200 OK, 400 Bad Request, 401 Unauthorized), and error handling middleware.
- **Database Query Testing:** Verified that complex MongoDB aggregation pipelines (used for the Sustainability Analytics Leaderboard) execute efficiently and return accurate, sorted data.

## Levels of Testing
1. **Unit Testing:** Individual functions, particularly utility functions and complex algorithms (like `computeAdaptiveTuning` and `calculateEcoImpact`), were tested in isolation.
2. **Integration Testing:** Tested the interaction between the React frontend and the Express backend. Ensured that form submissions on the frontend correctly translated to database mutations on the backend.
3. **System Testing:** The entire MERN application was tested as a complete entity. This involved deploying the app to a staging environment and simulating real-world usage scenarios.
4. **User Acceptance Testing (UAT):** A small pilot group of simulated users (acting as students and teachers) navigated the platform. Feedback was gathered regarding the UI intuitiveness and game mechanics.

## Testing the Project (Specific Cases)
- **Test Case 1: Adaptive Difficulty Adjustment**
  - *Action:* Simulated a student failing 3 medium-difficulty quizzes in a row.
  - *Expected:* The Adaptive Engine should downgrade the recommended difficulty to "easy" for the next session.
  - *Result:* Pass.
- **Test Case 2: Concurrent API Requests**
  - *Action:* Used an automated script to simulate 100 simultaneous quiz submissions.
  - *Expected:* The server should handle all requests without crashing, utilizing the event loop efficiently.
  - *Result:* Pass.

---

# 8. Implementation

## Implementation of the Project
The implementation phase translates the detailed design into code.
- **Frontend Implementation:** The UI was built using React functional components and hooks (`useState`, `useEffect`, `useContext`). State management for the user session and progression was centralized. `TailwindCSS` was utilized extensively to create a modern, responsive, "glassmorphism" aesthetic suitable for a modern SaaS/Gaming platform. `Framer Motion` was used to add micro-interactions and celebration animations (confetti) upon task completion.
- **Backend Implementation:** The Express.js server was structured using the Controller-Service-Repository pattern to maintain clean, decoupled code. Mongoose was used to define strict schemas. Middleware was implemented for rate limiting (`express-rate-limit`) to prevent brute-force attacks and for verifying JWTs.

## Conversion Plan
For a school migrating from a legacy system (like manual paper tracking) to EcoQuest:
1. **Data Migration:** Since existing systems lack this specific gamified data, the conversion is a "Cold Start." Administrators will bulk upload student and teacher credentials via a CSV import script to generate initial accounts.
2. **Onboarding:** Teachers will undergo a brief training session on how to use the dashboard, create tasks, and verify submissions.
3. **Rollout:** A phased rollout approach. It will be introduced to one grade level first as a pilot before expanding to the entire school.

## Post-Implementation and Software Maintenance
- **Corrective Maintenance:** Addressing any bugs discovered by users in production (e.g., UI glitches on specific mobile browsers).
- **Adaptive Maintenance:** Updating the platform to remain compatible with changing environments (e.g., updating Node.js versions or React libraries to patch security vulnerabilities).
- **Perfective Maintenance:** Adding new features based on user feedback, such as expanding the Eco-Store inventory or adding new mini-games.

---

# 9. Project Legacy

## Current Status of the Project
The EcoQuest platform is currently in a fully functional, production-ready state. The core gamification loops, the role-based dashboards, the AI Adaptive Engine, and the Eco-Impact Analytics modules are fully integrated and operational. The frontend provides a premium, responsive user experience.

## Remaining Areas of Concern
1. **AI Cost Scaling:** As the user base grows, relying heavily on third-party LLM APIs (like Google Gemini) for real-time recommendations could incur significant operational costs. Strategies for caching AI responses or using smaller, locally hosted models need to be explored.
2. **Cheating Mitigation:** While the Trust Score system helps, students might still attempt to upload downloaded internet images for tasks. Implementing more advanced reverse-image search validation is a future requirement.

## Technical and Managerial Lessons Learnt
- **Technical:** Mastered the complexities of managing global state in a large React application. Gained profound insights into designing complex MongoDB aggregation pipelines for real-time analytics. Learned how to integrate and parse outputs from generative AI APIs robustly.
- **Managerial:** Learned the critical importance of scope management. In an Agile environment, it is easy to succumb to "feature creep." Prioritizing the core gamification loop over peripheral features ensured the project was delivered on time.

---

# 10. User Manual

## For Students
1. **Registration & Login:** Navigate to the platform URL. Select "Student" role. Enter your credentials.
2. **Dashboard Overview:** Upon login, you will see your Mascot, current Level, XP, Green Credits, and recommended tasks.
3. **Taking Quizzes:** Click on the "Quizzes" tab. The system will automatically suggest quizzes tailored to your skill level. Complete the quiz before the timer runs out.
4. **Playing Mini-Games:** Navigate to "Mini-Games." Select a game like "Waste Sorting." Drag the trash items into the correct bins (Recycling, Compost, Landfill) to earn points.
5. **Submitting Tasks:** Go to "Missions." Select an active mission (e.g., "Plant a Seedling"). Click "Submit Evidence," upload a photo, and add a description. Wait for teacher approval to receive XP.
6. **Eco-Store:** Click on "Marketplace." Use your earned Green Credits to purchase virtual items, borders, or new skins for your profile mascot.

## For Teachers
1. **Login:** Login using Teacher credentials.
2. **Dashboard:** View high-level metrics for your assigned classes (Average XP, pending submissions).
3. **Verify Submissions:** Go to "Submissions." Review pending tasks. You can see the uploaded image, the calculated "Trust Score," and the student's notes. Click "Approve" or "Reject."
4. **Analytics:** Navigate to "Teacher Analytics" to view which environmental categories your class is struggling with, allowing you to tailor your real-world lectures.

## For Principals
1. **Login:** Login using Principal credentials.
2. **Sustainability Dashboard:** View the aggregate impact of the entire school. See the total CO2 reduced and water saved by all students combined. View the school's overall "Green Rating" to use in promotional materials or sustainability reports.

---

# 11. Source Code / System Snapshots

*(Note: Due to the size of the project, only critical snippets highlighting the novelty of the system are included here).*

### Snapshot 1: Adaptive Engine Core Logic (Node.js/Express)
```javascript
// backend/services/adaptiveDifficultyEngine.js
async function computeAdjustments(studentId, category = null) {
  const profile = await getOrCreateProfile(studentId);
  const entries = Array.from(profile.categories.entries());
  
  // Calculate weakness score based on accuracy, time, and mistakes
  const normalized = entries.map(([cat, stats]) => ({ 
      cat, 
      stats, 
      weakness: categoryWeaknessScore(stats) 
  }));

  // Identify focus category
  normalized.sort((a, b) => b.weakness - a.weakness);
  let focusCategory = category ? getCategoryKey(category) : (normalized[0]?.cat || "general");

  const stats = profile.categories.get(focusCategory) || {};
  const accuracy = (stats.totalQuestions > 0) ? (stats.correct / stats.totalQuestions) : 0.5;

  // Compute tuning parameters
  const tuning = computeAdaptiveTuning({
    accuracy,
    avgTimePerQuestionSec: stats.avgTimePerQuestionSec || 0,
    retryCount: stats.gameRetries || 0,
  });

  profile.lastAdjustments = { focusCategory, ...tuning };
  await profile.save();
  return profile.lastAdjustments;
}
```

### Snapshot 2: Eco-Impact Aggregation (MongoDB)
```javascript
// backend/repositories/ecoImpactLogRepository.js
async function aggregateBySchool(startDate, endDate) {
  return await EcoImpactLog.aggregate([
    { $match: { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo"
      }
    },
    { $unwind: "$studentInfo" },
    {
      $group: {
        _id: "$studentInfo.schoolId",
        totalCO2: { $sum: "$co2Reduced" },
        totalWater: { $sum: "$waterSaved" },
        totalWaste: { $sum: "$wasteDiverted" }
      }
    }
  ]);
}
```

---

# 12. Bibliography

1. **MongoDB Documentation.** (2024). *Mongoose ODM v8.x*. Retrieved from mongoosejs.com/docs/
2. **React Documentation.** (2024). *React Hooks and API Reference*. Retrieved from react.dev
3. **Express.js Documentation.** (2024). *Express - Node.js web application framework*. Retrieved from expressjs.com
4. **Google DeepMind.** (2024). *Gemini API Documentation*. Retrieved from ai.google.dev/docs
5. **Deterding, S., Dixon, D., Khaled, R., & Nacke, L.** (2011). *From game design elements to gamefulness: defining gamification*. Proceedings of the 15th International Academic MindTrek Conference.
6. **Kapp, K. M.** (2012). *The gamification of learning and instruction: game-based methods and strategies for training and education*. John Wiley & Sons.

---
*End of Report.*
