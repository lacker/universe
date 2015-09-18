import ReactMultiChild from 'react/lib/ReactMultiChild';

import Scene from './Scene';

import Three from 'three';

function constructTag(type, props) {
  switch (type) {
    case 'mesh':
      if (!props.material || !props.geometry) {
        throw new Error('Cannot create a mesh without a material and a geometry');
      }
      return new Three.Mesh(props.geometry, props.material);
    case 'object3d':
      return new Three.Object3D();
    case 'group':
      return new Three.Group();
  }
}

function applyProps(object, props) {
  if (props.position) {
    object.position.x = props.position.x;
    object.position.y = props.position.y;
    object.position.z = props.position.z;
  }
  if (props.rotation) {
    object.rotation.x = props.rotation.x || 0;
    object.rotation.y = props.rotation.y || 0;
    object.rotation.z = props.rotation.z || 0;
  }
}

export default class Component {
  constructor(tag) {
    this._tag = tag;
    this._renderedChildren = null;
    this._previousStyle = null;
    this._previousStyleCopy = null;
    this._rootNodeID = null;
    this._wrapperState = null;
    this._topLevelWrapper = null;
    this._nodeWithLegacyProperties = null;
  }

  construct(element) {
    this._currentElement = element;
  }

  mountComponent(rootID, transaction, context) {
    this._rootNodeID = rootID;

    var props = this._currentElement.props;
    var tag = constructTag(this._currentElement.type, props);

    var parent = Scene.getParent(rootID);
    parent.add(tag);
    Scene.add(rootID, tag);

    var children = props.children || [];
    if (children.length) {
      this.mountChildren(children, transaction, context);
    }

    applyProps(tag, props);
  }

  receiveComponent(next, transaction, context) {
    var node = Scene.get(this._rootNodeID);
    var { children, ...props } = next.props;
    applyProps(node, props);

    children = children || [];
    if (children.length) {
      this.updateChildren(children, transaction, context);
    }
  }

  unmountComponent() {
    this.unmountChildren();
    var node = Scene.get(this._rootNodeID);

    Scene.remove(this._rootNodeID);
    this._rootNodeID = null;
  }
}

Object.assign(Component.prototype, ReactMultiChild.Mixin);
