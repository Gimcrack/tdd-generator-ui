<template>
    <div :class="['form-group', (show_invalid) ? 'has-error' : '']">
        <label :for="name" v-if="label">{{ label }}</label>
        
        <input v-if="type != 'textarea'" @keydown.enter.stop.prevent="enter"
            :value="value"
            @input="update"
            :class="class_object"
            :type="type" 
            :placeholder="placeholder"
            :ref="name"
        >

        <textarea 
            v-if="type == 'textarea'" 
            @input="update"
            @keydown.enter="enter"
            :class="class_object" 
            :placeholder="placeholder"
            :ref="name"
            rows="4"
        >{{value}}</textarea>

        <div v-if="type != 'textarea'" class="icon is-small">
            <i :class="['fa', (show_invalid) ? 'fa-warning' : icon ]"></i>
        </div>

        <div v-if="show_invalid && !! invalid_rule.help" class="form-control-feedback">
            {{ invalid_rule.help }}
        </div>

        <div v-if="!! errors[name]" class="form-control-feedback">
            {{ errors[name][0] }}
        </div>
    </div>
</template>

<script>

    import Rule from './Rule.class.js';
    window.Rule = Rule;

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
                    defaults : [
                        [ 'minLength', [2], 'Please enter a valid value' ]
                    ],
                }
            }
        },

        created() {
            this.populate_rules();

            this.$parent.controls[ this.name ] = this;
            this.$parent.controls_array.push(this);
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
                Bus.$emit('UpdateFormControl', { key : this.name, value : $event.target.value });
            }
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
                        'has-error' : this.show_invalid 
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
    .form-group {
        position: relative;

        input[type=text],
        input[type=email],
        input[type=password] {
            text-indent: 15px;
        }

        .icon {
            position: absolute;
            top: 35px;
            left: 10px;
            color: #ccc;
            font-size: inherit;
        }
    }
</style>