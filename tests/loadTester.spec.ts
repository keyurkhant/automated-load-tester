import { test, expect, Page } from "@playwright/test";
import testSetup from "../test-config.json";
import * as dotenv from "dotenv/config";
import { getParameterByName } from "../src/utils/helperUtils";
import { getLatestLoaderTestReport } from "../src/Loader.io/testReportGenerator";
import {
  geCoreDBMetrics,
  getCoreApiMetrics,
} from "../src/Datadog/datadogReportGenerator";
import {
  authenticateSpreadsheet,
  getSheetByName,
} from "../src/Spreadsheet/spreadsheetGenerator";
import credJson from "../creds.json";
import moment from "moment";
import { generateEntry } from "../src/utils/jsonGenerator";

const urls = testSetup.url;

test.describe.configure({ mode: "serial" });

let page: Page;

let sheetDocument;
let sheet;

// Entries Count variables
let entryStartCount = parseInt(process.env.INITIAL_ENTRY_DB_COUNT as string);
let entryEndCount = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto("https://loader.io/signin");

  //@ts-ignore
  await page.locator("#user_email").fill(process.env.LOADERIO_USERNAME);
  //@ts-ignore
  await page.locator("#user_password").fill(process.env.LOADERIO_PASSWORD);
  await page.locator("#user_remember_me").click();
  await page.locator("input#sign-in").click();

  // Authenticate Google Spreadsheet API for only once
  sheetDocument = await authenticateSpreadsheet(
    process.env.GOOGLE_SPREADSHEET_ID,
    credJson
  ).then((data) => {
    return data;
  });
  sheet = await getSheetByName(
    sheetDocument,
    process.env.GOOGLE_SPREADSHEET_NAME
  );
});

test.afterAll(async () => {
  await page.close();
});
test.afterEach(async () => {
  // wait for 1min before next load test
  await sleep(40 * 1000);

  // set entry start count;
  entryStartCount = entryEndCount;
});

