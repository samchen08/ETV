/**
 * 投放服务运行配置项
 * @type {{debug: boolean, socketPort: number, deliveryRedisSentinel: {sentinels: {host: string, port: number}[], name: string}, feedbackRedisCluster: {port: number, host: string}[], deliveryCacheRedisCluster: {port: number, host: string}[], deliveryRedisSubscribeKey: string, feedbackRedisListKey: string}}
 */
module.exports = {
    //debug开关
    debug: true,

    socketServers : ['172.16.1.55:8011','172.16.1.10:8011'],

    httpPort : 9000,

    //webSocket端口号
    socketPort: 8011,

    //投放服务订阅Redis主备服务器
    deliveryRedisSentinel: {
        sentinels: [
            { host: '172.16.1.10', port: 26379 },
            { host: '172.16.1.10', port: 26380 }
        ],
        name: 'mymaster'
    },

    //投放结果采集Redis集群
    feedbackRedisCluster: [
        {
            port: 701,
            host: '172.16.1.10'
        },
        {
            port: 702,
            host: '172.16.1.10'
        },
        {
            port: 703,
            host: '172.16.1.10'
        },
        {
            port: 704,
            host: '172.16.1.10'
        },
        {
            port: 705,
            host: '172.16.1.10'
        },
        {
            port: 706,
            host: '172.16.1.10'
        }
    ],

    //投放缓存集群
    deliveryCacheRedisCluster: [
        {
            port: 701,
            host: '172.16.1.10'
        },
        {
            port: 702,
            host: '172.16.1.10'
        },
        {
            port: 703,
            host: '172.16.1.10'
        },
        {
            port: 704,
            host: '172.16.1.10'
        },
        {
            port: 705,
            host: '172.16.1.10'
        },
        {
            port: 706,
            host: '172.16.1.10'
        }
    ],
    //订阅投放key
    deliveryRedisSubscribeKey: 'deployChannel',

    //数据采集队列key
    feedbackRedisListKey: 'appStateChannel',

    //订阅确认消息队列key
    messageConfirmChannel :'msgConfirmChannel'



};

