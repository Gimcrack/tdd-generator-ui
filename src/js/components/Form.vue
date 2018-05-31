<template>
    <div v-if="show" class="form-wrapper">
        <div class="form">
            <div class="page p-2">
                <div class="page-header m-2">
                    <h2>{{ heading }}</h2>
                </div>

                <form-menu
                    v-if="form_params.toggles.menus.top"
                    :toggles="toggles"
                    :busy="busy"
                    @new="clear"
                    @saveClose="save_close"
                    @save="save"
                    @revert="revert"
                    @reset="revert"
                    @cancel="cancel"
                    @destroy="destroy"
                ></form-menu>

                <div class="field-groups">
                    <form-field-group
                            v-for="grp,key in form_params.inputs"
                            :key="key"
                            :form="form_params.form"
                            :errors="errors"
                            :group="grp"
                            :editing="editing"
                    ></form-field-group>
                </div>

                <form-menu
                    v-if="form_params.toggles.menus.bottom"
                    :toggles="toggles"
                    :busy="busy"
                    @new="clear"
                    @saveClose="save_close"
                    @save="save"
                    @revert="revert"
                    @reset="revert"
                    @cancel="cancel"
                    @destroy="destroy"
                    class="mt-3 mb-2 mr-2"
                ></form-menu>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from "lodash";
    //import Api from "../Api";

    export default {

        data() {
            return {

                show : false,
                editing : false,
                dirty : false,
                busy : false,
                close_after_api : false,
                errors : {},

                model : null,

                form_params : {},

                form_definitions : {},

                form_defaults : {
                    type : 'The Model Type',
                    endpoint : 'The api endpoint',
                    name_key : 'name',
                    form : {},
                    inputs : []
                },

                form_field_groups : {}

            }
        },

        mounted() {
            this.listen();

            if ( this.model ) {
                this.loadModel();
            }
        },

        computed : {

            heading() {
                return (this.editing) ? `Editing ${this.form_params.type}: ${this.model[this.form_params.name_key]}` : `New ${this.form_params.type}`;
            },

            toggles() {
                return {
                    editing : this.editing,
                    dirty : this.dirty,
                    can_save : ! this.busy && this.dirty && ! this.invalid,
                    can_revert : ! this.busy && this.revertable,
                    can_reset : ! this.busy && this.resetable,
                    can_close : ! this.busy && ! this.dirty,
                    can_cancel : ! this.busy && this.dirty,
                    can_delete : ! this.busy && this.deletable,
                    revertable : this.revertable,
                    resetable : this.resetable,
                    deletable : this.deletable,
                }
            },

            deletable() {
                return this.editing && this.form_params.toggles.del;
            },

            revertable() {
                return this.dirty && this.editing;
            },

            resetable() {
                return this.dirty && ! this.editing;
            },

            invalid() {
                return _(this.form_field_groups).map('controls_array').flatten().map('valid').value().some(v => !v);
            },

            controls() {
                return _(this.form_field_groups).map('controls_array').flatten().value();
            }
        },

        methods : {

            listen() {
                Bus.$on('ShowForm', (e) => {

                    this.form_params = Object.assign(
                        {},
                        this.form_defaults,
                        this.$root.form_definitions[e.type]
                    );

                    this.editing = ! _.isEmpty(e.model);

                    this.model = Object.assign({},e.model || {});
                    this.loadModel();

                    this.show = true;

                    Vue.nextTick(() => this.controls[0].focus());
                });

                Bus.$on('UpdateFormControl', (e) => {
                    this.form_params.form[e.key] = e.value;
                    this.checkDirty();
                });

                Bus.$on('NewFormDefinition', (e) => {
                   this.form_definitions[e.type] = e.definition;
                });
            },

            clear() {
                this.model = {};
                this.editing = false;
                this.clearModel();
            },

            cancel() {
                if ( ! this.dirty ) {
                    this.close();
                    return;
                }

                swal({
                    title : "Are you sure?",
                    text : "Unsaved changes will be lost.",
                    showCancelButton : true,
                }).then(res => {
                    if ( res.dismiss === "cancel" )
                        return;
                    this.close();
                });
            },

            close() {
                this.show = false;
                this.form = {};
                this.form_field_groups = {};
                this.checkDirty();
            },

            checkDirty() {
                this.errors = {};

                if ( ! this.editing ) {
                    // the form is dirty if any of the input values are non empty
                    this.dirty = _.values(this.form_params.form).some( v => !! v );
                }

                else {
                    // the form is dirty if any of the input values are changed from the model values
                    this.dirty = _.keys(this.form_params.form).map( k => this.form_params.form[k] !== this.model[k] ).some( v => !! v );
                }
            },

            clearModel() {
                _.keys(this.form_params.form).forEach( key => {
                    this.form_params.form[key] = null;
                });

                this.checkDirty();
            },

            loadModel() {
                _.keys(this.form_params.form).forEach( key => {
                    this.form_params.form[key] = this.model[key];
                });

                this.checkDirty();
            },

            revert() {
                swal({
                    title : "Are you sure?",
                    text : "Unsaved changes will be lost.",
                    showCancelButton : true,
                }).then(res => {
                    if ( res.dismiss === "cancel" )
                        return;
                    this.loadModel();
                });
            },

            success(response) {
                flash.success("Operation completed successfully");
                this.busy = false;

                //console.log(response.data);

                if ( ! _.isEmpty(response.data.model) ) {
                    //console.log('Getting here');
                    this.model = Object.assign({}, response.data.model);
                    this.editing = true;
                    this.checkDirty();
                }

                if ( this.close_after_api )
                    this.close();
            },

            fail(err) {
                this.busy = false;
                this.errors = err.response.data.errors;

                if ( err.response.data.message ) {
                    flash.warning(err.response.data.message);
                }
            },

            post() {
                if ( this.editing ) {
                    Api.patch(this.form_params.endpoint + '/' + this.model.id, this.form_params.form)
                        .then(this.success, this.fail);
                }
                else {
                    Api.post(this.form_params.endpoint, this.form_params.form)
                        .then( this.success, this.fail );
                }
            },

            save() {
                this.busy = true;
                this.close_after_api = false;
                this.post();

            },

            save_close() {
                this.busy = true;
                this.close_after_api = true;
                this.post();
            },

            destroy() {
                swal({
                    title : "Delete this record?",
                    text : "This action cannot be undone.",
                    showCancelButton : true,
                }).then(res => {
                    if ( res.dismiss === "cancel" )
                        return;

                    this.busy = true;
                    this.close_after_api = true;

                    Api.delete(this.form_params.endpoint + '/' + this.model.id)
                        .then( this.success, this.fail );
                });
            }
        }
    }
