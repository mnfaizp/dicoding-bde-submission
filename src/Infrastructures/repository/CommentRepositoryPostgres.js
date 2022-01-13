const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES ($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const { rows } = await this._pool.query(query);

    return new AddedComment({ ...rows[0] });
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = $2',
      values: [commentId, false],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('comment not found');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2 RETURNING id',
      values: [true, commentId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthorizationError('must be comment owner to delete');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT users.username as username, comments.id as id, comments.content as content, comments.date as date, comments.is_delete as isDelete FROM comments INNER JOIN users ON users.id = comments.owner WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
