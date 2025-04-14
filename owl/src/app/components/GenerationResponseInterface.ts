export interface GenerationResponse {
  images: string[];
  parameters: Record<string, string>;
  info: string;
}