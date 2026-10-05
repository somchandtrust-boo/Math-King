"use strict";

/* =========================================================
   MATH KING — REAL MATHEMATICS ENGINE
   Version: Calculator Keyboard + Detailed BODMAS
   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentLanguage = "en";

const HISTORY_KEY = "mathKingHistory";

let recognition = null;
let isListening = false;

let deferredInstallPrompt = null;


/* =========================================================
   DOM
   ========================================================= */

const question = document.getElementById("question");
const solveBtn = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");

const resultSection = document.getElementById("resultSection");
const answer = document.getElementById("answer");
const steps = document.getElementById("steps");

const englishBtn = document.getElementById("englishBtn");
const hindiBtn = document.getElementById("hindiBtn");

const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const micText = document.getElementById("micText");
const voiceStatus = document.getElementById("voiceStatus");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const backspaceBtn = document.getElementById("backspaceBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");

const installBtn = document.getElementById("installBtn");
const iosInstallHelp = document.getElementById("iosInstallHelp");


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const TEXT = {

    en: {

        subtitle:
            "Real Mathematics Question Solver",

        questionTitle:
            "Enter Mathematics Question",

        questionHint:
            "Type, speak, or use the Math Keyboard.",

        questionLabel:
            "Your Question",

        placeholder:
            "Example: Evaluate (-6) × (-4) + (-20) ÷ 4",

        voice:
            "Voice Input",

        ready:
            "Ready",

        listening:
            "Listening...",

        unsupported:
            "Voice input is not supported in this browser.",

        standard:
            "Standard / Class",

        solve:
            "🧮 Solve",

        clear:
            "🗑️ Clear",

        examples:
            "Example Questions",

        answer:
            "Answer",

        detailed:
            "Detailed Solution",

        history:
            "History",

        clearHistory:
            "Clear History",

        noHistory:
            "No calculations yet.",

        keyboard:
            "Math Keyboard",

        keyboardHint:
            "Tap a symbol to insert",

        clearKeyboard:
            "Clear Keyboard",

        install:
            "Install App",

        installTitle:
            "Install Math King",

        installDescription:
            "Install Math King on your Android, iPhone or desktop.",

        empty:
            "Please enter a mathematics question.",

        invalid:
            "I could not understand this mathematical expression.",

        divideZero:
            "Division by zero is not allowed.",

        result:
            "Final Answer",

        step:
            "Step",

        positive:
            "negative × negative = positive",

        negative:
            "negative ÷ positive = negative"

    },

    hi: {

        subtitle:
            "वास्तविक गणित प्रश्न समाधान",

        questionTitle:
            "गणित का प्रश्न लिखें",

        questionHint:
            "लिखें, बोलें या Math Keyboard का उपयोग करें।",

        questionLabel:
            "आपका प्रश्न",

        placeholder:
            "उदाहरण: (-6) × (-4) + (-20) ÷ 4",

        voice:
            "आवाज़ से लिखें",

        ready:
            "तैयार",

        listening:
            "सुन रहा हूँ...",

        unsupported:
            "इस browser में Voice Input उपलब्ध नहीं है।",

        standard:
            "कक्षा / स्तर",

        solve:
            "🧮 हल करें",

        clear:
            "🗑️ साफ करें",

        examples:
            "उदाहरण प्रश्न",

        answer:
            "उत्तर",

        detailed:
            "पूरा समाधान",

        history:
            "इतिहास",

        clearHistory:
            "इतिहास साफ करें",

        noHistory:
            "अभी कोई calculation नहीं है।",

        keyboard:
            "Math Keyboard",

        keyboardHint:
            "Symbol डालने के लिए दबाएँ",

        clearKeyboard:
            "Keyboard साफ करें",

        install:
            "App Install करें",

        installTitle:
            "Math King Install करें",

        installDescription:
            "Math King को Android, iPhone या Desktop पर Install करें।",

        empty:
            "कृपया गणित का प्रश्न लिखें।",

        invalid:
            "यह गणितीय expression समझ नहीं आया।",

        divideZero:
            "Zero से division नहीं किया जा सकता।",

        result:
            "अंतिम उत्तर",

        step:
            "चरण",

        positive:
            "ऋणात्मक × ऋणात्मक = धनात्मक",

        negative:
            "ऋणात्मक ÷ धनात्मक = ऋणात्मक"

    }

};


