export default {
    props : {
        initial : {
            required : true,
        },
        modelProps : {
            default() {
                return {};
            }
        },
        itemLayout : {
            default : 'item-table'
        },
        columns : {
            required : true
        },

        zoom : {
            default : 150
        },
    },

    watch : {
        initial(value) {
            this.model = value;
        }
    },

    mounted() {
        this.highlight();

        if ( !! this.item.channel )
            this.listen();
    },

    data() {
        return {
            $item : null,

            component_type : "item-table",

            model : this.initial,
            updating : false,
            deleting : false,
            show_menu : false,

            item : {
                key : 'id',
                model_friendly : 'name',
                type : null,
                endpoint : null,
                channel : null,
                updated : null
            },

            toggles : {
                info : true,
                update : true,
                delete : true
            }
        }
    },

    computed : {
        busy() {
            return this.deleting || this.updating;
        },

        name() {
            let friendly = this.item.model_friendly;
            return this.model[friendly];
        }
    },

    methods : {
        highlight(sticky) {
            $(this.$item.$refs.row)
                .addClass('hover');

            if ( ! sticky )
                sleep(500).then( () => {
                    $(this.$item.$refs.row).removeClass('hover');
                });
        },

        view() {
            //console.warn('The view method has not been implemented on the instance.')
            Bus.$emit('ShowItemDetail', { endpoint : this.item.endpoint, id : this.model[this.item.key] })
        },

        update() {
            console.warn('The update method has not been implemented on the instance.')
        },

        destroy() {
            return swal({
                  title: `Remove ${this.item.type}: ${this.name}?`,
                  text: `This cannot be undone.`,
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#bf5329",
                  confirmButtonText: `Yes, remove this ${this.item.type}.`,
                }
            ).then( this.performDestroy, this.ignore );
        },

        performDestroy() {
            let key = this.item.key;
            this.deleting = true;
            Api.delete(`${this.item.endpoint}/${this.model[key]}`)
                .then(this.deleteSuccess, this.error);
        },

        deleteSuccess(response) {
            this.deleting = false;
        },

        updateSuccess(response) {
            this.updating = false;
        },

        error(error) {
            flash.error('There was an error performing the operation. See the console for more details');
            console.error(error);

            if ( !! this.postError )
                this.postError();
        },

        eventModel( event ) {
            let type = this.item.type,
                entity = event[type],
                friendly = this.item.model_friendly;

            return {
                entity,
                type : type.$title_case(),
                name : entity[friendly]
            }
        },

        updatedEvent(event, quiet) {
            console.log('Updated', event);

            let model = this.eventModel(event);

            //console.log('parent',this.$parent);

            if ( !! this.$parent.$parent.add ) {
                this.$parent.$parent.add(model);
                //this.$parent.orderBy = null;
                //this.$parent.orderBy = 'id';
            }

            if ( !! this.$parent.$parent.$parent.add ) {
                this.$parent.$parent.$parent.add(model);
                //this.$parent.orderBy = null;
                //this.$parent.orderBy = 'id';
            }

            this.model = model.entity;
            this.$forceUpdate();
            this.highlight();

            if ( ! quiet )
                flash.success(`${model.type} '${model.name}' Was Updated`);

            if ( !! this.postUpdated )
                this.postUpdated(event);
        },

        listen() {
            if ( ! this.item.channel )
                return false;
            
            let updated_event = ( typeof this.item.updated === 'object' ) ? this.item.updated.event : this.item.updated,
                quiet = (typeof this.item.updated === 'object' ) ? !! this.item.updated.quiet : false;

            Echo.channel(this.item.channel)
                .listen(updated_event, (event) => {

                        Bus.$emit(updated_event, event );
                        console.log(updated_event, event);
                        return this.updatedEvent(event, quiet);
                    }
                );

            if ( !! this.item.events ) {
                this.item.events.forEach( ( e ) => {

                    Echo.channel(this.item.channel)
                        .listen( e.event, e.handler )
                })
            }
        },

        ignore() {

        }
    }
}
