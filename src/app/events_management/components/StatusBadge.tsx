'use client';
import React from 'react';
import { Clock, Star, AlertCircle, Calendar, XCircle } from 'lucide-react';
import { EventStatus, StatusConfig } from '../types';

interface StatusBadgeProps {
  status: EventStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<EventStatus, StatusConfig> = {
    'Upcoming': { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
    'Completed': { bg: 'bg-green-50', text: 'text-green-700', icon: Star },
    'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', icon: AlertCircle },
    'Postponed': { bg: 'bg-purple-50', text: 'text-purple-700', icon: Calendar },
    'Postponed - Awaiting Action': { bg: 'bg-purple-50', text: 'text-purple-700', icon: Calendar },
    'Declined': { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 ${config.bg} ${config.text} px-3 py-1 rounded-full ${status === 'Postponed - Awaiting Action' ? 'text-sm' : ''}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium">{status}</span>
    </div>
  );
}