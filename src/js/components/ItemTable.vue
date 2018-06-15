<template>
    <transition name="bounce">
        <tbody v-if="show" ref="row" :class="{sticky, toggled}">
        <tr>
            <td class="position-relative">
                <i v-if="page.toggles.do_with_selected" @mouseover.prevent="checkToggle" @mousedown="toggle" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw"
                   :class="[toggled ? ['fa-check-square-o','text-success'] : 'fa-square-o']">
                </i>
            </td>
            <slot name="pre"></slot>
            <td class="relative">
                <div class="btn-group">
                    <button :id="`btnGroupDrop${id}`" class="btn btn-xs btn-outline-primary btn-row-menu border-right-0" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu" :aria-labelledby="`btnGroupDrop${id}`">
                        <a href="#" v-if="toggles.info" @click.prevent.stop="$emit('view')" :disabled="busy" class="dropdown-item" :class="{disabled : busy}">
                            <i class="fa fa-fw fa-info"></i> Inspect
                        </a>
                        <a href="#" v-if="toggles.update" @click.prevent.stop="$emit('update')" :disabled="busy" class="dropdown-item" :class="{disabled : busy}">
                            <i class="fa fa-fw fa-edit" :class="{'fa-spin' : updating}"></i> Edit
                        </a>
                        <slot name="menu"></slot>
                        <a href="#" v-if="toggles.delete" @click.prevent.stop="$emit('destroy')" :disabled="busy" class="dropdown-item" :class="{disabled : busy}">
                            <i class="fa fa-fw fa-times" :class="{'fa-spin' : deleting}"></i> Delete
                        </a>
                    </div>
                    <a target="_blank" :href="externalUrl" v-if="toggles.view_external" rel="noreferrer"
                            class="btn btn-outline-primary btn-xs text-monospace j-r letter-spacing-wide"
                    >
                        {{ id }}<i class="fa fa-fw fa-external-link ml-1"></i>
                    </a>
                    <button v-else style="min-width: 30px;" @click="toggle" class="btn btn-outline-primary btn-xs text-monospace j-r">
                        {{ id }}
                    </button>
                </div>
            </td>
            <slot></slot>
        </tr>
        <tr v-if="$slots['row2']">
            <td></td>
            <td colspan="100">
                <slot name="row2"></slot>
            </td>
        </tr>
    </tbody>
    </transition>
</template>

<script>
    export default {

        mounted() {
            this.$parent.$item = this;

            Bus.$on('ShowChecked', (val) => {
                this.show_checked = val;
                this.show = ( ! this.toggled || this.show_checked || this.toggles.always_show_checked );
            });

        },

        props : {
            id : {
                required : true
            },
            updating : {
                default : false,
            },
            deleting : {
                default : false
            },
            sticky : {
                default : false
            },
            toggles: {
                default() {
                    return {
                        info : true,
                        update : true,
                        delete : true,
                        always_show_checked : false
                    }
                }
            },
            externalUrl : {
                default : null
            }
        },

        data() {
            return {
                toggled : false,
                show_checked : false,
                show : true,
                page : this.$parent.$parent.$parent
            }
        },

        computed : {
            busy() {
                return this.updating || this.deleting;
            },
        },

        methods: {
            toggle() {
                this.toggled = ! this.toggled;

                sleep(50).then(() => {
                    $('tr.toggled.top').removeClass('top');
                    $('tr.toggled.bottom').removeClass('bottom');

                    $('tr.toggled').first().addClass('top');
                    $('tr.toggled').last().addClass('bottom');

                    this.show = ( ! this.toggled || this.show_checked || this.toggles.always_show_checked );
                });

                this.$emit('ToggledHasChanged');
            },

            checkToggle() {
                if ( window.mouseDown ) {
                    this.toggle();
                }
            }
        }
    }
</script>

<style lang="scss">
    .slide-fade-enter-active {
        transition: all .3s ease;
    }
    .slide-fade-leave-active {
        transition: all 3.8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-to
        /* .slide-fade-leave-active below version 2.1.8 */ {
        transform: translateX(10px);
        opacity: 0;
    }

    .bounce-enter-active {
        animation: bounce-in .2s;
    }
    .bounce-leave-active {
        animation: bounce-in .2s reverse;
    }
    @keyframes bounce-in {
        0% {
            transform: scaleY(0);
        }
        50% {
            transform: scaleY(1.2);
        }
        100% {
            transform: scaleY(1);
        }
    }
    /*
    .btn-row-menu {
        position: absolute;
        height:76%;
        width: 16px;
        top: 12%;
        left: -18px;
        padding:0;
    }
    */

</style>
