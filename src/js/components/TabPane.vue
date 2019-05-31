<template>
    <div
        class="tab-pane"
        :class="{ active }"
    >
        <div v-if="tab.pane" >
            <component
                    ref="component"
                    :is="tab.pane.component"
                    v-bind="tab.pane.options"
            ></component>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        props : {
            tab : {
                required : true
            },

            activeTab : {
                default() {
                    return {}
                }
            },
        },

        data() {
            return {}
        },

        computed : {
            active() {
                return this.tab.id === this.activeTab.id;
            }
        }
    }
</script>

<style lang="scss">

</style>