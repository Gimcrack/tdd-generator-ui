// mixins
import Item from './src/js/components/mixins/item.js';
import Collection from './src/js/components/mixins/collection.js'
import TurnDown from 'turndown';
import Rule from './src/js/components/Rule.class.js';
import VueLocalForage from 'vue-localforage';

export default function(Vue) {

    window.mixins = {
        item : Item,
        collection : Collection
    };

    window.turndownService = new TurnDown();
    window.Rule = Rule;

    Vue.use(VueLocalForage, { name : 'ls'} );

    Vue.component('vue-multiselect', require('vue-multiselect/src/Multiselect.vue').default);
    Vue.component('ui-home', require('./src/js/components/UiHome.vue').default);
    Vue.component('page', require('./src/js/components/PageWrapper.vue').default);
    Vue.component('item-table', require('./src/js/components/ItemTable.vue').default);
    Vue.component('item-grid', require('./src/js/components/ItemGrid.vue').default);
    Vue.component('item-scrum', require('./src/js/components/ItemScrum.vue').default);
    Vue.component('item-cards', require('./src/js/components/ItemCards.vue').default);
    Vue.component('item-detail', require('./src/js/components/ItemDetail.vue').default);
    Vue.component('vinput', require('./src/js/components/Vinput.vue').default);
    Vue.component('flash', require('./src/js/components/Flash.vue').default);
    Vue.component('toggle', require('./src/js/components/Toggle.vue').default);
    Vue.component('vform', require('./src/js/components/Form.vue').default);
    Vue.component('badge',require('./src/js/components/Badge.vue').default);
    Vue.component('navTab',require('./src/js/components/NavTab.vue').default);
    Vue.component('tab-pane',require('./src/js/components/TabPane.vue').default);
    Vue.component('itemMeta',require('./src/js/components/ItemMeta.vue').default);
    Vue.component('itemHeader',require('./src/js/components/ItemHeader.vue').default);
    Vue.component('dropdownItem',require('./src/js/components/DropdownItem.vue').default);
    Vue.component('dropdownMenu',require('./src/js/components/DropdownMenu.vue').default);
    Vue.component('formFieldGroup',require('./src/js/components/FormFieldGroup.vue') .default);
    Vue.component('formMenu',require('./src/js/components/FormMenu.vue').default);
    Vue.component('formControl', require('./src/js/components/FormControl.vue').default);
    Vue.component('formSelect', require('./src/js/components/FormSelect.vue').default);
    Vue.component('formTextarea', require('./src/js/components/FormTextarea.vue').default);
    Vue.component('formDatepicker', require('./src/js/components/FormDatepicker.vue').default);
    Vue.component('formButton', require('./src/js/components/FormButton.vue').default);
    Vue.component('batchUpdateSelected', require('./src/js/components/BatchUpdateSelected.vue').default);
    Vue.component('headerSortButton', require('./src/js/components/HeaderSortButton.vue').default);
    Vue.component('viewSettings',require('./src/js/components/ViewSettings.vue').default);
    Vue.component('resetPassword',require('./src/js/components/ResetPassword.vue').default);
    Vue.component('editableText',require('./src/js/components/EditableText.vue').default);
    Vue.component('popper',require('vue-popper-component/src/VuePopper.vue').default);
}
