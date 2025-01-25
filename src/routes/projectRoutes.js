const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');
const validationRules = require('../utils/validationRules');
const validationMiddleware = require('../middlewares/validationMiddleware');
const accessMiddleware = require('../middlewares/projectAccessmiddleware');
const { ACESSS_CONSTANTS } = require('../utils/constants');
const project = require('../models/project');

const projectRouter = Router();
projectRouter.use(authMiddleware);

projectRouter.get('/', validationRules.projectFetchRules(), validationMiddleware, projectController.getProjects);

projectRouter.post('/create', validationRules.projectCreateRules(), validationMiddleware, projectController.createProject);

projectRouter.get('/:projectId',accessMiddleware(ACESSS_CONSTANTS.READ), projectController.getProject );

projectRouter.get('/:projectId/members', accessMiddleware(ACESSS_CONSTANTS.OWNER), projectController.getAllMembers);

projectRouter.put('/:projectId',accessMiddleware(ACESSS_CONSTANTS.WRITE),validationRules.projectUpdateRules(),validationMiddleware, projectController.updateProject);

projectRouter.post('/:projectId/share',accessMiddleware(ACESSS_CONSTANTS.OWNER),validationRules.projectShareRules(),validationMiddleware,  projectController.shareProject );

projectRouter.delete('/:projectId',accessMiddleware(ACESSS_CONSTANTS.OWNER), projectController.deleteProject);

module.exports = projectRouter;