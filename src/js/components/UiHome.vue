<template>
    <div id="home-container" :class="ui.layout">

        <button type="button" @click="toggleRight" :class="{active : showRightMenu, animate : animate.button}"
                class="btn btn-info btn-sm btn-toggle-right-menu">
            <i class="fa fa-fw fa-bars"></i>
        </button>

        <div class="menu-overlay cursor-pointer" @click="toggleRight" :class="{active : showRightMenu}">
            <i class="fa fa-fw fa-times fa-2x mt-5 ml-5"></i>
        </div>

        <div class="column-container">
            <!-- Nav tabs -->
            <ul class="nav nav-tabs tabs-left">

                <nav-tab v-for="tab in menu"
                         :key="tab.id"
                         :id="tab.id"
                         :text="tab.text"
                         :icon="tab.icon"
                         v-if="(!tab.admin && ( !tab.editor || user.editor_flag)) || user.admin_flag"
                         @clicked="selectTab(tab)"
                         :active-tab="activeTab"
                         :has-subnav="tab.sub"
                >
                    {{ tab.label }}
                </nav-tab>

            </ul>

            <div class="tabs-subnav" :class="{active : activeTab.sub}">
                <ul class="nav nav-tabs">
                    <nav-tab v-for="tab in activeTab.sub"
                             :key="tab.id"
                             :id="tab.id"
                             :text="tab.text"
                             :icon="tab.icon"
                             v-if="(!tab.admin && ( !tab.editor || user.editor_flag)) || user.admin_flag"
                             @clicked="selectSub(tab)"
                             :active-tab="activeSub"
                    >
                        {{ tab.label }}
                    </nav-tab>
                </ul>
            </div>

            <div class="left" :class="{subnav : activeTab.sub}"></div>

            <div class="main">
                <!-- Tab panes -->
                <div class="tab-content">
<!--                    <template-->
<!--                            v-for="tab in menu"-->
<!--                    >-->
                        <tab-pane
                                ref="pane"
                                v-if="activeContent && ( (!activeContent.admin && ( !activeContent.editor || user.editor_flag)) || user.admin_flag )"
                                :tab="activeContent"
                                :active-tab="activeContent"
                        >
                        </tab-pane>
<!--                    </template>-->
                </div>
            </div>


            <div class="right">
            </div>

            <div class="right-menu">
                <div class="tabs-right" :class="{active:showRightMenu}">
                    <ul class="nav nav-jeremy nav-fill w-100 mb-4">
                        <li class="nav-item">
                            <a href="#" @click.prevent="updateUi('rightActive','settings')" class="nav-link" :class="{active:ui.rightActive=='settings'}">
                                <i class="fa fa-fw fa-gears"></i> Settings
                            </a>
                        </li>
                        <li class="nav-item" :class="{animate:animate.chat}">
                            <a href="#" @click.prevent="updateUi('rightActive','chat'); animate.chat = false;" class="nav-link" :class="{active:ui.rightActive=='chat'}">
                                <i class="fa fa-fw fa-comment"></i> Chat
                            </a>
                        </li>
                        <li class="nav-item" :class="{animate:animate.notifications}">
                            <a href="#" @click.prevent="updateUi('rightActive','notifications'); animate.notifications = false" class="nav-link" :class="{active:ui.rightActive=='notifications'}">
                                <i class="fa fa-fw fa-bell"></i> Notifications
                            </a>
                        </li>
                    </ul>


                    <template v-if="ui.rightActive=='settings'">
                        <div class="p-4 w-100">
                            <div class="w-100 mb-4">
                                <div class="p-2 w-100 mb-2 d-flex align-items-center justify-content-center flex-column">
                                    <img class="avatar mb-3 border border-info" :src="this.avatar_image" alt="">
                                    <h4 class="mb-0">
                                        <i class="fa fa-fw fa-user"></i>
                                        <span class="mr-1">{{ short_name }}</span>
                                        <span v-if="user.admin_flag" class="badge badge-danger">Admin</span>
                                        <span v-if="user.editor_flag" class="badge badge-warning">Editor</span>
                                    </h4>
                                </div>

                                <div class="p-2 d-flex justify-content-center">
                                    <a class="btn btn-info mr-2" href="/logout"
                                       onclick="event.preventDefault();
                                             document.getElementById('logout-form').submit();">
                                        <i class="fa fa-fw fa-sign-out"></i> Logout
                                    </a>

                                    <a class="btn btn-info" href="#"
                                       onclick="event.preventDefault();
                                             Bus.$emit('ShowPasswordForm')">
                                        <i class="fa fa-fw fa-refresh"></i> Reset Password
                                    </a>
                                </div>
                            </div>

