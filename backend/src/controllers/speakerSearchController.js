import EnhancedUser from '../models/enhancedUser.js';
import Availability from '../models/availability.js';
import SavedSpeaker from '../models/savedSpeaker.js';

/**
 * Search speakers based on various keywords
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchSpeakers = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;

    // Handle multiple query parameters - search for each term individually
    let searchTerms = [];
    if (Array.isArray(query)) {
      // If multiple q parameters, search for each term individually
      searchTerms = query.map(q => q.trim()).filter(q => q.length > 0);
    } else if (typeof query === 'string') {
      // Single query - split by spaces to get individual terms
      searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a string',
        data: []
      });
    }

    // Validate query parameter
    if (searchTerms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        data: []
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create search conditions for various fields - search for each term individually
    const searchConditions = {
      role: 'speaker', // Only search for speakers
      $and: searchTerms.map(term => ({
        $or: [
          // Basic information search - match each term individually
          { firstName: { $regex: term, $options: 'i' } },
          { lastName: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
          { mobileNo: { $regex: term, $options: 'i' } },
          
          // Profile information search - match each term individually
          { bio: { $regex: term, $options: 'i' } },
          { professionalTitle: { $regex: term, $options: 'i' } },
          { location: { $regex: term, $options: 'i' } },
          
          // Array fields search - check if any array element contains the term
          { areaOfExpertise: { $elemMatch: { $regex: term, $options: 'i' } } },
          
          // Role-specific data search - match each term individually
          { 'roleSpecificData.industry': { $regex: term, $options: 'i' } },
          { 'roleSpecificData.activities': { $elemMatch: { $regex: term, $options: 'i' } } },
          { 'roleSpecificData.socialLinks.linkedin': { $regex: term, $options: 'i' } },
          { 'roleSpecificData.socialLinks.twitter': { $regex: term, $options: 'i' } },
          { 'roleSpecificData.socialLinks.website': { $regex: term, $options: 'i' } },
          { 'roleSpecificData.socialLinks.portfolio': { $regex: term, $options: 'i' } }
        ]
      }))
    };

    // Execute search query
    const speakers = await EnhancedUser.find(searchConditions)
      .select('-password -__v') // Exclude sensitive fields
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await EnhancedUser.countDocuments(searchConditions);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format response data
    const formattedSpeakers = speakers.map(speaker => ({
      _id: speaker._id,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      fullName: speaker.fullName,
      email: speaker.email,
      mobileNo: speaker.mobileNo,
      profileImageUrl: speaker.profileImageUrl,
      bio: speaker.bio,
      professionalTitle: speaker.professionalTitle,
      location: speaker.location,
      areaOfExpertise: speaker.areaOfExpertise,
      yearsOfExperience: speaker.yearsOfExperience,
      roleSpecificData: {
        industry: speaker.roleSpecificData?.industry,
        activities: speaker.roleSpecificData?.activities,
        socialLinks: speaker.roleSpecificData?.socialLinks
      },
      isProfileComplete: speaker.isProfileComplete,
      createdAt: speaker.createdAt
    }));

    // Response with pagination
    res.status(200).json({
      success: true,
      message: `Found ${totalCount} speaker(s) matching "${searchTerms.join(' ')}"`,
      data: {
        speakers: formattedSpeakers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error searching speakers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching speakers',
      error: error.message
    });
  }
};

/**
 * Get speaker suggestions based on partial search term
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSpeakerSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    // Handle multiple query parameters - take the first one or join them
    let searchQuery;
    if (Array.isArray(query)) {
      // If multiple q parameters, join them with space
      searchQuery = query.join(' ');
    } else if (typeof query === 'string') {
      searchQuery = query;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a string',
        data: []
      });
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        data: []
      });
    }

    const searchTerm = searchQuery.trim();

    // Search for suggestions (more focused on names and titles)
    const suggestions = await EnhancedUser.find({
      role: 'speaker',
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { professionalTitle: { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.industry': { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('firstName lastName professionalTitle roleSpecificData.industry profileImageUrl')
    .limit(parseInt(limit));

    const formattedSuggestions = suggestions.map(speaker => ({
      _id: speaker._id,
      fullName: `${speaker.firstName} ${speaker.lastName}`,
      professionalTitle: speaker.professionalTitle,
      industry: speaker.roleSpecificData?.industry,
      profileImageUrl: speaker.profileImageUrl
    }));

    res.status(200).json({
      success: true,
      message: 'Speaker suggestions retrieved successfully',
      data: formattedSuggestions
    });

  } catch (error) {
    console.error('Error getting speaker suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting suggestions',
      error: error.message
    });
  }
};

/**
 * Search and filter speakers based on availability and other criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchSpeakersWithFilters = async (req, res) => {
  try {
    console.log('🔍 searchSpeakersWithFilters called. Raw req.query:', req.query);
    
    const {
      // Search query
      q: query,
      
      // Pagination
      page = 1,
      limit = 10,
      
      // Availability filters
      availabilityDate,
      eventTypes,
      events,
      subTypes, // Backward compatibility - maps to events
      minFee,
      maxFee,
      deliveryModes,
      
      // Time slot filters
      requestedStartTime,
      requestedEndTime,
      
      // Profile filters
      yearsOfExperience,
      location,
      expertise,
      topics,
      
      // Trust & Verification (for future use)
      // identityVerified,
      // credentialsVerified
    } = req.query;

    console.log('🔍 Parsed availabilityDate:', availabilityDate);

    // Build base search conditions
    let searchConditions = {
      role: 'speaker'
    };

    // Add text search if provided
    if (query) {
      let searchQuery;
      if (Array.isArray(query)) {
        searchQuery = query.join(' ');
      } else if (typeof query === 'string') {
        searchQuery = query;
      }

      if (searchQuery && searchQuery.trim().length > 0) {
        const searchTerm = searchQuery.trim();
        searchConditions.$or = [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { mobileNo: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
          { professionalTitle: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { areaOfExpertise: { $in: [new RegExp(searchTerm, 'i')] } },
          { 'roleSpecificData.industry': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.activities': { $in: [new RegExp(searchTerm, 'i')] } },
          { 'roleSpecificData.socialLinks.linkedin': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.twitter': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.website': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.portfolio': { $regex: searchTerm, $options: 'i' } }
        ];
      }
    }

    // Add profile-based filters
    if (yearsOfExperience) {
      searchConditions.yearsOfExperience = { $gte: parseInt(yearsOfExperience) };
    }

    if (location) {
      const trimmedLocation = location.trim();
      console.log('🎯 Location before trimming:', location);
      console.log('🎯 Location after trimming:', trimmedLocation);
      searchConditions.location = { $regex: trimmedLocation, $options: 'i' };
    }

    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      // Trim whitespace and newlines from expertise
      const trimmedExpertise = expertiseArray.map(exp => exp.trim());
      console.log('🎯 Expertise before trimming:', expertiseArray);
      console.log('🎯 Expertise after trimming:', trimmedExpertise);
      
      // Search in both areaOfExpertise AND roleSpecificData.activities
      // Priority: activities first, then areaOfExpertise
      const expertiseConditions = [
        { 'roleSpecificData.activities': { $in: trimmedExpertise } },
        { areaOfExpertise: { $in: trimmedExpertise } }
      ];
      
      // If there's already a $or condition (from text search), combine them
      if (searchConditions.$or) {
        // Combine existing $or with expertise $or using $and
        const existingOr = searchConditions.$or;
        delete searchConditions.$or;
        searchConditions.$and = [
          { $or: existingOr },
          { $or: expertiseConditions }
        ];
      } else {
        searchConditions.$or = expertiseConditions;
      }
    }

    if (topics) {
      const topicsArray = Array.isArray(topics) ? topics : [topics];
      // Trim whitespace and newlines from topics and convert to lowercase for industry matching
      const trimmedTopics = topicsArray.map(topic => topic.trim().toLowerCase());
      console.log('🎯 Topics (industry categories) before trimming:', topicsArray);
      console.log('🎯 Topics (industry categories) after trimming:', trimmedTopics);
      searchConditions['roleSpecificData.industry'] = { $in: trimmedTopics };
    }


    // Get all speakers matching basic criteria first
    const allSpeakers = await EnhancedUser.find(searchConditions)
      .select('-password -__v')
      .sort({ createdAt: -1 });

    // If no availability filters, return basic results
    if (!availabilityDate && !eventTypes && !events && !subTypes && !minFee && !maxFee && !deliveryModes) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedSpeakers = allSpeakers.slice(skip, skip + parseInt(limit));
      const totalCount = allSpeakers.length;

      const formattedSpeakers = paginatedSpeakers.map(speaker => ({
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        message: `Found ${totalCount} speaker(s) matching criteria`,
        data: {
          speakers: formattedSpeakers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Build availability filter conditions
    let availabilityConditions = {};

    // Filter by availability date
    if (availabilityDate) {
      console.log('📅 Original availabilityDate from query:', availabilityDate);
      
      // Handle multiple dates or single date
      let datesToFilter = [];
      
      if (Array.isArray(availabilityDate)) {
        // Multiple dates provided
        datesToFilter = availabilityDate;
        console.log('📅 Multiple dates provided:', datesToFilter);
      } else if (typeof availabilityDate === 'string') {
        // Single date provided
        datesToFilter = [availabilityDate];
        console.log('📅 Single date provided:', datesToFilter);
      }
      
      // Create date ranges for all provided dates
      const dateRanges = datesToFilter.map(dateStr => {
        try {
          const targetDate = new Date(dateStr);
          
          // Validate the date
          if (isNaN(targetDate.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`);
          }
          
          const startOfDay = new Date(targetDate);
          startOfDay.setUTCHours(0, 0, 0, 0);
          
          const endOfDay = new Date(targetDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          return {
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
            originalDate: dateStr
          };
        } catch (error) {
          console.error(`❌ Error parsing date: ${dateStr}`, error);
          throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }
      });
      
      console.log('📅 Date ranges:', dateRanges);
      
      // If multiple dates, use $or to match any of them
      if (dateRanges.length === 1) {
        availabilityConditions.date = {
          $gte: new Date(dateRanges[0].startOfDay),
          $lte: new Date(dateRanges[0].endOfDay)
        };
      } else {
        // Multiple dates - find records that have dates within any of the ranges
        availabilityConditions.$or = dateRanges.map(range => ({
          date: {
            $gte: new Date(range.startOfDay),
            $lte: new Date(range.endOfDay)
          }
        }));
      }
    }

    // Filter by event types (categories like "Corporate & Professional Events")
    if (eventTypes) {
      const eventTypesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      // Trim whitespace and newlines from event types
      const trimmedEventTypes = eventTypesArray.map(type => type.trim());
      console.log('🎯 Event types (categories) before trimming:', eventTypesArray);
      console.log('🎯 Event types (categories) after trimming:', trimmedEventTypes);
      
      // Use regex for partial matching instead of exact matching
      availabilityConditions['eventTypes.category'] = { 
        $regex: trimmedEventTypes.join('|'), 
        $options: 'i' 
      };
    }

    // Filter by events (specific event names like "Conferences & Summits")
    // Support both 'events' and 'subTypes' parameters for backward compatibility
    const eventsToFilter = events || subTypes;
    if (eventsToFilter) {
      const eventsArray = Array.isArray(eventsToFilter) ? eventsToFilter : [eventsToFilter];
      // Trim whitespace and newlines from events
      const trimmedEvents = eventsArray.map(event => event.trim());
      console.log('🎯 Events (specific names) before trimming:', eventsArray);
      console.log('🎯 Events (specific names) after trimming:', trimmedEvents);
      
      // Use regex for partial matching instead of exact matching
      availabilityConditions['eventTypes.events.name'] = { 
        $regex: trimmedEvents.join('|'), 
        $options: 'i' 
      };
    }

    // Filter by delivery modes
    if (deliveryModes) {
      const modesArray = Array.isArray(deliveryModes) ? deliveryModes : [deliveryModes];
      // Trim whitespace and newlines from delivery modes
      const trimmedModes = modesArray.map(mode => mode.trim());
      console.log('🎯 Delivery modes before trimming:', modesArray);
      console.log('🎯 Delivery modes after trimming:', trimmedModes);
      
      // Use regex for partial matching instead of exact matching
      availabilityConditions.modes = { 
        $regex: trimmedModes.join('|'), 
        $options: 'i' 
      };
    }

    // Filter by time slots - check if speaker's available time overlaps with requested time
    if (requestedStartTime && requestedEndTime && requestedStartTime.trim() && requestedEndTime.trim()) {
      console.log('⏰ Time slot filtering requested:', { requestedStartTime, requestedEndTime });
      
      // For time slot filtering, we need to use aggregation pipeline approach
      // since $expr cannot be used inside $elemMatch
      // We'll filter time slots at the aggregation level instead
      console.log('⏰ Time slot filter will be applied in aggregation pipeline');
    }

    // Filter by fee range - handle this separately as it requires different logic
    let feeFilter = null;
    if (minFee || maxFee) {
      // Only apply fee filter if user has actually set a meaningful fee range
      // If minFee=0 and maxFee=10000, it's likely the default values, so skip fee filtering
      const minFeeNum = parseInt(minFee);
      const maxFeeNum = parseInt(maxFee);
      
      // Skip fee filtering if it's the default range (0-10000) as it's too restrictive
      if (!(minFeeNum === 0 && maxFeeNum === 10000)) {
        const feeConditions = {};
        if (minFee && minFeeNum > 0) {
          feeConditions['eventTypes.events.price'] = { $gte: minFeeNum };
        }
        if (maxFee && maxFeeNum < 10000) {
          if (feeConditions['eventTypes.events.price']) {
            feeConditions['eventTypes.events.price'].$lte = maxFeeNum;
          } else {
            feeConditions['eventTypes.events.price'] = { $lte: maxFeeNum };
          }
        }
        feeFilter = feeConditions;
        console.log('🔍 Applied fee filter:', feeFilter);
      } else {
        console.log('🔍 Skipping fee filter - default range detected (0-10000)');
      }
    }

    // Handle combining $or conditions if we have multiple date ranges
    if (availabilityConditions.$or && Object.keys(availabilityConditions).length > 1) {
      // If we have other conditions besides $or, we need to restructure
      const orConditions = availabilityConditions.$or;
      delete availabilityConditions.$or;
      
      // Create a new $and condition to combine date ranges with other filters
      availabilityConditions.$and = [
        { $or: orConditions },
        ...Object.keys(availabilityConditions).map(key => ({
          [key]: availabilityConditions[key]
        }))
      ];
      
      // Clear the individual conditions since they're now in $and
      Object.keys(availabilityConditions).forEach(key => {
        if (key !== '$and') {
          delete availabilityConditions[key];
        }
      });
    }

    console.log('🔍 Final availability conditions:', JSON.stringify(availabilityConditions, null, 2));
    console.log('🔍 Fee filter:', feeFilter);
    console.log('🔍 Query parameters received:', {
      availabilityDate,
      eventTypes,
      events,
      subTypes,
      minFee,
      maxFee,
      deliveryModes,
      requestedStartTime,
      requestedEndTime,
      yearsOfExperience,
      location,
      expertise,
      topics
    });

    // For debugging: Get all availability records to see what we have
    const allAvailabilityRecords = await Availability.find({})
      .select('userId date eventTypes modes timeSlots');
    console.log('🔍 All availability records in database:', allAvailabilityRecords.length);
    allAvailabilityRecords.forEach((record, index) => {
      console.log(`📅 Record ${index + 1}:`, {
        _id: record._id,
        userId: record.userId,
        date: record.date ? record.date.toISOString() : null,
        eventTypes: record.eventTypes
      });
    });

    // Check if the user exists in EnhancedUser collection
    const userIdToCheck = '68c9829eb4953beaec50e44a';
    const userExists = await EnhancedUser.findById(userIdToCheck);
    console.log('👤 User exists check:', {
      userId: userIdToCheck,
      exists: !!userExists,
      role: userExists?.role,
      firstName: userExists?.firstName,
      lastName: userExists?.lastName
    });

    // Direct database check for the specific availability record
    const directAvailabilityCheck = await Availability.findById('68cb1ae91ed115482669cf92');
    console.log('🔍 Direct availability record check:', {
      _id: directAvailabilityCheck?._id,
      userId: directAvailabilityCheck?.userId,
      date: directAvailabilityCheck?.date ? directAvailabilityCheck.date.toISOString() : null
    });

    // Combine availability conditions with fee filter if present
    let finalAvailabilityConditions = { ...availabilityConditions };
    if (feeFilter) {
      // If we have existing conditions, combine them with $and
      if (Object.keys(finalAvailabilityConditions).length > 0) {
        finalAvailabilityConditions = {
          $and: [
            finalAvailabilityConditions,
            feeFilter
          ]
        };
      } else {
        finalAvailabilityConditions = feeFilter;
      }
    }

    console.log('🔍 DEBUG: Checking if fee filter is too restrictive');
    console.log('🔍 Fee filter conditions:', feeFilter);
    console.log('🔍 Min fee:', minFee, 'Max fee:', maxFee);
    
    // If fee filter is too restrictive (minFee=0, maxFee=10000), let's check what prices exist
    if (minFee === '0' && maxFee === '10000') {
      console.log('🔍 Fee filter might be too restrictive, checking actual prices in database...');
      const allPrices = await Availability.find({})
        .select('eventTypes')
        .lean();
      
      const allEventPrices = allPrices.flatMap(record => 
        record.eventTypes?.flatMap(eventType => 
          eventType.events?.map(event => event.price) || []
        ) || []
      );
      
      console.log('🔍 All prices in database:', allEventPrices);
      console.log('🔍 Min price in DB:', Math.min(...allEventPrices));
      console.log('🔍 Max price in DB:', Math.max(...allEventPrices));
    }

    console.log('🔍 Final availability conditions with fee filter:', JSON.stringify(finalAvailabilityConditions, null, 2));

    // Build aggregation pipeline for availability records
    const pipeline = [
      // Match basic conditions (date, eventTypes, deliveryModes, etc.)
      { $match: finalAvailabilityConditions },
      
      // Lookup speakers
      {
        $lookup: {
          from: 'enhancedusers',
          localField: 'userId',
          foreignField: '_id',
          as: 'speaker',
          pipeline: [
            { $match: { role: 'speaker' } },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                profileImageUrl: 1,
                bio: 1,
                professionalTitle: 1,
                location: 1,
                areaOfExpertise: 1,
                yearsOfExperience: 1,
                roleSpecificData: 1,
                isProfileComplete: 1,
                createdAt: 1,
                role: 1
              }
            }
          ]
        }
      },
      
      // Filter out records without speakers
      { $match: { 'speaker.0': { $exists: true } } },
      
      // Unwind speaker array
      { $unwind: '$speaker' }
    ];

    // Add time slot filtering if requested
    if (requestedStartTime && requestedEndTime && requestedStartTime.trim() && requestedEndTime.trim()) {
      // Convert time strings to comparable format (HH:MM)
      const parseTime = (timeStr) => {
        const time = timeStr.trim();
        const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
        return hours * 60 + minutes; // Convert to minutes since midnight
      };
      
      const requestedStart = parseTime(requestedStartTime);
      const requestedEnd = parseTime(requestedEndTime);
      
      console.log('⏰ Parsed time range (minutes):', { requestedStart, requestedEnd });
      
      // Add time slot filtering stage
      pipeline.push({
        $addFields: {
          matchingTimeSlots: {
            $filter: {
              input: '$timeSlots',
              as: 'slot',
              cond: {
                $and: [
                  { $ne: ['$$slot.startTime', null] },
                  { $ne: ['$$slot.endTime', null] },
                  {
                    $let: {
                      vars: {
                        speakerStart: {
                          $add: [
                            { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$$slot.startTime', ':'] }, 0] } }, 60] },
                            { $toInt: { $arrayElemAt: [{ $split: ['$$slot.startTime', ':'] }, 1] } }
                          ]
                        },
                        speakerEnd: {
                          $add: [
                            { $multiply: [{ $toInt: { $arrayElemAt: [{ $split: ['$$slot.endTime', ':'] }, 0] } }, 60] },
                            { $toInt: { $arrayElemAt: [{ $split: ['$$slot.endTime', ':'] }, 1] } }
                          ]
                        }
                      },
                      in: {
                        $and: [
                          { $lte: ['$$speakerStart', requestedEnd] }, // Speaker starts before or at requested end
                          { $gte: ['$$speakerEnd', requestedStart] }  // Speaker ends after or at requested start
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      });
      
      // Only include records that have matching time slots
      pipeline.push({
        $match: {
          'matchingTimeSlots.0': { $exists: true }
        }
      });
      
      console.log('⏰ Time slot filter added to aggregation pipeline');
    }

    // Get availability records using aggregation
    const availabilityRecords = await Availability.aggregate(pipeline);

    console.log('🔍 Availability records found:', availabilityRecords.length);
    console.log('🔍 Sample availability record:', availabilityRecords[0]);

    // Extract unique speaker IDs from aggregation results
    const validAvailabilityRecords = availabilityRecords.filter(record => {
      if (!record.speaker) {
        console.log('⚠️ Found availability record with null speaker:', record._id);
        return false;
      }
      if (!record.speaker._id) {
        console.log('⚠️ Found availability record with speaker but no _id:', record._id, record.speaker);
        return false;
      }
      return true;
    });

    console.log('✅ Valid availability records:', validAvailabilityRecords.length);
    const availableSpeakerIds = [...new Set(validAvailabilityRecords.map(record => record.speaker._id.toString()))];
    console.log('🎯 Available speaker IDs:', availableSpeakerIds);

    // Alternative approach: If no valid records from aggregation, try direct userId matching
    if (validAvailabilityRecords.length === 0 && availabilityRecords.length > 0) {
      console.log('🔄 Trying alternative approach - direct userId matching');
      
      // Get all userIds from availability records (even if aggregation failed)
      const allAvailabilityUserIds = [...new Set(availabilityRecords.map(record => record.userId?.toString()).filter(Boolean))];
      console.log('🔄 All availability userIds:', allAvailabilityUserIds);
      
      // Find speakers that match these userIds
      const speakersFromAvailability = await EnhancedUser.find({
        _id: { $in: allAvailabilityUserIds },
        role: 'speaker'
      }).select('-password -__v');
      
      console.log('🔄 Speakers found from availability userIds:', speakersFromAvailability.length);
      
      // Update availableSpeakerIds with the found speakers
      const foundSpeakerIds = speakersFromAvailability.map(speaker => speaker._id.toString());
      console.log('🔄 Found speaker IDs:', foundSpeakerIds);
      
      // Use these speakers for the rest of the logic
      const availableSpeakers = allSpeakers.filter(speaker => 
        foundSpeakerIds.includes(speaker._id.toString())
      );
      
      console.log('👥 Available speakers after alternative approach:', availableSpeakers.length);
      
      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedSpeakers = availableSpeakers.slice(skip, skip + parseInt(limit));
      const totalCount = availableSpeakers.length;

      // Format response data
      const formattedSpeakers = paginatedSpeakers.map(speaker => ({
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt,
        availability: {
          dates: availabilityRecords.map(record => record.date),
          eventTypes: availabilityRecords.flatMap(record => record.eventTypes),
          modes: [...new Set(availabilityRecords.flatMap(record => record.modes))],
          timeSlots: availabilityRecords.flatMap(record => record.timeSlots)
        }
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        message: `Found ${totalCount} available speaker(s) matching criteria (alternative approach)`,
        data: {
          speakers: formattedSpeakers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          },
          filters: {
            availabilityDate,
            eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
            events: Array.isArray(events) ? events : (events ? [events] : []),
            subTypes: Array.isArray(subTypes) ? subTypes : (subTypes ? [subTypes] : []),
            minFee: minFee ? parseInt(minFee) : null,
            maxFee: maxFee ? parseInt(maxFee) : null,
            deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
            requestedStartTime,
            requestedEndTime,
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
            location,
            expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
            topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
          }
        }
      });
    }

    // Filter speakers based on availability
    const availableSpeakers = allSpeakers.filter(speaker => 
      availableSpeakerIds.includes(speaker._id.toString())
    );

    console.log('👥 All speakers matching basic criteria:', allSpeakers.length);
    console.log('👥 Available speakers after filtering:', availableSpeakers.length);

    // If no speakers found with availability filters, return empty result
    if (availableSpeakers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No speakers found matching the availability criteria',
        data: {
          speakers: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: parseInt(limit)
          },
          filters: {
            availabilityDate,
            eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
            events: Array.isArray(events) ? events : (events ? [events] : []),
            subTypes: Array.isArray(subTypes) ? subTypes : (subTypes ? [subTypes] : []),
            minFee: minFee ? parseInt(minFee) : null,
            maxFee: maxFee ? parseInt(maxFee) : null,
            deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
            requestedStartTime,
            requestedEndTime,
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
            location,
            expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
            topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
          }
        }
      });
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSpeakers = availableSpeakers.slice(skip, skip + parseInt(limit));
    const totalCount = availableSpeakers.length;

    // Format response data with availability information
    const formattedSpeakers = paginatedSpeakers.map(speaker => {
      // Find availability records for this speaker
      const speakerAvailability = validAvailabilityRecords.filter(record => 
        record.userId && record.userId._id && record.userId._id.toString() === speaker._id.toString()
      );

      return {
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt,
        availability: {
          dates: speakerAvailability.map(record => record.date),
          eventTypes: speakerAvailability.flatMap(record => record.eventTypes),
          modes: [...new Set(speakerAvailability.flatMap(record => record.modes))],
          timeSlots: speakerAvailability.flatMap(record => record.timeSlots)
        }
      };
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: `Found ${totalCount} available speaker(s) matching criteria`,
      data: {
        speakers: formattedSpeakers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        filters: {
          availabilityDate,
          eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
          events: Array.isArray(events) ? events : (events ? [events] : []),
          minFee: minFee ? parseInt(minFee) : null,
          maxFee: maxFee ? parseInt(maxFee) : null,
          deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          location,
          expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
          topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
        }
      }
    });

  } catch (error) {
    console.error('Error searching speakers with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching speakers with filters',
      error: error.message
    });
  }
};

/**
 * Get available event types and sub types for filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableEventTypes = async (req, res) => {
  try {
    // Get all unique event types and events from availability records
    const eventTypesData = await Availability.aggregate([
      { $unwind: '$eventTypes' },
      { $unwind: '$eventTypes.events' },
      {
        $group: {
          _id: {
            category: '$eventTypes.category',
            event: '$eventTypes.events.name'
          },
          minPrice: { $min: '$eventTypes.events.price' },
          maxPrice: { $max: '$eventTypes.events.price' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          events: {
            $push: {
              name: '$_id.event',
              minPrice: '$minPrice',
              maxPrice: '$maxPrice',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Available event types retrieved successfully',
      data: eventTypesData
    });

  } catch (error) {
    console.error('Error getting available event types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting event types',
      error: error.message
    });
  }
};

/**
 * Get saved speakers for database view (with custom tags merged into areaOfExpertise)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSavedSpeakersForDatabase = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 20, tags } = req.query;

    console.log('📋 Fetching saved speakers for database view:', { organizerId, page, limit, tags });
    
    // First check if there are any saved speakers at all
    const totalSavedSpeakers = await SavedSpeaker.countDocuments({ organizer: organizerId, isActive: true });
    console.log(`📊 Total saved speakers for organizer ${organizerId}: ${totalSavedSpeakers}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = { organizer: organizerId, isActive: true };
    
    // Filter by tags if provided
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.customTags = { $in: tagArray };
    }

    // Get saved speakers with pagination
    const savedSpeakers = await SavedSpeaker.find(query)
      .populate({
        path: 'speaker',
        select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
      })
      .sort({ savedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const totalCount = await SavedSpeaker.countDocuments(query);

    // Format speakers for database view - merge custom tags with areaOfExpertise
    const formattedSpeakers = savedSpeakers.map(savedSpeaker => {
      const speaker = savedSpeaker.speaker;
      
      // Merge custom tags with areaOfExpertise
      const mergedExpertise = [
        ...(speaker.areaOfExpertise || []),
        ...(savedSpeaker.customTags || [])
      ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates

      return {
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: mergedExpertise, // Custom tags merged here
        originalAreaOfExpertise: speaker.areaOfExpertise, // Keep original for reference
        customTags: savedSpeaker.customTags, // Keep custom tags separate
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt,
        // Saved speaker specific data
        savedAt: savedSpeaker.savedAt,
        notes: savedSpeaker.notes,
        savedSpeakerId: savedSpeaker._id
      };
    });

    console.log(`✅ Found ${formattedSpeakers.length} saved speakers for database view`);
    console.log('📋 Formatted speakers sample:', formattedSpeakers.slice(0, 1));

    res.status(200).json({
      success: true,
      message: "Saved speakers for database retrieved successfully",
      data: {
        speakers: formattedSpeakers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNextPage: skip + formattedSpeakers.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching saved speakers for database:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saved speakers for database",
      error: error.message
    });
  }
};

/**
 * Get saved speakers with custom tags (for tag management)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSavedSpeakersWithTags = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    console.log('🏷️ Fetching saved speakers with tags:', { organizerId, page, limit });

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get saved speakers with pagination
    const savedSpeakers = await SavedSpeaker.find({ organizer: organizerId, isActive: true })
      .populate({
        path: 'speaker',
        select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
      })
      .sort({ savedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const totalCount = await SavedSpeaker.countDocuments({ organizer: organizerId, isActive: true });

    // Get all unique custom tags for this organizer
    const customTags = await SavedSpeaker.getOrganizerCustomTags(organizerId);

    console.log(`✅ Found ${savedSpeakers.length} saved speakers with ${customTags.length} custom tags`);

    res.status(200).json({
      success: true,
      message: "Saved speakers with tags retrieved successfully",
      data: {
        savedSpeakers,
        customTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNextPage: skip + savedSpeakers.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching saved speakers with tags:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saved speakers with tags",
      error: error.message
    });
  }
};
