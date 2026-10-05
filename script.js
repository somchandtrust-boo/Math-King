/* =========================================================
   MATH KING — ADVANCED MATHEMATICS ENGINE
   Complete script.js replacement
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const HISTORY_KEY = "mathKingHistory";
const LEGACY_HISTORY_KEY = "mathSolverHistory";

let currentLanguage = "en";
let recognition = null;
let isListening = false;
let deferredInstallPrompt = null;


/* =========================================================
   TEXT
   ========================================================= */

const TEXT = {
    en: {
        appSubtitle: "Real Mathematics Question Solver",
        questionTitle: "Enter Your Mathematics Question",
        questionHint: "Type, paste, or use the microphone.",
        questionLabel: "Mathematics Question",
        micText: "Voice Input",
        listening: "Listening...",
        micReady: "Tap microphone and speak your question.",
        standardLabel: "Class / Standard",
        solve: "Solve Question",
        clear: "Clear",
        backspace: "Backspace",
        deleteAll: "Clear All",
        examplesTitle: "Try Examples",
        answerTitle: "Final Answer",
        stepsTitle: "Detailed Solution",
        historyTitle: "History",
        clearHistoryText: "Clear History",
        installTitle: "Install Math King",
        installDescription: "Install Math King on your device for quick access.",
        installButton: "Install App",
        iosHelp:
            "On iPhone/iPad: tap Share → Add to Home Screen.",
        noQuestion: "Please enter a mathematics question.",
        unable:
            "I could not understand this question yet. Try writing it in a simpler mathematical form.",
        finalAnswer: "Final Answer",
        step: "Step"
    },

    hi: {
        appSubtitle: "Real Mathematics Question Solver",
        questionTitle: "अपना गणित का प्रश्न लिखें",
        questionHint: "प्रश्न लिखें, paste करें या microphone का उपयोग करें।",
        questionLabel: "गणित का प्रश्न",
        micText: "आवाज़ से लिखें",
        listening: "सुन रहा हूँ...",
        micReady: "Microphone दबाकर अपना प्रश्न बोलें।",
        standardLabel: "कक्षा / Standard",
        solve: "प्रश्न हल करें",
        clear: "Clear",
        backspace: "Backspace",
        deleteAll: "सभी हटाएँ",
        examplesTitle: "उदाहरण",
        answerTitle: "अंतिम उत्तर",
        stepsTitle: "पूरी Solution",
        historyTitle: "History",
        clearHistoryText: "History साफ करें",
        installTitle: "Math King Install करें",
        installDescription: "Math King को अपने device में install करें।",
        installButton: "App Install करें",
        iosHelp:
            "iPhone/iPad: Share → Add to Home Screen दबाएँ।",
        noQuestion: "कृपया गणित का प्रश्न लिखें।",
        unable:
            "मैं इस प्रश्न को अभी समझ नहीं पाया। कृपया इसे थोड़े सरल mathematical form में लिखें।",
        finalAnswer: "अंतिम उत्तर",
        step: "चरण"
    }
};


/* =========================================================
   DOM
   ========================================================= */

const $ = id => document.getElementById(id);

const questionInput = $("question");
const answerBox = $("answer");
const stepsBox = $("steps");
const resultSection = $("resultSection");
const historyList = $("historyList");

const englishBtn = $("englishBtn");
const hindiBtn = $("hindiBtn");

const solveBtn = $("solveBtn");
const clearBtn = $("clearBtn");

const micBtn = $("micBtn");
const micIcon = $("micIcon");
const micText = $("micText");
const voiceStatus = $("voiceStatus");

const standardSelect = $("standard");

const backspaceBtn = $("backspaceBtn");
const deleteAllBtn = $("clearHistoryBtn");

const installBtn = $("installBtn");
const iosInstallHelp = $("iosInstallHelp");


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return String(value);
    }

    if (Math.abs(value - Math.round(value)) < 1e-12) {
        return String(Math.round(value));
    }

    return String(Number(value.toFixed(12)));
}


function cleanSpaces(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(language) {

    currentLanguage = language === "hi" ? "hi" : "en";

    document.documentElement.lang =
        currentLanguage === "hi" ? "hi" : "en";

    const t = TEXT[currentLanguage];

    const mapping = {
        appSubtitle: t.appSubtitle,
        questionTitle: t.questionTitle,
        questionHint: t.questionHint,
        questionLabel: t.questionLabel,
        standardLabel: t.standardLabel,
        solveBtn: t.solve,
        clearBtn: t.clear,
        examplesTitle: t.examplesTitle,
        answerTitle: t.answerTitle,
        stepsTitle: t.stepsTitle,
        historyTitle: t.historyTitle,
        clearHistoryText: t.clearHistoryText,
        installTitle: t.installTitle,
        installDescription: t.installDescription,
        installBtn: t.installButton
    };

    Object.keys(mapping).forEach(id => {
        const el = $(id);
        if (el) el.textContent = mapping[id];
    });

    if (!isListening && micText) {
        micText.textContent = t.micText;
    }

    if (voiceStatus) {
        voiceStatus.textContent = t.micReady;
    }

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

    renderHistory();
}


/* =========================================================
   NORMALIZE MATHEMATICS
   ========================================================= */

function normalizeMath(input) {

    let text = String(input || "");

    text = text
        .replace(/[−–—]/g, "-")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/·/g, "*")
        .replace(/π/g, "PI")
        .replace(/∞/g, "Infinity")
        .replace(/√/g, "sqrt")
        .replace(/≤/g, "<=")
        .replace(/≥/g, ">=")
        .replace(/≠/g, "!=")
        .replace(/²/g, "^2")
        .replace(/³/g, "^3")
        .replace(/⁴/g, "^4")
        .replace(/⁵/g, "^5")
        .replace(/⁶/g, "^6")
        .replace(/⁷/g, "^7")
        .replace(/⁸/g, "^8")
        .replace(/⁹/g, "^9")
        .replace(/⁰/g, "^0");

    return cleanSpaces(text);
}


/* =========================================================
   VOICE NORMALIZATION
   ========================================================= */

