const express = require('express')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


const taskRoutes = require('./api/routes/tasks');
const groupRoutes = require('./api/routes/groups');
const userRoutes = require('./api/routes/user');
mongoose.connect("mongodb+srv://talha970:"  +
process.env.MONGO_ATLAS_PW  +
"@cluster0-ttvrh.mongodb.net/test?retryWrites=true"
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Headers','PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});


app.use('/tasks',taskRoutes)
app.use('/groups',groupRoutes)
app.use('/user',userRoutes)

app.use((req,res,next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
});

app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;