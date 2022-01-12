const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._idGenerator = idGenerator;
    this._pool = pool;
  }

  async checkOwnerLikeOnComments({ owner, commentId }) {
    const query = {
      text: 'SELECT id FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async addLike({ commentId, owner }) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes(id, comment_id, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLike({ owner, commentId }) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    await this._pool.query(query);
  }

  async getLikesByThreadId({ threadId }) {
    const query = {
      text: 'SELECT count(likes.id) as likes, comments.id FROM threads JOIN comments ON comments.thread_id = threads.id JOIN likes ON likes.comment_id = comments.id WHERE threads.id = $1 GROUP BY comments.id',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
