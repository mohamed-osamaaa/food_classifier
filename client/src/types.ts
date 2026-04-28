export interface NormalizationSteps {
  step_1_case_normalization: string;
  step_2_punctuation_removal: string;
  step_3_number_symbol_removal: string;
  step_4_nontextual_removal: string;
  step_5_abbreviation_expansion: string;
  step_6_tokenization: string[];
  step_7_stopword_removal: string[];
  step_8_stemming: string[];
  step_9_lemmatization: string[];
}

export interface PredictionResponse {
  input: string;
  prediction: 'tasty' | 'not tasty';
  confidence: {
    tasty: number;
    not_tasty: number;
  };
  normalization_steps: NormalizationSteps;
  final_tokens: string[];
  model_stats: {
    vocabulary_size: number;
    training_samples: number;
    laplace_lambda: number;
  };
}
