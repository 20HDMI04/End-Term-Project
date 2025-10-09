import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
    }),
    BooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
