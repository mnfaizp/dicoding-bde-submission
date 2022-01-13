const pool = require('../../database/postgres/pool');
const CommentsTestTableHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTestTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTestTableHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTestTableHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTestTableHelper.cleanTable();
    await UsersTestTableHelper.cleanTable();
    await ThreadsTestTableHelper.cleanTable();
    await RepliesTestTableHelper.cleanTable();
  });

  describe('when POST threads/{threadId}/comments/{commentId}/replies', () => {
    it('should return response code 201 and persisted replies', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTestTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTestTableHelper.addComment({
        id: 'comment-123',
        content: 'comment',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '2021',
        isDelete: false,
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should return response code 200', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTestTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTestTableHelper.addComment({
        id: 'comment-123',
        content: 'comment',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '2021',
        isDelete: false,
      });

      await RepliesTestTableHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      await RepliesTestTableHelper.addReply({ id: 'reply-234', owner: 'user-123', commentId: 'comment-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should return 404 when reply id not found', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTestTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTestTableHelper.addComment({
        id: 'comment-123',
        content: 'comment',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '2021',
        isDelete: false,
      });

      await RepliesTestTableHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-1',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should return 403 when reply deleted not by owner', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await UsersTestTableHelper.addUser({ id: 'user-111' });

      await ThreadsTestTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTestTableHelper.addComment({
        id: 'comment-123',
        content: 'comment',
        owner: 'user-123',
        threadId: 'thread-123',
        date: '2021',
        isDelete: false,
      });

      await RepliesTestTableHelper.addReply({ id: 'reply-123', owner: 'user-111', commentId: 'comment-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
