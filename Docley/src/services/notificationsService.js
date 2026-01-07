import { API_BASE_URL, getAuthHeaders } from '../api/client';

const API_URL = `${API_BASE_URL}/notifications`;

export async function getNotifications() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(API_URL, { headers });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function markAsRead(id) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/${id}/read`, {
            method: 'PATCH',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

export async function markAllAsRead() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/read-all`, {
            method: 'PATCH',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to mark all as read');
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}
export async function deleteNotification(id) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to delete notification');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

export async function getUnreadCount() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/unread-count`, { headers });

        if (!response.ok) {
            throw new Error('Failed to fetch unread count');
        }

        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}
