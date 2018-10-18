
const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        _id: String,
        name: {type: String,required: true},
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: { type: String, required: true},
        groups:  [{type:String}],
        tasks: [{type:String}]
    }
);
userSchema.set('autoIndex', false);
module.exports = mongoose.model('User', userSchema);