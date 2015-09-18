import React from 'react';
import Three from 'three';

import Box from './Box';

export default class Tree extends React.Component {
  render() {
    var { x, y, z } = this.props.position;
    return (
      <group cid={this.props.cid} position={{ x: x, y: -2, z: z }}>
        <Box cid={this.props.cid} color={0x7f4e1d} width={0.5} depth={0.5} height={3} position={{x: 0, y: 2, z: 0}} />
        <Box cid={this.props.cid} color={0x00ff00} width={1.5} depth={1.5} height={1.5} position={{x: 0, y: 3.75, z: 0}} />
      </group>
    );
  }
}
