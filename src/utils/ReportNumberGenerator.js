// // utils/reportGenerator.js

import Counter from "../models/counterForReports.model.js";

// // utils/reportGenerator.js

// const pad = (num, size) => num.toString().padStart(size, '0');

// const getCurrentYearTwoDigit = () => new Date().getFullYear().toString().slice(-2);

// const getCurrentMonthTwoDigit = () => pad(new Date().getMonth() + 1, 2);

// // Example: simulate a sequence counter (replace with DB or persistent storage in production)
// let sequenceCounter = 3182;

// export function generateULRReportNumber() {
//     const prefix = 'TC9843';
//     const year = getCurrentYearTwoDigit();
//     const sequence = pad(sequenceCounter, 9); // 9 digits
//     const number = `${prefix}${year}${sequence}`;
//     incrementSequence(); // ✅ increment after generating
//     return number;
// }

// export function generateQATestReportNumber() {
//     const prefix = 'ABQAR';
//     const year = getCurrentYearTwoDigit();
//     const month = getCurrentMonthTwoDigit();
//     const sequence = pad(sequenceCounter, 5);
//     const number = `${prefix}${year}${month}${sequence}`;
//     incrementSequence(); // ✅ increment after generating
//     return number;
// }

// function incrementSequence() {
//     sequenceCounter++;
// }


// utils/reportGenerator.js

// utils/reportGenerator.js

// utils/ReportNumberGenerator.js


const pad = (num, size) => num.toString().padStart(size, "0");

const getCurrentYearTwoDigit = () => new Date().getFullYear().toString().slice(-2);
const getCurrentMonthTwoDigit = () => pad(new Date().getMonth() + 1, 2);

// ✅ Initialize the counter if not present, starting from 3182
async function ensureCounterExists() {
    const existing = await Counter.findOne({ name: "reportCounter" });
    if (!existing) {
        await Counter.create({ name: "reportCounter", value: 3182 });
    }
}

/**
 * ✅ Get next sequence number
 */
export async function getNextSequence() {
    await ensureCounterExists(); // make sure it exists before incrementing

    const counter = await Counter.findOneAndUpdate(
        { name: "reportCounter" },
        { $inc: { value: 1 } },
        { new: true }
    );

    return counter.value;
}

/**
 * ✅ Generate both ULR and QA report numbers using same sequence
 */
export async function generateBothReports() {
    const sequence = await getNextSequence();

    const ulr = generateULRReportNumber(sequence);
    const qa = generateQATestReportNumber(sequence);

    return { ulr, qa };
}

/**
 * ✅ Generate ULR Report Number
 * Format: TC9843 + [YY] + [9-digit seq]
 */
export function generateULRReportNumber(sequence) {
    const prefix = "TC9843";
    const year = getCurrentYearTwoDigit();
    const seq = pad(sequence, 9);
    return `${prefix}${year}${seq}`;
}

/**
 * ✅ Generate QA Test Report Number
 * Format: ABQAR + [YY] + [MM] + [5-digit seq]
 */
export function generateQATestReportNumber(sequence) {
    const prefix = "ABQAR";
    const year = getCurrentYearTwoDigit();
    const month = getCurrentMonthTwoDigit();
    const seq = pad(sequence, 5);
    return `${prefix}${year}${month}${seq}`;
}
