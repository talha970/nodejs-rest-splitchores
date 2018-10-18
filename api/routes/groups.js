const express = require('express')
const router = express.Router();
const Group = require('../routes/models/groups')
const Task = require('../routes/models/tasks')
const User = require('../routes/models/user')
const mongoose = require('mongoose')


//get all groups
router.get('/', (req, res, next) => {
    Group.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })

});




//get multiple groups param:group id array
router.get("/getGroups", (req, res, next) => {
    console.log(req.query.id);
    Group.find()
        .where('_id')
        .in(req.query.id)
        .exec()
        .then(group => {
            if (group) {
                console.log(group)
                res.status(200).json(group)
            }
            else {
                res.status(404).json({ message: 'No value found' })
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
});

//adding a task in some group param:groupid
router.post("/:groupId", async (req, res, next) => {
    const id = req.params.groupId;
    console.log(id)
    try {
        let group = await Group.findById(id)
        if (!group) {
            return res.status(404).json({
                message: "group not found"
            });
        }
        else {
            console.log("in else")
            const task = new Task({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                schedule: req.body.schedule,
                assignedTo: req.body.assignedTo
            });
            group.tasks.push(task)
            var members = group.members
            let usersToAdd = await User.find()
                .where('_id')
                .in(group.members)
                .exec()
            console.log(usersToAdd)
            if (usersToAdd.length == members.length) {
                for (const user of usersToAdd) {
                    user.tasks.push(task._id)
                    await user.save()
                }
            
                group.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: "Task stored",
                            createdTask: {
                                _id: result._id,
                                name: result.name,
                                assignedTo: result.assignedTo
                            }
                        });
                    })

            }

        }
    }
    catch (error) {
        res.status(500).json({
            message: error
        })
    }


})

// create a group
router.post('/', async (req, res, next) => {
    const group = new Group({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        members: req.body.members,
        tasks: []
    })
    var members = req.body.members;
    let usersToAdd = await User.find()
        .where('_id')
        .in(req.body.members)
        .exec()
    console.log(usersToAdd)
    console.log(members.length)
    if (usersToAdd.length == members.length) {
        try {
            for (const user of usersToAdd) {
                user.groups.push(group._id)
                await user.save()
            }
            let result = await group.save()
            res.status(201).json({
                message: 'handling POST /groups',
                createdGroup: {
                    id: result._id,
                    name: result.name,
                    members: result.members,
                    tasks: result.tasks
                }
            });
        }
        catch (err) {
            res.status(500).json({
                error: err
            })
        }
    }
    else {
        res.status(500).json({
            message: error
        })
    }

});

//DELETE a group
router.delete('/:groupId', async (req, res, next) => {
    const id = req.params.groupId;
    try {
        console.log("try")
        let group = await Group.findById({ _id: id }).exec()
        console.log(group)
        if (group != null) {
            console.log("if")
            var members = group.members;
            console.log("allusers")
            let allUsers = await User.find()
                .where('_id')
                .in(members)
                .exec()
            if (allUsers.length == members.length) {
                try {
                    for (const user of allUsers) {
                        user.groups.pull(group._id)
                        let taskIdsToRemove = group.tasks
                        user.tasks.pull(taskIdsToRemove);
                        await user.save()
                        console.log("loop")
                    }
                    console.log("here")
                    await Group.findOneAndRemove({ _id: id }).exec().then(result => {
                        res.status(200).json({
                            message: "group removed"
                        })
                    })
                }
                catch (err) {
                    console.log(err)
                    res.status(500).json({
                        message: err
                    })
                }
            }
            else {
                res.status(404).json({
                    message: "users not found"
                })
            }
        }
        else {
            console.log("else")
            res.status(404).json({
                message: "group not found"
            })
        }
    }
    catch (error) {
        res.status(500).json({
            message: error
        })
    }
});

//deleting a task from some group param:groupid
router.delete("/:groupId/:taskId", async (req, res, next) => {
    const taskId = req.params.taskId;
    const groupId = req.params.groupId;
    console.log(groupId)
    console.log("task id " + taskId)
    let group = await Group.findById({ _id: groupId }).exec()
    if (group == null) {
        return res.status(404).json({
            message: "group not found"
        });
    }
    else {
        try{
                let members = group.members
                let allUsers = await User.find().where('_id')
                    .in(members)
                    .exec()
                if (allUsers.length == members.length) {
                    group.tasks.pull({ _id: taskId })
                    await group.save()
                    for (const user of allUsers) {
                        user.tasks.pull(taskId)
                        await user.save()
                        console.log("loop")
                    }
                    
                    res.status(201).json({
                        message: "Task deleted"
                    });
                }

    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message: error
        });
    }

    }



})
module.exports = router