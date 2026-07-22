import Room from "../models/room.model.js";
import AppError from "../utils/AppError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import fs from "fs";
import User from "../models/user.model.js";

export const createRoom = async (req, res, next) => {
  try {
    const { title, category, ownerName, description, location, rent, bedCapacity, amenities, rules, latitude, longitude, gateClosingTime } = req.body;
     if (!title || !category || !ownerName || !description || !rent || !location) {
      return next(new AppError("All fields are required", 400));
    }

    // MONETIZATION: Freemium Paywall Check
    const user = req.user; 
    const roomCount = await Room.countDocuments({ owner: req.user.id });
    
    // We need to fetch the full user to check subscription status
    const fullUser = await User.findById(req.user.id);
    
    if (roomCount >= 2 && fullUser?.subscription?.status !== 'active') {
      return next(new AppError("FREE_LIMIT_REACHED", 403));
    }

    let imageArray = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        if (!cloudinaryResponse)
          return next(new AppError("Image upload failed", 500));

        imageArray.push({
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        });

        fs.unlinkSync(file.path);
      }
    }

    const newRoom = await Room.create({
      title,
      category,
      ownerName,
      description,
      location,
      rent,
      bedCapacity: bedCapacity || 1,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(",")) : [],
      rules: rules ? (Array.isArray(rules) ? rules : rules.split(",")) : [],
      gateClosingTime: gateClosingTime || "No Restriction",
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      owner: req.user.id,
      images: imageArray,
    });

    if (!newRoom) {
      return next(new AppError("Room could not be created, please try again", 400));
    }

    res.status(200).json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    next(new AppError(error.message || "Server Error", 500));
  }
};

export const getAllRooms = async (req, res, next) => {
  try {
    const {type,minRent,maxRent,location,bedCapacity,amenities}=req.query;
    let filters={};
    if(type){
      filters.category={$regex:type, $options:"i"};
    }
    if(location){
      filters.location={$regex:location, $options:"i"};
    }
    if(bedCapacity){
      filters.bedCapacity = Number(bedCapacity);
    }
    if(amenities){
      const amenityArray = amenities.split(',');
      filters.amenities = { $all: amenityArray };
    }
     if(minRent||maxRent){
      filters.rent={};
      if(minRent) filters.rent.$gte=Number(minRent);
      if(maxRent) filters.rent.$lte =Number(maxRent);
    }

    const rooms = await Room.find(filters);
    if (!rooms) return next(new AppError("Can't get rooms", 404));

    res.status(200).json({
      success: true,
      message: "Rooms loaded successfully",
      rooms,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    if (!room)
      return next(new AppError("Room not found, please try again later", 404));

    res.status(200).json({
      success: true,
      message: "Room loaded successfully",
      room,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return next(new AppError("Room not found", 404));

    const updatableFields = [
      "title",
      "category",
      "ownerName",
      "description",
      "location",
      "rent",
      "bedCapacity",
      "gateClosingTime",
      "latitude",
      "longitude"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    if (req.body.amenities) {
        room.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : req.body.amenities.split(",");
    }
    if (req.body.rules) {
        room.rules = Array.isArray(req.body.rules) ? req.body.rules : req.body.rules.split(",");
    }

    if (req.files && req.files.length > 0) {
      let imageArray = [];
      for (const file of req.files) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        if (!cloudinaryResponse)
          return next(new AppError("Image upload failed", 500));

        imageArray.push({
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        });

        fs.unlinkSync(file.path);
      }
      room.images = [...room.images, ...imageArray];
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return next(new AppError("Room not found", 404));

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
