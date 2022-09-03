<template>
    <div :class="['form-group', (show_invalid) ? 'is-invalid' : '', 'tdd-generator-form-control']">


        <input
            type="file"
            class="input-file"
            :id="id"
            :name="name"
            :multiple="multiple"
            @input="update"
            ref="fileInput"
        >

        <div class="d-flex flex-wrap -mx-2">
            <!-- Upload Button -->
            <label class="m-2 d-flex align-items-end position-relative text-small shadow preview-image upload-button" :for="id">
                <div class="text-white bg-half-transparent w-100 h-25 d-flex align-items-center justify-content-center text-shadow">
                    <i class="fa fa-fw fa-image mr-2"></i>
                    {{ label }}
                </div>

                <i class="fa fa-fw fa-plus fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>
            </label>

            <!-- Pending Files -->
            <form-file-preview
                :file="file"
                :form="form"
                v-if="files.length"
                v-for="file in files"
                :key="file.name || file.caption"
                @uploaded="refresh(file)"
                @remove="remove(file)"
            ></form-file-preview>

            <!-- Existing Files -->

            <file-model
                :model="existing"
                :form="form"
                v-if="value.length"
                v-for="existing in value"
                :key="existing.id"
                @updated="refresh"
            ></file-model>

        </div>
    </div>
</template>

<script>
    //import Dropzone from 'dropzone';

    import FileModel from './FileModel.vue';
    import FormFilePreview from "./FormFilePreview";

    export default {

        components : {
            FormFilePreview,
            FileModel
        },

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
                required : true,
                default : null
            }
        },

        data() {
            return {
                help_message : '',
                files : [],
                failed : [],
                validation : {
                    settings : [],
                    rules : [],
                    defaults : [
                        [ 'minLength', [2], 'Please enter a valid value' ]
                    ],
                },
                show_icons : [],
                editing : false,
                timeouts : []
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

            remove(file) {
                Vue.delete(this.files, this.files.indexOf(file));
                // Vue.delete(this.previews,index);

                this.$refs.fileInput.value = '';

                //Bus.$emit('UpdateFormControl', { key : this.name, value : '' });
                //Bus.$emit('UpdateFormFileControl', { key : this.name, value : this.files });
            },

            remove_failed(file) {
                Vue.delete(this.failed, this.failed.indexOf(file));
            },

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
                    let file = this.$refs.fileInput.files[ii];

                    this.files.push( Object.assign(file, {
                        preview : null,
                        meta : {
                            caption : file.name,
                            description : "",
                            featured_flag : 0,
                            errors : null,
                            busy : false,
                            uploaded : false,
                        }
                    }));
                }

                this.$refs.fileInput.value = '';

                // this.uploadFiles();


                //Bus.$emit('UpdateFormControl', { key : this.name, value : this.$refs.fileInput.value });
                //Bus.$emit('UpdateFormFileControl', { key : this.name, value : this.files });

                return;
            },

            refresh(file) {
                if ( ! this.form.editing )
                    return;

                if ( file )
                    file.uploaded = true;

                if ( this.timeouts.refresh ) clearTimeout(this.timeouts.refresh);

                this.timeouts.refresh = setTimeout(this.performRefresh, 2000);
            },

            performRefresh() {
                //console.log('Refreshing form meta data');
                Api.get(this.form.getEndpoint())
                    .then( response => {
                        Bus.$emit('RefreshFormControl', { key : this.name, value : response.data[this.name] });
                        //this.value = response.data[this.name];

                        this.files.filter(file => file.uploaded).forEach(file => {
                           this.remove(file);
                        });

                        this.$forceUpdate();
                    })
            },
        },

        computed : {

            form() {
                return this.$parent.$parent;
            },

            selected() {
                return this.value && this.value.length;
            },

            readonly() {
                return !! this.definition.readonly;
            },

            label() {
                // if ( this.files && this.files.length > 1 )
                //     return this.files.length + ' Files Selected';
                //
                // if ( this.files && this.files[0] )
                //     return this.files[0].name;

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
                    !! this.errors[this.name]
                    || Object.keys(this.errors).some(o => { return o.indexOf(this.name) > -1 });
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

    @import "../../sass/variables";

    .tdd-generator-form-control {
        .input-file {
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            position: absolute;
            z-index: -1;
        }

        .upload-button {
            background: url("../../img/placeholder.png") center rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s linear;

            &:hover,
            &.hover {
                background-color: rgba($brand-green,0.1);
                color: $brand-green !important;
            }
        }

        .preview-image {
            width:190px;
            height:190px;
            background-size:cover;
            background-repeat:no-repeat;
            overflow:hidden;
            border-radius:0.5rem;

            & > .image-menu {
                transition: all 0.3s linear;
            }

            &.hover > i,
            &:hover > i {
                display: block;
            }

            & > i {
                display: none;
            }

            .invalid-feedback {
                display: flex !important;
                height: 100%;
                width: 100%;
                background: rgba(0,0,0,0.7);
                align-items: center;
                justify-content: center;
                flex-direction: column;
                margin: 0;
            }
        }
    }
</style>