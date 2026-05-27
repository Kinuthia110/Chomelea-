import User from "../../models/user.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const authResolver = {
  Mutation: {
    register: async (_, { fullName, email, password, phone }) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const user = await User.create({
        fullName,
        email,
        password,
        phone,
        role: "STAFF"
      });

      const token = generateToken(user);

      return {
        token,
        user
      };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      const token = generateToken(user);

      return {
        token,
        user
      };
    }
  }
};

export default authResolver;