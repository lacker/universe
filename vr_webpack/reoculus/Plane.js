import React from 'react';
import Three from 'three';

export default class Plane extends React.Component {
  render() {
    var width = this.props.width || 100;
    var height = this.props.height || 100;
    var geometry = new Three.PlaneGeometry(width, height);
    return (
      <mesh
        {...this.props}
        geometry={geometry}
        material={this.props.material} />
    );
  }
}
