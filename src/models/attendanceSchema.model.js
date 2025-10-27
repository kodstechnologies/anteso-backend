import mongoose, { Schema } from 'mongoose';

const attendanceSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave'],
    },
    workingDays: {
        type: Number,
    },
    leave: {
        type: Schema.Types.ObjectId,
        ref: 'Leave', // Optional ref if this day is part of a leave
    },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;