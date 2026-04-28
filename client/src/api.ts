import type { PredictionResponse } from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ErrorResponse {
  message?: string;
}

export async function predictSentence(
  sentence: string,
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/classifier/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sentence }),
  });

  if (!response.ok) {
    let errorMessage = 'Classification failed';

    try {
      const errorBody = (await response.json()) as ErrorResponse;
      if (typeof errorBody.message === 'string') {
        errorMessage = errorBody.message;
      }
    } catch {
      errorMessage = 'Classification failed';
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as PredictionResponse;
}
