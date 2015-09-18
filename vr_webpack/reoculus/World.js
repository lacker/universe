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

export default class World extends React.Component {
  constructor(props) {
    super();
    this.state = {
      children: []
    };
    props.registerAddObject(this.addObject.bind(this));
  }

  // Returns whether it was successful
  addObject(str, x, z) {
    var component = parseJSX(str);
    if (!component) {
      console.log("could not parse jsx: " + str);
      return false;
    }
    console.log("adding " + str);
    component.props.position = { x: x, y: 0, z: z };
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
