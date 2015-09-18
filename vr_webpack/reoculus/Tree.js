import React from 'react';
import Three from 'three';

import Box from './Box';

export default class Tree extends React.Component {
  render() {
    var { x, y, z } = this.props.position;
    return (
      <group position={{ x: x, y: -1, z: z }}>
        <Box color={0x7f4e1d} width={0.5} depth={0.5} height={3} position={{x: 0, y: 2, z: 0}} />
        <Box color={0x00ff00} width={2} depth={2} height={2} position={{x: 0, y: 4, z: 0}} />
      </group>
    );
  }
}
