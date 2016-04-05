(function () {

    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');


    script.onload = function () {
        seajs.use('tvui', function () {
            AppLoader.appInit();
        });
    };

    script.src = AppLoader.seajs;
    head.appendChild(script);


})();


