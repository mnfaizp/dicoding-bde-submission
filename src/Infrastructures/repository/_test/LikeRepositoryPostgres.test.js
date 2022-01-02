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
      await likeRepositoryPostgres.deleteLike({ commentId: 'comment-123', owner: 'user-123' });

      // Assert
      const deleted = await LikesTableTestHelper.findLike({ id: 'like-123' });
      expect(deleted).toHaveLength(0);
    });
  });

  describe('checkOwnerLikeOnComments function', () => {
    it('should return likes object with given owner and comment parameters', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123', id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {}, {});

      // Action
      const result = await likeRepositoryPostgres.checkOwnerLikeOnComments({ owner: 'user-123', commentId: 'comment-123' });

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
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
