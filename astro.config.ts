// @ts-check
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    adapter: vercel({
        imageService: true,
    }),
    integrations: [mdx()],
});
