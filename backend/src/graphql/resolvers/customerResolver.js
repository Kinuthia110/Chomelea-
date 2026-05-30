import Customer from "../../models/customer.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const customerResolver = {
  Query: {
    customers: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Customer.find().sort({ createdAt: -1 });
    },

    customer: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const customer = await Customer.findById(id);

      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer;
    }
  },

  Mutation: {
    createCustomer: async (
      _,
      {
        fullName,
        phone,
        email,
        address,
        companyName,
        notes
      },
      { req }
    ) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const customer = await Customer.create({
        fullName,
        phone,
        email,
        address,
        companyName,
        notes
      });

      return customer;
    },

    updateCustomer: async (
      _,
      {
        id,
        fullName,
        phone,
        email,
        address,
        companyName,
        notes
      },
      { req }
    ) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const customer = await Customer.findByIdAndUpdate(
        id,
        {
          fullName,
          phone,
          email,
          address,
          companyName,
          notes
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer;
    },

    deleteCustomer: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const customer = await Customer.findByIdAndDelete(id);

      if (!customer) {
        throw new Error("Customer not found");
      }

      return true;
    }
  }
};

export default customerResolver;