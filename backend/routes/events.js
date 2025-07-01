import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all events with search and filter
router.get('/', async (req, res) => {
  try {
    const {
      search,
      dateFilter,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Search by title
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Date filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter) {
      switch (dateFilter) {
        case 'today': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query.dateTime = {
            $gte: today,
            $lt: tomorrow,
          };
          break;
        }
        case 'current_week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          query.dateTime = {
            $gte: startOfWeek,
            $lt: endOfWeek,
          };
          break;
        }
        case 'last_week': {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(lastWeekStart);
          lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
          query.dateTime = {
            $gte: lastWeekStart,
            $lt: lastWeekEnd,
          };
          break;
        }
        case 'current_month': {
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
          );
          query.dateTime = {
            $gte: startOfMonth,
            $lt: endOfMonth,
          };
          break;
        }
        case 'last_month': {
          const lastMonthStart = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const lastMonthEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          query.dateTime = {
            $gte: lastMonthStart,
            $lt: lastMonthEnd,
          };
          break;
        }
      }
    }

    // Custom date range
    if (startDate && endDate) {
      query.dateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await Event.find(query)
      .populate('creator', 'name email photoURL')
      .sort({ dateTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events',
      error: error.message,
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email photoURL')
      .populate('attendees', 'name email photoURL');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event',
      error: error.message,
    });
  }
});

// Create new event
router.post(
  '/',
  auth,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('location')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Location must be between 3 and 200 characters'),
    body('dateTime')
      .isISO8601()
      .withMessage('Please enter a valid date and time')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Event date must be in the future');
        }
        return true;
      }),
    body('category')
      .optional()
      .isIn(['conference', 'workshop', 'meetup', 'webinar', 'social', 'other'])
      .withMessage(
        'Invalid category. Must be one of: conference, workshop, meetup, webinar, social, other'
      ),
  ],
  async (req, res) => {
    try {
      console.log('=== Event Creation Request ===');
      console.log('Request body:', req.body);
      console.log('User from auth middleware:', req.user);
      console.log('Headers:', req.headers);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { title, description, location, dateTime, category } = req.body;

      console.log('Creating event with data:', {
        title,
        description,
        location,
        dateTime,
        category,
        creator: req.user._id,
        creatorName: req.user.name,
      });

      const event = new Event({
        title,
        description,
        location,
        dateTime: new Date(dateTime),
        creator: req.user._id,
        creatorName: req.user.name,
        category: category || 'other', // Ensure category is set
      });

      await event.save();

      // Add event to user's created events
      await User.findByIdAndUpdate(req.user._id, {
        $push: { createdEvents: event._id },
      });

      const populatedEvent = await Event.findById(event._id).populate(
        'creator',
        'name email photoURL'
      );

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: populatedEvent,
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error.message,
      });
    }
  }
);

// Update event
router.put(
  '/:id',
  auth,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Location must be between 3 and 200 characters'),
    body('dateTime')
      .optional()
      .isISO8601()
      .withMessage('Please enter a valid date and time')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Event date must be in the future');
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Check if user is the creator
      if (event.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own events',
        });
      }

      const updates = req.body;
      if (updates.dateTime) {
        updates.dateTime = new Date(updates.dateTime);
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('creator', 'name email photoURL');

      res.json({
        success: true,
        message: 'Event updated successfully',
        event: updatedEvent,
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error.message,
      });
    }
  }
);

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own events',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Remove event from user's created events
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdEvents: req.params.id },
    });

    // Remove event from all users' joined events
    await User.updateMany(
      { joinedEvents: req.params.id },
      { $pull: { joinedEvents: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
});

// Join event
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user already joined
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this event',
      });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    // Add user to event attendees
    event.attendees.push(req.user._id);
    await event.save();

    // Add event to user's joined events
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate('creator', 'name email photoURL')
      .populate('attendees', 'name email photoURL');

    res.json({
      success: true,
      message: 'Successfully joined the event',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join event',
      error: error.message,
    });
  }
});

// Leave event
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is in attendees
    if (!event.attendees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not attending this event',
      });
    }

    // Remove user from event attendees
    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user._id.toString()
    );
    await event.save();

    // Remove event from user's joined events
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate('creator', 'name email photoURL')
      .populate('attendees', 'name email photoURL');

    res.json({
      success: true,
      message: 'Successfully left the event',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave event',
      error: error.message,
    });
  }
});

// Get user's created events
router.get('/user/created', auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id })
      .populate('creator', 'name email photoURL')
      .sort({ dateTime: -1 });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user events',
      error: error.message,
    });
  }
});

// Get user's joined events
router.get('/user/joined', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'joinedEvents',
      populate: {
        path: 'creator',
        select: 'name email photoURL',
      },
      options: { sort: { dateTime: -1 } },
    });

    res.json({
      success: true,
      events: user.joinedEvents,
    });
  } catch (error) {
    console.error('Get joined events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get joined events',
      error: error.message,
    });
  }
});

export default router;
