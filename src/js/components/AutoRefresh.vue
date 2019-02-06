<template>
    <div>
        <div @click="toggleDropDown" :class="{active : dropdownOpen}" class="dropdown-wrapper"></div>
        <div class="btn-group">
            <button type="button" @click="toggleDropDown"
                    :class="active ? ['btn-success','active'] : ['btn-secondary']" class="btn border-right-0 z-0">
                <i class="fa fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu p-2 w-0 header-menu"
                 :class="{show : dropdownOpen}"
            >
                <div class="d-flex flex-column">
                    <button type="button" @click="disableAutoRefresh" class="btn btn-link">Off</button>
                    <button type="button" @click="enableAutoRefresh(5000,'5 sec')" class="btn btn-link">5 sec</button>
                    <button type="button" @click="enableAutoRefresh(15000,'15 sec')" class="btn btn-link">15 sec</button>
                    <button type="button" @click="enableAutoRefresh(30000,'30 sec')" class="btn btn-link">30 sec</button>
                    <button type="button" @click="enableAutoRefresh(60000,'1 min')" class="btn btn-link">1 min</button>
                    <button type="button" @click="enableAutoRefresh(300000,'5 min')" class="btn btn-link">5 min</button>
                    <button type="button" @click="enableAutoRefresh(1500000,'15 min')" class="btn btn-link">15 min</button>
                </div>
            </div>
            <button type="button" @click="toggleActive" :class="active ? ['btn-success','active'] : ['btn-secondary']" class="btn z-0">
                <i class="fa fa-fw fa-toggle" :class="[active ? 'fa-toggle-on' : 'fa-toggle-off']"></i>
                Auto-Refresh: {{ labelText }}
            </button>
        </div>
    </div>
</template>

<script>
    export default {

        data() {
            return {
                active : false,
                rate : 300000,
                rateFriendly : '5 min',
                intervals : [],
                dropdownOpen : false,
                countdown : -1,
                paused : false
            }
        },

        async mounted() {
            this.init();

            Bus.$on('RefreshDone', () => {
                if ( this.active )
                    this.resume();
            });

            this.active = await Store.get( this.getCacheKey('auto_refresh_active'), false );
            this.rate = await Store.get( this.getCacheKey('auto_refresh_rate'), 300000);
            this.rateFriendly = await Store.get( this.getCacheKey('auto_refresh_rate_friendly'),'5 min');
        },

        methods : {

            getCacheKey(key) {
                return `${key}_autorefresh_${this.$parent.params.heading}_${window.INITIAL_STATE.user.id}`;
            },

            toggleDropDown() {
                this.dropdownOpen = ! this.dropdownOpen;
            },

            init() {
                if ( this.active )
                    return this.enableAutoRefresh(this.rate, this.rateFriendly);

                this.disableAutoRefresh();
            },

            toggleActive() {
                if (this.active)
                    return this.disableAutoRefresh();

                return this.enableAutoRefresh(this.rate,this.rateFriendly);
            },

            disableAutoRefresh() {
                this.active = false;
                Store.set( this.getCacheKey('auto_refresh_active'), false );

                if ( this.intervals.countdown )
                    clearInterval(this.intervals.countdown);

                this.disableCountdown();
            },

            enableAutoRefresh(rate,rateFriendly) {
                this.active = true;
                this.rate = rate;
                this.rateFriendly = rateFriendly;

                if ( this.intervals.countdown )
                    clearInterval(this.intervals.countdown);

                this.countdown = this.rate;

                this.intervals.countdown = setInterval(this.advanceCountdown,1000);

                Store.set( this.getCacheKey('auto_refresh_active'), true );
                Store.set( this.getCacheKey('auto_refresh_rate'), this.rate);
                Store.set( this.getCacheKey('auto_refresh_rate_friendly'), this.rateFriendly);
                this.$emit('countdown',this.rate);
            },

            resume() {
                this.paused = false;
                this.countdown = this.rate;
                this.$emit('countdown',this.countdown);
            },

            refresh() {
                this.$emit('refresh');
                this.paused = true;
            },

            advanceCountdown() {

                // check if we're waiting for refresh
                if (this.paused)
                    return;

                this.$emit('countdown', this.countdown);

                this.countdown -= 1000;

                // countdown lapsed, refresh and reset.
                if (this.countdown === 0) {
                    this.refresh();
                }

                this.$emit('countdown', this.countdown);
            },

            disableCountdown() {
                this.countdown = -1;
                this.$emit('countdown', this.countdown);
            }
        },

        computed : {
            labelText() {
                return ( this.active ) ? this.rateFriendly : 'Off';
            }
        }
    }
</script>

<style lang="scss">
    .auto-refresh {
        z-index: 0;
    }
</style>