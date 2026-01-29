import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDtoClass } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDtoClass) { }