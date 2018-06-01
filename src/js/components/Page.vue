<template>
    <div class="page">
        <div class="page-header">
            <h2>{{ params.heading }}</h2>
            <button type="button" @click.prevent="fetch" :disabled="busy" :class="busy ? 'disabled' : ''" class="btn-primary btn">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                {{ refresh_btn_text }}
            </button>

            <template v-if="toggles.do_with_selected">
                <button :id="`dropdown_toggle_${params.component}`" v-if="toggled.length" data-toggle="dropdown" role="button" aria-expanded="false" :class="busy ? 'disabled' : ''" class="dropdown-toggle btn-success btn">
                    <i class="fa fa-fw fa-check-square-o" :class="{'fa-spin' : busy}"></i>
                    Do With Selected
                </button>

                <div class="dropdown-menu" role="menu" :aria-labelledby="`dropdown_toggle_${params.component}`">
                    <slot name="selection-dropdown-menu"></slot>
                </div>
            </template>

            <button v-if="toggles.new" :class="{ disabled : busy }" @click.prevent="$emit('new')" :disabled="busy" class="btn btn-success">
                <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
                <template v-if="params.newBtnText">{{ params.newBtnText}}</template>
                <template v-else>New {{ properType }}</template>
            </button>

            <slot name="menu"></slot>

            <vinput icon="fa-search" placeholder="Search..." v-model="search"></vinput>
        </div>
        <div class="alert alert-info" v-text="params.help" v-show="params.help">
        </div>
        <table class="table table-striped table-hover" :class="{'table-sm' : compact}">
            <thead>
            <tr>
                <td colspan="100">
                    <span class="badge badge-light p-2 mr-2">
                        Viewing {{ filtered.length }} Records
                    </span>
                    <button @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-warning">
                        <i class="fa fa-fw fa-times"></i> Clear Filters
                    </button>
                </td>
            </tr>
            <tr>
                <th style="width:30px">
                    <i v-if="toggles.do_with_selected" @click="toggleAll" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw" :class="toggleAllClass"></i>
                </th>
                <header-sort-button
                    v-for="(col,index) in params.columns"
                    :order-by="orderBy"
                    :asc="asc"
                    :column="col"
                    :key="index"
                    :options="getColumnOptions(col)"
                    :align-right="index >= params.columns.length-2"
                    class="table-header"
                    @UpdateFilter="updateFilter"
                ></header-sort-button>
            </tr>
            </thead>

            <template v-if="filtered.length" v-for="model in filtered" >
                <component
                    :is="params.component || params.type"
                    :initial="model"
                    :key="model.id"
                    :model-props="params.modelProps"
                    @ToggledHasChanged="setToggled">
                </component>
            </template>

            <tfoot>
            <tr>
                <td colspan="100">
                    <span class="badge badge-light p-2 mr-2">
                        Viewing {{ filtered.length }} Records
                    </span>
                    <button @click="clearFilter" v-if="showClearFiltersBtn" class="btn btn-warning">
                        <i class="fa fa-fw fa-times"></i> Clear Filters
                    </button>
                </td>
            </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
    import _ from 'lodash';

    export default {
        mixins : [
            mixins.collection
        ],

        mounted() {
            this.$parent.page = this;

            Bus.$on('ToggleCompactView', () => {
                this.compact = !this.compact;
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
            }
        },

        computed : {

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
            }

        },

        methods : {
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
            },

            getToggled() {
                return this.$children
                    .filter( child => { return child.$children.length && child.$children[0].toggled; } );
            },

            getUntoggled() {
                return this.$children
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

        .table-header {
            &:first-child {
                width: 40px !important;
            }

            &:nth-child(2) {
                width: 80px !important;
            }
        }
    }
</style>
