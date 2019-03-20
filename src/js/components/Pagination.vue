<template>
    <div class="pagination-controls d-flex">

        <button :disabled="pagination.page===1" @click="$emit('navigateFirst')" class="btn btn-xs btn-outline-primary mr-2">
            <small><i class="fa fa-fw fa-angle-double-left"></i></small>
        </button>

        <button :disabled="pagination.page===1" @click="$emit('navigateBack')" class="btn btn-xs btn-outline-primary mr-2">
            <small><i class="fa fa-fw fa-angle-left"></i></small>
        </button>

        <dropdown-menu
                :disabled="pagination.totalPages===1"
                :btnText="`Page ${this.pagination.page} / ${this.pagination.totalPages}`"
                :btnClass="['btn-xs','btn-outline-primary']"
                :smallText="true"
                class="mr-2"
                :class="{disabled:pagination.totalPages===1}"
        >
            <dropdown-item @clicked="$emit('navigate',{ page : i })" :key="i" v-for="i in pageRange">
                Page {{i}}
            </dropdown-item>
        </dropdown-menu>

        <button :disabled="pagination.page===pagination.totalPages" @click="$emit('navigateForward')" class="btn btn-xs btn-outline-primary mr-2">
            <small><i class="fa fa-fw fa-angle-right"></i></small>
        </button>

        <button :disabled="pagination.page===pagination.totalPages" @click="$emit('navigateLast')" class="btn btn-xs btn-outline-primary mr-4">
            <small><i class="fa fa-fw fa-angle-double-right"></i></small>
        </button>

        <dropdown-menu
                :btnText="`${this.pagination.rowsPerPage} Items Per Page`"
                :btnClass="['btn-xs','btn-outline-primary']"
                :smallText="true"
                class="mr-2"
        >
            <dropdown-item @clicked="$emit('perPage', { perPage : i})" :key="i" v-for="i in [10,25,50,100,500]">
                {{i}} Items Per Page
            </dropdown-item>
        </dropdown-menu>
    </div>
</template>

<script>
    export default {
        props : {
            pagination : {
                default() {
                    return {
                        page : 1,
                        rowsPerPage : 25,
                        totalPages : 1,
                    }
                }
            }
        },

        computed : {
            pageRange() {
                return _.range(1,this.pagination.totalPages+1);
            },
        },

        name: "Pagination",

    }
</script>

<style scoped>

</style>