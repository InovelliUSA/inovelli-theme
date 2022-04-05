import Component from '@ember/component';
import { action } from '@ember/object';
import DiscourseURL from 'discourse/lib/url';

export default Component.extend({
  tagName: 'li',

  @action
  selectItem(item) {
    if (item.children) {
      this.set('myItem', item.children);
      this.set('showSubMenu', 'show-sub-menu');
    } else {
      return DiscourseURL.routeTo(item.url);
    }
  },
});
