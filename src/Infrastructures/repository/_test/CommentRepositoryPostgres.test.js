const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added thread correctly', async () => {
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

      const newComment = new NewComment({
        content: 'test-content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123'; // stub stub
      function fakeDateGen() {
        this.toISOString = () => '2021';
      }

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator, fakeDateGen,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'test-content',
      }));
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.getCommentById('aa')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return AuthorizationError when not owner being verified', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('aa', 'aa')).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return detail thread correctly', async () => {
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

      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'coba2',
        threadId: 'thread-123',
        owner: 'user-234',
        date: '2022',
        isDelete: true,
      });

      const expectedDetailComment = [
        {
          id: 'comment-1',
          content: 'coba1',
          date: '2021',
          username: 'username',
        },
        {
          id: 'comment-2',
          content: '**komentar telah dihapus**',
          date: '2022',
          username: 'coba',
        },
      ];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      const result = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(result).toStrictEqual(expectedDetailComment);
    });
  });
});
