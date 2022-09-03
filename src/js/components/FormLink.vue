<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '', 'tdd-generator-form-control']">
        <label :for="name" v-if="label && type !== 'hidden'">{{ label }}</label>

        <div class="d-flex position-relative">
            <select class="form-control mr-2 w-25" v-model="form.type">
                <option value="video">Video</option>
                <option value="documentation">Documentation</option>
                <option value="website">Website</option>
                <option value="Other">Other</option>
            </select>

            <div class="position-relative d-flex flex-1">

                <input
                    @keydown.enter.stop.prevent="add"
                    v-model="form.url"
                    type="text"
                    placeholder="https://example.com/help.pdf"
                    :class="class_object"
                    :ref="name"
                >

                <form-button
                    class="ml-2"
                    v-if="definition.multiple"
                    :definition="{
                        icon : 'fa-plus',
                        fn : add
                    }"
                    :disabled="! input_valid"
                ></form-button>

                <form-button
                        class="ml-2"
                        v-if="definition.btn && definition.btn.length"
                        v-for="(btn,idx) in definition.btn"
                        :definition="btn"
                        :key="idx"
                ></form-button>


            </div>

        </div>

        <div v-if="type !== 'hidden'" class="icon is-small">
            <i :class="['fa', (show_invalid) ? 'fa-warning' : icon || 'fa-link' ]"></i>
        </div>


        <div v-if="show_invalid && !! invalid_rule.help" class="invalid-feedback mt-2">
            {{ invalid_rule.help }}
        </div>

        <div v-if="!! errors[name]" class="mt-2 d-flex flex-column invalid-feedback">
            {{ errors[name][0] }}
        </div>



        <ul class="list-group mt-2" v-if="links.length">
            <li class="list-group-item d-flex align-items-center" v-for="link in links">
                <div class="flex-1">
                    {{ link.url }} ({{ link.type }})
                </div>
                <form-button
                    class="ml-2"
                    v-if="definition.multiple"
                    :definition="{
                        icon : 'fa-edit',
                        fn : () => { return edit(link); }
                    }"
                ></form-button>
                <form-button
                    class="ml-2"
                    v-if="definition.multiple"
                    :definition="{
                        icon : 'fa-times',
                        fn : () => { return remove(link); }
                    }"
                ></form-button>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "FormLink",

        watch : {
            value(val) {
                this.links = val;
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
                        placeholder : 'https://example.com/help.pdf',
                        icon : 'fa-link',
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
                    return [];
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
                        [ 'url', [], 'Please select a type and enter a valid url' ]
                    ],
                },
                form : {
                    type : null,
                    url : null,
                },
                links : []
            }
        },

        created() {
            this.populate_rules();

            Store.controls[ this.name ] = this;

            this.$parent.controls[ this.name ] = this;
            this.$parent.controls_array.push(this);

            if ( !! this.value ) {
                this.links = this.value;
                this.update();
            }
        },

        methods : {

            add() {
                if ( ! this.input_valid )
                    return sleep(100);

                this.links.push(this.form);
                this.form = {
                    type : null,
                    url : null,
                };

                this.update();
                return sleep(100);
            },

            remove(link) {
                this.$delete(this.links, this.links.indexOf(link));

                this.update();
                return sleep(100);
            },

            edit(link) {
                this.form = link;
                return this.remove(link);
            },

            reset() {
                //console.log('Resetting');
                this.links = [];
                this.form = {
                    type : null,
                    url : null,
                };
                this.update();
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

            update() {
                Bus.$emit('UpdateFormControl', { key : this.name, value : this.links } );
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
                return true;
            },

            validate() {
                return true;
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
                return true;
            },

            input_valid() {
                let invalid = this.validation.rules.some( rule => {
                    return ! rule.validate(this.form.url);
                }) || ! this.form.type;

                return ! invalid;
            },

            valid() {
                if ( ! (this.form.url || "").length ) return true;

                let invalid = this.validation.rules.some( rule => {
                    return ! rule.validate(this.form.url);
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

<style scoped>

</style>