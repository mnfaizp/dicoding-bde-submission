/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'test content', owner = 'user-123', commentId = 'comment-123', isDelete = false, date = '2021',
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id, is_delete, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, commentId, isDelete, date],
    };

    await pool.query(query);
  },

  async findReply(replyId) {
    const query = {
      text: 'SELECT id, is_delete FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
