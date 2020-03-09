import sinon from 'sinon';

export type Res = {
  status?: any;
  json?: any;
  send?: any;
};

export type Req = {
  params?: any;
  body?: any;
};

export const setupReqRes = () => {
  const req: Req = {
    params: {},
    body: {},
  };
  const res: Res = {};

  Object.assign(res, {
    status: sinon.spy(
      function status(this: Res) {
        return this;
      }.bind(res),
    ),
    json: sinon.spy(
      function json(this: Res) {
        return this;
      }.bind(res),
    ),
    send: sinon.spy(
      function send(this: Res) {
        return this;
      }.bind(res),
    ),
  });
  return { req, res };
};
