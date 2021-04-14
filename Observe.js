class Observer{
    constructor(data){
        this._walk(data)
    }
    //对传入的数据进行劫持
    _walk(data){
        //判断是否是对象，如果不是，则返回
        if(!data || typeof data !=='object'){
            return;
        }
        for(let key in data){
            this.defineReactive(data,key,data[key])
        }
    }
    defineReactive(obj,key,value){
        // 创建当前属性的发布者
        var that = this
        var dep = new Dep()
        Object.defineProperty(obj,key,{
            configurable:true,
            enumerable:true,
            get:function(){
                // 若当前有对该属性的依赖项，则将其加入到发布者的订阅者队列里
                if(Dep.target){
                    dep.addSub(Dep.target)
                }
                return value
            },
            set:function(newValue){
                if(value === newValue){
                    return;
                }
                value = newValue
                that._walk(value)
                dep.notify()
            }
        })
    }
}
