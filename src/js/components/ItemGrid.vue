<template>
    <transition name="bounce">
        <div class="item-grid position-relative card card-shadow mt-4 mb-4"
             v-if="show" ref="row" :class="[{sticky, toggled}, itemBorder]"
        >
            <div class="card-body p-2">
                <div :class="itemBorder" class="item-grid__controls position-absolute card d-flex align-items-start border-bottom-0">
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

                <div class="d-flex flex-column flex-fill pt-1">
                    <slot name="row2"></slot>
                </div>

                <slot name="pre"></slot>

                <transition name="bounce">
                    <div v-if="show_meta"
                         class="d-flex mt-3 item-grid__meta align-items-center justify-content-between flex-wrap bg-white-transparent text-dark rounded"
                    >
                        <div class="m-2" v-for="(cell,i) in meta" :key="i">
                            <item-meta
                               :cell-data="cell"
                               :model="model"
                               :show-heading="true"
                               :column="$parent.columns[i+1]"
                            ></item-meta>
                        </div>

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
    .item-grid {

        .btn-customer-responded-last {
            position:absolute;
            top: -42px;
            left: 166px
        }

        .bg-white-transparent {
            background: rgba(255,255,255,0.9);
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

        .btn-show-meta {
            transition: all 0.3s ease-in 0.2s;

            &.active {
                transform: rotate(180deg);
            }
        }




        .item-grid__controls {
            width: auto;
            padding: 0.5rem 0.5rem 0;
            top: -25px;
            left: -1px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            .right-border-cover {
                position: absolute;
                right:-2px;
                width:2px;
                background: white;
                height: 10px;
                bottom:0;
            }
        }

        .item-grid__meta {

        }

        .description {
            max-width: unset;
        }
    }

</style>
