import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
    @PrimaryColumn()
    key: string;

    @Column('text')
    value: string; // We'll store JSON stringified data here or simple values

    @UpdateDateColumn()
    updatedAt: Date;
}
