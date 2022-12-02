import { client, v1, v2 } from "@datadog/datadog-api-client";
import * as dotenv from "dotenv/config";

export const authenticateDatadog = (apiKey, appKey, serverSite) => {
  const datadogConfig = {
    authMethods: {
      apiKeyAuth: apiKey,
      appKeyAuth: appKey,
    },
  };
  const configuration = client.createConfiguration(datadogConfig);
  client.setServerVariables(configuration, {
    site: serverSite,
  });

  return { configuration, client };
};

// fromDate and toDate are unix epoch
export const getCoreApiMetrics = async (fromDate, toDate, queryString) => {
  const { configuration } = authenticateDatadog(
    process.env.DATADOG_API_KEY,
    process.env.DATADOG_APP_KEY,
    process.env.DATADOG_SERVER_SITE
  );

  const params = {
    from: fromDate / 1000,
    to: toDate / 1000,
    query: queryString,
  };

  const apiInstance = new v1.MetricsApi(configuration);
  const result = apiInstance
    .queryMetrics(params)
    .then((result: v1.MetricsQueryResponse) => {
      const pointList = result.series ? result.series[0]?.pointlist : [];
      let minMaxList: number[] = [];
      pointList?.forEach((elem) => {
        if (elem[1] !== null) {
          minMaxList.push(elem[1]);
        }
      });
      return {
        avg: minMaxList.reduce((a, b) => a + b, 0) / minMaxList.length,
        min: Math.min(...minMaxList),
        max: Math.max(...minMaxList),
      };
    })
    .catch((error) => {
      return `ERROR WHILE FETCHING DATADOG DASHBOARD METRIC OF CORE USED API COMPONENT: ${error}`;
    });
  return result;
};

export const geCoreDBMetrics = async (fromDate, toDate, queryString) => {
  const { configuration } = authenticateDatadog(
    process.env.DATADOG_API_KEY,
    process.env.DATADOG_APP_KEY,
    process.env.DATADOG_SERVER_SITE
  );

  const params = {
    from: fromDate / 1000,
    to: toDate / 1000,
    query: queryString,
  };

  const apiInstance = new v1.MetricsApi(configuration);
  const result = apiInstance
    .queryMetrics(params)
    .then((result) => {
      let resultObj = {};
      result?.series?.forEach((series, index) => {
        const pointList = series?.pointlist;
        let minMaxList: number[] = [];
        pointList?.forEach((elem) => {
          if (elem[1] !== null) {
            minMaxList.push(elem[1]);
          }
        });
        resultObj[index === 0 ? "primary" : "secondary"] = {
          avg: minMaxList.reduce((a, b) => a + b, 0) / minMaxList.length,
          min: Math.min(...minMaxList),
          max: Math.max(...minMaxList),
        };
      });
      return resultObj;
    })
    .catch((error) => {
      return `ERROR WHILE FETCHING DATADOG DASHBOARD METRIC OF CORE DB COMPONENT: ${error}`;
    });
  return result;
};
