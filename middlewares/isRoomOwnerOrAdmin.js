import Room from "../models/room.model.js";

export const isRoomOwnerOrAdmin = async (req, res, next) => {
    const room = await Room.findById(req.params.id);
    if (!room)
        return res.status(404).json({ success: false, message: "Room not found" });
    
    const isOwner = room.owner && room.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    
    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Only the room owner or admin can perform this action",
        });
    }
    req.room = room;
    next();
};
