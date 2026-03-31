import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getClient } from '@pkgverse/prismock';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it } from 'vitest';

//@ts-ignore
let mockedClient = await getClient({
  prismaClient: PrismaService,
  schemaPath: 'prisma/schema.prisma',
});

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockedClient,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    await mockedClient.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
