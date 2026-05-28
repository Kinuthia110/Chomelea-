import Project from "../../models/project.js";
import Customer from "../../models/customer.js";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/roles.js";

const populateProject = (query) => {
  return query
    .populate("customer")
    .populate("assignedWorkers")
    .populate("createdBy");
};

const calculateBalance = (totalCost = 0, depositPaid = 0) => {
  return Number(totalCost || 0) - Number(depositPaid || 0);
};

const projectResolver = {
  Query: {
    projects: async (_, args, { req }) => {
      await auth(req);

      return await populateProject(
        Project.find().sort({ createdAt: -1 })
      );
    },

    project: async (_, { id }, { req }) => {
      await auth(req);

      const project = await populateProject(Project.findById(id));

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    },

    projectsByStatus: async (_, { status }, { req }) => {
      await auth(req);

      return await populateProject(
        Project.find({ status }).sort({ createdAt: -1 })
      );
    }
  },

  Mutation: {
    createProject: async (_, args, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const customerExists = await Customer.findById(args.customer);

      if (!customerExists) {
        throw new Error("Customer not found");
      }

      const totalCost = Number(args.totalCost || 0);
      const depositPaid = Number(args.depositPaid || 0);

      const project = await Project.create({
        customer: args.customer,
        projectTitle: args.projectTitle,
        description: args.description,
        category: args.category || "CUSTOM",

        measurements: {
          width: args.width,
          height: args.height,
          unit: args.unit || "ft"
        },

        totalCost,
        depositPaid,
        balance: calculateBalance(totalCost, depositPaid),

        startDate: args.startDate,
        deadline: args.deadline,

        createdBy: user._id
      });

      return await populateProject(Project.findById(project._id));
    },

    updateProject: async (_, { id, ...args }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const existingProject = await Project.findById(id);

      if (!existingProject) {
        throw new Error("Project not found");
      }

      const totalCost =
        args.totalCost !== undefined ? args.totalCost : existingProject.totalCost;

      const depositPaid =
        args.depositPaid !== undefined ? args.depositPaid : existingProject.depositPaid;

      const updates = {
        projectTitle: args.projectTitle,
        description: args.description,
        category: args.category,
        status: args.status,
        totalCost,
        depositPaid,
        balance: calculateBalance(totalCost, depositPaid),
        startDate: args.startDate,
        deadline: args.deadline,
        completionDate: args.completionDate
      };

      if (
        args.width !== undefined ||
        args.height !== undefined ||
        args.unit !== undefined
      ) {
        updates.measurements = {
          width:
            args.width !== undefined
              ? args.width
              : existingProject.measurements?.width,

          height:
            args.height !== undefined
              ? args.height
              : existingProject.measurements?.height,

          unit:
            args.unit !== undefined
              ? args.unit
              : existingProject.measurements?.unit
        };
      }

      Object.keys(updates).forEach((key) => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });

      const project = await Project.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      return await populateProject(Project.findById(project._id));
    },

    updateProjectStatus: async (_, { id, status }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER", "WORKER")(user);

      const updates = { status };

      if (status === "COMPLETED") {
        updates.completionDate = new Date();
      }

      const project = await Project.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return await populateProject(Project.findById(project._id));
    },

    assignWorkersToProject: async (_, { id, workerIds }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const project = await Project.findByIdAndUpdate(
        id,
        { assignedWorkers: workerIds },
        { new: true, runValidators: true }
      );

      if (!project) {
        throw new Error("Project not found");
      }

      return await populateProject(Project.findById(project._id));
    },

    deleteProject: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN")(user);

      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        throw new Error("Project not found");
      }

      return "Project deleted successfully";
    }
  }
};

export default projectResolver;