function normalizeVoiceText(text) {

    let value = String(text || "").toLowerCase();

    const replacements = [
        [/\btimes\b/g, "*"],
        [/\bmultiplied by\b/g, "*"],
        [/\bdivide by\b/g, "/"],
        [/\bdivided by\b/g, "/"],
        [/\bplus\b/g, "+"],
        [/\bminus\b/g, "-"],
        [/\bsubtract\b/g, "-"],
        [/\badd\b/g, "+"],
        [/\bequals\b/g, "="],
        [/\bis equal to\b/g, "="],
        [/\bpercent\b/g, "%"],
        [/\bsquare root of\b/g, "sqrt "],
        [/\bsquare root\b/g, "sqrt "],
        [/\bpower of\b/g, "^"],
        [/\bopen bracket\b/g, "("],
        [/\bclose bracket\b/g, ")"],
        [/\bopen parenthesis\b/g, "("],
        [/\bclose parenthesis\b/g, ")"]
    ];

    replacements.forEach(([pattern, replacement]) => {
        value = value.replace(pattern, replacement);
    });

    const numbers = {
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
        hundred: "100"
    };

    Object.keys(numbers).forEach(word => {
        value = value.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            numbers[word]
        );
    });

    return value;
}


/* =========================================================
   HINDI NUMBER WORDS
   ========================================================= */

function normalizeHindiNumbers(text) {

    let value = String(text || "");

    const numbers = {
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
        "बीस": "20"
    };

    Object.keys(numbers).forEach(word => {
        value = value.replace(
            new RegExp(word, "g"),
            numbers[word]
        );
    });

    return value;
}


/* =========================================================
   TOKENIZER
   ========================================================= */

function tokenize(expression) {

    const tokens = [];
    let i = 0;

    while (i < expression.length) {

        const char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/[0-9.]/.test(char)) {

            let number = "";

            while (
                i < expression.length &&
                /[0-9.]/.test(expression[i])
            ) {
                number += expression[i];
                i++;
            }

            if ((number.match(/\./g) || []).length > 1) {
                throw new Error("Invalid number");
            }

            tokens.push({
                type: "number",
                value: Number(number)
            });

            continue;
        }

        if ("+-*/^()".includes(char)) {

            tokens.push({
                type: char,
                value: char
            });

            i++;
            continue;
        }

        throw new Error("Unsupported symbol: " + char);
    }

    return tokens;
}


/* =========================================================
   DETAILED NUMERIC PARSER
   ========================================================= */

class DetailedParser {

    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.steps = [];
    }

    current() {
        return this.tokens[this.index];
    }

    eat(type) {
        if (this.current() && this.current().type === type) {
            return this.tokens[this.index++];
        }

        return null;
    }

    parse() {

        const result = this.parseExpression();

        if (this.index < this.tokens.length) {
            throw new Error("Unexpected token");
        }

        return result;
    }

    parseExpression() {

        let value = this.parseTerm();

        while (
            this.current() &&
            (
                this.current().type === "+" ||
                this.current().type === "-"
            )
        ) {

            const operator = this.current().type;

            this.index++;

            const right = this.parseTerm();
            const left = value;

            value =
                operator === "+"
                    ? left + right
                    : left - right;

            this.steps.push({
                type: operator === "+" ? "addition" : "subtraction",
                left,
                right,
                result: value
            });
        }

        return value;
    }

    parseTerm() {

        let value = this.parsePower();

        while (
            this.current() &&
            (
                this.current().type === "*" ||
                this.current().type === "/"
            )
        ) {

            const operator = this.current().type;

            this.index++;

            const right = this.parsePower();
            const left = value;

            if (operator === "/" && right === 0) {
                throw new Error("Division by zero");
            }

            value =
                operator === "*"
                    ? left * right
                    : left / right;

            this.steps.push({
                type: operator === "*" ? "multiplication" : "division",
                left,
                right,
                result: value
            });
        }

        return value;
    }

    parsePower() {

        let value = this.parseUnary();

        if (
            this.current() &&
            this.current().type === "^"
        ) {

            this.index++;

            const right = this.parsePower();
            const left = value;

            value = Math.pow(left, right);

            this.steps.push({
                type: "power",
                left,
                right,
                result: value
            });
        }

        return value;
    }

    parseUnary() {

        if (this.eat("+")) {
            return this.parseUnary();
        }

        if (this.eat("-")) {
            const value = this.parseUnary();
            return -value;
        }

        return this.parsePrimary();
    }

    parsePrimary() {

        const token = this.current();

        if (!token) {
            throw new Error("Incomplete expression");
        }

        if (token.type === "number") {
            this.index++;
            return token.value;
        }

        if (token.type === "(") {

            this.index++;

            const value = this.parseExpression();

            if (!this.eat(")")) {
                throw new Error("Missing closing bracket");
            }

            return value;
        }

        throw new Error("Expected number");
    }
}


/* =========================================================
   NUMERIC EXPRESSION SOLVER
   ========================================================= */

function solveNumericExpression(expression) {

    const tokens = tokenize(expression);

    const parser = new DetailedParser(tokens);

    const value = parser.parse();

    return {
        value,
        steps: parser.steps
    };
}


/* =========================================================
   SIGN EXPLANATION
   ========================================================= */

function signExplanation(operator, left, right) {

    if (
        (operator === "*" || operator === "/") &&
        left < 0 &&
        right < 0
    ) {
        return currentLanguage === "hi"
            ? "ऋणात्मक ÷/× ऋणात्मक = धनात्मक"
            : "Negative ÷/× negative = positive";
    }

    if (
        (operator === "*" || operator === "/") &&
        left < 0 &&
        right > 0
    ) {
        return currentLanguage === "hi"
            ? "ऋणात्मक ÷/× धनात्मक = ऋणात्मक"
            : "Negative ÷/× positive = negative";
    }

    if (
        (operator === "*" || operator === "/") &&
        left > 0 &&
        right < 0
    ) {
        return currentLanguage === "hi"
            ? "धनात्मक ÷/× ऋणात्मक = ऋणात्मक"
            : "Positive ÷/× negative = negative";
    }

    return "";
}


