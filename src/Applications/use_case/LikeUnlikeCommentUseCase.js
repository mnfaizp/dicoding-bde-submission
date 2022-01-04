class LikeUnlikeCommentUseCase {
  constructor({ commentRepository, threadRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, owner } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const checkResult = await this._likeRepository.checkOwnerLikeOnComments({ owner, commentId });
    const checkLiked = this._checkCommentWasLiked(checkResult);

    if (checkLiked) {
      await this._likeRepository.deleteLike({ commentId, owner });
    } else {
      await this._likeRepository.addLike({ commentId, owner });
    }
  }

  _checkCommentWasLiked(checkResult) {
    return checkResult.length > 0;
  }
}

module.exports = LikeUnlikeCommentUseCase;
