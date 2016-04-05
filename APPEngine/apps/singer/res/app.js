define(function (require, exports, module) {
    var singers = [
        ['张学友', 'http://172.16.1.10/APPS/singer/res/images/img/01.jpg', '张学友温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['刘德华', 'http://172.16.1.10/APPS/singer/res/images/img/02.jpg', '刘德华温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['郭富城', 'http://172.16.1.10/APPS/singer/res/images/img/03.jpg', '郭富城温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['黎明', 'http://172.16.1.10/APPS/singer/res/images/img/04.jpg', '黎明温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['梁静茹', 'http://172.16.1.10/APPS/singer/res/images/img/05.jpg', '梁静茹温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['张惠妹', 'http://172.16.1.10/APPS/singer/res/images/img/06.jpg', '张惠妹温柔小嗓征服众人，江苏卫视《蒙面歌王》'],
        ['周杰伦', 'http://172.16.1.10/APPS/singer/res/images/img/07.jpg', '周杰伦温柔小嗓征服众人，江苏卫视《蒙面歌王》']
    ];
    var APP = {
        init: function () {
            this.setSingerList();
            this.showSingerList();
            this.events();
        },
        events: function () {
            TVUI.Event.onKey(TVUI.Key.ROC_IRKEY_BACK || TVUI.Key.BACK, function () {
                APP.showSingerList();
                APP.hideSingerDetail();
            });
        },
        showSingerList: function () {
            $('#singers').show();
            AppLoader.offset({
                width: 1280,
                height: 370,
                top: 350,
                left: 0
            });
        },
        hideSingerList: function () {
            $('#singers').hide();
        },
        setSingerList: function () {
            var lists = [],
                singersList = $('#singersList');
            for (var i = 0; i < singers.length; i++) {
                lists.push('<li class="li-' + (i + 1) + '"><img src="' + singers[i][1] + '" /><div class="singer-n">' + singers[i][0] + '</div></li>');
            }
            singersList.html(lists);
            var $item = singersList.find('li');
            var listsPanel = new TVUI.Panel({
                cols: $item.length,
                data: $item,
                loop: true
            });

            listsPanel.on('focus', function (i, li) {
                var $li = $(li);
                var liClass = 'li-' + (i + 1);
                $li.attr('class', liClass + ' li-focus');
            });

            listsPanel.on('blur', function (i, li) {
                var $li = $(li);
                var liClass = 'li-' + (i + 1);
                $li.attr('class', liClass);
            });

            listsPanel.on('select', function (i, li) {
                APP.setSingerDetail(singers[i][1], singers[i][0], singers[i][2]);
                APP.hideSingerList();
                APP.showSingerDetail();
            });

        },
        showSingerDetail: function () {
            $('#singerDetail').show();
        },
        hideSingerDetail: function () {
            $('#singerDetail').hide();
        },
        setSingerDetail: function (imgUrl, sName, sInfo) {
            var singerInfo = $('#singerInfo');
            $('#singerImg').find('img').attr('src', imgUrl);
            singerInfo.find('.intro-name').html(sName);
            singerInfo.find('.intro-text').html(sInfo);
        }
    };

    module.exports = APP;

});