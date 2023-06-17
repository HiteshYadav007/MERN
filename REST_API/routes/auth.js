const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

router.put('/signup',[
	body('email')
		.isEmail()
		.trim()
		.withMessage('Please Enter a valid email')
		.custom((value,{req})=>{
			return User.findOne({email:value})
						.then(userDoc => {
							if(userDoc){
								return new Promise.reject('Email address already exists');
							}
						})
		})
		.normalizeEmail(),
	body('password')
		.trim()
		.isLength({min:6}),
	body('name')
		.trim()
		.not()
		.isEmpty()
	],
	authController.signup
);


router.post('/login',authController.login);

router.get('/status',isAuth,authController.getUserStatus);

router.patch('/status',isAuth,[
	body('status')
		.trim()
		.notEmpty()	
	],authController.updateUserStatus);


module.exports = router;