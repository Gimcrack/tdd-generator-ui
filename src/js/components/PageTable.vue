<template>
    <table class="table table-striped table-hover" :class="layoutClass">
        <thead>
            <tr>
                <td colspan="100">
                    <slot name="page-meta-top"></slot>
                </td>
            </tr>
            <tr>
                <th style="width:30px">
                    <slot name="select-all"></slot>
                </th>
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
