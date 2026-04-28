import { Module } from '@nestjs/common';
import { ClassifierController } from './classifier.controller';
import { ClassifierService } from './classifier.service';
import { NormalizerService } from './normalization/normalizer.service';

@Module({
  controllers: [ClassifierController],
  providers: [ClassifierService, NormalizerService],
})
export class ClassifierModule {}
