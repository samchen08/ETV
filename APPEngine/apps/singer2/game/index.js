define(function (require, exports, module) {
    var APP = {
        init: function () {
           // $('#msgContent').show();
            this.setSingerList();
            this.showSingerList();
           this.events();
        },
        events: function () {
            TVUI.Event.onKey(TVUI.Key.ROC_IRKEY_BACK || TVUI.Key.BACK, function () {
                //APP.showSingerList();
               // APP.hideSingerDetail();
            });
        },
        showSingerList: function () {
            $('#msgContent').show();
           $('#active').hide();
            AppLoader.offset({
                width: 1280,
                height:720,
                top: 0,
                left: 0
            });
        },
        hideSingerList: function () {
            $('#msgContent').hide();
        },
        setSingerList: function () {
//            var lists = [],
                //singersList =$('#msgContent');
            singersList =$('#active');
//            for (var i = 0; i < singers.length; i++) {
//                lists.push('<li class="li-' + (i + 1) + '"><img src="' + singers[i][1] + '" /><div class="singer-n">' + singers[i][0] + '</div></li>');
//            }
//            singersList.html(lists);
           var $item = singersList.find('div');
            var listsPanel = new TVUI.Panel({
                cols: $item.length,
                data: $item,
                loop: true
            });
//
//            listsPanel.on('focus', function (i, li) {
//                var $li = $(li);
//                var liClass = 'li-' + (i + 1);
//                $li.attr('class', liClass + ' li-focus');
//            });
//
//            listsPanel.on('blur', function (i, li) {
//                var $li = $(li);
//                var liClass = 'li-' + (i + 1);
//                $li.attr('class', liClass);
//            });
//
            listsPanel.on('select', function (i, div) {
              var frameContent = document.createElement('iframe');
                frameContent.setAttribute("id","showWebView");
                frameContent.setAttribute("name","showWebView");
                frameContent.setAttribute("frameborder","0");
                frameContent.setAttribute("border","0");
                frameContent.setAttribute("scrolling","0");
                frameContent.setAttribute("allowtransparency","yes");
                frameContent.style.width="1280px";
                frameContent.style.height="720px";
                frameContent.style.top="0px";
                frameContent.style.left="0px";
                frameContent.style.display="none";
                frameContent.style.position="fixed";
                frameContent.allowtransparency="true";
                frameContent.src="http://192.168.1.100/ETV/APPEngine/apps/singer2/game/game.html?d";
                frameContent.style.display="none";
                frameContent.onload = function(){
                    frameContent.style.display="block";
                }
                document.body.appendChild(frameContent);

                //document.body.appendChild(frameContent);
                APP.hideSingerList();
                listsPanel.unActive();//运行�?次之后，就不再接收事件了
                //AppLoader.go("singer/game/game.html");
            });
       },
        showSingerDetail: function () {
            $('#active').show();
        }
//        hideSingerDetail: function () {
//            $('#singerDetail').hide();
//        },
//        setSingerDetail: function (imgUrl, sName, sInfo) {
//            var singerInfo = $('#singerInfo');
//            $('#singerImg').find('img').attr('src', imgUrl);
//            singerInfo.find('.intro-name').html(sName);
//            singerInfo.find('.intro-text').html(sInfo);
//        }
    };

    module.exports = APP;

});
TVUI.Event.onOk(function(){

});

function removeiFrame(){
    var webView = document.getElementById("showWebView");
    document.body.removeChild(webView);
}