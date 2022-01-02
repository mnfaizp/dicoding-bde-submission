const LikeRepository = require('../LikeRepository');

describe('LikeRepository', () => {
  it('should throw an error when invoke abstract behaviour', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action
    await expect(likeRepository.addLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.deleteLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.getLikesByThreadId({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.checkOwnerLikeOnComments({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