/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(language) {

    currentLanguage = language;

    const t = TEXT[language];

    englishBtn.classList.toggle(
        "active",
        language === "en"
    );

    hindiBtn.classList.toggle(
        "active",
        language === "hi"
    );

    document.getElementById("appSubtitle").textContent =
        t.subtitle;

    document.getElementById("questionTitle").textContent =
        t.questionTitle;

    document.getElementById("questionHint").textContent =
        t.questionHint;

    document.getElementById("questionLabel").textContent =
        t.questionLabel;

    question.placeholder =
        t.placeholder;

    micText.textContent =
        t.voice;

    voiceStatus.textContent =
        t.ready;

    document.getElementById("standardLabel").textContent =
        t.standard;

    solveBtn.textContent =
        t.solve;

    clearBtn.textContent =
        t.clear;

    document.getElementById("examplesTitle").textContent =
        t.examples;

    document.getElementById("answerTitle").textContent =
        t.answer;

    document.getElementById("stepsTitle").textContent =
        t.detailed;

    document.getElementById("historyTitle").textContent =
        t.history;

    document.getElementById("clearHistoryText").textContent =
        t.clearHistory;

    document.querySelector(".keyboard-header strong").textContent =
        "🧮 " + t.keyboard;

    document.querySelector(".keyboard-header small").textContent =
        t.keyboardHint;

    deleteAllBtn.textContent =
        t.clearKeyboard;

    document.getElementById("installTitle").textContent =
        t.installTitle;

    document.getElementById("installDescription").textContent =
        t.installDescription;

    installBtn.textContent =
        t.install;

    renderHistory();
}


englishBtn.addEventListener(
    "click",
    () => setLanguage("en")
);

hindiBtn.addEventListener(
    "click",
    () => setLanguage("hi")
);


/* =========================================================
   SYMBOL NORMALIZATION
   ========================================================= */

function normalizeMath(text) {

    let s = String(text || "").trim();

    s = s
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[−–—]/g, "-")
        .replace(/＋/g, "+")
        .replace(/％/g, "%")
        .replace(/π/g, "PI")
        .replace(/∞/g, "Infinity")
        .replace(/√/g, "sqrt")
        .replace(/≤/g, "<=")
        .replace(/≥/g, ">=")
        .replace(/≠/g, "!=");

    /*
       Superscript conversion
    */

    s = s
        .replace(/²/g, "^2")
        .replace(/³/g, "^3")
        .replace(/ⁿ/g, "^n");

    /*
       Common fraction characters
    */

    s = s
        .replace(/½/g, "(1/2)")
        .replace(/⅓/g, "(1/3)")
        .replace(/¼/g, "(1/4)")
        .replace(/¾/g, "(3/4)");

    return s;
}


/* =========================================================
   VOICE NORMALIZATION
   ========================================================= */

function normalizeVoiceText(text) {

    let s = String(text || "");

    const replacements = [

        [/times/gi, "*"],
        [/multiplied by/gi, "*"],
        [/multiply/gi, "*"],

        [/divided by/gi, "/"],
        [/divide by/gi, "/"],

        [/plus/gi, "+"],
        [/add/gi, "+"],

        [/minus/gi, "-"],
        [/subtract/gi, "-"],

        [/equals/gi, "="],

        [/percent/gi, "%"],
        [/percentage/gi, "%"],

        [/square root of/gi, "sqrt"],
        [/square root/gi, "sqrt"],

        [/power of/gi, "^"]
    ];

    replacements.forEach(([pattern, value]) => {

        s = s.replace(pattern, value);

    });

    return s;
}


/* =========================================================
   NUMBER WORDS
   ========================================================= */

const numberWords = {

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


function convertNumberWords(text) {

    let s = String(text || "").toLowerCase();

    Object.keys(numberWords)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {

            const value = numberWords[word];

            const regex =
                new RegExp(
                    "\\b" + word + "\\b",
                    "gi"
                );

            s = s.replace(regex, String(value));

        });

    return s;
}


/* =========================================================
   SAFE TOKENIZER
   ========================================================= */

