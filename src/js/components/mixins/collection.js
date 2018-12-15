
export default {

    data() {
        return {
            page_layout : 'page-table',
            busy : false,
            models : [],
            last_refreshed : 'Never',
            refresh_btn_text : 'Refresh',
            search : null,
            orderBy : 'name',
            asc : true,
            timeouts : {}
        }
    },

    mounted() {
        this.listen();

        this.getInitialModels();

        this.getInitialLastRefreshed();
        //this.fetch();
    },

    computed : {
        item_layout() {
            if ( this.page_layout === 'page-table' ) return 'item-table';
            if ( this.page_layout === 'page-grid' ) return 'item-grid';
            if ( this.page_layout === 'page-scrum' ) return 'item-scrum';
            if ( this.page_layout === 'page-cards' ) return 'item-cards';
        },

        filtered() {
            let reject = ( _.isEmpty(this.params.reject) ) ? { placeholder : 'gibberish-value' } : this.params.reject,
                filters = this.filters,
                models = _(this.models)
                    .filter( this.searchModel )
                    .filter( this.params.where )
                    .filter( o => this.applyFilters(filters,o) )
                    .reject( reject )
                    .sortBy( (model) => {
                            let item = this.getItemByModel(model);

                            if ( !! item && item[this.orderBy] ) {
                                return item[this.orderBy]
                            }

                            return model[this.orderBy];
                        }
                    );

            return (this.asc) ? models.value() : models.reverse().value();
        },

        modelType() {
            return this.params.type;
        },

        properType() {
            return this.params.model_for_humans || this.modelType.$ucfirst();
        }
    },

    methods : {

        getInitialState() {
            let key = this.params.endpoint,
                state = INITIAL_STATE[key] || [];

            // get the data if it has a key (like when paginating)
            if ( this.params.data_key ) {
                state = state[this.params.data_key];
            }

            return state || [];
        },

        setToggled() {
            this.toggled = this.getToggled();

            this.$forceUpdate();
        },

        getToggledIds() {
            return this.getToggled().map(o => o.model.id);
        },

        getToggled() {
            if ( ! this.page ) return [];

            if ( ! this.page.$children ) return [];

            return this.getItems()
                .filter( child => child.$children[0])
                .filter( child => child.$children[0].toggled );
        },

        getUntoggled() {
            if ( ! this.page ) return [];

            if ( ! this.page.$children ) return [];

            return this.getItems()
                .filter( child => ! child.$children[0].toggled );
        },

        toggleAll() {
            if ( this.hasToggled ) {
                return this.getToggled().forEach( child => { child.$children[0].toggle() } );
            }

            return this.getUntoggled().forEach( child => { child.$children[0].toggle() } );
        },

        getItems() {
            if ( ! this.page || ! this.page.$children ) {
                return [];
            }

            if ( this.page_layout !== 'page-scrum') {
                return this.page.$children.filter( child => child.$item );
            }

            return this.page.$children
                .filter( child => child.scrumColumn  )
                .map( child => child.$children.filter( grandchild => grandchild.$item ) )
                .flat();
        },

        getItemByModel(model) {
            let item = this.getItems()
                .filter( o => { return !! o.model } )
                .filter( o => o.model.id === model.id );

            return item[0]
        },

        selectedIds() {
            return this.toggled.map( o => o.model.id );
        },

        selectedNames() {
            return this.toggled.map( o => o.model.name );
        },

        fetch() {
            if ( !! this.preFetch )
                this.preFetch();

            if ( !! this.timeouts.fetch )
                clearTimeout(this.timeouts.fetch);

            this.timeouts.fetch = setTimeout( this.performFetch, 1000 );
        },

        performFetch() {
            Api.get( this.params.endpoint, { params : this.$parent.fetch_params || null } )
                .then( this.success, this.error )
        },

        success(response) {
            let data_key = this.params.data_key;
            this.models = (!! data_key) ? response.data[data_key] : response.data;
            this.last_refreshed = Date.now();

            if ( ! this.toggles.dont_cache ) {
                this.cacheModels();
            }

            if ( !! this.postSuccess )
                this.postSuccess();
        },

        done(response) {
            this.busy = false;
        },

        error(error) {
            flash.error('There was an error performing the operation. See the console for more params');
            console.error(error);

            if ( !! this.postError )
                this.postError();
        },

        findModelById(id) {
            return this.models.findIndex( (model) => {
                return model.id === id;
            });
        },

        remove(model) {
            let index = this.findModelById(model.entity.id);
            if ( index > -1 ) this.models.$remove(index);

            flash.warning(`${model.type.$title_case()} Removed: ${model.name}`);

            this.last_refreshed = Date.now();
            this.cacheModels();
        },

        add( model ) {
            //console.log('Calling add model');
            let index = this.findModelById(model.entity.id);

            // if the model exists, replace it
            if ( index > -1 ) {
                // console.log('Updating model');
                this.models[index] = model.entity;
            }
            else {
                // console.log('New model');
                this.models.push(model.entity);
                flash.success(`New ${model.type.$title_case()}: ${model.name}`);
            }

            this.last_refreshed = Date.now();
            this.cacheModels();
        },

        model( event ) {

            //console.log('event',event,this);

            let entity = event[this.modelType],
                friendly = this.params.model_friendly || 'name';

            return {
                entity,
                type : this.properType,
                name : entity[friendly]
            }
        },

        sortBy(key, asc) {

            if ( asc != null ) {
                this.asc = asc;
            }
            else if ( key == this.orderBy ) {
                this.asc = ! this.asc;
            }
            this.orderBy = key;
        },

        listen() {
            Echo.channel(this.params.events.channel)
                .listen( this.params.events.created, (event) => {
                    //console.log('Created',event);

                    this.add( this.model(event) );

                    if ( !! this.postCreated )
                        this.postCreated(event);
                })
                .listen( this.params.events.destroyed, (event) => {
                    //console.log('Destroyed',event);

                    this.remove( this.model(event) );

                    if ( !! this.postDeleted )
                        this.postDeleted(event);
                });

            let other = this.params.events.other;
            if ( !! other ) {
                for( let type in other ) {
                    Echo.channel(this.params.events.channel)
                        .listen( type, (event) => { other[type](event) } );
                }
            }

            let g = this.params.events.global;
            if ( !! g ) {
                for( let type in g ) {

                    if ( typeof g[type] === 'function' )
                    {
                        Bus.$on(type, (event) => { g[type](event) });
                    }
                    else
                    {
                        Bus.$on(type, (event) => { this[g[type]](event) });
                    }

                }
            }
        },

        searchModel( model ) {
            if ( ! this.search ) return true;

            for ( let prop in model )
            {
                if ( typeof model[prop] === "string" )
                {
                    if ( model[prop].toLowerCase().indexOf( this.search.toLowerCase() ) !== -1 ) return true;
                }
                else
                {
                    if ( this.searchModel( model[prop] ) ) return true;
                }
            }

            return false;
        },

        // override these on the instance if you want to customize the behavior

        preFetch() {
            this.busy = true;
            this.refresh_btn_text = 'Refreshing';
        },

        postSuccess() {
            this.refresh_btn_text = 'Refreshed';

            sleep(1000).then( () => {
                this.refresh_btn_text = 'Refresh';
                this.busy = false;
                Bus.$emit('RefreshDone')
            })
        },

        postError() {
            this.busy = false;
            this.refresh_btn_text = 'Refresh';
        },

        applyFilters(filters,row) {
            for( let prop in filters ) {

                //console.log(filters[prop], row[prop]);

                if ( filters[prop].length > 1 ) {
                    if ( filters[prop].indexOf(_.get(row,prop)) === -1 )
                        return false;
                }

                else if ( _.get(row,prop) != filters[prop] )
                    return false;
            }

            return true;
        },

        async getInitialModels() {
            if (this.toggles.dont_cache) return [];

            let models = await Store.get(this.getCacheKey('models'), "[]");

            this.models = (typeof models === "string") ? JSON.parse(models) : models;
        },

        async getInitialLastRefreshed() {
            this.last_refreshed = await Store.get(this.getCacheKey('last_refreshed'), 'Never');
        },

        getCacheKey(key) {
            return `${key}_${this.params.heading}_${window.INITIAL_STATE.user.id}`;
        },

        cacheModels() {
            if ( this.toggles.dont_cache )
                return;

            if ( !! this.timeouts.cache )
            {
                clearTimeout(this.timeouts.cache);
            }

            console.info('Scheduling cache');
            this.timeouts.cache = setTimeout(this.performCache, 5000);
        },

        performCache() {
            if ( this.toggles.dont_cache )
                return;

            console.info('Caching Models');
            Store.set(this.getCacheKey('models'), JSON.stringify(this.models) );
            Store.set(this.getCacheKey('last_refreshed'), this.last_refreshed );
        },

        destroyMany() {
            swal({
                title : "Delete these records?",
                text : "This operation cannot be undone.",
                showCancelButton : true,
            }).then(res => {
                if ( res.dismiss === "cancel" )
                    return;

                this.busy = true;

                Api.delete( this.params.endpoint, { data : { ids : this.getToggledIds() } })
                    .then( this.success, this.error )
            });
        }
    }
}
