import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export enum OperatorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('operators')
export class Operator {
  @SnowflakeIdColumn()
  id: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: OperatorStatus,
    default: OperatorStatus.PENDING,
  })
  status: OperatorStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy: string;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
