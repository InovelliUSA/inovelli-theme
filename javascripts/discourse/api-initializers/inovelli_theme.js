import getURL from 'discourse-common/lib/get-url';
import { apiInitializer } from 'discourse/lib/api';
import { h } from 'virtual-dom';
import { schedule } from '@ember/runloop';
import { createWidget } from 'discourse/widgets/widget';

export default apiInitializer('0.11.1', (api) => {
  // Fix prefers dark theme and toggle issues:
  api.reopenWidget('home-logo', {
    logoElement(key, url, title) {
      const attributes =
        key === 'logo-small'
          ? { src: getURL(url), width: 36, alt: title }
          : { src: getURL(url), alt: title };

      const imgElement = h(`img#site-logo.${key}`, {
        key,
        attributes,
      });

      return imgElement;
    },
  });

  api.registerConnectorClass('below-site-header', 'inovelli-menu-panel', {
    setupComponent(attrs, component) {
      const menuData = settings.menu_items.split('|');
      const subMenuData = settings.sub_menu_items.split('|');
      const menuItems = [];
      const subMenuItems = [];

      subMenuData.forEach((item) => {
        const subMenuItem = item.split(',');
        const subMenuObject = {
          parent: subMenuItem[0],
          title: subMenuItem[1],
          url: subMenuItem[2],
        };

        subMenuItems.push(subMenuObject);
      });

      menuData.forEach((item) => {
        const menuItem = item.split(',');

        const menuObject = {
          title: menuItem[0],
          url: menuItem[1],
          hasChildren: menuItem[2],
        };

        // if item has sub-menu items, find items and append to object:
        if (menuObject.hasChildren) {
          menuObject.children = [];
          subMenuItems.map((subItem) => {
            if (subItem.parent === menuObject.title) {
              menuObject.children.push(subItem);
            }
          });
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

  api.decorateWidget('header-buttons:before', (helper) => {
    return helper.attach('inovelli-menu', { id: 'inovelli-menu' });
  });

  api.replaceIcon('bars', 'cog');

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