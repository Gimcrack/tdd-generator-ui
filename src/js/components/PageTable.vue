<template>
    <table class="table table-striped table-hover" :class="layoutClass">
        <thead>
            <tr>
                <td colspan="100">
                    <div class="d-flex flex-fill">
                        <div class="btn-group mr-2">
                            <button class="btn btn-xs btn-outline-primary">
                                <small><slot name="select-all"></slot></small>
                            </button>
                            <button v-if="$slots['selection-dropdown'] && $parent.hasToggled" class="btn btn-outline-primary btn-xs" data-toggle="dropdown">
                                <i class="fa fa-ellipsis-v"></i>
                            </button>
                            <slot v-if="$parent.hasToggled" name="selection-dropdown"></slot>
                        </div>
                        <slot name="page-meta-top"></slot>
                    </div>
                </td>
            </tr>
            <tr>
                <slot name="column-headers"></slot>
            </tr>
        </thead>

        <slot></slot>

        <tfoot>
        <tr>
            <td colspan="100">
                <slot name="page-meta-bottom"></slot>
            </td>
        </tr>
        </tfoot>
    </table>
</template>

<script>
    import page from './mixins/page';

    export default {
        mixins : [page]
    }
</script>

<style lang="scss">

</style>
