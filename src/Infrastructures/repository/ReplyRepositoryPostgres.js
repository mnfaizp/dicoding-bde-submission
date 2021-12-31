const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addReply(newReply) {
    const {
      content, commentId, owner,
    } = newReply;

    const id = `reply-${this._idGenerator()}`;
    const date = new this._dateGenerator().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner, date, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, commentId, owner, date, isDelete],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2 RETURNING is_delete',
      values: [true, replyId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('reply not found');
    }

    return result.rows[0];
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

    const returnedValues = result.rows.map((replies) => {
      const returnedReply = {};

      returnedReply.id = replies.id;
      returnedReply.date = replies.date;
      returnedReply.username = replies.username;
      returnedReply.commentId = replies.comment_id;

      if (replies.is_delete) {
        returnedReply.content = '**balasan telah dihapus**';
      } else {
        returnedReply.content = replies.content;
      }

      return returnedReply;
    });

    return returnedValues;
  }
}

module.exports = ReplyRepositoryPostgres;
