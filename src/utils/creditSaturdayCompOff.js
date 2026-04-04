import { LeaveAllocation } from '../models/allocateLeaves.model.js';

/**
 * Credit 1 comp-off when employee is Present on a Saturday, once per local calendar day.
 * @param {import('mongoose').Types.ObjectId|string} employeeId
 * @param {Date} localDayStart - Local date at 00:00:00 (use same TZ as attendance "today")
 * @param {string} attendanceStatus - e.g. "Present" | "On Leave"
 */
export async function creditSaturdayCompOffIfEligible(employeeId, localDayStart, attendanceStatus) {
    const today = new Date(localDayStart);
    today.setHours(0, 0, 0, 0);

    if (today.getDay() !== 6) return; // Saturday only
    if (attendanceStatus !== 'Present') return;

    const currentYear = today.getFullYear();

    let allocation = await LeaveAllocation.findOne({
        employee: employeeId,
        year: currentYear,
    });

    let alreadyCredited = false;
    if (allocation?.compOffLastCreditedAt) {
        const credited = new Date(allocation.compOffLastCreditedAt);
        credited.setHours(0, 0, 0, 0);
        alreadyCredited = credited.getTime() === today.getTime();
    }
    if (alreadyCredited) return;

    if (allocation) {
        if (allocation.allocatedLeaves == null && allocation.compOffLeaves == null) {
            allocation.allocatedLeaves = Number(allocation.totalLeaves) || 0;
            allocation.compOffLeaves = 0;
        }
        allocation.compOffLeaves = (Number(allocation.compOffLeaves) || 0) + 1;
        allocation.totalLeaves =
            (Number(allocation.allocatedLeaves) || 0) + allocation.compOffLeaves;
        allocation.compOffLastCreditedAt = today;
        await allocation.save();
    } else {
        await LeaveAllocation.create({
            employee: employeeId,
            year: currentYear,
            allocatedLeaves: 0,
            compOffLeaves: 1,
            totalLeaves: 1,
            usedLeaves: 0,
            compOffLastCreditedAt: today,
        });
    }
}