/* =========================================================
   NUMERIC STEPS
   ========================================================= */

function buildNumericSteps(expression, result) {

    const steps = [];

    if (currentLanguage === "hi") {

        steps.push(
            "BODMAS / Order of Operations का पालन करें।"
        );

    } else {

        steps.push(
            "Apply BODMAS / Order of Operations."
        );
    }

    result.steps.forEach(operation => {

        let symbol = "+";

        if (operation.type === "subtraction") symbol = "−";
        if (operation.type === "multiplication") symbol = "×";
        if (operation.type === "division") symbol = "÷";
        if (operation.type === "power") symbol = "^";

        const left = formatNumber(operation.left);
        const right = formatNumber(operation.right);
        const answer = formatNumber(operation.result);

        steps.push(
            `${left} ${symbol} ${right} = ${answer}`
        );

        const explanation = signExplanation(
            symbol === "×" ? "*" :
            symbol === "÷" ? "/" :
            symbol,
            operation.left,
            operation.right
        );

        if (explanation) {
            steps.push(explanation);
        }
    });

    steps.push(
        currentLanguage === "hi"
            ? `अंतिम उत्तर = ${formatNumber(result.value)}`
            : `Final Answer = ${formatNumber(result.value)}`
    );

    return steps;
}


/* =========================================================
   VARIABLE DETECTION
   ========================================================= */

function hasVariable(text) {
    return /[a-zA-Z]/.test(text);
}


/* =========================================================
   ALGEBRA TOKENIZER
   ========================================================= */

function algebraTokens(expression) {

    const text = expression
        .replace(/\s+/g, "")
        .replace(/−/g, "-")
        .replace(/×/g, "*")
        .replace(/·/g, "*")
        .replace(/÷/g, "/");

    const tokens = [];
    let i = 0;

    while (i < text.length) {

        const char = text[i];

        if (/[0-9.]/.test(char)) {

            let value = "";

            while (
                i < text.length &&
                /[0-9.]/.test(text[i])
            ) {
                value += text[i++];
            }

            tokens.push({
                type: "number",
                value: Number(value)
            });

            continue;
        }

        if (/[a-zA-Z]/.test(char)) {

            let variable = "";

            while (
                i < text.length &&
                /[a-zA-Z]/.test(text[i])
            ) {
                variable += text[i++];
            }

            tokens.push({
                type: "variable",
                value: variable
            });

            continue;
        }

        if ("+-*/^()".includes(char)) {

            tokens.push({
                type: char,
                value: char
            });

            i++;
            continue;
        }

        throw new Error("Unsupported algebra symbol");
    }

    return tokens;
}


/* =========================================================
   ALGEBRA POLYNOMIAL ENGINE
   ========================================================= */

function addPolynomial(a, b) {

    const result = {};

    Object.keys(a).forEach(power => {
        result[power] = (result[power] || 0) + a[power];
    });

    Object.keys(b).forEach(power => {
        result[power] = (result[power] || 0) + b[power];
    });

    return cleanPolynomial(result);
}


function subtractPolynomial(a, b) {

    const result = {};

    Object.keys(a).forEach(power => {
        result[power] = (result[power] || 0) + a[power];
    });

    Object.keys(b).forEach(power => {
        result[power] = (result[power] || 0) - b[power];
    });

    return cleanPolynomial(result);
}


function multiplyPolynomial(a, b) {

    const result = {};

    Object.keys(a).forEach(p1 => {

        Object.keys(b).forEach(p2 => {

            const power = Number(p1) + Number(p2);

            result[power] =
                (result[power] || 0) +
                a[p1] * b[p2];
        });
    });

    return cleanPolynomial(result);
}


function scalePolynomial(poly, factor) {

    const result = {};

    Object.keys(poly).forEach(power => {
        result[power] = poly[power] * factor;
    });

    return cleanPolynomial(result);
}


function cleanPolynomial(poly) {

    const result = {};

    Object.keys(poly).forEach(power => {

        const value = poly[power];

        if (Math.abs(value) > 1e-12) {
            result[power] = value;
        }
    });

    return result;
}


function constantPolynomial(value) {
    return value === 0 ? {} : { 0: value };
}


function variablePolynomial() {
    return { 1: 1 };
}


/* =========================================================
   POLYNOMIAL PARSER
   ========================================================= */

class PolynomialParser {

    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }

    current() {
        return this.tokens[this.index];
    }

    eat(type) {

        if (
            this.current() &&
            this.current().type === type
        ) {
            return this.tokens[this.index++];
        }

        return null;
    }

    parse() {

        let result = this.parseExpression();

        if (this.index < this.tokens.length) {
            throw new Error("Unexpected algebra token");
        }

        return result;
    }

    parseExpression() {

        let value = this.parseTerm();

        while (
            this.current() &&
            (
                this.current().type === "+" ||
                this.current().type === "-"
            )
        ) {

            const operator = this.current().type;

            this.index++;

            const right = this.parseTerm();

            value =
                operator === "+"
                    ? addPolynomial(value, right)
                    : subtractPolynomial(value, right);
        }

        return value;
    }

    parseTerm() {

        let value = this.parsePower();

        while (
            this.current() &&
            (
                this.current().type === "*" ||
                this.current().type === "/"
            )
        ) {

            const operator = this.current().type;

            this.index++;

            const right = this.parsePower();

            if (operator === "*") {

                value = multiplyPolynomial(
                    value,
                    right
                );

            } else {

                if (
                    Object.keys(right).some(
                        power => Number(power) !== 0
                    )
                ) {
                    throw new Error(
                        "Variable denominator not supported"
                    );
                }

                const constant = right[0] || 0;

                if (constant === 0) {
                    throw new Error("Division by zero");
                }

                value = scalePolynomial(
                    value,
                    1 / constant
                );
            }
        }

        return value;
    }

    parsePower() {

        let value = this.parseUnary();

        if (
            this.current() &&
            this.current().type === "^"
        ) {

            this.index++;

            const exponentToken = this.current();

            if (
                !exponentToken ||
                exponentToken.type !== "number"
            ) {
                throw new Error(
                    "Power must be numeric"
                );
            }

            const exponent = exponentToken.value;

            this.index++;

            if (
                !Number.isInteger(exponent) ||
                exponent < 0 ||
                exponent > 10
            ) {
                throw new Error(
                    "Unsupported power"
                );
            }

            let result = constantPolynomial(1);

            for (let i = 0; i < exponent; i++) {
                result = multiplyPolynomial(
                    result,
                    value
                );
            }

            value = result;
        }

        return value;
    }

    parseUnary() {

        if (this.eat("+")) {
            return this.parseUnary();
        }

        if (this.eat("-")) {
            return scalePolynomial(
                this.parseUnary(),
                -1
            );
        }

        return this.parsePrimary();
    }

    parsePrimary() {

        const token = this.current();

        if (!token) {
            throw new Error("Incomplete algebra");
        }

        if (token.type === "number") {

            this.index++;

            return constantPolynomial(
                token.value
            );
        }

        if (token.type === "variable") {

            this.index++;

            return variablePolynomial();
        }

        if (token.type === "(") {

            this.index++;

            const result =
                this.parseExpression();

            if (!this.eat(")")) {
                throw new Error(
                    "Missing closing bracket"
                );
            }

            return result;
        }

        throw new Error(
            "Invalid algebra expression"
        );
    }
}


