import bcrypt from "bcryptjs";

import User from "../../models/user.js";

import generateToken
from "../../utils/generateToken.js";

const authResolver = {

  Mutation: {

    register: async (_, args) => {

      const existingUser =
        await User.findOne({
          email: args.email
        });

      if (existingUser) {
        throw new Error(
          "Email already exists"
        );
      }

      const hashedPassword =
        await bcrypt.hash(
          args.password,
          10
        );

      const user =
        await User.create({

          fullName: args.fullName,

          email: args.email,

          phone: args.phone,

          password: hashedPassword

        });

      const token =
        generateToken(user);

      return {
        token,
        user
      };

    },


    login: async (
      _,
      { email, password }
    ) => {

      const user =
        await User.findOne({
          email
        });

      if (!user) {

        throw new Error(
          "Invalid credentials"
        );

      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {

        throw new Error(
          "Invalid credentials"
        );

      }

      const token =
        generateToken(user);

      return {
        token,
        user
      };

    }

  }

};

export default authResolver;