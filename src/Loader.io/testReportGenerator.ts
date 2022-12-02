import axios from "axios";
import { chromium } from "playwright";
import * as dotenv from "dotenv/config";
import convertSize from "convert-size";
import { getParameterByName } from "../utils/helperUtils";

export const getTestById = async (testId) => {
  const testUrl = process.env.LOADERIO_TEST_BY_ID_URL + testId;

  const config = {
    headers: {
      "loaderio-auth": process.env.LOADERIO_AUTH_API_KEY as string,
    },
  };

  const testData = await axios
    .get(testUrl, config)
    .then((response) => {
      if (response.status !== 200) {
        console.log(response.statusText);
        return;
      }
      return response.data;
    })
    .catch((error) => {
      console.error(
        `ERROR OCCURED WHILE FETCHING TEST #${testId}...ERROR: ${error}`
      );
      return;
    });

  return testData;
};

export const getAllTestResults = async (testId) => {
  const testUrl = process.env.LOADERIO_TEST_BY_ID_URL + testId + "/results";

  const config = {
    headers: {
      "loaderio-auth": process.env.LOADERIO_AUTH_API_KEY as string,
    },
  };

  const testResultData = await axios
    .get(testUrl, config)
    .then((response) => {
      if (response.status !== 200) {
        console.log(response.statusText);
        return;
      }
      return response.data;
    })
    .catch((error) => {
      console.error(
        `ERROR OCCURED WHILE FETCHING TEST RESULTS FOR #${testId}...ERROR: ${error}`
      );
      return;
    });

  return testResultData;
};

export const getLatestTestResult = (testId) => {
  return getAllTestResults(testId)
    .then((data) => {
      return data[0];
    })
    .catch((error) => {
      return error;
    });
};

export const getLatestLoaderTestReport = async (testId) => {
  let latestTestReportObj;
  const loaderTestResult = await getLatestTestResult(testId)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.log("ERROR WHILE GETTING LATEST TEST REPORT : ", error);
      return;
    });

  // Minor tweak
  // Loader IO API send sent and received data in vice versa form
  const dataSent = convertSize(loaderTestResult["data_received"], "MB") * 0.9536;
  const dataReceived =
    convertSize(loaderTestResult["data_sent"], "MB") * 0.9536;
  latestTestReportObj = {
    "Avg res": loaderTestResult["avg_response_time"],
    Success: loaderTestResult["success"],
    Timeout: loaderTestResult["timeout_error"],
    400: loaderTestResult["error"],
    500: loaderTestResult["network_error"],
    Bandwidth: `Bandwidth Sent: ${dataSent.toFixed(
      2
    )} MB Received: ${dataReceived.toFixed(2)} MB`,
  };

  return { startDateTime: loaderTestResult["started_at"], latestTestReportObj };
};
