"use strict";

/* =========================================================
   MATH KING
   REAL MATHEMATICS QUESTION SOLVER
   FINAL SCRIPT
   ========================================================= */


/* =========================================================
   GLOBAL SETTINGS
   ========================================================= */

const STORAGE_KEY = "mathSolverHistory";

let currentLanguage = "en";

let recognition = null;
let isListening = false;


/* =========================================================
   DOM
   ========================================================= */

const questionEl = document.getElementById("question");
const solveBtn = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const micText = document.getElementById("micText");
const voiceStatus = document.getElementById("voiceStatus");

const resultSection = document.getElementById("resultSection");
const answerEl = document.getElementById("answer");
const stepsEl = document.getElementById("steps");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const englishBtn = document.getElementById("englishBtn");
const hindiBtn = document.getElementById("hindiBtn");

const standardEl = document.getElementById("standard");


/* =========================================================
   LANGUAGE TEXT
   ========================================================= */

const TEXT = {

    en: {

        title: "Math Auto Solver",
        subtitle: "Real Mathematics Question Solver",

        questionTitle: "Enter Your Math Question",
        questionSubtitle:
            "Type or speak your mathematics question",

        placeholder:
            "Example: (-6) × (-4) + (-20) ÷ 4",

        voice: "Voice",
        listening: "Listening...",

        standard: "Standard / Class",

        solve: "🧮 Solve",
        clear: "🗑️ Clear",

        examples: "Try Examples",

        answer: "Answer",
        finalAnswer: "Final Answer",

        detailed: "Detailed Solution",

        history: "History",
        clearHistory: "Clear History",

        online: "Online",
        offline:
            "Offline — Math King still works",

        enterQuestion:
            "Please enter a mathematics question.",

        cannotSolve:
            "I could not understand this mathematics question.",

        noSpeech:
            "No speech was detected.",

        micUnsupported:
            "Voice input is not supported in this browser.",

        listeningStatus:
            "Listening... Speak your mathematics question.",

        solved:
            "Solved successfully.",

        step: "Step",

        result: "Result",

        confirmClear:
            "Clear all mathematics history?",

        deleted:
            "History item deleted."

    },


    hi: {

        title: "Math Auto Solver",
        subtitle: "वास्तविक गणित प्रश्न समाधान",

        questionTitle:
            "अपना गणित का प्रश्न लिखें",

        questionSubtitle:
            "अपना गणित प्रश्न लिखें या बोलें",

        placeholder:
            "उदाहरण: (-6) × (-4) + (-20) ÷ 4",

        voice: "आवाज़",
        listening: "सुन रहा हूँ...",

        standard: "कक्षा / स्तर",

        solve: "🧮 हल करें",
        clear: "🗑️ साफ करें",

        examples: "उदाहरण आज़माएँ",

        answer: "उत्तर",
        finalAnswer: "अंतिम उत्तर",

        detailed: "विस्तृत समाधान",

        history: "इतिहास",
        clearHistory: "इतिहास साफ करें",

        online: "ऑनलाइन",
        offline:
            "ऑफलाइन — Math King फिर भी काम करेगा",

        enterQuestion:
            "कृपया गणित का प्रश्न लिखें।",

        cannotSolve:
            "मैं इस गणित के प्रश्न को समझ नहीं पाया।",

        noSpeech:
            "कोई आवाज़ नहीं मिली।",

        micUnsupported:
            "इस ब्राउज़र में Voice Input उपलब्ध नहीं है।",

        listeningStatus:
            "सुन रहा हूँ... अपना गणित का प्रश्न बोलें।",

        solved:
            "प्रश्न सफलतापूर्वक हल किया गया।",

        step: "चरण",

        result: "परिणाम",

        confirmClear:
            "क्या आप पूरा गणित इतिहास साफ करना चाहते हैं?",

        deleted:
            "इतिहास हटाया गया।"

    }

};


/* =========================================================
   LANGUAGE SWITCH
   ========================================================= */

function setLanguage(lang) {

    currentLanguage = lang === "hi" ? "hi" : "en";

    const t = TEXT[currentLanguage];

    if (englishBtn) {
        englishBtn.classList.toggle(
            "active",
            currentLanguage === "en"
        );
    }

    if (hindiBtn) {
        hindiBtn.classList.toggle(
            "active",
            currentLanguage === "hi"
        );
    }

    setText("appTitle", t.title);
    setText("appSubtitle", t.subtitle);

    setText("questionTitle", t.questionTitle);
    setText("questionSubtitle", t.questionSubtitle);

    setText("micText", t.voice);
    setText("solveBtn", t.solve);
    setText("clearBtn", t.clear);

    setText("examplesTitle", t.examples);

    setText("answerTitle", t.answer);
    setText("finalAnswerLabel", t.finalAnswer);
    setText("stepsTitle", t.detailed);

    setText("historyTitle", t.history);
    setText("clearHistoryText", t.clearHistory);

    setText("standardLabel", t.standard);

    if (questionEl) {
        questionEl.placeholder = t.placeholder;
    }

    updateConnectionStatus();
}


/* =========================================================
   SAFE TEXT SETTER
   ========================================================= */

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}


/* =========================================================
   NORMALIZE QUESTION
   ========================================================= */

function normalizeQuestion(input) {

    let q = String(input || "").trim();

    q = q
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/√/g, "sqrt")
        .replace(/π/g, "pi")
        .replace(/％/g, "%");

    q = q.replace(/\bmultiplied by\b/gi, "*");
    q = q.replace(/\btimes\b/gi, "*");
    q = q.replace(/\bdivided by\b/gi, "/");
    q = q.replace(/\bdivide by\b/gi, "/");

    q = q.replace(/\bplus\b/gi, "+");
    q = q.replace(/\bminus\b/gi, "-");
    q = q.replace(/\bsubtract\b/gi, "-");

    q = q.replace(/\badd\b/gi, "+");
    q = q.replace(/\binto\b/gi, "*");

    q = q.replace(/\bpower of\b/gi, "^");
    q = q.replace(/\bsquared\b/gi, "^2");
    q = q.replace(/\bcubed\b/gi, "^3");

    q = q.replace(/\bto the power of\b/gi, "^");

    q = q.replace(/\bwhat is\b/gi, "");
    q = q.replace(/\bcalculate\b/gi, "");
    q = q.replace(/\bevaluate\b/gi, "");
    q = q.replace(/\bsolve\b/gi, "");
    q = q.replace(/\bfind\b/gi, "");

    q = q.replace(/\bwhat\s+is\b/gi, "");

    q = replaceNumberWords(q);

    return q.trim();
}


