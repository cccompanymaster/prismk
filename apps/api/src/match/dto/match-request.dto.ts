import { IsIn, IsString, MinLength } from "class-validator";

export type MatchContextKey = "work" | "friend" | "love" | "family";

export class MatchRequestDto {
  @IsString()
  @MinLength(8)
  tokenA!: string;

  @IsString()
  @MinLength(8)
  tokenB!: string;

  @IsIn(["work", "friend", "love", "family"])
  context!: MatchContextKey;
}
