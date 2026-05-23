import { Question } from "./types";

// Helper to get random integer between min and max (inclusive)
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to choose random item from array
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to shuffle list of items
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper to guarantee 4 unique options containing the correct answer
function ensureUniqueOptions(correct: string, rawOptions: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  // Always include correct answer first to guarantee its presence
  result.push(correct);
  seen.add(correct);

  for (const opt of rawOptions) {
    if (opt && !seen.has(opt)) {
      result.push(opt);
      seen.add(opt);
    }
  }

  // If we have less than 4 elements due to deduplication, fill them with distinct numeric or string variants
  let attempts = 0;
  while (result.length < 4 && attempts < 50) {
    attempts++;
    // Regex matches all numbers (integers, negatives, decimals) in correct answer
    const match = correct.match(/[-+]?\d*\.?\d+/);
    if (match) {
      const numStr = match[0];
      const num = parseFloat(numStr);
      // Generate a dynamic offset
      const offset = (attempts + randInt(1, 4)) * (Math.random() > 0.5 ? 1 : -1);
      const newNumVal = num + offset;
      
      // Preserve decimal points formatting if any
      const formattedNumVal = numStr.includes('.') 
        ? newNumVal.toFixed(numStr.split('.')[1].length)
        : Math.round(newNumVal).toString();

      const newOpt = correct.replace(numStr, formattedNumVal);
      if (!seen.has(newOpt)) {
        result.push(newOpt);
        seen.add(newOpt);
      }
    } else {
      // String variation suffix
      const newOpt = `${correct} (Alt ${attempts})`;
      if (!seen.has(newOpt)) {
        result.push(newOpt);
        seen.add(newOpt);
      }
    }
  }

  // Slice to exactly 4 and shuffle
  return shuffle(result.slice(0, 4));
}

