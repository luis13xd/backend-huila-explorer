const express = require('express');
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

//create a blog post
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
    try {
        //console.log("Guardando datos en api: ", req.body)
        const newPost = new Blog({ ...req.body, author: req.userId }); 
        await newPost.save();
        res.status(201).send({
            message: "Post creado.",
            post: newPost
        })
    } catch (error) {
        console.error("Error creando post: ", error);
        res.status(500).send({ message: "Error creando post" })
    }
})

//get all blogs
router.get('/', async (req, res) => {
    try {
        const { search, category, location } = req.query;
        console.log(search);

        let query = {}

        if (search) {
            query = {
                ...query,
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { content: { $regex: search, $options: "i" } }
                ]
            }
        }
        if (category) {
            query = {
                ...query,
                category
            }
        }
        if (location) {
            query = {
                ...query,
                location
            }
        }

        const posts = await Blog.find(query).populate('author', 'email').sort({ createdAt: -1 });
        res.status(200).send(posts)
    } catch (error) {
        console.error("Error obteniendo post: ", error);
        res.status(500).send({ message: "Error obteniendo post" })
    }
})

//get blog by id
router.get("/:id",  async (req, res) => {
    try {
        //console.log(req.params.id);
        const postId = req.params.id;
        const post = await Blog.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        const comments = await Comment.find({postId: postId}).populate('user', "username email")
        res.status(200).send({
            post, comments
        })
    } catch (error) {
        console.error("Error buscando post por id: ", error);
        res.status(500).send({ message: "Error buscando post por id" })
    }
})

//update a blog post
router.patch("/update-post/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const postId = req.params.id;
        const updatePost = await Blog.findByIdAndUpdate(postId, {
            ...req.body
        }, { new: true });
        if (!updatePost) {
            return res.status(404).send({ message: "Post not found" })
        }
        res.status(200).send({
            message: "Post update",
            post: updatePost
        })
    } catch (error) {
        console.error("Error update post: ", error);
        res.status(500).send({ message: "Error update post" })
    }
})

//delete a blog post
router.delete("/:id", verifyToken, isAdmin, async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await Blog.findByIdAndDelete(postId);
        if(!post){
            return res.status(404).send({ message: "Pos not found" })
        }
        //delete comments
        await Comment.deleteMany({postId: postId})
        res.status(200).send({
            message: "Post deleted",
            post
        })
    } catch (error) {
        console.error("Error eliminando post: ", error);
        res.status(500).send({ message: "Error eliminando post" })
    }
})

//busca titulos similares al nuestro a travez del id
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Post id is required" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).send({ message: "Post no encontrado" });
    }

    // Buscar blogs de la misma categoría (o descripción parecida)
    const relatedQuery = {
      _id: { $ne: id },
      category: blog.category, // mismo tipo de sitio
    };

    const relatedPost = await Blog.find(relatedQuery).limit(4); // puedes ajustar el número

    // Si no hay resultados por categoría, busca por palabra clave del título como respaldo
    if (relatedPost.length === 0) {
      const titleRegex = new RegExp(blog.title.split(" ").join("|"), "i");
      const backupPosts = await Blog.find({
        _id: { $ne: id },
        title: { $regex: titleRegex },
      }).limit(4);

      return res.status(200).send(backupPosts);
    }

    res.status(200).send(relatedPost);
  } catch (error) {
    console.error("Error obteniendo sitios relacionados:", error);
    res.status(500).send({ message: "Error obteniendo sitios relacionados" });
  }
});

module.exports = router;