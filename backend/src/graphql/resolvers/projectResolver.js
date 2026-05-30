import Project from "../../models/project.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const projectResolver = {
  Query: {
    projects: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Project.find()
        .populate("customer")
        .sort({ createdAt: -1 });
    },

    project: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const project = await Project.findById(id).populate("customer");

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }
  },

  Mutation: {
    createProject: async (
      _,
      {
        customer,
        projectTitle,
        description,
        location,
        startDate,
        endDate,
        status,
        budget
      },
      { req }
    ) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const project = await Project.create({
        customer,
        projectTitle,
        description,
        location,
        startDate,
        endDate,
        status,
        budget
      });

      return project.populate("customer");
    },

    updateProject: async (
      _,
      {
        id,
        customer,
        projectTitle,
        description,
        location,
        startDate,
        endDate,
        status,
        budget
      },
      { req }
    ) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const project = await Project.findByIdAndUpdate(
        id,
        {
          customer,
          projectTitle,
          description,
          location,
          startDate,
          endDate,
          status,
          budget
        },
        {
          new: true,
          runValidators: true
        }
      ).populate("customer");

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    },

    deleteProject: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        throw new Error("Project not found");
      }

      return true;
    }
  }
};

export default projectResolver;