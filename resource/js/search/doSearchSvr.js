doSearchSvrJs = {
	init:function(){
		var $p = $.mobile.activePage;
		doSearchSvrJs.onkeywordinput.apply($p.find('#keyword'));
		this.toggleEvents(true);
		this.initPage();
		//dmJs.getCategories(this.initCatList);
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
	},toggleEvents:function(isBind){
		var me = doSearchSvrJs;
		var $p = $.mobile.activePage;
		$p.undelegate();
		$p.find('#keyword').unbind('input');
		if(isBind){
			$p.one('pagebeforehide', function(){
					me.toggleEvents();
			});
			$p.find('#keyword').on('input', me.onkeywordinput);
			setTimeout(function(){
				$p.delegate('#searchFilterBtn,.around [searchKind]', 'vclick',me.searchByKeyWord);
				$p.delegate('a.catItem', 'vclick',me.searchByCat);
				$p.delegate('a.hotItem', 'vclick',me.searchByHot);
				$p.delegate('#keyword', 'keypress',me.onkeyword);
                $p.delegate('#keyword', 'change',me.onkeywordChange);
                $p.delegate('.row.statistics', 'vclick',me.toSearchByKeyword);
				$p.delegate('.search_menu', 'vclick',me.toggleCategoryMenu);
				$p.delegate('.ui-content,.footer-bar,#keyword', 'vclick',me.hideCategoryMenu);
				$p.delegate('.selCategory', 'click',me.selCategory);
			}, 500);
		}
	},initPage:function(){
		var $p = $.mobile.activePage;
		/*
		dmJs._ajax({
			method:'get',
			id:'getServiceHomePage',
			url:'/urming_quan/system/getServiceHomePage',
			callback:function(data){
				var items = [],l,i=0,item;
				l = data.categories.length;
				var itemCls = ['ui-block-a','ui-block-b','ui-block-c'];
				var count = 0;
				for(; i <l; i++){
					item = data.categories[i];
					if(item.isShow == 0){
						continue;
					}
					if(item.category.id!=1){//只显示需求
						continue;
					}
					items.push([
						'<div class="',itemCls[count%3],'">',
						'<a class="ui-link ui-btn ui-btn-a ui-shadow ui-corner-all catItem" data-categoryId="', item.id, '">', item.categoryName, '</a>',
						'</div>'
					].join(''));
					count++;
				}
				$p.find('.ui-content>.ui-grid-b.around:eq(1)').html(items.join('')).enhanceWithin();
			}
		});
		dmJs._ajax({
			method:'get',
			id:'getSearchIndexData',
			url:'/urming_quan/system/getSearchIndexData',
			callback:function(data){
				var items = [],l,i=0,item;
				l = data.hotTags.length;
				var itemCls = ['ui-block-a','ui-block-b','ui-block-c'];
				var count = 0;
				for(; i <l; i++){
					item = data.hotTags[i];
					items.push([
						'<div class="',itemCls[count%3],'">',
						'<a class="ui-link ui-btn ui-btn-a ui-shadow ui-corner-all hotItem">', item, '</a>',
						'</div>'
					].join(''));
					count++;
				}
				$p.find('.ui-content>.ui-grid-b.around:eq(2)').html(items.join('')).enhanceWithin();
			}
		});
		*/
		var catId = mainJs.parseUrlSearch().catId,
            isGroup = mainJs.parseUrlSearch().isGroup;

		if(catId){
			$p.find("#keyword").attr('placeholder','搜索'+$(".selCategory[catId="+catId+"]").html());
            if(isGroup==1){
                $p.find("#keyword").attr('placeholder','搜索'+$(".selCategory[isGroup]").html());
            }
			$p.find(".search_menu").html($(".selCategory[catId="+catId+"]").html());
			$p.find("#searchFilterBtn").attr('catid',catId);
		}
	},onkeyword:function(e){
		if(e.which == "13")
         {
			var me = doSearchSvrJs;
			var val = $.trim(this.value);
			if(val!= ''){
				me.searchByKeyWord.apply(document.getElementById('searchFilterBtn'));
			}
         }
	},onkeywordChange:function(){
        var $el = $(this);
        var val = $.trim($el.val());
        if(val == ''){
            var me = doSearchSvrJs;
            me.onkeywordinput.apply($el);
        }
    },getServiceNum:function(keyword){
        var $p = $.mobile.activePage;
        var me = doSearchSvrJs;
        $('#searchKeywordTips').remove();
        var $ct = $p.find('.ui-content');
        $ct.find('.ui-grid-b.around').hide();
		$(".title").hide();
        $('#quick_search_tip').empty();
        var _self = arguments.callee;
       clearTimeout(_self.handler);
        _self.handler = setTimeout(function(){
            if(_self.ajax){
                try{
                    _self.ajax.abort();
                }catch (ex){
                    console.log(ex);
                }
            }
            _self.ajax = me._getServiceNum(keyword,function(){
                _self.busy = false;
            });
        },300);
    },_getServiceNum:function(keyword, callback){
        var me = doSearchSvrJs;
        return dmJs._ajax({
            method:'POST',
            url:'/urming_quan/search/getServiceTagNumber',
            id:'getServiceTagNumber',
            params:{keyword:keyword},
            callback:function(list){
                var count = list.length;
                if(count > 0){
                    var html = ['<div id="searchKeywordTips">'];
                    for(var i = 0; i < count; i++){
                        html.push(me._parseList(list[i]));
                    }
                    html.push('</div>');
                    $('#quick_search_tip').html(html.join(''));
                } else {
                    $('#quick_search_tip').empty();
                }
                callback();
            },error:callback
        });
    },_parseList:function(item){
        var ret = [
               '<div class="row statistics" >',
                '<span class="statistics-name">',
                    item.name,
                '</span>',
                //'<span class="statistics-count">约',
                //  item.count,
                //'个服务</span>',
            '</div>'
        ];
        return ret.join('');
    },toSearchByKeyword:function(){
        var me = doSearchSvrJs;
        var $el = $(this);
        var keyword = $.trim($el.find('.statistics-name').text());
        $('#keyword').val(keyword)
        me.searchByKeyWord.apply(document.getElementById('searchFilterBtn'));
    },searchByKeyWord:function(){
		var $el = $(this);
		var isAround = $el.is('[searchKind]');
        var isGroup=mainJs.parseUrlSearch().isGroup;
		if(!isAround && !$el.is('.enableSearch')){
			viewJs.navigator.next({next:{url:'./', id:'startpage'}});
		} else {
			var params = {orderType:$el.attr('catid')*1<0 ? 0 : 4, area1:'中国', pageSize:20, offset:0, keyword:$('#keyword').val(),
				longitude:dmJs.params.geolocation.longitude,
				latitude:dmJs.params.geolocation.latitude
			};
			if(!isAround){
				//params.searchKind = $('#searchKind').val();
				//params.catId = "1";
				//params.categoryParentId = "1";
				var catid = $el.attr('catid');

				if(catid*1 > 0){
					params.catId = catid;
					params.categoryParentId = catid;
					switch (catid) {
						case '1':
							params.searchKind="services";
							break;
						case '2':
							params.searchKind="wants";
							break;
						case '3':
							params.searchKind="course";
							break;
						case '4':
							params.searchKind="activity";
							break;
						case '5':
							params.searchKind="question";
							break;
						case '6':
							params.searchKind="answer";
							break;
						case '7':
							params.searchKind="recruit";
							break;
					}
				}else{
					params.searchKind="users";
					params.type=catid*-1;
                    (typeof isGroup !=='undefined') && (params.isGroup = isGroup)

				}

			} else {
				params.distance = 5000;
				params.searchKind = $el.attr('searchKind');
				//hw
				if(params.searchKind=="services"){
					params.catId = "1";
					params.categoryParentId = "1";
				}else if(params.searchKind=="wants"){
					params.catId = "2";
					params.categoryParentId = "2";
				}else if(params.searchKind=="answer"){
					params.catId = "6";
					params.categoryParentId = "6";
				}else if(params.searchKind=="question"){
					params.catId = "5";
					params.categoryParentId = "5";
				}else if(params.searchKind=="activity"){
					params.catId = "4";
					params.categoryParentId = "4";
				}else if(params.searchKind=="course"){
					params.catId = "3";
					params.categoryParentId = "3";
				}else if(params.searchKind=="recruit"){
					window.location.href="http://rencai.euming.com/m/wap-jobs-list.php?key=&district=&sdistrict=";
					return;
					//params.catId = "7";
					//params.categoryParentId = "7";
				}
				//hw
			}
			viewJs.navigator.next({lastAuto:true,next:{url:'./searchResult.html', id:'services',options:{data:params}}});
		}
	},searchByCat:function(){
		var categoryId = $(this).data("categoryId");
		var categoryName = $(this).text();
		var params = {orderType:4, area1:'中国', pageSize:20, offset:0, categoryName:$.trim(categoryName),catId:1,categoryId:categoryId,
			longitude:dmJs.params.geolocation.longitude, latitude:dmJs.params.geolocation.latitude,lockCat:true
		};
		viewJs.navigator.next({lastAuto:true,next:{
			id:'services',
			url:'./searchResult.html',
			options:{
				data:params
			}
		}});
	},searchByHot:function(){
		var keyword = $(this).text();
		var params = {orderType:4, area1:'中国', pageSize:20, offset:0, keyword:keyword,catId:3,categoryParentId:3,
			longitude:dmJs.params.geolocation.longitude, latitude:dmJs.params.geolocation.latitude,searchKind:'course'
		};
		viewJs.navigator.next({lastAuto:true,next:{
			id:'services',
			url:'./searchResult.html',
			options:{
				data:params
			}
		}});
	},onkeywordinput:function(){
        var me = doSearchSvrJs;
		var $el = $(this);
		var val = $.trim($el.val()).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9']/g,'');
		var $p = $.mobile.activePage;
		var $bt = $p.find('#searchFilterBtn');
		if(val != ''){
            clearTimeout($el.data('maxLengthHandler'));
            $el.data('maxLengthHandler', setTimeout(function(){
                var val = $el.val()+'';
                val = viewJs.subStr($.trim(val).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9\s]/g,''), 40);
                $el.val(val);
                if(!$bt.is('.enableSearch')){
                    $bt.addClass('enableSearch').html('搜索');
                }
                $p.addClass('keyword-input');
                me.getServiceNum(val);
            },500));

		} else {
            $el.val('');
            $('#quick_search_tip').empty();
            $p.removeClass('keyword-input');
			if($bt.is('.enableSearch')){
				$bt.removeClass('enableSearch').html('取消');
			}
            $('#searchKeywordTips').remove();
            $p.find('.ui-grid-b.around').show();
			$(".title").show();
		}
	},initCatList:function(catList){
		// $('#keyword').focus();
		var items = [
			/*
            '<div class="ui-block-a">',
            '<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="course">课程</a>',
            '</div>',
            '<div class="ui-block-b">',
            '<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="services">服务</a>',
            '</div>',
            '<div class="ui-block-c">',
            '<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="recruit">招聘</a>',
            '</div>',
			'<div class="ui-block-a">',
			'<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="activity">活动</a>',
			'</div>',
			'<div class="ui-block-b">',
			'<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="wants">需求</a>',
			'</div>',
			'<div class="ui-block-c">',
			'<a class="ui-link ui-btn ui-shadow ui-corner-all" searchKind="users">人才</a>',
			'</div>'
			*/
        ],l,i=0,item;
		l = catList.length;
		var itemCls = ['ui-block-a','ui-block-b','ui-block-c'];
		var count = 0;
		for(; i <l; i++){
			item = catList[i];
			if(item.isShow == 0){
				continue;
			}
			if(item.category.id!=1){//只显示需求
				continue;
			}
			items.push([
				'<div class="',itemCls[count%3],'">',
				'<a class="ui-link ui-btn ui-btn-a ui-shadow ui-corner-all catItem">', item.categoryName, '</a>',
				'</div>'
			].join(''));
			count++;
		}
		var $p = $.mobile.activePage;
		$p.find('.ui-content>.ui-grid-b.around:eq(1)').html(items.join('')).enhanceWithin();
	},toggleCategoryMenu:function(){
		if($("#category_menu").is(":hidden")){
			$("#category_menu").show();
			$(".search_menu").addClass("ui-btn-active");
		}else{
			$(".search_menu").removeClass("ui-btn-active");
			$("#category_menu").hide();
		}
	},hideCategoryMenu:function(){
		$(".search_menu").removeClass("ui-btn-active");
		$("#category_menu").hide();
	},selCategory:function(){
		var me = doSearchSvrJs;
		$("#keyword").attr('placeholder','搜索'+$(this).text());
		$(".search_menu").html($(this).text());
		$("#searchFilterBtn").attr('catid',$(this).attr("catid"));
		me.hideCategoryMenu();
	}
};