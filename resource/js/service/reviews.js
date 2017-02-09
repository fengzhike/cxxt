reviewsJs = {
    _data: null,
    init: function () {
        var params = mainJs.parseUrlSearch();
        this.reset(true, params);
        this.toggleEvents(true);
        this.getReviews(params);
        this.reviewStars.init(params);
    }, reset: function (bInit, params) {
        if (bInit, params) {
            var me = reviewsJs;
            var opt = this._data = {};
            var url = '/urming_quan/service/getReviews';
            if (params.userId != null) {
                url = '/urming_quan/user/getUserServiceReviews';
                opt.dataKey = 'userReviews';
            } else {
                opt.dataKey = 'serviceReviews';
            }
            opt.url = url;
            opt.domain = me._data;
            opt.url = me._data.url;
            opt.dataKey = me._data.dataKey;
            opt.$content = $('#rvdlist');
            opt.tpl = $('#rvdItem-tpl').html();
            opt.paperTpl = $('#paper_tpl').html();
            opt.bLogin = false;
            opt.itemParser = me.itemParser;
            opt.param = mainJs.parseUrlSearch();
        } else {
            this._data = null;
        }
    }, toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = reviewsJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                me.reset();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
            }, 500);
        }
    }, reviewStars: {
        create: function (reviewInfo) {
            var rvdStatics = $('#rvdStatics');
            var star = rvdStatics.find('.star');
            star.empty();
            var i = 0;
            var halfStar = reviewInfo.halfStar;
            var htmls = [];
            for (; i < 5; i++) {
                if (reviewInfo.user == 0) {
                    rvdStatics.find('.bar-' + (i + 1)).width(0);
                } else {
                    rvdStatics.find('.bar-' + (i + 1)).css({width: ((reviewInfo.nums[i]) / reviewInfo.user * 100) + '%'});
                }
                rvdStatics.find('.num-' + (i + 1)).html(reviewInfo.nums[i]);
                if (i <= reviewInfo.grade - 1) {
                    htmls.push('<div class="starImg full"></div>');
                } else if (i == halfStar) {
                    htmls.push('<div class="starImg half"></div>');
                } else {
                    htmls.push('<div class="starImg empty"></div>');
                }
            }
            star.append(htmls.join('')).enhanceWithin();
            rvdStatics.find('#rvdScore').html(Number(reviewInfo.grade).toFixed(1));
            rvdStatics.find('#rvdTotalNum').html(reviewInfo.user + '人评价');
            return star;
        }, init: function (params) {
            var reviewInfo = this.initParams(params);
            var stars = this.create(reviewInfo);
        }, initParams: function (params) {
            var params = params || mainJs.parseUrlSearch();
            viewJs.setDfReviewNumbers(params);
            var reviewNumbers = params.reviewNumbers;
            var reviewInfo = dmJs.calGrade(reviewNumbers);
            return reviewInfo;
        }
    }, doAction: function (evt) {
        var $el = $(this);
        var me = reviewsJs;
        var sAction = $el.attr('action');
        switch (sAction) {
            case 'pageNav':
                me.getReviews.call($el, evt);
                break;
            case 'userDetail':
                me.toPage.apply($el, arguments);
                break;
        }
    }, getReviews: function (evt) {
        var me = reviewsJs;
        var opt = me._data;
        opt.evt = evt;
        viewJs.loadPage(opt);
    },itemParser: function (item) {
        var info = {};
        info.realname = item.userByFromUserId.realname;
        info.reviewTime = item.reviewTime;
        info.stars = viewJs.getStars({grade: item.value1}).join('');
        info.reviewContent = item.reviewContent;
        info.serviceName = item.serviceName;
        info.price = Number(item.price).toFixed(2);
        var user = item.userByFromUserId;
        if(user && user.id){
            info.cls = "vbt";
            info.id = user.id;
        } else {
            info.id = '';
        }
        return info;
    },toPage:function(){
        var $m = $(this);
        var id = $m.attr('data-id');
        if(id != null && id != ''){
           var next = {
                url:'./u.html', id:'u',
                options:{
                    data:{userId:id}
                }
            };
            viewJs.navigator.next({
                next:next,
                lastAuto:true
            });
        }
    }
};