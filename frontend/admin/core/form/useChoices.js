import { isValidElement, cloneElement, useCallback } from 'react';
import get from 'lodash/get';

import { useTranslate } from '../i18n';

/*
 * Returns helper functions for choices handling.
 *
 * @param optionText Either a string defining the property to use to get the choice text, a function or a React element
 * @param optionValue The property to use to get the choice value
 * @param translateChoice A boolean indicating whether to option text should be translated
 *
 * @returns An object with helper functions:
 * - getChoiceText: Returns the choice text or a React element
 * - getChoiceValue: Returns the choice value
 */
const useChoices = ({
  optionText = 'name',
  optionValue = 'id',
  translateChoice = true,
}) => {
  const translate = useTranslate();

  const getChoiceText = useCallback(
    choice => {
      if (isValidElement(optionText)) {
        return cloneElement(optionText, {
          record: choice,
        });
      }
      const choiceName =
        typeof optionText === 'function'
          ? optionText(choice)
          : get(choice, optionText);

      return translateChoice
        ? translate(choiceName, { _: choiceName })
        : choiceName;
    },
    [optionText, translate, translateChoice]
  );

  const getChoiceValue = useCallback(choice => get(choice, optionValue), [
    optionValue,
  ]);

  return {
    getChoiceText,
    getChoiceValue,
  };
};

export default useChoices;
