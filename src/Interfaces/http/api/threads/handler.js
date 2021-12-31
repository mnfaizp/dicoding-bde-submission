const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadCommentsUseCase = require('../../../../Applications/use_case/GetThreadCommentsUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadCommentsHandler = this.getThreadCommentsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute(request.payload, owner);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadCommentsHandler(request, h) {
    const getThreadCommentsUseCase = this._container.getInstance(GetThreadCommentsUseCase.name);
    const { threadId } = request.params;
    const thread = await getThreadCommentsUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
