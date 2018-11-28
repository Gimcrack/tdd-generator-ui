<template>
    <component
        :is="itemLayout"
        :id="model.id"
        :deleting="deleting"
        :updating="updating"
        :toggles="toggles"
        :meta="meta"
        @view="view"
        @update="update"
        @ToggledHasChanged="$emit('ToggledHasChanged')"
        :item-border="itemBorder"
    >

        <template slot="menu">
            <!--
            <dropdown-item :show="toggles.trello" :busy="busy" @clicked="trello" icon="fa-trello">
                Send To Trello
                <i v-if="trellod || trelloing" class="fa fa-fw ml-2"
                   :class="trellod ? ['fa-check-square-o','text-success'] : ['fa-circle-o-notch','fa-spin']">
                </i>
            </dropdown-item>
            -->
        </template>


        <template slot="popper">
            <!--<div class="d-flex flex-wrap">
                <component
                    v-if="model && model.services.length"
                    v-for="service in model.services"
                    is="service"
                    :columns="{}"
                    item-layout="item-cards"
                    :initial="service"
                    :key="service.id"
                >
                </component>
            </div>-->
        </template>

    </component>
</template>

<script>
    export default {
        mixins : [
            mixins.item
        ],

        data() {
            return {

                /*
                ### Toggle Options
                 */
                toggles : {
                    // show the view info button
                    info : false,

                    // show the update button
                    update : true,

                    // show the delete button
                    delete : false,

                    // is the view link external?
                    view_external : false,
                },

                /*
                ### Item Parameters ###
                 */
                item : {
                    // the name of the primary key
                    key : 'id',

                    // the type of the model
                    type : 'thing',

                    // the api endpoint without prefix
                    endpoint : 'things',

                    // the name of the Echo channel to listen on
                    channel : `things.${this.initial.id}`,

                    // the name of the Updated event
                    updated : 'ThingWasUpdated',
                },


            }
        },

        computed : {

            // the metadata to display for the model
            meta() {

                return [
                    // a string value will just return that corresponding key
                    // e.g. model.name
                    'name',

                    // custom or computed text
                    {
                        text: this.nominal_text,
                    },

                    // dynamic badge, badge text given by key e.g. model.active
                    {
                        key: 'active',
                        badge: true,
                        badge_class: this.model.active === 'yes' ? 'badge-success' : 'badge-danger'
                    },

                    // dynamic badge, custom text
                    {
                        text : this.nominal_text,
                        badge: true,
                        badge_class: this.model.nominal === 'yes' ? 'badge-success' : 'badge-danger'
                    }
                    //'description',
                ]
            },

            itemBorder() {
                return ( !! this.model.nominal ) ? ['btn-success'] : ['btn-danger'];
            },

            nominal_text() {
                let nom = ( !! this.model.nominal ) ? 'Yes' : 'No';

                if ( this.expired_status )
                    return nom + ' - Expired';

                if ( this.stale_status )
                    return nom + ' - Stale';

                return nom;
            }
        },

        methods : {
            update() {
                Bus.$emit('ShowForm', { type : 'service_group', model : this.initial })
            },

            postUpdated(event) {
                this.updating = false;
            },

            view() {
                console.log('View this service group');
            },
        }
    }
</script>