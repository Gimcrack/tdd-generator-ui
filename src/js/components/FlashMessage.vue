<template>
    <transition name="bounce">
        <div class="my-1 alert alert-flash shadow-sm position-relative" :class="`alert-${message.type}`" role="alert">
            <button @click="close" class="btn-link btn btn-xs btn-close-message">
                <i class="fa fa-fw fa-times"></i>
            </button>
            <div class="d-flex flex-row">
                <div>
                    <i class="fa fa-fw fa-3x" :class="getIcon(message.type)"></i>
                </div>
                <div class="d-flex flex-column">
                    <div>
                        <em><i class="fa fa-clock-o"></i> {{ getFormattedTime(message.ts) }} </em>
                    </div>
                    <div>
                        {{ message.message }}
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import moment from 'moment-timezone';

    export default {
        props : [
            'message'
        ],

        mounted() {
            sleep(100).then( () => {
                this.show = true;
            });
        },

        data() {
            return {
                show : false,
            }
        },

        methods : {
            close() {
                this.show = false;
                this.$emit('close',{ message : this.message });
            },

            getIcon(type) {
                switch (type) {
                    case 'success' : return 'fa-check-square-o';
                    case 'warning' : return 'fa-exclamation-triangle';
                    case 'danger' : return 'fa-exclamation-circle';
                }
            },

            getFormattedTime(ts) {
                return moment(ts).fromNow();
            },

        }
    }
</script>

<style scoped>

</style>