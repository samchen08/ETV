var config = require('./config');
var util = require('./util');
var CA = require('./CA');
var Redis = require('ioredis');
//投放策略缓存redis client
var cacheRedis = new Redis.Cluster(config.deliveryCacheRedisCluster);
var emptyValue = '@';
var splitFlag = '||';

var helper = {
    /**
     * 获取缓存底层方法
     * @param key
     * @param callback
     * @private
     */
    _get: function (key, callback) {
        cacheRedis.get(key, function (err, res) {
            if (err) {
                util.log('cacheHelper._get', key, err);
            } else {
                callback && callback(res);
            }
        });
    },
    /**
     * 以JSON的方式获取缓存
     * @param key
     * @param callback
     * @private
     */
    _getJSON: function (key, callback) {
        this._get(key, function (res) {
            res = res || null;
            callback && callback(JSON.parse(res));
        });
    },
    /**
     * 获取缓存，支持多个key，数组形式
     * @param keys
     * @param callback
     */
    get: function (keys, callback) {
        keys = typeof keys == 'object' ? keys : [keys];
        var copyKey = keys.slice(0);
        var _this = this;
        var result = [];
        var handler = function (res) {
            var r = _this.unique(res);
            util.log('cacheHelper.get', keys, r);
            callback && callback(r);
        };

        (function (keys) {
            var self = arguments.callee;
            if (keys.length > 0) {
                var key = keys.shift();
                _this._get(key, function (res) {
                    res && result.push(res);
                    self(keys);
                });
            } else {
                handler(result);
            }
        })(copyKey);
    },
    /**
     * 获取缓存，并转换成json格式，支持多个key
     * @param keys
     * @param callback
     */
    getJSON: function (keys, callback) {
        keys = typeof keys == 'object' ? keys : [keys];
        var copyKey = keys.slice(0);
        var _this = this;
        var result = [];
        var handler = function (res) {
            var r = _this.unique(res);
            util.log('cacheHelper.getJSON', keys, r);
            callback && callback(r);
        };

        (function (keys) {
            var self = arguments.callee;
            if (keys.length > 0) {
                var key = keys.shift();
                _this._getJSON(key, function (res) {
                    res && result.push(res);
                    self(keys);
                });
            } else {
                handler(result)
            }
        })(copyKey);
    },
    /**
     * 根据投递消息id获取缓存，支持多个id
     * @param ids
     * @param callback
     */
    getByDeployId: function (ids, callback) {
        ids = typeof ids == 'object' ? ids : [ids];
        var _this = this;
        this.get(ids, function (keys) {
            if (keys && keys.length > 0) {
                _this.getJSON(keys, function (res) {
                    callback && callback(res, keys);
                });
            }
        });
    },
    /**
     * 设置缓存
     * @param key
     * @param value
     * @param callback
     */
    set: function (key, value, callback) {
        value = typeof value == 'object' ? JSON.stringify(value) : value;
        cacheRedis.set(key, value, function (err) {
            if (err) {
                util.log('cacheHelper.set', key, err);
            } else {
                util.log('cacheHelper.set', key, value);
                callback && callback();
            }
        });
    },
    /**
     * 状态对象转换可以缓存key
     * @param status
     * @returns {string}
     */
    getKey: function (status) {
        var array = [];
        if (status.areaCode) {
            var code = parseInt(status.areaCode);
            isNaN(code) ? array.push(status.areaCode) : array.push(CA[status.areaCode] || emptyValue);
        } else {
            array.push(status.areaCode || emptyValue);
        }
        array.push(status.pageId || emptyValue);
        array.push(status.channelId || emptyValue);
        array.push(status.columnId || emptyValue);
        array.push(status.assetId || emptyValue);
        return array.join(splitFlag);
    },
    /**
     * 根据状态对象，转换成可能匹配的缓存key，并去掉重复的key
     * @param status
     * @returns {*}
     */
    getKeys: function (status) {
        var keys = this.getKey(status).split(splitFlag);
        var empty = emptyValue;
        var result = [];
        var all = [
            [keys[0], keys[1], keys[2], keys[3], keys[4]],
            [empty, keys[1], keys[2], keys[3], keys[4]],
            [keys[0], empty, keys[2], keys[3], keys[4]],
            [keys[0], keys[1], empty, keys[3], keys[4]],
            [keys[0], keys[1], keys[2], empty, keys[4]],
            [keys[0], keys[1], keys[2], keys[3], empty],

            [empty, empty, keys[2], keys[3], keys[4]],
            [keys[0], empty, empty, keys[3], keys[4]],
            [keys[0], keys[1], empty, empty, keys[4]],
            [keys[0], keys[1], keys[2], empty, empty],
            [empty, keys[1], empty, keys[3], keys[4]],
            [empty, keys[1], keys[2], empty, keys[4]],
            [empty, keys[1], keys[2], keys[3], empty],
            [keys[0], empty, keys[2], empty, keys[4]],
            [keys[0], empty, keys[2], keys[3], empty],
            [keys[0], keys[1], empty, keys[3], empty],


            [empty, empty, empty, keys[3], keys[4]],
            [keys[0], empty, empty, empty, keys[4]],
            [keys[0], keys[1], empty, empty, empty],
            [empty, empty, keys[2], keys[3], empty],
            [empty, empty, keys[2], empty, keys[4]],
            [empty, keys[1], empty, empty, keys[4]],
            [empty, keys[1], keys[2], empty, empty],


            [empty, empty, empty, empty, keys[4]],
            [keys[0], empty, empty, empty, empty],
            [empty, keys[1], empty, empty, empty],
            [empty, empty, keys[2], empty, empty],
            [empty, empty, empty, keys[3], empty],

            [empty, empty, empty, empty, empty]
        ];
        all.forEach(function (item) {
            result.push(item.join(splitFlag));
        });
        return this.unique(result);

    },
    /**
     * 数组去重函数
     * @param arr
     * @returns {Array}
     */
    unique: function (arr) {
        var result = [], hash = {}, item, itemKey;
        for (var i = 0, len = arr.length; i < len; i++) {
            item = arr[i];
            itemKey = JSON.stringify(item);
            if (!hash[itemKey]) {
                result.push(item);
                hash[itemKey] = true;
            }
        }
        return result;
    },
    /**
     * 保存消息到缓存，写两条数据
     *  key -> messeage
     *  deployId -> key
     * @param message
     * @param callback
     */
    save: function (message, callback) {
        var key = this.getKey(message.bd.mapping);
        var count = 0;
        this.set(key, message, function () {
            ++count;
            (count == 2 && callback) && callback();
        });
        this.set(message.bd.mapping.deployId, key, function () {
            ++count;
            (count == 2 && callback) && callback();
        });
    },
    /**
     * 删除缓存，支持多个key
     * @param keys
     * @param callback
     */
    remove: function (keys, callback) {
        keys = typeof keys == 'object' ? keys : [keys];
        util.log('cacheHelper.remove', keys);
        keys.forEach(function (key) {
            cacheRedis.del(key, function (err) {
                if (err) {
                    util.log('cacheHelper.remove', key, err);
                } else {
                    callback && callback();
                }
            });
        });

    },
    /**
     * 根据DeployId删除缓存， 支持多个id
     * @param ids
     */
    removeByDeployId: function (ids) {
        ids = typeof ids == 'object' ? ids : [ids];
        var _this = this;
        var copyIds = ids.slice(0);
        this.get(ids, function (keys) {
            _this.remove(keys);
            _this.remove(copyIds);
        });

    },
    /**
     * 清空所有缓存，似乎集群无效
     */
    clear: function () {
        cacheRedis.flushall(function (err) {
            if (err) {
                util.log('cacheHelper.clear', err);
            } else {
                util.log('cacheHelper.clear', 'ok');
            }
        });
    },
    /**
     * 对比app，找出新增、更新、删除的app
     * @param newAPPS
     * @param oldAPPS
     * @returns {{install: Array, update: Array, uninstall: Array}}
     */
    analyseAPPS: function (newAPPS, oldAPPS) {
        var install = [], update = [], uninstall = [];
        util.each(newAPPS, function (i, newApp) {
            var isHave = false;
            util.each(oldAPPS, function (j, oldApp) {
                if (newApp.appId == oldApp.appId) {
                    isHave = true;
                    return false;
                }
            });
            isHave ? update.push(newApp) : install.push(newApp);
        });
        util.each(oldAPPS, function (i, oldApp) {
            var isHave = false;
            util.each(newAPPS, function (j, newApp) {
                if (newApp.appId == oldApp.appId) {
                    isHave = true;
                    return false;
                }
            });
            if (!isHave) {
                uninstall.push(oldApp);
            }
        });
        return {
            install: install,
            update: update,
            uninstall: uninstall
        };

    },
    /**
     * 合并app，从多个消息中找出app信息，合并到一个数组，并且去掉重复的
     * @param messages
     * @returns {Array}
     */
    mergeAPPS: function (messages) {
        var result = [];
        messages.forEach(function (message) {
            if (message.bd.hittings && message.bd.hittings.length > 0) {
                result = result.concat(message.bd.hittings);
            }
        });
        return this.unique(result);
    }
};

module.exports = helper;


