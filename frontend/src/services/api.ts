import axios from "axios";

import type {
    LoanApplication,
    PredictionResponse,
    ValidationResponse,
} from "../types/loan";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
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

export default api;