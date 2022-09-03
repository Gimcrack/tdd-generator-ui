<template>
    <div v-if="show" class="m-2 d-flex align-items-end position-relative shadow preview-image"
            :style="{ backgroundImage : `url('/images/${preview}')`}">

        <div v-if="busy" class="position-absolute w-100 h-100 bg-half-transparent text-white d-flex flex-column align-items-center justify-content-center">
            <div class="mb-2">{{ message }}</div>
            <i class="fa fa-spin fa-circle-notch fa-5x"></i>
        </div>

        <div :class="[editing ? 'min-h-75' : 'min-h-25', meta.featured_flag ? 'border-warning' : 'border-transparent' ]"
             class="border text-white text-small bg-half-transparent w-100 d-flex flex-grow align-items-center justify-content-center text-shadow image-menu">
            <div @click="editing=true" v-if="! editing" style="cursor:pointer"  class="caption m-2 d-flex flex-column align-items-center justify-content-center">
                {{ meta.caption }}
                <div class="description">
                    <em>
                        {{ meta.description }}
                    </em>
                </div>
                <div v-if="meta.featured_flag" class="text-warning text-shadow mt-2">
                    <i class="fa fa-fw fa-check mr-1"></i>
                    Featured File
                </div>
            </div>

            <div v-else class="menu d-flex flex-column w-100 h-100 p-2 align-items-start justify-content-between">
                <input type="text" placeholder="Caption" v-model="meta.caption" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent">

                <textarea name="" placeholder="Description" v-model="meta.description" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent" rows="2"></textarea>

                <label class="form-control small d-flex align-items-center justify-content-start p-2 bg-half-transparent border-transparent text-white mb-2">
                    <input v-model="meta.featured_flag" type="checkbox" class="mr-2">
                    Featured File
                </label>

                <div class="d-flex w-100 justify-content-end">
                    <button @click="del" class="btn btn-link text-white">
                        <i class="fa fa-fw fa-times"></i>
                        Delete
                    </button>
                    <button @click="save" class="btn btn-link text-white">
                        <i class="fa fa-fw fa-check"></i>
                        Save
                    </button>
                </div>
            </div>
        </div>
        <!--<i @click="remove(idx)" class="fa fa-fw fa-times fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>-->
    </div>
</template>

<script>
    export default {
        name: "FileModel",

        props : {
            model : {
                required : true
            },

            form : {
                required : true
            }
        },

        watch : {
            model(value) {
                this.meta = value;
            }
        },

        data() {
            return {
                busy : false,
                meta : Object.assign({}, this.model),
                editing : false,
                message : '',
                show : true
            }
        },

        methods : {
            save() {
                this.busy = true;
                this.message = 'Updating...';

                Api.patch(this.endpoint, this.meta)
                    .then( this.success, this.fail );
            },

            del() {
                swal({
                    title : "Are you sure?",
                    text : "The file will be deleted.",
                    showCancelButton : true,
                }).then(res => {
                    if ( !! res.dismiss )
                        return;

                    this.performDelete();
                });
            },

            performDelete() {
                this.busy = true;
                this.message = 'Deleting...';

                Api.delete(this.endpoint)
                    .then(this.deleted, this.fail)
            },

            success(response) {
                this.editing = false;
                this.busy = false;
                this.$emit('updated');
                flash.success('File updated');
            },

            deleted(response) {
                this.editing = false;
                this.busy = false;
                this.show = false;
                this.$emit('updated');
                flash.success('File removed');
            },

            fail(error) {
                console.error(error);
                this.busy = false;
            }
        },

        computed : {
            endpoint() {
                return this.form.getEndpoint() + `/files/${this.model.id}`;
            },

            preview() {
                if ( this.model.path.indexOf('pdf') > -1 )
                    return 'pdf.png';

                if ( this.model.path.indexOf('xls') > -1 )
                    return 'xls.png';

                if ( this.model.path.indexOf('doc') > -1 )
                    return 'doc.png';

                if ( this.model.path.indexOf('txt') > -1 )
                    return 'txt.png';

                if ( this.model.path.indexOf('zip') > -1 )
                    return 'zip.png';

                return 'document.png';
            }
        }
    }
</script>

<style scoped>

</style>
