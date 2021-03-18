class Compile {
    constructor(el,vm){
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.vm = vm
            this.init();
            this.el.appendChild(this.fragment);
            console.log(this.el)
        }
    }
    init(){
        this.compileElement(this.fragment); 
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
    //遍历所有节点及其子节点，进行扫描解析编译，调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定
    compileElement(el) {
        var childNodes = el.childNodes;
        [].slice.call(childNodes).forEach((node)=>{
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;    // 表达式文本
            // 按元素节点方式编译
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }
            // 遍历编译子节点
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        });
    }
    compile(node) {
        var nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach((attr)=> {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = attr.name;    // v-text

            if (this.isDirective(attrName)) {
                var exp = attr.value; // content
                var dir = attrName.substring(2);    // text
                if (this.isEventDirective(dir)) {
                    // 事件指令, 如 v-on:click
                    this.compileEvent(node,this.vm,exp,dir);
                } else {
                    // 普通指令 v-model
                    this.compileModel(node,this.vm,exp,dir);
                }
                node.removeAttribute(attrName);
            }
        });
    }
    //执行{{}}的节点的值
    compileText (node, exp) { //每个符合{{}}的节点，{{}}里面的内容值
        var initText = this.vm.data[exp];
        this.updateText(node, initText);  // 将初始化的数据初始化到视图中
        new Watcher(this.vm, exp, (oldValue,newValue)=> {  // 生成订阅器并绑定更新函数
            this.updateText(node, newValue);
        });
    }
    //执行事件的节点的值
    compileEvent (node,vm,exp,dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    }
    //执行模块的节点的值
    compileModel(node,vm,exp,dir) {
        var val = vm.data[exp];
        this.modelUpdater(node, val);
        new Watcher(vm, exp, (oldValue,newValue)=> {
            this.modelUpdater(node, newValue);
        });

        node.addEventListener('input',(e)=> {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            vm.data[exp] = newValue;
            val = newValue;
        });
    }
    //更新文本
    updateText (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
    //更新模块
    modelUpdater(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    } 
}
