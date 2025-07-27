import * as chai from 'chai';
import sinonChai from 'sinon-chai';

import { stopWebServer } from '../../../app/server';
import memoryDb from '../../memoryDb';
import testSetup from '../../testSetup';
import { loginForm } from './testUtils';

chai.use(sinonChai);
const expect = chai.expect;

describe('Auth API', function () {
  before(async () => {
    await memoryDb.connect();
    await testSetup.start({ startAPI: true, webPort: '8000' });
  });

  beforeEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
    await stopWebServer();
  });

  it('Auth flow', async () => {
    const api = testSetup.getHttpClient();
    const { password, username } = loginForm();

    // register
    const { data: rData } = await api.post('auth/register', {
      password,
      username,
    });
    expect(rData.user).to.include.all.keys('id', 'token', 'username');

    // login
    const { data: lData } = await api.post('auth/login', {
      password,
      username,
    });
    expect(lData.user).to.eql(rData.user);

    // authenticated request
    const { data: mData } = await api.get('auth/me', {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Authorization: `Bearer ${lData.user.token}`,
      },
    });
    expect(mData.user).to.include.all.keys('id', 'token', 'username');
  });
});
