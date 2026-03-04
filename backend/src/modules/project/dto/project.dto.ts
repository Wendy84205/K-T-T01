import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    teamId?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    securityLevel?: number;

    @IsBoolean()
    @IsOptional()
    isConfidential?: boolean;

    @IsEnum(['planned', 'active', 'on_hold', 'completed', 'cancelled'])
    @IsOptional()
    status?: string;

    @IsEnum(['low', 'medium', 'high', 'critical'])
    @IsOptional()
    priority?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsDateString()
    @IsOptional()
    deadline?: string;
}

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    securityLevel?: number;

    @IsBoolean()
    @IsOptional()
    isConfidential?: boolean;

    @IsEnum(['planned', 'active', 'on_hold', 'completed', 'cancelled'])
    @IsOptional()
    status?: string;

    @IsEnum(['low', 'medium', 'high', 'critical'])
    @IsOptional()
    priority?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsDateString()
    @IsOptional()
    deadline?: string;
}

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    assigneeId?: string;

    @IsEnum(['todo', 'in_progress', 'review', 'done'])
    @IsOptional()
    status?: string;

    @IsEnum(['low', 'medium', 'high', 'critical'])
    @IsOptional()
    priority?: string;

    @IsBoolean()
    @IsOptional()
    isConfidential?: boolean;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    assigneeId?: string;

    @IsEnum(['todo', 'in_progress', 'review', 'done'])
    @IsOptional()
    status?: string;

    @IsEnum(['low', 'medium', 'high', 'critical'])
    @IsOptional()
    priority?: string;

    @IsBoolean()
    @IsOptional()
    isConfidential?: boolean;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}

export class RequestAccessDto {
    @IsString()
    businessJustification: string;

    @IsInt()
    @IsOptional()
    durationMinutes?: number;
}