<!--                            <div class="w-100 mb-2 border-bottom border-info">-->
<!--                                <div class="p-2 d-flex justify-content-center">-->
<!--                                    <span class="flex-grow-1 align-self-center">Layout</span>-->
<!--                                    <div class="btn-group" role="group">-->
<!--                                        <button type="button" @click="updateUi('layout','wide')" class="btn btn-sm btn-info" :class="{active : ui.layout=='wide'}">-->
<!--                                            <i class="fa fa-fw fa-desktop"></i> Wide-->
<!--                                        </button>-->
<!--                                        <button type="button" @click="updateUi('layout','narrow')" class="btn btn-sm btn-info" :class="{active : ui.layout=='narrow'}">-->
<!--                                            <i class="fa fa-fw fa-tablet"></i> Narrow-->
<!--                                        </button>-->
<!--                                    </div>-->
<!--                                </div>-->
<!--                            </div>-->
                            <div class="w-100 mb-2 border-bottom border-info">
                                <div class="p-2 d-flex justify-content-center">
                                    <div class="flex-grow-1 align-self-center">Theme</div>
                                    <div class="btn-group" role="group">
                                        <button type="button" @click="updateUi('theme','dark')" class="btn btn-sm btn-info" :class="{active : ui.theme=='dark'}">
                                            <i class="fa fa-fw fa-moon-o"></i> Dark
                                        </button>
                                        <button type="button" @click="updateUi('theme','light')" class="btn btn-sm btn-info" :class="{active : ui.theme=='light'}">
                                            <i class="fa fa-fw fa-sun-o"></i> Light
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="w-100 mb-2 border-bottom border-info">
                                <div class="p-2 d-flex justify-content-center">
                                    <div class="flex-grow-1 align-self-center">Data View</div>
                                    <div class="btn-group" role="group">
                                        <button type="button" @click="updateUi('view','normal')" class="btn btn-sm btn-info" :class="{active : ui.view=='normal'}">
                                            <i class="fa fa-fw fa-list-ul"></i> Normal
                                        </button>
                                        <button type="button" @click="updateUi('view','compact')" class="btn btn-sm btn-info" :class="{active : ui.view=='compact'}">
                                            <i class="fa fa-fw fa-list"></i> Compact
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="w-100 mb-2 border-bottom border-info">
                                <div class="p-2 d-flex justify-content-center">
                                    <div class="flex-grow-1 align-self-center">Effects</div>
                                    <div class="btn-group" role="group">
                                        <button type="button" @click="updateUi('effects','on')" class="btn btn-sm btn-info" :class="{active : ui.effects=='on'}">
                                            <i class="fa fa-fw fa-toggle-on"></i> On
                                        </button>
                                        <button type="button" @click="updateUi('effects','off')" class="btn btn-sm btn-info" :class="{active : ui.effects=='off'}">
                                            <i class="fa fa-fw fa-toggle-off"></i> Off
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="w-100 mb-2 border-bottom border-info">
                                <div class="p-2 d-flex justify-content-center">
                                    <div class="flex-grow-1 align-self-center">Troubleshooting</div>
                                    <div class="d-flex flex-column">
                                        <div class="btn-group flex-grow-1 mb-2" role="group">
                                            <button type="button" @click="clearCache" class="btn btn-sm btn-info flex-grow-1">
                                                <i class="fa fa-fw fa-exclamation-triangle"></i> Clear Local Cache
                                            </button>
                                        </div>
                                        <div class="btn-group flex-grow-1" role="group">
                                            <button type="button" @click="clearServerCache" class="btn btn-sm btn-info">
                                                <i class="fa fa-fw fa-exclamation-triangle"></i> Clear Server Cache
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-if="ui.rightActive=='chat'">
                        <chats :user="user"></chats>
                    </template>

                    <template v-if="ui.rightActive=='notifications'">
                        Notifications go here.
                    </template>

                </div>

            </div>
        </div>

        <item-detail></item-detail>
        <slot></slot>
        <vform></vform>
    </div>
