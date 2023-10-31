const cloudinary = require('cloudinary').v2;
const { MongoClient } = require("mongodb");

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
  

  module.exports = {
    getResources
  };