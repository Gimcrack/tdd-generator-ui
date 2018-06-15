<template>
    <div class="d-flex flex-column align-items-start justify-content-center">
        <span v-if="showHeading" class="border-bottom border-light text-bold text-small mb-1">
        {{ heading }}
        </span>
        <badge v-if="cellData.badge" :type="cellData.badge_class" :text="cellText"></badge>
        <span v-html="cellText" v-else></span>
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
            cellText() {
                if ( this.cellData.text )
                    return this.cellData.text;

                if ( this.cellData.key )
                    return this.model[this.cellData.key];

                if ( typeof this.cellData === 'string' )
                    return this.model[this.cellData];
            },

            heading() {
                return (this.column.title) ?
                    this.column.title :
                    this.column.$title_case();
            }
        }
    }
</script>

<style lang="scss">

</style>