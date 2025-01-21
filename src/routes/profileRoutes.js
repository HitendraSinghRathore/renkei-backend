const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');


const profileRouter = Router();

profileRouter.get('/',authMiddleware, profileController.getProfileDetails);

profileRouter.put('/', authMiddleware, validationRules.profileUpdateRules(), validationMiddleware, profileController.updateProfileDetails);


module.exports = profileRouter;