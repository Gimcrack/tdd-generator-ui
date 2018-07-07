<template>
    <button @click.prevent="$emit('clicked')" class="btn btn-success" :class="{ active }">
        <i class="fa fa-fw" :class="[ active ? 'fa-toggle-on' : 'fa-toggle-off' ]"></i>
        <slot></slot>
    </button>
</template>

<script>
    export default {
        props : [
            'active'
        ],
    }
</script>
