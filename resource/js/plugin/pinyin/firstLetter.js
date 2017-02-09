firstLetterJs = {
	_dicVer:2,
	_cache:{},
	_dicTxt:null,
	letterReg:/[a-zA-Z]/,
	loadDic:function(callback){
		localStorage.removeItem('TFLDic_cache');
		localStorage.removeItem('TFLDic');
		var me = firstLetterJs;
		me.initCache();
		if(me.getDic()){
			if(callback){
				callback();
			}
			return;
		}
		$.get('resource/js/plugin/pinyin/TFLDic'+this._dicVer+'.txt', function(data){ 
			me._dicTxt = data;
			localStorage.setItem('TFLDic'+me._dicVer, data);
			if(callback){
				callback();
			}
		}).error(function(){
			viewJs.dialogPop('词典加载错误',
				function(){location.href= './';},
				'错误',
			{onlyBtnOk:true});
		});
	},getDic:function(){
		if(this._dicTxt){
			return this._dicTxt;
		} else {
			return (this._dicTxt = localStorage.getItem('TFLDic'+this._dicVer));
		}
	},cache:function(){
		if(this._cache){
			localStorage.setItem('TFLDic_cache'+this._dicVer, JSON.stringify(this._cache));
		}
	},initCache:function(){
		var cache = localStorage.getItem('TFLDic_cache'+this._dicVer);
		if(cache){
			this._cache = JSON.parse(''+cache);
		} else {
			this._cache = {};
		}
	},reset:function(){
		this._cache = null;
		this._dicTxt = null;
		localStorage.removeItem('TFLDic_cache'+this._dicVer);
		localStorage.removeItem('TFLDic'+this._dicVer);
	},firstLetter:function(str){
		var lt;
		var fw = str.charAt(0);
		if(this.letterReg.test(fw)){
			return fw.toUpperCase();
		}
		lt = this._cache[fw];
		if(lt){
			return lt;
		}
		if(/[\?\+\.\]\[\(\)\$\^\*]/.test(fw)){
			lt = '@';
		} else {
			var regExp = new RegExp('[a-z]+:[^@]*'+fw);
			var rlt = this.getDic().match(regExp);
			if(rlt == null){
				lt = '@';
			} else {
				lt = rlt[0].charAt(0).toUpperCase();
			}
		}
		this._cache[fw] = lt;
		return lt;
	}
};