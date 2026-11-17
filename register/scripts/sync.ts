import { syncFromScb } from "../src/lib/sync";

const maxPages = process.env.SCB_MAX_PAGES ? Number(process.env.SCB_MAX_PAGES) : undefined;

syncFromScb({ maxPages })
  .then((result) => {
    console.log(`Klar. ${result.rows} bolag på ${result.pages} sidor.`);
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
