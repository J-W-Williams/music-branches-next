const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
// const { auth } = require('express-oauth2-jwt-bearer');
require("dotenv").config();

// handlers
const {
  getUserProjects,
  getResources,
  uploadResource,
  deleteResource,
  getAllTags,
  updateTags,
  deleteTag
} = require("./handlers/handlers");

const port = 8000;
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(auth());

// Multer configuration (to handle uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// morgan tiny for nice feedback
app.use(morgan('tiny'))

// access control config
app.use(function (req, res, next) {
  if (!process.env.FRONTEND_ORIGIN) {
    throw new Error("FRONTEND_ORIGIN environment variable is not set");
  }
  const allowedOrigin = process.env.FRONTEND_ORIGIN;

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, HEAD, GET, PUT, POST, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
})

// endpoints:

// get-user-projects
// get-audio
// get-images
// upload-audio
// upload-image
// delete-resource
// get-all-tags
// update-tags
// delete-tag

// get-user-projects
// populate the user/projects dropdown
// data comes from MongoDB.
app.get('/api/get-user-projects', getUserProjects);

// get-audio / get-images: 
// use getResources for both
// get user/project audio & images
app.get('/api/get-audio', (req, res) => getResources(req, res, 'video'));
app.get('/api/get-images', (req, res) => getResources(req, res, 'image'));

// upload audio & images to Cloudinary / store returned data to MongoDB
// uploadResource is used for both audio & image.
// Note: on Cloudinary, audio files are considered 'video'
// Note: upload.single is using multer to handle the upload
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => uploadResource(req, res, 'video'));
app.post('/api/upload-image', upload.single('image'), async (req, res) => uploadResource(req, res, 'image'));

// delete elements
// deleteResource handles both types
app.delete('/api/delete-resource/:resourceType/:id', deleteResource);

// tags
app.get('/api/get-all-tags', getAllTags);
app.post('/api/update-tags/:collection', updateTags);
app.delete('/api/delete-tag/:publicId/:tags/:collection', deleteTag);

// start server
app.listen(port, () => {
    console.log(`Server is up and listening at port : ${port}`);
})