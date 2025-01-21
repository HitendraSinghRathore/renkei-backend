const Project = require("../models/project");

async function getProjects(req, res, next) {
  console.log("Searching projects");
  const { name, status, page, limit } = req.query;
  const currentPage = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;
  try {
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (status) {
      if (status === "owned") {
        query.owner = req.user.id;
      } else if (status === "shared") {
        query["collaborators.user"] = req.user.id;
      }
    } else {
      query.$or = [
        { owner: req.user.id },
        { "collaborators.user": req.user.id },
      ];
    }
    console.log(`Query created for lookup ${query}`);
    const [totalCount, projectsList] = await Promise.all([
      Project.countDocuments(query),
      Project.find(query)
        .sort({ updatedAt: -1 })
        .populate("owner", "name")
        .select("_id name createdAt updatedAt owner collaborators")
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),
    ]);
    const totalPages = Math.ceil(totalCount / pageLimit);

    const formattedProjects = projectsList.map((project) => {
      let access = "read";
      if (project.owner._id.toString() === req.user.id.toString()) {
        access = "write";
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
    console.error("Error occured in getProjects controller");
    next(err);
  }
}

async function createProject(req, res, next) {
  console.log("Creating new project");
  try {
    const { name, content } = req.body;
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).json({
        msg: "Project already exists",
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
    createdProject.id = projectToReturn._id;
    delete createdProject._id;
    delete createdProject.__v;
    
    console.log('Project created successfully');
    res.status(201).json({
      msg: "Project created successfully",
      data: createdProject,
    });
  } catch (err) {
    console.error("Error occured in createProject controller");
    next(err);
  }
}

module.exports = {
  getProjects,
  createProject,
};