/* =========================================================
   POLYNOMIAL FORMATTER
   ========================================================= */

function polynomialToString(poly) {

    const powers = Object.keys(poly)
        .map(Number)
        .sort((a, b) => b - a);

    if (powers.length === 0) {
        return "0";
    }

    let output = "";

    powers.forEach(power => {

        let coefficient = poly[power];

        if (Math.abs(coefficient) < 1e-12) {
            return;
        }

        const negative = coefficient < 0;
        coefficient = Math.abs(coefficient);

        let term = "";

        if (power === 0) {

            term = formatNumber(coefficient);

        } else {

            if (Math.abs(coefficient - 1) > 1e-12) {
                term += formatNumber(coefficient);
            }

            term += "x";

            if (power !== 1) {
                term += "^" + power;
            }
        }

        if (!output) {

            output =
                negative
                    ? "-" + term
                    : term;

        } else {

            output +=
                negative
                    ? " - " + term
                    : " + " + term;
        }
    });

    return output;
}


/* =========================================================
   EXPAND / SIMPLIFY ALGEBRA
   ========================================================= */

function solveAlgebraSimplification(original) {

    let expression = normalizeMath(original);

    expression = expression
        .replace(/^simplify\s+(the\s+)?expression\s*:/i, "")
        .replace(/^simplify\s*:/i, "")
        .replace(/^expand\s*:/i, "")
        .trim();

    if (!/[a-zA-Z]/.test(expression)) {
        return null;
    }

    const tokens = algebraTokens(expression);

    const parser = new PolynomialParser(tokens);

    const polynomial = parser.parse();

    const answer = polynomialToString(polynomial);

    const steps = [];

    if (currentLanguage === "hi") {

        steps.push(
            `दिया गया expression: ${original}`
        );

        steps.push(
            "Brackets को expand करके समान terms को combine करें।"
        );

    } else {

        steps.push(
            `Given expression: ${original}`
        );

        steps.push(
            "Expand the brackets and combine like terms."
        );
    }

    /*
       Special detailed explanation for:
       4(2x - 3) - 2(x + 5)
    */

    const compact = expression.replace(/\s+/g, "");

    const specialPattern =
        /^([+-]?\d+(?:\.\d+)?)\(([-+]?\d*\.?\d*)x([-+]\d+(?:\.\d+)?)\)([-+])(\d+(?:\.\d+)?)\((x[-+]\d+(?:\.\d+)?)\)$/;

    if (specialPattern.test(compact)) {

        /*
           We still calculate the general polynomial.
           Detailed generic distribution is produced below.
        */
    }

    const distributionSteps =
        explainDistribution(expression);

    distributionSteps.forEach(step => {
        steps.push(step);
    });

    steps.push(
        currentLanguage === "hi"
            ? `Like terms combine करने के बाद: ${answer}`
            : `Combine like terms: ${answer}`
    );

    steps.push(
        currentLanguage === "hi"
            ? `अंतिम उत्तर = ${answer}`
            : `Final Answer = ${answer}`
    );

    return {
        answer,
        steps
    };
}


/* =========================================================
   DISTRIBUTION EXPLANATION
   ========================================================= */

function explainDistribution(expression) {

    const steps = [];

    /*
       Find terms such as:
       4(2x-3)
       -2(x+5)
       3(x+4)
       etc.
    */

    const pattern =
        /([+-]?\d+(?:\.\d+)?)\s*\(\s*([^()]+)\s*\)/g;

    let match;

    while ((match = pattern.exec(expression)) !== null) {

        const coefficient = Number(match[1]);
        const inside = match[2];

        const insideMatch =
            /^([+-]?\d*\.?\d*)\s*x\s*([+-]\s*\d+(?:\.\d+)?)$/i
                .exec(inside);

        if (insideMatch) {

            let xCoefficient = insideMatch[1];

            if (
                xCoefficient === "" ||
                xCoefficient === "+"
            ) {
                xCoefficient = 1;
            } else if (xCoefficient === "-") {
                xCoefficient = -1;
            } else {
                xCoefficient = Number(xCoefficient);
            }

            const constant =
                Number(
                    insideMatch[2]
                        .replace(/\s+/g, "")
                );

            const first =
                coefficient * xCoefficient;

            const second =
                coefficient * constant;

            const firstText =
                formatCoefficientX(first);

            const secondText =
                formatSignedConstant(second);

            steps.push(
                `${formatNumber(coefficient)}(${formatAlgebraInside(
                    xCoefficient,
                    constant
                )}) = ${firstText}${secondText}`
            );

        } else {

            /*
               Generic distribution for expressions like:
               3(x+4)
            */

            const parts =
                splitTopLevelPlusMinus(inside);

            if (parts.length > 1) {

                const distributed = parts.map(part => {

                    const value = part.trim();

                    const numeric =
                        value.match(
                            /^([+-]?)(\d*\.?\d*)x$/i
                        );

                    if (numeric) {

                        let c =
                            numeric[2]
                                ? Number(numeric[2])
                                : 1;

                        if (numeric[1] === "-") {
                            c = -c;
                        }

                        return formatCoefficientX(
                            coefficient * c
                        );
                    }

                    const number =
                        Number(value);

                    if (Number.isFinite(number)) {
                        return formatNumber(
                            coefficient * number
                        );
                    }

                    return null;

                }).filter(Boolean);

                if (distributed.length) {

                    steps.push(
                        `${formatNumber(coefficient)}(${inside}) = ${distributed.join(" + ")}`
                    );
                }
            }
        }
    }

    return steps;
}