function tokenize(expression) {

    const s = expression
        .replace(/\s+/g, "");

    const tokens = [];

    let i = 0;

    while (i < s.length) {

        const char = s[i];

        if (/[0-9.]/.test(char)) {

            let number = "";

            while (
                i < s.length &&
                /[0-9.]/.test(s[i])
            ) {

                number += s[i];

                i++;

            }

            if (
                (number.match(/\./g) || []).length > 1
            ) {

                throw new Error("Invalid number");

            }

            tokens.push({
                type: "number",
                value: Number(number)
            });

            continue;
        }

        if ("+-*/()".includes(char)) {

            tokens.push({
                type: char,
                value: char
            });

            i++;

            continue;
        }

        if (
            s.slice(i, i + 2) === "**"
        ) {

            tokens.push({
                type: "^",
                value: "^"
            });

            i += 2;

            continue;
        }

        if (char === "^") {

            tokens.push({
                type: "^",
                value: "^"
            });

            i++;

            continue;
        }

        throw new Error(
            "Unsupported symbol: " + char
        );

    }

    return tokens;
}


/* =========================================================
   DETAILED EXPRESSION PARSER
   ========================================================= */

class DetailedParser {

    constructor(expression) {

        this.expression = expression;

        this.tokens =
            tokenize(expression);

        this.position = 0;

        this.operations = [];

    }


    current() {

        return this.tokens[this.position];

    }


    consume(type) {

        const token =
            this.current();

        if (
            !token ||
            token.type !== type
        ) {

            throw new Error(
                "Unexpected token"
            );

        }

        this.position++;

        return token;

    }


    parse() {

        const result =
            this.parseAddition();

        if (
            this.position <
            this.tokens.length
        ) {

            throw new Error(
                "Unexpected expression"
            );

        }

        return result;
    }


    parseAddition() {

        let left =
            this.parseMultiplication();

        while (true) {

            const token =
                this.current();

            if (
                !token ||
                !["+", "-"].includes(token.type)
            ) {

                break;

            }

            this.position++;

            const right =
                this.parseMultiplication();

            const oldLeft =
                left;

            if (token.type === "+") {

                left =
                    oldLeft + right;

                this.operations.push({
                    type: "add",
                    left: oldLeft,
                    right,
                    result: left
                });

            } else {

                left =
                    oldLeft - right;

                this.operations.push({
                    type: "subtract",
                    left: oldLeft,
                    right,
                    result: left
                });

            }

        }

        return left;
    }


    parseMultiplication() {

        let left =
            this.parsePower();

        while (true) {

            const token =
                this.current();

            if (
                !token ||
                !["*", "/"].includes(token.type)
            ) {

                break;

            }

            this.position++;

            const right =
                this.parsePower();

            const oldLeft =
                left;

            if (token.type === "*") {

                left =
                    oldLeft * right;

                this.operations.push({
                    type: "multiply",
                    left: oldLeft,
                    right,
                    result: left
                });

            } else {

                if (right === 0) {

                    throw new Error(
                        "DIVISION_ZERO"
                    );

                }

                left =
                    oldLeft / right;

                this.operations.push({
                    type: "divide",
                    left: oldLeft,
                    right,
                    result: left
                });

            }

        }

        return left;
    }


    parsePower() {

        let left =
            this.parseUnary();

        const token =
            this.current();

        if (
            token &&
            token.type === "^"
        ) {

            this.position++;

            const right =
                this.parsePower();

            const oldLeft =
                left;

            left =
                Math.pow(
                    oldLeft,
                    right
                );

            this.operations.push({
                type: "power",
                left: oldLeft,
                right,
                result: left
            });

        }

        return left;
    }


    parseUnary() {

        const token =
            this.current();

        if (
            token &&
            token.type === "+"
        ) {

            this.position++;

            return this.parseUnary();

        }

        if (
            token &&
            token.type === "-"
        ) {

            this.position++;

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
                "Missing number"
            );

        }

        if (
            token.type === "number"
        ) {

            this.position++;

            return token.value;
        }

        if (
            token.type === "("
        ) {

            this.position++;

            const value =
                this.parseAddition();

            this.consume(")");

            return value;
        }

        throw new Error(
            "Invalid expression"
        );

    }

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {

        return String(value);

    }

    if (
        Math.abs(value) < 1e-12
    ) {

        value = 0;

    }

    if (
        Number.isInteger(value)
    ) {

        return String(value);

    }

    return Number(
        value.toFixed(12)
    ).toString();

}


/* =========================================================
   SIGN EXPLANATION
   ========================================================= */

