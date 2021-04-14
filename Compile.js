class Compile {
    constructor(vm){
        this.vm = vm
        this.el = this.vm.$el
        this.methods = this.vm.$methods
        this.fragment = this.nodeToFragment(this.el);
        this.compile(this.fragment);
        this.el.appendChild(this.fragment);
    }
    //遍历所有节点及其子节点，进行扫描解析编译，调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定
    compile(el) {
        var childNodes = el.childNodes;
        Array.from(childNodes).forEach((node)=>{
            // 按元素节点方式编译
            if (this.isElementNode(node)) {
                this.compileElement(node);
            } else if (this.isTextNode(node)) { //文本节点
                this.compileText(node);
            }
            // 遍历编译子节点
            if (node.childNodes && node.childNodes.length>0) {
                this.compile(node);
            }
        });
    }
    //编译元素节点，处理指令
    compileElement(node) {
        var nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach((attr)=> {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = attr.name;    // v-text

            if (this.isDirective(attrName)) {
                var key = attr.value; // content
                var dir = attrName.substring(2);    // text
                if (this.isEventDirective(dir)) {
                    // 事件指令, 如 v-on:click
                    this.compileEvent(node,key,dir);
                } else {
                    // 普通指令 v-model  v-text
                    this.update(node,key,dir)
                }
                node.removeAttribute(attrName);
            }
        });
    }
    update(node,key,attrName){
        let updateFn = this[attrName+'Updater']
        updateFn && updateFn.call(this,node,this.vm[key],key)
    }
    //处理v-text指令
    textUpdater(node,value,key){
        node.textContent = value
        new Watcher(this.vm,key,(newValue)=>{
            //console.log(newValue)
            node.textContent = newValue
        })
    }
    //处理v-modal指令
    modelUpdater(node,value,key){
        node.value = value
        new Watcher(this.vm,key,(newValue)=>{
            node.value = newValue
        })
        //双向绑定
        node.addEventListener('input',()=>{
            this.vm[key] = node.value
        })
    }
    //执行{{}}的节点的值
    compileText (node) { //每个符合{{}}的节点，{{}}里面的内容值
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        if(reg.test(value)){
            let key = RegExp.$1.trim()
            node.textContent = value.replace(reg,this.vm[key])
            new Watcher(this.vm,key,(newValue)=>{ // 生成订阅器并绑定更新函数
                node.textContent = newValue
            })
        }
    }
    //执行事件的节点的值
    compileEvent (node,key,dir) {
        var eventType = dir.split(':')[1];
        var cb = this.methods && this.methods[key];
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(this.vm), false);
        }
    }

    // 判断元素节点 元素类型等于1
    isElementNode(node) {
        return node.nodeType === 1;
    }
    // 是否是文本节点
    isTextNode(node) {
        return node.nodeType === 3;
    }
    // 判断是是不是v-指令
    isDirective(attr) {
        return attr.indexOf('v-') == 0;
    }
    // 判断是是不是on:事件指令
    isEventDirective(dir) {
        return dir.indexOf('on:') === 0;
    }
    //因为dom操作比较频繁，所有可以先建一个fragment片段，将需要解析的dom节点存入fragment片段里再进行处理：
    nodeToFragment(el){
        var fragment = document.createDocumentFragment();
        var child = el.firstChild //获取父节点下第一个节点对象
        // 将原生节点拷贝到fragment
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    }
}
