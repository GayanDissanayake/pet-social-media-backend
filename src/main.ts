import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload size limit (adjust the size as needed, e.g., 10MB)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors({
    origin: `${process.env.FRONTEND_URL}`, // Replace with your frontend URL
  });
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
