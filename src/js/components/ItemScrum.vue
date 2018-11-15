<template>
    <transition name="bounce">
        <div class="item-scrum position-relative card card-shadow mt-3 mb-3 w-100"
             v-if="show" ref="row" :class="[{sticky, toggled}, itemBorder]"
        >
            <div class="card-body p-2 pt-3">
                <div :class="itemBorder" class="item-scrum__controls position-absolute card d-flex align-items-start border-bottom-0">
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

                <div class="d-flex flex-column flex-fill mb-2" :class="{expanded}">
                    <slot name="row2"></slot>
                </div>

                <div class="d-flex">
                    <!-- Priority -->
                    <div :class="priorityClass" class="badge priority-label mr-2">Priority</div>

                    <!-- Urgency -->
                    <div :class="urgencyClass" class="badge priority-label mr-2">Urgency</div>

                    <!-- Last Response -->
                    <div :class="lastResponseClass" class="badge priority-label mr-2">Response</div>
                </div>

                <slot name="pre"></slot>

                <transition name="bounce">
                    <div v-if="show_meta"
                         class="d-flex item-scrum__meta align-items-center justify-content-between flex-wrap"
                    >
                        <div class="m-2" v-for="cell,i in meta" :key="i">
                            <item-meta
                               :cell-data="cell"
                               :model="model"
                               :show-heading="true"
                               :column="$parent.columns[i+1]"
                            ></item-meta>
                        </div>

                    </div>
                </transition>

                <div v-if="$slots['row2']" class="d-flex justify-content-center ">
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
                page : this.$parent.$parent.$parent.$parent,
                show_meta : ! this.$slots['row2']
            }
        },

        computed : {
            busy() {
                return this.updating || this.deleting;
            },

            model() {
                return this.$parent.model;
            },

            expanded() {
                return this.$parent.$parent.expanded;
            },

            priorityClass() {
                switch(this.model.priority) {
                    case '3 High' :
                        return 'badge-danger';

                    case '2 Medium' :
                        return 'badge-warning';
                }

                return 'badge-success';
            },

            urgencyClass() {
                switch( this.model.urgency ) {
                    case 'Immediate' :
                    case 'Today' :
                    case 'Tomorrow' :
                    case 'This Week' :
                        return 'badge-danger';

                    case 'Next Week' :
                    case 'Two Weeks' :
                    case 'This Month' :
                    case 'Next Month' :
                        return 'badge-warning';

                }

                // Not Urgent
                // Other
                // This Year
                return 'badge-success';
            },

            lastResponseClass() {

                let lastResponse = this.model.days_since_last_response;

                if (lastResponse === null) return 'badge-danger';
                if (lastResponse < 7) return 'badge-success';
                if (lastResponse < 14 ) return 'badge-warning';
                return 'badge-danger';
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
    .item-scrum {

        .btn-customer-responded-last {
            position:absolute;
            top: -42px;
            left: 116px;
            font-size: 11px;
        }

        h3 {
            font-size: 0.8rem;
        }

        .priority-label {
            padding: 3px;
            font-size: 10px;
            //width: 40px;
        }

        .btn-show-meta {
            transition: all 0.3s ease-in 0.2s;

            &.active {
                transform: rotate(180deg);
            }
        }

        .btn-group {

            .btn {
                padding: 2px;
                &.btn-xs {
                    font-size: 0.7rem;
                    line-height: 1.2;
                }
            }
        }

        .item-scrum__controls {
            width: auto;
            padding: 0.1rem 0.1rem 0;
            top: -15px;
            left: -1px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            .right-border-cover {
                position: absolute;
                right:-2px;
                width:2px;
                background: white;
                height: 8px;
                bottom:0;
            }
        }

        .item-scrum__meta {

        }

        .description {
            display: none;
            transition: all 0.2s linear;
        }

        .expanded .description {
            display: inherit;
            font-size: 12px;
        }

    }

</style>
