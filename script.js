"use strict";

/* =========================================================
   MATH KING — COMPLETE FIXED MATHEMATICS ENGINE
   Version: 4.0
   ========================================================= */

console.log("Math King Advanced Mathematics Engine Ready.");


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentLanguage = "en";
let recognition = null;
let isListening = false;
let deferredInstallPrompt = null;

const HISTORY_KEY = "mathKingHistory";
const OLD_HISTORY_KEY = "mathSolverHistory";


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function cleanNumber(value) {
    if (!Number.isFinite(value)) {
        return value;
    }

    if (Math.abs(value) < 1e-12) {
        return 0;
    }

    const rounded = Math.round(value * 1e12) / 1e12;

    return rounded;
}

function formatNumber(value) {
    value = cleanNumber(value);

    if (typeof value !== "number") {
        return String(value);
    }

    if (Number.isInteger(value)) {
        return String(value);
    }

    return String(Number(value.toFixed(10)));
}

function signedNumber(value) {
    value = cleanNumber(value);

    if (value > 0) {
        return "+" + formatNumber(value);
    }

    return formatNumber(value);
}


/* =========================================================
   LANGUAGE
   ========================================================= */

const TEXT = {

    en: {
        subtitle: "Real Mathematics Question Solver",
        questionTitle: "Enter Your Mathematics Question",
        questionHint: "Type, paste, or speak your mathematics question.",
        questionLabel: "Mathematics Question",
        standard: "Class / Standard",
        solve: "Solve Question",
        clear: "Clear",
        voiceReady: "Ready for voice input",
        listening: "Listening...",
        voiceUnsupported: "Voice input is not supported in this browser.",
        voiceStopped: "Voice input stopped.",
        examples: "Example Questions",
        answer: "Final Answer",
        steps: "Detailed Step-by-Step Solution",
        history: "Calculation History",
        clearHistory: "Clear History",
        noHistory: "No calculations yet.",
        installTitle: "Install Math King",
        installDescription: "Install Math King on your phone or computer for quick access.",
        install: "Install App",
        iosHelp: "On iPhone/iPad: tap Share → Add to Home Screen.",
        enterQuestion: "Please enter a mathematics question.",
        cannotSolve: "I could not understand this question.",
        finalAnswer: "Final Answer",
        expression: "Expression",
        solution: "Solution"
    },

    hi: {
        subtitle: "वास्तविक गणित प्रश्न हल करने वाला",
        questionTitle: "अपना गणित का प्रश्न लिखें",
        questionHint: "प्रश्न लिखें, पेस्ट करें या बोलकर पूछें।",
        questionLabel: "गणित का प्रश्न",
        standard: "कक्षा / स्तर",
        solve: "प्रश्न हल करें",
        clear: "साफ करें",
        voiceReady: "Voice input के लिए तैयार",
        listening: "सुन रहा हूँ...",
        voiceUnsupported: "इस browser में voice input उपलब्ध नहीं है।",
        voiceStopped: "Voice input बंद किया गया।",
        examples: "उदाहरण प्रश्न",
        answer: "अंतिम उत्तर",
        steps: "विस्तृत Step-by-Step समाधान",
        history: "Calculation History",
        clearHistory: "History साफ करें",
        noHistory: "अभी कोई calculation नहीं है।",
        installTitle: "Math King Install करें",
        installDescription: "Math King को phone या computer में install करें।",
        install: "App Install करें",
        iosHelp: "iPhone/iPad में Share → Add to Home Screen दबाएँ।",
        enterQuestion: "कृपया गणित का प्रश्न लिखें।",
        cannotSolve: "मैं इस प्रश्न को समझ नहीं पाया।",
        finalAnswer: "अंतिम उत्तर",
        expression: "Expression",
        solution: "समाधान"
    }

};


/* =========================================================
   LANGUAGE UI
   ========================================================= */

function setLanguage(lang) {

    currentLanguage = lang === "hi" ? "hi" : "en";

    document.documentElement.lang =
        currentLanguage === "hi" ? "hi" : "en";

    const t = TEXT[currentLanguage];

    if ($("appSubtitle")) {
        $("appSubtitle").textContent = t.subtitle;
    }

    if ($("questionTitle")) {
        $("questionTitle").textContent = t.questionTitle;
    }

    if ($("questionHint")) {
        $("questionHint").textContent = t.questionHint;
    }

    if ($("questionLabel")) {
        $("questionLabel").textContent = t.questionLabel;
    }

    if ($("standardLabel")) {
        $("standardLabel").textContent = t.standard;
    }

    if ($("solveBtn")) {
        const span = $("solveBtn").querySelector("span:last-child");
        if (span) span.textContent = t.solve;
    }

    if ($("clearBtn")) {
        const span = $("clearBtn").querySelector("span:last-child");
        if (span) span.textContent = t.clear;
    }

    if ($("micText") && !isListening) {
        $("micText").textContent =
            currentLanguage === "hi"
                ? "Voice Input"
                : "Voice Input";
    }

    if ($("voiceStatus") && !isListening) {
        $("voiceStatus").textContent = t.voiceReady;
    }

    if ($("examplesTitle")) {
        $("examplesTitle").textContent = t.examples;
    }

    if ($("answerTitle")) {
        $("answerTitle").textContent = t.answer;
    }

    if ($("stepsTitle")) {
        $("stepsTitle").textContent = t.steps;
    }

    if ($("historyTitle")) {
        $("historyTitle").textContent = t.history;
    }

    if ($("clearHistoryText")) {
        $("clearHistoryText").textContent = t.clearHistory;
    }

    if ($("installTitle")) {
        $("installTitle").textContent = t.installTitle;
    }

    if ($("installDescription")) {
        $("installDescription").textContent = t.installDescription;
    }

    if ($("installBtn")) {
        $("installBtn").textContent = t.install;
    }

    if ($("iosInstallHelp")) {
        $("iosInstallHelp").textContent = t.iosHelp;
    }

    if ($("englishBtn")) {
        $("englishBtn").classList.toggle(
            "active",
            currentLanguage === "en"
        );
    }

    if ($("hindiBtn")) {
        $("hindiBtn").classList.toggle(
            "active",
            currentLanguage === "hi"
        );
    }
}


/* =========================================================
   NORMALIZE MATHEMATICS TEXT
   ========================================================= */

function normalizeMath(input) {

    let s = String(input || "").trim();

    if (!s) {
        return "";
    }

    s = s
        .replace(/[−–—]/g, "-")
        .replace(/[×✕✖]/g, "*")
        .replace(/[÷]/g, "/")
        .replace(/[·]/g, "*")
        .replace(/[π]/g, "pi")
        .replace(/[√]/g, "sqrt")
        .replace(/[²]/g, "^2")
        .replace(/[³]/g, "^3")
        .replace(/[⁴]/g, "^4")
        .replace(/[⁵]/g, "^5")
        .replace(/[⁶]/g, "^6")
        .replace(/[⁷]/g, "^7")
        .replace(/[⁸]/g, "^8")
        .replace(/[⁹]/g, "^9")
        .replace(/[⁰]/g, "^0")
        .replace(/∞/g, "infinity")
        .replace(/,/g, ",")
        .replace(/\s+/g, " ")
        .trim();

    return s;
}


/* =========================================================
   VOICE NORMALIZATION
   ========================================================= */

const WORD_NUMBERS_EN = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000
};

const WORD_NUMBERS_HI = {
    "शून्य": 0,
    "एक": 1,
    "दो": 2,
    "तीन": 3,
    "चार": 4,
    "पाँच": 5,
    "पांच": 5,
    "छह": 6,
    "छः": 6,
    "सात": 7,
    "आठ": 8,
    "नौ": 9,
    "दस": 10,
    "ग्यारह": 11,
    "बारह": 12,
    "तेरह": 13,
    "चौदह": 14,
    "पंद्रह": 15,
    "सोलह": 16,
    "सत्रह": 17,
    "अठारह": 18,
    "उन्नीस": 19,
    "बीस": 20,
    "तीस": 30,
    "चालीस": 40,
    "पचास": 50,
    "साठ": 60,
    "सत्तर": 70,
    "अस्सी": 80,
    "नब्बे": 90,
    "सौ": 100,
    "हजार": 1000
};

