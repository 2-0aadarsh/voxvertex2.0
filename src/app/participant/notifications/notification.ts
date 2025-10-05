// types/notification.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'Postponement' | 'Cancellation' | 'Update';
  priority: 'High' | 'Medium' | 'Low';
  responseRequired: string;
  status: 'read' | 'unread';
}

export type NotificationType = Notification['type'];
export type NotificationPriority = Notification['priority'];
export type NotificationStatus = Notification['status'];