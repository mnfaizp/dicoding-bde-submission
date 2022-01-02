class GetThreadCommentsUseCase {
  constructor({
    commentRepository, threadRepository,
    replyRepository, likeRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams) {
    /** Get detail thread, comments, replies, and likes with threadId from database */
    const detailThread = await this._threadRepository.getThreadById(useCaseParams.threadId);
    const comments = await this._commentRepository
      .getCommentsByThreadId(useCaseParams.threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(useCaseParams.threadId);
    const likes = await this._likeRepository.getLikesByThreadId({
      threadId: useCaseParams.threadId,
    });

    /** Assign comment with like count and replies */
    const commentWithLikeCount = this._assignLikeCountToComment(comments, likes);
    const commentsWithReplies = this._assignRepliesToComment(commentWithLikeCount, replies);
    detailThread.comments = commentsWithReplies;

    return detailThread;
  }

  _assignLikeCountToComment(comments, counter) {
    const commentWithLikeCount = comments;
    for (let i = 0; i < commentWithLikeCount.length; i += 1) {
      const countLike = counter
        .filter((like) => like.commentId === commentWithLikeCount[i].id)
        .map((like) => like.likes);

      commentWithLikeCount[i].likeCount = parseInt(countLike.toString(), 10);
    }
    return commentWithLikeCount;
  }

  _assignRepliesToComment(comments, replies) {
    const newComment = comments;
    for (let i = 0; i < newComment.length; i += 1) {
      newComment[i].replies = replies.filter((reply) => reply.commentId === newComment[i].id)
        .map((reply) => {
          const { commentId, ...otherReply } = reply;
          return otherReply;
        });
    }
    return newComment;
  }
}

module.exports = GetThreadCommentsUseCase;
