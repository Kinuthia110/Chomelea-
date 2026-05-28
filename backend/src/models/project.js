import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    projectTitle: {
      type: String,
      required: true,
      trim: true
    },

    description: String,

    category: {
      type: String,
      enum: ["GATE", "WINDOW", "DOOR", "STAIRCASE", "BALCONY", "CUSTOM"],
      default: "CUSTOM"
    },

    status: {
      type: String,
      enum: [
        "NEW_ORDER",
        "MEASURING",
        "FABRICATION",
        "PAINTING",
        "INSTALLATION",
        "COMPLETED"
      ],
      default: "NEW_ORDER"
    },

    measurements: {
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: "ft"
      }
    },

    totalCost: {
      type: Number,
      default: 0
    },

    depositPaid: {
      type: Number,
      default: 0
    },

    balance: {
      type: Number,
      default: 0
    },

    assignedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    startDate: Date,
    deadline: Date,
    completionDate: Date,

    images: [String],

    workflowHistory: [
      {
        status: {
          type: String,
          enum: [
            "NEW_ORDER",
            "MEASURING",
            "FABRICATION",
            "PAINTING",
            "INSTALLATION",
            "COMPLETED"
          ]
        },

        note: String,

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", ProjectSchema);

export default Project;