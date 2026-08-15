import axios from "axios";

import type {
    LoanApplication,
    PredictionResponse,
    ValidationResponse,
} from "../types/loan";

const PRIMARY_API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const FALLBACK_API_URL = PRIMARY_API_URL.includes("8000")
  ? "http://localhost:8001"
  : "http://localhost:8000";

const api = axios.create({
    baseURL: PRIMARY_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 8000,
});

export const predictLoan = async (
    application: LoanApplication
): Promise<PredictionResponse> => {
    try {
        const response = await api.post<PredictionResponse>(
            "/predict",
            application
        );
        return response.data;
    } catch (primaryError) {
        // If local dev server is running on fallback port (e.g. 8001 vs 8000)
        try {
            const fallbackResponse = await axios.post<PredictionResponse>(
                `${FALLBACK_API_URL}/predict`,
                application,
                {
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    timeout: 8000,
                }
            );
            return fallbackResponse.data;
        } catch {
            throw primaryError;
        }
    }
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