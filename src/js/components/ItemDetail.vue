<template>
    <div v-if="visible" class="item-detail-wrapper">
        <button @click.prevent="cancel" class="btn-close"><i class="fa fa-fw fa-5x fa-times"></i></button>
        <div class="item-detail" :class="{ticket}">
            <div class="card card-default">
                <div class="page-header m-2">
                    <h2>
                        <i class="fa fa-fw fa-exclamation-triangle"></i>
                        Item Detail
                    </h2>
                </div>
                <template v-if="ticket">
                    <div v-if="! busy" class="card-body">
                        <iframe :src="`javascript:window.location.replace('${url}')`" frameborder="0"></iframe>
                    </div>
                    <div v-else class="card-body">
                        <i class="fa fa-fw fa-refresh fa-spin fa-5x"></i>
                    </div>
                </template>

                <template v-else>
                    <div class="card-body">
                        <pre v-html="detail"></pre>
                    </div>
                </template>
                <div class="card-footer">
                    <div class="btn-group">
                        <button :disabled="busy" :class="{disabled:busy}" type="button" @click.prevent="cancel" class="btn btn-primary btn-outline">OK</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    //import pretty from 'prettyprint';

    export default {
        mounted() {
            this.listen();
        },

        data() {
            return {
                visible : false,
                busy : false,
                endpoint : null,
                id : null,
                detail : null,
                ticket : false
            }
        },

        computed : {
            url() {
                if (this.ticket)
                    return `https://isupport.ad.matsugov.us/Rep/Incident/default.aspx?ID=${this.id}`;

                return 'api/v1/' + this.endpoint + '/' + this.id
            }
        },

        methods : {
            listen() {
                Bus.$on('ShowItemDetail', (event) => {
                    this.resetDetail();
                    this.endpoint = event.endpoint;
                    this.id = event.id;
                    this.ticket = !! event.ticket;
                    this.show();
                });
            },

            show() {
                if ( ! this.ticket ) {
                    Api.get(this.endpoint)
                        .then(this.success, this.error);

                    return;
                }

                this.visible = true;
            },

            cancel() {
                this.visible = false;
                this.resetDetail();
            },

            resetDetail() {
                this.busy = false;
                this.endpoint = null;
                this.id = null;
                this.ticket = false;
                this.model = {};
            },

            ignore() {

            },

            success( response ) {
                this.busy = false;
                this.visible = true;
                this.detail = this.pretty(response.data);
            },

            error(error) {
                this.busy = false;
                let message = 'There was an error performing the operation. See the console for more details';
                flash.error(message);
                console.error(error.response);

            },

            pretty(obj) {
                return this.syntaxHighlight(JSON.stringify(obj,undefined,4));
            },

            syntaxHighlight(json) {
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                    var cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }
        }
    }
</script>

<style lang="scss">
    .item-detail {

        &.ticket {
            width: 90%;
            min-height: 90%;

            .card-body {
                height: 76vh;
            }
        }


        .card-heading {
            font-size: 24px;
        }

        .card-footer {
            display: flex;
            justify-content: flex-end;
        }

        .card-body {
            max-height: 76vh;
            overflow-y: auto;
            padding: 0 1em;
            button {
                font-weight: bold;
            }

            iframe {
                width: 100%;
                height: 100%;
                margin: 1em 0;
            }
        }

        .partial-path-form {
            display: flex;

            input {
                flex: 1;
            }

            * + * {
                margin-left: 15px;
            }
        }

        pre {
            //outline: 1px solid #ccc;
            padding: 5px;
            margin: 5px;

            .string { color: green; }
            .number { color: darkorange; }
            .boolean { color: blue; }
            .null { color: magenta; }
            .key { color: red; }
        }

    }

    .item-detail-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        height: 100vh;
        width: 100vw;
        background: rgba(0,0,0,0.3);

        display: flex;
        justify-content: center;
        align-items: center;

        .btn-close {
            position: fixed;
            top: 0;
            right: 0;
            border: none;
            background: none;
            outline: none;

            &:hover {
                color: rgba(0,0,0,0.5);
            }
        }
    }
</style>
