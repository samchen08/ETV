var cluster = require('cluster');
var net = require('net');
var cpus = require('os').cpus();
var Redis = require('ioredis');
var config = require('./config');
var util = require('./util');

//区域码对照表
var CA = require('./CA');

//客户端缓存
var socketClient = require('./socketClient');

//缓存工具集
var cacheHelper = require('./cacheHelper');

//投放服务redis client
var deliveryRedis = new Redis(config.deliveryRedisSentinel);

//数据采集redis client
var feedbackRedis = new Redis.Cluster(config.feedbackRedisCluster);

//消息确认redis client
var confirmRedis = new Redis(config.deliveryRedisSentinel);


if (cluster.isMaster) {

    var workers = [];

    var spawn = function (i) {
        workers[i] = cluster.fork();
        workers[i].on('exit', function (worker, code, signal) {
            util.log('respawning worker', i);
            spawn(i);
        });
    };

    cpus.forEach(function () {
        cluster.fork();
    });

    cluster.on('listening', function (workder, address) {
        util.log('worker connected to', address.address, address.port, '#', workder.id);
    });

    //收到投放信息
    deliveryRedis.on('message', function (channel, message) {
        if (config.deliveryRedisSubscribeKey == channel) {
            util.log('deliveryRedis message', message);

            var messageJSON = typeof message == 'string' ? JSON.parse(message) : message;
            if (messageJSON && messageJSON.hd && messageJSON.hd.code) {
                messageJSON = util.fixAppPackage(messageJSON);
                switch (messageJSON.hd.code) {
                    case 'deploy-install': //投放新增、更新
                        cacheHelper.save(messageJSON);
                        break;
                    case 'deploy-uninstall'://投递删除
                        cacheHelper.removeByDeployId(messageJSON.bd.deployId);
                        break;
                    case 'app-uninstall': //应用停止
                        var appId = messageJSON.bd.appId;
                        cacheHelper.getByDeployId(messageJSON.bd.deployIds, function (res) {
                            res.forEach(function (item) {
                                var apps = item.bd.hittings || [];
                                //遍历找到符合卸载的app
                                apps.forEach(function (app, i) {
                                    if (app.appId == appId) {
                                        apps.splice(i, 1);
                                    }
                                });
                                cacheHelper.save(item);
                            });
                        });
                        break;
                    case 'profile-uninstall':  //策略停止
                        var deployIds = messageJSON.bd.deployIds;
                        var copyDeployIds = deployIds.slice(0);
                        cacheHelper.getByDeployId(copyDeployIds, function (res, keys) {
                            cacheHelper.remove(keys);
                            cacheHelper.remove(deployIds);
                        });
                        break;
                }

                var confirmMessage = util.createConfirmMessage(messageJSON);
                util.log('confirmRedis.lpush', confirmMessage);
                confirmRedis.lpush(config.messageConfirmChannel, JSON.stringify(confirmMessage));
            }
        }
    });

    //订阅投放策略
    deliveryRedis.subscribe(config.deliveryRedisSubscribeKey, function (err) {
        if (err) {
            util.log('deliveryRedis.subscribe', err);
        }
    });

    util.log('server running...');

} else {
    var express = require('express');
    var bodyParser = require('body-parser');
    var app = new express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    var server = app.listen(config.httpPort);

    server.on('error', function (err) {
        util.log('server error', err);
    });

    app.post('/status', function (req, res) {
        util.log('on status', req.body);
        var status = req.body;
        var cacheKeys = cacheHelper.getKeys(status);

        cacheHelper.getJSON(cacheKeys, function (result) {
            var apps = [];
            if (result && result.length > 0) {
                apps = cacheHelper.mergeAPPS(result);
            }

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            util.log('delivery apps', apps);
            res.end(JSON.stringify(apps));
        });


    });

    app.post('/message', function (req, res) {
        var message = req.body;
        util.log('on message', message);
        message = util.createMessage(message);
        switch (message.hd.code) {
            case 'show' : //安装
                message.hd.code = 'install';
                util.log('feedbackRedis.lpush', message);
                feedbackRedis.lpush(config.feedbackRedisListKey, JSON.stringify(message));
                break;
            case 'destroy': //卸载
                message.hd.code = 'uninstall';
                util.log('feedbackRedis.lpush', message);
                feedbackRedis.lpush(config.feedbackRedisListKey, JSON.stringify(message));
                break;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

        res.end('{"ret": 200}');
    });


    app.get('/', function (req, res) {
        var content = 'Worker #' + cluster.worker.id + ' has a request';
        console.log(content);
        res.writeHead(200, {
            'Content-Length': content.length,
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
    });


}

