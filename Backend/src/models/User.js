const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['member', 'admin'], // แยก Role ตามโจทย์ (Member=สมาชิก, Admin=ผู้ดูแล)
        default: 'member'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);