import Invoice from "../../models/invoice.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const invoiceResolver = {
  Query: {
    invoices: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Invoice.find()
        .populate("customer")
        .populate("project")
        .sort({ createdAt: -1 });
    },

    invoice: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const invoice = await Invoice.findById(id)
        .populate("customer")
        .populate("project");

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return invoice;
    }
  },

  Mutation: {
    createInvoice: async (_, args, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const invoice = await Invoice.create(args);

      return invoice.populate(["customer", "project"]);
    },

    updateInvoice: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const invoice = await Invoice.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true
        }
      )
        .populate("customer")
        .populate("project");

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return invoice;
    },

    deleteInvoice: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const invoice = await Invoice.findByIdAndDelete(id);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return true;
    }
  }
};

export default invoiceResolver;