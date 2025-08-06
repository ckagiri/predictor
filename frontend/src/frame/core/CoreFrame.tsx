import { CoreFrameContext, CoreFrameContextProps } from './CoreFrameContext';
import { CoreFrameUI, CoreFrameUIProps } from './CoreFrameUI';

export const CoreFrame = (props: CoreFrameProps) => {
  const { adminLayout, dataProvider, children, queryClient } = props;

  return (
    <CoreFrameContext dataProvider={dataProvider} queryClient={queryClient}>
      <CoreFrameUI adminLayout={adminLayout}>{children}</CoreFrameUI>
    </CoreFrameContext>
  );
};

export type CoreFrameProps = CoreFrameContextProps & CoreFrameUIProps;
