import { CatchAllComponent, FrameChildren, LayoutComponent, LoadingComponent } from "../types";
import { Route, Routes } from "react-router-dom";
import { CoreFrameRoutes } from "./CoreFrameRoutes";


export interface CoreFrameUIProps {
  catchAll?: CatchAllComponent;
  children?: FrameChildren;
  adminLayout?: LayoutComponent;
  loading?: LoadingComponent;
}

const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const CoreFrameUI = (props: CoreFrameUIProps) => {
  const {
    catchAll = Noop,
    children,
    adminLayout = DefaultLayout,
    loading = Noop,
  } = props;

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <CoreFrameRoutes
            catchAll={catchAll}
            adminLayout={adminLayout}
            loading={loading}
          >
            {children}
          </CoreFrameRoutes>
        }
      />
    </Routes>
  );
}

const Noop = () => null;