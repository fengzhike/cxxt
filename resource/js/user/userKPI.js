userKPIJs = {
    init:function(){
        var user = viewJs.chkLogin();
        if(!user){
            return;
        }
        this.initPage(user);
    },initPage:function(user){
        var $p = $.mobile.activePage;
        var $ct =$p.find('.list-sep').empty();
        dmJs._ajax({id:'getUserKPI', url:'/urming_quan/user/getUserKPI',params:{accessToken:user.accessToken},
            callback:function(data){
                var tpl = $p.find('#userKPITpl').html();


                if($.isNumeric(data.prvalue )){
                    data.prvalue = Math.ceil(Number(data.prvalue));
                } else {
                    data.prvalue = 0;
                }
                $ct.html(viewJs.applyTpl(tpl, data));
            }
        })
    },toggleEvents:function(isBind){

    }
};