import axios, { AxiosInstance } from 'axios';
import * as chai from 'chai';
import { Server } from 'http';
import { AddressInfo } from 'net';
import sinonChai from 'sinon-chai';

import startServer from '../../app/server';
import memoryDb from '../memoryDb';
import { handleRequestFailure, loginForm } from './testUtils';

chai.use(sinonChai);
const expect = chai.expect;

let api: AxiosInstance, server: Server;

xdescribe('Auth API', function () {
  before(async () => {
    await memoryDb.connect();
    server = await startServer({ port: '8000' });
    const serverAddress = server.address() as AddressInfo;
    const baseURL = `http://localhost:${serverAddress.port}/api`;
    api = axios.create({ baseURL });
    api.interceptors.response.use(res => res.data, handleRequestFailure);
  });

  beforeEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
    server.close();
  });

  it('Auth flow', async () => {
    const { password, username } = loginForm();

    // register
    const rData: any = await api.post('auth/register', { password, username });
    expect(rData.user).to.include.all.keys('id', 'token', 'username');

    // login
    const lData: any = await api.post('auth/login', { password, username });
    expect(lData.user).to.eql(rData.user);

    // authenticated request
    const mData: any = await api.get('auth/me', {
      headers: {
        Authorization: `Bearer ${lData.user.token}`,
      },
    });
    expect(mData.user).to.have.all.keys('id', 'username');
  });
});
