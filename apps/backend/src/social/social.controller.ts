import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Session,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionGuard } from 'src/auth/session.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // TODO: Rating, RatingUpdate

  @Get('/comments/:bookId')
  @ApiOperation({
    summary: 'Find comments for a specific book',
    description:
      'Returns a list of comments associated with the specified book ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description:
      'Comments for the specified book have been successfully retrieved.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An error occurred while retrieving comments for the specified book.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findComments(@Param('bookId') bookId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.findComments(bookId, user_email);
  }

  @Post('/comments/:bookId')
  @ApiOperation({
    summary: 'Create a comment for a specific book',
    description: 'Creates a new comment for the specified book ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while creating the comment.',
  })
  @ApiNotFoundResponse({
    description: 'The specified book was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Session() session: any,
    @Param('bookId') bookId: string,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.createComment(
      createCommentDto,
      user_email,
      bookId,
    );
  }

  @Delete('/comments/:commentId')
  @ApiOperation({
    summary: 'Delete a specific comment',
    description: 'Deletes the comment with the specified ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully deleted.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while deleting the comment.',
  })
  @ApiNotFoundResponse({
    description: 'The specified comment was not found.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to delete this comment.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  deleteComment(
    @Param('commentId') commentId: string,
    @Session() session: any,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.deleteComment(commentId, user_email);
  }

  @Patch('/comments/:commentId')
  @ApiOperation({
    summary: 'Update a specific comment',
    description:
      'Updates the text of an existing comment identified by its ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully updated.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while updating the comment.',
  })
  @ApiNotFoundResponse({
    description: 'The specified comment was not found.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to update this comment.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Session() session: any,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.updateComment(
      commentId,
      updateCommentDto,
      user_email,
    );
  }

  @Post('comments/:commentId/like')
  @ApiOperation({
    summary: 'Like a specific comment',
    description: 'Adds a like to the comment with the specified ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully liked.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while liking the comment.',
  })
  @ApiNotFoundResponse({
    description: 'The specified comment was not found.',
  })
  @ApiBadRequestResponse({
    description: 'You have already liked this comment.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  create(@Param('commentId') commentId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.createLike(commentId, user_email);
  }

  @Patch('comments/:commentId/unlike')
  @ApiOperation({
    summary: 'Unlike a specific comment',
    description: 'Removes the like from the specified comment.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The like has been successfully removed from the comment.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while removing the like from the comment.',
  })
  @ApiNotFoundResponse({
    description: 'The specified comment was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  unlike(@Param('commentId') commentId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.deleteLike(commentId, user_email);
  }

  @Post('haveread/:bookId')
  @ApiOperation({
    summary: 'Mark a book as read',
    description:
      'Marks the specified book as read by the currently authenticated user.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully marked as read.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while marking the book as read.',
  })
  @ApiNotFoundResponse({
    description: 'The specified book was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  haveReadTheBook(@Param('bookId') bookId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.haveReadTheBook(bookId, user_email);
  }

  @Patch('haveread/:bookId')
  @ApiOperation({
    summary: 'Remove a book from have read',
    description:
      'Removes the specified book from the currently authenticated user\'s have read list.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully removed from have read.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while removing the book from have read.',
  })
  @ApiNotFoundResponse({
    description: 'The specified book was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  removeHaveReadTheBook(@Param('bookId') bookId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.removeHaveReadTheBook(bookId, user_email);
  }

  @Post('book/:bookId/like')
  @ApiOperation({
    summary: 'Like a specific book',
    description: 'Adds a like to the book with the specified ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully liked.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while liking the book.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  likingBook(@Param('bookId') bookId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.likingBook(bookId, user_email);
  }

  @Patch('book/:bookId/unlike')
  @ApiOperation({
    summary: 'Unlike a specific book',
    description: 'Removes the like from the specified book.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The like has been successfully removed from the book.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while removing the like from the book.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  unlikingBook(@Param('bookId') bookId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.unlikingBook(bookId, user_email);
  }

  @Post('authors/:authorId/like')
  @ApiOperation({
    summary: 'Like a specific author',
    description: 'Adds a like to the author with the specified ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The author has been successfully liked.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while liking the author.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  likeAuthor(@Param('authorId') authorId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.likeAuthor(authorId, user_email);
  }

  @Patch('authors/:authorId/unlike')
  @ApiOperation({
    summary: 'Unlike a specific author',
    description: 'Removes the like from the specified author.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The like has been successfully removed from the author.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while removing the like from the author.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  unlikeAuthor(@Param('authorId') authorId: string, @Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.unlikeAuthor(authorId, user_email);
  }

  @Post('book/:bookId/rate')
  @ApiOperation({
    summary: 'Rate a specific book',
    description:
      'Allows the currently authenticated user to rate the specified book.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully rated.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while rating the book.',
  })
  @ApiNotFoundResponse({
    description: 'The specified book was not found.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid rating value. Rating must be between 1 and 5. OR You have already rated this book.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  rateBook(
    @Param('bookId') bookId: string,
    @Session() session: any,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.rateBook(bookId, user_email, createRatingDto);
  }

  @Patch('book/:bookId/rate')
  @ApiOperation({
    summary: 'Update rating for a specific book',
    description:
      'Allows the currently authenticated user to update their rating for the specified book.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book rating has been successfully updated.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while updating the book rating.',
  })
  @ApiNotFoundResponse({
    description: 'The specified book was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid rating value. Rating must be between 1 and 5.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  updateRateBook(
    @Param('bookId') bookId: string,
    @Session() session: any,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.updateRateBook(
      bookId,
      user_email,
      updateRatingDto,
    );
  }

  @Get('comments/history')
  @ApiOperation({
    summary: 'Get comment history for the authenticated user',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The comment history has been successfully retrieved.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred while retrieving the comment history.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  getCommentHistory(@Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.socialService.getCommentHistory(user_email);
  }
}
