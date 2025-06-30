import * as bcrypt from 'bcryptjs';

export interface PasswordHasher {
  comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class PasswordHasherImpl implements PasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = process.env.NODE_ENV !== 'test' ? 10 : 1) {
    this.saltRounds = saltRounds;
  }

  static getInstance(saltRounds?: number): PasswordHasher {
    return new PasswordHasherImpl(saltRounds);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
