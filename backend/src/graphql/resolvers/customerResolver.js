import Customer from "../../models/customer.js";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/roles.js";

const customerResolver = {
  Query: {
    customers: async (_, args, { req }) => {
      await auth(req);

      return await Customer.find()
        .populate("createdBy")
        .sort({ createdAt: -1 });
    },

    customer: async (_, { id }, { req }) => {
      await auth(req);

      const customer = await Customer.findById(id).populate("createdBy");

      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer;
    }
  },

  Mutation: {
    createCustomer: async (_, args, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const customer = await Customer.create({
        ...args,
        createdBy: user._id
      });

      return customer.populate("createdBy");
    },

    updateCustomer: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const customer = await Customer.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true
        }
      ).populate("createdBy");

      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer;
    },

    deleteCustomer: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN")(user);

      const customer = await Customer.findByIdAndDelete(id);

      if (!customer) {
        throw new Error("Customer not found");
      }

      return "Customer deleted successfully";
    }
  }
};

export default customerResolver;