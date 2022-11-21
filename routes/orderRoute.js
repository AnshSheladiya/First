const express=require("express");
const { newOrder, getSingleOrder, getAllOrders, myOrders, updateOrder, deleteOrder } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router=express.Router();
router.route("/new").post(isAuthenticatedUser,newOrder);
router.route("/single/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleOrder);
router.route("/me").get(isAuthenticatedUser,myOrders);
router.route("/").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);
router.route("/admin/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)
module.exports=router;