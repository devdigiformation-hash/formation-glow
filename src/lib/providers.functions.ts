import { createServerFn } from "@tanstack/react-start";

export type ProviderStatus = {
  pollinations: boolean;
  lovableAI: boolean;
  replicate: boolean;
  fal: boolean;
  huggingface: boolean;
  cloudflareWorkersAI: boolean;
};

export const getProviderStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderStatus> => ({
    pollinations: true, // always available, no key
    lovableAI: Boolean(process.env.LOVABLE_API_KEY),
    replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    fal: Boolean(process.env.FAL_KEY),
    huggingface: Boolean(process.env.HUGGINGFACE_API_KEY),
    cloudflareWorkersAI: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN,
    ),
  }),
);
