import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('GenresService', () => {
  let service: GenresService;

  // Mock objektum a Prismához
  const mockPrisma = {
    genres: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should normalize the name and create a genre', async () => {
      const dto = { name: '  sCi-fI  ' };
      const expectedName = 'Sci-fi';

      mockPrisma.genres.create.mockResolvedValue({
        id: '1',
        name: expectedName,
      });

      const result = await service.create(dto);

      expect(result.name).toBe(expectedName);
      expect(mockPrisma.genres.create).toHaveBeenCalledWith({
        data: { name: expectedName },
      });
    });
  });
});
