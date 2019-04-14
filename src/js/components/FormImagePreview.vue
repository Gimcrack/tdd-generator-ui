<template>
    <div class="m-2 d-flex align-items-end position-relative shadow preview-image"
        :style="{ backgroundImage : `url('${file.preview}')`}">

        <div v-if="busy" class="position-absolute w-100 h-100 bg-half-transparent text-white d-flex flex-column align-items-center justify-content-center">
            <div class="mb-2">{{ message }}</div>
            <i class="fa fa-spin fa-circle-notch fa-5x"></i>
        </div>

        <div
                class="border min-h-25 border-transparent text-white text-small bg-half-transparent w-100 d-flex flex-grow align-items-center justify-content-center text-shadow image-menu">

            <div class="caption m-2 d-flex flex-column align-items-center justify-content-center">
                {{ file.meta.caption }}
                <div class="description">
                    <em>
                        {{ file.meta.description }}
                    </em>
                </div>
                <div v-if="file.meta.featured_flag" class="text-warning text-shadow mt-2">
                    <i class="fa fa-fw fa-check mr-1"></i>
                    Featured Image
                </div>
            </div>
        </div>

        <!--<i @click="remove(file)" class="fa fa-fw fa-times fa-2x text-shadow text-white position-absolute" style="top:10px;right:10px;cursor:pointer"></i>-->

        <div v-if="!! errors" class="invalid-feedback position-absolute">
            <i class="fa fa-fw fa-times-circle-o text-danger fa-5x mb-2"></i>
            <div class="my-3 text-center text-white">
                {{ errors[0] }}
            </div>
            <button @click="$emit('remove')" class="btn btn-sm btn-danger">
                <i class="fa fa-fw fa-times"></i>
                Remove
            </button>
        </div>
    </div>

</template>

<script>
    export default {
        name: "FormImagePreview",

        props : {
            file : {
                required : true
            },

            form : {
                required : true
            }
        },

        mounted() {
            this.getPreview()
        },

        data() {
            return {
                busy : false,
                message : '',
                timeouts : [],
                errors : null
            }
        },

        methods : {
            upload() {
                this.busy = true;
                this.message = 'Uploading...';

                Api.post(this.endpoint, this.formData())
                    .then( (response) => {
                        this.busy = false;
                        this.errors = null;

                        this.$emit('uploaded');

                        //this.form.success();
                    } , this.fail );
            },

            fail(error) {
                this.busy = false;
                this.errors = _.values(error.response.data.errors)[0];

                this.$emit('failed')
            },

            formData() {
                // prepare the payload
                let frmData = new FormData();

                frmData.append(`image`, this.file);

                for (let prop in this.file.meta) {
                    frmData.append(prop,this.file.meta[prop]);
                }

                return frmData;
            },

            getPreview() {
                this.busy = true;
                this.message = 'Loading...';

                let rdr = new FileReader();
                rdr.onload = (e => {
                    this.file.preview = e.target.result;
                    this.$forceUpdate();

                    this.upload();
                });

                rdr.readAsDataURL(this.file);
            }
        },

        computed : {
            endpoint() {
                return this.form.getEndpoint() + '/images';
            }
        }

    }
</script>

<style scoped>

</style>