test.describe("Start loadtesting", () => {
  let allTestCases = testSetup.tests;
  let bodyList;
  //@ts-ignore
  const AllowedTestCases = allTestCases.filter((val, index) => val && val.only);
  if (AllowedTestCases.length > 0) {
    allTestCases = AllowedTestCases;
  }
  for (const testCase of allTestCases) {
    test(testCase.title, async ({}) => {
      await page.goto(`${urls[testCase.url]}/edit`);

      await page
        .locator('select[name="endpoint\\[test_type\\]"]')
        .selectOption(testCase.client.type);

      await page
        .locator('input[name="endpoint\\[max_processes_count\\]"]')
        .fill(testCase.client.amount);

      await page
        .locator('input[name="endpoint\\[duration\\]"]')
        .fill(testCase.client.duration);

      await page
        .locator('select[name="endpoint\\[duration_uom\\]"]')
        .selectOption(testCase.client.unit);

      // Request body, header, path
      const pathList = Array.isArray(testCase.pathList)
        ? testCase.pathList
        : require(testCase.pathList);

      if (testCase.method !== "GET" && testCase["size"] && testCase["count"]) {
        bodyList = [generateEntry(testCase["count"], testCase["size"])];
      } else if (testCase.method !== "GET" && testCase["bodyList"]) {
        bodyList = Array.isArray(testCase["bodyList"])
          ? testCase["bodyList"]
          : require(testCase["bodyList"]);
      }

      for (const [rowIdx, requestPath] of pathList.entries()) {
        await page
          .locator(
            `select[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[request_type\\]"]`
          )
          .selectOption(testCase.method);

        await page
          .locator(
            `select[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[protocol\\]"]`
          )
          .selectOption("HTTPS");

        await page
          .locator(
            `select[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[host\\]"]`
          )
          .selectOption(testSetup.envirnoment.host_url);

        await page
          .locator(
            `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[path_without_leading_slash\\]"]`
          )
          .fill(requestPath);

        await page
          .locator(
            `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[0\\]\\[key\\]"]`
          )
          .fill("api_key");
        await page
          .locator(
            `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[0\\]\\[value\\]"]`
          )
          .fill(testSetup.envirnoment.api_key);

        if (!testCase.use || testCase.use === "authtoken") {
          await page
            .locator(
              `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[1\\]\\[key\\]"]`
            )
            .fill("authtoken");
          await page
            .locator(
              `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[1\\]\\[value\\]"]`
            )
            .fill(testSetup.envirnoment.authtoken);
        }

        //TODO: Add management api support
        await page
          .locator(
            `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[2\\]\\[key\\]"]`
          )
          .fill("content-type");
        await page
          .locator(
            `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[headers_attributes\\]\\[2\\]\\[value\\]"]`
          )
          .fill("application/json");

        if (testCase.method !== "GET" && bodyList[rowIdx]) {
          let body;
          if (testCase["size"] && testCase["count"]) {
            body = bodyList[rowIdx];
          } else {
            body = require(bodyList[rowIdx]);
          }
          await page
            .locator(
              `text=Raw Body >> input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[paramType\\]"]`
            )
            .check();
          const raw_body = await page
            .waitForSelector(
              `textarea[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[raw_post_body\\]"]`
            )
          // raw_body.fill(JSON.stringify(body), {force: true});
          await raw_body.fill(JSON.stringify(body))

          await page
            .locator(
              `input[name="endpoint\\[endpoint_urls_attributes\\]\\[${rowIdx}\\]\\[endpoint_params_file_attributes\\]\\[url\\]"]`
            )
            .fill(
              "https://assets.contentstack.io/v3/assets/bltbdb397c7cc18a214/blte35683df097a72c6/61544a8bc3934450a14e3121/Test1.json"
            );
        }

        if (rowIdx < testCase.limit - 1) {
          const nextRequestRow = await page
            .locator(
              `div[class="endpoint-url-field form-panel"][data-index="${
                rowIdx + 1
              }"] >> a[class="action-icon copy"]`
            )
            .count();

          if (nextRequestRow === 0) {
            await page
              .locator(`a[class="pull-right btn btn-default add-new-url"]`)
              .click();

            //  Add 3 header row and body textbox
            await page
              .locator(
                `div[class="endpoint-url-field form-panel highlight"][data-index="${
                  rowIdx + 1
                }"] >> div[class="headers"] >> a[class="add-config-button"]`
              )
              .click();

            for (let i = 0; i < 2; i++) {
              await page
                .locator(
                  `div[class="endpoint-url-field form-panel highlight"][data-index="${
                    rowIdx + 1
                  }"] >> div[class="headers"] >> div[class="inner-panel"] >> a[class="btn-add"]`
                )
                .click();
            }

            await page
              .locator(
                `div[class="endpoint-url-field form-panel highlight"][data-index="${
                  rowIdx + 1
                }"] >> div[class="params"] >> a[class="add-config-button"]`
              )
              .click();
          }
        } else {
          const existingRequestRows = await page
            .locator(
              `div[class="endpoint-url-field form-panel"] >> a[class="action-icon copy"]`
            )
            .count();
          for (let idx = 0; idx <= existingRequestRows - 1; idx++) {
            if (idx > testCase.limit - 1) {
              console.log(idx);
              await page
                .locator(
                  `div[class="endpoint-url-field form-panel"][data-index="${idx}"] >> a[class="remove-url action-icon delete"]`
                )
                .click();
            }
          }
          break;
        }
      }

      await page.locator("text=Run test").click();

      const clientDuration = parseInt(testCase.client.duration) * 60 * 1000;

      await sleep(clientDuration);

      let sharableUrl, min, max;
      await page.waitForSelector("a#share-link");

      await page.locator("text=Share this test").click();

      await page.waitForSelector("text=Tweet Share");

      const embedUrl =
        (await page.locator("a.twitter-share-link").getAttribute("href")) || "";
      sharableUrl = getParameterByName("url", embedUrl);
      let minMaxText: any =
        (await page.locator(".minmax_response_time").textContent()) || "";
      minMaxText = minMaxText.split("/");
      min = minMaxText[0];
      max = minMaxText[1];

      // Get test ID
      const testUrl = urls[testCase.url];
      const testId = testUrl.substring(testUrl.lastIndexOf("/") + 1);

      // Loader IO api and report generation
      const { startDateTime, latestTestReportObj: loaderReportData } =
        await getLatestLoaderTestReport(testId).then((result) => {
          return result;
        });
      loaderReportData["Min res"] = min;
      loaderReportData["Max res"] = max;
      loaderReportData["Test Link"] = sharableUrl;
      const startDateTimeEpoch = new Date(startDateTime).getTime();
      const endDateTimeEpoch = startDateTimeEpoch + clientDuration;

      // Startdate and Enddate format (e.g. Oct 1, 3:26 pm – Oct 1, 3:29 pm)
      const formattedStartDateTime = moment(startDateTimeEpoch).format("lll");
      const formattedEndDateTime = moment(endDateTimeEpoch).format("lll");
      loaderReportData[
        "Time Slot"
      ] = `${formattedStartDateTime} - ${formattedEndDateTime}`;

      // Entry Start and End count
      entryEndCount = entryStartCount + loaderReportData["Success"];
      loaderReportData[
        "Entries Count"
      ] = `total entries(start): ${entryStartCount} \ntotal entries(end): ${entryEndCount}`;

      // Datadog api and report generation
      const coreApiMetricResult = await getCoreApiMetrics(
        startDateTimeEpoch,
        endDateTimeEpoch,
        process.env.DATADOG_CPU_USED_API_QUERY
      ).then((data) => {
        return data;
      });
      loaderReportData["API"] = `Avg: ${coreApiMetricResult["avg"].toFixed(
        2
      )} % \nMin: ${coreApiMetricResult["min"].toFixed(
        2
      )} % \nMax: ${coreApiMetricResult["max"].toFixed(2)} %`;

      const coreDBMetricResult: any = await geCoreDBMetrics(
        startDateTimeEpoch,
        endDateTimeEpoch,
        process.env.DATADOG_CPU_CORE_DB_QUERY
      ).then((data) => {
        return data;
      });
      for (const key in coreDBMetricResult) {
        loaderReportData[
          key === "primary" ? "CoreDB Primary load" : "CoreDB Secondry load"
        ] = `Avg: ${coreDBMetricResult[key]["avg"].toFixed(
          2
        )} % \nMin: ${coreDBMetricResult[key]["min"].toFixed(
          2
        )} % \nMax: ${coreDBMetricResult[key]["max"].toFixed(2)} %`;
      }

      const rows = await sheet.getRows();

      Object.keys(loaderReportData).forEach((col) => {
        rows[testCase.row - 2][col] = loaderReportData[col]; // Here, after header row, all other row starts from index 0
      });

      await rows[testCase.row - 2].save();
    });
  }
});
