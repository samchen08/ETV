TVUI.debug = false;

var readyTime = new Date().getTime();
var connectTime = new Date().getTime();
var statusTime = new Date().getTime();

var __param = TVUI.Util.queryToJson(location.search);
var __page = new TVUI.Page();
ETV.config({
    loader: 'js/loader.min.js',
    seajs: 'js/sea.js',
    server: 'http://172.16.1.55:8011/',
    apps: 'http://172.16.1.55/apps/'
});

var Monitor = {
    init: function () {
        Monitor.render();
        ETV.Engine.on('change', function (status) {
            Monitor.renderStatus(status);
        });


        this.point = 0;
        this.volume = 0;
        this.isMute = false;
        this.playState = 0;
        this.events();

        ETV.Engine.on('appInit', function (loader) {
            new AppLoaderPanel(loader);
        });

        ETV.Engine.on('uninstall', function (apps) {
            apps = $.isArray(apps) ? apps : [apps];
            $.each(apps, function (i, app) {
                var loader = AppLoaderPanel.get(app.appId);
                loader && loader.destroy();
            });

        });

        if (__param.package) {
            $.getJSON(__param.package, function (json) {

                Monitor.packageJSON = json;
                if (json && json.test && ETV.Engine.isMatch(json.test.status || {})) {
                    var app = json.test.init || {};
                    app.appId = new Date().getTime();
                    app.appPackage = __param.package;
                    ETV.Engine.fire('install', app);
                }

                ETV.Engine.on('change', function () {
                    var p = Monitor.packageJSON;
                    if (p && p.test && ETV.Engine.isMatch(p.test.status || {})) {
                        var app = json.test.init || {};
                        app.appId = new Date().getTime();
                        app.appPackage = __param.package;
                        ETV.Engine.fire('install', app);
                    }
                });
            });

        }
    },
    render: function () {
        this.renderStatus(ETV.Engine.status);
        $('#package').html(__param.package || '');
        this.setTime();
    },
    renderStatus: function (status) {
        $('#areaCode').html(status.areaCode || '');
        $('#pageId').html(status.pageId || '');
        $('#channelId').html(status.channelId || '');
        $('#columnId').html(status.columnId || '');
        $('#assetId').html(status.assetId || '');
    },
    setTime: function () {
        var $time = $('#time');
        setInterval(function () {
            $time.html(TVUI.Util.date(new Date(), 'yyyy-MM-dd hh:mm:ss'));
        }, 1000);
    },
    events: function () {
        var _this = this;

        $('#play')[0].onclick = function () {
            Monitor.playState = 1;
            Monitor.renderPoint();
            Monitor.renderPlayState();
        };
        $('#pause')[0].onclick = function () {
            Monitor.playState = 2;
            clearInterval(Monitor._renderPoint);
            Monitor.renderPlayState();
        };
        $('#stop')[0].onclick = function () {
            Monitor.playState = 3;
            clearInterval(Monitor._renderPoint);
            Monitor.point = 0;
            Monitor.renderPlayState();
        };
        $('#mute')[0].onclick = function () {
            Monitor.isMute = !Monitor.isMute;
            if (Monitor.isMute) {
                Monitor._playState = Monitor.playState;
                Monitor.playState = 6;
                Monitor.renderPlayState();
            } else {
                Monitor.playState = Monitor._playState;
                Monitor.renderPlayState();
            }
        };
        $('#volumeUp')[0].onclick = function () {
            Monitor.volume = Monitor.volume < 32 ? ++Monitor.volume : 32;
            Monitor._playState = Monitor.playState;
            Monitor.playState = 6;
            setTimeout(function () {
                Monitor.playState = Monitor._playState;
                Monitor.renderPlayState();
            }, 3000);
            $('#volume').html(Monitor.volume);
            Monitor.renderPlayState();
        };
        $('#volumeDown')[0].onclick = function () {
            Monitor.volume = Monitor.volume > 32 ? --Monitor.volume : 0;
            Monitor._playState = Monitor.playState;
            Monitor.playState = 6;
            setTimeout(function () {
                Monitor.playState = Monitor._playState;
                Monitor.renderPlayState();
            }, 3000);
            $('#volume').html(Monitor.volume);
            Monitor.renderPlayState();
        };
        $('#FF')[0].onclick = function () {
            Monitor.playState = 4;
            Monitor.renderPlayState();
        };
        $('#FR')[0].onclick = function () {
            Monitor.playState = 5;
            Monitor.renderPlayState();
        };
    },
    renderPoint: function () {
        var $point = $('#point');
        this._renderPoint = setInterval(function () {
            $point.html(++Monitor.point);
            ETV.Engine.setPoint(Monitor.point);
        }, 1000);
    },
    renderPlayState: function () {
        $('#palyState').html(Monitor.playState);
        ETV.Engine.setPlayState(Monitor.playState);
    }

};

