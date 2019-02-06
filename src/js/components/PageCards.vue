<template>
    <div class="page-cards" :class="layoutClass">
        <div class="border-bottom p-3 d-flex align-items-center">
            <div @click="toggleGridControls" :class="{active : showGridControls}" class="dropdown-wrapper"></div>
            <div class="btn-group">
                <slot name="select-all"></slot>
                <button type="button" v-if="$slots['selection-dropdown'] && $parent.hasToggled" class="btn btn-outline-primary btn-xs border-right-0" data-toggle="dropdown">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <slot v-if="$parent.hasToggled" name="selection-dropdown"></slot>
                <button type="button" @click="toggleGridControls" class="btn btn-outline-primary btn-xs btn-last mr-2">
                    <i class="fa fa-filter"></i>
                </button>


                <div v-show="showGridControls" :class="{show : showGridControls}" class="grid-controls dropdown-menu p-2 w-0 header-menu">
                    <div class="m-2 d-flex flex-column">
                        <slot name="column-headers"></slot>
                    </div>
                </div>
            </div>
            <slot name="page-meta-top"></slot>
        </div>
        <div class="page-cards__body d-flex mr-2 ml-2">

            <div class="page-cards__right d-flex mt-3 w-100 flex-wrap">
                <slot></slot>
            </div>
        </div>
    </div>

</template>

<script>
    import page from './mixins/page';

    export default {
        mixins : [page],

        mounted() {
            this.$parent.$pageLayout = this;
        },

        data() {
            return {
                showGridControls : false,
                zoom : 100,
            }
        },

        methods : {
            toggleGridControls() {
                this.showGridControls = !this.showGridControls;
            },
        }
    }
</script>

<style lang="scss">
    .grid-controls {
        .btn-group {
            margin-bottom: 0.75rem;
            flex: 1 1 auto !important;

            button:not(:first-child) {
                flex: 1 1 auto !important;
            }
        }
    }
</style>
