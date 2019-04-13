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
            accept="image/*"
        >

        <div class="d-flex flex-wrap -mx-2">

            <div v-if="value.length" v-for="(existing,idx) in value" :key="idx"
                 class="m-2 d-flex align-items-end position-relative shadow preview-image"
                 :style="{ backgroundImage : `url('/storage/${existing.path}')`}">

                <div :class="[editing ? 'min-h-75' : 'min-h-25', existing.featured_flag ? 'border-warning' : 'border-transparent' ]" class="border text-white text-small bg-half-transparent w-100 d-flex flex-grow align-items-center justify-content-center text-shadow image-menu">
                    <div @click="editing=true" v-if="! editing" style="cursor:pointer"  class="caption m-2 d-flex flex-column align-items-center justify-content-center">
                        {{ existing.caption }}
                        <div class="description">
                            <em>
                                {{ existing.description }}
                            </em>
                        </div>
                        <div v-if="existing.featured_flag" class="text-warning text-shadow mt-2">
                            <i class="fa fa-fw fa-check mr-1"></i>
                            Featured Image
                        </div>
                    </div>

                    <div v-else class="menu d-flex flex-column w-100 h-100 p-2 align-items-start justify-content-between">
                        <input type="text" placeholder="Caption" v-model="existing.caption" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent">

                        <textarea name="" placeholder="Description" v-model="existing.description" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent" rows="2"></textarea>

                        <label class="form-control small d-flex align-items-center justify-content-start p-2 bg-half-transparent border-transparent text-white mb-2">
                            <input v-model="existing.featured_flag" type="checkbox" class="mr-2">
                            Featured Image
                        </label>

                        <div class="d-flex w-100 justify-content-end">
                            <button @click="editing=false" class="btn btn-link text-white">
                                <i class="fa fa-fw fa-check"></i>
                                Save
                            </button>
                        </div>
                    </div>

                </div>

                <i @click="remove(idx)" class="fa fa-fw fa-times fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>

            </div>

            <div v-if="previews.length" v-for="(preview,idx) in previews" :key="idx"
                class="m-2 d-flex align-items-end position-relative shadow preview-image"
                 :style="{ backgroundImage : `url('${preview}')`}">

                <div :class="[editing ? 'min-h-75' : 'min-h-25', files[idx].featured_flag ? 'border-warning' : 'border-transparent' ]" class="border text-white text-small bg-half-transparent w-100 d-flex flex-grow align-items-center justify-content-center text-shadow image-menu">
                    <div @click="editing=true" v-if="! editing" style="cursor:pointer"  class="caption m-2 d-flex flex-column align-items-center justify-content-center">
                        {{ files[idx].meta.caption || files[idx].name }}
                        <div class="description">
                            <em>
                                {{ files[idx].meta.description }}
                            </em>
                        </div>
                        <div v-if="files[idx].meta.featured_flag" class="text-warning text-shadow mt-2">
                            <i class="fa fa-fw fa-check mr-1"></i>
                            Featured Image
                        </div>
                    </div>

                    <div v-else class="menu d-flex flex-column w-100 h-100 p-2 align-items-start justify-content-between">
                        <input type="text" placeholder="Caption" v-model="files[idx].meta.caption" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent">

                        <textarea name="" placeholder="Description" v-model="files[idx].meta.description" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent" rows="2"></textarea>

                        <label class="form-control small d-flex align-items-center justify-content-start p-2 bg-half-transparent border-transparent text-white mb-2">
                            <input v-model="files[idx].meta.featured_flag" type="checkbox" class="mr-2">
                            Featured Image
                        </label>

                        <div class="d-flex w-100 justify-content-end">
                            <button @click="editing=false" class="btn btn-link text-white">
                                <i class="fa fa-fw fa-check"></i>
                                Save
                            </button>
                        </div>
                    </div>

                </div>

                <i @click="remove(idx)" class="fa fa-fw fa-times fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>

                <div v-if="!! errors[`${name}.${idx}`]" class="invalid-feedback position-absolute">
                    <i class="fa fa-fw fa-times-circle-o text-danger fa-5x mb-2"></i>
                    <div class="my-3 text-center text-white">
                        {{ errors[`${name}.${idx}`][0] }}
                    </div>
                    <button @click="remove(idx)" class="btn btn-sm btn-danger">
                        <i class="fa fa-fw fa-times"></i>
                        Remove
                    </button>
                </div>
            </div>

            <label class="m-2 d-flex align-items-end position-relative shadow preview-image upload-button" :for="id">
                <div class="text-white text-small bg-half-transparent w-100 h-25 d-flex align-items-center justify-content-center text-shadow">
                    <i class="fa fa-fw fa-image mr-2"></i>
                    {{ label }}
                </div>

                <i class="fa fa-fw fa-plus fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>
            </label>
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
                show_icons : [],
                editing : false
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

            remove(index) {
                Vue.delete(this.files,index);
                Vue.delete(this.previews,index);

                //Bus.$emit('UpdateFormControl', { key : this.name, value : '' });
                Bus.$emit('UpdateFormFileControl', { key : this.name, value : this.files });
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
                        meta : {
                            caption : file.name,
                            description : "",
                            featured_flag : 0
                        }
                    }));
                }

                this.getPreviews(this.$refs.fileInput.files);

                Bus.$emit('UpdateFormControl', { key : this.name, value : this.$refs.fileInput.value });
                Bus.$emit('UpdateFormFileControl', { key : this.name, value : this.files });

                return;
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
            width:240px;
            height:240px;
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