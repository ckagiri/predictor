import { Navigate } from "react-router-dom";
import { useCreatePath } from "../routing/useCreatePath";
import { useResourceDefinitions } from "./useResourceDefinitions";

export const NavigateToDefaultResource = () => {
  const resourceConfig = useResourceDefinitions();
  const resources = Object.values(resourceConfig);
  const defaultResource = resources[0];
  const createPath = useCreatePath();

  if (defaultResource) {
    return (
      <Navigate
        to={createPath({
          resource: defaultResource.name,
          type: 'list',
        })}
        replace={true}
      />
    );
  }
};
