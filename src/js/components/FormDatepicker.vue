<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '']">
        <label :for="name" v-if="label">{{ label }}</label>

        <date-picker
            @input="update"
            @keydown.enter="enter"
            :input-class="class_object"
            :placeholder="placeholder"
            :ref="name"
            format="yyyy-MM-dd"
            :typeable="true"
            rows="4"
            v-model="selected"
        ></date-picker>

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
    //import moment from 'moment-timezone';
    //import Rule from './Rule.class.js';
    import DatePicker from 'vuejs-datepicker';

    //window.Rule = Rule;

    export default {

        components : {
            DatePicker
        },

        watch : {
            value( val ) {
                this.selected = moment(val).format('DD MMM YYYY');
            }
        },

        props : {

            definition : {
                required : true,

                default() {
                    return {
                        type : 'text',
                        name : '',
                        label : null,
                        placeholder : null,
                        icon : 'fa-check',
                        required : false,
                        validate : null,
                        enter : null,
                        className : null,
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
                selected : moment(this.value).format('DD MMM YYYY'),
                help_message : '',
                validation : {
                    settings : [],
                    rules : [],
                    defaults : [
                        [ 'minLength', [2], 'Please enter a valid value' ]
                    ],
                },
            }
        },

        created() {
            this.populate_rules();

            this.$parent.controls[ this.name ] = this;
            this.$parent.controls_array.push(this);
        },

        methods : {

            reset() {
                //console.log('Resetting');
                $(this.$el).find(':input').val('');
                this.$emit('input',this.value);
            },

            focus() {
                this.$el.querySelector('textarea').focus();
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

            update(selected) {
                let value = moment(selected).format('YYYY-MM-DD');

                return Bus.$emit('UpdateFormControl', { key : this.name, value });
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
        },

    }
</script>

<style lang="scss">

</style>