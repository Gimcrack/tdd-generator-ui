<template>
    <div>
        <div v-if="show_popper" @click="show_popper=false" class="modal-wrapper"></div>
        <transition name="bounce">
            <popper
                :show-popper.sync="show_popper"
                placement="bottom"
            >
                <div :style="cardStyle" class="item-cards btn position-relative card-shadow d-flex white-space-normal"
                     v-if="show" ref="row" :class="[{sticky, toggled}, itemBorder]"
                >

                    <div @click="togglePopper" class="card-body justify-content-center d-flex">
                        <slot name="pre"></slot>

                        <transition name="bounce">
                            <div v-if="show_meta"
                                 class="d-flex item-cards__meta align-items-center justify-content-center flex-wrap"
                            >
                                <slot name="cardBody">
                                    <i v-if="icon" class="fa fa-fw" :class="icon"></i>
                                    {{ model.nickname || model.name }}
                                </slot>
                            </div>
                        </transition>

                        <div v-if="$slots['row2']" class="d-flex justify-content-center mt-2">
                            <button type="button" @click="show_meta = ! show_meta"
                                    class="btn-xs btn btn-show-meta"
                                    :class="show_meta ? ['btn-primary','active'] : ['btn-link']"
                            >
                                <i class="fa fa-caret-down"></i>
                            </button>
                        </div>

                    </div>

                </div>

                <div slot="content" class="pb-2">
                    <slot name="popper"></slot>
                </div>
            </popper>
        </transition>
    </div>
</template>

<script>

    import Popper from 'vue-popper-component';

    export default {

        components : {
            Popper
        },

        mounted() {
            this.$parent.$item = this;

            Bus.$on('ShowChecked',this.updateShowStatus);

            Bus.$on('ShowMeta',() => {
                this.show_meta = true;
            });

            Bus.$on('HideMeta',() => {
                this.show_meta = false;
            });

            Bus.$on('ChangeZoom', (e) => {
                this.zoom = e.zoom;
            });

            Bus.$on('ClosePopper', (e) => {
                if ( e.id === this.id )
                    this.show_popper = false;
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
                        checklist : false
                    }
                }
            },
            externalUrl : {
                default : null
            },
            itemBorder : {
                default() {
                    return ['bg-white'];
                }
            },
            overrideCardStyle : {
                default() {
                    return {}
                }
            },
            meta : {
                default() {
                    return [];
                }
            },
            icon : {
                default : false
            }
        },

        data() {
            return {
                toggled : false,
                show : true,
                page : this.$parent.$parent.$parent,
                show_meta : ! this.$slots['row2'],
                zoom : 100,
                show_popper : false
            }
        },

        computed : {
            busy() {
                return this.updating || this.deleting;
            },

            model() {
                return this.$parent.model;
            },

            cardStyle() {
                return Object.assign({}, {
                    //transform: 'scale(' + this.zoom/100 + ',' + this.zoom/100 + ')'
                    width : (55+this.zoom) + 'px',
                    height: (15+this.zoom) + 'px',
                    fontSize : (1.25*this.zoom/100) + 'rem',
                    margin: 0.1 + ( 0.2 * this.zoom/100 ) + 'rem',
                }, this.overrideCardStyle);
            },
        },

        methods: {

            togglePopper() {
                this.show_popper = ! this.show_popper;
            },

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
    .modal-wrapper {
        position:fixed;
        top:0;
        left:0;
        height: 100vh;
        width: 100vw;
        background: rgba(0,0,0,0.3);
        z-index: 5;
    }

    .item-cards {

        transition: all 0.3s linear;

        border-color: white;
        color: white;

        .card-body {
            padding: 0;
        }

        &.btn-danger {
            .right-border-cover {
                background: #c63100 !important;
            }

            .btn-group {

                .btn {
                    border-color:white;
                    color: white;
                }
            }
        }

        &.btn-success {
            .right-border-cover {
                background: #00c631 !important;
            }

            .btn-group {

                .btn {
                    border-color:white;
                    color: white;
                }
            }
        }

        .btn-customer-responded-last {
            position:absolute;
            top: -50px;
            left: 158px
        }

        .btn-show-meta {
            transition: all 0.3s ease-in 0.2s;

            &.active {
                transform: rotate(180deg);
            }
        }



        .item-cards__controls {
            width: auto;
            padding: 0.3rem 0.3rem 0;
            top: -15px;
            left: 0px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            .right-border-cover {
                position: absolute;
                right:-5px;
                width:5px;
                height: 17px;
                bottom:0;
            }
        }

        .item-cards__meta {

        }

        .description {
            max-width: unset;
        }
    }

</style>
