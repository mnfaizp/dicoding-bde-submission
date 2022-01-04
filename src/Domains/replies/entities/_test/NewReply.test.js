const NewReply = require('../NewReply');

describe('NewReply', () => {
  it('should throw error when payload did not containe required parameters', () => {
    // Arrange
    const payload = {
      content: 'coba',
      owner: 'owner',
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      owner: true,
      commentId: '1234',
      threadId: '11',
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'content',
      owner: 'true',
      commentId: '1234',
      threadId: '11',
    };

    // Action
    const {
      owner, content, commentId, threadId,
    } = new NewReply(payload);

    // Assert
    expect(owner).toEqual(payload.owner);
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(threadId).toEqual(payload.threadId);
  });
});
