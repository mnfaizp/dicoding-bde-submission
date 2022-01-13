const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const {
      content, commentId, owner,
    } = newReply;

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyAvailability(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('reply not found');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('you need to be owner to delete this');
    }
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: 'SELECT replies.id, replies.comment_id, replies.is_delete, replies.content, replies.date, users.username FROM replies JOIN users ON users.id = replies.owner JOIN comments ON comments.id = replies.comment_id JOIN threads ON threads.id = comments.thread_id WHERE threads.id = $1 ORDER BY replies.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
