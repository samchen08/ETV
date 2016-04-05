(function ($, TVUI, global) {

    var ETV = {
            version: '1.1.0'
        },
        CA = {
            GZ: [1, 999], //广州
            SZ: [1000, 1199],//深圳
            ZH: [1200, 1399], //珠海
            ST: [1400, 1599],//汕头
            FS: [1600, 2099], //佛山
            SG: [2200, 2399],//韶关
            ZJ: [2400, 2599],//湛江
            ZQ: [2600, 2799],//肇庆
            JM: [2800, 2999],//江门
            MM: [3000, 3199],//茂名
            HZ: [3200, 3399],//惠州
            MZ: [3400, 3599],//梅州
            SW: [3600, 3799],// 汕尾
            HY: [3800, 3999],//河源
            YJ: [4000, 4199],//阳江
            QY: [4200, 4399],//清远
            DG: [4400, 5399],//东莞
            ZS: [5400, 6399],//中山
            CZ: [6400, 6599],//潮州
            JY: [6600, 6799],//揭阳
            YF: [6800, 6999]//云浮
        },

    //需要预加载的app
        _PreloadApps = {},

    //app加载器缓存
        _AppLoaders = {};


    window._PreloadApps = _PreloadApps;


    ETV.CA = CA;

    ETV.client = new Date().getTime();

    //配置信息
    ETV.__config = {
        //WebsSocket服务器地址
        server: 'http://172.16.159.137:8011/',

        //apps目录地址
        apps: 'http://172.16.159.137/APPS/',

        //预加载最大时间，单位分
        preloadMaxTime: 30,

        //定时检查预加载频率，单位秒
        schedulePreLoadTime: 30,

        //状态轮询时间间隔，单位秒
        statusInterval: 3 * 60,

        //app启动js地址
        loader: 'http://172.16.159.137/NewFrameWork/web/js/etv/loader.min.js',

        seajs: 'http://172.16.159.137/NewFrameWork/web/sdk/sea.js',

        //缺省的icNo
        icNo: '8002002601164723',

        areaCode: '',

        activeClassName: 'etv-app-active',

        //消息常量
        message: {
            INSTALL: {type: 1, msg: 'installed'},
            SHOW: {type: 2, msg: 'showed'},
            HIDE: {type: 3, msg: 'hided'},
            DESTROY: {type: 4, msg: 'destroyed'},
            UNINSTALL: {type: 5, msg: 'uninstalled'},
            UPDATE: {type: 6, msg: 'updated'}
        },
        playState: {
            INIT: 0, //播放器等待播放
            PLAYING: 1, //播放中
            PAUSE: 2, //暂停
            STOP: 3,//停止
            FF: 4,//快进
            FR: 5, //快退
            VOLUME: 6
        }
    };

    /**
     * 修改配置函数
     * @param options
     */
    ETV.config = function (options) {
        $.extend(ETV.__config, options || {});
    };

    /**
     * 引擎对象类
     * @type {{init: init, tasks: tasks, connectSocket: connectSocket, sendStatus: sendStatus, sendMessage: sendMessage, setStatus: setStatus, getStatus: getStatus, setPlayState: setPlayState, setChannelId: setChannelId, setAssetId: setAssetId, setPoint: setPoint, getLoader: getLoader, findLoader: findLoader, getLoaders: getLoaders}}
     */
    ETV.Engine = {
        /**
         * 初始化引擎
         * @param status {icNo, account, areaCode, pageId, columnId, channelId, assetId} 可选
         */
        init: function (status) {
            /**
             * 终端和应用状态 {icNo, areaCode, pageId, columnId, channelId, assetId} 可选
             */
            this.status = $.extend({
                icNo: TVUI.API.CA.icNo || ETV.__config.icNo,
                areaCode: TVUI.API.DataAccess.info('VodApp', 'QAMName1') || ETV.__config.areaCode,
                pageId: '',
                columnId: '',
                channelId: '',
                assetId: ''
            }, status || {});

            this.sendStatus();

            this.schedulePreLoad();

            //如果状态发送变化，发送状态到服务器
            this.on('change', function () {
                ETV.Engine.sendStatus();
            });

            //轮询状态
            setInterval(function () {
                ETV.Engine.sendStatus();
            }, ETV.__config.statusInterval * 1000);

            this.fire('ready');


        },

        /**
         * 排期预加载app
         * @param app
         */
        addPreLoad: function (app) {

            //当前时间转换成分钟
            var now = parseInt(new Date().getTime() / 1000 / 60);
            //如果app有绝对启动时间
            if (app.startTime && app.startTime.length > 0) {
                //把第一个启动时间转换成分钟
                var startTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.startTime))[0] / 60;

                //启动时间和当前分钟时间差
                var diff = startTime - now;

                //如果时间差大大于0，即时间超过1分钟
                if (diff > 0) {
                    //在30分钟内随机数, 至少提前1分钟加载
                    var rnd = Math.ceil(Math.random() * Math.min(ETV.__config.preloadMaxTime, diff));
                    _PreloadApps[app.appId] = {
                        app: app,
                        installTime: startTime - rnd, //单位分钟
                        state: 0 // 0未加载，1加载中，2加载完成
                    };

                } else {
                    var stopTime = 0;
                    if (app.stopTime && app.stopTime.length > 0) {
                        stopTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.stopTime))[0] / 60;
                    }
                    //无结束时间或未过期
                    if (stopTime === 0 || now < stopTime) {
                        _PreloadApps[app.appId] = {
                            app: app,
                            installTime: now, //单位分钟
                            state: 1 // 0未加载，1加载中，2加载完成
                        };
                        this.fire('install', app);
                    }
                }

            } else {
                _PreloadApps[app.appId] = {
                    app: app,
                    installTime: now, //单位分钟
                    state: 1 // 0未加载，1加载中，2加载完成
                };
                this.fire('install', app);
            }
        },

        /**
         * 定时执行预加载，30秒检查一次
         */
        schedulePreLoad: function () {

            setInterval(function () {
                //当前时间分钟数
                var now = parseInt(new Date().getTime() / 1000 / 60);
                $.each(_PreloadApps, function (i, preApp) {
                    if (preApp.state === 0 && preApp.installTime == now) {
                        ETV.Engine.fire('install', preApp.app);
                    }

                });

            }, ETV.__config.schedulePreLoadTime * 1000);

            this.on('appInstall', function (loader) {
                var preApp = _PreloadApps[loader.app.appId];
                if (preApp) {
                    preApp.state = 2;
                }
            });


        },

        /**
         * 分析最新状态下的app和正在预加载中的app，找出新增、更新、删除了的app
         * @param apps
         * @returns {{install: Array, update: Array, uninstall: Array}}
         */
        analysisStatus: function (apps) {

            var install = [], update = [], uninstall = [];

            var preApps = _PreloadApps;

            if (apps && apps.length > 0) {
                $.each(apps, function (i, newApp) {
                    var matchApp = null;
                    $.each(preApps, function (j, oldApp) {
                        if (newApp.appId == oldApp.app.appId) {
                            matchApp = oldApp.app;
                            return false;
                        }
                    });
                    if (matchApp) {
                        if (JSON.stringify(matchApp) != JSON.stringify(newApp)) {
                            update.push(newApp);
                        }
                    } else {
                        install.push(newApp);
                    }

                });

                $.each(preApps, function (i, oldApp) {
                    var matchApp = null;
                    $.each(apps, function (j, newApp) {
                        if (newApp.appId == oldApp.app.appId) {
                            matchApp = newApp;
                            return false;
                        }
                    });
                    if (!matchApp) {
                        uninstall.push(oldApp.app);
                    }
                });

            } else {
                $.each(preApps, function (i, preApp) {
                    uninstall.push(preApp.app);
                });
            }
            return {
                install: install,
                update: update,
                uninstall: uninstall
            };
        },


        /**
         * 根据分析结果，更新预加载app
         * @param result
         */
        updatePreLoad: function (result) {

            $.each(result.install, function (i, app) {
                ETV.Engine.addPreLoad(app);
            });

            $.each(result.update, function (i, app) {
                if (_PreloadApps[app.appId].state > 0) {
                    ETV.Engine.fire('destroy', app);
                }
                delete _PreloadApps[app.appId];
                ETV.Engine.addPreLoad(app);
            });

            $.each(result.uninstall, function (i, app) {
                if (_PreloadApps[app.appId].state > 0) {
                    ETV.Engine.fire('destroy', app);
                }
                delete _PreloadApps[app.appId];
            });

        },


        /**
         * 向服务器发送状态
         */
        sendStatus: function () {
            $.post(ETV.__config.server + 'status', this.status, function (apps) {
                try {
                    apps = JSON.parse(apps);
                } catch (e) {
                    apps = [];
                }
                apps = $.isArray(apps) ? apps : [apps];
                var result = ETV.Engine.analysisStatus(apps);
                ETV.Engine.updatePreLoad(result);

            });


        },


        /**
         * 向服务器发送消息
         * @param message
         */
        sendMessage: function (message) {
            $.post(ETV.__config.server + 'message', message);
        },
        /**
         * 设置状态
         * @param status
         */
        setStatus: function (status) {
            this.status = $.extend(this.status, status || {});
            this.fire('change', this.status);
        },

        /**
         * 获取状态
         * @returns {*}
         */
        getStatus: function () {
            return this.status;
        },

        /**
         * 设置播放器播放状态
         * @param state
         */
        setPlayState: function (state) {
            if (this.playState !== state) {
                this.playState = state;
                this.fire('playState', this.playState);
            }
        },
        /**
         * 设置状态的频道id
         * @param id
         */
        setChannelId: function (id) {
            if (this.status.channelId !== id) {
                this.status.channelId = id;
                this.fire('change', this.status);
            }
        },
        /**
         * 设置状态的媒资id
         * @param id
         */
        setAssetId: function (id) {
            if (this.status.assetId !== id) {
                this.status.assetId = id;
                this.fire('change', this.status);
            }
        },
        /**
         * 设置状态媒资的播放时间点
         * @param point
         */
        setPoint: function (point) {
            if (this.currentPoint !== point) {
                this.currentPoint = point;
                this.fire('point', this.currentPoint);
            }
        },

        /**
         * 获取app加载器，如果不存在即创建
         * @param app
         * @returns {*|ETV.Loader}
         */
        getLoader: function (app) {
            return _AppLoaders[app.appId] || new ETV.Loader(app);
        },
        /**
         * 根据appId查找Loader
         * @param appId
         * @returns {*}
         */
        findLoader: function (appId) {
            return _AppLoaders[appId];
        },
        /**
         * 获取当前页面全部加载器
         * @returns {{}}
         */
        getLoaders: function () {
            return _AppLoaders;
        },
        /**
         * 判断策略是否和状态匹配
         * @param mapping
         * @returns {boolean}
         */
        isMatch: function (mapping) {
            var status = this.status;
            var match = true;
            delete mapping.deployId;
            delete mapping.profileId;
            $.each(mapping, function (key, value) {
                if (value) {
                    if (key == 'areaCode') {
                        match = value == ETV.Util.getCA(status[key]);
                    } else {
                        match = value == status[key];
                    }
                }
            });
            return match;

        },

        /**
         * 修复主应用和引擎的事件冲突
         */
        fixMainAppEvent: function () {

            // 先复制主应用可能用到的事件
            var keyUpHandler = document.onkeyup || function () {
                };
            var keyDownHandler = document.onkeydown || function () {
                };
            var keyPressHandler = document.onkeypress || function () {
                };

            //清除主应用的事件处理函数
            document.onkeyup = document.onkeydown = document.onkeypress = function () {
                return false;
            };


            //用来触发还原主应用的事件
            var fireEvent = function (e, handler) {
                var keyCodes = [];
                //遍历当前页面的正在启动的app
                $.each(_AppLoaders, function (id, loader) {
                        //如果app是活动状态，就需要判断是否有注册按键
                        if (loader._active) {
                            //拿到app的事件按键键值，并合并成数组
                            keyCodes = keyCodes.concat(loader.keyCodes);
                        }
                    }
                );
                //如果当前事件的按键键值不在数组里，就触发主应用原来的事件
                if ($.inArray(e.which, keyCodes) == -1) {
                    handler(e);
                }
            };

            TVUI.Event.on('keydown', function (e) {
                fireEvent(e, keyDownHandler);
            });

            TVUI.Event.on('keyup', function (e) {
                fireEvent(e, keyUpHandler);
                fireEvent(e, keyPressHandler);
            });


        },

        /**
         * 销毁所有app
         */
        clearLoaders: function () {
            $.each(_AppLoaders, function (id, loader) {
                loader && loader.destroy();
            });
        },
        /**
         * 设置扩展属性
         * @param name
         * @param value
         */
        setExt: function (name, value) {
            if (this.__ext) {
                this.__ext = {};
            }
            this.__ext[name] = value;
        }
    };

    $.extend(ETV.Engine, TVUI.Base);

    /**
     * 辅助工具函数
     * @type {{}}
     */
    ETV.Util = {
        /**
         * 在页面上创建iframe
         */
        appendFrame: function (iframe) {
            document.body.appendChild(iframe);
            var contentWindow = iframe.contentWindow;

            var doc = contentWindow.document,
                onload = 'var d = document;d.getElementsByTagName(\'head\')[0].appendChild(d.createElement(\'script\')).src=\'' + ETV.__config.loader + '\'';

            doc.open().write('<body onload="' + onload + '">');
            doc.close();
            iframe.style.cssText = 'position: absolute;top:-1px;left:-1px; width:1px;height:1px; border:none; display:none;z-index:9999;';
            return contentWindow;


        },
        /**
         * 加载html
         * @param file
         * @param basePath
         * @param contentWindow
         * @param callback
         */
        loadHTML: function (file, basePath, contentWindow, callback) {
            if (file) {
                var url = /^http\:\/\//.test(file) ? file : basePath + file;
                if (contentWindow.document) {
                    $.get(url, function (html) {
                        contentWindow.document.body.innerHTML = html;
                        callback && callback();
                    });
                }
            }
        },
        /**
         * 加载css
         * @param files
         * @param basePath
         * @param contentWindow
         */
        loadCSS: function (files, basePath, contentWindow) {
            if (files && files.length > 0) {
                if (contentWindow.document) {
                    var head = contentWindow.document.getElementsByTagName('head')[0];
                    files = $.isArray(files) ? files : [files];
                    $.each(files, function (i, item) {
                        var link = contentWindow.document.createElement('link'),
                            url = /^http\:\/\//.test(item) ? item : basePath + item;
                        link.setAttribute('rel', 'stylesheet');
                        link.setAttribute('href', url);
                        head.appendChild(link);
                    });
                }
            }
        },
        /**
         * 加载js
         * @param files
         * @param basePath
         * @param contentWindow
         */
        loadScript: function (files, basePath, contentWindow) {
            if (files && files.length > 0) {
                files = $.isArray(files) ? files : [files];
                $.each(files, function (i, item) {
                    var url = /^http\:\/\//.test(item) ? item : basePath + item;
                    contentWindow.seajs.use(url, function (app) {
                        contentWindow.__etv_app__ = app;
                        if (app && app.init) {
                            app.init();
                        }
                    });
                });
            }
        },
        /**
         * 加载页面
         * @param page
         * @param AppLoader
         */
        loadPage: function (page, AppLoader) {
            ETV.Util.loadHTML(page.html, AppLoader.basePath, AppLoader.contentWindow, function () {
                ETV.Util.loadScript(page.js, AppLoader.basePath, AppLoader.contentWindow);
            });
            ETV.Util.loadCSS(page.css, AppLoader.basePath, AppLoader.contentWindow);
        },
        /**
         * 转成成数组
         * @param val
         * @returns {*}
         */
        toArray: function (val) {
            return $.isArray(val) ? val : ((val || val === 0) ? [val] : []);
        },
        /**
         * 时间格式数组转换成秒表示数组
         * @param timeArray
         * @returns {Array}
         */
        timeArrayToSecondArray: function (timeArray) {
            var seconds = [];
            $.each(timeArray, function (i, n) {
                seconds.push(TVUI.Util.date(n).getTime() / 1000);
            });
            return seconds;
        },
        /**
         * 获取package url
         * @param url
         * @returns {*}
         */
        getPackageUrl: function (url) {
            return url.indexOf('http://') > -1 ? url : ETV.__config.apps + url;
        },
        /**
         * 获取CA标识
         * @param areaCode
         * @returns {*}
         */
        getCA: function (areaCode) {
            var _this = this;
            if (this.__ca) {
                return this.__ca;
            } else {
                $.each(CA, function (key, array) {
                    if (areaCode >= array[0] && areaCode <= array[1]) {
                        _this.__ca = key;
                        return false;
                    }
                });
                return this.__ca || '';
            }
        }
    };


    /**
     * 加载器类
     */
    ETV.Loader = TVUI.Class.create({
        /**
         * 构造函数
         * @param app ｛appId, appPackage, width, height, left, top, active, auto, startTime, stopTime, activeKey, showKey, playState,startPoint, stopPoint｝
         */
        init: function (app) {
            this.setAttr(app);
            this._active = false;
            this.isShow = false;
            this.iframe = document.createElement('iframe');
            this.contentWindow = null;
            this.status = ETV.Engine.status;

            //状态：0 初始化，1安装，2显示，3隐藏，4销毁，5卸载
            this.state = 0;

            this._events();
            this.setAuto();
            //记录加载器
            _AppLoaders[app.appId] = this;
            ETV.Engine.fire('appInit', this);

        },
        /**
         * 设置属性
         * @param app
         */
        setAttr: function (app) {
            this.app = app;
            this.appId = app.appId;
            this.auto = !!app.auto;
            //显示时间数组
            this.startTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.startTime));

            //销毁时间数组
            this.stopTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.stopTime));

            //显示播放器相对时间数组
            this.startPoint = ETV.Util.toArray(app.startPoint);

            //销毁播放器相对时间数组
            this.stopPoint = ETV.Util.toArray(app.stopPoint);

            this.playState = app.playState || [];

            this.showKey = parseInt(app.showKey) || null;
            this.activeKey = parseInt(app.activeKey) || null;

            this.basePath = ETV.Util.getPackageUrl(this.app.appPackage.replace('package.json', ''));

            this.keyCodes = [];
        },

        /**
         * 更新应用
         * @param app
         */
        update: function (app) {
            if (this._isDestroy) return;

            this.setAttr(app);
            this.offset({
                width: parseInt(app.width || 0),
                height: parseInt(app.height || 0),
                left: parseInt(app.left || 0),
                top: parseInt(app.top || 0)
            });
            clearInterval(this.__startId);
            clearInterval(this.__stopId);
            this.setAuto();
            this.fire('update');
            this.sendMessage('UPDATE');
        },
        /**
         * 设置iframe的位置、大小
         * @param offset
         * @returns {*}
         */
        offset: function (offset) {
            if (this._isDestroy) return;

            if (offset) {
                $(this.iframe).css(offset);
            } else {
                return $(this.iframe).offset();
            }
        },
        /**
         * 向服务器发送消息
         * @param appId
         * @param msg
         */
        sendMessage: function (msg) {


            if (typeof msg === 'string') {
                var message = ETV.__config.message[msg];

                if (message) {
                    var status = this.status;
                    message.appId = this.appId;
                    $.extend(message, status);
                    ETV.Engine.sendMessage(message);
                } else {
                    ETV.Engine.sendMessage(msg);
                }
            } else {
                ETV.Engine.sendMessage(msg);
            }

        },
        /**
         * 执行安装
         */
        install: function () {
            if (this._isDestroy) return;
            //只有在初始化状态时才能安装，避免相同的app多次安装
            if (this.state === 0) {
                this.state = 1;
                var app = this.app;
                this.contentWindow = ETV.Util.appendFrame(this.iframe);
                if (this.contentWindow) {
                    this.offset({
                        width: parseInt(app.width || 0),
                        height: parseInt(app.height || 0),
                        left: parseInt(app.left || 0),
                        top: parseInt(app.top || 0)
                    });

                    this.inject();

                    this.fire('install');
                    this.sendMessage('INSTALL');
                    ETV.Engine.fire('appInstall', this);
                }
            }

        },
        /**
         * 显示app
         */
        show: function () {
            if (this._isDestroy) return;

            if (this.state === 2) return;
            this.state === 0 && this.install();
            this.iframe.style.display = 'block';
            this.state = 2;
            this.sendMessage('SHOW');
            this.isShow = true;
            this.fire('show');
            ETV.Engine.fire('appShow', this);

        },
        /**
         * 隐藏app
         */
        hide: function () {
            if (this._isDestroy) return;
            if (this.state === 3) return;

            this.state = 3;
            this.iframe.style.display = 'none';
            this.sendMessage('HIDE');
            this.isShow = false;
            this.fire('hide');
            ETV.Engine.fire('appHide', this);
        },
        /**
         * 销毁app
         */
        destroy: function () {
            if (this._isDestroy) return;

            if (this.state === 4) return;
            this._isDestroy = true;
            this.state = 4;
            //如果应用有实现销毁接口，执行销毁
            if (this.contentWindow.__etv_app__ && this.contentWindow.__etv_app__.destroy) {
                this.contentWindow.__etv_app__.destroy();
            }

            if (this.iframe.parentNode) {
                //同洲盒子会离奇死机
                // this.iframe.parentNode.removeChild(this.iframe);
            }

            this.iframe.style.display = 'none';
            delete _AppLoaders[this.appId];
            delete _PreloadApps[this.appId];

            this.isShow = false;
            this.iframe = null;
            this.contentWindow = null;
            clearInterval(this.__startId);
            clearInterval(this.__stopId);
            this.unBind();
            this.sendMessage('DESTROY');
            ETV.Engine.fire('appDestroy', this);
            this.parent.prototype.destroy.apply(this, arguments);


        },
        /**
         * 卸载app
         */
        uninstall: function () {
            if (this._isDestroy) return;
            if (this.state === 5) return;
            this.state = 5;
            this.isShow = false;
            this.destroy();
            //todo: uninstall
            this.sendMessage('UNINSTALL');
            ETV.Engine.fire('appUninstall', this);
        },
        /**
         * 注入变量，iframe内调用不到中间件，要把对象注入进去
         */
        inject: function () {

            var o = {
                AppLoader: this
            };
            /*
             var cw = this.contentWindow;
             if (!cw.DataAccess) o.DataAccess = window.DataAccess;
             if (!cw.SysSetting) o.SysSetting = window.SysSetting;
             if (!cw.CA) o.CA = window.CA;
             if (!cw.Network) o.Network = window.Network;
             if (!cw.user) o.user = window.user;
             if (!cw.EPG) o.EPG = window.EPG;
             */
            o.AppLoader.seajs = ETV.__config.seajs;
            $.extend(this.contentWindow, o);
        },
        /**
         * 运行app
         */
        appInit: function () {
            var self = this;

            if (this.packageJSON) {
                self.keyCodes = self.packageJSON.keyCode || [];
                ETV.Util.loadPage(this.packageJSON.main, this);
            } else {
                $.getJSON(ETV.Util.getPackageUrl(this.app.appPackage), function (json) {
                    if (json) {
                        self.packageJSON = json;
                        self.keyCodes = self.packageJSON.keyCode || [];
                        json.main && ETV.Util.loadPage(self.packageJSON.main, self);
                    }
                });
            }

        },

        /**
         * 根据时间自动展示
         */
        autoShowByTime: function () {
            var _this = this,
                startTimeArray = this.startTime;
            //自动开始显示
            if (startTimeArray && startTimeArray.length > 0) {
                _this.__startId = setInterval(function () {
                    var nowSecond = parseInt((new Date()).getTime() / 1000);
                    $.each(startTimeArray, function (i, start) {
                        if (nowSecond == start) {
                            _this.show();
                            return false;
                        }
                    });
                }, 1000);
            }
        },
        /**
         * 根据时间自动销毁
         */
        autoHideByTime: function () {
            var _this = this,
                stopTimeArray = this.stopTime;
            if (stopTimeArray && stopTimeArray.length > 0) {
                _this.__stopId = setInterval(function () {
                    var nowSecond = parseInt((new Date()).getTime() / 1000);
                    $.each(stopTimeArray, function (i, stop) {
                        if (nowSecond == stop) {
                            _this.hide();
                            return false;
                        }
                    });
                }, 1000);
            }
        },
        /**
         * 根据播放器point自动显示和销毁
         * @param currentPoint
         */
        autoByPoint: function (currentPoint) {
            if (currentPoint) {
                var _this = this;
                $.each(this.startPoint, function (i, point) {
                    if (point == currentPoint) {
                        _this.show();
                        return false;
                    }
                });
                $.each(this.stopPoint, function (i, point) {
                    if (point == currentPoint) {
                        _this.hide();
                        return false;
                    }
                });
            }
        },
        autoByPlayState: function (state) {
            var playState = this.playState;
            if (playState && playState.length > 0) {
                var isMatch = false;
                for (var i = 0, len = this.playState.length; i < len; i++) {
                    if (state == this.playState[i]) {
                        isMatch = true;
                        break;
                    }
                }
                isMatch ? this.show() : this.hide();
            }
        },

        /**
         * 自动展示和销毁
         */
        setAuto: function () {
            if (this.auto) {
                //如果设置了自动，并且设置了一个时间条件，即开始自动任务，否则立即展示
                if (this.startTime.length > 0 || this.stopTime.length > 0 || this.startPoint.length > 0 || this.stopPoint.length > 0) {
                    this.autoShowByTime();
                    this.autoHideByTime();
                } else {
                    this.show();
                }
            }
        },

        /**
         * 调转页面
         * @param url
         * @param param
         */
        go: function (url, param) {
            if (this._isDestroy) return;

            if (!url) return;

            if (param) {
                var str = util.param(param);
                url += url.indexOf('?') > -1 ? '&' + str : '?' + str;
            }
            this.fire('go', url);
            top.location.href = url;
        },

        /**
         * 事件处理
         * @private
         */
        _events: function () {
            var _this = this;
            //传递按键事件
            this.registerEvent(TVUI.Event.on('keydown', function (e) {
                //todo：需要增加功能是否只为指定的按键传递事件，现在是全部按键都传递
                this._active && this.contentWindow.TVUI.Event.fire('keydown', e.which);
            }, this));

            this.registerEvent(TVUI.Event.on('keyup', function (e) {
                this._active && this.contentWindow.TVUI.Event.fire('keyup', e.which);
            }, this));

            //只允许同时一个app处于活动状态
            this.on('active', function () {
                $.each(_AppLoaders, function (appId, loader) {
                    if (_this.app.appId != appId) {
                        loader.unActive();
                    }
                });
                _this.iframe.className = ETV.__config.activeClassName;
                ETV.Engine.fire('appActive', _this);
            });

            this.on('unActive', function () {
                _this.iframe.className = '';
                var hasActive = false;
                $.each(_AppLoaders, function (appId, loader) {
                    if (loader._active) {
                        hasActive = true;
                        return false;
                    }
                });
                ETV.Engine.fire('appUnActive', _this);
                !hasActive && ETV.Engine.fire('appAllUnActive', _this);
            });

            //当引擎状态发送变化时，同步加载器的状态
            this.bind('change', function (status) {
                _this.status = status;
                _this.fire('status', status);
            });

            this.bind('point', function (point) {
                _this.autoByPoint(point);
                _this.fire('point', point);
            });

            this.bind('playState', function (state) {
                _this.autoByPlayState(state);
                _this.fire('playState', state);
            });


            //如果设置了app展示后自动激活
            this.on('show', function () {
                _this.app.active && _this.active();
            });

            this.on('hide', function () {
                _this.unActive();
            });

            this.registerEvent(TVUI.Event.on('keyup', function (e) {
                switch (e.which) {
                    case _this.showKey:
                        _this.isShow ? _this.hide() : _this.show();
                        break;
                    case _this.activeKey:
                        //在显示时才能控制活动状态
                        if (_this.isShow) {
                            _this._active ? _this.unActive() : _this.active();
                        }
                        break;
                }
            }));

            //窗体unload时触发事件
            if (top && top.window) {
                //todo：侦听了事件，销毁时未销毁事件句柄，有机会导致内存泄漏，待优化
                top.window.addEventListener('unload', function () {
                    _this.fire('unload');
                    _this.destroy();
                }, false);
            }


        },

        /**
         * 绑定引擎事件, 有待TVUI 1.2 改进
         * @param eventName
         * @param callback
         */
        bind: function (eventName, callback) {
            if (!this.__eventHandlers) {
                this.__eventHandlers = {};
            }
            this.__eventHandlers[++TVUI.uuid] = {
                name: eventName,
                callback: callback
            };
            ETV.Engine.on.call(ETV.Engine, eventName, callback);

        },
        /**
         * 删除引擎事件，有待TVUI 1.2 改进
         * @param id
         */
        unBind: function (id) {
            if (id) {
                var handler = this.__eventHandlers[id];
                handler && ETV.Engine.off(handler.name, handler.callback);
            } else {
                $.each(this.__eventHandlers || {}, function (id, handler) {
                    ETV.Engine.off(handler.name, handler.callback);
                });
            }
        },

        /**
         * 注册按键
         * @param code
         */
        addKey: function (codes) {
            var codeArray = $.isArray(codes) ? codes : [codes],
                self = this;
            $.each(codeArray, function (i, code) {
                if ($.inArray(code, self.keyCodes) == -1) {
                    self.keyCodes.push(code);
                }
            });

        },
        /**
         * 删除按键
         * @param code
         */
        removeKey: function (codes) {
            var codeArray = $.isArray(codes) ? codes : [codes],
                self = this;
            $.each(codeArray, function (i, code) {
                self.keyCodes = $.grep(self.keyCodes, function (n) {
                    return n != code;
                });
            });
        },


        /**
         * 获取扩展属性
         * @param name
         * @returns {*|null}
         */
        getExt: function (name) {
            return ETV.Engine.__ext[name] || null;
        }

    }, TVUI.Base);


    //处理安装指令
    ETV.Engine.on('install', function (apps, mapping) {

        apps = $.isArray(apps) ? apps : [apps];
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            $.each(apps, function (i, app) {
                ETV.Engine.getLoader(app).install();
            });
        }
    });

    //处理显示指令
    ETV.Engine.on('show', function (apps, mapping) {

        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            apps = $.isArray(apps) ? apps : [app];
            $.each(apps, function (i, app) {
                ETV.Engine.getLoader(app).show();
            });
        }
    });

    //处理隐藏指令
    ETV.Engine.on('hide', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, appId) {
                var loader = ETV.Engine.findLoader(appId);
                loader && loader.hide();
            });
        }
    });

    //处理销毁指令
    ETV.Engine.on('destroy', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, app) {
                var loader = typeof app == 'object' ? ETV.Engine.findLoader(app.appId) : ETV.Engine.findLoader(app);
                loader && loader.destroy();
            });
        }

    });

    //处理卸载指令
    ETV.Engine.on('uninstall', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, app) {
                var loader = typeof app == 'object' ? ETV.Engine.findLoader(app.appId) : ETV.Engine.findLoader(app);
                loader && loader.uninstall();
            });
        }
    });

    //处理更新指令
    ETV.Engine.on('update', function (apps, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            apps = $.isArray(apps) ? apps : [apps];
            $.each(apps, function (i, app) {
                var loader = ETV.Engine.findLoader(app.appId);
                if (loader) {
                    loader.destroy();
                }
                ETV.Engine.getLoader(app).install();
            });
        }
    });


    global.ETV = ETV;

    ETV.Engine.fixMainAppEvent();

    if (window.define) {
        define(function (require, exports, module) {
            module.exports = ETV;
        });
    }

})(Zepto, TVUI, this);