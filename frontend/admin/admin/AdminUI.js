import { CoreAdminUI } from '../core';
import {
  Layout as DefaultLayout,
  Loading,
  Login,
  Logout,
  NotFound,
} from '../materialui';

const AdminUI = CoreAdminUI;

// todo fix this
AdminUI.defaultProps = {
  layout: DefaultLayout,
  catchAll: NotFound,
  loading: Loading,
  loginPage: Login,
  logout: Logout,
};

AdminUI.displayName = 'AdminUI';

export default AdminUI;
