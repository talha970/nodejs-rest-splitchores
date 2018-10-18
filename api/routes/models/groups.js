
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String,required: true},
        schedule:{ type: String, required: true},
        assignedTo: { type: String, required: true}
    }
);
const groupSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String,required: true},
        members: [{type: String,required: true}],
        tasks: [taskSchema]
    }
);

module.exports = mongoose.model('Groups', groupSchema); 
