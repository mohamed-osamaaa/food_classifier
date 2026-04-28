import { Module } from '@nestjs/common';
import { ClassifierModule } from './classifier/classifier.module';

@Module({
  imports: [ClassifierModule],
})
export class AppModule {}
