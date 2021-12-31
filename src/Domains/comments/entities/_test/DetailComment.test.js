const DetailComment = require('../DetailComment');

describe('DetailComment', () => {
  it('should throw an error when payload did not contain needed property', () => {
    const payload = {
      content: 'test conete',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'content-123',
      content: 'test-content',
      username: 123,
      date: '200',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'content-123',
      content: 'test-content',
      username: 'test-owner',
      date: '3456',
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.username).toEqual(payload.username);
  });
});
