import { lastValueFrom } from 'rxjs';

import { User } from '../../../../db/models/index.js';
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../../../db/repositories/user.repo.js';
import AppError from '../../common/AppError.js';
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

export interface RequestModel {
  password: string;
  username: string;
}

export class RegisterUserUseCase {
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
  ): RegisterUserUseCase {
    return new RegisterUserUseCase(
      responder,
      userRepository,
      passwordHasher,
      tokenGen
    );
  }

  async execute({ password, username }: RequestModel): Promise<any> {
    try {
      if (!isPasswordAllowed(password)) {
        throw Result.fail(
          AppError.validationFailed('password is not strong enough')
        );
      }

      if (!isUsernameAllowed(username)) {
        throw Result.fail(
          AppError.validationFailed(
            'username limited to 4-15 alphanumeric (except underscore) characters'
          )
        );
      }

      const existingUser = await lastValueFrom(
        this.userRepository.findOne$({ username })
      );
      if (existingUser) {
        throw Result.fail(
          AppError.validationFailed('username is already taken'),
          'Conflict'
        );
      }

      const passwordHashed = await this.passwordHasher.hashPassword(password);
      const newUser = await lastValueFrom(
        this.userRepository.create$({
          password: passwordHashed,
          username,
        } as User)
      );
      const userDto = mapUserToDto(newUser, this.tokenGen);
      this.responder.respond({ user: userDto });
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create('auth-failed', 'Registration failed', err),
        'Internal Server Error'
      );
    }
  }
}

const isPasswordAllowed = (password: string): boolean => {
  // Implement your password validation logic here
  // For example, check length, complexity, etc.
  return (
    password.length > 6 &&
    // non-alphanumeric
    /\W/.test(password) &&
    // digit
    /\d/.test(password) &&
    // capital letter
    /[A-Z]/.test(password) &&
    // lowercase letter
    /[a-z]/.test(password)
  );
};

const isUsernameAllowed = (username: string): boolean => {
  // 4-32 alphanumeric characters (with exception of underscore)
  return /^[A-Za-z0-9_]{4,32}$/.test(username);
};
