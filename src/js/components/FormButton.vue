<template>
    <button :disabled="disabled" type="button" @click="handler" class="btn" :class="btnType">
        <i class="fa fa-fw" :class="[ icon, { 'fa-spin' : busy } ]"></i>
        {{ label }}
    </button>
</template>

<script>
    export default {
        props : {

            definition : {
                required : true,
            },

            disabled : {
                default : false
            }
        },

        data() {
            return {
                help_message : '',
                validation : {
                    settings : [],
                    rules : [],
                    defaults : [
                        [ 'minLength', [2], 'Please enter a valid value' ]
                    ],
                },
                busy : false,
                valid : true
            }
        },

        methods : {
            handler() {

                this.busy = true;

                this.fn().then(() => {
                    this.busy = false;
                });
            }
        },

        computed : {
            label() {
                return this.definition.label;
            },

            fn() {
                return this.definition.fn;
            },

            icon() {
                return this.definition.icon || 'fa-refresh';
            },

            btnType() {
                return this.definition.btnType || 'btn-primary';
            },
        }
    }
</script>