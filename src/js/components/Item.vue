<template>
    <tr ref="row" :class="{sticky, toggled}">
        <td class="position-relative">


            <i v-if="$parent.$parent.toggles.do_with_selected" @mouseover.prevent="checkToggle" @mousedown="toggle" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw"
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
                <button style="min-width: 30px;" @click="toggle" class="btn btn-outline-primary btn-xs mono j-r">
                    {{ id }}
                </button>
            </div>
        </td>
        <slot></slot>
    </tr>
</template>

<script>
    export default {

        mounted() {
            this.$parent.$item = this;
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
                        delete : true
                    }
                }
            }
        },

        data() {
            return {
                toggled : false
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

                sleep(100).then(() => {
                    $('tr.toggled.top').removeClass('top');
                    $('tr.toggled.bottom').removeClass('bottom');

                    $('tr.toggled').first().addClass('top');
                    $('tr.toggled').last().addClass('bottom');
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