/* =========================================================
   NUMBER WORDS
   ========================================================= */

function replaceNumberWords(text) {

    const map = {

        zero: "0",
        one: "1",
        two: "2",
        three: "3",
        four: "4",
        five: "5",
        six: "6",
        seven: "7",
        eight: "8",
        nine: "9",
        ten: "10",

        eleven: "11",
        twelve: "12",
        thirteen: "13",
        fourteen: "14",
        fifteen: "15",
        sixteen: "16",
        seventeen: "17",
        eighteen: "18",
        nineteen: "19",
        twenty: "20",

        thirty: "30",
        forty: "40",
        fifty: "50",
        sixty: "60",
        seventy: "70",
        eighty: "80",
        ninety: "90",

        hundred: "100",
        thousand: "1000"
    };

    let result = text;

    Object.keys(map)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {

            const regex =
                new RegExp("\\b" + word + "\\b", "gi");

            result = result.replace(
                regex,
                map[word]
            );

        });

    return result;
}


/* =========================================================
   HINDI NUMBER WORDS
   ========================================================= */

function replaceHindiNumbers(text) {

    const map = {

        "शून्य": "0",
        "एक": "1",
        "दो": "2",
        "तीन": "3",
        "चार": "4",
        "पाँच": "5",
        "पांच": "5",
        "छह": "6",
        "छः": "6",
        "सात": "7",
        "आठ": "8",
        "नौ": "9",
        "दस": "10",

        "ग्यारह": "11",
        "बारह": "12",
        "तेरह": "13",
        "चौदह": "14",
        "पंद्रह": "15",
        "सोलह": "16",
        "सत्रह": "17",
        "अठारह": "18",
        "उन्नीस": "19",
        "बीस": "20",

        "तीस": "30",
        "चालीस": "40",
        "पचास": "50",
        "साठ": "60",
        "सत्तर": "70",
        "अस्सी": "80",
        "नब्बे": "90",

        "सौ": "100",
        "हजार": "1000",
        "हज़ार": "1000"
    };

    let result = text;

    Object.keys(map)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {

            result = result.replaceAll(
                word,
                map[word]
            );

        });

    return result;
}


/* =========================================================
   MATH SYMBOL NORMALIZATION
   ========================================================= */

function prepareExpression(input) {

    let q = replaceHindiNumbers(input);

    q = normalizeQuestion(q);

    q = q
        .replace(/\s+/g, " ")
        .trim();

    return q;
}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "Undefined";
    }

    if (Math.abs(value) < 1e-12) {
        value = 0;
    }

    if (
        Math.abs(value - Math.round(value)) <
        1e-12
    ) {

        return String(Math.round(value));

    }

    return Number(value.toFixed(12)).toString();
}


/* =========================================================
   GCD
   ========================================================= */

function gcd(a, b) {

    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));

    while (b !== 0) {

        const temp = b;

        b = a % b;
        a = temp;

    }

    return a;
}


/* =========================================================
   LCM
   ========================================================= */

function lcm(a, b) {

    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));

    if (a === 0 || b === 0) {
        return 0;
    }

    return Math.abs(a * b) / gcd(a, b);
}


/* =========================================================
   SIGN EXPLANATION
   ========================================================= */

function explainSign(a, b, operation) {

    const A = Number(a);
    const B = Number(b);

    if (
        operation === "*" ||
        operation === "/"
    ) {

        const sameSign =
            (A < 0 && B < 0) ||
            (A >= 0 && B >= 0);

        if (sameSign) {

            return currentLanguage === "hi"
                ? "दोनों संख्याओं के चिन्ह समान हैं, इसलिए परिणाम धनात्मक होगा।"
                : "Both numbers have the same sign, so the result is positive.";

        }

        return currentLanguage === "hi"
            ? "दोनों संख्याओं के चिन्ह अलग हैं, इसलिए परिणाम ऋणात्मक होगा।"
            : "The numbers have different signs, so the result is negative.";

    }

    return "";
}


/* =========================================================
   TOKENIZER
   ========================================================= */

function tokenizeExpression(expression) {

    const tokens = [];

    const regex =
        /\d+(?:\.\d+)?|[()+\-*/]/g;

    let match;

    while (
        (match = regex.exec(expression)) !== null
    ) {

        tokens.push(match[0]);

    }

    return tokens;
}


/* =========================================================
   DETAILED PARSER
   ========================================================= */

class DetailedParser {

    constructor(expression) {

        this.expression = expression;

        this.tokens =
            tokenizeExpression(expression);

        this.position = 0;

        this.steps = [];

    }


    current() {

        return this.tokens[this.position];

    }


    consume() {

        return this.tokens[
            this.position++
        ];

    }


    parse() {

        const value =
            this.parseAddition();

        return value;

    }


    parseAddition() {

        let left =
            this.parseMultiplication();

        while (
            this.current() === "+" ||
            this.current() === "-"
        ) {

            const operation =
                this.consume();

            const right =
                this.parseMultiplication();

            const oldLeft = left;
            const oldRight = right;

            if (operation === "+") {

                left = left + right;

            } else {

                left = left - right;

            }

            this.steps.push({

                type: "operation",

                operation,

                left: oldLeft,
                right: oldRight,

                result: left

            });

        }

        return left;

    }


    parseMultiplication() {

        let left =
            this.parseUnary();

        while (
            this.current() === "*" ||
            this.current() === "/"
        ) {

            const operation =
                this.consume();

            const right =
                this.parseUnary();

            const oldLeft = left;
            const oldRight = right;

            if (
                operation === "/" &&
                right === 0
            ) {

                throw new Error(
                    "Division by zero"
                );

            }

            if (operation === "*") {

                left = left * right;

            } else {

                left = left / right;

            }

            this.steps.push({

                type: "operation",

                operation,

                left: oldLeft,
                right: oldRight,

                result: left

            });

        }

        return left;

    }


