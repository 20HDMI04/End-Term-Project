import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @summary Find comments for a specific book
   * @description Retrieves a list of comments associated with a given book ID. The comments are ordered by creation date in descending order and include user information such as nickname, email, and smaller profile picture.
     This method is used to display the comments section for a book, allowing users to see what others have said about the book.
   * @param bookId - The ID of the book for which to retrieve comments.
     * @throws InternalServerErrorException - If there is an error while retrieving comments from the database.
   * @returns A list of comments associated with the given book ID. Each comment includes the text of the comment, the creation date, and user information (nickname, email, smaller profile picture).
   */
  async findComments(bookId: string) {
    try {
      return await this.prisma.comment.findMany({
        where: {
          bookId: bookId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              nickname: true,
              email: true,
              smallerProfilePic: true,
            },
            omit: {
              smallerProfilePicKey: true,
              biggerProfilePicKey: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error finding comments:', error);
      throw new InternalServerErrorException('Failed to find comments.');
    }
  }

  /**
   * @summary Create a comment for a specific book
   * @description Creates a new comment for a given book ID. The comment is associated with the user who created it, and the text of the comment is provided in the request body. This method is used to allow users to share their thoughts and opinions about a book by adding comments.
   * @param createCommentDto - An object containing the text of the comment to be created.
   * @param userId - The ID of the user creating the comment. This is typically extracted from the session or authentication token.
   * @param bookId - The ID of the book for which the comment is being created.
   * @throws InternalServerErrorException - If there is an error while creating the comment in the database.
   * @throws NotFoundException - If the specified book does not exist in the database.
   * @returns A promise resolving to the created comment.
   * @remarks This method also updates the book statistics by incrementing the review count for the associated book. If the specified book does not exist, a NotFoundException is thrown. If there is an error while creating the comment, an InternalServerErrorException is thrown.
   */
  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
    bookId: string,
  ) {
    try {
      let book = await this.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
      });
      let createdComment = await this.prisma.comment.create({
        data: {
          text: createCommentDto.text,
          userId: userId,
          bookId: bookId,
        },
        include: {
          user: {
            select: {
              biggerProfilePic: true,
              smallerProfilePic: true,
              nickname: true,
            },
          },
        },
      });
      await this.prisma.bookStatistics.update({
        where: {
          bookId: bookId,
        },
        data: {
          reviewCount: {
            increment: 1,
          },
        },
      });
      return createdComment;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Book not found.');
      }
      console.error('Error finding book:', error);
      throw new InternalServerErrorException('Failed to find book.');
    }
  }

  /**
   * @summary Update a specific comment
   * @description Updates the text of an existing comment identified by its ID. The new text for the comment is provided in the request body. This method allows users to edit their comments after they have been created, enabling them to correct mistakes or update their opinions.
   * @param commentId - The ID of the comment to be updated.
   * @param updateCommentDto - An object containing the new text for the comment. The text must be between 1 and 500 characters long.
   * @throws NotFoundException - If the specified comment does not exist in the database.
   * @throws InternalServerErrorException - If there is an error while updating the comment in the database.
   * @throws ForbiddenException - If the user is not the owner of the comment.
   * @returns A promise resolving to the updated comment.
   */
  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ) {
    try {
      let comment = await this.prisma.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
      });
      if (comment.userId != userId) {
        throw new ForbiddenException('You are not the owner of this comment.');
      }
      return await this.prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          text: updateCommentDto.text,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Comment not found.');
      }
      console.error('Error updating comment:', error);
      throw new InternalServerErrorException('Failed to update comment.');
    }
  }

  /**
   * @summary Delete a specific comment
   * @description Deletes an existing comment identified by its ID. This method allows users to remove their comments if they no longer wish to have them displayed, or if they want to delete inappropriate content.
   * @param commentId - The ID of the comment to be deleted.
   * @throws NotFoundException - If the specified comment does not exist in the database.
   * @throws InternalServerErrorException - If there is an error while deleting the comment from the database.
   * @throws ForbiddenException - If the user is not the owner of the comment.
   * @returns - A promise resolving to the deleted comment.
   * @remarks This method also updates the book statistics by decrementing the review count for the associated book. If the specified comment does not exist, a NotFoundException is thrown. If the user is not the owner of the comment, a ForbiddenException is thrown. If there is an error while deleting the comment, an InternalServerErrorException is thrown.
   */
  async deleteComment(commentId: string, userId: string) {
    try {
      let comment = await this.prisma.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
      });
      if (comment.userId != userId) {
        throw new ForbiddenException('You are not the owner of this comment.');
      }
      let deletedComment = await this.prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      await this.prisma.bookStatistics.update({
        where: {
          bookId: comment.bookId,
        },
        data: {
          reviewCount: {
            decrement: 1,
          },
        },
      });
      return deletedComment;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Comment not found.');
      }
      console.error('Error deleting comment:', error);
      throw new InternalServerErrorException('Failed to delete comment.');
    }
  }

  /**
   * @summary Create a like for a specific comment
   * @description Creates a new like for an existing comment identified by its ID. This method allows users to express their appreciation for a comment.
   * @param commentId - The ID of the comment for which to create a like.
   * @param userId - The ID of the user creating the like.
   * @returns A promise resolving to the created like.
   * @throws NotFoundException - If the specified comment does not exist in the database.
   * @throws BadRequestException - If the like already exists.
   * @throws InternalServerErrorException - If there is an error while creating the like in the database.
   */
  async createLike(commentId: string, userId: string) {
    try {
      let comment = await this.prisma.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
      });
      let like = await this.prisma.commentLike.create({
        data: {
          commentId: commentId,
          userId: userId,
        },
      });
      return like;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Comment not found.');
        }
        if (error.code == 'P2002') {
          throw new BadRequestException('Like already exists.');
        }
      }
      throw new InternalServerErrorException('Failed to create like.');
    }
  }

  /**
   * @summary Delete a like for a specific comment
   * @description Deletes an existing like for a comment identified by its ID. This method allows users to remove their like from a comment if they no longer wish to express their appreciation for it.
   * @param commentId - The ID of the comment for which to delete the like.
   * @param userId - The ID of the user deleting the like.
   * @returns A promise resolving to the deleted like.
   * @throws NotFoundException - If the specified like does not exist in the database.
   * @throws InternalServerErrorException - If there is an error while deleting the like from the database.
   */
  async deleteLike(commentId: string, userId: string) {
    try {
      let comment = await this.prisma.comment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
      });
      let like = await this.prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: userId,
            commentId: commentId,
          },
        },
      });
      return like;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Like not found.');
        }
      }
      console.error('Error deleting like:', error);
      throw new InternalServerErrorException('Failed to delete like.');
    }
  }

  /**
   * @summary Mark a book as read by the user
   * @description Creates a record indicating that a user has read a specific book. This method is used to track which books a user has read, allowing for features such as personalized recommendations and reading history.
   * @remarks If the user has already marked the book as read, this method will not create a duplicate record and will not increment the readers count for the book. If the specified book does not exist, a NotFoundException is thrown. If there is an error while creating the record, an InternalServerErrorException is thrown.
   * @param bookId - The ID of the book that the user has read.
   * @param userId - The ID of the user who has read the book.
   * @returns A promise resolving to the created record indicating that the user has read the book.
   * @throws NotFoundException - If the specified book does not exist in the database.
   * @throws InternalServerErrorException - If there is an error while creating the record in the database.
   */
  async haveReadTheBook(bookId: string, userId: string) {
    try {
      let book = await this.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
      });

      let haveReadItCount = await this.prisma.haveReadIt.count({
        where: {
          bookId: bookId,
          userId: userId,
        },
      });

      let haveReadIt = await this.prisma.haveReadIt.create({
        data: {
          bookId: bookId,
          userId: userId,
        },
      });

      if (haveReadItCount < 1) {
        await this.prisma.bookStatistics.update({
          where: {
            bookId: bookId,
          },
          data: {
            readersCount: {
              increment: 1,
            },
          },
        });
      }
      return haveReadIt;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found.');
        }
      }
      console.error('Error creating haveReadIt record:', error);
      throw new InternalServerErrorException(
        'Failed to create haveReadIt record.',
      );
    }
  }

  /**
   * @summary Like a book
   * @description Creates a record indicating that a user likes a specific book. This method is used to track which books a user has liked, allowing for features such as personalized recommendations and favorite book lists.
   * @remarks If the user has already liked the book, this method will not create a duplicate record and will not increment the wantToReadCount for the book. If the specified book does not exist, a NotFoundException is thrown. If there is an error while creating the record, an InternalServerErrorException is thrown.
   * @param bookId - The ID of the book that the user likes.
   * @param userId - The ID of the user who likes the book.
   * @returns A promise resolving to the created record indicating that the user likes the book.
   * @throws InternalServerErrorException - If there is an error while creating the record in the database.
   */
  async likingBook(bookId: string, userId: string) {
    try {
      let favoriteBook = await this.prisma.favoriteBook.create({
        data: {
          bookId: bookId,
          userId: userId,
        },
      });
      await this.prisma.bookStatistics.update({
        where: {
          bookId: bookId,
        },
        data: {
          wantToReadCount: {
            increment: 1,
          },
        },
      });
      return favoriteBook;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('You have already liked this book.');
        }
      }
      console.error('Error creating favorite book record:', error);
      throw new InternalServerErrorException(
        'Failed to create favorite book record.',
      );
    }
  }

  /**
   * @summary Unlike a book
   * @description Deletes a record indicating that a user likes a specific book. This method is used to allow users to remove their like from a book if they no longer wish to express their appreciation for it.
   * @remarks If the user has not liked the book, this method will throw a NotFoundException. If the specified book does not exist, a NotFoundException is thrown. If there is an error while deleting the record, an InternalServerErrorException is thrown.
   * @param bookId - The ID of the book that the user wants to unlike.
   * @param userId - The ID of the user who wants to unlike the book.
   * @returns A promise resolving to the deleted record indicating that the user no longer likes the book.
   * @throws InternalServerErrorException - If there is an error while deleting the record from the database.
   */
  async unlikingBook(bookId: string, userId: string) {
    try {
      let favoriteBook = await this.prisma.favoriteBook.delete({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: bookId,
          },
        },
      });
      await this.prisma.bookStatistics.update({
        where: {
          bookId: bookId,
        },
        data: {
          wantToReadCount: {
            decrement: 1,
          },
        },
      });
      return favoriteBook;
    } catch (error) {
      console.error('Error deleting favorite book record:', error);
      throw new InternalServerErrorException(
        'Failed to delete favorite book record.',
      );
    }
  }

  /**
   * @summary Like an author
   * @description Creates a record indicating that a user likes a specific author. This method is used to track which authors a user has liked, allowing for features such as personalized recommendations and favorite author lists.
   * @remarks If the user has already liked the author, this method will not create a duplicate record. If the specified author does not exist, a NotFoundException is thrown. If there is an error while creating the record, an InternalServerErrorException is thrown.
   * @param authorId - The ID of the author that the user likes.
   * @param userId - The ID of the user who likes the author.
   * @returns A promise resolving to the created record indicating that the user likes the author.
   * @throws InternalServerErrorException - If there is an error while creating the record in the database.
   */
  async likeAuthor(authorId: string, userId: string) {
    try {
      let favoriteAuthor = await this.prisma.favoriteAuthor.create({
        data: {
          authorId: authorId,
          userId: userId,
        },
      });
      return favoriteAuthor;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('You have already liked this author.');
        }
      }
      console.error('Error creating favorite author record:', error);
      throw new InternalServerErrorException(
        'Failed to create favorite author record.',
      );
    }
  }

  /**
   * @summary Unlike an author
   * @description Deletes a record indicating that a user likes a specific author. This method is used to allow users to remove their like from an author if they no longer wish to express their appreciation for them.
   * @remarks If the user has not liked the author, this method will throw a NotFoundException. If the specified author does not exist, a NotFoundException is thrown. If there is an error while deleting the record, an InternalServerErrorException is thrown.
   * @param authorId - The ID of the author that the user wants to unlike.
   * @param userId - The ID of the user who wants to unlike the author.
   * @returns A promise resolving to the deleted record indicating that the user no longer likes the author.
   * @throws InternalServerErrorException - If there is an error while deleting the record from the database.
   */
  async unlikeAuthor(authorId: string, userId: string) {
    try {
      let favoriteAuthor = await this.prisma.favoriteAuthor.delete({
        where: {
          userId_authorId: {
            userId: userId,
            authorId: authorId,
          },
        },
      });
      return favoriteAuthor;
    } catch (error) {
      console.error('Error deleting favorite author record:', error);
      throw new InternalServerErrorException(
        'Failed to delete favorite author record.',
      );
    }
  }

  /**
   * @summary Rate a book
   * @description Creates a rating record for a specific book by a user. This method is used to allow users to rate books, which helps in generating personalized recommendations and maintaining book popularity metrics.
   * @remarks If the user has already rated the book, this method will throw a BadRequestException. If the specified book does not exist, a NotFoundException is thrown. If there is an error while creating the rating record, an InternalServerErrorException is thrown.
   * @param bookId - The ID of the book to be rated.
   * @param userId - The ID of the user who is rating the book.
   * @param createRatingDto - The DTO containing the rating score.
   * @returns A promise resolving to the created rating record.
   * @throws InternalServerErrorException - If there is an error while creating the rating record in the database.
   */
  async rateBook(
    bookId: string,
    userId: string,
    createRatingDto: CreateRatingDto,
  ) {
    try {
      let book = await this.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
        include: {
          statistics: true,
        },
      });

      let newAverageRating = book.statistics?.averageRating
        ? (book.statistics.averageRating * book.statistics.ratingCount +
            createRatingDto.score) /
          (book.statistics.ratingCount + 1)
        : createRatingDto.score;

      await this.prisma.bookStatistics.update({
        where: {
          bookId: bookId,
        },
        data: {
          averageRating: newAverageRating,
          ratingCount: {
            increment: 1,
          },
        },
      });

      let rating = await this.prisma.rating.create({
        data: {
          score: createRatingDto.score,
          bookId: bookId,
          userId: userId,
        },
      });

      return rating;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found.');
        }
        if (error.code === 'P2002') {
          throw new BadRequestException('You have already rated this book.');
        }
      }
      console.error('Error creating rating record:', error);
      throw new InternalServerErrorException('Failed to create rating record.');
    }
  }

  /**
   * @summary Update a book rating
   * @description Updates an existing rating record for a specific book by a user. This method allows users to change their rating for a book, which helps in maintaining accurate and up-to-date book ratings.
   * @remarks If the specified book does not exist, a NotFoundException is thrown. If there is an error while updating the rating record, an InternalServerErrorException is thrown.
   * @param bookId - The ID of the book for which the rating is to be updated.
   * @param userId - The ID of the user who is updating the rating.
   * @param updateRatingDto - The DTO containing the new rating score.
   * @returns A promise resolving to the updated rating record.
   * @throws InternalServerErrorException - If there is an error while updating the rating record in the database.
   * @throws NotFoundException - If the specified book or rating does not exist in the database.
   */
  async updateRateBook(
    bookId: string,
    userId: string,
    updateRatingDto: UpdateRatingDto,
  ) {
    try {
      let book = await this.prisma.book.findUniqueOrThrow({
        where: {
          id: bookId,
        },
        include: {
          statistics: true,
        },
      });

      let oldRating = await this.prisma.rating.findUniqueOrThrow({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: bookId,
          },
        },
        select: {
          score: true,
        },
      });

      let newAverageRating = book.statistics
        ? (book.statistics.averageRating * book.statistics.ratingCount -
            oldRating.score +
            updateRatingDto.score) /
          book.statistics.ratingCount
        : updateRatingDto.score;
      await this.prisma.bookStatistics.update({
        where: {
          bookId: bookId,
        },
        data: {
          averageRating: newAverageRating,
        },
      });
      let updatedRating = await this.prisma.rating.update({
        where: {
          userId_bookId: {
            userId: userId,
            bookId: bookId,
          },
        },
        data: {
          score: updateRatingDto.score,
        },
      });
      return updatedRating;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book or rating not found.');
        }
      }
      console.error('Error updating rating record:', error);
      throw new InternalServerErrorException('Failed to update rating record.');
    }
  }
}
