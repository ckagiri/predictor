import UserModel, { User } from '../models/user.model.js';
import { BaseRepository, BaseRepositoryImpl } from './base.repo.js';

export type UserRepository = BaseRepository<User>;

export class UserRepositoryImpl
  extends BaseRepositoryImpl<User>
  implements UserRepository
{
  constructor() {
    super(UserModel);
  }

  public static getInstance() {
    return new UserRepositoryImpl();
  }
}
