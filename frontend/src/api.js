const API_BASE = "http://localhost:5001/api";

async function getJson(path) {
    const response = await fetch(`${API_BASE}${path}`);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

export const api = {
    getEvaluation: () => getJson('/evaluation'),
    getRules: () => getJson('/rules'),
    getIssues: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value);
            }
        });

        const query = params.toString();
        const path = `/issues${query ? `?${query}` : ""}`;

        return getJson(path);
    }
};