# Food Classifier

A full-stack food review classifier that predicts whether a sentence is **tasty** or **not tasty** using a manually implemented **Multinomial Naive Bayes** model with **Laplace smoothing**.

## Overview

This project contains:

- `server/`: NestJS REST API (`POST /classifier/predict`)
- `client/`: React + Vite frontend with a polished, responsive UI

The model is trained in-memory on startup using a hardcoded dataset of 80 food review sentences. No database and no external NLP libraries are used.

## Features

- Single production-style REST endpoint: `POST /classifier/predict`
- Naive Bayes classification with log probabilities + softmax
- Laplace smoothing (`lambda = 1`)
- Training runs once at app startup (`onModuleInit`)
- Full 9-step text normalization pipeline
- Request validation with clear 400 errors
- Modern React UI with confidence bars
- Normalization trace visualization
- Final token chips
- Loading and error states

## Tech Stack

- Backend: NestJS, TypeScript, class-validator
- Frontend: React, Vite, TypeScript, CSS
- NLP: Manual implementation (normalization, stemming, lemmatization, Naive Bayes)

## API

### `POST /classifier/predict`

Classifies a food review sentence as `tasty` or `not tasty`.

#### Request body

```json
{
  "sentence": "The pizza was absolutely amazing and full of flavor!"
}
```

#### Example response

```json
{
  "input": "The pizza was absolutely amazing and full of flavor!",
  "prediction": "tasty",
  "confidence": {
    "tasty": 97.65,
    "not_tasty": 2.35
  },
  "normalization_steps": {
    "step_1_case_normalization": "the pizza was absolutely amazing and full of flavor",
    "step_2_punctuation_removal": "the pizza was absolutely amazing and full of flavor",
    "step_3_number_symbol_removal": "the pizza was absolutely amazing and full of flavor",
    "step_4_nontextual_removal": "the pizza was absolutely amazing and full of flavor",
    "step_5_abbreviation_expansion": "the pizza was absolutely amazing and full of flavor",
    "step_6_tokenization": ["the", "pizza", "was", "absolutely", "amazing", "and", "full", "of", "flavor"],
    "step_7_stopword_removal": ["pizza", "absolutely", "amazing", "full", "flavor"],
    "step_8_stemming": ["pizza", "absolute", "amaz", "full", "flavor"],
    "step_9_lemmatization": ["pizza", "absolute", "amazing", "full", "flavor"]
  },
  "final_tokens": ["pizza", "absolute", "amazing", "full", "flavor"],
  "model_stats": {
    "vocabulary_size": 271,
    "training_samples": 80,
    "laplace_lambda": 1
  }
}
```

#### Validation and error handling

- `400` Sentence cannot be empty
- `400` Sentence too short to classify
- `400` No meaningful tokens found after normalization
- `400` Sentence must be a string
- `500` Classification failed

## Normalization Pipeline (9 Steps)

1. Case normalization
2. Punctuation removal
3. Number & symbol removal
4. Non-textual removal
5. Abbreviation/synonym expansion
6. Tokenization
7. Stopword removal
8. Rule-based stemming
9. Rule-based lemmatization

## Project Structure

```text
food_classifier/
├── client/
│   ├── src/
│   └── ...
└── server/
    ├── src/
    │   ├── app.module.ts
    │   ├── main.ts
    │   └── classifier/
    │       ├── classifier.controller.ts
    │       ├── classifier.service.ts
    │       ├── classifier.module.ts
    │       ├── dto/
    │       ├── dataset/
    │       └── normalization/
    └── ...
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### 1) Run backend (NestJS)

```bash
cd server
npm install
npm run start:dev
```

Backend runs on: `http://localhost:3000`

### 2) Run frontend (React)

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Optional frontend API base URL

If needed, set:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Quick API Test

```bash
curl -X POST http://localhost:3000/classifier/predict \
  -H "Content-Type: application/json" \
  -d "{\"sentence\":\"The pizza was absolutely amazing and full of flavor\"}"
```

## Notes

- The classifier is intentionally simple and fully explainable.
- All processing and model state are in-memory.
- Confidence values are rounded to 2 decimals.

---

Built with NestJS + React for educational NLP and practical backend/frontend integration.
