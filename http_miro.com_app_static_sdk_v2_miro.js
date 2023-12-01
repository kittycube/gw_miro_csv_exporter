var miro=(()=>{var ye=Object.defineProperty;var Le=r=>ye(r,"__esModule",{value:!0}),o=(r,e)=>ye(r,"name",{value:e,configurable:!0});var Ge=(r,e)=>{Le(r);for(var t in e)ye(r,t,{get:e[t],enumerable:!0})};var st={};Ge(st,{board:()=>rt,clientVersion:()=>Fe});var L;(function(t){t.Success="S",t.Fail="F"})(L||(L={}));function $(){return Math.random().toString(36).slice(-10)}o($,"generateId");function Be(r){return r instanceof ArrayBuffer||!1}o(Be,"isTransferableObject");var qe=o((r,e)=>Object.prototype.hasOwnProperty.call(r,e),"isPropertyOf");async function ue(r){let e=[];if(r instanceof Blob)return[await r.arrayBuffer()];if(Be(r))return[r];if(typeof r!="object")return[];for(let t in r)if(qe(r,t)){let n=r[t];if(typeof n=="object"&&n!==null){let a=await ue(n);e.push(...a)}}return e}o(ue,"getTransferable");var ve="sdkv2-plugin-message";function Ue(r){return r!==null&&"window"in r}o(Ue,"isWindow");function Ve(r){return!(r.data?.commandId!==ve||!Array.isArray(r.data?.payload))}o(Ve,"isSdkMessage");var X=class{constructor(e,t,n,a){this.hostWindow=e;this.clientOrigin=t;this.messageHandler=n;this.windowGetter=a;this.waiting=new Map;this.handlePostMessage=o(e=>{if(this.clientOrigin!=="*"&&e.origin!==this.clientOrigin||!Ve(e)||!Ue(e.source)||e.source!==this.windowGetter())return;let{msgId:t,payload:n}=e.data,a=this.waiting.get(t);if(a)this.waiting.delete(t),a.resolve(n);else{let i=o(l=>{l&&this.dispatch(l,t)},"after");this.messageHandler(n).then(i).catch(i)}},"handlePostMessage")}init(){this.hostWindow.addEventListener("message",this.handlePostMessage)}destroy(){this.waiting.clear(),this.hostWindow.removeEventListener("message",this.handlePostMessage)}dispatch(e,t){return new Promise((n,a)=>ue(e).then(i=>{if(!this.windowGetter())return;let l=!t,g=l?$():t,ce={commandId:ve,payload:e,msgId:g};this.windowGetter().postMessage(ce,this.clientOrigin,i),l?this.waiting.set(g,{resolve:n,reject:a}):(this.waiting.delete(t),n(null))}).catch(a))}};o(X,"SdkPostMessageBus");var G=class{constructor(e){this.waitingResponse=new Map;this.handlers=new Map;this.responseHandler=o(e=>{let t=e;for(let n=0;n<t.length;n++){let a=t[n];if(!a)continue;let i=this.waitingResponse.get(a.id);i&&(a.status===L.Success?i.resolve(a.payload):a.status===L.Fail&&i.reject(new Error(String(a.payload))),this.waitingResponse.delete(a.id))}return Promise.resolve([])},"responseHandler");this.handle=o(e=>{let t=e,n=[];for(let a=0;a<t.length;a++){let i=t[a];if(i.status){this.responseHandler([i]);continue}let l=this.handlers.get(i.id);l&&l.forEach(g=>{n.push(g(i))})}return Promise.all(n)},"handle");this.bus=new X(e,"*",this.handle,()=>e.parent),this.bus.init()}destroy(){this.bus.destroy()}async exec(e,t){let n=$(),i=[{name:e,payload:t,id:n}];return new Promise((l,g)=>{this.waitingResponse.set(n,{resolve:l,reject:g}),this.bus.dispatch(i).then(this.responseHandler)})}subscribe(e,t){let n=this.handlers.get(e)||[];this.handlers.set(e,[...n,t])}unsubscribe(e,t){let n=(this.handlers.get(e)||[]).filter(a=>a!==t);n.length===0?this.handlers.delete(e):this.handlers.set(e,n)}hasEventSubscriptions(e){return this.handlers.has(e)}};o(G,"IframeCommander");var B=class{constructor(e,t){this.realCommander=e;this.prefix=t}exec(e,t){let n=`${this.prefix.toUpperCase()}_${e}`;return this.realCommander.exec(n,t)}subscribe(e,t){this.realCommander.subscribe(e,t)}unsubscribe(e,t){this.realCommander.unsubscribe(e,t)}hasEventSubscriptions(e){return this.realCommander.hasEventSubscriptions(e)}};o(B,"CommanderProxy");var d=o((r,e,t)=>{Object.defineProperty(r,e,{enumerable:!1,writable:!1,configurable:!1,value:t})},"setPrivateField");function he(r){return r!=null&&typeof r=="object"&&!Array.isArray(r)&&!(r instanceof Blob)}o(he,"isObject");function p(r,...e){if(!e.length)return r;let t=e.shift();return he(r)&&he(t)&&Object.keys(t).forEach(n=>{he(t[n])?(r[n]||Object.assign(r,{[n]:{}}),p(r[n],t[n])):Object.assign(r,{[n]:t[n]})}),p(r,...e)}o(p,"mergeDeep");function Te(r){let e={};return Object.keys(r).forEach(t=>{let n=r[t];typeof n!="function"&&(e[t]=n)}),e}o(Te,"asProps");var xe=o(async r=>new Promise((e,t)=>{let n=new FileReader;n.onload=()=>{e(n.result?.toString()??"")},n.onerror=()=>{t(n.error)},n.onabort=()=>{t(new Error("Aborted"))},n.readAsDataURL(r)}),"blobToDataUrl");var c=Symbol("EventManager"),s=Symbol("Commander");var w=o(async(r,e,t)=>{let n=await e.exec("WIDGET_GET",r);if(!Array.isArray(n))throw new Error("Error retrieving items");return n.map(a=>t(e,a))},"getItems");var u=class{constructor(e){d(this,s,e)}async sync(){let e=await this[s].exec("WIDGET_UPDATE",this);p(this,e)}async getMetadata(e){return this[s].exec("WIDGET_GET_METADATA",{itemId:this.id,key:e})}async setMetadata(e,t){return this[s].exec("WIDGET_SET_METADATA",{itemId:this.id,key:e,value:t})}async goToLink(){return this[s].exec("WIDGET_GO_TO_LINK",{itemId:this.id})}async bringToFront(){return this[s].exec("BRING_TO_FRONT",{items:[this.id]})}async sendToBack(){return this[s].exec("SEND_TO_BACK",{items:[this.id]})}async bringInFrontOf(e){return this[s].exec("BRING_IN_FRONT_OF",{items:[this.id],targetId:e.id})}async sendBehindOf(e){return this[s].exec("SEND_BEHIND_OF",{items:[this.id],targetId:e.id})}async getLayerIndex(){return this[s].exec("GET_LAYER_INDEX",{itemId:this.id})}async getConnectors(){let e=this.connectorIds;return!e||e.length===0?[]:w({type:"connector",id:e},this[s],f)}};o(u,"BaseItem");var P=class extends u{constructor(e,t){super(e);this.type="text";this.content="";this.style={fillColor:"transparent",fillOpacity:1,fontFamily:"arial",fontSize:14,textAlign:"left",color:"#1a1a1a"};p(this,t)}};o(P,"Text");var Pe;(function(m){m.Rectangle="rectangle",m.Circle="circle",m.Triangle="triangle",m.WedgeRoundRectangleCallout="wedge_round_rectangle_callout",m.RoundRectangle="round_rectangle",m.Rhombus="rhombus",m.Parallelogram="parallelogram",m.Star="star",m.RightArrow="right_arrow",m.LeftArrow="left_arrow",m.Pentagon="pentagon",m.Hexagon="hexagon",m.Octagon="octagon",m.Trapezoid="trapezoid",m.FlowChartPredefinedProcess="flow_chart_predefined_process",m.LeftRightArrow="left_right_arrow",m.Cloud="cloud",m.LeftBrace="left_brace",m.RightBrace="right_brace",m.Cross="cross",m.Can="can"})(Pe||(Pe={}));var z;(function(y){y.Gray="gray",y.LightYellow="light_yellow",y.Yellow="yellow",y.Orange="orange",y.LightGreen="light_green",y.Green="green",y.DarkGreen="dark_green",y.Cyan="cyan",y.LightPink="light_pink",y.Pink="pink",y.Violet="violet",y.Red="red",y.LightBlue="light_blue",y.Blue="blue",y.DarkBlue="dark_blue",y.Black="black"})(z||(z={}));var J;(function(h){h.Red="red",h.Magenta="magenta",h.Violet="violet",h.LightGreen="light_green",h.Green="green",h.DarkGreen="dark_green",h.Cyan="cyan",h.Blue="blue",h.DarkBlue="dark_blue",h.Yellow="yellow",h.Gray="gray",h.Black="black"})(J||(J={}));var _=class extends u{constructor(e,t){super(e);this.type="sticky_note";this.shape="square";this.content="";this.style={fillColor:z.LightYellow,textAlign:"center",textAlignVertical:"middle"};this.tagIds=[];p(this,t)}};o(_,"StickyNote");var I=class extends u{constructor(e,t){super(e);this.type="shape";this.content="";this.shape="rectangle";this.style={fillColor:"transparent",fontFamily:"arial",fontSize:14,textAlign:"center",textAlignVertical:"middle",borderStyle:"normal",borderOpacity:1,borderColor:"#1a1a1a",borderWidth:2,fillOpacity:1,color:"#1a1a1a"};p(this,t)}};o(I,"Shape");var x=class extends u{constructor(e,t){super(e);this.type="shape";this.content="";this.shape="rectangle";this.style={fillColor:"transparent",fontFamily:"arial",fontSize:14,textAlign:"center",textAlignVertical:"middle",borderStyle:"normal",borderOpacity:1,borderColor:"#1a1a1a",borderWidth:2,fillOpacity:1,color:"#1a1a1a"};p(this,t)}};o(x,"ShapeExperimental");var S=class extends u{constructor(e,t){super(e);this.type="image";this.title="";this.alt="";p(this,t),d(this,s,e)}async getFile(e="original"){let t={id:this.id,format:e},n=await this[s].exec("IMAGE_GET_BLOB",t);return new File([n],this.title,{lastModified:+this.modifiedAt})}async getDataUrl(e){let t=await this.getFile(e);return await xe(t)}};o(S,"Image");var D=class extends u{constructor(e,t){super(e);this.type="card";this.title="";this.description="";this.style={};this.dueDate=void 0;this.assignee=void 0;this.taskStatus="none";this.tagIds=[];this.fields=[];p(this,t)}};o(D,"Card");var O=class extends u{constructor(e,t){super(e);this.type="app_card";this.owned=!1;this.title="";this.description="";this.style={};this.tagIds=[];this.status="disconnected";this.fields=[];p(this,t)}};o(O,"AppCard");var M=class extends u{constructor(e,t){super(e);this.type="frame";this.title="";this.childrenIds=[];this.style={fillColor:"transparent"};p(this,t)}async add(e){this.childrenIds.push(e.id),await this.sync();let[t]=await w({id:e.id},this[s],b);return p(e,t),e}async remove(e){let t=e.id;if(!t)throw new Error("trying to remove a non-existent item from a frame");let n=this.childrenIds.findIndex(i=>i===t);if(n===-1)throw new Error(`Can't remove item ${t} from frame ${this.id}. The item is not a current child`);this.childrenIds.splice(n,1),await this.sync();let[a]=await w({id:e.id},this[s],b);p(e,a)}async getChildren(){let e=this.childrenIds;return e.length===0?[]:w({id:e},this[s],b)}};o(M,"Frame");var q=class extends u{constructor(e,t){super(e);this.type="unsupported";p(this,t)}};o(q,"Unsupported");var R=class extends u{constructor(e,t){super(e);this.type="preview";p(this,t)}};o(R,"Preview");var A=class extends u{constructor(e,t){super(e);this.type="embed";this.previewUrl="";this.mode="inline";p(this,t)}};o(A,"Embed");var k=class{constructor(e,t){this.type="connector";this.shape="curved";this.start=void 0;this.end=void 0;this.style={};this.captions=[];d(this,s,e),p(this,t)}async sync(){let e=await this[s].exec("WIDGET_UPDATE",this);p(this,e)}async getMetadata(e){return this[s].exec("WIDGET_GET_METADATA",{itemId:this.id,key:e})}async setMetadata(e,t){return this[s].exec("WIDGET_SET_METADATA",{itemId:this.id,key:e,value:t})}};o(k,"Connector");var He=o(r=>({type:"text",content:r.content,style:{}}),"viewTransformText"),We=o(r=>({type:"shape",shape:r.shape,content:r.content,style:{color:r.style.color,fillOpacity:r.style.fillOpacity,borderStyle:r.style.borderStyle}}),"viewTransformShape"),Ye=o(r=>r.type==="shape"?We(r):r.type==="text"?He(r):{},"transformNodeView"),N=class extends u{constructor(e,t){super(e);this.type="mindmap_node";p(this,t)}async sync(){return this.nodeView=Ye(this.nodeView),super.sync()}async add(e){this.childrenIds.push(e.id),await this.sync();let[t]=await w({id:e.id},this[s],b);return p(e,t),e}async getChildren(){let e=this.childrenIds;return e.length===0?[]:w({id:e},this[s],b)}};o(N,"MindmapNode");var K=class{constructor(e){this.type="mindmap_node";p(this,e)}};o(K,"MindmapNodeCreate");var F=class{constructor(e,t){this.type="tag";this.title="";this.color=J.Red;d(this,s,e),p(this,t)}async sync(){return this[s].exec("WIDGET_UPDATE",this).then(e=>{p(this,e)})}};o(F,"TagEntity");function f(r,e){switch(e.type){case"text":return new P(r,e);case"sticky_note":return new _(r,e);case"shape":return new I(r,e);case"image":return new S(r,e);case"frame":return new M(r,e);case"preview":return new R(r,e);case"card":return new D(r,e);case"app_card":return new O(r,e);case"embed":return new A(r,e);case"connector":return new k(r,e);case"tag":return new F(r,e);case"document":case"mockup":case"curve":case"webscreen":case"usm":case"mindmap":case"kanban":case"table":case"svg":case"emoji":case"mindmap_node":default:return new q(r,e)}}o(f,"convertToSdkFormat");function b(r,e){switch(e.type){case"shape":return new x(r,e);case"mindmap_node":return new N(r,e);default:return f(r,e)}}o(b,"convertToSdkFormatExperimental");var je="custom:",ge=o(r=>r.startsWith(je),"isCustomEvent"),E=class{constructor(e){this.commander=e;this.subscriptionsMap=new Map}async subscribe(e,t,n){this.addInternalHandler(e,t,n),this.commander.hasEventSubscriptions(e)||await this.commander.exec("UI_REGISTER_EVENT",{name:e}),this.commander.subscribe(e,n)}async unsubscribe(e,t){let n=this.subscriptionsMap.get(e),a=n?.get(t);!n||!a||(n.delete(t),this.commander.unsubscribe(e,a),this.commander.hasEventSubscriptions(e)||await this.commander.exec("UI_UNREGISTER_EVENT",{name:e}))}async unsubscribeAll(){this.subscriptionsMap.forEach((t,n)=>{t.forEach(a=>{this.commander.unsubscribe(n,a)})});let e=[...this.subscriptionsMap.keys()].filter(t=>!this.commander.hasEventSubscriptions(t)).map(t=>{this.commander.exec("UI_UNREGISTER_EVENT",{name:t})});return this.subscriptionsMap.clear(),Promise.all(e)}addInternalHandler(e,t,n){this.subscriptionsMap.has(e)||this.subscriptionsMap.set(e,new Map),this.subscriptionsMap.get(e)?.set(t,n)}};o(E,"EventManager");var $e=["drag","drop","dragend","dragstart"],Xe={"pointer-events":"none","user-select":"none","-webkit-user-select":"none","-webkit-touch-callout":"none"},Q=class{constructor(){this.listeners=[];this.originalBodyStyle={};this.dragStartPosition={x:-1/0,y:-1/0}}setDragStartPosition(e,t){this.dragStartPosition={x:e,y:t}}shouldDispatchDrag(e,t){return Math.abs(e-this.dragStartPosition.x)>Q.DRAG_THRESHOLD||Math.abs(t-this.dragStartPosition.y)>Q.DRAG_THRESHOLD}resetDragging(){throw new Error("Not implemented")}addListener(e,t,n){this.listeners.push({type:e,selector:t,handler:n})}removeListener(e,t,n){this.listeners=this.listeners.filter(a=>a.type!==e||t!=null&&a.selector!==t||n!=null&&a.handler!==n)}isDraggableElement(e){return!(e instanceof HTMLElement)&&!(e instanceof SVGElement)?!1:this.listeners.some(({selector:t})=>!!e.closest(t))}disableClickEvents(){Object.entries(Xe).forEach(([e,t])=>{this.originalBodyStyle[e]=document.body.style.getPropertyValue(e),document.body.style.setProperty(e,t)})}restoreClickEvents(){Object.entries(this.originalBodyStyle).forEach(([e,t])=>{document.body.style.setProperty(e,t)}),this.originalBodyStyle={}}dragEnd(e){this.dispatch("dragend",{target:e,clientX:NaN,clientY:NaN,screenX:NaN,screenY:NaN})}dispatch(e,t){this.listeners.forEach(({selector:n,handler:a,type:i})=>{if(e!==i)return;let l=t.target.closest(n);if(!l)return;let g=new CustomEvent(e,{detail:{...t,target:l,type:e}});a(g)})}},U=Q;o(U,"BaseDragSensor"),U.DRAG_THRESHOLD=8;var fe=class extends U{constructor(){super();this.isDragging=!1;this.onMouseDown=o(e=>{let t=e.target;!this.isDraggableElement(t)||(t.setAttribute("draggable","false"),this.target=t,this.setDragStartPosition(e.clientX,e.clientY),document.addEventListener("mouseup",this.onMouseUp),document.addEventListener("mousemove",this.onMouseMove,{passive:!0}))},"onMouseDown");this.onMouseMove=o(e=>{if(!this.target)return;let{clientX:t,clientY:n,screenX:a,screenY:i}=e;if(!this.isDragging&&!this.shouldDispatchDrag(t,n))return;let l=this.isDragging?"drag":"dragstart";this.isDragging||this.disableClickEvents(),this.isDragging=!0,this.dispatch(l,{target:this.target,clientX:t,clientY:n,screenX:a,screenY:i})},"onMouseMove");this.onMouseUp=o(e=>{if(e.preventDefault(),this.isDragging&&this.target){let{clientX:t,clientY:n,screenX:a,screenY:i}=e;this.dispatch("drop",{target:this.target,clientX:t,clientY:n,screenX:a,screenY:i})}window.requestAnimationFrame(()=>this.resetDragging())},"onMouseUp");this.resetDragging=o(()=>{document.removeEventListener("mouseup",this.onMouseUp),document.removeEventListener("mousemove",this.onMouseMove),this.isDragging&&this.target&&this.dragEnd(this.target),this.target&&this.restoreClickEvents(),this.isDragging=!1,this.target=void 0},"resetDragging");document.addEventListener("mousedown",this.onMouseDown),window.addEventListener("blur",this.resetDragging)}};o(fe,"MouseDragSensor");var ze=100,V=!1;window.addEventListener("touchmove",r=>{!V||r.preventDefault()},{passive:!1});var we=class extends U{constructor(){super();this.onTouchStart=o(e=>{let{target:t}=e;if(!this.isDraggableElement(t))return;let{clientX:n,clientY:a,screenX:i,screenY:l}=e.touches[0];this.setDragStartPosition(n,a),t.setAttribute("draggable","false"),this.target=t,this.tapTimeout=window.setTimeout(()=>{this.startDragging({target:t,clientX:n,clientY:a,screenX:i,screenY:l})},ze),window.addEventListener("touchend",this.onTouchEnd),window.addEventListener("touchcancel",this.resetDragging),window.addEventListener("touchmove",this.resetDragging)},"onTouchStart");this.onTouchMove=o(e=>{if(!this.target)return;let{clientX:t,clientY:n,screenX:a,screenY:i}=e.touches[0];this.dispatch("drag",{target:this.target,clientX:t,clientY:n,screenX:a,screenY:i})},"onTouchMove");this.onTouchEnd=o(e=>{if(V&&this.target){let{clientX:n,clientY:a,screenX:i,screenY:l}=e.changedTouches[0];this.dispatch("dragend",{target:this.target,clientX:n,clientY:a,screenX:i,screenY:l})}window.requestAnimationFrame(()=>this.resetDragging())},"onTouchEnd");this.startDragging=o(e=>{!this.shouldDispatchDrag(e.clientX,e.clientY)||(window.removeEventListener("touchmove",this.resetDragging),window.addEventListener("touchmove",this.onTouchMove,{passive:!0}),V=!0,this.disableClickEvents(),this.dispatch("dragstart",e))},"startDragging");this.resetDragging=o(()=>{window.removeEventListener("touchend",this.onTouchEnd),window.removeEventListener("touchcancel",this.resetDragging),window.removeEventListener("touchmove",this.resetDragging),window.removeEventListener("touchmove",this.onTouchMove),V&&this.target&&(this.restoreClickEvents(),this.dragEnd(this.target)),this.target=void 0,V=!1,this.tapTimeout!==void 0&&(clearTimeout(this.tapTimeout),this.tapTimeout=void 0)},"resetDragging");window.addEventListener("touchstart",this.onTouchStart),window.addEventListener("blur",this.resetDragging)}};o(we,"TouchDragSensor");var Z=class{constructor(e){this.touchSensor=new we,this.mouseSensor=new fe,Object.assign(this,e)}addListener(e,t){this.mouseSensor.addListener(e,this.selector,t),this.touchSensor.addListener(e,this.selector,t)}removeListener(e,t){this.mouseSensor.removeListener(e,void 0,t),this.touchSensor.removeListener(e,void 0,t)}reset(){$e.forEach(e=>{this.mouseSensor.removeListener(e),this.touchSensor.removeListener(e)})}resetDragging(){this.mouseSensor.resetDragging(),this.touchSensor.resetDragging()}};o(Z,"DragSensor");var v,_e=o(()=>{v?.reset(),v=new Z({selector:".miro-draggable"})},"initDragSensor");var ee="internal:drop",H=new Set,C=new Map,W;async function Ie(r){let e=r.payload;if(e==null)return;let{x:t,y:n}=e,a={x:t,y:n,target:W};H.forEach(i=>i(a)),v.resetDragging()}o(Ie,"handleInternalDrop");var Je=o(r=>async e=>{let{clientX:t,clientY:n,target:a}=e.detail;W=a;let i=W.dataset.dragPreview,l=parseInt(W.dataset.dragPreviewWidth??"",10),g=parseInt(W.dataset.dragPreviewHeight??"",10);await r.exec("UI_DRAG_START",{clientX:t,clientY:n,dragImage:i?{width:l===Number.NaN?void 0:l,height:g===Number.NaN?void 0:g,src:i}:void 0})},"onDragStart"),be,Ke=o(r=>async e=>{if(be)return;be=requestAnimationFrame(()=>{be=void 0});let{clientX:t,clientY:n}=e.detail;await r.exec("UI_DRAG_MOVE",{clientX:t,clientY:n})},"onDrag"),Ze=o(r=>async e=>{let{clientX:t,clientY:n}=e.detail;await r.exec("UI_DRAG_DROP",{clientX:t,clientY:n})},"onDrop"),Qe=o(r=>async e=>{await r.exec("UI_DRAG_END")},"onDragEnd");async function Se(r,e){H.size==0&&(await r.exec("UI_REGISTER_EVENT",{name:ee}),r.subscribe(ee,Ie),C.set("dragstart",Je(r)),C.set("drag",Ke(r)),C.set("dragend",Qe(r)),C.set("drop",Ze(r)),v.addListener("dragstart",C.get("dragstart")),v.addListener("drag",C.get("drag")),v.addListener("dragend",C.get("dragend")),v.addListener("drop",C.get("drop"))),H.add(e)}o(Se,"attachDragAndDropListeners");async function De(r,e){H.delete(e),H.size===0&&(v.removeListener("dragstart",C.get("dragstart")),v.removeListener("drag",C.get("drag")),v.removeListener("dragend",C.get("drag")),v.removeListener("drop",C.get("drop")),r.unsubscribe(ee,Ie),await r.exec("UI_UNREGISTER_EVENT",{name:ee}))}o(De,"detachDragAndDropListeners");var te=class{constructor(e){d(this,s,e),d(this,c,new E(e))}async openPanel(e){await this[s].exec("UI_OPEN_PANEL",e);let t=this[s].exec("UI_WAIT_FOR_PANEL_CLOSE",e);return{waitForClose:()=>t}}async getPanelData(){return this[s].exec("UI_GET_PANEL_DATA")}async closePanel(e){await this[s].exec("UI_CLOSE_PANEL",{result:e})}async openModal(e){await this[s].exec("UI_OPEN_MODAL",e);let t=this[s].exec("UI_WAIT_FOR_MODAL_CLOSE",e);return{waitForClose:()=>t}}async getModalData(){return this[s].exec("UI_GET_MODAL_DATA")}async closeModal(e){await this[s].exec("UI_CLOSE_MODAL",{result:e})}on(e,t){switch(e){case"drop":return Se(this[s],t),Promise.resolve();case"icon:click":return this[c].subscribe(e,t,async()=>t());case"app_card:open":return this[c].subscribe(e,t,async n=>{let{appCard:a}=n.payload,i={appCard:f(this[s],a)};t(i)});case"app_card:connect":return this[c].subscribe(e,t,async n=>{let{appCard:a}=n.payload,i={appCard:f(this[s],a)};t(i)});case"selection:update":return this[c].subscribe(e,t,async n=>{let{items:a}=n.payload,i={items:a.map(l=>f(this[s],l))};t(i)});case"online_users:update":return this[c].subscribe(e,t,async n=>{let a=n.payload;t(a)});case"items:create":return this[c].subscribe(e,t,async n=>{let{items:a}=n.payload,i={items:a.map(l=>f(this[s],l))};t(i)});case"experimental:items:update":return this[c].subscribe(e,t,async n=>{let{items:a}=n.payload,i={items:a.map(l=>f(this[s],l))};t(i)});case"items:delete":return this[c].subscribe(e,t,async n=>{let{items:a}=n.payload,i={items:a.map(l=>f(this[s],l))};t(i)});case"experimental:timer:start":case"experimental:timer:update":case"experimental:timer:finish":return this[c].subscribe(e,t,async n=>{t(n.payload)});default:if(ge(e)){let n=o(async a=>{let{items:i}=a.payload,l={items:i.map(g=>f(this[s],g))};t(l)},"internalHandler");return this[c].subscribe(e,t,n)}throw new Error(`unknown event: ${e}`)}}off(e,t){switch(e){case"drop":return De(this[s],t),Promise.resolve();case"icon:click":case"app_card:open":case"app_card:connect":case"selection:update":case"online_users:update":case"items:create":case"experimental:items:update":case"items:delete":case"experimental:timer:start":case"experimental:timer:update":case"experimental:timer:finish":return this[c].unsubscribe(e,t);default:if(ge(e))return this[c].unsubscribe(e,t);throw new Error(`unknown event: ${e}`)}}};o(te,"BoardUI");var Oe;(function(r){r.Red="red",r.Magenta="magenta",r.Violet="violet",r.LightGreen="light_green",r.Green="green",r.DarkGreen="dark_green",r.Cyan="cyan",r.Blue="blue",r.DarkBlue="dark_blue",r.Yellow="yellow",r.Gray="gray",r.Black="black"})(Oe||(Oe={}));var Me;(function(r){r.Gray="gray",r.LightYellow="light_yellow",r.Yellow="yellow",r.Orange="orange",r.LightGreen="light_green",r.Green="green",r.DarkGreen="dark_green",r.Cyan="cyan",r.LightPink="light_pink",r.Pink="pink",r.Violet="violet",r.Red="red",r.LightBlue="light_blue",r.Blue="blue",r.DarkBlue="dark_blue",r.Black="black"})(Me||(Me={}));var Re;(function(r){r.Rectangle="rectangle",r.Circle="circle",r.Triangle="triangle",r.WedgeRoundRectangleCallout="wedge_round_rectangle_callout",r.RoundRectangle="round_rectangle",r.Rhombus="rhombus",r.Parallelogram="parallelogram",r.Star="star",r.RightArrow="right_arrow",r.LeftArrow="left_arrow",r.Pentagon="pentagon",r.Hexagon="hexagon",r.Octagon="octagon",r.Trapezoid="trapezoid",r.FlowChartPredefinedProcess="flow_chart_predefined_process",r.LeftRightArrow="left_right_arrow",r.Cloud="cloud",r.LeftBrace="left_brace",r.RightBrace="right_brace",r.Cross="cross",r.Can="can"})(Re||(Re={}));var Ae;(function(r){r.Rectangle="rectangle",r.Circle="circle",r.Triangle="triangle",r.WedgeRoundRectangleCallout="wedge_round_rectangle_callout",r.RoundRectangle="round_rectangle",r.Rhombus="rhombus",r.Parallelogram="parallelogram",r.Star="star",r.RightArrow="right_arrow",r.LeftArrow="left_arrow",r.Pentagon="pentagon",r.Hexagon="hexagon",r.Octagon="octagon",r.Trapezoid="trapezoid",r.FlowChartPredefinedProcess="flow_chart_predefined_process",r.LeftRightArrow="left_right_arrow",r.Cloud="cloud",r.LeftBrace="left_brace",r.RightBrace="right_brace",r.Cross="cross",r.Can="can",r.FlowChartConnector="flow_chart_connector",r.FlowChartMagneticDisk="flow_chart_magnetic_disk",r.FlowChartInputOutput="flow_chart_input_output",r.FlowChartDecision="flow_chart_decision",r.FlowChartDelay="flow_chart_delay",r.FlowChartDisplay="flow_chart_display",r.FlowChartDocument="flow_chart_document",r.FlowChartMagneticDrum="flow_chart_magnetic_drum",r.FlowChartInternalStorage="flow_chart_internal_storage",r.FlowChartManualInput="flow_chart_manual_input",r.FlowChartManualOperation="flow_chart_manual_operation",r.FlowChartMerge="flow_chart_merge",r.FlowChartMultidocument="flow_chart_multidocument",r.FlowChartNoteCurlyLeft="flow_chart_note_curly_left",r.FlowChartNoteCurlyRight="flow_chart_note_curly_right",r.FlowChartNoteSquare="flow_chart_note_square",r.FlowChartOffpageConnector="flow_chart_offpage_connector",r.FlowChartOr="flow_chart_or",r.FlowChartPredefinedProcess2="flow_chart_predefined_process_2",r.FlowChartPreparation="flow_chart_preparation",r.FlowChartProcess="flow_chart_process",r.FlowChartOnlineStorage="flow_chart_online_storage",r.FlowChartSummingJunction="flow_chart_summing_junction",r.FlowChartTerminator="flow_chart_terminator"})(Ae||(Ae={}));var Y;(function(r){r.Error="error",r.Info="info"})(Y||(Y={}));var re=class{constructor(e){d(this,s,e)}async showInfo(e){let t={message:e,type:Y.Info};await this[s].exec("SHOW_NOTIFICATION",t)}async showError(e){let t={message:e,type:Y.Error};await this[s].exec("SHOW_NOTIFICATION",t)}async show(e){await this[s].exec("SHOW_NOTIFICATION",e)}};o(re,"Notifications");var se=class{constructor(e){d(this,s,e)}async get(){return this[s].exec("VIEWPORT_GET")}async set(e){return this[s].exec("VIEWPORT_SET",e)}async zoomTo(e){return Array.isArray(e)?this[s].exec("VIEWPORT_ZOOM_TO",{items:e.map(t=>t.id)}):this.zoomTo([e])}async getZoom(){return this[s].exec("VIEWPORT_GET_ZOOM")}async setZoom(e){return this[s].exec("VIEWPORT_SET_ZOOM",{zoomLevel:e})}};o(se,"Viewport");var ke=o(r=>`realtime_event:${r}`,"prefixed"),ne=class{constructor(e){d(this,s,e),d(this,c,new E(e))}async broadcast(e,t){await this[s].exec("SEND_REALTIME_BROADCAST_EVENT",{event:e,payload:t})}on(e,t){let n=o(async i=>{t(i.payload)},"internalHandler"),a=ke(e);return this[c].subscribe(a,t,n)}off(e,t){let n=ke(e);return this[c].unsubscribe(n,t)}};o(ne,"RealtimeEvents");var Ne=o((r,e)=>`storage:change:${r}:${e}`,"prefixed"),Ee=class{constructor(e,t,n){this.name=e;d(this,s,t),d(this,c,n)}async set(e,t){return this[s].exec("STORAGE_SET",{collection:this.name,key:e,value:t})}async get(e){return(await this[s].exec("STORAGE_GET",{collection:this.name,key:e})).value}async remove(e){return this[s].exec("STORAGE_REMOVE",{collection:this.name,key:e})}async onValue(e,t){let n=await this[s].exec("STORAGE_GET",{collection:this.name,key:e});t(n?.value,n?.version);let a=o(async l=>{let{value:g,version:ce}=l.payload;return t(g,ce)},"internalHandler"),i=Ne(this.name,e);return this[c].subscribe(i,t,a)}async offValue(e,t){let n=Ne(this.name,e);return this[c].unsubscribe(n,t)}};o(Ee,"Collection");var oe=class{constructor(e){d(this,s,e),d(this,c,new E(e))}collection(e){return new Ee(e,this[s],this[c])}};o(oe,"Storage");var ae=class{constructor(e){d(this,s,e)}async follow(e,t={}){let n={followee:e,...t};await this[s].exec("ATTENTION_FOLLOW",n)}async isFollowing(){return this[s].exec("ATTENTION_IS_FOLLOWING")}async getFollowedUser(){return this[s].exec("ATTENTION_GET_FOLLOWED_USER")}async unfollow(e){await this[s].exec("ATTENTION_UNFOLLOW",e)}};o(ae,"Attention");var zs=new Map,j=class{constructor(e,t,n,a,i,l,g){this.id=e;this.name=t;this.description=n;this.color=a;this.starterId=i;this.starterName=l;d(this,s,g),d(this,c,new E(g))}async invite(...e){await this[s].exec("SESSIONS_INVITE_USERS",{sessionId:this.id,userIds:e.flat().map(t=>t.id)})}async join(){await this[s].exec("SESSIONS_JOIN",{sessionId:this.id})}async leave(){await this[s].exec("SESSIONS_LEAVE",{sessionId:this.id})}getUsers(){throw new Error("Method not implemented.")}async hasJoined(e){return this[s].exec("SESSIONS_USER_JOINED",{sessionId:this.id,userId:e})}async on(e,t){if(e!=="user-left"&&e!=="user-joined"&&e!=="invitation-responded")return;let n=o(async i=>{i.payload.sessionId===this.id&&await t(i.payload)},"wrappedHandler"),a=`sessions:${e}`;await this[c].subscribe(a,t,n)}async off(e,t){if(e!=="user-left"&&e!=="user-joined"&&e!=="invitation-responded")return;let n=`sessions:${e}`;await this[c].unsubscribe(n,t)}async end(){await this[s].exec("SESSIONS_END",{id:this.id}),await this[c].unsubscribeAll()}};o(j,"Session");var ie=class{constructor(e){this.attention=new ae(e),d(this,s,e),d(this,c,new E(e))}async startSession(e){let t=await this[s].exec("SESSIONS_START",e);return new j(t.id,t.name,t.description,t.color,t.starterId,t.starterName,this[s])}async getSessions(){return(await this[s].exec("SESSIONS_GET")).map(t=>new j(t.id,t.name,t.description,t.color,t.starterId,t.starterName,this[s]))}async on(e,t){if(e!=="sessions:started"&&e!=="sessions:ended")throw new Error(`${e} does not exist`);let n=o(async a=>{await t(a.payload)},"wrappedHandler");return this[c].subscribe(e,t,n)}async off(e,t){if(e!=="sessions:started"&&e!=="sessions:ended")throw new Error(`${e} does not exist`);return this[c].unsubscribe(e,t)}async zoomTo(e,t){return Array.isArray(t)?this[s].exec("COLLABORATION_VIEWPORT_ZOOM_TO",{items:t.map(n=>n.id),user:e}):this.zoomTo(e,[t])}};o(ie,"Collaboration");async function T(r,e){let t=Te(r),n=await e.exec("WIDGET_CREATE",t);return p(r,n),r}o(T,"add");var me=class{constructor(e,t){d(this,s,e),this.ui=new te(e),this.notifications=new re(e),this.viewport=new se(e),this.storage=new oe(e),this.experimental=t,this.events=new ne(e),this.collaboration=new ie(this[s])}async createCard(e){return T(new D(this[s],e),this[s])}async createAppCard(e){return T(new O(this[s],e),this[s])}async createFrame(e){return T(new M(this[s],e),this[s])}async createImage(e){return T(new S(this[s],e),this[s])}async createPreview(e){return T(new R(this[s],e),this[s])}async createShape(e){return T(new I(this[s],e),this[s])}async createStickyNote(e){return T(new _(this[s],e),this[s])}async createText(e){return T(new P(this[s],e),this[s])}async createEmbed(e){return T(new A(this[s],e),this[s])}async createConnector(e){return T(new k(this[s],e),this[s])}async createTag(e){return T(new F(this[s],e),this[s])}async sync(e){return e.sync()}async remove(e){let{id:t,type:n}=e;await this[s].exec("WIDGET_REMOVE",{id:t,type:n})}async bringToFront(e){return Array.isArray(e)?this[s].exec("BRING_TO_FRONT",{items:e.map(t=>t.id)}):this.bringToFront([e])}async sendToBack(e){return Array.isArray(e)?this[s].exec("SEND_TO_BACK",{items:e.map(t=>t.id)}):this.sendToBack([e])}async bringInFrontOf(e,t){return Array.isArray(e)?this[s].exec("BRING_IN_FRONT_OF",{items:e.map(n=>n.id),targetId:t.id}):this.bringInFrontOf([e],t)}async sendBehindOf(e,t){return Array.isArray(e)?this[s].exec("SEND_BEHIND_OF",{items:e.map(n=>n.id),targetId:t.id}):this.sendBehindOf([e],t)}async getLayerIndex(e){return e.getLayerIndex()}async getById(e){let t=await this.get({id:e});if(Array.isArray(t)&&t.length)return f(this[s],t[0]);throw new Error(`Can not retrieve item with id ${e}`)}async get(e){return w(e,this[s],f)}async getInfo(){return this[s].exec("GET_BOARD_INFO")}async getUserInfo(){return this[s].exec("GET_USER_INFO")}async getSelection(){return(await this[s].exec("GET_SELECTION")).map(t=>f(this[s],t))}async getOnlineUsers(){return this[s].exec("GET_ONLINE_USERS")}async select(e){return(await this[s].exec("SELECT_WIDGETS",e)).map(n=>f(this[s],n))}async deselect(e){return(await this[s].exec("DESELECT_WIDGETS",e)).map(n=>f(this[s],n))}async getAppData(e){return this[s].exec("GET_BOARD_APP_DATA",{key:e})}async setAppData(e,t){return this[s].exec("SET_BOARD_APP_DATA",{key:e,value:t})}async setMetadata(e,t,n){return e.setMetadata(t,n)}async getMetadata(e,t){return e.getMetadata(t)}async goToLink(e){return e.goToLink()}async getIdToken(){return this[s].exec("GET_ID_TOKEN")}};o(me,"Board");var de=class{constructor(e){d(this,s,e)}async start(e){let t={duration:e};await this[s].exec("TIMER_START",t)}async stop(){return this[s].exec("TIMER_STOP")}async pause(){return this[s].exec("TIMER_PAUSE")}async resume(){return this[s].exec("TIMER_RESUME")}async prolong(e){let t={duration:e};return this[s].exec("TIMER_PROLONG",t)}async isStarted(){return this[s].exec("TIMER_IS_STARTED")}};o(de,"Timer");var pe=class{constructor(e){d(this,s,e)}async register(e){return this[s].exec("CUSTOM_ACTION_REGISTER",e)}async deregister(e){await this[s].exec("CUSTOM_ACTION_DEREGISTER",e)}};o(pe,"CustomActionManagement");var le=class{constructor(e){d(this,s,e),this.timer=new de(e),this.action=new pe(e)}async createMindmapNode(e){let t=await this[s].exec("WIDGET_CREATE",new K(e));return new N(this[s],t)}async createShape(e){let t=await this[s].exec("WIDGET_CREATE",new x(this[s],e));return new x(this[s],t)}async get(e){return w(e,this[s],b)}async select(e){return(await this[s].exec("SELECT_WIDGETS",e)).map(n=>b(this[s],n))}async deselect(e){return(await this[s].exec("DESELECT_WIDGETS",e)).map(n=>b(this[s],n))}async getSelection(){return(await this[s].exec("GET_SELECTION")).map(t=>b(this[s],t))}async getVotingResults(){return this[s].exec("GET_VOTING_RESULTS")}async sync(e){return e.sync()}async remove(e){let{id:t,type:n}=e;await this[s].exec("WIDGET_REMOVE",{id:t,type:n})}async findEmptySpace(e){return this[s].exec("FIND_EMPTY_SPACE",e)}};o(le,"Experimental");var Fe="1.55232.9438701",Ce=new G(window),et=new B(Ce,"experimental"),tt=new le(et),rt=new me(Ce,tt);Ce.exec("handshake",{clientVersion:Fe});_e();new URLSearchParams(location.search).has("autotest")&&console.log("SDKv2 loaded for client version: 1.55232.9438701 and git commit: f47c124405f4c4df65cb6936d0c432f2b1a03606");return st;})();
