import React from "react";

import { storiesOf } from "@storybook/react";
import {Button} from './styled-button';

storiesOf("Button", module)
  .add("with text", () => (
    <div>
      <Button active={true}>Active button</Button>
      <Button active={false}>Not active button</Button>
    </div>
  ));