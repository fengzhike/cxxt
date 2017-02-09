liveCastJs = {
    offset:0,
    init:function(){
        this.initData();
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
            '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
        $('#liveCast input:text').parent().remove();
        this.setRem();
        this.autoPlay();
    },toggleEvents:function(isBind){
        var me = liveCastJs;
        var $p = $.mobile.activePage;
        $p.undelegate();
        $('#id_video_container').bind('contextmenu',function() { return false; });
        if(isBind){
            $p.one('pagebeforehide', function(){	me.toggleEvents();});
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.tab_bar strong','vclick',me.tabChart);
            },500);
        }
        $(window).on("orientationchange",me.orientationchange);
    },autoPlay:function(){
        if($('#play object').length) return;
        var actId = mainJs.parseUrlSearch().actId? mainJs.parseUrlSearch().actId: 'chuangxinxuetang',
            serviceID = mainJs.parseUrlSearchTop().serviceID?mainJs.parseUrlSearchTop().serviceID:16461;
        var objectPlayer=new aodianPlayer({
            container:'play',//播放器容器ID，必要参数
            rtmpUrl: 'rtmp://12317.lssplay.aodianyun.com/'+actId+'/stream',//控制台开通的APP rtmp地址，必要参数
            hlsUrl: 'http://12317.hlsplay.aodianyun.com/chuangxinxuetang/stream.m3u8',//控制台开通的APP hls地址，必要参数
            /* 以下为可选参数*/
            width: '100%',//播放器宽度，可用数字、百分比等
            height: 240,//播放器高度，可用数字、百分比等
            autostart: true,//是否自动播放，默认为false
            bufferlength: '1',//视频缓冲时间，默认为3秒。hls不支持！手机端不支持
            maxbufferlength: '2',//最大视频缓冲时间，默认为2秒。hls不支持！手机端不支持
            stretching: '1',//设置全屏模式,1代表按比例撑满至全屏,2代表铺满全屏,3代表视频原始大小,默认值为1。hls初始设置不支持，手机端不支持
            controlbardisplay: 'enable',//是否显示控制栏，值为：disable、enable默认为disable。
            //adveDeAddr: '',//封面图片链接
            //adveWidth: 320,//封面图宽度
            //adveHeight: 240,//封面图高度
            //adveReAddr: ''//封面图点击链接
        });
    },setRem:function(){
        var $oHtml = $('#liveCast').parent().parent();
        var iWidth=$('#liveCast').width();
        $oHtml.css('fontSize', iWidth/16+"px");
    },tabChart:function(){
        $('.tab_bar strong').removeClass('this_act');
        $(this).addClass('this_act');
        $('.chart_box').removeClass('box_act').eq($(this).index()).addClass('box_act');

    }, orientationchange:function(){
        switch(window.orientation) {
            case 0:
            case 180:
                break;
            case -90:
            case 90:
                break;
        }
    },initData:function(){
        var me = liveCastJs;
        if(!(/actId/.test(location.href))){
            return;
        }
        var params = mainJs.parseUrlSearch();
        if($.trim(params.serviceID) == ''){
            viewJs.showApiError({error_code:'20201'});
            return;}
        if(typeof(params.offset) !=  "undefined" && params.offset !=  ""){
            liveCastJs.offset = params.offset;
        }else{
            liveCastJs.offset = 0;
        }
        params.longitude = dmJs.params.geolocation.longitude;
        params.latitude = dmJs.params.geolocation.latitude;
        this.getServiceByID(params,  this.initServiceDetailInfo);
        if(params.tab == 'wants'){
            var $p = $.mobile.activePage;
            var $el = $(".ui-block-c");
            $(".info,#chapter,#wants").hide();
            $('#result_not_found_container').hide();
            $p.removeClass('not-found');
            $p.find('[tab].sel').removeClass('sel');
            $p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
            $("#wants").show();
        }
    }
};

