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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findComment('comment-123');
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'test-content',
      }));
    });
  });

  describe('verifyCommentAvailabitlity function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('aa')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123', isDelete: false, owner: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return AuthorizationError when not owner being verified', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('a-123', 'a-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner being verified', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123', isDelete: false, owner: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
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
          isdelete: false,
        },
        {
          id: 'comment-2',
          content: 'coba2',
          date: '2022',
          username: 'coba',
          isdelete: true,
        },
      ];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      const result = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(result).toStrictEqual(expectedDetailComment);
    });
  });

  describe('deleteComment function', () => {
    it('should change is_delete field to true', async () => {
      // Assert
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123', isDelete: false, owner: 'user-123',
      });
      const commmentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      await commmentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const result = await CommentsTableTestHelper.findComment('comment-123');
      expect(result[0].is_delete).toEqual(true);
    });
  });
});
