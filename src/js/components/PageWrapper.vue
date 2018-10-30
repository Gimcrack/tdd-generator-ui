
<template>
    <div class="page">
        <div class="page-header">
            <h2>{{ params.heading }}</h2>
            <button type="button" @click.prevent="fetch" :disabled="busy" :class="busy ? 'disabled' : ''" class="btn-primary btn">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                {{ refresh_btn_text }}
            </button>

            <button v-if="toggles.new" :class="{ disabled : busy }" @click.prevent="$emit('new')" :disabled="busy" class="btn btn-success">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                <template v-if="params.newBtnText">{{ params.newBtnText}}</template>
                <template v-else>New {{ properType }}</template>
            </button>

            <toggle v-if="toggles.checklist" @clicked="toggleChecked" :active="! showChecked">Checklist Mode</toggle>

            <slot name="menu"></slot>

            <vinput icon="fa-search" placeholder="Search..." v-model="search"></vinput>
        </div> <!-- page-header -->

        <div class="alert alert-info" v-text="params.help" v-show="params.help"></div>

        <!-- page-body -->
        <component
            v-if="models.length"
            :is="page_layout"
            :layout-class="[ getTableHiddenColumnClasses,  {'table-sm' : compact}]"
        >
            <template slot="selection-dropdown" v-if="toggles.do_with_selected && hasDropdownMenuSlot">
                <!--<button :id="`dropdown_toggle_${params.component}`" v-if="toggled.length" data-toggle="dropdown" role="button" aria-expanded="false" :class="busy ? 'disabled' : ''" class="dropdown-toggle btn-success btn">-->
                <!--Do With Selected-->
                <!--</button>-->

                <div class="dropdown-menu" role="menu">
                    <slot name="selection-dropdown-menu"></slot>
                </div>
            </template>


            <template slot="select-all">
                <button v-if="toggles.do_with_selected || toggles.checklist" class="btn btn-xs btn-outline-primary">
                    <small>
                        <i @click="toggleAll" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw" :class="toggleAllClass"></i>
                    </small>
                </button>
            </template>

            <template slot="column-headers">
                <header-sort-button
                    v-for="(col,index) in params.columns"
                    :order-by="orderBy"
                    :asc="asc"
                    :column="col"
                    :key="index"
                    :name="index"
                    :options="getColumnOptions(col)"
                    :align-right="page_layout === 'page-table' && index >= params.columns.length/2"
                    class="table-header"
                    @UpdateFilter="updateFilter"
                ></header-sort-button>
            </template>

            <template slot="page-meta-top">
                <div class="d-flex align-items-center header-sort-button flex-fill">
                    <badge class="p-2 mr-2" icon="fa-info" :type="[ showClearFiltersBtn ? 'badge-warning' : 'badge-light']">
                        {{ viewingRecordsTxt }}
                        <template v-if="showClearFiltersBtn">(Filtered)</template>
                    </badge>
                    <button @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-xs btn-warning mr-2">
                        <small><i class="fa fa-fw fa-times"></i> Reset All Filters</small>
                    </button>
                    <badge class="p-2" type="badge-light" icon="fa-clock-o">
                        Updated {{ lastRefreshedFormatted }}
                    </badge>
                    <div class="flex-fill"></div>

                    <!-- right side -->

                    <view-settings
                        v-if="page_layout === 'page-table'"
                        :hidden-columns="hiddenColumns"
                        :options="hiddenColumnsOptions"
                        @update="updateHiddenColumns"
                    ></view-settings>

                    <div class="btn-group ml-2" v-else >
                        <button class="btn btn-xs btn-outline-primary" @click="showMeta">
                            <small><i class="fa fa-fw fa-plus"></i> Expand All</small>
                        </button>
                        <button class="btn btn-xs btn-outline-primary" @click="hideMeta">
                            <small><i class="fa fa-fw fa-minus"></i> Collapse All</small>
                        </button>
                    </div>

                    <div class="btn-group ml-2">
                        <button class="btn btn-xs"
                                :class="page_layout === 'page-grid' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-grid'"
                                @click="changeLayout('page-grid')"
                        >
                            <i class="fa fa-fw fa-th"></i>
                        </button>
                        <button class="btn btn-xs"
                                :class="page_layout === 'page-table' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-table'"
                                @click="changeLayout('page-table')"
                        >
                            <i class="fa fa-fw fa-bars"></i>
                        </button>
                    </div>
                </div>
            </template>

            <template v-if="filtered.length > 0 && filtered.length < 500" v-for="model in filtered" >
                <component
                    :is="params.component || params.type"
                    :item-layout="item_layout"
                    :initial="model"
                    :key="model.id"
                    :model-props="params.modelProps"
                    :columns="params.columns"
                    @ToggledHasChanged="setToggled">
                </component>
            </template>



            <template slot="page-meta-bottom">
                <div class="d-flex align-items-center header-sort-button">
                    <badge class="p-2 mr-2" icon="fa-info" :type="[ showClearFiltersBtn ? 'badge-warning' : 'badge-light']">
                        {{ viewingRecordsTxt }}
                        <template v-if="showClearFiltersBtn">(Filtered)</template>
                    </badge>
                    <button @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-xs btn-warning mr-2">
                        <small><i class="fa fa-fw fa-times"></i> Reset All Filters</small>
                    </button>
                    <badge class="p-2" type="badge-light" icon="fa-clock-o">
                        Updated {{ lastRefreshedFormatted }}
                    </badge>
                </div>
            </template>

        </component>

        <div v-if="filtered.length > 500" class="alert alert-danger">
            <strong><i class="fa fa-fw fa-exclamation-triangle"></i> Oops.</strong> There are too many items to display. Try applying some filters.
        </div>

        <div v-if="models.length < 1" class="alert alert-warning">
            Nothing to see here, you could try a refresh.

            <small><button type="button" @click.prevent="fetch" :disabled="busy" :class="busy ? 'disabled' : ''" class="btn-primary btn btn-xs">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                {{ refresh_btn_text }}
            </button></small>
        </div>
    </div>
