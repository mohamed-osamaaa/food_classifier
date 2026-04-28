import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { FOOD_REVIEWS_DATASET } from './dataset/dataset';
import {
  NormalizationSteps,
  NormalizerService,
} from './normalization/normalizer.service';

type Label = 'tasty' | 'not_tasty';

interface ConfidenceScores {
  tasty: number;
  not_tasty: number;
}

interface ModelStats {
  vocabulary_size: number;
  training_samples: number;
  laplace_lambda: number;
}

export interface PredictionResponse {
  input: string;
  prediction: 'tasty' | 'not tasty';
  confidence: ConfidenceScores;
  normalization_steps: NormalizationSteps;
  final_tokens: string[];
  model_stats: ModelStats;
}

@Injectable()
export class ClassifierService implements OnModuleInit {
  private static readonly CLASSES: Label[] = ['tasty', 'not_tasty'];
  private static readonly LAPLACE_LAMBDA = 1;

  private classCount: Record<Label, number> = {
    tasty: 0,
    not_tasty: 0,
  };

  private wordCount: Record<Label, Map<string, number>> = {
    tasty: new Map<string, number>(),
    not_tasty: new Map<string, number>(),
  };

  private totalWords: Record<Label, number> = {
    tasty: 0,
    not_tasty: 0,
  };

  private vocab = new Set<string>();
  private vocabSize = 0;
  private totalDocs = 0;

  constructor(private readonly normalizerService: NormalizerService) {}

  onModuleInit(): void {
    this.trainModel();
  }

  predict(sentence: string): PredictionResponse {
    try {
      if (typeof sentence !== 'string' || sentence.trim().length === 0) {
        throw new BadRequestException('Sentence cannot be empty');
      }

      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length < 3) {
        throw new BadRequestException('Sentence too short to classify');
      }

      if (!this.isModelTrained()) {
        throw new InternalServerErrorException('Classification failed');
      }

      const normalization = this.normalizerService.normalize(trimmedSentence);

      if (normalization.finalTokens.length === 0) {
        throw new BadRequestException(
          'No meaningful tokens found after normalization',
        );
      }

      const probabilities = this.calculateProbabilities(normalization.finalTokens);
      const prediction: 'tasty' | 'not tasty' =
        probabilities.tasty > probabilities.not_tasty ? 'tasty' : 'not tasty';

      return {
        input: sentence,
        prediction,
        confidence: probabilities,
        normalization_steps: normalization.steps,
        final_tokens: normalization.finalTokens,
        model_stats: {
          vocabulary_size: this.vocabSize,
          training_samples: this.totalDocs,
          laplace_lambda: ClassifierService.LAPLACE_LAMBDA,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Classification failed');
    }
  }

  private trainModel(): void {
    this.classCount = { tasty: 0, not_tasty: 0 };
    this.wordCount = { tasty: new Map<string, number>(), not_tasty: new Map<string, number>() };
    this.totalWords = { tasty: 0, not_tasty: 0 };
    this.vocab = new Set<string>();
    this.totalDocs = FOOD_REVIEWS_DATASET.length;

    for (const sample of FOOD_REVIEWS_DATASET) {
      const normalized = this.normalizerService.normalize(sample.sentence);
      const tokens = normalized.finalTokens;

      this.classCount[sample.label] += 1;
      for (const token of tokens) {
        const currentCount = this.wordCount[sample.label].get(token) ?? 0;
        this.wordCount[sample.label].set(token, currentCount + 1);
        this.totalWords[sample.label] += 1;
        this.vocab.add(token);
      }
    }

    this.vocabSize = this.vocab.size;
  }

  private calculateProbabilities(tokens: string[]): ConfidenceScores {
    const logScore: Record<Label, number> = {
      tasty: 0,
      not_tasty: 0,
    };

    for (const label of ClassifierService.CLASSES) {
      const classPrior = this.classCount[label] / this.totalDocs;
      logScore[label] = Math.log(classPrior);

      for (const token of tokens) {
        const numerator =
          (this.wordCount[label].get(token) ?? 0) +
          ClassifierService.LAPLACE_LAMBDA;
        const denominator =
          this.totalWords[label] +
          ClassifierService.LAPLACE_LAMBDA * this.vocabSize;

        logScore[label] += Math.log(numerator / denominator);
      }
    }

    const maxLog = Math.max(logScore.tasty, logScore.not_tasty);
    const expVals = {
      tasty: Math.exp(logScore.tasty - maxLog),
      not_tasty: Math.exp(logScore.not_tasty - maxLog),
    };
    const total = expVals.tasty + expVals.not_tasty;

    return {
      tasty: this.roundToTwo((expVals.tasty / total) * 100),
      not_tasty: this.roundToTwo((expVals.not_tasty / total) * 100),
    };
  }

  private isModelTrained(): boolean {
    return this.totalDocs > 0 && this.vocabSize > 0;
  }

  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
