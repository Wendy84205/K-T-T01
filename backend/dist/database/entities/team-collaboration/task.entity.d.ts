import { Project } from './project.entity';
import { User } from '../core/user.entity';
export declare class Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    assigneeId: string;
    reporterId: string;
    status: string;
    priority: string;
    isConfidential: boolean;
    dueDate: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    project: Project;
    assignee: User;
    reporter: User;
}
