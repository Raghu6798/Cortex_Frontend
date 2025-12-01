
import type { StepInput, StepOutput } from "./step-handler";

export async function conditionStep(input: StepInput & { condition: boolean }): Promise<StepOutput> {
  console.log("[Condition Step]", input);
  return {
    success: true,
    data: { condition: input.condition },
  };
}
