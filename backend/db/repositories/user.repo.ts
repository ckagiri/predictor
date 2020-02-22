import { UserEntity, UserDocument, User } from '../models/user.model';
import { IBaseRepository, BaseRepository } from './base.repo';

export interface IUserRepository extends IBaseRepository<UserEntity> { }

export class UserRepository extends BaseRepository<UserEntity, UserDocument>
  implements IUserRepository {
  public static getInstance() {
    return new UserRepository();
  }

  constructor() {
    super(User);
  }
}
