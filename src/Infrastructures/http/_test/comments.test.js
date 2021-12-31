const pool = require('../../database/postgres/pool');
const CommentsTableHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableHelper.cleanTable();
    await UsersTableHelper.cleanTable();
    await ThreadsTableHelper.cleanTable();
  });

  describe('when POST threads/{threadId}/comments', () => {
    it('should return response code 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'test content',
      };
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments',
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
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should return response code 200', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTableHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'test-body',
        owner: 'user-123',
        date: '2021',
      });

      await CommentsTableHelper.addComment({
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
        url: '/threads/thread-123/comments/comment-123',
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
  });
});
