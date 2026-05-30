import Quotation from "../../models/quotation.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const quotationResolver = {
  Query: {
    quotations: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Quotation.find()
        .populate("customer")
        .populate("project")
        .sort({ createdAt: -1 });
    },

    quotation: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const quotation = await Quotation.findById(id)
        .populate("customer")
        .populate("project");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    }
  },

  Mutation: {
    createQuotation: async (_, args, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const quotation = await Quotation.create(args);

      return quotation.populate(["customer", "project"]);
    },

    updateQuotation: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const quotation = await Quotation.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true
        }
      )
        .populate("customer")
        .populate("project");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    },

    approveQuotation: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const quotation = await Quotation.findByIdAndUpdate(
        id,
        { status: "APPROVED" },
        { new: true, runValidators: true }
      )
        .populate("customer")
        .populate("project");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    },

    rejectQuotation: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const quotation = await Quotation.findByIdAndUpdate(
        id,
        { status: "REJECTED" },
        { new: true, runValidators: true }
      )
        .populate("customer")
        .populate("project");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    },

    deleteQuotation: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const quotation = await Quotation.findByIdAndDelete(id);

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return true;
    }
  }
};

export default quotationResolver;