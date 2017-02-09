 /*
    doMove时间运动函数
        参数
            1. obj 运动元素
            2. {}json，一个对象，保函变化的属性{left:500,top:500,opacity:0}
            3. d  运动持续时间
            4. fx 运动形式（贝赛尔曲线） "linear"
            5. callBack 回调函数

*/

function timeMove(obj,json,d,fx,callBack){
    if( obj.timerT ) return;
    if( typeof fx ==='function' ){
        callBack = fx;
        fx = 'linear';
    };
    fx = fx || 'linear';
    var jsonArr = {};
    for(var attr in json){
        jsonArr[attr] = {};
        jsonArr[attr].s = parseFloat( getStyle(obj,attr) ) ;//拿到Tween用的每个属性的起始位置b;
        jsonArr[attr].c = json[attr] - jsonArr[attr].s;//拿到Tween用的每个属性的count总的运动值 c;
    };
    var time = new Date().getTime();
    obj.timerT = setInterval(function(){
        var t = new Date().getTime() - time;//拿到Tween用的每个属性的time已过时间值t;
        for(var attr2 in json){
            var value = Tween[fx](t, jsonArr[attr2].s, jsonArr[attr2].c, d);
            if( attr2 === "opacity" ){
                obj.style.opacity = value;
                obj.style.filter = "alpha(opacity="+value*100+")";
            }else{
                obj.style[attr2] = value + "px";
            }
        };
        if( t >=  d ){
            clearInterval(obj.timerT);
            obj.timerT = null;
            (typeof callBack === "function") && callBack();
        };
    } , 16);
};
function getStyle(obj,attr){
    return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
};