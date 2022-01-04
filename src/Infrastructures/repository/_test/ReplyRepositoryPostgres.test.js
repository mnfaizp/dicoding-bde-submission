const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('deleteReply', () => {
    it('should change is_invalid value to true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ commentId: 'comment-123', owner: 'user-123', id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      const { is_delete: isDelete } = await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      expect(isDelete).toEqual(true);
    });
  });

  describe('getReplyById function', () => {
    it('should throw NotFoundError when there is no such reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ commentId: 'comment-123', owner: 'user-123', id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.getReplyById('reply')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when reply was found with given param', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ commentId: 'comment-123', owner: 'user-123', id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      const result = await replyRepositoryPostgres.getReplyById('reply-123');

      // Assert
      expect(result.id).toEqual('reply-123');
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when is not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ commentId: 'comment-123', owner: 'user-123', id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'dicoding')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply deleted by owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test' }); // memasukan user baru dengan username test
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ owner: 'user-123', id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ commentId: 'comment-123', owner: 'user-123', id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getReplyByThreadId function', () => {
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

      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        content: 'coba1',
        commentId: 'comment-1',
        owner: 'user-123',
        date: '2021',
        isDelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        content: 'coba2',
        commentId: 'comment-1',
        owner: 'user-234',
        date: '2022',
        isDelete: true,
      });

      const expectedReplies = [
        {
          id: 'reply-1',
          content: 'coba1',
          comment_id: 'comment-1',
          date: '2021',
          username: 'username',
          is_delete: false,
        },
        {
          id: 'reply-2',
          comment_id: 'comment-1',
          content: 'coba2',
          date: '2022',
          username: 'coba',
          is_delete: true,
        },
      ];

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      const result = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(result).toStrictEqual(expectedReplies);
    });
  });

  describe('addReply Function ', () => {
    it('should persist add reply and return added reply correctyl', async () => {
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

      const newReply = new NewReply({
        content: 'content',
        commentId: 'comment-1',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123'; // stub stub
      function fakeDateGen() {
        this.toISOString = () => '2021';
      }

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, fakeIdGenerator, fakeDateGen,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReply('reply-123');
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'content',
        owner: 'user-123',
      }));
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
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', owner: 'user-123', commentId: 'comment-123', isDelete: false,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const result = await RepliesTableTestHelper.findReply('reply-123');
      expect(result[0].is_delete).toEqual(true);
    });
  });
});
