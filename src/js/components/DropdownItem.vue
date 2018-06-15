<template>
    <a class="dropdown-item"
       :href="href"
       v-if="show"
       @click.prevent="$emit('clicked')"
       :disabled="busy"
       :class="{disabled : busy}"
    >
        <i v-if="icon" class="fa fa-fw" :class="icon"></i> <slot></slot>
    </a>
</template>

<script>
    export default {

        props : {
            href : {
                default : '#'
            },
            busy : {
                default : false
            },
            show : {
                default : true
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