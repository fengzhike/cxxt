/**
 * Created by xuyuan on 15/9/23.
 */
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var view_width = document.getElementsByTagName('html')[0].getBoundingClientRect().width;
			 var _html = document.getElementsByTagName('html')[0];
			 view_width > 640 ? _html.style.fontSize = 640 / 16 + 'px' : _html.style.fontSize = view_width / 16 + 'px';
        };


    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', function(){
        recalc();
        //document.getElementById('bgaudio').play();
    }, false);
})(document, window);