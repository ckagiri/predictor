import { IUser, IUserDocument, User } from '../models/user.model';
import { IBaseRepository, BaseRepository } from './base.repo';

export interface IUserRepository extends IBaseRepository<IUser> {}

export class UserRepository extends BaseRepository<IUser, IUserDocument>
  implements IUserRepository {
  static getInstance() {
    return new UserRepository();
  }

  constructor() {
    super(User);
  }
}
