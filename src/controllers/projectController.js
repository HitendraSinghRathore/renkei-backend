const Project = require('../models/project');
const User = require('../models/user');

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
      let access = 'read';
      if (project.owner._id.toString() === req.user.id.toString()) {
        access = 'write';
      } else {
        const collab = project.collaborators.find(
          (collab) => collab.user._id.toString() === req.user.id.toString()
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
        owner: project.owner.name,
        access,
      };
    });
    if (formattedProjects.length > 0) {
      res.status(200).json({
        items: formattedProjects,
        pageItems: {
          page: currentPage,
          limit: pageLimit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } else {
      res.status(200).json({
        items: [],
        pageItems: {
          page: currentPage,
          limit: pageLimit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    }
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
            return res.status(400).json({ msg: 'Project not found' });
        }
        const projectDetails = project.toObject();
        projectDetails.id = project._id;

        delete projectDetails.__v;
        delete projectDetails._id;
        delete projectDetails.owner;
        delete projectDetails.collaborators;

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
            id: item._id,
            name: item.name,
            email: item.email,
            access: collab.access
          };
        }
        return {
          id: item._id,
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
module.exports = {
  getProjects,
  createProject,
  getProject,
  getAllMembers
};
