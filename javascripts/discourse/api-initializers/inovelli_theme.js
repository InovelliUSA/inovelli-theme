import getURL from 'discourse-common/lib/get-url';
import { apiInitializer } from 'discourse/lib/api';
import { h } from 'virtual-dom';
import { schedule } from '@ember/runloop';
import { createWidget } from 'discourse/widgets/widget';
import Component from '@glimmer/component';
import { action } from '@ember/object';

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

  // Register theme toggle component
  api.registerComponent('inovelli-theme-toggle', {
    templateName: 'components/inovelli-theme-toggle',
    actions: {
      toggleTheme() {
        const isDark = !document.documentElement.classList.contains('dark-theme');
        if (isDark) {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        }
      }
    }
  });

  // Add theme toggle to header
  api.headerButtons.add('inovelli-theme-toggle', {
    icon: 'moon',
    title: 'Toggle theme',
    action: 'toggleTheme',
    position: 'right'
  });

  // Attach menu to header
  api.decorateWidget('header-contents:before', (helper) => {
    return helper.attach('inovelli-menu');
  });

  api.createWidget('inovelli-menu', {
    tagName: 'nav.inovelli-menu',
    buildKey: (attrs) => `inovelli-menu-button-${attrs.id}`,

    defaultState() {
      return {
        active: 'inactive',
      };
    },

    html(attrs, state) {
      const hamburgerButton = [
        h('span.sr-only', 'Menu'),
        h('span.bar-top', ''),
        h('span.bar-middle', ''),
        h('span.bar-bottom', ''),
      ];

      const menuButton = h(
        `div.inovelli-menu-toggle.${state.active}`,
        hamburgerButton
      );

      return menuButton;
    },

    click() {
      if (this.state.active === 'inactive') {
        document.body.classList.add('inovelli-menu-active');
        this.state.active = 'active';
      } else {
        document.body.classList.remove('inovelli-menu-active');
        this.state.active = 'inactive';
      }
    },
  });
});