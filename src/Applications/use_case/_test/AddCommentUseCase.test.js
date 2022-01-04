const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('NewCommentUseCase', () => {
  it('should orchestrating the add comment use case', async () => {
    // Arrange
    const comment = {
      content: 'test content',
    };

    const owner = 'test owner';
    const threadId = 'test thread';

    const newComment = { ...comment, owner, threadId };

    const expectedAddedComment = new AddedComment({
      id: 'test-id',
      content: 'test content',
      owner: 'test owner',
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository, threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(newComment);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment({
      threadId: newComment.threadId,
      content: newComment.content,
      owner: newComment.owner,
    }));
  });
});