function normalizeVoiceText(input) {

    let s = String(input || "")
        .toLowerCase()
        .trim();

    const replacements = [

        [/\bmultiplied by\b/g, "*"],
        [/\bmultiply by\b/g, "*"],
        [/\btimes\b/g, "*"],
        [/\binto\b/g, "*"],

        [/\bdivided by\b/g, "/"],
        [/\bdivide by\b/g, "/"],

        [/\bplus\b/g, "+"],
        [/\badd\b/g, "+"],

        [/\bminus\b/g, "-"],
        [/\bsubtract\b/g, "-"],

        [/\bto the power of\b/g, "^"],
        [/\bpower of\b/g, "^"],
        [/\bsquared\b/g, "^2"],
        [/\bcubed\b/g, "^3"],

        [/\bsquare root of\b/g, "sqrt"],
        [/\bsquare root\b/g, "sqrt"],

        [/\bpercent of\b/g, "% of"],
        [/\bpercentage of\b/g, "% of"],

        [/\bgreater than or equal to\b/g, ">="],
        [/\bless than or equal to\b/g, "<="],
        [/\bgreater than\b/g, ">"],
        [/\bless than\b/g, "<"],

        [/\bopen bracket\b/g, "("],
        [/\bclose bracket\b/g, ")"],
        [/\bopen parenthesis\b/g, "("],
        [/\bclose parenthesis\b/g, ")"]
    ];

    replacements.forEach(([pattern, value]) => {
        s = s.replace(pattern, value);
    });

    Object.entries(WORD_NUMBERS_EN).forEach(([word, number]) => {
        const pattern = new RegExp("\\b" + word + "\\b", "g");
        s = s.replace(pattern, String(number));
    });

    Object.entries(WORD_NUMBERS_HI).forEach(([word, number]) => {
        s = s.replaceAll(word, String(number));
    });

    return normalizeMath(s);
}


/* =========================================================
   REMOVE QUESTION PREFIX
   ========================================================= */

function cleanQuestionPrefix(input) {

    let s = String(input || "").trim();

    s = s.replace(
        /^(please\s+)?(solve|calculate|find|evaluate|simplify|expand|answer)\s*(the\s+)?/i,
        ""
    );

    s = s.replace(
        /^the\s+(value|answer|solution)\s+(of|for)\s*/i,
        ""
    );

    s = s.replace(
        /^simplify\s+(the\s+)?expression\s*[:\-]?\s*/i,
        ""
    );

    s = s.replace(
        /^expand\s+(the\s+)?expression\s*[:\-]?\s*/i,
        ""
    );

    s = s.replace(
        /^evaluate\s*[:\-]?\s*/i,
        ""
    );

    return s.trim();
}


/* =========================================================
   TOKENIZER — ALGEBRA
   ========================================================= */

