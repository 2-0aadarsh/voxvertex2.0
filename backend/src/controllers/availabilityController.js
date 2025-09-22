// import Availability from "../models/availability.js";
// import User from "../models/user.js";
// import Profile from "../models/profile.js";

// // Add new availability slot
// export const addAvailability = async (req, res) => {
//   try {
//     const { date, eventType, timeSlot } = req.body;

//     const validUser = await User.findOne({
//       _id: req.user._id
//     });
//     if(validUser.role !== 'Expert') {
//       return res.status(403).json({
//         success: false,
//         message: "Only experts can create availability slots"
//       });
//     }

//     const currentDate = new Date();
//     const inputDate = new Date(date);

//     if (inputDate < currentDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot create availability for past dates"
//       });
//     }

//     // Get user details
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     const userName = `${user.firstName} ${user.lastName}`;

//     // Check for duplicate
//     const duplicate = await Availability.findOne({
//       expertId: req.user._id,
//       date,
//       "timeSlot.start": timeSlot.start,
//       "timeSlot.end": timeSlot.end,
//       eventType
//     });

//     if (duplicate) {
//       return res.status(400).json({
//         success: false,
//         message: "Identical availability slot already exists"
//       });
//     }

//     // Check for time overlap
//     const overlap = await Availability.findOne({
//       expertId: req.user._id,
//       date,
//       isBooked: false,
//       $or: [
//         {
//           "timeSlot.start": { $lt: timeSlot.end },
//           "timeSlot.end": { $gt: timeSlot.start }
//         }
//       ]
//     });

//     if (overlap) {
//       return res.status(400).json({
//         success: false,
//         message: `Time overlaps with existing ${overlap.eventType} commitment`,
//         conflictingSlot: overlap
//       });
//     }

//     const newAvailability = new Availability({
//       ...req.body,
//       expertId: req.user._id,
//       userName
//     });

//     await newAvailability.save();
//     res.status(201).json({
//       success: true,
//       availability: newAvailability
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate time slot detected"
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get all availabilities for an expert
// export const getExpertAvailabilities = async (req, res) => {
//   try {
//     const availabilities = await Availability.find({
//       expertId: req.user._id,
//       isBooked: false
//     }).sort({ date: 1 });

//     res.status(200).json({
//       success: true,
//       count: availabilities.length,
//       availabilities
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching availabilities",
//       error: error.message
//     });
//   }
// };

// // Update an availability slot
// export const updateAvailability = async (req, res) => {
//   try {
//     const { availabilityId } = req.params;

//     const { date } = req.body;

//     // Validate date is not in the past if date is being updated
//     if (date) {
//       const currentDate = new Date();
//       const inputDate = new Date(date);
      
//       if (inputDate < currentDate) {
//         return res.status(400).json({
//           success: false,
//           message: "Cannot update availability to past dates"
//         });
//       }
//     }

//     // Prevent userName updates
//     if (req.body.userName) {
//       delete req.body.userName;
//     }

//     const availability = await Availability.findOneAndUpdate(
//       {
//         _id: availabilityId,
//         expertId: req.user._id,
//         isBooked: false
//       },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found or already booked"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Availability updated successfully",
//       availability
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating availability",
//       error: error.message
//     });
//   }
// };

// // Delete an availability slot
// export const deleteAvailability = async (req, res) => {
//   try {
//     const { availabilityId } = req.params;

//     const availability = await Availability.findOneAndDelete({
//       _id: availabilityId,
//       expertId: req.user._id,
//       isBooked: false
//     });

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found or already booked"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Availability deleted successfully"
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting availability",
//       error: error.message
//     });
//   }
// };

// // Get availability by ID (new addition)
// export const getAvailabilityById = async (req, res) => {
//   try {
//     const availability = await Availability.findOne({
//       _id: req.params.availabilityId,
//       expertId: req.user._id
//     }).populate('expertId', 'firstName lastName');

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       availability
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching availability",
//       error: error.message
//     });
//   }
// };



import Availability from '../models/availability.js';

// Note: normalizeDate function removed as it's no longer needed with UTC date handling

// Get availability for a specific month
export const getAvailability = async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    // Create date range for the month
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const availability = await Availability.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
};

