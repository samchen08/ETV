define(function (require, exports, module) {

    var app = {
        init: function () {
            var panel = new TVUI.Panel({
                cols: 2,
                data: $('li')
            });

            panel.on('select', function (i, li) {
                alert($(li).html());
            });

            TVUI.Event.onNumber(function (e) {
                if (e.number == 3) {
                    AppLoader.uninstall();
                }
            });

            TVUI.Event.onKey(TVUI.Key.ROC_IRKEY_BACK, function(){
                alert('app back');
               console.log('app back');
            });
        },
        destroy: function () {

        }
    };


    module.exports = app;
});