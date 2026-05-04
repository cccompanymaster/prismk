import { Body, Controller, Post } from "@nestjs/common";
import { MatchRequestDto } from "./dto/match-request.dto";
import { MatchService, type MatchOutcomeDto } from "./match.service";

@Controller("match")
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  match(@Body() dto: MatchRequestDto): Promise<MatchOutcomeDto> {
    return this.matchService.match(dto);
  }
}
