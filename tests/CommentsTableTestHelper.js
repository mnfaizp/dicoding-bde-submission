/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'test content', owner = 'user-123', threadId = 'thread-123', isDelete = false, date = '2021',
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id, is_delete, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, threadId, isDelete, date],
    };

    await pool.query(query);
  },

  async findComment(commentId) {
    const query = {
      text: 'SELECT id, is_delete FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
