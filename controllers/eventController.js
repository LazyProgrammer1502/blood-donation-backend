import Event from "../models/event.js";
import fs from "fs";
import path from "path";

const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const headerImage = req.files["header_image"]
      ? req.files["header_image"][0].path
      : null;
    const imagePaths = req.files["images"]
      ? req.files["images"].map((file) => file.path)
      : [];
    const event = await Event.create({
      title,
      description,
      date,
      header_image: headerImage,
      images: imagePaths,
    });
    res.status(201).json({ message: "Event Created Successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(400).json({ message: "Event not found" });
    }
    console.log(req.admin);
    if (req.admin.role !== "superAdmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not Found" });

    if (event.header_image) {
      const headerPath = path.join(process.cwd(), event.header_image);
      if (fs.existsSync(headerPath)) {
        fs.unlinkSync(headerPath);
      }
    }

    if (event.images && event.images.length > 0) {
      for (const imagPath of event.images) {
        const fullPath = path.join(process.cwd(), imagPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    await event.deleteOne();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
export { createEvent, getAllEvents, updateEvent, deleteEvent, getEventById };
