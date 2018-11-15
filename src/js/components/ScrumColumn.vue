<template>
    <div class="d-flex position-relative flex-column align-items-center justify-content-start rounded card card-shadow" :class="statusClass">
        <div class="position-absolute header-shadow d-flex align-items-center justify-content-center py-2">
            <span class="text-bold">
                {{ status }} ({{count}})
            </span>
        </div>

        <button class="btn btn-link btn-xs btn-plus-times position-absolute" :class="{active:expanded}" @click="toggleExpanded">
            <i class="fa fa-fw fa-plus"></i>
        </button>

        <slot></slot>
    </div>
</template>

<script>
    export default {

        props : {
            status: {
                required : true
            },
            count: {
                default : 0
            }
        },

        data() {
            return {
                expanded : false,
                scrumColumn : true
            }
        },

        computed : {
            statusClass() {
                return ['scrum-column', 'scrum-' + _.kebabCase(this.status), {expanded : this.expanded }];
            },

            toggled() {
                return this.$children.filter( child => { return child.$children.length && child.$children[0].toggled; } )
            }
        },

        methods : {
            toggleExpanded() {
                Bus.$emit('ToggleScrumColumn', {status : this.status});
                this.expanded = ! this.expanded;
            }
        },

        mounted() {
            Bus.$on('ToggleScrumColumn',(e) => {
                if (e.status !== this.status)
                    this.expanded = false;
            });

            this.$on('ToggledHasChanged', (e) => {
                this.$emit('ToggledHasChanged');
            })
        }
    }
</script>

