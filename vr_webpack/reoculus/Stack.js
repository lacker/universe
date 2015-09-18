import React from 'react';
import Three from 'three';

export default class Stack extends React.Component {
  render() {
    var positions = [];
    var bottom = 0;
    for (var i = 0; i < this.props.children.length; i++) {
      positions[i] = bottom + this.props.children[i].props.height / 2;
      bottom += this.props.children[i].props.height;
    }
    return (
      <group position={this.props.position}>
        {this.props.children.map((c, i) => {
          c.props.position = { x: 0, y: positions[i], z: 0 };
          return c;
        }}
      </group>
    );
  }
}
