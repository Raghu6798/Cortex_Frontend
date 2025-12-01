
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
