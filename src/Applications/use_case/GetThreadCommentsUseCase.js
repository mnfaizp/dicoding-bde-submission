class GetThreadCommentsUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const detailThread = await this._threadRepository.getThreadById(useCaseParams.threadId);
    const comments = await this._commentRepository
      .getCommentsByThreadId(useCaseParams.threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(useCaseParams.threadId);

    const commentsWithReplies = this._assignRepliesToComment(comments, replies);
    detailThread.comments = commentsWithReplies;
    return detailThread;
  }

  _assignRepliesToComment(comments, replies) {
    const newComment = comments;
    for (let i = 0; i < newComment.length; i += 1) {
      newComment[i].replies = replies.filter((reply) => reply.commentId === newComment[i].id)
        .map((reply) => {
          const { commentId, ...otherReply } = reply;
          console.log(otherReply);
          return otherReply;
        });
    }
    return newComment;
  }
}

module.exports = GetThreadCommentsUseCase;
