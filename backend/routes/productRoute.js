const express = require('express');
const { getAllProducts, createProduct, updateProducts, deleteProduct, getProductDetails, getProductReview, deleteReview, getAllReview } = require('../controller/productController');
const {isAuthenticatedUser, authorizeRole} = require('../middleware/auth');

const router = express.Router();

router.route('/product').get(getAllProducts);
router.post('/admin/product/new',isAuthenticatedUser, authorizeRole("admin"), createProduct);
router.put('/admin/product/:id',isAuthenticatedUser, authorizeRole("admin"), updateProducts);
router.delete('/admin/product/:id',isAuthenticatedUser, authorizeRole("admin"), deleteProduct);
router.get('/product/:id',getProductDetails);
router.post('/product/review',isAuthenticatedUser, getProductReview);
router.get('/product/review/delete',isAuthenticatedUser, authorizeRole("admin"), deleteReview);
router.get('/product/review/:productId',isAuthenticatedUser, authorizeRole("admin"), getAllReview);


module.exports = router;