    parseUnary() {

        if (this.current() === "+") {

            this.consume();

            return this.parseUnary();

        }

        if (this.current() === "-") {

            this.consume();

            return -this.parseUnary();

        }

        return this.parsePrimary();

    }


    parsePrimary() {

        const token = this.current();

        if (token === "(") {

            this.consume();

            const value =
                this.parseAddition();

            if (this.current() !== ")") {

                throw new Error(
                    "Missing closing bracket"
                );

            }

            this.consume();

            return value;

        }

        if (
            token &&
            /^\d+(?:\.\d+)?$/.test(token)
        ) {

            this.consume();

            return Number(token);

        }

        throw new Error(
            "Invalid expression"
        );

    }

}


/* =========================================================
   BUILD DETAILED STEP TEXT
   ========================================================= */

function buildOperationExplanation(step, index) {

    const left =
        formatNumber(step.left);

    const right =
        formatNumber(step.right);

    const result =
        formatNumber(step.result);

    let expression =
        `${left} ${step.operation} ${right}`;

    let explanation = "";

    if (
        step.operation === "*" ||
        step.operation === "/"
    ) {

        explanation =
            explainSign(
                step.left,
                step.right,
                step.operation
            );

    }

    return {

        expression,
        result,
        explanation,
        index

    };

}


/* =========================================================
   DETAILED EXPRESSION SOLVER
   ========================================================= */

function solveDetailedExpression(expression) {

    const clean =
        expression
            .replace(/\^/g, "")
            .trim();

    const parser =
        new DetailedParser(clean);

    const value =
        parser.parse();

    if (
        parser.position !==
        parser.tokens.length
    ) {

        throw new Error(
            "Invalid expression"
        );

    }

    return {

        answer: value,
        steps: parser.steps

    };

}


/* =========================================================
   BODMAS SOLVER
   ========================================================= */

function solveBODMASExpression(expression) {

    let clean =
        expression
            .replace(/=/g, "")
            .trim();

    /* Power */
    if (
        /^[-+]?\d+(?:\.\d+)?\s*\^\s*[-+]?\d+(?:\.\d+)?$/
        .test(clean)
    ) {

        const parts =
            clean.split("^");

        const base =
            Number(parts[0]);

        const exponent =
            Number(parts[1]);

        const answer =
            Math.pow(base, exponent);

        return {

            answer,

            steps: [

                {
                    type: "power",
                    base,
                    exponent,
                    result: answer
                }

            ]

        };

    }


    const solved =
        solveDetailedExpression(clean);

    return solved;

}


/* =========================================================
   FRACTION SOLVER
   ========================================================= */