</template>

<script>
    export default {
        props : {
            menu : {
                required : true,
                default() {
                    return {}
                }
            }
        },

        data() {
            return {
                activeSub: {},
                activeTab: {},

                showRightMenu: false,
                user: INITIAL_STATE.user,

                animate: {
                    button: false,
                    chat: false,
                    notifications: false
                },

                ui: {
                    layout: 'wide',
                    theme: 'light',
                    view: 'normal',
                    rightActive: 'settings',
                    effects: 'on',
                }
            }
        },


        mounted() {
            this.setInitialTab();

            window.addEventListener('popstate', (event) => {
                if ( event.state && event.state.tab )
                {
                    this.nav(event.state.tab);
                }
            });


            Bus.$on('ChatMessageReceived', () => {
                if ( ! this.showRightMenu ) {
                    this.animate.button = true;
                    this.animate.chat = true;
                } else if ( this.rightActive !== 'chat' ) {
                    this.animate.chat = true;
                }
            });

            this.getUISettings();

            this.refreshUi();
        },

        computed : {
            avatar_image() {
                return 'https://www.gravatar.com/avatar/' + this.user.email_hash + '.png?s=512&';
            },

            short_name() {
                return this.user.name.split(' ').slice(0,2).map( (name,i) => { return !i ? name : name.slice(0,1) }).join(' ');
            },

            activeContent() {
                return ( this.activeSub.id ) ? this.activeSub : this.activeTab;
            }
        },

        methods : {

            clearCache() {
                Store.clearModels();
            },

            clearServerCache() {
                Api.post('clearServerCache')
                    .then(o => {
                        flash.success('Server Cache Cleared');
                    })
            },

            checkPermissions(tab) {
                if ( ! tab )
                    return false;

                if ( tab.admin && ! this.user.admin_flag )
                    return false;

                if ( tab.editor && ! ( this.user.editor_flag || this.user.admin_flag ) )
                    return false;

                return true;
            },

            selectTab(tab) {
                if ( ! this.checkPermissions(tab))
                    return true;

                this.activeTab = tab;
                this.activeSub = {};

                if ( tab.sub ) {
                    this.selectSub( tab.sub[0] );
                }

                this.history();
            },

            selectSub(tab) {
                if ( ! this.checkPermissions(tab))
                    return true;

                this.activeSub = tab;

                this.history();
            },

            toggleRight() {
                this.showRightMenu = ! this.showRightMenu;
                this.animate.button = false;
            },

//            nav(tab, event) {
//                this.activeTab = tab;
//
//                this.history();
//                $('.nav-tabs').find('.active').removeClass('active').end().find(`#${tab}-tab`).closest('li').addClass('active');
//                $('.tab-content').find('.active').removeClass('active').end().find(`#${tab}-pane`).addClass('active');
//            },
//
//            subnav(tab, event) {
//
//                this.activeSubnav = tab;
//            },

            history() {
                let sub = this.activeSub || null,
                    tab = this.activeTab,
                    url = ( !! sub.id ) ? `/#/${tab.id}/${sub.id}` : `/#/${tab.id}`,
                    title = ( !! sub.id ) ? `${tab.id.$ucfirst()} - ${sub.id.$ucfirst()}` : tab.id.$ucfirst(),
                    parser = document.createElement('a'),
                    pathname;

                parser.href = window.location.href;
                pathname = parser.pathname.replace(/\/$/,'');

                history.pushState( {tab : tab, sub : sub}, title, pathname + url);


            },

            setInitialTab() {
                let tab = location.hash.replace('#/','');
                if ( !! tab )
                {
                    let parts = tab.split('/'),
                        selectedTab = this.menu.filter(o => o.id === parts[0])[0],
                        selectedSub = ( parts[1] ) ? selectedTab.sub.filter( o => o.id === parts[1] )[0] : null;

                    if ( ! ( this.checkPermissions(selectedTab) || this.checkPermissions(selectedSub) ) )
                        return this.setDefaultTab();

                    if ( selectedTab )
                        this.selectTab( selectedTab );

                    if( selectedSub )
                        this.selectSub( selectedSub );
                }
                else {
                    this.setDefaultTab();
                }
            },

            setDefaultTab() {
                sleep(500).then(() => {
                    this.selectTab( this.menu.filter(tab => this.checkPermissions(tab))[0] );
                });
            },

            getUISettings() {
                this.getSetting('layout', 'wide');
                this.getSetting('theme', 'light');
                this.getSetting('view', 'normal');
                this.getSetting('rightActive', 'settings');
                this.getSetting('effects', 'on');
            },

            async getSetting(setting, def) {
                let value = await Store.get(setting);

                return this.updateUi(setting, (value == null) ? def : value );
            },

            setSetting(setting, value) {
                return Store.set(setting, value);
            },

            updateUi(setting, value) {
                this.ui[setting] = value;
                this.setSetting(setting,value);
                this.refreshUi();
            },

            refreshUi() {
                // layout

                // theme
                $('body').removeClass('light-theme').removeClass('dark-theme').addClass( `${this.ui.theme}-theme` );

                // view
                $('.table').removeClass('table-sm').addClass( (this.ui.view === 'compact') ? 'table-sm' : '' );

                // effects
                $('body').toggleClass('no-effects',this.ui.effects === 'off');
            },

            showInOut() {
                Bus.$emit('ShowInOutBoard');
            }
        },
    }
