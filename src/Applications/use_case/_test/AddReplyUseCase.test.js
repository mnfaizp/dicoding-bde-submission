const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply use case', async () => {
    // Arrange
    const payload = {
      content: 'reply content',
    };

    const owner = 'test owner';
    const threadId = 'thread-id';
    const commentId = 'comment.Id';

    const newReply = new NewReply({
      ...payload, owner, threadId, commentId,
    });

    const expectedAddedReply = new AddedReply({ id: 'test-id', content: 'reply content', owner: 'test owner ' });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(expectedAddedReply));

    const getReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(newReply);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new NewReply({
      content: payload.content,
      threadId,
      commentId,
      owner,
    }));
  });
});
