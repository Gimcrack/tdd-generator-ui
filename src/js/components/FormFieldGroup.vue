<template>
    <div v-if="show" class="field-group row m-2 mt-3">
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
                v-if="showField(def)"
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

        props : {
            group : {},
            errors : {},
            form : {},
            editing : {},
            conditionsMet : {
                default : true
            }
        },

        data() {
            return {
                controls : {},
                controls_array : [],
                delayLapsed : false
            }
        },

        created() {
            this.$parent.form_field_groups[this.group.name] = this;

            let delay = (this.group.order || 0) * 450;

            sleep(delay).then( () => {
                this.delayLapsed = true;
            } )
        },

        computed : {
            show() {
                return this.delayLapsed && this.conditionsMet;
            }
        },

        methods : {
            componentType(def) {
                switch(def.type) {
                    case 'select':
                        return 'formSelect';

                    case 'textarea' :
                        return 'formTextarea';

                    case 'date' :
                        return 'formDatepicker';

                    case 'button' :
                        return 'formButton';

                    default :
                        return 'formControl';
                }
            },

            showField(def) {
                if ( ! def.condition ) {
                    return ( ! this.editing ||
                        ! def.uneditable )
                }

                for ( let prop in def.condition ) {
                    if ( this.form[prop] !== def.condition[prop] ) {
                        return false;
                    }
                }

                return ( ! this.editing ||
                    ! def.uneditable )
            },
        },
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
