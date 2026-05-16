import { PartialType } from '@nestjs/swagger';
import { CreatePropertyamenityDto } from './create-propertyamenity.dto';

export class UpdatePropertyamenityDto extends PartialType(CreatePropertyamenityDto) {}
