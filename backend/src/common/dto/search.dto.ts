import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SearchDto extends PaginationDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
