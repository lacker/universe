import React from 'react';
import Three from 'three';
import Reoculus from './index';

var jsxMatch = /\s*<([a-zA-Z0-9]+)([^>]*)\/>\s*/;
var propPiecesMatch = /([a-zA-Z0-9]+)=\{([^\}]+)\}/;

// Crappy JSX interpreter
function parseJSX(str) {
  var match = jsxMatch.exec(str);
  if (!match) {
    return;
  }
  var tag = match[1];
  var props = (match[2] || '').trim();
  var propsMatch = /([a-zA-Z0-9]+={[^\}]+})+/g;
  var match = null;

  var componentProps = {};
  while (match = propsMatch.exec(props)) {
    var pieces = propPiecesMatch.exec(match);
    var key = pieces[1];
    var val = pieces[2];
    componentProps[key] = eval(val);
  }
  if (!Reoculus[tag]) {
    console.log('No Component named ' + tag + ' exists.');
    debugger;
    return;
  }
  return {
    tag: tag,
    props: componentProps
  };
}

var NEXT = { CID: 1 };

export default class World extends React.Component {
  constructor(props) {
    super();
    this.state = {
      children: []
    };
    props.registerAddObject(this.addObject.bind(this));
    
    // Hacky world registration
    window.worldObject = this;
  }

  // Finds the source for a cid
  sourceForCID(cid) {
    for (var child of this.state.children) {
      if (child.props.cid == cid) {
        return child.jsxSource;
      }
    }
    return null;
  }

  // Deletes the object with the given cid
  removeCID(cid) {
    // Remove any children that already have this cid
    var newChildren = [];
    for (var child of this.state.children) {
      if (child.props.cid != cid) {
        newChildren.push(child);
      } else {
        console.log("removing old object " + cid);
      }
    }
    this.state.children = newChildren;
    this.forceUpdate();
  }

  // Returns whether it was successful
  addObject(str, x, z, cid) {
    var component = parseJSX(str);
    if (!component) {
      console.log("could not parse jsx: " + str);
      return false;
    }
    component.jsxSource = str;
    console.log("adding " + str);
    component.props.position = { x: x, y: 0, z: z };
    if (!cid) {
      cid = "cid" + NEXT.CID;
      NEXT.CID++;
    }
    console.log("creating " + cid);
    component.props.cid = cid;

    this.removeCID(cid);

    this.state.children.push(component);
    this.forceUpdate();
    return true;
  }

  render() {
    return (
      <group>
        {this.state.children.map((c) => React.createElement(Reoculus[c.tag], c.props))}
      </group>
    );
  }
}
