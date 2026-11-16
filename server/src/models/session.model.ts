import mongoose from "mongoose"

export interface ISession {
    user: mongoose.Types.ObjectId,
    refreshTokenHash: string,
    ip: string,
    userAgent: string,
    revoked: boolean,
    createdAt: Date,
    updatedAt: Date
}

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The ref should match the registered Mongoose model name.
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;