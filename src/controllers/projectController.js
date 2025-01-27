const { default: mongoose } = require('mongoose');
const Project = require('../models/project');
const User = require('../models/user');
const { ACESSS_CONSTANTS, SOCKET_EVENTS } = require('../utils/constants');
const { getIO } = require('../socket');

async function getProjects(req, res, next) {
  console.log('Searching projects');
  const { name, status, page, limit } = req.query;
  const currentPage = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;
  try {
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (status) {
      if (status === 'owned') {
        query.owner = req.user.id;
      } else if (status === 'shared') {
        query['collaborators.user'] = req.user.id;
      }
    } else {
      query.$or = [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id },
      ];
    }
    console.log(`Query created for lookup ${query}`);
    const [totalCount, projectsList] = await Promise.all([
      Project.countDocuments(query),
      Project.find(query)
        .sort({ updatedAt: -1 })
        .populate('owner', 'name')
        .select('_id name createdAt updatedAt owner collaborators')
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),
    ]);
    const totalPages = Math.ceil(totalCount / pageLimit);

    const formattedProjects = projectsList.map((project) => {
      let access = ACESSS_CONSTANTS.READ;
      if (project.owner._id.toString() === req.user.id.toString()) {
        access = ACESSS_CONSTANTS.WRITE;
      } else {
        const collab = project.collaborators.find(
          (collab) => collab.user.toString() === req.user.id.toString()
        );
        if (collab) {
          access = collab.access;
        }
      }
      return {
        id: project._id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: { 
          id: project.owner._id.toString(), 
          name: project.owner.name },
        access,
      };
    });
    res.status(200).json({
      items: formattedProjects || [],
      pageItems: {
        page: currentPage,
        limit: pageLimit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('Error occured in getProjects controller');
    next(err);
  }
}

async function createProject(req, res, next) {
  console.log('Creating new project');
  try {
    const { name, content } = req.body;
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({
        msg: 'Project already exists',
      });
    }

    const newProject = new Project({
      name,
      content,
      owner: req.user.id,
      collaborators: [],
    });
    await newProject.save();

    const createdProject = newProject.toObject();
    createdProject.id = createdProject._id;
    delete createdProject._id;
    delete createdProject.__v;

    console.log('Project created successfully');
    res.status(201).json({
      msg: 'Project created successfully',
      data: createdProject,
    });
  } catch (err) {
    console.error('Error occured in createProject controller');
    next(err);
  }
}