</script>

<style lang="scss">
    .form-wrapper {
        position: fixed;
        top:0;
        left:0;
        z-index: 1000;
        height:100vh;
        width:100vw;

        background: rgba(0,0,0,0.3);

        .form {
            position: relative;
            height: auto;
            max-height:90vh;
            margin: 5vh auto;
            width: 90vw;
            max-width: 960px;
            border-radius: 6px;


            .invalid-feedback {
                position: relative;
                width: unset;
                text-align: left;
            }

            &:before, &:after
            {
                z-index: -1;
                position: absolute;
                content: "";
                bottom: 15px;
                left: 10px;
                width: 50%;
                top: 80%;
                max-width:300px;
                background: #777;
                -webkit-box-shadow: 0 15px 10px #777;
                -moz-box-shadow: 0 15px 10px #777;
                box-shadow: 0 15px 10px #777;
                -webkit-transform: rotate(-3deg);
                -moz-transform: rotate(-3deg);
                -o-transform: rotate(-3deg);
                -ms-transform: rotate(-3deg);
                transform: rotate(-3deg);
            }
            &:after
            {
                -webkit-transform: rotate(3deg);
                -moz-transform: rotate(3deg);
                -o-transform: rotate(3deg);
                -ms-transform: rotate(3deg);
                transform: rotate(3deg);
                right: 10px;
                left: auto;
            }
        }

    }
</style>