/* =========================================================
   ALGEBRA FORMATTING HELPERS
   ========================================================= */

function formatCoefficientX(value) {

    if (Math.abs(value) < 1e-12) {
        return "";
    }

    if (Math.abs(value - 1) < 1e-12) {
        return "x";
    }

    if (Math.abs(value + 1) < 1e-12) {
        return "-x";
    }

    return `${formatNumber(value)}x`;
}


function formatSignedConstant(value) {

    if (value >= 0) {
        return ` + ${formatNumber(value)}`;
    }

    return ` - ${formatNumber(Math.abs(value))}`;
}


function formatAlgebraInside(xCoefficient, constant) {

    const xPart =
        formatCoefficientX(xCoefficient);

    const cPart =
        constant >= 0
            ? ` + ${formatNumber(constant)}`
            : ` - ${formatNumber(Math.abs(constant))}`;

    return `${xPart}${cPart}`;
}


function splitTopLevelPlusMinus(text) {

    const parts = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        if (
            (char === "+" || char === "-") &&
            i > 0
        ) {

            parts.push(current);
            current = char;

        } else {

            current += char;
        }
    }

    if (current) {
        parts.push(current);
    }

    return parts;
}


/* =========================================================
   LINEAR EQUATION
   ========================================================= */

function solveLinearEquation(text) {

    let equation = normalizeMath(text)
        .replace(/^solve\s*:\s*/i, "")
        .replace(/^solve\s+equation\s*:\s*/i, "")
        .trim();

    if (!equation.includes("=")) {
        return null;
    }

    if (!/[a-zA-Z]/.test(equation)) {
        return null;
    }

    /*
       Parse both sides as polynomial.
    */

    try {

        const parts = equation.split("=");

        if (parts.length !== 2) {
            return null;
        }

        const leftParser =
            new PolynomialParser(
                algebraTokens(parts[0])
            );

        const rightParser =
            new PolynomialParser(
                algebraTokens(parts[1])
            );

        const left =
            leftParser.parse();

        const right =
            rightParser.parse();

        const combined =
            subtractPolynomial(left, right);

        const a = combined[1] || 0;
        const b = combined[0] || 0;

        if (Math.abs(a) < 1e-12) {
            return null;
        }

        const x = -b / a;

        const steps = [];

        steps.push(
            currentLanguage === "hi"
                ? `Equation: ${equation}`
                : `Equation: ${equation}`
        );

        steps.push(
            currentLanguage === "hi"
                ? `x वाले terms को एक तरफ और constants को दूसरी तरफ रखें।`
                : `Collect the x terms and constants.`
        );

        steps.push(
            `${formatNumber(a)}x ${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))} = 0`
        );

        steps.push(
            `${formatNumber(a)}x = ${formatNumber(-b)}`
        );

        steps.push(
            `x = ${formatNumber(x)}`
        );

        steps.push(
            currentLanguage === "hi"
                ? `अंतिम उत्तर: x = ${formatNumber(x)}`
                : `Final Answer: x = ${formatNumber(x)}`
        );

        return {
            answer: `x = ${formatNumber(x)}`,
            steps
        };

    } catch (error) {
        return null;
    }
}


/* =========================================================
   QUADRATIC EQUATION
   ========================================================= */

