import axios from "axios";

import type {
    LoanApplication,
    PredictionResponse,
    ValidationResponse,
} from "../types/loan";

import type {
    ChatRequest,
    ChatResponse,
    SuggestionsResponse,
} from "../types/assistant";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export const predictLoan = async (
    application: LoanApplication
): Promise<PredictionResponse> => {
    const response = await api.post<PredictionResponse>(
        "/predict",
        application
    );

    return response.data;
};

export const validateLoan = async (
    application: LoanApplication
): Promise<ValidationResponse> => {
    const response = await api.post<ValidationResponse>(
        "/validate",
        application
    );

    return response.data;
};

export const checkHealth = async () => {
    const response = await api.get("/health");

    return response.data;
};

export const checkModelStatus = async () => {
    const response = await api.get("/model-status");

    return response.data;
};

export const sendAssistantMessage = async (
    request: ChatRequest
): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>(
        "/assistant/chat",
        request
    );

    return response.data;
};

export const fetchAssistantSuggestions = async (): Promise<SuggestionsResponse> => {
    const response = await api.get<SuggestionsResponse>(
        "/assistant/suggestions"
    );

    return response.data;
};

export default api;