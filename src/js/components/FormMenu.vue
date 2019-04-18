<template>
    <div class="form-menu">
        <button type="button" v-show="toggles.can_create && toggles.editing && ! toggles.dirty" @click.prevent="$emit('new')" :disabled="toggles.dirty" :class="{ disabled : toggles.dirty }" class="btn-primary btn">
            <i class="fa fa-fw fa-plus" :class="{'fa-spin' : busy}"></i>
            New
        </button>

        <button type="button" v-show="toggles.can_save" @click.prevent="$emit('saveClose')" :disabled="! toggles.can_save" :class="{ disabled : ! toggles.can_save }" class="btn-success btn">
            <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
            Save &amp; Close
        </button>

        <button type="button" v-show="toggles.can_save" @click.prevent="$emit('save')" :disabled="! toggles.can_save" :class="{ disabled : ! toggles.can_save}" class="btn-success btn">
            <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
            Save
        </button>

        <button type="button" v-show="toggles.refresh" @click.prevent="$emit('refresh')" :disabled="! toggles.refresh" :class="{ disabled : ! toggles.refresh}" class="btn-primary btn">
            <i class="fa fa-fw fa-circle-o-notch" :class="{'fa-spin' : busy}"></i>
            Refresh
        </button>

        <button type="button" v-show="toggles.revertable" @click.prevent="$emit('revert')" :disabled="! toggles.can_revert" :class="{ disabled : ! toggles.can_revert}" class="btn-warning btn">
            <i class="fa fa-fw fa-refresh" :class="{'fa-spin' : busy}"></i>
            Revert
        </button>

        <button type="button" v-show="toggles.resetable" @click.prevent="$emit('revert')" :disabled="! toggles.can_reset" :class="{ disabled : ! toggles.can_reset}" class="btn-warning btn">
            <i class="fa fa-fw fa-refresh" :class="{'fa-spin' : busy}"></i>
            Reset
        </button>

        <button type="button" v-show="! toggles.dirty" @click.prevent="$emit('cancel')" :disabled="! toggles.can_close" :class="{ disabled : ! toggles.can_close}" class="btn-default btn">
            <i class="fa fa-fw fa-close" :class="{'fa-spin' : busy}"></i>
            Close
        </button>

        <button type="button" v-show="toggles.dirty" @click.prevent="$emit('cancel')" :disabled="! toggles.can_cancel" :class="{ disabled : ! toggles.can_cancel}" class="btn-danger btn">
            <i class="fa fa-fw fa-close" :class="{'fa-spin' : busy}"></i>
            Cancel
        </button>

        <button type="button" v-if="toggles.deletable" @click.prevent="$emit('destroy')" :disabled="! toggles.can_delete" :class="{ disabled : ! toggles.can_delete}" class="btn-danger btn">
            <i class="fa fa-fw fa-trash" :class="{'fa-spin' : busy}"></i>
            Delete
        </button>
    </div>
</template>

<script>
    export default {
        props : [
            'toggles',
            'busy'
        ],

        data() {
            return {}
        }
    }
</script>

<style lang="scss">
    .form-menu {
        display: flex;
        justify-content: flex-end;

        button + button {
            margin-left: 0.5em;
        }
    }
</style>