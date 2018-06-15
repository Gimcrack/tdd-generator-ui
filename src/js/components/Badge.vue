<template>
    <span class="p-1 badge" :class="type" v-text="text"></span>
</template>

<script>
    export default {

        props : {
            type : {
                default : 'badge-secondary'
            },

            text : {
                required : true
            }
        },

        data() {
            return {}
        }
    }
</script>

<style lang="scss">

</style>