const cloudinary = require('cloudinary').v2;
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const getAudio =  async (req, res) => { 
    console.log("hello from handlers");
    try {
      let publicIds;
      const user = decodeURIComponent(req.query.user);
      const project = decodeURIComponent(req.query.project);
     
      // look up audio clips from user/project in MongoDB
      // return just the public_Ids of the clips
      try {
        const client = new MongoClient(MONGO_URI, options);
        await client.connect();
        const dbName = "music-branches";
        const db = client.db(dbName);
        const audioClips = await db.collection("users")
        .find({ user, project }, { projection: { public_id: 1, _id: 0 } })
        .toArray();
   
        // create comma-separated strings:
        publicIds = await audioClips.map(clip => clip.public_id).join(',');
        console.log("publicIds:", publicIds);

        client.close();
        //return res.status(201).json({ status: 201, message: "success", mongoResult });
    } catch (err) {
        //res.status(500).json({ status: 500, message: err.message });
        console.log("failed to lookup user/project from mongo");
    }

    
    if (!publicIds) {
      // Return a response indicating no clips were found
      return res.status(200).json({ message: 'No clips found for this user/project combination' });

    }
    
      // const results = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/video/`, {
        const results = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/video?public_ids=${publicIds}`, {

        headers: {
          Authorization: `Basic ${Buffer.from(process.env.CLOUDINARY_API_KEY + ':' + process.env.CLOUDINARY_API_SECRET).toString('base64')}`
        }
      }).then(r => r.json());

      // need second lookup for tags
      const tagsArray = await Promise.all(results.resources.map(async (resource) => {
        const result = await cloudinary.api.resource(resource.public_id, { type: 'upload', resource_type: 'video' });
        return result.tags;
      }));

      // merge tags with main array before returning
      const mergedArray = results.resources.map((item, index) => {
        const tags = tagsArray[index] || [];
        return { ...item, tags };
      });
      
      // res.json(results.resources);
      res.json(mergedArray);
    } catch (error) {
      console.error('Error fetching audio resources:', error);
      res.status(500).json({ success: false, message: 'Error fetching audio resources' });
    }
  };


  module.exports = {
    getAudio
  };