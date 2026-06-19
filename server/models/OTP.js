const mongoose = require('mongoose');
const dns = require('dns');

// Force clean DNS resolution servers to prevent connection drops
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,

    },
    otp: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        enum: ['account_verification', 'event_booking'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);