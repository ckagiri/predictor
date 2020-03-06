import UserModel, { User, UserDocument } from '../models/user.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface UserRepository extends BaseRepository<User> { }

export class UserRepositoryImpl
  extends BaseRepositoryImpl<User, UserDocument>
  implements UserRepository {
  public static getInstance() {
    return new UserRepositoryImpl();
  }

  constructor() {
    super(UserModel);
  }
}
