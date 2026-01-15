export type NotificationPriority = 'critical' | 'normal' | 'minimal';
export type NotificationActionType = 'upgrade' | 'retry' | 'navigate';

export interface NotificationAction {
    label: string;
    type: NotificationActionType;
    payload?: any;
}

export interface Notification {
    code: string;
    message: string;
    priority: NotificationPriority;
    action?: NotificationAction;
    ttl?: number | null;
}
