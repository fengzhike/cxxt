var searchResultJs = {
	init:function(){
		try{
			this.initParams = null;
			this.initData();
			this.toggleEvents(true);
		} catch(ex){
			console.error(ex);
		}
        var $p = $.mobile.activePage;
        viewJs.setRem($p)
	},resetData:function(bInit){
        var me = searchResultJs;
        if (bInit) {
            var d = {};
            me._data = d;
        } else {
            me._data = null;
        }
    },toggleEvents:function(isBind){

		var $p = $.mobile.activePage;
		var me = searchResultJs;
		$p.undelegate();
		if(isBind) {
			$p.one('pagebeforehide', function(){	
					me.toggleEvents();
                    me.resetData();
					$p.find('.list-items').empty();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#catList>div', 'vclick', me.searchByCat);
				$p.delegate('#sortList>div', 'vclick', me.searchByOrder);
				$p.delegate('#servicesSortBtn', 'vclick', me.showSortMenu);
			    $p.delegate('#servicesCatBtn', 'vclick', me.showCatMenu);
				$p.delegate('#servicesAreaBtn', 'vclick', me.showAreaMenu);
				$p.delegate('#areaList>div', 'vclick', me.onAreaMenuItemClick);
				$p.delegate('#childAreaList>div', 'vclick', me.searchByArea);
				$p.delegate('.custom-item-li-cls,.custom-crowdfunding-item-li-cls','vclick',me.onclickServiceItem);
				$p.delegate('.rItem[tab]:not(.sel)','vclick',me.onchangeTab);
                $p.delegate('#result_not_found_publish','vclick',me.toPublishWant);
				$p.delegate( ".btn-page", 'vclick',me.loadPage);
				$p.delegate( ".search-icon", 'vclick',me.toSearch);
				$p.delegate( ".ui-title.select:not(.up)", 'vclick',me.selectQuestion);
				$p.delegate( ".answer", 'vclick',me.toAnswer);
				$p.delegate( ".ask_footer", 'vclick',me.toPublishQuestion);

                /*$p.delegate('.lang_turn','vclick',function(){
                    var lang = sessionStorage.getItem('lang');
                    if(lang == 'en'){
                        sessionStorage.setItem('lang','cn');
                    }else{
                        sessionStorage.setItem('lang','en')
                    }
                    setTimeout(function(){
                        window.location.href = location
                    },100)
                });*/
			},500);
		}
	},
	toPublishQuestion:function(){
	    var next = {
	            id: 'addQuestion',
	            url: './addQuestion.html',
	            options: {
	                data: {
	                	catId:'5',
	                	catName:'问题'
	                }
	            }
	        };
	    //console.log(next)
	    viewJs.navigator.next({next:next});
	},
	toAnswer:function(e){
		e.stopPropagation();
        e.preventDefault();
        //addAnswer.html?wantID=20325&catId=6
        var params = {
        	wantID:$(this).parents('[data-wantid]').attr('data-wantid') ,
        	catId:6
        }
        console.log($(this).html().trim())
        if($(this).html().trim() === '回答'){
        	var next = {
	            id: 'addAnswer',
	            url: './addAnswer.html',
	            options: {
	                data: params
	            }
	        };
	          viewJs.navigator.next({next:next});
        }else{
        	$(this).parents('li').click()
        }
	    /*
	    //console.log(next)
	  */
	},
    selectQuestion:function(e){
    	e.stopPropagation();
        e.preventDefault();

        var $p = $.mobile.activePage;
        $p.find('.ui-title.select').addClass('up');
        var searchData = mainJs.parseUrlSearch();
         var action0 = 'onlyGroup',
         	action1 = 'mineQuestion',
         	actiontxt0 = '只看同学',
         	actiontxt1 = '我参与的';
        if(searchData.onlyGroup){
        	action0 = 'allQuestion';
        	actiontxt0 = '全部问答'
        }
        if(searchData.status === '3'){
        	action1 = 'allQuestion';
        	actiontxt1 = '全部问答';
        }
        var action0 = searchData.onlyGroup ? 'all' : 'onlyGroup';
        var slectReact = '<div class = "select-mask">' +
                '<div class="select-box">' +
                    '<ul>' +
                        '<li action = '+ action0 +'>'+ actiontxt0 +'</li>' +
                        '<li action = '+ action1 +'>'+ actiontxt1 +'</li>' +
                    '</ul>'+
                '</div>' +
            '</div>';
        $p.find('.ui-content').append(slectReact);
        $('.select-box li').on('vclick',function(e){
            $('.ui-title.select').removeClass('up');
            var e = e|| window.event,
                target = e.target;
            var temp = {
                action:$(target).attr('action'),
                text : $(target).html()
            }
            $(target).html($p.find('.ui-title.select').html())
                .attr('action',$p.find('.ui-title.select')
                .attr('action'))
                .html(temp.text)
                .attr('action',temp.action);

        	var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
	            longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
	        };

                
	        $.extend(params, {'searchKind':"question","categoryName":"问题","categoryParentId":"5","catId":"5"});

            switch(temp.action){
            	case 'onlyGroup':
            		$.extend(params, {'onlyGroup':"1"});
            		break;
            	case 'mineQuestion':
            		$.extend(params, {'status':"3"});
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
        })
    },toSearch:function(){
        var searchParams = mainJs.parseUrlSearch();
        //var last = {url:'searchResult.html', id:'services', options:{data:searchParams}};
        viewJs.navigator.next(
            {next:{url:'./search.html', id:'search', options:{data:{'catId':'5'}}}}
        );
    },onchangeTab:function(){
		var me = searchResultJs;
		var $el = $(this);
		var tab = $el.attr('tab');
		$el.addClass('sel').siblings().removeClass('sel').attr('tab');
		var params = me.getInitParams();
		$('.searchPageListCtr').remove();
		params.searchKind = tab;
		params.orderType = 4;
		$('.list-items').empty();
		$('#servicesAreaBtn').html('全部');
		$('#servicesCatBtn').html('全部分类');
		$('#servicesSortBtn').html('综合排序');

		//me.initData();
		//hw
		switch(params.searchKind){
			case 'services':
				params.categoryParentId = 1;
				break;
			case 'wants':
				params.categoryParentId = 2;
				break;
			case 'answer':
				params.categoryParentId = 6;
				break;
			case 'question':
				params.categoryParentId = 5;
				break;
			case 'course':
				params.categoryParentId = 3;
				break;
			case 'activity':
				params.categoryParentId = 4;
				break;
			case 'crowdfunding':
				params.categoryParentId = 8;
				break;
			case 'users':
				params.orderType = 0;
				break;
		}
		viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});
		//hw
	},showSortMenu:function(){
		var $m = $('#sortList'), htmls;
		var me = searchResultJs;
		if($m.is(':hidden')){
			$m.show();
			searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
			me.closeOtherSearchList($m);
			$('#btn-active-pos-arrow').attr('col', '3');
		} else {
			$(this).removeClass('ui-btn-active');
			$('#btn-active-pos-arrow').attr('col', null);
			$m.hide();
		}
	},showCatMenu:function(){
		var me = searchResultJs;
		var $m = $('#catList'), htmls;
		if($m.is(':hidden')){
			$m.show();
			me.closeOtherSearchList($m);
			$('#btn-active-pos-arrow').attr('col', '2');
		} else {
			$(this).removeClass('ui-btn-active');
			$('#btn-active-pos-arrow').attr('col', null);
			$m.hide();
		}

	},showAreaMenu:function(){
		var me = searchResultJs;
		me.showAreaList(dmJs.params.geolocation.id, dmJs.params.geolocation.city);
	},onAreaMenuItemClick:function(){
		var $a = $(this);
		if($a.is('[distance]')){
				var params = searchResultJs.getInitParams();
				params.offset = 0;
				// dmJs.data.hasNext = true;
				params.distance = $a.attr('distance');
				viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});	
		}else if($a.is('[questionstatus]')){
			var params = searchResultJs.getInitParams();
			params.offset = 0;
			// dmJs.data.hasNext = true;
			params.questionstatus = $a.attr('questionstatus');
			viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});
		}else if($a.is('[crowdfundingstatus]')){
			var params = searchResultJs.getInitParams();
			params.offset = 0;
			// dmJs.data.hasNext = true;
			params.crowdfundingStatus = $a.attr('crowdfundingstatus');
			viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});
		} else{
			var me = searchResultJs;
			$('#areaList .kindSel').removeClass('kindSel');
			$a.addClass('kindSel');
			me.showChildAreaList($a.attr('data-areaId'), $a.text());
		}
	},searchByArea:function(){
        var $m = $(this), $p = $('#areaList>div.kindSel'),cid = $m.attr('data-areaId'),pid = $p.attr('data-areaId');
		var params = searchResultJs.getInitParams();
		params.offset = 0;
		// dmJs.data.hasNext = true;
		$('#services').remove();
		if(params.categoryName  == '全部分类'){
			delete params.categoryName;
		}
		delete params.area1;
		delete params.area2;
		delete params.area3;
		if(cid < 0 && cid != -300){
			if(cid == -100){
				params.area1 = '中国';
			} else {
				params.area1 = dmJs.params.geolocation.city;
			}
		} else if(cid == -300){
			params.area1 = dmJs.params.geolocation.city;
			params.area2 = $p.text();
		} else {
			params.area1 = dmJs.params.geolocation.city;
			params.area2 = $p.text();
			params.area3 = $m.text();
		}
		$('#areaListCtr').hide();
		viewJs.navigator.next({
			next:{url:'./searchResult.html', id:'services',
				options:{
					data:params
				}},
			lastAuto:false
		});
	},searchByCat:function(){
		var $m = $(this), htmls;
		var params = searchResultJs.getInitParams();
        params.onlyGroup =0;
		params.offset = 0;
		// dmJs.data.hasNext = true;
		$('#services').remove();
		if(typeof(params.hotTag) != 'undefined'){
			var param = $.parseJSON($m.attr('param'));
			params.keyword = param.keyword;
			params.hotTag = param.hotTag;
		}else if(params.searchKind != 'users'){
			params.categoryName = $m.text();
			if(params.categoryName  == '全部分类'){
				params.categoryName = null;
				params.categoryId = null;
                params.onlyGroup =0;
				var $p = $.mobile.activePage;
				if($p.find('.ui-header:first .vrGrp').length > 0){
					switch(params.searchKind){
						case 'services':
							params.categoryParentId = 1;
							break;
						case 'wants':
							params.categoryParentId = 2;
							break;
						case 'answer':
							params.categoryParentId = 6;
							break;
						case 'question':
							params.categoryParentId = 5;
							break;
						case 'course':
							params.categoryParentId = 3;
							break;
						case 'activity':
							params.categoryParentId = 4;
							break;
						case 'crowdfunding':
							params.categoryParentId = 8;
							break;
					}
				}else{
					params.categoryParentId = params.catId;
				}
			}else if(params.categoryName  == '只看同学'){
                params.categoryName = null;
                params.categoryId = null;
                params.onlyGroup =1;

                var $p = $.mobile.activePage;
                if($p.find('.ui-header:first .vrGrp').length > 0){
                    switch(params.searchKind){
                        case 'services':
                            params.categoryParentId = 1;
                            break;
                        case 'wants':
                            params.categoryParentId = 2;
                            break;
                        case 'answer':
                            params.categoryParentId = 6;
                            break;
                        case 'question':
                            params.categoryParentId = 5;
                            break;
                        case 'course':
                            params.categoryParentId = 3;
                            break;
                        case 'activity':
                            params.categoryParentId = 4;
							break;
						case 'crowdfunding':
							params.categoryParentId = 8;
                            break;
                    }
                }else{
                    params.categoryParentId = params.catId;
                }
            }else{
				//hw
				var param = $.parseJSON($m.attr('param'));
				params.categoryId = param.categoryId;
				params.categoryParentId = null;
				//hw
			}
		}else{
			params.type = $.parseJSON($m.attr('param')).type;
            params.isGroup = $.parseJSON($m.attr('param')).isGroup;

		}
        //fsk
        if(params.catId==4&&!params.categoryName){
            params.categoryName = '哈哈';
        }
		
		//hw
		//params.catId=param.catId;
		/*
		if(params.categoryName=="问题"){
			params.searchKind='wants';
		}else if(params.categoryName=="答案"){
			params.searchKind='services';
		}
		*/
		//hw
		viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});
	},searchByOrder:function(){
		var $m = $(this), htmls;
		var params = searchResultJs.getInitParams();
		params.offset = 0;
		// dmJs.data.hasNext = true;
		params.orderType = $m.attr('data-orderType');
		viewJs.navigator.next({next:{url:'./searchResult.html', id:'services', options:{data:params}}});
	},onclickServiceItem:function(){
		
		var $m = $(this);
        var $p = $.mobile.activePage;
        var last = {url:'searchResult.html', id:'services', options:{data:searchResultJs.getInitParams()}};
        var page = Number($.trim($p.find('.pager-current').text()).split('/')[0]);
        if($.isNumeric(page)){
            last.options.data.p = page;
            last.options.data.offset = (page - 1)*mainJs.PAGE_SIZE;
        }
		if($m.is('.userItem')){
			var params = {userId:$m.attr('data-userId')};
			viewJs.navigator.next({
				next:{url:'./u.html', id:'u', options:{data:params}},
                last:last
			});
		} else if($m.is('.wantItem') || $m.is('.questionItem')){
			var params = {wantID:$m.attr('data-wantId')};
			if(mainJs.parseUrlSearch().catId == 5){
				viewJs.navigator.next({
					next:{url:'./question.html', id:'question', options:{data:params}},
					last:last
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./want.html', id:'want', options:{data:params}},
					last:last
				});
			}
		} else {
			var params = {serviceID:$m.attr('data-svrId')};
			if(last.options.data.catId==3){
				viewJs.navigator.next({
					next:{url:'./course.html', id:'course', options:{data:params}},
					last:last
				});
			}else if(last.options.data.catId==8){
				viewJs.navigator.next({
					next:{url:'./funding.html', id:'funding', options:{data:params}},
					last:last
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./service.html', id:'service', options:{data:params}},
					last:last
				});
			}
		}

	},getInitParams:function(){
		// var $p = $.mobile.activePage;
		var me = searchResultJs;
		var param = me.initParams || mainJs.parseUrlSearch();
		return param;
	},setTitle:function(title){
		var $p = $.mobile.activePage;
		if(!$p.is('[tab]')){
			$p.find('.ui-header:first>h1').text(title);
		}
		document.title = title;
	},initData:function(){
		if(mainJs.parseUrlSearch().toast != undefined && mainJs.parseUrlSearch().toast != ''){
			viewJs.showPopMsg(mainJs.parseUrlSearch().toast);
		}
		var me = searchResultJs;
        me.resetData(true);
		var $p = $.mobile.activePage;
		var params =  me.initParams = me.getInitParams();
        params.searchKind = $.trim(params.searchKind);
		me.searchOffset = {};
        if(params.onlyGroup === '1'){
            $('#servicesCatBtn').html("只看同学");
        }
        if(params.vkeyword){//列表上方，当前搜索XXX
            $p.find('.searchTips').show();
        } else {
            $p.find('.searchTips').hide();
        }
        $('#result_not_found_container').hide();
        $p.removeClass('not-found');
        if(params.searchKind != '' && params.searchKind != 'services'){
            $p.addClass('not-services');
        } else {
            $p.removeClass('not-services');
        }
        if(params.searchKind == '' && !params.lockCat){
            $p.addClass('all-kind');
        } else {
            $p.removeClass('all-kind');
        }
		if(!$.isEmptyObject(params)){
			var keyword = $.trim(params.keyword);
            var vTitle = $.trim(params.vtitle);
			if(keyword != '' && typeof(params.hotTag)=='undefined'){
                var title;
                if(vTitle == ''){
                    //$p.attr('tab', '');//注释tab切换
                    title = keyword;
                    $p.find('.searchTips').html('当前搜索：'+keyword).show();
                } else {
                    title = vTitle;
                }
				params.searchKind = $.trim(params.searchKind);
				if(params.searchKind != ''){
					$p.find('.vrGrp [tab="'+params.searchKind+'"]').addClass('sel').siblings('.sel').removeClass('sel');
				}
				me.setTitle(title);
			}
            if(params.searchKind === "question"){//fsk  20160816 隐藏分类搜索
                $('.sort-bar').hide();
                var searchHtml = '<input type="image" class="search-icon v-input-search" src="./resource/images/icon-search-blue-old.png" alt="搜索">';
                $p.find('.ui-header').append(searchHtml);
                var triangle = $('span');
                $p.find('.ui-title').addClass('select').attr('action','allQuestion');
                $p.find('.ui-content').append($('<div>').addClass('ask_footer ui-footer ui-footer-fixed').html('提问'))
            }
			if(params.area3 != null && params.area3 != ''){
				$('#servicesAreaBtn').html(params.area3);
			} else if(params.area2 != null && params.area2 != ''){
				$('#servicesAreaBtn').html('全'+params.area2);
			} else if(params.area1 == dmJs.params.geolocation.city){
				$('#servicesAreaBtn').html('全'+params.area1);
			} else {
				$('#servicesAreaBtn').html('全部');
			}

			me.loadServiceList(params);
			me.initSortList(params);
			if(typeof(params.hotTag) != 'undefined'){
				me.initHotTagCatList();
			}else if(params.searchKind == 'users'){
				me.initUsersCatList();
			}else{
				dmJs.getCategories(me.initCatList);
			}
			var title;
			if(params.lockCat){
				$p.attr('allDistance', '');
                //console.log(params.catId)
                switch(params.catId){
                    case '1':
                        title = "服务";
                        break;
                    case '2':
                        title = "需求";
                        break;
                    case '3':
                        title = "课程";
                        break;
                    case '4':
                        title = "活动";
                        break;
                    case '5':
                        title = "问题";
                        break;
                    case '6':
                        title = "答案";
                        break;
                    case '7':
                        title = "工作";
                        break;
                    case '8':
                        title = "融资";
                        break;
                }
				//title = params.categoryName;
			} else {
				if(params.distance != null){
					$p.attr('allDistance', null);
					switch(params.searchKind){
						case 'users':
							title = "周围的人才";
							break;
						case 'wants':
							title = "周围的需求";
							break;
						case 'answer':
							title = "周围的答案";
							break;
						case 'question':
							title = "周围的问题";
							break;
						case 'activity':
							title = "周围的活动";
							break;
						case 'course':
							title = "周围的课程";
							break;
						case 'recruit':
							title = "周围的招聘";
							break;
						case 'crowdfunding':
							title = "周围的融资";
							break;
						default:
							title = "周围的服务";
							break;
					}
					var dis;
					if(params.distance < 1000){
						dis = params.distance+'米内';
					} else{
						dis = Math.floor(params.distance/1000)+'千米';
					}
					$('#servicesAreaBtn').html(dis);
				} else {
					title = "搜索结果";
					switch(params.searchKind){
						case 'users':
							title = "人才";
							if(typeof(params.type)!='undefined' && params.type == 1){
								title = "个人";
							}else if(typeof(params.type)!='undefined' && params.type == 3){
								title = "师资";
							}else if(typeof(params.type)!='undefined' && params.type == 2){
                                if(params.isGroup == 1){
                                    title = "项目号";
                                }else{
                                    title = "公众号";
                                }
							}
							break;
						case 'wants':
							title = "需求";
							break;
						case 'question':
							title = "全部问答";
                            if(params.onlyGroup ==='1'){
                                title = '只看同学';
                            }
							break;
						case 'answer':
							title = "答案";
							break;
						case 'activity':
							title = "活动";
							break;
						case 'course':
							if(params.virtualcurr=='true'){
								title = "金币专区";
							}else{
								title = "课程";
							}
							break;
						case 'recruit':
							title = "招聘";
							break;
						case 'crowdfunding':
							title = "融资";
							break;
						default:
							title = "服务";
							break;
					}
					$p.attr('allDistance', '');
				}
			}
			if(params.catId==5){
				switch(params.questionstatus){
					case '1':
						$('#servicesAreaBtn').html("新问题");
						break;
					case '2':
						$('#servicesAreaBtn').html("未参与");
						break;
					case '3':
						$('#servicesAreaBtn').html("已参与");
						break;
					default:
						$('#servicesAreaBtn').html("全部");
						break;
				}
			}
			if(params.catId==8){
				switch(params.crowdfundingStatus){
					case '1':
						$('#servicesAreaBtn').html("融资中");
						break;
					case '2':
						$('#servicesAreaBtn').html("融资完成");
						break;
					default:
						$('#servicesAreaBtn').html("全部");
						break;
				}
			}
            //fsk 大赛
            if(keyword === '2016大赛'){
                $p.find('.sort-bar.ui-navbar').hide()
                $p.find('.searchTips').hide();

                $p.find('.navigateBackBtn ').hide()
                var lang = sessionStorage.getItem('lang');
                var pubData =null;
                if(lang == 'en'){
                    pubData = pubEnJs
                }else{
                    pubData = pubCnJs
                }
                title = pubData.searchTitle;
            }
            if(params.status === '3' ){//fsk 16/8/23我参与的
	        	title = "我参与的";
	        }
			me.resetLayoutByKind(params.searchKind);
			me.setTitle(title);
		}

	},resetLayoutByKind:function(kind){
		/*if(kind == "users"){
			$('.sort-bar').find('ul').
			attr('class', 'ui-grid-a').find('#servicesCatBtn').parent().hide().end().end().find('#servicesSortBtn').parent().attr('class', 'ui-block-b');
		} else {*/
			$('.sort-bar').find('ul').
			attr('class', 'ui-grid-b').find('#servicesCatBtn').parent().show().end().end().find('#servicesSortBtn').parent().attr('class', 'ui-block-c');
		//}

	},initCatList:function(catList){
        //console.log(catList)
        //alert(12)
		var items = [],l,i=0,item;
		var params = searchResultJs.getInitParams();
		l = catList.length;
		if(params.categoryName == null || params.categoryName == ''){
					items.push([
				'<div  class="kindSel">全部分类</div>'
			].join(''));
		} else {
			items.push([
				'<div data-icon="false">全部分类</div>'
			].join(''));
		}

		for(; i <l; i++){
			item = catList[i];
			if(item.isShow == 0){
				continue;
			}
			//hw
			var $p = $.mobile.activePage;
			if($p.find('.ui-header:first .vrGrp').length > 0){
				switch(params.searchKind){
					case 'services':
						if(1!=item.category.id){
							continue;
						}
						break;
					case 'wants':
						if(2!=item.category.id){
							continue;
						}
						break;
					case 'answer':
						if(6!=item.category.id){
							continue;
						}
						break;
					case 'question':
						if(5!=item.category.id){
							continue;
						}
						break;
					case 'course':
						if(3!=item.category.id){
							continue;
						}
						break;
					case 'activity':
						if(4!=item.category.id){
							continue;
						}
						break;
					case 'crowdfunding':
						if(8!=item.category.id){
							continue;
						}
						break;
					default:
						if(params.catId!=item.category.id){
							continue;
						}
				}
			}else{
				if(params.catId!=item.category.id){
					continue;
				}
			}
			//hw
			if(params.categoryName == item.categoryName){
				items.push([
				'<div  class="kindSel" param=\'{"catId":"'+ item.category.id +'","categoryId":"'+ item.id +'"}\'>', item.categoryName, '</div>'
				].join(''));
				$('#servicesCatBtn').html(item.categoryName);
			} else {
				items.push([
				'<div data-icon="false" param=\'{"catId":"'+ item.category.id +'","categoryId":"'+ item.id +'"}\'>', item.categoryName, '</div>'
				].join(''));
			}
		}
		var html = ['<div id="catList" class="servicesCatBtnCls searchPageListCtr searchPageList hidecls">',
			items.join(''),
		'</div>'];
		$('#catList').remove();
		$(html.join('')).insertBefore($('#services .searchTips')).enhanceWithin();
       // console.log($('#catList div:first-child'))
       //console.log(mainJs.parseUrlSearch().catId)
        var strClassMate = '<div  data-icon="false">只看同学</div>';
		if(params.searchKind!="crowdfunding"){
			$('#catList div:first-child').after($(strClassMate));
		}
		searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
	},initUsersCatList:function(){
		var items = [],l,i=0,item;
		var params = searchResultJs.getInitParams();
		if(typeof(params.type)=='undefined' || params.type == 0){
					items.push([
				'<div  class="kindSel" param=\'{"type":"0"}\'>全部分类</div>'
			].join(''));
		} else {
			items.push([
				'<div data-icon="false" param=\'{"type":"0"}\'>全部分类</div>'
			].join(''));
		}
		
		if(typeof(params.type)=='undefined' || params.type == 0){
			items.push([
			'<div  class="false" param=\'{"type":"1"}\'>个人</div>'
			].join(''));
			items.push([
				'<div  class="false" param=\'{"type":"3"}\'>师资</div>'
			].join(''));
			items.push([
			'<div  class="false" param=\'{"type":"2","isGroup":"0"}\'>公众号</div>'
			].join(''));
            items.push([
                '<div  class="false" param=\'{"type":"2","isGroup":"1"}\'>项目号</div>'
            ].join(''));
			$('#servicesCatBtn').html("全部分类");
		} else if(params.type == 1){
			items.push([
			'<div  class="kindSel" param=\'{"type":"1"}\'>个人</div>'
			].join(''));
			items.push([
				'<div  class="false" param=\'{"type":"3"}\'>师资</div>'
			].join(''));
			items.push([
			'<div  class="false" param=\'{"type":"2","isGroup":"0"}\'>公众号</div>'
			].join(''));
            items.push([
                '<div  class="false" param=\'{"type":"2","isGroup":"1"}\'>项目号</div>'
            ].join(''));
			$('#servicesCatBtn').html("个人");
		}  else if(params.type == 3){
			items.push([
				'<div  class="false" param=\'{"type":"1"}\'>个人</div>'
			].join(''));
			items.push([
				'<div  class="kindSel" param=\'{"type":"3"}\'>师资</div>'
			].join(''));
			items.push([
				'<div  class="false" param=\'{"type":"2","isGroup":"0"}\'>公众号</div>'
			].join(''));
            items.push([
                '<div  class="false" param=\'{"type":"2","isGroup":"1"}\'>项目号</div>'
            ].join(''));
			$('#servicesCatBtn').html("师资");
		} else if(params.type == 2){
			items.push([
			'<div  class="false" param=\'{"type":"1"}\'>个人</div>'
			].join(''));
			items.push([
				'<div  class="false" param=\'{"type":"3"}\'>师资</div>'
			].join(''));
            if(params.isGroup == 1){
                items.push([
                    '<div  class="false" param=\'{"type":"2","isGroup":"0"}\'>公众号</div>'
                ].join(''));
                items.push([
                    '<div  class="kindSel" param=\'{"type":"2","isGroup":"1"}\'>项目号</div>'
                ].join(''));
                $('#servicesCatBtn').html("项目号");
            }else{
                items.push([
                    '<div  class="kindSel" param=\'{"type":"2","isGroup":"0"}\'>公众号</div>'
                ].join(''));
                items.push([
                    '<div  class="false" param=\'{"type":"2","isGroup":"1"}\'>项目号</div>'
                ].join(''));
                $('#servicesCatBtn').html("公众号");
            }

		}
		var html = ['<div id="catList" class="servicesCatBtnCls searchPageListCtr searchPageList hidecls">',
			items.join(''),
		'</div>'];
		$('#catList').remove();
		$(html.join('')).insertBefore($('#services .searchTips')).enhanceWithin();
		searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
	},initHotTagCatList:function(){
		var params = searchResultJs.getInitParams();
		var items = [],catList,hotTag = params.hotTag;
		/*
		if(hotTag == 0){
			if(params.categoryParentId == 3 && params.keyword==''){
				items.push(['<div class="kindSel  param=\'{"keyword":"","hotTag":"0"}\'">全部分类</div>'].join(''));
			}else{
				items.push(['<div data-icon="false  param=\'{"keyword":"","hotTag":"0"}\'">全部分类</div>'].join(''));
			}
		} else {
			if(params.categoryParentId == 3){
				items.push(['<div class="kindSel  param=\'{"keyword":"","hotTag":"'+ hotTag +'"}\'">全部分类</div>'].join(''));
			}else{
				items.push(['<div data-icon="false  param=\'{"keyword":"","hotTag":"'+ hotTag +'"}\'">全部分类</div>'].join(''));
			}
		}
		*/
		$.post(mainJs.getApiUrl("/urming_quan/system/getCourseHotTag") , function(data){
			var res = $.parseJSON(data);
			if(hotTag == 0){
				catList = res.hotTags;
				for(var i=0;i<catList.length;i++){
					var item = catList[i];
					if(item.content == params.keyword){
						items.push([
						'<div  class="kindSel" param=\'{"keyword":"'+ item.content +'","hotTag":"0"}\'>', item.title, '</div>'
						].join(''));
						$('#servicesCatBtn').html(item.title);
					}else{
						items.push([
						'<div data-icon="false" param=\'{"keyword":"'+ item.content +'","hotTag":"0"}\'>', item.title, '</div>'
						].join(''));
					}
				}
			}else{
				catList = res.categories;
				for(var i=0;i<catList.length;i++){
					var categoryItem = catList[i];
					if(categoryItem.id != hotTag){
						continue;
					}
					var categoryHotTags = categoryItem.hotTags;
					for(var j=0;j<categoryHotTags.length;j++){
						var item = categoryHotTags[j];
						if(item.content == params.keyword){
							items.push([
							'<div  class="kindSel" param=\'{"keyword":"'+ item.content +'","hotTag":"'+categoryItem.id +'"}\'>', item.title, '</div>'
							].join(''));
							$('#servicesCatBtn').html(item.title);
						}else{
							items.push([
							'<div data-icon="false" param=\'{"keyword":"'+ item.content +'","hotTag":"'+categoryItem.id +'"}\'>', item.title, '</div>'
							].join(''));
						}
					}
				}
			}
			var html = ['<div id="catList" class="servicesCatBtnCls searchPageListCtr searchPageList hidecls">',
				items.join(''),
			'</div>'];
			$('#catList').remove();
			$(html.join('')).insertBefore($('#services .searchTips')).enhanceWithin();
			searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
		}).error(function(){
			viewJs.showPopMsg('网络错误');
            viewJs.delayCancelBusy(me._data);
		});
	},initSortList:function(params){
		var orderType = params.orderType;
		var searchKind = params.searchKind;
		var html;
		switch(searchKind){
			case 'users':
				html = ['<div id="sortList" class="searchPageListCtr servicesSortBtn searchPageList hidecls ">',
					'<div  data-orderType="0">综合排序</div>',
					'<div  data-orderType="1">距离最近</div>',
					'<div  data-orderType="2">服务分最高</div>',
					'</div>'];
				break;
			case 'wants' : case 'question': case 'recruit':
				html = ['<div id="sortList" class="searchPageListCtr servicesSortBtn searchPageList hidecls">',
					'<div  data-orderType="0">综合排序</div>',
                    '<div  data-orderType="2">预算最高</div>',
					'<div  data-orderType="5">距离最近</div>',
					'<div  data-orderType="4">最新发布</div>',
					'</div>'];
				break;
			case 'crowdfunding' :
				html = ['<div id="sortList" class="searchPageListCtr servicesSortBtn searchPageList hidecls">',
					'<div  data-orderType="0">发布时间</div>',
					'<div  data-orderType="1">融资最多</div>',
					'<div  data-orderType="2">支持最多</div>',
					'<div  data-orderType="3">进度最快</div>',
					'</div>'];
				break;
			default:
				html = ['<div id="sortList" class="searchPageListCtr servicesSortBtn searchPageList hidecls">',
					'<div  data-orderType="0">综合排序</div>',
					'<div  data-orderType="1">销量排序</div>',
					'<div  data-orderType="2">价格最高</div>',
					'<div  data-orderType="3">价格最低</div>',
					'<div  data-orderType="4">最新发布</div>',
					'<div  data-orderType="5">距离最近</div>',
				'</div>'];
				break;
		}
		if(params.catId==8){
			html = ['<div id="sortList" class="searchPageListCtr servicesSortBtn searchPageList hidecls">',
				'<div  data-orderType="0">发布时间</div>',
				'<div  data-orderType="1">融资最多</div>',
				'<div  data-orderType="2">支持最多</div>',
				'<div  data-orderType="3">进度最快</div>',
				'</div>'];
		}
		$('#sortList').remove();
		var selItem = $(html.join('')).insertBefore($('#services .searchTips')).enhanceWithin().find('[data-orderType='+orderType +']').addClass('kindSel');
		$('#servicesSortBtn').html(selItem.text());
	},loadPage:function(){
        var $el = $(this);
        if($el.is('.disabled')){
            return;
        }
        var $p = $.mobile.activePage;
        var me = searchResultJs;
        if(me._data.busy){
            return;
        }
        me._data.busy = true;
        var params = mainJs.parseUrlSearch();
        var $vrGrp = $p.find('.ui-header:first .vrGrp:visible');
        if($vrGrp.length > 0){
             params.searchKind = $vrGrp.find('.rItem.sel').attr('tab');
        }
        params.offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
        me.loadServiceList(params);
    },loadServiceList:function(searchParams){
        var me = searchResultJs;
        var $p = $.mobile.activePage;
        var searchKind = searchParams.searchKind;
        var url = me.getSearchUrl(searchKind);
        var params = $.extend({}, searchParams);
        var vkeyword = $.trim(params.vkeyword);
        if(vkeyword != ''){
            params.keyword = vkeyword;
        }

        if($.trim(params.vtitle) == "课程"){
            params.keyword = $.trim(params.keyword);
            if( params.keyword == ''){
                params.keyword ="创新学堂课程";
            } else {
                params.keyword = "创新学堂课程,"+params.keyword;
            }
        }
		if(params.questionstatus!=undefined && params.questionstatus!=''){
			params.status = params.questionstatus;
		}
		//hw
		if($p.find('.ui-header:first .vrGrp:visible').length > 0){
			switch(searchKind){
				case 'services':
					params.categoryId = null;
					params.categoryParentId = 1;
					params.catId = 1;
					break;
				case 'wants':
					params.categoryId = null;
					params.categoryParentId = 2;
					params.catId = 2;
					break;
				case 'answer':
					//params.categoryName="答案";
					params.categoryId = null;
					params.categoryParentId = 6;
					params.catId = 6;
					break;
				case 'question':
					//params.categoryName="问题";
					params.categoryId = null;
					params.categoryParentId = 5;
					params.catId = 5;
					break;
				case 'activity':
					params.categoryId = null;
					params.categoryParentId = 4;
					params.catId = 4;
					break;
				case 'course':
					params.categoryId = null;
					params.categoryParentId = 3;
					params.catId = 3;
					break;
				case 'recruit':
					params.categoryId = null;
					params.categoryParentId = 7;
					params.catId = 7;
					break;
				case 'crowdfunding':
					params.categoryId = null;
					params.categoryParentId = 8;
					params.catId = 8;
					break;
			}
			params.categoryName=null;
		}
		//hw
		var user = dmJs.sStore.getUserInfo();
		if(user != null){
			params.accessToken = dmJs.sStore.getUserInfo().accessToken;
		}
		$.post(url,params , function(data, statusText, jqhr){
				var res = $.parseJSON(data);
                //console.log(res)
				me.pareServiesToHtml(res, searchKind,searchParams);
				me.searchOffset.offset = Number(searchParams.offset)+ Number(searchParams.pageSize);
				me.searchOffset.total = res.total;
                viewJs.delayCancelBusy(me._data);
			}
		).error(function(){
			viewJs.showPopMsg('网络错误');
            viewJs.delayCancelBusy(me._data);
		});

	},pareServiesToHtml:function(res, searchKind, options){
		var me = searchResultJs;
        var $p = $.mobile.activePage;
		if(res.error != null){
			viewJs.showApiError(res);
			return;
		}
        var opt = {
            dataKey:'datas',
            paperTpl:$('#paper_tpl').html(),
            $content:$p.find('.list-items'),
            offset:options.offset || 0
        };

		var d =res.datas;
		var i = 0, l = d.length, htmls=[];
		
		switch(searchKind){
			case 'users':
                opt.itemParser = me.formatUserItem;
                opt.tpl = $('#searchResult_user_item_tpl').html();
				break;
			case 'wants':  case 'recruit':
                opt.itemParser = me.formatWantItem;
                opt.tpl = $('#searchResult_want_item_tpl').html();
				break;
			case 'question':
				opt.itemParser = me.formatWantItem;
                opt.tpl = $('#searchResult_question_item_tpl').html();
				break;
			case 'crowdfunding':
				opt.itemParser = me.formatCrowdfundingItem;
				opt.tpl = $('#searchResult_crowdfunding_item_tpl').html();
				break;
			default:
			for (;i < l; i++){
                opt.tpl = $('#searchResult_service_item_tpl').html();
                opt.itemParser = me.formatServiceItem;
			}
		}
		/*if(l == 0){
            $('#result_not_found_container').show();
			$('#result_not_found_tip').html('暂时没有搜索到相关信息');
            $p.addClass('not-found');
		}*/
        //console.log(res)
        viewJs.parseList(res, opt);
		if(searchKind=='crowdfunding'){
			me.canvasRate();
			me.countdown();
		}
		me.maskMenu($p.find('.list-items:first'), '.searchPageListCtr');

	},getSearchUrl:function(kind){
		var kind = $.trim(kind);
		if(kind == '' || kind == 'services' || kind == 'answer' || kind == 'course' || kind == 'activity'){
			return mainJs.getApiUrl('/urming_quan/search/getServices');
		}
		if(kind == 'crowdfunding'){
			return mainJs.getApiUrl('/urming_quan/service/getCrowdfundingList');
		}
		if(kind == 'users'){
			return mainJs.getApiUrl('/urming_quan/search/getUsers');
		}
		if(kind == 'wants' || kind == 'question' || kind == 'recruit'){
			return mainJs.getApiUrl('/urming_quan/search/getWants');
		}
	},closeOtherSearchList:function($el){
		$el.siblings('.searchPageListCtr').hide();
	},showAreaList:function(parentID, parentName){
		var me = searchResultJs;
		var $a = $('#areaListCtr');
		if($a.length==0){
			$('#btn-active-pos-arrow').attr('col', '1');
			var params = searchResultJs.getInitParams();
			if(params.catId == 5){
				var html;
				if(dmJs.sStore.getUserInfo()!=null){
					html = ['<div class="searchPageListCtr servicesAreaBtnCls" id="areaListCtr"><div id="areaList" data-areaId="',parentID, '"class="searchPageList">',
						'<div questionstatus="0" style="background-color: white;border-bottom: 1px solid #ccc;">全部</div>',
						'<div questionstatus="1" style="background-color: white;border-bottom: 1px solid #ccc;">新问题</div>',
						'<div questionstatus="2" style="background-color: white;border-bottom: 1px solid #ccc;">未参与</div>',
						'<div questionstatus="3" style="background-color: white;border-bottom: 1px solid #ccc;">已参与</div>',
						'</div></div>'];
				}else{
					html = ['<div class="searchPageListCtr servicesAreaBtnCls" id="areaListCtr"><div id="areaList" data-areaId="',parentID, '"class="searchPageList">',
						'<div questionstatus="0" style="background-color: white;border-bottom: 1px solid #ccc;">全部</div>',
						'</div></div>'];
				}
				var $m = $(html.join('')).insertBefore($('#services .searchTips'));
				$m.find('[questionstatus="'+params.questionstatus+'"]').css({color:"#197eee","border-bottom":"1px solid #197eee"});
				me.closeOtherSearchList($m);
				$m.enhanceWithin();
				searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
				return;
			}
			if(params.catId == 8){
				var html = ['<div class="searchPageListCtr servicesAreaBtnCls" id="areaListCtr"><div id="areaList" data-areaId="',parentID, '"class="searchPageList">',
					'<div crowdfundingstatus="0" style="background-color: white;border-bottom: 1px solid #ccc;">全部</div>',
					'<div crowdfundingstatus="1" style="background-color: white;border-bottom: 1px solid #ccc;">融资中</div>',
					'<div crowdfundingstatus="2" style="background-color: white;border-bottom: 1px solid #ccc;">融资完成</div>',
					'</div></div>'];
				var $m = $(html.join('')).insertBefore($('#services .searchTips'));
				$m.find('[crowdfundingstatus="'+params.crowdfundingStatus+'"]').css({color:"#197eee","border-bottom":"1px solid #197eee"});
				me.closeOtherSearchList($m);
				$m.enhanceWithin();
				searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
				return;
			}
			if(params.distance != null){
				var html = ['<div class="searchPageListCtr servicesAreaBtnCls" id="areaListCtr"><div id="areaList" data-areaId="',parentID, '"class="searchPageList">',
							'<div distance="500">500米内</div>',
							'<div distance="1000">1千米</div>',
							'<div distance="3000">3千米</div>',
							'<div distance="5000">5千米</div>',
				'</div></div>'];
				var $m = $(html.join('')).insertBefore($('#services .searchTips'));
				$m.find('[distance="'+params.distance+'"]').addClass('kindSel');
				me.closeOtherSearchList($m);
				$m.enhanceWithin();
//				$('#areaListCtr>div').css('max-height',
//					$(window).height()- 82 + 'px');
				searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
				return;
			}
			var selId = -2,selName = '全部';
			viewJs.maskBusy(null, 'showAreaList');
			dmJs.getAreasByParentId(parentID, function(areaData){
				var lst = areaData.areas, l = lst.length, i = 0, area;
				var  items = [];
				items.push([
						'<div  data-areaId="-2">全部</div>'
					].join(''));
				items.push([
						'<div  data-areaId="-1">全',parentName ,'</div>'
					].join(''));
				if(parentName == params.area1){
					selId = -1;
					selName = parentName;
				}
				for(; i < l; i++){
					area = lst[i];
					items.push([
						'<div data-areaId="', area.id,'"data-icon="false">', area.areaName, '</div>'
					].join(''));
					if(area.areaName == params.area2){
						selId = area.id;
						selName = area.areaName;
					}
				}
				var html = ['<div class="searchPageListCtr servicesAreaBtnCls" id="areaListCtr"><div id="areaList" data-areaId="',parentID, '"class="searchPageList">',
						items.join(''),
				'</div><div id="childAreaList" class="searchPageList"><div  data-areaId="-100">全部</div></div></div>'];
				var $m = $(html.join('')).insertBefore($('#services .searchTips'));
				me.closeOtherSearchList($m);
				$m.enhanceWithin();
//				$('#areaListCtr>div').css('max-height',
//					$(window).height()- 82 + 'px');
				$('#areaList>[data-areaId="'+ selId +'"]').addClass('kindSel');
				me.showChildAreaList(selId, selName);
				searchResultJs.maskMenu($.mobile.activePage.find('.list-items:first'), '.searchPageListCtr');
				viewJs.hideBusyMask('showAreaList');

			}, function(){viewJs.hideBusyMask('showAreaList');});
		} else {
			if($a.is(':hidden')){
//				$('#areaListCtr>div').css('max-height', $(window).height()- 82 + 'px');
				me.closeOtherSearchList($a);
				$a.show();
				$('#btn-active-pos-arrow').attr('col', '1');
			} else {
				$('#servicesAreaBtn').removeClass('ui-btn-active');
				$('#btn-active-pos-arrow').attr('col', null);
				$a.hide();
			}
		}
 },pareseChildAreaList:function(areas, ctr){
	var sel = $.trim($('#servicesAreaBtn').text());
	var lst = areas;
	var htmls = [], l = lst.length,i=0,area;
	for(; i < l; i++){
		area = lst[i];
		if(sel == area.areaName){
			htmls.push(['<div  class="kindSel" data-areaId="',area.id,'">', area.areaName,'</div>'].join(''));
		} else {
			htmls.push(['<div  data-areaId="',area.id,'">', area.areaName,'</div>'].join(''));
		}
		
	}
	$(htmls.join('')).appendTo(ctr).enhanceWithin();
 }, showChildAreaList:function(parentID, parentName){
	var me = searchResultJs;
	var $c = $('#childAreaList');
	$c.empty();
	if(parentID < 0){
		var areas = [];
		if(parentID == -2){
			areas.push({id:-100, areaName:'全部'});
		} else if(parentID == -1){
			areas.push({id:-200, areaName:parentName});
		}
		me.pareseChildAreaList(areas, $c);

		return;
	}
	dmJs.getAreasByParentId(parentID, function(res){
		 me.pareseChildAreaList([{id:-300, areaName:'全部'+parentName}].concat(res.areas), $c);
	}, function(){
		
	});
 },formatServiceItem:function(item, opt){
	//item.priceStyle = item.categoryParentId==4 && item.newPrice==0?"display:none":"";
        var typePic = null;
        switch(item.categoryParentId){
            case '4':
                typePic =mainJs.getActPicUrl;
                break;
            case '3':
                typePic = mainJs.getCoursPicUrl;
                break;
			case '8':
				typePic = mainJs.getFunPicUrl;
				break;
            default :
                typePic = mainJs.getSvrPicUrl;
                break;
        }
        var keyword = mainJs.parseUrlSearch().keyword
        if(keyword === '2016大赛'){
            item.img = typePic({url:item.picUrl,size:2},true);
        }else{
            item.img = typePic({url:item.picUrl,size:2});
        }

	if(item.categoryParentId==4 && item.newPrice==0){
		item.newPrice = "";
	}else{
		item.newPrice = "￥"+item.newPrice+((item.unit==undefined || item.unit=="")?"":("/"+item.unit));
	}
	return item;
},formatCrowdfundingItem:function(item, opt){
		item.img = mainJs.getFunPicUrl({url:item.picUrl,size:1});
		item.number = item.maxBuyerCount-item.buyerCount;
		item.completionRate = (item.completionRate*100).toFixed(1);
		if(item.completeTotalMoney>=item.totalMoney){
			item.endTimeShow = "已结束"
		}else if(item.endTime){
			var endTime = new Date(Date.parse(item.endTime.replace(/-/g, "/"))).getTime();
			var realTime = new Date().getTime();
			var difference = endTime-realTime;
			//计算出相差天数
			var days=Math.floor(difference/(24*3600*1000));
			//计算出小时数
			var leave1=difference%(24*3600*1000);
			//计算天数后剩余的毫秒数
			var hours=Math.floor(leave1/(3600*1000));
			//计算相差分钟数
			var leave2=leave1%(3600*1000);
			//计算小时数后剩余的毫秒数
			var minutes=Math.floor(leave2/(60*1000));
			//计算相差秒数
			var leave3=leave2%(60*1000);
			//计算分钟数后剩余的毫秒数
			var seconds=Math.round(leave3/1000);
			if(days>0){
				item.endTimeShow = "剩余："+days+"天";
			}else if(difference<0){
				item.endTimeShow = "已截止";
			}else{
				item.endTimeShow ="剩余："+ (days>0?(days+"天"):"")+(hours>0?((hours<10?("0"+hours):hours)+"时"):"")+(minutes>0?((minutes<10?("0"+minutes):minutes)+"分"):"")+(seconds>0?((seconds<10?("0"+seconds):seconds)+"秒"):"");
			}
		}else{
			item.endTimeShow = "剩余：无";
		}
		return item;
},toPublishWant:function(){
    viewJs.navigator.next({next:{id:'addWant',url:'addWant.html'}});
 },formatUserItem:function(item, opt){
    var info = {};
    info.sex = viewJs.setSexMarkCls(item);
	var idcardValidated = 'empty';
	if(item.type == 2){
        idcardValidated = item.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
        if(item.isGroup){
            idcardValidated = 'project'
        }
	} else if(item.isTeacherValidated == 1 || item.type == 3){
		idcardValidated = item.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
	}else if(item.isIdcardValidated == 1){
		idcardValidated = 'person';
	}
	info.userType= idcardValidated;
	info.idcardValidated = 'idcardValidated';
	/*
    info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
   	info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
   	*/
	var userTags = item.userTags;
	var tagHtmls = [];
	var i = 0 , l = userTags.length,tagItem;
	for(; i < l; i++){
		tagItem = userTags[i];
        if($.trim(tagItem.tagName) == "北大创新"){
            continue;
        }
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
	if(item.institutionUserName){
		info.institutionUserName = "所属公众号: "+item.institutionUserName;
	}
    info.img =  mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex});
    info.tag = tagHtmls.join('');
    return info;
},formatWantItem:function(item, opt){
		var me = searchResultJs;
		var user = dmJs.sStore.getUserInfo();
		if(user){
			item.replay = user.user.id === item.userID ? '查看': '回答';
		}else{
			item.replay = '回答'
		}
		
		//console.log(opt)
		item.creTime = viewJs.parseTime(item.creTime);
		item.profileImageUrl =  mainJs.getProfilePicUrl({url:item.profileImageUrl});
		item.price = "￥"+item.price+((item.unit==undefined || item.unit=="")?"":("/"+item.unit));
		if(mainJs.parseUrlSearch().catId == 5){
			item.distance=(item.responseNumber==undefined?0:item.responseNumber);//fsk 18/8/23 +'回答';
		}
        return item;
},maskMenu:function(targetEl, maskEl){
	var zIndex  =  $(targetEl).css('z-index');
	zIndex = isNaN(zIndex) ? 2 : Number(zIndex)+1;
	$(maskEl).css({backgroundColor:'rgba(0,0,0,.3)', 
		height: $.mobile.activePage.height()-120+'px',
		width:'100%',position:'absolute','z-index':zIndex});
 	},canvasRate:function(){
		var $p = $.mobile.activePage;
		var heigth = 80;
		$p.find('canvas').each(function() {
			var text = $(this).text();
			var process = text.substring(0, text.length-1);
			var canvas = this;
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, heigth, heigth);
			context.beginPath();
			context.moveTo(heigth/2, heigth/2);
			context.arc(heigth/2, heigth/2, heigth/2, 0, Math.PI * 2, false);
			context.closePath();
			context.fillStyle = '#ddd';
			context.fill();
			context.beginPath();
			context.moveTo(heigth/2, heigth/2);
			context.arc(heigth/2, heigth/2, heigth/2, 0, Math.PI * 2 * process / 100, false);
			context.closePath();
			context.fillStyle = '#67BBAB';
			context.fill();
			context.beginPath();
			context.moveTo(heigth/2, heigth/2);
			context.arc(heigth/2, heigth/2, heigth/2-5, 0, Math.PI * 2, true);
			context.closePath();
			context.fillStyle = 'rgba(255,255,255,1)';
			context.fill();
			context.beginPath();
			context.arc(heigth/2, heigth/2, heigth/2-7, 0, Math.PI * 2, true);
			context.closePath();
			context.strokeStyle = '#ddd';
			context.stroke();
			context.font = "bold 14pt Arial";
			context.fillStyle = '#67BBAB';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.moveTo(heigth/2, heigth/2);
			context.fillText(text, heigth/2, heigth/2);
		});
	},countdown:function(){
		var $p = $.mobile.activePage;
		var run = setInterval(function() {
			$p.find(".complete-endTime").each(function(){
				var endTime = $(this).data("endtime");
				var endTimeShow = "";
				if($(this).data("completetotalmoney")>=$(this).data("totalmoney")){
					endTimeShow = "已结束"
				}else if(endTime){
					var endTime = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
					var realTime = new Date().getTime();
					var difference = endTime-realTime;
					//计算出相差天数
					var days=Math.floor(difference/(24*3600*1000));
					//计算出小时数
					var leave1=difference%(24*3600*1000);
					//计算天数后剩余的毫秒数
					var hours=Math.floor(leave1/(3600*1000));
					//计算相差分钟数
					var leave2=leave1%(3600*1000);
					//计算小时数后剩余的毫秒数
					var minutes=Math.floor(leave2/(60*1000));
					//计算相差秒数
					var leave3=leave2%(60*1000);
					//计算分钟数后剩余的毫秒数
					var seconds=Math.round(leave3/1000);
					if(days>0){
						endTimeShow = "剩余："+days+"天";
					}else if(difference<0){
						endTimeShow = "已截止";
					}else{
						endTimeShow = "剩余："+(days>0?(days+"天"):"")+(hours>0?((hours<10?("0"+hours):hours)+"时"):"")+(minutes>0?((minutes<10?("0"+minutes):minutes)+"分"):"")+(seconds>0?((seconds<10?("0"+seconds):seconds)+"秒"):"");
					}
				}else{
					endTimeShow = "剩余：无";
				}
				$(this).find("span:first-child").html(endTimeShow);
			});
		},1000);
		var test = setInterval(function() {
			if($.mobile.activePage.attr( "id" ) != "services"){
				clearInterval(run);
				clearInterval(test);
				return;
			}
		},500);
	}
};