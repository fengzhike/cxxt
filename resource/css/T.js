startpageJs = {
    downCloseExpiredTime:2592e6,
    init: function () {
        this.toggleEvents(true);
        this.fetchData();
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = startpageJs;
        $p.undelegate().unbind('pagebeforehide');
        if(isBind){
            $p.on('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.catSvr,[edu-item]', 'vclick', me.toCatSvrs).
                    delegate('.btn-publish-service-cls', 'vclick', me.publishSvr).
                    delegate('.userItem', 'vclick', me.toHotUser).
                    delegate('.btn-publish-want-cls', 'vclick', me.publishWant).
                    delegate('#filter-shortcut', 'vclick', me.toSearchPage).
                    delegate('#aUser', 'vclick', me.toLoginUserPage).
                    delegate('.download-con .close-btn-con', 'vclick', me.closeDownFrame).
                    delegate('.download-con [link]', 'vclick', me.locationTo)
                    .delegate('.vHeader .toCitylist', 'vclick', function(){
                        viewJs.navigator.next({next:{url:'./changeCity.html', id:'changeCity'},lastAuto:true});
                    }).
                    delegate('.custom-item-li-cls', 'vclick', me.toServiceDetail);
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
    },closeDownFrame:function(){
        localStorage.setItem('downCloseDate', new Date().getTime());
        $(this).parents('.download-con').fadeOut();
    },locationTo:function(){
        location.href = $(this).attr('link');
    },toSearchPage:function(){
        viewJs.navigator.next({next:{url:'./search.html', id:'doSearchSvr'}});
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
    },toCatSvrs:function(){
        var $el = $(this);
        var next;
        if($el.is('.catSvr-more')){
            next = {
                id: 'doSearchSvr',
                url: './search.html'
            };
        } else {
            var params = {orderType: 0, area1: '中国', pageSize: 20, offset: 0,
                longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
            };
            if($el.is('[edu-item]')){
                var searchKind;
                //var keyword= '北大创新';
                params.lockCat=true;
                var item = $el.attr('edu-item');
                switch(item){
                    case 'course':
                        searchKind = "course";
                        params.categoryName="课程";
                        params.categoryParentId="3";
                        params.catId=3;
                        break;
                    case 'teachers_students':
                        searchKind = "users";
                        //params.vkeyword = keyword;
                        delete params.lockCat;
                        break;
                    case 'want':
                        searchKind = "question";
                        delete params.lockCat;
                        //params.vkeyword = keyword;
                        params.categoryName="问题";
                        params.categoryParentId="5";
                        params.catId=5;
                        break;
                    case 'activity':
                        searchKind = "activity";
                        //keyword += ",活动";
                        params.categoryName="活动";
                        params.categoryParentId="4";
                        params.catId=4;
                        break;

                }

                //params.vtitle = $.trim($el.find('span').text());
                params.searchKind = searchKind;
            } else {
                params.categoryName = $.trim($(this).text());
                //hw
                var param = $.parseJSON($el.attr('param'));
                params.categoryId=param.categoryId;
                params.catId=param.catId;
                //hw
                params.lockCat = true;
            }
            next = {
                id: 'services',
                url: './searchResult.html',
                options: {
                    data: params
                }

            };
        }
        viewJs.navigator.next({next:next});
    },fetchData:function(){
        var me = this;
        if(!browser.versions.iosMobile){
            var lastCloseTime = localStorage.getItem('downCloseDate');
            var isExpire = lastCloseTime == null || new Date().getTime() - parseInt(lastCloseTime) > me.downCloseExpiredTime;
            if(isExpire){
                var $p = $.mobile.activePage;
                $p.find('.download-con').show();
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
        dmJs._ajax({
            id:'getHomePage',
            url:'/urming_quan/system/getHomePage',
            params:params,
            callback:this.initHomePage
        });
        //dmJs.getCategories();
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
        var $p = $.mobile.activePage;
        me.setupAdvertisement(data);
        var categories = data.categories;
        var $l = $('.catSvrs').empty();
        var sTpl = $('#catSvrs_tpl').text();
        $.each(categories, function(i, cat){
            cat.imageUrl = mainJs.getSvrPicUrl({url: cat.imageUrl,size:0});
        });
        $l.html(viewJs.applyTpl(sTpl, categories));
        var opt = {
            dataKey:'users',
            paperTpl:'',
            $content:$('#hot-users'),
            offset:0
        };
        opt.itemParser = me.formatUserItem;
        opt.tpl = $('#user_item_tpl').html();
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
                    var params = {orderType: 0, area1: '中国', pageSize: 20, offset: 0, keyword: item.data,
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
                    var params = {orderType: 0, area1: '中国', pageSize: 20, offset: 0, keyword: item.data, searchKind: 'wants',
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
                        var params = {orderType: 0, area1: '中国', pageSize: 20, offset: 0, categoryName: cat.categoryName,
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
                    var params = {orderType: 0, area1: '中国', pageSize: 20, offset: 0, keyword: item.data,
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
    },formatUserItem:function(item){
        var info = {};
        info.sex = viewJs.setSexMarkCls(item);
        info.userType= item.type == 1 ? 'person' : 'enterprise';
        info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
        info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
        var userTags = item.userTags;
        var tagHtmls = [];
        var i = 0 , l = userTags.length,tagItem;
        for(; i < l; i++){
            tagItem = userTags[i];
            tagHtmls.push([
                '<div class="tagItem">',
                '<span class="tagName">',tagItem.tagName,
                '</span><span class="prvalue font-blue">',
                tagItem.prvalue == null ? '' : Math.floor(tagItem.prvalue),
                '</span>',
                '</div>'
            ].join(''));
        }
        info.id = item.id;
        info.prvalue = Math.floor(item.prvalue);
        info.userName = item.realname;
        info.img =  mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex});
        info.tag = tagHtmls.join('');
        return info;
    }
};