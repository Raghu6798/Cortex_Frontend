
export type StepContext = {
  executionId?: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
};

export type StepInput = Record<string, unknown> & {
  _context?: StepContext;
};

export type StepOutput = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function withStepLogging<T extends StepInput, R>(
  input: T,
  stepFn: () => Promise<R>
): Promise<R> {
  const context = input._context;
  if (context) {
    console.log(`[Step: ${context.nodeName}] Starting...`);
  }

  try {
    const result = await stepFn();
    if (context) {
      console.log(`[Step: ${context.nodeName}] Completed`);
    }
    return result;
  } catch (error) {
    if (context) {
      console.error(`[Step: ${context.nodeName}] Failed`, error);
    }
    throw error;
  }
}
