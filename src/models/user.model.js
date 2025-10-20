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
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

    },
    {
        timestamps: true,
        discriminatorKey: 'role',
    }
);
userSchema.index({ phone: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;