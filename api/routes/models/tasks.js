
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String,required: true},
        schedule:{ type: String, required: true},
        assignedTo: { type: String, required: true}
    }
);

module.exports = mongoose.model('Tasks', taskSchema);