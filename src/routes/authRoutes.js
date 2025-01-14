const { Router } = require('express');
const authController = require('../controllers/authController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');


const authRouter = Router();

authRouter.post('/signup', validationRules.signupRules(), validationMiddleware, authController.signupController);

authRouter.post('/login', validationRules.loginRules(), validationMiddleware, authController.loginController);


module.exports = authRouter;