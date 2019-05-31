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

        watch : {
            conditionsMet() {
                this.init();
            }
        },

        data() {
            return {
                controls : {},
                controls_array : [],
                delayLapsed : false
            }
        },

        mounted() {
            this.$parent.form_field_groups[this.group.name] = this;

            this.init();
        },

        computed : {
            show() {
                return this.delayLapsed && this.conditionsMet;
            }
        },

        methods : {
            init() {
                //console.log('initing');
                this.delayLapsed = false;

                let delay = (this.group.order || 0) * 400;

                sleep(delay).then( () => {
                    this.delayLapsed = true;
                } )
            },

            componentType(def) {
                switch(def.type) {
                    case 'select':
                        return 'formSelect';

                    case 'textarea' :
                        return 'formTextarea';

                    case 'wysiwyg' :
                        return 'formWysiwyg';

                    case 'date' :
                        return 'formDatepicker';

                    case 'button' :
                        return 'formButton';

                    case 'image' :
                        return 'formImage';

                    case 'html' :
                        return 'formHtml';

                    default :
                        return 'formControl';
                }
            },

            showField(def) {
                //console.log('conditions',def.condition);

                if ( ! def.condition ) {
                    return ( ! this.editing ||
                        ! def.uneditable )
                }

                for ( let prop in def.condition ) {
                    if ( ! def.condition[prop] )
                        continue;

                    else {
                        // determine if it's an inverse condition
                        if ( def.condition[prop].operator === 'not' ) {
                            return def.condition[prop].value !== this.form[prop];
                        }

                        if ( this.form[prop] !== def.condition[prop] ) {
                            return false;
                        }
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
