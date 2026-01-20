import { CheckSimBeforeRegCommand } from "./check-sim-before-reg.handler";
import { OcrCommand } from "./ocr.handler";

export const ORDER_COMMAND_REGISTRY: Record<string, any> = {
  CheckSimBeforeRegCommand,
  OcrCommand,
}
