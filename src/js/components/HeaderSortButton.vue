<template>
    <th class="header-sort-button" nowrap="nowrap" v-if="show && column !== '__blank__'">
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>

        <div class="d-flex">
            <div class="btn-group">
                <button :id="`dropdown_${column_title}`" @click="toggleDropDown"
                        :class="btnClass" class="btn btn-xs border-right-0">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu p-2 w-0 header-menu"
                     :class="{show : dropdownOpen, 'dropdown-menu-right' : alignRight}"
                     :aria-labelledby="`dropdown_${column_title}`"
                >
                    <div class="d-flex">
                        <button @click="page.sortBy(column_key, true)" class="btn mr-1" :class="ascBtnClass">
                            <i class="fa fa-fw fa-sort-amount-asc"></i>
                            Sort {{ column_title }} Asc
                        </button>
                        <button @click="page.sortBy(column_key, false)" class="btn" :class="descBtnClass">
                            <i class="fa fa-fw fa-sort-amount-desc"></i>
                            Sort {{ column_title }} Desc
                        </button>
                    </div>

                    <vue-multiselect
                        v-if="options!==false"
                        @input="update"
                        v-model="selected"
                        track-by="id"
                        label="label"
                        :multiple="true"
                        :options="uniqueOptions"
                        :searchable="true"
                        :placeholder="`Filter By ${column_title}`"
                        :close-on-select="false"
                        select-label=""
                        deselect-label=""
                        :limit="3"
                        :group-select="groupSelect"
                        :group-values="groupValues"
                        :group-label="groupLabel"
                        class="mt-2"
                    >
                        <template slot="beforeList">
                            <div class="d-flex w-100 p-1">
                                <button v-if="selected.length !== flattenedOptions.length" @click="selectAll"
                                        class="btn btn-primary flex-fill m-1">
                                    <i class="fa fa-fw fa-check-square-o"></i> Select All
                                </button>
                                <button v-if="selected.length" @click="unselectAll"
                                        class="btn btn-primary flex-fill m-1">
                                    <i class="fa fa-fw fa-square-o"></i> Unselect All
                                </button>
                            </div>
                        </template>

                        <template v-if="options.length > 6" slot="afterList">
                            <div class="d-flex w-100 p-1">
                                <button v-if="selected.length !== flattenedOptions.length" @click="selectAll"
                                        class="btn btn-primary flex-fill m-1">
                                    <i class="fa fa-fw fa-check-square-o"></i> Select All
                                </button>
                                <button v-if="selected.length" @click="unselectAll"
                                        class="btn btn-primary flex-fill m-1">
                                    <i class="fa fa-fw fa-square-o"></i> Unselect All
                                </button>
                            </div>
                        </template>

                    </vue-multiselect>
                    <button @click="unselectAll" v-if="selected.length" class="btn btn-warning btn-xs mt-2">
                        <small><i class="fa fa-fw fa-times"></i> Reset Filter</small>
                    </button>
                </div>
                <button :class="btnClass" class="btn btn-xs" @click="page.sortBy(column_key)">
                    <small>
                        {{ column_title }}
                        <i class="fa fa-fw" :class="active_asc ? 'fa-sort-amount-asc' : 'fa-sort-amount-desc' "></i>
                    </small>
                </button>
            </div>

        </div>
    </th>

    <th v-else-if="show">
        
    </th>
</template>

