import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from './social.service';
import { getClient } from '@pkgverse/prismock';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it } from 'vitest';

//@ts-ignore
let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('SocialService', () => {
  let service: SocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        {
          provide: PrismaService,
          useValue: mockedClient,
        },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
