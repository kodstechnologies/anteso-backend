import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },

    },
    {
        timestamps: true,
        discriminatorKey: 'role',
    }
);

// Unique per role so same phone/email can exist across Dealer, Manufacturer, Employee, etc.
userSchema.index({ phone: 1, role: 1 }, { unique: true });
userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
