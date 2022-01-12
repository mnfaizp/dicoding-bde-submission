const pool = require('../../database/postgres/pool');
const CommentsTestTableHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTestTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTestTableHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTestTableHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe(' /likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTestTableHelper.cleanTable();
    await UsersTestTableHelper.cleanTable();
    await ThreadsTestTableHelper.cleanTable();
    await LikesTestTableHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
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

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/likes',
        method: 'PUT',
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
