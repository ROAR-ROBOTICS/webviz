// @flow

//  Copyright (c) 2018-present, GM Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import memoize from "lodash/memoize";

import type { DepthState, BlendState } from "../types";
import { defaultReglDepth, defaultReglBlend } from "./commandUtils";

const withRenderStateOverrides = (command: any) => (regl: any) => {
  // Generate the render command once
  const reglCommand = command(regl);

  const renderElement = (props) => {
    // Get curstom render states from the given marker. Some commands, like <Arrows />
    // will use the originalMarker property instead. If no custom render states
    // are present, use the default ones to make sure the hitmap works correctly.
    const depth = props.depth || props.originalMarker?.depth || defaultReglDepth;
    const blend = props.blend || props.originalMarker?.blend || defaultReglBlend;

    // Use memoization to prevent generating too multiple render commands
    // for the same render states
    const memoizedRender = memoize(
      (props: { depth: DepthState, blend: BlendState }) => {
        return regl({ ...reglCommand, depth, blend });
      },
      (...args) => JSON.stringify(args)
    );
    memoizedRender({ depth, blend })(props);
  };

  return (props: any) => {
    if (Array.isArray(props)) {
      props.forEach(renderElement);
    } else {
      renderElement(props);
    }
  };
};

export default withRenderStateOverrides;
