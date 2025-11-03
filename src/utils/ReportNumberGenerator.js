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

const pad = (num, size) => num.toString().padStart(size, '0');

const getCurrentYearTwoDigit = () => new Date().getFullYear().toString().slice(-2);
const getCurrentMonthTwoDigit = () => pad(new Date().getMonth() + 1, 2);

// ✅ Shared sequence counter
let sharedSequenceCounter = 3182;

// ✅ Generate ULR Report Number
export function generateULRReportNumber() {
    const prefix = 'TC9843';
    const year = getCurrentYearTwoDigit();
    const sequence = pad(sharedSequenceCounter, 9); // 9 digits
    const number = `${prefix}${year}${sequence}`;
    return number;
}

// ✅ Generate QA Test Report Number
export function generateQATestReportNumber() {
    const prefix = 'ABQAR';
    const year = getCurrentYearTwoDigit();
    const month = getCurrentMonthTwoDigit();
    const sequence = pad(sharedSequenceCounter, 5); // 5 digits
    const number = `${prefix}${year}${month}${sequence}`;
    return number;
}

// ✅ Function to increment both together
export function incrementReportCounters() {
    sharedSequenceCounter++;
}

// ✅ Optional helper: Generate both at once
export function generateBothReports() {
    const ulr = generateULRReportNumber();
    const qa = generateQATestReportNumber();
    incrementReportCounters();
    return { ulr, qa };
}
