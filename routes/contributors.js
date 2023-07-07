const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Contributor = require("../models/Contributor.model");
const Archive = require("../models/Archive.model");
const isContributor = require("../middlewares/isContributor");

// Get all contributors
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/contributors", async (req, res, next) => {
  try {
  const allContributors = await Contributor.find();
  res.status(200).json(allContributors);
} catch (error) {
  next(error);
}
});

// Get one contributor
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/contributors/:id", async (req, res, next) => {
  try {
  const oneContributor = await Contributor.findById(req.params.id);
  res.status(200).json(oneContributor);
} catch (error) {
  next(error);
}
});

// Get my contributor
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/mycontributor", protectRoute, isContributor, async (req, res, next) => {
  try {
  const myContributor = await Contributor.findOne({
    user: req.currentUser.id,
  });
  res.status(200).json(myContributor);
} catch (error) {
  next(error);
}
});

// Create an contributor

router.post(
  "/contributors/form",
  uploader.single("picture"),
  protectRoute, isContributor,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
// check if the current user has an contributor page already
    const contributorExists = await Contributor.findOne({
      user: req.currentUser.id,
    });
//  if the current user has an contributor page already it can't create a new one : (HTTP) 401 Unauthorized
    if (contributorExists) {
      console.log("One contributor already exists");
      return res.status(401).json({message: 'One contributor already exist'});
    }
  try {
// check if the user as put somathing in all the field
    for (const key in req.body) {
      if (!req.body[key] || req.body[key] === 'undefined') {
        return res.status(400).json({message:"All field required"})
      }
    }
// create a new contributor
    const contributor = await Contributor.create({
      name,
      description,
      picture,
      user: req.currentUser.id,
    });
// If there's no contributor page yet  : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource
    res.status(201).json(contributor);
  }
  catch(error) {
    next(error)
  }
  }
);

// Update an contributor
// (HTTP) 401 Unauthorized
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource

router.patch(
  "/myContributor/update",
  uploader.single("picture"),
  protectRoute, isContributor,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
// check if an contributor page exists for the current user
    const contributorExists = await Contributor.findOne({
      user: req.currentUser.id,
    });
// if there is no contributor page the user can't update 
    if (!contributorExists) {
      console.log("No contributor created yet");
      return res.status(401).json({});
    }
// Find the contributor page with the user id and update it
    try {
    const filter = { user: req.currentUser.id };
    const update = { name, description, picture };

    let myNewContributor = await Contributor.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(201).json(myNewContributor);
    }
    catch(error) {
      next(error)
    }
  }
);

// Find the contributors page with the current user id and Delete an contributor

router.delete("/myContributor/delete", protectRoute, isContributor, async (req, res, next) => {
  try {
    let contributorDeleted = await Contributor.findOneAndDelete({
      user: req.currentUser.id,
    });

    // delete all the archives related to the contributor page just deleted
    let contributorsArchivesDeleted = await Archive.deleteMany({ 
      user: req.currentUser.id,
    });
    // HTTP 204 No Content
    res.status(204).json(contributorDeleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
