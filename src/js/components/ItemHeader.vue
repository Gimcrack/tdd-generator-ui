<template>
    <div class="btn-group">
        <button @mouseover.prevent="$emit('checkToggle')" @mousedown="$emit('toggle')" class="btn btn-xs" :class="btnClass">
            <small><i style="cursor:pointer; font-size:1.5em; line-height:1" class="fa fa-fw"
                      :class="[toggled ? ['fa-check-square-o','text-success'] : 'fa-square-o']">
            </i></small>
        </button>
        <button :id="`btnGroupDrop${id}`"
                class="btn btn-xs btn-row-menu border-right-0"
                :class="btnClass"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
        >
            <i class="fa fa-ellipsis-v"></i>
        </button>
        <div class="dropdown-menu" :aria-labelledby="`btnGroupDrop${id}`">
            <dropdown-item :show="toggles.view" :busy="busy" @clicked="$emit('view')" icon="fa-info">
                Inspect
            </dropdown-item>
            <dropdown-item :show="toggles.update" :busy="busy" @clicked="$emit('update')" icon="fa-edit">
                Edit
            </dropdown-item>

            <slot></slot>

            <dropdown-item :show="toggles.delete" :busy="busy" @clicked="$emit('destroy')" icon="fa-times">
                Delete
            </dropdown-item>
        </div>

        <a target="_blank"
           :href="externalUrl"
           v-if="toggles.view_external"
           rel="noreferrer"
           class="btn btn-xs text-monospace j-r letter-spacing-wide"
           :class="btnClass"
        >
            {{ id }}<i class="fa fa-fw fa-external-link ml-1"></i>
        </a>
        <button v-else style="min-width: 30px;" @click="$emit('toggle')" class="btn btn-xs text-monospace j-r" :class="btnClass">
            {{ id }}
        </button>
    </div>
</template>

<script>
    export default {

        props : {
            id : {
                required : true
            },

            busy : {
                default : false
            },

            toggled : {
                default : false,
            },

            toggles : {
                default() {
                    return {
                        view : true,
                        edit : true,
                        delete : true,
                        view_external : false
                    }
                }
            },

            externalUrl : {
                default : null
            },

        },

        data() {
            return {}
        },

        computed : {
            btnClass() {
                return [ this.toggled ? 'btn-outline-success' : 'btn-outline-primary'];
            }
        }
    }
</script>

<style lang="scss">

</style>