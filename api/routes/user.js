const express = require('express')
const router = express.Router();
const User = require('../routes/models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')

router.get('/:userId',(req,res,next) => {
    const id =req.params.taskId;
   User.findById(id)
   .select('_id name groups tasks')
    .exec()
    .then(doc =>{
        console.log(doc)
        if(doc){
            res.status(200).json({
                id: doc._id,
                name: doc.name,
                groups: doc.groups,
                tasks: doc.tasks

            })
        }
        else{
            res.status(404).json({message: 'No User found'})
        }
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    });
});

router.get('/',(req,res,next) => {
    User.find()
    .select('_id name email password groups tasks')
    .exec()
    .then(docs=>{
        const response = {
            count: docs.length,
            users: docs.map(doc=>{
                return{
                    _id: doc._id,
                    name: doc.name,
                    email: doc.email,
                    password: doc.password,
                    tasks: doc.tasks,
                    groups: doc.groups
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

router.post('/signup',(req,res,next) =>{
    User.find({email: req.body.email})
    .exec()
    .then(user=>{
        if(user.length >=1){
            return res.send(409).json({
                message: "email exists"
            })
        }
        else{
            User.find({_id: req.body.userId})
            .exec()
            .then(user=>{
                if(user.length >=1){
                    return res.send(409).json({
                        message: "userId exists"
                    })
                }
                else{
                    bcrypt.hash(req.body.password,10,(err,hash)=>{
                        if(err){
                            return res.status(500).json({
                                error: err
                            })
                        }
                        else {
                            const user = new User({
                                _id: req.body.userId,
                                name: req.body.name,
                                email: req.body.email,
                                password: hash,
                                groups:[],
                                tasks:[]
                             })
                             user.save()
                             .then(result=>{
                                 console.log(result)
                                 res.status(201).json({
                                     message: 'user created'
                                 })
                             })
                             .catch(err=>{
                                 console.log(err)
                                 res.status(500).json({
                                     error:err
                                 })
                             })
                        }
                    })
                }
            })

        }
    })

 
})

router.post("/login", (req, res, next) => {
    User.find({ _id: req.body.userId })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401)
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1y"
              }
            );
            return res.status(200).json({
              token: token,
              userId:user[0]._id,
              email: user[0].email,
              groups: user[0].groups,
              tasks:user[0].tasks

            });
          }
          res.status(401)
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
  
  router.delete("/:userId", (req, res, next) => {
    User.findOneAndRemove({ _id: req.params.userId })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
  


module.exports = router;