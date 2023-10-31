const express = require('express');
const morgan = require('morgan');
const multer = require('multer');

const cloudinary = require('cloudinary').v2;
const { MongoClient } = require("mongodb");

const options = {
   useNewUrlParser: true,
   useUnifiedTopology: true,
};

const {
  getResources,
  uploadResource,
  deleteResource
} = require("./handlers/handlers");


require("dotenv").config();
const { MONGO_URI } = process.env;
const port = 8000;
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(morgan('tiny'))

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
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

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// app.get('/', (req, res) => {
//     res.status(200).json({message: 'hello world!'});
// })

//app.get('/api/get-audio', getAudio)

// endpoints 
// use getResources for both audio & image
app.get('/api/get-audio', (req, res) => getResources(req, res, 'video'));
app.get('/api/get-images', (req, res) => getResources(req, res, 'image'));

// use uploadResource for both audio & image
// on Cloudinary, audio files are considered 'video'
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => uploadResource(req, res, 'video'));
app.post('/api/upload-image', upload.single('image'), async (req, res) => uploadResource(req, res, 'image'));

// deleteResource handles both types
app.delete('/api/delete-resource/:resourceType/:id', deleteResource);


const fs = require('fs');
const path = require('path');

app.post('/api/update-tags/:collection', async (req, res) => {
  console.log("hello from backend, /api/update-tags");
  console.log("I have this:", req.body);

  const tagsToAdd = req.body.tags;
  const publicId = req.body.publicId;
  const collectionName = req.params.collection; // Added parameter for collection name
  console.log("publicId:", publicId)
  let resourceType = "image";

  if (collectionName === "users") {
    resourceType = "video"
  } else {
    resourceType = "image"
  }
  
  try {
    // Update tags in Cloudinary
    const cloudinaryResult = await cloudinary.uploader.add_tag(tagsToAdd, publicId, { type: 'upload', resource_type: resourceType });
    console.log("Cloudinary response", cloudinaryResult);

    // Update tags in MongoDB
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const dbName = "music-branches";
    const db = client.db(dbName);
 
    const query = { public_id: publicId };
    const action = {
      $push: {
        tags: { $each: tagsToAdd },
      },
    };
    // Use the collection name parameter to dynamically select the collection
    const mongoResult = await db.collection(collectionName).updateOne(query, action);

    console.log("Mongo result:", mongoResult);
    client.close();

    // Both Cloudinary and MongoDB operations completed successfully
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error('Error updating tags:', error);
    return res.status(500).json({ message: 'Error updating tags' });
  }
});


app.delete('/api/delete-tag/:publicId/:tags/:collection', async (req, res) => {
  console.log("hello from backend, /api/delete-tag");

  const publicId = req.params.publicId;
  const tagsToDelete = req.params.tags;
  const collectionName = req.params.collection; 
  let resourceType = "image";

  if (collectionName === "users") {
    resourceType = "video"
  } else {
    resourceType = "image"
  }

  console.log("publicId:", publicId);
  console.log("tagsToDelete:", tagsToDelete);
  console.log("collectionName:", collectionName);

  try {
    // Update tags in Cloudinary
    const cloudinaryResult = await cloudinary.uploader.remove_tag(tagsToDelete, publicId, { type: 'upload', resource_type: resourceType });
    console.log("Cloudinary response", cloudinaryResult);

    // Update tags in MongoDB
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const dbName = "music-branches";
    const db = client.db(dbName);

    const query = { public_id: publicId };
    const action = {
      $pull: {
        tags: { $in: [tagsToDelete] },
      },
    };

    // Use the collection name parameter to dynamically select the collection
    const mongoResult = await db.collection(collectionName).updateOne(query, action);

    console.log("Mongo result:", mongoResult);
    client.close();

    // Both Cloudinary and MongoDB operations completed successfully
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error('Error deleting tags:', error);
    return res.status(500).json({ message: 'Error deleting tags' });
  }
});

// this endpoint populates the projects dropdown
// data comes from MongoDB.
app.get('/api/get-user-projects', async (req, res) => {
  try {
   
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const dbName = "music-branches";
    const db = client.db(dbName);

    
    const userProjects = await db.collection("users").aggregate([
      {
        $group: {
          _id: "$user",
          projects: {
            $addToSet: "$project", 
          },
        },
      },
    ]).toArray();

    console.log("from get-user-projects, userProjects:", userProjects);
    client.close();

    const userProjectsData = userProjects.reduce((result, item) => {
      result[item._id] = item.projects.map((project, index) => ({
        id: index + 1,
        name: project,
      }));
      return result;
    }, {});

    res.json(userProjectsData);
  } catch (error) {
    // Handle errors and return an error response
    console.error('Error fetching user projects:', error);
    res.status(500).json({ success: false, message: 'Error fetching user projects' });
  }
});


app.get('/api/get-all-tags', async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    const dbName = "music-branches";
    const db = client.db(dbName);
    const user = decodeURIComponent(req.query.user);
    const project = decodeURIComponent(req.query.project);

    const pipeline = [
      {
        $match: {
          user: user,
          project: project,
        },
      },
      {
        $project: {
          tags: 1,
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
        },
      },
      {
        $group: {
          _id: null,
          allTags: { $addToSet: "$_id" },
        },
      },
    ];

    const audioResult = await db.collection("users").aggregate(pipeline).toArray();
    const imageResult = await db.collection("sheets").aggregate(pipeline).toArray();
    const allTags = new Set();

    audioResult[0]?.allTags?.forEach((tag) => {
      allTags.add(tag);
    });

    imageResult[0]?.allTags?.forEach((tag) => {
      allTags.add(tag);
    });

    client.close();

    return res.json(Array.from(allTags));
  } catch (error) {
    console.error('Error fetching all tags:', error);
    return res.status(500).json({ message: 'Error fetching all tags' });
  }
});


app.listen(port, () => {
    console.log(`Server is up and listening at port : ${port}`);
})