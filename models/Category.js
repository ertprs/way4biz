const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema({
  category: {
    main: {
      type: String,
      required: true
    },
    subcategories: {
      type: [String],
      required: true
    }
  }
});
const Category = mongoose.model("Category", CategoriesSchema);
module.exports = Category;