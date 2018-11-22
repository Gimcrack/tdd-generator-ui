<template>
    <transition name="bounce">
        <div class="item-cards position-relative card card-shadow my-4 mx-2"
             v-if="show" ref="row" :class="[{sticky, toggled}, itemBorder]"
        >
            <div class="card-body">
                <div :class="itemBorder" class="item-cards__controls position-absolute card d-flex align-items-start border-bottom-0">
                    <div class="right-border-cover"></div>
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
                </div>

                <div class="d-flex flex-column flex-fill">
                    <slot name="row2"></slot>
                </div>

                <slot name="pre"></slot>

                <transition name="bounce">
                    <div v-if="show_meta"
                         class="d-flex mt-2 item-cards__meta align-items-center justify-content-center flex-wrap"
                    >
                        <h3>
                            {{ model.name }}
                        </h3>

                    </div>
                </transition>

                <div v-if="$slots['row2']" class="d-flex justify-content-center mt-2">
                    <button @click="show_meta = ! show_meta"
                            class="btn-xs btn btn-show-meta"
                            :class="show_meta ? ['btn-primary','active'] : ['btn-link']"
                    >
                        <i class="fa fa-caret-down"></i>
                    </button>
                </div>

            </div>

        </div>
    </transition>
</template>

<script>
    export default {

        mounted() {
            this.$parent.$item = this;

            Bus.$on('ShowChecked',this.updateShowStatus);

            Bus.$on('ShowMeta',() => {
                this.show_meta = true;
            });

            Bus.$on('HideMeta',() => {
                this.show_meta = false;
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
                    return [];
                }
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
                page : this.$parent.$parent.$parent,
                show_meta : ! this.$slots['row2']
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
    .item-cards {

        border-color: white;
        color: white;

        .card-body {
            min-width: 130px;
        }

        &.bg-danger {
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

        &.bg-success {
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
