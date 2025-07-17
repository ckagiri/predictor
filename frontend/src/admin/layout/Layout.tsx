import { Container, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { AppLocationContext } from "../../frame/navigation";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ResourceBreadcrumbItems } from "./navigation/ResourceBreadcrumbItems";
import { Breadcrumb } from "../../ui-materialui";

const Layout = ({ children }: { children: ReactNode }) => (
  <AppLocationContext>
    <>
      <CssBaseline />
      <Container sx={{ maxWidth: { xl: 1280 } }}>
        <main id="main-content">{children}</main>
      </Container>
    </>
  </AppLocationContext>
);

export default ({ children }: { children: ReactNode }) => (
  <>
    <Layout>
      <Breadcrumb>
        <ResourceBreadcrumbItems />
      </Breadcrumb>
      {children}
    </Layout>
    <ReactQueryDevtools initialIsOpen={false} />
  </>
);
