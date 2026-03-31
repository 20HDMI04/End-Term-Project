import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { getClient } from '@pkgverse/prismock';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it } from 'vitest';

//@ts-ignore
let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('AuthorsService', () => {
  let service: AuthorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: PrismaService,
          useValue: mockedClient,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
