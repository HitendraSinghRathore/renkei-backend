const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');

const projectRouter = Router();
projectRouter.use(authMiddleware);

projectRouter.get('/getProjects', validationRules.projectFetchRules(), validationMiddleware, projectController.getProjects);


module.exports = projectRouter;