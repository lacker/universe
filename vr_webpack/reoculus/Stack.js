import React from 'react';
import Three from 'three';

export default class Stack extends React.Component {
  render() {
    var Box = require('./index').Box;
    console.log('BOX', Box);
    var positions = [];
    var bottom = -1;
    for (var i = 0; i < this.props.children.length; i++) {
      var h = this.props.children[i].props.height || 1;
      console.log('H', h);
      positions[i] = bottom + h / 2;
      bottom += h;
    }
    var cid = this.props.cid;
    return (
      <group cid={cid} position={this.props.position}>
        {this.props.children.map((c, i) => {
          var p = {};
          for (var k in c.props) {
            p[k] = c.props[k];
          }
          p.cid = cid;
          p.position = {x: 0, y: positions[i], z: 0};
          return <Box {...p} />;
        })}
      </group>
    );
  }
}
