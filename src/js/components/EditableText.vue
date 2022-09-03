<template>
    <div @mouseover="showControls" @mouseout="hideControls" class="editable-text" style="min-width: 40px;">

        <div v-if="editing" class="editor position-relative d-flex">
            <button type="button" :disabled="busy" @click="save" :class="{disabled:busy}" class="btn btn-link btn-xs position-absolute" style="left: -40px; top: 5px;">
                <i class="fa" :class="busy ? ['fa-refresh','fa-spin'] : ['fa-check']"></i>
            </button>
            <button type="button" :disabled="busy" @click="cancel" :class="{disabled:busy}" class="btn btn-link btn-xs position-absolute" style="left: -20px; top: 5px;">
                <i class="fa fa-times"></i>
            </button>
            <input :disabled="busy" @keyup.enter="save" @keyup.esc="cancel" ref="input" v-model="value" type="text" class="form-control" :class="{disabled : busy}">
        </div>

        <div @click="edit" class="d-flex align-items-center position-relative" style="cursor:pointer" v-else>
            <button type="button" v-show="show_controls" class="btn btn-link btn-xs position-absolute" style="left:-20px">
                <i class="fa fa-edit"></i>
            </button>
            <div class="p-1" :style="{ ...cellStyle, borderBottom : show_controls ? '2px solid teal' : '2px solid transparent' }" :class="cellClass"  v-html="value || defaultValue"></div>
        </div>
    </div>
</template>

<script>
    export default {

        props : [
            'initial',
            'endpoint',
            'name',
            'cellClass',
            'cellStyle',
            'defaultValue'
        ],

        watch : {
            initial() {
                this.value = this.initial;
            }
        },

        data() {
            return {
                editing : false,
                value : this.initial,
                show_controls : false,
                busy : false,
            }
        },

        methods : {
            showControls() {
                this.show_controls = true;
            },

            hideControls() {
                this.show_controls = false;
            },

            edit() {
                this.editing = true;
                setTimeout(() => {
                    this.$refs.input.focus();
                    this.$refs.input.setSelectionRange(0,this.value.length);
                }, 100);
            },

            save() {
                //console.log('saving');
                this.busy = true;
                let payload = {};
                payload[this.name] = this.value;

                Api.patch(this.endpoint, payload)
                    .then( () => {
                        this.busy = false;
                        this.editing = false;
                    });
            },

            cancel() {
                this.model = this.initial;
                this.editing = false;
            }
        }
    }
</script>

<style lang="scss">

</style>
