const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Infrastructures/repository/CommentRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment use case', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const expectedCommentDeleted = {
      id: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const commentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const coba = await commentUseCase.execute(params);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(params.commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(params.commentId, params.owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(params.commentId);
  });
});
