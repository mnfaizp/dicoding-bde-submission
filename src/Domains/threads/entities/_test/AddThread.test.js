const AddThread = require('../AddThread');

describe('AddThread', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      body: 'body',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      body: 567,
      title: true,
      owner: 'user',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should make object AddThread Correctly', () => {
    // Arrange
    const payload = {
      body: 'test body',
      title: 'test title',
      owner: 'test owner',
    };

    // Action
    const { body, title, owner } = new AddThread(payload);

    // Assert
    expect(body).toEqual(payload.body);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
