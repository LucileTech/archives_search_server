const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const Order = require("../models/Order.model");

// Get all orders of current user
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/orders", protectRoute, async (req, res, next) => {
  try {
  const allArchives = await Order.find({
    userId: req.currentUser.id,
    date: { $exists: true },
  });
  res.status(200).json(allArchives);
} catch(error) {
  next(error)
}
});

// Get an orderCart if order without date exists
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/orderCart", protectRoute, async (req, res, next) => {
  try {
  const orderCart = await Order.findOne({
    userId: req.currentUser.id,
    date: { $exists: false },
  }).populate('archives.productId')
  
  res.status(200).json(orderCart);
} catch(error) {
  next(error)
}
});

// Add one archive to OrderCart
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource

router.post(
  "/archives/:id/addtocart",
  protectRoute,
  async (req, res, next) => {
    try {
      
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });

      // if an order without date has been find, the user already has a cart ! 
      if (order) {
        let updated = false;
        order.archives.forEach((archive) => {
          if (archive.productId.toString() === req.params.id) {
            archive.quantity++;
            updated = true;
          }
        });
        if (!updated) {
          order.archives.push({
            productId: req.params.id,
            quantity: 1,
          });
        }
        await order.save();

        // if the current user does not have an order without date we create one
      } else {
        const newOrder = await Order.create({
          userId: req.currentUser.id,
          archives: [
            {
              productId: req.params.id,
              quantity: 1,
            },
          ],
        });
        return res.status(201).json(newOrder);
      }

      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Delete one archive in order
// HTTP 202 Accepted

router.patch("/orderCart/:id", protectRoute, async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: req.currentUser.id,
        date: { $exists: false },
      },
      {
        $pull: { archives: { productId: id } },
      },
      {
        new: true,
      }
    ).populate("archives.productId")

    res.status(202).json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// Delete the entire cart order
// HTTP 204 No Content success status response code indicates that a request has succeeded, but that the client doesn't need to navigate away from its current page

router.delete("/orderCart/delete", protectRoute, async (req, res, next) => {
  try {
    let orderDeleted = await Order.findOneAndDelete({
      userId: req.currentUser.id,
      date: { $exists: false },
    });
    res.status(204).json(orderDeleted);
  } catch (error) {
    next(error);
  }
});

// Add an amount of archive in cart
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource
router.patch(
  "/orderCart/increment/:archiveId",
  protectRoute,
  async (req, res, next) => {
    try {
      // search for an order without date
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });
      if (order) {
        let updated = false;
        order.archives.forEach((archive) => {
          if (archive.productId.toString() === req.params.archiveId) {
            archive.quantity++;
            updated = true;
          }
        });
        await order.save();
      }
      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Remove an amount of archive in cart
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the archive of a resource

router.patch(
  "/orderCart/decrement/:archiveId",
  protectRoute,
  async (req, res, next) => {
    try {
      
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });
      if (order) {
        let updated = false;
        order.archives.forEach((archive) => {
          if (archive.productId.toString() === req.params.archiveId) {
            if (archive.quantity > 0) {
              archive.quantity--;
              updated = true;
            }
            if (archive.quantity === 0) {
              order.archives.splice(order.archives.indexOf(archive), 1);
            }
          }
        });
        await order.save();
      }
      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Buy an Ordercart // add date
// The HyperText Transfer Protocol (HTTP) 202 Accepted response status code indicates that the request has been accepted for processing

router.put("/orderCart/buy", protectRoute, async (req, res, next) => {
  try {
    const findOrder = await Order.findOne({
      userId: req.currentUser.id,
      date: { $exists: false },
    });
    findOrder.date = new Date();
    await findOrder.save();
    res.status(202).json(findOrder);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