</script>

<style lang="scss">
    $padding: 4em;

    .menu-overlay {
        position: fixed;
        top: 0;
        width:100vw;
        height: 100vh !important;
        z-index: 4;
        background: rgba(0,0,20,0.0);
        display: none;
        cursor: pointer;

        & > * {
            cursor: pointer;
        }

        transition: all 0.1s linear;

        &.active {
            display: block;
            background: rgba(0,0,20,0.3);
        }
    }

    #home-container {
        //background: $body-bg;
        //width: 1400px;
        padding: 0;

        .avatar {
            border-radius: 100%;
            height:185px;
            width:185px;
        }

        .view-toggles {
            //position: fixed;
            //top: 10px;
            //right: 4em;

            z-index: 3;
        }

        &.narrow {

            .column-container {
                margin: 0 auto;

                .main {
                    max-width: 1100px;
                    //transition: width 0.3s linear;
                    width:70vw;
                }

                .tabs-left {
                    width:18vw;
                    max-width:380px;
                }
            }
        }

        .column-container {
            position: relative;
            display: flex;

            .left {
                flex: 1;
                min-width: $padding + (70/16) * 1em;
                transition: all 0.1s linear;

                &.subnav {
                    min-width: 16.75em;
                }
            }

            .right {
                flex: 1;
                transition: all 0.3s linear;
            }

            .main {
                margin: 0 7em;
                max-width: 1800px;
                width:90vw;
                transition: all 0.3s linear;
            }

            .tabs-left {
                position: fixed !important;
                padding-top: $padding !important;
                transition: all 0.3s linear;
                width: 135px; //$padding + (70/16) * 1em;
                flex:1;
            }

            .tabs-left, .tabs-right {
                position: relative;
                height: calc(100vh - 50px) !important;

                //position: fixed;
                margin-top: 52px;
                padding-left: 1em;
                z-index: 2;

                display: flex;
                flex-direction:column;
                //justify-content:flex-end;
                align-items: flex-end;


            }

            .tabs-right {
                position: fixed;
                display: flex;
                flex-direction: column;
                right:-348px;
                padding:0;

                width:350px;
                z-index: 5;
                transition: all 0.1s linear;

                &.active {
                    right: 0;
                }
            }
        }

        .nav-tabs li:not(.active) a {
            cursor: pointer;
        }

        .btn-toggle-right-menu {
            position: fixed;
            z-index: 2;
            top: 12px;
            right: 12px;

            &.animate {
                animation: color 4s linear 0s infinite normal;
            }
        }

        .nav-item.animate {
            animation: color-tab 4s linear 0s infinite normal;
        }

        .table th, .table td {
            transition: all 0.3s linear;
        }
    }
</style>