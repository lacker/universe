import React from 'react';
import Three from 'three';
import Reoculus from './index';

// Crappy JSX interpreter
function parseJSX(str) {
  str = str.trim();
  if (str[0] !== '<') {
    return;
  }
  var i = 1;
  var props = {};

  var tagEnd = Math.min(
    Math.min(str.indexOf(' '), Infinity),
    Math.min(str.indexOf('/>'), Infinity),
    Math.min(str.indexOf('>'), Infinity)
  );
  if (tagEnd < 0) {
    return;
  }
  var tag = str.substring(1, tagEnd).trim();
  if (!Reoculus[tag]) {
    console.log('No Component named ' + tag + ' exists.');
    return;
  }
  i = tagEnd;
  var latestProp = null;
  var bracketStack = [];
  while (i < str.length) {
    if (str[i] === ' ' && bracketStack.length === 0) {
      i++;
      continue;
    }
    if (str.substr(i, 2) === '/>') {
      return { tag, props };
    }
    if (str[i] === '>') {
      if (tag === 'Stack') {
        var endTagPos = str.indexOf('</Stack>');
        var content = str.substring(i + 1, endTagPos).trim();
        var inner = content.split(/ *\n */);
        props.children = [];
        var children = inner.map(function(text) {
          console.log('TEXT', text);
          var data = parseJSX(text);
          props.children.push(React.createElement(Reoculus[data.tag], data.props));
        });
      }
      return { tag, props };
    }
    if (latestProp === null) {
      var propEnd = str.indexOf('=', i);
      latestProp = str.substring(i, propEnd);
      i = propEnd + 1;
      continue;
    }
    if (str[i] === '{' || str[i] === '}') {
      var last = bracketStack.length - 1;
      if (bracketStack[last] && str[i] !== bracketStack[last].ch) {
        var bracket = bracketStack.pop();
        if (bracketStack.length === 0) {
          var contents = str.substring(bracket.pos + 1, i);
          props[latestProp] = Function('return ' + contents)();
          latestProp = null;
        }
      } else {
        bracketStack.push({ ch: str[i], pos: i });
      }
    }
    i++;
  }
  return { tag, props };
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

  // Returns whether it was successful.
  // This will not overwrite an already-existing cid!
  // You have to do that yourself.
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
      window.lastCID = cid;
    }
    console.log("creating " + cid);
    component.props.cid = cid;

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
