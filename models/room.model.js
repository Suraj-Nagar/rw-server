import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    rent: {
      type: Number,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    images: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],

    bedCapacity: {
      type: Number,
      required: true,
      default: 1, // Single, double, triple sharing
    },

    amenities: {
      type: [String],
      default: [], // e.g., ["WiFi", "AC", "Laundry", "Meals"]
    },

    rules: {
      type: [String],
      default: [], // e.g., ["No smoking", "Gate closes at 10 PM"]
    },

    gateClosingTime: {
      type: String,
      default: "No Restriction", // e.g., "10:00 PM", "No Restriction", "11:00 PM"
    },

    latitude: {
      type: Number,
      required: false,
    },

    longitude: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
