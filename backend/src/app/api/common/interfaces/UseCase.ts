import HttpRequestModel from './HttpRequestModel';

export interface UseCase {
  execute(requestModel: HttpRequestModel): void;
}
