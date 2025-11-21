import { AggregateRoot } from '@core/domain/AggregateRoot.js';
import bcrypt from 'bcrypt';

interface UserProps {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(private props: UserProps, id?: string) {
    super(props, id);
  }

  static async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roles: string[] = ['CUSTOMER']
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    return new User({
      email,
      passwordHash,
      firstName,
      lastName,
      roles,
      isActive: true,
    });
  }

  static reconstitute(props: UserProps, id: string): User {
    return new User(props, id);
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get roles(): ReadonlyArray<string> {
    return this.props.roles;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.props.passwordHash);
  }

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  addRole(role: string): void {
    if (!this.props.roles.includes(role)) {
      this.props.roles.push(role);
      this.touch();
    }
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }
}
