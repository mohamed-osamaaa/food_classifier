import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PredictDto {
  @IsString({ message: 'Sentence must be a string' })
  @IsNotEmpty({ message: 'Sentence cannot be empty' })
  @MinLength(3, { message: 'Sentence too short to classify' })
  sentence!: string;
}
