import { Route, Routes } from 'react-router-dom';
import { useScrollToTop } from '../routing';
import {
  CatchAllComponent,
  FrameChildren,
  LayoutComponent,
  LoadingComponent,
} from '../types';
import { Children } from 'react';
import { useConfigureFrameRouterFromChildren } from './useConfigureFrameRouterFromChildren';
import { BasenameContextProvider } from '../routing/BasenameContextProvider';
import { NavigateToDefaultResource } from './NavigateToDefaultResource';

export const CoreFrameRoutes = (props: CoreFrameRoutesProps) => {
  useScrollToTop();

  const { appRoutes, adminCustomRoutes, shellRoutes, resources } =
    useConfigureFrameRouterFromChildren(props.children);

  const { catchAll: CatchAll, adminLayout: AdminLayout } = props;

  return (
    <Routes>
      {shellRoutes}
      <Route
        path="/*"
        element={
          <Routes>
            {appRoutes}
            <Route
              path="/admin/*"
              element={
                <BasenameContextProvider basename={'/admin'}>
                  <AdminLayout>
                    <Routes>
                      {adminCustomRoutes}
                      {Children.map(resources, resource => (
                        <Route
                          key={resource.props.name}
                          path={`${resource.props.route}/*`}
                          element={resource}
                        />
                      ))}
                      <Route path="/" element={<NavigateToDefaultResource />} />
                      <Route path="*" element={<CatchAll />} />
                    </Routes>
                  </AdminLayout>
                </BasenameContextProvider>
              }
            />
          </Routes>
        }
      />
    </Routes>
  );
};

export interface CoreFrameRoutesProps {
  catchAll: CatchAllComponent;
  children?: FrameChildren;
  adminLayout: LayoutComponent;
  loading?: LoadingComponent;
}
