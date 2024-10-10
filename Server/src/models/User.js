import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        default: 1000
    },
    country: {
        type: String,
        required: true,
        default: "Turkiye",
    },  
    friends: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to other users
        ref: 'User',
        default: []
    }],
    friendRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        status: { type: String, default: 'pending'} // 'pending', 'accepted', 'rejected'
    }],
});

// Hash the password before saving the user
User.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model("User", User);