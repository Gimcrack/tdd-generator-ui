<template>
    <div class="messages">

        <button type="button" @click="show = ! show" class="btn btn-link btn-toggle-notifications">
            <i class="fa fa-fw fa-2x" :class="[show ? 'fa-bell' : 'fa-bell-o']"></i>
        </button>

        <button type="button" v-show="show" @click="show_history = ! show_history" class="btn btn-link btn-show-history" :class="{ 'text-secondary' : ! show_history }">
            <i class="fa fa-fw fa-history fa-2x"></i>
            <transition name="bounce">
                <div v-show="show_badge" class="badge badge-info">{{ messages.length+archive.length }}</div>
            </transition>
        </button>

        <button type="button" v-show="show && messages.length" @click="readAll" class="btn btn-link btn-read-all">
            <i class="fa fa-fw fa-check-double fa-2x"></i>
        </button>

        <transition name="bounce">
            <div v-show="show" class="message-container rounded">
                <button type="button" v-if="archive.length && show_history" class="btn btn-secondary my-2" @click="show_archive = ! show_archive">
                    Show {{ show_archive ? 'Less' : 'More' }} ...
                </button>
                <flash-message @close="close" v-if="show_archive" v-for="message in archive" :key="message.key" :message="message" :show-history="show_history"></flash-message>
                <flash-message @close="close" v-if="messages.length" v-for="message in messages" :key="message.key" :message="message" :show-history="show_history"></flash-message>
            </div>
        </transition>
    </div>
</template>

<script>
    import moment from 'moment-timezone';
    import FlashMessage from './FlashMessage.vue';

    export default {
        components : {
            FlashMessage
        },

        props: {
            message : {
                required : true
            },

            type : {
                default : 'success'
            }
        },

        data() {
            return {
                body: '',
                message_type : this.type,
                show: true,
                show_history : false,
                show_archive : false,
                show_badge : false,

                messages : [],
                archive : [],
                new_messages : [],
            }
        },

        computed : {
            icon() {
                switch (this.message_type) {
                    case 'success' : return 'fa-check-square-o';
                    case 'warning' : return 'fa-exclamation-triangle';
                    case 'danger' : return 'fa-exclamation-circle';
                }
            }
        },

        mounted() {
            if (this.message) {
                this.flash(this.message);
            }

            Bus.$on('flash', (data) => {
                    this.new_messages.push(data);
                }
            );

            // update timestamps every minute
            setInterval( () => {
                this.$forceUpdate();
            }, 60*1000);

            // only allow 8 new messages per second
            setInterval( () => {
                if ( this.new_messages.length )
                    this.getNew(8)
            }, 1000);
        },

        methods: {

            getNew(count) {
                for (let ii=0; ii<count; ii++) {
                    if ( ! this.new_messages.length )
                        return false;

                    this.flash(this.new_messages.pop());
                }
            },

            close({message}) {
                this.messages = this.messages.filter(o => o.key !== message.key);
                this.archive = this.archive.filter(o => o.key !== message.key);
                this.show_badge = this.show_badge && this.messages.length;

                if ( this.archive.length && this.messages.length <= 5 )
                    this.messages.push( this.archive.shift() );

                this.$forceUpdate();
            },

            readAll() {
                this.messages = [];
                this.archive = [];
                this.show_badge = false;
            },

            flash({ message, type }) {
                let key = +Math.random();
                let ts = +moment();

                this.show_badge = false;

                if ( type === 'notify' ) {
                    return this.notify(message);
                }

                // console.log(message, type);
                //sleep(100).then(() => {

                if ( this.messages.length >= 5 )
                    this.archive.push( this.messages.shift() );

                if ( this.archive.length > 100 )
                    this.archive.pop();

                sleep(300).then(() => {
                    this.messages.push({message, type, ts, key});

                    this.notify(message, type);
                    this.show_badge = true;
                });
            },

            notify(message, type) {
                let options;

                // Let's check if the browser supports notifications
                if (!("Notification" in window)) {
                    return false;
                }

                if ( !! type ) {
                    options = {
                        //icon : `img/${type}.png`,
                        tag : type
                    }
                }

                if (Notification.permission === "granted") {
                    return new Notification(message, options);
                }

                if (Notification.permission !== "denied") {
                    Notification.requestPermission( (permission) => {
                        // If the user accepts, let's create a notification
                        if (permission === "granted") {
                            return new Notification(message, options);
                        }
                    });
                }

            }
        }
    };
</script>

<style lang="scss">
    .btn-close-message {
        right: -3px;
        top: -1px;
        position: absolute;
    }

    .btn-show-history {
        position: fixed;
        right: 40px;
        bottom: 5px;

        .badge {
            position: absolute;
            top:18px;
            left:28px;
        }
    }

    .btn-toggle-notifications {
        position: fixed;
        right: 5px;
        bottom: 5px;


    }

    .btn-read-all {
        position: fixed;
        right: 75px;
        bottom: 5px;
    }

    .message-container {
        display: flex;
        position: fixed;
        flex-direction: column;
        max-width: 300px;
        right: 10px;
        bottom: 40px;
        z-index: 1001;
        padding: 0.25rem;


        .alert-flash {
            position: relative;
            right: unset;
            bottom: unset;
            align-items: center;
            justify-content: center;
            min-height: 60px;
            padding-left: 0.5rem;
            padding-right: 1rem;
        }
    }
</style>
