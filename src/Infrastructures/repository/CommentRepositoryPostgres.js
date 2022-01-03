const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new this._dateGenerator().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id, is_delete, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, threadId, isDelete, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = $2',
      values: [commentId, false],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('comment not found');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2 RETURNING id',
      values: [true, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('must be comment owner to delete');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT users.username as username, comments.id as id, comments.content as content, comments.date as date, comments.is_delete as isDelete FROM comments INNER JOIN users ON users.id = comments.owner WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const returnedValue = result.rows.map((comment) => {
      const newDetailComment = {};

      newDetailComment.id = comment.id;
      newDetailComment.username = comment.username;
      newDetailComment.date = comment.date;

      if (comment.isdelete) {
        newDetailComment.content = '**komentar telah dihapus**';
      } else {
        newDetailComment.content = comment.content;
      }
      return newDetailComment;
    });

    return returnedValue;
  }
}

module.exports = CommentRepositoryPostgres;
