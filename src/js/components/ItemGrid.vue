<template>
    <transition name="bounce">
        <div class="item-grid position-relative card card-shadow mt-4 mb-4"
             v-if="show" ref="row" :class="[{sticky, toggled}, itemBorder]"
        >
            <div class="card-body">
                <div :class="itemBorder" class="item-grid__controls position-absolute card d-flex align-items-start border-bottom-0">
                    <div class="right-border-cover"></div>
                    <div class="btn-group">
                        <button @mouseover.prevent="checkToggle" @mousedown="toggle" class="btn btn-xs btn-outline-primary">
                            <small><i v-if="page.toggles.do_with_selected" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw"
                                      :class="[toggled ? ['fa-check-square-o','text-success'] : 'fa-square-o']">
                            </i></small>
                        </button>
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
                        >{{ id }}<i class="fa fa-fw fa-external-link ml-1"></i></a>
                        <button v-else style="min-width: 30px;" @click="toggle" class="btn btn-outline-primary btn-xs text-monospace j-r">
                            {{ id }}
                        </button>
                    </div>
                </div>

                <div class="d-flex flex-column flex-fill">
                    <slot name="row2"></slot>
                </div>

                <slot name="pre"></slot>

                <transition name="bounce">
                    <div v-if="show_meta"
                         class="d-flex mt-2 item-grid__meta align-items-center justify-content-between flex-wrap"
                    >
                        <div v-if="gridMeta.length" class="d-flex flex-column p-2"
                             v-for="meta in gridMeta" :key="meta.key.title || meta.key"
                        >
                            <span class="border-bottom border-light text-bold text-small">
                                {{ meta.key.title ? meta.key.title : meta.key.$title_case() }}
                            </span>
                            <span v-html="meta.value"></span>
                        </div>
                    </div>
                </transition>

                <div class="d-flex justify-content-center mt-2">
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


            Bus.$on('ShowChecked', (val) => {
                this.show_checked = val;
                this.show = ( ! this.toggled || this.show_checked || this.toggles.always_show_checked );
            });

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
                        always_show_checked : false
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
            }
        },

        data() {
            return {
                toggled : false,
                show_checked : false,
                show : true,
                page : this.$parent.$parent.$parent,
                show_meta : ! this.$slots['row2']
            }
        },

        computed : {
            busy() {
                return this.updating || this.deleting;
            },

            gridMeta() {
                if ( ! this.$slots.default ) return [];

                return this.$slots.default
                    .filter(o => o.tag === 'td')
                    .map( (o,i) => {
                        let value,classList;

                        if ( o.children && o.children[0] ) {
                            value = ( o.children[0].children ) ?
                                 o.children[0].children[0].text :
                                o.children[0].text;

                            if ( ! value && o.children[0].data && o.children[0].data.domProps )
                                value = o.children[0].data.domProps.textContent ||
                                        o.children[0].data.domProps.innerHTML;
                        }

                        if (o.data && o.data.domProps)
                            value = o.data.domProps.innerHTML;

                        return {
                            key : this.$parent.columns[i+1],
                            value : value.replace(/<br\/>/gi,' | '),
                        };
                    } );
            }
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
    .item-grid {
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
