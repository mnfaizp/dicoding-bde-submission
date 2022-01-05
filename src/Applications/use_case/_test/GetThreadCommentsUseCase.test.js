const GetThreadCommentsUseCase = require('../GetThreadCommentsUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

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
      {
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
        isdelete: false,
      },
      {
        id: 'comment-2',
        content: 'aaaa',
        username: 'user-1233',
        date: 'uiop2',
        isdelete: true,
      },
    ];

    const unformattedReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        comment_id: 'comment-1',
        username: 'user-1233',
        date: 'uiop2',
        is_delete: false,
      },
      {
        id: 'reply-2',
        content: 'content2',
        comment_id: 'comment-1',
        username: 'user-1233',
        date: 'a',
        is_delete: true,
      },
    ];

    const detailThread = {
      body: 'body',
      date: '2021',
      id: 'thread-123',
      title: 'title',
      username: 'owner',
      comments: [
        {
          content: 'content',
          date: 'uiop',
          id: 'comment-1',
          replies: [
            {
              content: 'content2',
              date: 'uiop2',
              id: 'reply-1',
              username: 'user-1233',
            },
            {
              content: '**balasan telah dihapus**',
              date: 'a',
              id: 'reply-2',
              username: 'user-1233',
            },
          ],
          username: 'user-123',
        },
        {
          content: '**komentar telah dihapus**',
          date: 'uiop2',
          id: 'comment-2',
          replies: [],
          username: 'user-1233',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    const getUseCase = new GetThreadCommentsUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(unformattedReplies));

    getUseCase._assignRepliesToComment = jest.fn()
      .mockImplementation(() => ([
        {
          content: 'content',
          date: 'uiop',
          id: 'comment-1',
          replies: [
            {
              content: 'content2',
              date: 'uiop2',
              id: 'reply-1',
              username: 'user-1233',
            },
            {
              content: '**balasan telah dihapus**',
              date: 'a',
              id: 'reply-2',
              username: 'user-1233',
            },
          ],
          username: 'user-123',
        },
        {
          content: '**komentar telah dihapus**',
          date: 'uiop2',
          id: 'comment-2',
          replies: [],
          username: 'user-1233',
        },
      ]));
    getUseCase._changeDeletedCommentContent = jest.fn()
      .mockImplementation(() => ([
        {
          content: 'content',
          date: 'uiop',
          id: 'comment-1',
          username: 'user-123',
        },
        {
          content: '**komentar telah dihapus**',
          date: 'uiop2',
          id: 'comment-2',
          username: 'user-1233',
        },
      ]));
    getUseCase._changeDeletedReplyContent = jest.fn()
      .mockImplementation(() => ([
        {
          content: 'content2',
          date: 'uiop2',
          id: 'reply-1',
          username: 'user-1233',
        },
        {
          content: '**balasan telah dihapus**',
          date: 'a',
          id: 'reply-2',
          username: 'user-1233',
        },
      ]));

    // Action
    const commentsOnThread = await getUseCase.execute(params);

    // Assert
    expect(commentsOnThread).toStrictEqual(detailThread);

    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(params.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.threadId);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(params.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(params.threadId);

    expect(getUseCase._assignRepliesToComment).toBeCalledWith(
      [
        {
          content: 'content',
          date: 'uiop',
          id: 'comment-1',
          username: 'user-123',
        },
        {
          content: '**komentar telah dihapus**',
          date: 'uiop2',
          id: 'comment-2',
          username: 'user-1233',
        },
      ],
      [
        {
          content: 'content2',
          date: 'uiop2',
          id: 'reply-1',
          username: 'user-1233',
        },
        {
          content: '**balasan telah dihapus**',
          date: 'a',
          id: 'reply-2',
          username: 'user-1233',
        },
      ],
    );
    expect(getUseCase._changeDeletedCommentContent).toBeCalledWith(expectedComments);
    expect(getUseCase._changeDeletedReplyContent).toBeCalledWith(unformattedReplies);
  });

  it('should operate _assignRepliesComment correctly', () => {
    // Arrange
    const getUseCase = new GetThreadCommentsUseCase({
      threadRepository: {}, replyRepository: {}, commentRepository: {},
    });

    const expectedComments = [
      {
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
      },
      {
        id: 'comment-2',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
      },
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

  it('should oeprate _changeDeletedCommentContent correctly', () => {
    // Assert
    const getUseCase = new GetThreadCommentsUseCase({
      threadRepository: {}, replyRepository: {}, commentRepository: {},
    });

    const getComments = [
      {
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
        isdelete: false,
      },
      {
        id: 'comment-2',
        content: 'content2',
        username: 'user-1233',
        date: 'uiop2',
        isdelete: true,
      },
    ];

    const expectedComments = [
      new DetailComment({
        id: 'comment-1',
        content: 'content',
        username: 'user-123',
        date: 'uiop',
      }),
      new DetailComment({
        id: 'comment-2',
        content: '**komentar telah dihapus**',
        username: 'user-1233',
        date: 'uiop2',
      }),
    ];

    const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_changeDeletedCommentContent');

    // Action
    getUseCase._changeDeletedCommentContent(getComments);

    // Assert
    expect(spyOnGetThreadUseCase).toReturnWith(expectedComments);
  });

  it('should operate _changeDeletedReplyContent correctly', () => {
    // Arrange
    const getUseCase = new GetThreadCommentsUseCase({
      threadRepository: {}, replyRepository: {}, commentRepository: {},
    });

    const getReply = [
      {
        id: 'reply-1',
        content: 'content2',
        comment_id: 'comment-1',
        username: 'user-1233',
        date: 'uiop2',
        is_delete: false,
      },
      {
        id: 'reply-2',
        content: 'content2',
        comment_id: 'comment-1',
        username: 'user-1233',
        date: 'a',
        is_delete: true,
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-1',
        content: 'content2',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'uiop2',
      },
      {
        id: 'reply-2',
        content: '**balasan telah dihapus**',
        commentId: 'comment-1',
        username: 'user-1233',
        date: 'a',
      },
    ];

    const spyOnGetThreadUseCase = jest.spyOn(getUseCase, '_changeDeletedReplyContent');

    // Action
    getUseCase._changeDeletedReplyContent(getReply);

    // Assert
    expect(spyOnGetThreadUseCase).toReturnWith(expectedReplies);
  });
});
