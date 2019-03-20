<template>
    <div class="dropdown-menu-component position-relative">
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>
        <div class="btn-group">
            <button :disabled="!!disabled" type="button" @click="toggleDropDown"
                    :class="btnClass"
                    class="btn border-right-0 z-0">
                <i class="fa fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu p-2 w-0 header-menu"
                 :class="{show : dropdownOpen}"
            >
                <div class="d-flex flex-column">
                    <slot>
                    </slot>
                </div>
            </div>
            <button :disabled="!!disabled" type="button" @click="toggleDropDown"
                    :class="btnClass"
                    class="btn z-0">
                <i v-if="icon" class="fa fa-fw" :class="icon"></i>
                <small v-if="smallText">{{ btnText }}</small>
                <span v-else>{{ btnText }}</span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DropdownMenu",

        props : [
            'disabled',
            'icon',
            'btnText',
            'btnClass',
            'smallText'
        ],

        data() {
            return {
                dropdownOpen : false,
            }
        },

        methods : {
            toggleDropDown() {

                this.dropdownOpen = ! this.dropdownOpen;
            }
        }
    }
</script>

<style lang="scss">

</style>
