import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import type { Item } from "@prism-k/data";
import { ItemsService } from "./items.service";

@Controller("items")
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  list(@Query("version") version?: string): { version: "lite" | "full"; items: Item[] } {
    if (version !== "lite" && version !== "full") {
      throw new BadRequestException("version must be 'lite' or 'full'");
    }
    return {
      version,
      items: this.itemsService.getShuffledItems(version),
    };
  }
}
