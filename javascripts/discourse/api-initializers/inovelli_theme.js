import getURL from 'discourse-common/lib/get-url';
import { apiInitializer } from 'discourse/lib/api';
import { h } from 'virtual-dom';
import { schedule } from '@ember/runloop';
import { createWidget } from 'discourse/widgets/widget';

export default apiInitializer('1.8.0', (api) => {
  // Update logo rendering with newer api pattern
  api.reopenWidget('home-logo:after', {
    html(attrs) {
      const { key, url, title } = attrs;
      const attributes =
        key === 'logo-small'
          ? { src: getURL(url), width: 36, alt: title }
          : { src: getURL(url), alt: title };

      return h(`img#site-logo.${key}`, { attributes });
    }
  });

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

  // Define custom widget for the menu using newer widget pattern
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

  // Update header widget decoration to use the new pattern
  api.decorateWidget('header-buttons:before', (helper) => {
    return helper.attach('inovelli-menu', { id: 'inovelli-menu' });
  });

  // Remove deprecated icon replacement
  // api.replaceIcon('bars', 'cog');
});
