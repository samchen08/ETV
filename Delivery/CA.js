/**
 * 区域分组对应表
 * @type {{GZ: number[], SZ: number[], ZH: number[], ST: number[], FS: number[], SG: number[], ZJ: number[], ZQ: number[], JM: number[], MM: number[], HZ: number[], MZ: number[], SW: number[], HY: number[], YJ: number[], QY: number[], DG: number[], ZS: number[], CZ: number[], JY: number[], YF: number[]}}
 * @private
 */
var __ca = {
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
};
var CA = {};
for (var key in __ca) {
    var array = __ca[key];
    for (var i = array[0]; i <= array[1]; i++) {
        CA[i] = key;
    }
}

module.exports = CA;