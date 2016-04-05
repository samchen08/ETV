/**
 * 工具函数集
 * @type {exports}
 * @private
 */

var __os = require('os');
var CA = require('./CA');
var config = require('./config');

module.exports = {
    /**
     * debug开关
     */
    __debug: config.debug,
    /**
     * 输入日志
     */
    log: function () {
        if (this.__debug) {
            var result = '-- time ' + (new Date()).toLocaleString() + ' ---------------\n';
            var args = [];
            this.each(arguments, function (i, arg) {
                args.push(typeof arg == 'object' ? JSON.stringify(arg) : arg);
            });
            result += args.join(', ') + '\n';
            result += '-----------------------------------------\n \n';
            console.log(result);
        }
    },
    /**
     * 获取本机ip地址
     * @returns {*}
     */
    getIPAdress: function () {
        var interfaces = __os.networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    },
    /**
     * 判断是不是数组
     * @param obj
     * @returns {*|boolean}
     */
    likeArray: function (obj) {
        return obj && typeof obj.length === 'number';
    },
    /**
     * 遍历对象或数组
     * @param elements
     * @param callback
     * @returns {*}
     */
    each: function (elements, callback) {
        var i, key;
        if (this.likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
        }

        return elements;
    },

    /**
     * 把终端返回的app动作，转成采集消息对象
     * @param message
     * @returns {{hd: {id: number, code: *, time: string}, bd: {areaCode: (*|areaCode|exports.install.bd.mapping.areaCode|exports.update.bd.mapping.areaCode|exports.uninstall.bd.mapping.areaCode|ETV.__config.areaCode), icNo: (message.icNo|*|string), appId: (message.appId|*), pageId: (message.pageId|*|string), channelId: (message.channelId|*|string), currentTime: string, columnId: (message.columnId|*|string)}}}
     */
    createMessage: function (message) {
        var code = {'1': 'install', '2':'show', '5': 'uninstall', '4':'destroy'}[message.type];
        var time = (new Date()).toLocaleString();
        var result = {
            hd: {
                id: 0,
                code: code,
                time: time
            },
            bd: {
                areaCode: message.areaCode || '',
                icNo: message.icNo || '',
                appId: message.appId,
                pageId: message.pageId || '',
                channelId: message.channelId || '',
                currentTime: time,
                columnId: message.columnId || ''
            }
        };
        return result;
    },
    /**
     * 构建订阅确认消息
     * @param message
     * @returns {{hd: {id: number, code: string, time: string}, bd: {publishId: *, host: *}}}
     */
    createConfirmMessage: function (message) {
        return {
            hd: {
                id: 0,
                code: 'comfirm',
                time: (new Date()).toLocaleString()
            },
            bd: {
                publishId: message.hd.id,
                host: this.getIPAdress()
            }
        };
    },
    fixAppPackage:function(messageJSON){
        //转换appPackage路径，app引擎需要的package.json路径
        if (messageJSON && messageJSON.bd && messageJSON.bd.hittings) {
            messageJSON.bd.hittings.forEach(function (item) {
                if (item.appPackage) {
                    item.appPackage = item.appPackage + '/package.json';
                }
            });
        }
        return messageJSON;
    }
};