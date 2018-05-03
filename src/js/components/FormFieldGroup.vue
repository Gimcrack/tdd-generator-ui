<template>
    <div class="field-group">
        <div class="field-group-header">
            <span class="heading">{{group.name}}</span><br/>
            <small v-show="group.help">
                <em>{{group.help}}</em>
            </small>
        </div>
        <div v-if="group.fields.length" class="field-group-fields">
            <form-control
                v-for="def,key in group.fields"
                v-if=" ! editing || ! def.uneditable"
                :key="key"
                :definition="def"
                :value="form[def.name]"
                :errors="errors"
            ></form-control>
        </div>
    </div>
</template>

<script>
    export default {

        props : [
            'group',
            'errors',
            'form',
            'editing'
        ],

        data() {
            return {
                controls : {},
                controls_array : []
            }
        },

        created() {
            this.$parent.form_field_groups[this.group.name] = this;
        },

        methods : {

        }
    }
</script>

<style lang="scss">
    .field-group {
        margin-top: 3em;
        padding: 1.5em;

        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        display: flex;

        border-radius: 6px;

        .field-group-header {
            flex: 1;
            .heading {
                font-size: 20px;
            }
        }

        .field-group-fields {
            flex: 2;

            .form-control {
                width: 100%;
            }
        }
    }
</style>
