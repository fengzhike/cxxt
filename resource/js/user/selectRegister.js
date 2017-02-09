selectRegisterJs = {
    init:function(){
        viewJs.clearRegister();
        this.toggleEvents(true);
        this.initPage();
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
                '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
    },initPage:function(){
        var $p = $.mobile.activePage;
        var params = mainJs.parseUrlSearch();
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = selectRegisterJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.publish-type-row', 'vclick', me.toRegisterPage);
            }, 500);
        }
    },toRegisterPage:function(){
        viewJs.navigator.next({next:{url:'./register.html',id:'register',options:{data:{type:$(this).data("type")}}}, lastAuto:true});
    }
}