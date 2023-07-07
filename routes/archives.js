const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Contributor = require("../models/Contributor.model");
const Archive = require("../models/Archive.model");
const isContributor = require("../middlewares/isContributor");

// Get all archives
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/archives", async (req, res, next) => {
  try {
  const allArchives = await Archive.find();
  res.status(200).json(allArchives);
} catch(error) {
  next(error)
}
});

// Get one archive
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/archives/:id", async (req, res, next) => {
  try {
  const oneArchive = await Archive.findById(req.params.id);
  res.status(200).json(oneArchive);
} catch(error) {
  next(error)
}
});

//Get archives of one contributor
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/contributors/:id/archives", async (req, res, next) => {
  try {
  const someArchives = await Archive.find({
    contributorId: req.params.id,
  });
  res.status(200).json(someArchives);
} catch(error) {
  next(error)
}
});

// Create a archive
// If there's no contributor page yet : (HTTP) 401 Unauthorized
// If there is : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource

router.post(
  "/archives/form",
  uploader.single("img"),
  protectRoute, isContributor,
  async (req, res, next) => {
    // Check the request body of the front
    const { title, description, categories, price, user } = req.body;
    let img;
    if (req.file) {
      img = req.file.path;
    }
    // Find the contributor connected thanks to the user id
    const contributorLinked = await Contributor.findOne({
      user: req.currentUser.id,
    });
    // if there is no contributor page for the current user it can't create a archive
    if (!contributorLinked) {
      console.log("Create contributor page first");
      return res.status(401).json({});
    }

    try {
  // if there is an contributor linked to the current user and all field are field, the archive is created
    if (contributorLinked) {

      for (const key in req.body) {
        if (!req.body[key] || req.body[key] === 'undefined') {
          return res.status(400).json({message:"All field required"})
        }
      }

      const archive = await Archive.create({
        title,
        description,
        img,
        categories,
        price,
        user: req.currentUser.id,
        contributorId: contributorLinked._id,
      });
      res.status(201).json(archive);
    }
  } catch(error) {
    next(error)
  }
  }
);

// Get archives created with the current user id
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/myarchives", protectRoute, isContributor, async (req, res, next) => {
  try {

  const myArchives = await Archive.find({
    user: req.currentUser.id,
  });
  res.status(200).json(myArchives);
} catch(error) {
  next(error)
}
});


// Update archive
// If there is : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource

router.patch("/myArchive/:id/update", uploader.single("img"),
protectRoute, isContributor,
async (req, res, next) => {
  try {

  const { title, description, categories, price } = req.body;
  let img;
  if (req.file) {
    img = req.file.path;
  }

  // all fields of the updated part
  const update = { 
    title,
      description,
      img,
      categories,
      price,
  };

  let myNewArchive = await Archive.findByIdAndUpdate(
    { _id: req.params.id }, 
    update, 
    {new: true}
    );
    
    res.status(201).json(myNewArchive);
  } catch(error) {
    next(error)
  }
});


//Delete archive of your contributor
// HTTP 204 No Content success status response code indicates that a request has succeeded, but that the client doesn't need to navigate away from its current page

router.delete("/archiveinprofile/:id/delete", protectRoute, isContributor, async (req, res, next) => {
  try {
  const myDeletedArchive = await Archive.findOneAndDelete(
    { _id: req.params.id },
  );
  res.status(204).json(myDeletedArchive);
} catch (error) {
  next(error);
}
});

module.exports = router;
