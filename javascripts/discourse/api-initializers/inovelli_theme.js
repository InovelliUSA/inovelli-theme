import getURL from 'discourse-common/lib/get-url';
import { apiInitializer } from 'discourse/lib/api';
import { h } from 'virtual-dom';
import { schedule } from '@ember/runloop';
import { createWidget } from 'discourse/widgets/widget';

export default apiInitializer('1.8.0', (api) => {
  // Register custom menu panel for below-site-header
  api.registerConnectorClass('below-site-header', 'inovelli-menu-panel', {
    setupComponent(attrs, component) {
      const menuData = settings.menu_items.split('|');
      const subMenuData = settings.sub_menu_items.split('|');
      const menuItems = [];
      const subMenuItems = [];

      subMenuData.forEach((item) => {
        const [parent, title, url] = item.split(',');
        subMenuItems.push({ parent, title, url });
      });

      menuData.forEach((item) => {
        const [title, url, hasChildren] = item.split(',');
        const menuObject = { title, url, hasChildren: !!hasChildren };
        if (menuObject.hasChildren) {
          menuObject.children = subMenuItems.filter(
            (subItem) => subItem.parent === menuObject.title
          );
        }
        menuItems.push(menuObject);
      });

      component.set('menuItems', menuItems);
    },
    actions: {
      returnMain() {
        this.set('showSubMenu', '');
      },
    },
  });

  // Define custom widget for the menu
  createWidget('inovelli-menu', {
    tagName: 'nav.inovelli-menu',
    buildKey: (attrs) => `inovelli-menu-button-${attrs.id}`,
    defaultState() {
      return { active: 'inactive' };
    },
    html(attrs, state) {
      const hamburgerButton = [
        h('span.sr-only', 'Menu'),
        h('span.bar-top', ''),
        h('span.bar-middle', ''),
        h('span.bar-bottom', ''),
      ];
      return h(`div.inovelli-menu-toggle.${state.active}`, hamburgerButton);
    },
    click() {
      const bodyClass = 'inovelli-menu-active';
      schedule('afterRender', () => {
        if (this.state.active === 'inactive') {
          document.body.classList.add(bodyClass);
          this.state.active = 'active';
        } else {
          document.body.classList.remove(bodyClass);
          this.state.active = 'inactive';
        }
      });
    },
  });

  // Attach custom menu to the header
  api.decorateWidget('header-buttons:before', (helper) => {
    return helper.attach('inovelli-menu', { id: 'inovelli-menu' });
  });
});
