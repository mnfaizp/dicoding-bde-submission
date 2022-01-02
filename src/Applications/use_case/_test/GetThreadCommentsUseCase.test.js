const GetThreadCommentsUseCase = require('../GetThreadCommentsUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the add comment use case', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
    };

    const expectedThread = new DetailThread({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      username: 'owner',
      date: '2021',
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
      }),
      new DetailComment({
        id: 'comment-2',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      }),
    ];

    const getReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'uiop2',
      },
      {
        id: 'reply-2',
        content: 'content2',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'a',
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      },
      {
        id: 'reply-2',
        content: 'content2',
        username: 'user-1233',
        date: 'a',
      },
    ];

    const expectedLikes = [
      {
        commentId: 'comment-2',
        likes: '4',
      },
      {
        commentId: 'comment-1',
        likes: '3',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(getReplies));
    mockLikeRepository.getLikesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedLikes));

    const withoutLikeCount = expectedComments;

    expectedComments[0].likeCount = parseInt(expectedLikes[1].likes.toString(), 10);
    expectedComments[1].likeCount = parseInt(expectedLikes[0].likes.toString(), 10);

    const expectedWithLikes = expectedComments;

    const getUseCase = new GetThreadCommentsUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    getUseCase._assignLikeCountToComment = jest.fn()
      .mockImplementation(() => expectedComments);

    expectedComments[0].replies = expectedReplies;

    const expectedDetailThread = { ...expectedThread, comments: expectedComments };

    getUseCase._assignRepliesToComment = jest.fn()
      .mockImplementation(() => expectedWithLikes);

    // Action
    const commentsOnThread = await getUseCase.execute(params);

    // Assert
    expect(commentsOnThread).toEqual(expectedDetailThread);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(params.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(params.threadId);

    expect(getUseCase._assignRepliesToComment).toBeCalledWith(expectedWithLikes, getReplies);
    expect(getUseCase._assignLikeCountToComment).toBeCalledWith(withoutLikeCount, expectedLikes);
  });

  it('should operate _assignRepliesComment correctly', () => {
    // Arrange
    const getUseCase = new GetThreadCommentsUseCase({
      threadRepository: {}, replyRepository: {}, commentRepository: {},
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
      }),
      new DetailComment({
        id: 'comment-2',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      }),
    ];

    const getReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'uiop2',
      },
      {
        id: 'reply-2',
        content: 'content2',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'a',
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      },
      {
        id: 'reply-2',
        content: 'content2',
        username: 'user-1233',
        date: 'a',
      },
    ];

    const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_assignRepliesToComment');

    // action
    getUseCase._assignRepliesToComment(expectedComments, getReplies);
    expectedComments[0].replies = expectedReplies;

    // Assert
    expect(spyOnGetThreadUseCase).toReturnWith(expectedComments);
  });

  it('should operate __assignLikeCountToComment correctly', () => {
    // Arrange
    const getUseCase = new GetThreadCommentsUseCase({
      threadRepository: {}, replyRepository: {}, commentRepository: {}, likeRepository: {},
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
      }),
      new DetailComment({
        id: 'comment-2',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      }),
    ];

    const expectedLikes = [
      {
        commentId: 'comment-2',
        likes: '4',
      },
      {
        commentId: 'comment-1',
        likes: '3',
      },
    ];

    const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_assignLikeCountToComment');

    // action
    getUseCase.aklsdjf(expectedComments, expectedLikes);
    expectedComments[0].likeCount = parseInt(expectedLikes[1].likes.toString(), 10);
    expectedComments[1].likeCount = parseInt(expectedLikes[0].likes.toString(), 10);

    // Assert
    expect(spyOnGetThreadUseCase).toHaveBeenCalled();
    expect(spyOnGetThreadUseCase).toReturnWith(expectedComments);
  });
});
