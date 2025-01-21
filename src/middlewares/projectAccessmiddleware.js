const mongoose = require('mongoose');
const Project = require('../models/project');

function accessMiddleware(access) {
    return async function(req,res,next) {
        try {
            const { projectId } = req.params;
            if(!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({msg: 'Invalid project id provided'});
            }
            const project = await Project.findById(projectId);
            if(!project) {
                return res.status(400).json({msg: 'Project not found for the give id'});
            }
            const userId = req.user.id.toString();
            const ownerId = project.owner.toString();
            let hasAccess = false;

            if(ownerId === userId) {
                hasAccess = true;
            } else {
                const collaborator = project.collaborators.find((collab) => collab.user.toString() === userId );
                if(collaborator) {
                    // check if collborator access is write and required access is either read or write
                    if(collaborator.access === 'write' && ['write', 'read'].includes(access) ) {
                        hasAccess = true;
                    } else if(collaborator.access === 'read' && access === 'read' ) {
                        hasAccess = true;
                    }
                }
            }
            if(!hasAccess) {
                return res.status(403).status({msg: 'User does not have required permission to perform this operation'});
            }
            req.project = project;
            next();
        } catch(err) {
            console.error('Error while authticating user access level');
            next(err);
        }
    };
}

module.exports = accessMiddleware;