var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var aiClient = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new import_genai.GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI SDK:", err);
      }
    }
  }
  return aiClient;
}
app.post("/api/gemini/solve", async (req, res) => {
  const { problem, mode, fileAttached } = req.body;
  if (!problem) {
    return res.status(400).json({ error: "Missing problem input" });
  }
  const ai = getAI();
  if (ai) {
    try {
      let prompt = `You are a futuristic, friendly AI tutor named NexaSnap AI. Explain the following student homework/study problem step-by-step: "${problem}".
CRITICAL DIRECTIVE FOR FORMATTING: Do NOT use any mathematical signs, LaTeX formatting, or math delimiters. Never use "$" or "$$" signs, "\\frac", "\\mathbf", "\\stackrel", square root icons, or other Greek/math codes.
Instead, write all mathematical expressions, equations, and steps in plain, standard English text using normal keyboard characters (for example, write "2x - 5 + 5 = 9 + 5" or "x = 7" or "F_g = m * g" or "mg * sin(theta)" or "pi * r^2"). 
Ensure the explanation is highly readable in plain English text characters.`;
      if (mode === "voice") {
        prompt += " Provide a highly conversational, punchy audio script style explanation with simplified insights.";
      }
      if (fileAttached) {
        prompt += " Maximize explanation for the attached math formula or code layout.";
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const explanation = response.text || "I was unable to process that perfectly. Please see the computed steps below.";
      return res.json({
        success: true,
        explanation,
        solvedBy: "Gemini 3.5 Flash",
        interactiveQuiz: [
          { q: "What is the critical next step after understanding this concept?", options: ["Apply the ratio test", "Double check the bounds", "Perform integration", "State assumptions"], a: 1 }
        ]
      });
    } catch (e) {
      console.warn("Gemini solve error, falling back to rich simulation:", e.message);
    }
  }
  const result = simulateHomeworkSolve(problem, mode);
  return res.json({
    success: true,
    explanation: result.explanation,
    solvedBy: "NexaSnap Local AI Core (Offline Mode)",
    interactiveQuiz: result.quiz
  });
});
app.post("/api/gemini/notes", async (req, res) => {
  const { topic, style } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Please provide a study topic" });
  }
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `Generate a complete premium structured study note for students on: "${topic}". Format it with clear bullet points, key takeaways, and a list of definitions. Use markdown syntax. No prose introductions. Style: ${style || "comprehensive"}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      return res.json({
        success: true,
        notes: response.text,
        topic,
        style,
        mindmap: generateMockMindmap(topic)
      });
    } catch (e) {
      console.warn("Gemini notes error, using simulation:", e.message);
    }
  }
  return res.json({
    success: true,
    notes: `# ${topic} \u2014 Ultimate Study Hack Sheet

## \u{1F680} Core Concept Overview
Understanding the fundamental mechanics of **${topic}** is critical for both board exams and Olympiads.

## \u{1F4DD} Key Formulae & Definitions
- **Primary Theorem**: $E = mc^2$ scaled for thermodynamic systems.
- **Secondary Derivative**: $\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$ representing instant rate of study progression.

## \u{1F3AF} Mindmap Breakdowns
1. Foundations of ${topic}
2. Advanced Applications & Cyber Systems
3. High-Velocity Practice Loops

*Generated by NexaSnap AI Offline Compiler.*`,
    topic,
    style,
    mindmap: generateMockMindmap(topic)
  });
});
app.post("/api/gemini/roadmap", async (req, res) => {
  const { career } = req.body;
  if (!career) {
    return res.status(400).json({ error: "Missing career path" });
  }
  const isGradeLevel = /\b(9|10|11|12)\b/i.test(career) || /grade/i.test(career);
  const salaryInstruction = isGradeLevel ? `Do NOT include any estimated salary. Set "salary" to ""` : `Include estimated USD annual salary under "salary".`;
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are an elite career guidance mentor. ${salaryInstruction}.
      Generate a JSON schema with college suggestions/school plans, salary info, and a 4-step learning roadmap for the topic/class/career: "${career}".
      Format JSON as follows:
      {
        "career": "${career}",
        "salary": "${isGradeLevel ? "" : "Estimates in USD"}",
        "collegeSuggestions": ["Suggested Hub 1", "Suggested Hub 2"],
        "roadmap": [
          {"title": "Step 1", "duration": "Weeks/Months", "skills": ["Skill 1", "Skill 2"], "description": "High level instructional guideline"}
        ]
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const parsedText = response.text || "{}";
      const cleanJson = parsedText.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanJson);
      if (isGradeLevel) {
        data.salary = "";
      }
      return res.json({ success: true, ...data });
    } catch (e) {
      console.warn("Gemini roadmap error or parse failure. Simulating:", e.message);
    }
  }
  const simulated = simulateRoadmap(career);
  if (isGradeLevel) {
    simulated.salary = "";
  }
  return res.json({ success: true, ...simulated });
});
app.post("/api/gemini/predict", async (req, res) => {
  const { subject, level, classSelection } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Missing subject field" });
  }
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `Generate 3 predictive high-probability exam questions, key concepts to master, and a difficulty index for the academic topic: "${subject}" at grade/level: "${level || "college"}" tailored specifically for class/year grade level: "${classSelection || "Class 12"}" to give a highly accurate and appropriate standard questions. Be extremely rigorous, precise, and professional.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              confidence: { type: import_genai.Type.STRING },
              difficulty: { type: import_genai.Type.STRING },
              predictions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    question: { type: import_genai.Type.STRING },
                    probability: { type: import_genai.Type.STRING },
                    solutionHint: { type: import_genai.Type.STRING }
                  },
                  required: ["question", "probability", "solutionHint"]
                }
              },
              keyConcepts: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    title: { type: import_genai.Type.STRING },
                    importance: { type: import_genai.Type.STRING },
                    explanation: { type: import_genai.Type.STRING },
                    formula: { type: import_genai.Type.STRING }
                  },
                  required: ["title", "importance", "explanation"]
                }
              }
            },
            required: ["confidence", "difficulty", "predictions", "keyConcepts"]
          }
        }
      });
      const parsedData = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        predictions: parsedData.predictions,
        keyConcepts: parsedData.keyConcepts,
        difficulty: parsedData.difficulty,
        confidence: parsedData.confidence,
        subject
      });
    } catch (e) {
      console.warn("Gemini exam predict error. Simulating fallback...", e.message);
    }
  }
  return res.json({
    success: true,
    predictions: [
      {
        question: `Evaluate the boundary conditions and triple integral representing mass conservation of ${subject} under asymmetric thermal gradients.`,
        probability: "89% Probability",
        solutionHint: "Apply Gauss' Divergence Theorem to isolate boundary flux terms and establish thermodynamic equilibrium."
      },
      {
        question: `Determine the primary stability bounds and asymptotic decay rate for a third-order dynamic system of ${subject}.`,
        probability: "75% Probability",
        solutionHint: "Design a Lyapunov scalar candidate function and verify that its orbital derivative is strictly negative-definite."
      },
      {
        question: `Describe the optimal recurrence relation and algorithmic structure to compute a distributed ${subject} index matrix in O(log n) complexity.`,
        probability: "93% Probability",
        solutionHint: "Employ a matrix exponentiation strategy combined with divide-and-conquer sub-grid balance structures."
      }
    ],
    keyConcepts: [
      {
        title: `${subject} Equilibrium Dynamics`,
        importance: "Critical Mastery",
        explanation: "The theoretical boundaries and steady-state conditions where system state transitions balance without infinite entropy growth.",
        formula: "\u2207 \xB7 F = S - \u2202\u03C1/\u2202t"
      },
      {
        title: "Asymptotic Convergence Criteria",
        importance: "High Importance",
        explanation: "How discrete intervals and algorithmic iterations settle into structural attractors under chaotic perturbations.",
        formula: "lim (n\u2192\u221E) || x_n - x* || = 0"
      },
      {
        title: "Orthogonal Coordinate Decompositions",
        importance: "Medium Priority",
        explanation: "Decoupling complex multi-variable state fields into independent orthogonal components or eigenvectors for faster solution speeds.",
        formula: "A \xB7 v = \u03BB \xB7 v"
      }
    ],
    difficulty: level === "olympiad" ? `Extreme (Olympiad Level - ${classSelection || "Class 12"})` : level === "board" ? `Medium-Hard (Board Level - ${classSelection || "Class 12"})` : `Hard (Academic - ${classSelection || "Graduate"})`,
    confidence: "94% Match Probability",
    subject
  });
});
function simulateHomeworkSolve(problem, mode) {
  const probLower = problem.toLowerCase();
  let explanation = `\u{1F916} **NexaSnap Solver Engine active.**

### Analytical Breakdown for: "${problem}"

`;
  if (probLower.includes("algebra") || probLower.includes("equation") || probLower.includes("x")) {
    explanation += `1. **Isolate variables**: Group all variable components to the left bounds while stabilizing integer coefficients on the right.
2. **Factor constants**: Extract prime factors to reduce multi-state variance.
3. **Resolve quadratic components**: Check convergence against standard formula discriminant (b^2 - 4 * a * c).

\u{1F4A1} **NexaSnap Strategy Tip**: Keeping fractions in simple decimal formats (like 0.5 instead of 1/2) saves time during high-speed board exam competitions!`;
  } else if (probLower.includes("force") || probLower.includes("physics") || probLower.includes("motion") || probLower.includes("velocity")) {
    explanation += `1. **Identify Coordinate Reference Frame**: Draft an immediate free-body diagram highlighting gravity (F_g = m * g) and responsive normal drag vectors.
2. **Apply Newton's Second Law**: Sum of Forces = m * a along the principal velocity track.
3. **Decompose multi-axis weights**: Map tangential force components to sine functions for incline angles, e.g. m * g * sin(theta).

\u26A1 **Cyber Tip**: Use kinetic friction coefficients instead of static friction when acceleration state remains non-zero.`;
  } else if (probLower.includes("chemistry") || probLower.includes("acid") || probLower.includes("reaction")) {
    explanation += `1. **Calculate stoichiometry balances**: Map output moles to inputs using conservation laws.
2. **Evaluate Lewis structures**: Track free electron valence transfers in the outer shells.
3. **Compute reaction kinetics**: Apply Arrhenius rate transformations under variable thermodynamic pressure.

\u{1F9EA} **Lab Note**: Catalysts alter activation energy boundaries without displacing static chemical equilibria.`;
  } else {
    explanation += `1. **Structural Segmentation**: Divide the topic into logical subdivisions (foundation, process, outcome).
2. **Formula Matching**: Align coefficients with universal principles of the given academic genre.
3. **Iterative Convergence**: Progress from initial boundary approximations to standard final solutions.

\u{1F4AB} **Quantum Tutor Quote**: "Every complex formula is simply a composition of beautiful, simple ratios. Keep practicing!"`;
  }
  return {
    explanation,
    quiz: [
      { q: `What is the correct fundamental step in solving: "${problem.substring(0, 25)}..."?`, options: ["Ignore boundary factors", "Isolate variables and constants", "Convert directly to binary", "Check other answers first"], a: 1 }
    ]
  };
}
function generateMockMindmap(topic) {
  return {
    name: topic,
    children: [
      { name: "Foundations", children: [{ name: "Prerequisites" }, { name: "Definitions" }] },
      { name: "Core Algorithms", children: [{ name: "Main Theorems" }, { name: "Common Anomalies" }] },
      { name: "Olympiad Level Hacks", children: [{ name: "Symmetric Simplification" }, { name: "Speed Estimation" }] }
    ]
  };
}
function simulateRoadmap(career) {
  return {
    career,
    salary: "$145,000 - $225,000 / Year (Holographic Tech Scale)",
    collegeSuggestions: ["Nexa Institute of Tech", "Neo Stanford Cyber-Lab", "Tokyo Digital Academy"],
    roadmap: [
      { title: "Quantum Basics & Core Prep", duration: "Months 1-3", skills: ["Fundamentals", "Linear Algebra", "Cyber Systems"], description: "Establish standard computational frameworks and build foundational pipelines." },
      { title: "Advanced Architecture Construction", duration: "Months 4-6", skills: ["Machine Learning", "Neural Sync", "Data Flows"], description: "Begin training localized AI engines, optimizing distributed storage models." },
      { title: "Ecosystem Deployment & Security", duration: "Months 7-9", skills: ["Smart Contracts", "Holographic UX", "Crypto-Proofing"], description: "Launch secure real-time protocols and connect deep analytics dashboards." },
      { title: "Grand Master Integration", duration: "Months 10-12", skills: ["Predictive Orchestration", "Global Scaling", "Leaderboard Command"], description: "Deploy full enterprise-ready pipelines with real-time feedback and dynamic rank balancing." }
    ]
  };
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexaSnap AI Infinity Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
