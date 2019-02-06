export default {

    minLength( value, len ) {
        return !! value && value.toString().trim().length >= len;
    },

    regEx( value, pattern ) {
        return !! value.match(pattern);
    },

    fullName( value ) {
        let re = /^[a-z]([-']?[a-z]+)*( [a-z]([-']?[a-z]+)*)+$/i;
        return re.test(String(value));
    },

    maxLength( value, len ) {
        return !! value && value.toString().trim().length <= len;
    },

    contains( value, str ) {
        return !! value && value.indexOf(str) !== -1;
    },

    match( value, key ) {
        return value === this.siblings[key].value;
    },

    email( value ) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(value).toLowerCase());
    },

    select( value ) {
        //console.log(value);

        return !! value;
    },

}
