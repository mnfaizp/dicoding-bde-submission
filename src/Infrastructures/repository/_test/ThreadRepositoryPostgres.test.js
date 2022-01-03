const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw not found error when thread with given id not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('aa')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw not found error when theres thread with given id', async () => {
      // Arrange
      UsersTableTestHelper.addUser({ id: 'user-123' });
      ThreadsTableTestHelper.addThread({ id: 'aa', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('aa')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'username',
        password: 'password',
        fullName: 'full name',
      });

      const addThread = new AddThread({
        title: 'test title',
        body: 'test body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub stub
      function fakeDateGen() {
        this.toISOString = () => '2021';
      }

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool, fakeIdGenerator, fakeDateGen,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'test title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return detail thread with given id', async () => {
      // Assert
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', owner: 'user-123', title: 'test title', body: 'test body', date: '2021',
      });

      // Action
      const result = await threadRepositoryPostgres.getThreadById('thread-123');

      // Action
      expect(result).toEqual(new DetailThread({
        id: 'thread-123',
        username: 'user123',
        title: 'test title',
        body: 'test body',
        date: '2021',
      }));
    });
  });
});