<style lang="scss">
    @import "../../sass/variables";

    .scrum-column {
        transition: all 0.2s linear;


        .header-shadow {
            top: 0;
            left:0;
            width: 100%;
        }

        .btn-plus-times {
            top: 0;
            right: 0;

            i {
                transition: all 0.2s linear;
            }

            &.active i {
                transform: rotate(45deg);
            }
        }

        &.expanded {
            flex:2;
        }

        flex:1;
        padding: 3.5em 0.5em 0.5em;
        //overflow: auto;

        &.scrum-open {
            background: rgba($brand-blue, 0.03);
            border: 1px solid rgba($brand-blue, 0.15);
            .header-shadow {
                background: rgba($brand-blue, 0.10);
                border-bottom: 1px solid rgba($brand-blue, 0.15);
            }
        }

        &.scrum-pending {
            background: rgba($brand-yellow, 0.03);
            border: 1px solid rgba($brand-yellow, 0.15);
            .header-shadow {
                background: rgba($brand-yellow, 0.10);
                border-bottom: 1px solid rgba($brand-yellow, 0.15);
            }
        }

        &.scrum-in-progress {
            background: rgba($brand-green, 0.03);
            border: 1px solid rgba($brand-green, 0.15);
            .header-shadow {
                background: rgba($brand-green, 0.10);
                border-bottom: 1px solid rgba($brand-green, 0.15);
            }
        }

        &.scrum-follow-up {
            background: rgba($brand-purple, 0.03);
            border: 1px solid rgba($brand-purple, 0.15);
            .header-shadow {
                background: rgba($brand-purple, 0.10);
                border-bottom: 1px solid rgba($brand-purple, 0.15);
            }
        }

        &.scrum-waiting-for-customer {
            background: rgba($brand-teal,0.03);
            border: 1px solid rgba($brand-teal,0.15);
            .header-shadow {
                background: rgba($brand-teal,0.10);
                border-bottom: 1px solid rgba($brand-teal,0.15);
            }
        }

        &.scrum-waiting-for-vendor {
            background: rgba($brand-dark-teal,0.03);
            border: 1px solid rgba($brand-dark-teal,0.15);
            .header-shadow {
                background: rgba($brand-dark-teal,0.10);
                border-bottom: 1px solid rgba($brand-dark-teal,0.15);
            }
        }

        &.scrum-waiting-for-approval {
            background: rgba($brand-gray,0.03);
            border: 1px solid rgba($brand-gray,0.15);
            .header-shadow {
                background: rgba($brand-gray,0.10);
                border-bottom: 1px solid rgba($brand-gray,0.15);
            }
        }

        &.scrum-requires-upgrade {
            background: rgba($brand-red,0.03);
            border: 1px solid rgba($brand-red,0.15);
            .header-shadow {
                background: rgba($brand-red,0.10);
                border-bottom: 1px solid rgba($brand-red,0.15);
            }
        }

        /* Priorities */

        &.scrum-1-low {
            background: rgba($brand-green, 0.03);
            border: 1px solid rgba($brand-green, 0.15);
            .header-shadow {
                background: rgba($brand-green, 0.10);
                border-bottom: 1px solid rgba($brand-green, 0.15);
            }
        }

        &.scrum-2-medium {
            background: rgba($brand-yellow, 0.03);
            border: 1px solid rgba($brand-yellow, 0.15);
            .header-shadow {
                background: rgba($brand-yellow, 0.10);
                border-bottom: 1px solid rgba($brand-yellow, 0.15);
            }
        }

        &.scrum-3-high {
            background: rgba($brand-red,0.03);
            border: 1px solid rgba($brand-red,0.15);
            .header-shadow {
                background: rgba($brand-red,0.10);
                border-bottom: 1px solid rgba($brand-red,0.15);
            }
        }

        /* Urgencies */

        &.scrum-immediate {
            background: rgba($brand-darker-red,0.03);
            border: 1px solid rgba($brand-darker-red,0.15);
            .header-shadow {
                background: rgba($brand-darker-red,0.20);
                border-bottom: 1px solid rgba($brand-darker-red,0.15);
            }
        }

        &.scrum-today {
            background: rgba($brand-dark-red,0.03);
            border: 1px solid rgba($brand-dark-red,0.15);
            .header-shadow {
                background: rgba($brand-dark-red,0.15);
                border-bottom: 1px solid rgba($brand-dark-red,0.15);
            }
        }

        &.scrum-tomorrow {
            background: rgba($brand-red,0.03);
            border: 1px solid rgba($brand-red,0.15);
            .header-shadow {
                background: rgba($brand-red,0.10);
                border-bottom: 1px solid rgba($brand-red,0.15);
            }
        }

        &.scrum-this-week {
            background: rgba($brand-light-red,0.03);
            border: 1px solid rgba($brand-light-red,0.15);
            .header-shadow {
                background: rgba($brand-light-red,0.05);
                border-bottom: 1px solid rgba($brand-light-red,0.15);
            }
        }

        &.scrum-next-week{
            background: rgba($brand-darker-orange,0.03);
            border: 1px solid rgba($brand-darker-orange,0.15);
            .header-shadow {
                background: rgba($brand-darker-orange,0.20);
                border-bottom: 1px solid rgba($brand-darker-orange,0.15);
            }
        }

        &.scrum-two-weeks{
            background: rgba($brand-dark-orange,0.03);
            border: 1px solid rgba($brand-dark-orange,0.15);
            .header-shadow {
                background: rgba($brand-dark-orange,0.15);
                border-bottom: 1px solid rgba($brand-dark-orange,0.15);
            }
        }

        &.scrum-this-month{
            background: rgba($brand-orange,0.03);
            border: 1px solid rgba($brand-orange,0.15);
            .header-shadow {
                background: rgba($brand-orange,0.10);
                border-bottom: 1px solid rgba($brand-orange,0.15);
            }
        }

        &.scrum-next-month{
            background: rgba($brand-darker-green,0.03);
            border: 1px solid rgba($brand-darker-green,0.15);
            .header-shadow {
                background: rgba($brand-darker-green,0.20);
                border-bottom: 1px solid rgba($brand-darker-green,0.15);
            }
        }

        &.scrum-this-year{
            background: rgba($brand-dark-green,0.03);
            border: 1px solid rgba($brand-dark-green,0.15);
            .header-shadow {
                background: rgba($brand-dark-green,0.15);
                border-bottom: 1px solid rgba($brand-dark-green,0.15);
            }
        }

        &.scrum-not-urgent{
            background: rgba($brand-green,0.03);
            border: 1px solid rgba($brand-green,0.15);
            .header-shadow {
                background: rgba($brand-green,0.10);
                border-bottom: 1px solid rgba($brand-green,0.15);
            }
        }

        & + & {
            margin-left: 0.5em;
        }
    }
</style>