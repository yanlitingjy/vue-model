class Observer{
    constructor(data){
        //判断是否是对象，如果不是，则返回
        if(!data || typeof data !=='object'){
            return;
        }
        this.data = data
        this.walk()
    }
    //对传入的数据进行劫持
    walk(){
        for(let key in this.data){
            this.defineReactive(this.data,key,this.data[key])
        }
    }
    defineReactive(obj,key,value){
        // 创建当前属性的发布者
        const dep = new Dep()
        new Observer(value);
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
                new Observer(value) //递归检测
                dep.notify()
            }
        })
    }
}
