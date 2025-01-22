const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');
const accessMiddleware = require('../middlewares/projectAccessmiddleware');

const projectRouter = Router();
projectRouter.use(authMiddleware);

projectRouter.get('/', validationRules.projectFetchRules(), validationMiddleware, projectController.getProjects);

projectRouter.post('/create', validationRules.projectCreateRules(), validationMiddleware, projectController.createProject);

projectRouter.get('/:projectId',accessMiddleware('read'), projectController.getProject );

projectRouter.get('/:projectId/members', accessMiddleware('owner'), projectController.getAllMembers);

module.exports = projectRouter;