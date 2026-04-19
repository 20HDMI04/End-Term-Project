import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from './social.service';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrismaClient = {
  comment: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  commentLike: {
    create: vi.fn(),
    delete: vi.fn(),
  },
  book: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  bookRead: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
  },
  favoriteBook: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
  },
  rating: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  bookStatistics: {
    update: vi.fn(),
  },
} as unknown as PrismaService;

describe('SocialService', () => {
  let service: SocialService;

  beforeEach(async () => {
    vi.resetAllMocks();
    service = new SocialService(mockPrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findComments', () => {
    it('should find comments for a book', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          text: 'Great book!',
          createdAt: new Date(),
          user: {
            nickname: 'testuser',
            email: 'test@example.com',
            smallerProfilePic: 'pic.jpg',
          },
          votes: [],
          _count: { votes: 0 },
        },
      ];

      mockPrismaClient.comment.findMany.mockReturnValue(Promise.resolve(mockComments));

      const result = await service.findComments('book-id', 'user-id');

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Great book!');
      expect(result[0].user.nickname).toBe('testuser');
      expect(result[0].likedByUser).toBe(false);
      expect(result[0].likeCount).toBe(0);
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockBook = { id: 'book-id', title: 'Test Book' };
      const mockComment = {
        id: 'comment-id',
        text: 'This is a comment.',
        userId: 'user-id',
        bookId: 'book-id',
        user: { nickname: 'testuser' },
      };

      mockPrismaClient.book.findUniqueOrThrow.mockReturnValue(Promise.resolve(mockBook));
      mockPrismaClient.comment.create.mockReturnValue(Promise.resolve(mockComment));
      mockPrismaClient.book.update.mockReturnValue(Promise.resolve({}));

      const createCommentDto = { text: 'This is a comment.' };

      const result = await service.createComment(createCommentDto, 'user-id', 'book-id');

      expect(result.text).toBe('This is a comment.');
      expect(result.userId).toBe('user-id');
      expect(result.bookId).toBe('book-id');
    });

    /*it('should throw NotFoundException for non-existent book', async () => {
      mockPrismaClient.book.findUniqueOrThrow.mockImplementation(() => Promise.reject({ code: 'P2025' }));

      const createCommentDto = { text: 'This is a comment.' };

      await expect(service.createComment(createCommentDto, 'user-id', 'non-existent-book')).rejects.toThrow('No Book found');
    });*/
  });

  /*describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Original comment',
        userId: 'user-id',
      };

      const updatedComment = {
        id: 'comment-id',
        text: 'Updated comment',
        userId: 'user-id',
      };

      mockPrismaClient.comment.findUnique.mockImplementation(() => Promise.resolve(mockComment));
      mockPrismaClient.comment.update.mockImplementation(() => Promise.resolve(updatedComment));

      const updateCommentDto = { text: 'Updated comment' };

      const result = await service.updateComment('comment-id', updateCommentDto, 'user-id');

      expect(result.text).toBe('Updated comment');
    });

    it('should throw ForbiddenException for updating others comment', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Original comment',
        userId: 'user1-id',
      };

      mockPrismaClient.comment.findUnique.mockImplementation(() => Promise.resolve(mockComment));

      const updateCommentDto = { text: 'Updated comment' };

      await expect(service.updateComment('comment-id', updateCommentDto, 'user2-id')).rejects.toThrow('You can only update your own comments');
    });
  });*/

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Comment to delete',
        userId: 'user-id',
        bookId: 'book-id',
      };

      mockPrismaClient.comment.findUniqueOrThrow.mockReturnValue(Promise.resolve(mockComment));
      mockPrismaClient.comment.delete.mockReturnValue(Promise.resolve(mockComment));
      mockPrismaClient.bookStatistics.update.mockReturnValue(Promise.resolve({}));

      const result = await service.deleteComment('comment-id', 'user-id');

      expect(result.text).toBe('Comment to delete');
    });

    /*it('should throw ForbiddenException for deleting others comment', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Comment',
        userId: 'user1-id',
      };

      mockPrismaClient.comment.findUniqueOrThrow.mockImplementation(() => Promise.resolve(mockComment));

      await expect(service.deleteComment('comment-id', 'user2-id')).rejects.toThrow('You are not the owner of this comment.');
    });*/
  });

  describe('createLike', () => {
    it('should create a like successfully', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Comment',
        userId: 'user1-id',
      };

      const mockLike = {
        id: 'like-id',
        commentId: 'comment-id',
        userId: 'user2-id',
      };

      mockPrismaClient.comment.findUniqueOrThrow.mockReturnValue(Promise.resolve(mockComment));
      mockPrismaClient.commentLike.create.mockReturnValue(Promise.resolve(mockLike));

      const result = await service.createLike('comment-id', 'user2-id');

      expect(result.commentId).toBe('comment-id');
      expect(result.userId).toBe('user2-id');
    });

    /*it('should throw BadRequestException for liking own comment', async () => {
      const mockComment = {
        id: 'comment-id',
        text: 'Comment',
        userId: 'user-id',
      };

      mockPrismaClient.comment.findUniqueOrThrow.mockReturnValue(Promise.resolve(mockComment));

      await expect(service.createLike('comment-id', 'user-id')).rejects.toThrow('You cannot like your own comment');
    });*/
  });

  describe('deleteLike', () => {
    it('should delete a like successfully', async () => {
      const mockLike = {
        id: 'like-id',
        commentId: 'comment-id',
        userId: 'user2-id',
      };

      mockPrismaClient.comment.findUniqueOrThrow.mockReturnValue(Promise.resolve({ id: 'comment-id' }));
      mockPrismaClient.commentLike.delete.mockReturnValue(Promise.resolve(mockLike));

      const result = await service.deleteLike('comment-id', 'user2-id');

      expect(result.commentId).toBe('comment-id');
      expect(result.userId).toBe('user2-id');
    });
  });

  /*describe('haveReadTheBook', () => {
    it('should mark book as read', async () => {
      const mockBookRead = {
        id: 'read-id',
        bookId: 'book-id',
        userId: 'user-id',
        haveRead: true,
      };

      mockPrismaClient.book.findUniqueOrThrow.mockReturnValue(Promise.resolve({ id: 'book-id' }));
      mockPrismaClient.bookRead.findFirst.mockReturnValue(Promise.resolve(null));
      mockPrismaClient.bookRead.create.mockReturnValue(Promise.resolve(mockBookRead));

      const result = await service.haveReadTheBook('book-id', 'user-id');

      expect(result.bookId).toBe('book-id');
      expect(result.userId).toBe('user-id');
      expect(result.haveRead).toBe(true);
    });
  });*/

  describe('likingBook', () => {
    it('should like a book', async () => {
      const mockBookLike = {
        id: 'like-id',
        bookId: 'book-id',
        userId: 'user-id',
      };

      mockPrismaClient.book.findUniqueOrThrow.mockReturnValue(Promise.resolve({ id: 'book-id' }));
      mockPrismaClient.favoriteBook.findFirst.mockReturnValue(Promise.resolve(null));
      mockPrismaClient.favoriteBook.create.mockReturnValue(Promise.resolve(mockBookLike));
      mockPrismaClient.bookStatistics.update.mockReturnValue(Promise.resolve({}));

      const result = await service.likingBook('book-id', 'user-id');

      expect(result.bookId).toBe('book-id');
      expect(result.userId).toBe('user-id');
    });
  });

  describe('rateBook', () => {
    it('should rate a book', async () => {
      const mockRating = {
        id: 'rating-id',
        bookId: 'book-id',
        userId: 'user-id',
        rating: 5,
      };

      mockPrismaClient.book.findUniqueOrThrow.mockReturnValue(Promise.resolve({ id: 'book-id' }));
      mockPrismaClient.rating.findFirst.mockReturnValue(Promise.resolve(null));
      mockPrismaClient.rating.create.mockReturnValue(Promise.resolve(mockRating));

      const createRatingDto = { rating: 5 };

      const result = await service.rateBook(createRatingDto, 'user-id', 'book-id');

      expect(result.bookId).toBe('book-id');
      expect(result.userId).toBe('user-id');
      expect(result.rating).toBe(5);
    });
  });
});
