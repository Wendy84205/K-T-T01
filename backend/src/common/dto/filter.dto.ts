import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
