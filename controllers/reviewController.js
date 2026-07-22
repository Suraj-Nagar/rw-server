import Review from "../models/review.model.js";
import AppError from "../utils/AppError.js";

export const addReview = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return next(new AppError("Rating and comment are required", 400));
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ room: roomId, user: req.user.id });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();
      return res.status(200).json({ success: true, message: "Review updated successfully", review: existingReview });
    }

    const review = await Review.create({
      room: roomId,
      user: req.user.id,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getRoomReviews = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ room: roomId })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
