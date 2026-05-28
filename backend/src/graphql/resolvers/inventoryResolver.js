import Inventory from "../../models/inventory.js";
import StockMovement from "../../models/stockMovement.js";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/roles.js";

const populateInventory = (query) => {
  return query.populate("createdBy");
};

const populateMovement = (query) => {
  return query
    .populate("inventoryItem")
    .populate("project")
    .populate("recordedBy");
};

const inventoryResolver = {
  Query: {
    inventoryItems: async (_, args, { req }) => {
      await auth(req);

      return await populateInventory(
        Inventory.find().sort({ createdAt: -1 })
      );
    },

    inventoryItem: async (_, { id }, { req }) => {
      await auth(req);

      const item = await populateInventory(Inventory.findById(id));

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return item;
    },

    lowStockItems: async (_, args, { req }) => {
      await auth(req);

      return await Inventory.find({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      }).sort({ quantity: 1 });
    },

    stockMovements: async (_, args, { req }) => {
      await auth(req);

      return await populateMovement(
        StockMovement.find().sort({ createdAt: -1 })
      );
    },

    stockMovementsByItem: async (_, { inventoryItem }, { req }) => {
      await auth(req);

      return await populateMovement(
        StockMovement.find({ inventoryItem }).sort({ createdAt: -1 })
      );
    }
  },

  Mutation: {
    createInventoryItem: async (_, args, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const item = await Inventory.create({
        ...args,
        createdBy: user._id
      });

      if (args.quantity && args.quantity > 0) {
        await StockMovement.create({
          inventoryItem: item._id,
          movementType: "IN",
          quantity: args.quantity,
          reason: "PURCHASE",
          notes: "Initial stock",
          recordedBy: user._id
        });
      }

      return await populateInventory(Inventory.findById(item._id));
    },

    updateInventoryItem: async (_, { id, ...updates }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const item = await Inventory.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!item) {
        throw new Error("Inventory item not found");
      }

      return await populateInventory(Inventory.findById(item._id));
    },

    stockIn: async (_, { inventoryItem, quantity, reason, notes }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const item = await Inventory.findById(inventoryItem);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      item.quantity += quantity;
      await item.save();

      await StockMovement.create({
        inventoryItem,
        movementType: "IN",
        quantity,
        reason: reason || "PURCHASE",
        notes,
        recordedBy: user._id
      });

      return await populateInventory(Inventory.findById(item._id));
    },

    stockOut: async (
      _,
      { inventoryItem, quantity, reason, project, notes },
      { req }
    ) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER", "WORKER")(user);

      const item = await Inventory.findById(inventoryItem);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      if (item.quantity < quantity) {
        throw new Error("Not enough stock available");
      }

      item.quantity -= quantity;
      await item.save();

      await StockMovement.create({
        inventoryItem,
        movementType: "OUT",
        quantity,
        reason: reason || "PROJECT_USAGE",
        project,
        notes,
        recordedBy: user._id
      });

      return await populateInventory(Inventory.findById(item._id));
    },

    deleteInventoryItem: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN")(user);

      const item = await Inventory.findByIdAndDelete(id);

      if (!item) {
        throw new Error("Inventory item not found");
      }

      await StockMovement.deleteMany({ inventoryItem: id });

      return "Inventory item deleted successfully";
    }
  }
};

export default inventoryResolver;