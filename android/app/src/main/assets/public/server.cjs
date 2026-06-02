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
app.post("/api/gemini/tutor", async (req, res) => {
  const { message, chatHistory, language, mode, standard } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing user message" });
  }
  const ai = getAI();
  if (ai) {
    try {
      const systemInstruction = `You are NexaLearn AI \u2014 an advanced multilingual AI tutor and conversation partner designed for users worldwide.
Your mission is to help users learn, practice, speak, understand, and improve communication skills in ANY world language through natural conversations, pronunciation coaching, grammar correction, translations, and interactive learning.

You support ALL major international languages including but not limited to: English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Punjabi, Urdu, Arabic, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Chinese, Thai, Turkish, Indonesian, Malay, Vietnamese, Dutch, Greek, Hebrew, Persian, Polish, Ukrainian, Romanian, Swahili, Filipino, Nepali, Sinhala, Kannada, Malayalam, Assamese, Sanskrit, Latin, etc.

CURRENT STUDENT SPECIFICATIONS:
- Target Standard/Grade Level: ${standard || "University level"} (Tailor vocabulary and explanation complexity to this grade level perfectly, from Standard/Grade 1 to University graduates)
- Practice Language: ${language || "English"}
- Selected Mode: ${mode || "Daily Conversation"}

Core AI Behavior:
- Speak naturally like a real human tutor.
- Be friendly, supportive, intelligent, and motivating.
- Adapt automatically to beginner, intermediate, or advanced users.
- Keep conversations interactive and engaging.
- Encourage users to continue speaking confidently.
- Use simple explanations for beginners.
- Use fluent native-level communication for advanced learners.

Conversation Rules:
- Always respond naturally.
- Never shame or insult users for mistakes.
- Correct mistakes politely and clearly (and formatting-friendly).
- Continue conversations with follow-up questions.
- Encourage users regularly.
- Keep responses concise unless detailed explanation is requested.

Grammar Correction Style Example:
User: "I goed to market."
AI: "Nice try \u{1F60A}
Correct sentence: 'I went to the market.'

What did you buy there?"

Pronunciation Coaching style:
- Break difficult words into syllables.
- Explain pronunciation in simple phonetics.
- Encourage repetition practice.
- Provide accent guidance gently.

Special Learning Modes rules:
- Beginner Mode: Speak slower, simple words, provide side translations.
- Advanced Mode: Elite native vocabulary, challenging idiom usage.
- Kids Mode: Extremely short, high energy, gaming vocabulary.
- IELTS Practice: Structure feedback like IELTS examiners with score estimation.
- Interview Practice: Challenge user with tough career-specific questions.
- Daily Conversation: Friendly, engaging, lightweight feedback.

Please reply to the user message: "${message}". Engage in the requested practice language directly.`;
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory.slice(-6)) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction
        }
      });
      return res.json({
        success: true,
        reply: response.text || "I was unable to formulate a response. Let us try again!",
        provider: "Gemini 3.5 Flash"
      });
    } catch (e) {
      console.warn("Gemini tutor error. Falling back to offline simulator...", e.message);
    }
  }
  const reply = simulateLanguageTutorResponse(message, language, mode, standard);
  return res.json({
    success: true,
    reply,
    provider: "NexaLearn Local AI Tutor Core (Offline Mode)"
  });
});
function simulateLanguageTutorResponse(message, language, mode, standard) {
  const cleanMsg = message.toLowerCase();
  let langLabel = language || "English";
  let stdLabel = standard || "University";
  if (cleanMsg.includes("hello") || cleanMsg.includes("hi") || cleanMsg.includes("namaste")) {
    return `Hello! \u{1F60A} Natural greeting detected. As your NexaLearn AI Language Tutor for **${langLabel}** (${stdLabel} standard), I am thrilled to chat. Let's practice! How are you doing today?`;
  }
  if (cleanMsg.includes("went") || cleanMsg.includes("goed")) {
    return `Nice try \u{1F60A}

Correct sentence pattern:
**"I went to the market."**

(We always use the past tense 'went' instead of 'goed' in ${langLabel}).

What did you buy or look for there?`;
  }
  if (mode && mode.toLowerCase().includes("ielts")) {
    return `[IELTS Academic Mode - Band 8.5 target] 

Your sentence of "${message}" was grammatically intact. For IELTS, we can upgrade the lexical resource by substituting common verbs with advanced synonyms. 

How do you structure your answer for describing hobbies? Let's keep going!`;
  }
  return `Splendid! I have parsed your practice input in **${langLabel}** at the **${stdLabel}** level. You are doing fantastic! Can you share a bit more about your study goals with me?`;
}
app.post("/api/gemini/talk-teacher", async (req, res) => {
  const { message, chatHistory, subject, mode, standard, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing user message" });
  }
  const ai = getAI();
  if (ai) {
    try {
      const systemInstruction = `You are NexaLearn Talk Teacher AI \u2014 a highly intelligent, friendly, human-like AI teacher that can teach students through real-time conversations and interactive discussions.
Your role is to behave like a real personal teacher who explains topics clearly, answers questions naturally, motivates students, and teaches in an engaging, conversational style.

CURRENT ACADEMIC PARAMETERS:
- Student Grade/Standard Level: ${standard || "University level"} (Adapt explanations from simple Standard 1 vocabulary to deep University analysis based on this setting)
- Subject: ${subject || "General Knowledge"}
- Special Teaching Mode: ${mode || "Revision Mode"}
- Preferred/Target Language: ${language || "English"}

Core Teacher Personality: Friendly, Smart, Patient, Motivating, Supportive, Professional, Interactive, Human-like.

Teaching Style Guidelines:
- Explain concepts simply first using real-life examples and friendly words.
- Then explain deeply if requested or if appropriate for standard levels.
- Encourage students regularly. Never make them feel embarrassed for mistakes. Correct politely and positively.
- Ask interactive questions or mini challenges during lessons.
- Suggest interactive next-step menus frequently. For example, ask if they would like:
  1. Simple explanation
  2. Markdown Diagram/Visual explanation
  3. Quiz practice / Mini Challenge
  4. Real-life examples

Conversation Rules:
- Keep lessons engaging, concise, and highly interactive.
- Continue conversations with friendly follow-up questions.
- Never give robotic or monotonous responses.

Please reply to the user message: "${message}". Communicate naturally in the requested language: "${language || "English"}".`;
      const contents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory.slice(-6)) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction
        }
      });
      return res.json({
        success: true,
        reply: response.text || "Let's explore this topic together! Ask your doubt.",
        provider: "Gemini 3.5 Flash"
      });
    } catch (e) {
      console.warn("Gemini talk-teacher error. Transitioning to local simulation...", e.message);
    }
  }
  const reply = simulateTalkTeacherResponse(message, subject, mode, standard, language);
  return res.json({
    success: true,
    reply,
    provider: "NexaLearn Core AI Tutor Engine (Offline Mode)"
  });
});
function simulateTalkTeacherResponse(message, subject, mode, standard, language) {
  const cleanMsg = message.toLowerCase();
  const subLabel = subject || "Science";
  const stdLabel = standard || "University";
  const langLabel = language || "English";
  if (cleanMsg.includes("photosynthesis")) {
    return `No problem \u{1F60A}

**Photosynthesis** (under *${subLabel}* for *${stdLabel}*) is the beautiful process plants use to make food using sunlight, water, and carbon dioxide.

Think of it like plants cooking their own food inside their green leaves, using sunlight as energy!

Would you like:
1. **Simple explanation**
2. **Diagram explanation**
3. **Quiz practice trivia**
4. **Real-life everyday examples**?`;
  }
  if (cleanMsg.includes("hello") || cleanMsg.includes("hi") || cleanMsg.includes("hey") || cleanMsg.includes("teacher")) {
    return `Hello there! \u{1F44B} I am your NexaLearn AI Talk Teacher! \u{1F393}

I am thrilled to teach you **${subLabel}** at the **${stdLabel}** level. We are set to **${mode || "Revision Mode"}** practicing in **${langLabel}**.

What topic or doubt are we tackling first? You can also ask me for a quick quiz!`;
  }
  if (cleanMsg.includes("quiz") || cleanMsg.includes("test") || cleanMsg.includes("challenge")) {
    return `Excellent decision! Let's do a mini challenge for **${subLabel}** (${stdLabel} level).

**Here is your question:**
What is the primary power house of a biological cell where chemical energy (ATP) is generated?

Take your time! Give me your answer or ask for a Hint! \u{1F4A1}`;
  }
  return `Splendid concept! I have reviewed your point regarding "${message}" under the subject of **${subLabel}**.

Since we are practicing at the **${stdLabel}** level, let's explore this step-by-step. Would you like me to quiz you on this, show a simplified Markdown box diagram, or share a real-world example?`;
}
app.post("/api/gemini/nexagram-creator", async (req, res) => {
  const { mode, topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Please enter a topic or focus area" });
  }
  const ai = getAI();
  if (ai) {
    try {
      let systemPrompt = "";
      if (mode === "caption") {
        systemPrompt = `You are Nexa AI's Creative Social Media Assistant. Generate an elite, highly engaging, visually appealing social media post/reel caption for the student study topic: "${topic}". Include active educational metaphors, 3 relevant study-specific emojis, and a motivational "Call to Action" prompting peers to solve problems. Ensure the output is concise, readable, and ready to post on NexaGram. Limit to 300 characters.`;
      } else if (mode === "hashtags") {
        systemPrompt = `You are a social content wizard. Generate 8 high-performing, trendy, academic, and creative social media hashtags for NexaGram based on this study topic: "${topic}". Ensure they blend learning, gaming, and creator cultures (e.g. #NexaLearn, #StudyStreak, etc.). Return only the hashtags separated by spaces.`;
      } else if (mode === "image_prompt") {
        systemPrompt = `You are a professional design director. Generate a detailed, aesthetic description and concept design prompt for an illustration or dynamic whiteboard graphic for the learning topic: "${topic}". Focus on ultra-futuristic neon purple and electric blue colors, holographic overlays, mathematical coordinates, and clean cyber aesthetics. Keep it structured in 2 short paragraphs.`;
      } else if (mode === "video_ideas") {
        systemPrompt = `You are a producer of short micro-learning snaps and reels. Generate 3 highly engaging short-reel video concepts or mini-scripts for the academic focus: "${topic}". Format them as 3 distinct numbered ideas with short interactive titles, direct hooks, and suggested overlay visual elements. Keep it concise.`;
      } else if (mode === "planner") {
        systemPrompt = `You are a personal learning-content scheduler. Produce a high-converting 3-day content planner to help a student share brief explanations on: "${topic}" over NexaGram. For Day 1, Day 2, and Day 3, specify the Content Title, target core formula or takeaway, and an interactive quiz idea to challenge the followers.`;
      } else {
        systemPrompt = `Generate general creative social media ideas and helper tips for sharing study progress about: "${topic}".`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt
      });
      return res.json({
        success: true,
        result: response.text || "No response generated. Please retry.",
        provider: "Gemini 3.5 Flash"
      });
    } catch (e) {
      console.warn("Gemini nexagram-creator error, drifting to simulation:", e.message);
    }
  }
  let result = "";
  if (mode === "caption") {
    result = `\u{1F9EC} Syncing neural pathways with ${topic}! \u{1F9E0} Re-engineered my formulas and established peak study convergence today. Let's conquer the leaderboard! 

\u{1F525} Interactive Challenge: What's your top technique for studying this? Drop codes below! \u{1F447} #LearnFast`;
  } else if (mode === "hashtags") {
    result = `#NexaLearn #StudyStreak #${topic.replace(/\s+/g, "")} #BattleOfTheBrains #IntellectSpeedrun #STEMLife #NexaGram #QuantumScribbler`;
  } else if (mode === "image_prompt") {
    result = `A gorgeous holographic whiteboard layout illustrating "${topic}" concepts. Neon purple vector graphs flow along Cartesian axes, surrounded by floating particle glows and glowing equations. 

In the center, a 3D translucent brain node glows in electric blue, symbolizing high-velocity synaptic processing beneath a clean dark obsidian workspace background.`;
  } else if (mode === "video_ideas") {
    result = `1. **The 30-Second Speed Run**: Pick the single hardest equation of ${topic} and explain it using the 'Pizza-Slice' metaphor. Hook: "Tired of complicated textbooks?"
2. **Myth vs. Reality**: Tackle the most common mistake students make in ${topic}. Show an incorrect solution getting 'exploded' by a cyber laser overlay!
3. **Formula Hack Sheet**: Screen-record a high-speed whiteboard drawing showing the shorthand trick to memorize ${topic} steps under 10 seconds.`;
  } else if (mode === "planner") {
    result = `\u{1F5D3}\uFE0F **NexaGram 3-Day Speedrun Calendar for ${topic}** 

\u2022 **Day 1: The Foundations Hack** | Reveal the core definition using a futuristic 10-second diagram. Quiz: Ask followers to identify the true dependent variable.
\u2022 **Day 2: Olympiad Trick Prep** | Post a carousel showing a secret symmetry trick to solve complex problems in 3 steps. Quiz: Provide a multiple-choice question where Option B is a typical trap!
\u2022 **Day 3: Speed Challenge Live!** | Share a short clip solving a problem in real time. Challenge followers to beat your 42-second completion mark.`;
  } else {
    result = `Study helper notes for ${topic}: Break concepts into bite-sized segments and share daily whiteboards to lock in consecutive social learning streams!`;
  }
  return res.json({
    success: true,
    result,
    provider: "NexaSnap Local Creator Core (Simulation Mode)"
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
