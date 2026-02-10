require("dotenv").config();
const mongoose = require("mongoose");
const Quiz = require("./models/Quiz");
const User = require("./models/User");

const sampleQuizzes = [
  {
    title: "Waste Management Basics",
    description: "Test your knowledge about proper waste segregation and recycling practices.",
    difficulty: "easy",
    category: "waste-management",
    questions: [
      {
        question: "Which bin should you use for plastic bottles?",
        options: ["Green bin", "Blue bin", "Red bin", "Yellow bin"],
        correctAnswer: 1,
        points: 5
      },
      {
        question: "What does the 3 R's of waste management stand for?",
        options: ["Reduce, Reuse, Recycle", "Remove, Replace, Restore", "Repair, Renew, Refresh", "Read, Research, Report"],
        correctAnswer: 0,
        points: 5
      },
      {
        question: "Which of these items is biodegradable?",
        options: ["Plastic bag", "Glass bottle", "Banana peel", "Aluminum can"],
        correctAnswer: 2,
        points: 5
      },
      {
        question: "How long does it take for a plastic bottle to decompose?",
        options: ["1 year", "10 years", "100 years", "450+ years"],
        correctAnswer: 3,
        points: 10
      }
    ],
    totalPoints: 25,
    isActive: true
  },
  {
    title: "Energy Conservation Challenge",
    description: "Learn about renewable energy sources and conservation methods.",
    difficulty: "medium",
    category: "energy",
    questions: [
      {
        question: "Which is the most abundant renewable energy source?",
        options: ["Wind", "Solar", "Hydroelectric", "Geothermal"],
        correctAnswer: 1,
        points: 8
      },
      {
        question: "What percentage of energy can LED bulbs save compared to incandescent bulbs?",
        options: ["25%", "50%", "75%", "90%"],
        correctAnswer: 2,
        points: 8
      },
      {
        question: "Which appliance typically uses the most electricity in a home?",
        options: ["Television", "Refrigerator", "Air conditioner", "Computer"],
        correctAnswer: 2,
        points: 8
      },
      {
        question: "What is the greenhouse effect?",
        options: [
          "Plants growing in greenhouses",
          "Trapping of heat in Earth's atmosphere",
          "Green energy production",
          "Photosynthesis process"
        ],
        correctAnswer: 1,
        points: 10
      }
    ],
    totalPoints: 34,
    isActive: true
  },
  {
    title: "Water Conservation Expert",
    description: "Advanced quiz on water conservation techniques and water cycle.",
    difficulty: "hard",
    category: "water",
    questions: [
      {
        question: "What percentage of Earth's water is freshwater?",
        options: ["2.5%", "5%", "10%", "15%"],
        correctAnswer: 0,
        points: 12
      },
      {
        question: "Which method is most effective for water conservation in agriculture?",
        options: ["Flood irrigation", "Sprinkler irrigation", "Drip irrigation", "Manual watering"],
        correctAnswer: 2,
        points: 12
      },
      {
        question: "How much water can a leaky faucet waste per day?",
        options: ["1 liter", "10 liters", "50 liters", "100+ liters"],
        correctAnswer: 3,
        points: 12
      },
      {
        question: "What is greywater?",
        options: [
          "Polluted river water",
          "Rainwater collected from roofs",
          "Wastewater from sinks and showers",
          "Water from industrial processes"
        ],
        correctAnswer: 2,
        points: 15
      }
    ],
    totalPoints: 51,
    isActive: true
  },
  {
    title: "Climate Change Awareness",
    description: "Understanding climate change causes, effects, and solutions.",
    difficulty: "medium",
    category: "climate",
    questions: [
      {
        question: "What is the main cause of current climate change?",
        options: [
          "Natural climate cycles",
          "Solar radiation changes",
          "Human activities",
          "Volcanic eruptions"
        ],
        correctAnswer: 2,
        points: 8
      },
      {
        question: "Which gas contributes most to the greenhouse effect?",
        options: ["Carbon dioxide", "Methane", "Nitrous oxide", "Fluorinated gases"],
        correctAnswer: 0,
        points: 8
      },
      {
        question: "What is carbon footprint?",
        options: [
          "The size of carbon atoms",
          "Amount of CO2 produced by activities",
          "Carbon content in soil",
          "Footprints made of carbon"
        ],
        correctAnswer: 1,
        points: 8
      },
      {
        question: "Which transportation method has the lowest carbon footprint?",
        options: ["Car", "Bus", "Train", "Bicycle"],
        correctAnswer: 3,
        points: 10
      }
    ],
    totalPoints: 34,
    isActive: true
  }
];

const seedQuizzes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project");
    console.log("✅ Connected to MongoDB");

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log("🗑️ Cleared existing quizzes");

    // Find a teacher user to assign as creator (or create a default one)
    let teacher = await User.findOne({ role: "teacher" });
    
    if (!teacher) {
      // Create a default teacher if none exists
      teacher = new User({
        name: "Default Teacher",
        email: "teacher@example.com",
        password: "password123",
        role: "teacher",
        school: "Sample School"
      });
      await teacher.save();
      console.log("👨‍🏫 Created default teacher");
    }

    // Add creator to each quiz
    const quizzesWithCreator = sampleQuizzes.map(quiz => ({
      ...quiz,
      createdBy: teacher._id
    }));

    // Insert sample quizzes
    await Quiz.insertMany(quizzesWithCreator);
    console.log(`✅ Seeded ${sampleQuizzes.length} sample quizzes`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("Sample quizzes created:");
    sampleQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (${quiz.difficulty}) - ${quiz.totalPoints} points`);
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seeder
seedQuizzes();