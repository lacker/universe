import React from 'react';
import Three from 'three';

export default class Box extends React.Component {
  render() {
    console.log("rendering Box with props:");
    console.log(this.props);
    console.log("---");
    var width = this.props.width || 1;
    var height = this.props.height || 1;
    var depth = this.props.depth || 1;
    var geometry = new Three.BoxGeometry(width, height, depth);
    var material = this.props.material;
    if (!material) {
      if (this.props.color) {
        material = new Three.MeshLambertMaterial({color: this.props.color});
      } else {
        material = new Three.MeshNormalMaterial();
      }
    }
    return (
      <mesh
        {...this.props}
        geometry={geometry}
        material={material} />
    );
  }
}
