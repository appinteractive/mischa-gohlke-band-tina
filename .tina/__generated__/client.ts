import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '1aa7f4492f69a341d7bf6560b3147e48f5204cb4', queries });
export default client;
  