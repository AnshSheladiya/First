const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  uploadProductImages,
} = require("../controllers/productController");
const { isAuthenticatedUser ,authorizeRoles} = require("../middleware/auth");
const router = express.Router();

router.route("/").get(getAllProducts);
router.route("/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);
router
  .route("/:id")
  .put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)
  .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct)
  .get(getProductDetails);
router.route("/review").post(isAuthenticatedUser,createProductReview)
router.route("/upload/images/:id").post(isAuthenticatedUser,uploadProductImages)


module.exports = router;
