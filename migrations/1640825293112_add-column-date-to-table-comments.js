exports.up = (pgm) => {
  pgm.addColumns('comments', {
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.sql("UPDATE comments SET date = '2021' WHERE date = NULL");
};

exports.down = (pgm) => {
  pgm.dropColumns('comments', 'date');
};
