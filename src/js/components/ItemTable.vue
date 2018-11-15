<template>
    <transition name="bounce">
        <tbody v-if="show" ref="row" :class="{sticky, toggled}">
        <tr>
            <slot name="pre"></slot>
            <td class="relative">
                <item-header
                    :id="id"
                    :busy="busy"
                    :toggles="toggles"
                    :toggled="toggled"
                    :external-url="externalUrl"
                    @view="$emit('view')"
                    @update="$emit('update')"
                    @destroy="$emit('destroy')"
                    @toggle="toggle"
                    @checkToggle="checkToggle"
                >
                    <slot name="menu"></slot>
                </item-header>
            </td>
            <td v-for="cell,i in meta">
                <item-meta :cell-data="cell" :model="model" :column="$parent.columns[i+1]"></item-meta>
            </td>
            <slot></slot>
        </tr>
        <tr v-if="$slots['row2']">
            <td colspan="100" class="p-3 position-relative">
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

            Bus.$on('ShowChecked',this.updateShowStatus);
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
                        checklist : false
                    }
                }
            },
            externalUrl : {
                default : null
            },
            meta : {
                default() {
                    return [];
                }
            },
        },

        data() {
            return {
                toggled : false,
                show : true,
                page : this.$parent.$parent.$parent
            }
        },

        computed : {
            busy() {
                return this.updating || this.deleting;
            },

            model() {
                return this.$parent.model;
            }
        },

        methods: {

            updateShowStatus() {
                this.show = ( ! this.toggled || this.page.showChecked || ! this.page.toggles.checklist );
            },

            toggle() {
                this.toggled = ! this.toggled;

                sleep(125).then(() => {
                    $('tr.toggled.top').removeClass('top');
                    $('tr.toggled.bottom').removeClass('bottom');

                    $('tr.toggled').first().addClass('top');
                    $('tr.toggled').last().addClass('bottom');

                    this.updateShowStatus();
                });

                this.$emit('ToggledHasChanged');
            },

            checkToggle() {
                if ( window.mouseDown && ! this.page.toggles.checklist ) {
                    this.toggle();
                }
            }
        }
    }
</script>

<style lang="scss">
    tbody.ticket {
        .btn-customer-responded-last {
            position:absolute;
            top: -59px;
            left: 153px
        }
    }

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
