import { Client } from "@upstash/workflow";

export const workflow = new Client({
  baseUrl: process.env.UPSTASH_WORKFLOW_URL!,
  token: process.env.QSTASH_TOKEN!,
});