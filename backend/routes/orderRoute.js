const express = require('express');
const { newOrder, getOrderDetails, getUserOrder, getAllorders,changeOrderStatus, deleteOrders } = require('../controller/orderController');
const router = express.Router();
const {isAuthenticatedUser, authorizeRole} = require('../middleware/auth');

router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/admin/order/:orderId', isAuthenticatedUser, authorizeRole("admin"), getOrderDetails);
router.get('/myorders', isAuthenticatedUser, getUserOrder);
router.get('/admin/order', isAuthenticatedUser, authorizeRole("admin"), getAllorders);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRole("admin"), changeOrderStatus);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRole("admin"), deleteOrders);



module.exports = router;