import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class ItemResponseDto {
  @IsInt()
  @Min(1)
  itemId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  value!: 1 | 2 | 3 | 4 | 5 | 6;
}

export class SubmitResponsesDto {
  @IsIn(["lite", "full"])
  version!: "lite" | "full";

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ItemResponseDto)
  responses!: ItemResponseDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedSeconds?: number;
}
