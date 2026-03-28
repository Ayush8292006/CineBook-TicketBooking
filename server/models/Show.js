import mongoose from "mongoose";

const ShowSchema = new mongoose.Schema(
  {
    movie: { type: String, ref: "Movie" },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Show = mongoose.models.Show || mongoose.model("Show", ShowSchema);

export default Show;