async function getProject(req, res, next) {
    console.log('Fetching project details');
    try {
        const project = req.project;
        if(!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        const projectDetails = {
            id: project._id,
            name: project.name,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            content: project.content
        };
        console.log('Project details fetched successfully');
        return res.status(200).json({  data: projectDetails });
    } catch(err) {
        console.error('Error occured in getProject controller');
        next(err);
    }
}

async function getAllMembers(req, res, next) {
  console.log('Fetching project members');
  try {
    const ownerId = req.project.owner.toString();
    const collaborators = req.project.collaborators;
    const allUsers = await User.find({}, '_id name email').lean();
    const projectMembers =  allUsers.filter(u => u._id.toString() !== ownerId).map(function(item) {
      
        const collab = collaborators.find((collab) => collab.user.toString() === item._id.toString());
        if(collab) {
          return {
            id: item._id.toString(),
            name: item.name,
            email: item.email,
            access: collab.access
          };
        }
        return {
          id: item._id.toString(),
          name: item.name,
          email: item.email,
          access: null
        };
    });
    console.log('Project members fetched successfully');
    return res.status(200).json({  data: projectMembers });
  } catch(err) {
    console.error('Error occured in getProjectMembers controller');
    next(err);
  }
}

async function updateProject(req, res, next) {
  console.log('Updating project');
  try {
    const project = req.project;
    const { name, content } = req.body;

    const socketId = req.headers['x-socket-id'];
    if(name) {
      const exitingProject = await Project.findOne({name });
      if(exitingProject && exitingProject._id.toString() !== project._id.toString()) {
        return res.status(400).json({ msg: 'Please provide a different project name' });
      }
      project.name = name;
  }
  if(content) {
    project.content = content;
  }
  await project.save();
  const projectData = {
    id: project._id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    content: project.content
  };
  console.log('Project updated successfully');
  const io = getIO();
  const roomName = `project:${project._id.toString()}`;

  if (socketId) {
    io.to(roomName).except(socketId).emit(SOCKET_EVENTS.UPDATE_PROJECT, {
      projectId: project._id.toString(),
    });
  } else {
    io.to(roomName).emit(SOCKET_EVENTS.UPDATE_PROJECT, {
      projectId: project._id.toString(),
    });
  }

  return res.status(200).json({ msg: 'Project updated successfully',  data: projectData });
  } catch(err) {
    console.error('Error occured in updateProject controller');
    next(err);
  }
}

async function shareProject(req, res, next) {
  console.log('Sharing project route called');
  try {
    const project = req.project;
    const { users } = req.body;
    const ids = users.map(u => u.id);
    // check if all users are unique
    if (ids.length !== new Set(ids).size) {
      return res.status(400).json({ msg: 'Duplicate user ids provided' });
    }
    const foundUsers = await User.find({ _id: { $in: ids } });
    if (foundUsers.length !== ids.length) {
      return res.status(400).json({ msg: 'Invalid user ids provided' });
    }
    // check if user is owner
    if(ids.includes(project.owner.toString())) {
      return res.status(400).json({ msg: 'Owner cannot be a collaborator' });
    }
    
    project.collaborators = users.map(user => {
      return {
        user: mongoose.Types.ObjectId(user.id),
        access: user.access
      };
    });
   
    await project.save();
    console.log('Project shared successfully');
    // socket events emitted
    const io = getIO();
    const roomName = `project:${project._id.toString()}`;
    const allSockets = await io.in(roomName).allSockets();
    const validUserIds = new Set([project.owner.toString(), ...ids]);
    for (const sid of allSockets) {
      const s = io.sockets.sockets.get(sid);
      if (s && s.user) {
        const userId = s.user.id;
        if (!validUserIds.has(userId)) {
          s.emit(SOCKET_EVENTS.KICKED_OUT, { projectId: project._id, reason: 'Access revoked' });
          s.leave(roomName);

        }
      }
    }
    // re emit the active users
    const updatedSocketIds = await io.in(roomName).allSockets();
    const updatedActiveUsers = [];
    const uniqueUsers = new Set();
    for (const sid of updatedSocketIds) {
      const s = io.sockets.sockets.get(sid);
      if (s && s.user) {
        if (!uniqueUsers.has(s.user.id)) {
          uniqueUsers.add(s.user.id);
          updatedActiveUsers.push({
            id: s.user.id,
            name: s.user.name,
            email: s.user.email
          });
        }
      }
    }
    io.to(roomName).emit(SOCKET_EVENTS.ACTIVE_USERS, updatedActiveUsers);

    return res.status(200).json({ msg: 'Project shared successfully' });
  } catch(err) {
    console.error('Error occured in shareProject controller');
    next(err);
  }
}

async function deleteProject(req, res, next) {
  console.log('Deleting project route called');
  try {
    const project = req.project;
    await project.remove();

    const projectId = project._id.toString();
    const io = getIO();
    const roomName = `project:${projectId}`;
    io.to(roomName).emit(SOCKET_EVENTS.DELETE_PROJECT, { projectId });
    const socketIds = await io.in(roomName).allSockets();
    for (const sid of socketIds) {
      const s = io.sockets.sockets.get(sid);
      if (s) {
        s.leave(roomName); 
      }
    }
    console.log('Project deleted successfully');
    return res.status(200).json({ msg: 'Project deleted successfully' });
  } catch(err) {
    console.error('Error occured in deleteProject controller');
    next(err);
  }
}
module.exports = {
  getProjects,
  createProject,
  getProject,
  getAllMembers,
  updateProject,
  shareProject,
  deleteProject
};
