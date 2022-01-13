const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Thread not found');
    }
  }

  async addThread(addThread) {
    const { title, body, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads(id, title, body, owner) VALUES ($1, $2, $3, $4) RETURNING id, owner, title',
      values: [id, title, body, owner],
    };

    const { rows } = await this._pool.query(query);

    return new AddedThread({ ...rows[0] });
  }

  async getThreadById(threadId) {
    const query = {
      text: 'SELECT threads.id, threads.date, threads.body, threads.title, users.username FROM threads JOIN users ON users.id = threads.owner WHERE threads.id = $1',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return new DetailThread({ ...rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
