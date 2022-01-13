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
    await this._threadRepository.verifyThreadAvailability(useCaseParams.threadId);
    const detailThread = await this._threadRepository.getThreadById(useCaseParams.threadId);
    const comments = await this._commentRepository
      .getCommentsByThreadId(useCaseParams.threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(useCaseParams.threadId);
    const counter = await this._likeRepository.getLikesByThreadId({
      threadId: useCaseParams.threadId,
    });

    /** formatting reply and comment content and formatting object to be used */
    const changedCommentContent = this._changeDeletedCommentContent(comments);
    const assignedCommentWithLikeCount = this._assignLikeCountToComment(
      changedCommentContent, counter,
    );
    const changedReplyContent = this._changeDeletedReplyContent(replies);

    /** Assign comment with like count and replies */
    const commentsWithReplies = this._assignRepliesToComment(
      assignedCommentWithLikeCount, changedReplyContent,
    );

    return { ...detailThread, comments: commentsWithReplies };
  }

  _changeDeletedCommentContent(comments) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.isdelete ? '**komentar telah dihapus**' : comment.content,
    }));
  }

  _changeDeletedReplyContent(replies) {
    return replies.map((reply) => ({
      id: reply.id,
      date: reply.date,
      username: reply.username,
      commentId: reply.comment_id,
      content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
    }));
  }

  _assignRepliesToComment(comments, replies) {
    return comments.map((comment) => {
      const commentReplies = replies.filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          const { commentId, ...otherReply } = reply;
          return otherReply;
        });

      Object.assign(comment, { replies: commentReplies });

      return comment;
    });
  }

  _assignLikeCountToComment(comments, counter) {
    return comments.map((comment) => {
      const commentLike = counter.filter((like) => like.id === comment.id)
        .map((like) => like.likes);

      Object.assign(comment, { likeCount: parseInt(commentLike.toString(), 10) });

      return comment;
    });
  }
}

module.exports = GetThreadCommentsUseCase;
