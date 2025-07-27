import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AddressInfo } from 'net';
import sinon from 'sinon';

import { startWebServer, stopWebServer } from '../app/server';

export interface TestStartOptions {
  startAPI: boolean;
  webPort?: string;
}

let apiAddress: null | AddressInfo;
let httpClient: AxiosInstance | undefined; // Http client for the Act phase, won't throw errors but rather return statuses
let httpClientForArrange: AxiosInstance | undefined; // This is used for making API calls in the arrange phase, where we wish to fail fast if someting goes wrong happen
let chosenOptions: TestStartOptions;

const testSetup = {
  getHttpClient: (): AxiosInstance => {
    httpClient ??= buildHttpClient(false);
    return httpClient;
  },

  getHttpClientForArrange: (): AxiosInstance => {
    if (!httpClient) {
      httpClientForArrange = buildHttpClient(true);
    }

    return httpClientForArrange!;
  },

  start: async (options: TestStartOptions) => {
    chosenOptions = options;

    if (options.startAPI) {
      apiAddress = await startWebServer({ port: options.webPort });
    }
  },

  tearDown: async () => {
    if (apiAddress) {
      await stopWebServer();
    }
    apiAddress = null;
    sinon.restore();
  },
};

function buildHttpClient(throwsIfErrorStatus = false) {
  if (!apiAddress) {
    // This is probably a faulty state - someone instantiated the setup file without starting the API
    console.log(
      `Test warning: The http client will be returned without a base address, is this what you meant?
        If you mean to test the API, ensure to pass {startAPI: true} to the setupTestFile function`
    );
  }

  const axiosConfig: AxiosRequestConfig = {
    maxRedirects: 0,
  };
  axiosConfig.headers = new axios.AxiosHeaders();
  axiosConfig.headers.set('Content-Type', 'application/json');
  if (apiAddress) {
    axiosConfig.baseURL = `http://localhost:${String(apiAddress.port)}/api`;
  }
  if (!throwsIfErrorStatus) {
    axiosConfig.validateStatus = () => true;
  }

  const axiosInstance = axios.create(axiosConfig);

  return axiosInstance;
}

export default testSetup;
