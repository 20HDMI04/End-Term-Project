import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { getClient } from '@pkgverse/prismock';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it } from 'vitest';

//@ts-ignore
let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('GenresService', () => {
  let service: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: PrismaService,
          useValue: mockedClient,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
