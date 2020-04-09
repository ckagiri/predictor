import { createContext } from 'react';

const defaultFormFunctions = { setOnSave: () => { } };

const FormContext = createContext(defaultFormFunctions);

FormContext.displayName = 'FormContext';

export default FormContext;
