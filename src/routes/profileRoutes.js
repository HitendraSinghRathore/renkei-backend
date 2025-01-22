const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');


const profileRouter = Router();
profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.getProfileDetails);

profileRouter.put('/', validationRules.profileUpdateRules(), validationMiddleware, profileController.updateProfileDetails);


module.exports = profileRouter;