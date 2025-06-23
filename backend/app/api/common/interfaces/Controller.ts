import HttpRequestModel from './HttpRequestModel';

export default interface Controller {
  processRequest(httpRequest: HttpRequestModel): Promise<void>;
}