function signExplanation(
    left,
    right,
    operation
) {

    const lNeg = left < 0;
    const rNeg = right < 0;

    if (
        operation === "*" ||
        operation === "/"
    ) {

        if (
            lNeg &&
            rNeg
        ) {

            return currentLanguage === "hi"
                ? "दोनों संख्याएँ ऋणात्मक हैं, इसलिए ऋणात्मक × ऋणात्मक / ऋणात्मक ÷ ऋणात्मक का परिणाम धनात्मक होगा।"
                : "Both numbers are negative, so negative × negative / negative ÷ negative gives a positive result.";

        }

        if (
            lNeg !== rNeg
        ) {

            return currentLanguage === "hi"
                ? "एक संख्या ऋणात्मक और दूसरी धनात्मक है, इसलिए परिणाम ऋणात्मक होगा।"
                : "One number is negative and the other is positive, so the result is negative.";

        }

    }

    return "";

}


/* =========================================================
   DETAILED BODMAS SOLVER
   ========================================================= */

function solveDetailedExpression(expression) {

    const parser =
        new DetailedParser(expression);

    const result =
        parser.parse();

    return {
        result,
        operations:
            parser.operations
    };

}


/* =========================================================
   SOLVER HELPERS
   ========================================================= */

function extractNumbers(text) {

    return (text.match(
        /-?\d+(?:\.\d+)?/g
    ) || []).map(Number);

}


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


function lcm(a, b) {

    if (a === 0 || b === 0) {
        return 0;
    }

    return Math.abs(
        a * b
    ) / gcd(a, b);

}


/* =========================================================
   SPECIAL SOLVERS
   ========================================================= */

function solvePercentage(text) {

    const match =
        text.match(
            /(-?\d+(?:\.\d+)?)\s*%\s*(?:of|का|की)?\s*(-?\d+(?:\.\d+)?)/i
        );

    if (!match) {
        return null;
    }

    const percent =
        Number(match[1]);

    const number =
        Number(match[2]);

    const result =
        percent / 100 * number;

    return {

        result,

        steps: [

            currentLanguage === "hi"
                ? `${percent}% को decimal में बदलें: ${percent} ÷ 100 = ${percent / 100}`
                : `Convert ${percent}% to decimal: ${percent} ÷ 100 = ${percent / 100}`,

            currentLanguage === "hi"
                ? `${percent / 100} × ${number} = ${formatNumber(result)}`
                : `${percent / 100} × ${number} = ${formatNumber(result)}`

        ]

    };

}


function solveAverage(text) {

    if (
        !/average|औसत/i.test(text)
    ) {

        return null;

    }

    const numbers =
        extractNumbers(text);

    if (numbers.length < 1) {
        return null;
    }

    const sum =
        numbers.reduce(
            (a, b) => a + b,
            0
        );

    const result =
        sum / numbers.length;

    return {

        result,

        steps: [

            currentLanguage === "hi"
                ? `सभी संख्याओं का योग: ${numbers.join(" + ")} = ${sum}`
                : `Add all numbers: ${numbers.join(" + ")} = ${sum}`,

            currentLanguage === "hi"
                ? `कुल ${numbers.length} संख्याएँ हैं।`
                : `There are ${numbers.length} numbers.`,

            currentLanguage === "hi"
                ? `औसत = ${sum} ÷ ${numbers.length} = ${formatNumber(result)}`
                : `Average = ${sum} ÷ ${numbers.length} = ${formatNumber(result)}`

        ]

    };

}


function solveHCF(text) {

    if (
        !/hcf|gcd|महत्तम|म.स.ा/i.test(text)
    ) {

        return null;

    }

    const numbers =
        extractNumbers(text);

    if (numbers.length < 2) {
        return null;
    }

    let result =
        Math.abs(numbers[0]);

    const stepList = [];

    for (
        let i = 1;
        i < numbers.length;
        i++
    ) {

        const old = result;

        result =
            gcd(
                result,
                numbers[i]
            );

        stepList.push(
            currentLanguage === "hi"
                ? `HCF(${old}, ${numbers[i]}) = ${result}`
                : `HCF(${old}, ${numbers[i]}) = ${result}`
        );

    }

    return {
        result,
        steps: stepList
    };

}


function solveLCM(text) {

    if (
        !/lcm|लघुत्तम|ल.स.ा/i.test(text)
    ) {

        return null;

    }

    const numbers =
        extractNumbers(text);

    if (numbers.length < 2) {
        return null;
    }

    let result =
        Math.abs(numbers[0]);

    const stepList = [];

    for (
        let i = 1;
        i < numbers.length;
        i++
    ) {

        const old = result;

        result =
            lcm(
                result,
                numbers[i]
            );

        stepList.push(
            `LCM(${old}, ${numbers[i]}) = ${result}`
        );

    }

    return {
        result,
        steps: stepList
    };

}


