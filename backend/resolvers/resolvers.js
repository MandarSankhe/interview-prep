// resolvers.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const McqTest = require("../models/mcqTest");
const CodeInterview = require("../models/WritingCode");
const Score = require("../models/Score");

const resolvers = {
  Query: {
    // Fetch all users
    users: async () => {
      try {
        return await User.find();
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },
    
    // Fetch mcqTests readings by level
    mcqTestsByLevel: async (_, { level }) => {
      try {
        const exercises = await McqTest.find({ level });
        return exercises;
      } catch (error) {
        console.error("Error fetching MCQ tests by level:", error);
        throw new Error("Failed to fetch MCQ tests by level");
      }
    },
  
    // Fetch all MCQ tests (all exams)
    mcqTests: async () => {
      try {
        return await McqTest.find();
      } catch (error) {
        console.error("Error fetching all MCQ tests:", error);
        throw new Error("Failed to fetch MCQ tests");
      }
    },

    codeInterviews: async () => {
      try {
        return await CodeInterview.find();
      } catch (error) {
        console.error("Error fetching code interviews:", error);
        throw new Error("Failed to fetch code interviews");
      }
    },

    codeInterviewsByLevel: async (_, { level }) => {
      try {
        return await CodeInterview.find({ level });
      } catch (error) {
        console.error("Error fetching code interviews by level:", error);
        throw new Error("Failed to fetch code interviews by level");
      }
    },

    // Scores
    scores: async () => {
      try {
        return await Score.find();
      } catch (error) {
        console.error("Error fetching scores:", error);
        throw new Error("Failed to fetch scores");
      }
    },
  },

  Mutation: {
    // Login
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid email or password");
      }
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        languageLevel: user.languageLevel,
      };
    },

    // Create user
    createUser: async (_, { input }) => {
      try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const newUser = new User({
          ...input,
          password: hashedPassword,
        });
        await newUser.save();
        return newUser;
      } catch (error) {
        console.error("Detailed error creating user:", error.message);
        throw new Error("Failed to create user");
      }
    },

    // Create a new MCQ  exam 
    createMcqTestExercise: async (_, { input }) => {
      try {
        const newExercise = new McqTest(input);
        await newExercise.save();
        return newExercise;
      } catch (error) {
        console.error("Error creating MCQ test exercise:", error);
        throw new Error("Failed to create MCQ test exercise");
      }
    },

    // Create a new score
    createScore: async (_, { input }) => {
      try {
        const newScore = new Score(input);
        await newScore.save();
        return newScore;
      } catch (error) {
        console.error("Error creating score:", error);
        throw new Error("Failed to create score");
      }
    },

    // Create a new writing test
    createCodeInterview: async (_, { input }) => {
      try {
        const newInterview = new CodeInterview({
          title: input.title,
          level: input.level,
          challenge1: input.challenge1,
          challenge2: input.challenge2,
          challenge3: input.challenge3,
        });
        return await newInterview.save();
      } catch (error) {
        console.error("Error creating code interview:", error);
        throw new Error("Failed to create code interview");
      }
    },
  },
};

module.exports = resolvers;
