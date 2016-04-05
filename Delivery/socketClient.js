/**
 * 客户端连接缓存操作静态类
 *  socketId -> status
 *  socketId -> key
 *  socketId -> apps
 * @type {{}}
 * @private
 */
var __SocketClients = {};
module.exports = {
    /**
     * 记录客户端
     * @param socketId
     */
    add: function (socketId, workerId) {
        __SocketClients[socketId] = {worker: workerId};
    },
    /**
     * 删除客户端
     * @param socketId
     */
    remove: function (socketId) {
        delete __SocketClients[socketId];
    },
    /**
     * 获取客户端
     * @param socketId
     * @returns {*}
     */
    get: function (socketId) {
        return socketId ? __SocketClients[socketId] : __SocketClients;
    },
    /**
     * 获取多个客户端
     * @param socketIds
     * @returns {Array}
     */
    getByIds: function (socketIds) {
        var clients = [],
            _this = this;
        socketIds.forEach(function (id) {
            clients.push(_this.get(id))
        });
        return clients;
    },
    /**
     * 设置客户端的状态
     * @param socketId
     * @param status
     */
    setStatus: function (socketId, status) {
        __SocketClients[socketId].status = status;
    },
    /**
     *  设置客户端对应的缓存Key
     * @param socketId
     * @param key
     */
    setKey: function (socketId, key) {
        __SocketClients[socketId].key = key;
    },
    /**
     * 记录客户端正在运行的app
     * @param socketId
     * @param appId
     * @param appState
     */
    setApp: function (socketId, appId) {
        var apps = __SocketClients[socketId].apps;
        if (!apps) {
            apps = (__SocketClients[socketId].apps = {});
        }
        if (!apps[appId]) {
            apps[appId] = (apps[appId] = {});
        }
        apps[appId].appId = appId;
    },
    /**
     * 获取客户端正在运行的app
     * @param socketId
     * @returns {ETV.__config.apps|*|{}}
     */
    getApps: function (socketId) {
        var client = this.get(socketId) || {};
        return client.apps;
    },
    /**
     * 获取客户端正在运行的app，并转换层数组
     * @param socketId
     * @returns {Array}
     */
    getAppsToArray: function (socketId) {
        var apps = this.getApps(socketId) || {};
        var array = [];
        for (var key in apps) {
            array.push(apps[key]);
        }
        return array;
    },
    /**
     * 删除客户端正在运行的app
     * @param socketId
     * @param appId
     */
    removeApp: function (socketId, appId) {
        if (__SocketClients[socketId] && __SocketClients[socketId].apps) {
            delete __SocketClients[socketId].apps[appId];
        }
    }
};