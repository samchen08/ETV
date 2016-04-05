define(function (require, exports, module) {
    var APP = {
        init: function () {
            this.isDestory = false;
            this.showVote();
            this.events();
            this.setVoteLists();
        },
        events: function () {
            TVUI.Event.onKey(TVUI.Key.NUM1, function () {
                APP.hideVoteTitle();
                APP.showVoteLists();
            });
            TVUI.Event.onKey(TVUI.Key.BACK, function () {
                if (!APP.isDestory) {
                    APP.isDestory = true;
                    AppLoader.removeKey([TVUI.Key.UP, TVUI.Key.DOWN, TVUI.Key.SELECT]);
                    AppLoader.destroy();
                }

            });


        },
        showVote: function () {
            $('#voteTitle').show();

            AppLoader.offset({
                width: 1280,
                height: 80,
                top: 560,
                left: 0
            });
            AppLoader.addKey(TVUI.Key.NUM1);
        },
        hideVoteTitle: function () {
            $('#voteTitle').hide();
            AppLoader.removeKey(TVUI.Key.NUM1);
        },
        showVoteLists: function () {
            $('#voteLists').show();
            AppLoader.offset({
                width: 410,
                height: 465,
                top: 125,
                left: 870
            });
            AppLoader.addKey([TVUI.Key.UP, TVUI.Key.DOWN, TVUI.Key.SELECT]);
        },
        setVoteLists: function () {
            var $item = $('#singerLists').find('li');
            var listsPanel = new TVUI.Panel({
                cols: 1,
                data: $item,
                loop: true
            });

            listsPanel.on('focus', function (i, li) {
                var $li = $(li);
                $li.attr('class', 'li-focus');
            });

            listsPanel.on('blur', function (i, li) {
                var $li = $(li);
                $li.attr('class', 'li-a');
            });

            listsPanel.on('select', function (i) {
                AppLoader.removeKey([TVUI.Key.UP, TVUI.Key.DOWN, TVUI.Key.SELECT]);
                APP.isDestory = true;
                AppLoader.destroy();
            });

        }

    };

    module.exports = APP;

});