var AppLoaderPanel = TVUI.Class.create({
    init: function (appLoader) {
        this.id = appLoader.appId;
        this.AppLoader = appLoader;
        this.wrap = $('#appLoaders');
        this.render();
        this.events();
        AppLoaderPanel.set(this);
    },
    render: function () {
        var loader = this.AppLoader;
        var data = {
            appId: loader.app.appId,
            active: loader._active,
            isShow: loader.isShow,
            auto: loader.auto,
            startTime: JSON.stringify(loader.startTime),
            stopTime: JSON.stringify(loader.stopTime),
            startPoint: JSON.stringify(loader.startPoint),
            stopPoint: JSON.stringify(loader.stopPoint),
            playState: JSON.stringify(loader.playState),
            showKey: loader.showKey || '',
            activeKey: loader.activeKey || ''
        };
        var html = TVUI.Util.tpl($('#template').html(), data);
        this.el = $(html);
        this.el.appendTo(this.wrap);
    },
    events: function () {
        var inputs = this.el.find('input');
        var _this = this;
        inputs.each(function () {
            this.onclick = function () {
                switch (this.className) {
                    case 'show':
                        _this.AppLoader.show();
                        break;
                    case 'hide':
                        _this.AppLoader.hide();
                        break;
                    case 'destroy':
                        _this.AppLoader.destroy();
                        _this.el.remove();
                        break;
                    case 'uninstall':
                        _this.AppLoader.uninstall();
                        _this.el.remove();
                        break;
                    case 'active':
                        _this.AppLoader.active();
                        break;
                    case 'unActive':
                        _this.AppLoader.unActive();
                        break;
                    case 'left':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({left: ofs.left + 10});
                        break;
                    case 'right':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({left: ofs.left - 10});
                        break;
                    case 'up':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({top: ofs.top - 10});
                        break;
                    case 'down':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({top: ofs.top + 10});
                        break;
                    case 'zoomUp':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({width: ofs.width * 1.1, height: ofs.height * 1.1});
                        break;
                    case 'zoomDown':
                        var ofs = _this.AppLoader.offset();
                        _this.AppLoader.offset({width: ofs.width * 0.9, height: ofs.height * 0.9});
                        break;
                }
            };
        });

        this.AppLoader.on('install show hide update active unActive', function () {
            _this.el.find('.active').html(_this.AppLoader._active);
            _this.el.find('.isShow').html(_this.AppLoader.isShow);
        });

        this.AppLoader.on('destroy uninstall', function () {
            _this.el.remove();
        });
    },
    destroy: function () {
        this.el.remove();
    }
});

AppLoaderPanel.extend({
    panels: {},
    get: function (id) {
        return this.panels[id];
    },
    set: function (panel) {
        this.panels[panel.id] = panel;
    }
});


ETV.Engine.on('ready', function () {
    connectTime = new Date().getTime();
    statusTime = new Date().getTime();
    readyTime =  new Date().getTime() - readyTime;
    $('#readyTime').html(readyTime+' ms');
    Monitor.init();
});

ETV.Engine.on('socketConnect', function () {
    connectTime = new Date().getTime() - connectTime;
    $('#connectTime').html(connectTime+' ms');

});

ETV.Engine.on('install', function (apps, mapping) {
    TVUI.Util.log('install', apps, mapping);
    statusTime = new Date().getTime() - statusTime;
    $('#statusTime').html(statusTime+' ms');
});

ETV.Engine.on('update', function (apps, mapping) {
    TVUI.Util.log('update', apps, mapping);
});
ETV.Engine.on('uninstall', function (apps, mapping) {
    TVUI.Util.log('uninstall', apps, mapping);
});

ETV.Engine.on('active', function(){

});

ETV.Engine.on('appUnActive appDestroy', function(){
    __page.active();
});
ETV.Engine.on('appActive', function(){
    __page.unActive();
});


ETV.Engine.init($.extend({
    areaCode: 101,
    pageId: "",
    channelId: "",
    columnId: "",
    assetId: ""
}, __param || {}));


