import ReactInstanceHandles from 'react/lib/ReactInstanceHandles';
import ReactUpdates from 'react/lib/ReactUpdates';
import instantiateReactComponent from 'react/lib/instantiateReactComponent';

import Three from 'three';

import Scene from './Scene';
import inject from './inject';

var instancesByRootID = {};

inject();

export default function render(element) {
  var scene = new Three.Scene();

  var instance = instantiateReactComponent(element, null);
  var rootId = ReactInstanceHandles.createReactRootID();

  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

  Scene.setScene(scene);
  transaction.perform(() => {
    instance.mountComponent(rootId, transaction, {});
  });

  return scene;
}
