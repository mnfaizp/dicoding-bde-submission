const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentRepository = require('../../../Infrastructures/repository/CommentRepositoryPostgres');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete reply use case', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve(true));
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve(true));

    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve());

    const replyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await replyUseCase.execute(params);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(params.commentId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(params.replyId, params.owner);
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(params.replyId);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(params.replyId);
  });
});
