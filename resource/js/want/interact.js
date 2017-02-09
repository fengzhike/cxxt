
var interactJs = {
    init: function () {
        /*if (!this.preInit()) {
         return;
         }*/
        this.resetData(true)
        var $p = $.mobile.activePage;
        var me = interactJs;
        $p.find('.tabContent .content').empty();
        $('.ui-header').hide();
        me.toggleEvents(true);
        me.setRem();
        me.initInteraction(0);
        me.num = 0;
        me.lastId = 0;
        me.minId =+Infinity;
        interactJs.timer = null;


    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = interactJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('.user','vclick',function(){
                    //console.log($('.chart ul').scrollTop())
                });
                $p.delegate('.more','vclick',function(){
                    var _scrollH = $('.chart ul li:last').scrollTop();
                    if(me.num ==0){me.num =10}
                    setTimeout(function(){
                        //console.log($('.a:eq(0)').outerHeight(true))
                        $('.chart ul').scrollTop(_scrollH);
                        me.initInteraction(me.num,true)
                        //console.log(me.num)
                        $p.find('.more').hide()

                    },50)
                });
                $p.delegate('.chart ul','scrollstart',function(){
                    var dis = this.scrollHeight-(this.clientHeight+this.scrollTop);
                    if(dis<10){
                        $p.find('.more').show();
                    }
                })
                $('.send input').focus(function(){
                    //alert(1)
                    $('.send input').css('border:2px solid #6fa3f1;')
                });
                $p.delegate('.send input').blur(function(){
                    $('.send input').css('border','none')
                });

                $p.delegate('.sendRight','vclick',function(){
                    var user = dmJs.sStore.getUserInfo();
                    if (user == null) {
                        me.preInit();
                    }else{
                        me.publishInteraction();
                    }
                }) ;
                $p.delegate('.chart .system','vclick',function(){
                    //alert(1)
                    //console.log($(this).attr('data-relaledid'))
                    var serviceID =$(this).attr('data-relaledid');
                    var params={serviceID:serviceID}
                    var origin = window.parent.location.origin;
                    var regExp = /188:8080/,
                        regExpL = /localhost/,
                        regExpl1 =    /186:8080/;
                    if(regExp.test(origin)){
                        origin += '/edu'
                    };
                    if(regExpL.test(origin)){
                        origin += '/edu'
                    }
                    if(regExpl1.test(origin)){
                        origin += '/edu'
                    }
                    //console.log(origin)
                    window.location.href=origin+"/service.html?serviceID="+serviceID;

                });
                //console.log(window.parent.location.origin)
            }, 500);


        }
    },setRem:function(){
        var me = interactJs;
        setTimeout(function() {
            var $p = $.mobile.activePage;
            oHtml = $p.parent().parent()[0];
            var iWidth=document.documentElement.clientWidth;
            iWidth= iWidth>600 ? 480:iWidth;
            oHtml.style.fontSize = iWidth/16+"px";
        }, 5);
        var timerAuto = setInterval(function(){
            if(interactJs.timer) return;
            //console.log(mainJs.parseUrlSearchTop().liveID)

            console.log('定时加载')
            me.initInteraction(0);
            //console.log('aaaaaaaaaaaaaaaaa')

        },5000);

    },_fetchSelTab:function(){
        var me = interactJs;
        var $p = $.mobile.activePage;
        var currentTab = $p.find('.current[tabi]').attr('tabi');
        if(currentTab == 2){
            me.getFinishedWants();
        } else {
            me.getUnfinishedWants();
        }
    }, resetData: function (bInit) {
        var me = interactJs;
        me.initFinishedWants.busy = false;
        me.initUnfinishedWants.busy = false;

    },doAction: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var me = interactJs;
        var $el = $(this);
        var action = $el.attr('action');
        var param = $el.attr('param');
        switch (action) {
            case 'edit':
                if (!dmJs.hasLogin()) {
                    dmJs.sStore.toLogin({url: './question.html', id: 'question', options: {data: {wantID: param}}});
                    return;
                }
                viewJs.navigator.next({next: {url: './addQuestion.html', id: 'addQuestion', options: {data: {wantID: param,catId:5}}}, lastAuto: true});
                break;
            case 'close':
                me.finishedWant(param, $el);
                break;
            case 'reopen':
                me.reopenWant(param, $el);
                break;
            case 'wantDetail':
                me.toWantDetails.apply($el);
                break;
            case 'pageNav':
                if($el.is('.tab1 [action]')){
                    me.getUnfinishedWants.call($el, e);
                } else {
                    me.getFinishedWants.call($el, e);
                }
                break;
        }
    },toggleTab: function () {
        var params = mainJs.parseUrlSearch();
        if (params.tab == 2) {
            var $p = $.mobile.activePage;
            $p.find('.tabCtr .tab1').removeClass('current').
                end().find('.tabCtr .tab2').addClass('current');
        }
    },
    preInit: function () {
        //window.parent.load();
        /*var next = {url:'./liveCast.html'+window.parent.location.search, id:'liveCast'};
        dmJs.sStore.saveSuccessTo(next);
        window.parent.viewJs.navigator.next({
            next:{url:'./login.html', id:'signIn'}
        });*/
        window.parent.dmJs.sStore.toLogin({url:'./liveCast2.html', options:{data:mainJs.parseUrlSearchTop()}});
        //window.parent.liveCastInit();


    },publishInteraction:function(){
        //alert('成功发布')
        var $p = $.mobile.activePage;
        var me = interactJs;
        var strVl = $p.find('.send input').val();
        var param ={};
        var user = dmJs.sStore.getUserInfo();
        var accessToken = user.accessToken;
        /* varParams.pageSize = mainJs.PAGE_SIZE;
         varParams.offset = varParams.offset || 0;*/
        if(strVl.trim().length ==0){
            $p.find('.send input').attr('placeholder','发送内容不能为空~~~');
            setTimeout(function(){
                $p.find('.send input').attr('placeholder','提个问，证明来过');
            },500)
        }else{
            param.accessToken = accessToken;
            param.content =strVl ;
            param.liveID = mainJs.parseUrlSearchTop().actId?mainJs.parseUrlSearchTop().actId:'chuangxinxuetang';
            param.serviceID = mainJs.parseUrlSearchTop().serviceID?mainJs.parseUrlSearchTop().serviceID:16461;
            param.pageSize = 10;
            param.offset = 0;
            /*
            .................................................
            */
            var url = mainJs.getApiUrl('/urming_quan/live/publishInteraction');

            $.post(url, param, function(data, statusText, jqhr){
                    var res = $.parseJSON(data);
                    var htl = '';
                    var item = res.data;
                    //console.log(item)
                    var dailId = item.id,
                        dailUrl =mainJs.getProfilePicUrl({url:item.user.profileImageUrl,sex:item.sex}),
                        dailName = item.user.realname,
                        dailContent = item.content,
                        dailTime = item.creTime;
                    //console.log(dailContent);
                    htl = '<li data-id = '+dailId+'>\
                        <div class="svrUserInfo vbt vr ui-link">\
                            <img src= '+dailUrl+' alt=""/>\
                        </div>\
                        <div class="right-text">\
                            <div class="user_head">\
                                <a>'+dailName+'</a>\
                            </div>\
                            <p class="mess_content">'+dailContent+'</p>\
                        </div>\
                      </li>';
                    ///console.log(htl)
                    //$(htl).appendTo($p.find('.chart ul'),'top');
                    $p.find('.chart ul').html(htl+$p.find('.chart ul').html());
                    me.lastId = dailId;
                    $('.send input').val('');

                }
            ).error(function(){
                    viewJs.showPopMsg('网络错误');
                });

        }


        //console.log(strVl)

    },initInteraction:function(num,moreOn){
        //console.log(num)
        var $p = $.mobile.activePage;
        var me = interactJs;
        var user = dmJs.sStore.getUserInfo();
        if (user != null){
            var param ={};
            var user = dmJs.sStore.getUserInfo();
            //console.log(user)
            var infoImg =  mainJs.getProfilePicUrl({url:user.user.profileImageUrl,sex:user.sex});
            //
            $('.send img').attr('src',infoImg)
            var accessToken = user.accessToken;
            param.accessToken = accessToken;
            param.liveID = mainJs.parseUrlSearchTop().actId?mainJs.parseUrlSearchTop().actId:'chuangxinxuetang';
            param.serviceID = mainJs.parseUrlSearchTop().serviceID?mainJs.parseUrlSearchTop().serviceID:16461;
            param.pageSize = 10;
            param.offset = num? num:0;
            //console.log(param)
            var url = mainJs.getApiUrl('/urming_quan/live/getInteractionList');
            //console.log(param)
            $.get(url,param,function(data, statusText, jqhr){
                me.initChartList(data,moreOn);
            })
        }



    },initChartList:function(data,moreOn){
        var data = $.parseJSON(data);
        //console.log(data)
        if(data.error){
            console.log('请求失败')
            return
        }
        var $p = $.mobile.activePage;
        var me = interactJs;
        var total = data.total;
        var data = data.datas;
        var l = data.length;
        var htl = '';
        if(!moreOn){
            for(var i = 0;i<l;i++){
                var item = data[i];
                var dailId = item.id;
                me.minId = me.minId<dailId?me.minId:dailId;
                var type = item.type;
                var dailContent = item.content;
                if(dailId >me.lastId){
                    if(type ==0){
                        var dailUrl =mainJs.getProfilePicUrl({url:item.user.profileImageUrl,sex:item.sex}),
                            dailName = item.user.realname,
                            dailTime = item.creTime;

                        htl+='<li data-id = '+dailId+'>\
                        <div class="svrUserInfo vbt vr ui-link">\
                            <img src= '+dailUrl+' alt=""/>\
                        </div>\
                        <div class="right-text">\
                            <div class="user_head">\
                                <a>'+dailName+'</a>\
                            </div>\
                            <p class="mess_content">'+dailContent+'</p>\
                        </div>\
                      </li>';
                    }else{
                        var relaledID = item.relatedId;
                        htl+='<li class="system" data-id = '+dailId+' data-relaledID = '+ relaledID+'>\
                            <div class="svrUserInfo vbt vr ui-link">\
                                <img src= ./resource/images/live/system.png alt=""/>\
                            </div>\
                            <div class="right-text">\
                                <p class="mess_content">'+dailContent+'</p>\
                            </div>\
                        </li>';
                    }
                }


            }
            $p.find('.chart ul').html(htl+$p.find('.chart ul').html());
            //console.log(data.datas[0])
            me.lastId = data.length > 0 ? data[0].id:0;
            //console.log(me.lastId)
        }else{
            if(l==10){me.num+=10;}
            for(var i = 0;i<l;i++){
                var item = data[i];
                var dailId = item.id;
                if(me.minId>dailId){
                    me.minId =  dailId;
                }else{
                    return;
                }
                if(dailId)
                var type = item.type;
                var dailContent = item.content;
                if(type ==0){
                    var dailUrl =mainJs.getProfilePicUrl({url:item.user.profileImageUrl,sex:item.sex}),
                        dailName = item.user.realname,
                        dailTime = item.creTime;

                    htl+='<li data-id = '+dailId+'>\
                    <div class="svrUserInfo vbt vr ui-link">\
                        <img src= '+dailUrl+' alt=""/>\
                    </div>\
                    <div class="right-text">\
                        <div class="user_head">\
                            <a>'+dailName+'</a>\
                        </div>\
                        <p class="mess_content">'+dailContent+'</p>\
                    </div>\
                  </li>';
                }else{
                    var relaledID = item.relatedId;
                    htl+='<li class="system" data-id = '+dailId+' data-relaledID = '+ relaledID+'>\
                        <div class="svrUserInfo vbt vr ui-link">\
                            <img src= ./resource/images/live/system.png alt=""/>\
                        </div>\
                        <div class="right-text">\
                            <p class="mess_content">'+dailContent+'</p>\
                        </div>\
                    </li>';
                }

            }
            $('.chart ul').append(htl);
        }
    },toWantDetails: function () {
        var $m = $(this);
        var wantID = $m.attr('data-item-id');
        if (wantID != null && wantID != '') {
            var params = {wantID: wantID};
            viewJs.navigator.next({
                next: {url: './question.html', id: 'question',
                    options: {
                        data: params
                    }},
                last: {
                    id: 'myQuestions',
                    url: './myQuestions.html',
                    options: {
                        data: {tab: $m.attr('tab')}
                    }
                }
            });
        }
    },
    getUnfinishedWants: function (params) {
        if(params==undefined){
            params = {};
        }
        if(params && params.type == 'vclick'){
            var $el = $(params.target);
            if($el.is('.disabled')){
                return;
            }
            var offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
            var params = {offset:offset};
        }
        var me = interactJs;
        params.status = 1;
        var url = '/urming_quan/want/getMyQuestions';
        me.loadData(url, params, me.initUnfinishedWants);
    },
    getFinishedWants: function (params) {
        if(params==undefined){
            params = {};
        }
        if(params && params.type == 'vclick'){
            var $el = $(params.target);
            if($el.is('.disabled')){
                return;
            }
            var offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
            var params = {offset:offset};
        }
        var me = interactJs;
        params.status = 0;
        var url = '/urming_quan/want/getMyQuestions';
        me.loadData(url, params, me.initFinishedWants);
    },reopenWant:function(wantID, $el){
        var me = interactJs;
        var url = '/urming_quan/want/reopenWant';
        me.loadData(url, {wantID: wantID}, function () {
            var $p = $.mobile.activePage;
            var $pre = $el.prev();
            location.reload();
        });
    },
    finishedWant: function (wantID, $el) {
        viewJs.dialogPop('确定关闭该需求？',function(ok){
            if(ok){
                var me = interactJs;
                var url = '/urming_quan/want/finishedWant';
                me.loadData(url, {wantID: wantID}, function () {
                    var $p = $.mobile.activePage;
                    var $pre = $el.prev();
                    location.reload();
                });
            }
        },'提示');
    },
    initFinishedWants: function (data, opt) {
        var total = data.total;
        var wants = data.datas;
        var l = wants.length;
        var $p = $.mobile.activePage;
        var $c = $p.find('.tabContent>.tab2');
        var paperTpl = $p.find('#paper_tpl').html();
        var tpl = $p.find('#want_close_tpl').html();
        var html = [], i = 0;
        var item, info;
        for (; i < l; i++) {
            item = wants[i];
            info = {};
            info.id = item.id;
            info.name = item.wantName;
            info.price = item.price;
            info.responseNumber = item.responseNumber;
            /*
             info.catId = item.category.category.id;
             */
            html.push(viewJs.applyTpl(tpl, info));
        }
        if(l > 0){
            var _PAGE_SIZE = mainJs.PAGE_SIZE;
            var pageInfo = {};
            pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl(paperTpl, pageInfo));
        } else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }
        $c.html(html.join(''));
    },
    initUnfinishedWants: function (data,opt) {
        var total = data.total;
        var wants = data.datas;
        var l = wants.length;
        var $p = $.mobile.activePage;
        var $c = $p.find('.tabContent>.tab1');
        var paperTpl = $p.find('#paper_tpl').html();
        var tpl = $p.find('#want_open_tpl').html();
        var html = [], i = 0;
        var item, picUrl, serviceVersion;
        var actionBtn;
        var marker,info;
        for (; i < l; i++) {
            item = wants[i];
            info = {};
            info.id = item.id;
            info.name = item.wantName;
            info.price = item.price;
            /*
             info.status = 'wantStatus'+item.status;
             info.catId = item.category.category.id;
             if(item.status == 1){
             info.btnCls = "hidecls";
             } else {
             info.btnCls = "";
             }
             */
            html.push(viewJs.applyTpl(tpl, info));
        }
        if(l > 0){
            var _PAGE_SIZE = mainJs.PAGE_SIZE;
            var pageInfo = {};
            pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl(paperTpl, pageInfo));
        } else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }
        $c.html(html.join(''));
    }, loadData: function (url, params, callback) {
        var me = interactJs;
        if(callback.busy){
            return;
        }
        callback.busy = true;
        var varParams = params || {};
        var user = dmJs.sStore.getUserInfo();
        var userInfo = user.user;
        var accessToken = user.accessToken;
        varParams.pageSize = mainJs.PAGE_SIZE;
        varParams.offset = varParams.offset || 0;
        varParams.accessToken = accessToken;
        dmJs._ajax({
            id: 'myWants',
            url: url,
            params: varParams,
            accessInvalid: function () {
                dmJs.sStore.logout();
                dmJs.sStore.toLogin({url: './myWants.html'});
                return;
            },
            callback: function (ret) {
                callback(ret, varParams);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(callback);
        });
    }
};