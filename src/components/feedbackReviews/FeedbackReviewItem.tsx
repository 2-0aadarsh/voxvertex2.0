'use client';

import { Star, CheckCircle } from 'lucide-react';

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

interface FeedbackReviewItemProps {
  review: Review;
  className?: string;
}

const FeedbackReviewItem: React.FC<FeedbackReviewItemProps> = ({
  review,
  className = ''
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-orange-500 fill-orange-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${className}`}>
      {/* Reviewer Profile */}
      <div className="flex items-start space-x-4 mb-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {review.reviewerImage ? (
            <img
              src={review.reviewerImage}
              alt={review.reviewerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getInitials(review.reviewerName)}
              </span>
            </div>
          )}
        </div>

        {/* Reviewer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {review.reviewerName}
            </h4>
            {review.verified && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
            <span>{review.reviewerTitle}</span>
            <span>•</span>
            <span>{review.reviewerCompany}</span>
            <span>•</span>
            <span>{review.date}</span>
          </div>

          {/* Rating */}
          <div className="mb-3">
            {renderStars(review.rating)}
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="pl-16">
        <p className="text-gray-700 leading-relaxed">
          {review.reviewText}
        </p>
      </div>
    </div>
  );
};

export default FeedbackReviewItem;






