import React from 'react';
import Three from 'three';

export default class Box extends React.Component {
  render() {
    var width = this.props.width || 1;
    var height = this.props.height || 1;
    var depth = this.props.depth || 1;
    var geometry = new Three.BoxGeometry(width, height, depth);
    var material = this.props.material || new Three.MeshNormalMaterial();
    return (
      <mesh
        {...this.props}
        geometry={geometry}
        material={material} />
    );
  }
}
