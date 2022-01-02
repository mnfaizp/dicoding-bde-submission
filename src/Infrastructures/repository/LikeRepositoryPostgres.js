const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._idGenerator = idGenerator;
    this._pool = pool;
  }

  async getLikeById({ likeId }) {
    const query = {
      text: 'SELECT id FROM likes WHERE id = $1',
      values: [likeId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('no reply with given id');
    }

    return result.rows[0];
  }

  async addLike({ commentId, owner }) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes(id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLikeById({ likeId }) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [likeId],
    };

    await this._pool.query(query);
  }

  async verifyLikeOwner({ likeId, owner }) {
    const query = {
      text: 'SELECT id FROM likes WHERE id = $1 AND owner = $2',
      values: [likeId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('not like owner');
    }
  }

  async getLikesByThreadId({ threadId }) {
    const query = {
      text: 'SELECT count(likes.id) as likes, comments.id FROM threads JOIN comments ON comments.thread_id = threads.id JOIN likes ON likes.comment_id = comments.id WHERE threads.id = $1 GROUP BY comments.id',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((likes) => {
      const newComment = {};
      newComment.likes = likes.likes;
      newComment.commentId = likes.id;
      return newComment;
    });
  }
}

module.exports = LikeRepositoryPostgres;
