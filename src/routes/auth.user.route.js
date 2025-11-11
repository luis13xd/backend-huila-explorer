const express = require('express');
const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');

const router = express.Router();

//register new user
router.post('/register', async (req, res) => {
    try {
        const {email, password, username} = req.body;
        const user = new User({email, password, username});
        //console.log(user);
        await user.save();
        res.status(200).send({message: "User registrado!", user: user});
    } catch (error) {
        console.error("Failed to regidter");
        res.status(500).json({ message: 'Register failed!'});
    }
})

//login a user
router.post("/login", async (req, res) => {
    try {
        //console.log(req.body);
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).send({message: 'User not found'})
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch) {
            return res.status(401).send({message: 'Invalid password'})
        }
        //token generated
        const token = await generateToken(user._id);
        //console.log("Tonken generado: ", token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none", 
        })

        res.status(200).send({message: 'Login Succesful!', token, user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }})

    } catch (error) {
        console.error("Failed to login");
        res.status(500).json({ message: 'Login failed!'});
    }
})

//logout a user
router.post("/logout", async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send({ message: 'Logged succesfully!'});
    } catch (error) {
        console.error("Failed to logout", error);
        res.status(500).json({message:'Logout failed!'})
    }
})

//get all user
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'id email role');
        res.status(200).send({message: "user found succesfully!", users})
    } catch (error) {
        console.error("error fetching users", error);
        res.status(500).json({message:'error fetching users!'})
    }
})

//delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user) {
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send({message: "User deleted!"})
    } catch (error) {
        console.error("error deleting users", error);
        res.status(500).json({message:'error deleting users!'})
    }
})

//update a user role
router.put('/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {role} = req.body;
        const user = await User.findByIdAndUpdate(id, {role}, {new: true});
        if(!user) {
            return res.status(404).send({message: 'User not found'})
        }
        res.status(200).send({message: 'User role update succesfully!', user})
    } catch (error) {
        console.error("error updating users", error);
        res.status(500).json({message:'error updating users!'})
    }
})

module.exports = router;
