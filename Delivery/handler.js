/**
 * 指令处理函数集
 */

var util = require('./util');
var CA = require('./CA');
module.exports = {

    /**
     * 响应 deploy-install 指令
     * @param cacheHelper
     * @param socketIO
     * @param message
     */
    deployInstall: function (cacheHelper, socketIO, message) {

        var cacheKey = cacheHelper.getKey(message.bd.mapping);
        var _this = this;

        cacheHelper.getJSON(cacheKey, function (res) {
            var cacheAPPS = [];
            if (res && res[0] && res[0].hd) {
                cacheAPPS = res[0].bd.hittings || [];
            }
            //分析缓存中的app和新策略的app，找出新增、修改、删除的app
            var result = cacheHelper.analyseAPPS(message.bd.hittings || [], cacheAPPS);
            util.log('cacheHelper.analyseAPPS', result);
            var mapping = message.bd.mapping;
            _this.emitDeploy(socketIO, result, mapping);
            cacheHelper.save(message);

        });
    },

    deployInstallForCluster: function (cacheHelper, message, workers) {
        var cacheKey = cacheHelper.getKey(message.bd.mapping);
        cacheHelper.getJSON(cacheKey, function (res) {
            var cacheAPPS = [];
            if (res && res[0] && res[0].hd) {
                cacheAPPS = res[0].bd.hittings || [];
            }
            //分析缓存中的app和新策略的app，找出新增、修改、删除的app
            var result = cacheHelper.analyseAPPS(message.bd.hittings || [], cacheAPPS);
            util.log('cacheHelper.analyseAPPS', result);
            var mapping = message.bd.mapping;
            workers.forEach(function (worker) {
                worker.send({
                    result: result,
                    mapping: mapping,
                    code: 'deploy-install'
                });
            });
            cacheHelper.save(message)
        });
    },

    emitDeploy: function (socketIO, deploy, mapping, workerRoom) {
        //如果有房间，推送到指定房间，否则推送到公共房间
        var room = workerRoom || mapping.pageId || mapping.areaCode || null;

        if (room) {
            if (deploy.install.length > 0) {
                util.log('emit', 'room', room, 'install', deploy.install, mapping);
                socketIO.to(room).emit('install', deploy.install, mapping);
            }
            if (deploy.update.length > 0) {
                util.log('emit', 'room', room, 'update', deploy.update, mapping);
                socketIO.to(room).emit('update', deploy.update, mapping);
            }
            if (deploy.uninstall.length > 0) {
                util.log('emit', 'room', room, 'uninstall', deploy.uninstall, mapping);
                socketIO.to(room).emit('uninstall', deploy.uninstall, mapping);
            }
        } else { //发送给全部客户端，由加载引擎判断安装、更新和销毁
            if (deploy.install.length > 0) {
                util.log('emit', 'all', 'install', deploy.install, mapping);
                socketIO.sockets.to(workerRoom).emit('install', deploy.install, mapping);
            }
            if (deploy.update.length > 0) {
                util.log('emit', 'all', 'update', deploy.update, mapping);
                socketIO.sockets.to(workerRoom).emit('update', deploy.update, mapping);
            }
            if (deploy.uninstall.length > 0) {
                util.log('emit', 'all', 'uninstall', deploy.uninstall, mapping);
                socketIO.sockets.to(workerRoom).emit('uninstall', deploy.uninstall, mapping);
            }
        }
    },
    /**
     * 响应 deploy-uninstall指令
     * @param cacheHelper
     * @param socketIO
     * @param message
     */
    deployUninstall: function (cacheHelper, socketIO, message) {
        cacheHelper.getByDeployId(message.bd.deployId, function (res) {
            if (res && res[0]) {
                var apps = cacheHelper.mergeAPPS(res);
                util.log('emit', 'all', 'uninstall', apps, res[0].bd.mapping);
                socketIO.sockets.emit('uninstall', apps, res[0].bd.mapping);
                cacheHelper.removeByDeployId(message.bd.deployId);
            }
        });

    },

    deployUninstallForCluster: function (cacheHelper, message, workers) {
        cacheHelper.getByDeployId(message.bd.deployId, function (res) {
            if (res && res[0]) {
                var apps = cacheHelper.mergeAPPS(res);
                util.log('emit', 'all', 'uninstall', apps, res[0].bd.mapping);
                workers.forEach(function (worker) {
                    worker.send({
                        apps: apps,
                        mapping: res[0].bd.mapping,
                        code: 'deploy-uninstall'
                    });
                });
                cacheHelper.removeByDeployId(message.bd.deployId);
            }
        });

    },

    /**
     * 响应 app-uninstall 指令
     * @param cacheHelper
     * @param socketIO
     * @param message
     */
    appUninstall: function (cacheHelper, socketIO, message) {
        var appId = message.bd.appId;
        var deployIds = message.bd.deployIds;
        util.log('appUninstall', appId, deployIds);

        cacheHelper.getByDeployId(deployIds, function (res) {
            res.forEach(function (item) {
                var apps = item.bd.hittings || [],
                    matchApps = [];
                //遍历找到符合卸载的app
                apps.forEach(function (app, i) {
                    if (app.appId == appId) {
                        matchApps.push(apps.splice(i, 1)[0]);
                    }
                });
                //发送卸载app指令
                util.log('emit', 'all', 'uninstall', matchApps, item.bd.mapping);
                socketIO.sockets.emit('uninstall', matchApps, item.bd.mapping);
                cacheHelper.save(item);
            });
        });


    },

    appUninstallForCluster: function (cacheHelper, message, workers) {
        var appId = message.bd.appId;
        var deployIds = message.bd.deployIds;
        util.log('appUninstall', appId, deployIds);

        cacheHelper.getByDeployId(deployIds, function (res) {
            res.forEach(function (item) {
                var apps = item.bd.hittings || [],
                    matchApps = [];
                //遍历找到符合卸载的app
                apps.forEach(function (app, i) {
                    if (app.appId == appId) {
                        matchApps.push(apps.splice(i, 1)[0]);
                    }
                });
                //发送卸载app指令
                util.log('emit', 'all', 'uninstall', matchApps, item.bd.mapping);
                workers.forEach(function (worker) {
                    worker.send({
                        apps: matchApps,
                        mapping: item.bd.mapping,
                        code: 'app-uninstall'
                    });
                });
                cacheHelper.save(item);
            });
        });


    },

    /**
     * 响应 profile-uninstall 指令
     * @param cacheHelper
     * @param socketIO
     * @param message
     */
    profileUninstall: function (cacheHelper, socketIO, message) {
        var deployIds = message.bd.deployIds;
        var copyDeployIds = deployIds.slice(0);
        util.log('profileUninstall', copyDeployIds);
        cacheHelper.getByDeployId(copyDeployIds, function (res, keys) {
            res.forEach(function (item) {
                var apps = item.bd.hittings || [];
                util.log('emit', 'all', 'uninstall', apps, item.bd.mapping);
                socketIO.sockets.emit('uninstall', apps, item.bd.mapping);
            });
            cacheHelper.remove(keys);
            cacheHelper.remove(deployIds);
        });
    },

    profileUninstallForCluster: function (cacheHelper, message, workers) {
        var deployIds = message.bd.deployIds;
        var copyDeployIds = deployIds.slice(0);
        util.log('profileUninstall', copyDeployIds);
        cacheHelper.getByDeployId(copyDeployIds, function (res, keys) {
            res.forEach(function (item) {
                var apps = item.bd.hittings || [];
                util.log('emit', 'all', 'uninstall', apps, item.bd.mapping);
                workers.forEach(function (worker) {
                    worker.send({
                        apps: apps,
                        mapping: item.bd.mapping,
                        code: 'profile-uninstall'
                    });
                });
            });
            cacheHelper.remove(keys);
            cacheHelper.remove(deployIds);
        });
    },
    /**
     * 终端上报状态时，检测状态是否投放、更新、删除应用
     * @param cacheHelper
     * @param socket
     * @param socketClient
     * @param status
     */
    statusEmit: function (cacheHelper, socket, socketClient, status) {

        var cacheKeys = cacheHelper.getKeys(status);
        cacheHelper.getJSON(cacheKeys, function (res) {
            var currentAPPS = socketClient.getAppsToArray(socket.id);
            util.log('currentAPPS', currentAPPS);
            if (res && res.length > 0) {
                var apps = cacheHelper.mergeAPPS(res);
                util.log('cacheHelper.mergeAPPS', apps);
                //分析缓存中的app和新策略的app，找出新增、修改、删除的app
                var result = cacheHelper.analyseAPPS(apps || [], currentAPPS || []);
                util.log('cacheHelper.analyseAPPS', result);
                if (result.install.length > 0) {
                    util.log('emit', socket.id, 'install', result.install);
                    socket.emit('install', result.install);
                }
                if (result.update.length > 0) {
                    util.log('emit', socket.id, 'update', result.update);
                    socket.emit('update', result.update);
                }
                if (result.uninstall.length > 0) {
                    util.log('emit', socket.id, 'uninstall', result.uninstall);
                    socket.emit('uninstall', result.uninstall);
                }
            } else {
                if (currentAPPS && currentAPPS.length > 0) {
                    util.log('emit', socket.id, 'uninstall', currentAPPS);
                    socket.emit('uninstall', currentAPPS);
                }
            }
        });
    },
    /**
     * 终端上报状态后，更新终端信息
     * @param clientInfo
     * @param cacheKey
     * @param socket
     * @param socketClient
     * @param status
     */
    socketClientUpdate: function (clientInfo, cacheKey, socket, socketClient, status) {
        //如果已经登记过状态
        if (clientInfo && clientInfo.key) {
            //如果状态有变化
            if (clientInfo.key != cacheKey) {
                //离开上次的房间
                socket.leave(clientInfo.key);
                //加入新的房间
                socket.join(cacheKey);
                //更新key和状态
                socketClient.setKey(socket.id, cacheKey);
                socketClient.setStatus(socket.id, status);
            }
        }
        else { //未登记过状态时
            socket.join(cacheKey);
            status.areaCode && socket.join(CA[status.areaCode]);
            status.pageId && socket.join(status.pageId);
            socketClient.setKey(socket.id, cacheKey);
            socketClient.setStatus(socket.id, status);
        }
    }
};
