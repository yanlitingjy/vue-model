class SelfVue {
    constructor(options){
        this.options = options
        this.data = options.data;
        this.methods = options.methods;
        this.init()
    }
    init(){
        Object.keys(this.data).forEach(key=>{
            this.proxyKeys(key);  // 绑定代理属性
        });
        new Observer(this.data);
        new Compile(this.options.el,this);
        this.options.mounted.call(this); // 所有事情处理好后执行mounted函数
    }
    proxyKeys(key){
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function proxyGetter() {
                return this.data[key];
            },
            set: function proxySetter(newVal) {
                this.data[key] = newVal;
            }
        });
    }   
}