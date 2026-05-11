import { Controller, Get, Header, Param } from "@nestjs/common";
import { ResultsService, type ResultDto } from "./results.service";

@Controller("results")
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get(":token")
  // Personal data — never cached by intermediaries.
  @Header("Cache-Control", "private, no-store, max-age=0")
  get(@Param("token") token: string): Promise<ResultDto> {
    return this.resultsService.getByToken(token);
  }
}
