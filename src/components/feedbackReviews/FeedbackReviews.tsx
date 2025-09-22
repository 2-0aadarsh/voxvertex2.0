'use client';

import { useState } from 'react';
import { Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import FeedbackReviewItem from './FeedbackReviewItem';
import AddFeedbackModal from './AddFeedbackModal';

interface Review {
  id: string;
  reviewerName: string;
  reviewerTitle: string;
  reviewerCompany: string;
  reviewerImage?: string;
  rating: number;
  reviewText: string;
  date: string;
  verified?: boolean;
}

interface FeedbackReviewsProps {
  className?: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  showAddButton?: boolean;
  onAddReview?: (review: Omit<Review, 'id' | 'date'>) => void;
}

const FeedbackReviews: React.FC<FeedbackReviewsProps> = ({
  className = '',
  reviews = [],
  averageRating = 4.8,
  totalReviews = 24,
  showAddButton = true,
  onAddReview
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 3;

  // Mock data for demonstration
  const mockReviews: Review[] = reviews.length > 0 ? reviews : [
    {
      id: '1',
      reviewerName: 'Alex Thompson',
      reviewerTitle: 'CEO',
      reviewerCompany: 'TechCorp',
      rating: 5,
      reviewText: 'John organized our annual conference flawlessly. Exceptional attention to detail and professional execution.',
      date: 'Dec 2024',
      verified: true
    },
    {
      id: '2',
      reviewerName: 'Sarah Johnson',
      reviewerTitle: 'Event Manager',
      reviewerCompany: 'InnovateLabs',
      rating: 5,
      reviewText: 'Outstanding speaker with deep industry knowledge. The presentation was engaging and provided valuable insights.',
      date: 'Nov 2024',
      verified: true
    },
    {
      id: '3',
      reviewerName: 'Michael Chen',
      reviewerTitle: 'Marketing Director',
      reviewerCompany: 'GrowthCo',
      rating: 4,
      reviewText: 'Professional and reliable. The event was well-organized and exceeded our expectations.',
      date: 'Oct 2024',
      verified: false
    }
  ];

  const totalPages = Math.ceil(mockReviews.length / reviewsPerPage);
  const currentReviews = mockReviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const handleAddReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    if (onAddReview) {
      onAddReview(reviewData);
    }
    setIsAddModalOpen(false);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-orange-500 fill-orange-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className={`w-[1154px] bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Feedback & Reviews
            </h2>
            
            {/* Rating Summary */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {renderStars(Math.floor(averageRating), 'lg')}
                <span className="text-lg font-semibold text-gray-900">
                  {averageRating}/5
                </span>
              </div>
              <span className="text-gray-600">
                ({totalReviews} reviews)
              </span>
            </div>
          </div>

          {/* Add Feedback Button */}
          {showAddButton && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-6">
        {currentReviews.length > 0 ? (
          <div className="space-y-6">
            {currentReviews.map((review, index) => (
              <div key={review.id}>
                <FeedbackReviewItem review={review} />
                {index < currentReviews.length - 1 && (
                  <div className="mt-6 border-t border-gray-100"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience
            </p>
            {showAddButton && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Review</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    i === currentPage
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add Feedback Modal */}
      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddReview}
      />
    </div>
  );
};

export default FeedbackReviews;
