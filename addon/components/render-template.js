import Component from '@ember/component';
import { setOwner, getOwner } from '@ember/application';
import { once } from '@ember/runloop';
import { compileTemplate } from '@ember/template-compilation';
import { assign } from '@ember/polyfills';
import layout from '../templates/components/render-template';

export default Component.extend({
  tagName: '',
  layout,

  props: null,

  onError() {},
  onSuccess() {},

  didReceiveAttrs() {
    this._super(...arguments);
    const { onError, onSuccess } = this;

    once(this, function () {
      let hasError = false;
      let owner = getOwner(this);
      let _props = this.get('props') || {};
      let domForAppWithGlimmer2 = owner.lookup('service:-document');
      let layout = '';

      try {
        layout = compileTemplate(this.get('templateString') || '');
      } catch(e) {
        this.onError(e);
        return;
      }

      let props = assign({}, _props, {
        layout,
      });

      let ComponentFactory = owner.factoryFor('component:render-template-result');
      let componentInstance = ComponentFactory.create(props);
      let container;

      if (domForAppWithGlimmer2) {
        container = domForAppWithGlimmer2.createElement('div');
      } else {
        container = document.createElement('div');
      }

      setOwner(componentInstance, owner);

      try {
        componentInstance.appendTo(container);
        this.set('result', container);
        this.onSuccess();
      } catch(e) {
        this.onError(e);
        componentInstance.destroy();
        this.set('result', '');
      }
    });
  }
});
