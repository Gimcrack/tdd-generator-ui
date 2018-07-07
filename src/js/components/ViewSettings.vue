<template>
    <div class="view-settings header-sort-button position-relative">
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>

        <button v-if="showReset" @click="reset" class="btn btn-xs btn-warning mr-2">
            <small><i class="fa fa-fw fa-times"></i> Reset View</small>
        </button>
        <button id="dropdown_view_settings" @click="toggleDropDown"
                :class="btnClass" class="btn btn-xs">
            <small><i class="fa fa-ellipsis-v"></i> Edit View</small>
        </button>
        <div class="dropdown-menu dropdown-menu-right p-2 header-menu"
             :class="{show : dropdownOpen}"
             aria-labelledby="dropdown_view_settings"
        >
            <strong class="mb-1">Hide Columns From This View</strong>
            <vue-multiselect
                    :options="options"
                    v-model="hidden"
                    placeholder="Select Columns To Hide"
                    @input="update"
                    :multiple="true"
                    :close-on-select="false"
                    select-label=""
                    deselect-label=""
                    :limit="3"
                    :searchable="true"
            >
            </vue-multiselect>
            <button v-if="showReset" @click="reset" class="btn btn-xs btn-warning mt-2">
                <small><i class="fa fa-fw fa-times"></i> Reset View</small>
            </button>
        </div>
    </div>
</template>

<script>

    export default {

        props : {
            hiddenColumns : {
                default() {
                    return []
                }
            },

            options : {
                default() {
                    return []
                }
            }
        },

        watch : {
            hiddenColumns() {
                this.hidden = this.hiddenColumns;
            }
        },

        data() {
            return {
                dropdownOpen : false,
                hidden : this.hiddenColumns
            }
        },

        computed : {
            btnClass() {
                let hidden = (this.hidden != null) ? this.hidden : [];

                switch(true) {
                    case hidden.length && this.dropdownOpen :
                        return ['btn-warning'];

                    case hidden.length && ! this.dropdownOpen :
                        return ['btn-outline-warning'];

                    case ! hidden.length && this.dropdownOpen :
                        return ['btn-primary'];

                    case ! hidden.length && ! this.dropdownOpen :
                        return ['btn-outline-primary'];
                }
            },

            showReset() {
                return this.hidden !== null && this.hidden.length > 0;
            }
        },

        methods : {
            toggleDropDown() {
                this.dropdownOpen = ! this.dropdownOpen;
            },

            update() {
                this.$emit('update', { hidden : this.hidden });
            },

            reset() {
                this.hidden = [];
                this.update();
            }
        }
    }
</script>