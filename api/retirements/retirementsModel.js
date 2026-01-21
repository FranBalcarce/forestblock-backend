const mongoose = require("mongoose");

const MethodologySchema = new mongoose.Schema(
  {
    id: { type: String },
    category: { type: String },
    name: { type: String },
  },
  { _id: false }
);

const StatsSchema = new mongoose.Schema(
  {
    totalBridged: { type: Number },
    totalRetired: { type: Number },
    totalSupply: { type: Number },
    totalListingsSupply: { type: Number },
    totalPoolsSupply: { type: Number },
  },
  { _id: false }
);

const GeometrySchema = new mongoose.Schema(
  {
    type: { type: String },
    coordinates: { type: [Number] },
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    type: { type: String },
    geometry: GeometrySchema,
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String },
    caption: { type: String },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    key: { type: String },
    projectID: { type: String },
    name: { type: String },
    methodologies: [MethodologySchema],
    vintages: [String],
    registry: { type: String },
    updatedAt: { type: String },
    country: { type: String },
    region: { type: String },
    price: { type: String },
    stats: StatsSchema,
    hasSupply: { type: Boolean },
    sustainableDevelopmentGoals: [String],
    description: { type: String },
    long_description: { type: String },
    short_description: { type: String },
    location: LocationSchema,
    url: { type: String },
    images: [ImageSchema],
    coverImage: ImageSchema,
    satelliteImage: ImageSchema,
    puroBatchTokenId: { type: String },
    selectedVintage: { type: String },
    pdfUrl: { type: String },
  },
  { _id: false }
);

const RetirementSchema = new mongoose.Schema(
  {
    project: ProjectSchema,
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    quote: { type: Object },
    order: { type: Object },
    walletAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Retirement", RetirementSchema);
