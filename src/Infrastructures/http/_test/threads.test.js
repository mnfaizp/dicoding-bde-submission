const pool = require('../../database/postgres/pool');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTestTableHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableHelper.cleanTable();
    await UsersTableHelper.cleanTable();
    await CommentsTestTableHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should return response code 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'test title',
        body: 'test body',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads',
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
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should return response code 200 thread detail data with comments', async () => {
      // Arrange
      const params = {
        threadId: 'thread-123',
      };

      await UsersTableHelper.addUser({
        id: 'user-123',
        username: 'testusername',
        password: 'testpassword',
        fullName: 'test fullName',
      });

      await UsersTableHelper.addUser({
        id: 'user-124',
        username: '124',
        password: 'testpassword',
        fullName: 'test fullName',
      });

      await ThreadsTableHelper.addThread({
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

      await CommentsTestTableHelper.addComment({
        id: 'comment-234',
        content: 'comment2',
        owner: 'user-124',
        threadId: 'thread-123',
        date: '2022',
        isDelete: true,
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123',
        method: 'GET',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();

      expect(responseJson.data.thread.id).toEqual(params.threadId);
    });
  });
});
