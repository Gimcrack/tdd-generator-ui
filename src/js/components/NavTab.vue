<template>
    <li :class="{active, 'has-subnav' : hasSubnav}">
        <a :id="`${id}-tab`" @click="click">
            <i class="fa fa-fw fa-2x" :class="[icon,text]"></i>
            <div>
                <slot></slot>
            </div>
        </a>
    </li>
</template>

<script>
    export default {

        props : {
            id : {
                required : true
            },

            parent : {
                default : null
            },

            icon : {
                default : 'fa-cogs'
            },

            text : {
                default : ''
            },

            activeTab : {
                default() {
                    return {};
                }
            },

            hasSubnav : {
                default : false
            }
        },

        computed : {
            active() {
                return this.activeTab.id === this.id;
            }
        },

        data() {
            return {

            }
        },

        mounted() {
//            Bus.$on('NavChanged', (data) => {
//                this.active = ( this.id === data.id && this.parent === data.parent );
//            });
        },

        methods : {
            click() {
                //Bus.$emit('NavChanged', { id : this.id, parent : this.parent });

                this.$emit('clicked');
            }
        }
    }
</script>