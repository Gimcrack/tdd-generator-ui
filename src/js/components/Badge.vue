<template>
    <span class="p-1 badge" :class="type">
        <i v-if="icon" class="fa fa-fw" :class="icon"></i> {{ text }}
        <slot></slot>
    </span>
</template>

<script>
    export default {

        props : {
            type : {
                default : 'badge-secondary'
            },

            text : {
                default : null
            },

            icon : {
                default : false
            }
        },

        data() {
            return {}
        }
    }
</script>

<style lang="scss">

</style>