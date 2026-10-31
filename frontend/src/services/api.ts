import type {
  StudentInput,
  PredictionResult,
  DatasetStats,
  HealthStatus,
  ResumeExtractionResponse,
} from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function getDatasetStats(): Promise<DatasetStats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`);
  }
  return response.json();
}

export async function predictPlacement(data: StudentInput): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed with status: ${response.status}`);
  }

  return response.json();
}

export async function extractResumeFromFile(file: File): Promise<ResumeExtractionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/extract-resume`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Resume extraction failed with status: ${response.status}`);
  }

  return response.json();
}

export async function extractResumeFromText(text: string): Promise<ResumeExtractionResponse> {
  const response = await fetch(`${API_BASE_URL}/extract-resume-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Resume extraction failed with status: ${response.status}`);
  }

  return response.json();
}
