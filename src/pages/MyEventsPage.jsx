import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateTime: '',
    category: 'other',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const categories = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/events/user/created');
      setEvents(response.data.events);
    } catch (err) {
      setError('Failed to fetch your events');
      console.error('Fetch my events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event._id);
    setEditFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
      category: event.category,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/events/${editingEvent}`, editFormData);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === editingEvent ? response.data.event : event
        )
      );
      setEditingEvent(null);
      setEditFormData({
        title: '',
        description: '',
        location: '',
        dateTime: '',
        category: 'other',
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update event';
      alert(message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      setDeleteConfirm(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete event';
      alert(message);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="mt-2 text-gray-600">
              Manage and track your created events
            </p>
          </div>
          <Link to="/add-event" className="btn-primary">
            Create New Event
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No events yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first event.
            </p>
            <div className="mt-6">
              <Link to="/add-event" className="btn-primary">
                Create Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event._id} className="card p-6">
                {editingEvent === event._id ? (
                  /* Edit Form */
                  <form onSubmit={handleUpdateEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="edit-title"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="edit-title"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-category"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          id="edit-category"
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditChange}
                          className="input-field">
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="edit-description"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        name="description"
                        rows={3}
                        value={editFormData.description}
                        onChange={handleEditChange}
                        className="input-field resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="edit-location"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="edit-location"
                          name="location"
                          value={editFormData.location}
                          onChange={handleEditChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-dateTime"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Date and Time
                        </label>
                        <input
                          type="datetime-local"
                          id="edit-dateTime"
                          name="dateTime"
                          value={editFormData.dateTime}
                          onChange={handleEditChange}
                          min={getMinDateTime()}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(null)}
                        className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Event Display */
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {event.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="flex-shrink-0 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            by {event.creatorName}
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="flex-shrink-0 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDateTime(event.dateTime)}
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="flex-shrink-0 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {event.location}
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="flex-shrink-0 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {event.attendeeCount} attendees
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(event)}
                          className="btn-secondary text-sm py-1 px-3">
                          Update
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(event._id)}
                          className="btn-danger text-sm py-1 px-3">
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Delete Event
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this event? This action cannot
                  be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(deleteConfirm)}
                    className="btn-danger flex-1">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
