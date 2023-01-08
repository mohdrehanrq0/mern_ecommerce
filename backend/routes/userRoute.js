const express = require('express');
const router = express.Router();
const {isAuthenticatedUser, authorizeRole} = require('../middleware/auth');
const { userRegistration, userLogin, logoutUser, forgotPassword, resetPassword, getUserDetails, updateUserPassword, updateUserDetails, getAllUsers, getSingleUser, updateUserProfile, deleteUser } = require('../controller/userController');

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get('/logout', isAuthenticatedUser, logoutUser);
router.put('/password/forget',forgotPassword);
router.put('/password/reset/:token',resetPassword);
router.get('/profile', isAuthenticatedUser, getUserDetails);
router.put('/profile/passwordUpdate', isAuthenticatedUser, updateUserPassword);
router.put('/profile/update', isAuthenticatedUser, updateUserDetails);
router.get('/admin/users', isAuthenticatedUser, authorizeRole("admin"), getAllUsers);
router.get('/admin/users/:id', isAuthenticatedUser, authorizeRole("admin"), getSingleUser);
router.put('/admin/users/update/:id', isAuthenticatedUser, authorizeRole("admin"), updateUserProfile);
router.delete('/admin/users/delete/:id', isAuthenticatedUser, authorizeRole("admin"), deleteUser);

module.exports = router