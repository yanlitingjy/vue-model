// 发布者,将依赖该属性的watcher都加入subs数组，当该属性改变的时候，则调用所有依赖该属性的watcher的更新函数，触发更新。
class Dep {
    constructor(){
        this.subs = []
    }
    //添加进订阅器容器
    addSub(sub){
        if (this.subs.indexOf(sub) < 0) {
            this.subs.push(sub);
        }
    }
    //通知所有订阅者
    notify(){
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
}
Dep.target = null