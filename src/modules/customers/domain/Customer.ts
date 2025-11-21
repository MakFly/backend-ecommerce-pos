import { AggregateRoot } from '@core/domain/AggregateRoot.js';

interface CustomerProps {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
  metadata?: Record<string, unknown>;
}

export class Customer extends AggregateRoot<CustomerProps> {
  private constructor(private props: CustomerProps, id?: string) {
    super(props, id);
  }

  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  static reconstitute(props: CustomerProps, id: string): Customer {
    return new Customer(props, id);
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

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  update(props: Partial<CustomerProps>): void {
    this.props = { ...this.props, ...props };
    this.touch();
  }
}
