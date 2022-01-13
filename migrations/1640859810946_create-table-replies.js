exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'Boolean',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.addConstraint('replies', 'fk_replies.comment_id_comments.id', 'FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