function solveSquareRoot(text) {

    const match =
        text.match(
            /(?:sqrt|√)\s*(?:of\s*)?\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/i
        );

    if (!match) {
        return null;
    }

    const n =
        Number(match[1]);

    if (n < 0) {

        return {
            error:
                currentLanguage === "hi"
                    ? "Negative number का real square root नहीं है।"
                    : "A negative number does not have a real square root."
        };

    }

    const result =
        Math.sqrt(n);

    return {

        result,

        steps: [

            currentLanguage === "hi"
                ? `√${n} का अर्थ ऐसी संख्या ढूँढना है जिसका square ${n} हो।`
                : `√${n} means finding the number whose square is ${n}.`,

            `${formatNumber(result)} × ${formatNumber(result)} = ${n}`,

            currentLanguage === "hi"
                ? `अंतिम उत्तर = ${formatNumber(result)}`
                : `Final Answer = ${formatNumber(result)}`

        ]

    };

}


function solvePower(text) {

    const match =
        text.match(
            /^\s*(?:calculate|evaluate|solve)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s*(?:\^|power\s+of)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s*$/i
        );

    if (!match) {
        return null;
    }

    const base =
        Number(match[1]);

    const exponent =
        Number(match[2]);

    const result =
        Math.pow(
            base,
            exponent
        );

    return {

        result,

        steps: [

            `${base} ^ ${exponent}`,

            currentLanguage === "hi"
                ? `${base} को ${exponent} बार power में उपयोग करें।`
                : `Raise ${base} to the power ${exponent}.`,

            `= ${formatNumber(result)}`

        ]

    };

}


/* =========================================================
   LINEAR EQUATION
   ========================================================= */

function solveLinearEquation(text) {

    let s =
        normalizeMath(text)
            .replace(/solve/gi, "")
            .replace(/x/gi, "x")
            .replace(/\s+/g, "");

    const match =
        s.match(
            /^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)=([+-]?\d*\.?\d*)$/
        );

    if (!match) {
        return null;
    }

    let a =
        match[1];

    if (
        a === "" ||
        a === "+"
    ) {
        a = 1;
    }

    if (a === "-") {
        a = -1;
    }

    a = Number(a);

    const b =
        Number(
            match[2] || 0
        );

    const c =
        Number(match[3]);

    if (a === 0) {
        return null;
    }

    const result =
        (c - b) / a;

    return {

        result,

        steps: [

            `${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}`,

            currentLanguage === "hi"
                ? `${b} को दूसरी side ले जाने पर: ${a}x = ${c - b}`
                : `Move ${b} to the other side: ${a}x = ${c - b}`,

            currentLanguage === "hi"
                ? `दोनों sides को ${a} से divide करें।`
                : `Divide both sides by ${a}.`,

            `x = ${formatNumber(result)}`

        ]

    };

}


/* =========================================================
   QUADRATIC
   ========================================================= */

function solveQuadratic(text) {

    const s =
        normalizeMath(text)
            .replace(/\s+/g, "");

    const match =
        s.match(
            /^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)=0$/
        );

    if (!match) {
        return null;
    }

    let a =
        match[1];

    if (a === "" || a === "+") {
        a = 1;
    }

    if (a === "-") {
        a = -1;
    }

    a = Number(a);

    const b =
        Number(match[2] || 0);

    const c =
        Number(match[3] || 0);

    const discriminant =
        b * b - 4 * a * c;

    if (discriminant < 0) {

        return {

            result: "No real roots",

            steps: [

                `D = b² − 4ac`,

                `D = ${b}² − 4(${a})(${c})`,

                `D = ${discriminant}`,

                currentLanguage === "hi"
                    ? "Discriminant negative है, इसलिए real roots नहीं हैं।"
                    : "The discriminant is negative, so there are no real roots."

            ]

        };

    }

    const root1 =
        (-b + Math.sqrt(discriminant))
        / (2 * a);

    const root2 =
        (-b - Math.sqrt(discriminant))
        / (2 * a);

    return {

        result:
            `x₁ = ${formatNumber(root1)}, x₂ = ${formatNumber(root2)}`,

        steps: [

            `D = b² − 4ac`,

            `D = ${b}² − 4(${a})(${c}) = ${discriminant}`,

            `x = (−b ± √D) / 2a`,

            `x₁ = ${formatNumber(root1)}`,

            `x₂ = ${formatNumber(root2)}`

        ]

    };

}