</template>

<script>
    //import _ from 'lodash';
    //import moment from 'moment-timezone';
    import PageTable from './PageTable.vue';
    import PageGrid from './PageGrid.vue';

    export default {
        components: {
            PageTable,
            PageGrid
        },

        mixins : [
            mixins.collection
        ],

        mounted() {
            this.$parent.page = this;

            Bus.$on('ToggleCompactView', () => {
                this.compact = !this.compact;
            });

            Bus.$on('UpdateFilters', (e) => {
                this.updateFilter(e);
            });

            Bus.$on('ShowChecked', (e) => {
                this.showChecked = e;
            })
        },

        props : {
            params : {
                default() {
                    return {
                        type : '',
                        heading : 'Page Heading',
                        data_key : null,
                        order : 'name',
                        orderDir : true,
                        columns : [],
                        model_friendly : 'name',
                        endpoint : '',
                        help : null,
                        events : {
                            channel : '',
                            created : '',
                            destroyed : '',
                            global : null
                        },
                        where : {},
                        reject : { placeholder : 'some-nonsense-value'},
                        filters : {},
                        hidden_columns : []
                    }
                }
            },
            toggles : {
                default()  {
                    return {
                        new : true
                    }
                }
            }
        },

        data() {
            return {
                orderBy : this.params.order || 'name',
                asc : ( this.params.orderDir !== null ) ? this.params.orderDir : true,
                toggled : this.getToggled(),
                models : this.getInitialState(),
                compact : false,
                filters : {},
                headers : [],
                hiddenColumns : this.getInitialHiddenColumns(),
                timeoutHiddenColumnUpdate : null,
                page : {},
                showChecked : false
            }
        },

        computed : {

            viewingRecordsTxt() {
                let
                    num = ( this.showChecked || ! this.toggles.checklist ) ?
                    this.filtered.length :
                    this.filtered.length-this.toggledCount,
                total = this.models.length;

                return `Viewing ${ num } / ${ total } Records`;
            },

            hasDropdownMenuSlot () {
                return !!this.$slots['selection-dropdown-menu'];
            },

            hasToggled() {
                return !! this.toggled.length;
            },

            allToggled() {
                return this.toggled.length === this.filtered.length;
            },

            toggleAllClass() {
                if ( this.allToggled ) return ['fa-check-square-o'];
                if ( this.hasToggled ) return ['fa-minus-square-o'];
                return ['fa-square-o'];
            },

            toggledCount() {
                return this.toggled.length;
            },

            filterKeys() {
                return Object.keys(this.filters);
            },

            showClearFiltersBtn() {
                return !! this.filterKeys.length;
            },

            lastRefreshedFormatted() {
                if ( isNaN(this.last_refreshed)) return this.last_refreshed;

                return moment.unix(this.last_refreshed/1000).fromNow();
            },

            hiddenColumnsOptions() {
                return _.map(this.params.columns, o => { return typeof o === 'string' ? o : o.title });
            },

            getTableHiddenColumnClasses() {
                return _.map(this.hiddenColumns, (o) => {

                    let index = _.findIndex( this.params.columns, oo => {
                        return (typeof oo === 'string') ?
                            oo === o : oo.title === o;
                    } );

                    if ( isNaN(index) ) return null;
                    if ( index < 1 ) return null;

                    return 'hide-' + (+index+1);
                });
            }
        },

        methods : {

            toggleChecked() {
                this.showChecked = ! this.showChecked;

                Bus.$emit('ShowChecked', this.showChecked);
            },

            changeLayout(layout) {
                this.headers = [];

                this.page_layout = layout;

                if ( this.hasToggled ) {
                    return this.getToggled().forEach( child => { child.$children[0].toggle() } );
                }

                this.clearFilter();

                sleep(5000).then( () => {
                    Bus.$emit('ShowChecked', this.showChecked);
                });

//                sleep(150).then( () => {
//                    for( let key in this.filters ) {
//                        let payload = {};
//                        payload[key] = this.filters[key];
//                        this.updateFilter(payload);
//                    }
//
//                })
            },

            showMeta() {
                Bus.$emit('ShowMeta');
            },

            hideMeta() {
                Bus.$emit('HideMeta');
            },

            getInitialState() {
                let key = this.params.endpoint,
                    state = INITIAL_STATE[key] || [];

                // get the data if it has a key (like when paginating)
                if ( this.params.data_key ) {
                    state = state[this.params.data_key];
                }

                return state || [];
            },

            postCreated(event) {
                this.$emit('created',event);
            },

            postDeleted(event) {
                this.$emit('deleted',event)
            },

            setToggled() {
                this.toggled = this.getToggled();

                this.$forceUpdate();
            },

            getToggledIds() {
                return this.getToggled().map(o => o.model.id);
            },

            getToggled() {
                if ( ! this.page ) return [];

                if ( ! this.page.$children ) return [];

                return this.page.$children
                    .filter( child => { return child.$children.length && child.$children[0].toggled; } );
            },

            getUntoggled() {
                if ( ! this.page ) return [];

                if ( ! this.page.$children ) return [];

                return this.page.$children
                    .filter( child => { return child.$children.length && ! child.$children[0].toggled; } );
            },

            toggleAll() {
                if ( this.hasToggled ) {
                    return this.getToggled().forEach( child => { child.$children[0].toggle() } );
                }

                return this.getUntoggled().forEach( child => { child.$children[0].toggle() } );
            },

            update() {
                if ( ! this.hasToggled ) return false;

                Bus.$emit('ShowForm', { type : this.params.type, model : this.toggled[0].model })
            },

            updateFilter(event) {
                if ( event.value == null ) {
                    this.$delete(this.filters, event.key);
                } else {
                    this.$set(this.filters, event.key, event.value);
                }
                this.$forceUpdate();
            },

            clearFilter() {
                this.filters = {};
                this.$forceUpdate();
                this.headers.forEach( o => { o.selected=[] });
                Bus.$emit('ClearFilters');
            },

            getColumnOptions(col) {
                if (col.options === false)
                    return false;

                return (col.options)
                    ? col.options :
                    _(this.models)
                        .map( o => {
                            return _.get(o,col.key ? col.key : col);
                        })
                        .uniq()
                        .sortBy(o => o)
                        .map( val => {
                            return {
                                id : val,
                                label : val
                            }
                        })
                        .value();
            },

            getInitialHiddenColumns() {
                let hidden = Store.$ls.get( this.getCacheKey('hidden_columns'), this.params.hidden_columns );

                return ( typeof hidden === 'string' ) ? hidden.split(',') : hidden;
            },

            updateHiddenColumns( event ) {
                if ( !! this.timeoutHiddenColumnUpdate )
                    clearTimeout(this.timeoutHiddenColumnUpdate);

                this.timeoutHiddenColumnUpdate = setTimeout( () => {
                    this.hiddenColumns = event.hidden;
                    Store.$ls.set(this.getCacheKey('hidden_columns'), event.hidden);
                }, 750 );

            }
        }
    }
