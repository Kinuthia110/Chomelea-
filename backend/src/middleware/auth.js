import jwt from "jsonwebtoken";

import User from "../models/user.js";

const auth = async (req) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      throw new Error(
        "No token provided"
      );

    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const user =
      await User.findById(
        decoded.id
      );

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    return user;

  } catch (error) {

    throw new Error(
      "Unauthorized"
    );

  }

};

export default auth;