function solveFraction(question) {

    const q =
        question
            .replace(/\s+/g, "")
            .replace(/÷/g, "/");

    const match =
        q.match(
            /(-?\d+)\s*\/\s*(-?\d+)\s*([+\-*\/])\s*(-?\d+)\s*\/\s*(-?\d+)/
        );

    if (!match) {
        return null;
    }

    const a = Number(match[1]);
    const b = Number(match[2]);
    const op = match[3];
    const c = Number(match[4]);
    const d = Number(match[5]);

    if (b === 0 || d === 0) {
        throw new Error(
            "Fraction denominator cannot be zero."
        );
    }

    let numerator;
    let denominator;

    if (op === "+") {

        numerator =
            a * d + c * b;

        denominator =
            b * d;

    } else if (op === "-") {

        numerator =
            a * d - c * b;

        denominator =
            b * d;

    } else if (op === "*") {

        numerator =
            a * c;

        denominator =
            b * d;

    } else {

        if (c === 0) {
            throw new Error(
                "Cannot divide by zero."
            );
        }

        numerator =
            a * d;

        denominator =
            b * c;

    }

    const divisor =
        gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;

    return {

        answer:
            `${numerator}/${denominator}`,

        numericAnswer:
            numerator / denominator,

        steps: [

            {
                type: "fraction",

                a,
                b,
                c,
                d,
                op,

                numerator,
                denominator

            }

        ]

    };

}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function solvePercentage(question) {

    let q = question
        .replace(/,/g, "")
        .trim();

    let match =
        q.match(
            /(-?\d+(?:\.\d+)?)\s*%\s*(?:of|का)\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {

        match =
            q.match(
                /(-?\d+(?:\.\d+)?)\s*%\s*(-?\d+(?:\.\d+)?)/i
            );

    }

    if (!match) {
        return null;
    }

    const percent =
        Number(match[1]);

    const number =
        Number(match[2]);

    const answer =
        percent * number / 100;

    return {

        answer,

        steps: [

            {
                type: "percentage",
                percent,
                number,
                result: answer
            }

        ]

    };

}


/* =========================================================
   AVERAGE
   ========================================================= */

function solveAverage(question) {

    if (
        !/average|mean|औसत/i.test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length < 2
    ) {

        return null;

    }

    const values =
        numbers.map(Number);

    const sum =
        values.reduce(
            (a, b) => a + b,
            0
        );

    const answer =
        sum / values.length;

    return {

        answer,

        steps: [

            {
                type: "average",
                values,
                sum,
                count: values.length,
                result: answer
            }

        ]

    };

}


/* =========================================================
   HCF
   ========================================================= */

function solveHCF(question) {

    if (
        !/hcf|gcd|greatest common factor|महत्तम समापवर्तक/i
            .test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(/\d+/g);

    if (
        !numbers ||
        numbers.length < 2
    ) {

        return null;

    }

    const values =
        numbers.map(Number);

    let answer = values[0];

    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        answer =
            gcd(answer, values[i]);

    }

    return {

        answer,

        steps: [

            {
                type: "hcf",
                values,
                result: answer
            }

        ]

    };

}


/* =========================================================
   LCM
   ========================================================= */

function solveLCM(question) {

    if (
        !/lcm|least common multiple|लघुत्तम समापवर्त्य/i
            .test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(/\d+/g);

    if (
        !numbers ||
        numbers.length < 2
    ) {

        return null;

    }

    const values =
        numbers.map(Number);

    let answer = values[0];

    for (
        let i = 1;
        i < values.length;
        i++
    ) {

        answer =
            lcm(answer, values[i]);

    }

    return {

        answer,

        steps: [

            {
                type: "lcm",
                values,
                result: answer
            }

        ]

    };

}


/* =========================================================
   SQUARE ROOT
   ========================================================= */

function solveSquareRoot(question) {

    let match =
        question.match(
            /(?:sqrt|square root|वर्गमूल)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/i
        );

    if (!match) {
        return null;
    }

    const number =
        Number(match[1]);

    if (number < 0) {

        throw new Error(
            "Square root of a negative number is not a real number."
        );

    }

    const answer =
        Math.sqrt(number);

    return {

        answer,

        steps: [

            {
                type: "sqrt",
                number,
                result: answer
            }

        ]

    };

}


/* =========================================================
   POWER
   ========================================================= */

function solvePower(question) {

    const match =
        question.match(
            /(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {
        return null;
    }

    const base =
        Number(match[1]);

    const exponent =
        Number(match[2]);

    const answer =
        Math.pow(base, exponent);

    return {

        answer,

        steps: [

            {
                type: "power",
                base,
                exponent,
                result: answer
            }

        ]

    };

}


/* =========================================================
   LINEAR EQUATION
   ax + b = c
   ========================================================= */

function solveLinearEquation(question) {

    if (!/[xX]/.test(question)) {
        return null;
    }

    if (!question.includes("=")) {
        return null;
    }

    const clean =
        question
            .replace(/\s+/g, "")
            .replace(/[?]/g, "");

    const match =
        clean.match(
            /^([+-]?\d*\.?\d*)x([+-]\d+(?:\.\d+)?)?=([+-]?\d+(?:\.\d+)?)$/
        );

    if (!match) {
        return null;
    }

    let a =
        match[1];

    if (a === "" || a === "+") {
        a = 1;
    } else if (a === "-") {
        a = -1;
    } else {
        a = Number(a);
    }

    const b =
        match[2]
            ? Number(match[2])
            : 0;

    const c =
        Number(match[3]);

    if (a === 0) {
        return null;
    }

    const answer =
        (c - b) / a;

    return {

        answer,

        steps: [

            {
                type: "linear",
                a,
                b,
                c,
                result: answer
            }

        ]

    };

}


/* =========================================================
   QUADRATIC EQUATION
   ax² + bx + c = 0
   ========================================================= */

function solveQuadraticEquation(question) {

    const clean =
        question
            .replace(/\s+/g, "")
            .replace(/[?]/g, "")
            .replace(/²/g, "^2");

    if (
        !clean.includes("x") ||
        !clean.includes("=")
    ) {

        return null;

    }

    const match =
        clean.match(
            /^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)=0$/
        );

    if (!match) {
        return null;
    }

    let a = match[1];

    if (a === "" || a === "+") {
        a = 1;
    } else if (a === "-") {
        a = -1;
    } else {
        a = Number(a);
    }

    let b = match[2];

    if (b === "" || b === "+") {
        b = 1;
    } else if (b === "-") {
        b = -1;
    } else {
        b = Number(b);
    }

    let c = match[3];

    if (c === "" || c === "+") {
        c = 0;
    } else {
        c = Number(c);
    }

    const discriminant =
        b * b - 4 * a * c;

    if (discriminant >= 0) {

        const root =
            Math.sqrt(discriminant);

        const x1 =
            (-b + root) / (2 * a);

        const x2 =
            (-b - root) / (2 * a);

        return {

            answer:
                `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`,

            steps: [

                {
                    type: "quadratic",

                    a,
                    b,
                    c,

                    discriminant,

                    x1,
                    x2

                }

            ]

        };

    }


    const realPart =
        -b / (2 * a);

    const imaginaryPart =
        Math.sqrt(-discriminant) /
        Math.abs(2 * a);

    return {

        answer:
            `x₁ = ${formatNumber(realPart)} + ${formatNumber(imaginaryPart)}i, ` +
            `x₂ = ${formatNumber(realPart)} - ${formatNumber(imaginaryPart)}i`,

        steps: [

            {
                type: "quadraticComplex",

                a,
                b,
                c,

                discriminant,

                realPart,
                imaginaryPart

            }

        ]

    };

}


/* =========================================================
   PROFIT / LOSS
   ========================================================= */

function solveProfitLoss(question) {

    if (
        !/profit|loss|लाभ|हानि/i.test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length < 2
    ) {

        return null;

    }

    const values =
        numbers.map(Number);

    const cost =
        values[0];

    const selling =
        values[1];

    if (cost === 0) {
        return null;
    }

    const difference =
        selling - cost;

    const percentage =
        Math.abs(difference) /
        cost *
        100;

    return {

        answer:
            difference >= 0
                ? `Profit = ${formatNumber(difference)}, Profit% = ${formatNumber(percentage)}%`
                : `Loss = ${formatNumber(Math.abs(difference))}, Loss% = ${formatNumber(percentage)}%`,

        steps: [

            {
                type: "profitLoss",

                cost,
                selling,
                difference,
                percentage

            }

        ]

    };

}


/* =========================================================
   SIMPLE INTEREST
   ========================================================= */

function solveSimpleInterest(question) {

    if (
        !/simple interest|si|साधारण ब्याज/i.test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length < 3
    ) {

        return null;

    }

    const P = Number(numbers[0]);
    const R = Number(numbers[1]);
    const T = Number(numbers[2]);

    const interest =
        P * R * T / 100;

    const amount =
        P + interest;

    return {

        answer:
            `SI = ${formatNumber(interest)}, Amount = ${formatNumber(amount)}`,

        steps: [

            {
                type: "simpleInterest",
                P,
                R,
                T,
                interest,
                amount
            }

        ]

    };

}


/* =========================================================
   COMPOUND INTEREST
   ========================================================= */

function solveCompoundInterest(question) {

    if (
        !/compound interest|ci|चक्रवृद्धि ब्याज/i.test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length < 3
    ) {

        return null;

    }

    const P = Number(numbers[0]);
    const R = Number(numbers[1]);
    const T = Number(numbers[2]);

    const amount =
        P * Math.pow(
            1 + R / 100,
            T
        );

    const interest =
        amount - P;

    return {

        answer:
            `CI = ${formatNumber(interest)}, Amount = ${formatNumber(amount)}`,

        steps: [

            {
                type: "compoundInterest",
                P,
                R,
                T,
                interest,
                amount
            }

        ]

    };

}


/* =========================================================
   SPEED / DISTANCE / TIME
   ========================================================= */

function solveSpeedDistanceTime(question) {

    if (
        !/speed|distance|time|गति|दूरी|समय/i.test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length < 2
    ) {

        return null;

    }

    const values =
        numbers.map(Number);

    if (/speed|गति/i.test(question)) {

        const distance = values[0];
        const time = values[1];

        if (time === 0) {
            return null;
        }

        const speed =
            distance / time;

        return {

            answer:
                `Speed = ${formatNumber(speed)}`,

            steps: [

                {
                    type: "speed",
                    distance,
                    time,
                    result: speed
                }

            ]

        };

    }

    if (/distance|दूरी/i.test(question)) {

        const speed = values[0];
        const time = values[1];

        const distance =
            speed * time;

        return {

            answer:
                `Distance = ${formatNumber(distance)}`,

            steps: [

                {
                    type: "distance",
                    speed,
                    time,
                    result: distance
                }

            ]

        };

    }

    return null;

}


/* =========================================================
   GEOMETRY
   ========================================================= */

function solveGeometry(question) {

    if (
        !/area|perimeter|circle|rectangle|square|त्रिज्या|क्षेत्रफल|परिमाप/i
            .test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (!numbers || numbers.length === 0) {
        return null;
    }

    const values =
        numbers.map(Number);


    /* Square */
    if (/square|वर्ग/i.test(question)) {

        const side = values[0];

        const area =
            side * side;

        const perimeter =
            4 * side;

        return {

            answer:
                `Area = ${formatNumber(area)}, Perimeter = ${formatNumber(perimeter)}`,

            steps: [

                {
                    type: "square",
                    side,
                    area,
                    perimeter
                }

            ]

        };

    }


    /* Rectangle */
    if (/rectangle|आयत/i.test(question)) {

        if (values.length < 2) {
            return null;
        }

        const length = values[0];
        const width = values[1];

        const area =
            length * width;

        const perimeter =
            2 * (length + width);

        return {

            answer:
                `Area = ${formatNumber(area)}, Perimeter = ${formatNumber(perimeter)}`,

            steps: [

                {
                    type: "rectangle",
                    length,
                    width,
                    area,
                    perimeter
                }

            ]

        };

    }


    /* Circle */
    if (/circle|वृत्त/i.test(question)) {

        const radius = values[0];

        const area =
            Math.PI * radius * radius;

        const circumference =
            2 * Math.PI * radius;

        return {

            answer:
                `Area = ${formatNumber(area)}, Circumference = ${formatNumber(circumference)}`,

            steps: [

                {
                    type: "circle",
                    radius,
                    area,
                    circumference
                }

            ]

        };

    }

    return null;

}


/* =========================================================
   STATISTICS
   ========================================================= */

function solveStatistics(question) {

    if (
        !/median|mode|statistics|माध्यिका|बहुलक|सांख्यिकी/i
            .test(question)
    ) {

        return null;

    }

    const numbers =
        question.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (
        !numbers ||
        numbers.length === 0
    ) {

        return null;

    }

    const values =
        numbers.map(Number).sort(
            (a, b) => a - b
        );


    /* Median */

    let median;

    const middle =
        Math.floor(values.length / 2);

    if (values.length % 2 === 0) {

        median =
            (
                values[middle - 1] +
                values[middle]
            ) / 2;

    } else {

        median =
            values[middle];

    }


    /* Mode */

    const counts = {};

    values.forEach(value => {

        counts[value] =
            (counts[value] || 0) + 1;

    });

    let maxCount = 0;
    let modes = [];

    Object.keys(counts).forEach(key => {

        const count =
            counts[key];

        if (count > maxCount) {

            maxCount = count;
            modes = [Number(key)];

        } else if (
            count === maxCount &&
            count > 1
        ) {

            modes.push(Number(key));

        }

    });


    return {

        answer:
            `Median = ${formatNumber(median)}` +
            (
                modes.length
                    ? `, Mode = ${modes.map(formatNumber).join(", ")}`
                    : ""
            ),

        steps: [

            {
                type: "statistics",
                values,
                median,
                modes,
                maxCount
            }

        ]

    };

}


/* =========================================================
   MAIN SOLVER
   ========================================================= */

function solveQuestion(question) {

    const original =
        String(question || "").trim();

    if (!original) {

        throw new Error(
            TEXT[currentLanguage].enterQuestion
        );

    }

    let q =
        prepareExpression(original);


    /* Quadratic first */
    let result =
        solveQuadraticEquation(q);

    if (result) {
        return result;
    }


    /* Linear */
    result =
        solveLinearEquation(q);

    if (result) {
        return result;
    }


    /* Percentage */
    result =
        solvePercentage(q);

    if (result) {
        return result;
    }


    /* Fraction */
    result =
        solveFraction(q);

    if (result) {
        return result;
    }


    /* Square root */
    result =
        solveSquareRoot(q);

    if (result) {
        return result;
    }


    /* Power */
    result =
        solvePower(q);

    if (result) {
        return result;
    }


    /* Average */
    result =
        solveAverage(original);

    if (result) {
        return result;
    }


    /* HCF */
    result =
        solveHCF(original);

    if (result) {
        return result;
    }


    /* LCM */
    result =
        solveLCM(original);

    if (result) {
        return result;
    }


    /* Profit / Loss */
    result =
        solveProfitLoss(original);

    if (result) {
        return result;
    }


    /* Simple Interest */
    result =
        solveSimpleInterest(original);

    if (result) {
        return result;
    }


    /* Compound Interest */
    result =
        solveCompoundInterest(original);

    if (result) {
        return result;
    }


    /* Speed / Distance */
    result =
        solveSpeedDistanceTime(original);

    if (result) {
        return result;
    }


    /* Geometry */
    result =
        solveGeometry(original);

    if (result) {
        return result;
    }


    /* Statistics */
    result =
        solveStatistics(original);

    if (result) {
        return result;
    }


    /* BODMAS */
    if (
        /[\d()+\-*/]/.test(q)
    ) {

        result =
            solveBODMASExpression(q);

        if (result) {
            return result;
        }

    }


    throw new Error(
        TEXT[currentLanguage].cannotSolve
    );

}


/* =========================================================
   RENDER STEPS
   ========================================================= */

function renderSteps(result) {

    if (!stepsEl) {
        return;
    }

    stepsEl.innerHTML = "";

    let counter = 1;


    result.steps.forEach(step => {

        const item =
            document.createElement("div");

        item.className = "solution-step";


        /* ---------------------------------------------
           Normal operation
           --------------------------------------------- */

        if (step.type === "operation") {

            const data =
                buildOperationExplanation(
                    step,
                    counter
                );

            let explanation =
                data.explanation;

            let operationText =
                `${data.expression} = ${data.result}`;

            if (
                currentLanguage === "hi"
            ) {

                explanation =
                    explanation ||
                    `गणना करने पर परिणाम ${data.result} आता है।`;

            } else {

                explanation =
                    explanation ||
                    `Calculating this operation gives ${data.result}.`;

            }

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    ${escapeHTML(operationText)}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Power
           --------------------------------------------- */

        else if (step.type === "power") {

            const base =
                formatNumber(step.base);

            const exponent =
                formatNumber(step.exponent);

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `${base} को ${exponent} की घात पर उठाने पर ${answer} मिलता है।`
                    : `Raise ${base} to the power ${exponent} to get ${answer}.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    ${escapeHTML(
                        `${base} ^ ${exponent} = ${answer}`
                    )}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Percentage
           --------------------------------------------- */

        else if (step.type === "percentage") {

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `${step.percent}% का अर्थ ${step.percent}/100 है। इसलिए ${step.percent}/100 × ${step.number} = ${answer}.`
                    : `${step.percent}% means ${step.percent}/100. Therefore ${step.percent}/100 × ${step.number} = ${answer}.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    ${escapeHTML(
                        `${step.percent}/100 × ${step.number} = ${answer}`
                    )}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Fraction
           --------------------------------------------- */

        else if (step.type === "fraction") {

            const sign =
                step.op;

            const fraction =
                `${step.a}/${step.b} ${sign} ${step.c}/${step.d}`;

            const resultFraction =
                `${step.numerator}/${step.denominator}`;

            const explanation =
                currentLanguage === "hi"
                    ? `भिन्नों को समान denominator में बदलकर सरल किया गया।`
                    : `The fractions are combined using a common denominator and simplified.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    ${escapeHTML(
                        `${fraction} = ${resultFraction}`
                    )}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Square root
           --------------------------------------------- */

        else if (step.type === "sqrt") {

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `वह संख्या खोजते हैं जिसका square ${step.number} है।`
                    : `Find the number whose square is ${step.number}.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    √${escapeHTML(
                        String(step.number)
                    )} = ${answer}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Average
           --------------------------------------------- */

        else if (step.type === "average") {

            const values =
                step.values.join(" + ");

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `पहले सभी संख्याओं का योग करें, फिर कुल संख्याओं से भाग दें।`
                    : `Add all values and divide the sum by the number of values.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    (${escapeHTML(values)}) ÷ ${step.count}
                    = ${answer}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           HCF
           --------------------------------------------- */

        else if (step.type === "hcf") {

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `दिए गए सभी numbers का सबसे बड़ा common factor निकाला गया।`
                    : `Find the greatest common factor shared by all the numbers.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    HCF(${escapeHTML(
                        step.values.join(", ")
                    )}) = ${answer}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           LCM
           --------------------------------------------- */

        else if (step.type === "lcm") {

            const answer =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `वह सबसे छोटी positive संख्या निकाली गई जो सभी दी गई संख्याओं से पूरी तरह divide होती है।`
                    : `Find the smallest positive number divisible by all the given numbers.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    LCM(${escapeHTML(
                        step.values.join(", ")
                    )}) = ${answer}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Linear equation
           --------------------------------------------- */

        else if (step.type === "linear") {

            const x =
                formatNumber(step.result);

            const explanation =
                currentLanguage === "hi"
                    ? `पहले constant को दूसरी तरफ ले जाएँ, फिर x के coefficient से divide करें।`
                    : `Move the constant to the other side, then divide by the coefficient of x.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    x = ${x}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Quadratic
           --------------------------------------------- */

        else if (step.type === "quadratic") {

            const D =
                formatNumber(step.discriminant);

            const x1 =
                formatNumber(step.x1);

            const x2 =
                formatNumber(step.x2);

            const explanation =
                currentLanguage === "hi"
                    ? `Quadratic formula x = (-b ± √(b² − 4ac)) / 2a का उपयोग किया गया।`
                    : `Use the quadratic formula x = (-b ± √(b² − 4ac)) / 2a.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Discriminant = ${D}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                    <br>
                    x₁ = ${x1},
                    x₂ = ${x2}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Complex quadratic
           --------------------------------------------- */

        else if (
            step.type === "quadraticComplex"
        ) {

            const D =
                formatNumber(step.discriminant);

            const real =
                formatNumber(step.realPart);

            const imaginary =
                formatNumber(step.imaginaryPart);

            const explanation =
                currentLanguage === "hi"
                    ? `Discriminant negative है, इसलिए roots complex हैं।`
                    : `The discriminant is negative, so the roots are complex.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Discriminant = ${D}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                    <br>
                    x₁ = ${real} + ${imaginary}i
                    <br>
                    x₂ = ${real} - ${imaginary}i
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Profit Loss
           --------------------------------------------- */

        else if (step.type === "profitLoss") {

            const difference =
                formatNumber(
                    Math.abs(step.difference)
                );

            const percentage =
                formatNumber(step.percentage);

            const type =
                step.difference >= 0
                    ? "Profit"
                    : "Loss";

            const explanation =
                currentLanguage === "hi"
                    ? `Selling Price और Cost Price का अंतर ${difference} है। Percentage = Difference ÷ Cost Price × 100.`
                    : `Difference = Selling Price − Cost Price. Percentage = Difference ÷ Cost Price × 100.`;

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    ${type} = ${difference}
                    <br>
                    Percentage = ${percentage}%
                </div>

                <div class="step-explanation">
                    ${escapeHTML(explanation)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Simple Interest
           --------------------------------------------- */

        else if (
            step.type === "simpleInterest"
        ) {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    SI = P × R × T ÷ 100
                    <br>
                    SI = ${formatNumber(step.interest)}
                    <br>
                    Amount = ${formatNumber(step.amount)}
                </div>

                <div class="step-explanation">
                    ${currentLanguage === "hi"
                        ? "साधारण ब्याज का formula SI = P × R × T / 100 है।"
                        : "Simple Interest formula is SI = P × R × T / 100."
                    }
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Compound Interest
           --------------------------------------------- */

        else if (
            step.type === "compoundInterest"
        ) {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    A = P(1 + R/100)^T
                    <br>
                    Amount = ${formatNumber(step.amount)}
                    <br>
                    CI = ${formatNumber(step.interest)}
                </div>

                <div class="step-explanation">
                    ${currentLanguage === "hi"
                        ? "चक्रवृद्धि ब्याज का formula A = P(1 + R/100)^T है।"
                        : "Compound amount formula is A = P(1 + R/100)^T."
                    }
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Speed
           --------------------------------------------- */

        else if (step.type === "speed") {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Speed = Distance ÷ Time
                    <br>
                    = ${formatNumber(step.result)}
                </div>

                <div class="step-explanation">
                    ${currentLanguage === "hi"
                        ? "गति = दूरी ÷ समय।"
                        : "Speed = Distance ÷ Time."
                    }
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Distance
           --------------------------------------------- */

        else if (step.type === "distance") {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Distance = Speed × Time
                    <br>
                    = ${formatNumber(step.result)}
                </div>

                <div class="step-explanation">
                    ${currentLanguage === "hi"
                        ? "दूरी = गति × समय।"
                        : "Distance = Speed × Time."
                    }
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Geometry
           --------------------------------------------- */

        else if (step.type === "square") {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Area = side² = ${formatNumber(step.area)}
                    <br>
                    Perimeter = 4 × side = ${formatNumber(step.perimeter)}
                </div>
            `;

            counter++;

        }


        else if (step.type === "rectangle") {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Area = Length × Width
                    <br>
                    = ${formatNumber(step.area)}
                    <br><br>
                    Perimeter = 2(Length + Width)
                    <br>
                    = ${formatNumber(step.perimeter)}
                </div>
            `;

            counter++;

        }


        else if (step.type === "circle") {

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Area = πr²
                    <br>
                    = ${formatNumber(step.area)}
                    <br><br>
                    Circumference = 2πr
                    <br>
                    = ${formatNumber(step.circumference)}
                </div>
            `;

            counter++;

        }


        /* ---------------------------------------------
           Statistics
           --------------------------------------------- */

        else if (step.type === "statistics") {

            const modes =
                step.modes.length
                    ? step.modes.map(formatNumber).join(", ")
                    : "No mode";

            item.innerHTML = `
                <div class="step-number">
                    ${TEXT[currentLanguage].step} ${counter}
                </div>

                <div class="step-equation">
                    Sorted Data:
                    ${escapeHTML(
                        step.values.join(", ")
                    )}
                    <br><br>
                    Median = ${formatNumber(step.median)}
                    <br>
                    Mode = ${escapeHTML(modes)}
                </div>
            `;

            counter++;

        }

        stepsEl.appendChild(item);

    });


    /* ---------------------------------------------
       Final result
       --------------------------------------------- */

    const finalItem =
        document.createElement("div");

    finalItem.className =
        "final-step";

    finalItem.innerHTML = `
        <strong>
            ${TEXT[currentLanguage].result}
        </strong>
        <br>
        ${escapeHTML(
            String(result.answer)
        )}
    `;

    stepsEl.appendChild(finalItem);

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SOLVE BUTTON
   ========================================================= */

function solveCurrentQuestion() {

    const question =
        questionEl
            ? questionEl.value.trim()
            : "";

    if (!question) {

        showError(
            TEXT[currentLanguage].enterQuestion
        );

        return;

    }


    try {

        const result =
            solveQuestion(question);

        showResult(result);

        saveHistory(
            question,
            result.answer
        );

        if (voiceStatus) {

            voiceStatus.textContent =
                TEXT[currentLanguage].solved;

        }

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            TEXT[currentLanguage].cannotSolve
        );

    }

}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(result) {

    if (!resultSection) {
        return;
    }

    resultSection.hidden = false;

    let answer =
        result.answer;

    if (
        typeof answer === "number"
    ) {

        answer =
            formatNumber(answer);

    }

    if (answerEl) {

        answerEl.textContent =
            answer;

    }

    renderSteps(result);

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(message) {

    if (resultSection) {

        resultSection.hidden = false;

    }

    if (answerEl) {

        answerEl.textContent =
            "⚠️ " + message;

    }

    if (stepsEl) {

        stepsEl.innerHTML = "";

    }

}


/* =========================================================
   CLEAR CURRENT QUESTION
   ========================================================= */

function clearQuestion() {

    if (questionEl) {

        questionEl.value = "";
        questionEl.focus();

    }

    if (resultSection) {

        resultSection.hidden = true;

    }

    if (voiceStatus) {

        voiceStatus.textContent = "";

    }

}


/* =========================================================
   HISTORY
   ========================================================= */

function getHistory() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "History read error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveHistory(
    question,
    answer
) {

    try {

        let history =
            getHistory();

        history.unshift({

            id:
                Date.now() +
                Math.random()
                    .toString(36)
                    .slice(2),

            question,
            answer:
                typeof answer === "number"
                    ? formatNumber(answer)
                    : answer,

            time:
                new Date().toLocaleString()

        });


        history =
            history.slice(0, 50);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(history)
        );

        renderHistory();

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderHistory() {

    if (!historyList) {
        return;
    }

    const history =
        getHistory();

    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                ${
                    currentLanguage === "hi"
                        ? "अभी कोई history नहीं है।"
                        : "No mathematics history yet."
                }
            </div>
        `;

        return;

    }


    history.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "history-item";


        const content =
            document.createElement("div");

        content.className =
            "history-content";

        content.innerHTML = `
            <div class="history-question">
                ${escapeHTML(item.question)}
            </div>

            <div class="history-answer">
                = ${escapeHTML(
                    String(item.answer)
                )}
            </div>

            <div class="history-time">
                ${escapeHTML(
                    item.time || ""
                )}
            </div>
        `;


        const deleteBtn =
            document.createElement("button");

        deleteBtn.className =
            "history-delete";

        deleteBtn.type =
            "button";

        deleteBtn.textContent =
            "×";

        deleteBtn.setAttribute(
            "aria-label",
            "Delete history item"
        );


        deleteBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                deleteHistoryItem(
                    item.id
                );

            }
        );


        card.appendChild(content);
        card.appendChild(deleteBtn);


        card.addEventListener(
            "click",
            function () {

                if (questionEl) {

                    questionEl.value =
                        item.question;

                }

                solveCurrentQuestion();

            }
        );


        historyList.appendChild(card);

    });

}


/* =========================================================
   DELETE HISTORY ITEM
   ========================================================= */

function deleteHistoryItem(id) {

    const history =
        getHistory()
            .filter(
                item => item.id !== id
            );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history)
    );

    renderHistory();

}


/* =========================================================
   CLEAR ALL HISTORY
   ========================================================= */

function clearHistory() {

    const confirmed =
        window.confirm(
            TEXT[currentLanguage].confirmClear
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    renderHistory();

}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (micBtn) {

            micBtn.addEventListener(
                "click",
                function () {

                    showError(
                        TEXT[currentLanguage]
                            .micUnsupported
                    );

                }
            );

        }

        return;

    }


    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;


    recognition.onstart =
        function () {

            isListening = true;

            if (micBtn) {

                micBtn.classList.add(
                    "listening"
                );

            }

            if (micIcon) {

                micIcon.textContent =
                    "🔴";

            }

            if (micText) {

                micText.textContent =
                    TEXT[currentLanguage]
                        .listening;

            }

            if (voiceStatus) {

                voiceStatus.textContent =
                    TEXT[currentLanguage]
                        .listeningStatus;

            }

        };


    recognition.onresult =
        function (event) {

            let finalText = "";
            let interimText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0]
                        .transcript;

                if (
                    event.results[i].isFinal
                ) {

                    finalText += transcript;

                } else {

                    interimText += transcript;

                }

            }


            if (questionEl) {

                questionEl.value =
                    finalText ||
                    interimText;

            }


            if (finalText.trim()) {

                setTimeout(
                    function () {

                        solveCurrentQuestion();

                    },
                    250
                );

            }

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );

            isListening = false;

            resetMic();

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice error: " +
                    event.error;

            }

        };


    recognition.onend =
        function () {

            isListening = false;

            resetMic();

        };

}


/* =========================================================
   START / STOP VOICE
   ========================================================= */

function toggleVoice() {

    if (!recognition) {

        showError(
            TEXT[currentLanguage]
                .micUnsupported
        );

        return;

    }


    if (isListening) {

        recognition.stop();

        return;

    }


    recognition.lang =
        currentLanguage === "hi"
            ? "hi-IN"
            : "en-IN";


    try {

        recognition.start();

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   RESET MIC
   ========================================================= */

function resetMic() {

    if (micBtn) {

        micBtn.classList.remove(
            "listening"
        );

    }

    if (micIcon) {

        micIcon.textContent =
            "🎤";

    }

    if (micText) {

        micText.textContent =
            TEXT[currentLanguage].voice;

    }

}


/* =========================================================
   EXAMPLES
   ========================================================= */

function setupExamples() {

    const buttons =
        document.querySelectorAll(
            "[data-example]"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const example =
                    button.getAttribute(
                        "data-example"
                    );

                if (questionEl) {

                    questionEl.value =
                        example;

                }

                solveCurrentQuestion();

            }
        );

    });

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

function setupKeyboard() {

    if (!questionEl) {
        return;
    }

    questionEl.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.ctrlKey ||
                 event.metaKey) &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                solveCurrentQuestion();

            }

        }
    );

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function updateConnectionStatus() {

    const connectionText =
        document.getElementById(
            "connectionText"
        );

    if (!connectionText) {
        return;
    }

    const t =
        TEXT[currentLanguage];

    connectionText.textContent =
        navigator.onLine
            ? t.online
            : t.offline;

}


/* =========================================================
   PWA UPDATE DETECTION
   ========================================================= */

function setupServiceWorkerUpdate() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }

    navigator.serviceWorker
        .addEventListener(
            "controllerchange",
            function () {

                console.log(
                    "Math King updated."
                );

            }
        );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (englishBtn) {

    englishBtn.addEventListener(
        "click",
        function () {

            setLanguage("en");

        }
    );

}


if (hindiBtn) {

    hindiBtn.addEventListener(
        "click",
        function () {

            setLanguage("hi");

        }
    );

}


if (solveBtn) {

    solveBtn.addEventListener(
        "click",
        solveCurrentQuestion
    );

}


if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        clearQuestion
    );

}


if (micBtn) {

    micBtn.addEventListener(
        "click",
        toggleVoice
    );

}


if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(
        "click",
        clearHistory
    );

}


window.addEventListener(
    "online",
    updateConnectionStatus
);

window.addEventListener(
    "offline",
    updateConnectionStatus
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initMathKing() {

    setLanguage("en");

    setupVoiceRecognition();

    setupExamples();

    setupKeyboard();

    renderHistory();

    updateConnectionStatus();

    setupServiceWorkerUpdate();

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initMathKing
    );

} else {

    initMathKing();

}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.MathAutoSolver = {

    solve: solveQuestion,

    detailed: solveDetailedExpression,

    history: {

        get: getHistory,

        clear: clearHistory

    }

};