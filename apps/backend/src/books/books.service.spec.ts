import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getClient } from '@pkgverse/prismock';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it } from 'vitest';

//@ts-ignore
let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: mockedClient },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
