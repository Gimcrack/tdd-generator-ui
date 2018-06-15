export default {

    created() {
        this.$parent.page = this;
    },

    props: {
        layoutClass: {
            default() {
                return [];
            }
        }
    }
}