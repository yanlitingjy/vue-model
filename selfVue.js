class SelfVue {
    constructor(options){
        this.$options = options || {}
        this.$data = options.data || {}
        this.$el = typeof options.el == 'string'?document.querySelector(options.el):options.el
        this.$methods = options.methods;
        this.init(this.$data)
    };
    init(data){
        this._proxyData(data)
        new Observer(data);
        new Compile(this);
        this.$options.mounted.call(this); // 所有事情处理好后执行mounted函数
    }
    _proxyData(data){
        //1.遍历data中的所有属性
        Object.keys(data).forEach((key)=>{
            //2.把data属性注入到vue实例中
            Object.defineProperty(this,key,{
                configurable:true,
                enumerable:true,
                get(){
                    return data[key]
                },
                set(newValue){
                    if(newValue == data[key]){
                        return;
                    }
                    data[key] = newValue
                }
            })
        })
    }
}