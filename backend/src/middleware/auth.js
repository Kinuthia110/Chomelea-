import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const auth = async (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("No token provided");
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

export const requireRole = (user, allowedRoles = []) => {
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: You do not have permission");
  }

  return true;
};

export const requireAdmin = (user) => {
  return requireRole(user, ["ADMIN"]);
};

export const requireManagerOrAdmin = (user) => {
  return requireRole(user, ["ADMIN", "MANAGER"]);
};

export const requireStaffOrAbove = (user) => {
  return requireRole(user, ["ADMIN", "MANAGER", "STAFF"]);
};

export default auth;