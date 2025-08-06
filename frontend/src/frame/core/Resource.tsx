import { ComponentType, isValidElement, ReactElement } from 'react';
import { isValidElementType } from 'react-is';
import { Routes, Route } from 'react-router';
import { ResourceProps } from '../types';
import { ResourceContextProvider } from './ResourceContextProvider';

export const Resource = (props: ResourceProps) => {
  const { list, show, edit, name, route } = props;

  return (
    <ResourceContextProvider value={{ name, route }}>
      <Routes>
        {list && <Route path="/" element={getElement(list)} />}
        {show && <Route path=":id/show/*" element={getElement(show)} />}
        {edit && <Route path=":id/*" element={getElement(edit)} />}
        <Route path="*" element={<div>Catch</div>} />
        {props.children}
      </Routes>
    </ResourceContextProvider>
  );
};
const getElement = (ElementOrComponent: ComponentType<any> | ReactElement) => {
  if (isValidElement(ElementOrComponent)) {
    return ElementOrComponent;
  }

  if (isValidElementType(ElementOrComponent)) {
    const Element = ElementOrComponent as ComponentType<any>;
    return <Element />;
  }

  return null;
};

Resource.uiName = 'Resource';

Resource.registerResource = ({
  create,
  edit,
  icon,
  list,
  name,
  route,
  options,
  show,
  recordRepresentation,
  hasCreate,
  hasEdit,
  hasShow,
}: ResourceProps) => ({
  name,
  route,
  options,
  hasList: !!list,
  hasCreate: !!create || !!hasCreate,
  hasEdit: !!edit || !!hasEdit,
  hasShow: !!show || !!hasShow,
  icon,
  recordRepresentation,
});
