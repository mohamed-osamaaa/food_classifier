import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { predictSentence } from './api';
import type { PredictionResponse } from './types';

const EXAMPLES = [
  'The pizza was absolutely amazing and full of flavor!',
  'My burger arrived cold, soggy, and tasteless.',
  'Creamy pasta with perfect seasoning and fresh herbs.',
];

const STEP_LABELS: Record<string, string> = {
  step_1_case_normalization: 'Step 1 • Case Normalization',
  step_2_punctuation_removal: 'Step 2 • Punctuation Removal',
  step_3_number_symbol_removal: 'Step 3 • Number & Symbol Removal',
  step_4_nontextual_removal: 'Step 4 • Non-textual Removal',
  step_5_abbreviation_expansion: 'Step 5 • Abbreviation Expansion',
  step_6_tokenization: 'Step 6 • Tokenization',
  step_7_stopword_removal: 'Step 7 • Stopword Removal',
  step_8_stemming: 'Step 8 • Stemming',
  step_9_lemmatization: 'Step 9 • Lemmatization',
};

function App() {
  const [sentence, setSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState('');

  const canSubmit = sentence.trim().length >= 3 && !isLoading;
  const sentenceLength = sentence.trim().length;

  const orderedSteps = useMemo(() => {
    if (!result) {
      return [];
    }

    return Object.entries(result.normalization_steps);
  }, [result]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (sentence.trim().length === 0) {
      setError('Please enter a sentence first.');
      return;
    }

    if (sentence.trim().length < 3) {
      setError('Sentence must be at least 3 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await predictSentence(sentence.trim());
      setResult(response);
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError('Classification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (canSubmit) {
        void handleSubmit(event);
      }
    }
  };

  return (
    <div className="page">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="container">
        <section className="hero fade-in-up">
          <p className="eyebrow">Naive Bayes Sentiment Intelligence</p>
          <h1>Food Review Classifier</h1>
          <p className="subtitle">
            Classify any food sentence as <strong>tasty</strong> or{' '}
            <strong>not tasty</strong>, with confidence scores and full
            normalization trace.
          </p>
        </section>

        <section className="panel fade-in-up delay-1">
          <form onSubmit={handleSubmit} className="form">
            <div className="field-head">
              <label htmlFor="sentence">Review Sentence</label>
              <span
                className={`counter ${sentenceLength >= 3 ? 'ready' : 'waiting'}`}
              >
                {sentenceLength} chars
              </span>
            </div>

            <textarea
              id="sentence"
              value={sentence}
              onChange={(event) => setSentence(event.target.value)}
              onKeyDown={handleShortcut}
              placeholder="Example: The pizza was absolutely amazing and full of flavor!"
              rows={5}
            />

            <div className="example-list">
              {EXAMPLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="example-chip"
                  onClick={() => setSentence(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="actions">
              <button type="submit" className="primary-btn" disabled={!canSubmit}>
                {isLoading ? 'Classifying...' : 'Classify Sentence'}
              </button>
              <span className="hint">Tip: Ctrl/Cmd + Enter to submit</span>
            </div>
          </form>
        </section>

        {error ? (
          <section className="feedback error fade-in-up">
            <h2>Request Error</h2>
            <p>{error}</p>
          </section>
        ) : null}

        {result ? (
          <section className="results fade-in-up">
            <div className="panel outcome">
              <div className="prediction-row">
                <div>
                  <p className="mini-label">Prediction</p>
                  <h2
                    className={
                      result.prediction === 'tasty'
                        ? 'prediction tasty'
                        : 'prediction not-tasty'
                    }
                  >
                    {result.prediction}
                  </h2>
                </div>
                <div className="model-stats">
                  <p>
                    Vocabulary: <strong>{result.model_stats.vocabulary_size}</strong>
                  </p>
                  <p>
                    Samples: <strong>{result.model_stats.training_samples}</strong>
                  </p>
                  <p>
                    Laplace λ: <strong>{result.model_stats.laplace_lambda}</strong>
                  </p>
                </div>
              </div>

              <div className="confidence-wrap">
                <ConfidenceBar
                  label="tasty"
                  value={result.confidence.tasty}
                  tone="good"
                />
                <ConfidenceBar
                  label="not_tasty"
                  value={result.confidence.not_tasty}
                  tone="bad"
                />
              </div>
            </div>

            <div className="panel tokens">
              <h3>Final Tokens</h3>
              <div className="token-list">
                {result.final_tokens.map((token) => (
                  <span key={token} className="token">
                    {token}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel steps">
              <h3>Normalization Steps</h3>
              <div className="steps-grid">
                {orderedSteps.map(([key, value]) => (
                  <article key={key} className="step-card">
                    <p className="step-title">{STEP_LABELS[key] ?? key}</p>
                    {Array.isArray(value) ? (
                      <div className="token-list">
                        {value.length > 0 ? (
                          value.map((token, index) => (
                            <span key={`${token}-${index}`} className="token">
                              {token}
                            </span>
                          ))
                        ) : (
                          <span className="empty">[]</span>
                        )}
                      </div>
                    ) : (
                      <code>{value || '""'}</code>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function ConfidenceBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'good' | 'bad';
}) {
  return (
    <div className="confidence-row">
      <div className="confidence-head">
        <span>{label}</span>
        <strong>{value.toFixed(2)}%</strong>
      </div>
      <div className="bar-track">
        <div
          className={`bar-fill ${tone}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export default App;
