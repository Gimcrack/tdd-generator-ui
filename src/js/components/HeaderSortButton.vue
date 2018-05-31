<template>
    <th class="header-sort-button" nowrap="nowrap" v-if="column !== '__blank__'">
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>

        <div class="d-flex">
            <div class="mr-2">
                {{ column_title }}
            </div>
            <div class="btn-group">
                <button :id="`dropdown_${column_title}`" @click="toggleDropDown"
                        :class="btnClass" class="btn btn-xs border-right-0">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu p-2 w-0 header-menu"
                     :class="{show : dropdownOpen, 'dropdown-menu-right' : last}"
                     :aria-labelledby="`dropdown_${column_title}`"
                >
                    <button @click="$parent.sortBy(column_key, true)" class="btn" :class="ascBtnClass">
                        <i class="fa fa-fw fa-sort-amount-asc"></i>
                        Sort {{ column_title }} Asc
                    </button>
                    <button @click="$parent.sortBy(column_key, false)" class="btn" :class="descBtnClass">
                        <i class="fa fa-fw fa-sort-amount-desc"></i>
                        Sort {{ column_title }} Desc
                    </button>

                    <vue-multiselect
                        @input="update"
                        v-model="selected"
                        :track-by="trackBy"
                        :label="label"
                        :multiple="true"
                        :options="uniqueOptions"
                        :searchable="true"
                        :placeholder="`Filter By ${column_title}`"
                        :close-on-select="false"
                        select-label=""
                        deselect-label=""
                        :limit="3"
                        class="mt-2"
                    ></vue-multiselect>
                </div>
                <button :class="btnClass" class="btn btn-xs" @click="$parent.sortBy(column_key)">
                    <i class="fa fa-fw" :class="active_asc ? 'fa-sort-amount-asc' : 'fa-sort-amount-desc' "></i>
                </button>
            </div>

        </div>
    </th>

    <th v-else>
        
    </th>
</template>

<script>
    import VueMultiselect from 'vue-multiselect/src/Multiselect.vue';

    export default {
        components : {
            VueMultiselect
        },

        props : [
            'column',
            'asc',
            'orderBy',
            'options',
            'last'
        ],

        created() {
            this.$parent.headers.push(this);
        },

        data() {
            return {
                dropdownOpen : false,
                selected : [],
                uniqueOptions : _.union(this.options)
            }
        },

        computed : {
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

            label() {
                return ( typeof this.options[0] !== 'object' ) ? null : 'label';
            },

            trackBy() {
                return ( typeof this.options[0] !== 'object' ) ? null : 'id';
            },

            mapped_selected() {
                switch(true) {
                    case this.selected.length === 1 && typeof this.options[0] !== 'object' :
                        return this.selected[0];

                    case this.selected.length > 1 && typeof this.options[0] !== 'object' :
                        return this.selected;

                    case this.selected.length === 1 && typeof this.options[0] === 'object' :
                        return this.selected[0].id;

                    case this.selected.length > 1 && typeof this.options[0] === 'object' :
                        return this.selected.map(o => o.id);
                }
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
                return (this.active && this.asc) ? ['btn-primary','active'] : ['btn-outline-primary'];
            },

            descBtnClass() {
                return (this.active && ! this.asc) ? ['btn-primary','active'] : ['btn-outline-primary'];
            },
        },

        methods : {
            toggleDropDown() {
                this.dropdownOpen = ! this.dropdownOpen;
            },

            update() {
                this.$emit( 'UpdateFilter', {
                    key : this.column_key,
                    value : this.mapped_selected
                });

                // hack to force updating of computed 'filtered' property
                this.$parent.sortBy(this.$parent.orderBy, ! this.$parent.asc);
                this.$parent.sortBy(this.$parent.orderBy, ! this.$parent.asc);
            },
        }
    }
</script>

<style lang="scss">
    .header-sort-button {
        .dropdown-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            height:100vh;
            width:100vw;
            background: rgba(0,0,0,0.0);
            z-index: 10;
            display: none;

            transition: all 0.1s linear;

            &.active {
                display: block;
                background: rgba(0,0,0,0.1);
            }
        }

        .header-menu {
            min-width: 250px;
        }

        .multiselect__tags-wrap {
            display: flex;
            flex-direction: column;
        }
    }

</style>