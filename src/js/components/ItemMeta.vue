<template>
    <div :style="cellStyle" class="d-flex flex-column align-items-start justify-content-center" :class="cellClass">
        <span v-if="showHeading" class="border-bottom border-light text-bold text-small mb-1">
        {{ heading }}
        </span>

        <template v-if="cellData.badge && cellText && (typeof cellText === 'object')">
            <div class="d-flex flex-wrap" style="max-width:400px">
                <badge v-for="(val,key) in cellText" :key="key" :type="cellData.badge_class" class="mr-2 mb-2" :style="cellData.badge_style">
                    {{ val }}
                </badge>
            </div>
        </template>

        <template v-else-if="typeof cellData === 'string' && cellData.indexOf(':editable') > -1">
            <editable-text :endpoint="endpoint" :name="cellData.replace(':editable','')" :initial="cellText"></editable-text>
        </template>

        <template v-else-if="cellData.editable">
            <editable-text :endpoint="endpoint" :name="cellData.name" :initial="cellText"></editable-text>
        </template>

        <template v-else>
            <badge v-if="cellData.badge && cellText" :type="cellData.badge_class" :style="cellData.badge_style">
                {{ cellText }}
            </badge>
            <span v-else>
                <i @click="cellData.icon.btn" v-if="cellData.icon" class="fa mr-1" :class="cellData.icon.iconClass" :style="{ cursor : (cellData.icon.btn) ? 'pointer' : 'default'}"></i>
                <span v-html="cellText"></span>
            </span>
        </template>
    </div>
</template>

<script>
    export default {

        props : {
            cellData : {
                default() {
                    return {
                        key : null,
                        badge : false,
                        badge_class : null,
                        text : null,
                        icon : null,
                        style : {}
                    }
                }
            },

            model : {
                required : true
            },

            column : {
                required : true
            },

            showHeading : {
                default : false
            }
        },

        data() {
            return {}
        },

        computed : {
            endpoint() {
                return this.cellData.endpoint || `${this.$parent.$parent.item.endpoint}/${this.model.id}`;
            },

            cellText() {
                if ( this.cellData.text )
                    return this.cellData.text;

                if ( this.cellData.key )
                    return _.get(this.model,this.cellData.key);

                if ( typeof this.cellData === 'string' )
                    return _.get(this.model,this.cellData.replace(':editable',''));
            },

            heading() {
                return (this.column.title) ?
                    this.column.title :
                    this.column.$title_case();
            },

            cellStyle() {
                if ( this.cellData.style )
                    return this.cellData.style;

                return {}
            },

            cellClass() {
                if ( this.cellData.className )
                    return this.cellData.className;

                return {}
            },
        }
    }
</script>

<style lang="scss">

</style>
