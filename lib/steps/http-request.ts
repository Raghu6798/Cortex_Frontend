
import type { StepInput, StepOutput } from "./step-handler";

export async function httpRequestStep(input: StepInput): Promise<StepOutput> {
  console.log("[HTTP Request Step]", input);
  // Mock implementation
  return {
    success: true,
    data: { status: 200, body: "Mock HTTP response" },
  };
}
