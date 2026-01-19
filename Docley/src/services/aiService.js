import apiClient from '../api/client';

/**
 * Generic function to call the AI endpoint.
 * @param {string} text - The input text
 * @param {string} instruction - Specific instructions for the AI
 * @param {string} mode - 'diagnostic' or 'upgrade'
 */
export const transformDocument = async (text, instruction, mode = 'upgrade', documentId = null) => {
    try {
        const response = await apiClient.post('/ai/transform', { text, instruction, mode, documentId });
        const data = response.data;

        if (mode === 'upgrade' || mode === 'transform') {
            return data.result;
        }

        return data;
    } catch (error) {
        throw new Error('Failed to process AI request: ' + (error.response?.data?.message || error.message));
    }
};

/**
 * FEATURE: Upgrade
 * Improves the text academically.
 */
export const upgradeDocument = async (text, documentId = null, length = null) => {
    let instruction = "Analyze the text and rewrite it to be more academically rigorous. Expand on the context, provide deeper elaboration on key points, and ensure the tone is scholarly.";
    if (length) {
        instruction += ` The desired length/type for this output is: ${length}. Please adjust the depth and detail accordingly.`;
    }
    return transformDocument(text, instruction, 'upgrade', documentId);
};

/**
 * FEATURE: Diagnostic
 * Returns scores and insights.
 */
export const analyzeDocument = async (text, documentId = null) => {
    return transformDocument(text, '', 'diagnostic', documentId);
};
