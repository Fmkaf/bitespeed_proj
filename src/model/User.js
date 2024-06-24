const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    id: { type: Number, unique: true },
    phoneNumber: Number,
    email: String,
    linkedId: Number,
    linkPrecedence: {
        type: String,
        enum: ["secondary", "primary"]
    },
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
}, { versionKey: false })

module.exports = mongoose.model("users", schema)