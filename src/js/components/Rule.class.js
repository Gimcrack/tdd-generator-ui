import validators from './validators';

export default class Rule {
        
    constructor( fn, args, help ) {
        this.fn = fn;
        this.args = args;
        this.help = help;
        this.valid = true;
        this.val = '';
    }

    get has_fn() {
        return ( typeof validators[this.fn] === 'function' );
    }

    get help_message() {
        return ( this.show_message ) ? this.help : '';
    }

    get is_invalid() {
        return ! this.valid;
    }

    get has_length() {
        return ( !! this.val ) && ( !! this.val.length );
    }

    get show_message() {
        return this.is_invalid && this.has_length;
    }

    validate( val ) {
        if ( ! this.has_fn ) return true;

        this.val = val;

        this.valid = validators[this.fn].apply( this, [ this.val, ...this.args ]);

        return this.valid;
    }

}