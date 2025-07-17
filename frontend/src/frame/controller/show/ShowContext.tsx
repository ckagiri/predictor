import { createContext } from "react";
import { ShowControllerResult } from "./useShowController";

export const ShowContext = createContext<ShowControllerResult | null>(null);

ShowContext.displayName = 'ShowContext';
