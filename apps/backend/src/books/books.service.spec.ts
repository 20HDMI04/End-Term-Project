import { BooksService } from './books.service';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Service } from 'src/s3/s3.service';
import { GenresService } from 'src/genres/genres.service';
import { HttpService } from '@nestjs/axios';
import { AuthorsService } from 'src/authors/authors.service';

const mockPrismaClient = {
  book: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  bookIsbn: {
    findUnique: vi.fn(),
  },
} as unknown as PrismaService;

const mockS3Service = {
  uploadImage: vi.fn(),
  deleteImages: vi.fn(),
};

const mockGenresService = {
  getOrCreateMany: vi.fn(),
};

const mockHttpService = {};

const mockAuthorsService = {};

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BooksService(
      mockS3Service as unknown as S3Service,
      mockPrismaClient,
      mockGenresService as unknown as GenresService,
      mockHttpService as unknown as HttpService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto = {
        title: 'Test Book',
        description: 'A test book description that is long enough.',
        isbns: ['1234567890'],
        genreNames: ['fiction'],
        authorId: 'author-uuid',
        originalPublisher: 'Test Publisher',
        originalPublicationYear: 2020,
        latestPublicationYear: 2021,
        pageNumber: 200,
      };

      const mockGenres = [{ id: 'genre-uuid', name: 'fiction' }];
      const mockS3Result = {
        small: 'small-url',
        large: 'large-url',
        keys: ['small-key', 'large-key'],
      };

      const mockBook = {
        id: 'book-uuid',
        title: 'Test Book',
        description: 'A test book description that is long enough.',
        isbns: [{ isbnNumber: '1234567890' }],
        genres: [{ genre: { id: 'genre-uuid', name: 'fiction' } }],
        author: null,
        statistics: {},
      };

      vi.spyOn(mockGenresService, 'getOrCreateMany').mockResolvedValue(mockGenres);
      vi.spyOn(mockS3Service, 'uploadImage').mockResolvedValue(mockS3Result);
      mockPrismaClient.book.findFirst.mockResolvedValue(null);
      mockPrismaClient.book.create.mockResolvedValue(mockBook);

      const result = await service.create(null, createBookDto);

      expect(result.title).toBe(createBookDto.title);
      expect(result.description).toBe(createBookDto.description);
      expect(result.isbns).toHaveLength(1);
      expect(result.isbns[0].isbnNumber).toBe(createBookDto.isbns[0]);
      expect(result.genres).toHaveLength(1);
      expect(result.genres[0].genre.name).toBe('fiction');
    });

    it('should throw ConflictException for duplicate ISBN', async () => {
      const createBookDto = {
        title: 'Test Book',
        description: 'A test book description that is long enough.',
        isbns: ['1234567890'],
        genreNames: ['fiction'],
      };

      const existingBook = {
        id: 'existing-book',
        title: 'Existing Book',
        isbns: [{ isbnNumber: '1234567890' }],
      };

      mockPrismaClient.book.findFirst.mockResolvedValue(existingBook);

      await expect(service.create(null, createBookDto)).rejects.toThrow('A book with this ISBN (1234567890) already exists!');
    });

    it('should use default images when no file provided', async () => {
      const createBookDto = {
        title: 'Test Book',
        description: 'A test book description that is long enough.',
        isbns: ['1234567890'],
        genreNames: ['fiction'],
      };

      const mockGenres = [{ id: 'genre-uuid', name: 'fiction' }];
      const mockBook = {
        id: 'book-uuid',
        title: 'Test Book',
        description: 'A test book description that is long enough.',
        isbns: [{ isbnNumber: '1234567890' }],
        genres: [{ genre: { id: 'genre-uuid', name: 'fiction' } }],
        author: null,
        statistics: {},
        smallerCoverPic: 'http://localhost:4566/book-covers/default-book.jpg',
        biggerCoverPic: 'http://localhost:4566/book-covers/default-book.jpg',
      };

      vi.spyOn(mockGenresService, 'getOrCreateMany').mockResolvedValue(mockGenres);
      mockPrismaClient.book.findFirst.mockResolvedValue(null);
      mockPrismaClient.book.create.mockResolvedValue(mockBook);

      const result = await service.create(null, createBookDto);

      expect(result.smallerCoverPic).toBe('http://localhost:4566/book-covers/default-book.jpg');
      expect(result.biggerCoverPic).toBe('http://localhost:4566/book-covers/default-book.jpg');
    });
  });

  describe('findOne', () => {
    it('should find a book by id', async () => {
      const mockBook = {
        id: 'book-uuid',
        title: 'Test Book',
        description: 'Description',
        isbns: [{ isbnNumber: '1234567890' }],
        genres: [{ genre: { id: 'genre-uuid', name: 'fiction' }, genreId: 'genre-uuid' }],
        author: null,
        statistics: {},
        _count: { favoritedBy: 0 },
        favoritedBy: [],
        comments: [],
        ratings: [],
      };

      mockPrismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      mockPrismaClient.book.findMany.mockResolvedValue([]);

      const result = await service.findOne('book-uuid', 'user-id');

      expect(result.foundBook.title).toBe('Test Book');
      expect(result.foundBook.isbns[0].isbnNumber).toBe('1234567890');
    });

    it('should throw NotFoundException for non-existent book', async () => {
      mockPrismaClient.book.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

      await expect(service.findOne('non-existent-id', 'user-id')).rejects.toThrow('The book with the given ID does not exist.');
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const existingBook = {
        id: 'book-uuid',
        title: 'Original Title',
        description: 'Original description',
        isbns: [{ isbnNumber: '1234567890' }],
        smallerCoverPic: 'old-small',
        biggerCoverPic: 'old-large',
        smallerCoverPicKey: 'old-key1',
        biggerCoverPicKey: 'old-key2',
      };

      const updatedBook = {
        id: 'book-uuid',
        title: 'Updated Title',
        description: 'Updated description that is long enough.',
        isbns: [{ isbnNumber: '1234567890' }],
        genres: [],
        author: null,
        statistics: {},
      };

      mockPrismaClient.book.findUnique.mockResolvedValue(existingBook);
      mockPrismaClient.book.findFirst.mockResolvedValue(null);
      mockPrismaClient.book.update.mockResolvedValue(updatedBook);

      const updateBookDto = {
        title: 'Updated Title',
        description: 'Updated description that is long enough.',
      };

      const result = await service.update('book-uuid', null, updateBookDto);

      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description that is long enough.');
    });
  });

  describe('remove', () => {
    it('should remove a book successfully', async () => {
      const mockBook = {
        smallerCoverPicKey: 'key1',
        biggerCoverPicKey: 'key2',
      };

      mockPrismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      mockPrismaClient.book.delete.mockResolvedValue({});

      const result = await service.remove('book-uuid');

      expect(result.message).toBe('Book successfully deleted.');
    });

    it('should throw NotFoundException for non-existent book', async () => {
      mockPrismaClient.book.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.remove('non-existent-id')).rejects.toThrow('Not found');
    });
  });
});