function solveQuadratic(text) {

    let equation = normalizeMath(text)
        .replace(/^solve\s*:\s*/i, "")
        .trim();

    if (!equation.includes("=")) {
        return null;
    }

    try {

        const parts = equation.split("=");

        if (parts.length !== 2) {
            return null;
        }

        const left =
            new PolynomialParser(
                algebraTokens(parts[0])
            ).parse();

        const right =
            new PolynomialParser(
                algebraTokens(parts[1])
            ).parse();

        const combined =
            subtractPolynomial(left, right);

        const a = combined[2] || 0;
        const b = combined[1] || 0;
        const c = combined[0] || 0;

        if (Math.abs(a) < 1e-12) {
            return null;
        }

        const discriminant =
            b * b - 4 * a * c;

        const steps = [];

        steps.push(
            `a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`
        );

        steps.push(
            `D = b² - 4ac`
        );

        steps.push(
            `D = ${formatNumber(discriminant)}`
        );

        if (discriminant < 0) {

            steps.push(
                currentLanguage === "hi"
                    ? "Discriminant negative है, इसलिए real roots नहीं हैं।"
                    : "The discriminant is negative, so there are no real roots."
            );

            return {
                answer: "No real roots",
                steps
            };
        }

        const sqrtD =
            Math.sqrt(discriminant);

        const x1 =
            (-b + sqrtD) / (2 * a);

        const x2 =
            (-b - sqrtD) / (2 * a);

        steps.push(
            `x = (-b ± √D) / 2a`
        );

        steps.push(
            `x₁ = ${formatNumber(x1)}`
        );

        steps.push(
            `x₂ = ${formatNumber(x2)}`
        );

        return {
            answer:
                `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`,
            steps
        };

    } catch (error) {
        return null;
    }
}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function solvePercentage(text) {

    const match =
        text.match(
            /(-?\d+(?:\.\d+)?)\s*%\s*(?:of|का|के)\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {
        return null;
    }

    const percent = Number(match[1]);
    const number = Number(match[2]);

    const result =
        (percent / 100) * number;

    return {
        answer: formatNumber(result),
        steps: [
            `${percent}% of ${number}`,
            `= (${percent} ÷ 100) × ${number}`,
            `= ${percent / 100} × ${number}`,
            `= ${formatNumber(result)}`,
            `Final Answer = ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   AVERAGE
   ========================================================= */

function solveAverage(text) {

    const match =
        text.match(
            /average\s+of\s+(.+)/i
        );

    if (!match) {
        return null;
    }

    const numbers =
        match[1]
            .match(/-?\d+(?:\.\d+)?/g);

    if (!numbers || numbers.length === 0) {
        return null;
    }

    const values = numbers.map(Number);

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
            `Numbers: ${values.join(", ")}`,
            `Sum = ${formatNumber(sum)}`,
            `Count = ${values.length}`,
            `Average = Sum ÷ Count`,
            `Average = ${formatNumber(sum)} ÷ ${values.length}`,
            `Final Answer = ${formatNumber(average)}`
        ]
    };
}


/* =========================================================
   HCF
   ========================================================= */

function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {

        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}


function solveHCF(text) {

    const numbers =
        text.match(/\d+/g);

    if (
        !numbers ||
        numbers.length < 2 ||
        !/hcf|gcd|महत्तम/i.test(text)
    ) {
        return null;
    }

    const values =
        numbers.map(Number);

    let result = values[0];

    const steps = [
        `Numbers: ${values.join(", ")}`
    ];

    for (let i = 1; i < values.length; i++) {

        const before = result;

        result =
            gcd(result, values[i]);

        steps.push(
            `HCF(${before}, ${values[i]}) = ${result}`
        );
    }

    steps.push(
        `Final Answer = ${result}`
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

    return Math.abs(
        a * b
    ) / gcd(a, b);
}


function solveLCM(text) {

    const numbers =
        text.match(/\d+/g);

    if (
        !numbers ||
        numbers.length < 2 ||
        !/lcm|लघुत्तम/i.test(text)
    ) {
        return null;
    }

    const values =
        numbers.map(Number);

    let result = values[0];

    const steps = [
        `Numbers: ${values.join(", ")}`
    ];

    for (let i = 1; i < values.length; i++) {

        const before = result;

        result =
            lcm(result, values[i]);

        steps.push(
            `LCM(${before}, ${values[i]}) = ${result}`
        );
    }

    steps.push(
        `Final Answer = ${result}`
    );

    return {
        answer: String(result),
        steps
    };
}


/* =========================================================
   SQUARE ROOT
   ========================================================= */

function solveSquareRoot(text) {

    const match =
        text.match(
            /(?:sqrt|square\s+root|√)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/i
        );

    if (!match) {
        return null;
    }

    const number = Number(match[1]);

    if (number < 0) {
        return {
            answer: "No real answer",
            steps: [
                "The square root of a negative number is not a real number."
            ]
        };
    }

    const result =
        Math.sqrt(number);

    return {
        answer: formatNumber(result),
        steps: [
            `√${number}`,
            `= ${formatNumber(result)}`,
            `Final Answer = ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   POWER
   ========================================================= */

function solvePower(text) {

    const match =
        text.match(
            /(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {
        return null;
    }

    const base = Number(match[1]);
    const exponent = Number(match[2]);

    const result =
        Math.pow(base, exponent);

    return {
        answer: formatNumber(result),
        steps: [
            `${formatNumber(base)}^${formatNumber(exponent)}`,
            `= ${formatNumber(result)}`,
            `Final Answer = ${formatNumber(result)}`
        ]
    };
}


/* =========================================================
   FACTORIAL
   ========================================================= */

function factorial(n) {

    if (n < 0 || !Number.isInteger(n)) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}


function solveFactorial(text) {

    const match =
        text.match(
            /(\d+)\s*!/
        );

    if (!match) {
        return null;
    }

    const n = Number(match[1]);

    if (n > 170) {
        return null;
    }

    const result = factorial(n);

    return {
        answer: String(result),
        steps: [
            `${n}! = ${Array.from(
                { length: n },
                (_, i) => i + 1
            ).join(" × ")}`,
            `= ${result}`,
            `Final Answer = ${result}`
        ]
    };
}


/* =========================================================
   NUMERIC BODMAS SOLVER
   ========================================================= */

function solveBODMAS(text) {

    let expression =
        normalizeMath(text);

    expression =
        expression
            .replace(
                /^evaluate\s*:\s*/i,
                ""
            )
            .replace(
                /^calculate\s*:\s*/i,
                ""
            )
            .replace(
                /^solve\s*:\s*/i,
                ""
            )
            .trim();

    /*
       PI
    */

    expression =
        expression.replace(
            /\bPI\b/g,
            String(Math.PI)
        );

    /*
       Percent numbers
    */

    expression =
        expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

    /*
       Only pure numeric expressions here.
    */

    if (
        !/^[0-9+\-*/().^ \t]+$/.test(
            expression
        )
    ) {
        return null;
    }

    try {

        const result =
            solveNumericExpression(
                expression
            );

        return {
            answer:
                formatNumber(result.value),
            steps:
                buildNumericSteps(
                    expression,
                    result
                )
        };

    } catch (error) {
        return null;
    }
}


/* =========================================================
   MAIN SOLVER
   ========================================================= */

function solveQuestion(question) {

    let text =
        cleanSpaces(
            normalizeHindiNumbers(
                question
            )
        );

    if (!text) {
        return {
            answer: "",
            steps: [
                TEXT[currentLanguage].noQuestion
            ]
        };
    }

    /*
       1. Factorial
    */

    const factorialResult =
        solveFactorial(text);

    if (factorialResult) {
        return factorialResult;
    }

    /*
       2. Percentage
    */

    const percentageResult =
        solvePercentage(text);

    if (percentageResult) {
        return percentageResult;
    }

    /*
       3. Average
    */

    const averageResult =
        solveAverage(text);

    if (averageResult) {
        return averageResult;
    }

    /*
       4. HCF
    */

    const hcfResult =
        solveHCF(text);

    if (hcfResult) {
        return hcfResult;
    }

    /*
       5. LCM
    */

    const lcmResult =
        solveLCM(text);

    if (lcmResult) {
        return lcmResult;
    }

    /*
       6. Square root
    */

    const rootResult =
        solveSquareRoot(text);

    if (rootResult) {
        return rootResult;
    }

    /*
       7. Quadratic equation
       Must come before linear.
    */

    if (
        text.includes("=") &&
        /x\s*(?:\^2|²)/i.test(
            text
        )
    ) {

        const quadratic =
            solveQuadratic(text);

        if (quadratic) {
            return quadratic;
        }
    }

    /*
       8. Linear equation
    */

    if (
        text.includes("=") &&
        /[a-zA-Z]/.test(text)
    ) {

        const linear =
            solveLinearEquation(text);

        if (linear) {
            return linear;
        }
    }

    /*
       9. Algebra simplification
    */

    if (
        hasVariable(text) &&
        !text.includes("=")
    ) {

        try {

            const algebra =
                solveAlgebraSimplification(
                    text
                );

            if (algebra) {
                return algebra;
            }

        } catch (error) {
            /*
               Continue to other solvers.
            */
        }
    }

    /*
       10. Power
    */

    const powerResult =
        solvePower(text);

    if (powerResult) {
        return powerResult;
    }

    /*
       11. Numeric BODMAS
    */

    const bodmas =
        solveBODMAS(text);

    if (bodmas) {
        return bodmas;
    }

    /*
       Nothing matched.
    */

    return {
        answer: "",
        steps: [
            TEXT[currentLanguage].unable
        ]
    };
}


/* =========================================================
   RENDER RESULT
   ========================================================= */

function renderResult(result) {

    if (!resultSection) {
        return;
    }

    resultSection.hidden = false;

    if (answerBox) {

        answerBox.innerHTML =
            result.answer
                ? escapeHTML(result.answer)
                : `<span class="solver-error">${
                    escapeHTML(
                        TEXT[currentLanguage].unable
                    )
                }</span>`;
    }

    if (stepsBox) {

        stepsBox.innerHTML =
            result.steps
                .map(
                    (step, index) =>
                        `<div class="solution-step">
                            <span class="step-number">
                                ${index + 1}
                            </span>
                            <span class="step-text">
                                ${escapeHTML(step)}
                            </span>
                        </div>`
                )
                .join("");
    }

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   HISTORY
   ========================================================= */

function getHistory() {

    try {

        let data =
            JSON.parse(
                localStorage.getItem(
                    HISTORY_KEY
                ) || "[]"
            );

        /*
           Migrate old history if present.
        */

        if (
            !data.length &&
            localStorage.getItem(
                LEGACY_HISTORY_KEY
            )
        ) {

            data =
                JSON.parse(
                    localStorage.getItem(
                        LEGACY_HISTORY_KEY
                    ) || "[]"
                );

            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(data)
            );
        }

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];
    }
}


function saveHistory(question, result) {

    if (!question) {
        return;
    }

    const history =
        getHistory();

    history.unshift({
        id: Date.now(),
        question,
        answer: result.answer,
        steps: result.steps,
        time: new Date().toISOString()
    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            history.slice(0, 50)
        )
    );

    renderHistory();
}


function deleteHistoryItem(id) {

    const history =
        getHistory()
            .filter(item => item.id !== id);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    renderHistory();
}


function clearHistory() {

    if (
        !confirm(
            currentLanguage === "hi"
                ? "क्या आप पूरी History हटाना चाहते हैं?"
                : "Clear all history?"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        HISTORY_KEY
    );

    localStorage.removeItem(
        LEGACY_HISTORY_KEY
    );

    renderHistory();
}


function renderHistory() {

    if (!historyList) {
        return;
    }

    const history =
        getHistory();

    if (!history.length) {

        historyList.innerHTML =
            `<div class="empty-history">
                ${
                    currentLanguage === "hi"
                        ? "अभी कोई History नहीं है।"
                        : "No history yet."
                }
            </div>`;

        return;
    }

    historyList.innerHTML =
        history
            .map(item => {

                return `
                    <div class="history-item">

                        <button
                            class="history-question"
                            data-history-id="${item.id}"
                        >
                            ${escapeHTML(item.question)}
                        </button>

                        <div class="history-answer">
                            ${escapeHTML(item.answer)}
                        </div>

                        <button
                            class="history-delete"
                            data-delete-id="${item.id}"
                            type="button"
                        >
                            ×
                        </button>

                    </div>
                `;

            })
            .join("");
}


/* =========================================================
   SOLVE ACTION
   ========================================================= */

function solveCurrentQuestion() {

    const question =
        cleanSpaces(
            questionInput
                ? questionInput.value
                : ""
        );

    if (!question) {

        alert(
            TEXT[currentLanguage].noQuestion
        );

        return;
    }

    const result =
        solveQuestion(question);

    renderResult(result);

    if (result.answer) {
        saveHistory(
            question,
            result
        );
    }
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCurrentQuestion() {

    if (questionInput) {
        questionInput.value = "";
        questionInput.focus();
    }

    if (resultSection) {
        resultSection.hidden = true;
    }

    if (answerBox) {
        answerBox.innerHTML = "";
    }

    if (stepsBox) {
        stepsBox.innerHTML = "";
    }
}


/* =========================================================
   MATH KEYBOARD
   ========================================================= */

function insertAtCursor(text) {

    if (!questionInput) {
        return;
    }

    const start =
        questionInput.selectionStart ??
        questionInput.value.length;

    const end =
        questionInput.selectionEnd ??
        questionInput.value.length;

    questionInput.value =
        questionInput.value.slice(0, start) +
        text +
        questionInput.value.slice(end);

    const cursor =
        start + text.length;

    questionInput.focus();

    questionInput.setSelectionRange(
        cursor,
        cursor
    );
}


function backspaceAtCursor() {

    if (!questionInput) {
        return;
    }

    const start =
        questionInput.selectionStart;

    const end =
        questionInput.selectionEnd;

    if (start !== end) {

        questionInput.value =
            questionInput.value.slice(0, start) +
            questionInput.value.slice(end);

        questionInput.setSelectionRange(
            start,
            start
        );

        return;
    }

    if (start > 0) {

        questionInput.value =
            questionInput.value.slice(0, start - 1) +
            questionInput.value.slice(start);

        questionInput.setSelectionRange(
            start - 1,
            start - 1
        );
    }

    questionInput.focus();
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

                    insertAtCursor(symbol);
                }
            );
        });

    if (backspaceBtn) {

        backspaceBtn.addEventListener(
            "click",
            backspaceAtCursor
        );
    }
}


/* =========================================================
   EXAMPLES
   ========================================================= */

function setupExamples() {

    document
        .querySelectorAll("[data-example]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const example =
                        button.dataset.example;

                    if (questionInput) {
                        questionInput.value =
                            example;
                    }

                    solveCurrentQuestion();
                }
            );
        });
}


