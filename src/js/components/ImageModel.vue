<template>
    <div v-if="show" :class="{'problem' : meta.size_problem_flag, 'non-optimal' : meta.size_not_optimal_flag}" class="m-2 d-flex align-items-end position-relative shadow preview-image"
            :style="{ backgroundImage : `url('${meta.cloud_thumbnail}')`}">

        <div v-if="busy" class="position-absolute w-100 h-100 bg-half-transparent text-white d-flex flex-column align-items-center justify-content-center">
            <div class="mb-2">{{ message }}</div>
            <i class="fa fa-spin fa-circle-notch fa-5x"></i>
        </div>

        <template v-if="! meta.size_problem_flag">
            <div :class="[editing ? 'min-h-75' : 'min-h-25', meta.size_not_optimal_flag ? 'border-warning' : 'border-transparent' ]"
                 class="border text-white w-100 d-flex flex-grow align-items-center justify-content-center text-shadow image-menu"
                 style="background:rgba(0,0,0,0.7)">
                <div @click="editing=true" v-if="! editing" style="cursor:pointer"  class="caption m-2 d-flex flex-column align-items-center justify-content-center">

                    <span>
                        <i class="fa fa-fw fa-edit"></i> Edit
                    </span>

                    <div v-if="meta.featured_flag" class="text-shadow mt-2">
                        <i class="fa fa-fw fa-check mr-1"></i>
                        Featured Image
                    </div>
                    <div v-if="meta.size_not_optimal_flag" class="text-warning mt-2 p-1">
                        Size Not Optimal
                    </div>

                </div>

                <div v-else class="menu d-flex flex-column w-100 h-100 p-2 align-items-start justify-content-between">
                    <!-- <input type="text" placeholder="Caption" v-model="meta.caption" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent">

                    <textarea name="" placeholder="Description" v-model="meta.description" class="form-control small p-2 bg-half-transparent text-white indent-reset mb-2 border-transparent" rows="2"></textarea> -->

                    <label class="form-control small d-flex align-items-center justify-content-start p-2 bg-half-transparent border-transparent text-white mb-2">
                        <input v-model="meta.featured_flag" type="checkbox" class="mr-2">
                        Featured Image
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
        </template>


        <div v-else class="invalid-feedback position-absolute">
            <i class="fa fa-fw fa-times-circle-o text-danger fa-5x mb-2"></i>
            <div class="my-2 text-center text-white p-2">
                Too small to display. Must be at least 500x500.
            </div>

            <div class="d-flex">
                <button @click="del" class="btn btn-xs btn-danger mr-2 text-small">
                    <i class="fa fa-fw fa-times"></i>
                    Remove
                </button>
            </div>
        </div>
        <!--<i @click="remove(idx)" class="fa fa-fw fa-times fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>-->
    </div>
</template>

<script>
    export default {
        name: "ImageModel",

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
                    .then( this.success, this.fail )
                    .then( o=> {
                        this.editing = false;
                    });
            },

            del() {
                swal({
                    title : "Are you sure?",
                    text : "The image will be deleted.",
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
                flash.success('Image updated');
            },

            deleted(response) {
                this.editing = false;
                this.busy = false;
                this.show = false;
                this.$emit('updated');
                flash.success('Image removed');
            },

            fail(error) {
                console.error(error);
                this.busy = false;
            }
        },

        computed : {
            endpoint() {
                return this.form.getEndpoint() + `/images/${this.model.id}`;
            }
        }
    }
</script>

<style scoped>
    .preview-image.problem {
        border: 2px solid red !important;
    }
    .preview-image.problem.non-optimal {
        border: 2px solid red !important;
    }
    .preview-image.non-optimal {
        border: 2px solid orange;
    }
</style>
