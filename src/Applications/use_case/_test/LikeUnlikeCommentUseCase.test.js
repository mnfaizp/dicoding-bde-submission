const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('LikeUnlikeCommentUseCase', () => {
  it('should orchestrating the add like use case', async () => {
    // Arrange
    const owner = 'test owner';
    const commentId = 'comment.Id';
    const threadId = 'thread';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikeRepository = new LikeRepository();

    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkOwnerLikeOnComments = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getAddUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await getAddUseCase.execute({ commentId, owner, threadId });

    // Assert
    expect(mockLikeRepository.addLike).toBeCalledWith({ commentId, owner });
  });

  it('should orchestrating the delete like use case', async () => {
    // Arrange
    const owner = 'test owner';
    const commentId = 'comment.Id';
    const threadId = 'thread';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikeRepository = new LikeRepository();

    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkOwnerLikeOnComments = jest.fn()
      .mockImplementation(() => Promise.resolve([{ like: '1' }]));

    const getAddUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await getAddUseCase.execute({ commentId, owner, threadId });

    // Assert
    expect(mockLikeRepository.deleteLike).toBeCalledWith({ commentId, owner });
  });

  describe('_checkCommentWasLiked', () => {
    it('should return true when result object has length more than 1', () => {
      // Arrange
      const getUseCase = new LikeUnlikeCommentUseCase({
        threadRepository: {}, replyRepository: {}, commentRepository: {},
      });
      const result = [
        {
          coba: '',
        },
      ];

      const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_checkCommentWasLiked');

      // action
      getUseCase._checkCommentWasLiked(result);

      // Assert
      expect(spyOnGetThreadUseCase).toReturnWith(true);
    });

    it('should return false when result object has length more than 1', () => {
      // Arrange
      const getUseCase = new LikeUnlikeCommentUseCase({
        threadRepository: {}, replyRepository: {}, commentRepository: {},
      });
      const result = [];

      const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_checkCommentWasLiked');

      // action
      getUseCase._checkCommentWasLiked(result);

      // Assert
      expect(spyOnGetThreadUseCase).toReturnWith(false);
    });
  });
});
