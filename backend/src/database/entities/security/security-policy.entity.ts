import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('security_policies')
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_type', length: 50 })
  policyType: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', default: () => "'{}'" })
  config: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'applies_to', length: 50, default: 'all' })
  appliesTo: string;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}