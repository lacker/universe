import ReactInjection from 'react/lib/ReactInjection';
import Component from './Component';
import ReconcileTransaction from './ReconcileTransaction';
import ReactComponentEnvironment from 'react/lib/ReactComponentEnvironment';

export default function inject() {
  ReactInjection.NativeComponent.injectGenericComponentClass(Component);
  ReactInjection.Updates.injectReconcileTransaction(ReconcileTransaction);

  ReactComponentEnvironment.processChildrenUpdates = function() {};
  ReactComponentEnvironment.replaceNOdeWithMarkupByID = function() {};
}
