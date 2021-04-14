//观察者
class Watcher{
    /** 
     * vm
     * key 
     * updateCb fn
    */
    constructor(vm,key,updateCb){
        this.vm = vm
        this.key = key

        this.updateCb = updateCb

        //把watcher记录到到Dep🥱到静态属性
        Dep.target = this
        //触发get方法，在get方法中调用addSub
        this.oldValue = vm[key]

        Dep.target = null;
    }
    update() {
        let newValue = this.vm[this.key];
        if(newValue === this.oldValue){
            return
        }
        this.updateCb(newValue);
    }
}
