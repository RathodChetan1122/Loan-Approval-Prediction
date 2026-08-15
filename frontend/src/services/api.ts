import axios from "axios";

import type {
    LoanApplication,
    MaxLoanEstimateResponse,
    PredictionResponse,
    ValidationResponse,
} from "../types/loan";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL is not configured. Please configure the frontend API URL."
    );
}

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

export const getMaxEligibleLoan = async (
    application: LoanApplication
): Promise<MaxLoanEstimateResponse> => {
    const response = await api.post<MaxLoanEstimateResponse>(
        "/max-eligible-loan",
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