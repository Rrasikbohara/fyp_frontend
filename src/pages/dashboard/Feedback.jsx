import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { HiStar, HiOutlineStar, HiUserCircle, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Feedback = ({ preselectedTrainer = null, onSubmitSuccess = null, onCancel = null, embedded = false }) => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [myCurrentPage, setMyCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [trainersRes, feedbackRes, myFeedbackRes] = await Promise.all([
          api.get('/trainers'),
          api.get('/feedback'),
          api.get('/feedback/user/' + JSON.parse(localStorage.getItem('userData') || '{}')._id)
        ]);

        const trainersList = trainersRes.data || [];
        setTrainers(trainersList);
        setFeedbacks(feedbackRes.data.feedback || []);
        setMyFeedbacks(myFeedbackRes.data.feedback || []);

        if (preselectedTrainer && preselectedTrainer._id) {
          setSelectedTrainer(preselectedTrainer._id);

          const trainerExists = trainersList.some(tr => tr._id === preselectedTrainer._id);
          if (!trainerExists) {
            console.warn('Preselected trainer not found in trainers list');
          }
        }
      } catch (error) {
        console.error('Failed to load feedback or trainers:', error);
        toast.error('Failed to load feedback or trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [preselectedTrainer]);

  const indexOfLastFeedback = currentPage * itemsPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - itemsPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);

  const myIndexOfLastFeedback = myCurrentPage * itemsPerPage;
  const myIndexOfFirstFeedback = myIndexOfLastFeedback - itemsPerPage;
  const currentMyFeedbacks = myFeedbacks.slice(myIndexOfFirstFeedback, myIndexOfLastFeedback);
  const myTotalPages = Math.ceil(myFeedbacks.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToMyPage = (pageNumber) => {
    setMyCurrentPage(Math.max(1, Math.min(pageNumber, myTotalPages)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTrainer) {
      toast.error('Please select a valid trainer');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    if (!review.trim() || review.trim().length < 3) {
      toast.error('Review must be at least 3 characters');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/feedback', {
        trainer: selectedTrainer,
        rating,
        review: review.trim()
      });

      toast.success('Feedback submitted successfully!');

      setRating(0);
      setReview('');
      if (!preselectedTrainer) {
        setSelectedTrainer('');
      }

      if (!embedded) {
        const feedbackRes = await api.get('/feedback');
        const myFeedbackRes = await api.get('/feedback/user/' + JSON.parse(localStorage.getItem('userData') || '{}')._id);
        setFeedbacks(feedbackRes.data.feedback || []);
        setMyFeedbacks(myFeedbackRes.data.feedback || []);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage <= 3) {
        pageNumbers.push(2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === 'number' && onPageChange(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-blue-600 text-white'
                : number === '...'
                  ? 'cursor-default'
                  : 'bg-gray-100 hover:bg-gray-200'
            }`}
            disabled={number === '...'}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="ml-4 p-1 border rounded-md text-sm"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={15}>15 per page</option>
        </select>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {preselectedTrainer ? (
          <div>
            <label className="block font-medium mb-1">Trainer</label>
            <div className="p-2 bg-gray-50 border rounded-md">
              {preselectedTrainer.name || 'Selected Trainer'}
            </div>
            <input type="hidden" value={selectedTrainer} />
          </div>
        ) : (
          <div>
            <label className="block font-medium mb-1">Trainer <span className="text-red-500">*</span></label>
            <select
              value={selectedTrainer}
              onChange={e => setSelectedTrainer(e.target.value)}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select a trainer</option>
              {trainers.map(tr => (
                <option key={tr._id} value={tr._id}>{tr.name} ({tr.specialization})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Rating <span className="text-red-500">*</span></label>
          <div className="flex items-center space-x-1">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                className="text-3xl focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                {(hover || rating) >= star ? (
                  <HiStar className="text-yellow-400" />
                ) : (
                  <HiOutlineStar className="text-gray-400" />
                )}
              </button>
            ))}
            <span className="ml-2 text-gray-600">{rating > 0 ? `${rating}/5` : ''}</span>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Review <span className="text-red-500">*</span></label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Share your experience with this trainer..."
            minLength={3}
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-400 text-right">{review.length}/500</div>
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || rating === 0 || !review.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">Trainer Feedback</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Leave Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Trainer</label>
            <select
              value={selectedTrainer}
              onChange={e => setSelectedTrainer(e.target.value)}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select a trainer</option>
              {trainers.map(tr => (
                <option key={tr._id} value={tr._id}>{tr.name} ({tr.specialization})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Rating</label>
            <div className="flex items-center space-x-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  className="text-3xl focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  {(hover || rating) >= star ? (
                    <HiStar className="text-yellow-400" />
                  ) : (
                    <HiOutlineStar className="text-gray-400" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-gray-600">{rating > 0 ? `${rating}/5` : ''}</span>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Review</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Share your experience..."
              minLength={3}
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-400 text-right">{review.length}/500</div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">My Feedback</h2>
        {myFeedbacks.length === 0 ? (
          <p className="text-gray-500">You haven't submitted any feedback yet.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentMyFeedbacks.map(fb => (
                <li key={fb._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <HiUserCircle className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{fb.trainer?.name || 'Trainer'}</div>
                        <div className="text-xs text-gray-500">{fb.trainer?.specialization}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map(star => (
                          <span key={star}>
                            {fb.rating >= star ? <HiStar className="text-yellow-400" /> : <HiOutlineStar className="text-gray-300" />}
                          </span>
                        ))}
                        <span className="ml-2 text-gray-600">{fb.rating}/5</span>
                      </div>

                      <div className="text-xs text-gray-400 ml-2">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </div>

                      <div className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                        {fb.status === 'approved' ? 'Approved' : fb.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{fb.review}"
                  </div>
                </li>
              ))}
            </ul>

            {myTotalPages > 1 && (
              <Pagination
                currentPage={myCurrentPage}
                totalPages={myTotalPages}
                onPageChange={goToMyPage}
              />
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">All Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback available yet.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentFeedbacks.map(fb => (
                <li key={fb._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <HiUserCircle className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{fb.trainer?.name || 'Trainer'}</div>
                        <div className="text-xs text-gray-500">{fb.trainer?.specialization}</div>
                        <div className="text-xs text-gray-500">by {fb.user?.name || 'User'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map(star => (
                          <span key={star}>
                            {fb.rating >= star ? <HiStar className="text-yellow-400" /> : <HiOutlineStar className="text-gray-300" />}
                          </span>
                        ))}
                        <span className="ml-2 text-gray-600">{fb.rating}/5</span>
                      </div>

                      <div className="text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{fb.review}"
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
