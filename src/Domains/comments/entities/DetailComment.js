class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, content,
      username, date,
      likeCount,
    } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.likeCount = likeCount;
  }

  _verifyPayload({
    id, content, username, date, likeCount,
  }) {
    if (!id || !content || !username || !date) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof username !== 'string' || typeof date !== 'string') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
