const route = require("express").Router();
const { check, validationResult } = require("express-validator");
const distance = require("google-distance-matrix");

const Product = require("../models/Product");
const auth = require("../middlewares/is-auth");
const Order = require("../models/Order");
const delivery = require("../middlewares/delivery");
const Review = require("../models/Reviews");
const Distance = require("../models/Distance");

route.post("/api/products", async (req, res) => {
  try {
    const { itemsToSkip } = req.body;
    const products = await Product.find()
      .skip(itemsToSkip)
      .limit(6)
      .populate("seller", "storeName")
      .exec();
    const productCount = await Product.estimatedDocumentCount();
    res.send({ products, productCount });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post("/api/products/skip/category", async (req, res) => {
  try {
    const { itemsToSkip, test, sort } = req.body;

    const products = await Product.find(test)
      .sort(sort)
      .skip(itemsToSkip)
      .limit(6);
    if (!products || products.length === 0) {
      return res.status(404).send({ message: "No products in that category" });
    }

    const productCount = await Product.aggregate([
      {
        $match: test
      },
      { $count: test.category }
    ]);

    res.send({ products, productCount: productCount[0][test.category] });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post("/api/products/filter", async (req, res) => {
  try {
    // const { category } = req.params;
    const { test } = req.body;
    // **TODO** RATING FREE SHIPPING SORT BY
    // **TODO** FIX FILTERING
    // FREE SHIPPING RATING LATEST ON

    let products = await Product.find(test);
    // if (freeShipping === "on") {
    //   products = products.filter(product => product.freeShipping === true);
    // }
    // if (rating === "on") {
    //   products = products.filter(product => product.rating >= 4);
    // }
    // const compare = (a, b) => {
    //   if (a.createdAt > b.createdAt) {
    //     return -1;
    //   }
    //   if (b.createdAt > a.createdAt) {
    //     return 1;
    //   }
    //   return 0;
    // };
    // if (latest === "on") {
    //   products.sort(compare);
    // }
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(
  "/api/products/category/subcategory/:subcategory",
  async (req, res) => {
    try {
      const { subcategory } = req.params;
      const products = await Product.find({ subcategory });
      if (!products || products.length === 0) {
        return res
          .status(404)
          .send({ message: "No products in that subcategory" });
      }
      res.send(products);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post("/api/products/category/:subcategory", async (req, res) => {
  try {
    const { subcategory } = req.params;
    const { min, max, sortBy } = req.body;
    // **TODO** RATING FREE SHIPPING SORT BY
    if (min) {
      const products = await Product.find({
        subcategory,
        price: { $gte: min }
      }).sort(sortBy);
      return res.send(products);
    }
    if (max) {
      const products = await Product.find({
        subcategory,
        price: { $lte: max }
      }).sort(sortBy);
      return res.send(products);
    }
    if (min && max) {
      const products = await Product.find({
        subcategory,
        price: { $gte: min, $lte: max }
      }).sort(sortBy);
      return res.send(products);
    }
    const products = await Product.find({ subcategory }).sort(sortBy);
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post("/api/product/search", async (req, res) => {
  try {
    const { searchTerm } = req.body;
    // const product = await Product.find(
    //   {
    //     name: { $regex: searchTerm, $options: "i" }
    //   },
    //   "name"
    // );
    const test = await Product.aggregate([
      {
        $search: {
          autocomplete: {
            path: "name",
            query: searchTerm
          }
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          imageUrl: 1,
          price: 1
        }
      }
    ]);
    res.send(test);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate(
      "seller",
      "storeName"
    );

    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

// BUYER ORDERS
route.get("/api/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.user._id }).sort({
      createdAt: -1
    });
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/checkout", auth, (req, res) => {
  try {
    const { firstName, lastName, number } = req.session.user;
    if (!number) {
      return res.send({ firstName, lastName });
    }
    res.send({ firstName, lastName, number });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/api/checkout",
  auth,
  check("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please enter your name with a minimum of three characters"),
  check("lastName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please enter your name with a minimum of three characters"),
  check("number")
    .isNumeric()
    .isLength({ min: 12 })
    .withMessage("Invalid Number"),
  check("deliveryAddress")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Please enter a valid delivery address"),
  check("city").trim().isLength({ min: 2 }).withMessage("Choose a valid city"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const {
        firstName,
        lastName,
        number,
        deliveryAddress,
        region,
        city
      } = req.body;
      // CALCULATE DISTANCE AND DISTANCE CHARGES BASED ON REGION/CITY AND INCLUDE IT IN THE REQ.DELIVERY
      req.delivery = {
        firstName,
        lastName,
        number,
        deliveryAddress,
        region,
        city
      };
      res.send({ price: 50000 });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post(
  "/api/checkout/payment",
  auth,
  delivery,
  check("paymentMethod")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Please check your payment method"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const {
        firstName,
        lastName,
        number,
        deliveryAddress,
        region,
        city
      } = req.delivery;
      const { paymentMethod } = req.body;
      const order = new Order({
        firstName,
        lastName,
        number,
        deliveryAddress,
        region,
        city,
        paymentMethod
      });
      await order.save();
      res.status(201).send(order);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post("/api/new/order", auth, check(""), async (req, res) => {
  try {
    const { formValues, cart } = req.body;
    const { _id } = req.session.user;
    const test = cart.map(item => {
      return {
        product: item._id,
        quantity: item.quantity
      };
    });
    cart.forEach(async item => {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stockQuantity: -item.quantity }
      });
    });
    const price = cart
      .map(item => item.price)
      .reduce((acc, curr) => acc + curr, 0);
    const order = new Order({
      items: test,
      paymentMethod: formValues.payment,
      totalPrice: price,
      buyer: _id
    });
    await order.save();

    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// CREATE PRODUCT INDEX
route.get("/api/products/find/categories", async (req, res) => {
  try {
    // await Product.find().distinct("category", (err, uniqueCategories) => {
    //   if (err) return res.send(err);
    //   res.send(uniqueCategories);
    // });
    const category = await Product.aggregate([
      { $group: { _id: "$category" } },
      { $limit: 9 },
      { $sort: { _id: 1 } }
    ]);
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/fetch/all/categories", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: { _id: "$category" }
      },
      { $sort: { _id: 1 } }
    ]);
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/buyer/order/details/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .exec();
    if (!order) {
      return res.status(404).send({ message: "No order with that Id" });
    }
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
// FIX FETCH ALL REVIEWS FOR A CERTAIN PRODUCT  WHICH SHOULD APPEAR ON THE PRODUCT
route.get("/api/product/reviews/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user")
      .populate("userSeller")
      .sort({ createdAt: -1 });
    res.send(reviews);
  } catch (error) {
    res.status(500).send(error);
  }
});

// CHECK ON ORDERS FOR LOGGED IN USER WHERE REVIEWED===FALSE
route.get("/api/pending/reviews", auth, async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { buyer: req.session.user._id, delivered: true } },
      // { $project: { buyer: 1, delivered: 1, items: 1 } },
      {
        $project: {
          items: {
            $filter: {
              input: "$items",
              as: "i",
              cond: { $eq: ["$$i.reviewed", false] }
            }
          }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      {
        $unwind: "$productData"
      },
      {
        $group: {
          _id: "$_id",
          items: {
            $push: "$items"
          },
          productData: {
            $push: "$productData"
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});
// ADD A NEW REVIEW
route.post(
  "/api/new/review/:productId/:orderId",
  auth,
  check("title")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Please enter a valid title"),
  check("body")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Please enter a valid body"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send(errors.array()[0].msg);
      }
      const { title, body, rating } = req.body;
      const { orderId, productId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        buyer: req.session.user._id,
        items: { $elemMatch: { reviewed: false, product: productId } }
      });
      if (!order) {
        return res.status(404).send({ message: "No order with that ID" });
      }
      const review = new Review({
        title,
        body,
        user: req.session.user._id,
        userSeller: req.session.user._id,
        order: orderId,
        product: productId,
        rating
      });
      await review.save();
      await Order.findOneAndUpdate(
        { "items.product": productId, _id: orderId },
        { $set: { "items.$.reviewed": true } }
      );
      const product = await Product.findById(productId);
      const reviews = await Review.find({ product: productId });
      product.rating = Math.round(
        reviews.map(order => order.rating).reduce((acc, cur) => acc + cur, 0) /
          reviews.length
      );
      await product.save();
      res.send(review);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.get("/api/url/add/review/:productId/:orderId", auth, async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    const order = await Order.findOne({
      _id: orderId,
      buyer: req.session.user._id,
      items: { $elemMatch: { reviewed: false, product: productId } }
    });
    res.send({ order });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/api/buyer/destination",
  auth,
  check("origins").not().isEmpty().withMessage("You must enter the origin"),
  check("destination")
    .not()
    .isEmpty()
    .withMessage("You must enter the destination"),
  (req, res) => {
    const { _id } = req.session.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).send({ message: errors.array()[0].msg });
    }
    const { origins, destination } = req.body;
    // const origins = ["nairobi"];
    // const destination = ["mombasa"];
    // 1KM===3KSH
    const mode = "DRIVING";
    distance.key(process.env.MATRIX);
    distance.matrix(origins, destination, mode, async (err, response) => {
      if (err) {
        return res.status(404).send(err);
      }
      const distanceExists = await Distance.findOne({
        destination: response.destination_addresses[0],
        distance: response.rows[0].elements[0].distance.value,
        shippingFees: (response.rows[0].elements[0].distance.value / 1000) * 3,
        buyer: _id
      });
      if (!distanceExists) {
        const dist = new Distance({
          destination: response.destination_addresses[0],
          distance: response.rows[0].elements[0].distance.value,
          shippingFees:
            (response.rows[0].elements[0].distance.value / 1000) * 3,
          buyer: _id
        });
        await dist.save();
        return res.send(dist);
      }
      res.send(distanceExists);
    });
  }
);
route.get("/api/current_user/hey", (req, res) => {
  res.send({ message: "Hey there" });
});

module.exports = route;