</script>

<style lang="scss">
    .page {
        .page-header {
            padding: 1em 0;

            h2 {
                margin: 0;
            }

            display: flex;
            align-items: center;

            & > * + * {
                margin-left: 0.5em;
            }

        }

        .table {
            &.hide-2 {
                th:nth-child(2), td:nth-child(2) {
                    display:none;
                }
            }
            &.hide-3 {
                th:nth-child(3), td:nth-child(3) {
                    display:none;
                }
            }
            &.hide-4 {
                th:nth-child(4), td:nth-child(4) {
                    display:none;
                }
            }
            &.hide-5 {
                th:nth-child(5), td:nth-child(5) {
                    display:none;
                }
            }
            &.hide-6 {
                th:nth-child(6), td:nth-child(6) {
                    display:none;
                }
            }
            &.hide-7 {
                th:nth-child(7), td:nth-child(7) {
                    display:none;
                }
            }
            &.hide-8 {
                th:nth-child(8), td:nth-child(8) {
                    display:none;
                }
            }
            &.hide-9 {
                th:nth-child(9), td:nth-child(9) {
                    display:none;
                }
            }
            &.hide-10 {
                th:nth-child(10), td:nth-child(10) {
                    display:none;
                }
            }
            &.hide-11 {
                th:nth-child(11), td:nth-child(11) {
                    display:none;
                }
            }
            &.hide-12 {
                th:nth-child(12), td:nth-child(12) {
                    display:none;
                }
            }
            &.hide-13 {
                th:nth-child(13), td:nth-child(13) {
                    display:none;
                }
            }
        }
    }
</style>
