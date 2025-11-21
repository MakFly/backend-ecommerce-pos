import { AggregateRoot } from '@core/domain/AggregateRoot.js';
import { Money } from '@modules/products/domain/Money.js';

export type POSSessionStatus = 'open' | 'closed';

interface POSSessionProps {
  sessionNumber: string;
  userId: string;
  warehouseId: string;
  status: POSSessionStatus;
  openingCash: Money;
  closingCash?: Money;
  openedAt: Date;
  closedAt?: Date;
}

export class POSSession extends AggregateRoot<POSSessionProps> {
  private constructor(private props: POSSessionProps, id?: string) {
    super(props, id);
  }

  static create(userId: string, warehouseId: string, openingCash: Money): POSSession {
    return new POSSession({
      sessionNumber: `POS-${Date.now()}`,
      userId,
      warehouseId,
      status: 'open',
      openingCash,
      openedAt: new Date(),
    });
  }

  static reconstitute(props: POSSessionProps, id: string): POSSession {
    return new POSSession(props, id);
  }

  get sessionNumber(): string {
    return this.props.sessionNumber;
  }

  get status(): POSSessionStatus {
    return this.props.status;
  }

  close(closingCash: Money): void {
    this.props.status = 'closed';
    this.props.closingCash = closingCash;
    this.props.closedAt = new Date();
    this.touch();
  }
}
