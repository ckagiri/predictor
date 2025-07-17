import { ReactNode } from 'react';

export const ShellRoutes = (_props: FrameRoutesProps) => {
  return null;
};
ShellRoutes.uiName = 'ShellRoutes';

export const AppRoutes = (_props: FrameRoutesProps) => {
  return null;
};
AppRoutes.uiName = 'AppRoutes';

export const AdminRoutes = (_props: FrameRoutesProps) => {
  return null;
};
AdminRoutes.uiName = 'AdminRoutes';

export const Admin = (_props: FrameRoutesProps) => {
  return null;
};
Admin.uiName = 'Admin';

export type FrameRoutesProps = {
  children: ReactNode;
};
