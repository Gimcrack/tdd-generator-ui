<template>
    <tr ref="row" :class="{sticky, toggled}">
        <td>
            <i @mouseover.prevent="checkToggle" @mousedown="toggle" style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw" :class="[toggled ? ['fa-check-square-o','text-success'] : 'fa-square-o']"></i>
        </td>
        <slot name="pre"></slot>
        <td class="relative">
            <div class="btn-group">
                <button v-if="toggles.info" @click.prevent.stop="$emit('view')" :disabled="busy" class="btn btn-info btn-xs btn-outline" :class="{disabled : busy}">
                    <i class="fa fa-fw fa-info"></i>
                </button>
                <button v-if="toggles.update" @click.prevent.stop="$emit('update')" :disabled="busy" class="btn btn-success btn-xs btn-outline" :class="{disabled : busy}">
                    <i class="fa fa-fw fa-edit" :class="{'fa-spin' : updating}"></i>
                </button>
                <slot name="menu"></slot>
                <button v-if="toggles.delete" @click.prevent.stop="$emit('destroy')" :disabled="busy" class="btn btn-danger btn-xs btn-outline" :class="{disabled : busy}">
                    <i class="fa fa-fw fa-times" :class="{'fa-spin' : deleting}"></i>
                </button>
                <button @click.prevent="" style="min-width: 30px;" class="btn btn-xs btn-default btn-outline mono j-r">
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
