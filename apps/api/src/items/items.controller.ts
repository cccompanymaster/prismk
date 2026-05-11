import { BadRequestException, Controller, Get, Header, Query } from "@nestjs/common";
import type { Item } from "@prism-k/data";
import { ItemsService } from "./items.service";

@Controller("items")
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  // Each request returns a different shuffle so the response can never be
  // cached by an intermediary; private + no-store prevents CDN / browser
  // back-button replays.
  @Header("Cache-Control", "private, no-store, max-age=0")
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