/* =========================================================
   VOICE
   ========================================================= */

function setupVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (voiceStatus) {
            voiceStatus.textContent =
                "Voice input is not supported in this browser.";
        }

        if (micBtn) {
            micBtn.disabled = true;
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang =
        currentLanguage === "hi"
            ? "hi-IN"
            : "en-IN";

    recognition.onstart = () => {

        isListening = true;

        if (micIcon) {
            micIcon.textContent = "🔴";
        }

        if (micText) {
            micText.textContent =
                TEXT[currentLanguage].listening;
        }

        if (voiceStatus) {
            voiceStatus.textContent =
                TEXT[currentLanguage].listening;
        }
    };

    recognition.onresult = event => {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript +=
                event.results[i][0].transcript;
        }

        transcript =
            normalizeVoiceText(
                transcript
            );

        if (currentLanguage === "hi") {
            transcript =
                normalizeHindiNumbers(
                    transcript
                );
        }

        if (questionInput) {
            questionInput.value =
                transcript;
        }

        setTimeout(
            solveCurrentQuestion,
            200
        );
    };

    recognition.onerror = event => {

        if (voiceStatus) {
            voiceStatus.textContent =
                `Voice error: ${event.error}`;
        }
    };

    recognition.onend = () => {

        isListening = false;

        if (micIcon) {
            micIcon.textContent = "🎤";
        }

        if (micText) {
            micText.textContent =
                TEXT[currentLanguage].micText;
        }

        if (voiceStatus) {
            voiceStatus.textContent =
                TEXT[currentLanguage].micReady;
        }
    };

    if (micBtn) {

        micBtn.addEventListener(
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

                recognition.start();
            }
        );
    }
}


