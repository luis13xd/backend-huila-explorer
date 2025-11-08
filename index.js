const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

// parse options
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(cors({
  origin: true,
  credentials: true, //establece set cookies
}));

//routes
const blogRoutes = require("./src/routes/blog.route");
const commentRoutes = require("./src/routes/comment.route");
const userRoutes = require("./src/routes/auth.user.route");

app.use("/api/auth", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);


async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}
main().then(() => console.log("Mongodb conectado")).catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Backend funcionando!')
})

app.listen(port, () => {
  console.log(`Ejecutando backend en puerto  ${port}`)
})