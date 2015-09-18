import React from 'react';
import Three from 'three';

export default class Sphere extends React.Component {
  render() {
    var radius = this.props.radius || 1;
    var widthSegments = this.props.widthSegments || 32;
    var heightSegments = this.props.heightSegments || 32;
    var geometry = new Three.SphereGeometry(radius, widthSegments, heightSegments);
    return (
      <mesh
        geometry={geometry}
        material={this.props.material} />
    );
  }
}