/* =========================================================
   GENERAL QUESTION
   ========================================================= */

function solveBODMAS(text) {

    let expression =
        normalizeMath(text);

    expression =
        expression
            .replace(
                /^(evaluate|calculate|solve|find|what is)\s*:?\s*/i,
                ""
            )
            .trim();

    /*
       Remove trailing equals
    */

    expression =
        expression.replace(/=$/, "");

    /*
       Handle absolute value
    */

    expression =
        expression.replace(
            /\|(-?\d+(?:\.\d+)?)\|/g,
            "($1<0 ? -($1) : ($1))"
        );

    /*
       PI
    */

    expression =
        expression.replace(
            /\bPI\b/g,
            String(Math.PI)
        );

    /*
       Percentage as decimal when used after a number.
    */

    expression =
        expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

    /*
       Remove unsupported words around pure expressions.
    */

    expression =
        expression.replace(
            /\b(what|is|the|answer|of|equals?)\b/gi,
            ""
        )
        .trim();

    /*
       If normal expression is not possible,
       return null.
    */

    if (
        !/^[0-9+\-*/().^ \t]+$/.test(expression)
    ) {

        return null;

    }

    try {

        const detailed =
            solveDetailedExpression(
                expression
            );

        return {

            result:
                detailed.result,

            operations:
                detailed.operations,

            expression

        };

    } catch (error) {

        if (
            error.message ===
            "DIVISION_ZERO"
        ) {

            return {
                error: "DIVISION_ZERO"
            };

        }

        return null;

    }

}


/* =========================================================
   DETAIL TEXT
   ========================================================= */

function operationText(operation) {

    const {
        type,
        left,
        right,
        result
    } = operation;

    const l =
        formatNumber(left);

    const r =
        formatNumber(right);

    const res =
        formatNumber(result);

    if (type === "multiply") {

        let text =
            `${l} × ${r} = ${res}`;

        const sign =
            signExplanation(
                left,
                right,
                "*"
            );

        if (sign) {
            text += ` — ${sign}`;
        }

        return text;

    }

    if (type === "divide") {

        let text =
            `${l} ÷ ${r} = ${res}`;

        const sign =
            signExplanation(
                left,
                right,
                "/"
            );

        if (sign) {
            text += ` — ${sign}`;
        }

        return text;

    }

    if (type === "add") {

        return `${l} + ${r} = ${res}`;

    }

    if (type === "subtract") {

        return `${l} − ${r} = ${res}`;

    }

    if (type === "power") {

        return `${l} ^ ${r} = ${res}`;

    }

    return `${res}`;

}


/* =========================================================
   MAIN SOLVER
   ========================================================= */

function solveQuestion(rawQuestion) {

    let text =
        String(rawQuestion || "")
            .trim();

    if (!text) {

        return {
            error: "EMPTY"
        };

    }

    text =
        convertNumberWords(
            normalizeVoiceText(text)
        );

    /*
       Special solvers
    */

    let result;

    result =
        solveQuadratic(text);

    if (result) {
        return result;
    }

    result =
        solveLinearEquation(text);

    if (result) {
        return result;
    }

    result =
        solvePercentage(text);

    if (result) {
        return result;
    }

    result =
        solveSquareRoot(text);

    if (result) {
        return result;
    }

    result =
        solvePower(text);

    if (result) {
        return result;
    }

    result =
        solveAverage(text);

    if (result) {
        return result;
    }

    result =
        solveHCF(text);

    if (result) {
        return result;
    }

    result =
        solveLCM(text);

    if (result) {
        return result;
    }

    /*
       General BODMAS
    */

    result =
        solveBODMAS(text);

    if (result) {

        if (
            result.error ===
            "DIVISION_ZERO"
        ) {

            return result;

        }

        return result;

    }

    return {
        error: "INVALID"
    };

}


/* =========================================================
   RENDER RESULT
   ========================================================= */

