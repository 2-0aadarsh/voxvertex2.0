"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuArrowLeft } from 'react-icons/lu';

type NotificationType = 'Postponement' | 'Cancellation' | 'Update';
type NotificationPriority = 'High' | 'Medium' | 'Low';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  priority: NotificationPriority;
  responseRequired: string;
  status: 'read' | 'unread';
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Event Postponed - Action Required',
      message: 'All & Machine Learning Summit 2024 has been postponed to November 15, 2024. Please confirm your availability or request a refund.',
      time: '365d ago',
      type: 'Postponement',
      priority: 'High',
      responseRequired: 'Response required by 359d ago',
      status: 'unread'
    },
    {
      id: '2',
      title: 'Event Cancelled - Refund Available',
      message: 'Unfortunately, the Digital Marketing Masterclass has been cancelled due to unforeseen circumstances. You can request a full refund.',
      time: '363d ago',
      type: 'Cancellation',
      priority: 'High',
      responseRequired: 'Response required by 349d ago',
      status: 'unread'
    }
  ]);

  const router = useRouter();

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      status: 'read' as const
    }));
    setNotifications(updatedNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Notifications Content */}
        <div className="space-y-6">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`
                bg-white rounded-lg border border-gray-200/60 p-6 shadow-sm
                ${notification.status === 'unread' ? 'relative border-l-4 border-l-blue-500' : ''}
              `}
            >
              {/* Title and Time */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {notification.title}
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {notification.time}
                </span>
              </div>
              
              {/* Action Required Section */}
              <div className="mb-4">
                <div className="text-red-600 text-sm font-semibold mb-3">
                  • Action Required
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              {/* Type and Priority - Styled as badges */}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md uppercase tracking-wide">
                  {notification.type}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md uppercase tracking-wide">
                  {notification.priority}
                </span>
              </div>
              
              {/* Response Required */}
              <div className="text-sm text-gray-600 pt-3 border-t border-gray-100">
                {notification.responseRequired}
              </div>
            </div>
          ))}
        </div>
        
        {/* Divider and Mark All as Read Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <button 
              className="
                text-blue-600 font-medium text-sm hover:text-blue-800 
                transition-colors duration-200 underline
              "
              onClick={handleMarkAllAsRead}
              type="button"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg font-medium">
              No notifications
            </div>
            <p className="text-gray-500 mt-2">
              You're all caught up! Check back later for new notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;