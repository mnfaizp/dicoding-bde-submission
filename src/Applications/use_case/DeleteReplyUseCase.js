class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const {
      threadId, commentId, replyId, owner,
    } = useCaseParams;

    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);
    await this._replyRepository.getReplyById(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    const { is_delete: isDelete } = await this._replyRepository.deleteReply(replyId);
    return isDelete;
  }
}

module.exports = DeleteReplyUseCase;
