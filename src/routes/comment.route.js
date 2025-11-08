const express = require('express');
const Comment = require('../model/comment.model');
const router = express.Router();


//create a comment
router.post('/post-comment', async (req, res) => {
    try {
        console.log(req.body);
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(200).send({message: "Comment creado", comment: newComment})
    } catch (error) {
        console.error("Error posting new comment", error);
        res.status(500).send({message: "Error posting new comment"})
    }
})

//geet all comments count total
router.get("/total-comments", async(req, res) => {
    try {
        const totalComment = await Comment.countDocuments({});
        res.status(200).send({message: "Total comments count", totalComment})
    } catch (error) {
        console.error("Error geting total count comment", error);
        res.status(500).send({message: "Error getring total count comment"})
    }
})


module.exports = router;
