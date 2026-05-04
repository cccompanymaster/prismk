import { Controller, Get, Param } from "@nestjs/common";
import { ResultsService, type ResultDto } from "./results.service";

@Controller("results")
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get(":token")
  get(@Param("token") token: string): Promise<ResultDto> {
    return this.resultsService.getByToken(token);
  }
}
