import getURL from 'discourse-common/lib/get-url';
import { apiInitializer } from 'discourse/lib/api';
import { h } from 'virtual-dom';
import { schedule } from '@ember/runloop';
import Component from '@ember/component';

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

  // Register the menu button component
  api.registerComponent('inovelli-menu-button', {
    templateName: 'components/inovelli-menu-button',
    actions: {
      toggleMenu() {
        const bodyClass = 'inovelli-menu-active';
        schedule('afterRender', () => {
          if (document.body.classList.contains(bodyClass)) {
            document.body.classList.remove(bodyClass);
          } else {
            document.body.classList.add(bodyClass);
          }
        });
      }
    }
  });

  // Add menu button to header using the new API
  api.headerButtons.add("inovelli-menu", {
    template: "components/inovelli-menu-button",
    before: "auth"
  });
});
