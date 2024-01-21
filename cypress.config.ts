import { defineConfig } from "cypress";
import pkg from "cy-verify-downloads"; //The cypress-verify-download plugin
const { verifyDownloadTasks } = pkg;

export default defineConfig({
  env: {
    FAIL_FAST_STRATEGY: "run",
    FAIL_FAST_ENABLED: true
  },
  projectId: "k9hnmy",
  e2e: {
    experimentalMemoryManagement: true,
    async setupNodeEvents(on, config) {
      // The below is needed to store the downloaded folder/file in the correction location
      // for the plugin to check if it has downloaded in the correct default location
      // A known issue with cypress
      on("before:browser:launch", (browser = {}, options) => {
        if (browser.family === "chromium") {
          options.args.push(`--disable-features=CrossSiteDocumentBlockingIfIsolating`);
          options.preferences = {
            download: {
              default_directory: config["downloadsFolder"]
            }
          };
        } else if (browser.family === "firefox") {
          options.preferences = {
            "browser.download.folderList": 2,
            "browser.download.dir": config["downloadsFolder"]
          };
        }
        return options;
      });

      on("task", verifyDownloadTasks); //This is for the cy-verify-download plugin
      const cypressFailFastPlugin = await import("cypress-fail-fast/plugin");
      cypressFailFastPlugin.default(on, config);
      return config;
    },
    trashAssetsBeforeRuns: true,
    //this url is the url for the static html generator
    //baseUrl: null,
    specPattern: "cypress/e2e/**/**.cy.ts",
    viewportHeight: 1080,
    viewportWidth: 1920,
    video: true
  }
});
