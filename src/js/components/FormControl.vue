<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '', 'tdd-generator-form-control']">
        <label :for="name" v-if="label && type !== 'hidden'">{{ label }}</label>

        <div class="d-flex position-relative">
            <input
                @keydown.enter.stop.prevent="enter"
                @input="update"
                :value="value"
                :class="class_object"
                :type="type"
                :placeholder="placeholder"
                :ref="name"
                :name="name"
                :id="name"
                :readonly="readonly"
                :min="definition.min"
                :max="definition.max"
            >

            <form-button
                class="ml-2"
                v-if="definition.btn && ! definition.btn.length"
                :definition="definition.btn"
            ></form-button>

            <form-button
                class="ml-2"
                v-if="definition.btn && definition.btn.length"
                v-for="(btn,idx) in definition.btn"
                :definition="btn"
                :key="idx"
            ></form-button>
        </div>

        <div v-if="type !== 'hidden'" class="icon is-small">
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
    //import Rule from './Rule.class.js';
    //window.Rule = Rule;

    export default {

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
                        readonly : null
                    }
                }
            },

            value : {
                required : true,
                default() {
                    return this.definition.value;
                }
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
                    defaults : [
                        [ 'minLength', [2], 'Please enter a valid value' ]
                    ],
                },
                updateTimeout : null
            }
        },

        created() {
            this.populate_rules();

            Store.controls[ this.name ] = this;

            this.$parent.controls[ this.name ] = this;
            this.$parent.controls_array.push(this);

            if ( !! this.value ) {
                Bus.$emit('UpdateFormControl', { key : this.name, value : this.value });
            }
        },

        methods : {

            reset() {
                //console.log('Resetting');
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

            doUpdate($event) {
                let value;

                if ( this.type !== 'select' ) {
                    if ( $event.target && $event.target.value )
                        value = $event.target.value;
                    else if ( $event.value )
                        value = $event.valuel;
                    else if ( typeof $event === 'object' && $event['type'] === "input")
                        value = "";
                    else
                        value = $event;

                    return Bus.$emit('UpdateFormControl', { key : this.name, value });
                }

                value = this.selectOptionsData.multiple ?
                    this.selectOptionsData.value.map( o => o.id ) :
                    this.selectOptionsData.value.id;

                Bus.$emit('UpdateFormControl', { key : this.name, value : value || null } );
            },

            update($event) {
                if (!! this.updateTimeout)
                    clearTimeout(this.updateTimeout)

                this.updateTimeout = setTimeout(() => this.doUpdate($event), 500);
            },
        },

        computed : {

            readonly() {
                return !! this.definition.readonly;
            },

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
    .tdd-generator-form-control {
        .form-control {
            text-indent : 20px;
        }
    }
</style>