// Get availability for a specific speaker (for organizers to view)
export const getSpeakerAvailability = async (req, res) => {
  try {
    const { speakerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: "Speaker ID is required",
      });
    }

    // Build query for date range
    let query = { userId: speakerId };
    
    if (startDate && endDate) {
      const startUTC = new Date(startDate + "T00:00:00.000Z");
      const endUTC = new Date(endDate + "T23:59:59.999Z");
      query.date = { $gte: startUTC, $lte: endUTC };
    } else {
      // Default: only return future dates
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      query.date = { $gte: todayUTC };
    }

    // Fetch availability documents for this speaker
    const availabilityDocs = await Availability.find(query).sort({ date: 1 });

    if (!availabilityDocs || availabilityDocs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No availability found for this speaker",
      });
    }

    // Extract dates and group by common availability settings
    const availableDates = availabilityDocs.map(doc => doc.date);
    
    // Get common settings (assuming all dates have same settings for now)
    const commonSettings = availabilityDocs[0];

    return res.status(200).json({
      success: true,
      data: {
        speakerId: speakerId,
        dates: availableDates,
        eventTypes: commonSettings.eventTypes,
        modes: commonSettings.modes,
        timeSlots: commonSettings.timeSlots,
        count: availabilityDocs.length
      },
    });
  } catch (error) {
    console.error("Error fetching speaker availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speaker availability",
    });
  }
};


// Get availability for authenticated user (duplicate function - keeping the updated one above)


// Get availability for a date range (query: startDate, endDate)
export const getAvailabilityByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id; // Get user from JWT authentication

    // Convert query dates to proper Date objects
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    
    const availabilities = await Availability.find({
      userId: userId, // Filter by authenticated user
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    return res.status(200).json({ 
      success: true,
      count: availabilities.length,
      data: availabilities 
    });

  } catch (error) {
    console.error("Error fetching availability by range:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get availability for a id
export const getAvailabilityById = async (req, res) => {
  try {
    const { availabilityId } = req.params;

    // Fetch the availability
    const availability = await Availability.findOne({
      _id: availabilityId,
      userId: req.user._id, // ensure user can only access their own data
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching availability by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
    });
  }
};

// Set availability for single or multiple dates - creates separate documents per date
export const setAvailability = async (req, res, next) => {
  try {
    // ✅ Only speakers can set availability
    if (req.user.role !== "speaker") {
      return res.status(403).json({ message: "Only speakers can set availability" });
    }

    const { dates, eventTypes, modes, timeSlots } = req.body;
    const userId = req.user._id; // ✅ Always use logged-in speaker

    console.log("Setting availability for SPEAKER:", userId, { dates, eventTypes, modes, timeSlots });

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: "At least one date is required" });
    }

    // Prepare documents for each date
    const availabilityDocuments = dates.map(dateStr => {
      let date;
      if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-").map(Number);
        date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // store as UTC
      } else {
        date = new Date(dateStr);
      }

      return {
        userId,
        date,
        eventTypes,
        modes,
        timeSlots,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Use bulkWrite to handle multiple documents efficiently
    const bulkOps = availabilityDocuments.map(doc => ({
      updateOne: {
        filter: { userId: doc.userId, date: doc.date },
        update: {
          $set: {
            eventTypes: doc.eventTypes,
            modes: doc.modes,
            timeSlots: doc.timeSlots,
            updatedAt: doc.updatedAt
          },
          $setOnInsert: {
            createdAt: doc.createdAt
          }
        },
        upsert: true
      }
    }));

    const result = await Availability.bulkWrite(bulkOps);

    console.log("✅ Availability saved successfully:", {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

    return res.status(200).json({
      success: true,
      message: `Availability updated for ${dates.length} date(s)`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
        dates: dates
      },
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    next(error);
  }
};




// Delete availability for specific dates
export const deleteAvailability = async (req, res) => {
  try {
    const { dates } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, message: 'Dates array is required' });
    }

    // Normalize dates to UTC midnight for consistent comparison
    const normalizedDates = dates.map(d => {
      let date;
      if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = d.split("-").map(Number);
        date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      } else {
        date = new Date(d);
        date.setHours(0, 0, 0, 0);
      }
      return date;
    });

    const result = await Availability.deleteMany({
      userId,
      date: { $in: normalizedDates }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} availability entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ success: false, message: 'Failed to delete availability' });
  }
};
