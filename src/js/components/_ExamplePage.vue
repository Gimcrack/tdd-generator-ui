<template>
    <page
        :params="details"
        :toggles="toggles"
        :layouts="layouts"
        @new="create"
        @created="created"
        @deleted="deleted"
    >
        <template slot="menu">
            <!--<button type="button" @click="toggleOpen" class="btn btn-success">Open Only</button>-->
        </template>

        <template slot="selection-dropdown-menu">
            <!--<dropdown-item :show="toggles.update" :busy="page.toggledCount>1" @clicked="page.update" icon="fa-edit">
                Edit
            </dropdown-item>-->
            <!--<dropdown-item :show="toggles.update" @clicked="page.destroyMany" icon="fa-trash">
                Delete
            </dropdown-item>-->
        </template>
    </page>
</template>

<script>
    export default {
        data() {
            return {
                /**
                 *  Placeholder for the page object
                 */
                page : {},

                /**
                 *  Controls to enable
                 */
                toggles : {

                    // allow creation of new records
                    new : true,

                    // allow checklist mode, hiding checked items
                    checklist : false,

                    // enable do with selected dropdown menu
                    do_with_selected : false,
                },

                /**
                 * The layouts to enable
                 *
                 *  default: grid|table
                 */
                layouts : {

                    // column view similar to KANBAN
                    scrum : false,

                    // zoomable cards
                    cards : true,

                    // pinterest style columns
                    grid : true,

                    // tabular layout
                    table : true
                },

                /**
                 * The setup of the page
                 */
                details : {

                    /*
                     Component Parameters
                     */

                    // The type of model
                    type : 'product',

                    // // The name of the Vue Component, if different than the model type
                    // component : 'productComponent',

                    // // Override the model name
                    //model_for_humans : 'Disk',

                    /*
                     Data Parameters
                     */

                    // The api endpoint, without prefix
                    endpoint : 'products',

                    // // the json key of the data e.g. 'data'
                    // data_key : null,

                    // // filtering of the result data
                    // where : {},
                    // reject : { placeholder : 'some-nonsense-value'},

                    /*
                    Display Parameters
                     */

                    columns : [

                        // There are a few different ways to specify the column

                        // using just the key will display the Title Case version of the string
                        'id',   // will display as Id
                        'name', // will display as Name
                        'description',

                        // custom title
                        // {
                        //     title : 'Stoppage', // will display as Stoppage
                        //     key : 'work_stoppage',
                        // },

                        // custom data type and title
                        // {
                        //     title : 'Created',
                        //     key : 'created_at',
                        //     type : 'date'
                        // },

                        // custom title and filter options
                        // {
                        //     title : 'Boolean Value',
                        //     key : 'some_flag',
                        //     options : [
                        //         {
                        //             label : 'Yes',
                        //             id : true
                        //         },
                        //         {
                        //             label : 'No',
                        //             id : false
                        //         }
                        //     ]
                        // }
                    ],

                    // The heading text
                    heading : 'Products',

                    // Help text
                    help : 'Manage Products',

                    // // ordering of the result data
                    // order : 'name',
                    // orderDir : true,

                    // // columns to hide
                    // hidden_columns : [
                    //     'created_at',
                    //     'updated_at'
                    // ],

                    // // The model's identifying column e.g. name
                    // model_friendly : 'name',

                    // // The text to display on the new button
                    // newBtnText : 'New Disk',

                    /*
                    Event Parameters
                     */
                    events : {

                        // the channel to listen on
                        channel : 'products',

                        // the name of the 'Created' event
                        created : 'ProductWasCreated',

                        // the name of the 'Destroyed' event
                        destroyed : 'ProductWasDestroyed',

                        // other events to listen for on the 'disks' channel
                        //  use this patten:
                        //  {
                        //     Event : Handler
                        //  }
                        //  will result in
                        //  Echo.channel('disks')
                        //      .listen(Event,Handler)

                        // other : {
                        //     DiskWasFormatted : (e) => { this.do_something(e) }
                        // },

                        // global events to listen for
                        //  use this patten:
                        //  {
                        //     Event : Handler
                        //  }
                        //  will result in
                        //  Bus.$on(Event,Handler)

                        // global : {
                        //     SomethingHappened : (e) => { this.react(e) },
                        //     SomethingElseHappened : this.do_something,
                        // }
                    }
                },
            }
        },

        methods : {

            // called when New button is clicked
            create() {
                Bus.$emit("ShowForm", { type : "product", model : null });
            },

            // called after a new item is created
            created() {
                console.warn("Created method not implemented on Disks.vue");
            },

            // called after an item is deleted
            deleted() {
                console.warn("Deleted method not implemented on Disks.vue");
            },
        },
    }
</script>
