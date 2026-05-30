import Payment from "../../models/payment.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const paymentResolver = {
  Query: {
    payments: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Payment.find()
        .populate("customer")
        .populate("invoice")
        .sort({ createdAt: -1 });
    },

    payment: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const payment = await Payment.findById(id)
        .populate("customer")
        .populate("invoice");

      if (!payment) {
        throw new Error("Payment not found");
      }

      return payment;
    }
  },

  Mutation: {
    createPayment: async (_, args, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const payment = await Payment.create(args);

      return payment.populate(["customer", "invoice"]);
    },

    updatePayment: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const payment = await Payment.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      })
        .populate("customer")
        .populate("invoice");

      if (!payment) {
        throw new Error("Payment not found");
      }

      return payment;
    },

    deletePayment: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const payment = await Payment.findByIdAndDelete(id);

      if (!payment) {
        throw new Error("Payment not found");
      }

      return true;
    }
  }
};

export default paymentResolver;