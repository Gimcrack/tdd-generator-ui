<template>
    <th nowrap="nowrap" v-if="column != '__blank__'">
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>

        <div class="d-flex">
            <div class="mr-2">
                {{ column_title }}
            </div>
            <div class="btn-group">
                <button :id="`dropdown_${column_title}`" @click="toggleDropDown"
                        :class="{'btn-outline-primary' : ! active, 'btn-primary' : active}" class="btn btn-xs border-right-0">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu p-2 w-0 header-menu" :class="{show : dropdownOpen}" :aria-labelledby="`dropdown_${column_title}`">
                    <button @click="$parent.sortBy(column_key, true)" class="btn btn-primary">
                        <i class="fa fa-fw fa-sort-amount-asc"></i>
                        Sort {{ column_title }} Asc
                    </button>
                    <button @click="$parent.sortBy(column_key, false)" class="btn btn-primary">
                        <i class="fa fa-fw fa-sort-amount-desc"></i>
                        Sort {{ column_title }} Desc
                    </button>

                    <vue-multiselect
                            @input="update"
                            v-model="selected"
                            :multiple="true"
                            :options="options"
                            :searchable="true"
                            :placeholder="`Filter By ${column_title}`"
                            :close-on-select="false"
                            :limit="1"
                            class="mt-2"
                    ></vue-multiselect>
                </div>
                <button :class="{active, 'btn-outline-primary' : ! active, 'btn-primary' : active}" class="btn btn-xs" @click="$parent.sortBy(column_key)">
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
            'options'
        ],

        data() {
            return {
                dropdownOpen : false,
                selected : []
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
            }
        },

        methods : {
            toggleDropDown() {
                this.dropdownOpen = ! this.dropdownOpen;
            },
            update() {

            },
        }
    }
</script>

<style lang="scss">
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
        //max-width: 350px;
    }
</style>