import { Server } from 'http';
import { AddressInfo } from 'net';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import { loginForm, handleRequestFailure } from './testUtils';
import memoryDb from '../memoryDb';
import startServer from '../../app/server';

chai.use(chaiHttp);
chai.use(sinonChai);
const expect = chai.expect;

let server: Server, api: AxiosInstance;

describe('Auth API', function () {
  before(async () => {
    await memoryDb.connect();
    server = await startServer({ port: '8000' })
    const serverAddress = server.address() as AddressInfo;
    const baseURL = `http://localhost:${serverAddress.port}/api`
    api = axios.create({ baseURL });
    api.interceptors.response.use(res => res.data, handleRequestFailure)
  });

  beforeEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
    server.close();
  });

  it('Auth flow', async () => {
    const { username, password } = loginForm()

    console.log(username, password)
    // register
    const rData: any = await api.post('auth/register', { username, password })
    expect(rData.user).to.include.all.keys('id', 'token', 'username')

    // login
    // const lData: any = await api.post('auth/login', { username, password })
    // console.log('what')
    // expect(lData.user).to.eql(rData.user)

    // // authenticated request
    // const mData: any = await api.get('auth/me', {
    //   headers: {
    //     Authorization: `Bearer ${lData.user.token}`,
    //   },
    // })
    // expect(mData.user).to.have.all.keys('id', 'token', 'username')
  })
});
