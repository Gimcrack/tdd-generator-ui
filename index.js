// mixins
import Item from './src/js/components/mixins/item.js';
import Collection from './src/js/components/mixins/collection.js'

export default function(Vue) {

    window.mixins = {
        item : Item,
        collection : Collection
    };

    Vue.component('page', require('./src/js/components/Page.vue'));
    Vue.component('item', require('./src/js/components/Item.vue'));
    Vue.component('vinput', require('./src/js/components/Vinput.vue'));
    Vue.component('flash', require('./src/js/components/Flash.vue'));
    Vue.component('vform', require('./src/js/components/Form.vue'));
    Vue.component('formFieldGroup',require('./src/js/components/FormFieldGroup.vue') );
    Vue.component('formMenu',require('./src/js/components/FormMenu.vue'));
    Vue.component('formControl', require('./src/js/components/FormControl.vue'));
    Vue.component('formSelect', require('./src/js/components/FormSelect.vue'));
    Vue.component('formTextarea', require('./src/js/components/FormTextarea.vue'));
    Vue.component('batchUpdateSelected', require('./src/js/components/BatchUpdateSelected.vue'));
    Vue.component('headerSortButton', require('./src/js/components/HeaderSortButton.vue'));
}
