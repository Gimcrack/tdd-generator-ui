
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

                            if ( !! item && _.get(item,this.orderBy) ) {
                                return _.get(item,this.orderBy)
                            }

                            return _.get(model,this.orderBy);
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
            // console.log('Launching Prefetch');

            if ( !! this.preFetch )
                this.preFetch();

            if ( !! this.timeouts.fetch )
                clearTimeout(this.timeouts.fetch);

            // console.log('Setting Prefetch Timeout');
            this.timeouts.fetch = setTimeout( this.performFetch, 1000 );
        },

        performFetch() {

            // console.log('Api Request');
            Api.get( this.params.endpoint, { params : this.$parent.fetch_params || null } )
                .then( this.success, this.error )
        },

        updateModel(model,updated) {

            // do nothing if there are no changes
            if ( _.isEqual(model,updated) ) {
                // console.log('Rows are equal, doing nothing');
                return;
            }

            // console.log('Rows have changed, updating');
            Object.assign(model,updated);
        },

        updateModels(data) {
            // remove models
            this.models.forEach( o => {
                if ( data.findIndex( (oo) => {
                    return o.id === oo.id;
                }) === -1 ) {
                    // console.log('Removing old row');
                    this.models.$remove(this.findModelById(o.id));
                }
            });

            // add models and update
            data.forEach(o => {
                let index = this.findModelById(o.id);

                // add
                if (index === -1) {
                    // console.log('Adding new row');
                    this.models.push(o);
                }

                // update if dirty
                else {
                    // console.log('Updating row');
                    this.updateModel(this.models[index], o);
                }
            });
        },

        success(response) {
            // console.log('Success');

            let data_key = this.params.data_key;

            // update models
            this.updateModels((!! data_key) ? response.data[data_key] : response.data );

            this.last_refreshed = Date.now();

            // console.log('Models are set');

            if ( ! this.toggles.dont_cache ) {
                // console.log('Caching models');
                this.cacheModels();
            }

            // console.log('Executing post success');
            if ( !! this.postSuccess )
                this.postSuccess();
        },

        done(response) {
            this.busy = false;
        },

        error(error) {
            flash.error('There was an error performing the operation. See the console for more params');
            // console.error(error);

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
            // //console.log('Calling add model');
            let index = this.findModelById(model.entity.id);

            // if the model exists, replace it
            if ( index > -1 ) {
                // // console.log('Updating model');
                this.models[index] = model.entity;
            }
            else {
                // // console.log('New model');
                this.models.push(model.entity);
                flash.success(`New ${model.type.$title_case()}: ${model.name}`);
            }

            this.last_refreshed = Date.now();
            this.cacheModels();
        },

        model( event ) {

            // //console.log('event',event,this);

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
                    // //console.log('Created',event);

                    this.add( this.model(event) );

                    if ( !! this.postCreated )
                        this.postCreated(event);
                })
                .listen( this.params.events.destroyed, (event) => {
                    // //console.log('Destroyed',event);

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
            // console.log('Refreshing');
        },

        postSuccess() {
            this.refresh_btn_text = 'Refreshed';

            // console.log('post Success');

            setTimeout( () => {
                this.refresh_btn_text = 'Refresh';
                this.busy = false;

                // console.log('Refresh Done');
                Bus.$emit('RefreshDone')
            }, 300);
        },

        postError() {
            this.busy = false;
            this.refresh_btn_text = 'Refresh';
        },

        applyFilters(filters,row) {
            for( let prop in filters ) {

                let values = _.flatten( [ filters[prop].value ] ),
                    mode = filters[prop].invert ? 'reject' : 'accept',
                    row_value = _.flatten( [ _.get(row,prop) ] );

                if ( mode === 'accept') {
                    if ( ! _.intersection(values, row_value).length ) return false;
                } else  { // reject
                    if ( _.intersection(values, row_value).length ) return false;
                }
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

            // //console.info('Scheduling cache');
            this.timeouts.cache = setTimeout(this.performCache, 5000);
        },

        performCache() {
            if ( this.toggles.dont_cache )
                return;

            // //console.info('Caching Models');
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
