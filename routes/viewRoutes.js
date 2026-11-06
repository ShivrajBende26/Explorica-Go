const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tours', authController.isLoggedIn, viewsController.getTours);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/events', authController.isLoggedIn, viewsController.getEvents);
router.get('/events/:slug', authController.isLoggedIn, viewsController.getEvent);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get(
  '/forgot-password',
  authController.isLoggedIn,
  viewsController.getForgotPasswordForm
);
router.get(
  '/reset-password/:token',
  authController.isLoggedIn,
  viewsController.getPasswordResetForm
);
router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