<script>
    import VueMultiselect from 'vue-multiselect/src/Multiselect.vue';

    export default {
        components : {
            VueMultiselect
        },

        props : {
            column: {},
            asc: {},
            orderBy: {},
            alignRight: {},
            options: {
                default() {
                    return [{
                        id: 'placeholder',
                        value: 'placeholder'
                    }];
                }
            },
            type : {
                default : 'normal'
            },
            hiddenColumns : {
                default() {
                    return [];
                }
            }
        },

        watch : {
            options() {
                this.uniqueOptions = this.getOptions();
            }
        },

        created() {
            this.page.headers.push(this);

            Bus.$on('UpdateFilters', (e) => {
                if ( e.key === this.column_key ) {
                    this.selected = _.map( _.flatten([e.value]), o => {
                        return {
                            id : o,
                            label : o
                        }
                    });
                }
            });
        },

        data() {
            return {
                dropdownOpen : false,
                selected : [],
                uniqueOptions : this.getOptions(),
                updateTimeout : null,
            }
        },

        computed : {
            page() {
                return this.$parent.$parent;
            },

            show() {
                return this.hiddenColumns.indexOf( this.column.title || this.column ) === -1;
            },

            column_title() {
                if ( !! this.column.title )
                    return this.column.title;

                return this.column.$title_case();
            },

            column_key() {
                if ( !! this.column.key )
                    return this.column.key;

                return this.column;
            },

            active() {
                return this.orderBy === this.column_key;
            },

            active_asc() {
                return this.asc && this.active;
            },

            mapped_selected() {
                if ( ! this.selected.length )
                    return null;
                else if ( this.selected.length === 1 )
                    return this.selected[0].id;
                return this.selected.map(o => o.id);
            },

            btnClass() {
                switch(true) {
                    case this.selected.length && this.active :
                        return ['btn-warning'];

                    case this.selected.length && ! this.active :
                        return ['btn-outline-warning'];

                    case ! this.selected.length && this.active :
                        return ['btn-primary'];

                    case ! this.selected.length && ! this.active :
                        return ['btn-outline-primary'];
                }
            },

            ascBtnClass() {
                return (this.active && this.asc) ? ['btn-primary','active'] : ['btn-link'];
            },

            descBtnClass() {
                return (this.active && ! this.asc) ? ['btn-primary','active'] : ['btn-link'];
            },

            groupValues() {
                return ( ! this.shouldGroup ) ? null : 'values';
            },

            groupLabel() {
                return ( ! this.shouldGroup ) ? null : 'group';
            },

            groupSelect() {
                return ( ! this.shouldGroup ) ? null : true;
            },

            shouldGroup() {
                return (this.column.type === 'date');
            },

            flattenedOptions() {
                return this.shouldGroup ? _(this.uniqueOptions).map('values').flatten().value() : this.uniqueOptions;
            }
        },

        methods : {

            selectAll() {
                this.selected = this.flattenedOptions;
                this.update();
            },

            unselectAll() {
                this.selected = [];
                this.update();
            },

            toggleDropDown() {
                this.dropdownOpen = ! this.dropdownOpen;
            },

            update() {
                if ( this.updateTimeout )
                    clearTimeout(this.updateTimeout);

                this.updateTimeout = setTimeout( () => {

                    this.$emit( 'UpdateFilter', {
                        key : this.column_key,
                        value : this.mapped_selected
                    });

                    // hack to force updating of computed 'filtered' property
                    this.page.sortBy(this.page.orderBy, ! this.page.asc);
                    this.page.sortBy(this.page.orderBy, ! this.page.asc);
                }, 700 );
            },

            getOptions() {
                if ( ! this.options.length ) return [{
                    id: 'placeholder',
                    label: 'placeholder'
                }];

                if ( this.shouldGroup ) {
                    return _(this.options)
                        .union([])
                        .groupBy( o => {
                            return o.label.slice(0,4);
                        })
                        .map( (o,i) => {
                            return {
                                group : i,
                                values : o
                            }
                        })
                        .value();
                }

                return _.union(this.options);
            }
        }
    }
</script>

<style lang="scss">
    .header-sort-button {

        .multiselect__select {
            //top: 13px;
        }

        .header-menu {
            //width: 340px;
        }

        .multiselect__tags {
            min-height: 65px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
        }

        .multiselect__tags-wrap {
            display: flex;
            //flex-direction: column;
        }
    }

</style>