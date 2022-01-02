const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('deleteLike', () => {
    it('should delete like from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action
      await likeRepositoryPostgres.deleteLikeById({ likeId: 'like-123' });

      // Assert
      const deleted = await LikesTableTestHelper.findLike({ id: 'like-123' });
      expect(deleted).toHaveLength(0);
    });
  });

  describe('getLikeById function', () => {
    it('should throw NotFoundError when there is no such like', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.getLikeById({ likeId: 'like' })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when like was found with given param', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action
      const result = await likeRepositoryPostgres.getLikeById({ likeId: 'like-123' });

      // Assert
      expect(result.id).toEqual('like-123');
    });
  });

  describe('verifyLikeOwner function', () => {
    it('should throw AuthorizationError when is not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.verifyLikeOwner({ likeId: 'like-123', owner: 'dicoding' })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when like deleted by owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.verifyLikeOwner({ likeId: 'like-123', owner: 'user-123' })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getLikesByThreadId function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'username',
        password: 'password',
        fullName: 'full name',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'coba',
        password: 'password',
        fullName: 'full name',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'coba1',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2021',
        isDelete: false,
      });

      await LikesTableTestHelper.addLike({
        id: 'like-1',
        commentId: 'comment-1',
        owner: 'user-123',
      });

      await LikesTableTestHelper.addLike({
        id: 'like-2',
        commentId: 'comment-1',
        owner: 'user-234',
      });

      const expectedLikes = [
        {
          likes: '2',
          commentId: 'comment-1',
        },
      ];

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action
      const result = await likeRepositoryPostgres.getLikesByThreadId({ threadId: 'thread-123' });

      // Assert
      expect(result).toStrictEqual(expectedLikes);
    });
  });

  describe('addLike Function ', () => {
    it('should persist add like and return added like correctyl', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'username',
        password: 'password',
        fullName: 'full name',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'coba1',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2021',
        isDelete: false,
      });

      const newLike = {
        commentId: 'comment-1',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123'; // stub stub

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.addLike(newLike);

      // Assert
      const likes = await LikesTableTestHelper.findLike({ id: 'like-123' });
      expect(likes).toHaveLength(1);
    });
  });
});
