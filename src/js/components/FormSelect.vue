<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '']">
        <label :for="name" v-if="label">{{ label }}</label>

        <vue-multiselect
            @input="update"
            :value="params.value"
            :multiple="params.multiple"
            :options="params.options"
            :label="params.label"
            :track-by="params.trackBy"
            :placeholder="placeholder"
            :loading="loading"
            :searchable="params.searchable"
            :clearOnSelect="params.clearOnSelect"
            :hideSelected="params.hideSelected"
            :allowEmpty="params.allowEmpty"
            :resetAfter="params.resetAfter"
            :closeOnselect="params.closeOnselect"
            :taggable="params.taggable"
            :max="params.max"
            :optionsLimit="params.optionsLimit"
            :groupValues="params.groupValues"
            :groupLabel="params.groupLabel"
        ></vue-multiselect>

        <div class="icon is-small">
            <i :class="['fa', (show_invalid) ? 'fa-warning' : icon ]"></i>
        </div>

        <div v-if="show_invalid && !! invalid_rule.help" class="invalid-feedback">
            {{ invalid_rule.help }}
        </div>

        <div v-if="!! errors[name]" class="invalid-feedback">
            {{ errors[name][0] }}
        </div>
    </div>
</template>

<script>
    import VueMultiselect from 'vue-multiselect/src/Multiselect.vue';
    import Rule from './Rule.class.js';
    window.Rule = Rule;

    export default {

        components : {
            VueMultiselect
        },

        watch : {
            value() {
                this.updateSelected();
            }
        },

        props : {

            definition : {
                required : true,

                default() {
                    return {
                        name : '',
                        label : null,
                        placeholder : null,
                        icon : 'fa-check',
                        required : false,
                        validate : null,
                        enter : null,
                        className : null,
                        select : {}
                    }
                }
            },

            value : {
                required : true,
            },

            errors : {
                required : false,
                default : () => {}
            }

        },

        data() {
            return {
                help_message : '',
                validation : {
                    settings : [],
                    rules : [],
                    defaults : [],
                },
                params : Object.assign( {}, {
                    source : null,
                    options : [],
                    value : null,
                    multiple : false,
                    trackBy : 'id',
                    label : 'name',
                    searchable : true,
                    clearOnSelect : true,
                    hideSelected : false,
                    allowEmpty : true,
                    resetAfter : false,
                    closeOnselect : false,
                    taggable : false,
                    max : null,
                    optionsLimit : 25,
                    groupValues : null,
                    groupLabel : null,
                }, this.definition.select)
            }
        },

        created() {
            this.populate_rules();

            this.$parent.controls[ this.name ] = this;
            this.$parent.controls_array.push(this);

            if ( this.type === 'select')
                this.initSelect();
        },

        methods : {

            reset() {
                console.log('Resetting');
                $(this.$el).find(':input').val('');
                this.$emit('input',this.value);
            },

            focus() {
                if ( this.type !== 'textarea' ) {
                    this.$el.querySelector('input').focus();
                }
                else
                {
                    this.$el.querySelector('textarea').focus();
                }
            },

            check_validation_settings() {
                if ( !! this.validate )
                {
                    this.validation.settings = this.validate;
                }

                if ( ! this.validation.settings.length )
                {
                    this.validation.settings = this.validation.defaults;
                }
            },

            populate_rules() {

                this.check_validation_settings();

                if ( ! this.should_validate ) return false;

                this.validation.rules = [];

                this.validation.settings.forEach( args => {
                    let r = new Rule( ...args );

                    // needed for comparison matches
                    r.siblings = this.$parent.controls;

                    this.validation.rules.push( r );
                });

                this.$forceUpdate();
            },

            update($event) {
                let value;

                if ( ! $event )
                    value = null;
                else if ( $event.length )
                    value = $event.map(o => o.id);
                else
                    value = $event.id;

                Bus.$emit('UpdateFormControl', { key : this.name, value } );
            },

            initSelect() {
                // options are specified locally
                if ( typeof this.definition.select.source === "object" ) {
                    this.params.options = this.definition.select.source;
                    this.params.internalSearch = true;
                    return;
                }

                this.loading = true;

                window.Api.get(this.definition.select.source)
                    .then( (response) => {
                        this.params.options = response.data;
                        this.params.internalSearch = false;
                        this.updateSelected();
                        this.loading = false;
                    } );
            },

            updateSelected() {
                return ( this.params.multiple ) ?
                    this.updateMultipleSelected() :
                    this.updateSingleSelected();
            },

            updateMultipleSelected() {
                this.params.value = _.map( _.castArray(this.value), (id) => {
                    return _.find(this.params.options, { id : id });
                });
            },

            updateSingleSelected() {
                this.params.value = _.find( this.params.options, { id : this.value } );
            },
        },

        computed : {

            label() {
                return this.definition.label || this.definition.name.$ucfirst();
            },

            placeholder() {
                return this.definition.placeholder;
            },

            type() {
                return this.definition.type;
            },

            icon() {
                return this.definition.icon || 'fa-check';
            },

            required() {
                return this.definition.required;
            },

            validate() {
                return this.definition.validate;
            },

            enter() {
                return this.definition.enter;
            },

            name() {
                return this.definition.name;
            },

            className() {
                return this.definition.className;
            },

            class_object() {
                return [
                    this.className,
                    {
                        'form-control' : true,
                        'has-success' : this.valid,
                        'is-invalid' : this.show_invalid
                    }
                ];
            },

            should_validate() {
                return this.required && this.validation.settings.length;
            },

            valid() {
                if ( ! this.should_validate ) return true;

                let invalid = this.validation.rules.some( rule => {
                    return ! rule.validate(this.value);
                });

                return ! invalid;
            },

            show_invalid() {
                return !! this.invalid_rule.show_message ||
                    !! this.errors[this.name];
            },

            invalid_rule() {
                if ( this.valid ) return new Rule();

                return _(this.validation.rules)
                    .find( rule => { return ! rule.valid } )
            },

            selected_values() {

            }
        },

    }
</script>

<style lang="scss">
    .form-group {
        .multiselect {
            color : gray;
        }

        .multiselect__single {
            text-indent: 20px;
        }

        .multiselect__tags-wrap {
            margin-left: 20px;
        }
    }
</style>