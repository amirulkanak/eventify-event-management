import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    creatorName: {
      type: String,
      required: [true, 'Creator name is required'],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [3, 'Location must be at least 3 characters long'],
      maxlength: [200, 'Location must not exceed 200 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: 'Event date must be in the future',
      },
    },
    attendeeCount: {
      type: Number,
      default: 0,
      min: [0, 'Attendee count cannot be negative'],
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxAttendees: {
      type: Number,
      default: null,
      min: [1, 'Maximum attendees must be at least 1'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    category: {
      type: String,
      enum: ['conference', 'workshop', 'meetup', 'webinar', 'social', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
eventSchema.index({ dateTime: -1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ creator: 1 });

// Virtual for formatted date
eventSchema.virtual('formattedDate').get(function () {
  return this.dateTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Update attendee count when attendees array changes
eventSchema.pre('save', function (next) {
  this.attendeeCount = this.attendees.length;
  next();
});

export default mongoose.model('Event', eventSchema);
