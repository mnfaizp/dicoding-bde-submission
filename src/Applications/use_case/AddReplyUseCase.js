const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.getThreadById(useCasePayload.threadId);
    await this._commentRepository.getCommentById(useCasePayload.commentId);
    const addedReply = await this._replyRepository.addReply(newReply);
    return addedReply;
  }
}

module.exports = AddReplyUseCase;
