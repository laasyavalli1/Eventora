const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP, googleLogin
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleLogin);
module.exports = router;