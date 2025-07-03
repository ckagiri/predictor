import { lastValueFrom } from 'rxjs';

import {
  UserRepository,
  UserRepositoryImpl,
} from '../../../../db/repositories/user.repo.js';
import AppError from '../../common/AppError';
import Responder from '../../common/responders/Responder.js';
import Result from '../../common/result/index.js';
import { mapUserToDto } from '../data.mapper.js';
import {
  PasswordHasher,
  PasswordHasherImpl,
} from '../providers/passwordHasher.js';
import {
  TokenGenerator,
  TokenGeneratorImpl,
} from '../providers/tokenGenerator.js';
import { RequestModel } from './registerUserUseCase.js';

export class AuthenticateUserUseCase {
  constructor(
    private responder: Responder,
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private tokenGen: TokenGenerator
  ) {}

  static getInstance(
    responder: Responder,
    userRepository = UserRepositoryImpl.getInstance(),
    passwordHasher = PasswordHasherImpl.getInstance(),
    tokenGen = TokenGeneratorImpl.getInstance()
  ): AuthenticateUserUseCase {
    return new AuthenticateUserUseCase(
      responder,
      userRepository,
      passwordHasher,
      tokenGen
    );
  }

  async execute({ password, username }: RequestModel): Promise<void> {
    try {
      const foundUser = await lastValueFrom(
        this.userRepository.findOne$({ username })
      );

      if (!foundUser) {
        throw Result.fail(
          AppError.validationFailed('username or password is invalid')
        );
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(
        password,
        foundUser.password!
      );

      if (!isPasswordValid) {
        throw Result.fail(
          AppError.validationFailed('username or password is invalid')
        );
      }

      const userDto = mapUserToDto(foundUser, this.tokenGen);
      this.responder.respond({ user: userDto });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create('auth-failed', 'Authentication failed', err),
        'Internal Server Error'
      );
    }
  }
}
export { RequestModel };