/* =========================================================
   HISTORY EVENTS
   ========================================================= */

function setupHistory() {

    if (deleteAllBtn) {

        deleteAllBtn.addEventListener(
            "click",
            clearHistory
        );
    }

    if (!historyList) {
        return;
    }

    historyList.addEventListener(
        "click",
        event => {

            const deleteButton =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (deleteButton) {

                deleteHistoryItem(
                    Number(
                        deleteButton.dataset.deleteId
                    )
                );

                return;
            }

            const questionButton =
                event.target.closest(
                    "[data-history-id]"
                );

            if (questionButton) {

                const id =
                    Number(
                        questionButton.dataset.historyId
                    );

                const item =
                    getHistory()
                        .find(
                            entry =>
                                entry.id === id
                        );

                if (!item) {
                    return;
                }

                if (questionInput) {
                    questionInput.value =
                        item.question;
                }

                renderResult({
                    answer: item.answer,
                    steps: item.steps || []
                });
            }
        }
    );
}


/* =========================================================
   PWA INSTALL
   ========================================================= */

function setupInstallPrompt() {

    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            deferredInstallPrompt =
                event;

            if (installBtn) {
                installBtn.hidden = false;
            }
        }
    );

    if (installBtn) {

        installBtn.addEventListener(
            "click",
            async () => {

                if (!deferredInstallPrompt) {
                    return;
                }

                deferredInstallPrompt.prompt();

                await deferredInstallPrompt.userChoice;

                deferredInstallPrompt = null;

                installBtn.hidden = true;
            }
        );
    }

    /*
       iOS detection
    */

    const isIOS =
        /iphone|ipad|ipod/i.test(
            navigator.userAgent
        );

    const isStandalone =
        window.navigator.standalone === true ||
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches;

    if (
        isIOS &&
        !isStandalone &&
        iosInstallHelp
    ) {
        iosInstallHelp.hidden = false;
    }
}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

function setupKeyboardShortcuts() {

    if (!questionInput) {
        return;
    }

    questionInput.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                solveCurrentQuestion();
            }
        }
    );
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

function setupButtons() {

    if (englishBtn) {

        englishBtn.addEventListener(
            "click",
            () => setLanguage("en")
        );
    }

    if (hindiBtn) {

        hindiBtn.addEventListener(
            "click",
            () => setLanguage("hi")
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
            clearCurrentQuestion
        );
    }
}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator &&
        location.protocol !== "file:"
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register("./service-worker.js")
                    .then(registration => {

                        console.log(
                            "Math King Service Worker:",
                            registration.scope
                        );

                    })
                    .catch(error => {

                        console.error(
                            "Math King Service Worker Error:",
                            error
                        );
                    });
            }
        );
    }
}


/* =========================================================
   INIT
   ========================================================= */

function initMathKing() {

    setLanguage("en");

    setupButtons();
    setupMathKeyboard();
    setupExamples();
    setupVoice();
    setupHistory();
    setupInstallPrompt();
    setupKeyboardShortcuts();
    registerServiceWorker();

    renderHistory();

    console.log(
        "Math King Advanced Mathematics Engine Ready."
    );
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

window.MathKing = {
    solve: solveQuestion,
    simplify: solveAlgebraSimplification,
    solveEquation: solveLinearEquation,
    solveQuadratic,
    percentage: solvePercentage,
    average: solveAverage,
    hcf: solveHCF,
    lcm: solveLCM
};
