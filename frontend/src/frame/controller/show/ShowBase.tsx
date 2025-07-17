import { OptionalResourceContextProvider } from "../../core";
import { UiRecord } from "../../types";
import { ShowContextProvider } from "./ShowContextProvider";
import { ShowControllerProps, useShowController } from "./useShowController";

export const ShowBase = <RecordType extends UiRecord = any>({
    children,
    loading = null,
    ...props
}: ShowBaseProps<RecordType>) => {
    const controllerProps = useShowController<RecordType>(props);

    return (
        // We pass props.resource here as we don't need to create a new ResourceContext if the props is not provided
        <OptionalResourceContextProvider value={props.resource}>
            <ShowContextProvider value={controllerProps}>
                {children}
            </ShowContextProvider>
        </OptionalResourceContextProvider>
    );
};

export interface ShowBaseProps<RecordType extends UiRecord = UiRecord>
    extends ShowControllerProps<RecordType> {
    children: React.ReactNode;
    loading?: React.ReactNode;
}
