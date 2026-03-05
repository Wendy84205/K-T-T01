import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('security_incidents')
export class SecurityIncident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'incident_type', length: 50 })
    incidentType: string;

    @Column({ length: 20, default: 'MEDIUM' })
    severity: string;

    @Column({ length: 200, nullable: true })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
    userId: string;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress: string;

    @Column({ length: 20, default: 'ACTIVE' })
    status: string;

    @Column({ name: 'affected_resources', type: 'json', nullable: true })
    affectedResources: any;

    @Column({ name: 'investigation_notes', type: 'text', nullable: true })
    investigationNotes: string;

    @Column({ type: 'text', nullable: true })
    resolution: string;

    @Column({ name: 'resolved_by', type: 'char', length: 36, nullable: true })
    resolvedBy: string;

    @Column({ name: 'resolved_at', nullable: true })
    resolvedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
