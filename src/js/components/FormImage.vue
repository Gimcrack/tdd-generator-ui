<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '', 'tdd-generator-form-control']">
        <label class="btn btn-sm" :class="[ selected ? 'btn-success' : 'btn-secondary']" :for="id">
            <i class="fa fa-fw fa-upload"></i>
            {{ label }}
        </label>

        <input
            type="file"
            class="input-file"
            :id="id"
            :name="name"
            :multiple="multiple"
            @input="update"
            :value="value"
            ref="fileInput"
            accept="image/*"
        >

        <div v-if="previews.length" class="d-flex flex-wrap -mx-2">

            <div v-for="(preview,idx) in previews" :key="idx"
                class="m-2 d-flex align-items-end position-relative shadow"
                 style="width:180px;height:180px;background-size:cover;background-repeat:no-repeat;overflow:hidden;border-radius:0.5rem;"
                 :style="{ backgroundImage : `url('${preview}')`}">
                <div class="text-white text-small bg-half-transparent w-100 h-25 d-flex align-items-center justify-content-center text-shadow">
                    {{ files[idx].name }}
                </div>

                <i class="fa fa-fw fa-times text-danger position-absolute" style="top:10px;right:10px;cursor:pointer"></i>
            </div>
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
    //import Dropzone from 'dropzone';

    export default {

        mounted() {
            //this.dz = new Dropzone('.dropzone', this.definition.upload);
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
                files : [],
                previews : [],
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

            update($event) {

                for(let ii = 0; ii<this.$refs.fileInput.files.length; ii++) {
                    this.files.push(this.$refs.fileInput.files[ii]);
                }

                this.getPreviews(this.$refs.fileInput.files);

                return Bus.$emit('UpdateFormControl', { key : this.name, value : this.$refs.fileInput.value });
            },

            getPreviews(files) {
                if ( ! files || ! files.length )
                    return false;

                for ( let ii = 0; ii<files.length; ii++ )
                {
                    this.getPreview(files[ii]);
                }
            },

            getPreview(file) {
                let rdr = new FileReader();
                rdr.onload = (e => {
                    this.previews.push(e.target.result);
                });

                rdr.readAsDataURL(file);
            }
        },

        computed : {

            selected() {
                return this.value && this.value.length;
            },

            readonly() {
                return !! this.definition.readonly;
            },

            label() {
                if ( this.files && this.files.length > 1 )
                    return this.files.length + ' Files Selected';

                if ( this.files && this.files[0] )
                    return this.files[0].name;

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

            id() {
                return this.definition.id || this.definition.name;
            },

            name() {
                return this.definition.name;
            },

            multiple() {
                return !! this.definition.multiple;
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
        .input-file {
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            position: absolute;
            z-index: -1;
        }
    }
</style>