<template>
    <div class="form-group">
        <label>{{ definition.label }}</label>
        <div style="font-size:16px;" class="bg-white p-2 shadow-sm rounded" v-html="value"></div>
    </div>
</template>

<script>
    export default {
        name: "FormHtml",

        props : {

            definition : {
                required : true,

                default() {
                    return {
                        value : ''
                    }
                }
            },

            value : {
                required : true,
                default() {
                    return this.definition.value;
                }
            },

            errors : {
                required : false,
                default : () => {}
            }

        },
    }
</script>

<style scoped>

</style>