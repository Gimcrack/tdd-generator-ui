<template>
    <div class="vinput">
        <input :value="value" @keyup.enter="$emit('keyupEnter')" @input="debounceUpdate" type="text" class="form-control vinput__input" :placeholder="placeholder" />
        <div class="vinput__icon">
            <i class="fa fa-fw fa-2x" :class="this.icon"></i>
        </div>
        <button type="button" @click.prevent.stop="reset" v-show="value" class="vinput__reset btn btn-xs btn-danger btn-outline">
            <i class="fa fa-fw fa-times"></i>
        </button>
    </div>

</template>

<script>
    export default {
        props : [
            'placeholder',
            'icon',
            'value',
            'small',
            'square'
        ],

        data() {
            return {
                timeout : null,
            }
        },

        methods : {
            reset() {
                this.$el.querySelector('input').value = '';
                this.$emit('input','');
                this.$emit('clear');
            },

            // wait for half a sec for typing to stop
            debounceUpdate($event) {
                if ( !! this.timeout )
                    clearTimeout(this.timeout);

                this.timeout = setTimeout( () => {
                    this.$emit('input', $event.target.value);
                }, 500);
            },
        }
    }
</script>

<style lang="scss">
    .vinput {
        position: relative;
        display: flex;
        flex: 1;

        .vinput__input {
            text-indent: 30px;
            /*font-size: 20px;*/
            // height:40px;
            // border-style: solid;
            // border: 1px solid #ccd0d2;
            // //border-bottom:2px solid #CCC;
            // background-color: lighten(#F5F8FA,1%);
        }

        .vinput__icon {
            position: absolute;
            top: 4px;
            left: 2px;
            color: #ccc;
            font-size: inherit;
        }

        .vinput__reset {
            position: absolute;
            top: 6px;
            right: 6px;
            z-index: 2;
            font-size: 12px;
        }
    }
</style>
