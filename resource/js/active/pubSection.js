/**
 * Created by fsk on 2016/5/10.
 */
pubSectionJs={
    init:function(){
        this.toggleEvents(true);
        this.initPage();
    },initPage:function(){
        var $p = $.mobile.activePage;
        var me = pubSectionJs;

    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = pubSectionJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            var accessToken = dmJs.getAccessToken();
            setTimeout(function() {
                me.toggleEvents($p);
                $p.delegate('.tab .tab_l','vclick',function(){
                    $('.tab_l').removeClass('no');
                    $('.tab_r').addClass('no');
                    $('.con_l').show();
                    $('.con_r').hide();

                })
               $p.delegate('.tab .tab_r','vclick',function(){
                    $('.tab_l').addClass('no');
                    $('.tab_r').removeClass('no');
                    $('.con_l').hide();
                    $('.con_r').show();
                })
                $p.delegate('.regist','vclick',function(){
                    dmJs.sStore.save("sourceTag","fcf21b3a8d8ed");
                    dmJs.sStore.save("acTag",'pubSection');
                    viewJs.navigator.next({next: {url: './register.html', id: 'register', options: {data: {pubSection:true,type:2}}}, lastAuto: true});
                })

            }, 500);

        }
    },toIndex:function() {
        viewJs.navigator.next({next:{url:'./', id:'startpage'}});
    }
};
