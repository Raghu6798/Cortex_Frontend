import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getErrorMessageAsync(error: unknown): Promise<string> {
  if (error instanceof Error) return error.message;
  return String(error);
}