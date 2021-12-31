class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;
    this.id = id;
    this.owner = owner;
    this.content = content;
  }

  _verifyPayload({ id, owner, content }) {
    if (!id || !owner || !content) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedComment;
