const cloudinary = require('cloudinary').v2;
const { MongoClient } = require("mongodb");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


// getResources handles both audio and image collections.
const getResources = async (req, res, resourceType) => {
    console.log(`Fetching ${resourceType} resources`);
    try {
      let publicIds;
      const user = decodeURIComponent(req.query.user);
      const project = decodeURIComponent(req.query.project);
  
      try {
        const client = new MongoClient(MONGO_URI, options);
        await client.connect();
        const dbName = "music-branches";
        const db = client.db(dbName);
        let collectionName;
  
        if (resourceType === 'video') {
          collectionName = 'users';
        } else if (resourceType === 'image') {
          collectionName = 'sheets';
        } else {
          throw new Error('Invalid resource type');
        }
  
        const resources = await db.collection(collectionName)
          .find({ user, project }, { projection: { public_id: 1, _id: 0 } })
          .toArray();
  
        publicIds = resources.map(clip => clip.public_id).join(',');
  
        client.close();
      } catch (err) {
        console.log(`Failed to lookup user/project from MongoDB: ${err.message}`);
      }
  
      if (!publicIds) {
        return res.status(200).json({ message: `No ${resourceType} found for this user/project combination` });
      }
  
      const results = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/${resourceType}?public_ids=${publicIds}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.CLOUDINARY_API_KEY + ':' + process.env.CLOUDINARY_API_SECRET).toString('base64')}`
        }
      }).then(r => r.json());
  
      const tagsArray = await Promise.all(results.resources.map(async (resource) => {
        const result = await cloudinary.api.resource(resource.public_id, { type: 'upload', resource_type: resourceType });
        return result.tags;
    }));
  
      const mergedArray = results.resources.map((item, index) => {
        const tags = tagsArray[index] || [];
        return { ...item, tags };
      });
  
      res.json(mergedArray);
    } catch (error) {
      console.error(`Error fetching ${resourceType} resources: ${error}`);
      res.status(500).json({ success: false, message: `Error fetching ${resourceType} resources` });
    }
  };
  


// uploadResource handles both audio and image uploads.
  const uploadResource = async (req, res, resourceType) => {
    try {
      console.log(`Uploading ${resourceType} from backend, /api/upload-${resourceType}`);
      
      // Common data between audio and image
      const { tags, user, project } = req.body;
  
      let result;
  
      if (resourceType === 'video') {
        // For audio uploads
        const tempFilePath = path.join(__dirname, 'temp_audio.webm');
        fs.writeFileSync(tempFilePath, req.file.buffer);
  
        result = await cloudinary.uploader.upload(tempFilePath, {
          resource_type: 'auto',
          format: 'webm',
          tags: tags,
        });
  
        fs.unlinkSync(tempFilePath);
      } else if (resourceType === 'image') {
        // For image uploads
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
        result = await cloudinary.uploader.upload(dataURI, { tags: tags });
      } else {
        return res.status(500).json({ message: 'Invalid resource type' });
      }
  
      // Common operations for both audio and image
      console.log(`Uploaded to Cloudinary for ${resourceType}:`, result);
  
      // Add user & project key:value pairs to the object
      const updatedResult = {
        ...result,
        user: user,
        project: project,
      };
  
      // Determine the collection name based on the resource type
      const collectionName =
        resourceType === 'video' ? 'users' : resourceType === 'image' ? 'sheets' : null;
  
      if (collectionName) {
        // Add to MongoDB
        const client = new MongoClient(MONGO_URI, options);
        await client.connect();
        const dbName = "music-branches";
        const db = client.db(dbName);
        console.log("hello from attempted mongo");
        const mongoResult = await db.collection(collectionName).insertOne(updatedResult);
        client.close();
        res.status(200).json({
          success: true,
          message: `${resourceType} uploaded successfully`,
          cloudinaryResult: result,
          mongoResult,
        });
      } else {
        return res.status(500).json({ message: 'Invalid resource type' });
      }
    } catch (error) {
      console.error(`Error uploading to Cloudinary for ${resourceType}:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  
  // delete function handles both audio and images.
  const deleteResource = async (req, res) => {

    const resourceType = req.params.resourceType;
    const id = req.params.id;
  
    try {
      const options = '';
  
      // Delete from Cloudinary
      const public_id = id;
      const cloudinaryResult = await cloudinary.uploader.destroy(public_id, {
        type: 'upload',
        resource_type: resourceType,
      });
      console.log('cloudinaryResult:', cloudinaryResult);
  
      // Remove from MongoDB
      const client = new MongoClient(MONGO_URI, options);
  
      try {
        await client.connect();
        const dbName = 'music-branches';
        const db = client.db(dbName);
  
        // Use the resourceType parameter to determine the collection
        const collectionName =
          resourceType === 'video' ? 'users' : 'sheets';
  
        const query = { public_id: id };
        const mongoResult = await db.collection(collectionName).deleteOne(query);
  
        console.log('mongo result:', mongoResult);
        client.close();
  
        // Both Cloudinary and MongoDB operations completed successfully
        return res.status(200).json({ message: 'Success' });
      } catch (err) {
        console.error('Error deleting from MongoDB:', err);
        return res.status(500).json({ message: 'Error deleting from MongoDB' });
      }
    } catch (error) {
      console.error('Error deleting resources:', error);
      return res.status(500).json({ message: 'Error deleting resources' });
    }

  };


  // tag functions
  const getAllTags = async (req, res) => {
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
  }

  module.exports = {
    getResources,
    uploadResource,
    deleteResource,
    getAllTags
  };