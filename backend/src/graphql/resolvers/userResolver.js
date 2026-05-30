import User from "../../models/user.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin
} from "../../middleware/auth.js";

const userResolver = {
  Query: {
    users: async (_, args, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      return User.find()
        .select("-password")
        .sort({ createdAt: -1 });
    },

    user: async (_, { id }, { req }) => {
      const loggedInUser = await auth(req);
      requireManagerOrAdmin(loggedInUser);

      const user = await User.findById(id).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }
  },

  Mutation: {
    createUser: async (
      _,
      { fullName, email, password, role },
      { req }
    ) => {
      const loggedInUser = await auth(req);
      requireAdmin(loggedInUser);

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

      if (!allowedRoles.includes(role)) {
        throw new Error("Invalid role");
      }

      const user = await User.create({
        fullName,
        email,
        password,
        role
      });

      return User.findById(user._id).select("-password");
    },

    updateUserRole: async (_, { id, role }, { req }) => {
      const loggedInUser = await auth(req);
      requireAdmin(loggedInUser);

      const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

      if (!allowedRoles.includes(role)) {
        throw new Error("Invalid role");
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        {
          new: true,
          runValidators: true
        }
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },

    deleteUser: async (_, { id }, { req }) => {
      const loggedInUser = await auth(req);
      requireAdmin(loggedInUser);

      if (String(loggedInUser._id) === String(id)) {
        throw new Error("You cannot delete your own account");
      }

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        throw new Error("User not found");
      }

      return true;
    }
  }
};

export default userResolver;