//观察者
class Watcher{
    /** 
     * vm
     * keys
     * updateCb fn
    */
    constructor(vm,keys,updateCb){
        this.vm = vm
        this.keys = keys
        this.updateCb = updateCb
        this.value = null
        this.get()
    }
    // 根据vm和keys获取到最新的观察值
    get(){
        Dep.target = this
        const keys = this.keys.split('.')
        let value = this.vm.data
        keys.forEach(_key=>{
            value = value[_key]
        })
        this.value = value
        Dep.target = null;
        return this.value
    }
    update() {
        const oldValue = this.value;
        const newValue = this.get();
        if (oldValue !== newValue) {
            this.updateCb(oldValue, newValue);
        } 
    }
}
