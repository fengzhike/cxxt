/*
 * @desc To get params from hidden input
 */
function getAllParams(noappid){
    var str = '';
    if(!noappid){
        str += $('#appid').val() ?  '&appid='+$('#appid').val() : '';
    }
    str += $('#devid').val() ?  '&devid='+$('#devid').val() : '';
    str += $('#clientid').val() ?  '&clientid='+$('#clientid').val() : '';
    str += $('#id').val() ?  '&id='+$('#id').val() : '';
    str += $('#faq_id').val() ?  '&faq_id='+$('#faq_id').val() : '';
    str += $('#os').val() ?  '&os='+$('#os').val() : '';
    str += $('#uid').val() ?  '&uid='+$('#uid').val() : '';
    return str;
}

/*
 * @desc To get params from url
 * @return string,if not found return ''
 */
function $_GET(key) {
    var searchString = document.location.search.toString();
    var returnValue = '';
    if (searchString.substr(0, 1) == '?' && searchString.length > 1)
    {
        var queryString = searchString.substring(1, searchString.length)
        var queryList = queryString.split('&');
        for (var i = 0; i < queryList.length; i++)
        {
            var oneQuery = queryList[i].split('=');
            if (oneQuery[0] == key && oneQuery.length == 2)
            {
                returnValue = oneQuery[1];
            }
        }
    }
    return returnValue;
}

/*
 * @desc To show a tip
 * 
 */
function showToast(msg, time){
    var $toast = $('<div style="width:100%;text-align:center;position:absolute;bottom:80px;z-index:999;"><span class="toast">' + msg + '</span></div>');
    $toast.appendTo('body');
    $('.toast').css({
        'display': 'inline-block',
        'opacity': 0,
        'z-index': 999
    });
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            screenHeight = window.screen.height;
    scrollTop !== undefined && screenHeight && $toast.css('top', scrollTop + screenHeight / 3 + 'px');

    $('.toast').animate({"opacity": 1}, 500, "easy-in");
    setTimeout(function(){
        $('.toast').animate({"opacity": 0}, 500, "easy-out", function() {
            $toast.remove();
        });
    }, time);
}

function loadURL(url) {
    var iFrame;
    iFrame = document.createElement("iframe");
    iFrame.setAttribute("src", url);
    iFrame.setAttribute("style", "display:none;");
    iFrame.setAttribute("height", "0px");
    iFrame.setAttribute("width", "0px");
    iFrame.setAttribute("frameborder", "0");
    document.body.appendChild(iFrame);
    iFrame.parentNode.removeChild(iFrame);
    iFrame = null;
}


// =====================为钱包H5增加的=======================================

// 为url增加get参数
function concatUrl(url, params){
    if (-1 != url.indexOf('?')){
        for (key in params){
            if(params[key]!=undefined) url += '&' + key + '=' + encodeURIComponent(params[key]);
        }
    }
    else{
        url += '?';
        for (key in params){
            if(params[key]!=undefined) url += key + '=' + encodeURIComponent(params[key]) + '&';
        }
        url = url.substr(0,url.length - 1);
    }
    return url;
}





// 获取当前url的get参数
function getUrlParams(){
  // var args = {};
  // var match = null;
  // var search = decodeURIComponent(location.search.substring(1));
  // var reg = /(?:([^&]+)=([^&]+))/g;
  // while((match = reg.exec(search))!==null){
  //   if (match[2] == undefined || match[2] == 'undefined') continue;
  //   args[match[1]] = match[2];
  // }
  // return args;
   var url = location.search; //获取url中"?"符后的字串
   var theRequest = new Object();
   if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for(var i = 0; i < strs.length; i ++) {
         theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
      }
   }
   return theRequest;
}


function setCookie(name,value){ 

    document.cookie = name+"="+value+";"; 
} 


function getCookie(name){ 
    var arr = document.cookie.split("; "); 
    for(var i=0; i<arr.length; i++){ 
        var arr2 = arr[i].split("="); 
        if(arr2[0] == name){ 
          return arr2[1]; 
        } 
    } 
    return ""; 
} 


function removeCookie(name){ 
    setCookie(name,"",0) 
} 


function objURL(url){
    var ourl=url||window.location.href;
    var href="";//?前面部分
    var params={};//url参数对象
    var jing="";//#及后面部分
    var init=function(){
        var str=ourl;
        var index=str.indexOf("#");
        if(index>0){
            jing=str.substr(index);
            str=str.substring(0,index);
        }
        index=str.indexOf("?");
        if(index>0){
            href=str.substring(0,index);
            str=str.substr(index+1);
            var parts=str.split("&");
            for(var i=0;i<parts.length;i++){
                var kv=parts[i].split("=");
                params[kv[0]]=kv[1];
            }
        }else{
            href=ourl;
            params={};
        }
    };
    this.set=function(key,val){
        params[key]=encodeURIComponent(val);
    };
    this.remove=function(key){
        if(key in params) params[key]=undefined;
    };
    this.get=function(key){
        return params[key];
    };
    this.url=function(key){
        var strurl=href;
        var objps=[];
        for(var k in params){
            if(params[k]){
                objps.push(k+"="+params[k]);
            }
        }
        if(objps.length>0){
            strurl+="?"+objps.join("&");
        }
        if(jing.length>0){
            strurl+=jing;
        }
        return strurl;
    };
    this.debug=function(){
        // 以下调试代码自由设置
        var objps=[];
        for(var k in params){
            objps.push(k+"="+params[k]);
        }
        alert(objps);//输出params的所有值
    };
    init();
}