function tokenizeAlgebra(input) {

    let s = normalizeMath(input);

    s = s.replace(/\bsqrt\s*\(/gi, "sqrt(");

    const tokens = [];

    let i = 0;

    while (i < s.length) {

        const ch = s[i];

        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        /* Number */
        if (/[0-9.]/.test(ch)) {

            let start = i;
            let dotCount = 0;

            while (
                i < s.length &&
                /[0-9.]/.test(s[i])
            ) {
                if (s[i] === ".") {
                    dotCount++;
                }

                i++;
            }

            const raw = s.slice(start, i);

            if (
                dotCount > 1 ||
                raw === "."
            ) {
                throw new Error("Invalid number: " + raw);
            }

            tokens.push({
                type: "number",
                value: Number(raw)
            });

            continue;
        }

        /* Variable */
        if (/[a-zA-Z]/.test(ch)) {

            let start = i;

            while (
                i < s.length &&
                /[a-zA-Z]/.test(s[i])
            ) {
                i++;
            }

            const word = s.slice(start, i);

            if (word.toLowerCase() === "pi") {

                tokens.push({
                    type: "number",
                    value: Math.PI
                });

            } else {

                tokens.push({
                    type: "variable",
                    value: word
                });
            }

            continue;
        }

        /* Operators */
        if ("+-*/^()".includes(ch)) {

            tokens.push({
                type: "operator",
                value: ch
            });

            i++;
            continue;
        }

        throw new Error(
            "Unsupported symbol: " + ch
        );
    }


    /* =====================================================
       CRITICAL FIX:
       INSERT IMPLICIT MULTIPLICATION
       
       2x        -> 2*x
       4(x+1)    -> 4*(x+1)
       x(x+1)    -> x*(x+1)
       (x+1)(x+2)-> (x+1)*(x+2)
       2(x+1)    -> 2*(x+1)
    ====================================================== */

    const output = [];

    function canEndValue(token) {

        return token &&
            (
                token.type === "number" ||
                token.type === "variable" ||
                token.value === ")"
            );
    }

    function canStartValue(token) {

        return token &&
            (
                token.type === "number" ||
                token.type === "variable" ||
                token.value === "("
            );
    }

    for (const token of tokens) {

        const previous =
            output[output.length - 1];

        if (
            canEndValue(previous) &&
            canStartValue(token)
        ) {

            output.push({
                type: "operator",
                value: "*",
                implicit: true
            });
        }

        output.push(token);
    }

    return output;
}


/* =========================================================
   POLYNOMIAL UTILITIES
   ========================================================= */

/*
 Polynomial format:

 {
    0: constant,
    1: x,
    2: x²,
    3: x³
 }
*/

function polyClean(p) {

    const result = {};

    Object.keys(p).forEach(power => {

        const value = cleanNumber(p[power]);

        if (Math.abs(value) > 1e-12) {
            result[power] = value;
        }

    });

    return result;
}

function polyAdd(a, b) {

    const result = {
        ...a
    };

    Object.keys(b).forEach(power => {

        result[power] =
            (result[power] || 0) +
            b[power];

    });

    return polyClean(result);
}

function polySubtract(a, b) {

    const result = {
        ...a
    };

    Object.keys(b).forEach(power => {

        result[power] =
            (result[power] || 0) -
            b[power];

    });

    return polyClean(result);
}

function polyMultiply(a, b) {

    const result = {};

    Object.entries(a).forEach(([pa, ca]) => {

        Object.entries(b).forEach(([pb, cb]) => {

            const power =
                Number(pa) + Number(pb);

            result[power] =
                (result[power] || 0) +
                ca * cb;
        });

    });

    return polyClean(result);
}

function polyScale(a, factor) {

    const result = {};

    Object.entries(a).forEach(([power, coefficient]) => {

        result[power] =
            coefficient * factor;

    });

    return polyClean(result);
}

function polyPower(base, exponent) {

    exponent = Number(exponent);

    if (!Number.isInteger(exponent) || exponent < 0) {
        throw new Error(
            "Polynomial powers must be non-negative integers."
        );
    }

    let result = { 0: 1 };

    for (let i = 0; i < exponent; i++) {
        result = polyMultiply(result, base);
    }

    return result;
}


/* =========================================================
   POLYNOMIAL FORMATTER
   ========================================================= */

function formatPolynomial(poly, variable = "x") {

    poly = polyClean(poly);

    const powers = Object.keys(poly)
        .map(Number)
        .sort((a, b) => b - a);

    if (powers.length === 0) {
        return "0";
    }

    let output = "";

    powers.forEach((power, index) => {

        const coefficient =
            cleanNumber(poly[power]);

        if (coefficient === 0) {
            return;
        }

        const absolute =
            Math.abs(coefficient);

        let term = "";

        if (power === 0) {

            term = formatNumber(absolute);

        } else {

            if (absolute === 1) {
                term = "";
            } else {
                term = formatNumber(absolute);
            }

            if (power === 1) {

                term += variable;

            } else {

                term +=
                    variable +
                    "^" +
                    power;
            }
        }

        if (index === 0) {

            if (coefficient < 0) {
                output += "-";
            }

            output += term;

        } else {

            if (coefficient < 0) {
                output += " - ";
            } else {
                output += " + ";
            }

            output += term;
        }

    });

    return output || "0";
}


/* =========================================================
   ALGEBRA PARSER
   ========================================================= */

class AlgebraParser {

    constructor(tokens) {

        this.tokens = tokens;
        this.position = 0;

        this.variableName = null;
    }

    current() {
        return this.tokens[this.position];
    }

    consume(value) {

        const token = this.current();

        if (
            token &&
            token.value === value
        ) {
            this.position++;
            return true;
        }

        return false;
    }

    parse() {

        const result = this.parseExpression();

        if (this.position < this.tokens.length) {

            throw new Error(
                "Unexpected token: " +
                this.current().value
            );
        }

        return result;
    }

    parseExpression() {

        let result =
            this.parseTerm();

        while (true) {

            if (this.consume("+")) {

                result =
                    polyAdd(
                        result,
                        this.parseTerm()
                    );

                continue;
            }

            if (this.consume("-")) {

                result =
                    polySubtract(
                        result,
                        this.parseTerm()
                    );

                continue;
            }

            break;
        }

        return result;
    }

    parseTerm() {

        let result =
            this.parsePower();

        while (true) {

            if (this.consume("*")) {

                result =
                    polyMultiply(
                        result,
                        this.parsePower()
                    );

                continue;
            }

            if (this.consume("/")) {

                const denominator =
                    this.parsePower();

                const denominatorPowers =
                    Object.keys(denominator);

                /*
                 Only division by a constant
                 is allowed in this polynomial engine.
                */

                if (
                    denominatorPowers.length !== 1 ||
                    Number(denominatorPowers[0]) !== 0
                ) {
                    throw new Error(
                        "Division by a variable expression is not supported."
                    );
                }

                const divisor =
                    denominator[0];

                if (divisor === 0) {
                    throw new Error(
                        "Division by zero is not allowed."
                    );
                }

                result =
                    polyScale(
                        result,
                        1 / divisor
                    );

                continue;
            }

            break;
        }

        return result;
    }

    parsePower() {

        let base =
            this.parseUnary();

        if (this.consume("^")) {

            const exponentPoly =
                this.parsePower();

            const powers =
                Object.keys(exponentPoly);

            if (
                powers.length !== 1 ||
                Number(powers[0]) !== 0
            ) {
                throw new Error(
                    "Exponent must be a constant."
                );
            }

            const exponent =
                exponentPoly[0];

            base =
                polyPower(
                    base,
                    exponent
                );
        }

        return base;
    }

    parseUnary() {

        if (this.consume("+")) {
            return this.parseUnary();
        }

        if (this.consume("-")) {

            return polyScale(
                this.parseUnary(),
                -1
            );
        }

        return this.parsePrimary();
    }

    parsePrimary() {

        const token = this.current();

        if (!token) {
            throw new Error(
                "Unexpected end of expression."
            );
        }

        if (token.type === "number") {

            this.position++;

            return {
                0: token.value
            };
        }

        if (token.type === "variable") {

            this.position++;

            const variable =
                token.value;

            if (this.variableName === null) {
                this.variableName = variable;
            }

            if (
                this.variableName !== variable
            ) {
                throw new Error(
                    "Please use one variable at a time."
                );
            }

            return {
                1: 1
            };
        }

        if (this.consume("(")) {

            const result =
                this.parseExpression();

            if (!this.consume(")")) {

                throw new Error(
                    "Missing closing bracket."
                );
            }

            return result;
        }

        throw new Error(
            "Unexpected token: " +
            token.value
        );
    }
}


/* =========================================================
   PARSE POLYNOMIAL
   ========================================================= */

function parsePolynomial(expression) {

    const tokens =
        tokenizeAlgebra(expression);

    const parser =
        new AlgebraParser(tokens);

    const polynomial =
        parser.parse();

    return {
        polynomial,
        variable: parser.variableName || "x"
    };
}


/* =========================================================
   EXPLANATION HELPERS
   ========================================================= */

function findMatchingBracket(text, start) {

    let depth = 0;

    for (
        let i = start;
        i < text.length;
        i++
    ) {

        if (text[i] === "(") {
            depth++;
        }

        if (text[i] === ")") {

            depth--;

            if (depth === 0) {
                return i;
            }
        }
    }

    return -1;
}

function explainDistribution(expression) {

    const steps = [];

    let s = expression
        .replace(/\s+/g, " ")
        .trim();

    /*
     Find coefficient before bracket:

     4(2x-3)
     -2(x+5)
     */

    const regex =
        /(^|[+\-])\s*(\d+(?:\.\d+)?)\s*\(/g;

    let match;

    while ((match = regex.exec(s)) !== null) {

        const sign =
            match[1] === "-"
                ? -1
                : 1;

        const coefficient =
            sign * Number(match[2]);

        const openIndex =
            regex.lastIndex - 1;

        const closeIndex =
            findMatchingBracket(
                s,
                openIndex
            );

        if (closeIndex === -1) {
            continue;
        }

        const inside =
            s.slice(
                openIndex + 1,
                closeIndex
            );

        steps.push({
            coefficient,
            inside
        });
    }

    return steps;
}


/* =========================================================
   FORMAT POLYNOMIAL FOR DISPLAY
   ========================================================= */

function displayPolynomial(poly, variable) {

    return formatPolynomial(
        poly,
        variable || "x"
    );
}


/* =========================================================
   SOLVE ALGEBRA SIMPLIFICATION
   ========================================================= */

function solveAlgebraSimplification(input) {

    let expression =
        cleanQuestionPrefix(input);

    expression =
        expression
            .replace(
                /^simplify\s*:\s*/i,
                ""
            )
            .replace(
                /^expand\s*:\s*/i,
                ""
            )
            .trim();

    if (!expression) {
        throw new Error("Empty algebra expression.");
    }

    /*
     Convert unicode powers before parsing.
    */

    expression =
        normalizeMath(expression);

    const parsed =
        parsePolynomial(expression);

    const poly =
        parsed.polynomial;

    const variable =
        parsed.variable;

    const finalExpression =
        displayPolynomial(
            poly,
            variable
        );

    const steps = [];

    steps.push(
        "Start with the expression:"
    );

    steps.push(
        `<div class="math-step-expression">${escapeHTML(expression)}</div>`
    );

    /*
     Detailed distribution
    */

    const distributions =
        explainDistribution(expression);

    if (distributions.length > 0) {

        steps.push(
            "<strong>Step 1: Expand the brackets using the distributive property.</strong>"
        );

        distributions.forEach(item => {

            const c =
                item.coefficient;

            const inside =
                item.inside;

            const terms =
                splitTerms(inside);

            if (terms.length > 0) {

                const expanded =
                    terms.map(term => {

                        const cleaned =
                            term.trim();

                        return (
                            formatNumber(c) +
                            " × (" +
                            cleaned +
                            ")"
                        );

                    });

                steps.push(
                    `<div class="math-step-expression">${escapeHTML(expanded.join(" + "))}</div>`
                );

                terms.forEach(term => {

                    steps.push(
                        `<div class="math-step-expression">${escapeHTML(
                            formatNumber(c) +
                            " × (" +
                            term.trim() +
                            ")"
                        )}</div>`
                    );
                });
            }

        });

        steps.push(
            "<strong>Step 2: Multiply the coefficient by each term inside the brackets.</strong>"
        );

    } else {

        steps.push(
            "<strong>Step 1: Parse the algebraic expression.</strong>"
        );
    }

    /*
     Show polynomial terms
    */

    const powers =
        Object.keys(poly)
            .map(Number)
            .sort((a, b) => b - a);

    if (powers.length > 1) {

        steps.push(
            "<strong>Step 3: Combine like terms.</strong>"
        );

        steps.push(
            `<div class="math-step-expression">${escapeHTML(finalExpression)}</div>`
        );

    } else {

        steps.push(
            "<strong>Step 2: Simplify the resulting terms.</strong>"
        );

        steps.push(
            `<div class="math-step-expression">${escapeHTML(finalExpression)}</div>`
        );
    }

    steps.push(
        `<strong>Final Answer:</strong> <span class="final-math-answer">${escapeHTML(finalExpression)}</span>`
    );

    return {
        answer: finalExpression,
        steps
    };
}


/* =========================================================
   SPLIT ALGEBRA TERMS
   ========================================================= */

function splitTerms(expression) {

    const result = [];

    let current = "";
    let depth = 0;

    for (let i = 0; i < expression.length; i++) {

        const ch = expression[i];

        if (ch === "(") {
            depth++;
        }

        if (ch === ")") {
            depth--;
        }

        if (
            depth === 0 &&
            (ch === "+" || ch === "-") &&
            current.trim()
        ) {

            result.push(current.trim());

            current = ch;

        } else {

            current += ch;
        }
    }

    if (current.trim()) {
        result.push(current.trim());
    }

    return result;
}


/* =========================================================
   LINEAR EQUATION
   ========================================================= */

function solveLinearEquation(input) {

    let equation =
        cleanQuestionPrefix(input);

    equation =
        equation
            .replace(
                /^solve\s*:\s*/i,
                ""
            )
            .trim();

    const equalIndex =
        equation.indexOf("=");

    if (equalIndex === -1) {
        throw new Error(
            "Equation must contain =."
        );
    }

    const left =
        equation.slice(
            0,
            equalIndex
        );

    const right =
        equation.slice(
            equalIndex + 1
        );

    const L =
        parsePolynomial(left);

    const R =
        parsePolynomial(right);

    const variable =
        L.variable !== "x"
            ? L.variable
            : R.variable;

    const difference =
        polySubtract(
            L.polynomial,
            R.polynomial
        );

    const a =
        difference[1] || 0;

    const b =
        difference[0] || 0;

    if (Math.abs(a) < 1e-12) {

        if (Math.abs(b) < 1e-12) {

            return {
                answer: "All real numbers",
                steps: [
                    "Move all terms to one side.",
                    "The equation simplifies to 0 = 0.",
                    "<strong>Final Answer:</strong> All real numbers."
                ]
            };

        }

        return {
            answer: "No solution",
            steps: [
                "Move all terms to one side.",
                `The equation becomes ${escapeHTML(formatNumber(b))} = 0.`,
                "<strong>Final Answer:</strong> No solution."
            ]
        };
    }

    const x =
        -b / a;

    const steps = [];

    steps.push(
        `<strong>Step 1:</strong> Start with ${escapeHTML(equation)}`
    );

    steps.push(
        "<strong>Step 2:</strong> Move all terms to the left side."
    );

    steps.push(
        `<div class="math-step-expression">${escapeHTML(
            formatPolynomial(difference, variable)
        )} = 0</div>`
    );

    steps.push(
        "<strong>Step 3:</strong> Isolate the variable."
    );

    steps.push(
        `<div class="math-step-expression">${formatNumber(a)}${escapeHTML(variable)} = ${formatNumber(-b)}</div>`
    );

    steps.push(
        "<strong>Step 4:</strong> Divide both sides by the coefficient of the variable."
    );

    steps.push(
        `<div class="math-step-expression">${escapeHTML(variable)} = ${formatNumber(x)}</div>`
    );

    steps.push(
        `<strong>Final Answer:</strong> ${escapeHTML(variable)} = ${formatNumber(x)}`
    );

    return {
        answer: `${variable} = ${formatNumber(x)}`,
        steps
    };
}


/* =========================================================
   QUADRATIC EQUATION
   ========================================================= */

function solveQuadraticEquation(input) {

    let equation =
        cleanQuestionPrefix(input);

    const equalIndex =
        equation.indexOf("=");

    if (equalIndex === -1) {
        throw new Error(
            "Quadratic equation must contain =."
        );
    }

    const left =
        equation.slice(0, equalIndex);

    const right =
        equation.slice(equalIndex + 1);

    const L =
        parsePolynomial(left);

    const R =
        parsePolynomial(right);

    const variable =
        L.variable !== "x"
            ? L.variable
            : R.variable;

    const poly =
        polySubtract(
            L.polynomial,
            R.polynomial
        );

    const a =
        poly[2] || 0;

    const b =
        poly[1] || 0;

    const c =
        poly[0] || 0;

    if (Math.abs(a) < 1e-12) {
        return solveLinearEquation(input);
    }

    const D =
        b * b - 4 * a * c;

    const steps = [];

    steps.push(
        `<strong>Step 1:</strong> Write the equation in standard form.`
    );

    steps.push(
        `<div class="math-step-expression">${escapeHTML(
            formatPolynomial(poly, variable)
        )} = 0</div>`
    );

    steps.push(
        `<strong>Step 2:</strong> Identify coefficients:`
    );

    steps.push(
        `<div class="math-step-expression">a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}</div>`
    );

    steps.push(
        `<strong>Step 3:</strong> Calculate the discriminant.`
    );

    steps.push(
        `<div class="math-step-expression">Δ = b² − 4ac</div>`
    );

    steps.push(
        `<div class="math-step-expression">Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)})</div>`
    );

    steps.push(
        `<div class="math-step-expression">Δ = ${formatNumber(D)}</div>`
    );

    if (D > 0) {

        const sqrtD =
            Math.sqrt(D);

        const x1 =
            (-b + sqrtD) / (2 * a);

        const x2 =
            (-b - sqrtD) / (2 * a);

        steps.push(
            "<strong>Step 4:</strong> Since Δ > 0, there are two real solutions."
        );

        steps.push(
            `<div class="math-step-expression">${escapeHTML(variable)}₁ = ${formatNumber(x1)}</div>`
        );

        steps.push(
            `<div class="math-step-expression">${escapeHTML(variable)}₂ = ${formatNumber(x2)}</div>`
        );

        steps.push(
            `<strong>Final Answer:</strong> ${escapeHTML(variable)} = ${formatNumber(x1)}, ${formatNumber(x2)}`
        );

        return {
            answer:
                `${variable} = ${formatNumber(x1)} or ${variable} = ${formatNumber(x2)}`,
            steps
        };
    }

    if (Math.abs(D) < 1e-12) {

        const x =
            -b / (2 * a);

        steps.push(
            "<strong>Step 4:</strong> Since Δ = 0, there is one repeated real solution."
        );

        steps.push(
            `<div class="math-step-expression">${escapeHTML(variable)} = ${formatNumber(x)}</div>`
        );

        steps.push(
            `<strong>Final Answer:</strong> ${escapeHTML(variable)} = ${formatNumber(x)}`
        );

        return {
            answer:
                `${variable} = ${formatNumber(x)}`,
            steps
        };
    }

    const real =
        -b / (2 * a);

    const imaginary =
        Math.sqrt(-D) /
        Math.abs(2 * a);

    steps.push(
        "<strong>Step 4:</strong> Since Δ < 0, there are two complex solutions."
    );

    const x1 =
        `${formatNumber(real)} + ${formatNumber(imaginary)}i`;

    const x2 =
        `${formatNumber(real)} - ${formatNumber(imaginary)}i`;

    steps.push(
        `<div class="math-step-expression">${escapeHTML(variable)}₁ = ${escapeHTML(x1)}</div>`
    );

    steps.push(
        `<div class="math-step-expression">${escapeHTML(variable)}₂ = ${escapeHTML(x2)}</div>`
    );

    steps.push(
        `<strong>Final Answer:</strong> ${escapeHTML(variable)} = ${escapeHTML(x1)}, ${escapeHTML(x2)}`
    );

    return {
        answer:
            `${variable} = ${x1} or ${variable} = ${x2}`,
        steps
    };
}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function solvePercentage(input) {

    const s =
        normalizeMath(input);

    let match =
        s.match(
            /(-?\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {
        match =
            s.match(
                /(-?\d+(?:\.\d+)?)\s*percent\s*(?:of)\s*(-?\d+(?:\.\d+)?)/i
            );
    }

    if (!match) {
        throw new Error(
            "Percentage format not recognized."
        );
    }

    const percent =
        Number(match[1]);

    const number =
        Number(match[2]);

    const result =
        percent / 100 * number;

    return {
        answer: formatNumber(result),
        steps: [
            `<strong>Step 1:</strong> Identify the percentage: ${formatNumber(percent)}%`,
            `<strong>Step 2:</strong> Convert percentage to decimal.`,
            `<div class="math-step-expression">${formatNumber(percent)} ÷ 100 = ${formatNumber(percent / 100)}</div>`,
            `<strong>Step 3:</strong> Multiply by ${formatNumber(number)}.`,
            `<div class="math-step-expression">${formatNumber(percent / 100)} × ${formatNumber(number)} = ${formatNumber(result)}</div>`,
            `<strong>Final Answer:</strong> ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   AVERAGE
   ========================================================= */

function solveAverage(input) {

    let s =
        String(input || "")
            .replace(/average\s+of/i, "")
            .replace(/औसत/i, "")
            .trim();

    const numbers =
        s.match(
            /-?\d+(?:\.\d+)?/g
        );

    if (!numbers || numbers.length < 1) {
        throw new Error(
            "Could not find numbers for average."
        );
    }

    const values =
        numbers.map(Number);

    const sum =
        values.reduce(
            (a, b) => a + b,
            0
        );

    const average =
        sum / values.length;

    return {
        answer: formatNumber(average),
        steps: [
            `<strong>Step 1:</strong> Add all the numbers.`,
            `<div class="math-step-expression">${values.map(formatNumber).join(" + ")} = ${formatNumber(sum)}</div>`,
            `<strong>Step 2:</strong> Count the numbers.`,
            `<div class="math-step-expression">Count = ${values.length}</div>`,
            `<strong>Step 3:</strong> Divide the sum by the count.`,
            `<div class="math-step-expression">${formatNumber(sum)} ÷ ${values.length} = ${formatNumber(average)}</div>`,
            `<strong>Final Answer:</strong> ${formatNumber(average)}`
        ]
    };
}


/* =========================================================
   HCF / GCD
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

function solveHCF(input) {

    const numbers =
        String(input || "")
            .match(
                /-?\d+/g
            );

    if (!numbers || numbers.length < 2) {
        throw new Error(
            "Please provide at least two numbers for HCF."
        );
    }

    const values =
        numbers.map(Number);

    let result =
        Math.abs(values[0]);

    const steps = [];

    steps.push(
        "<strong>Step 1:</strong> Find the greatest common divisor."
    );

    for (let i = 1; i < values.length; i++) {

        const next =
            Math.abs(values[i]);

        const old =
            result;

        result =
            gcd(result, next);

        steps.push(
            `<div class="math-step-expression">HCF(${old}, ${next}) = ${result}</div>`
        );
    }

    steps.push(
        `<strong>Final Answer:</strong> ${result}`
    );

    return {
        answer: String(result),
        steps
    };
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

    return Math.abs(
        a / gcd(a, b) * b
    );
}

function solveLCM(input) {

    const numbers =
        String(input || "")
            .match(
                /-?\d+/g
            );

    if (!numbers || numbers.length < 2) {
        throw new Error(
            "Please provide at least two numbers for LCM."
        );
    }

    const values =
        numbers.map(Number);

    let result =
        Math.abs(values[0]);

    const steps = [];

    steps.push(
        "<strong>Step 1:</strong> Use the LCM relation:"
    );

    steps.push(
        `<div class="math-step-expression">LCM(a,b) = |a × b| ÷ HCF(a,b)</div>`
    );

    for (let i = 1; i < values.length; i++) {

        const next =
            Math.abs(values[i]);

        const old =
            result;

        const common =
            gcd(old, next);

        result =
            lcm(old, next);

        steps.push(
            `<div class="math-step-expression">HCF(${old}, ${next}) = ${common}</div>`
        );

        steps.push(
            `<div class="math-step-expression">LCM(${old}, ${next}) = ${result}</div>`
        );
    }

    steps.push(
        `<strong>Final Answer:</strong> ${result}`
    );

    return {
        answer: String(result),
        steps
    };
}


/* =========================================================
   SQUARE ROOT
   ========================================================= */

function solveSquareRoot(input) {

    let s =
        normalizeMath(input);

    s =
        s.replace(
            /^sqrt\s*\(?\s*/i,
            ""
        )
        .replace(
            /\)?$/,
            ""
        )
        .trim();

    const value =
        Number(s);

    if (!Number.isFinite(value)) {
        throw new Error(
            "Square root requires a valid number."
        );
    }

    if (value < 0) {

        const imaginary =
            Math.sqrt(-value);

        return {
            answer:
                `${formatNumber(imaginary)}i`,
            steps: [
                `<strong>Step 1:</strong> The number is negative.`,
                `<strong>Step 2:</strong> √(-a) = i√a.`,
                `<div class="math-step-expression">√${formatNumber(value)} = ${formatNumber(imaginary)}i</div>`,
                `<strong>Final Answer:</strong> ${formatNumber(imaginary)}i`
            ]
        };
    }

    const result =
        Math.sqrt(value);

    return {
        answer: formatNumber(result),
        steps: [
            `<strong>Step 1:</strong> Identify the number under the square root.`,
            `<div class="math-step-expression">√${formatNumber(value)}</div>`,
            `<strong>Step 2:</strong> Find the number which multiplied by itself gives ${formatNumber(value)}.`,
            `<div class="math-step-expression">${formatNumber(result)} × ${formatNumber(result)} = ${formatNumber(value)}</div>`,
            `<strong>Final Answer:</strong> ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   POWER
   ========================================================= */

function solvePower(input) {

    const s =
        normalizeMath(input);

    const match =
        s.match(
            /^\s*(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)\s*$/
        );

    if (!match) {
        throw new Error(
            "Power format not recognized."
        );
    }

    const base =
        Number(match[1]);

    const exponent =
        Number(match[2]);

    const result =
        Math.pow(base, exponent);

    return {
        answer: formatNumber(result),
        steps: [
            `<strong>Step 1:</strong> Identify the base and exponent.`,
            `<div class="math-step-expression">Base = ${formatNumber(base)}, Exponent = ${formatNumber(exponent)}</div>`,
            `<strong>Step 2:</strong> Apply the power.`,
            `<div class="math-step-expression">${formatNumber(base)}^${formatNumber(exponent)} = ${formatNumber(result)}</div>`,
            `<strong>Final Answer:</strong> ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   FACTORIAL
   ========================================================= */

function solveFactorial(input) {

    const match =
        String(input || "")
            .trim()
            .match(
                /^(-?\d+)\s*!$/
            );

    if (!match) {
        throw new Error(
            "Factorial format not recognized."
        );
    }

    const n =
        Number(match[1]);

    if (n < 0) {
        throw new Error(
            "Factorial is not defined for negative integers."
        );
    }

    if (n > 170) {
        throw new Error(
            "Number is too large for standard factorial calculation."
        );
    }

    let result = 1;

    const operations = [];

    for (let i = 1; i <= n; i++) {

        result *= i;

        operations.push(i);
    }

    return {
        answer: formatNumber(result),
        steps: [
            `<strong>Step 1:</strong> Factorial means multiplying all positive integers up to the number.`,
            `<div class="math-step-expression">${n}! = ${operations.join(" × ")}</div>`,
            `<strong>Step 2:</strong> Calculate the product.`,
            `<div class="math-step-expression">${formatNumber(result)}</div>`,
            `<strong>Final Answer:</strong> ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   NUMERIC TOKENIZER
   ========================================================= */

function tokenizeNumeric(expression) {

    const tokens = [];

    let i = 0;

    while (i < expression.length) {

        const ch = expression[i];

        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        if (/[0-9.]/.test(ch)) {

            let start = i;

            while (
                i < expression.length &&
                /[0-9.]/.test(expression[i])
            ) {
                i++;
            }

            tokens.push({
                type: "number",
                value: Number(
                    expression.slice(start, i)
                )
            });

            continue;
        }

        if ("+-*/^()".includes(ch)) {

            tokens.push({
                type: "operator",
                value: ch
            });

            i++;
            continue;
        }

        throw new Error(
            "Unsupported numeric symbol: " + ch
        );
    }

    return tokens;
}


/* =========================================================
   NUMERIC BODMAS PARSER
   ========================================================= */

class NumericParser {

    constructor(tokens) {

        this.tokens = tokens;
        this.position = 0;

        this.steps = [];
    }

    current() {
        return this.tokens[this.position];
    }

    consume(value) {

        const token = this.current();

        if (
            token &&
            token.value === value
        ) {
            this.position++;
            return true;
        }

        return false;
    }

    parse() {

        const value =
            this.parseExpression();

        if (
            this.position <
            this.tokens.length
        ) {
            throw new Error(
                "Unexpected token."
            );
        }

        return value;
    }

    parseExpression() {

        let value =
            this.parseTerm();

        while (true) {

            if (this.consume("+")) {

                const right =
                    this.parseTerm();

                const result =
                    value + right;

                this.addStep(
                    value,
                    "+",
                    right,
                    result
                );

                value = result;

                continue;
            }

            if (this.consume("-")) {

                const right =
                    this.parseTerm();

                const result =
                    value - right;

                this.addStep(
                    value,
                    "-",
                    right,
                    result
                );

                value = result;

                continue;
            }

            break;
        }

        return value;
    }

    parseTerm() {

        let value =
            this.parsePower();

        while (true) {

            if (this.consume("*")) {

                const right =
                    this.parsePower();

                const result =
                    value * right;

                this.addStep(
                    value,
                    "×",
                    right,
                    result
                );

                value = result;

                continue;
            }

            if (this.consume("/")) {

                const right =
                    this.parsePower();

                if (right === 0) {
                    throw new Error(
                        "Division by zero is not allowed."
                    );
                }

                const result =
                    value / right;

                this.addStep(
                    value,
                    "÷",
                    right,
                    result
                );

                value = result;

                continue;
            }

            break;
        }

        return value;
    }

    parsePower() {

        let value =
            this.parseUnary();

        if (this.consume("^")) {

            const right =
                this.parsePower();

            const result =
                Math.pow(value, right);

            this.addStep(
                value,
                "^",
                right,
                result
            );

            value = result;
        }

        return value;
    }

    parseUnary() {

        if (this.consume("+")) {
            return this.parseUnary();
        }

        if (this.consume("-")) {

            const value =
                this.parseUnary();

            return -value;
        }

        return this.parsePrimary();
    }

    parsePrimary() {

        const token =
            this.current();

        if (!token) {
            throw new Error(
                "Unexpected end."
            );
        }

        if (token.type === "number") {

            this.position++;

            return token.value;
        }

        if (this.consume("(")) {

            const value =
                this.parseExpression();

            if (!this.consume(")")) {
                throw new Error(
                    "Missing closing bracket."
                );
            }

            return value;
        }

        throw new Error(
            "Invalid numeric expression."
        );
    }

    addStep(left, operator, right, result) {

        this.steps.push({
            left,
            operator,
            right,
            result
        });
    }
}


/* =========================================================
   BODMAS SOLVER
   ========================================================= */

function solveBODMAS(input) {

    let expression =
        cleanQuestionPrefix(input);

    expression =
        normalizeMath(expression);

    expression =
        expression.replace(
            /^evaluate\s*:\s*/i,
            ""
        );

    /*
     Only numeric expressions here.
    */

    if (
        /[a-zA-Z]/.test(expression)
    ) {
        throw new Error(
            "Not a pure numeric expression."
        );
    }

    if (!/[0-9]/.test(expression)) {
        throw new Error(
            "No numbers found."
        );
    }

    const tokens =
        tokenizeNumeric(expression);

    const parser =
        new NumericParser(tokens);

    const result =
        parser.parse();

    const steps = [];

    steps.push(
        "<strong>Step 1: Follow BODMAS / order of operations.</strong>"
    );

    steps.push(
        "<div class=\"math-step-expression\">B = Brackets → O = Orders → D/M = Division/Multiplication → A/S = Addition/Subtraction</div>"
    );

    /*
     Explain signs where possible.
    */

    if (
        /-\s*\d+/.test(expression) &&
        /[×*]/.test(expression)
    ) {

        steps.push(
            "<strong>Step 2: Handle multiplication/division before addition/subtraction.</strong>"
        );

        steps.push(
            "Remember: negative × negative = positive, while negative ÷ positive = negative."
        );

    } else {

        steps.push(
            "<strong>Step 2: Perform multiplication and division before addition and subtraction.</strong>"
        );
    }

    parser.steps.forEach((step, index) => {

        const operator =
            step.operator;

        steps.push(
            `<div class="math-step-expression">${formatNumber(step.left)} ${operator} ${formatNumber(step.right)} = <strong>${formatNumber(step.result)}</strong></div>`
        );
    });

    steps.push(
        `<strong>Final Answer:</strong> ${formatNumber(result)}`
    );

    return {
        answer: formatNumber(result),
        steps
    };
}


/* =========================================================
   BASIC NUMERIC EXPRESSION
   ========================================================= */

function isNumericExpression(expression) {

    const s =
        normalizeMath(expression);

    if (!/[0-9]/.test(s)) {
        return false;
    }

    return !/[a-zA-Z]/.test(s);
}


/* =========================================================
   MAIN SOLVER
   ========================================================= */

function solveQuestion(rawInput) {

    const original =
        String(rawInput || "").trim();

    if (!original) {

        throw new Error(
            TEXT[currentLanguage].enterQuestion
        );
    }

    let input =
        normalizeVoiceText(original);

    if (!input) {
        input = original;
    }

    /*
     ======================================================
     1. PERCENTAGE
     ======================================================
     */

    if (
        /%.*\bof\b/i.test(input) ||
        /\bpercent\b.*\bof\b/i.test(input)
    ) {

        return solvePercentage(input);
    }


    /*
     ======================================================
     2. HCF
     ======================================================
     */

    if (
        /\b(hcf|gcd|greatest common divisor)\b/i.test(input) ||
        /महत्तम समापवर्तक/i.test(input)
    ) {

        return solveHCF(input);
    }


    /*
     ======================================================
     3. LCM
     ======================================================
     */

    if (
        /\b(lcm|least common multiple)\b/i.test(input) ||
        /लघुत्तम समापवर्त्य/i.test(input)
    ) {

        return solveLCM(input);
    }


    /*
     ======================================================
     4. AVERAGE
     ======================================================
     */

    if (
        /\baverage\b/i.test(input) ||
        /औसत/i.test(input)
    ) {

        return solveAverage(input);
    }


    /*
     ======================================================
     5. FACTORIAL
     ======================================================
     */

    if (
        /^\s*-?\d+\s*!\s*$/.test(
            normalizeMath(input)
        )
    ) {

        return solveFactorial(input);
    }


    /*
     ======================================================
     6. SQUARE ROOT
     ======================================================
     */

    if (
        /^\s*(?:√|sqrt)\s*\(?\s*-?\d+(?:\.\d+)?\s*\)?\s*$/i.test(
            input
        )
    ) {

        return solveSquareRoot(input);
    }


    /*
     ======================================================
     7. POWER
     ======================================================
     */

    if (
        /^\s*-?\d+(?:\.\d+)?\s*\^\s*-?\d+(?:\.\d+)?\s*$/.test(
            normalizeMath(input)
        )
    ) {

        return solvePower(input);
    }


    /*
     ======================================================
     8. EQUATION
     ======================================================
     */

    if (input.includes("=")) {

        const normalized =
            normalizeMath(input);

        /*
         Determine polynomial degree.
        */

        try {

            const equalIndex =
                normalized.indexOf("=");

            const left =
                normalized.slice(
                    0,
                    equalIndex
                );

            const right =
                normalized.slice(
                    equalIndex + 1
                );

            const L =
                parsePolynomial(left);

            const R =
                parsePolynomial(right);

            const difference =
                polySubtract(
                    L.polynomial,
                    R.polynomial
                );

            const degree =
                Math.max(
                    ...Object.keys(difference)
                        .map(Number)
                );

            if (degree >= 2) {

                return solveQuadraticEquation(
                    normalized
                );
            }

            return solveLinearEquation(
                normalized
            );

        } catch (error) {

            throw error;
        }
    }


    /*
     ======================================================
     9. ALGEBRA
     ======================================================
     */

    /*
     If letters exist, treat as algebra.
    This is important for:
    
    2x
    4(x+1)
    (x+2)(x+3)
    3x²+5x-2
    */

    if (
        /[a-zA-Z]/.test(
            normalizeMath(input)
        )
    ) {

        return solveAlgebraSimplification(
            input
        );
    }


    /*
     ======================================================
     10. NUMERIC BODMAS
     ======================================================
     */

    if (
        isNumericExpression(input)
    ) {

        return solveBODMAS(input);
    }


    throw new Error(
        TEXT[currentLanguage].cannotSolve
    );
}


/* =========================================================
   RENDER RESULT
   ========================================================= */

function renderResult(result) {

    if (!$("resultSection")) {
        return;
    }

    $("resultSection").hidden = false;

    if ($("answer")) {

        $("answer").innerHTML =
            `<div class="final-answer-box">${escapeHTML(result.answer)}</div>`;
    }

    if ($("steps")) {

        $("steps").innerHTML =
            result.steps
                .map(
                    step =>
                        `<div class="solution-step">${step}</div>`
                )
                .join("");
    }

    $("resultSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   SOLVE BUTTON
   ========================================================= */

function handleSolve() {

    const question =
        $("question")
            ? $("question").value.trim()
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

        renderResult(result);

        addHistory(
            question,
            result
        );

    } catch (error) {

        console.error(
            "Math King Solver Error:",
            error
        );

        showError(
            error.message ||
            TEXT[currentLanguage].cannotSolve
        );
    }
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    if (!$("resultSection")) {
        return;
    }

    $("resultSection").hidden = false;

    if ($("answer")) {

        $("answer").innerHTML =
            `<div class="error-answer-box">⚠️ ${escapeHTML(message)}</div>`;
    }

    if ($("steps")) {

        $("steps").innerHTML =
            `<div class="solution-step">
                <strong>Please check the question and try again.</strong>
             </div>`;
    }

    $("resultSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   HISTORY STORAGE
   ========================================================= */

function getHistory() {

    try {

        let raw =
            localStorage.getItem(
                HISTORY_KEY
            );

        /*
         Migrate old history.
        */

        if (!raw) {

            const old =
                localStorage.getItem(
                    OLD_HISTORY_KEY
                );

            if (old) {

                localStorage.setItem(
                    HISTORY_KEY,
                    old
                );

                raw = old;
            }
        }

        if (!raw) {
            return [];
        }

        const parsed =
            JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.warn(
            "History read error:",
            error
        );

        return [];
    }
}

function saveHistory(history) {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                history.slice(0, 50)
            )
        );

    } catch (error) {

        console.warn(
            "History save error:",
            error
        );
    }
}


/* =========================================================
   ADD HISTORY
   ========================================================= */

function addHistory(question, result) {

    const history =
        getHistory();

    const item = {
        id:
            Date.now() +
            Math.random()
                .toString(36)
                .slice(2),

        question,

        answer:
            result.answer,

        steps:
            result.steps,

        date:
            new Date().toISOString()
    };

    history.unshift(item);

    saveHistory(history);

    renderHistory();
}


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderHistory() {

    const container =
        $("historyList");

    if (!container) {
        return;
    }

    const history =
        getHistory();

    if (history.length === 0) {

        container.innerHTML =
            `<div class="empty-history">
                ${escapeHTML(TEXT[currentLanguage].noHistory)}
             </div>`;

        return;
    }

    container.innerHTML =
        history.map(item => {

            return `
                <div
                    class="history-item"
                    data-history-id="${escapeHTML(item.id)}"
                >

                    <button
                        class="history-open"
                        type="button"
                        data-history-open="${escapeHTML(item.id)}"
                    >

                        <div class="history-question">
                            ${escapeHTML(item.question)}
                        </div>

                        <div class="history-answer">
                            = ${escapeHTML(item.answer)}
                        </div>

                    </button>

                    <button
                        class="history-delete"
                        type="button"
                        data-history-delete="${escapeHTML(item.id)}"
                        title="Delete"
                        aria-label="Delete"
                    >
                        ×
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================================================
   HISTORY CLICK
   ========================================================= */

function handleHistoryClick(event) {

    const openButton =
        event.target.closest(
            "[data-history-open]"
        );

    const deleteButton =
        event.target.closest(
            "[data-history-delete]"
        );

    if (deleteButton) {

        const id =
            deleteButton.dataset.historyDelete;

        const history =
            getHistory()
                .filter(item => item.id !== id);

        saveHistory(history);

        renderHistory();

        return;
    }

    if (openButton) {

        const id =
            openButton.dataset.historyOpen;

        const history =
            getHistory();

        const item =
            history.find(
                entry => entry.id === id
            );

        if (!item) {
            return;
        }

        if ($("question")) {
            $("question").value =
                item.question;
        }

        try {

            const result =
                solveQuestion(
                    item.question
                );

            renderResult(result);

        } catch (error) {

            showError(
                error.message
            );
        }
    }
}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    const history =
        getHistory();

    if (history.length === 0) {
        return;
    }

    const confirmed =
        window.confirm(
            currentLanguage === "hi"
                ? "क्या आप पूरी calculation history हटाना चाहते हैं?"
                : "Do you want to delete all calculation history?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        HISTORY_KEY
    );

    renderHistory();
}


/* =========================================================
   CLEAR INPUT
   ========================================================= */

function clearInput() {

    if ($("question")) {
        $("question").value = "";
        $("question").focus();
    }

    if ($("resultSection")) {
        $("resultSection").hidden = true;
    }

    if ($("voiceStatus")) {
        $("voiceStatus").textContent =
            TEXT[currentLanguage].voiceReady;
    }
}


/* =========================================================
   MATH KEYBOARD
   ========================================================= */

function insertAtCursor(text) {

    const textarea =
        $("question");

    if (!textarea) {
        return;
    }

    const start =
        textarea.selectionStart;

    const end =
        textarea.selectionEnd;

    const value =
        textarea.value;

    textarea.value =
        value.slice(0, start) +
        text +
        value.slice(end);

    const newPosition =
        start + text.length;

    textarea.selectionStart =
        newPosition;

    textarea.selectionEnd =
        newPosition;

    textarea.focus();
}

function backspaceAtCursor() {

    const textarea =
        $("question");

    if (!textarea) {
        return;
    }

    const start =
        textarea.selectionStart;

    const end =
        textarea.selectionEnd;

    if (
        start === 0 &&
        end === 0
    ) {
        return;
    }

    if (start !== end) {

        textarea.value =
            textarea.value.slice(0, start) +
            textarea.value.slice(end);

        textarea.selectionStart = start;
        textarea.selectionEnd = start;

        return;
    }

    textarea.value =
        textarea.value.slice(0, start - 1) +
        textarea.value.slice(start);

    textarea.selectionStart =
        start - 1;

    textarea.selectionEnd =
        start - 1;
}

function setupMathKeyboard() {

    document
        .querySelectorAll(".math-key")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const symbol =
                        button.dataset.symbol;

                    if (!symbol) {
                        return;
                    }

                    insertAtCursor(
                        symbol
                    );
                }
            );
        });

    if ($("backspaceBtn")) {

        $("backspaceBtn")
            .addEventListener(
                "click",
                backspaceAtCursor
            );
    }

    if ($("keyboardBackspaceBtn")) {

        $("keyboardBackspaceBtn")
            .addEventListener(
                "click",
                backspaceAtCursor
            );
    }

    if ($("deleteAllBtn")) {

        $("deleteAllBtn")
            .addEventListener(
                "click",
                clearInput
            );
    }
}


/* =========================================================
   EXAMPLES
   ========================================================= */

function setupExamples() {

    document
        .querySelectorAll(
            "[data-example]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const example =
                        button.dataset.example;

                    if ($("question")) {

                        $("question").value =
                            example;
                    }

                    handleSolve();
                }
            );
        });
}


/* =========================================================
   VOICE INPUT
   ========================================================= */

function setupVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if ($("voiceStatus")) {

            $("voiceStatus").textContent =
                TEXT[currentLanguage].voiceUnsupported;
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.lang =
        currentLanguage === "hi"
            ? "hi-IN"
            : "en-IN";

    recognition.onstart = () => {

        isListening = true;

        if ($("micBtn")) {
            $("micBtn").classList.add(
                "listening"
            );
        }

        if ($("micIcon")) {
            $("micIcon").textContent =
                "🔴";
        }

        if ($("micText")) {
            $("micText").textContent =
                "Listening...";
        }

        if ($("voiceStatus")) {
            $("voiceStatus").textContent =
                TEXT[currentLanguage].listening;
        }
    };

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        const normalized =
            normalizeVoiceText(
                transcript
            );

        if ($("question")) {

            $("question").value =
                normalized ||
                transcript;
        }

        /*
         Auto solve after voice input.
        */

        setTimeout(
            handleSolve,
            250
        );
    };

    recognition.onerror = event => {

        console.warn(
            "Voice error:",
            event.error
        );

        if ($("voiceStatus")) {
            $("voiceStatus").textContent =
                "Voice error: " +
                event.error;
        }
    };

    recognition.onend = () => {

        isListening = false;

        if ($("micBtn")) {
            $("micBtn").classList.remove(
                "listening"
            );
        }

        if ($("micIcon")) {
            $("micIcon").textContent =
                "🎤";
        }

        if ($("micText")) {
            $("micText").textContent =
                "Voice Input";
        }

        if ($("voiceStatus")) {
            $("voiceStatus").textContent =
                TEXT[currentLanguage].voiceReady;
        }
    };


    if ($("micBtn")) {

        $("micBtn")
            .addEventListener(
                "click",
                () => {

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

                        console.warn(
                            "Voice start error:",
                            error
                        );
                    }
                }
            );
    }
}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

function setupKeyboardShortcut() {

    if (!$("question")) {
        return;
    }

    $("question")
        .addEventListener(
            "keydown",
            event => {

                if (
                    (event.ctrlKey ||
                        event.metaKey) &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    handleSolve();
                }
            }
        );
}


/* =========================================================
   PWA INSTALL
   ========================================================= */

function isIOS() {

    return /iphone|ipad|ipod/i.test(
        navigator.userAgent
    );
}

function isStandalone() {

    return (
        window.matchMedia &&
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
    ) ||
    window.navigator.standalone === true;
}

function setupInstallPrompt() {

    const installCard =
        $("installCard");

    const installButton =
        $("installBtn");

    if (!installCard) {
        return;
    }

    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            deferredInstallPrompt =
                event;

            installCard.hidden = false;
        }
    );

    window.addEventListener(
        "appinstalled",
        () => {

            deferredInstallPrompt =
                null;

            installCard.hidden = true;
        }
    );


    if (
        isIOS() &&
        !isStandalone()
    ) {

        installCard.hidden = false;

        if ($("iosInstallHelp")) {
            $("iosInstallHelp").hidden =
                false;
        }

        if (installButton) {
            installButton.addEventListener(
                "click",
                () => {

                    if ($("iosInstallHelp")) {
                        $("iosInstallHelp").hidden =
                            false;
                    }
                }
            );
        }

        return;
    }


    if (installButton) {

        installButton.addEventListener(
            "click",
            async () => {

                if (!deferredInstallPrompt) {
                    return;
                }

                deferredInstallPrompt.prompt();

                try {
                    await deferredInstallPrompt.userChoice;
                } catch (error) {
                    console.warn(
                        "Install prompt error:",
                        error
                    );
                }

                deferredInstallPrompt =
                    null;

                installCard.hidden = true;
            }
        );
    }
}


/* =========================================================
   SERVICE WORKER
   ONLY REGISTER HERE
   ========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }

    /*
     Do not register from file://
    */

    if (
        window.location.protocol ===
        "file:"
    ) {
        console.log(
            "Math King: Service Worker skipped on file://"
        );

        return;
    }

    window.addEventListener(
        "load",
        async () => {

            try {

                const registration =
                    await navigator.serviceWorker.register(
                        "./service-worker.js",
                        {
                            scope: "./"
                        }
                    );

                console.log(
                    "Math King Service Worker:",
                    registration.scope
                );

            } catch (error) {

                console.error(
                    "Math King Service Worker Error:",
                    error
                );
            }
        }
    );
}


/* =========================================================
   LANGUAGE BUTTONS
   ========================================================= */

function setupLanguageButtons() {

    if ($("englishBtn")) {

        $("englishBtn")
            .addEventListener(
                "click",
                () => {

                    setLanguage("en");

                    if (recognition) {
                        recognition.lang =
                            "en-IN";
                    }
                }
            );
    }

    if ($("hindiBtn")) {

        $("hindiBtn")
            .addEventListener(
                "click",
                () => {

                    setLanguage("hi");

                    if (recognition) {
                        recognition.lang =
                            "hi-IN";
                    }
                }
            );
    }
}


/* =========================================================
   MAIN BUTTONS
   ========================================================= */

function setupMainButtons() {

    if ($("solveBtn")) {

        $("solveBtn")
            .addEventListener(
                "click",
                handleSolve
            );
    }

    if ($("clearBtn")) {

        $("clearBtn")
            .addEventListener(
                "click",
                clearInput
            );
    }

    if ($("clearHistoryBtn")) {

        $("clearHistoryBtn")
            .addEventListener(
                "click",
                clearHistory
            );
    }

    if ($("historyList")) {

        $("historyList")
            .addEventListener(
                "click",
                handleHistoryClick
            );
    }
}


/* =========================================================
   INPUT ENTER / AUTO FEATURES
   ========================================================= */

function setupInput() {

    if (!$("question")) {
        return;
    }

    $("question")
        .addEventListener(
            "input",
            () => {

                /*
                 Hide old result when
                 user starts a new question.
                */

                if ($("resultSection")) {
                    $("resultSection").hidden = true;
                }
            }
        );
}


/* =========================================================
   TEST ENGINE
   ========================================================= */

function runInternalTests() {

    try {

        const test1 =
            solveQuestion(
                "Simplify: 4(2x - 3) - 2(x + 5)"
            );

        console.log(
            "TEST 1:",
            test1.answer
        );

        const test2 =
            solveQuestion(
                "2x + 5 = 15"
            );

        console.log(
            "TEST 2:",
            test2.answer
        );

        const test3 =
            solveQuestion(
                "(x + 2)(x + 3)"
            );

        console.log(
            "TEST 3:",
            test3.answer
        );

        const test4 =
            solveQuestion(
                "Evaluate: (-6) × (-4) + (-20) ÷ 4"
            );

        console.log(
            "TEST 4:",
            test4.answer
        );

    } catch (error) {

        console.warn(
            "Math King internal test:",
            error
        );
    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initMathKing() {

    setLanguage("en");

    setupLanguageButtons();

    setupMainButtons();

    setupMathKeyboard();

    setupExamples();

    setupVoice();

    setupKeyboardShortcut();

    setupInput();

    setupInstallPrompt();

    registerServiceWorker();

    renderHistory();

    runInternalTests();

    console.log(
        "Math King initialized successfully."
    );
}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.MathKing = {

    version: "4.0",

    solve: solveQuestion,

    simplify: solveAlgebraSimplification,

    solveEquation: solveLinearEquation,

    solveQuadratic: solveQuadraticEquation,

    percentage: solvePercentage,

    average: solveAverage,

    hcf: solveHCF,

    lcm: solveLCM,

    bodmas: solveBODMAS
};


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
