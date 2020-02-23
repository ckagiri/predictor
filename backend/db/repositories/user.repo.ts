import { UserEntity, UserDocument, User } from '../models/user.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface UserRepository extends BaseRepository<UserEntity> {}

export class UserRepositoryImpl
  extends BaseRepositoryImpl<UserEntity, UserDocument>
  implements UserRepository {
  public static getInstance() {
    return new UserRepositoryImpl();
  }

  constructor() {
    super(User);
  }
}
