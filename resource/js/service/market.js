marketJs = {
    downCloseExpiredTime:2592e6,
    init: function () {
        this.toggleEvents(true);
        this.fetchData();
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = marketJs;
        $p.undelegate().unbind('pagebeforehide');
        if(isBind){
            $p.on('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.catSvr,.ui-grid-d>div,.ui-grid-c>div', 'vclick', me.toCatSvrs).
                    delegate('.userItem', 'vclick', me.toHotUser).
                    delegate('.v-tab', 'vclick', me.fetchData).
                    delegate('.v-input-search', 'vclick', me.toSearchPage).
                    delegate('#aUser', 'vclick', me.toLoginUserPage).
                    delegate('.download-con [link]', 'vclick', me.locationTo).
                    delegate('.svr', 'vclick', me.toItemDetail);
            },500);
        }
    },toHotUser:function(){
        var $m = $(this);
        var params = {userId:$m.attr('data-userId')};
        viewJs.navigator.next({
            next:{url:'./u.html', id:'u', options:{data:params}},
            lastAuto:true
        });
    },toLoginUserPage:function(){
        var next = {url:'./mine.html', id:'mine'};
        if(!dmJs.hasLogin()){
            dmJs.sStore.toLogin(next);
            return;
        }
        viewJs.navigator.next({next:next});
    },locationTo:function(){
        location.href = $(this).attr('link');
    },toSearchPage:function(){
        viewJs.navigator.next({lastAuto:true,next:{url:'./search.html', id:'doSearchSvr',options: {data: {"catId":$(".v-tab.sel").data("i")*1+1}}}});
    },toCatSvrs:function(){
        var $el = $(this);
        var next;
        if($el.is('.catSvr-more')){
            next = {
                id: 'doSearchSvr',
                url: './search.html',
                options: {
                    data: {"catId":$(".v-tab.sel").data("i")*1+1}
                }
            };
        } else {
            var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
                longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
            };
            params.categoryName = $.trim($(this).text());
            //hw
            var param = $.parseJSON($el.attr('param'));
            params.categoryId=param.categoryId;
            params.catId=param.catId;
			if(params.catId==2){
				params.searchKind='wants';
			}else if(params.catId==8){
                params.categoryName ="融资";
                params.searchKind='crowdfunding';
                params.categoryParentId=8;
                params.orderType=0;
                if(dmJs.sStore.getUserInfo() == null){
                    dmJs.sStore.toLogin({id: 'services',url:'./searchResult.html', options:{data:params}});
                    return;
                }

            }
            //hw
            params.lockCat = true;
            next = {
                id: 'services',
                url: './searchResult.html',
                options: {
                    data: params
                }

            };
        }
        viewJs.navigator.next({next:next,lastAuto:true});
    },fetchData:function(index){
        var me = marketJs;
        var url;
        if(index !=null){
            index = $(this).data('i');
        }
        if(!$.isNumeric(index)){
            index = 0;
        }
        if(index!=1){
            url = 'getServiceHomePage';
        } else {
            url = 'getWantHomePage';
        }
        dmJs._ajax({
            id:url,
            url:'/urming_quan/system/'+url,
            callback:me.initHomePage
        });
        //dmJs.getCategories();
    },toItemDetail:function(){
        var $m = $(this);
        var isWant = $m.is('.hot-want');
      var next;
        var id = $m.data('id');
        if(!isWant){

            var params = {serviceID:id};
            next= {url:'./service.html', id:'service',
                options:{
                data:params
            }};
        } else {
            var params = {wantID:id};
            next= {url:'./want.html', id:'want',
                options:{
                    data:params
                }};
        }
        viewJs.navigator.next({next:next,lastAuto:true});
    },initHomePage: function (data) {
        var me = marketJs;
        var $p = $.mobile.activePage;

        var isWant = data.wants !=null;
        //console.log(data)
       // console.log(isWant)
        //me.setupAdvertisement(data);
        var categories = data.categories;
        var $p = $.mobile.activePage;
        var $l = $p.find('.catSvrs').empty();
        var sTpl = isWant?$('#catWant_tpl').text():$('#catSvrs_tpl').text();
        $.each(categories, function(i, cat){
            cat.imageUrl = mainJs.getSvrPicUrl({url: cat.imageUrl,size:0});
        });
        $l.html(viewJs.applyTpl(sTpl, categories));
        var opt = {
            dataKey:'services',
            paperTpl:'',
            $content:$('#market-hots'),
            offset:0
        };
        $p.find('.v-tab[data-i="'+Number(isWant)+'"]').addClass('sel').siblings('.sel').removeClass('sel');



        var tabTitle = "热门服务";

        opt.itemParser = me.formatSvrItem;
        var tpl = "#market_svr_item_tpl";
        if(isWant){
            opt.dataKey = "wants";
            opt.itemParser = me.formatWantItem;
            tpl = "#market_want_item_tpl";
            tabTitle = "最新需求";
			$(".catSvr-more").html("更多需求");
        }
        $('#market_tab_title').html(tabTitle);
        opt.tpl = $(tpl).html();
        $('#hot-users').empty();
        viewJs.parseList(data, opt);
    }, setupAdvertisement: function (data) {
        var ads = data.advertisement;
        var i = 0, l = ads.length, item;
        var images = [];
        for (; i < l; i++) {
            item = ads[i];
            images[i] = mainJs.getSvrPicUrl({url: item.picUrl, size: 0});
        }
        var $ctr = $('.bannerAdPics');
        var $cmp = viewJs.createSlideImgs(images, $ctr, 'bannerAdPics', {width: 480, height: 180});
        $ctr.height($cmp.height());
        $cmp.delegate('.slide.item', 'sliderClick', function (e) {
            var index = Number($(this).attr('iindex'));
            var item = ads[index];

            switch (item.type) {
                case 1:
                    var url = item.data.split(',')[0].replace('qixi_festival.html','qixi_festival2.html');
                    location.href = url;
                    break;
                case 2:
                    viewJs.navigator.next({next: {
                        url: './service.html',
                        id: 'service',
                        options: {data: {serviceID: item.data}}
                    }, lastAuto: true});
                    break;
                case 3:
                    viewJs.navigator.next({next: {
                        url: './want.html',
                        id: 'want',
                        options: {data: {wantID: item.data}}
                    }, lastAuto: true});
                    break;
                case 4:
                    var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0, keyword: item.data,
                        longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude,categoryParentId:1
                    };
                    viewJs.navigator.next({next: {
                        id: 'services',
                        url: './searchResult.html',
                        options: {
                            data: params
                        }
                    }});
                    break;
                case 5:
                    var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0, keyword: item.data, searchKind: 'wants',
                        longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude,categoryParentId:2
                    };
                    viewJs.navigator.next({next: {
                        id: 'services',
                        url: './searchResult.html',
                        options: {
                            data: params
                        }
                    }});
                    break;
                case 6:
                    dmJs.findCatById(item.data, function (cat) {
                        var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0, categoryName: cat.categoryName,
                            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude, lockCat: true,categoryParentId:1
                        };
                        viewJs.navigator.next({next: {
                            id: 'services',
                            url: './searchResult.html',
                            options: {
                                data: params
                            }
                        }});
                    });
                    break;
                case 7:
                    viewJs.navigator.next({next: {
                        url: './course.html',
                        id: 'course',
                        options: {data: {serviceID: item.data}}
                    }, lastAuto: true});
                    break;
                case 8:
                    var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0, keyword: item.data,
                        longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude,categoryParentId:3
                    };
                    viewJs.navigator.next({next: {
                        id: 'services',
                        url: './searchResult.html',
                        options: {
                            data: params
                        }
                    }});
                    break;
                default:
                    return;
            }
            clearTimeout($cmp.slider.toggleImgHandler);
            $cmp.remove();
            console.log(arguments);
        });
    },formatSvrItem:function(item){
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
        info.img =  mainJs.getSvrPicUrl({url:item.picUrl,size:2});
        return info;
    },formatWantItem:function(item){
        var info = {};
        info.id = item.id;
        info.wantName = item.wantName;
        info.price = item.price;
        info.username = item.username;
        return info;
    }
};