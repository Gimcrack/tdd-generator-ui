// mixins
import Item from './src/js/components/mixins/item.js';
import Collection from './src/js/components/mixins/collection.js'
import TurnDown from 'turndown';
import Rule from './src/js/components/Rule.class.js';

export default function(Vue) {

    window.mixins = {
        item : Item,
        collection : Collection
    };

    window.turndownService = new TurnDown();
    window.Rule = Rule;

    Vue.component('vue-multiselect', require('vue-multiselect/src/Multiselect.vue'));
    Vue.component('ui-home', require('./src/js/components/UiHome.vue'));
    Vue.component('page', require('./src/js/components/PageWrapper.vue'));
    Vue.component('item-table', require('./src/js/components/ItemTable.vue'));
    Vue.component('item-grid', require('./src/js/components/ItemGrid.vue'));
    Vue.component('item-scrum', require('./src/js/components/ItemScrum.vue'));
    Vue.component('item-cards', require('./src/js/components/ItemCards.vue'));
    Vue.component('item-detail', require('./src/js/components/ItemDetail.vue'));
    Vue.component('vinput', require('./src/js/components/Vinput.vue'));
    Vue.component('flash', require('./src/js/components/Flash.vue'));
    Vue.component('toggle', require('./src/js/components/Toggle.vue'));
    Vue.component('vform', require('./src/js/components/Form.vue'));
    Vue.component('badge',require('./src/js/components/Badge.vue'));
    Vue.component('navTab',require('./src/js/components/NavTab.vue'));
    Vue.component('tab-pane',require('./src/js/components/TabPane.vue'));
    Vue.component('itemMeta',require('./src/js/components/ItemMeta.vue'));
    Vue.component('itemHeader',require('./src/js/components/ItemHeader.vue'));
    Vue.component('dropdownItem',require('./src/js/components/DropdownItem.vue'));
    Vue.component('formFieldGroup',require('./src/js/components/FormFieldGroup.vue') );
    Vue.component('formMenu',require('./src/js/components/FormMenu.vue'));
    Vue.component('formControl', require('./src/js/components/FormControl.vue'));
    Vue.component('formSelect', require('./src/js/components/FormSelect.vue'));
    Vue.component('formTextarea', require('./src/js/components/FormTextarea.vue'));
    Vue.component('formDatepicker', require('./src/js/components/FormDatepicker.vue'));
    Vue.component('formButton', require('./src/js/components/FormButton.vue'));
    Vue.component('batchUpdateSelected', require('./src/js/components/BatchUpdateSelected.vue'));
    Vue.component('headerSortButton', require('./src/js/components/HeaderSortButton.vue'));
    Vue.component('viewSettings',require('./src/js/components/ViewSettings.vue'));
    Vue.component('resetPassword',require('./src/js/components/ResetPassword.vue'));
}
