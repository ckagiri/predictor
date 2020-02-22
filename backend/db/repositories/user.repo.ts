import { UserEntity, UserDocument, User } from '../models/user.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface IUserRepository extends BaseRepository<UserEntity> { }

export class UserRepository extends BaseRepositoryImpl<UserEntity, UserDocument>
  implements IUserRepository {
  public static getInstance() {
    return new UserRepository();
  }

  constructor() {
    super(User);
  }
}
