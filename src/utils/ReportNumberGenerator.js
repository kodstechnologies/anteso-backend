// // utils/reportGenerator.js

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

// ✅ Shared sequence counter (should be persisted later)
let sharedSequenceCounter = 3182;

/**
 * ✅ Generate ULR Report Number
 */
export function generateULRReportNumber(sequence = sharedSequenceCounter) {
    const prefix = "TC9843";
    const year = getCurrentYearTwoDigit();
    const seq = pad(sequence, 9);
    return `${prefix}${year}${seq}`;
}

/**
 * ✅ Generate QA Test Report Number
 */
export function generateQATestReportNumber(sequence = sharedSequenceCounter) {
    const prefix = "ABQAR";
    const year = getCurrentYearTwoDigit();
    const month = getCurrentMonthTwoDigit();
    const seq = pad(sequence, 5);
    return `${prefix}${year}${month}${seq}`;
}

/**
 * ✅ Increment shared counter
 */
export function incrementReportCounters() {
    sharedSequenceCounter++;
}

/**
 * ✅ Generate both ULR & QA numbers with same sequence
 */
export function generateBothReports() {
    const currentSeq = sharedSequenceCounter;
    const ulr = generateULRReportNumber(currentSeq);
    const qa = generateQATestReportNumber(currentSeq);
    incrementReportCounters();
    return { ulr, qa };
}

/**
 * ✅ Get current counter
 */
export function getCurrentSequence() {
    return sharedSequenceCounter;
}
