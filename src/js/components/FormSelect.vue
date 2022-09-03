<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '']">
        <label :for="name" v-if="label">{{ label }}</label>

        <div class="d-flex">
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
                :closeOnSelect="params.closeOnSelect"
                :taggable="params.taggable"
                :max="params.max"
                :limit="params.limit"
                :optionsLimit="params.optionsLimit"
                :groupValues="params.groupValues"
                :groupLabel="params.groupLabel"
                :groupSelect="params.groupSelect"
            >
            </vue-multiselect>

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

            <form-button
                class="ml-2"
                v-if="definition.select.cache"
                :definition="refreshBtnDefinition"
            ></form-button>
        </div>


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
    //import Rule from './Rule.class.js';
    //window.Rule = Rule;

    export default {

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
                loading : false,
                loaded : false,

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
                    clearOnSelect : false,
                    hideSelected : false,
                    allowEmpty : true,
                    resetAfter : false,
                    closeOnSelect : ! this.definition.select.multiple,
                    taggable : false,
                    max : null,
                    limit : 5,
                    optionsLimit : 100,
                    groupValues : null,
                    groupLabel : null,
                    groupSelect : true
                }, this.definition.select),

                refreshBtnDefinition : {
                    label : '',
                    type : 'button',
                    btnType : 'btn-primary',
                    icon : 'fa-refresh',
                    fn : () => {
                        this.clearCache();
                        this.initSelect()

                        return sleep(1250);
                    }
                }
            }
        },

        created() {
            this.populate_rules();
            this.initSelect();

            Store.controls[ this.name ] = this;

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
                    value = $event.map(o => o[this.params.trackBy]);
                else
                    value = $event[this.params.trackBy];

                if ( value === null ) {
                    value = ( this.params.multiple ) ? [] : null;
                }

                if ( typeof this.definition.onChange === 'function' )
                    this.definition.onChange(value);

                Bus.$emit('UpdateFormControl', { key : this.name, value } );
            },

            async initSelect() {
                // options are specified locally
                if ( typeof this.definition.select.source === "object" ) {
                    this.params.options = this.definition.select.source;
                    this.params.internalSearch = true;
                    this.updateSelected();
                    return;
                }

                this.loading = true;
                this.loaded = false;

                if ( this.definition.select.cache && !! await Store.get( this.cache_key ) ) {
                    this.params.options = JSON.parse( await Store.get( this.cache_key ) );
                    this.params.internalSearch = false;
                    this.updateSelected();
                    this.loading = false;
                }
                else {
                    this.loadExternalOptions();
                }
            },

            clearCache() {
                Store.remove( this.cache_key );
            },

            loadExternalOptions() {

                window.Api.get( this.select_source_url )
                    .then( (response) => {
                        this.params.options = response.data;
                        this.params.internalSearch = false;
                        this.updateSelected();
                        this.loading = false;

                        if ( this.definition.select.cache && !! response.data )
                            Store.set( this.cache_key, JSON.stringify(response.data) );
                    } );
            },

            updateSelected() {
                ( this.params.multiple ) ?
                    this.updateMultipleSelected() :
                    this.updateSingleSelected();

                this.loaded = true;
            },

            updateMultipleSelected() {
                if ( ! this.value ) {
                    this.params.value = null;
                    return;
                }

                this.params.value = _.map( _.castArray(this.value), (id) => {
                    let o = {};
                    o[this.params.trackBy] = id;
                    return _.find(this.params.options, o);
                });
            },

            updateSingleSelected() {
                let o = {};
                o[this.params.trackBy] = this.value;

                this.params.value = _.find( this.params.options, o );
            },
        },

        computed : {

            cache_key() {
                return JSON.stringify(this.definition);
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

            selected_values() {

            },

            select_source_url() {
                if ( typeof this.definition.select.source === 'function' ) {
                    return this.definition.select.source( this.$parent.$parent.controls );
                }

                return this.definition.select.source;
            },

            selected_name() {
                if ( ! this.params.value ) return '';

                return this.params.value.name;
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

        .multiselect__placeholder {
            text-indent: 24px;
            font-size: 16px;
            line-height: 16px;
        }

    }
</style>
