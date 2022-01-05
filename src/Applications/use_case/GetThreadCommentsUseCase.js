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
    const likes = await this._likeRepository.getLikesByThreadId({
      threadId: useCaseParams.threadId,
    });

    /** formatting reply and comment content and formatting object to be used */
    const changedCommentContent = this._changeDeletedCommentContent(comments);
    const formattedLike = this._formatLikeTobeUsed(likes);
    const changedReplyContent = this._changeDeletedReplyContent(replies);

    /** Assign comment with like count and replies */
    const commentWithLikeCount = this._assignLikeCountToComment(
      changedCommentContent, formattedLike,
    );
    const commentsWithReplies = this._assignRepliesToComment(
      commentWithLikeCount, changedReplyContent,
    );

    const thread = { ...detailThread, comments: commentsWithReplies };

    return thread;
  }

  _changeDeletedCommentContent(comments) {
    return comments.map((comment) => {
      const newDetailComment = {};

      newDetailComment.id = comment.id;
      newDetailComment.username = comment.username;
      newDetailComment.date = comment.date;

      if (comment.isdelete) {
        newDetailComment.content = '**komentar telah dihapus**';
      } else {
        newDetailComment.content = comment.content;
      }
      return newDetailComment;
    });
  }

  _changeDeletedReplyContent(replies) {
    return replies.map((reply) => {
      const returnedReply = {};

      returnedReply.id = reply.id;
      returnedReply.date = reply.date;
      returnedReply.username = reply.username;
      returnedReply.commentId = reply.comment_id;

      if (reply.is_delete) {
        returnedReply.content = '**balasan telah dihapus**';
      } else {
        returnedReply.content = reply.content;
      }

      return returnedReply;
    });
  }

  _formatLikeTobeUsed(likes) {
    return likes.map((like) => {
      const newLike = {};
      newLike.likes = like.likes;
      newLike.commentId = like.id;

      return newLike;
    });
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
