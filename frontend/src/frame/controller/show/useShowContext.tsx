import { useContext } from "react";
import { UiRecord } from "../../types";
import { ShowControllerResult } from "./useShowController";
import { ShowContext } from "./ShowContext";

export const useShowContext = <
    RecordType extends UiRecord = any,
    ErrorType = Error,
>(): ShowControllerResult<RecordType, ErrorType> => {
    const context = useContext(ShowContext);
    // Props take precedence over the context
    if (!context) {
        throw new Error(
            'useShowContext must be used inside a ShowContextProvider'
        );
    }
    return context as ShowControllerResult<RecordType, ErrorType>;
};