function renderResult(data) {

    resultSection.hidden = false;

    if (data.error) {

        answer.textContent =
            data.error === "EMPTY"
                ? TEXT[currentLanguage].empty
                : data.error === "DIVISION_ZERO"
                    ? TEXT[currentLanguage].divideZero
                    : data.error;

        steps.innerHTML = "";

        return;

    }

    answer.textContent =
        typeof data.result === "number"
            ? formatNumber(data.result)
            : data.result;

    const stepList = [];


    /*
       Special solver steps
    */

    if (Array.isArray(data.steps)) {

        data.steps.forEach(item => {

            stepList.push(item);

        });

    }


    /*
       BODMAS operations
    */

    if (
        Array.isArray(data.operations)
    ) {

        if (stepList.length === 0) {

            stepList.push(
                currentLanguage === "hi"
                    ? "BODMAS के अनुसार पहले × और ÷ को हल किया जाता है, फिर + और − को।"
                    : "According to BODMAS, multiplication and division are solved before addition and subtraction."
            );

        }

        data.operations.forEach(operation => {

            stepList.push(
                operationText(operation)
            );

        });


        stepList.push(
            currentLanguage === "hi"
                ? `अंतिम उत्तर = ${formatNumber(data.result)}`
                : `Final Answer = ${formatNumber(data.result)}`
        );

    }


    if (stepList.length === 0) {

        stepList.push(
            currentLanguage === "hi"
                ? `अंतिम उत्तर = ${data.result}`
                : `Final Answer = ${data.result}`
        );

    }


    steps.innerHTML =
        stepList
            .map(
                (item, index) => `
                    <div class="step-item">
                        <span class="step-number">
                            ${TEXT[currentLanguage].step} ${index + 1}:
                        </span>
                        ${escapeHTML(item)}
                    </div>
                `
            )
            .join("");

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   HTML ESCAPE
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

function performSolve() {

    const data =
        solveQuestion(
            question.value
        );

    renderResult(data);

    if (
        !data.error
    ) {

        saveHistory(
            question.value,
            data.result
        );

    }

}


solveBtn.addEventListener(
    "click",
    performSolve
);


/* =========================================================
   CLEAR
   ========================================================= */

clearBtn.addEventListener(
    "click",
    function () {

        question.value = "";

        resultSection.hidden = true;

        answer.textContent = "";

        steps.innerHTML = "";

        question.focus();

    }
);


/* =========================================================
   MATH KEYBOARD INSERT
   ========================================================= */

document
    .querySelectorAll(".math-key")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                insertAtCursor(
                    question,
                    this.dataset.symbol || ""
                );

            }
        );

    });


function insertAtCursor(
    textarea,
    text
) {

    const start =
        textarea.selectionStart ?? textarea.value.length;

    const end =
        textarea.selectionEnd ?? textarea.value.length;

    const before =
        textarea.value.substring(
            0,
            start
        );

    const after =
        textarea.value.substring(
            end
        );

    textarea.value =
        before +
        text +
        after;

    const position =
        start + text.length;

    textarea.focus();

    textarea.setSelectionRange(
        position,
        position
    );

}


/* =========================================================
   BACKSPACE
   ========================================================= */

backspaceBtn.addEventListener(
    "click",
    function () {

        const start =
            question.selectionStart;

        const end =
            question.selectionEnd;

        if (
            start !== end
        ) {

            question.value =
                question.value.substring(
                    0,
                    start
                ) +
                question.value.substring(
                    end
                );

            question.setSelectionRange(
                start,
                start
            );

            question.focus();

            return;

        }

        if (start > 0) {

            question.value =
                question.value.substring(
                    0,
                    start - 1
                ) +
                question.value.substring(
                    start
                );

            question.setSelectionRange(
                start - 1,
                start - 1
            );

        }

        question.focus();

    }
);


/* =========================================================
   CLEAR KEYBOARD
   ========================================================= */

deleteAllBtn.addEventListener(
    "click",
    function () {

        question.value = "";

        question.focus();

    }
);


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

question.addEventListener(
    "keydown",
    function (event) {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            performSolve();

        }

    }
);


/* =========================================================
   EXAMPLES
   ========================================================= */

document
    .querySelectorAll(".example-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                question.value =
                    this.dataset.example || "";

                question.focus();

                performSolve();

            }
        );

    });


