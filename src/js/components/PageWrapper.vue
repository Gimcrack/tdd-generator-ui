
<template>
    <div class="page">
        <div class="page-header">
            <h2>{{ params.heading }}</h2>
            <button type="button" @click.prevent="fetch" :disabled="busy" :class="busy ? 'disabled' : ''" class="btn-primary btn">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                {{ refresh_btn_text }}
            </button>

            <auto-refresh @refresh="fetch" @countdown="updateCountdown"></auto-refresh>

            <button type="button" v-if="toggles.new" :class="{ disabled : busy }" @click.prevent="$emit('new')" :disabled="busy" class="btn btn-success">
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
                <!--<button type="button" :id="`dropdown_toggle_${params.component}`" v-if="toggled.length" data-toggle="dropdown" role="button" aria-expanded="false" :class="busy ? 'disabled' : ''" class="dropdown-toggle btn-success btn">-->
                <!--Do With Selected-->
                <!--</button>-->

                <div class="dropdown-menu" role="menu">
                    <slot name="selection-dropdown-menu"></slot>
                </div>
            </template>


            <template slot="select-all">
                <button type="button" v-if="toggles.do_with_selected || toggles.checklist" class="btn btn-xs btn-outline-primary">
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
                    <button type="button" @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-xs btn-warning mr-2">
                        <small><i class="fa fa-fw fa-times"></i> Reset All Filters</small>
                    </button>
                    <badge class="p-2" type="badge-light" icon="fa-clock-o">
                        Updated {{ lastRefreshedFormatted }}
                    </badge>
                    <badge v-if="countdown !== -1" class="ml-2 p-2" type="badge-light" icon="fa-clock-o">
                        {{ countdown }}
                    </badge>
                    <div class="flex-fill"></div>

                    <!-- right side -->

                    <view-settings
                        v-if="page_layout === 'page-table'"
                        :hidden-columns="hiddenColumns"
                        :options="hiddenColumnsOptions"
                        @update="updateHiddenColumns"
                    ></view-settings>

                    <div v-if="page_layout === 'page-grid'" class="btn-group ml-2">
                        <button type="button" class="btn btn-xs z-0 btn-outline-primary" @click="showMeta">
                            <small><i class="fa fa-fw fa-plus"></i> Expand All</small>
                        </button>
                        <button type="button" class="btn btn-xs z-0 btn-outline-primary" @click="hideMeta">
                            <small><i class="fa fa-fw fa-minus"></i> Collapse All</small>
                        </button>
                    </div>

                    <div class="btn-group ml-2" v-if="page_layout === 'page-cards'" >
                        <div  class="mr-2" style="width: 200px">
                            <vue-slider @input="changeZoom" tooltip="hover" v-model="zoom" :min="40" :max="300" :interval="5"></vue-slider>
                        </div>
                    </div>

                    <div v-if="page_layout === 'page-scrum'" class="d-flex ml-2">
                        Group By
                        <div class="btn-group ml-2">
                            <button type="button" class="btn btn-xs z-0"
                                    :class="groupBy === 'status' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                    :disabled="groupBy === 'status'"
                                    @click="changeGroupBy('status')"
                            >
                                <small>Status</small>
                            </button>
                            <button type="button" class="btn btn-xs z-0"
                                    :class="groupBy === 'priority' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                    :disabled="groupBy === 'priority'"
                                    @click="changeGroupBy('priority')"
                            >
                                <small>Priority</small>
                            </button>
                            <button type="button" class="btn btn-xs z-0"
                                    :class="groupBy === 'urgency' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                    :disabled="groupBy === 'urgency'"
                                    @click="changeGroupBy('urgency')"
                            >
                                <small>Urgency</small>
                            </button>
                        </div>
                    </div>

                    <div class="btn-group ml-2">
                        <button type="button" v-if="layouts.scrum !== false"
                                class="btn btn-xs z-0"
                                :class="page_layout === 'page-scrum' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-scrum'"
                                @click="changeLayout('page-scrum')"
                        >
                            <i class="fa fa-fw fa-columns"></i>
                        </button>
                        <button type="button" v-if="layouts.cards !== false"
                                class="btn btn-xs z-0"
                                :class="page_layout === 'page-cards' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-cards'"
                                @click="changeLayout('page-cards')"
                        >
                            <i class="fa fa-fw fa-th"></i>
                        </button>
                        <button type="button" v-if="layouts.grid !== false"
                                class="btn btn-xs z-0"
                                :class="page_layout === 'page-grid' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-grid'"
                                @click="changeLayout('page-grid')"
                        >
                            <i class="fa fa-fw fa-th-large"></i>
                        </button>
                        <button type="button" v-if="layouts.table !== false"
                                class="btn btn-xs z-0"
                                :class="page_layout === 'page-table' ? ['active','btn-primary','disabled'] : ['btn-outline-primary']"
                                :disabled="page_layout === 'page-table'"
                                @click="changeLayout('page-table')"
                        >
                            <i class="fa fa-fw fa-bars"></i>
                        </button>
                    </div>
                </div>
            </template>

            <!-- Table & Grid Layout -->
            <template v-if="page_layout === 'page-table' || page_layout === 'page-grid' || page_layout === 'page-cards'">
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
            </template>

            <!-- Scrum Layout -->
            <template v-if="page_layout === 'page-scrum'">
                <template v-if="filtered.length > 0 && filtered.length < 500">
                    <div class="d-flex scrum-columns mb-5">
                        <scrum-column
                                @ToggledHasChanged="$emit('ToggledHasChanged')"
                                v-if="filtered.some(o => o[groupBy].indexOf(status) > -1)"
                                :status="status"
                                v-for="status in scrumGroups"
                                :key="status"
                                :count="filtered.filter(o => o[groupBy].indexOf(status) > -1).length"
                            >
                            <component
                                v-for="model in filtered.filter(o => o[groupBy].indexOf(status) > -1)"
                                :is="params.component || params.type"
                                :item-layout="item_layout"
                                :initial="model"
                                :key="model.id"
                                :model-props="params.modelProps"
                                :columns="params.columns"
                                @ToggledHasChanged="setToggled">
                            </component>
                        </scrum-column>
                    </div>
                </template>
            </template>

            <template slot="page-meta-bottom">
                <div class="d-flex align-items-center header-sort-button">
                    <badge class="p-2 mr-2" icon="fa-info" :type="[ showClearFiltersBtn ? 'badge-warning' : 'badge-light']">
                        {{ viewingRecordsTxt }}
                        <template v-if="showClearFiltersBtn">(Filtered)</template>
                    </badge>
                    <button type="button" @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-xs btn-warning mr-2">
                        <small><i class="fa fa-fw fa-times"></i> Reset All Filters</small>
                    </button>
                    <badge class="p-2" type="badge-light" icon="fa-clock-o">
                        Updated {{ lastRefreshedFormatted }}
                    </badge>
                    <badge v-if="countdown !== -1" class="ml-2 p-2" type="badge-light" icon="fa-clock-o">
                        {{ countdown }}
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
    import _ from 'lodash';
    //import moment from 'moment-timezone';
    import PageTable from './PageTable.vue';
    import PageGrid from './PageGrid.vue';
    import PageScrum from './PageScrum.vue';
    import PageCards from './PageCards.vue';
    import ScrumColumn from './ScrumColumn.vue';
    import AutoRefresh from './AutoRefresh.vue';
    import VueSlider from 'vue-slider-component';

    export default {
        components: {
            PageTable,
            PageGrid,
            PageScrum,
            PageCards,
            ScrumColumn,
            AutoRefresh,
            VueSlider
        },

        mixins : [
            mixins.collection
        ],

        async mounted() {
            this.$parent.page = this;

            Bus.$on('ToggleCompactView', () => {
                this.compact = !this.compact;
            });

            Bus.$on('UpdateFilters', (e) => {
                if ( this.isActivePage() )
                    this.updateFilter(e);
            });

            Bus.$on('ShowChecked', (e) => {
                this.showChecked = e;
            });

            this.getInitialHiddenColumns();

            this.getInitialState();

            if ( this.intervals.formatLastRefreshed )
                clearInterval(this.intervals.formatLastRefreshed);

            this.intervals.formatLastRefreshed = setInterval(this.formatLastRefreshed,10000);

            this.formatLastRefreshed();

            this.zoom = await Store.get( this.getCacheKey('cards_zoom'), 100);

            Bus.$emit('ChangeZoom', { zoom : this.zoom } );
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
                        hidden_columns : [],
                    }
                }
            },
            toggles : {
                default()  {
                    return {
                        new : true,

                    }
                }
            },

            layouts : {
                default() {
                    return {
                        table : true,
                        grid : true,
                        scrum : false,
                        cards : false
                    }
                }
            }
        },

        data() {
            return {
                orderBy : this.params.order || 'name',
                asc : ( this.params.orderDir !== null ) ? this.params.orderDir : true,
                toggled : this.getToggled(),
                models : [],
                compact : false,
                filters : {},
                headers : [],
                hiddenColumns : [],
                timeoutHiddenColumnUpdate : null,
                page : {},
                showChecked : false,
                groupBy : 'status',
                intervals : [],
                countdown : -1,
                zoom : 100,
                scrumStatuses : [
                    'Open',
                    'Pending',
                    'In Progress',
                    'Follow Up',
                    'Waiting for Customer',
                    'Waiting for Vendor',
                    'Waiting for Approval',
                    'Requires Upgrade',
                ],
                scrumPriorities : [
                    '3 High',
                    '2 Medium',
                    '1 Low',
                ],
                scrumUrgencies : [
                    'Immediate',
                    'Today',
                    'Tomorrow',
                    'This Week',
                    'Next Week',
                    'Two Weeks',
                    'This Month',
                    'Next Month',
                    'This Year',
                    'Not Urgent',
                    'Other'
                ],
                lastRefreshedFormatted : null
            }
        },

        computed : {

            scrumGroups() {
                if ( this.groupBy === 'status' ) return this.scrumStatuses;
                if ( this.groupBy === 'priority' ) return this.scrumPriorities;
                if ( this.groupBy === 'urgency' ) return this.scrumUrgencies;
            },

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

            isActivePage() {
                return this.$parent.$parent.$el.classList.contains('active');
            },

            updateCountdown(value) {
                if ( value === -1 )
                    return this.countdown = -1;

                if ( value < 1000 )
                    return this.countdown = 'Refreshing... ';

                this.countdown = 'Refreshing in ' + moment.utc(value).format('mm:ss');
            },

            formatLastRefreshed() {
                this.lastRefreshedFormatted = ( isNaN(this.last_refreshed)) ?
                    this.last_refreshed :
                    moment.unix(this.last_refreshed/1000).fromNow();

                return this.lastRefreshedFormatted;
            },

            toggleChecked() {
                this.showChecked = ! this.showChecked;

                Bus.$emit('ShowChecked', this.showChecked);
            },

            changeZoom() {
                Bus.$emit('ChangeZoom', { zoom : this.zoom} );

                Store.set( this.getCacheKey('cards_zoom'), this.zoom );
            },

            changeGroupBy(groupBy) {
                this.groupBy = groupBy;

                if ( this.groupBy === 'urgency' )
                    Bus.$emit('UpdateFilters', { key : 'urgency', value : ['Immediate','Today','Tomorrow','This Week','Next Week','Two Weeks','This Month'] });
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

            postCreated(event) {
                this.$emit('created',event);
            },

            postDeleted(event) {
                this.$emit('deleted',event)
            },

            update() {
                if ( ! this.hasToggled ) return false;

                Bus.$emit('ShowForm', { type : this.params.type, model : this.toggled[0].model })
            },

            updateFilter(event) {
                if ( event.value == null ) {
                    this.$delete(this.filters, event.key);
                } else {
                    this.$set(this.filters, event.key, { value : event.value, invert : !! event.invert });
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
                        .flatten()
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

            async getInitialHiddenColumns() {
                let hidden = await Store.get( this.getCacheKey('hidden_columns'), this.params.hidden_columns );

                this.hiddenColumns = ( typeof hidden === 'string' ) ? hidden.split(',') : hidden;
            },

            updateHiddenColumns( event ) {
                if ( !! this.timeoutHiddenColumnUpdate )
                    clearTimeout(this.timeoutHiddenColumnUpdate);

                this.timeoutHiddenColumnUpdate = setTimeout( () => {
                    this.hiddenColumns = event.hidden;
                    Store.set(this.getCacheKey('hidden_columns'), event.hidden);
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
