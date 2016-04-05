define(function (require, exports, module) {

    var $div,
        position = {
            'indexPage': [
                {left: 600, top: 400, width: 379, height: 209 },
                {left: 600, top: 400, width: 204, height: 193 }
            ],
            'subPage': [
                {left: 300, top: 100, width: 193, height: 38},
                {left: 400, top: 200, width: 193, height: 38},
                {left: 500, top: 400, width: 193, height: 38},
                {left: 300, top: 50, width: 293, height: 162},
                {left: 300, top: 100, width: 193, height: 38}
            ]
        },
        showCount = 0;

    module.exports = {
        init: function () {
            var _this = this;

            if (AppLoader.status.assetId == 'OVTA0000000000570854') {
                $div = $('#indexPage div');
                AppLoader.on('show', function () {
                    _this.show(showCount, position.indexPage);
                    ++showCount;
                });
                var url = '/NewFrameWork/web/vodPlayer.html?assetId=OVTA0000000000570858&providerId=Gcable&groupId=249';
                //var url = ' http://172.16.1.10/APPS/engine/?assetId=OVTA0000000000570858&columnId=249&pageId=vodPlayer';
                TVUI.Event.onOk(function () {
                    showCount == 1 && AppLoader.go(url);
                });
                TVUI.Event.onKey(TVUI.Key.ROC_IRKEY_YELLOW, function () {
                    showCount == 2 && AppLoader.go(url);
                });
            } else if (AppLoader.status.assetId = 'OVTA0000000000570858') {
                $div = $('#subPage div');
                AppLoader.on('show', function () {
                    _this.show(showCount, position.subPage);
                    ++showCount;
                });
                TVUI.Event.onNumber(function (e) {
                    switch (e.number) {
                        case 1 :
                            showCount == 1 && alert('按了1');
                            break;
                        case 2 :
                            showCount == 2 && alert('按了2');
                            break;
                        case 3 :
                            showCount == 3 && alert('按了3');
                            break;
                        case 4 :
                            showCount == 4 && alert('按了4');
                            break;
                        case 5 :
                            showCount == 4 && alert('按了5');
                            break;
                        case 6 :
                            showCount == 5 && alert('按了6');
                            break;
                    }
                });

            }
        },
        show: function (index, position) {
            if (index < $div.length) {
                AppLoader.offset(position[index]);
                $div.hide();
                $div.eq(index).css('display', 'block');
            }
        }
    }

});