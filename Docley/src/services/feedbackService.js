import { API_BASE_URL, getAuthHeaders } from '../api/client';

/**
 * Feedback Service
 * Handles submitting user feedback to the database via NestJS Backend
 */

const API_URL = `${API_BASE_URL}/feedback`;

export async function submitFeedback(rating, message) {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, message }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit feedback');
    }

    return await response.json();
}

export async function getAllFeedback() {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch feedback');
    }

    return await response.json();
}