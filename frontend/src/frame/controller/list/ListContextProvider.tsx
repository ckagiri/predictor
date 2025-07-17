import { ListContext } from "./ListContext";
import { ListControllerResult } from "./useListController";

export const ListContextProvider = ({
  value,
  children,
}: {
    value: ListControllerResult;
    children: React.ReactNode;
}) => (
  <ListContext.Provider value={value}>
    {children}
  </ListContext.Provider>
);
