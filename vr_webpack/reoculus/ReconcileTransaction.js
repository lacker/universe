import CallbackQueue from 'react/lib/CallbackQueue';
import PooledClass from 'react/lib/PooledClass';
import Transaction from 'react/lib/Transaction';

/**
 * Mostly a copy of ReactReconcileTransaction.js
 */
var ON_SCENE_READY_QUEUEING = {
  initialize() {
    this.reactMountReady.reset();
  },

  close() {
    this.reactMountReady.notifyAll();
  }
};

function ReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = CallbackQueue.getPooled(null);
}

var Mixin = {
  getTransactionWrappers: function() {
    return [ ON_SCENE_READY_QUEUEING ];
  },

  getReactMountReady: function() {
    return this.reactMountReady;
  },

  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

Object.assign(
  ReconcileTransaction.prototype,
  Transaction.Mixin,
  Mixin
);

PooledClass.addPoolingTo(ReconcileTransaction);

export default ReconcileTransaction;
