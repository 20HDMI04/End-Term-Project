import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { S3Module } from './s3/s3.module';
import { BooksModule } from './books/books.module';
import { GenresModule } from './genres/genres.module';
import s3Config from './config/s3.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [s3Config],
    }),
    AuthModule,
    HealthModule,
    S3Module,
    BooksModule,
    GenresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
