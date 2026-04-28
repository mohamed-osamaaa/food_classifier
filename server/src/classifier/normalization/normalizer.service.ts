import { Injectable } from '@nestjs/common';
import { ENGLISH_STOPWORDS } from './stopwords';

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

export interface NormalizationResult {
  steps: NormalizationSteps;
  finalTokens: string[];
}

@Injectable()
export class NormalizerService {
  private static readonly ABBREVIATION_MAP: Record<string, string> = {
    delish: 'delicious',
    yummy: 'tasty',
    yum: 'tasty',
    gr8: 'great',
    luv: 'love',
    amazin: 'amazing',
    fab: 'fabulous',
    awful: 'terrible',
    gross: 'disgusting',
    nasty: 'disgusting',
    horrible: 'terrible',
    bland: 'tasteless',
    '2day': 'today',
    '2': 'to',
    '4': 'for',
    tbh: 'to be honest',
    imo: 'in my opinion',
    ngl: 'not going to lie',
    omg: 'oh my god',
    btw: 'by the way',
    wud: 'would',
    cud: 'could',
    wit: 'with',
    da: 'the',
    dis: 'this',
    dat: 'that',
    fyi: 'for your information',
  };

  private static readonly LEMMA_MAP: Record<string, string> = {
    tast: 'taste',
    delici: 'delicious',
    amaz: 'amazing',
    creami: 'creamy',
    juici: 'juicy',
    crisp: 'crispy',
    flaki: 'flaky',
    rubberi: 'rubbery',
    mushi: 'mushy',
    soggi: 'soggy',
    greasi: 'greasy',
    terribl: 'terrible',
    absolut: 'absolute',
    refresh: 'refreshing',
    smoki: 'smoky',
    velveti: 'velvety',
    lumpi: 'lumpy',
    smelli: 'smelly',
    gummi: 'gummy',
    balanc: 'balance',
    season: 'seasoning',
    herbi: 'herby',
    tangi: 'tangy',
    spici: 'spicy',
    vibrant: 'vibrant',
    fragrant: 'fragrant',
    bland: 'bland',
    stale: 'stale',
    warm: 'warm',
    sweet: 'sweet',
    cold: 'cold',
    hot: 'hot',
    light: 'light',
    smooth: 'smooth',
    fresh: 'fresh',
    raw: 'raw',
    dry: 'dry',
    thick: 'thick',
    flavor: 'flavor',
    perfect: 'perfect',
    tender: 'tender',
  };

  private readonly stopwordSet = new Set<string>(ENGLISH_STOPWORDS);

  normalize(input: string): NormalizationResult {
    const step1 = this.caseNormalize(input);
    const step2 = this.removePunctuation(step1);
    const step3 = this.removeNumbersAndSymbols(step2);
    const step4 = this.removeNonTextual(step3);
    const step5 = this.expandAbbreviations(step4);
    const step6 = this.tokenize(step5);
    const step7 = this.removeStopwords(step6);
    const step8 = this.stemTokens(step7);
    const step9 = this.lemmatizeTokens(step8);

    return {
      steps: {
        step_1_case_normalization: step1,
        step_2_punctuation_removal: step2,
        step_3_number_symbol_removal: step3,
        step_4_nontextual_removal: step4,
        step_5_abbreviation_expansion: step5,
        step_6_tokenization: step6,
        step_7_stopword_removal: step7,
        step_8_stemming: step8,
        step_9_lemmatization: step9,
      },
      finalTokens: step9,
    };
  }

  private caseNormalize(text: string): string {
    return text.toLowerCase();
  }

  private removePunctuation(text: string): string {
    return text.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  private removeNumbersAndSymbols(text: string): string {
    return text
      .replace(/\b\d+\b/g, ' ')
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private removeNonTextual(text: string): string {
    return text.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private expandAbbreviations(text: string): string {
    const expanded = text
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => NormalizerService.ABBREVIATION_MAP[word] ?? word);

    return expanded.join(' ').replace(/\s+/g, ' ').trim();
  }

  private tokenize(text: string): string[] {
    return text
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 0)
      .filter((token) => /^[a-z]+$/.test(token));
  }

  private removeStopwords(tokens: string[]): string[] {
    return tokens.filter(
      (token) => token.length > 1 && !this.stopwordSet.has(token),
    );
  }

  private stemTokens(tokens: string[]): string[] {
    return tokens.map((token) => this.stemWord(token));
  }

  private stemWord(token: string): string {
    if (token.endsWith('ing') && token.length > 5) {
      return token.slice(0, -3);
    }
    if (token.endsWith('tion') && token.length > 6) {
      return token.slice(0, -4);
    }
    if (token.endsWith('ness') && token.length > 5) {
      return token.slice(0, -4);
    }
    if (token.endsWith('ful') && token.length > 4) {
      return token.slice(0, -3);
    }
    if (token.endsWith('less') && token.length > 5) {
      return token.slice(0, -4);
    }
    if (token.endsWith('ly') && token.length > 4) {
      return token.slice(0, -2);
    }
    if (token.endsWith('ed') && token.length > 4) {
      return token.slice(0, -2);
    }
    if (token.endsWith('er') && token.length > 4) {
      return token.slice(0, -2);
    }
    if (token.endsWith('est') && token.length > 5) {
      return token.slice(0, -3);
    }
    if (token.endsWith('es') && token.length > 3) {
      return token.slice(0, -2);
    }
    if (token.endsWith('s') && token.length > 3 && !token.endsWith('ss')) {
      return token.slice(0, -1);
    }

    return token;
  }

  private lemmatizeTokens(tokens: string[]): string[] {
    return tokens.map((token) => NormalizerService.LEMMA_MAP[token] ?? token);
  }
}