/* =========================================================
   HISTORY
   ========================================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                HISTORY_KEY
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveHistory(
    questionText,
    result
) {

    const history =
        getHistory();

    history.unshift({

        id:
            Date.now(),

        question:
            questionText,

        answer:
            result,

        time:
            new Date().toLocaleString()

    });

    /*
       Maximum 50 records
    */

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            history.slice(0, 50)
        )
    );

    renderHistory();

}


function renderHistory() {

    const history =
        getHistory();

    if (
        history.length === 0
    ) {

        historyList.innerHTML = `
            <div class="history-empty">
                ${escapeHTML(
                    TEXT[currentLanguage].noHistory
                )}
            </div>
        `;

        return;

    }

    historyList.innerHTML =
        history
            .map(item => {

                return `
                    <div class="history-item">

                        <div
                            class="history-question"
                            data-history-id="${item.id}"
                        >

                            <div>
                                ${escapeHTML(item.question)}
                            </div>

                            <div class="history-answer">
                                = ${escapeHTML(item.answer)}
                            </div>

                        </div>

                        <button
                            type="button"
                            class="history-delete"
                            data-delete-id="${item.id}"
                            aria-label="Delete"
                        >
                            🗑️
                        </button>

                    </div>
                `;

            })
            .join("");

}


historyList.addEventListener(
    "click",
    function (event) {

        const deleteButton =
            event.target.closest(
                ".history-delete"
            );

        if (deleteButton) {

            const id =
                Number(
                    deleteButton.dataset.deleteId
                );

            deleteHistory(id);

            return;

        }


        const item =
            event.target.closest(
                ".history-question"
            );

        if (item) {

            const id =
                Number(
                    item.dataset.historyId
                );

            const history =
                getHistory();

            const record =
                history.find(
                    x => x.id === id
                );

            if (record) {

                question.value =
                    record.question;

                performSolve();

            }

        }

    }
);


function deleteHistory(id) {

    const history =
        getHistory()
            .filter(
                item => item.id !== id
            );

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    renderHistory();

}


clearHistoryBtn.addEventListener(
    "click",
    function () {

        if (
            !confirm(
                currentLanguage === "hi"
                    ? "क्या आप पूरा History साफ करना चाहते हैं?"
                    : "Clear all calculation history?"
            )
        ) {

            return;

        }

        localStorage.removeItem(
            HISTORY_KEY
        );

        renderHistory();

    }
);


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.onstart =
        function () {

            isListening = true;

            micBtn.classList.add(
                "listening"
            );

            micIcon.textContent =
                "🔴";

            voiceStatus.textContent =
                TEXT[currentLanguage].listening;

        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;

            question.value =
                normalizeVoiceText(
                    transcript
                );

            voiceStatus.textContent =
                transcript;

            /*
               Voice के बाद automatic solve
            */

            setTimeout(
                performSolve,
                250
            );

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Voice error:",
                event.error
            );

            voiceStatus.textContent =
                event.error;

        };


    recognition.onend =
        function () {

            isListening = false;

            micBtn.classList.remove(
                "listening"
            );

            micIcon.textContent =
                "🎤";

            if (
                voiceStatus.textContent ===
                TEXT[currentLanguage].listening
            ) {

                voiceStatus.textContent =
                    TEXT[currentLanguage].ready;

            }

        };

} else {

    micBtn.disabled = true;

    voiceStatus.textContent =
        TEXT[currentLanguage].unsupported;

}


micBtn.addEventListener(
    "click",
    function () {

        if (!recognition) {
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
);


/* =========================================================
   PWA INSTALL
   ========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        deferredInstallPrompt =
            event;

        installBtn.hidden =
            false;

    }
);


installBtn.addEventListener(
    "click",
    async function () {

        if (!deferredInstallPrompt) {

            iosInstallHelp.hidden =
                false;

            return;

        }

        deferredInstallPrompt.prompt();

        const result =
            await deferredInstallPrompt.userChoice;

        console.log(
            "Install choice:",
            result.outcome
        );

        deferredInstallPrompt =
            null;

        installBtn.hidden =
            true;

    }
);


window.addEventListener(
    "appinstalled",
    function () {

        deferredInstallPrompt =
            null;

        installBtn.hidden =
            true;

        console.log(
            "Math King installed."
        );

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

setLanguage("en");

renderHistory();

question.focus();


/* =========================================================
   PUBLIC API
   ========================================================= */

window.MathKing = {

    solve:
        solveQuestion,

    detailed:
        solveDetailedExpression,

    normalize:
        normalizeMath,

    history:
        getHistory

};
