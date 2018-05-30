<template>
    <div class="field-group row m-2">
        <div class="col-lg-3 field-group-header mb-4">
            <span class="heading">{{group.name}}</span><br/>
            <small v-show="group.help">
                <em>{{group.help}}</em>
            </small>
        </div>
        <div v-if="group.fields.length" class="col-lg-9 field-group-fields">
            <component
                :is="componentType(def)"
                v-for="def,key in group.fields"
                v-if=" ! editing || ! def.uneditable"
                :key="key"
                :definition="def"
                :value="form[def.name]"
                :errors="errors"
            ></component>
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
            componentType(def) {
                switch(def.type) {
                    case 'select':
                        return 'formSelect';

                    case 'textarea' :
                        return 'formTextarea';

                    default :
                        return 'formControl';
                }
            }
        }
    }
</script>

<style lang="scss">
    .field-group {
        margin-top: 3em;
        padding: 1.5em;

        box-shadow: 0 5px 15px rgba(0,0,0,0.1);

        border-radius: 6px;

        .field-group-header {
            .heading {
                font-size: 20px;
            }
        }

        .field-group-fields {

            .form-control {
                width: 100%;
            }
        }
    }
</style>
