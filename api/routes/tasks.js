const express = require('express')
const router = express.Router();
const Task = require('../routes/models/tasks')
const mongoose = require('mongoose')
router.get('/',(req,res,next) => {
    Task
    .find()
    .select('_id name schedule assignedTo')
    .exec()
    .then(docs=>{
        const response = {
            count: docs.length,
            tasks: docs.map(doc=>{
                return{
                    name: doc.name,
                    schedule: doc.schedule,
                    assignedTo: doc.assignedTo,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/tasks/'+ docs._id
                    }
                }
            })
        }
        res.status(200).json(docs);
        })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
    
});
//POST
router.post('/',(req,res,next) => {
    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        schedule: req.body.schedule,
        assignedTo: req.body.assignedTo
    })
    task
        .save()
        .then(result =>{
            console.log(result);
            res.status(201).json({
                message: 'handling POST /tasks',
                createdTask: {
                    id: result._id,
                    name: result.name,
                    schedule: result.schedule,
                    assignedTo: result.assignedTo,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/tasks/'+ result._id
                    }

                }
            });
        })
        .catch(err=>
            {
                console.log(err)
                res.status(500).json({
                    error: err
                })

            });
    
    
});

router.get('/:taskId',(req,res,next) => {
    const id =req.params.taskId;
   Task.findById(id)
   .select('_id name schedule assignedTo')
    .exec()
    .then(doc =>{
        console.log(doc)
        if(doc){
            res.status(200).json({
                id: doc._id,
                name: doc.name,
                schedule: doc.schedule,
                assignedTo: doc.assignedTo,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/tasks/'+ doc._id
                }

            })
        }
        else{
            res.status(404).json({message: 'No value found'})
        }
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });
});

//DELETE
router.delete('/:taskId',(req,res,next) => {
    const id =req.params.taskId;
   Task.findOneAndRemove({_id: id})
    .exec()
    .then(result =>{
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
            })
    });
});

//PATCH
router.patch('/:taskId',(req,res,next) => {
    const id =req.params.taskId;
    const updateOps={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
   Task.update({_id: id}, { $set: updateOps })
    .exec()
    .then(result =>{
        console.log(result)
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
            })
    });
});
module.exports = router