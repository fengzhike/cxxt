/**
 * Created by lchysh on 15/6/11.
 */
courseTypesJs = {
    init:function(){
        var me = courseTypesJs;
        me.fetchData();
        me.toggleEvents(true);
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = courseTypesJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.u-menu-item', 'tap', me.loadMenu).
                    delegate('.u-card', 'tap', me.toSearch);
                $p.delegate('.virtualcurrScope', 'vclick', me.toVirtualcurrScope);
            }, 500);
        }
    },fetchData:function(){
        dmJs._ajax({
            id:'getCourseHotTag',
            url:'/urming_quan/system/getCourseHotTag',
            callback:this.parseData
        });
    },parseData:function(data){
        //console.log(data)
        var $p = $.mobile.activePage;
        var me = courseTypesJs;
        me.data = data;
        var menuList = [];
        var menuHtml = [];
        var item;
        data.categories.unshift({categoryName:'精品推荐',hotTags:data.hotTags,type:-1});
        for(var i = data.categories.length;--i>-1;){
            menuHtml[i] = (['<div class="u-menu-item ellipsis" data-index="',i,'">',data.categories[i].categoryName,'</div>'].join(''));
        }
        menuHtml[data.categories.length] = (['<div class="u-menu-item ellipsis virtualcurrScope">金币专区</div>'].join(''));
        $p.find('.u-menu').html(menuHtml.join(''));
        me.loadMenu(0);
    },loadMenu:function(index){
        var $p = $.mobile.activePage;
        var me = courseTypesJs;
        var $el;
        if(!$.isNumeric(index)){
            $el = $(this)
            index = Number($el.data('index'));
        } else {
            $el = $p.find('.u-menu-item[data-index='+index+']');
        }
        $el.addClass('sel').siblings('.sel').removeClass('sel');
        if($el.hasClass('virtualcurrScope')){
            return;
        }
        var hotTags = me.data.categories[index].hotTags;
        var htmls = [];
        var item;
        for(var i = hotTags.length;--i>-1;){
            item = hotTags[i];
            //console.log(item.picurl)
            htmls[i] = [
                '<div class="u-card" data-cat="',index,'" data-tag="',i,'">',
                  '<img src="',mainJs.getSvrPicUrl({url:item.picurl}),'">',
                '<div class="u-card-title">',
                  item.title,
                '</div>',
                '</div>'
            ].join('');
        }
        $p.find('.u-menu-content').html(htmls.join(''));

    },toSearch:function(){
        var $el = $(this);
        var me = courseTypesJs;
        var cat = me.data.categories[$el.data('cat')];
        var tag = cat.hotTags[$el.data('tag')];

        var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
            "searchKind":"course","catId":"3",
            "categoryParentId":"3",
            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
        };
        if(cat.type==-1){
            $.extend(params,{"hotTag":"0",keyword:tag.content});
        } else {
            $.extend(params,{"hotTag":cat.id,categoryId:cat.id,keyword:tag.content,categoryName:cat.categoryName});
        }
        viewJs.navigator.next({next: {
            id: 'services',
            url: './searchResult.html',
            options: {
                data: params
            }
        }, lastAuto: true});
    },toVirtualcurrScope:function(){
        var $el = $(this);
        var me = courseTypesJs;

        var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
            "searchKind":"course","catId":"3",
            "categoryParentId":"3","virtualcurr":"true",
            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
        };
        viewJs.navigator.next({next: {
            id: 'services',
            url: './searchResult.html',
            options: {
                data: params
            }
        }, lastAuto: true});
    }
};