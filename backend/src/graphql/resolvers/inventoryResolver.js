import Inventory from "../../models/inventory.js";
import StockMovement from "../../models/stockMovement.js";

import auth, {
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
} from "../../middleware/auth.js";

const inventoryResolver = {
  Query: {
    inventoryItems: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Inventory.find().sort({ createdAt: -1 });
    },

    inventoryItem: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      const item = await Inventory.findById(id);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return item;
    },

    stockMovements: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return StockMovement.find()
        .populate("inventoryItem")
        .sort({ createdAt: -1 });
    },

    lowStockItems: async (_, args, { req }) => {
      const user = await auth(req);
      requireStaffOrAbove(user);

      return Inventory.find({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      }).sort({ quantity: 1 });
    }
  },

  Mutation: {
    createInventoryItem: async (_, args, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      return Inventory.create(args);
    },

    updateInventoryItem: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const item = await Inventory.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true
        }
      );

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return item;
    },

    deleteInventoryItem: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const item = await Inventory.findByIdAndDelete(id);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return true;
    },

    addStockMovement: async (
      _,
      {
        inventoryItem,
        type,
        quantity,
        reason,
        reference
      },
      { req }
    ) => {
      const user = await auth(req);
      requireManagerOrAdmin(user);

      const item = await Inventory.findById(inventoryItem);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      if (type === "IN") {
        item.quantity += quantity;
      }

      if (type === "OUT") {
        if (item.quantity < quantity) {
          throw new Error("Not enough stock available");
        }

        item.quantity -= quantity;
      }

      await item.save();

      const movement = await StockMovement.create({
        inventoryItem,
        type,
        quantity,
        reason,
        reference
      });

      return movement.populate("inventoryItem");
    },

    deleteStockMovement: async (_, { id }, { req }) => {
      const user = await auth(req);
      requireAdmin(user);

      const movement = await StockMovement.findByIdAndDelete(id);

      if (!movement) {
        throw new Error("Stock movement not found");
      }

      return true;
    }
  }
};

export default inventoryResolver;