// src/controllers/disputeController.js
import mongoose from 'mongoose';
import Dispute from '../models/dispute.js';
import UserService from '../services/user.service.js';
import EventRegistration from '../models/eventRegister.js';
import Event from '../models/event.js';
import User from '../models/user.js'; // used in assignMediator etc.

/**
 * Create a dispute
 * - respondent can be:
 *    - a speaker: id is Event.speakers._id
 *    - a participant: id is registration.registrant.userId or registration.extras.userId
 *    - a regular user (fallback): lookup in UserService
 *
 * NOTE: This function preserves your other logic and only updates respondent detection.
 */
export const createDispute = async (req, res) => {
  try {
    console.log('--- Create Dispute Called ---');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    // embed complainant info (keeps behaviour you had)
    const complainantUser = req.user;
    const complainantData = {
      _id: complainantUser._id,
      firstName: complainantUser.firstName,
      lastName: complainantUser.lastName,
      email: complainantUser.email
    };

    const { title, description, category, priority, respondentId, eventId, disputeAmount,  disputeCurrency, respondentType  } = req.body;

    if (!title || !description || !category || !respondentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and respondent'
      });
    }
const parsedAmount = disputeAmount ? Number(disputeAmount) : 0;
    // Helper to convert id strings to ObjectId when valid
    const normalizeId = (id) => {
      if (!id) return id;
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      } catch {
        return id;
      }
    };

    const respondentValue = normalizeId(respondentId);
    const respondentStr = respondentId?.toString?.() || respondentId;

    // 1) Try find speaker in event.speakers (speaker._id)
    let respondent = null;
    let eventDoc = null;
    if (eventId) {
      eventDoc = await Event.findById(eventId).select('speakers').lean();
      if (eventDoc?.speakers?.length) {
        const matchedSpeaker = eventDoc.speakers.find(sp => sp.userId?.toString() === respondentStr.toString());
        if (matchedSpeaker) {
          // speaker object fields in your DB sample: name, email, title, bio, _id
          const name = matchedSpeaker.name || `${matchedSpeaker.firstName || ''} ${matchedSpeaker.lastName || ''}`.trim();
          respondent = {
            _id: matchedSpeaker.userId,
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: matchedSpeaker.email || null,
            extra: {
              title: matchedSpeaker.title || null,
              bio: matchedSpeaker.bio || null
            }
          };
        }
      }
    }

    // 2) If not speaker, check participants stored in EventRegistration (registrant.userId or extras.userId)
    if (!respondent) {
      // Query EventRegistration for the event if available; otherwise search across registrations containing the respondent
      const registrationQuery = eventId
        ? { event: eventId, $or: [{ 'registrant.userId': respondentValue }, { 'extras.userId': respondentValue }] }
        : { $or: [{ 'registrant.userId': respondentValue }, { 'extras.userId': respondentValue }] };

      const registration = await EventRegistration.findOne(registrationQuery).lean();
      if (registration) {
        // determine whether registrant or an extra matches
        if (registration.registrant?.userId?.toString() === respondentStr) {
          const r = registration.registrant;
          respondent = {
            _id: r.userId || r._id,
            firstName: r.name?.split(' ')[0] || r.name,
            lastName: r.name?.split(' ').slice(1).join(' ') || '',
            email: r.email || null,
            phone: r.phone || null
          };
        } else if (Array.isArray(registration.extras)) {
          const ex = registration.extras.find(e => e.userId?.toString() === respondentStr);
          if (ex) {
            respondent = {
              _id: ex.userId || ex._id,
              firstName: ex.name?.split(' ')[0] || ex.name,
              lastName: ex.name?.split(' ').slice(1).join(' ') || '',
              email: ex.email || null,
              phone: ex.phone || null
            };
          }
        }
      }
    }

    // 3) Fallback: try global user lookup (organizer / registered user)
    if (!respondent) {
      try {
        const result = await UserService.getUserById(respondentValue);
        if (result?.user) {
          respondent = {
            _id: result.user._id,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            phone: result.user.mobileNo || null
          };
        }
      } catch (err) {
        respondent = null;
      }
    }

    // If still not found -> return 404
    if (!respondent) {
      return res.status(404).json({
        success: false,
        message: `Respondent not found for ID ${respondentId}`,
        code: 'RESPONDENT_NOT_FOUND'
      });
    }

    // Generate dispute and save (keeping your existing shape / timeline / messages)
    const disputeId = `DSP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const dispute = new Dispute({
      disputeId,
      title,
      description,
      category,
      disputeAmount: parsedAmount || 0,
      disputeCurrency: disputeCurrency || 'INR',
      priority: priority || 'medium',
      complainant: complainantData,
      respondent,
      peerToPeerData: {
        startedAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      eventId // store event reference if present
    });

    dispute.timeline.push({
      action: 'Dispute created',
      performedBy: complainantData,
      details: 'Initial creation',
      stage: dispute.currentStage,
      timestamp: new Date()
    });

    dispute.messages.push({
      sender: complainantData,
      content: 'Dispute created successfully',
      messageType: 'message',
      timestamp: new Date()
    });

    const savedDispute = await dispute.save();

    console.log('✅ Dispute saved successfully:', savedDispute.disputeId);
    return res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      dispute: savedDispute
    });
  } catch (error) {
    console.error('❌ Create dispute error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all disputes for the current user
 *
 * This function handles both shapes:
 * - complainant/respondent stored as embedded objects with _id/name
 * - OR as ObjectId refs (older records)
 *
 * It enriches respondent (and complainant if required) for display.
 */
export const getUserDisputes = async (req, res) => {
  console.log('Current user:', req.user);
  try {
    const userId = req.user._id;
    const { status, stage, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build flexible $or that will match both embedded objects (_id) and plain ObjectId refs
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const orConditions = [
      { 'complainant._id': userObjectId },
      { 'respondent._id': userObjectId },
      { complainant: userObjectId },
      { respondent: userObjectId }
    ];

    const query = { $or: orConditions };

    if (status) query.status = status;
    if (stage) query.currentStage = stage;

    // fetch disputes (lean for faster handling)
    const disputes = await Dispute.find(query)
      .sort({ lastActivityAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Helper to normalize person-like values
    const extractPersonFromValue = async (val, eventId) => {
      // val may be:
      //  - embedded object: { _id, firstName, lastName, email, name }
      //  - objectId / string id
      //  - already null
      if (!val) return null;

      // If it's an object with firstName or name, use it:
      if (typeof val === 'object') {
        if (val.firstName || val.name || val._id) {
          const name = val.firstName ? `${val.firstName} ${val.lastName || ''}`.trim() : (val.name || '');
          return {
            _id: val._id || val.userId || null,
            firstName: (val.firstName || (val.name ? val.name.split(' ')[0] : null)) || 'N/A',
            lastName: (val.lastName || (val.name ? val.name.split(' ').slice(1).join(' ') : '')) || '',
            email: val.email || ''
          };
        }
      }

      // If it's an id (string/ObjectId), try to resolve to registration or event speaker or global user
      const idStr = val?.toString?.() || val;

      // 1) try registration (participant)
      const idForQuery = mongoose.Types.ObjectId.isValid(idStr) ? new mongoose.Types.ObjectId(idStr) : idStr;
      const reg = await EventRegistration.findOne({
        $or: [{ 'registrant.userId': idForQuery }, { 'extras.userId': idForQuery }]
      }).lean();

      if (reg) {
        let r;
        if (reg.registrant && reg.registrant.userId?.toString() === idStr) {
          r = reg.registrant;
        } else {
          r = reg.extras?.find(ex => ex.userId?.toString() === idStr);
        }
        if (r) {
          return {
            _id: r.userId || r._id,
            firstName: r.name?.split(' ')[0] || r.name || 'N/A',
            lastName: r.name ? r.name.split(' ').slice(1).join(' ') : '',
            email: r.email || ''
          };
        }
      }

      // 2) try event speaker if eventId provided
      if (eventId) {
        const ev = await Event.findById(eventId).select('speakers').lean();
        if (ev?.speakers?.length) {
          const s = ev.speakers.find(sp => sp._id?.toString() === idStr);
          if (s) {
            const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
            return {
              _id: s._id,
              firstName: (s.firstName || name.split(' ')[0]) || 'N/A',
              lastName: (s.lastName || name.split(' ').slice(1).join(' ')) || '',
              email: s.email || ''
            };
          }
        }
      }

      // 3) fallback: try global User
      try {
        const result = await UserService.getUserById(idForQuery);
        if (result?.user) {
          return {
            _id: result.user._id,
            firstName: result.user.firstName || 'N/A',
            lastName: result.user.lastName || '',
            email: result.user.email || ''
          };
        }
      } catch (err) {
        // swallow
      }

      return null;
    };

    // Enrich each dispute
    const formattedDisputes = await Promise.all(disputes.map(async (disp) => {
      // complainant may be embedded object or an id
      let complainant = null;
      if (disp.complainant) {
        complainant = await extractPersonFromValue(disp.complainant, disp.eventId);
      } else {
        complainant = { _id: null, firstName: 'N/A', lastName: '', email: '' };
      }

      // respondent may be embedded object or an id
      let respondent = null;
      if (disp.respondent) {
        respondent = await extractPersonFromValue(disp.respondent, disp.eventId);
      }

      // If still null, fallback to stored raw value (so frontend can decide)
      return {
        ...disp,
        complainant: complainant || { _id: null, firstName: 'N/A', lastName: '', email: '' },
        respondent: respondent || (typeof disp.respondent === 'object' ? disp.respondent : { _id: disp.respondent, firstName: 'N/A', lastName: '', email: '' })
      };
    }));

    // Debug logging (safe)
    formattedDisputes.forEach(fd => {
      console.log('Complainant:', `${fd.complainant.firstName} ${fd.complainant.lastName}`.trim());
      console.log('Respondent:', fd.respondent?.firstName ? `${fd.respondent.firstName} ${fd.respondent.lastName}`.trim() : 'N/A');
    });

    const total = await Dispute.countDocuments(query);

    res.json({
      success: true,
      disputes: formattedDisputes,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });

  } catch (error) {
    console.error('Get user disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/* ---------------------------
   The remaining handlers are unchanged,
   I kept them as-is but included here
   so you can drop this file in place.
   --------------------------- */

export const getDisputeById = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user._id;

    const dispute = await Dispute.findById(disputeId)
      .populate('complainant', 'firstName lastName email')
      .populate('respondent', 'firstName lastName email')
      .populate('mediationData.mediator', 'firstName lastName email')
      .populate('legalData.legalRepresentative', 'firstName lastName email')
      .populate('messages.sender', 'firstName lastName email')
      .populate('evidence.submittedBy', 'firstName lastName email')
      .populate('timeline.performedBy', 'firstName lastName email');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // authorization: allow complainant/respondent/mediator
    const isAuthorized =
      (dispute.complainant && dispute.complainant._id && dispute.complainant._id.equals && dispute.complainant._id.equals(userId)) ||
      (dispute.respondent && dispute.respondent._id && dispute.respondent._id.equals && dispute.respondent._id.equals(userId)) ||
      (dispute.mediationData?.mediator && dispute.mediationData.mediator._id && dispute.mediationData.mediator._id.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dispute'
      });
    }

    res.json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Get dispute by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { content, messageType = 'message', attachments = [] } = req.body;
    const userId = req.user._id;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const isAuthorized =
      (dispute.complainant && (dispute.complainant.equals ? dispute.complainant.equals(userId) : (dispute.complainant._id && dispute.complainant._id.toString() === userId.toString()))) ||
      (dispute.respondent && (dispute.respondent.equals ? dispute.respondent.equals(userId) : (dispute.respondent._id && dispute.respondent._id.toString() === userId.toString()))) ||
      (dispute.mediationData?.mediator && dispute.mediationData.mediator.equals && dispute.mediationData.mediator.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add messages to this dispute'
      });
    }

    dispute.addMessage(userId, content, messageType, attachments);
    dispute.addTimelineEntry(`Message added`, userId, `${messageType === 'message' ? 'Message' : messageType} added to dispute`);
    await dispute.save();

    await dispute.populate([
      { path: 'complainant', select: 'firstName lastName email' },
      { path: 'respondent', select: 'firstName lastName email' },
      { path: 'messages.sender', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Message added successfully',
      dispute
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const escalateDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const isAuthorized =
      (dispute.complainant && (dispute.complainant.equals ? dispute.complainant.equals(userId) : (dispute.complainant._id && dispute.complainant._id.toString() === userId.toString()))) ||
      (dispute.respondent && (dispute.respondent.equals ? dispute.respondent.equals(userId) : (dispute.respondent._id && dispute.respondent._id.toString() === userId.toString())));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Only dispute parties can escalate a dispute'
      });
    }

    if (dispute.currentStage === 'legal') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is already at the highest stage (legal)'
      });
    }

    const escalated = dispute.escalate(reason, userId);
    if (!escalated) {
      return res.status(400).json({
        success: false,
        message: 'Unable to escalate dispute'
      });
    }

    await dispute.save();

    await dispute.populate([
      { path: 'complainant', select: 'firstName lastName email' },
      { path: 'respondent', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: `Dispute escalated to ${dispute.currentStage} stage`,
      dispute
    });

  } catch (error) {
    console.error('Escalate dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const assignMediator = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { mediatorId } = req.body;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.currentStage !== 'mediation') {
      return res.status(400).json({
        success: false,
        message: 'Dispute must be in mediation stage to assign a mediator'
      });
    }

    const mediator = await User.findById(mediatorId);
    if (!mediator) {
      return res.status(404).json({
        success: false,
        message: 'Mediator not found'
      });
    }

    dispute.mediationData.mediator = mediatorId;
    await dispute.save();

    await dispute.addTimelineEntry(
      'Mediator assigned',
      req.user._id,
      `${mediator.firstName} ${mediator.lastName} assigned as mediator`
    );

    await dispute.populate([
      { path: 'complainant', select: 'firstName lastName email' },
      { path: 'respondent', select: 'firstName lastName email' },
      { path: 'mediationData.mediator', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Mediator assigned successfully',
      dispute
    });

  } catch (error) {
    console.error('Assign mediator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const {
      resolutionType,
      description,
      terms,
      compensationAmount,
      compensationCurrency = 'INR'
    } = req.body;
    const userId = req.user._id;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const isAuthorized =
      (dispute.complainant && (dispute.complainant.equals ? dispute.complainant.equals(userId) : (dispute.complainant._id && dispute.complainant._id.toString() === userId.toString()))) ||
      (dispute.respondent && (dispute.respondent.equals ? dispute.respondent.equals(userId) : (dispute.respondent._id && dispute.respondent._id.toString() === userId.toString()))) ||
      (dispute.mediationData?.mediator && dispute.mediationData.mediator.equals && dispute.mediationData.mediator.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this dispute'
      });
    }

    dispute.resolution = {
      type: resolutionType,
      description,
      terms,
      resolvedAt: new Date(),
      resolvedBy: userId
    };

    if (compensationAmount) {
      dispute.resolution.compensation = {
        amount: compensationAmount,
        currency: compensationCurrency
      };
    }

    dispute.status = 'resolved';

    switch (dispute.currentStage) {
      case 'peer-to-peer':
        dispute.peerToPeerData.isResolved = true;
        dispute.peerToPeerData.resolution = description;
        dispute.peerToPeerData.agreedTerms = terms;
        break;
      case 'mediation':
        dispute.mediationData.isResolved = true;
        dispute.mediationData.resolution = description;
        dispute.mediationData.agreement = terms;
        break;
      case 'legal':
        dispute.legalData.isResolved = true;
        dispute.legalData.verdict = description;
        break;
    }

    await dispute.save();

    await dispute.addTimelineEntry(
      'Dispute resolved',
      userId,
      `Dispute resolved via ${resolutionType} resolution`
    );

    await dispute.populate([
      { path: 'complainant', select: 'firstName lastName email' },
      { path: 'respondent', select: 'firstName lastName email' },
      { path: 'resolution.resolvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getDisputeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const userDisputes = await Dispute.find({
      $or: [
        { 'complainant._id': userId },
        { 'respondent._id': userId },
        { complainant: userId },
        { respondent: userId }
      ]
    });

    const stats = {
      total: userDisputes.length,
      byStatus: { active: 0, resolved: 0, escalated: 0, closed: 0 },
      byStage: { 'peer-to-peer': 0, 'mediation': 0, 'legal': 0 },
      asComplainant: userDisputes.filter(d => (d.complainant && d.complainant._id ? d.complainant._id.toString() === userId.toString() : (d.complainant && d.complainant.toString ? d.complainant.toString() === userId.toString() : false))).length,
      asRespondent: userDisputes.filter(d => (d.respondent && d.respondent._id ? d.respondent._id.toString() === userId.toString() : (d.respondent && d.respondent.toString ? d.respondent.toString() === userId.toString() : false))).length,
      averageResolutionTime: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    userDisputes.forEach(dispute => {
      stats.byStatus[dispute.status] = (stats.byStatus[dispute.status] || 0) + 1;
      stats.byStage[dispute.currentStage] = (stats.byStage[dispute.currentStage] || 0) + 1;

      if (dispute.status === 'resolved' && dispute.resolution?.resolvedAt) {
        resolvedCount++;
        const resolutionTime = new Date(dispute.resolution.resolvedAt) - new Date(dispute.createdAt);
        totalResolutionTime += resolutionTime;
      }
    });

    if (resolvedCount > 0) {
      stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24));
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get dispute stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const submitEvidence = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { title, description, files = [] } = req.body;
    const userId = req.user._id;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const isAuthorized =
      (dispute.complainant && (dispute.complainant.equals ? dispute.complainant.equals(userId) : (dispute.complainant._id && dispute.complainant._id.toString() === userId.toString()))) ||
      (dispute.respondent && (dispute.respondent.equals ? dispute.respondent.equals(userId) : (dispute.respondent._id && dispute.respondent._id.toString() === userId.toString())));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit evidence for this dispute' });
    }

    dispute.evidence.push({
      submittedBy: userId,
      title,
      description,
      files,
      submittedAt: new Date()
    });

    await dispute.save();
    await dispute.addTimelineEntry('Evidence submitted', userId, `Evidence "${title}" submitted`);

    res.json({
      success: true,
      message: 'Evidence submitted successfully',
      evidence: dispute.evidence[dispute.evidence.length - 1]
    });

  } catch (error) {
    console.error('Submit evidence error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
