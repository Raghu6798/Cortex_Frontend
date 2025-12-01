
import type { StepContext, StepOutput } from "./step-handler";

export async function triggerStep(input: {
  triggerData: Record<string, unknown>;
  _context?: StepContext;
  _workflowComplete?: {
    executionId: string;
    status: "success" | "error";
    output?: unknown;
    error?: string;
    startTime: number;
  };
}): Promise<StepOutput> {
  // In a real implementation, this would log the trigger event
  console.log("[Trigger Step]", input);
  return {
    success: true,
    data: input.triggerData,
  };
}
