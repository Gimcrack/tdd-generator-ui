<template>
    <div v-if="show" class="form-wrapper">

        <div class="form">
            <div v-if="busy" class="form-busy bg-half-transparent position-absolute w-100 h-100 z-1 d-flex justify-content-center align-items-center">
                <i class="fa fa-spin fa-5x fa-refresh"></i>
            </div>
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
                    @refresh="refresh"
                ></form-menu>

                <div class="field-groups">
                    <form-field-group
                        v-for="grp,key in form_params.inputs"
                        :key="key"
                        :form="form_params.form"
                        :errors="errors"
                        :group="grp"
                        :editing="editing"
                        :conditions-met="conditionsMet(grp)"
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
                    @refresh="refresh"
                    class="mt-3 mb-2 mr-2"
                ></form-menu>
            </div>
        </div>
    </div>
</template>

<script>
    //import _ from "lodash";
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

                form_params : {
                    toggles : {}
                },

                form_definitions : {},

                form_defaults : {
                    type : 'The Model Type',
                    endpoint : 'The api endpoint',
                    name_key : 'name',
                    form : {},
                    inputs : []
                },

                form_field_groups : {},

                controls : {}

            }
        },

        mounted() {
            this.listen();

            if ( this.model ) {
                this.loadModel();
            }

            Store.controls = {}
        },

        computed : {

            heading() {
                return (this.editing) ? `Editing ${this.form_params.type}: ${this.model[this.form_params.name_key]}` :
                    `New ${this.form_params.type}`;
            },

            toggles() {
                return {
                    editing : this.editing,
                    dirty : this.dirty,
                    can_create : this.form_params.toggles.create !== false,
                    can_save : ! this.busy && this.dirty && ! this.invalid,
                    can_revert : ! this.busy && this.revertable,
                    can_reset : ! this.busy && this.resetable,
                    can_close : ! this.busy && ! this.dirty,
                    can_cancel : ! this.busy && this.dirty,
                    can_delete : ! this.busy && this.deletable,
                    revertable : this.revertable,
                    resetable : this.resetable,
                    deletable : this.deletable,
                    has_files : !! this.form_params.toggles.files,
                    refresh : !! this.form_params.toggles.refresh
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
                return _(this.form_field_groups).filter( o => o.show )
                    .map('controls_array').flatten().map('valid').value().some(v => !v);
            },

            invalid_controls() {
                return _(this.form_field_groups).filter( o => o.show )
                    .map('controls_array').flatten().filter(o => ! o.valid).value();
            }

//            controls() {
//                return _(this.form_field_groups).map('controls_array').flatten().value();
//            },
        },

        methods : {

            listen() {
                Bus.$on('ShowForm', (e) => {

                    this.form_params = Object.assign(
                        { files : {} },
                        this.form_defaults,
                        this.$root.form_definitions[e.type]
                    );

                    this.editing = ! _.isEmpty(e.model);

                    this.model = Object.assign({},e.model || {});
                    this.loadModel();

                    this.show = true;

                    //Vue.nextTick(() => this.controls[0].focus());
                });

                Bus.$on('RefreshFormControl', (e) => {
                    this.form_params.form[e.key] = e.value;
                    this.model[e.key] = e.value;
                    this.checkDirty();
                });

                Bus.$on('UpdateFormControl', (e) => {
                    this.form_params.form[e.key] = e.value;
                    this.checkDirty();
                });

                Bus.$on('UpdateFormFileControl', e => {
                    this.form_params.files[e.key] = e.value;
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
                    if ( !! res.dismiss )
                        return;
                    this.close();
                });
            },

            refresh() {
                //console.log('Refreshing form meta data');
                this.busy = true;

                Api.get(this.getEndpoint())
                    .then( response => {

                        this.model = Object.assign({},response.data);
                        this.busy = false;
                        this.loadModel();

                        this.$forceUpdate();
                    })
            },

            conditionsMet(group) {

                if ( ! group.condition ) {
                    return true;
                }

                if ( !! group.condition ) {
                    for ( let prop in group.condition ) {

                        if ( group.condition[prop] == null ) {
                            if ( this.form_params.form[prop] == null )
                                return false;
                            else
                                continue;
                        }

                        // determine if it's an inverse condition
                        if ( group.condition[prop].operator === 'not' ) {
                            if ( group.condition[prop].required && ! this.form_params.form[prop])
                                return false;
                            return group.condition[prop].value !== this.form_params.form[prop];
                        }

                        else if ( this.form_params.form[prop] !== group.condition[prop] ) {
                            return false;
                        }
                    }
                }

                return true;
            },

            close() {
                this.show = false;
                this.form = {};
                this.form_field_groups = {};
                this.checkDirty();
            },

            getDirty() {
                return  _.keys(this.form_params.form)
                    .filter( k => {
                        //let old_val = typeof this.model[k] !== 'undefined' ? this.model[k] : undefined,
                        //    new_val = this.form_params.form[k] || undefined;

                        return ! _.isEqual(this.model[k],this.form_params.form[k])
                    })
                    .map( k => {
                        return {
                            k,
                            old : this.model[k],
                            'new' : this.form_params.form[k]
                        }
                    })
            },

            checkDirty() {
                this.errors = {};

                if ( ! this.editing ) {
                    // the form is dirty if any of the input values are non empty
                    this.dirty = _.values(this.form_params.form).some( v => !! v );
                }

                else {
                    // the form is dirty if any of the input values are changed from the model values
                    this.dirty = _.keys(this.form_params.form)
                        .some( k => {
                            //let old_val = typeof this.model[k] !== 'undefined' ? this.model[k] : undefined,
                            //    new_val = this.form_params.form[k] || undefined;

                            return ! _.isEqual(this.model[k],this.form_params.form[k]);
                        });
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
                    if ( !! res.dismiss )
                        return;
                    this.loadModel();
                });
            },

            flashMessage(response, type) {

                let name = (response.data.model) ? response.data.model.name || null : null;
                let operation = '';

                // stylize the name or use generic
                name = name ? "'" + name + "'" : 'Record';

                // figure out what happened
                switch (true) {
                    case response.status === 201 : // new
                        operation = 'Creating';
                        break;

                    case response.status === 202 && response.config.method.toLowerCase() === 'post' : // update
                        operation = 'Updating';
                        break;

                    case response.config.method.toLowerCase() === 'post' : // new
                        operation = 'Creating';
                        break;

                    case response.config.method.toLowerCase() === 'patch' :
                    case response.config.method.toLowerCase() === 'put' :
                        operation = 'Updating';
                        break;

                    case response.config.method.toLowerCase() === 'delete' :
                        operation = 'Deleting';
                        break;
                }

                switch(type) {
                    case 'success' :
                        return flash.success(`${operation} ${name} ...`);
                }
            },

            success(response) {
                this.flashMessage(response, 'success');
                this.busy = false;

                //console.log(response.data);

                if ( ! _.isEmpty(response.data.model) ) {
                    //console.log('Getting here');
                    this.model = Object.assign({}, response.data.model);
                    this.editing = true;
                    this.checkDirty();
                }

                if( this.form_params.success ) {
                    this.form_params.success(Object.assign( {}, this.model, this.form_params.form));
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

                Api[ this.editing ? 'patch' : 'post'](this.getEndpoint(), this.getFormData())
                    .then(this.success, this.fail);
            },

            getId() {
                let key = this.form_params.id_key || 'id';

                return this.editing ? this.model[key] : '';
            },

            getEndpoint() {
                return this.form_params.endpoint + '/' + this.getId();
            },

            getFormData() {

                return this.form_params.form;

                // // prepare the payload
                // let frmData = new FormData(),
                //     params = this.form_params.inputs.flatMap(o => o.fields);
                //
                // frmData.append('_method', this.editing ? 'PATCH' : 'POST');
                //
                // params.forEach( o => {
                //     if ( o.type !== 'file' && o.type !== 'image' )
                //         frmData.append(o.name, this.form_params.form[o.name]);
                //     else
                //         this.form_params.files[o.name].forEach( (oo,i) => {
                //             frmData.append(`${o.name}[${i}]`, oo);
                //
                //             for (let prop in oo.meta) {
                //                 frmData.append(`${o.name}__meta[${i}][${prop}]`,oo.meta[prop]);
                //             }
                //         } )
                // });
                //
                // return frmData;
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
                    if ( !! res.dismiss )
                        return;

                    this.busy = true;
                    this.close_after_api = true;

                    Api.delete(this.form_params.endpoint + '/' + this.model[this.form_params.route_key_name || 'id'])
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
            max-width: 1140px;
            border-radius: 6px;

            .field-groups {
                height: calc(90vh - 140px);
                overflow-y: scroll;
            }


            .invalid-feedback {
                display:block !important;
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
