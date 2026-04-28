import { Body, Controller, Post } from '@nestjs/common';
import { ClassifierService, PredictionResponse } from './classifier.service';
import { PredictDto } from './dto/predict.dto';

@Controller('classifier')
export class ClassifierController {
  constructor(private readonly classifierService: ClassifierService) {}

  @Post('predict')
  predict(@Body() predictDto: PredictDto): PredictionResponse {
    return this.classifierService.predict(predictDto.sentence);
  }
}
