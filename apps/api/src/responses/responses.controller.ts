import { Body, Controller, Post } from "@nestjs/common";
import { SubmitResponsesDto } from "./dto/submit-responses.dto";
import { ResponsesService } from "./responses.service";

@Controller("responses")
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  async submit(@Body() dto: SubmitResponsesDto): Promise<{ token: string }> {
    const { token } = await this.responsesService.submit(dto);
    return { token };
  }
}
