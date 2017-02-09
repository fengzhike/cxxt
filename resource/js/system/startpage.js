startpageJs = {
    downCloseExpiredTime:2592e6,
    init: function () {
        var menu=[];
        var $p = $.mobile.activePage;
        $.each([{label:"分类"},{label:"课程"},{label:"活动"},{label:"市场服务"},{label:"市场需求"}], function(i,t){
            menu.push(['<li>','<a href="#" class="ui-btn">', t.label,'</a></li>'].join(''));
        });
        $('#cat-menu').hide().html(menu.join(''));
        this.toggleEvents(true);
        this.fetchData();
        viewJs.setRem($p);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
            '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
    },toggleEvents:function(isBind){
        var $p = $('#startpage');
        var me = startpageJs;
        $p.undelegate().unbind('pagebeforehide');
        if(isBind){
            $p.on('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.ui-content [data-cat]', 'vclick', me.toCatSvrs).
                    delegate('.btn-publish-service-cls', 'vclick', me.publishSvr).
                    delegate('.svr', 'vclick', me.toHotSvr).
                    delegate('.btn-publish-want-cls', 'vclick', me.publishWant).
                    delegate('#filter-shortcut', 'vclick', me.toSearchPage).
                    delegate('#aUser', 'vclick', me.toLoginUserPage).
                    delegate('.download-con .close-btn-con', 'vclick', me.closeDownFrame).
                    delegate('.download-con [link]', 'vclick', me.locationTo).
                    delegate('.desktop-con .close-btn-con', 'vclick', me.closeAddDesktop)
                    .delegate('.vHeader .toCitylist', 'vclick', function(){
                        viewJs.navigator.next({next:{url:'./changeCity.html', id:'changeCity'},lastAuto:true});
                    }).delegate('#cat-list-btn', 'vclick', function(){
                        var m = $('#cat-menu');
                        m.fadeToggle(true);
                    }).delegate('#cat-menu a', 'vclick', function(e){
                        console.log(e);
                        $('#cat-list-btn').text($(e.currentTarget).text());
                        var m = $('#cat-menu');
                        m.fadeToggle(true);
                        e.preventDefault();
                        e.stopPropagation();
                    }).
                    delegate('#home-search-btn', 'vclick',function(){
                        var txt = $.trim($('#filter-shortcut').val());
                        if(txt==''){
                            return;
                        }
                        var cat = $.trim($('#cat-list-btn').text());
                        if(cat=='分类'){
                            cat='';
                        }
                        alert(cat+':'+txt);
                    }).delegate('.h-menu [action]', 'vclick',headerFooterJs._action)
                    .delegate('.newlyPostedTitle', 'vclick',me. toNewlyPosted).
                    delegate('.around_sear_logo','vclick',function(){
                        var params = {distance:5000};
                        viewJs.navigator.next({
                            next:{url:'./searchAll.html', id:'searchAll', options:{data:params}},
                            lastAuto:true
                        });
                    });
                $p.delegate('.pic_list','vclick',function(){
                    var dataStr = $(this).attr('datas');
                    if(dataStr.indexOf('http') != -1){
                        window.location.href = dataStr;
                    }else{
                        var params = {serviceID:dataStr};
                        viewJs.navigator.next({next:{url:'./service.html', id:'service',options:{data:params}},lastAuto:true});
                    }


                })
            },500);
        }
    },touchSlide:function(data){
        var me = startpageJs;
        $.getScript("resource/js/move/TouchSlide.1.1.js")
            .done(function() {
                /* 耶，没有问题，这里可以干点什么 */
                me.setupAdvertisement(data);
            })
            .fail(function() {
                /* 靠，马上执行挽救操作 */
            });
    },toHotSvr:function(){
        var $m = $(this);
        var params = {serviceID:$m.attr('data-id')};
        viewJs.navigator.next({
            next:{url:'./course.html', id:'course', options:{data:params}},
            lastAuto:true
        });
    },toLoginUserPage:function(){
        var next = {url:'./mine.html', id:'mine'};
        if(!dmJs.hasLogin()){
            dmJs.sStore.toLogin(next);
            return;
        }
        viewJs.navigator.next({next:next});
    },closeDownFrame:function(){
        localStorage.setItem('downCloseDate', new Date().getTime());
        $(this).parents('.download-con').fadeOut(800);
    },closeAddDesktop:function(){
        localStorage.setItem("colseDesktop","true");
        $(this).parents('.desktop-con').fadeOut(800);
    },locationTo:function(){
        location.href = $(this).attr('link');
    },toSearchPage:function(){
        viewJs.navigator.next({next:{url:'./searchAll.html', id:'searchAll'}});
    },publishSvr:function(){
        var next = {url:'./addService.html', id:'addService'};
        if(!dmJs.hasLogin()){
            dmJs.sStore.toLogin(next);
            return;
        }
        viewJs.navigator.next({
            next:next,
            lastAuto:true
        });
    },publishWant:function(){
        var next ={url:'./addWant.html', id:'addWant'};
        if(!dmJs.hasLogin()){
            dmJs.sStore.toLogin(next);
            return;
        }
        viewJs.navigator.next({
            next:next,
            lastAuto:true
        });
    },toCatSvrs:function(e){
        e.stopPropagation();
        e.preventDefault();
        var $el = $(this);
        var next = {};
        var cat = $el.attr('data-cat');
        //console.log(cat);
        var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
        };
        switch(cat){
            case 'course':
                next.url='./myLessons.html';
                next.id='myLessons';
                next.options={data:{catId:1}};
               /* next = {
                    id: 'courseTypes',
                    url: './courseTypes.html'

                };*/
                viewJs.navigator.next({next:next});
                return;
            case 'market':
                next = {
                    id: 'market',
                    url: './market.html'

                };
                viewJs.navigator.next({next:next});
                return;
            case 'job':
                window.location.href="http://rencai.euming.com/m/wap-jobs-list.php?key=&district=&sdistrict=";
                return;
                //params.orderType=0;
                //$.extend(params, {searchKind:"crowdfunding","categoryName":"融资","categoryParentId":"8","catId":"8"});
                //break;
                //$.extend(params, {searchKind:"recruit","categoryName":"招聘","categoryParentId":"7","catId":"7"});
                //delete params.searchKind;
                //break;
            case 'activity':
                $.extend(params, {"lockCat":"true","categoryName":"活动","categoryParentId":"4","catId":"4"});
                break;
            case 'question':
                $.extend(params, {searchKind:"question","categoryName":"问题","categoryParentId":"5","catId":"5"});
                break;
        }

        next = {
            id: 'services',
            url: './searchResult.html',
            options: {
                data: params
            }

        };
        viewJs.navigator.next({next:next});
    },fetchData:function(){
        if(mainJs.parseUrlSearch().toast != undefined && mainJs.parseUrlSearch().toast != ''){
            viewJs.showPopMsg(mainJs.parseUrlSearch().toast);
        }
        var me = this;
        if(!browser.versions.iosMobile){
            var lastCloseTime = localStorage.getItem('downCloseDate');
            var isExpire = lastCloseTime == null || new Date().getTime() - parseInt(lastCloseTime) > me.downCloseExpiredTime;
            if(isExpire){
                var $p = $('#startpage');
                $p.find('.download-con').show();
            }

        }else{
            if(localStorage.getItem('colseDesktop')!="true"){
                $('#startpage').find('.desktop-con').show();
            }
        }
        var geolocation =  dmJs.params.geolocation;
        var params = {
            //platformType:'2'
        };
        if(geolocation){
            params.latitude = geolocation.latitude;
            params.longitude = geolocation.longitude;
        }
        this.initNewlyPosted();
        var run = setInterval(function() {
            startpageJs.initNewlyPosted();
        },80000);
        var test = setInterval(function() {
            if($.mobile.activePage.attr( "id" ) != "startpage"){
                clearInterval(run);
                clearInterval(test);
                return;
            }
        },500);
        dmJs._ajax({
            id:'getHomePage',
            url:'/urming_quan/system/getIndexHomePage',
            params:params,
            callback:this.initHomePage
        });
        dmJs.getCategories();
        viewJs.afterToggleLogin();
    },toServiceDetail:function(){
        var $m = $(this);
        var serviceID = $m.attr('data-serviceID');
        if(serviceID != null && serviceID != ''){
            var params = {serviceID:serviceID};

            viewJs.navigator.next({
                next:{url:'./service.html', id:'service',
                    options:{
                        data:params
                    }}
            });
        }
    },initHomePage: function (data) {
        var me = startpageJs;
        var $p = $('#startpage');
        me.touchSlide(data);
        //return;
        //var categories = data.categories;
        //var $l = $('.catSvrs').empty();
        //var sTpl = $('#catSvrs_tpl').text();
        //$.each(categories, function(i, cat){
        //    cat.imageUrl = mainJs.getSvrPicUrl({url: cat.imageUrl,size:0});
        //});
        //$l.html(viewJs.applyTpl(sTpl, categories));
        var opt = {
            dataKey:'services',
            paperTpl:'',
            $content:$('#hot-users'),
            offset:0
        };
        opt.itemParser = me.formatUserItem;
        opt.tpl = $('#user_item_tpl').html();
        viewJs.parseList(data, opt);
        //fsk红点提醒
        if(dmJs.sStore.getUserInfo()){
            var params = {
                accessToken : dmJs.sStore.getUserInfo().accessToken,
                distance:5000,
                longitude: dmJs.params.geolocation.longitude,
                latitude: dmJs.params.geolocation.latitude

            }

            dmJs._ajax({
                id:'getAroundHints',
                url:'/urming_quan/system/getAroundHints',
                params:params,
                callback:me.setRemindTips
            });
        }

       //console.log( mainJs.getActPicUrl($p.find('img').attr('src')) )

        //fsk  微信分享
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){
            $.get(mainJs.getApiUrl('/urming_quan/user/getWxJsApi'),
                {url:location.href.split('#')[0],random:Math.random()},
                function(data){
                    var r = $.parseJSON(data);
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: 'wx3b462eee381207f3', // 必填，公众号的唯一标识
                        timestamp: r.timestamp , // 必填，生成签名的时间戳
                        nonceStr: r.noncestr, // 必填，生成签名的随机串
                        signature: r.signature,// 必填，签名，见附录1
                        jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                    wx.ready(function(){
                        wx.onMenuShareAppMessage({
                            title:'创新学堂-互联网众创平台', // 分享标题
                            desc: '欢迎来到创新学堂', // 分享描述
                            link: 'http://m.edu.euming.com/', // 分享链接
                            imgUrl: $p.find('img').attr('src'), // 分享图标
                            type: 'link', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function () {
                                // 用户确认分享后执行的回调函数
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                            }
                        });
                        wx.onMenuShareTimeline({
                            title: '创新学堂-互联网众创平台', // 分享标题
                            link: 'http://m.edu.euming.com/', // 分享链接
                            imgUrl: $p.find('img').attr('src'), // 分享图标
                            success: function () {
                                // 用户确认分享后执行的回调函数
                            },
                            cancel: function () {
                                // 用户取消分享后执行的回调函数
                            }
                        });
                        wx.error(function(res){
                            //alert(res);
                            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                        });
                    });
                }).error(function(){
                    viewJs.showPopMsg('网络错误');
                });
        }
    },setRemindTips:function(data){
        var $p = $('#startpage');
        if(data.courseHint||data.serviceHint||data.wantHint||data.questionHint||data.activityHint){
            $p.find('.remind').show();
        }else{
            $p.find('.remind').hide();
        }
        //console.log(111)
    }, setupAdvertisement: function (data) {
        var me = startpageJs;
        var ads = data.advertisement;
        var $p = $('#startpage');
        var i = 0, l = ads.length, item;
        var images = [];
        for (; i < l; i++) {
            item = ads[i];
            images[i] = mainJs.getSvrPicUrl({url: item.picUrl, size: 0});
        }
        var $ctr = $('.bannerAdPics');
        var str = '<div id="focus" class="focus">';
        var navStr = '';
        str +='<div class="hd">\
        <ul></ul>\
        </div>';
        str += '<div class="bd"><ul>'
        for(var j=0;j<images.length;j++){
            str+='<li class="pic_list" datas = "'+ads[j].data +'">' +
            '<img src="'+ images[j] +'"/>'+
            '</li>';
        }
        str += '</ul></div>';
        //console.log(images)
        $ctr.html(str);
        if(l>1){
            TouchSlide({
                slideCell:"#focus",
                titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                mainCell:".bd ul",
                effect:"leftLoop",
                autoPlay:true,//自动播放
                autoPage:true //自动分页
            });
        }




        //$ctr.height($cmp.height());
        /* $cmp.find('.slide').each(function(i, t){
         var index = Number($(t).attr('iindex'));
         var item = ads[i];
         if(!item){
         return;
         }
         //console.log(item);
         var txt = item.title;
         //var  txt = "wewewe";
         if(!txt){
         return;
         }
         var ret = [];
         ret.push('<div class="slide-txt">',txt,'</div>');
         $(t).append(ret.join(''));
         });*/


    },formatUserItem:function(item){
        var info = {};
        info.sex = viewJs.setSexMarkCls(item);
        info.userType= item.type == 1 ? 'person' : 'enterprise';
        info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
        info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
        info.id = item.id;
        info.serviceName = item.serviceName;
        info.watchNumber = Number(item.realViewCount) || '暂无';
        info.newPrice = item.newPrice;
        //info.prvalue = Math.floor(item.prvalue);
        info.username = item.username;
        info.img =  mainJs.getCoursPicUrl({url:item.picUrl,size:2});
        //info.tag = tagHtmls.join('');
        return info;
    },initNewlyPosted:function(){
        $.get(mainJs.getApiUrl('/urming_quan/system/getNewlyPosted'), function(data){
            var l = data.newlyPosts.length;
            var i = 0,count=20;
            //console.log(data.newlyPosts)
            var newlyPosted = data.newlyPosts[0];
            $(".newlyPostedTitle").html("<span>"+newlyPosted.category.category.categoryName+"</span>"+newlyPosted.title);
            $(".newlyPostedTitle").data("categoryId",newlyPosted.id);
            $(".newlyPostedTitle").data("catId",newlyPosted.category.category.id);
            var run = setInterval(function() {
                i++;
                newlyPosted = data.newlyPosts[i%l];
                if(i==count-1){
                    clearInterval(run);
                    return;
                }
                $(".newlyPostedTitle").html("<span>"+newlyPosted.category.category.categoryName+"</span>"+newlyPosted.title);
                $(".newlyPostedTitle").data("categoryId",newlyPosted.id);
                $(".newlyPostedTitle").data("catId",newlyPosted.category.category.id);
            },4000);
            var test = setInterval(function() {
                if($.mobile.activePage.attr( "id" ) != "startpage"){
                    clearInterval(run);
                    clearInterval(test);
                    return;
                }
            },500);
        },"json");
    },toNewlyPosted:function(){
        var categoryId = $(this).data("categoryId");
        var catId = $(this).data("catId");
        var params = {/*orderType: 4, area1: '中国', pageSize: 20, offset: 0,categoryParentId:catId,catId:catId,
            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude*/
        };/*
        console.log(categoryId)
        console.log(catId)*/
        switch (catId) {
            case 1:
                params.serviceID=categoryId;
                viewJs.navigator.next({next:{url:'./service.html', id:'service',options:{data:params}},lastAuto:true});
                break;
            case 2:
                params.wantID=categoryId;
                viewJs.navigator.next({next:{url:'./want.html', id:'want',options:{data:params}},lastAuto:true});
                break;
            case 3:
                params.serviceID=categoryId;
                viewJs.navigator.next({next:{url:'./course.html', id:'course',options:{data:params}},lastAuto:true});
                break;
            case 4:
                params.serviceID=categoryId;
                viewJs.navigator.next({next:{url:'./service.html', id:'service',options:{data:params}},lastAuto:true});
                break;
            case 5:
                params.wantID=categoryId;
                viewJs.navigator.next({next:{url:'./question.html', id:'question',options:{data:params}},lastAuto:true});
                break;
            case 6:
                params.wantID=categoryId;
                viewJs.navigator.next({next:{url:'./question.html', id:'question',options:{data:params}},lastAuto:true});
                break;
            case 7:
                params.serviceID=categoryId;
                viewJs.navigator.next({next:{url:'./service.html', id:'service',options:{data:params}},lastAuto:true});
                break;
            case 8:
                params.serviceID=categoryId;
                viewJs.navigator.next({next:{url:'./funding.html', id:'funding',options:{data:params}},lastAuto:true});
                break;
        }

    }
};