<template>
    <transition name="bounce">
        <div v-show="show || showHistory" class="my-1 alert alert-flash shadow-sm position-relative" :class="`alert-${message.type}`" role="alert">
            <div :style="overlayStyle" class="timer-overlay"></div>
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
            'message',
            'showHistory'
        ],

        mounted() {
            sleep(100).then( () => {
                this.show = true;

                if ( ! this.message.sticky && ! this.showHistory )
                    this.startCountdown();
            });
        },

        computed : {
            overlayStyle() {
                return {
                    width : (20 * this.countdown) + '%'
                }
            }
        },

        data() {
            return {
                show : false,
                countdown : 0,
                intervals : {}
            }
        },

        methods : {
            close() {
                this.show = false;
                this.$emit('close',{ message : this.message });
            },

            getIcon(type) {
                switch (type) {
                    case 'success' : return 'fa-check-circle-o';
                    case 'warning' : return 'fa-exclamation-triangle';
                    case 'danger' : return 'fa-exclamation-circle';
                }
            },

            getFormattedTime(ts) {
                return moment(ts).fromNow();
            },

            startCountdown() {
                if ( this.intervals.countdown )
                    clearInterval(this.intervals.countdown);

                this.intervals.countdown = setInterval( this.advanceCountdown, 1000 );
            },

            advanceCountdown() {
                if ( this.countdown === 5 ) {
                    clearInterval(this.intervals.countdown);
                    this.show = false;
                    return;
                }

                this.countdown++;
            },

        }
    }
</script>

<style scoped lang="scss">
    .timer-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(0,0,0,0.05);
        transition: all 1s ease-in-out;
    }
</style>