import { UserModel, UserDocument, User } from '../models/user.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface UserRepository extends BaseRepository<UserModel> {}

export class UserRepositoryImpl
  extends BaseRepositoryImpl<UserModel, UserDocument>
  implements UserRepository {
  public static getInstance() {
    return new UserRepositoryImpl();
  }

  constructor() {
    super(User);
  }
}
