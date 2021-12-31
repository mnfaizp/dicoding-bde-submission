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
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