// AI Question Builder Engine
export function generateAIQuestion(
  category: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme',
  classLevel: string
): Question {
  const idNum = randInt(100000, 999999);
  const qId = `ai_q_${category.toLowerCase().replace(/\s+/g, '_')}_${idNum}`;

  // We parse the class level coefficients to scale number size or difficulty complexity
  let numScale = 1;
  if (classLevel.includes("9")) numScale = 1;
  else if (classLevel.includes("10")) numScale = 1.3;
  else if (classLevel.includes("11")) numScale = 1.6;
  else if (classLevel.includes("12")) numScale = 2.0;
  else if (classLevel.includes("Undergrad") || classLevel.includes("Postgraduate")) numScale = 3.0;

  let questionText = "";
  let options: string[] = [];
  let correctAnswer = "";
  let hint = "";

  // Switch based on categories
  switch (category) {
    case "Algebra": {
      const template = randInt(1, 4);
      if (template === 1) {
        // Linear equation: a * x + b = c
        const a = randInt(2, Math.round(5 * numScale)) * (Math.random() > 0.5 ? 1 : -1);
        const xSolution = randInt(-10, Math.round(10 * numScale));
        const b = randInt(1, Math.round(20 * numScale)) * (Math.random() > 0.5 ? 1 : -1);
        const c = a * xSolution + b;

        questionText = `For ${classLevel}, solve the linear equation for x: ${a}x + (${b}) = ${c}`;
        correctAnswer = `x = ${xSolution}`;
        hint = `Subtract ${b} from both sides to isolate terms, then divide by ${a} to solve for x.`;

        const otherSolutions = [
          xSolution + randInt(1, 3),
          xSolution - randInt(1, 3),
          -xSolution,
          randInt(-5, 15)
        ].filter(v => v !== xSolution);

        const rawOpts = [xSolution, ...otherSolutions].slice(0, 4);
        options = shuffle(rawOpts.map(v => `x = ${v}`));
      } 
      else if (template === 2) {
        // Quadratic equations: factors (x - r1)(x - r2) = x^2 - (r1+r2)x + (r1*r2)
        const r1 = randInt(-5, Math.round(5 * numScale));
        const r2 = r1 === 0 ? 3 : randInt(-4, Math.round(6 * numScale));
        const sumVal = r1 + r2;
        const prodVal = r1 * r2;

        const signSum = sumVal >= 0 ? `-${sumVal}` : `+${Math.abs(sumVal)}`;
        const signProd = prodVal >= 0 ? `+${prodVal}` : `${prodVal}`;

        questionText = `For ${classLevel} Algebra Core: Find the roots of the quadratic function: x^2 ${signSum}x ${signProd} = 0`;
        correctAnswer = `x = ${r1}, ${r2}`;
        hint = `Factor the quadratic into (x - r1)(x - r2) = 0. The sum of roots is ${sumVal} and product is ${prodVal}.`;

        const alt1 = `x = ${r1 + 2}, ${r2 - 2}`;
        const alt2 = `x = ${-r1}, ${-r2}`;
        const alt3 = `x = ${r1}, ${r2 + randInt(1, 3)}`;
        options = shuffle([correctAnswer, alt1, alt2, alt3]);
      }
      else if (template === 3) {
        // Logarithmic relationships
        const base = pickOne([2, 3, 5]);
        const power = randInt(2, Math.round(3 * numScale));
        const resultVal = Math.pow(base, power);

        questionText = `Calculate the logarithmic coefficient: solve for x if log_${base}(x) = ${power}`;
        correctAnswer = `x = ${resultVal}`;
        hint = `The general form log_b(x) = y translates directly to exponential form x = b^y.`;

        options = shuffle([
          `x = ${resultVal}`,
          `x = ${resultVal + base}`,
          `x = ${Math.pow(base, power - 1)}`,
          `x = ${resultVal * base}`
        ]);
      }
      else {
        // Sum of geometric progressions
        const a = randInt(2, 8);
        const rNumerator = 1;
        const rDenominator = pickOne([2, 3, 4]);
        const ratioText = `1/${rDenominator}`;
        
        // Sum = a / (1 - r) => a / ( (rDenom - 1) / rDenom ) => a * rDenom / (rDenom - 1)
        const totalSum = (a * rDenominator) / (rDenominator - 1);
        const displays = totalSum % 1 === 0 ? `${totalSum}` : `${totalSum.toFixed(2)}`;

        questionText = `For ${classLevel}, compute the infinite geometric sum: ${a} + ${a}/${rDenominator} + ${a}/${rDenominator * rDenominator} + ...`;
        correctAnswer = `S = ${displays}`;
        hint = `In geometric series S = a / (1 - r) where initial node value a = ${a} and common ratio r = ${ratioText}.`;

        const otherSums = [
          (totalSum + 1).toFixed(1),
          (totalSum * 1.5).toFixed(1),
          (totalSum - 0.5).toFixed(2),
          "Infinity"
        ];
        options = shuffle([`S = ${displays}`, ...otherSums.map(s => `S = ${s}`)]);
      }
      break;
    }

    case "Geometry": {
      const template = randInt(1, 3);
      if (template === 1) {
        // Pythagorean Theorem hypotenuse
        const baseTriples = [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
          [7, 24, 25]
        ];
        const choice = pickOne(baseTriples);
        const factor = randInt(1, Math.round(2 * numScale));
        const finalBase = choice[0] * factor;
        const finalHeight = choice[1] * factor;
        const finalHyp = choice[2] * factor;

        questionText = `In a right triangle aligned under ${classLevel}, if the base length is ${finalBase} cm and the height is ${finalHeight} cm, find the hypotenuse.`;
        correctAnswer = `${finalHyp} cm`;
        hint = `Apply Pythagoras: Base^2 + Height^2 = Hypotenuse^2. Calculate ${finalBase}^2 + ${finalHeight}^2 = ${finalBase * finalBase + finalHeight * finalHeight}.`;

        options = shuffle([
          `${finalHyp} cm`,
          `${finalHyp + randInt(1, 3)} cm`,
          `${Math.round(finalBase + finalHeight)} cm`,
          `${finalHyp - randInt(1, 2)} cm`
        ]);
      }
      else if (template === 2) {
        // Surface Area of a Cube
        const side = randInt(2, Math.round(6 * numScale));
        const area = 6 * side * side;

        questionText = `Determine the total surface area of a 3D isometric cube with edge side length s = ${side} cm.`;
        correctAnswer = `${area} cm²`;
        hint = `A solid cube has 6 congruent square faces. Each has area s^2. Thus, total area = 6 * s^2.`;

        options = shuffle([
          `${area} cm²`,
          `${side * side * side} cm²`,
          `${4 * side * side} cm²`,
          `${12 * side} cm²`
        ]);
      }
      else {
        // Sector area of circle
        const radius = randInt(3, Math.round(8 * numScale)) * 2;
        const angle = pickOne([60, 90, 120, 180]);
        // Area = (angle / 360) * pi * radius^2
        const fraction = angle / 360;
        const piTermVal = fraction * radius * radius;
        
        questionText = `For class ${classLevel}: Calculate the arc sector area of a circle with radius R = ${radius} cm and central angle θ = ${angle} degrees. (Express with pi coefficient)`;
        correctAnswer = `${piTermVal}pi cm²`;
        hint = `Area of sector = (θ / 360) * pi * R^2. Substitute the values and simplify.`;

        options = shuffle([
          `${piTermVal}pi cm²`,
          `${piTermVal * 2}pi cm²`,
          `${radius * 2} cm²`,
          `${(radius * radius).toFixed(0)}pi cm²`
        ]);
      }
      break;
    }

    case "Physics": {
      const template = randInt(1, 3);
      if (template === 1) {
        // Kinematic equation: d = v_i*t + 1/2 * a * t^2
        const vi = randInt(0, 5);
        const accel = randInt(2, Math.round(6 * numScale)) * 2; // Keep even for clean division
        const time = randInt(2, Math.round(5 * numScale));
        const totalDistance = vi * time + 0.5 * accel * time * time;

        questionText = `A mass kinetic node accelerating for ${classLevel} physics: an object starts with initial velocity = ${vi} m/s and moves on flat friction under acceleration a = ${accel} m/s² for t = ${time} seconds. Find the distance traveled.`;
        correctAnswer = `${totalDistance} m`;
        hint = `Use the kinematic formula: Distance d = v_i * t + 0.5 * a * t^2.`;

        options = shuffle([
          `${totalDistance} m`,
          `${vi * time} m`,
          `${totalDistance + randInt(5, 15)} m`,
          `${accel * time} m`
        ]);
      }
      else if (template === 2) {
        // Ohm's law: V = I * R
        const current = randInt(1, Math.round(4 * numScale)) * 2; 
        const resistance = randInt(5, Math.round(15 * numScale));
        const voltage = current * resistance;

        questionText = `An electrical circuit engineered inside a ${classLevel} grid runs a current of I = ${current} Amperes through a physical resistor of R = ${resistance} Ohms. What is the potential difference?`;
        correctAnswer = `${voltage} V`;
        hint = `Apply Ohm's law directly: V = I * R.`;

        options = shuffle([
          `${voltage} V`,
          `${resistance / current} V`,
          `${voltage + 10} V`,
          `${voltage * 2} V`
        ]);
      }
      else {
        // Force of Gravity: F = m * g
        const mass = randInt(10, Math.round(50 * numScale));
        const force = mass * 10; // gravity approximated to 10 for quick mental calculus

        questionText = `A physical weight test in the lab: Find the gravitational pull force (Weight) exerted on a metal sphere of mass m = ${mass} kg. (Approximating gravitational acceleration g = 10 m/s²)`;
        correctAnswer = `${force} N`;
        hint = `Weight force is calculated as mass * gravity, F = m * g with g = 10.`;

        options = shuffle([
          `${force} N`,
          `${mass} N`,
          `${mass / 10} N`,
          `${force + 50} N`
        ]);
      }
      break;
    }

    case "Chemistry": {
      const template = randInt(1, 3);
      if (template === 1) {
        // pH computation: pH = -log10[H+]
        const exponent = randInt(2, Math.round(5 * numScale));
        const pH = exponent;

        questionText = `A laboratory acid-base analysis: What is the pH level score of an aqueous solution containing a hydrogen ion concentration [H+] of 1.0 × 10^-${exponent} M?`;
        correctAnswer = `pH = ${pH}`;
        hint = `pH is defined as the negative logarithm of hydronium concentration: pH = -log10([H+]).`;

        options = shuffle([
          `pH = ${pH}`,
          `pH = ${14 - pH}`,
          `pH = ${pH + 1.5}`,
          `pH = 7.0`
        ]);
      }
      else if (template === 2) {
        // Gas constant: PV = nRT (concept or standard simplified math)
        const moles = randInt(1, 3);
        const tempK = moles * 100;
        // Let's ask: If moles double and pressure is kept constant, what happens to volume?
        questionText = `Ideal Gas Law: Under constant pressure and temperature settings, if the total molar count of gas atoms (moles) inside a cylinder increases from ${moles} to ${moles * 2}, what is the volumetric change?`;
        correctAnswer = `Volume doubles`;
        hint = `According to Avogadro's hypothesis and Ideal Gas Law (PV = nRT), Volume is directly proportional to the number of moles (n) when P and T are constant.`;

        options = shuffle([
          "Volume doubles",
          "Volume is halved",
          "Volume remains constant",
          "Volume quadruples"
        ]);
      }
      else {
        // Atomic configurations
        const atomicPairs = [
          { name: "Helium", electrons: "1s2", shellVal: "2" },
          { name: "Carbon", electrons: "1s2 2s2 2p2", shellVal: "6" },
          { name: "Oxygen", electrons: "1s2 2s2 2p4", shellVal: "8" },
          { name: "Neon", electrons: "1s2 2s2 2p6", shellVal: "10" }
        ];
        const chosen = pickOne(atomicPairs);

        questionText = `For ${classLevel}, identify the correct total electron count for the neutral ground state element: ${chosen.name}.`;
        correctAnswer = `${chosen.shellVal}`;
        hint = `Neutral ground-state elements have electrons exactly equal to their atomic position number. ${chosen.name}'s configuration is ${chosen.electrons}.`;

        options = shuffle([
          `${chosen.shellVal}`,
          `${parseInt(chosen.shellVal) - 2}`,
          `${parseInt(chosen.shellVal) + 4}`,
          "12"
        ]);
      }
      break;
    }

    case "Biology": {
      const template = randInt(1, 3);
      if (template === 1) {
        // Base pair pairing
        const dnaSequences = [
          { strand: "ATTGC", comp: "TAACG" },
          { strand: "GCTAC", comp: "CGATG" },
          { strand: "AACCG", comp: "TTGGC" }
        ];
        const chosen = pickOne(dnaSequences);

        questionText = `During genomic replication: Find the complementary DNA sequence corresponding to the active strand: 5'-${chosen.strand}-3'.`;
        correctAnswer = `3'-${chosen.comp}-5'`;
        hint = `Inside DNA, Adenine (A) always pairs with Thymine (T), and Cytosine (C) always pairs with Guanine (G).`;

        options = shuffle([
          `3'-${chosen.comp}-5'`,
          `3'-${chosen.strand}-5'`,
          `3'-${chosen.comp.replace(/T/g, 'U')}-5'`,
          `5'-${chosen.comp}-3'`
        ]);
      }
      else if (template === 2) {
        // Genetics / Punnett square
        questionText = `In a genetic cross tracking dominant yellow shell color (Y) and recessive green shell color (y): crossing a heterozygous dominant plant (Yy) with a green homozygous plant (yy) yields what percentage of yellow plants?`;
        correctAnswer = "50%";
        hint = `Heterozygous Yy crossed with homozygous yy yields Yy, Yy, yy, yy. Half of the offspring inherit dominant Y.`;

        options = shuffle(["50%", "25%", "75%", "100%"]);
      }
      else {
        // Cell cycle
        questionText = `Name the specific eukaryotic cell division phase where sister chromatids are pulled apart toward opposite polar structures.`;
        correctAnswer = "Anaphase";
        hint = `Remember PMAT: Prophase (condensation), Metaphase (aligning on equator), Anaphase (disjunction/separating), Telophase (envelope reformation).`;

        options = shuffle(["Anaphase", "Metaphase", "Prophase", "Interphase"]);
      }
      break;
    }

    case "Olympiad": {
      const template = randInt(1, 3);
      if (template === 1) {
        // Multiplier combinations
        const base = pickOne([120, 180, 240, 360]);
        // Prime factors counts formula (a1+1)(a2+1)...
        // 360 = 2^3 * 3^2 * 5^1 => 4 * 3 * 2 = 24 factors
        // 120 = 2^3 * 3^1 * 5^1 => 4 * 2 * 2 = 16 factors
        // 180 = 2^2 * 3^2 * 5^1 => 3 * 3 * 2 = 18 factors
        // 240 = 2^4 * 3^1 * 5^1 => 5 * 2 * 2 = 20 factors
        let factorsCount = 24;
        if (base === 120) factorsCount = 16;
        else if (base === 180) factorsCount = 18;
        else if (base === 240) factorsCount = 20;

        questionText = `Olympiad Number Theory: Determine the exact number of positive integer factors for the highly composite integer ${base}.`;
        correctAnswer = `${factorsCount}`;
        hint = `Decompose into prime power coefficients: base = 2^x * 3^y * 5^z. The number of factors is (x+1)*(y+1)*(z+1).`;

        options = shuffle([
          `${factorsCount}`,
          `${factorsCount - 4}`,
          `${factorsCount + 6}`,
          `${factorsCount / 2}`
        ]);
      }
      else if (template === 2) {
        // Handshake lemma
        const nodes = randInt(8, Math.round(15 * numScale));
        const handshakes = (nodes * (nodes - 1)) / 2;

        questionText = `In a competitive Olympiad assembly, there are ${nodes} math student nodes. If every node shakes hands with every other student node exactly once, what is the total handshake tally?`;
        correctAnswer = `${handshakes}`;
        hint = `Use combinatorial handshake relation: n * (n - 1) / 2 where n is total student nodes.`;

        options = shuffle([
          `${handshakes}`,
          `${nodes * nodes}`,
          `${handshakes - nodes}`,
          `${nodes * (nodes + 1)}`
        ]);
      }
      else {
        // Remainder logic
        const modularMod = pickOne([7, 9, 11]);
        const baseNum = randInt(2, 5);
        const powerExponent = pickOne([12, 16, 20]);
        // Evaluate rem: (base^exp) % modularMod
        // For base=3, exp=16, mod=7 => 3^16 = (3^6)^2 * 3^4 = (1)^2 * 81 = 81 % 7 = 4
        // Let's make it simpler and deterministic:
        let remAns = 1;
        if (baseNum === 3 && powerExponent === 16 && modularMod === 7) remAns = 4;
        else if (baseNum === 2 && powerExponent === 12 && modularMod === 7) remAns = 1; 
        else {
          remAns = Math.pow(baseNum % modularMod, powerExponent) % modularMod;
        }

        questionText = `For ${classLevel} Advanced Algebra: Find the remainder when ${baseNum}^${powerExponent} is divided by the prime divisor ${modularMod}.`;
        correctAnswer = `${remAns}`;
        hint = `Utilize Fermat's Little Theorem or modular cycles: a^(p-1) is congruent to 1 modulo p for prime divisor p.`;

        options = shuffle([
          `${remAns}`,
          `${(remAns + 2) % modularMod}`,
          `0`,
          `${modularMod - 1}`
        ]);
      }
      break;
    }

    case "Board Exams": {
      const template = randInt(1, 2);
      if (template === 1) {
        // Matrix Determinants
        const a = randInt(1, 4);
        const b = randInt(2, 5);
        const c = randInt(1, 4);
        const d = randInt(3, 7);
        const detValue = a * d - b * c;

        questionText = `Board Calculus Exam Prep: Evaluate the determinant of the 2x2 matrix: [[${a}, ${b}], [${c}, ${d}]].`;
        correctAnswer = `${detValue}`;
        hint = `Matrix Determinant form det(A) = a*d - b*c. Compute (${a} * ${d}) - (${b} * ${c}).`;

        options = shuffle([
          `${detValue}`,
          `${a * d + b * c}`,
          `${detValue - 5}`,
          `${a + d - b - c}`
        ]);
      }
      else {
        // Trigonometric limits
        questionText = `Board Exam Calculus: Find the limit of the trigonometric expression as x approaches 0: limit (sin(${Math.round(2 * numScale)}x) / x).`;
        const ansCoeff = Math.round(2 * numScale);
        correctAnswer = `${ansCoeff}`;
        hint = `Use the standard limit constant: limit (sin(kx) / x) as x -> 0 is equal to k.`;

        options = shuffle([
          `${ansCoeff}`,
          "1",
          "0",
          "Infinity"
        ]);
      }
      break;
    }

    case "IQ Tests": {
      const template = randInt(1, 2);
      if (template === 1) {
        // Fibonacci styled sequence
        const term1 = randInt(1, 5);
        const term2 = term1 + randInt(1, 3);
        const term3 = term1 + term2;
        const term4 = term2 + term3;
        const term5 = term3 + term4;
        const missingTerm = term4 + term5;

        questionText = `NexaSnap IQ Sequence Core: Map out the next optimal node coordinate parameter: ${term1}, ${term2}, ${term3}, ${term4}, ${term5}, [?]`;
        correctAnswer = `${missingTerm}`;
        hint = `Examine additive factors: each value is the sum of the preceding two elements (Fibonacci sequence rule).`;

        options = shuffle([
          `${missingTerm}`,
          `${missingTerm + 3}`,
          `${term5 * 2}`,
          `${missingTerm - 2}`
        ]);
      }
      else {
        // Letter sequences
        const sequenceKeys = [
          { seq: "A, D, G, J, [?]", ans: "M", step: "add 3 letters index" },
          { seq: "Z, X, V, T, [?]", ans: "R", step: "subtract 2 letters index" },
          { seq: "B, E, H, K, [?]", ans: "N", step: "add 3 letters index" }
        ];
        const chosenSeq = pickOne(sequenceKeys);

        questionText = `Logical IQ Aptitude: Fill the missing alphabet node to complete the pattern: ${chosenSeq.seq}`;
        correctAnswer = chosenSeq.ans;
        hint = `Notice the alphabet distances: step transitions by ${chosenSeq.step}.`;

        options = shuffle([
          chosenSeq.ans,
          pickOne(["O", "P", "Q", "L"]),
          pickOne(["K", "S", "T", "U"]),
          "W"
        ]);
      }
      break;
    }

    case "Logical Reasoning": {
      const template = randInt(1, 2);
      if (template === 1) {
        // Analytical relations
        const name1 = "Alice";
        const name2 = "Bob";
        const name3 = "Claire";
        questionText = `${name1} is taller than ${name2}, and ${name3} is shorter than ${name2}. Who is the tallest student in this logical node network?`;
        correctAnswer = name1;
        hint = `Order them linearly: ${name1} > ${name2} and ${name2} > ${name3}. Thus ${name1} is on top of coordinates.`;

        options = shuffle([name1, name2, name3, "Cannot be determined"]);
      }
      else {
        // Direct directions tracking
        questionText = `A student leaves their study room and walks 10 meters North, turns right and heads 5 meters East, then turns right again and walks 10 meters South. What is their shortest path back to the study desk?`;
        correctAnswer = "5 meters West";
        hint = `Follow path coordinates: Moving 10m North and 10m South cancels. You are 5m East of departure. Walk West to return.`;

        options = shuffle([
          "5 meters West",
          "5 meters East",
          "10 meters South",
          "25 meters North"
        ]);
      }
      break;
    }

    case "Coding Basics": {
      const template = randInt(1, 2);
      if (template === 1) {
        // Big O notation
        questionText = `Determine the computational Big-O time complexity index for a nested search loop running over list bounds:
for (int i = 0; i < n; i++) {
  for (int j = 1; j < n; j *= 2) {
    // quantum calculation
  }
}`;
        correctAnswer = "O(n log n)";
        hint = `The outer loop ticks n times. The inner loop doubles j, ticking logarithmic log(n) times.`;

        options = shuffle(["O(n log n)", "O(n²)", "O(n)", "O(log n)"]);
      }
      else {
        // Simple recursion
        questionText = `Evaluate the output outcome of this recursive factorial routine with parameter calculate(4):
function calculate(n) {
  if (n <= 1) return 1;
  return n * calculate(n - 1);
}`;
        correctAnswer = "24";
        hint = `Recursion computes factorial: 4 * 3 * 2 * 1 = 24.`;

        options = shuffle(["24", "12", "6", "120"]);
      }
      break;
    }

    default: {
      // English Grammar
      const template = randInt(1, 2);
      if (template === 1) {
        questionText = `Select the grammatically accurate word clause to complete the sentence: "Neither of the AI study systems [?] successfully parsed yet."`;
        correctAnswer = "has been";
        hint = `The pronoun "Neither" takes a singular matching verb form model in formal layouts.`;

        options = shuffle(["has been", "have been", "were", "are"]);
      }
      else {
        questionText = `Identify the correct synonym node matching the academic vocabulary word "Diligent".`;
        correctAnswer = "Assiduous";
        hint = `A diligent student works carefully and with steady attention, which coordinates with assiduous effort.`;

        options = shuffle(["Assiduous", "Indolent", "Spurious", "Transient"]);
      }
      break;
    }
  }

  // Set rewards scaled by difficulty
  let xpRewardArr = { Easy: 100, Medium: 100, Hard: 100, Extreme: 100 };
  let xpRewardValue = xpRewardArr[difficulty] || 100;
  
  let coinRewardArr = { Easy: 5, Medium: 10, Hard: 15, Extreme: 25 };
  let coinRewardValue = coinRewardArr[difficulty] || 8;

  const finalOptions = ensureUniqueOptions(correctAnswer, options);

  return {
    id: qId,
    category,
    difficulty,
    questionText,
    options: finalOptions,
    correctAnswer,
    hint,
    xpReward: xpRewardValue,
    coinReward: coinRewardValue
  };
}

export function generateInitialAIQuestionsList(classLevel: string = "Class 12 / Senior"): Question[] {
  const categories = [
    "Algebra", "Geometry", "Physics", "Chemistry", "Biology", 
    "Olympiad", "Board Exams", "IQ Tests", "Logical Reasoning", 
    "Coding Basics", "English Grammar"
  ];
  const list: Question[] = [];
  const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Extreme')[] = ['Easy', 'Medium', 'Hard', 'Extreme'];
  for (const cat of categories) {
    for (const diff of difficulties) {
      list.push(generateAIQuestion(cat, diff, classLevel));
    }
  }
  return list;
}

