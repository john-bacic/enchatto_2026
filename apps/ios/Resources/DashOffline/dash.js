"use strict";(()=>{var _M=Object.create;var sg=Object.defineProperty;var MM=Object.getOwnPropertyDescriptor;var SM=Object.getOwnPropertyNames;var wM=Object.getPrototypeOf,bM=Object.prototype.hasOwnProperty;var qi=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var EM=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of SM(e))!bM.call(n,r)&&r!==t&&sg(n,r,{get:()=>e[r],enumerable:!(i=MM(e,r))||i.enumerable});return n};var pn=(n,e,t)=>(t=n!=null?_M(wM(n)):{},EM(e||!n||!n.__esModule?sg(t,"default",{value:n,enumerable:!0}):t,n));var yg=qi(Ye=>{"use strict";var fa=Symbol.for("react.element"),TM=Symbol.for("react.portal"),AM=Symbol.for("react.fragment"),RM=Symbol.for("react.strict_mode"),CM=Symbol.for("react.profiler"),PM=Symbol.for("react.provider"),IM=Symbol.for("react.context"),LM=Symbol.for("react.forward_ref"),kM=Symbol.for("react.suspense"),NM=Symbol.for("react.memo"),DM=Symbol.for("react.lazy"),og=Symbol.iterator;function UM(n){return n===null||typeof n!="object"?null:(n=og&&n[og]||n["@@iterator"],typeof n=="function"?n:null)}var cg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ug=Object.assign,hg={};function Xs(n,e,t){this.props=n,this.context=e,this.refs=hg,this.updater=t||cg}Xs.prototype.isReactComponent={};Xs.prototype.setState=function(n,e){if(typeof n!="object"&&typeof n!="function"&&n!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,n,e,"setState")};Xs.prototype.forceUpdate=function(n){this.updater.enqueueForceUpdate(this,n,"forceUpdate")};function fg(){}fg.prototype=Xs.prototype;function Vh(n,e,t){this.props=n,this.context=e,this.refs=hg,this.updater=t||cg}var Gh=Vh.prototype=new fg;Gh.constructor=Vh;ug(Gh,Xs.prototype);Gh.isPureReactComponent=!0;var ag=Array.isArray,dg=Object.prototype.hasOwnProperty,Wh={current:null},pg={key:!0,ref:!0,__self:!0,__source:!0};function mg(n,e,t){var i,r={},s=null,o=null;if(e!=null)for(i in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)dg.call(e,i)&&!pg.hasOwnProperty(i)&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=t;else if(1<a){for(var l=Array(a),c=0;c<a;c++)l[c]=arguments[c+2];r.children=l}if(n&&n.defaultProps)for(i in a=n.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return{$$typeof:fa,type:n,key:s,ref:o,props:r,_owner:Wh.current}}function zM(n,e){return{$$typeof:fa,type:n.type,key:e,ref:n.ref,props:n.props,_owner:n._owner}}function Xh(n){return typeof n=="object"&&n!==null&&n.$$typeof===fa}function OM(n){var e={"=":"=0",":":"=2"};return"$"+n.replace(/[=:]/g,function(t){return e[t]})}var lg=/\/+/g;function Hh(n,e){return typeof n=="object"&&n!==null&&n.key!=null?OM(""+n.key):e.toString(36)}function jl(n,e,t,i,r){var s=typeof n;(s==="undefined"||s==="boolean")&&(n=null);var o=!1;if(n===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(n.$$typeof){case fa:case TM:o=!0}}if(o)return o=n,r=r(o),n=i===""?"."+Hh(o,0):i,ag(r)?(t="",n!=null&&(t=n.replace(lg,"$&/")+"/"),jl(r,e,t,"",function(c){return c})):r!=null&&(Xh(r)&&(r=zM(r,t+(!r.key||o&&o.key===r.key?"":(""+r.key).replace(lg,"$&/")+"/")+n)),e.push(r)),1;if(o=0,i=i===""?".":i+":",ag(n))for(var a=0;a<n.length;a++){s=n[a];var l=i+Hh(s,a);o+=jl(s,e,t,l,r)}else if(l=UM(n),typeof l=="function")for(n=l.call(n),a=0;!(s=n.next()).done;)s=s.value,l=i+Hh(s,a++),o+=jl(s,e,t,l,r);else if(s==="object")throw e=String(n),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function ql(n,e,t){if(n==null)return n;var i=[],r=0;return jl(n,i,"","",function(s){return e.call(t,s,r++)}),i}function FM(n){if(n._status===-1){var e=n._result;e=e(),e.then(function(t){(n._status===0||n._status===-1)&&(n._status=1,n._result=t)},function(t){(n._status===0||n._status===-1)&&(n._status=2,n._result=t)}),n._status===-1&&(n._status=0,n._result=e)}if(n._status===1)return n._result.default;throw n._result}var mn={current:null},$l={transition:null},BM={ReactCurrentDispatcher:mn,ReactCurrentBatchConfig:$l,ReactCurrentOwner:Wh};function gg(){throw Error("act(...) is not supported in production builds of React.")}Ye.Children={map:ql,forEach:function(n,e,t){ql(n,function(){e.apply(this,arguments)},t)},count:function(n){var e=0;return ql(n,function(){e++}),e},toArray:function(n){return ql(n,function(e){return e})||[]},only:function(n){if(!Xh(n))throw Error("React.Children.only expected to receive a single React element child.");return n}};Ye.Component=Xs;Ye.Fragment=AM;Ye.Profiler=CM;Ye.PureComponent=Vh;Ye.StrictMode=RM;Ye.Suspense=kM;Ye.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=BM;Ye.act=gg;Ye.cloneElement=function(n,e,t){if(n==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+n+".");var i=ug({},n.props),r=n.key,s=n.ref,o=n._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Wh.current),e.key!==void 0&&(r=""+e.key),n.type&&n.type.defaultProps)var a=n.type.defaultProps;for(l in e)dg.call(e,l)&&!pg.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&a!==void 0?a[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=t;else if(1<l){a=Array(l);for(var c=0;c<l;c++)a[c]=arguments[c+2];i.children=a}return{$$typeof:fa,type:n.type,key:r,ref:s,props:i,_owner:o}};Ye.createContext=function(n){return n={$$typeof:IM,_currentValue:n,_currentValue2:n,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},n.Provider={$$typeof:PM,_context:n},n.Consumer=n};Ye.createElement=mg;Ye.createFactory=function(n){var e=mg.bind(null,n);return e.type=n,e};Ye.createRef=function(){return{current:null}};Ye.forwardRef=function(n){return{$$typeof:LM,render:n}};Ye.isValidElement=Xh;Ye.lazy=function(n){return{$$typeof:DM,_payload:{_status:-1,_result:n},_init:FM}};Ye.memo=function(n,e){return{$$typeof:NM,type:n,compare:e===void 0?null:e}};Ye.startTransition=function(n){var e=$l.transition;$l.transition={};try{n()}finally{$l.transition=e}};Ye.unstable_act=gg;Ye.useCallback=function(n,e){return mn.current.useCallback(n,e)};Ye.useContext=function(n){return mn.current.useContext(n)};Ye.useDebugValue=function(){};Ye.useDeferredValue=function(n){return mn.current.useDeferredValue(n)};Ye.useEffect=function(n,e){return mn.current.useEffect(n,e)};Ye.useId=function(){return mn.current.useId()};Ye.useImperativeHandle=function(n,e,t){return mn.current.useImperativeHandle(n,e,t)};Ye.useInsertionEffect=function(n,e){return mn.current.useInsertionEffect(n,e)};Ye.useLayoutEffect=function(n,e){return mn.current.useLayoutEffect(n,e)};Ye.useMemo=function(n,e){return mn.current.useMemo(n,e)};Ye.useReducer=function(n,e,t){return mn.current.useReducer(n,e,t)};Ye.useRef=function(n){return mn.current.useRef(n)};Ye.useState=function(n){return mn.current.useState(n)};Ye.useSyncExternalStore=function(n,e,t){return mn.current.useSyncExternalStore(n,e,t)};Ye.useTransition=function(){return mn.current.useTransition()};Ye.version="18.3.1"});var da=qi((XC,vg)=>{"use strict";vg.exports=yg()});var Rg=qi(ht=>{"use strict";function $h(n,e){var t=n.length;n.push(e);e:for(;0<t;){var i=t-1>>>1,r=n[i];if(0<Zl(r,e))n[i]=e,n[t]=r,t=i;else break e}}function di(n){return n.length===0?null:n[0]}function Jl(n){if(n.length===0)return null;var e=n[0],t=n.pop();if(t!==e){n[0]=t;e:for(var i=0,r=n.length,s=r>>>1;i<s;){var o=2*(i+1)-1,a=n[o],l=o+1,c=n[l];if(0>Zl(a,t))l<r&&0>Zl(c,a)?(n[i]=c,n[l]=t,i=l):(n[i]=a,n[o]=t,i=o);else if(l<r&&0>Zl(c,t))n[i]=c,n[l]=t,i=l;else break e}}return e}function Zl(n,e){var t=n.sortIndex-e.sortIndex;return t!==0?t:n.id-e.id}typeof performance=="object"&&typeof performance.now=="function"?(xg=performance,ht.unstable_now=function(){return xg.now()}):(Yh=Date,_g=Yh.now(),ht.unstable_now=function(){return Yh.now()-_g});var xg,Yh,_g,Ii=[],Sr=[],HM=1,Qn=null,tn=3,Ql=!1,as=!1,ma=!1,wg=typeof setTimeout=="function"?setTimeout:null,bg=typeof clearTimeout=="function"?clearTimeout:null,Mg=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Zh(n){for(var e=di(Sr);e!==null;){if(e.callback===null)Jl(Sr);else if(e.startTime<=n)Jl(Sr),e.sortIndex=e.expirationTime,$h(Ii,e);else break;e=di(Sr)}}function Kh(n){if(ma=!1,Zh(n),!as)if(di(Ii)!==null)as=!0,Qh(Jh);else{var e=di(Sr);e!==null&&ef(Kh,e.startTime-n)}}function Jh(n,e){as=!1,ma&&(ma=!1,bg(ga),ga=-1),Ql=!0;var t=tn;try{for(Zh(e),Qn=di(Ii);Qn!==null&&(!(Qn.expirationTime>e)||n&&!Ag());){var i=Qn.callback;if(typeof i=="function"){Qn.callback=null,tn=Qn.priorityLevel;var r=i(Qn.expirationTime<=e);e=ht.unstable_now(),typeof r=="function"?Qn.callback=r:Qn===di(Ii)&&Jl(Ii),Zh(e)}else Jl(Ii);Qn=di(Ii)}if(Qn!==null)var s=!0;else{var o=di(Sr);o!==null&&ef(Kh,o.startTime-e),s=!1}return s}finally{Qn=null,tn=t,Ql=!1}}var ec=!1,Kl=null,ga=-1,Eg=5,Tg=-1;function Ag(){return!(ht.unstable_now()-Tg<Eg)}function qh(){if(Kl!==null){var n=ht.unstable_now();Tg=n;var e=!0;try{e=Kl(!0,n)}finally{e?pa():(ec=!1,Kl=null)}}else ec=!1}var pa;typeof Mg=="function"?pa=function(){Mg(qh)}:typeof MessageChannel<"u"?(jh=new MessageChannel,Sg=jh.port2,jh.port1.onmessage=qh,pa=function(){Sg.postMessage(null)}):pa=function(){wg(qh,0)};var jh,Sg;function Qh(n){Kl=n,ec||(ec=!0,pa())}function ef(n,e){ga=wg(function(){n(ht.unstable_now())},e)}ht.unstable_IdlePriority=5;ht.unstable_ImmediatePriority=1;ht.unstable_LowPriority=4;ht.unstable_NormalPriority=3;ht.unstable_Profiling=null;ht.unstable_UserBlockingPriority=2;ht.unstable_cancelCallback=function(n){n.callback=null};ht.unstable_continueExecution=function(){as||Ql||(as=!0,Qh(Jh))};ht.unstable_forceFrameRate=function(n){0>n||125<n?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Eg=0<n?Math.floor(1e3/n):5};ht.unstable_getCurrentPriorityLevel=function(){return tn};ht.unstable_getFirstCallbackNode=function(){return di(Ii)};ht.unstable_next=function(n){switch(tn){case 1:case 2:case 3:var e=3;break;default:e=tn}var t=tn;tn=e;try{return n()}finally{tn=t}};ht.unstable_pauseExecution=function(){};ht.unstable_requestPaint=function(){};ht.unstable_runWithPriority=function(n,e){switch(n){case 1:case 2:case 3:case 4:case 5:break;default:n=3}var t=tn;tn=n;try{return e()}finally{tn=t}};ht.unstable_scheduleCallback=function(n,e,t){var i=ht.unstable_now();switch(typeof t=="object"&&t!==null?(t=t.delay,t=typeof t=="number"&&0<t?i+t:i):t=i,n){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=t+r,n={id:HM++,callback:e,priorityLevel:n,startTime:t,expirationTime:r,sortIndex:-1},t>i?(n.sortIndex=t,$h(Sr,n),di(Ii)===null&&n===di(Sr)&&(ma?(bg(ga),ga=-1):ma=!0,ef(Kh,t-i))):(n.sortIndex=r,$h(Ii,n),as||Ql||(as=!0,Qh(Jh))),n};ht.unstable_shouldYield=Ag;ht.unstable_wrapCallback=function(n){var e=tn;return function(){var t=tn;tn=e;try{return n.apply(this,arguments)}finally{tn=t}}}});var Pg=qi((qC,Cg)=>{"use strict";Cg.exports=Rg()});var Nx=qi(Wn=>{"use strict";var VM=da(),Vn=Pg();function ee(n){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+n,t=1;t<arguments.length;t++)e+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+n+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var zy=new Set,Oa={};function _s(n,e){fo(n,e),fo(n+"Capture",e)}function fo(n,e){for(Oa[n]=e,n=0;n<e.length;n++)zy.add(e[n])}var Qi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bf=Object.prototype.hasOwnProperty,GM=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Ig={},Lg={};function WM(n){return bf.call(Lg,n)?!0:bf.call(Ig,n)?!1:GM.test(n)?Lg[n]=!0:(Ig[n]=!0,!1)}function XM(n,e,t,i){if(t!==null&&t.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:t!==null?!t.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function YM(n,e,t,i){if(e===null||typeof e>"u"||XM(n,e,t,i))return!0;if(i)return!1;if(t!==null)switch(t.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function vn(n,e,t,i,r,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=t,this.propertyName=n,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var Zt={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){Zt[n]=new vn(n,0,!1,n,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var e=n[0];Zt[e]=new vn(e,1,!1,n[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(n){Zt[n]=new vn(n,2,!1,n.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){Zt[n]=new vn(n,2,!1,n,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){Zt[n]=new vn(n,3,!1,n.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(n){Zt[n]=new vn(n,3,!0,n,null,!1,!1)});["capture","download"].forEach(function(n){Zt[n]=new vn(n,4,!1,n,null,!1,!1)});["cols","rows","size","span"].forEach(function(n){Zt[n]=new vn(n,6,!1,n,null,!1,!1)});["rowSpan","start"].forEach(function(n){Zt[n]=new vn(n,5,!1,n.toLowerCase(),null,!1,!1)});var gd=/[\-:]([a-z])/g;function yd(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var e=n.replace(gd,yd);Zt[e]=new vn(e,1,!1,n,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var e=n.replace(gd,yd);Zt[e]=new vn(e,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(n){var e=n.replace(gd,yd);Zt[e]=new vn(e,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(n){Zt[n]=new vn(n,1,!1,n.toLowerCase(),null,!1,!1)});Zt.xlinkHref=new vn("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(n){Zt[n]=new vn(n,1,!1,n.toLowerCase(),null,!0,!0)});function vd(n,e,t,i){var r=Zt.hasOwnProperty(e)?Zt[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(YM(e,t,r,i)&&(t=null),i||r===null?WM(e)&&(t===null?n.removeAttribute(e):n.setAttribute(e,""+t)):r.mustUseProperty?n[r.propertyName]=t===null?r.type===3?!1:"":t:(e=r.attributeName,i=r.attributeNamespace,t===null?n.removeAttribute(e):(r=r.type,t=r===3||r===4&&t===!0?"":""+t,i?n.setAttributeNS(i,e,t):n.setAttribute(e,t))))}var ir=VM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,tc=Symbol.for("react.element"),js=Symbol.for("react.portal"),$s=Symbol.for("react.fragment"),xd=Symbol.for("react.strict_mode"),Ef=Symbol.for("react.profiler"),Oy=Symbol.for("react.provider"),Fy=Symbol.for("react.context"),_d=Symbol.for("react.forward_ref"),Tf=Symbol.for("react.suspense"),Af=Symbol.for("react.suspense_list"),Md=Symbol.for("react.memo"),br=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var By=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var kg=Symbol.iterator;function ya(n){return n===null||typeof n!="object"?null:(n=kg&&n[kg]||n["@@iterator"],typeof n=="function"?n:null)}var Et=Object.assign,tf;function Ea(n){if(tf===void 0)try{throw Error()}catch(t){var e=t.stack.trim().match(/\n( *(at )?)/);tf=e&&e[1]||""}return`
`+tf+n}var nf=!1;function rf(n,e){if(!n||nf)return"";nf=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(n,[],e)}else{try{e.call()}catch(c){i=c}n.call(e.prototype)}else{try{throw Error()}catch(c){i=c}n()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),o=r.length-1,a=s.length-1;1<=o&&0<=a&&r[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(r[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||r[o]!==s[a]){var l=`
`+r[o].replace(" at new "," at ");return n.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",n.displayName)),l}while(1<=o&&0<=a);break}}}finally{nf=!1,Error.prepareStackTrace=t}return(n=n?n.displayName||n.name:"")?Ea(n):""}function qM(n){switch(n.tag){case 5:return Ea(n.type);case 16:return Ea("Lazy");case 13:return Ea("Suspense");case 19:return Ea("SuspenseList");case 0:case 2:case 15:return n=rf(n.type,!1),n;case 11:return n=rf(n.type.render,!1),n;case 1:return n=rf(n.type,!0),n;default:return""}}function Rf(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case $s:return"Fragment";case js:return"Portal";case Ef:return"Profiler";case xd:return"StrictMode";case Tf:return"Suspense";case Af:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case Fy:return(n.displayName||"Context")+".Consumer";case Oy:return(n._context.displayName||"Context")+".Provider";case _d:var e=n.render;return n=n.displayName,n||(n=e.displayName||e.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case Md:return e=n.displayName||null,e!==null?e:Rf(n.type)||"Memo";case br:e=n._payload,n=n._init;try{return Rf(n(e))}catch{}}return null}function jM(n){var e=n.type;switch(n.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=e.render,n=n.displayName||n.name||"",e.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Rf(e);case 8:return e===xd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Or(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Hy(n){var e=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function $M(n){var e=Hy(n)?"checked":"value",t=Object.getOwnPropertyDescriptor(n.constructor.prototype,e),i=""+n[e];if(!n.hasOwnProperty(e)&&typeof t<"u"&&typeof t.get=="function"&&typeof t.set=="function"){var r=t.get,s=t.set;return Object.defineProperty(n,e,{configurable:!0,get:function(){return r.call(this)},set:function(o){i=""+o,s.call(this,o)}}),Object.defineProperty(n,e,{enumerable:t.enumerable}),{getValue:function(){return i},setValue:function(o){i=""+o},stopTracking:function(){n._valueTracker=null,delete n[e]}}}}function nc(n){n._valueTracker||(n._valueTracker=$M(n))}function Vy(n){if(!n)return!1;var e=n._valueTracker;if(!e)return!0;var t=e.getValue(),i="";return n&&(i=Hy(n)?n.checked?"true":"false":n.value),n=i,n!==t?(e.setValue(n),!0):!1}function Pc(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function Cf(n,e){var t=e.checked;return Et({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t??n._wrapperState.initialChecked})}function Ng(n,e){var t=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;t=Or(e.value!=null?e.value:t),n._wrapperState={initialChecked:i,initialValue:t,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Gy(n,e){e=e.checked,e!=null&&vd(n,"checked",e,!1)}function Pf(n,e){Gy(n,e);var t=Or(e.value),i=e.type;if(t!=null)i==="number"?(t===0&&n.value===""||n.value!=t)&&(n.value=""+t):n.value!==""+t&&(n.value=""+t);else if(i==="submit"||i==="reset"){n.removeAttribute("value");return}e.hasOwnProperty("value")?If(n,e.type,t):e.hasOwnProperty("defaultValue")&&If(n,e.type,Or(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(n.defaultChecked=!!e.defaultChecked)}function Dg(n,e,t){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+n._wrapperState.initialValue,t||e===n.value||(n.value=e),n.defaultValue=e}t=n.name,t!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,t!==""&&(n.name=t)}function If(n,e,t){(e!=="number"||Pc(n.ownerDocument)!==n)&&(t==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+t&&(n.defaultValue=""+t))}var Ta=Array.isArray;function oo(n,e,t,i){if(n=n.options,e){e={};for(var r=0;r<t.length;r++)e["$"+t[r]]=!0;for(t=0;t<n.length;t++)r=e.hasOwnProperty("$"+n[t].value),n[t].selected!==r&&(n[t].selected=r),r&&i&&(n[t].defaultSelected=!0)}else{for(t=""+Or(t),e=null,r=0;r<n.length;r++){if(n[r].value===t){n[r].selected=!0,i&&(n[r].defaultSelected=!0);return}e!==null||n[r].disabled||(e=n[r])}e!==null&&(e.selected=!0)}}function Lf(n,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ee(91));return Et({},e,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function Ug(n,e){var t=e.value;if(t==null){if(t=e.children,e=e.defaultValue,t!=null){if(e!=null)throw Error(ee(92));if(Ta(t)){if(1<t.length)throw Error(ee(93));t=t[0]}e=t}e==null&&(e=""),t=e}n._wrapperState={initialValue:Or(t)}}function Wy(n,e){var t=Or(e.value),i=Or(e.defaultValue);t!=null&&(t=""+t,t!==n.value&&(n.value=t),e.defaultValue==null&&n.defaultValue!==t&&(n.defaultValue=t)),i!=null&&(n.defaultValue=""+i)}function zg(n){var e=n.textContent;e===n._wrapperState.initialValue&&e!==""&&e!==null&&(n.value=e)}function Xy(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function kf(n,e){return n==null||n==="http://www.w3.org/1999/xhtml"?Xy(e):n==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var ic,Yy=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,t,i,r){MSApp.execUnsafeLocalFunction(function(){return n(e,t,i,r)})}:n})(function(n,e){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=e;else{for(ic=ic||document.createElement("div"),ic.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=ic.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;e.firstChild;)n.appendChild(e.firstChild)}});function Fa(n,e){if(e){var t=n.firstChild;if(t&&t===n.lastChild&&t.nodeType===3){t.nodeValue=e;return}}n.textContent=e}var Ca={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ZM=["Webkit","ms","Moz","O"];Object.keys(Ca).forEach(function(n){ZM.forEach(function(e){e=e+n.charAt(0).toUpperCase()+n.substring(1),Ca[e]=Ca[n]})});function qy(n,e,t){return e==null||typeof e=="boolean"||e===""?"":t||typeof e!="number"||e===0||Ca.hasOwnProperty(n)&&Ca[n]?(""+e).trim():e+"px"}function jy(n,e){n=n.style;for(var t in e)if(e.hasOwnProperty(t)){var i=t.indexOf("--")===0,r=qy(t,e[t],i);t==="float"&&(t="cssFloat"),i?n.setProperty(t,r):n[t]=r}}var KM=Et({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Nf(n,e){if(e){if(KM[n]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ee(137,n));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ee(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ee(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ee(62))}}function Df(n,e){if(n.indexOf("-")===-1)return typeof e.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Uf=null;function Sd(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var zf=null,ao=null,lo=null;function Og(n){if(n=il(n)){if(typeof zf!="function")throw Error(ee(280));var e=n.stateNode;e&&(e=ru(e),zf(n.stateNode,n.type,e))}}function $y(n){ao?lo?lo.push(n):lo=[n]:ao=n}function Zy(){if(ao){var n=ao,e=lo;if(lo=ao=null,Og(n),e)for(n=0;n<e.length;n++)Og(e[n])}}function Ky(n,e){return n(e)}function Jy(){}var sf=!1;function Qy(n,e,t){if(sf)return n(e,t);sf=!0;try{return Ky(n,e,t)}finally{sf=!1,(ao!==null||lo!==null)&&(Jy(),Zy())}}function Ba(n,e){var t=n.stateNode;if(t===null)return null;var i=ru(t);if(i===null)return null;t=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(n=n.type,i=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!i;break e;default:n=!1}if(n)return null;if(t&&typeof t!="function")throw Error(ee(231,e,typeof t));return t}var Of=!1;if(Qi)try{Ys={},Object.defineProperty(Ys,"passive",{get:function(){Of=!0}}),window.addEventListener("test",Ys,Ys),window.removeEventListener("test",Ys,Ys)}catch{Of=!1}var Ys;function JM(n,e,t,i,r,s,o,a,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(t,c)}catch(u){this.onError(u)}}var Pa=!1,Ic=null,Lc=!1,Ff=null,QM={onError:function(n){Pa=!0,Ic=n}};function eS(n,e,t,i,r,s,o,a,l){Pa=!1,Ic=null,JM.apply(QM,arguments)}function tS(n,e,t,i,r,s,o,a,l){if(eS.apply(this,arguments),Pa){if(Pa){var c=Ic;Pa=!1,Ic=null}else throw Error(ee(198));Lc||(Lc=!0,Ff=c)}}function Ms(n){var e=n,t=n;if(n.alternate)for(;e.return;)e=e.return;else{n=e;do e=n,(e.flags&4098)!==0&&(t=e.return),n=e.return;while(n)}return e.tag===3?t:null}function ev(n){if(n.tag===13){var e=n.memoizedState;if(e===null&&(n=n.alternate,n!==null&&(e=n.memoizedState)),e!==null)return e.dehydrated}return null}function Fg(n){if(Ms(n)!==n)throw Error(ee(188))}function nS(n){var e=n.alternate;if(!e){if(e=Ms(n),e===null)throw Error(ee(188));return e!==n?null:n}for(var t=n,i=e;;){var r=t.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){t=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===t)return Fg(r),n;if(s===i)return Fg(r),e;s=s.sibling}throw Error(ee(188))}if(t.return!==i.return)t=r,i=s;else{for(var o=!1,a=r.child;a;){if(a===t){o=!0,t=r,i=s;break}if(a===i){o=!0,i=r,t=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===t){o=!0,t=s,i=r;break}if(a===i){o=!0,i=s,t=r;break}a=a.sibling}if(!o)throw Error(ee(189))}}if(t.alternate!==i)throw Error(ee(190))}if(t.tag!==3)throw Error(ee(188));return t.stateNode.current===t?n:e}function tv(n){return n=nS(n),n!==null?nv(n):null}function nv(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var e=nv(n);if(e!==null)return e;n=n.sibling}return null}var iv=Vn.unstable_scheduleCallback,Bg=Vn.unstable_cancelCallback,iS=Vn.unstable_shouldYield,rS=Vn.unstable_requestPaint,Nt=Vn.unstable_now,sS=Vn.unstable_getCurrentPriorityLevel,wd=Vn.unstable_ImmediatePriority,rv=Vn.unstable_UserBlockingPriority,kc=Vn.unstable_NormalPriority,oS=Vn.unstable_LowPriority,sv=Vn.unstable_IdlePriority,eu=null,Di=null;function aS(n){if(Di&&typeof Di.onCommitFiberRoot=="function")try{Di.onCommitFiberRoot(eu,n,void 0,(n.current.flags&128)===128)}catch{}}var vi=Math.clz32?Math.clz32:uS,lS=Math.log,cS=Math.LN2;function uS(n){return n>>>=0,n===0?32:31-(lS(n)/cS|0)|0}var rc=64,sc=4194304;function Aa(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Nc(n,e){var t=n.pendingLanes;if(t===0)return 0;var i=0,r=n.suspendedLanes,s=n.pingedLanes,o=t&268435455;if(o!==0){var a=o&~r;a!==0?i=Aa(a):(s&=o,s!==0&&(i=Aa(s)))}else o=t&~r,o!==0?i=Aa(o):s!==0&&(i=Aa(s));if(i===0)return 0;if(e!==0&&e!==i&&(e&r)===0&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if((i&4)!==0&&(i|=t&16),e=n.entangledLanes,e!==0)for(n=n.entanglements,e&=i;0<e;)t=31-vi(e),r=1<<t,i|=n[t],e&=~r;return i}function hS(n,e){switch(n){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function fS(n,e){for(var t=n.suspendedLanes,i=n.pingedLanes,r=n.expirationTimes,s=n.pendingLanes;0<s;){var o=31-vi(s),a=1<<o,l=r[o];l===-1?((a&t)===0||(a&i)!==0)&&(r[o]=hS(a,e)):l<=e&&(n.expiredLanes|=a),s&=~a}}function Bf(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function ov(){var n=rc;return rc<<=1,(rc&4194240)===0&&(rc=64),n}function of(n){for(var e=[],t=0;31>t;t++)e.push(n);return e}function tl(n,e,t){n.pendingLanes|=e,e!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,e=31-vi(e),n[e]=t}function dS(n,e){var t=n.pendingLanes&~e;n.pendingLanes=e,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=e,n.mutableReadLanes&=e,n.entangledLanes&=e,e=n.entanglements;var i=n.eventTimes;for(n=n.expirationTimes;0<t;){var r=31-vi(t),s=1<<r;e[r]=0,i[r]=-1,n[r]=-1,t&=~s}}function bd(n,e){var t=n.entangledLanes|=e;for(n=n.entanglements;t;){var i=31-vi(t),r=1<<i;r&e|n[i]&e&&(n[i]|=e),t&=~r}}var st=0;function av(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var lv,Ed,cv,uv,hv,Hf=!1,oc=[],Pr=null,Ir=null,Lr=null,Ha=new Map,Va=new Map,Tr=[],pS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Hg(n,e){switch(n){case"focusin":case"focusout":Pr=null;break;case"dragenter":case"dragleave":Ir=null;break;case"mouseover":case"mouseout":Lr=null;break;case"pointerover":case"pointerout":Ha.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Va.delete(e.pointerId)}}function va(n,e,t,i,r,s){return n===null||n.nativeEvent!==s?(n={blockedOn:e,domEventName:t,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=il(e),e!==null&&Ed(e)),n):(n.eventSystemFlags|=i,e=n.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),n)}function mS(n,e,t,i,r){switch(e){case"focusin":return Pr=va(Pr,n,e,t,i,r),!0;case"dragenter":return Ir=va(Ir,n,e,t,i,r),!0;case"mouseover":return Lr=va(Lr,n,e,t,i,r),!0;case"pointerover":var s=r.pointerId;return Ha.set(s,va(Ha.get(s)||null,n,e,t,i,r)),!0;case"gotpointercapture":return s=r.pointerId,Va.set(s,va(Va.get(s)||null,n,e,t,i,r)),!0}return!1}function fv(n){var e=us(n.target);if(e!==null){var t=Ms(e);if(t!==null){if(e=t.tag,e===13){if(e=ev(t),e!==null){n.blockedOn=e,hv(n.priority,function(){cv(t)});return}}else if(e===3&&t.stateNode.current.memoizedState.isDehydrated){n.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}n.blockedOn=null}function _c(n){if(n.blockedOn!==null)return!1;for(var e=n.targetContainers;0<e.length;){var t=Vf(n.domEventName,n.eventSystemFlags,e[0],n.nativeEvent);if(t===null){t=n.nativeEvent;var i=new t.constructor(t.type,t);Uf=i,t.target.dispatchEvent(i),Uf=null}else return e=il(t),e!==null&&Ed(e),n.blockedOn=t,!1;e.shift()}return!0}function Vg(n,e,t){_c(n)&&t.delete(e)}function gS(){Hf=!1,Pr!==null&&_c(Pr)&&(Pr=null),Ir!==null&&_c(Ir)&&(Ir=null),Lr!==null&&_c(Lr)&&(Lr=null),Ha.forEach(Vg),Va.forEach(Vg)}function xa(n,e){n.blockedOn===e&&(n.blockedOn=null,Hf||(Hf=!0,Vn.unstable_scheduleCallback(Vn.unstable_NormalPriority,gS)))}function Ga(n){function e(r){return xa(r,n)}if(0<oc.length){xa(oc[0],n);for(var t=1;t<oc.length;t++){var i=oc[t];i.blockedOn===n&&(i.blockedOn=null)}}for(Pr!==null&&xa(Pr,n),Ir!==null&&xa(Ir,n),Lr!==null&&xa(Lr,n),Ha.forEach(e),Va.forEach(e),t=0;t<Tr.length;t++)i=Tr[t],i.blockedOn===n&&(i.blockedOn=null);for(;0<Tr.length&&(t=Tr[0],t.blockedOn===null);)fv(t),t.blockedOn===null&&Tr.shift()}var co=ir.ReactCurrentBatchConfig,Dc=!0;function yS(n,e,t,i){var r=st,s=co.transition;co.transition=null;try{st=1,Td(n,e,t,i)}finally{st=r,co.transition=s}}function vS(n,e,t,i){var r=st,s=co.transition;co.transition=null;try{st=4,Td(n,e,t,i)}finally{st=r,co.transition=s}}function Td(n,e,t,i){if(Dc){var r=Vf(n,e,t,i);if(r===null)df(n,e,i,Uc,t),Hg(n,i);else if(mS(r,n,e,t,i))i.stopPropagation();else if(Hg(n,i),e&4&&-1<pS.indexOf(n)){for(;r!==null;){var s=il(r);if(s!==null&&lv(s),s=Vf(n,e,t,i),s===null&&df(n,e,i,Uc,t),s===r)break;r=s}r!==null&&i.stopPropagation()}else df(n,e,i,null,t)}}var Uc=null;function Vf(n,e,t,i){if(Uc=null,n=Sd(i),n=us(n),n!==null)if(e=Ms(n),e===null)n=null;else if(t=e.tag,t===13){if(n=ev(e),n!==null)return n;n=null}else if(t===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;n=null}else e!==n&&(n=null);return Uc=n,null}function dv(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(sS()){case wd:return 1;case rv:return 4;case kc:case oS:return 16;case sv:return 536870912;default:return 16}default:return 16}}var Rr=null,Ad=null,Mc=null;function pv(){if(Mc)return Mc;var n,e=Ad,t=e.length,i,r="value"in Rr?Rr.value:Rr.textContent,s=r.length;for(n=0;n<t&&e[n]===r[n];n++);var o=t-n;for(i=1;i<=o&&e[t-i]===r[s-i];i++);return Mc=r.slice(n,1<i?1-i:void 0)}function Sc(n){var e=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&e===13&&(n=13)):n=e,n===10&&(n=13),32<=n||n===13?n:0}function ac(){return!0}function Gg(){return!1}function Gn(n){function e(t,i,r,s,o){this._reactName=t,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in n)n.hasOwnProperty(a)&&(t=n[a],this[a]=t?t(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?ac:Gg,this.isPropagationStopped=Gg,this}return Et(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=ac)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=ac)},persist:function(){},isPersistent:ac}),e}var _o={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Rd=Gn(_o),nl=Et({},_o,{view:0,detail:0}),xS=Gn(nl),af,lf,_a,tu=Et({},nl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Cd,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==_a&&(_a&&n.type==="mousemove"?(af=n.screenX-_a.screenX,lf=n.screenY-_a.screenY):lf=af=0,_a=n),af)},movementY:function(n){return"movementY"in n?n.movementY:lf}}),Wg=Gn(tu),_S=Et({},tu,{dataTransfer:0}),MS=Gn(_S),SS=Et({},nl,{relatedTarget:0}),cf=Gn(SS),wS=Et({},_o,{animationName:0,elapsedTime:0,pseudoElement:0}),bS=Gn(wS),ES=Et({},_o,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),TS=Gn(ES),AS=Et({},_o,{data:0}),Xg=Gn(AS),RS={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},CS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},PS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function IS(n){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(n):(n=PS[n])?!!e[n]:!1}function Cd(){return IS}var LS=Et({},nl,{key:function(n){if(n.key){var e=RS[n.key]||n.key;if(e!=="Unidentified")return e}return n.type==="keypress"?(n=Sc(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?CS[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Cd,charCode:function(n){return n.type==="keypress"?Sc(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Sc(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),kS=Gn(LS),NS=Et({},tu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Yg=Gn(NS),DS=Et({},nl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Cd}),US=Gn(DS),zS=Et({},_o,{propertyName:0,elapsedTime:0,pseudoElement:0}),OS=Gn(zS),FS=Et({},tu,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),BS=Gn(FS),HS=[9,13,27,32],Pd=Qi&&"CompositionEvent"in window,Ia=null;Qi&&"documentMode"in document&&(Ia=document.documentMode);var VS=Qi&&"TextEvent"in window&&!Ia,mv=Qi&&(!Pd||Ia&&8<Ia&&11>=Ia),qg=" ",jg=!1;function gv(n,e){switch(n){case"keyup":return HS.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function yv(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Zs=!1;function GS(n,e){switch(n){case"compositionend":return yv(e);case"keypress":return e.which!==32?null:(jg=!0,qg);case"textInput":return n=e.data,n===qg&&jg?null:n;default:return null}}function WS(n,e){if(Zs)return n==="compositionend"||!Pd&&gv(n,e)?(n=pv(),Mc=Ad=Rr=null,Zs=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return mv&&e.locale!=="ko"?null:e.data;default:return null}}var XS={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function $g(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e==="input"?!!XS[n.type]:e==="textarea"}function vv(n,e,t,i){$y(i),e=zc(e,"onChange"),0<e.length&&(t=new Rd("onChange","change",null,t,i),n.push({event:t,listeners:e}))}var La=null,Wa=null;function YS(n){Cv(n,0)}function nu(n){var e=Qs(n);if(Vy(e))return n}function qS(n,e){if(n==="change")return e}var xv=!1;Qi&&(Qi?(cc="oninput"in document,cc||(uf=document.createElement("div"),uf.setAttribute("oninput","return;"),cc=typeof uf.oninput=="function"),lc=cc):lc=!1,xv=lc&&(!document.documentMode||9<document.documentMode));var lc,cc,uf;function Zg(){La&&(La.detachEvent("onpropertychange",_v),Wa=La=null)}function _v(n){if(n.propertyName==="value"&&nu(Wa)){var e=[];vv(e,Wa,n,Sd(n)),Qy(YS,e)}}function jS(n,e,t){n==="focusin"?(Zg(),La=e,Wa=t,La.attachEvent("onpropertychange",_v)):n==="focusout"&&Zg()}function $S(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return nu(Wa)}function ZS(n,e){if(n==="click")return nu(e)}function KS(n,e){if(n==="input"||n==="change")return nu(e)}function JS(n,e){return n===e&&(n!==0||1/n===1/e)||n!==n&&e!==e}var _i=typeof Object.is=="function"?Object.is:JS;function Xa(n,e){if(_i(n,e))return!0;if(typeof n!="object"||n===null||typeof e!="object"||e===null)return!1;var t=Object.keys(n),i=Object.keys(e);if(t.length!==i.length)return!1;for(i=0;i<t.length;i++){var r=t[i];if(!bf.call(e,r)||!_i(n[r],e[r]))return!1}return!0}function Kg(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function Jg(n,e){var t=Kg(n);n=0;for(var i;t;){if(t.nodeType===3){if(i=n+t.textContent.length,n<=e&&i>=e)return{node:t,offset:e-n};n=i}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=Kg(t)}}function Mv(n,e){return n&&e?n===e?!0:n&&n.nodeType===3?!1:e&&e.nodeType===3?Mv(n,e.parentNode):"contains"in n?n.contains(e):n.compareDocumentPosition?!!(n.compareDocumentPosition(e)&16):!1:!1}function Sv(){for(var n=window,e=Pc();e instanceof n.HTMLIFrameElement;){try{var t=typeof e.contentWindow.location.href=="string"}catch{t=!1}if(t)n=e.contentWindow;else break;e=Pc(n.document)}return e}function Id(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e&&(e==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||e==="textarea"||n.contentEditable==="true")}function QS(n){var e=Sv(),t=n.focusedElem,i=n.selectionRange;if(e!==t&&t&&t.ownerDocument&&Mv(t.ownerDocument.documentElement,t)){if(i!==null&&Id(t)){if(e=i.start,n=i.end,n===void 0&&(n=e),"selectionStart"in t)t.selectionStart=e,t.selectionEnd=Math.min(n,t.value.length);else if(n=(e=t.ownerDocument||document)&&e.defaultView||window,n.getSelection){n=n.getSelection();var r=t.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!n.extend&&s>i&&(r=i,i=s,s=r),r=Jg(t,s);var o=Jg(t,i);r&&o&&(n.rangeCount!==1||n.anchorNode!==r.node||n.anchorOffset!==r.offset||n.focusNode!==o.node||n.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),n.removeAllRanges(),s>i?(n.addRange(e),n.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),n.addRange(e)))}}for(e=[],n=t;n=n.parentNode;)n.nodeType===1&&e.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof t.focus=="function"&&t.focus(),t=0;t<e.length;t++)n=e[t],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var ew=Qi&&"documentMode"in document&&11>=document.documentMode,Ks=null,Gf=null,ka=null,Wf=!1;function Qg(n,e,t){var i=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;Wf||Ks==null||Ks!==Pc(i)||(i=Ks,"selectionStart"in i&&Id(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ka&&Xa(ka,i)||(ka=i,i=zc(Gf,"onSelect"),0<i.length&&(e=new Rd("onSelect","select",null,e,t),n.push({event:e,listeners:i}),e.target=Ks)))}function uc(n,e){var t={};return t[n.toLowerCase()]=e.toLowerCase(),t["Webkit"+n]="webkit"+e,t["Moz"+n]="moz"+e,t}var Js={animationend:uc("Animation","AnimationEnd"),animationiteration:uc("Animation","AnimationIteration"),animationstart:uc("Animation","AnimationStart"),transitionend:uc("Transition","TransitionEnd")},hf={},wv={};Qi&&(wv=document.createElement("div").style,"AnimationEvent"in window||(delete Js.animationend.animation,delete Js.animationiteration.animation,delete Js.animationstart.animation),"TransitionEvent"in window||delete Js.transitionend.transition);function iu(n){if(hf[n])return hf[n];if(!Js[n])return n;var e=Js[n],t;for(t in e)if(e.hasOwnProperty(t)&&t in wv)return hf[n]=e[t];return n}var bv=iu("animationend"),Ev=iu("animationiteration"),Tv=iu("animationstart"),Av=iu("transitionend"),Rv=new Map,ey="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Br(n,e){Rv.set(n,e),_s(e,[n])}for(hc=0;hc<ey.length;hc++)fc=ey[hc],ty=fc.toLowerCase(),ny=fc[0].toUpperCase()+fc.slice(1),Br(ty,"on"+ny);var fc,ty,ny,hc;Br(bv,"onAnimationEnd");Br(Ev,"onAnimationIteration");Br(Tv,"onAnimationStart");Br("dblclick","onDoubleClick");Br("focusin","onFocus");Br("focusout","onBlur");Br(Av,"onTransitionEnd");fo("onMouseEnter",["mouseout","mouseover"]);fo("onMouseLeave",["mouseout","mouseover"]);fo("onPointerEnter",["pointerout","pointerover"]);fo("onPointerLeave",["pointerout","pointerover"]);_s("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));_s("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));_s("onBeforeInput",["compositionend","keypress","textInput","paste"]);_s("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));_s("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));_s("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ra="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),tw=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ra));function iy(n,e,t){var i=n.type||"unknown-event";n.currentTarget=t,tS(i,e,void 0,n),n.currentTarget=null}function Cv(n,e){e=(e&4)!==0;for(var t=0;t<n.length;t++){var i=n[t],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var o=i.length-1;0<=o;o--){var a=i[o],l=a.instance,c=a.currentTarget;if(a=a.listener,l!==s&&r.isPropagationStopped())break e;iy(r,a,c),s=l}else for(o=0;o<i.length;o++){if(a=i[o],l=a.instance,c=a.currentTarget,a=a.listener,l!==s&&r.isPropagationStopped())break e;iy(r,a,c),s=l}}}if(Lc)throw n=Ff,Lc=!1,Ff=null,n}function gt(n,e){var t=e[$f];t===void 0&&(t=e[$f]=new Set);var i=n+"__bubble";t.has(i)||(Pv(e,n,2,!1),t.add(i))}function ff(n,e,t){var i=0;e&&(i|=4),Pv(t,n,i,e)}var dc="_reactListening"+Math.random().toString(36).slice(2);function Ya(n){if(!n[dc]){n[dc]=!0,zy.forEach(function(t){t!=="selectionchange"&&(tw.has(t)||ff(t,!1,n),ff(t,!0,n))});var e=n.nodeType===9?n:n.ownerDocument;e===null||e[dc]||(e[dc]=!0,ff("selectionchange",!1,e))}}function Pv(n,e,t,i){switch(dv(e)){case 1:var r=yS;break;case 4:r=vS;break;default:r=Td}t=r.bind(null,e,t,n),r=void 0,!Of||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?n.addEventListener(e,t,{capture:!0,passive:r}):n.addEventListener(e,t,!0):r!==void 0?n.addEventListener(e,t,{passive:r}):n.addEventListener(e,t,!1)}function df(n,e,t,i,r){var s=i;if((e&1)===0&&(e&2)===0&&i!==null)e:for(;;){if(i===null)return;var o=i.tag;if(o===3||o===4){var a=i.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(o===4)for(o=i.return;o!==null;){var l=o.tag;if((l===3||l===4)&&(l=o.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;o=o.return}for(;a!==null;){if(o=us(a),o===null)return;if(l=o.tag,l===5||l===6){i=s=o;continue e}a=a.parentNode}}i=i.return}Qy(function(){var c=s,u=Sd(t),h=[];e:{var d=Rv.get(n);if(d!==void 0){var p=Rd,m=n;switch(n){case"keypress":if(Sc(t)===0)break e;case"keydown":case"keyup":p=kS;break;case"focusin":m="focus",p=cf;break;case"focusout":m="blur",p=cf;break;case"beforeblur":case"afterblur":p=cf;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=Wg;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=MS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=US;break;case bv:case Ev:case Tv:p=bS;break;case Av:p=OS;break;case"scroll":p=xS;break;case"wheel":p=BS;break;case"copy":case"cut":case"paste":p=TS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Yg}var x=(e&4)!==0,g=!x&&n==="scroll",f=x?d!==null?d+"Capture":null:d;x=[];for(var v=c,y;v!==null;){y=v;var M=y.stateNode;if(y.tag===5&&M!==null&&(y=M,f!==null&&(M=Ba(v,f),M!=null&&x.push(qa(v,M,y)))),g)break;v=v.return}0<x.length&&(d=new p(d,m,null,t,u),h.push({event:d,listeners:x}))}}if((e&7)===0){e:{if(d=n==="mouseover"||n==="pointerover",p=n==="mouseout"||n==="pointerout",d&&t!==Uf&&(m=t.relatedTarget||t.fromElement)&&(us(m)||m[er]))break e;if((p||d)&&(d=u.window===u?u:(d=u.ownerDocument)?d.defaultView||d.parentWindow:window,p?(m=t.relatedTarget||t.toElement,p=c,m=m?us(m):null,m!==null&&(g=Ms(m),m!==g||m.tag!==5&&m.tag!==6)&&(m=null)):(p=null,m=c),p!==m)){if(x=Wg,M="onMouseLeave",f="onMouseEnter",v="mouse",(n==="pointerout"||n==="pointerover")&&(x=Yg,M="onPointerLeave",f="onPointerEnter",v="pointer"),g=p==null?d:Qs(p),y=m==null?d:Qs(m),d=new x(M,v+"leave",p,t,u),d.target=g,d.relatedTarget=y,M=null,us(u)===c&&(x=new x(f,v+"enter",m,t,u),x.target=y,x.relatedTarget=g,M=x),g=M,p&&m)t:{for(x=p,f=m,v=0,y=x;y;y=qs(y))v++;for(y=0,M=f;M;M=qs(M))y++;for(;0<v-y;)x=qs(x),v--;for(;0<y-v;)f=qs(f),y--;for(;v--;){if(x===f||f!==null&&x===f.alternate)break t;x=qs(x),f=qs(f)}x=null}else x=null;p!==null&&ry(h,d,p,x,!1),m!==null&&g!==null&&ry(h,g,m,x,!0)}}e:{if(d=c?Qs(c):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var R=qS;else if($g(d))if(xv)R=KS;else{R=$S;var T=jS}else(p=d.nodeName)&&p.toLowerCase()==="input"&&(d.type==="checkbox"||d.type==="radio")&&(R=ZS);if(R&&(R=R(n,c))){vv(h,R,t,u);break e}T&&T(n,d,c),n==="focusout"&&(T=d._wrapperState)&&T.controlled&&d.type==="number"&&If(d,"number",d.value)}switch(T=c?Qs(c):window,n){case"focusin":($g(T)||T.contentEditable==="true")&&(Ks=T,Gf=c,ka=null);break;case"focusout":ka=Gf=Ks=null;break;case"mousedown":Wf=!0;break;case"contextmenu":case"mouseup":case"dragend":Wf=!1,Qg(h,t,u);break;case"selectionchange":if(ew)break;case"keydown":case"keyup":Qg(h,t,u)}var b;if(Pd)e:{switch(n){case"compositionstart":var A="onCompositionStart";break e;case"compositionend":A="onCompositionEnd";break e;case"compositionupdate":A="onCompositionUpdate";break e}A=void 0}else Zs?gv(n,t)&&(A="onCompositionEnd"):n==="keydown"&&t.keyCode===229&&(A="onCompositionStart");A&&(mv&&t.locale!=="ko"&&(Zs||A!=="onCompositionStart"?A==="onCompositionEnd"&&Zs&&(b=pv()):(Rr=u,Ad="value"in Rr?Rr.value:Rr.textContent,Zs=!0)),T=zc(c,A),0<T.length&&(A=new Xg(A,n,null,t,u),h.push({event:A,listeners:T}),b?A.data=b:(b=yv(t),b!==null&&(A.data=b)))),(b=VS?GS(n,t):WS(n,t))&&(c=zc(c,"onBeforeInput"),0<c.length&&(u=new Xg("onBeforeInput","beforeinput",null,t,u),h.push({event:u,listeners:c}),u.data=b))}Cv(h,e)})}function qa(n,e,t){return{instance:n,listener:e,currentTarget:t}}function zc(n,e){for(var t=e+"Capture",i=[];n!==null;){var r=n,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=Ba(n,t),s!=null&&i.unshift(qa(n,s,r)),s=Ba(n,e),s!=null&&i.push(qa(n,s,r))),n=n.return}return i}function qs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function ry(n,e,t,i,r){for(var s=e._reactName,o=[];t!==null&&t!==i;){var a=t,l=a.alternate,c=a.stateNode;if(l!==null&&l===i)break;a.tag===5&&c!==null&&(a=c,r?(l=Ba(t,s),l!=null&&o.unshift(qa(t,l,a))):r||(l=Ba(t,s),l!=null&&o.push(qa(t,l,a)))),t=t.return}o.length!==0&&n.push({event:e,listeners:o})}var nw=/\r\n?/g,iw=/\u0000|\uFFFD/g;function sy(n){return(typeof n=="string"?n:""+n).replace(nw,`
`).replace(iw,"")}function pc(n,e,t){if(e=sy(e),sy(n)!==e&&t)throw Error(ee(425))}function Oc(){}var Xf=null,Yf=null;function qf(n,e){return n==="textarea"||n==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var jf=typeof setTimeout=="function"?setTimeout:void 0,rw=typeof clearTimeout=="function"?clearTimeout:void 0,oy=typeof Promise=="function"?Promise:void 0,sw=typeof queueMicrotask=="function"?queueMicrotask:typeof oy<"u"?function(n){return oy.resolve(null).then(n).catch(ow)}:jf;function ow(n){setTimeout(function(){throw n})}function pf(n,e){var t=e,i=0;do{var r=t.nextSibling;if(n.removeChild(t),r&&r.nodeType===8)if(t=r.data,t==="/$"){if(i===0){n.removeChild(r),Ga(e);return}i--}else t!=="$"&&t!=="$?"&&t!=="$!"||i++;t=r}while(t);Ga(e)}function kr(n){for(;n!=null;n=n.nextSibling){var e=n.nodeType;if(e===1||e===3)break;if(e===8){if(e=n.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return n}function ay(n){n=n.previousSibling;for(var e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="$"||t==="$!"||t==="$?"){if(e===0)return n;e--}else t==="/$"&&e++}n=n.previousSibling}return null}var Mo=Math.random().toString(36).slice(2),Ni="__reactFiber$"+Mo,ja="__reactProps$"+Mo,er="__reactContainer$"+Mo,$f="__reactEvents$"+Mo,aw="__reactListeners$"+Mo,lw="__reactHandles$"+Mo;function us(n){var e=n[Ni];if(e)return e;for(var t=n.parentNode;t;){if(e=t[er]||t[Ni]){if(t=e.alternate,e.child!==null||t!==null&&t.child!==null)for(n=ay(n);n!==null;){if(t=n[Ni])return t;n=ay(n)}return e}n=t,t=n.parentNode}return null}function il(n){return n=n[Ni]||n[er],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Qs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(ee(33))}function ru(n){return n[ja]||null}var Zf=[],eo=-1;function Hr(n){return{current:n}}function yt(n){0>eo||(n.current=Zf[eo],Zf[eo]=null,eo--)}function ft(n,e){eo++,Zf[eo]=n.current,n.current=e}var Fr={},on=Hr(Fr),In=Hr(!1),ms=Fr;function po(n,e){var t=n.type.contextTypes;if(!t)return Fr;var i=n.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in t)r[s]=e[s];return i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=e,n.__reactInternalMemoizedMaskedChildContext=r),r}function Ln(n){return n=n.childContextTypes,n!=null}function Fc(){yt(In),yt(on)}function ly(n,e,t){if(on.current!==Fr)throw Error(ee(168));ft(on,e),ft(In,t)}function Iv(n,e,t){var i=n.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return t;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ee(108,jM(n)||"Unknown",r));return Et({},t,i)}function Bc(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Fr,ms=on.current,ft(on,n),ft(In,In.current),!0}function cy(n,e,t){var i=n.stateNode;if(!i)throw Error(ee(169));t?(n=Iv(n,e,ms),i.__reactInternalMemoizedMergedChildContext=n,yt(In),yt(on),ft(on,n)):yt(In),ft(In,t)}var $i=null,su=!1,mf=!1;function Lv(n){$i===null?$i=[n]:$i.push(n)}function cw(n){su=!0,Lv(n)}function Vr(){if(!mf&&$i!==null){mf=!0;var n=0,e=st;try{var t=$i;for(st=1;n<t.length;n++){var i=t[n];do i=i(!0);while(i!==null)}$i=null,su=!1}catch(r){throw $i!==null&&($i=$i.slice(n+1)),iv(wd,Vr),r}finally{st=e,mf=!1}}return null}var to=[],no=0,Hc=null,Vc=0,ei=[],ti=0,gs=null,Zi=1,Ki="";function ls(n,e){to[no++]=Vc,to[no++]=Hc,Hc=n,Vc=e}function kv(n,e,t){ei[ti++]=Zi,ei[ti++]=Ki,ei[ti++]=gs,gs=n;var i=Zi;n=Ki;var r=32-vi(i)-1;i&=~(1<<r),t+=1;var s=32-vi(e)+r;if(30<s){var o=r-r%5;s=(i&(1<<o)-1).toString(32),i>>=o,r-=o,Zi=1<<32-vi(e)+r|t<<r|i,Ki=s+n}else Zi=1<<s|t<<r|i,Ki=n}function Ld(n){n.return!==null&&(ls(n,1),kv(n,1,0))}function kd(n){for(;n===Hc;)Hc=to[--no],to[no]=null,Vc=to[--no],to[no]=null;for(;n===gs;)gs=ei[--ti],ei[ti]=null,Ki=ei[--ti],ei[ti]=null,Zi=ei[--ti],ei[ti]=null}var Hn=null,Bn=null,_t=!1,yi=null;function Nv(n,e){var t=ni(5,null,null,0);t.elementType="DELETED",t.stateNode=e,t.return=n,e=n.deletions,e===null?(n.deletions=[t],n.flags|=16):e.push(t)}function uy(n,e){switch(n.tag){case 5:var t=n.type;return e=e.nodeType!==1||t.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(n.stateNode=e,Hn=n,Bn=kr(e.firstChild),!0):!1;case 6:return e=n.pendingProps===""||e.nodeType!==3?null:e,e!==null?(n.stateNode=e,Hn=n,Bn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(t=gs!==null?{id:Zi,overflow:Ki}:null,n.memoizedState={dehydrated:e,treeContext:t,retryLane:1073741824},t=ni(18,null,null,0),t.stateNode=e,t.return=n,n.child=t,Hn=n,Bn=null,!0):!1;default:return!1}}function Kf(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Jf(n){if(_t){var e=Bn;if(e){var t=e;if(!uy(n,e)){if(Kf(n))throw Error(ee(418));e=kr(t.nextSibling);var i=Hn;e&&uy(n,e)?Nv(i,t):(n.flags=n.flags&-4097|2,_t=!1,Hn=n)}}else{if(Kf(n))throw Error(ee(418));n.flags=n.flags&-4097|2,_t=!1,Hn=n}}}function hy(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Hn=n}function mc(n){if(n!==Hn)return!1;if(!_t)return hy(n),_t=!0,!1;var e;if((e=n.tag!==3)&&!(e=n.tag!==5)&&(e=n.type,e=e!=="head"&&e!=="body"&&!qf(n.type,n.memoizedProps)),e&&(e=Bn)){if(Kf(n))throw Dv(),Error(ee(418));for(;e;)Nv(n,e),e=kr(e.nextSibling)}if(hy(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(ee(317));e:{for(n=n.nextSibling,e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="/$"){if(e===0){Bn=kr(n.nextSibling);break e}e--}else t!=="$"&&t!=="$!"&&t!=="$?"||e++}n=n.nextSibling}Bn=null}}else Bn=Hn?kr(n.stateNode.nextSibling):null;return!0}function Dv(){for(var n=Bn;n;)n=kr(n.nextSibling)}function mo(){Bn=Hn=null,_t=!1}function Nd(n){yi===null?yi=[n]:yi.push(n)}var uw=ir.ReactCurrentBatchConfig;function Ma(n,e,t){if(n=t.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(ee(309));var i=t.stateNode}if(!i)throw Error(ee(147,n));var r=i,s=""+n;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var a=r.refs;o===null?delete a[s]:a[s]=o},e._stringRef=s,e)}if(typeof n!="string")throw Error(ee(284));if(!t._owner)throw Error(ee(290,n))}return n}function gc(n,e){throw n=Object.prototype.toString.call(e),Error(ee(31,n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n))}function fy(n){var e=n._init;return e(n._payload)}function Uv(n){function e(f,v){if(n){var y=f.deletions;y===null?(f.deletions=[v],f.flags|=16):y.push(v)}}function t(f,v){if(!n)return null;for(;v!==null;)e(f,v),v=v.sibling;return null}function i(f,v){for(f=new Map;v!==null;)v.key!==null?f.set(v.key,v):f.set(v.index,v),v=v.sibling;return f}function r(f,v){return f=zr(f,v),f.index=0,f.sibling=null,f}function s(f,v,y){return f.index=y,n?(y=f.alternate,y!==null?(y=y.index,y<v?(f.flags|=2,v):y):(f.flags|=2,v)):(f.flags|=1048576,v)}function o(f){return n&&f.alternate===null&&(f.flags|=2),f}function a(f,v,y,M){return v===null||v.tag!==6?(v=Sf(y,f.mode,M),v.return=f,v):(v=r(v,y),v.return=f,v)}function l(f,v,y,M){var R=y.type;return R===$s?u(f,v,y.props.children,M,y.key):v!==null&&(v.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===br&&fy(R)===v.type)?(M=r(v,y.props),M.ref=Ma(f,v,y),M.return=f,M):(M=Cc(y.type,y.key,y.props,null,f.mode,M),M.ref=Ma(f,v,y),M.return=f,M)}function c(f,v,y,M){return v===null||v.tag!==4||v.stateNode.containerInfo!==y.containerInfo||v.stateNode.implementation!==y.implementation?(v=wf(y,f.mode,M),v.return=f,v):(v=r(v,y.children||[]),v.return=f,v)}function u(f,v,y,M,R){return v===null||v.tag!==7?(v=ps(y,f.mode,M,R),v.return=f,v):(v=r(v,y),v.return=f,v)}function h(f,v,y){if(typeof v=="string"&&v!==""||typeof v=="number")return v=Sf(""+v,f.mode,y),v.return=f,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case tc:return y=Cc(v.type,v.key,v.props,null,f.mode,y),y.ref=Ma(f,null,v),y.return=f,y;case js:return v=wf(v,f.mode,y),v.return=f,v;case br:var M=v._init;return h(f,M(v._payload),y)}if(Ta(v)||ya(v))return v=ps(v,f.mode,y,null),v.return=f,v;gc(f,v)}return null}function d(f,v,y,M){var R=v!==null?v.key:null;if(typeof y=="string"&&y!==""||typeof y=="number")return R!==null?null:a(f,v,""+y,M);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case tc:return y.key===R?l(f,v,y,M):null;case js:return y.key===R?c(f,v,y,M):null;case br:return R=y._init,d(f,v,R(y._payload),M)}if(Ta(y)||ya(y))return R!==null?null:u(f,v,y,M,null);gc(f,y)}return null}function p(f,v,y,M,R){if(typeof M=="string"&&M!==""||typeof M=="number")return f=f.get(y)||null,a(v,f,""+M,R);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case tc:return f=f.get(M.key===null?y:M.key)||null,l(v,f,M,R);case js:return f=f.get(M.key===null?y:M.key)||null,c(v,f,M,R);case br:var T=M._init;return p(f,v,y,T(M._payload),R)}if(Ta(M)||ya(M))return f=f.get(y)||null,u(v,f,M,R,null);gc(v,M)}return null}function m(f,v,y,M){for(var R=null,T=null,b=v,A=v=0,L=null;b!==null&&A<y.length;A++){b.index>A?(L=b,b=null):L=b.sibling;var _=d(f,b,y[A],M);if(_===null){b===null&&(b=L);break}n&&b&&_.alternate===null&&e(f,b),v=s(_,v,A),T===null?R=_:T.sibling=_,T=_,b=L}if(A===y.length)return t(f,b),_t&&ls(f,A),R;if(b===null){for(;A<y.length;A++)b=h(f,y[A],M),b!==null&&(v=s(b,v,A),T===null?R=b:T.sibling=b,T=b);return _t&&ls(f,A),R}for(b=i(f,b);A<y.length;A++)L=p(b,f,A,y[A],M),L!==null&&(n&&L.alternate!==null&&b.delete(L.key===null?A:L.key),v=s(L,v,A),T===null?R=L:T.sibling=L,T=L);return n&&b.forEach(function(S){return e(f,S)}),_t&&ls(f,A),R}function x(f,v,y,M){var R=ya(y);if(typeof R!="function")throw Error(ee(150));if(y=R.call(y),y==null)throw Error(ee(151));for(var T=R=null,b=v,A=v=0,L=null,_=y.next();b!==null&&!_.done;A++,_=y.next()){b.index>A?(L=b,b=null):L=b.sibling;var S=d(f,b,_.value,M);if(S===null){b===null&&(b=L);break}n&&b&&S.alternate===null&&e(f,b),v=s(S,v,A),T===null?R=S:T.sibling=S,T=S,b=L}if(_.done)return t(f,b),_t&&ls(f,A),R;if(b===null){for(;!_.done;A++,_=y.next())_=h(f,_.value,M),_!==null&&(v=s(_,v,A),T===null?R=_:T.sibling=_,T=_);return _t&&ls(f,A),R}for(b=i(f,b);!_.done;A++,_=y.next())_=p(b,f,A,_.value,M),_!==null&&(n&&_.alternate!==null&&b.delete(_.key===null?A:_.key),v=s(_,v,A),T===null?R=_:T.sibling=_,T=_);return n&&b.forEach(function(z){return e(f,z)}),_t&&ls(f,A),R}function g(f,v,y,M){if(typeof y=="object"&&y!==null&&y.type===$s&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case tc:e:{for(var R=y.key,T=v;T!==null;){if(T.key===R){if(R=y.type,R===$s){if(T.tag===7){t(f,T.sibling),v=r(T,y.props.children),v.return=f,f=v;break e}}else if(T.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===br&&fy(R)===T.type){t(f,T.sibling),v=r(T,y.props),v.ref=Ma(f,T,y),v.return=f,f=v;break e}t(f,T);break}else e(f,T);T=T.sibling}y.type===$s?(v=ps(y.props.children,f.mode,M,y.key),v.return=f,f=v):(M=Cc(y.type,y.key,y.props,null,f.mode,M),M.ref=Ma(f,v,y),M.return=f,f=M)}return o(f);case js:e:{for(T=y.key;v!==null;){if(v.key===T)if(v.tag===4&&v.stateNode.containerInfo===y.containerInfo&&v.stateNode.implementation===y.implementation){t(f,v.sibling),v=r(v,y.children||[]),v.return=f,f=v;break e}else{t(f,v);break}else e(f,v);v=v.sibling}v=wf(y,f.mode,M),v.return=f,f=v}return o(f);case br:return T=y._init,g(f,v,T(y._payload),M)}if(Ta(y))return m(f,v,y,M);if(ya(y))return x(f,v,y,M);gc(f,y)}return typeof y=="string"&&y!==""||typeof y=="number"?(y=""+y,v!==null&&v.tag===6?(t(f,v.sibling),v=r(v,y),v.return=f,f=v):(t(f,v),v=Sf(y,f.mode,M),v.return=f,f=v),o(f)):t(f,v)}return g}var go=Uv(!0),zv=Uv(!1),Gc=Hr(null),Wc=null,io=null,Dd=null;function Ud(){Dd=io=Wc=null}function zd(n){var e=Gc.current;yt(Gc),n._currentValue=e}function Qf(n,e,t){for(;n!==null;){var i=n.alternate;if((n.childLanes&e)!==e?(n.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),n===t)break;n=n.return}}function uo(n,e){Wc=n,Dd=io=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&e)!==0&&(Pn=!0),n.firstContext=null)}function ri(n){var e=n._currentValue;if(Dd!==n)if(n={context:n,memoizedValue:e,next:null},io===null){if(Wc===null)throw Error(ee(308));io=n,Wc.dependencies={lanes:0,firstContext:n}}else io=io.next=n;return e}var hs=null;function Od(n){hs===null?hs=[n]:hs.push(n)}function Ov(n,e,t,i){var r=e.interleaved;return r===null?(t.next=t,Od(e)):(t.next=r.next,r.next=t),e.interleaved=t,tr(n,i)}function tr(n,e){n.lanes|=e;var t=n.alternate;for(t!==null&&(t.lanes|=e),t=n,n=n.return;n!==null;)n.childLanes|=e,t=n.alternate,t!==null&&(t.childLanes|=e),t=n,n=n.return;return t.tag===3?t.stateNode:null}var Er=!1;function Fd(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Fv(n,e){n=n.updateQueue,e.updateQueue===n&&(e.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ji(n,e){return{eventTime:n,lane:e,tag:0,payload:null,callback:null,next:null}}function Nr(n,e,t){var i=n.updateQueue;if(i===null)return null;if(i=i.shared,(Ke&2)!==0){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,tr(n,t)}return r=i.interleaved,r===null?(e.next=e,Od(i)):(e.next=r.next,r.next=e),i.interleaved=e,tr(n,t)}function wc(n,e,t){if(e=e.updateQueue,e!==null&&(e=e.shared,(t&4194240)!==0)){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,bd(n,t)}}function dy(n,e){var t=n.updateQueue,i=n.alternate;if(i!==null&&(i=i.updateQueue,t===i)){var r=null,s=null;if(t=t.firstBaseUpdate,t!==null){do{var o={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};s===null?r=s=o:s=s.next=o,t=t.next}while(t!==null);s===null?r=s=e:s=s.next=e}else r=s=e;t={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},n.updateQueue=t;return}n=t.lastBaseUpdate,n===null?t.firstBaseUpdate=e:n.next=e,t.lastBaseUpdate=e}function Xc(n,e,t,i){var r=n.updateQueue;Er=!1;var s=r.firstBaseUpdate,o=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,c=l.next;l.next=null,o===null?s=c:o.next=c,o=l;var u=n.alternate;u!==null&&(u=u.updateQueue,a=u.lastBaseUpdate,a!==o&&(a===null?u.firstBaseUpdate=c:a.next=c,u.lastBaseUpdate=l))}if(s!==null){var h=r.baseState;o=0,u=c=l=null,a=s;do{var d=a.lane,p=a.eventTime;if((i&d)===d){u!==null&&(u=u.next={eventTime:p,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var m=n,x=a;switch(d=e,p=t,x.tag){case 1:if(m=x.payload,typeof m=="function"){h=m.call(p,h,d);break e}h=m;break e;case 3:m.flags=m.flags&-65537|128;case 0:if(m=x.payload,d=typeof m=="function"?m.call(p,h,d):m,d==null)break e;h=Et({},h,d);break e;case 2:Er=!0}}a.callback!==null&&a.lane!==0&&(n.flags|=64,d=r.effects,d===null?r.effects=[a]:d.push(a))}else p={eventTime:p,lane:d,tag:a.tag,payload:a.payload,callback:a.callback,next:null},u===null?(c=u=p,l=h):u=u.next=p,o|=d;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;d=a,a=d.next,d.next=null,r.lastBaseUpdate=d,r.shared.pending=null}}while(!0);if(u===null&&(l=h),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do o|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);vs|=o,n.lanes=o,n.memoizedState=h}}function py(n,e,t){if(n=e.effects,e.effects=null,n!==null)for(e=0;e<n.length;e++){var i=n[e],r=i.callback;if(r!==null){if(i.callback=null,i=t,typeof r!="function")throw Error(ee(191,r));r.call(i)}}}var rl={},Ui=Hr(rl),$a=Hr(rl),Za=Hr(rl);function fs(n){if(n===rl)throw Error(ee(174));return n}function Bd(n,e){switch(ft(Za,e),ft($a,n),ft(Ui,rl),n=e.nodeType,n){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:kf(null,"");break;default:n=n===8?e.parentNode:e,e=n.namespaceURI||null,n=n.tagName,e=kf(e,n)}yt(Ui),ft(Ui,e)}function yo(){yt(Ui),yt($a),yt(Za)}function Bv(n){fs(Za.current);var e=fs(Ui.current),t=kf(e,n.type);e!==t&&(ft($a,n),ft(Ui,t))}function Hd(n){$a.current===n&&(yt(Ui),yt($a))}var wt=Hr(0);function Yc(n){for(var e=n;e!==null;){if(e.tag===13){var t=e.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var gf=[];function Vd(){for(var n=0;n<gf.length;n++)gf[n]._workInProgressVersionPrimary=null;gf.length=0}var bc=ir.ReactCurrentDispatcher,yf=ir.ReactCurrentBatchConfig,ys=0,bt=null,Ft=null,Gt=null,qc=!1,Na=!1,Ka=0,hw=0;function nn(){throw Error(ee(321))}function Gd(n,e){if(e===null)return!1;for(var t=0;t<e.length&&t<n.length;t++)if(!_i(n[t],e[t]))return!1;return!0}function Wd(n,e,t,i,r,s){if(ys=s,bt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,bc.current=n===null||n.memoizedState===null?mw:gw,n=t(i,r),Na){s=0;do{if(Na=!1,Ka=0,25<=s)throw Error(ee(301));s+=1,Gt=Ft=null,e.updateQueue=null,bc.current=yw,n=t(i,r)}while(Na)}if(bc.current=jc,e=Ft!==null&&Ft.next!==null,ys=0,Gt=Ft=bt=null,qc=!1,e)throw Error(ee(300));return n}function Xd(){var n=Ka!==0;return Ka=0,n}function ki(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Gt===null?bt.memoizedState=Gt=n:Gt=Gt.next=n,Gt}function si(){if(Ft===null){var n=bt.alternate;n=n!==null?n.memoizedState:null}else n=Ft.next;var e=Gt===null?bt.memoizedState:Gt.next;if(e!==null)Gt=e,Ft=n;else{if(n===null)throw Error(ee(310));Ft=n,n={memoizedState:Ft.memoizedState,baseState:Ft.baseState,baseQueue:Ft.baseQueue,queue:Ft.queue,next:null},Gt===null?bt.memoizedState=Gt=n:Gt=Gt.next=n}return Gt}function Ja(n,e){return typeof e=="function"?e(n):e}function vf(n){var e=si(),t=e.queue;if(t===null)throw Error(ee(311));t.lastRenderedReducer=n;var i=Ft,r=i.baseQueue,s=t.pending;if(s!==null){if(r!==null){var o=r.next;r.next=s.next,s.next=o}i.baseQueue=r=s,t.pending=null}if(r!==null){s=r.next,i=i.baseState;var a=o=null,l=null,c=s;do{var u=c.lane;if((ys&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:n(i,c.action);else{var h={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(a=l=h,o=i):l=l.next=h,bt.lanes|=u,vs|=u}c=c.next}while(c!==null&&c!==s);l===null?o=i:l.next=a,_i(i,e.memoizedState)||(Pn=!0),e.memoizedState=i,e.baseState=o,e.baseQueue=l,t.lastRenderedState=i}if(n=t.interleaved,n!==null){r=n;do s=r.lane,bt.lanes|=s,vs|=s,r=r.next;while(r!==n)}else r===null&&(t.lanes=0);return[e.memoizedState,t.dispatch]}function xf(n){var e=si(),t=e.queue;if(t===null)throw Error(ee(311));t.lastRenderedReducer=n;var i=t.dispatch,r=t.pending,s=e.memoizedState;if(r!==null){t.pending=null;var o=r=r.next;do s=n(s,o.action),o=o.next;while(o!==r);_i(s,e.memoizedState)||(Pn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),t.lastRenderedState=s}return[s,i]}function Hv(){}function Vv(n,e){var t=bt,i=si(),r=e(),s=!_i(i.memoizedState,r);if(s&&(i.memoizedState=r,Pn=!0),i=i.queue,Yd(Xv.bind(null,t,i,n),[n]),i.getSnapshot!==e||s||Gt!==null&&Gt.memoizedState.tag&1){if(t.flags|=2048,Qa(9,Wv.bind(null,t,i,r,e),void 0,null),Wt===null)throw Error(ee(349));(ys&30)!==0||Gv(t,e,r)}return r}function Gv(n,e,t){n.flags|=16384,n={getSnapshot:e,value:t},e=bt.updateQueue,e===null?(e={lastEffect:null,stores:null},bt.updateQueue=e,e.stores=[n]):(t=e.stores,t===null?e.stores=[n]:t.push(n))}function Wv(n,e,t,i){e.value=t,e.getSnapshot=i,Yv(e)&&qv(n)}function Xv(n,e,t){return t(function(){Yv(e)&&qv(n)})}function Yv(n){var e=n.getSnapshot;n=n.value;try{var t=e();return!_i(n,t)}catch{return!0}}function qv(n){var e=tr(n,1);e!==null&&xi(e,n,1,-1)}function my(n){var e=ki();return typeof n=="function"&&(n=n()),e.memoizedState=e.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ja,lastRenderedState:n},e.queue=n,n=n.dispatch=pw.bind(null,bt,n),[e.memoizedState,n]}function Qa(n,e,t,i){return n={tag:n,create:e,destroy:t,deps:i,next:null},e=bt.updateQueue,e===null?(e={lastEffect:null,stores:null},bt.updateQueue=e,e.lastEffect=n.next=n):(t=e.lastEffect,t===null?e.lastEffect=n.next=n:(i=t.next,t.next=n,n.next=i,e.lastEffect=n)),n}function jv(){return si().memoizedState}function Ec(n,e,t,i){var r=ki();bt.flags|=n,r.memoizedState=Qa(1|e,t,void 0,i===void 0?null:i)}function ou(n,e,t,i){var r=si();i=i===void 0?null:i;var s=void 0;if(Ft!==null){var o=Ft.memoizedState;if(s=o.destroy,i!==null&&Gd(i,o.deps)){r.memoizedState=Qa(e,t,s,i);return}}bt.flags|=n,r.memoizedState=Qa(1|e,t,s,i)}function gy(n,e){return Ec(8390656,8,n,e)}function Yd(n,e){return ou(2048,8,n,e)}function $v(n,e){return ou(4,2,n,e)}function Zv(n,e){return ou(4,4,n,e)}function Kv(n,e){if(typeof e=="function")return n=n(),e(n),function(){e(null)};if(e!=null)return n=n(),e.current=n,function(){e.current=null}}function Jv(n,e,t){return t=t!=null?t.concat([n]):null,ou(4,4,Kv.bind(null,e,n),t)}function qd(){}function Qv(n,e){var t=si();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Gd(e,i[1])?i[0]:(t.memoizedState=[n,e],n)}function ex(n,e){var t=si();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Gd(e,i[1])?i[0]:(n=n(),t.memoizedState=[n,e],n)}function tx(n,e,t){return(ys&21)===0?(n.baseState&&(n.baseState=!1,Pn=!0),n.memoizedState=t):(_i(t,e)||(t=ov(),bt.lanes|=t,vs|=t,n.baseState=!0),e)}function fw(n,e){var t=st;st=t!==0&&4>t?t:4,n(!0);var i=yf.transition;yf.transition={};try{n(!1),e()}finally{st=t,yf.transition=i}}function nx(){return si().memoizedState}function dw(n,e,t){var i=Ur(n);if(t={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null},ix(n))rx(e,t);else if(t=Ov(n,e,t,i),t!==null){var r=yn();xi(t,n,i,r),sx(t,e,i)}}function pw(n,e,t){var i=Ur(n),r={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null};if(ix(n))rx(e,r);else{var s=n.alternate;if(n.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,a=s(o,t);if(r.hasEagerState=!0,r.eagerState=a,_i(a,o)){var l=e.interleaved;l===null?(r.next=r,Od(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}t=Ov(n,e,r,i),t!==null&&(r=yn(),xi(t,n,i,r),sx(t,e,i))}}function ix(n){var e=n.alternate;return n===bt||e!==null&&e===bt}function rx(n,e){Na=qc=!0;var t=n.pending;t===null?e.next=e:(e.next=t.next,t.next=e),n.pending=e}function sx(n,e,t){if((t&4194240)!==0){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,bd(n,t)}}var jc={readContext:ri,useCallback:nn,useContext:nn,useEffect:nn,useImperativeHandle:nn,useInsertionEffect:nn,useLayoutEffect:nn,useMemo:nn,useReducer:nn,useRef:nn,useState:nn,useDebugValue:nn,useDeferredValue:nn,useTransition:nn,useMutableSource:nn,useSyncExternalStore:nn,useId:nn,unstable_isNewReconciler:!1},mw={readContext:ri,useCallback:function(n,e){return ki().memoizedState=[n,e===void 0?null:e],n},useContext:ri,useEffect:gy,useImperativeHandle:function(n,e,t){return t=t!=null?t.concat([n]):null,Ec(4194308,4,Kv.bind(null,e,n),t)},useLayoutEffect:function(n,e){return Ec(4194308,4,n,e)},useInsertionEffect:function(n,e){return Ec(4,2,n,e)},useMemo:function(n,e){var t=ki();return e=e===void 0?null:e,n=n(),t.memoizedState=[n,e],n},useReducer:function(n,e,t){var i=ki();return e=t!==void 0?t(e):e,i.memoizedState=i.baseState=e,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:e},i.queue=n,n=n.dispatch=dw.bind(null,bt,n),[i.memoizedState,n]},useRef:function(n){var e=ki();return n={current:n},e.memoizedState=n},useState:my,useDebugValue:qd,useDeferredValue:function(n){return ki().memoizedState=n},useTransition:function(){var n=my(!1),e=n[0];return n=fw.bind(null,n[1]),ki().memoizedState=n,[e,n]},useMutableSource:function(){},useSyncExternalStore:function(n,e,t){var i=bt,r=ki();if(_t){if(t===void 0)throw Error(ee(407));t=t()}else{if(t=e(),Wt===null)throw Error(ee(349));(ys&30)!==0||Gv(i,e,t)}r.memoizedState=t;var s={value:t,getSnapshot:e};return r.queue=s,gy(Xv.bind(null,i,s,n),[n]),i.flags|=2048,Qa(9,Wv.bind(null,i,s,t,e),void 0,null),t},useId:function(){var n=ki(),e=Wt.identifierPrefix;if(_t){var t=Ki,i=Zi;t=(i&~(1<<32-vi(i)-1)).toString(32)+t,e=":"+e+"R"+t,t=Ka++,0<t&&(e+="H"+t.toString(32)),e+=":"}else t=hw++,e=":"+e+"r"+t.toString(32)+":";return n.memoizedState=e},unstable_isNewReconciler:!1},gw={readContext:ri,useCallback:Qv,useContext:ri,useEffect:Yd,useImperativeHandle:Jv,useInsertionEffect:$v,useLayoutEffect:Zv,useMemo:ex,useReducer:vf,useRef:jv,useState:function(){return vf(Ja)},useDebugValue:qd,useDeferredValue:function(n){var e=si();return tx(e,Ft.memoizedState,n)},useTransition:function(){var n=vf(Ja)[0],e=si().memoizedState;return[n,e]},useMutableSource:Hv,useSyncExternalStore:Vv,useId:nx,unstable_isNewReconciler:!1},yw={readContext:ri,useCallback:Qv,useContext:ri,useEffect:Yd,useImperativeHandle:Jv,useInsertionEffect:$v,useLayoutEffect:Zv,useMemo:ex,useReducer:xf,useRef:jv,useState:function(){return xf(Ja)},useDebugValue:qd,useDeferredValue:function(n){var e=si();return Ft===null?e.memoizedState=n:tx(e,Ft.memoizedState,n)},useTransition:function(){var n=xf(Ja)[0],e=si().memoizedState;return[n,e]},useMutableSource:Hv,useSyncExternalStore:Vv,useId:nx,unstable_isNewReconciler:!1};function mi(n,e){if(n&&n.defaultProps){e=Et({},e),n=n.defaultProps;for(var t in n)e[t]===void 0&&(e[t]=n[t]);return e}return e}function ed(n,e,t,i){e=n.memoizedState,t=t(i,e),t=t==null?e:Et({},e,t),n.memoizedState=t,n.lanes===0&&(n.updateQueue.baseState=t)}var au={isMounted:function(n){return(n=n._reactInternals)?Ms(n)===n:!1},enqueueSetState:function(n,e,t){n=n._reactInternals;var i=yn(),r=Ur(n),s=Ji(i,r);s.payload=e,t!=null&&(s.callback=t),e=Nr(n,s,r),e!==null&&(xi(e,n,r,i),wc(e,n,r))},enqueueReplaceState:function(n,e,t){n=n._reactInternals;var i=yn(),r=Ur(n),s=Ji(i,r);s.tag=1,s.payload=e,t!=null&&(s.callback=t),e=Nr(n,s,r),e!==null&&(xi(e,n,r,i),wc(e,n,r))},enqueueForceUpdate:function(n,e){n=n._reactInternals;var t=yn(),i=Ur(n),r=Ji(t,i);r.tag=2,e!=null&&(r.callback=e),e=Nr(n,r,i),e!==null&&(xi(e,n,i,t),wc(e,n,i))}};function yy(n,e,t,i,r,s,o){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(i,s,o):e.prototype&&e.prototype.isPureReactComponent?!Xa(t,i)||!Xa(r,s):!0}function ox(n,e,t){var i=!1,r=Fr,s=e.contextType;return typeof s=="object"&&s!==null?s=ri(s):(r=Ln(e)?ms:on.current,i=e.contextTypes,s=(i=i!=null)?po(n,r):Fr),e=new e(t,s),n.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=au,n.stateNode=e,e._reactInternals=n,i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=s),e}function vy(n,e,t,i){n=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(t,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(t,i),e.state!==n&&au.enqueueReplaceState(e,e.state,null)}function td(n,e,t,i){var r=n.stateNode;r.props=t,r.state=n.memoizedState,r.refs={},Fd(n);var s=e.contextType;typeof s=="object"&&s!==null?r.context=ri(s):(s=Ln(e)?ms:on.current,r.context=po(n,s)),r.state=n.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(ed(n,e,s,t),r.state=n.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&au.enqueueReplaceState(r,r.state,null),Xc(n,t,r,i),r.state=n.memoizedState),typeof r.componentDidMount=="function"&&(n.flags|=4194308)}function vo(n,e){try{var t="",i=e;do t+=qM(i),i=i.return;while(i);var r=t}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:n,source:e,stack:r,digest:null}}function _f(n,e,t){return{value:n,source:null,stack:t??null,digest:e??null}}function nd(n,e){try{console.error(e.value)}catch(t){setTimeout(function(){throw t})}}var vw=typeof WeakMap=="function"?WeakMap:Map;function ax(n,e,t){t=Ji(-1,t),t.tag=3,t.payload={element:null};var i=e.value;return t.callback=function(){Zc||(Zc=!0,fd=i),nd(n,e)},t}function lx(n,e,t){t=Ji(-1,t),t.tag=3;var i=n.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;t.payload=function(){return i(r)},t.callback=function(){nd(n,e)}}var s=n.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){nd(n,e),typeof i!="function"&&(Dr===null?Dr=new Set([this]):Dr.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),t}function xy(n,e,t){var i=n.pingCache;if(i===null){i=n.pingCache=new vw;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(t)||(r.add(t),n=Lw.bind(null,n,e,t),e.then(n,n))}function _y(n){do{var e;if((e=n.tag===13)&&(e=n.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return n;n=n.return}while(n!==null);return null}function My(n,e,t,i,r){return(n.mode&1)===0?(n===e?n.flags|=65536:(n.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(e=Ji(-1,1),e.tag=2,Nr(t,e,1))),t.lanes|=1),n):(n.flags|=65536,n.lanes=r,n)}var xw=ir.ReactCurrentOwner,Pn=!1;function gn(n,e,t,i){e.child=n===null?zv(e,null,t,i):go(e,n.child,t,i)}function Sy(n,e,t,i,r){t=t.render;var s=e.ref;return uo(e,r),i=Wd(n,e,t,i,s,r),t=Xd(),n!==null&&!Pn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,nr(n,e,r)):(_t&&t&&Ld(e),e.flags|=1,gn(n,e,i,r),e.child)}function wy(n,e,t,i,r){if(n===null){var s=t.type;return typeof s=="function"&&!tp(s)&&s.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0?(e.tag=15,e.type=s,cx(n,e,s,i,r)):(n=Cc(t.type,null,i,e,e.mode,r),n.ref=e.ref,n.return=e,e.child=n)}if(s=n.child,(n.lanes&r)===0){var o=s.memoizedProps;if(t=t.compare,t=t!==null?t:Xa,t(o,i)&&n.ref===e.ref)return nr(n,e,r)}return e.flags|=1,n=zr(s,i),n.ref=e.ref,n.return=e,e.child=n}function cx(n,e,t,i,r){if(n!==null){var s=n.memoizedProps;if(Xa(s,i)&&n.ref===e.ref)if(Pn=!1,e.pendingProps=i=s,(n.lanes&r)!==0)(n.flags&131072)!==0&&(Pn=!0);else return e.lanes=n.lanes,nr(n,e,r)}return id(n,e,t,i,r)}function ux(n,e,t){var i=e.pendingProps,r=i.children,s=n!==null?n.memoizedState:null;if(i.mode==="hidden")if((e.mode&1)===0)e.memoizedState={baseLanes:0,cachePool:null,transitions:null},ft(so,Fn),Fn|=t;else{if((t&1073741824)===0)return n=s!==null?s.baseLanes|t:t,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:n,cachePool:null,transitions:null},e.updateQueue=null,ft(so,Fn),Fn|=n,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:t,ft(so,Fn),Fn|=i}else s!==null?(i=s.baseLanes|t,e.memoizedState=null):i=t,ft(so,Fn),Fn|=i;return gn(n,e,r,t),e.child}function hx(n,e){var t=e.ref;(n===null&&t!==null||n!==null&&n.ref!==t)&&(e.flags|=512,e.flags|=2097152)}function id(n,e,t,i,r){var s=Ln(t)?ms:on.current;return s=po(e,s),uo(e,r),t=Wd(n,e,t,i,s,r),i=Xd(),n!==null&&!Pn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,nr(n,e,r)):(_t&&i&&Ld(e),e.flags|=1,gn(n,e,t,r),e.child)}function by(n,e,t,i,r){if(Ln(t)){var s=!0;Bc(e)}else s=!1;if(uo(e,r),e.stateNode===null)Tc(n,e),ox(e,t,i),td(e,t,i,r),i=!0;else if(n===null){var o=e.stateNode,a=e.memoizedProps;o.props=a;var l=o.context,c=t.contextType;typeof c=="object"&&c!==null?c=ri(c):(c=Ln(t)?ms:on.current,c=po(e,c));var u=t.getDerivedStateFromProps,h=typeof u=="function"||typeof o.getSnapshotBeforeUpdate=="function";h||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==i||l!==c)&&vy(e,o,i,c),Er=!1;var d=e.memoizedState;o.state=d,Xc(e,i,o,r),l=e.memoizedState,a!==i||d!==l||In.current||Er?(typeof u=="function"&&(ed(e,t,u,i),l=e.memoizedState),(a=Er||yy(e,t,a,i,d,l,c))?(h||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),o.props=i,o.state=l,o.context=c,i=a):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{o=e.stateNode,Fv(n,e),a=e.memoizedProps,c=e.type===e.elementType?a:mi(e.type,a),o.props=c,h=e.pendingProps,d=o.context,l=t.contextType,typeof l=="object"&&l!==null?l=ri(l):(l=Ln(t)?ms:on.current,l=po(e,l));var p=t.getDerivedStateFromProps;(u=typeof p=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==h||d!==l)&&vy(e,o,i,l),Er=!1,d=e.memoizedState,o.state=d,Xc(e,i,o,r);var m=e.memoizedState;a!==h||d!==m||In.current||Er?(typeof p=="function"&&(ed(e,t,p,i),m=e.memoizedState),(c=Er||yy(e,t,c,i,d,m,l)||!1)?(u||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(i,m,l),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(i,m,l)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&d===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&d===n.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=m),o.props=i,o.state=m,o.context=l,i=c):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&d===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&d===n.memoizedState||(e.flags|=1024),i=!1)}return rd(n,e,t,i,s,r)}function rd(n,e,t,i,r,s){hx(n,e);var o=(e.flags&128)!==0;if(!i&&!o)return r&&cy(e,t,!1),nr(n,e,s);i=e.stateNode,xw.current=e;var a=o&&typeof t.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,n!==null&&o?(e.child=go(e,n.child,null,s),e.child=go(e,null,a,s)):gn(n,e,a,s),e.memoizedState=i.state,r&&cy(e,t,!0),e.child}function fx(n){var e=n.stateNode;e.pendingContext?ly(n,e.pendingContext,e.pendingContext!==e.context):e.context&&ly(n,e.context,!1),Bd(n,e.containerInfo)}function Ey(n,e,t,i,r){return mo(),Nd(r),e.flags|=256,gn(n,e,t,i),e.child}var sd={dehydrated:null,treeContext:null,retryLane:0};function od(n){return{baseLanes:n,cachePool:null,transitions:null}}function dx(n,e,t){var i=e.pendingProps,r=wt.current,s=!1,o=(e.flags&128)!==0,a;if((a=o)||(a=n!==null&&n.memoizedState===null?!1:(r&2)!==0),a?(s=!0,e.flags&=-129):(n===null||n.memoizedState!==null)&&(r|=1),ft(wt,r&1),n===null)return Jf(e),n=e.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((e.mode&1)===0?e.lanes=1:n.data==="$!"?e.lanes=8:e.lanes=1073741824,null):(o=i.children,n=i.fallback,s?(i=e.mode,s=e.child,o={mode:"hidden",children:o},(i&1)===0&&s!==null?(s.childLanes=0,s.pendingProps=o):s=uu(o,i,0,null),n=ps(n,i,t,null),s.return=e,n.return=e,s.sibling=n,e.child=s,e.child.memoizedState=od(t),e.memoizedState=sd,n):jd(e,o));if(r=n.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return _w(n,e,o,i,a,r,t);if(s){s=i.fallback,o=e.mode,r=n.child,a=r.sibling;var l={mode:"hidden",children:i.children};return(o&1)===0&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=zr(r,l),i.subtreeFlags=r.subtreeFlags&14680064),a!==null?s=zr(a,s):(s=ps(s,o,t,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,o=n.child.memoizedState,o=o===null?od(t):{baseLanes:o.baseLanes|t,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=n.childLanes&~t,e.memoizedState=sd,i}return s=n.child,n=s.sibling,i=zr(s,{mode:"visible",children:i.children}),(e.mode&1)===0&&(i.lanes=t),i.return=e,i.sibling=null,n!==null&&(t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)),e.child=i,e.memoizedState=null,i}function jd(n,e){return e=uu({mode:"visible",children:e},n.mode,0,null),e.return=n,n.child=e}function yc(n,e,t,i){return i!==null&&Nd(i),go(e,n.child,null,t),n=jd(e,e.pendingProps.children),n.flags|=2,e.memoizedState=null,n}function _w(n,e,t,i,r,s,o){if(t)return e.flags&256?(e.flags&=-257,i=_f(Error(ee(422))),yc(n,e,o,i)):e.memoizedState!==null?(e.child=n.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=uu({mode:"visible",children:i.children},r,0,null),s=ps(s,r,o,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,(e.mode&1)!==0&&go(e,n.child,null,o),e.child.memoizedState=od(o),e.memoizedState=sd,s);if((e.mode&1)===0)return yc(n,e,o,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var a=i.dgst;return i=a,s=Error(ee(419)),i=_f(s,i,void 0),yc(n,e,o,i)}if(a=(o&n.childLanes)!==0,Pn||a){if(i=Wt,i!==null){switch(o&-o){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=(r&(i.suspendedLanes|o))!==0?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,tr(n,r),xi(i,n,r,-1))}return ep(),i=_f(Error(ee(421))),yc(n,e,o,i)}return r.data==="$?"?(e.flags|=128,e.child=n.child,e=kw.bind(null,n),r._reactRetry=e,null):(n=s.treeContext,Bn=kr(r.nextSibling),Hn=e,_t=!0,yi=null,n!==null&&(ei[ti++]=Zi,ei[ti++]=Ki,ei[ti++]=gs,Zi=n.id,Ki=n.overflow,gs=e),e=jd(e,i.children),e.flags|=4096,e)}function Ty(n,e,t){n.lanes|=e;var i=n.alternate;i!==null&&(i.lanes|=e),Qf(n.return,e,t)}function Mf(n,e,t,i,r){var s=n.memoizedState;s===null?n.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:t,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=t,s.tailMode=r)}function px(n,e,t){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(gn(n,e,i.children,t),i=wt.current,(i&2)!==0)i=i&1|2,e.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=e.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Ty(n,t,e);else if(n.tag===19)Ty(n,t,e);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break e;for(;n.sibling===null;){if(n.return===null||n.return===e)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}i&=1}if(ft(wt,i),(e.mode&1)===0)e.memoizedState=null;else switch(r){case"forwards":for(t=e.child,r=null;t!==null;)n=t.alternate,n!==null&&Yc(n)===null&&(r=t),t=t.sibling;t=r,t===null?(r=e.child,e.child=null):(r=t.sibling,t.sibling=null),Mf(e,!1,r,t,s);break;case"backwards":for(t=null,r=e.child,e.child=null;r!==null;){if(n=r.alternate,n!==null&&Yc(n)===null){e.child=r;break}n=r.sibling,r.sibling=t,t=r,r=n}Mf(e,!0,t,null,s);break;case"together":Mf(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Tc(n,e){(e.mode&1)===0&&n!==null&&(n.alternate=null,e.alternate=null,e.flags|=2)}function nr(n,e,t){if(n!==null&&(e.dependencies=n.dependencies),vs|=e.lanes,(t&e.childLanes)===0)return null;if(n!==null&&e.child!==n.child)throw Error(ee(153));if(e.child!==null){for(n=e.child,t=zr(n,n.pendingProps),e.child=t,t.return=e;n.sibling!==null;)n=n.sibling,t=t.sibling=zr(n,n.pendingProps),t.return=e;t.sibling=null}return e.child}function Mw(n,e,t){switch(e.tag){case 3:fx(e),mo();break;case 5:Bv(e);break;case 1:Ln(e.type)&&Bc(e);break;case 4:Bd(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;ft(Gc,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(ft(wt,wt.current&1),e.flags|=128,null):(t&e.child.childLanes)!==0?dx(n,e,t):(ft(wt,wt.current&1),n=nr(n,e,t),n!==null?n.sibling:null);ft(wt,wt.current&1);break;case 19:if(i=(t&e.childLanes)!==0,(n.flags&128)!==0){if(i)return px(n,e,t);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),ft(wt,wt.current),i)break;return null;case 22:case 23:return e.lanes=0,ux(n,e,t)}return nr(n,e,t)}var mx,ad,gx,yx;mx=function(n,e){for(var t=e.child;t!==null;){if(t.tag===5||t.tag===6)n.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};ad=function(){};gx=function(n,e,t,i){var r=n.memoizedProps;if(r!==i){n=e.stateNode,fs(Ui.current);var s=null;switch(t){case"input":r=Cf(n,r),i=Cf(n,i),s=[];break;case"select":r=Et({},r,{value:void 0}),i=Et({},i,{value:void 0}),s=[];break;case"textarea":r=Lf(n,r),i=Lf(n,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(n.onclick=Oc)}Nf(t,i);var o;t=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var a=r[c];for(o in a)a.hasOwnProperty(o)&&(t||(t={}),t[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Oa.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(a=r?.[c],i.hasOwnProperty(c)&&l!==a&&(l!=null||a!=null))if(c==="style")if(a){for(o in a)!a.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(t||(t={}),t[o]="");for(o in l)l.hasOwnProperty(o)&&a[o]!==l[o]&&(t||(t={}),t[o]=l[o])}else t||(s||(s=[]),s.push(c,t)),t=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Oa.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&gt("scroll",n),s||a===l||(s=[])):(s=s||[]).push(c,l))}t&&(s=s||[]).push("style",t);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};yx=function(n,e,t,i){t!==i&&(e.flags|=4)};function Sa(n,e){if(!_t)switch(n.tailMode){case"hidden":e=n.tail;for(var t=null;e!==null;)e.alternate!==null&&(t=e),e=e.sibling;t===null?n.tail=null:t.sibling=null;break;case"collapsed":t=n.tail;for(var i=null;t!==null;)t.alternate!==null&&(i=t),t=t.sibling;i===null?e||n.tail===null?n.tail=null:n.tail.sibling=null:i.sibling=null}}function rn(n){var e=n.alternate!==null&&n.alternate.child===n.child,t=0,i=0;if(e)for(var r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=n,r=r.sibling;else for(r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=n,r=r.sibling;return n.subtreeFlags|=i,n.childLanes=t,e}function Sw(n,e,t){var i=e.pendingProps;switch(kd(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return rn(e),null;case 1:return Ln(e.type)&&Fc(),rn(e),null;case 3:return i=e.stateNode,yo(),yt(In),yt(on),Vd(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(n===null||n.child===null)&&(mc(e)?e.flags|=4:n===null||n.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,yi!==null&&(md(yi),yi=null))),ad(n,e),rn(e),null;case 5:Hd(e);var r=fs(Za.current);if(t=e.type,n!==null&&e.stateNode!=null)gx(n,e,t,i,r),n.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ee(166));return rn(e),null}if(n=fs(Ui.current),mc(e)){i=e.stateNode,t=e.type;var s=e.memoizedProps;switch(i[Ni]=e,i[ja]=s,n=(e.mode&1)!==0,t){case"dialog":gt("cancel",i),gt("close",i);break;case"iframe":case"object":case"embed":gt("load",i);break;case"video":case"audio":for(r=0;r<Ra.length;r++)gt(Ra[r],i);break;case"source":gt("error",i);break;case"img":case"image":case"link":gt("error",i),gt("load",i);break;case"details":gt("toggle",i);break;case"input":Ng(i,s),gt("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},gt("invalid",i);break;case"textarea":Ug(i,s),gt("invalid",i)}Nf(t,s),r=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?i.textContent!==a&&(s.suppressHydrationWarning!==!0&&pc(i.textContent,a,n),r=["children",a]):typeof a=="number"&&i.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&pc(i.textContent,a,n),r=["children",""+a]):Oa.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&gt("scroll",i)}switch(t){case"input":nc(i),Dg(i,s,!0);break;case"textarea":nc(i),zg(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=Oc)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{o=r.nodeType===9?r:r.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=Xy(t)),n==="http://www.w3.org/1999/xhtml"?t==="script"?(n=o.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof i.is=="string"?n=o.createElement(t,{is:i.is}):(n=o.createElement(t),t==="select"&&(o=n,i.multiple?o.multiple=!0:i.size&&(o.size=i.size))):n=o.createElementNS(n,t),n[Ni]=e,n[ja]=i,mx(n,e,!1,!1),e.stateNode=n;e:{switch(o=Df(t,i),t){case"dialog":gt("cancel",n),gt("close",n),r=i;break;case"iframe":case"object":case"embed":gt("load",n),r=i;break;case"video":case"audio":for(r=0;r<Ra.length;r++)gt(Ra[r],n);r=i;break;case"source":gt("error",n),r=i;break;case"img":case"image":case"link":gt("error",n),gt("load",n),r=i;break;case"details":gt("toggle",n),r=i;break;case"input":Ng(n,i),r=Cf(n,i),gt("invalid",n);break;case"option":r=i;break;case"select":n._wrapperState={wasMultiple:!!i.multiple},r=Et({},i,{value:void 0}),gt("invalid",n);break;case"textarea":Ug(n,i),r=Lf(n,i),gt("invalid",n);break;default:r=i}Nf(t,r),a=r;for(s in a)if(a.hasOwnProperty(s)){var l=a[s];s==="style"?jy(n,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Yy(n,l)):s==="children"?typeof l=="string"?(t!=="textarea"||l!=="")&&Fa(n,l):typeof l=="number"&&Fa(n,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Oa.hasOwnProperty(s)?l!=null&&s==="onScroll"&&gt("scroll",n):l!=null&&vd(n,s,l,o))}switch(t){case"input":nc(n),Dg(n,i,!1);break;case"textarea":nc(n),zg(n);break;case"option":i.value!=null&&n.setAttribute("value",""+Or(i.value));break;case"select":n.multiple=!!i.multiple,s=i.value,s!=null?oo(n,!!i.multiple,s,!1):i.defaultValue!=null&&oo(n,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(n.onclick=Oc)}switch(t){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return rn(e),null;case 6:if(n&&e.stateNode!=null)yx(n,e,n.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ee(166));if(t=fs(Za.current),fs(Ui.current),mc(e)){if(i=e.stateNode,t=e.memoizedProps,i[Ni]=e,(s=i.nodeValue!==t)&&(n=Hn,n!==null))switch(n.tag){case 3:pc(i.nodeValue,t,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&pc(i.nodeValue,t,(n.mode&1)!==0)}s&&(e.flags|=4)}else i=(t.nodeType===9?t:t.ownerDocument).createTextNode(i),i[Ni]=e,e.stateNode=i}return rn(e),null;case 13:if(yt(wt),i=e.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(_t&&Bn!==null&&(e.mode&1)!==0&&(e.flags&128)===0)Dv(),mo(),e.flags|=98560,s=!1;else if(s=mc(e),i!==null&&i.dehydrated!==null){if(n===null){if(!s)throw Error(ee(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ee(317));s[Ni]=e}else mo(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;rn(e),s=!1}else yi!==null&&(md(yi),yi=null),s=!0;if(!s)return e.flags&65536?e:null}return(e.flags&128)!==0?(e.lanes=t,e):(i=i!==null,i!==(n!==null&&n.memoizedState!==null)&&i&&(e.child.flags|=8192,(e.mode&1)!==0&&(n===null||(wt.current&1)!==0?Bt===0&&(Bt=3):ep())),e.updateQueue!==null&&(e.flags|=4),rn(e),null);case 4:return yo(),ad(n,e),n===null&&Ya(e.stateNode.containerInfo),rn(e),null;case 10:return zd(e.type._context),rn(e),null;case 17:return Ln(e.type)&&Fc(),rn(e),null;case 19:if(yt(wt),s=e.memoizedState,s===null)return rn(e),null;if(i=(e.flags&128)!==0,o=s.rendering,o===null)if(i)Sa(s,!1);else{if(Bt!==0||n!==null&&(n.flags&128)!==0)for(n=e.child;n!==null;){if(o=Yc(n),o!==null){for(e.flags|=128,Sa(s,!1),i=o.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=t,t=e.child;t!==null;)s=t,n=i,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=n,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,n=o.dependencies,s.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t=t.sibling;return ft(wt,wt.current&1|2),e.child}n=n.sibling}s.tail!==null&&Nt()>xo&&(e.flags|=128,i=!0,Sa(s,!1),e.lanes=4194304)}else{if(!i)if(n=Yc(o),n!==null){if(e.flags|=128,i=!0,t=n.updateQueue,t!==null&&(e.updateQueue=t,e.flags|=4),Sa(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!_t)return rn(e),null}else 2*Nt()-s.renderingStartTime>xo&&t!==1073741824&&(e.flags|=128,i=!0,Sa(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(t=s.last,t!==null?t.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=Nt(),e.sibling=null,t=wt.current,ft(wt,i?t&1|2:t&1),e):(rn(e),null);case 22:case 23:return Qd(),i=e.memoizedState!==null,n!==null&&n.memoizedState!==null!==i&&(e.flags|=8192),i&&(e.mode&1)!==0?(Fn&1073741824)!==0&&(rn(e),e.subtreeFlags&6&&(e.flags|=8192)):rn(e),null;case 24:return null;case 25:return null}throw Error(ee(156,e.tag))}function ww(n,e){switch(kd(e),e.tag){case 1:return Ln(e.type)&&Fc(),n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 3:return yo(),yt(In),yt(on),Vd(),n=e.flags,(n&65536)!==0&&(n&128)===0?(e.flags=n&-65537|128,e):null;case 5:return Hd(e),null;case 13:if(yt(wt),n=e.memoizedState,n!==null&&n.dehydrated!==null){if(e.alternate===null)throw Error(ee(340));mo()}return n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 19:return yt(wt),null;case 4:return yo(),null;case 10:return zd(e.type._context),null;case 22:case 23:return Qd(),null;case 24:return null;default:return null}}var vc=!1,sn=!1,bw=typeof WeakSet=="function"?WeakSet:Set,ye=null;function ro(n,e){var t=n.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(i){Ct(n,e,i)}else t.current=null}function ld(n,e,t){try{t()}catch(i){Ct(n,e,i)}}var Ay=!1;function Ew(n,e){if(Xf=Dc,n=Sv(),Id(n)){if("selectionStart"in n)var t={start:n.selectionStart,end:n.selectionEnd};else e:{t=(t=n.ownerDocument)&&t.defaultView||window;var i=t.getSelection&&t.getSelection();if(i&&i.rangeCount!==0){t=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{t.nodeType,s.nodeType}catch{t=null;break e}var o=0,a=-1,l=-1,c=0,u=0,h=n,d=null;t:for(;;){for(var p;h!==t||r!==0&&h.nodeType!==3||(a=o+r),h!==s||i!==0&&h.nodeType!==3||(l=o+i),h.nodeType===3&&(o+=h.nodeValue.length),(p=h.firstChild)!==null;)d=h,h=p;for(;;){if(h===n)break t;if(d===t&&++c===r&&(a=o),d===s&&++u===i&&(l=o),(p=h.nextSibling)!==null)break;h=d,d=h.parentNode}h=p}t=a===-1||l===-1?null:{start:a,end:l}}else t=null}t=t||{start:0,end:0}}else t=null;for(Yf={focusedElem:n,selectionRange:t},Dc=!1,ye=e;ye!==null;)if(e=ye,n=e.child,(e.subtreeFlags&1028)!==0&&n!==null)n.return=e,ye=n;else for(;ye!==null;){e=ye;try{var m=e.alternate;if((e.flags&1024)!==0)switch(e.tag){case 0:case 11:case 15:break;case 1:if(m!==null){var x=m.memoizedProps,g=m.memoizedState,f=e.stateNode,v=f.getSnapshotBeforeUpdate(e.elementType===e.type?x:mi(e.type,x),g);f.__reactInternalSnapshotBeforeUpdate=v}break;case 3:var y=e.stateNode.containerInfo;y.nodeType===1?y.textContent="":y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ee(163))}}catch(M){Ct(e,e.return,M)}if(n=e.sibling,n!==null){n.return=e.return,ye=n;break}ye=e.return}return m=Ay,Ay=!1,m}function Da(n,e,t){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&n)===n){var s=r.destroy;r.destroy=void 0,s!==void 0&&ld(e,t,s)}r=r.next}while(r!==i)}}function lu(n,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var t=e=e.next;do{if((t.tag&n)===n){var i=t.create;t.destroy=i()}t=t.next}while(t!==e)}}function cd(n){var e=n.ref;if(e!==null){var t=n.stateNode;switch(n.tag){case 5:n=t;break;default:n=t}typeof e=="function"?e(n):e.current=n}}function vx(n){var e=n.alternate;e!==null&&(n.alternate=null,vx(e)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(e=n.stateNode,e!==null&&(delete e[Ni],delete e[ja],delete e[$f],delete e[aw],delete e[lw])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function xx(n){return n.tag===5||n.tag===3||n.tag===4}function Ry(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||xx(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function ud(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.nodeType===8?t.parentNode.insertBefore(n,e):t.insertBefore(n,e):(t.nodeType===8?(e=t.parentNode,e.insertBefore(n,t)):(e=t,e.appendChild(n)),t=t._reactRootContainer,t!=null||e.onclick!==null||(e.onclick=Oc));else if(i!==4&&(n=n.child,n!==null))for(ud(n,e,t),n=n.sibling;n!==null;)ud(n,e,t),n=n.sibling}function hd(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.insertBefore(n,e):t.appendChild(n);else if(i!==4&&(n=n.child,n!==null))for(hd(n,e,t),n=n.sibling;n!==null;)hd(n,e,t),n=n.sibling}var jt=null,gi=!1;function wr(n,e,t){for(t=t.child;t!==null;)_x(n,e,t),t=t.sibling}function _x(n,e,t){if(Di&&typeof Di.onCommitFiberUnmount=="function")try{Di.onCommitFiberUnmount(eu,t)}catch{}switch(t.tag){case 5:sn||ro(t,e);case 6:var i=jt,r=gi;jt=null,wr(n,e,t),jt=i,gi=r,jt!==null&&(gi?(n=jt,t=t.stateNode,n.nodeType===8?n.parentNode.removeChild(t):n.removeChild(t)):jt.removeChild(t.stateNode));break;case 18:jt!==null&&(gi?(n=jt,t=t.stateNode,n.nodeType===8?pf(n.parentNode,t):n.nodeType===1&&pf(n,t),Ga(n)):pf(jt,t.stateNode));break;case 4:i=jt,r=gi,jt=t.stateNode.containerInfo,gi=!0,wr(n,e,t),jt=i,gi=r;break;case 0:case 11:case 14:case 15:if(!sn&&(i=t.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,o=s.destroy;s=s.tag,o!==void 0&&((s&2)!==0||(s&4)!==0)&&ld(t,e,o),r=r.next}while(r!==i)}wr(n,e,t);break;case 1:if(!sn&&(ro(t,e),i=t.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=t.memoizedProps,i.state=t.memoizedState,i.componentWillUnmount()}catch(a){Ct(t,e,a)}wr(n,e,t);break;case 21:wr(n,e,t);break;case 22:t.mode&1?(sn=(i=sn)||t.memoizedState!==null,wr(n,e,t),sn=i):wr(n,e,t);break;default:wr(n,e,t)}}function Cy(n){var e=n.updateQueue;if(e!==null){n.updateQueue=null;var t=n.stateNode;t===null&&(t=n.stateNode=new bw),e.forEach(function(i){var r=Nw.bind(null,n,i);t.has(i)||(t.add(i),i.then(r,r))})}}function pi(n,e){var t=e.deletions;if(t!==null)for(var i=0;i<t.length;i++){var r=t[i];try{var s=n,o=e,a=o;e:for(;a!==null;){switch(a.tag){case 5:jt=a.stateNode,gi=!1;break e;case 3:jt=a.stateNode.containerInfo,gi=!0;break e;case 4:jt=a.stateNode.containerInfo,gi=!0;break e}a=a.return}if(jt===null)throw Error(ee(160));_x(s,o,r),jt=null,gi=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){Ct(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Mx(e,n),e=e.sibling}function Mx(n,e){var t=n.alternate,i=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(pi(e,n),Li(n),i&4){try{Da(3,n,n.return),lu(3,n)}catch(x){Ct(n,n.return,x)}try{Da(5,n,n.return)}catch(x){Ct(n,n.return,x)}}break;case 1:pi(e,n),Li(n),i&512&&t!==null&&ro(t,t.return);break;case 5:if(pi(e,n),Li(n),i&512&&t!==null&&ro(t,t.return),n.flags&32){var r=n.stateNode;try{Fa(r,"")}catch(x){Ct(n,n.return,x)}}if(i&4&&(r=n.stateNode,r!=null)){var s=n.memoizedProps,o=t!==null?t.memoizedProps:s,a=n.type,l=n.updateQueue;if(n.updateQueue=null,l!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&Gy(r,s),Df(a,o);var c=Df(a,s);for(o=0;o<l.length;o+=2){var u=l[o],h=l[o+1];u==="style"?jy(r,h):u==="dangerouslySetInnerHTML"?Yy(r,h):u==="children"?Fa(r,h):vd(r,u,h,c)}switch(a){case"input":Pf(r,s);break;case"textarea":Wy(r,s);break;case"select":var d=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?oo(r,!!s.multiple,p,!1):d!==!!s.multiple&&(s.defaultValue!=null?oo(r,!!s.multiple,s.defaultValue,!0):oo(r,!!s.multiple,s.multiple?[]:"",!1))}r[ja]=s}catch(x){Ct(n,n.return,x)}}break;case 6:if(pi(e,n),Li(n),i&4){if(n.stateNode===null)throw Error(ee(162));r=n.stateNode,s=n.memoizedProps;try{r.nodeValue=s}catch(x){Ct(n,n.return,x)}}break;case 3:if(pi(e,n),Li(n),i&4&&t!==null&&t.memoizedState.isDehydrated)try{Ga(e.containerInfo)}catch(x){Ct(n,n.return,x)}break;case 4:pi(e,n),Li(n);break;case 13:pi(e,n),Li(n),r=n.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Kd=Nt())),i&4&&Cy(n);break;case 22:if(u=t!==null&&t.memoizedState!==null,n.mode&1?(sn=(c=sn)||u,pi(e,n),sn=c):pi(e,n),Li(n),i&8192){if(c=n.memoizedState!==null,(n.stateNode.isHidden=c)&&!u&&(n.mode&1)!==0)for(ye=n,u=n.child;u!==null;){for(h=ye=u;ye!==null;){switch(d=ye,p=d.child,d.tag){case 0:case 11:case 14:case 15:Da(4,d,d.return);break;case 1:ro(d,d.return);var m=d.stateNode;if(typeof m.componentWillUnmount=="function"){i=d,t=d.return;try{e=i,m.props=e.memoizedProps,m.state=e.memoizedState,m.componentWillUnmount()}catch(x){Ct(i,t,x)}}break;case 5:ro(d,d.return);break;case 22:if(d.memoizedState!==null){Iy(h);continue}}p!==null?(p.return=d,ye=p):Iy(h)}u=u.sibling}e:for(u=null,h=n;;){if(h.tag===5){if(u===null){u=h;try{r=h.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=h.stateNode,l=h.memoizedProps.style,o=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=qy("display",o))}catch(x){Ct(n,n.return,x)}}}else if(h.tag===6){if(u===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(x){Ct(n,n.return,x)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===n)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===n)break e;for(;h.sibling===null;){if(h.return===null||h.return===n)break e;u===h&&(u=null),h=h.return}u===h&&(u=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:pi(e,n),Li(n),i&4&&Cy(n);break;case 21:break;default:pi(e,n),Li(n)}}function Li(n){var e=n.flags;if(e&2){try{e:{for(var t=n.return;t!==null;){if(xx(t)){var i=t;break e}t=t.return}throw Error(ee(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(Fa(r,""),i.flags&=-33);var s=Ry(n);hd(n,s,r);break;case 3:case 4:var o=i.stateNode.containerInfo,a=Ry(n);ud(n,a,o);break;default:throw Error(ee(161))}}catch(l){Ct(n,n.return,l)}n.flags&=-3}e&4096&&(n.flags&=-4097)}function Tw(n,e,t){ye=n,Sx(n,e,t)}function Sx(n,e,t){for(var i=(n.mode&1)!==0;ye!==null;){var r=ye,s=r.child;if(r.tag===22&&i){var o=r.memoizedState!==null||vc;if(!o){var a=r.alternate,l=a!==null&&a.memoizedState!==null||sn;a=vc;var c=sn;if(vc=o,(sn=l)&&!c)for(ye=r;ye!==null;)o=ye,l=o.child,o.tag===22&&o.memoizedState!==null?Ly(r):l!==null?(l.return=o,ye=l):Ly(r);for(;s!==null;)ye=s,Sx(s,e,t),s=s.sibling;ye=r,vc=a,sn=c}Py(n,e,t)}else(r.subtreeFlags&8772)!==0&&s!==null?(s.return=r,ye=s):Py(n,e,t)}}function Py(n){for(;ye!==null;){var e=ye;if((e.flags&8772)!==0){var t=e.alternate;try{if((e.flags&8772)!==0)switch(e.tag){case 0:case 11:case 15:sn||lu(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!sn)if(t===null)i.componentDidMount();else{var r=e.elementType===e.type?t.memoizedProps:mi(e.type,t.memoizedProps);i.componentDidUpdate(r,t.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&py(e,s,i);break;case 3:var o=e.updateQueue;if(o!==null){if(t=null,e.child!==null)switch(e.child.tag){case 5:t=e.child.stateNode;break;case 1:t=e.child.stateNode}py(e,o,t)}break;case 5:var a=e.stateNode;if(t===null&&e.flags&4){t=a;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&t.focus();break;case"img":l.src&&(t.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var h=u.dehydrated;h!==null&&Ga(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ee(163))}sn||e.flags&512&&cd(e)}catch(d){Ct(e,e.return,d)}}if(e===n){ye=null;break}if(t=e.sibling,t!==null){t.return=e.return,ye=t;break}ye=e.return}}function Iy(n){for(;ye!==null;){var e=ye;if(e===n){ye=null;break}var t=e.sibling;if(t!==null){t.return=e.return,ye=t;break}ye=e.return}}function Ly(n){for(;ye!==null;){var e=ye;try{switch(e.tag){case 0:case 11:case 15:var t=e.return;try{lu(4,e)}catch(l){Ct(e,t,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){Ct(e,r,l)}}var s=e.return;try{cd(e)}catch(l){Ct(e,s,l)}break;case 5:var o=e.return;try{cd(e)}catch(l){Ct(e,o,l)}}}catch(l){Ct(e,e.return,l)}if(e===n){ye=null;break}var a=e.sibling;if(a!==null){a.return=e.return,ye=a;break}ye=e.return}}var Aw=Math.ceil,$c=ir.ReactCurrentDispatcher,$d=ir.ReactCurrentOwner,ii=ir.ReactCurrentBatchConfig,Ke=0,Wt=null,zt=null,$t=0,Fn=0,so=Hr(0),Bt=0,el=null,vs=0,cu=0,Zd=0,Ua=null,Cn=null,Kd=0,xo=1/0,ji=null,Zc=!1,fd=null,Dr=null,xc=!1,Cr=null,Kc=0,za=0,dd=null,Ac=-1,Rc=0;function yn(){return(Ke&6)!==0?Nt():Ac!==-1?Ac:Ac=Nt()}function Ur(n){return(n.mode&1)===0?1:(Ke&2)!==0&&$t!==0?$t&-$t:uw.transition!==null?(Rc===0&&(Rc=ov()),Rc):(n=st,n!==0||(n=window.event,n=n===void 0?16:dv(n.type)),n)}function xi(n,e,t,i){if(50<za)throw za=0,dd=null,Error(ee(185));tl(n,t,i),((Ke&2)===0||n!==Wt)&&(n===Wt&&((Ke&2)===0&&(cu|=t),Bt===4&&Ar(n,$t)),kn(n,i),t===1&&Ke===0&&(e.mode&1)===0&&(xo=Nt()+500,su&&Vr()))}function kn(n,e){var t=n.callbackNode;fS(n,e);var i=Nc(n,n===Wt?$t:0);if(i===0)t!==null&&Bg(t),n.callbackNode=null,n.callbackPriority=0;else if(e=i&-i,n.callbackPriority!==e){if(t!=null&&Bg(t),e===1)n.tag===0?cw(ky.bind(null,n)):Lv(ky.bind(null,n)),sw(function(){(Ke&6)===0&&Vr()}),t=null;else{switch(av(i)){case 1:t=wd;break;case 4:t=rv;break;case 16:t=kc;break;case 536870912:t=sv;break;default:t=kc}t=Px(t,wx.bind(null,n))}n.callbackPriority=e,n.callbackNode=t}}function wx(n,e){if(Ac=-1,Rc=0,(Ke&6)!==0)throw Error(ee(327));var t=n.callbackNode;if(ho()&&n.callbackNode!==t)return null;var i=Nc(n,n===Wt?$t:0);if(i===0)return null;if((i&30)!==0||(i&n.expiredLanes)!==0||e)e=Jc(n,i);else{e=i;var r=Ke;Ke|=2;var s=Ex();(Wt!==n||$t!==e)&&(ji=null,xo=Nt()+500,ds(n,e));do try{Pw();break}catch(a){bx(n,a)}while(!0);Ud(),$c.current=s,Ke=r,zt!==null?e=0:(Wt=null,$t=0,e=Bt)}if(e!==0){if(e===2&&(r=Bf(n),r!==0&&(i=r,e=pd(n,r))),e===1)throw t=el,ds(n,0),Ar(n,i),kn(n,Nt()),t;if(e===6)Ar(n,i);else{if(r=n.current.alternate,(i&30)===0&&!Rw(r)&&(e=Jc(n,i),e===2&&(s=Bf(n),s!==0&&(i=s,e=pd(n,s))),e===1))throw t=el,ds(n,0),Ar(n,i),kn(n,Nt()),t;switch(n.finishedWork=r,n.finishedLanes=i,e){case 0:case 1:throw Error(ee(345));case 2:cs(n,Cn,ji);break;case 3:if(Ar(n,i),(i&130023424)===i&&(e=Kd+500-Nt(),10<e)){if(Nc(n,0)!==0)break;if(r=n.suspendedLanes,(r&i)!==i){yn(),n.pingedLanes|=n.suspendedLanes&r;break}n.timeoutHandle=jf(cs.bind(null,n,Cn,ji),e);break}cs(n,Cn,ji);break;case 4:if(Ar(n,i),(i&4194240)===i)break;for(e=n.eventTimes,r=-1;0<i;){var o=31-vi(i);s=1<<o,o=e[o],o>r&&(r=o),i&=~s}if(i=r,i=Nt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*Aw(i/1960))-i,10<i){n.timeoutHandle=jf(cs.bind(null,n,Cn,ji),i);break}cs(n,Cn,ji);break;case 5:cs(n,Cn,ji);break;default:throw Error(ee(329))}}}return kn(n,Nt()),n.callbackNode===t?wx.bind(null,n):null}function pd(n,e){var t=Ua;return n.current.memoizedState.isDehydrated&&(ds(n,e).flags|=256),n=Jc(n,e),n!==2&&(e=Cn,Cn=t,e!==null&&md(e)),n}function md(n){Cn===null?Cn=n:Cn.push.apply(Cn,n)}function Rw(n){for(var e=n;;){if(e.flags&16384){var t=e.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var i=0;i<t.length;i++){var r=t[i],s=r.getSnapshot;r=r.value;try{if(!_i(s(),r))return!1}catch{return!1}}}if(t=e.child,e.subtreeFlags&16384&&t!==null)t.return=e,e=t;else{if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Ar(n,e){for(e&=~Zd,e&=~cu,n.suspendedLanes|=e,n.pingedLanes&=~e,n=n.expirationTimes;0<e;){var t=31-vi(e),i=1<<t;n[t]=-1,e&=~i}}function ky(n){if((Ke&6)!==0)throw Error(ee(327));ho();var e=Nc(n,0);if((e&1)===0)return kn(n,Nt()),null;var t=Jc(n,e);if(n.tag!==0&&t===2){var i=Bf(n);i!==0&&(e=i,t=pd(n,i))}if(t===1)throw t=el,ds(n,0),Ar(n,e),kn(n,Nt()),t;if(t===6)throw Error(ee(345));return n.finishedWork=n.current.alternate,n.finishedLanes=e,cs(n,Cn,ji),kn(n,Nt()),null}function Jd(n,e){var t=Ke;Ke|=1;try{return n(e)}finally{Ke=t,Ke===0&&(xo=Nt()+500,su&&Vr())}}function xs(n){Cr!==null&&Cr.tag===0&&(Ke&6)===0&&ho();var e=Ke;Ke|=1;var t=ii.transition,i=st;try{if(ii.transition=null,st=1,n)return n()}finally{st=i,ii.transition=t,Ke=e,(Ke&6)===0&&Vr()}}function Qd(){Fn=so.current,yt(so)}function ds(n,e){n.finishedWork=null,n.finishedLanes=0;var t=n.timeoutHandle;if(t!==-1&&(n.timeoutHandle=-1,rw(t)),zt!==null)for(t=zt.return;t!==null;){var i=t;switch(kd(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Fc();break;case 3:yo(),yt(In),yt(on),Vd();break;case 5:Hd(i);break;case 4:yo();break;case 13:yt(wt);break;case 19:yt(wt);break;case 10:zd(i.type._context);break;case 22:case 23:Qd()}t=t.return}if(Wt=n,zt=n=zr(n.current,null),$t=Fn=e,Bt=0,el=null,Zd=cu=vs=0,Cn=Ua=null,hs!==null){for(e=0;e<hs.length;e++)if(t=hs[e],i=t.interleaved,i!==null){t.interleaved=null;var r=i.next,s=t.pending;if(s!==null){var o=s.next;s.next=r,i.next=o}t.pending=i}hs=null}return n}function bx(n,e){do{var t=zt;try{if(Ud(),bc.current=jc,qc){for(var i=bt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}qc=!1}if(ys=0,Gt=Ft=bt=null,Na=!1,Ka=0,$d.current=null,t===null||t.return===null){Bt=1,el=e,zt=null;break}e:{var s=n,o=t.return,a=t,l=e;if(e=$t,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=a,h=u.tag;if((u.mode&1)===0&&(h===0||h===11||h===15)){var d=u.alternate;d?(u.updateQueue=d.updateQueue,u.memoizedState=d.memoizedState,u.lanes=d.lanes):(u.updateQueue=null,u.memoizedState=null)}var p=_y(o);if(p!==null){p.flags&=-257,My(p,o,a,s,e),p.mode&1&&xy(s,c,e),e=p,l=c;var m=e.updateQueue;if(m===null){var x=new Set;x.add(l),e.updateQueue=x}else m.add(l);break e}else{if((e&1)===0){xy(s,c,e),ep();break e}l=Error(ee(426))}}else if(_t&&a.mode&1){var g=_y(o);if(g!==null){(g.flags&65536)===0&&(g.flags|=256),My(g,o,a,s,e),Nd(vo(l,a));break e}}s=l=vo(l,a),Bt!==4&&(Bt=2),Ua===null?Ua=[s]:Ua.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var f=ax(s,l,e);dy(s,f);break e;case 1:a=l;var v=s.type,y=s.stateNode;if((s.flags&128)===0&&(typeof v.getDerivedStateFromError=="function"||y!==null&&typeof y.componentDidCatch=="function"&&(Dr===null||!Dr.has(y)))){s.flags|=65536,e&=-e,s.lanes|=e;var M=lx(s,a,e);dy(s,M);break e}}s=s.return}while(s!==null)}Ax(t)}catch(R){e=R,zt===t&&t!==null&&(zt=t=t.return);continue}break}while(!0)}function Ex(){var n=$c.current;return $c.current=jc,n===null?jc:n}function ep(){(Bt===0||Bt===3||Bt===2)&&(Bt=4),Wt===null||(vs&268435455)===0&&(cu&268435455)===0||Ar(Wt,$t)}function Jc(n,e){var t=Ke;Ke|=2;var i=Ex();(Wt!==n||$t!==e)&&(ji=null,ds(n,e));do try{Cw();break}catch(r){bx(n,r)}while(!0);if(Ud(),Ke=t,$c.current=i,zt!==null)throw Error(ee(261));return Wt=null,$t=0,Bt}function Cw(){for(;zt!==null;)Tx(zt)}function Pw(){for(;zt!==null&&!iS();)Tx(zt)}function Tx(n){var e=Cx(n.alternate,n,Fn);n.memoizedProps=n.pendingProps,e===null?Ax(n):zt=e,$d.current=null}function Ax(n){var e=n;do{var t=e.alternate;if(n=e.return,(e.flags&32768)===0){if(t=Sw(t,e,Fn),t!==null){zt=t;return}}else{if(t=ww(t,e),t!==null){t.flags&=32767,zt=t;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Bt=6,zt=null;return}}if(e=e.sibling,e!==null){zt=e;return}zt=e=n}while(e!==null);Bt===0&&(Bt=5)}function cs(n,e,t){var i=st,r=ii.transition;try{ii.transition=null,st=1,Iw(n,e,t,i)}finally{ii.transition=r,st=i}return null}function Iw(n,e,t,i){do ho();while(Cr!==null);if((Ke&6)!==0)throw Error(ee(327));t=n.finishedWork;var r=n.finishedLanes;if(t===null)return null;if(n.finishedWork=null,n.finishedLanes=0,t===n.current)throw Error(ee(177));n.callbackNode=null,n.callbackPriority=0;var s=t.lanes|t.childLanes;if(dS(n,s),n===Wt&&(zt=Wt=null,$t=0),(t.subtreeFlags&2064)===0&&(t.flags&2064)===0||xc||(xc=!0,Px(kc,function(){return ho(),null})),s=(t.flags&15990)!==0,(t.subtreeFlags&15990)!==0||s){s=ii.transition,ii.transition=null;var o=st;st=1;var a=Ke;Ke|=4,$d.current=null,Ew(n,t),Mx(t,n),QS(Yf),Dc=!!Xf,Yf=Xf=null,n.current=t,Tw(t,n,r),rS(),Ke=a,st=o,ii.transition=s}else n.current=t;if(xc&&(xc=!1,Cr=n,Kc=r),s=n.pendingLanes,s===0&&(Dr=null),aS(t.stateNode,i),kn(n,Nt()),e!==null)for(i=n.onRecoverableError,t=0;t<e.length;t++)r=e[t],i(r.value,{componentStack:r.stack,digest:r.digest});if(Zc)throw Zc=!1,n=fd,fd=null,n;return(Kc&1)!==0&&n.tag!==0&&ho(),s=n.pendingLanes,(s&1)!==0?n===dd?za++:(za=0,dd=n):za=0,Vr(),null}function ho(){if(Cr!==null){var n=av(Kc),e=ii.transition,t=st;try{if(ii.transition=null,st=16>n?16:n,Cr===null)var i=!1;else{if(n=Cr,Cr=null,Kc=0,(Ke&6)!==0)throw Error(ee(331));var r=Ke;for(Ke|=4,ye=n.current;ye!==null;){var s=ye,o=s.child;if((ye.flags&16)!==0){var a=s.deletions;if(a!==null){for(var l=0;l<a.length;l++){var c=a[l];for(ye=c;ye!==null;){var u=ye;switch(u.tag){case 0:case 11:case 15:Da(8,u,s)}var h=u.child;if(h!==null)h.return=u,ye=h;else for(;ye!==null;){u=ye;var d=u.sibling,p=u.return;if(vx(u),u===c){ye=null;break}if(d!==null){d.return=p,ye=d;break}ye=p}}}var m=s.alternate;if(m!==null){var x=m.child;if(x!==null){m.child=null;do{var g=x.sibling;x.sibling=null,x=g}while(x!==null)}}ye=s}}if((s.subtreeFlags&2064)!==0&&o!==null)o.return=s,ye=o;else e:for(;ye!==null;){if(s=ye,(s.flags&2048)!==0)switch(s.tag){case 0:case 11:case 15:Da(9,s,s.return)}var f=s.sibling;if(f!==null){f.return=s.return,ye=f;break e}ye=s.return}}var v=n.current;for(ye=v;ye!==null;){o=ye;var y=o.child;if((o.subtreeFlags&2064)!==0&&y!==null)y.return=o,ye=y;else e:for(o=v;ye!==null;){if(a=ye,(a.flags&2048)!==0)try{switch(a.tag){case 0:case 11:case 15:lu(9,a)}}catch(R){Ct(a,a.return,R)}if(a===o){ye=null;break e}var M=a.sibling;if(M!==null){M.return=a.return,ye=M;break e}ye=a.return}}if(Ke=r,Vr(),Di&&typeof Di.onPostCommitFiberRoot=="function")try{Di.onPostCommitFiberRoot(eu,n)}catch{}i=!0}return i}finally{st=t,ii.transition=e}}return!1}function Ny(n,e,t){e=vo(t,e),e=ax(n,e,1),n=Nr(n,e,1),e=yn(),n!==null&&(tl(n,1,e),kn(n,e))}function Ct(n,e,t){if(n.tag===3)Ny(n,n,t);else for(;e!==null;){if(e.tag===3){Ny(e,n,t);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Dr===null||!Dr.has(i))){n=vo(t,n),n=lx(e,n,1),e=Nr(e,n,1),n=yn(),e!==null&&(tl(e,1,n),kn(e,n));break}}e=e.return}}function Lw(n,e,t){var i=n.pingCache;i!==null&&i.delete(e),e=yn(),n.pingedLanes|=n.suspendedLanes&t,Wt===n&&($t&t)===t&&(Bt===4||Bt===3&&($t&130023424)===$t&&500>Nt()-Kd?ds(n,0):Zd|=t),kn(n,e)}function Rx(n,e){e===0&&((n.mode&1)===0?e=1:(e=sc,sc<<=1,(sc&130023424)===0&&(sc=4194304)));var t=yn();n=tr(n,e),n!==null&&(tl(n,e,t),kn(n,t))}function kw(n){var e=n.memoizedState,t=0;e!==null&&(t=e.retryLane),Rx(n,t)}function Nw(n,e){var t=0;switch(n.tag){case 13:var i=n.stateNode,r=n.memoizedState;r!==null&&(t=r.retryLane);break;case 19:i=n.stateNode;break;default:throw Error(ee(314))}i!==null&&i.delete(e),Rx(n,t)}var Cx;Cx=function(n,e,t){if(n!==null)if(n.memoizedProps!==e.pendingProps||In.current)Pn=!0;else{if((n.lanes&t)===0&&(e.flags&128)===0)return Pn=!1,Mw(n,e,t);Pn=(n.flags&131072)!==0}else Pn=!1,_t&&(e.flags&1048576)!==0&&kv(e,Vc,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Tc(n,e),n=e.pendingProps;var r=po(e,on.current);uo(e,t),r=Wd(null,e,i,n,r,t);var s=Xd();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,Ln(i)?(s=!0,Bc(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Fd(e),r.updater=au,e.stateNode=r,r._reactInternals=e,td(e,i,n,t),e=rd(null,e,i,!0,s,t)):(e.tag=0,_t&&s&&Ld(e),gn(null,e,r,t),e=e.child),e;case 16:i=e.elementType;e:{switch(Tc(n,e),n=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=Uw(i),n=mi(i,n),r){case 0:e=id(null,e,i,n,t);break e;case 1:e=by(null,e,i,n,t);break e;case 11:e=Sy(null,e,i,n,t);break e;case 14:e=wy(null,e,i,mi(i.type,n),t);break e}throw Error(ee(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:mi(i,r),id(n,e,i,r,t);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:mi(i,r),by(n,e,i,r,t);case 3:e:{if(fx(e),n===null)throw Error(ee(387));i=e.pendingProps,s=e.memoizedState,r=s.element,Fv(n,e),Xc(e,i,null,t);var o=e.memoizedState;if(i=o.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=vo(Error(ee(423)),e),e=Ey(n,e,i,t,r);break e}else if(i!==r){r=vo(Error(ee(424)),e),e=Ey(n,e,i,t,r);break e}else for(Bn=kr(e.stateNode.containerInfo.firstChild),Hn=e,_t=!0,yi=null,t=zv(e,null,i,t),e.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(mo(),i===r){e=nr(n,e,t);break e}gn(n,e,i,t)}e=e.child}return e;case 5:return Bv(e),n===null&&Jf(e),i=e.type,r=e.pendingProps,s=n!==null?n.memoizedProps:null,o=r.children,qf(i,r)?o=null:s!==null&&qf(i,s)&&(e.flags|=32),hx(n,e),gn(n,e,o,t),e.child;case 6:return n===null&&Jf(e),null;case 13:return dx(n,e,t);case 4:return Bd(e,e.stateNode.containerInfo),i=e.pendingProps,n===null?e.child=go(e,null,i,t):gn(n,e,i,t),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:mi(i,r),Sy(n,e,i,r,t);case 7:return gn(n,e,e.pendingProps,t),e.child;case 8:return gn(n,e,e.pendingProps.children,t),e.child;case 12:return gn(n,e,e.pendingProps.children,t),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,o=r.value,ft(Gc,i._currentValue),i._currentValue=o,s!==null)if(_i(s.value,o)){if(s.children===r.children&&!In.current){e=nr(n,e,t);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var l=a.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=Ji(-1,t&-t),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=t,l=s.alternate,l!==null&&(l.lanes|=t),Qf(s.return,t,e),a.lanes|=t;break}l=l.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(ee(341));o.lanes|=t,a=o.alternate,a!==null&&(a.lanes|=t),Qf(o,t,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}gn(n,e,r.children,t),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,uo(e,t),r=ri(r),i=i(r),e.flags|=1,gn(n,e,i,t),e.child;case 14:return i=e.type,r=mi(i,e.pendingProps),r=mi(i.type,r),wy(n,e,i,r,t);case 15:return cx(n,e,e.type,e.pendingProps,t);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:mi(i,r),Tc(n,e),e.tag=1,Ln(i)?(n=!0,Bc(e)):n=!1,uo(e,t),ox(e,i,r),td(e,i,r,t),rd(null,e,i,!0,n,t);case 19:return px(n,e,t);case 22:return ux(n,e,t)}throw Error(ee(156,e.tag))};function Px(n,e){return iv(n,e)}function Dw(n,e,t,i){this.tag=n,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ni(n,e,t,i){return new Dw(n,e,t,i)}function tp(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Uw(n){if(typeof n=="function")return tp(n)?1:0;if(n!=null){if(n=n.$$typeof,n===_d)return 11;if(n===Md)return 14}return 2}function zr(n,e){var t=n.alternate;return t===null?(t=ni(n.tag,e,n.key,n.mode),t.elementType=n.elementType,t.type=n.type,t.stateNode=n.stateNode,t.alternate=n,n.alternate=t):(t.pendingProps=e,t.type=n.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=n.flags&14680064,t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},t.sibling=n.sibling,t.index=n.index,t.ref=n.ref,t}function Cc(n,e,t,i,r,s){var o=2;if(i=n,typeof n=="function")tp(n)&&(o=1);else if(typeof n=="string")o=5;else e:switch(n){case $s:return ps(t.children,r,s,e);case xd:o=8,r|=8;break;case Ef:return n=ni(12,t,e,r|2),n.elementType=Ef,n.lanes=s,n;case Tf:return n=ni(13,t,e,r),n.elementType=Tf,n.lanes=s,n;case Af:return n=ni(19,t,e,r),n.elementType=Af,n.lanes=s,n;case By:return uu(t,r,s,e);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case Oy:o=10;break e;case Fy:o=9;break e;case _d:o=11;break e;case Md:o=14;break e;case br:o=16,i=null;break e}throw Error(ee(130,n==null?n:typeof n,""))}return e=ni(o,t,e,r),e.elementType=n,e.type=i,e.lanes=s,e}function ps(n,e,t,i){return n=ni(7,n,i,e),n.lanes=t,n}function uu(n,e,t,i){return n=ni(22,n,i,e),n.elementType=By,n.lanes=t,n.stateNode={isHidden:!1},n}function Sf(n,e,t){return n=ni(6,n,null,e),n.lanes=t,n}function wf(n,e,t){return e=ni(4,n.children!==null?n.children:[],n.key,e),e.lanes=t,e.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},e}function zw(n,e,t,i,r){this.tag=e,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=of(0),this.expirationTimes=of(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=of(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function np(n,e,t,i,r,s,o,a,l){return n=new zw(n,e,t,a,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=ni(3,null,null,e),n.current=s,s.stateNode=n,s.memoizedState={element:i,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},Fd(s),n}function Ow(n,e,t){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:js,key:i==null?null:""+i,children:n,containerInfo:e,implementation:t}}function Ix(n){if(!n)return Fr;n=n._reactInternals;e:{if(Ms(n)!==n||n.tag!==1)throw Error(ee(170));var e=n;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(Ln(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ee(171))}if(n.tag===1){var t=n.type;if(Ln(t))return Iv(n,t,e)}return e}function Lx(n,e,t,i,r,s,o,a,l){return n=np(t,i,!0,n,r,s,o,a,l),n.context=Ix(null),t=n.current,i=yn(),r=Ur(t),s=Ji(i,r),s.callback=e??null,Nr(t,s,r),n.current.lanes=r,tl(n,r,i),kn(n,i),n}function hu(n,e,t,i){var r=e.current,s=yn(),o=Ur(r);return t=Ix(t),e.context===null?e.context=t:e.pendingContext=t,e=Ji(s,o),e.payload={element:n},i=i===void 0?null:i,i!==null&&(e.callback=i),n=Nr(r,e,o),n!==null&&(xi(n,r,o,s),wc(n,r,o)),o}function Qc(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Dy(n,e){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var t=n.retryLane;n.retryLane=t!==0&&t<e?t:e}}function ip(n,e){Dy(n,e),(n=n.alternate)&&Dy(n,e)}function Fw(){return null}var kx=typeof reportError=="function"?reportError:function(n){console.error(n)};function rp(n){this._internalRoot=n}fu.prototype.render=rp.prototype.render=function(n){var e=this._internalRoot;if(e===null)throw Error(ee(409));hu(n,e,null,null)};fu.prototype.unmount=rp.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var e=n.containerInfo;xs(function(){hu(null,n,null,null)}),e[er]=null}};function fu(n){this._internalRoot=n}fu.prototype.unstable_scheduleHydration=function(n){if(n){var e=uv();n={blockedOn:null,target:n,priority:e};for(var t=0;t<Tr.length&&e!==0&&e<Tr[t].priority;t++);Tr.splice(t,0,n),t===0&&fv(n)}};function sp(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function du(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Uy(){}function Bw(n,e,t,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=Qc(o);s.call(c)}}var o=Lx(e,i,n,0,null,!1,!1,"",Uy);return n._reactRootContainer=o,n[er]=o.current,Ya(n.nodeType===8?n.parentNode:n),xs(),o}for(;r=n.lastChild;)n.removeChild(r);if(typeof i=="function"){var a=i;i=function(){var c=Qc(l);a.call(c)}}var l=np(n,0,!1,null,null,!1,!1,"",Uy);return n._reactRootContainer=l,n[er]=l.current,Ya(n.nodeType===8?n.parentNode:n),xs(function(){hu(e,l,t,i)}),l}function pu(n,e,t,i,r){var s=t._reactRootContainer;if(s){var o=s;if(typeof r=="function"){var a=r;r=function(){var l=Qc(o);a.call(l)}}hu(e,o,n,r)}else o=Bw(t,e,n,r,i);return Qc(o)}lv=function(n){switch(n.tag){case 3:var e=n.stateNode;if(e.current.memoizedState.isDehydrated){var t=Aa(e.pendingLanes);t!==0&&(bd(e,t|1),kn(e,Nt()),(Ke&6)===0&&(xo=Nt()+500,Vr()))}break;case 13:xs(function(){var i=tr(n,1);if(i!==null){var r=yn();xi(i,n,1,r)}}),ip(n,1)}};Ed=function(n){if(n.tag===13){var e=tr(n,134217728);if(e!==null){var t=yn();xi(e,n,134217728,t)}ip(n,134217728)}};cv=function(n){if(n.tag===13){var e=Ur(n),t=tr(n,e);if(t!==null){var i=yn();xi(t,n,e,i)}ip(n,e)}};uv=function(){return st};hv=function(n,e){var t=st;try{return st=n,e()}finally{st=t}};zf=function(n,e,t){switch(e){case"input":if(Pf(n,t),e=t.name,t.type==="radio"&&e!=null){for(t=n;t.parentNode;)t=t.parentNode;for(t=t.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<t.length;e++){var i=t[e];if(i!==n&&i.form===n.form){var r=ru(i);if(!r)throw Error(ee(90));Vy(i),Pf(i,r)}}}break;case"textarea":Wy(n,t);break;case"select":e=t.value,e!=null&&oo(n,!!t.multiple,e,!1)}};Ky=Jd;Jy=xs;var Hw={usingClientEntryPoint:!1,Events:[il,Qs,ru,$y,Zy,Jd]},wa={findFiberByHostInstance:us,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Vw={bundleType:wa.bundleType,version:wa.version,rendererPackageName:wa.rendererPackageName,rendererConfig:wa.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ir.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=tv(n),n===null?null:n.stateNode},findFiberByHostInstance:wa.findFiberByHostInstance||Fw,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ba=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ba.isDisabled&&ba.supportsFiber))try{eu=ba.inject(Vw),Di=ba}catch{}var ba;Wn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Hw;Wn.createPortal=function(n,e){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!sp(e))throw Error(ee(200));return Ow(n,e,null,t)};Wn.createRoot=function(n,e){if(!sp(n))throw Error(ee(299));var t=!1,i="",r=kx;return e!=null&&(e.unstable_strictMode===!0&&(t=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=np(n,1,!1,null,null,t,!1,i,r),n[er]=e.current,Ya(n.nodeType===8?n.parentNode:n),new rp(e)};Wn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var e=n._reactInternals;if(e===void 0)throw typeof n.render=="function"?Error(ee(188)):(n=Object.keys(n).join(","),Error(ee(268,n)));return n=tv(e),n=n===null?null:n.stateNode,n};Wn.flushSync=function(n){return xs(n)};Wn.hydrate=function(n,e,t){if(!du(e))throw Error(ee(200));return pu(null,n,e,!0,t)};Wn.hydrateRoot=function(n,e,t){if(!sp(n))throw Error(ee(405));var i=t!=null&&t.hydratedSources||null,r=!1,s="",o=kx;if(t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(s=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),e=Lx(e,null,n,1,t??null,r,!1,s,o),n[er]=e.current,Ya(n),i)for(n=0;n<i.length;n++)t=i[n],r=t._getVersion,r=r(t._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[t,r]:e.mutableSourceEagerHydrationData.push(t,r);return new fu(e)};Wn.render=function(n,e,t){if(!du(e))throw Error(ee(200));return pu(null,n,e,!1,t)};Wn.unmountComponentAtNode=function(n){if(!du(n))throw Error(ee(40));return n._reactRootContainer?(xs(function(){pu(null,null,n,!1,function(){n._reactRootContainer=null,n[er]=null})}),!0):!1};Wn.unstable_batchedUpdates=Jd;Wn.unstable_renderSubtreeIntoContainer=function(n,e,t,i){if(!du(t))throw Error(ee(200));if(n==null||n._reactInternals===void 0)throw Error(ee(38));return pu(n,e,t,!1,i)};Wn.version="18.3.1-next-f1338f8080-20240426"});var zx=qi(($C,Ux)=>{"use strict";function Dx(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Dx)}catch(n){console.error(n)}}Dx(),Ux.exports=Nx()});var Fx=qi(op=>{"use strict";var Ox=zx();op.createRoot=Ox.createRoot,op.hydrateRoot=Ox.hydrateRoot;var ZC});var Vx=qi(gu=>{"use strict";var Gw=da(),Ww=Symbol.for("react.element"),Xw=Symbol.for("react.fragment"),Yw=Object.prototype.hasOwnProperty,qw=Gw.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,jw={key:!0,ref:!0,__self:!0,__source:!0};function Hx(n,e,t){var i,r={},s=null,o=null;t!==void 0&&(s=""+t),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(i in e)Yw.call(e,i)&&!jw.hasOwnProperty(i)&&(r[i]=e[i]);if(n&&n.defaultProps)for(i in e=n.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:Ww,type:n,key:s,ref:o,props:r,_owner:qw.current}}gu.Fragment=Xw;gu.jsx=Hx;gu.jsxs=Hx});var Xn=qi((r3,Gx)=>{"use strict";Gx.exports=Vx()});var hM=pn(Fx());var Tn=pn(da());var mu=[{id:"rabbit",label:"Bunny",icon:"bunny",emoji:"\u{1F430}",color:"#ffd0e4"},{id:"panda",label:"Panda",icon:"panda",emoji:"\u{1F43C}",color:"#e5e7eb"},{id:"bear",label:"Bear",icon:"bear",emoji:"\u{1F43B}",color:"#f3dcc8"},{id:"owl",label:"Ghost",icon:"ghost",emoji:"\u{1F47B}",color:"#d9e4ff"},{id:"penguin",label:"Chick",icon:"chick",emoji:"\u{1F425}",color:"#fff4c4"},{id:"octopus",label:"Jelly",icon:"jelly",emoji:"\u{1FABC}",color:"#dcfaef"},{id:"dog",label:"Puppy",icon:"puppy",emoji:"\u{1F436}",color:"#fed7aa"},{id:"fox",label:"Hamster",icon:"hamster",emoji:"\u{1F439}",color:"#fde68a"},{id:"cat",label:"Cat",icon:"cat",emoji:"\u{1F431}",color:"#d9e4ff"},{id:"tiger",label:"Blue Cat",icon:"bluecat",emoji:"\u{1F63A}",color:"#fff4c4"},{id:"dolphin",label:"Turtle",icon:"turtle",emoji:"\u{1F422}",color:"#efe6ff"},{id:"koala",label:"Seal",icon:"seal",emoji:"\u{1F9AD}",color:"#c7d2fe"},{id:"butterfly",label:"Bee",icon:"bee",emoji:"\u{1F41D}",color:"#a5f3fc"},{id:"unicorn",label:"Sheep",icon:"sheep",emoji:"\u{1F411}",color:"#e9d5ff"},{id:"dragon",label:"Piggy",icon:"pig",emoji:"\u{1F437}",color:"#dcfaef"},{id:"alien",label:"Heart",icon:"heart",emoji:"\u{1F497}",color:"#d1fae5"},{id:"whale",label:"Whale",icon:"whale",emoji:"\u{1F433}",color:"#cfe8ff"},{id:"crab",label:"Crab",icon:"crab",emoji:"\u{1F980}",color:"#ffe1d6"},{id:"octo",label:"Octopus",icon:"octo",emoji:"\u{1F419}",color:"#ffe4f1"},{id:"jellyfish",label:"Jellyfish",icon:"jellyfish",emoji:"\u{1FABC}",color:"#dff3ff"},{id:"mole",label:"Mole",icon:"mole",emoji:"\u{1F43E}",color:"#ecdfd0"},{id:"caterpillar",label:"Caterpillar",icon:"caterpillar",emoji:"\u{1F41B}",color:"#e3f9d5"},{id:"ant",label:"Ant",icon:"ant",emoji:"\u{1F41C}",color:"#e2e8f0"},{id:"worm",label:"Worm",icon:"worm",emoji:"\u{1FAB1}",color:"#ffedd5"},{id:"cloud",label:"Cloud",icon:"cloud",emoji:"\u2601\uFE0F",color:"#dbeafe"},{id:"cupcake",label:"Cupcake",icon:"cupcake",emoji:"\u{1F9C1}",color:"#fce7f3"},{id:"snowman",label:"Snowman",icon:"snowman",emoji:"\u26C4",color:"#e0f2fe"},{id:"moon",label:"Moon",icon:"moon",emoji:"\u{1F319}",color:"#ede9fe"},{id:"sun",label:"Sun",icon:"sun",emoji:"\u2600\uFE0F",color:"#fff1c1"},{id:"toast",label:"Toast",icon:"toast",emoji:"\u{1F35E}",color:"#fef3c7"},{id:"melon",label:"Melon",icon:"melon",emoji:"\u{1F349}",color:"#dcfce7"},{id:"flower",label:"Flower",icon:"flower",emoji:"\u{1F338}",color:"#fde2ef"},{id:"floaty",label:"Floaty",icon:"floaty",emoji:"\u{1F6DF}",color:"#dbeafe"},{id:"bulb",label:"Light Bulb",icon:"bulb",emoji:"\u{1F4A1}",color:"#cffafe"},{id:"sunflower",label:"Sunflower",icon:"sunflower",emoji:"\u{1F33B}",color:"#dcfce7"},{id:"muncher",label:"Muncher",icon:"muncher",emoji:"\u{1F36A}",color:"#e0f2fe"},{id:"swimbunny",label:"Swim Bunny",icon:"swimbunny",emoji:"\u{1F407}",color:"#fff4c4"},{id:"sunny",label:"Sunny Cloud",icon:"sunny",emoji:"\u26C5",color:"#fff1c1"},{id:"smiley",label:"Smiley",icon:"smiley",emoji:"\u{1F642}",color:"#e9d5ff"},{id:"puff",label:"Puff",icon:"puff",emoji:"\u{1F4AD}",color:"#fecdd3"},{id:"sob",label:"Sob",icon:"sob",emoji:"\u{1F62D}",color:"#e0f2fe"},{id:"giggles",label:"Giggles",icon:"giggles",emoji:"\u{1F606}",color:"#fff4c4"},{id:"teary",label:"Teary",icon:"teary",emoji:"\u{1F97A}",color:"#ede9fe"},{id:"dizzy",label:"Dizzy",icon:"dizzy",emoji:"\u{1F635}",color:"#dcfce7"},{id:"blush",label:"Blush",icon:"blush",emoji:"\u{1F60A}",color:"#ccfbf1"},{id:"lovey",label:"Lovey",icon:"lovey",emoji:"\u{1F60D}",color:"#fef3c7"},{id:"cheeky",label:"Cheeky",icon:"cheeky",emoji:"\u{1F61C}",color:"#dbeafe"},{id:"grumpy",label:"Grumpy",icon:"grumpy",emoji:"\u{1F620}",color:"#e2e8f0"}];function So(n){return mu.find(e=>e.id===n)??mu[0]}function sl(n){return`/icons/av-${So(n).icon}.png`}function Bx(n){return`/icons/av-${So(n).icon}-back.png`}var ap=pn(Xn());function ol({id:n,size:e=40,border:t=e>=36?3:2,shadow:i=e>=36,style:r,className:s}){let o=So(n);return(0,ap.jsx)("span",{className:s,style:{display:"inline-grid",placeItems:"center",flex:"none",width:e,height:e,borderRadius:"50%",border:`${t}px solid var(--ink)`,background:o.color,boxShadow:i?`0 ${Math.max(2,Math.round(e/14))}px 0 var(--ink)`:void 0,overflow:"hidden",...r},children:(0,ap.jsx)("img",{src:sl(n),alt:o.label,draggable:!1,style:{width:"84%",height:"84%",objectFit:"contain",pointerEvents:"none"}})})}var Wx=n=>`/icons/${n}.png`;var Xx=pn(Xn());function al({name:n,size:e,alt:t="",style:i,className:r}){return(0,Xx.jsx)("img",{src:Wx(n),alt:t,draggable:!1,className:`ec-icon${r?` ${r}`:""}`,style:e!==void 0?{width:e,height:e,...i}:i})}var rr=[{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"},{en:"Shinkansen Dash",ja:"\u3057\u3093\u304B\u3093\u305B\u3093\u30C0\u30C3\u30B7\u30E5"},{en:"Ninja Rooftops",ja:"\u3057\u306E\u3073\u30EB\u30FC\u30D5"},{en:"Matsuri Carousel",ja:"\u304A\u307E\u3064\u308A\u30AB\u30EB\u30FC\u30BB\u30EB"},{en:"Ramen Slide",ja:"\u30E9\u30FC\u30E1\u30F3\u30B9\u30E9\u30A4\u30C0\u30FC"},{en:"Onsen Hop",ja:"\u304A\u3093\u305B\u3093\u30DB\u30C3\u30D7"}];var $w={title:"Chatto Dash",blurb:"Race through five wild obstacle courses. Points for every finish. Most points wins!",players:"Racers",join:"JOIN THE RACE!",leave:"Leave",start:"START!",cancel:"Cancel",waitingHost:"Waiting for the host to start\u2026",courses:"This time's five courses",howTouch:"Left thumb to run \xB7 JUMP \xB7 DIVE",howKeys:"WASD or arrows to run \xB7 Space to jump \xB7 Shift to dive",round:"Round",getReady:"Get ready!",go:"GO!",jump:"JUMP",dive:"DIVE",finished:"FINISHED!",waitingOthers:"Waiting for the others\u2026",hurry:"Hurry!",watching:"Watching",end:"End",endConfirm:"End the game for everyone?",results:"Results",standings:"Standings",nextIn:"Next course in",nextNow:"Next course",practice:"Practice",practiceBlurb:"Any course, by yourself, against the clock. No connection needed.",best:"Best",noBest:"not run yet",newBest:"New best!",again:"Again",allCourses:"Courses",dnf:"did not finish",pts:"pts",winner:"WINNER!",tie:"IT'S A TIE!",finalResults:"Final results",playAgain:"PLAY AGAIN",close:"Close",minimize:"Minimize",soundOff:"Music off",soundOn:"Music on",resume:"Resume Chatto Dash",loading:"Building the course\u2026",noWebgl:"This device can't draw the 3D course.",raceOn:"A race is on!",watch:"WATCH"},Zw={title:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5",blurb:"5\u3064\u306E\u30CF\u30C1\u30E3\u30E1\u30C1\u30E3\u969C\u5BB3\u7269\u30B3\u30FC\u30B9\u3092\u8D70\u308A\u306C\u3051\uFF01\u30B4\u30FC\u30EB\u3059\u308B\u305F\u3073\u30DD\u30A4\u30F3\u30C8\u3002\u3044\u3061\u3070\u3093\u591A\u3044\u4EBA\u304C\u512A\u52DD\uFF01",players:"\u30E9\u30F3\u30CA\u30FC",join:"\u30EC\u30FC\u30B9\u306B\u53C2\u52A0\uFF01",leave:"\u306C\u3051\u308B",start:"\u30B9\u30BF\u30FC\u30C8\uFF01",cancel:"\u30AD\u30E3\u30F3\u30BB\u30EB",waitingHost:"\u30DB\u30B9\u30C8\u306E\u30B9\u30BF\u30FC\u30C8\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",courses:"\u4ECA\u56DE\u306E5\u3064\u306E\u30B3\u30FC\u30B9",howTouch:"\u5DE6\u306E\u89AA\u6307\u3067\u8D70\u308B \xB7 \u30B8\u30E3\u30F3\u30D7 \xB7 \u30C0\u30A4\u30D6",howKeys:"WASD\u30FB\u77E2\u5370\u3067\u8D70\u308B \xB7 \u30B9\u30DA\u30FC\u30B9\u3067\u30B8\u30E3\u30F3\u30D7 \xB7 \u30B7\u30D5\u30C8\u3067\u30C0\u30A4\u30D6",round:"\u30E9\u30A6\u30F3\u30C9",getReady:"\u3088\u30FC\u3044\u2026",go:"\u30C9\u30F3\uFF01",jump:"\u30B8\u30E3\u30F3\u30D7",dive:"\u30C0\u30A4\u30D6",finished:"\u30B4\u30FC\u30EB\uFF01",waitingOthers:"\u307F\u3093\u306A\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",hurry:"\u3044\u305D\u3052\uFF01",watching:"\u89B3\u6226\u4E2D",end:"\u7D42\u4E86",endConfirm:"\u307F\u3093\u306A\u306E\u30B2\u30FC\u30E0\u3092\u7D42\u4E86\u3057\u307E\u3059\u304B\uFF1F",results:"\u7D50\u679C",standings:"\u7DCF\u5408\u9806\u4F4D",nextIn:"\u6B21\u306E\u30B3\u30FC\u30B9\u307E\u3067",nextNow:"\u6B21\u306E\u30B3\u30FC\u30B9\u3078",practice:"\u308C\u3093\u3057\u3085\u3046",practiceBlurb:"\u597D\u304D\u306A\u30B3\u30FC\u30B9\u3092\u3072\u3068\u308A\u3067\u30BF\u30A4\u30E0\u30A2\u30BF\u30C3\u30AF\u3002\u901A\u4FE1\u306A\u3057\u3067\u904A\u3079\u307E\u3059\u3002",best:"\u30D9\u30B9\u30C8",noBest:"\u307E\u3060\u8D70\u3063\u3066\u3044\u307E\u305B\u3093",newBest:"\u30D9\u30B9\u30C8\u66F4\u65B0\uFF01",again:"\u3082\u3046\u4E00\u56DE",allCourses:"\u30B3\u30FC\u30B9\u4E00\u89A7",dnf:"\u30B4\u30FC\u30EB\u3067\u304D\u305A",pts:"\u70B9",winner:"\u512A\u52DD\uFF01",tie:"\u5F15\u304D\u5206\u3051\uFF01",finalResults:"\u6700\u7D42\u7D50\u679C",playAgain:"\u3082\u3046\u4E00\u56DE",close:"\u9589\u3058\u308B",minimize:"\u6700\u5C0F\u5316",soundOff:"\u97F3\u697D\u3092\u30AA\u30D5",soundOn:"\u97F3\u697D\u3092\u30AA\u30F3",resume:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5\u3092\u518D\u958B",loading:"\u30B3\u30FC\u30B9\u3092\u6E96\u5099\u4E2D\u2026",noWebgl:"\u3053\u306E\u7AEF\u672B\u3067\u306F3D\u30B3\u30FC\u30B9\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093\u3002",raceOn:"\u30EC\u30FC\u30B9\u4E2D\uFF01",watch:"\u89B3\u6226\u3059\u308B"},ll=n=>n==="ja"?Zw:$w;function lp(n,e){if(e==="ja")return`${n}\u4F4D`;let t=n%100;return t>=11&&t<=13?`${n}th`:`${n}${["th","st","nd","rd"][n%10]??"th"}`}function wo(n){let e=Math.max(0,n),t=Math.floor(e/60),i=e-t*60;return`${t}:${i<10?"0":""}${i.toFixed(1)}`}var cl=pn(Xn()),Yx="o-shootingstar";function qx({children:n,onBackdrop:e}){return(0,cl.jsx)("div",{className:"ec-sheet-backdrop",style:{zIndex:95,alignItems:"center",padding:16},onClick:e,children:(0,cl.jsx)("div",{className:"ec-card",style:{width:"100%",maxWidth:380,maxHeight:"92dvh",overflowY:"auto",padding:"20px 16px 16px",textAlign:"center",background:"var(--paper)",animation:"ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)"},onClick:t=>t.stopPropagation(),children:n})})}var Lt=pn(da());var Eo=1/60,Kw=30,Jw=11,Qw=6.4,jx=8.6,ul=.42,$x=.26,cp=1.15,eb=50,tb=22,nb=6,ib=.4,rb=.35,sb=8,xn={x:0,y:0,z:0,yaw:0},dt={x:0,y:0,z:0,yaw:0},up={x:0,y:0,z:0,yaw:0},bo={x:0,y:0,z:0,yaw:0};function or(n,e,t){return n.motion?n.motion(e,t):(t.x=n.x,t.y=n.y,t.z=n.z,t.yaw=n.yaw),t}function Kx(n,e,t){if(n.shape!=="ramp")return e.y+n.hy;let i=Math.max(-n.hz,Math.min(n.hz,t));return e.y+n.hy+n.rise*(n.hz-i)/(2*n.hz)}function Jx(n,e){let t=Math.floor((e-n.bucketZ0)/8);return n.buckets[t]??ob}var ob=[];function To(n,e,t,i,r){let s=n.checkpoints[Math.max(0,Math.min(n.checkpoints.length-1,e))],o=Math.min(sb,Math.max(1,i)),a=Math.floor(t/o),l=t%o;r.x=s.x+((l+.5)/o-.5)*s.width,r.y=s.y+.02,r.z=s.z+.6+a*1.1}function Qx(n,e=0,t=1){let i={x:0,y:0,z:0,vx:0,vy:0,vz:0,fx:0,fz:-1,grounded:!1,ground:-1,coyote:0,jumpBuffer:0,jumpHeld:!1,diveHeld:!1,mode:0,modeT:0,diveCooldown:0,shield:0,checkpoint:0,slot:e,slots:t,events:0,falls:0};return To(n,0,e,t,i),i}function Zx(n,e,t,i,r,s,o,a){n.vx=e*i+r*.7,n.vz=t*i+s*.7,n.vy=o,n.grounded=!1,n.ground=-1,n.coyote=0,n.events|=4,a&&n.mode!==4?(n.mode=2,n.modeT=.75,n.shield=.35):n.shield=.2}function e_(n,e,t,i,r){e.events=0;let s=i+r;if(e.mode===3){e.modeT-=r,e.modeT<=0&&(To(n,e.checkpoint,e.slot,e.slots,e),e.vx=e.vy=e.vz=0,e.fx=0,e.fz=-1,e.mode=0,e.shield=1.2,e.grounded=!1,e.ground=-1);return}e.coyote=Math.max(0,e.coyote-r),e.jumpBuffer=Math.max(0,e.jumpBuffer-r),e.diveCooldown=Math.max(0,e.diveCooldown-r),e.shield=Math.max(0,e.shield-r);let o=n.solids,a=0,l=0,c=0,u=1,h=!1;if(e.grounded&&e.ground>=0){let A=o[e.ground];if(A.motion){or(A,i,xn),or(A,s,dt);let _=e.x-xn.x,S=e.z-xn.z,z=Math.cos(xn.yaw),N=Math.sin(xn.yaw),F=_*z-S*N,X=_*N+S*z,O=Math.cos(dt.yaw),Z=Math.sin(dt.yaw),G=dt.x+F*O+X*Z,re=dt.z-F*Z+X*O;Math.abs(G-e.x)+Math.abs(re-e.z)+Math.abs(dt.y-xn.y)<1.5&&(a=(G-e.x)/r,c=(re-e.z)/r,l=(dt.y-xn.y)/r,e.x=G,e.z=re,e.y+=dt.y-xn.y);let te=dt.yaw-xn.yaw;if(te!==0){let ce=Math.cos(te),Oe=Math.sin(te),Fe=e.fx*ce+e.fz*Oe;e.fz=-e.fx*Oe+e.fz*ce,e.fx=Fe}}else dt.yaw=A.yaw;let L=A.surface;if(L){if(L.conveyor){let _=Math.cos(dt.yaw),S=Math.sin(dt.yaw),z=L.conveyor[0]*_+L.conveyor[1]*S,N=-L.conveyor[0]*S+L.conveyor[1]*_;e.x+=z*r,e.z+=N*r,a+=z,c+=N}L.speed!==void 0&&(u=L.speed),L.ice&&(h=!0)}}t.jump&&!e.jumpHeld&&(e.jumpBuffer=.14);let d=t.dive&&!e.diveHeld;e.jumpHeld=t.jump,e.diveHeld=t.dive;let p=t.mx,m=t.mz,x=Math.hypot(p,m);x>1&&(p/=x,m/=x);let g=e.mode===0,f=!1;if(g){let A=(e.grounded?h?nb:eb:tb)*r,L=Qw*(e.grounded?u:1),_=p*L,S=m*L,z=_-e.vx,N=S-e.vz,F=Math.hypot(z,N);if(F<=A||F===0?(e.vx=_,e.vz=S):(e.vx+=z/F*A,e.vz+=N/F*A),x>.15&&(e.fx=p/Math.min(1,x),e.fz=m/Math.min(1,x)),e.jumpBuffer>0&&(e.grounded||e.coyote>0)&&(e.vy=Jw+Math.max(0,l),e.vx+=a,e.vz+=c,e.grounded=!1,e.ground=-1,e.coyote=0,e.jumpBuffer=0,e.events|=1,f=!0),d&&e.diveCooldown<=0){let X=x>.2?p/x:e.fx,O=x>.2?m/x:e.fz;e.vx=X*jx+(e.grounded?a:0),e.vz=O*jx+(e.grounded?c:0),e.vy=e.grounded?5:Math.max(e.vy,3),e.fx=X,e.fz=O,e.mode=1,e.modeT=0,e.grounded=!1,e.ground=-1,e.coyote=0,e.events|=128,f=!0}}else if(e.grounded){let A=(h?3:e.mode===4?30:e.mode===1?16:11)*r,L=Math.hypot(e.vx,e.vz),_=L>A?(L-A)/L:0;e.vx*=_,e.vz*=_,e.modeT-=r,e.mode===1?e.modeT<-.5&&(e.mode=0,e.diveCooldown=.3):e.mode===2&&e.modeT<=0&&(e.mode=0)}else e.mode===2&&(e.modeT-=r);e.vy=Math.max(-45,e.vy-Kw*r);for(let A of n.winds){if(e.x<A.x0||e.x>A.x1||e.z<A.z0||e.z>A.z1||e.y<A.y0||e.y>A.y1)continue;let L=(A.pulse?A.pulse(i):1)*(e.grounded?.8:1)*r;e.x+=A.ax*L,e.z+=A.az*L}let v=e.grounded&&!f,y=e.y;e.x+=e.vx*r,e.y+=e.vy*r,e.z+=e.vz*r;let M=-1/0,R=-1,T=0,b=Jx(n,e.z);for(let A=0;A<2;A++){for(let L=0;L<b.length;L++){let _=o[b[L]];if(e.z<_.zMin-1||e.z>_.zMax+1||_.active&&_.active(s)===0)continue;or(_,s,dt);let S=e.x-dt.x,z=e.z-dt.z,N=Math.cos(dt.yaw),F=Math.sin(dt.yaw),X=S*N-z*F,O=S*F+z*N,Z=0,G=0,re=0,te=0;if(_.shape==="cyl")te=Math.hypot(X,O),re=Math.max(0,te-_.hx),te>0?(Z=X/te,G=O/te):Z=1;else{let he=Math.max(-_.hx,Math.min(_.hx,X)),we=Math.max(-_.hz,Math.min(_.hz,O));Z=X-he,G=O-we,re=Math.hypot(Z,G),re>0&&(Z/=re,G/=re)}if(re>=ul)continue;let ce=Kx(_,dt,O),Oe=dt.y-_.hy,Fe=0;_.motion&&(or(_,i,xn),Fe=dt.y-xn.y);let q=v?ib:.08;if(A===0){re<$x&&e.vy<=Math.max(0,Fe/r)+.01&&y>=ce-q-Math.max(0,Fe)&&e.y<=ce+(v?rb:0)&&ce>M&&(M=ce,R=_.index,T=Fe);continue}if(_.index===R||e.y>=ce-.02||e.y+cp<=Oe||!_.bumper&&ce-e.y<=q)continue;if(y+cp<=Oe+.06&&e.vy>0&&re<$x){e.y=Oe-cp,e.vy=0;continue}let J=ul-re;if(re===0)if(_.shape==="cyl")J=_.hx-te+ul;else{let he=_.hx-Math.abs(X),we=_.hz-Math.abs(O);he<we?(Z=X<0?-1:1,G=0,J=he+ul):(Z=0,G=O<0?-1:1,J=we+ul)}let ue=Z*N+G*F,Y=-Z*F+G*N;e.x+=ue*J,e.z+=Y*J;let ae=e.vx*ue+e.vz*Y;if(ae<0&&(e.vx-=ue*ae,e.vz-=Y*ae),_.bumper&&e.shield<=0){let he=0,we=0;if(_.motion){let Ge=Math.cos(xn.yaw),Pe=Math.sin(xn.yaw),P=xn.x+X*Ge+O*Pe,dn=xn.z-X*Pe+O*Ge;he=(e.x-ue*J-P)/r,we=(e.z-Y*J-dn)/r}Zx(e,ue,Y,_.bumper,he,we,_.tumble?7:5.5,!!_.tumble)}}if(A===0&&R>=0){let L=o[R];e.y=M,L.surface?.bounce?(e.vy=L.surface.bounce,e.grounded=!1,e.ground=-1,e.events|=16,e.mode===1&&(e.mode=0,e.diveCooldown=.2),R=-1):(v||(e.events|=2,e.mode===1&&(e.modeT=0)),e.vy=Math.max(0,T/r),e.grounded=!0,e.ground=R,e.coyote=.1)}else A===0&&(e.grounded=!1,e.ground=-1)}if(e.grounded||(e.ground=-1),e.shield<=0&&e.mode!==4)for(let A of n.balls){if(e.z<A.zMin-2||e.z>A.zMax+2||A.active&&!A.active(s))continue;A.pos(s,bo);let L=e.x-bo.x,_=e.y+.6-bo.y,S=e.z-bo.z,z=A.r+.5;if(L*L+_*_+S*S>=z*z)continue;A.pos(i,up);let N=(bo.x-up.x)/r,F=(bo.z-up.z)/r,X=L,O=S,Z=Math.hypot(X,O);Z<.05&&(X=N,O=F,Z=Math.hypot(X,O)||1),Zx(e,X/Z,O/Z,A.power*.6,N,F,7.5,!0),e.modeT=.8,e.shield=.45;break}if(e.y<n.killY){e.events|=8,e.falls++,e.mode!==4?(e.mode=3,e.modeT=.55):(e.x=n.finish.x,e.y=n.finish.y+.05,e.z=n.finish.z,e.vx=e.vy=e.vz=0);return}if(e.grounded&&e.mode!==4){let A=n.checkpoints;for(let _=A.length-1;_>e.checkpoint;_--){let S=A[_];if(Math.abs(e.z-S.z)<2.6&&Math.abs(e.x-S.x)<S.width/2+1.2&&Math.abs(e.y-S.y)<1.2){e.checkpoint=_,e.events|=32;break}}let L=n.finish;Math.abs(e.x-L.x)<=L.hx&&Math.abs(e.z-L.z)<=L.hz&&Math.abs(e.y-L.y)<1.5&&(e.mode=4,e.events|=64)}}function xp(n,e,t,i,r){let s=-1/0,o=Jx(n,i);for(let a=0;a<o.length;a++){let l=n.solids[o[a]];if(l.active&&l.active(r)===0)continue;or(l,r,dt);let c=e-dt.x,u=i-dt.z,h=Math.cos(dt.yaw),d=Math.sin(dt.yaw),p=c*h-u*d,m=c*d+u*h;if(l.shape==="cyl"){if(p*p+m*m>l.hx*l.hx)continue}else if(Math.abs(p)>l.hx||Math.abs(m)>l.hz)continue;let x=Kx(l,dt,m);x<=t+.45&&x>s&&(s=x)}return s}function _p(n,e,t,i){let r=n.path,s=1/0,o=0;for(let a=0;a<r.length-1;a++){let l=r[a],c=r[a+1],u=c.x-l.x,h=c.y-l.y,d=c.z-l.z,p=u*u+h*h+d*d||1,m=((e-l.x)*u+(t-l.y)*h+(i-l.z)*d)/p;m=Math.max(0,Math.min(1,m));let x=e-(l.x+u*m),g=(t-(l.y+h*m))*.5,f=i-(l.z+d*m),v=x*x+g*g+f*f;v<s&&(s=v,o=n.pathLen[a]+Math.sqrt(p)*m)}return Math.max(0,Math.min(1,o/n.pathTotal))}var Xt="#1d1b4f",an="#fff8ec",bs="#3b6bff",Mi="#d9e4ff",We="#ff7ab6",qe="#ffd0e4",Re="#ffd23f",Xe="#fff4c4",ai="#3fdcb0",Tt="#dcfaef",Si="#a77bff",Ao="#efe6ff",Mt="#ff4f6d",se="#ffffff",yu=Math.PI*2;function Kt(n,e,t=0){let{x:i,y:r,z:s,yaw:o}=n;return n.motion=(a,l)=>{l.x=i,l.y=r,l.z=s,l.yaw=o+t+e*a},n}function vt(n,e,t,i,r,s=0){let{x:o,y:a,z:l,yaw:c}=n;return n.motion=(u,h)=>{let d=.5-.5*Math.cos(yu*(u/r+s));h.x=o+e*d,h.y=a+t*d,h.z=l-i*d,h.yaw=c},n}function hl(n,e,t,i=0,r=!1){let{x:s,y:o,z:a,yaw:l}=n;return n.motion=(c,u)=>{let h=i+t*c;u.x=s+Math.cos(h)*e,u.y=o,u.z=a-Math.sin(h)*e,u.yaw=r?l+h:l},n}function t_(n,e,t,i,r,s=0){let{x:o,y:a,z:l,yaw:c}=n;return n.motion=(u,h)=>{let d=((u/r+s)%1+1)%1;h.x=o+e*d,h.y=a+t*d,h.z=l-i*d,h.yaw=c},n}function fl(n,e,t,i,r,s,o,a=0){let{y:l}=n;return n.motion=(c,u)=>{let h=.5-.5*Math.cos(yu*(c/o+a)),d=r+(s-r)*h;u.x=e+Math.cos(d)*i/2,u.y=l,u.z=-t-Math.sin(d)*i/2,u.yaw=d},n}function n_(n,e,t,i=0){let{x:r,y:s,z:o,yaw:a}=n;return n.motion=(l,c)=>{let u=i+t*l;c.x=r,c.y=s+Math.sin(u)*e,c.z=o-Math.cos(u)*e,c.yaw=a},n}function dl(n,e,t=0){return i=>{let r=((i+t*n)%n+n)%n;return r>=e?0:r>=e-.7?1:2}}var Pt=class{constructor(e,t,i,r,s,o=-9){this.id=e;this.name=t;this.tagline=i;this.theme=r;this.timeLimit=s;this.killY=o;this.solids=[];this.balls=[];this.winds=[];this.checkpoints=[];this.decor=[];this.path=[];this.finishBox=null}add(e,t,i,r,s,o,a,l,c){let u={shape:e,x:t,y:i,z:r,hx:s,hy:o,hz:a,rise:l,yaw:c.yaw??0,color:c.color??this.theme.floor,look:c.look??"floor",surface:c.surface,bumper:c.bumper,tumble:c.tumble,motion:c.motion,active:c.active,zMin:0,zMax:0,index:this.solids.length};return this.solids.push(u),u}box(e,t,i,r,s,o,a={}){return this.add("box",e,t-s/2,-i,r/2,s/2,o/2,0,a)}cyl(e,t,i,r,s,o={}){return this.add("cyl",e,t-s/2,-i,r,s/2,r,0,o)}ramp(e,t,i,r,s,o,a={}){return this.add("ramp",e,r-.6/2,-(t+i)/2,o/2,.6/2,(i-t)/2,s-r,a)}roller(e,t,i,r,s,o={}){let[a,l,c]=t,[u,h,d]=i,p={r:e,power:11,color:se,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=((m/r+s)%1+1)%1;x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(d-c)*g),x.yaw=g*Math.hypot(u-a,d-c)/e},...o};return this.balls.push(p),p}shuttle(e,t,i,r,s,o={}){let[a,l,c]=t,[u,h,d]=i,p={r:e,power:11,color:se,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=.5-.5*Math.cos(yu*(m/r+s));x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(d-c)*g),x.yaw=g*Math.hypot(u-a,d-c)/e},...o};return this.balls.push(p),p}hopper(e,t,i,r,s,o,a,l,c={}){let[u,h]=t,[d,p]=i,m={r:e,power:10,color:se,look:"mochi",zMin:0,zMax:0,pos:(x,g)=>{let f=((x/a+l)%1+1)%1;g.x=u+(d-u)*f,g.y=r+e+s*Math.abs(Math.sin(Math.PI*o*f)),g.z=-(h+(p-h)*f),g.yaw=0},...c};return this.balls.push(m),m}lantern(e,t,i,r,s,o,a,l){let c={r:.85,power:12,color:l,look:"lantern",zMin:0,zMax:0,anchor:{x:e,y:t,z:-i},pos:(u,h)=>{let d=s*Math.sin(yu*(u/o+a));h.x=e+Math.sin(d)*r,h.y=t-Math.cos(d)*r,h.z=-i,h.yaw=d}};return this.balls.push(c),c}wind(e,t,i,r,s,o,a,l,c){let u={x0:e,x1:t,y0:s,y1:o,z0:-r,z1:-i,ax:a,az:-l,pulse:c};return this.winds.push(u),u}checkpoint(e,t,i,r){this.checkpoints.push({x:e,y:t,z:-i,width:r}),this.way(e,t,i)}finish(e,t,i,r,s){this.finishBox={x:e,y:t,z:-i,hx:r/2,hz:s/2},this.way(e,t,i)}way(e,t,i){this.path.push({x:e,y:t,z:-i})}deco(e,t,i,r,s=1,o=se){this.decor.push({kind:e,x:t,y:i,z:-r,s,color:o})}build(){if(!this.finishBox)throw new Error(`${this.id}: no finish`);if(this.checkpoints.length===0)throw new Error(`${this.id}: no start`);let e={x:0,y:0,z:0,yaw:0},t=1/0,i=-1/0;for(let l of this.solids){let c=l.shape==="cyl"?l.hx:Math.hypot(l.hx,l.hz);l.zMin=1/0,l.zMax=-1/0;for(let u=0;u<=(l.motion?60:0);u+=.05)or(l,u,e),l.zMin=Math.min(l.zMin,e.z-c),l.zMax=Math.max(l.zMax,e.z+c);t=Math.min(t,l.zMin),i=Math.max(i,l.zMax)}for(let l of this.balls){l.zMin=1/0,l.zMax=-1/0;for(let c=0;c<=60;c+=.05)l.pos(c,e),l.zMin=Math.min(l.zMin,e.z-l.r),l.zMax=Math.max(l.zMax,e.z+l.r)}let r=Math.floor(t/8)*8-8,s=Math.ceil((i-r)/8)+2,o=Array.from({length:s},()=>[]);for(let l of this.solids){let c=Math.max(0,Math.floor((l.zMin-1.5-r)/8)),u=Math.min(s-1,Math.floor((l.zMax+1.5-r)/8));for(let h=c;h<=u;h++)o[h].push(l.index)}let a=[0];for(let l=1;l<this.path.length;l++){let c=this.path[l-1],u=this.path[l];a.push(a[l-1]+Math.hypot(u.x-c.x,u.y-c.y,u.z-c.z))}return{id:this.id,name:this.name,tagline:this.tagline,theme:this.theme,solids:this.solids,balls:this.balls,winds:this.winds,checkpoints:this.checkpoints,finish:this.finishBox,path:this.path,killY:this.killY,decor:this.decor,timeLimit:this.timeLimit,buckets:o,bucketZ0:r,pathLen:a,pathTotal:a[a.length-1]||1}}};function i_(){let n=new Pt("kaiten-rush",{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Ride the belts. Mind the plates!",ja:"\u30D9\u30EB\u30C8\u306B\u4E57\u3063\u3066\u9032\u3081\u3002\u304A\u76BF\u306B\u6CE8\u610F\uFF01"},{sky:["#ffd9e8",an],fog:"#fff1e6",floor:Xe,floorAlt:qe,accent:We,accent2:ai},110);n.box(0,0,3.5,12,1,13,{color:qe}),n.checkpoint(0,0,3.5,9),n.box(-3.6,0,25,3.2,1,30,{look:"belt",color:Tt,surface:{conveyor:[0,-3]}}),n.box(0,0,25,3.2,1,30,{look:"belt",color:qe,surface:{conveyor:[0,3]}}),n.box(3.6,0,25,3.2,1,30,{look:"belt",color:Mi,surface:{conveyor:[0,-1.2]}});for(let[t,i]of[[-4.3,17],[-2.9,26],[-4.3,35]])n.cyl(t,.9,i,.7,.9,{look:"plate",color:se,bumper:7});n.box(-5.4,.9,25,.4,.9,30,{look:"rail",color:We});for(let[t,i]of[[18,0],[28,.5]])vt(n.box(6.4,1.1,t,2.4,1.1,2.2,{look:"pusher",color:We}),-3.4,0,0,2.6,i);n.way(-3.6,0,11),n.way(-2.7,0,17),n.way(-4.5,0,26),n.way(-2.7,0,35),n.box(0,0,43,12,1,6,{color:qe}),n.checkpoint(0,0,42.5,8),[4,-4,-4,4,4,-4,4,-4,-4,4].forEach((t,i)=>{n.box(0,0,47.5+i*3,11,1,3,{look:"belt",color:i%2?Tt:Xe,surface:{conveyor:[t,0]}})});for(let[t,i]of[[-2,52],[2.5,58],[-3,64],[1,70],[-.5,61]])n.cyl(t,1.1,i,.5,1.1,{look:"bumper",color:Mt,bumper:6.5});n.box(0,0,79,12,1,6,{color:qe}),n.checkpoint(0,0,78.5,8),vt(n.cyl(-3.5,0,86,2.2,.6,{look:"plate",color:se}),7,0,0,5.2,0),n.box(0,0,92,5,1,3.5,{color:Tt}),vt(n.cyl(-3.5,0,98,2.2,.6,{look:"plate",color:se}),7,0,0,4.6,.4),n.box(0,0,104,5,1,3.5,{color:Tt}),vt(n.cyl(-3.5,0,110,2.2,.6,{look:"plate",color:se}),7,0,0,5.6,.75),n.way(0,0,86),n.way(0,0,92),n.way(0,0,98),n.way(0,0,104),n.way(0,0,110),n.box(0,0,116,12,1,6,{color:qe}),n.checkpoint(0,0,115.5,8),n.box(0,0,134.5,9,1,31,{look:"belt",color:Tt,surface:{conveyor:[0,-4.5]}});for(let[t,i]of[[126,1.8],[135,-2.1],[144,2]])Kt(n.box(0,.8,t,8.6,.72,.5,{look:"bar",color:Re,bumper:9,tumble:!0}),i,t),n.cyl(0,1.2,t,.5,1.2,{look:"bumper",color:We});n.box(0,0,155,12,1,10,{look:"finish",color:se}),n.finish(0,0,156,12,8);for(let t=8;t<160;t+=19)n.deco("sushi",t%2?-11:11,1+t%5,t,1.6,t%3?We:ai),n.deco("cloud",t%2?13:-13,6+t%4,t+8,2.2,se);return n.build()}function r_(){let n="#fff0d4",e="#ff9a5c",t=new Pt("matsuri-carousel",{en:"Matsuri Carousel",ja:"\u304A\u307E\u3064\u308A\u30AB\u30EB\u30FC\u30BB\u30EB"},{en:"Ride the rides. Mind the fireworks!",ja:"\u4E57\u308A\u3082\u306E\u306B\u4E57\u3063\u3066\u9032\u3081\u3002\u82B1\u706B\u306B\u6CE8\u610F\uFF01"},{sky:["#ffc7d6",an],fog:"#fff0ea",floor:n,floorAlt:qe,accent:e,accent2:Si},140);t.box(0,0,3.5,12,1,13,{color:qe}),t.checkpoint(0,0,3.5,9);let i=Math.PI*2;[[17.5,.8],[31.5,-.8]].forEach(([c,u],h)=>{t.cyl(0,0,c,1.4,1,{look:"drum",color:h?Re:Mt});for(let d=0;d<3;d++)hl(t.cyl(0,0,c,1.7,.6,{look:"plate",color:d%2?Xe:se}),5,u,d/3*i+h*.6,!1);t.way(0,0,c)}),t.way(0,0,37),t.box(0,0,42.2,12,1,7.6,{color:qe}),t.checkpoint(0,0,42.5,8),t.box(0,0,62,7,1,32),[[-2.2,2.2],[0],[-2.2,0],[2.2],[0,2.2],[-2.2]].forEach((c,u)=>{let h=51+u*5;c.forEach((d,p)=>{t.cyl(d,.2,h,.55,.2,{look:"bumper",color:u%2?Si:e}),t.shuttle(.75,[d,-4.6,h],[d,3.6,h],2.2+u%3*.3,u*.23+p*.5,{look:"shot",color:[Re,We,ai][(u+p)%3],power:9})})}),t.box(0,0,81.75,12,1,7.5,{color:qe}),t.checkpoint(0,0,80.5,8);let s=88.5,o=6;for(let c=0;c<6;c++)n_(t.box(0,o,s,2.8,.4,2.8,{look:"tile",color:[qe,Xe,Tt][c%3]}),o,.45,c/6*i);for(let c of[-3.3,3.3])t.box(c,o+.4,s,.5,o+7.4,.5,{look:"wall",color:e});t.box(0,o+.4,s,7.1,.8,.8,{look:"bar",color:Re}),t.box(0,6,99.2,8,1,5.6),t.way(0,0,s),t.way(0,6,s+o),t.way(0,6,99.2),t.ramp(0,102,114,6,0,8,{look:"ice",color:"#ffe3ef",surface:{ice:!0}}),t.lantern(0,10.4,106,6.4,.8,2.8,0,We),t.lantern(0,7.9,111,6.4,.8,2.8,.5,Re),t.box(0,0,117,12,1,6,{color:qe}),t.checkpoint(0,0,116.5,8);let a=128;Kt(t.cyl(0,0,a,7.2,.8,{look:"disc",color:Xe}),.7,0);for(let c=0;c<4;c++)hl(t.box(0,.9,a,4.4,.9,.5,{look:"wall",color:c%2?We:ai,bumper:5.5}),3.6,.7,c/4*i,!0);t.cyl(0,3,a,1.2,3,{look:"drum",color:Mt}),t.way(4.2,0,a),t.box(0,0,139,8,1,6),t.lantern(0,7.6,139,6.6,.8,3,.2,Si);let l=.35;for(let c=1;c<=4;c++)t.box(0,c*l,141.4+c*1.2,8,c*l+1,1.2,{color:c%2?n:Xe});t.way(0,0,139),t.box(0,4*l,153.4,12,1,13.2,{look:"finish",color:se}),t.finish(0,4*l,156,12,8);for(let c=6;c<160;c+=15)t.deco("lantern",c%2?-9.5:9.5,5+c%3,c,1.3,c%3?Mt:Re),t.deco("flag",c%2?10:-10,3+c%4,c+6,1.3,c%3?We:ai),t.deco("cloud",c%2?15:-15,9+c%4,c+8,2.4,se);return t.build()}function s_(){let n="#f1f5ff",e="#cfe8ff",t=new Pt("mochi-mountain",{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Climb! Dodge the rolling mochi!",ja:"\u306E\u307C\u308C\uFF01\u3053\u308D\u304C\u308B\u304A\u3082\u3061\u3092\u3088\u3051\u308D\uFF01"},{sky:["#dfe9ff","#ffffff"],fog:"#f3f6ff",floor:n,floorAlt:qe,accent:We,accent2:"#9ad0ff"},130);t.box(0,0,3.5,12,1,13,{color:qe}),t.checkpoint(0,0,3.5,9),t.ramp(0,10,45,0,6.5,10.5),[-3.2,0,3.2].forEach((s,o)=>{t.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17,{color:o===1?qe:se}),t.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17+.5,{color:o===1?se:"#e3f9d5"})}),t.box(0,6.5,48.5,10.5,1,7,{color:qe}),t.checkpoint(0,6.5,48,8),t.box(0,6.5,68,12,1,32),[55.5,59.5,63.5,67.5,71.5,75.5,79.5].forEach((s,o)=>{let a=o%2?[-5.5,-1.5,2.5]:[-3.5,.5,4.5];for(let l of a)t.cyl(l,6.62,s,1.65,.3,{look:"mochi",color:o%3?qe:"#e3f9d5",surface:{speed:.42}})}),t.shuttle(1.1,[-5.6,6.5,61.5],[5.6,6.5,61.5],3.8,0,{color:se}),t.shuttle(1.1,[5.6,6.5,73.5],[-5.6,6.5,73.5],3.4,.3,{color:qe}),t.box(0,6.5,87,10.5,1,6,{color:qe}),t.checkpoint(0,6.5,86.5,8);let r=[[-2,7.6,94],[2,8.7,101],[-2,9.8,108],[2,10.9,115]];for(let[s,o,a]of r)t.box(s,o,a,5.6,1,5.5,{look:"ice",color:e,surface:{ice:!0}}),t.way(s,o,a);t.cyl(2,10,101,.5,1.3,{look:"bumper",color:We,bumper:6}),t.cyl(-2,11.1,108,.5,1.3,{look:"bumper",color:Re,bumper:6}),t.box(0,12,122.6,10,1,6.8,{color:qe}),t.checkpoint(0,12,122,8),t.ramp(0,126,152,12,16,9.5),[-3,0,3].forEach((s,o)=>{t.roller(1.4,[s,16,152],[s,12,126],4.4,o*.33,{color:o===1?qe:se})}),t.box(0,16,157,12,1,10,{look:"finish",color:se}),t.finish(0,16,158,12,8);for(let s=6;s<165;s+=15){let o=s<45?s/45*6:s<90?6.5:s<126?6.5+(s-90)/36*5.5:12+(s-126)/30*4;t.deco("star",s%2?-10:10,o+2+s%3,s,1.1,s%3?We:Re),t.deco("cloud",s%2?13:-13,o+6+s%4,s+6,2.6,se)}return t.build()}function o_(){let n="#e4def5",e="#cfc6ec",t="#cdeccf",i=new Pt("ninja-rooftops",{en:"Ninja Rooftops",ja:"\u3057\u306E\u3073\u30EB\u30FC\u30D5"},{en:"Leap the gaps. Slip through the doors!",ja:"\u5C4B\u6839\u3092\u3068\u3073\u3053\u3048\u3001\u3075\u3059\u307E\u3092\u3059\u308A\u306C\u3051\u308D\uFF01"},{sky:["#c9c2f2","#ffe9d6"],fog:"#f1e9f7",floor:n,floorAlt:qe,accent:Si,accent2:Re},130);i.box(0,0,3.5,12,1,13,{color:qe}),i.checkpoint(0,0,3.5,9),i.ramp(0,11,15,0,1.4,7,{color:e}),i.ramp(0,15,19,1.4,0,7,{color:e}),i.box(-1.5,1,24.3,5,1,5.4,{color:n}),i.ramp(1.5,29.8,33,.6,1.8,5,{color:e}),i.ramp(1.5,33,36.2,1.8,.6,5,{color:e}),i.way(0,1.4,15),i.way(-1.5,1,24.3),i.way(1.5,1.8,33),i.box(0,0,42.3,12,1,7.4,{color:qe}),i.checkpoint(0,0,42.5,8),i.box(0,0,62,9,1,32);for(let o of[-4.7,4.7])i.box(o,1,62,.4,1,32,{look:"rail",color:Si});[52,58.5,65,71.5].forEach((o,a)=>{let l=a%2?Xe:se;vt(i.box(-7.45,2.4,o,7.1,2.4,.5,{look:"wall",color:l}),5.2,0,0,4.2,a*.27),vt(i.box(1.85,2.4,o,6.3,2.4,.5,{look:"wall",color:l}),5.2,0,0,4.2,a*.27)}),i.box(0,0,80.5,12,1,5,{color:qe}),i.checkpoint(0,0,80,8),[[-1.2,.4,85.4],[.9,.8,88.6],[-.7,1.2,91.8],[1.2,1.6,95],[-.9,2,98.2],[.8,2.4,101.4],[-1.1,2.8,104.6],[.7,3.2,107.8],[-.4,3.6,111]].forEach(([o,a,l],c)=>{let u=i.cyl(o,a,l,1.3,a+7,{look:"disc",color:c%2?t:"#e3f6d8"});(c===3||c===6)&&vt(u,0,-.7,0,3.4,c*.2),i.way(o,a,l)}),i.roller(.55,[-9,2,96.6],[9,2,96.6],2.6,0,{look:"shot",color:Re,power:11}),i.roller(.55,[9,3.2,106.2],[-9,3.2,106.2],2.6,.5,{look:"shot",color:We,power:11}),i.box(0,3.6,116,10,1,7,{color:qe}),i.checkpoint(0,3.6,116,7),[[-1,3,124.5],[1.5,2,134],[-1,1,143.5]].forEach(([o,a,l],c)=>{i.box(o,a,l,6,1,7,{color:c%2?n:e}),i.way(o,a,l);let u=c%2?[[-1.6,-1.4],[.4,.6],[1.8,-.4],[-.4,2.2]]:[[1.5,-1.6],[-.6,.2],[-1.9,1.8],[1.2,2]];for(let[h,d]of u)i.cyl(o+h,a+.3,l+d,.35,.3,{look:"bumper",color:Mt,bumper:5.5})}),i.box(0,0,155,12,1,10,{look:"finish",color:se}),i.finish(0,0,156,12,8);for(let o=6;o<160;o+=16)i.deco("lantern",o%2?-9.5:9.5,4+o%4,o,1.2,o%3?Ao:Re),i.deco("star",o%2?12:-12,8+o%5,o+5,.9,o%3?Re:se),i.deco("cloud",o%2?15:-15,9+o%3,o+9,2.2,se);return i.build()}function a_(){let n="#eeeae0",e="#dcd6ea",t="#bfeaff",i=new Pt("onsen-hop",{en:"Onsen Hop",ja:"\u304A\u3093\u305B\u3093\u30DB\u30C3\u30D7"},{en:"Wait for the geyser. Then jump on!",ja:"\u304B\u3093\u3051\u3064\u305B\u3093\u3092\u5F85\u3063\u3066\u3001\u3068\u3073\u4E57\u308C\uFF01"},{sky:["#bfeee2",an],fog:"#ecfaf5",floor:n,floorAlt:Tt,accent:ai,accent2:We},140);i.box(0,0,3.5,12,1,13,{color:Tt}),i.checkpoint(0,0,3.5,9);let r=(o,a,l,c,u)=>i.cyl(o,a+.12,l,1.3,.12,{look:"geyser",color:t,surface:{bounce:15.5},active:dl(c,1.5,u)});[[0,12.5],[-2.2,16],[1.6,19.5],[-1,23.2],[2.4,26.6],[0,30.2],[-2.4,33.6],[.6,37]].forEach(([o,a],l)=>{let c=i.cyl(o,0,a,1.35,1.2,{look:"plate",color:l%2?e:n});l%2&&vt(c,0,-1.1,0,3.4,l*.17),i.way(o,0,a)}),i.shuttle(.6,[-6,0,21.3],[6,0,21.3],4,0,{look:"plum",color:Re,power:9}),i.shuttle(.6,[6,0,31.9],[-6,0,31.9],4,.4,{look:"plum",color:Re,power:9}),i.box(0,0,42.5,12,1,7,{color:Tt}),i.checkpoint(0,0,42.5,8),i.box(0,0,50.5,9,1,9),r(0,0,53,3.2,0),i.box(0,3.2,60,9,1,8,{color:e}),r(0,3.2,62.3,3.2,.5),i.way(0,0,53),i.way(0,3.2,58),i.way(0,3.2,62.3),i.way(0,6.4,67),i.box(0,6.4,73.5,12,1,16,{color:Tt}),i.checkpoint(0,6.4,78,8),i.box(0,6.4,98.25,7,1,33.5,{color:Xe}),[-2.2,0,2.2].forEach((o,a)=>{i.hopper(.85,[o,114],[o,83],6.4,2.7,7,5.2,a*.37,{color:a===1?qe:se}),i.hopper(.85,[o,114],[o,83],6.4,2.7,7,5.2,a*.37+.5,{color:a===1?se:Xe})}),i.box(0,6.4,118.2,12,1,6.4,{color:Tt}),i.checkpoint(0,6.4,117.5,8),vt(i.box(-1.5,6.4,124.4,3.6,.6,3.6,{look:"tile",color:se}),0,-2.6,0,4,0),vt(i.box(1.5,3.8,129.4,3.6,.6,3.6,{look:"tile",color:qe}),0,-2.6,0,4,.5),i.box(0,1.2,137.5,10,1,11,{color:e}),[-3,0,3].forEach((o,a)=>r(o,1.2,141,3.6,a/3)),i.way(-1.5,3.8,124.4),i.way(1.5,1.2,129.4),i.way(0,1.2,141),i.box(0,4.4,152,12,1,16,{look:"finish",color:se}),i.finish(0,4.4,156,12,8);for(let o=6;o<160;o+=16){let a=o<55?0:o<64?3.2:o<121?6.4:2;i.deco("lantern",o%2?-9.5:9.5,a+4+o%3,o,1.2,o%3?We:Re),i.deco("cloud",o%2?14:-14,a+8+o%4,o+7,2.6,se)}return i.deco("torii",0,0,9.5,2.3,We),i.build()}function l_(){let n="#f4ecff",e=new Pt("origami-sky",{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"},{en:"The floor folds away. Keep moving!",ja:"\u3086\u304B\u304C\u6D88\u3048\u308B\uFF01\u6B62\u307E\u308B\u306A\uFF01"},{sky:["#e2d4ff",an],fog:"#f6efff",floor:n,floorAlt:Xe,accent:Si,accent2:Re},140);e.box(0,0,3.5,12,1,13,{color:Xe}),e.checkpoint(0,0,3.5,9);for(let i=0;i<8;i++)for(let r=0;r<4;r++){let s=(i+r)%2===0;e.box(-4.05+r*2.7,0,12+i*3.7,2.4,.5,3.4,{look:"tile",color:s?Ao:Xe,active:dl(4.4,2.7,s?0:.5)})}e.box(0,0,43,12,1,6,{color:Xe}),e.checkpoint(0,0,42.5,8),e.box(0,0,62,5,1,32),[51,57,63,69,75].forEach((i,r)=>{let s=r%2?10:-10;e.roller(.7,[s,.25,i],[-s,.25,i],2.1,r*.37,{look:"shot",color:r%2?Re:se,power:12}),e.deco("plane",s*1.12,.6,i,1.4,r%2?We:Si)}),vt(e.box(5.2,1.1,54,2.4,1.1,1.8,{look:"pusher",color:We}),-3.6,0,0,2.8,.2),vt(e.box(-5.2,1.1,66,2.4,1.1,1.8,{look:"pusher",color:We}),3.6,0,0,2.8,.6),e.box(0,0,81,12,1,6,{color:Xe}),e.checkpoint(0,0,80.5,8),[[90,0,.7],[100,1.2,-.8],[110,2.4,.9]].forEach(([i,r,s],o)=>{let a=o%2?Xe:Ao;Kt(e.box(0,r,i,8,.6,1.9,{look:"tile",color:a}),s,o),Kt(e.box(0,r,i,1.9,.6,8,{look:"tile",color:a}),s,o),e.way(0,r,i)}),e.box(0,3,119,9,1,6,{color:Xe}),e.checkpoint(0,3,118.5,7),e.box(0,3,126,8,1,8),Kt(e.box(0,3.8,126,7.4,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),2.2,1),e.cyl(0,4.2,126,.5,1.2,{look:"bumper",color:Re});for(let i=0;i<4;i++)for(let r=0;r<2;r++){let s=(i+r)%2===0;e.box(r?1.45:-1.45,3,131.6+i*3,2.7,.5,2.8,{look:"tile",color:s?Ao:Tt,active:dl(3.6,2.3,s?0:.5)})}e.box(0,3,146,7,1,7),e.cyl(0,3.3,147.3,1.6,1.2,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.way(0,3,131),e.way(0,3,142.5),e.way(0,3.3,147.3),e.box(0,5.5,157,11,1,10,{look:"finish",color:se}),e.finish(0,5.5,158,11,8);for(let i=6;i<165;i+=14)e.deco("plane",i%2?-11:11,4+i%5,i,1.2,i%3?Si:We),e.deco("cloud",i%2?14:-14,8+i%4,i+5,2.4,se);return e.build()}function c_(){let n="#fff0c4",e="#ffe2a6",t="#c4e4c8",i="#f1cf9c",r="#ff9a3d",s=new Pt("ramen-slide",{en:"Ramen Slide",ja:"\u30E9\u30FC\u30E1\u30F3\u30B9\u30E9\u30A4\u30C0\u30FC"},{en:"Ride the broth. Don't stop for the eggs!",ja:"\u30B9\u30FC\u30D7\u306B\u4E57\u3063\u3066\u4E0B\u308C\u3002\u305F\u307E\u3054\u306B\u8FFD\u3044\u3064\u304B\u308C\u308B\u306A\uFF01"},{sky:["#ffdcae",an],fog:"#fff3df",floor:n,floorAlt:"#ffe0c2",accent:r,accent2:Mt},130,-26);s.box(0,0,3.5,12,1,13,{color:"#ffe0c2"}),s.checkpoint(0,0,3.5,9);let o=(c,u,h,d,p)=>{s.ramp(0,c,u,h,d,9,{look:"belt",color:e,surface:{conveyor:[0,-3.5]}});for(let m of[-4.7,4.7])s.ramp(m,c,u,h+.9,d+.9,.4,{look:"rail",color:r});return[-2.6,2.6].forEach((m,x)=>{s.roller(1.05,[m,h-2*(h-d)/(u-c),c+2],[m,d,u],p,x*.5,{color:x?Xe:se})}),m=>h+(d-h)*(m-c)/(u-c)},a=o(10,40,0,-7,3.2);for(let[c,u]of[[-2.3,17],[2.3,24],[-2.3,31]])s.box(c,a(u)+.85,u,4.2,1.7,.7,{look:"bar",color:i});for(let[c,u]of[[2.6,19.5],[-2.4,27.5],[1.4,35]])s.cyl(c,a(u)+1.1,u,.7,1.6,{look:"plate",color:qe,bumper:6});s.box(0,-7,43,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-7,42.5,8),s.box(-1.5,-7,50,4,.6,5,{look:"tile",color:t}),s.cyl(1,-7.2,56,1.7,1,{look:"drum",color:Re,surface:{bounce:13}}),Kt(s.cyl(0,-5.5,62.5,3,.7,{look:"disc",color:qe}),1,0),s.box(-1.2,-6.3,69.75,4,.6,4.5,{look:"tile",color:t}),s.cyl(.8,-6.5,75,1.7,1,{look:"drum",color:Re,surface:{bounce:13}}),s.way(-1.5,-7,50),s.way(1,-7.2,56),s.way(0,-5.5,62.5),s.way(-1.2,-6.3,69.75),s.way(.8,-6.5,75),s.box(0,-5,81,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-5,80.5,8);let l=o(84,114,-5,-12,3.4);[92,100,108].forEach((c,u)=>{let h=u%2===0;fl(s.box(0,l(c)+.95,c,6,.7,.45,{look:"bar",color:u%2?We:Re,bumper:7,tumble:!0}),h?-4.5:4.5,c,6,h?0:Math.PI,Math.PI/2,2.8,u*.3)}),s.box(0,-12,117,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-12,116.5,8);for(let c=0;c<5;c++){let u=123.2+c*5.4;vt(s.box(-1.5,-12,u,1.7,.7,5,{look:"tile",color:c%2?Xe:n}),3,0,0,3.6,c*.31),s.way(0,-12,u)}s.box(0,-12,154,12,1,12,{look:"finish",color:se}),s.finish(0,-12,156,12,8);for(let c=6;c<160;c+=17){let u=c<40?-(7*c)/40:c<84?-6:c<114?-5-7*(c-84)/30:-12;s.deco("sushi",c%2?-11:11,u+2+c%4,c,1.5,c%3?We:Re),s.deco("cloud",c%2?14:-14,u+7+c%4,c+8,2.4,se)}return s.build()}function u_(){let n="#eef2f8",e="#cfd6e6",t=new Pt("shinkansen-dash",{en:"Shinkansen Dash",ja:"\u3057\u3093\u304B\u3093\u305B\u3093\u30C0\u30C3\u30B7\u30E5"},{en:"Cross the tracks. Ride the roofs!",ja:"\u7DDA\u8DEF\u3092\u308F\u305F\u3063\u3066\u3001\u5C4B\u6839\u306B\u4E57\u308C\uFF01"},{sky:["#bfe0ff",an],fog:"#eef6ff",floor:n,floorAlt:Xe,accent:bs,accent2:Re},130);t.box(0,0,3.5,12,1,13,{color:Xe}),t.checkpoint(0,0,3.5,9),t.box(0,0,25,12,1,30),[15.5,21.5,27.5,33.5].forEach((s,o)=>{t.box(0,.03,s,12,.06,2.6,{look:"tile",color:e});let a=o%2===0;for(let l of[0,.5])t_(t.box(a?-17:17,2.3,s,7,2.3,2,{look:"pusher",color:o%2?Mi:se,bumper:8,tumble:!0}),a?34:-34,0,0,3.4+o*.25,l+o*.21)}),t.box(0,0,43,12,1,6,{color:Xe}),t.checkpoint(0,0,42.5,8),vt(t.box(-2.5,0,51,3,1.2,8,{look:"tile",color:se}),0,0,10,6,0),vt(t.box(2.5,0,63,3,1.2,8,{look:"tile",color:Mi}),0,0,10,6,.5),t.way(-2.5,0,51),t.way(-2.5,0,62),t.way(2.5,0,63),t.way(2.5,0,74),t.box(0,0,80,12,1,6,{color:Xe}),t.checkpoint(0,0,79.5,8);let i=.35;for(let s=1;s<=6;s++)t.box(0,s*i,83.6+s*1.2,7,s*i+1,1.2,{color:s%2?n:Xe});let r=6*i;t.box(0,r,99.9,6,.8,16.6),[95.5,100,104.5].forEach((s,o)=>{fl(t.box(-3,r+.8,s,2.8,.6,.4,{look:"bar",color:o%2?Re:Mt,bumper:8,tumble:!0}),-3,s,2.8,0,Math.PI/2,3.2,o*.3),fl(t.box(3,r+.8,s,2.8,.6,.4,{look:"bar",color:o%2?Re:Mt,bumper:8,tumble:!0}),3,s,2.8,Math.PI,Math.PI/2,3.2,o*.3),t.cyl(-3,r+1.3,s,.3,1.3,{look:"bumper",color:se}),t.cyl(3,r+1.3,s,.3,1.3,{look:"bumper",color:se})});for(let s=5;s>=1;s--)t.box(0,s*i,108.8+(5-s)*1.2,7,s*i+1,1.2,{color:s%2?n:Xe});t.way(0,r,92),t.way(0,r,108),t.box(0,0,117.4,12,1,6.4,{color:Xe}),t.checkpoint(0,0,117,8),t.box(0,0,135.3,5,1,29.4,{look:"belt",color:se,surface:{conveyor:[0,-5]}}),[127,133,139,145].forEach((s,o)=>{t.box(0,.75,s,5,.75,.5,{look:"bar",color:o%2?We:bs})}),t.box(0,0,155,12,1,10,{look:"finish",color:se}),t.finish(0,0,156,12,8);for(let s=6;s<160;s+=18)t.deco("flag",s%2?-9:9,2+s%3,s,1.4,s%3?bs:Re),t.deco("cloud",s%2?14:-14,7+s%4,s+7,2.5,se);return t.build()}function h_(){let n="#ffe2c2",e=new Pt("taiko-bounce",{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Hop the sticks, bounce the drums!",ja:"\u30D0\u30C1\u3092\u3068\u3073\u3053\u3048\u3001\u592A\u9F13\u3067\u306F\u306D\u308D\uFF01"},{sky:["#ffe1cf",an],fog:"#fff0e0",floor:n,floorAlt:Xe,accent:Mt,accent2:Re},120);e.box(0,0,3.5,12,1,13,{color:Xe}),e.checkpoint(0,0,3.5,9),e.box(0,0,25,11,1,30);for(let[t,i]of[[17,1.7],[25.5,-1.9],[34,2.2]])Kt(e.box(0,.8,t,10,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),i,t*.7),e.cyl(0,2.3,t,.5,2.3,{look:"bumper",color:Re});Kt(e.box(0,2.05,25.5,.5,.6,10,{look:"bar",color:Re,bumper:9,tumble:!0}),-1.9,25.5*.7),e.box(0,0,43,12,1,6,{color:Xe}),e.checkpoint(0,0,42.5,8),e.cyl(-1.5,0,50.5,1.7,1.4,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.box(1.5,1.2,56.5,3.8,.6,3.8,{look:"tile",color:se}),e.cyl(-1.5,1.2,62.5,1.7,1.4,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.cyl(1.5,1.2,68.3,1.7,1.4,{look:"drum",color:Re,surface:{bounce:14.5}}),e.way(-1.5,0,50.5),e.way(1.5,1.2,56.5),e.way(-1.5,1.2,62.5),e.way(1.5,1.2,68.3),e.box(0,2.5,76,10,1,8,{color:Xe}),e.checkpoint(0,2.5,75,7),vt(e.box(-1.5,2.5,83,3.4,.6,3.4,{look:"tile",color:se}),0,1.7,0,3.6,0),vt(e.box(1.5,3.4,88,3.4,.6,3.4,{look:"tile",color:se}),0,1.8,0,3.6,.33),vt(e.box(-1,4.4,93,3.4,.6,3.4,{look:"tile",color:se}),0,1.8,0,3.6,.66),e.way(-1.5,3.3,83),e.way(1.5,4.3,88),e.way(-1,5.3,93),e.box(0,6,100,9,1,7.4,{color:Xe}),e.checkpoint(0,6,99,7),e.ramp(0,103.7,131.7,6,0,9,{look:"ice",color:"#cfe8ff",surface:{ice:!0}});for(let[t,i]of[[-2.5,110],[1.5,112.5],[-.5,117],[3,119.5],[-3,123],[.8,126.5]]){let r=6-6*(i-103.7)/28;e.cyl(t,r+1.2,i,.55,2.4,{look:"bumper",color:We,bumper:7.5})}e.box(0,0,141,10,1,18.6),Kt(e.box(0,.8,141,9.4,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),2.1,0),Kt(e.box(0,2.05,141,.5,.6,9.4,{look:"bar",color:Re,bumper:9,tumble:!0}),2.1,0),e.cyl(0,2.3,141,.5,2.3,{look:"bumper",color:Re}),e.way(0,0,133),e.box(0,0,155,12,1,10,{look:"finish",color:se}),e.finish(0,0,156,12,8);for(let t=6;t<160;t+=17)e.deco("lantern",t%2?-9.5:9.5,5+t%3,t,1.3,t%3?Mt:Re),e.deco("cloud",t%2?14:-14,8+t%4,t+6,2.4,se);return e.deco("torii",0,0,9.5,2.3,Mt),e.build()}var Ro=(n,e)=>t=>Math.max(0,Math.min(1,Math.sin(Math.PI*2*(t/n+e))*2.2));function f_(){let n=new Pt("windy-pinwheels",{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Lean into the wind!",ja:"\u98A8\u306B\u307E\u3051\u308B\u306A\uFF01"},{sky:["#cfe4ff",an],fog:"#eef5ff",floor:se,floorAlt:Tt,accent:bs,accent2:ai},120);n.box(0,0,3.5,12,1,13,{color:Tt}),n.checkpoint(0,0,3.5,9);for(let t of[-4,0,4])n.box(t,0,25,1.9,1,30,{color:t===0?se:Mi});n.wind(-9,9,11,19.5,-2,6,5.5,0,Ro(3.2,0)),n.wind(-9,9,20.5,29,-2,6,-5.5,0,Ro(3.2,.5)),n.wind(-9,9,30,39,-2,6,6,0,Ro(2.8,.25)),n.box(0,0,43,12,1,6,{color:Tt}),n.checkpoint(0,0,42.5,8),[[0,50,1.2],[1.5,57.2,-1.4],[-1.5,64.4,1.2],[0,71.6,-1.4]].forEach(([t,i,r],s)=>{Kt(n.cyl(t,0,i,3.3,.7,{look:"disc",color:s%2?Tt:Mi}),r,0),hl(n.box(t,.95,i,2.6,.95,.4,{look:"wall",color:s%2?ai:bs}),1.95,r,s*1.3,!0),n.cyl(t,1.5,i,.65,1.5,{look:"bumper",color:Re,bumper:6}),n.way(t+(s%2?1.6:-1.6),0,i)}),n.box(0,0,78.7,12,1,6.6,{color:Tt}),n.checkpoint(0,0,78.5,8),n.box(0,0,98,4.6,1,32),[87,92.5,98,103.5,109].forEach((t,i)=>{n.lantern(0,7.2,t,6.2,.78,2.7+i%3*.35,i*.37,i%2?We:Re)}),n.wind(-3,3,83,113,-1,5,0,2.5),n.box(0,0,117,12,1,6,{color:Tt}),n.checkpoint(0,0,116.5,8),n.box(-2.5,0,124,2.3,1,8,{color:Mi}),n.box(0,0,129,7.3,1,2.3),n.box(2.5,0,134,2.3,1,8,{color:Mi}),n.box(0,0,139,7.3,1,2.3),n.box(-2.5,0,144,2.3,1,8,{color:Mi}),n.box(0,0,149,7.3,1,2.3),n.wind(-9,9,120.5,127.5,-2,6,-5,0,Ro(2.6,0)),n.wind(-9,9,130.5,137.5,-2,6,5,0,Ro(2.6,.4)),n.wind(-9,9,140.5,147.5,-2,6,-5,0,Ro(2.6,.8)),n.way(-2.5,0,121),n.way(-2.5,0,129),n.way(2.5,0,129),n.way(2.5,0,139),n.way(-2.5,0,139),n.way(-2.5,0,149),n.way(0,0,150),n.box(0,0,155,12,1,10,{look:"finish",color:se}),n.finish(0,0,156,12,8);for(let t=5;t<160;t+=16)n.deco("pinwheel",t%2?-10:10,2+t%4,t,1.6,t%3?We:Re),n.deco("cloud",t%2?13:-13,7+t%5,t+7,2.6,se);return n.build()}var d_=[i_,h_,f_,s_,l_,u_,o_,r_,c_,a_],Mp=d_.length,ab=[];function vu(n){let e=(n%Mp+Mp)%Mp;return ab[e]??=d_[e]()}var lb=0,p_=1,cb=2;var _1=1,I0=2,fr=3,ts=0,Jt=1,$n=2,Qr=0,Zo=1,m_=2,g_=3,y_=4,ub=5,Ls=100,hb=101,fb=102,db=103,pb=104,mb=200,gb=201,yb=202,vb=203,rm=204,sm=205,xb=206,_b=207,Mb=208,Sb=209,wb=210,bb=211,Eb=212,Tb=213,Ab=214,om=0,am=1,lm=2,ea=3,cm=4,um=5,hm=6,fm=7,M1=0,Rb=1,Cb=2,es=0,Pb=1,Ib=2,Lb=3,kb=4,Nb=5,Db=6,Ub=7;var S1=300,ta=301,na=302,dm=303,pm=304,Ah=306,Us=1e3,Ns=1001,mm=1002,hn=1003,zb=1004;var xu=1005;var Ti=1006,Sp=1007;var Ds=1008;var gr=1009,w1=1010,b1=1011,Cl=1012,L0=1013,zs=1014,Fi=1015,Hl=1016,k0=1017,N0=1018,ia=1020,E1=35902,T1=1021,A1=1022,Ai=1023,R1=1024,C1=1025,Ko=1026,ra=1027,D0=1028,U0=1029,P1=1030,z0=1031;var O0=1033,ju=33776,$u=33777,Zu=33778,Ku=33779,gm=35840,ym=35841,vm=35842,xm=35843,_m=36196,Mm=37492,Sm=37496,wm=37808,bm=37809,Em=37810,Tm=37811,Am=37812,Rm=37813,Cm=37814,Pm=37815,Im=37816,Lm=37817,km=37818,Nm=37819,Dm=37820,Um=37821,Ju=36492,zm=36494,Om=36495,I1=36283,Fm=36284,Bm=36285,Hm=36286;var eh=2300,Vm=2301,wp=2302,v_=2400,x_=2401,__=2402;var Ob=3200,Fb=3201;var L1=0,Bb=1,Kr="",jn="srgb",ss="srgb-linear",F0="display-p3",Rh="display-p3-linear",th="linear",xt="srgb",nh="rec709",ih="p3";var Co=7680;var M_=519,Hb=512,Vb=513,Gb=514,k1=515,Wb=516,Xb=517,Yb=518,qb=519,Gm=35044;var S_="300 es",pr=2e3,rh=2001,ns=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},ln=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var bp=Math.PI/180,Wm=180/Math.PI;function mr(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ln[n&255]+ln[n>>8&255]+ln[n>>16&255]+ln[n>>24&255]+"-"+ln[e&255]+ln[e>>8&255]+"-"+ln[e>>16&15|64]+ln[e>>24&255]+"-"+ln[t&63|128]+ln[t>>8&255]+"-"+ln[t>>16&255]+ln[t>>24&255]+ln[i&255]+ln[i>>8&255]+ln[i>>16&255]+ln[i>>24&255]).toLowerCase()}function un(n,e,t){return Math.max(e,Math.min(t,n))}function jb(n,e){return(n%e+e)%e}function Ep(n,e,t){return(1-t)*n+t*e}function Oi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function lt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var pe=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(un(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ve=class n{constructor(e,t,i,r,s,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],p=i[5],m=i[8],x=r[0],g=r[3],f=r[6],v=r[1],y=r[4],M=r[7],R=r[2],T=r[5],b=r[8];return s[0]=o*x+a*v+l*R,s[3]=o*g+a*y+l*T,s[6]=o*f+a*M+l*b,s[1]=c*x+u*v+h*R,s[4]=c*g+u*y+h*T,s[7]=c*f+u*M+h*b,s[2]=d*x+p*v+m*R,s[5]=d*g+p*y+m*T,s[8]=d*f+p*M+m*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,p=c*s-o*l,m=t*h+i*d+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=d*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=p*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Tp.makeScale(e,t)),this}rotate(e){return this.premultiply(Tp.makeRotation(-e)),this}translate(e,t){return this.premultiply(Tp.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Tp=new Ve;function N1(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function sh(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function $b(){let n=sh("canvas");return n.style.display="block",n}var w_={};function Qu(n){n in w_||(w_[n]=!0,console.warn(n))}function Zb(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function Kb(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Jb(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var b_=new Ve().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),E_=new Ve().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),pl={[ss]:{transfer:th,primaries:nh,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n,fromReference:n=>n},[jn]:{transfer:xt,primaries:nh,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Rh]:{transfer:th,primaries:ih,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.applyMatrix3(E_),fromReference:n=>n.applyMatrix3(b_)},[F0]:{transfer:xt,primaries:ih,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.convertSRGBToLinear().applyMatrix3(E_),fromReference:n=>n.applyMatrix3(b_).convertLinearToSRGB()}},Qb=new Set([ss,Rh]),it={enabled:!0,_workingColorSpace:ss,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!Qb.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=pl[e].toReference,r=pl[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return pl[n].primaries},getTransfer:function(n){return n===Kr?th:pl[n].transfer},getLuminanceCoefficients:function(n,e=this._workingColorSpace){return n.fromArray(pl[e].luminanceCoefficients)}};function Jo(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ap(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Po,Xm=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Po===void 0&&(Po=sh("canvas")),Po.width=e.width,Po.height=e.height;let i=Po.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Po}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=sh("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Jo(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Jo(t[i]/255)*255):t[i]=Jo(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},eE=0,oh=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:eE++}),this.uuid=mr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Rp(r[o].image)):s.push(Rp(r[o]))}else s=Rp(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function Rp(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Xm.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var tE=0,Nn=class n extends ns{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Ns,r=Ns,s=Ti,o=Ds,a=Ai,l=gr,c=n.DEFAULT_ANISOTROPY,u=Kr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tE++}),this.uuid=mr(),this.name="",this.source=new oh(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==S1)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Us:e.x=e.x-Math.floor(e.x);break;case Ns:e.x=e.x<0?0:1;break;case mm:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Us:e.y=e.y-Math.floor(e.y);break;case Ns:e.y=e.y<0?0:1;break;case mm:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=S1;Nn.DEFAULT_ANISOTROPY=1;var It=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],p=l[5],m=l[9],x=l[2],g=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let y=(c+1)/2,M=(p+1)/2,R=(f+1)/2,T=(u+d)/4,b=(h+x)/4,A=(m+g)/4;return y>M&&y>R?y<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(y),r=T/i,s=b/i):M>R?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=T/r,s=A/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=b/s,r=A/s),this.set(i,r,s,t),this}let v=Math.sqrt((g-m)*(g-m)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(v)<.001&&(v=1),this.x=(g-m)/v,this.y=(h-x)/v,this.z=(d-u)/v,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ym=class extends ns{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);let r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ti,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let s=new Nn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new oh(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},yr=class extends Ym{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},ah=class extends Nn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=hn,this.minFilter=hn,this.wrapR=Ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var qm=class extends Nn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=hn,this.minFilter=hn,this.wrapR=Ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Bi=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],d=s[o+0],p=s[o+1],m=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=m,e[t+3]=x;return}if(h!==x||l!==d||c!==p||u!==m){let g=1-a,f=l*d+c*p+u*m+h*x,v=f>=0?1:-1,y=1-f*f;if(y>Number.EPSILON){let R=Math.sqrt(y),T=Math.atan2(R,f*v);g=Math.sin(g*T)/R,a=Math.sin(a*T)/R}let M=a*v;if(l=l*g+d*M,c=c*g+p*M,u=u*g+m*M,h=h*g+x*M,g===1-a){let R=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=R,c*=R,u*=R,h*=R}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],d=s[o+1],p=s[o+2],m=s[o+3];return e[t]=a*m+u*h+l*p-c*d,e[t+1]=l*m+u*d+c*h-a*p,e[t+2]=c*m+u*p+a*d-l*h,e[t+3]=u*m-a*h-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),d=l(i/2),p=l(r/2),m=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h-d*p*m;break;case"YXZ":this._x=d*u*h+c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h+d*p*m;break;case"ZXY":this._x=d*u*h-c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h-d*p*m;break;case"ZYX":this._x=d*u*h-c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h+d*p*m;break;case"YZX":this._x=d*u*h+c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h-d*p*m;break;case"XZY":this._x=d*u*h-c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h+d*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>h){let p=2*Math.sqrt(1+i-a-h);this._w=(u-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>h){let p=2*Math.sqrt(1+a-i-h);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+h-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(un(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*i+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(T_.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(T_.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Cp.copy(this).projectOnVector(e),this.sub(Cp)}reflect(e){return this.sub(Cp.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(un(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Cp=new I,T_=new Bi,vr=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(wi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(wi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=wi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,wi):wi.fromBufferAttribute(s,o),wi.applyMatrix4(e.matrixWorld),this.expandByPoint(wi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_u.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),_u.copy(i.boundingBox)),_u.applyMatrix4(e.matrixWorld),this.union(_u)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,wi),wi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ml),Mu.subVectors(this.max,ml),Io.subVectors(e.a,ml),Lo.subVectors(e.b,ml),ko.subVectors(e.c,ml),Xr.subVectors(Lo,Io),Yr.subVectors(ko,Lo),Es.subVectors(Io,ko);let t=[0,-Xr.z,Xr.y,0,-Yr.z,Yr.y,0,-Es.z,Es.y,Xr.z,0,-Xr.x,Yr.z,0,-Yr.x,Es.z,0,-Es.x,-Xr.y,Xr.x,0,-Yr.y,Yr.x,0,-Es.y,Es.x,0];return!Pp(t,Io,Lo,ko,Mu)||(t=[1,0,0,0,1,0,0,0,1],!Pp(t,Io,Lo,ko,Mu))?!1:(Su.crossVectors(Xr,Yr),t=[Su.x,Su.y,Su.z],Pp(t,Io,Lo,ko,Mu))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ar[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ar[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ar[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ar[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ar[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ar[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ar[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ar[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ar),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},ar=[new I,new I,new I,new I,new I,new I,new I,new I],wi=new I,_u=new vr,Io=new I,Lo=new I,ko=new I,Xr=new I,Yr=new I,Es=new I,ml=new I,Mu=new I,Su=new I,Ts=new I;function Pp(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Ts.fromArray(n,s);let a=r.x*Math.abs(Ts.x)+r.y*Math.abs(Ts.y)+r.z*Math.abs(Ts.z),l=e.dot(Ts),c=t.dot(Ts),u=i.dot(Ts);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var nE=new vr,gl=new I,Ip=new I,Os=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):nE.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;gl.subVectors(e,this.center);let t=gl.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(gl,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ip.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(gl.copy(e.center).add(Ip)),this.expandByPoint(gl.copy(e.center).sub(Ip))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},lr=new I,Lp=new I,wu=new I,qr=new I,kp=new I,bu=new I,Np=new I,jm=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,lr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=lr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(lr.copy(this.origin).addScaledVector(this.direction,t),lr.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Lp.copy(e).add(t).multiplyScalar(.5),wu.copy(t).sub(e).normalize(),qr.copy(this.origin).sub(Lp);let s=e.distanceTo(t)*.5,o=-this.direction.dot(wu),a=qr.dot(this.direction),l=-qr.dot(wu),c=qr.lengthSq(),u=Math.abs(1-o*o),h,d,p,m;if(u>0)if(h=o*l-a,d=o*a-l,m=s*u,h>=0)if(d>=-m)if(d<=m){let x=1/u;h*=x,d*=x,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-m?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c):d<=m?(h=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Lp).addScaledVector(wu,d),p}intersectSphere(e,t){lr.subVectors(e.center,this.origin);let i=lr.dot(this.direction),r=lr.dot(lr)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,lr)!==null}intersectTriangle(e,t,i,r,s){kp.subVectors(t,e),bu.subVectors(i,e),Np.crossVectors(kp,bu);let o=this.direction.dot(Np),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;qr.subVectors(this.origin,e);let l=a*this.direction.dot(bu.crossVectors(qr,bu));if(l<0)return null;let c=a*this.direction.dot(kp.cross(qr));if(c<0||l+c>o)return null;let u=-a*qr.dot(Np);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class n{constructor(e,t,i,r,s,o,a,l,c,u,h,d,p,m,x,g){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,h,d,p,m,x,g)}set(e,t,i,r,s,o,a,l,c,u,h,d,p,m,x,g){let f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=m,f[11]=x,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/No.setFromMatrixColumn(e,0).length(),s=1/No.setFromMatrixColumn(e,1).length(),o=1/No.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,p=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=p+m*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=m+p*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,p=l*h,m=c*u,x=c*h;t[0]=d+x*a,t[4]=m*a-p,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-m,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,p=l*h,m=c*u,x=c*h;t[0]=d-x*a,t[4]=-o*h,t[8]=m+p*a,t[1]=p+m*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,p=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=m*c-p,t[8]=d*c+x,t[1]=l*h,t[5]=x*c+d,t[9]=p*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,p=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=x-d*h,t[8]=m*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=p*h+m,t[10]=d-x*h}else if(e.order==="XZY"){let d=o*l,p=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+x,t[5]=o*u,t[9]=p*h-m,t[2]=m*h-p,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(iE,e,rE)}lookAt(e,t,i){let r=this.elements;return Yn.subVectors(e,t),Yn.lengthSq()===0&&(Yn.z=1),Yn.normalize(),jr.crossVectors(i,Yn),jr.lengthSq()===0&&(Math.abs(i.z)===1?Yn.x+=1e-4:Yn.z+=1e-4,Yn.normalize(),jr.crossVectors(i,Yn)),jr.normalize(),Eu.crossVectors(Yn,jr),r[0]=jr.x,r[4]=Eu.x,r[8]=Yn.x,r[1]=jr.y,r[5]=Eu.y,r[9]=Yn.y,r[2]=jr.z,r[6]=Eu.z,r[10]=Yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],p=i[13],m=i[2],x=i[6],g=i[10],f=i[14],v=i[3],y=i[7],M=i[11],R=i[15],T=r[0],b=r[4],A=r[8],L=r[12],_=r[1],S=r[5],z=r[9],N=r[13],F=r[2],X=r[6],O=r[10],Z=r[14],G=r[3],re=r[7],te=r[11],ce=r[15];return s[0]=o*T+a*_+l*F+c*G,s[4]=o*b+a*S+l*X+c*re,s[8]=o*A+a*z+l*O+c*te,s[12]=o*L+a*N+l*Z+c*ce,s[1]=u*T+h*_+d*F+p*G,s[5]=u*b+h*S+d*X+p*re,s[9]=u*A+h*z+d*O+p*te,s[13]=u*L+h*N+d*Z+p*ce,s[2]=m*T+x*_+g*F+f*G,s[6]=m*b+x*S+g*X+f*re,s[10]=m*A+x*z+g*O+f*te,s[14]=m*L+x*N+g*Z+f*ce,s[3]=v*T+y*_+M*F+R*G,s[7]=v*b+y*S+M*X+R*re,s[11]=v*A+y*z+M*O+R*te,s[15]=v*L+y*N+M*Z+R*ce,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],p=e[14],m=e[3],x=e[7],g=e[11],f=e[15];return m*(+s*l*h-r*c*h-s*a*d+i*c*d+r*a*p-i*l*p)+x*(+t*l*p-t*c*d+s*o*d-r*o*p+r*c*u-s*l*u)+g*(+t*c*h-t*a*p-s*o*h+i*o*p+s*a*u-i*c*u)+f*(-r*a*u-t*l*h+t*a*d+r*o*h-i*o*d+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],p=e[11],m=e[12],x=e[13],g=e[14],f=e[15],v=h*g*c-x*d*c+x*l*p-a*g*p-h*l*f+a*d*f,y=m*d*c-u*g*c-m*l*p+o*g*p+u*l*f-o*d*f,M=u*x*c-m*h*c+m*a*p-o*x*p-u*a*f+o*h*f,R=m*h*l-u*x*l-m*a*d+o*x*d+u*a*g-o*h*g,T=t*v+i*y+r*M+s*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let b=1/T;return e[0]=v*b,e[1]=(x*d*s-h*g*s-x*r*p+i*g*p+h*r*f-i*d*f)*b,e[2]=(a*g*s-x*l*s+x*r*c-i*g*c-a*r*f+i*l*f)*b,e[3]=(h*l*s-a*d*s-h*r*c+i*d*c+a*r*p-i*l*p)*b,e[4]=y*b,e[5]=(u*g*s-m*d*s+m*r*p-t*g*p-u*r*f+t*d*f)*b,e[6]=(m*l*s-o*g*s-m*r*c+t*g*c+o*r*f-t*l*f)*b,e[7]=(o*d*s-u*l*s+u*r*c-t*d*c-o*r*p+t*l*p)*b,e[8]=M*b,e[9]=(m*h*s-u*x*s-m*i*p+t*x*p+u*i*f-t*h*f)*b,e[10]=(o*x*s-m*a*s+m*i*c-t*x*c-o*i*f+t*a*f)*b,e[11]=(u*a*s-o*h*s-u*i*c+t*h*c+o*i*p-t*a*p)*b,e[12]=R*b,e[13]=(u*x*r-m*h*r+m*i*d-t*x*d-u*i*g+t*h*g)*b,e[14]=(m*a*r-o*x*r-m*i*l+t*x*l+o*i*g-t*a*g)*b,e[15]=(o*h*r-u*a*r+u*i*l-t*h*l-o*i*d+t*a*d)*b,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,p=s*u,m=s*h,x=o*u,g=o*h,f=a*h,v=l*c,y=l*u,M=l*h,R=i.x,T=i.y,b=i.z;return r[0]=(1-(x+f))*R,r[1]=(p+M)*R,r[2]=(m-y)*R,r[3]=0,r[4]=(p-M)*T,r[5]=(1-(d+f))*T,r[6]=(g+v)*T,r[7]=0,r[8]=(m+y)*b,r[9]=(g-v)*b,r[10]=(1-(d+x))*b,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=No.set(r[0],r[1],r[2]).length(),o=No.set(r[4],r[5],r[6]).length(),a=No.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],bi.copy(this);let c=1/s,u=1/o,h=1/a;return bi.elements[0]*=c,bi.elements[1]*=c,bi.elements[2]*=c,bi.elements[4]*=u,bi.elements[5]*=u,bi.elements[6]*=u,bi.elements[8]*=h,bi.elements[9]*=h,bi.elements[10]*=h,t.setFromRotationMatrix(bi),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=pr){let l=this.elements,c=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),d=(i+r)/(i-r),p,m;if(a===pr)p=-(o+s)/(o-s),m=-2*o*s/(o-s);else if(a===rh)p=-o/(o-s),m=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=pr){let l=this.elements,c=1/(t-e),u=1/(i-r),h=1/(o-s),d=(t+e)*c,p=(i+r)*u,m,x;if(a===pr)m=(o+s)*h,x=-2*h;else if(a===rh)m=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=x,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},No=new I,bi=new ot,iE=new I(0,0,0),rE=new I(1,1,1),jr=new I,Eu=new I,Yn=new I,A_=new ot,R_=new Bi,Hi=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(un(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-un(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(un(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-un(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(un(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-un(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return A_.makeRotationFromQuaternion(e),this.setFromRotationMatrix(A_,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return R_.setFromEuler(this),this.setFromQuaternion(R_,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Hi.DEFAULT_ORDER="XYZ";var lh=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},sE=0,C_=new I,Do=new Bi,cr=new ot,Tu=new I,yl=new I,oE=new I,aE=new Bi,P_=new I(1,0,0),I_=new I(0,1,0),L_=new I(0,0,1),k_={type:"added"},lE={type:"removed"},Uo={type:"childadded",child:null},Dp={type:"childremoved",child:null},wn=class n extends ns{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sE++}),this.uuid=mr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new I,t=new Hi,i=new Bi,r=new I(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ot},normalMatrix:{value:new Ve}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Do.setFromAxisAngle(e,t),this.quaternion.multiply(Do),this}rotateOnWorldAxis(e,t){return Do.setFromAxisAngle(e,t),this.quaternion.premultiply(Do),this}rotateX(e){return this.rotateOnAxis(P_,e)}rotateY(e){return this.rotateOnAxis(I_,e)}rotateZ(e){return this.rotateOnAxis(L_,e)}translateOnAxis(e,t){return C_.copy(e).applyQuaternion(this.quaternion),this.position.add(C_.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(P_,e)}translateY(e){return this.translateOnAxis(I_,e)}translateZ(e){return this.translateOnAxis(L_,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(cr.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Tu.copy(e):Tu.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),yl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?cr.lookAt(yl,Tu,this.up):cr.lookAt(Tu,yl,this.up),this.quaternion.setFromRotationMatrix(cr),r&&(cr.extractRotation(r.matrixWorld),Do.setFromRotationMatrix(cr),this.quaternion.premultiply(Do.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(k_),Uo.child=e,this.dispatchEvent(Uo),Uo.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(lE),Dp.child=e,this.dispatchEvent(Dp),Dp.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),cr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),cr.multiply(e.parent.matrixWorld)),e.applyMatrix4(cr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(k_),Uo.child=e,this.dispatchEvent(Uo),Uo.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yl,e,oE),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yl,aE,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};wn.DEFAULT_UP=new I(0,1,0);wn.DEFAULT_MATRIX_AUTO_UPDATE=!0;wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ei=new I,ur=new I,Up=new I,hr=new I,zo=new I,Oo=new I,N_=new I,zp=new I,Op=new I,Fp=new I,Bp=new It,Hp=new It,Vp=new It,Jr=class n{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Ei.subVectors(e,t),r.cross(Ei);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Ei.subVectors(r,t),ur.subVectors(i,t),Up.subVectors(e,t);let o=Ei.dot(Ei),a=Ei.dot(ur),l=Ei.dot(Up),c=ur.dot(ur),u=ur.dot(Up),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,p=(c*l-a*u)*d,m=(o*u-a*l)*d;return s.set(1-p-m,m,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,hr)===null?!1:hr.x>=0&&hr.y>=0&&hr.x+hr.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,hr)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,hr.x),l.addScaledVector(o,hr.y),l.addScaledVector(a,hr.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return Bp.setScalar(0),Hp.setScalar(0),Vp.setScalar(0),Bp.fromBufferAttribute(e,t),Hp.fromBufferAttribute(e,i),Vp.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Bp,s.x),o.addScaledVector(Hp,s.y),o.addScaledVector(Vp,s.z),o}static isFrontFacing(e,t,i,r){return Ei.subVectors(i,t),ur.subVectors(e,t),Ei.cross(ur).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ei.subVectors(this.c,this.b),ur.subVectors(this.a,this.b),Ei.cross(ur).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;zo.subVectors(r,i),Oo.subVectors(s,i),zp.subVectors(e,i);let l=zo.dot(zp),c=Oo.dot(zp);if(l<=0&&c<=0)return t.copy(i);Op.subVectors(e,r);let u=zo.dot(Op),h=Oo.dot(Op);if(u>=0&&h<=u)return t.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(zo,o);Fp.subVectors(e,s);let p=zo.dot(Fp),m=Oo.dot(Fp);if(m>=0&&p<=m)return t.copy(s);let x=p*c-l*m;if(x<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(Oo,a);let g=u*m-p*h;if(g<=0&&h-u>=0&&p-m>=0)return N_.subVectors(s,r),a=(h-u)/(h-u+(p-m)),t.copy(r).addScaledVector(N_,a);let f=1/(g+x+d);return o=x*f,a=d*f,t.copy(i).addScaledVector(zo,o).addScaledVector(Oo,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},D1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$r={h:0,s:0,l:0},Au={h:0,s:0,l:0};function Gp(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var ke=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=jn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,it.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=it.workingColorSpace){return this.r=e,this.g=t,this.b=i,it.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=it.workingColorSpace){if(e=jb(e,1),t=un(t,0,1),i=un(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Gp(o,s,e+1/3),this.g=Gp(o,s,e),this.b=Gp(o,s,e-1/3)}return it.toWorkingColorSpace(this,r),this}setStyle(e,t=jn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=jn){let i=D1[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Jo(e.r),this.g=Jo(e.g),this.b=Jo(e.b),this}copyLinearToSRGB(e){return this.r=Ap(e.r),this.g=Ap(e.g),this.b=Ap(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=jn){return it.fromWorkingColorSpace(cn.copy(this),e),Math.round(un(cn.r*255,0,255))*65536+Math.round(un(cn.g*255,0,255))*256+Math.round(un(cn.b*255,0,255))}getHexString(e=jn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=it.workingColorSpace){it.fromWorkingColorSpace(cn.copy(this),t);let i=cn.r,r=cn.g,s=cn.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=it.workingColorSpace){return it.fromWorkingColorSpace(cn.copy(this),t),e.r=cn.r,e.g=cn.g,e.b=cn.b,e}getStyle(e=jn){it.fromWorkingColorSpace(cn.copy(this),e);let t=cn.r,i=cn.g,r=cn.b;return e!==jn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL($r),this.setHSL($r.h+e,$r.s+t,$r.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL($r),e.getHSL(Au);let i=Ep($r.h,Au.h,t),r=Ep($r.s,Au.s,t),s=Ep($r.l,Au.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},cn=new ke;ke.NAMES=D1;var cE=0,is=class extends ns{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:cE++}),this.uuid=mr(),this.name="",this.type="Material",this.blending=Zo,this.side=ts,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rm,this.blendDst=sm,this.blendEquation=Ls,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=ea,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=M_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Co,this.stencilZFail=Co,this.stencilZPass=Co,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Zo&&(i.blending=this.blending),this.side!==ts&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==rm&&(i.blendSrc=this.blendSrc),this.blendDst!==sm&&(i.blendDst=this.blendDst),this.blendEquation!==Ls&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ea&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==M_&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Co&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Co&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Co&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},bn=class extends is{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hi,this.combine=M1,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ot=new I,Ru=new pe,Dt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Gm,this.updateRanges=[],this.gpuType=Fi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ru.fromBufferAttribute(this,t),Ru.applyMatrix3(e),this.setXY(t,Ru.x,Ru.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Oi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Oi(t,this.array)),t}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Oi(t,this.array)),t}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Oi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Oi(t,this.array)),t}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Gm&&(e.usage=this.usage),e}};var ch=class extends Dt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var uh=class extends Dt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var ct=class extends Dt{constructor(e,t,i){super(new Float32Array(e),t,i)}},uE=0,li=new ot,Wp=new wn,Fo=new I,qn=new vr,vl=new vr,Yt=new I,Qt=class n extends ns{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:uE++}),this.uuid=mr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(N1(e)?uh:ch)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Ve().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return li.makeRotationFromQuaternion(e),this.applyMatrix4(li),this}rotateX(e){return li.makeRotationX(e),this.applyMatrix4(li),this}rotateY(e){return li.makeRotationY(e),this.applyMatrix4(li),this}rotateZ(e){return li.makeRotationZ(e),this.applyMatrix4(li),this}translate(e,t,i){return li.makeTranslation(e,t,i),this.applyMatrix4(li),this}scale(e,t,i){return li.makeScale(e,t,i),this.applyMatrix4(li),this}lookAt(e){return Wp.lookAt(e),Wp.updateMatrix(),this.applyMatrix4(Wp.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fo).negate(),this.translate(Fo.x,Fo.y,Fo.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new ct(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new vr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];qn.setFromBufferAttribute(s),this.morphTargetsRelative?(Yt.addVectors(this.boundingBox.min,qn.min),this.boundingBox.expandByPoint(Yt),Yt.addVectors(this.boundingBox.max,qn.max),this.boundingBox.expandByPoint(Yt)):(this.boundingBox.expandByPoint(qn.min),this.boundingBox.expandByPoint(qn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Os);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){let i=this.boundingSphere.center;if(qn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];vl.setFromBufferAttribute(a),this.morphTargetsRelative?(Yt.addVectors(qn.min,vl.min),qn.expandByPoint(Yt),Yt.addVectors(qn.max,vl.max),qn.expandByPoint(Yt)):(qn.expandByPoint(vl.min),qn.expandByPoint(vl.max))}qn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Yt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Yt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Yt.fromBufferAttribute(a,c),l&&(Fo.fromBufferAttribute(e,c),Yt.add(Fo)),r=Math.max(r,i.distanceToSquared(Yt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Dt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<i.count;A++)a[A]=new I,l[A]=new I;let c=new I,u=new I,h=new I,d=new pe,p=new pe,m=new pe,x=new I,g=new I;function f(A,L,_){c.fromBufferAttribute(i,A),u.fromBufferAttribute(i,L),h.fromBufferAttribute(i,_),d.fromBufferAttribute(s,A),p.fromBufferAttribute(s,L),m.fromBufferAttribute(s,_),u.sub(c),h.sub(c),p.sub(d),m.sub(d);let S=1/(p.x*m.y-m.x*p.y);isFinite(S)&&(x.copy(u).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(S),g.copy(h).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(S),a[A].add(x),a[L].add(x),a[_].add(x),l[A].add(g),l[L].add(g),l[_].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let A=0,L=v.length;A<L;++A){let _=v[A],S=_.start,z=_.count;for(let N=S,F=S+z;N<F;N+=3)f(e.getX(N+0),e.getX(N+1),e.getX(N+2))}let y=new I,M=new I,R=new I,T=new I;function b(A){R.fromBufferAttribute(r,A),T.copy(R);let L=a[A];y.copy(L),y.sub(R.multiplyScalar(R.dot(L))).normalize(),M.crossVectors(T,L);let S=M.dot(l[A])<0?-1:1;o.setXYZW(A,y.x,y.y,y.z,S)}for(let A=0,L=v.length;A<L;++A){let _=v[A],S=_.start,z=_.count;for(let N=S,F=S+z;N<F;N+=3)b(e.getX(N+0)),b(e.getX(N+1)),b(e.getX(N+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Dt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,p=i.count;d<p;d++)i.setXYZ(d,0,0,0);let r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let d=0,p=e.count;d<p;d+=3){let m=e.getX(d+0),x=e.getX(d+1),g=e.getX(d+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,g),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,g),a.add(u),l.add(u),c.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Yt.fromBufferAttribute(e,t),Yt.normalize(),e.setXYZ(t,Yt.x,Yt.y,Yt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),p=0,m=0;for(let x=0,g=l.length;x<g;x++){a.isInterleavedBufferAttribute?p=l[x]*a.data.stride+a.offset:p=l[x]*u;for(let f=0;f<u;f++)d[m++]=c[p++]}return new Dt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],p=e(d,i);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let p=c[h];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},D_=new ot,As=new jm,Cu=new Os,U_=new I,Pu=new I,Iu=new I,Lu=new I,Xp=new I,ku=new I,z_=new I,Nu=new I,Ce=class extends wn{constructor(e=new Qt,t=new bn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){ku.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Xp.fromBufferAttribute(h,e),o?ku.addScaledVector(Xp,u):ku.addScaledVector(Xp.sub(t),u))}t.add(ku)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Cu.copy(i.boundingSphere),Cu.applyMatrix4(s),As.copy(e.ray).recast(e.near),!(Cu.containsPoint(As.origin)===!1&&(As.intersectSphere(Cu,U_)===null||As.origin.distanceToSquared(U_)>(e.far-e.near)**2))&&(D_.copy(s).invert(),As.copy(e.ray).applyMatrix4(D_),!(i.boundingBox!==null&&As.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,As)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let g=d[m],f=o[g.materialIndex],v=Math.max(g.start,p.start),y=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let M=v,R=y;M<R;M+=3){let T=a.getX(M),b=a.getX(M+1),A=a.getX(M+2);r=Du(this,f,e,i,c,u,h,T,b,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let g=m,f=x;g<f;g+=3){let v=a.getX(g),y=a.getX(g+1),M=a.getX(g+2);r=Du(this,o,e,i,c,u,h,v,y,M),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let g=d[m],f=o[g.materialIndex],v=Math.max(g.start,p.start),y=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let M=v,R=y;M<R;M+=3){let T=M,b=M+1,A=M+2;r=Du(this,f,e,i,c,u,h,T,b,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let g=m,f=x;g<f;g+=3){let v=g,y=g+1,M=g+2;r=Du(this,o,e,i,c,u,h,v,y,M),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}};function hE(n,e,t,i,r,s,o,a){let l;if(e.side===Jt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===ts,a),l===null)return null;Nu.copy(a),Nu.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Nu);return c<t.near||c>t.far?null:{distance:c,point:Nu.clone(),object:n}}function Du(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,Pu),n.getVertexPosition(l,Iu),n.getVertexPosition(c,Lu);let u=hE(n,e,t,i,Pu,Iu,Lu,z_);if(u){let h=new I;Jr.getBarycoord(z_,Pu,Iu,Lu,h),r&&(u.uv=Jr.getInterpolatedAttribute(r,a,l,c,h,new pe)),s&&(u.uv1=Jr.getInterpolatedAttribute(s,a,l,c,h,new pe)),o&&(u.normal=Jr.getInterpolatedAttribute(o,a,l,c,h,new I),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new I,materialIndex:0};Jr.getNormal(Pu,Iu,Lu,d.normal),u.face=d,u.barycoord=h}return u}var Vi=class n extends Qt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,p=0;m("z","y","x",-1,-1,i,t,e,o,s,0),m("z","y","x",1,-1,i,t,-e,o,s,1),m("x","z","y",1,1,e,i,t,r,o,2),m("x","z","y",1,-1,e,i,-t,r,o,3),m("x","y","z",1,-1,e,t,i,r,s,4),m("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new ct(c,3)),this.setAttribute("normal",new ct(u,3)),this.setAttribute("uv",new ct(h,2));function m(x,g,f,v,y,M,R,T,b,A,L){let _=M/b,S=R/A,z=M/2,N=R/2,F=T/2,X=b+1,O=A+1,Z=0,G=0,re=new I;for(let te=0;te<O;te++){let ce=te*S-N;for(let Oe=0;Oe<X;Oe++){let Fe=Oe*_-z;re[x]=Fe*v,re[g]=ce*y,re[f]=F,c.push(re.x,re.y,re.z),re[x]=0,re[g]=0,re[f]=T>0?1:-1,u.push(re.x,re.y,re.z),h.push(Oe/b),h.push(1-te/A),Z+=1}}for(let te=0;te<A;te++)for(let ce=0;ce<b;ce++){let Oe=d+ce+X*te,Fe=d+ce+X*(te+1),q=d+(ce+1)+X*(te+1),J=d+(ce+1)+X*te;l.push(Oe,Fe,J),l.push(Fe,q,J),G+=6}a.addGroup(p,G,L),p+=G,d+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function sa(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Mn(n){let e={};for(let t=0;t<n.length;t++){let i=sa(n[t]);for(let r in i)e[r]=i[r]}return e}function fE(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function U1(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:it.workingColorSpace}var dE={clone:sa,merge:Mn},pE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Gi=class extends is{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pE,this.fragmentShader=mE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=sa(e.uniforms),this.uniformsGroups=fE(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},hh=class extends wn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=pr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Zr=new I,O_=new pe,F_=new pe,Sn=class extends hh{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Wm*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(bp*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Wm*2*Math.atan(Math.tan(bp*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Zr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Zr.x,Zr.y).multiplyScalar(-e/Zr.z),Zr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Zr.x,Zr.y).multiplyScalar(-e/Zr.z)}getViewSize(e,t){return this.getViewBounds(e,O_,F_),t.subVectors(F_,O_)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(bp*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Bo=-90,Ho=1,$m=class extends wn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Sn(Bo,Ho,e,t);r.layers=this.layers,this.add(r);let s=new Sn(Bo,Ho,e,t);s.layers=this.layers,this.add(s);let o=new Sn(Bo,Ho,e,t);o.layers=this.layers,this.add(o);let a=new Sn(Bo,Ho,e,t);a.layers=this.layers,this.add(a);let l=new Sn(Bo,Ho,e,t);l.layers=this.layers,this.add(l);let c=new Sn(Bo,Ho,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===pr)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===rh)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,d,p),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},fh=class extends Nn{constructor(e,t,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:ta,super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Zm=class extends yr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new fh(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ti}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Vi(5,5,5),s=new Gi({name:"CubemapFromEquirect",uniforms:sa(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Jt,blending:Qr});s.uniforms.tEquirect.value=t;let o=new Ce(r,s),a=t.minFilter;return t.minFilter===Ds&&(t.minFilter=Ti),new $m(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},Yp=new I,gE=new I,yE=new Ve,dr=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Yp.subVectors(i,t).cross(gE.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Yp),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||yE.getNormalMatrix(e),r=this.coplanarPoint(Yp).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Rs=new Os,Uu=new I,Pl=class{constructor(e=new dr,t=new dr,i=new dr,r=new dr,s=new dr,o=new dr){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=pr){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],p=r[8],m=r[9],x=r[10],g=r[11],f=r[12],v=r[13],y=r[14],M=r[15];if(i[0].setComponents(l-s,d-c,g-p,M-f).normalize(),i[1].setComponents(l+s,d+c,g+p,M+f).normalize(),i[2].setComponents(l+o,d+u,g+m,M+v).normalize(),i[3].setComponents(l-o,d-u,g-m,M-v).normalize(),i[4].setComponents(l-a,d-h,g-x,M-y).normalize(),t===pr)i[5].setComponents(l+a,d+h,g+x,M+y).normalize();else if(t===rh)i[5].setComponents(a,h,x,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Rs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Rs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Rs)}intersectsSprite(e){return Rs.center.set(0,0,0),Rs.radius=.7071067811865476,Rs.applyMatrix4(e.matrixWorld),this.intersectsSphere(Rs)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Uu.x=r.normal.x>0?e.max.x:e.min.x,Uu.y=r.normal.y>0?e.max.y:e.min.y,Uu.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Uu)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function z1(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function vE(n){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(n.bindBuffer(c,a),h.length===0)n.bufferSubData(c,0,u);else{h.sort((p,m)=>p.start-m.start);let d=0;for(let p=1;p<h.length;p++){let m=h[d],x=h[p];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++d,h[d]=x)}h.length=d+1;for(let p=0,m=h.length;p<m;p++){let x=h[p];n.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var xr=class n extends Qt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,p=[],m=[],x=[],g=[];for(let f=0;f<u;f++){let v=f*d-o;for(let y=0;y<c;y++){let M=y*h-s;m.push(M,-v,0),x.push(0,0,1),g.push(y/a),g.push(1-f/l)}}for(let f=0;f<l;f++)for(let v=0;v<a;v++){let y=v+c*f,M=v+c*(f+1),R=v+1+c*(f+1),T=v+1+c*f;p.push(y,M,T),p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new ct(m,3)),this.setAttribute("normal",new ct(x,3)),this.setAttribute("uv",new ct(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},xE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_E=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ME=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,SE=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wE=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,bE=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,EE=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,TE=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,AE=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,RE=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,CE=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,PE=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,IE=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,LE=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,kE=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,NE=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,DE=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,UE=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,zE=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,OE=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,FE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,BE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,HE=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,VE=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,GE=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,WE=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,XE=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,YE=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,qE=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,jE=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$E="gl_FragColor = linearToOutputTexel( gl_FragColor );",ZE=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,KE=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,JE=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,QE=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,eT=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,tT=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,nT=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,iT=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rT=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,sT=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,oT=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,aT=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lT=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cT=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,uT=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,hT=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,fT=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,dT=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pT=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,mT=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gT=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,yT=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vT=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,xT=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,_T=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,MT=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ST=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wT=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bT=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ET=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,TT=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,AT=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,RT=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,CT=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,PT=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,IT=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,LT=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,kT=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,NT=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,DT=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,UT=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,zT=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,OT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,FT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,BT=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,HT=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,VT=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,GT=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,WT=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,XT=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,YT=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,qT=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,jT=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$T=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ZT=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,KT=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,JT=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,QT=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,e2=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,t2=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,n2=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,i2=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,r2=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,s2=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,o2=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,a2=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,l2=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,c2=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,u2=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,h2=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,f2=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,d2=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,p2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,m2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,g2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,y2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,v2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,x2=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,M2=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,w2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,E2=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,T2=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,A2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,R2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,C2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,P2=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,I2=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,L2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,k2=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N2=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,D2=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U2=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,z2=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,O2=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,F2=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,B2=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H2=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V2=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,G2=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,W2=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,X2=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Y2=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,q2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,j2=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$2=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Z2=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,K2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:xE,alphahash_pars_fragment:_E,alphamap_fragment:ME,alphamap_pars_fragment:SE,alphatest_fragment:wE,alphatest_pars_fragment:bE,aomap_fragment:EE,aomap_pars_fragment:TE,batching_pars_vertex:AE,batching_vertex:RE,begin_vertex:CE,beginnormal_vertex:PE,bsdfs:IE,iridescence_fragment:LE,bumpmap_pars_fragment:kE,clipping_planes_fragment:NE,clipping_planes_pars_fragment:DE,clipping_planes_pars_vertex:UE,clipping_planes_vertex:zE,color_fragment:OE,color_pars_fragment:FE,color_pars_vertex:BE,color_vertex:HE,common:VE,cube_uv_reflection_fragment:GE,defaultnormal_vertex:WE,displacementmap_pars_vertex:XE,displacementmap_vertex:YE,emissivemap_fragment:qE,emissivemap_pars_fragment:jE,colorspace_fragment:$E,colorspace_pars_fragment:ZE,envmap_fragment:KE,envmap_common_pars_fragment:JE,envmap_pars_fragment:QE,envmap_pars_vertex:eT,envmap_physical_pars_fragment:hT,envmap_vertex:tT,fog_vertex:nT,fog_pars_vertex:iT,fog_fragment:rT,fog_pars_fragment:sT,gradientmap_pars_fragment:oT,lightmap_pars_fragment:aT,lights_lambert_fragment:lT,lights_lambert_pars_fragment:cT,lights_pars_begin:uT,lights_toon_fragment:fT,lights_toon_pars_fragment:dT,lights_phong_fragment:pT,lights_phong_pars_fragment:mT,lights_physical_fragment:gT,lights_physical_pars_fragment:yT,lights_fragment_begin:vT,lights_fragment_maps:xT,lights_fragment_end:_T,logdepthbuf_fragment:MT,logdepthbuf_pars_fragment:ST,logdepthbuf_pars_vertex:wT,logdepthbuf_vertex:bT,map_fragment:ET,map_pars_fragment:TT,map_particle_fragment:AT,map_particle_pars_fragment:RT,metalnessmap_fragment:CT,metalnessmap_pars_fragment:PT,morphinstance_vertex:IT,morphcolor_vertex:LT,morphnormal_vertex:kT,morphtarget_pars_vertex:NT,morphtarget_vertex:DT,normal_fragment_begin:UT,normal_fragment_maps:zT,normal_pars_fragment:OT,normal_pars_vertex:FT,normal_vertex:BT,normalmap_pars_fragment:HT,clearcoat_normal_fragment_begin:VT,clearcoat_normal_fragment_maps:GT,clearcoat_pars_fragment:WT,iridescence_pars_fragment:XT,opaque_fragment:YT,packing:qT,premultiplied_alpha_fragment:jT,project_vertex:$T,dithering_fragment:ZT,dithering_pars_fragment:KT,roughnessmap_fragment:JT,roughnessmap_pars_fragment:QT,shadowmap_pars_fragment:e2,shadowmap_pars_vertex:t2,shadowmap_vertex:n2,shadowmask_pars_fragment:i2,skinbase_vertex:r2,skinning_pars_vertex:s2,skinning_vertex:o2,skinnormal_vertex:a2,specularmap_fragment:l2,specularmap_pars_fragment:c2,tonemapping_fragment:u2,tonemapping_pars_fragment:h2,transmission_fragment:f2,transmission_pars_fragment:d2,uv_pars_fragment:p2,uv_pars_vertex:m2,uv_vertex:g2,worldpos_vertex:y2,background_vert:v2,background_frag:x2,backgroundCube_vert:_2,backgroundCube_frag:M2,cube_vert:S2,cube_frag:w2,depth_vert:b2,depth_frag:E2,distanceRGBA_vert:T2,distanceRGBA_frag:A2,equirect_vert:R2,equirect_frag:C2,linedashed_vert:P2,linedashed_frag:I2,meshbasic_vert:L2,meshbasic_frag:k2,meshlambert_vert:N2,meshlambert_frag:D2,meshmatcap_vert:U2,meshmatcap_frag:z2,meshnormal_vert:O2,meshnormal_frag:F2,meshphong_vert:B2,meshphong_frag:H2,meshphysical_vert:V2,meshphysical_frag:G2,meshtoon_vert:W2,meshtoon_frag:X2,points_vert:Y2,points_frag:q2,shadow_vert:j2,shadow_frag:$2,sprite_vert:Z2,sprite_frag:K2},oe={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},zi={basic:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new ke(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Mn([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Mn([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new ke(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Mn([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Mn([oe.points,oe.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Mn([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Mn([oe.common,oe.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Mn([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Mn([oe.sprite,oe.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Mn([oe.common,oe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Mn([oe.lights,oe.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};zi.physical={uniforms:Mn([zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};var zu={r:0,b:0,g:0},Cs=new Hi,J2=new ot;function Q2(n,e,t,i,r,s,o){let a=new ke(0),l=s===!0?0:1,c,u,h=null,d=0,p=null;function m(v){let y=v.isScene===!0?v.background:null;return y&&y.isTexture&&(y=(v.backgroundBlurriness>0?t:e).get(y)),y}function x(v){let y=!1,M=m(v);M===null?f(a,l):M&&M.isColor&&(f(M,1),y=!0);let R=n.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(v,y){let M=m(y);M&&(M.isCubeTexture||M.mapping===Ah)?(u===void 0&&(u=new Ce(new Vi(1,1,1),new Gi({name:"BackgroundCubeMaterial",uniforms:sa(zi.backgroundCube.uniforms),vertexShader:zi.backgroundCube.vertexShader,fragmentShader:zi.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,T,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Cs.copy(y.backgroundRotation),Cs.x*=-1,Cs.y*=-1,Cs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Cs.y*=-1,Cs.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(J2.makeRotationFromEuler(Cs)),u.material.toneMapped=it.getTransfer(M.colorSpace)!==xt,(h!==M||d!==M.version||p!==n.toneMapping)&&(u.material.needsUpdate=!0,h=M,d=M.version,p=n.toneMapping),u.layers.enableAll(),v.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Ce(new xr(2,2),new Gi({name:"BackgroundMaterial",uniforms:sa(zi.background.uniforms),vertexShader:zi.background.vertexShader,fragmentShader:zi.background.fragmentShader,side:ts,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=it.getTransfer(M.colorSpace)!==xt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||p!==n.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,p=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function f(v,y){v.getRGB(zu,U1(n)),i.buffers.color.setClear(zu.r,zu.g,zu.b,y,o)}return{getClearColor:function(){return a},setClearColor:function(v,y=1){a.set(v),l=y,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,f(a,l)},render:x,addToRenderList:g}}function eA(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=d(null),s=r,o=!1;function a(_,S,z,N,F){let X=!1,O=h(N,z,S);s!==O&&(s=O,c(s.object)),X=p(_,N,z,F),X&&m(_,N,z,F),F!==null&&e.update(F,n.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,M(_,S,z,N),F!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return n.createVertexArray()}function c(_){return n.bindVertexArray(_)}function u(_){return n.deleteVertexArray(_)}function h(_,S,z){let N=z.wireframe===!0,F=i[_.id];F===void 0&&(F={},i[_.id]=F);let X=F[S.id];X===void 0&&(X={},F[S.id]=X);let O=X[N];return O===void 0&&(O=d(l()),X[N]=O),O}function d(_){let S=[],z=[],N=[];for(let F=0;F<t;F++)S[F]=0,z[F]=0,N[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:z,attributeDivisors:N,object:_,attributes:{},index:null}}function p(_,S,z,N){let F=s.attributes,X=S.attributes,O=0,Z=z.getAttributes();for(let G in Z)if(Z[G].location>=0){let te=F[G],ce=X[G];if(ce===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(ce=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(ce=_.instanceColor)),te===void 0||te.attribute!==ce||ce&&te.data!==ce.data)return!0;O++}return s.attributesNum!==O||s.index!==N}function m(_,S,z,N){let F={},X=S.attributes,O=0,Z=z.getAttributes();for(let G in Z)if(Z[G].location>=0){let te=X[G];te===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(te=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(te=_.instanceColor));let ce={};ce.attribute=te,te&&te.data&&(ce.data=te.data),F[G]=ce,O++}s.attributes=F,s.attributesNum=O,s.index=N}function x(){let _=s.newAttributes;for(let S=0,z=_.length;S<z;S++)_[S]=0}function g(_){f(_,0)}function f(_,S){let z=s.newAttributes,N=s.enabledAttributes,F=s.attributeDivisors;z[_]=1,N[_]===0&&(n.enableVertexAttribArray(_),N[_]=1),F[_]!==S&&(n.vertexAttribDivisor(_,S),F[_]=S)}function v(){let _=s.newAttributes,S=s.enabledAttributes;for(let z=0,N=S.length;z<N;z++)S[z]!==_[z]&&(n.disableVertexAttribArray(z),S[z]=0)}function y(_,S,z,N,F,X,O){O===!0?n.vertexAttribIPointer(_,S,z,F,X):n.vertexAttribPointer(_,S,z,N,F,X)}function M(_,S,z,N){x();let F=N.attributes,X=z.getAttributes(),O=S.defaultAttributeValues;for(let Z in X){let G=X[Z];if(G.location>=0){let re=F[Z];if(re===void 0&&(Z==="instanceMatrix"&&_.instanceMatrix&&(re=_.instanceMatrix),Z==="instanceColor"&&_.instanceColor&&(re=_.instanceColor)),re!==void 0){let te=re.normalized,ce=re.itemSize,Oe=e.get(re);if(Oe===void 0)continue;let Fe=Oe.buffer,q=Oe.type,J=Oe.bytesPerElement,ue=q===n.INT||q===n.UNSIGNED_INT||re.gpuType===L0;if(re.isInterleavedBufferAttribute){let Y=re.data,ae=Y.stride,he=re.offset;if(Y.isInstancedInterleavedBuffer){for(let we=0;we<G.locationSize;we++)f(G.location+we,Y.meshPerAttribute);_.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let we=0;we<G.locationSize;we++)g(G.location+we);n.bindBuffer(n.ARRAY_BUFFER,Fe);for(let we=0;we<G.locationSize;we++)y(G.location+we,ce/G.locationSize,q,te,ae*J,(he+ce/G.locationSize*we)*J,ue)}else{if(re.isInstancedBufferAttribute){for(let Y=0;Y<G.locationSize;Y++)f(G.location+Y,re.meshPerAttribute);_.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Y=0;Y<G.locationSize;Y++)g(G.location+Y);n.bindBuffer(n.ARRAY_BUFFER,Fe);for(let Y=0;Y<G.locationSize;Y++)y(G.location+Y,ce/G.locationSize,q,te,ce*J,ce/G.locationSize*Y*J,ue)}}else if(O!==void 0){let te=O[Z];if(te!==void 0)switch(te.length){case 2:n.vertexAttrib2fv(G.location,te);break;case 3:n.vertexAttrib3fv(G.location,te);break;case 4:n.vertexAttrib4fv(G.location,te);break;default:n.vertexAttrib1fv(G.location,te)}}}}v()}function R(){A();for(let _ in i){let S=i[_];for(let z in S){let N=S[z];for(let F in N)u(N[F].object),delete N[F];delete S[z]}delete i[_]}}function T(_){if(i[_.id]===void 0)return;let S=i[_.id];for(let z in S){let N=S[z];for(let F in N)u(N[F].object),delete N[F];delete S[z]}delete i[_.id]}function b(_){for(let S in i){let z=i[S];if(z[_.id]===void 0)continue;let N=z[_.id];for(let F in N)u(N[F].object),delete N[F];delete z[_.id]}}function A(){L(),o=!0,s!==r&&(s=r,c(s.object))}function L(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:A,resetDefaultState:L,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:b,initAttributes:x,enableAttribute:g,disableUnusedAttributes:v}}function tA(n,e,t){let i;function r(c){i=c}function s(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),t.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let p=0;for(let m=0;m<h;m++)p+=u[m];t.update(p,i,1)}function l(c,u,h,d){if(h===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<c.length;m++)o(c[m],u[m],d[m]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,u,0,d,0,h);let m=0;for(let x=0;x<h;x++)m+=u[x];for(let x=0;x<d.length;x++)t.update(m,i,d[x])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function nA(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(b){return!(b!==Ai&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let A=b===Hl&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==gr&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==Fi&&!A)}function l(b){if(b==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(d===!0){let b=e.get("EXT_clip_control");b.clipControlEXT(b.LOWER_LEFT_EXT,b.ZERO_TO_ONE_EXT)}let p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=m>0,T=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:M,vertexTextures:R,maxSamples:T}}function iA(n){let e=this,t=null,i=0,r=!1,s=!1,o=new dr,a=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let p=h.length!==0||d||i!==0||r;return r=d,i=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,p){let m=h.clippingPlanes,x=h.clipIntersection,g=h.clipShadows,f=n.get(h);if(!r||m===null||m.length===0||s&&!g)s?u(null):c();else{let v=s?0:i,y=v*4,M=f.clippingState||null;l.value=M,M=u(m,d,y,p);for(let R=0;R!==y;++R)M[R]=t[R];f.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,p,m){let x=h!==null?h.length:0,g=null;if(x!==0){if(g=l.value,m!==!0||g===null){let f=p+x*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(g===null||g.length<f)&&(g=new Float32Array(f));for(let y=0,M=p;y!==x;++y,M+=4)o.copy(h[y]).applyMatrix4(v,a),o.normal.toArray(g,M),g[M+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}function rA(n){let e=new WeakMap;function t(o,a){return a===dm?o.mapping=ta:a===pm&&(o.mapping=na),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===dm||a===pm)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Zm(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var dh=class extends hh{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},jo=4,B_=[.125,.215,.35,.446,.526,.582],ks=20,qp=new dh,H_=new ke,jp=null,$p=0,Zp=0,Kp=!1,Is=(1+Math.sqrt(5))/2,Vo=1/Is,V_=[new I(-Is,Vo,0),new I(Is,Vo,0),new I(-Vo,0,Is),new I(Vo,0,Is),new I(0,Is,-Vo),new I(0,Is,Vo),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],oa=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){jp=this._renderer.getRenderTarget(),$p=this._renderer.getActiveCubeFace(),Zp=this._renderer.getActiveMipmapLevel(),Kp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=X_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=W_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(jp,$p,Zp),this._renderer.xr.enabled=Kp,e.scissorTest=!1,Ou(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ta||e.mapping===na?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),jp=this._renderer.getRenderTarget(),$p=this._renderer.getActiveCubeFace(),Zp=this._renderer.getActiveMipmapLevel(),Kp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ti,minFilter:Ti,generateMipmaps:!1,type:Hl,format:Ai,colorSpace:ss,depthBuffer:!1},r=G_(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=G_(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sA(s)),this._blurMaterial=oA(s,e,t)}return r}_compileMaterial(e){let t=new Ce(this._lodPlanes[0],e);this._renderer.compile(t,qp)}_sceneToCubeUV(e,t,i,r){let a=new Sn(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(H_),u.toneMapping=es,u.autoClear=!1;let p=new bn({name:"PMREM.Background",side:Jt,depthWrite:!1,depthTest:!1}),m=new Ce(new Vi,p),x=!1,g=e.background;g?g.isColor&&(p.color.copy(g),e.background=null,x=!0):(p.color.copy(H_),x=!0);for(let f=0;f<6;f++){let v=f%3;v===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):v===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));let y=this._cubeSize;Ou(r,v*y,f>2?y:0,y,y),u.setRenderTarget(r),x&&u.render(m,a),u.render(e,a)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=g}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===ta||e.mapping===na;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=X_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=W_());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new Ce(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Ou(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,qp)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=V_[(r-s-1)%V_.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Ce(this._lodPlanes[r],c),d=c.uniforms,p=this._sizeLods[i]-1,m=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*ks-1),x=s/m,g=isFinite(s)?1+Math.floor(u*x):ks;g>ks&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${ks}`);let f=[],v=0;for(let b=0;b<ks;++b){let A=b/x,L=Math.exp(-A*A/2);f.push(L),b===0?v+=L:b<g&&(v+=2*L)}for(let b=0;b<f.length;b++)f[b]=f[b]/v;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:y}=this;d.dTheta.value=m,d.mipInt.value=y-i;let M=this._sizeLods[r],R=3*M*(r>y-jo?r-y+jo:0),T=4*(this._cubeSize-M);Ou(t,R,T,3*M,2*M),l.setRenderTarget(t),l.render(h,qp)}};function sA(n){let e=[],t=[],i=[],r=n,s=n-jo+1+B_.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-jo?l=B_[o-n+jo-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,m=6,x=3,g=2,f=1,v=new Float32Array(x*m*p),y=new Float32Array(g*m*p),M=new Float32Array(f*m*p);for(let T=0;T<p;T++){let b=T%3*2/3-1,A=T>2?0:-1,L=[b,A,0,b+2/3,A,0,b+2/3,A+1,0,b,A,0,b+2/3,A+1,0,b,A+1,0];v.set(L,x*m*T),y.set(d,g*m*T);let _=[T,T,T,T,T,T];M.set(_,f*m*T)}let R=new Qt;R.setAttribute("position",new Dt(v,x)),R.setAttribute("uv",new Dt(y,g)),R.setAttribute("faceIndex",new Dt(M,f)),e.push(R),r>jo&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function G_(n,e,t){let i=new yr(n,e,t);return i.texture.mapping=Ah,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ou(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function oA(n,e,t){let i=new Float32Array(ks),r=new I(0,1,0);return new Gi({name:"SphericalGaussianBlur",defines:{n:ks,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:B0(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Qr,depthTest:!1,depthWrite:!1})}function W_(){return new Gi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:B0(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Qr,depthTest:!1,depthWrite:!1})}function X_(){return new Gi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:B0(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qr,depthTest:!1,depthWrite:!1})}function B0(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function aA(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===dm||l===pm,u=l===ta||l===na;if(c||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new oa(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return c&&p&&p.height>0||u&&p&&r(p)?(t===null&&(t=new oa(n)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function lA(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&Qu("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function cA(n,e,t,i){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);for(let m in d.morphAttributes){let x=d.morphAttributes[m];for(let g=0,f=x.length;g<f;g++)e.remove(x[g])}d.removeEventListener("dispose",o),delete r[d.id];let p=s.get(d);p&&(e.remove(p),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let m in d)e.update(d[m],n.ARRAY_BUFFER);let p=h.morphAttributes;for(let m in p){let x=p[m];for(let g=0,f=x.length;g<f;g++)e.update(x[g],n.ARRAY_BUFFER)}}function c(h){let d=[],p=h.index,m=h.attributes.position,x=0;if(p!==null){let v=p.array;x=p.version;for(let y=0,M=v.length;y<M;y+=3){let R=v[y+0],T=v[y+1],b=v[y+2];d.push(R,T,T,b,b,R)}}else if(m!==void 0){let v=m.array;x=m.version;for(let y=0,M=v.length/3-1;y<M;y+=3){let R=y+0,T=y+1,b=y+2;d.push(R,T,T,b,b,R)}}else return;let g=new(N1(d)?uh:ch)(d,1);g.version=x;let f=s.get(h);f&&e.remove(f),s.set(h,g)}function u(h){let d=s.get(h);if(d){let p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function uA(n,e,t){let i;function r(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,p){n.drawElements(i,p,s,d*o),t.update(p,i,1)}function c(d,p,m){m!==0&&(n.drawElementsInstanced(i,p,s,d*o,m),t.update(p,i,m))}function u(d,p,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,d,0,m);let g=0;for(let f=0;f<m;f++)g+=p[f];t.update(g,i,1)}function h(d,p,m,x){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let f=0;f<d.length;f++)c(d[f]/o,p[f],x[f]);else{g.multiDrawElementsInstancedWEBGL(i,p,0,s,d,0,x,0,m);let f=0;for(let v=0;v<m;v++)f+=p[v];for(let v=0;v<x.length;v++)t.update(f,i,x[v])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function hA(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function fA(n,e,t){let i=new WeakMap,r=new It;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let L=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],y=0;p===!0&&(y=1),m===!0&&(y=2),x===!0&&(y=3);let M=a.attributes.position.count*y,R=1;M>e.maxTextureSize&&(R=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let T=new Float32Array(M*R*4*h),b=new ah(T,M,R,h);b.type=Fi,b.needsUpdate=!0;let A=y*4;for(let _=0;_<h;_++){let S=g[_],z=f[_],N=v[_],F=M*R*4*_;for(let X=0;X<S.count;X++){let O=X*A;p===!0&&(r.fromBufferAttribute(S,X),T[F+O+0]=r.x,T[F+O+1]=r.y,T[F+O+2]=r.z,T[F+O+3]=0),m===!0&&(r.fromBufferAttribute(z,X),T[F+O+4]=r.x,T[F+O+5]=r.y,T[F+O+6]=r.z,T[F+O+7]=0),x===!0&&(r.fromBufferAttribute(N,X),T[F+O+8]=r.x,T[F+O+9]=r.y,T[F+O+10]=r.z,T[F+O+11]=N.itemSize===4?r.w:1)}}d={count:h,texture:b,size:new pe(M,R)},i.set(a,d),a.addEventListener("dispose",L)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let p=0;for(let x=0;x<c.length;x++)p+=c[x];let m=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:s}}function dA(n,e,t,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var ph=class extends Nn{constructor(e,t,i,r,s,o,a,l,c,u=Ko){if(u!==Ko&&u!==ra)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Ko&&(i=zs),i===void 0&&u===ra&&(i=ia),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:hn,this.minFilter=l!==void 0?l:hn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},O1=new Nn,Y_=new ph(1,1),F1=new ah,B1=new qm,H1=new fh,q_=[],j_=[],$_=new Float32Array(16),Z_=new Float32Array(9),K_=new Float32Array(4);function ca(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=q_[r];if(s===void 0&&(s=new Float32Array(r),q_[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Ht(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Vt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Ch(n,e){let t=j_[e];t===void 0&&(t=new Int32Array(e),j_[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function pA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function mA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;n.uniform2fv(this.addr,e),Vt(t,e)}}function gA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ht(t,e))return;n.uniform3fv(this.addr,e),Vt(t,e)}}function yA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;n.uniform4fv(this.addr,e),Vt(t,e)}}function vA(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ht(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,i))return;K_.set(i),n.uniformMatrix2fv(this.addr,!1,K_),Vt(t,i)}}function xA(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ht(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,i))return;Z_.set(i),n.uniformMatrix3fv(this.addr,!1,Z_),Vt(t,i)}}function _A(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ht(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Vt(t,e)}else{if(Ht(t,i))return;$_.set(i),n.uniformMatrix4fv(this.addr,!1,$_),Vt(t,i)}}function MA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function SA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;n.uniform2iv(this.addr,e),Vt(t,e)}}function wA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;n.uniform3iv(this.addr,e),Vt(t,e)}}function bA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;n.uniform4iv(this.addr,e),Vt(t,e)}}function EA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function TA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;n.uniform2uiv(this.addr,e),Vt(t,e)}}function AA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;n.uniform3uiv(this.addr,e),Vt(t,e)}}function RA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;n.uniform4uiv(this.addr,e),Vt(t,e)}}function CA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(Y_.compareFunction=k1,s=Y_):s=O1,t.setTexture2D(e||s,r)}function PA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||B1,r)}function IA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||H1,r)}function LA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||F1,r)}function kA(n){switch(n){case 5126:return pA;case 35664:return mA;case 35665:return gA;case 35666:return yA;case 35674:return vA;case 35675:return xA;case 35676:return _A;case 5124:case 35670:return MA;case 35667:case 35671:return SA;case 35668:case 35672:return wA;case 35669:case 35673:return bA;case 5125:return EA;case 36294:return TA;case 36295:return AA;case 36296:return RA;case 35678:case 36198:case 36298:case 36306:case 35682:return CA;case 35679:case 36299:case 36307:return PA;case 35680:case 36300:case 36308:case 36293:return IA;case 36289:case 36303:case 36311:case 36292:return LA}}function NA(n,e){n.uniform1fv(this.addr,e)}function DA(n,e){let t=ca(e,this.size,2);n.uniform2fv(this.addr,t)}function UA(n,e){let t=ca(e,this.size,3);n.uniform3fv(this.addr,t)}function zA(n,e){let t=ca(e,this.size,4);n.uniform4fv(this.addr,t)}function OA(n,e){let t=ca(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function FA(n,e){let t=ca(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function BA(n,e){let t=ca(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function HA(n,e){n.uniform1iv(this.addr,e)}function VA(n,e){n.uniform2iv(this.addr,e)}function GA(n,e){n.uniform3iv(this.addr,e)}function WA(n,e){n.uniform4iv(this.addr,e)}function XA(n,e){n.uniform1uiv(this.addr,e)}function YA(n,e){n.uniform2uiv(this.addr,e)}function qA(n,e){n.uniform3uiv(this.addr,e)}function jA(n,e){n.uniform4uiv(this.addr,e)}function $A(n,e,t){let i=this.cache,r=e.length,s=Ch(t,r);Ht(i,s)||(n.uniform1iv(this.addr,s),Vt(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||O1,s[o])}function ZA(n,e,t){let i=this.cache,r=e.length,s=Ch(t,r);Ht(i,s)||(n.uniform1iv(this.addr,s),Vt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||B1,s[o])}function KA(n,e,t){let i=this.cache,r=e.length,s=Ch(t,r);Ht(i,s)||(n.uniform1iv(this.addr,s),Vt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||H1,s[o])}function JA(n,e,t){let i=this.cache,r=e.length,s=Ch(t,r);Ht(i,s)||(n.uniform1iv(this.addr,s),Vt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||F1,s[o])}function QA(n){switch(n){case 5126:return NA;case 35664:return DA;case 35665:return UA;case 35666:return zA;case 35674:return OA;case 35675:return FA;case 35676:return BA;case 5124:case 35670:return HA;case 35667:case 35671:return VA;case 35668:case 35672:return GA;case 35669:case 35673:return WA;case 5125:return XA;case 36294:return YA;case 36295:return qA;case 36296:return jA;case 35678:case 36198:case 36298:case 36306:case 35682:return $A;case 35679:case 36299:case 36307:return ZA;case 35680:case 36300:case 36308:case 36293:return KA;case 36289:case 36303:case 36311:case 36292:return JA}}var Km=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=kA(t.type)}},Jm=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=QA(t.type)}},Qm=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Jp=/(\w+)(\])?(\[|\.)?/g;function J_(n,e){n.seq.push(e),n.map[e.id]=e}function eR(n,e,t){let i=n.name,r=i.length;for(Jp.lastIndex=0;;){let s=Jp.exec(i),o=Jp.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){J_(t,c===void 0?new Km(a,n,e):new Jm(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Qm(a),J_(t,h)),t=h}}}var Qo=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);eR(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function Q_(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var tR=37297,nR=0;function iR(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function rR(n){let e=it.getPrimaries(it.workingColorSpace),t=it.getPrimaries(n),i;switch(e===t?i="":e===ih&&t===nh?i="LinearDisplayP3ToLinearSRGB":e===nh&&t===ih&&(i="LinearSRGBToLinearDisplayP3"),n){case ss:case Rh:return[i,"LinearTransferOETF"];case jn:case F0:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function e1(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+iR(n.getShaderSource(e),o)}else return r}function sR(n,e){let t=rR(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function oR(n,e){let t;switch(e){case Pb:t="Linear";break;case Ib:t="Reinhard";break;case Lb:t="Cineon";break;case kb:t="ACESFilmic";break;case Db:t="AgX";break;case Ub:t="Neutral";break;case Nb:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Fu=new I;function aR(){it.getLuminanceCoefficients(Fu);let n=Fu.x.toFixed(4),e=Fu.y.toFixed(4),t=Fu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lR(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bl).join(`
`)}function cR(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function uR(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function bl(n){return n!==""}function t1(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function n1(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var hR=/^[ \t]*#include +<([\w\d./]+)>/gm;function e0(n){return n.replace(hR,dR)}var fR=new Map;function dR(n,e){let t=He[e];if(t===void 0){let i=fR.get(e);if(i!==void 0)t=He[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return e0(t)}var pR=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function i1(n){return n.replace(pR,mR)}function mR(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function r1(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function gR(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===_1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===I0?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===fr&&(e="SHADOWMAP_TYPE_VSM"),e}function yR(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ta:case na:e="ENVMAP_TYPE_CUBE";break;case Ah:e="ENVMAP_TYPE_CUBE_UV";break}return e}function vR(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case na:e="ENVMAP_MODE_REFRACTION";break}return e}function xR(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case M1:e="ENVMAP_BLENDING_MULTIPLY";break;case Rb:e="ENVMAP_BLENDING_MIX";break;case Cb:e="ENVMAP_BLENDING_ADD";break}return e}function _R(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function MR(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=gR(t),c=yR(t),u=vR(t),h=xR(t),d=_R(t),p=lR(t),m=cR(s),x=r.createProgram(),g,f,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(bl).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(bl).join(`
`),f.length>0&&(f+=`
`)):(g=[r1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bl).join(`
`),f=[r1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==es?"#define TONE_MAPPING":"",t.toneMapping!==es?He.tonemapping_pars_fragment:"",t.toneMapping!==es?oR("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,sR("linearToOutputTexel",t.outputColorSpace),aR(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(bl).join(`
`)),o=e0(o),o=t1(o,t),o=n1(o,t),a=e0(a),a=t1(a,t),a=n1(a,t),o=i1(o),a=i1(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",t.glslVersion===S_?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===S_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let y=v+g+o,M=v+f+a,R=Q_(r,r.VERTEX_SHADER,y),T=Q_(r,r.FRAGMENT_SHADER,M);r.attachShader(x,R),r.attachShader(x,T),t.index0AttributeName!==void 0?r.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function b(S){if(n.debug.checkShaderErrors){let z=r.getProgramInfoLog(x).trim(),N=r.getShaderInfoLog(R).trim(),F=r.getShaderInfoLog(T).trim(),X=!0,O=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,x,R,T);else{let Z=e1(r,R,"vertex"),G=e1(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+z+`
`+Z+`
`+G)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(N===""||F==="")&&(O=!1);O&&(S.diagnostics={runnable:X,programLog:z,vertexShader:{log:N,prefix:g},fragmentShader:{log:F,prefix:f}})}r.deleteShader(R),r.deleteShader(T),A=new Qo(r,x),L=uR(r,x)}let A;this.getUniforms=function(){return A===void 0&&b(this),A};let L;this.getAttributes=function(){return L===void 0&&b(this),L};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(x,tR)),_},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=nR++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=T,this}var SR=0,t0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new n0(e),t.set(e,i)),i}},n0=class{constructor(e){this.id=SR++,this.code=e,this.usedTimes=0}};function wR(n,e,t,i,r,s,o){let a=new lh,l=new t0,c=new Set,u=[],h=r.logarithmicDepthBuffer,d=r.reverseDepthBuffer,p=r.vertexTextures,m=r.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function f(_,S,z,N,F){let X=N.fog,O=F.geometry,Z=_.isMeshStandardMaterial?N.environment:null,G=(_.isMeshStandardMaterial?t:e).get(_.envMap||Z),re=G&&G.mapping===Ah?G.image.height:null,te=x[_.type];_.precision!==null&&(m=r.getMaxPrecision(_.precision),m!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",m,"instead."));let ce=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Oe=ce!==void 0?ce.length:0,Fe=0;O.morphAttributes.position!==void 0&&(Fe=1),O.morphAttributes.normal!==void 0&&(Fe=2),O.morphAttributes.color!==void 0&&(Fe=3);let q,J,ue,Y;if(te){let Rn=zi[te];q=Rn.vertexShader,J=Rn.fragmentShader}else q=_.vertexShader,J=_.fragmentShader,l.update(_),ue=l.getVertexShaderID(_),Y=l.getFragmentShaderID(_);let ae=n.getRenderTarget(),he=F.isInstancedMesh===!0,we=F.isBatchedMesh===!0,Ge=!!_.map,Pe=!!_.matcap,P=!!G,dn=!!_.aoMap,je=!!_.lightMap,Je=!!_.bumpMap,Ne=!!_.normalMap,pt=!!_.displacementMap,ze=!!_.emissiveMap,C=!!_.metalnessMap,w=!!_.roughnessMap,B=_.anisotropy>0,$=_.clearcoat>0,Q=_.dispersion>0,j=_.iridescence>0,be=_.sheen>0,le=_.transmission>0,ve=B&&!!_.anisotropyMap,Qe=$&&!!_.clearcoatMap,ne=$&&!!_.clearcoatNormalMap,xe=$&&!!_.clearcoatRoughnessMap,De=j&&!!_.iridescenceMap,Ue=j&&!!_.iridescenceThicknessMap,_e=be&&!!_.sheenColorMap,$e=be&&!!_.sheenRoughnessMap,Be=!!_.specularMap,ut=!!_.specularColorMap,k=!!_.specularIntensityMap,me=le&&!!_.transmissionMap,W=le&&!!_.thicknessMap,K=!!_.gradientMap,fe=!!_.alphaMap,ge=_.alphaTest>0,Ze=!!_.alphaHash,Ut=!!_.extensions,An=es;_.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(An=n.toneMapping);let et={shaderID:te,shaderType:_.type,shaderName:_.name,vertexShader:q,fragmentShader:J,defines:_.defines,customVertexShaderID:ue,customFragmentShaderID:Y,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:m,batching:we,batchingColor:we&&F._colorsTexture!==null,instancing:he,instancingColor:he&&F.instanceColor!==null,instancingMorph:he&&F.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:ss,alphaToCoverage:!!_.alphaToCoverage,map:Ge,matcap:Pe,envMap:P,envMapMode:P&&G.mapping,envMapCubeUVHeight:re,aoMap:dn,lightMap:je,bumpMap:Je,normalMap:Ne,displacementMap:p&&pt,emissiveMap:ze,normalMapObjectSpace:Ne&&_.normalMapType===Bb,normalMapTangentSpace:Ne&&_.normalMapType===L1,metalnessMap:C,roughnessMap:w,anisotropy:B,anisotropyMap:ve,clearcoat:$,clearcoatMap:Qe,clearcoatNormalMap:ne,clearcoatRoughnessMap:xe,dispersion:Q,iridescence:j,iridescenceMap:De,iridescenceThicknessMap:Ue,sheen:be,sheenColorMap:_e,sheenRoughnessMap:$e,specularMap:Be,specularColorMap:ut,specularIntensityMap:k,transmission:le,transmissionMap:me,thicknessMap:W,gradientMap:K,opaque:_.transparent===!1&&_.blending===Zo&&_.alphaToCoverage===!1,alphaMap:fe,alphaTest:ge,alphaHash:Ze,combine:_.combine,mapUv:Ge&&g(_.map.channel),aoMapUv:dn&&g(_.aoMap.channel),lightMapUv:je&&g(_.lightMap.channel),bumpMapUv:Je&&g(_.bumpMap.channel),normalMapUv:Ne&&g(_.normalMap.channel),displacementMapUv:pt&&g(_.displacementMap.channel),emissiveMapUv:ze&&g(_.emissiveMap.channel),metalnessMapUv:C&&g(_.metalnessMap.channel),roughnessMapUv:w&&g(_.roughnessMap.channel),anisotropyMapUv:ve&&g(_.anisotropyMap.channel),clearcoatMapUv:Qe&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:ne&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:De&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ue&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:$e&&g(_.sheenRoughnessMap.channel),specularMapUv:Be&&g(_.specularMap.channel),specularColorMapUv:ut&&g(_.specularColorMap.channel),specularIntensityMapUv:k&&g(_.specularIntensityMap.channel),transmissionMapUv:me&&g(_.transmissionMap.channel),thicknessMapUv:W&&g(_.thicknessMap.channel),alphaMapUv:fe&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Ne||B),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!O.attributes.uv&&(Ge||fe),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:d,skinning:F.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Oe,morphTextureStride:Fe,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&z.length>0,shadowMapType:n.shadowMap.type,toneMapping:An,decodeVideoTexture:Ge&&_.map.isVideoTexture===!0&&it.getTransfer(_.map.colorSpace)===xt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===$n,flipSided:_.side===Jt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ut&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ut&&_.extensions.multiDraw===!0||we)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return et.vertexUv1s=c.has(1),et.vertexUv2s=c.has(2),et.vertexUv3s=c.has(3),c.clear(),et}function v(_){let S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(let z in _.defines)S.push(z),S.push(_.defines[z]);return _.isRawShaderMaterial===!1&&(y(S,_),M(S,_),S.push(n.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function y(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function M(_,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.alphaToCoverage&&a.enable(20),_.push(a.mask)}function R(_){let S=x[_.type],z;if(S){let N=zi[S];z=dE.clone(N.uniforms)}else z=_.uniforms;return z}function T(_,S){let z;for(let N=0,F=u.length;N<F;N++){let X=u[N];if(X.cacheKey===S){z=X,++z.usedTimes;break}}return z===void 0&&(z=new MR(n,S,_,s),u.push(z)),z}function b(_){if(--_.usedTimes===0){let S=u.indexOf(_);u[S]=u[u.length-1],u.pop(),_.destroy()}}function A(_){l.remove(_)}function L(){l.dispose()}return{getParameters:f,getProgramCacheKey:v,getUniforms:R,acquireProgram:T,releaseProgram:b,releaseShaderCache:A,programs:u,dispose:L}}function bR(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function ER(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function s1(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function o1(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,d,p,m,x,g){let f=n[e];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:m,renderOrder:h.renderOrder,z:x,group:g},n[e]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=m,f.renderOrder=h.renderOrder,f.z=x,f.group=g),e++,f}function a(h,d,p,m,x,g){let f=o(h,d,p,m,x,g);p.transmission>0?i.push(f):p.transparent===!0?r.push(f):t.push(f)}function l(h,d,p,m,x,g){let f=o(h,d,p,m,x,g);p.transmission>0?i.unshift(f):p.transparent===!0?r.unshift(f):t.unshift(f)}function c(h,d){t.length>1&&t.sort(h||ER),i.length>1&&i.sort(d||s1),r.length>1&&r.sort(d||s1)}function u(){for(let h=e,d=n.length;h<d;h++){let p=n[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function TR(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new o1,n.set(i,[o])):r>=s.length?(o=new o1,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function AR(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new ke};break;case"SpotLight":t={position:new I,direction:new I,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new I,halfWidth:new I,halfHeight:new I};break}return n[e.id]=t,t}}}function RR(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var CR=0;function PR(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function IR(n){let e=new AR,t=RR(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);let r=new I,s=new ot,o=new ot;function a(c){let u=0,h=0,d=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let p=0,m=0,x=0,g=0,f=0,v=0,y=0,M=0,R=0,T=0,b=0;c.sort(PR);for(let L=0,_=c.length;L<_;L++){let S=c[L],z=S.color,N=S.intensity,F=S.distance,X=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)u+=z.r*N,h+=z.g*N,d+=z.b*N;else if(S.isLightProbe){for(let O=0;O<9;O++)i.probe[O].addScaledVector(S.sh.coefficients[O],N);b++}else if(S.isDirectionalLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let Z=S.shadow,G=t.get(S);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,i.directionalShadow[p]=G,i.directionalShadowMap[p]=X,i.directionalShadowMatrix[p]=S.shadow.matrix,v++}i.directional[p]=O,p++}else if(S.isSpotLight){let O=e.get(S);O.position.setFromMatrixPosition(S.matrixWorld),O.color.copy(z).multiplyScalar(N),O.distance=F,O.coneCos=Math.cos(S.angle),O.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),O.decay=S.decay,i.spot[x]=O;let Z=S.shadow;if(S.map&&(i.spotLightMap[R]=S.map,R++,Z.updateMatrices(S),S.castShadow&&T++),i.spotLightMatrix[x]=Z.matrix,S.castShadow){let G=t.get(S);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,i.spotShadow[x]=G,i.spotShadowMap[x]=X,M++}x++}else if(S.isRectAreaLight){let O=e.get(S);O.color.copy(z).multiplyScalar(N),O.halfWidth.set(S.width*.5,0,0),O.halfHeight.set(0,S.height*.5,0),i.rectArea[g]=O,g++}else if(S.isPointLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),O.distance=S.distance,O.decay=S.decay,S.castShadow){let Z=S.shadow,G=t.get(S);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,G.shadowCameraNear=Z.camera.near,G.shadowCameraFar=Z.camera.far,i.pointShadow[m]=G,i.pointShadowMap[m]=X,i.pointShadowMatrix[m]=S.shadow.matrix,y++}i.point[m]=O,m++}else if(S.isHemisphereLight){let O=e.get(S);O.skyColor.copy(S.color).multiplyScalar(N),O.groundColor.copy(S.groundColor).multiplyScalar(N),i.hemi[f]=O,f++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let A=i.hash;(A.directionalLength!==p||A.pointLength!==m||A.spotLength!==x||A.rectAreaLength!==g||A.hemiLength!==f||A.numDirectionalShadows!==v||A.numPointShadows!==y||A.numSpotShadows!==M||A.numSpotMaps!==R||A.numLightProbes!==b)&&(i.directional.length=p,i.spot.length=x,i.rectArea.length=g,i.point.length=m,i.hemi.length=f,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=M+R-T,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=b,A.directionalLength=p,A.pointLength=m,A.spotLength=x,A.rectAreaLength=g,A.hemiLength=f,A.numDirectionalShadows=v,A.numPointShadows=y,A.numSpotShadows=M,A.numSpotMaps=R,A.numLightProbes=b,i.version=CR++)}function l(c,u){let h=0,d=0,p=0,m=0,x=0,g=u.matrixWorldInverse;for(let f=0,v=c.length;f<v;f++){let y=c[f];if(y.isDirectionalLight){let M=i.directional[h];M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),h++}else if(y.isSpotLight){let M=i.spot[p];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),p++}else if(y.isRectAreaLight){let M=i.rectArea[m];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),o.identity(),s.copy(y.matrixWorld),s.premultiply(g),o.extractRotation(s),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),m++}else if(y.isPointLight){let M=i.point[d];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),d++}else if(y.isHemisphereLight){let M=i.hemi[x];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(g),x++}}}return{setup:a,setupView:l,state:i}}function a1(n){let e=new IR(n),t=[],i=[];function r(u){c.camera=u,t.length=0,i.length=0}function s(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function LR(n){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new a1(n),e.set(r,[a])):s>=o.length?(a=new a1(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var i0=class extends is{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ob,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},r0=class extends is{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},kR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,NR=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function DR(n,e,t){let i=new Pl,r=new pe,s=new pe,o=new It,a=new i0({depthPacking:Fb}),l=new r0,c={},u=t.maxTextureSize,h={[ts]:Jt,[Jt]:ts,[$n]:$n},d=new Gi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:kR,fragmentShader:NR}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let m=new Qt;m.setAttribute("position",new Dt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ce(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=_1;let f=this.type;this.render=function(T,b,A){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;let L=n.getRenderTarget(),_=n.getActiveCubeFace(),S=n.getActiveMipmapLevel(),z=n.state;z.setBlending(Qr),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let N=f!==fr&&this.type===fr,F=f===fr&&this.type!==fr;for(let X=0,O=T.length;X<O;X++){let Z=T[X],G=Z.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;r.copy(G.mapSize);let re=G.getFrameExtents();if(r.multiply(re),s.copy(G.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/re.x),r.x=s.x*re.x,G.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/re.y),r.y=s.y*re.y,G.mapSize.y=s.y)),G.map===null||N===!0||F===!0){let ce=this.type!==fr?{minFilter:hn,magFilter:hn}:{};G.map!==null&&G.map.dispose(),G.map=new yr(r.x,r.y,ce),G.map.texture.name=Z.name+".shadowMap",G.camera.updateProjectionMatrix()}n.setRenderTarget(G.map),n.clear();let te=G.getViewportCount();for(let ce=0;ce<te;ce++){let Oe=G.getViewport(ce);o.set(s.x*Oe.x,s.y*Oe.y,s.x*Oe.z,s.y*Oe.w),z.viewport(o),G.updateMatrices(Z,ce),i=G.getFrustum(),M(b,A,G.camera,Z,this.type)}G.isPointLightShadow!==!0&&this.type===fr&&v(G,A),G.needsUpdate=!1}f=this.type,g.needsUpdate=!1,n.setRenderTarget(L,_,S)};function v(T,b){let A=e.update(x);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new yr(r.x,r.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(b,null,A,d,x,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(b,null,A,p,x,null)}function y(T,b,A,L){let _=null,S=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(S!==void 0)_=S;else if(_=A.isPointLight===!0?l:a,n.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){let z=_.uuid,N=b.uuid,F=c[z];F===void 0&&(F={},c[z]=F);let X=F[N];X===void 0&&(X=_.clone(),F[N]=X,b.addEventListener("dispose",R)),_=X}if(_.visible=b.visible,_.wireframe=b.wireframe,L===fr?_.side=b.shadowSide!==null?b.shadowSide:b.side:_.side=b.shadowSide!==null?b.shadowSide:h[b.side],_.alphaMap=b.alphaMap,_.alphaTest=b.alphaTest,_.map=b.map,_.clipShadows=b.clipShadows,_.clippingPlanes=b.clippingPlanes,_.clipIntersection=b.clipIntersection,_.displacementMap=b.displacementMap,_.displacementScale=b.displacementScale,_.displacementBias=b.displacementBias,_.wireframeLinewidth=b.wireframeLinewidth,_.linewidth=b.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let z=n.properties.get(_);z.light=A}return _}function M(T,b,A,L,_){if(T.visible===!1)return;if(T.layers.test(b.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&_===fr)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let N=e.update(T),F=T.material;if(Array.isArray(F)){let X=N.groups;for(let O=0,Z=X.length;O<Z;O++){let G=X[O],re=F[G.materialIndex];if(re&&re.visible){let te=y(T,re,L,_);T.onBeforeShadow(n,T,b,A,N,te,G),n.renderBufferDirect(A,null,N,te,T,G),T.onAfterShadow(n,T,b,A,N,te,G)}}}else if(F.visible){let X=y(T,F,L,_);T.onBeforeShadow(n,T,b,A,N,X,null),n.renderBufferDirect(A,null,N,X,T,null),T.onAfterShadow(n,T,b,A,N,X,null)}}let z=T.children;for(let N=0,F=z.length;N<F;N++)M(z[N],b,A,L,_)}function R(T){T.target.removeEventListener("dispose",R);for(let A in c){let L=c[A],_=T.target.uuid;_ in L&&(L[_].dispose(),delete L[_])}}}var UR={[om]:am,[lm]:hm,[cm]:fm,[ea]:um,[am]:om,[hm]:lm,[fm]:cm,[um]:ea};function zR(n){function e(){let k=!1,me=new It,W=null,K=new It(0,0,0,0);return{setMask:function(fe){W!==fe&&!k&&(n.colorMask(fe,fe,fe,fe),W=fe)},setLocked:function(fe){k=fe},setClear:function(fe,ge,Ze,Ut,An){An===!0&&(fe*=Ut,ge*=Ut,Ze*=Ut),me.set(fe,ge,Ze,Ut),K.equals(me)===!1&&(n.clearColor(fe,ge,Ze,Ut),K.copy(me))},reset:function(){k=!1,W=null,K.set(-1,0,0,0)}}}function t(){let k=!1,me=!1,W=null,K=null,fe=null;return{setReversed:function(ge){me=ge},setTest:function(ge){ge?ue(n.DEPTH_TEST):Y(n.DEPTH_TEST)},setMask:function(ge){W!==ge&&!k&&(n.depthMask(ge),W=ge)},setFunc:function(ge){if(me&&(ge=UR[ge]),K!==ge){switch(ge){case om:n.depthFunc(n.NEVER);break;case am:n.depthFunc(n.ALWAYS);break;case lm:n.depthFunc(n.LESS);break;case ea:n.depthFunc(n.LEQUAL);break;case cm:n.depthFunc(n.EQUAL);break;case um:n.depthFunc(n.GEQUAL);break;case hm:n.depthFunc(n.GREATER);break;case fm:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}K=ge}},setLocked:function(ge){k=ge},setClear:function(ge){fe!==ge&&(n.clearDepth(ge),fe=ge)},reset:function(){k=!1,W=null,K=null,fe=null}}}function i(){let k=!1,me=null,W=null,K=null,fe=null,ge=null,Ze=null,Ut=null,An=null;return{setTest:function(et){k||(et?ue(n.STENCIL_TEST):Y(n.STENCIL_TEST))},setMask:function(et){me!==et&&!k&&(n.stencilMask(et),me=et)},setFunc:function(et,Rn,Yi){(W!==et||K!==Rn||fe!==Yi)&&(n.stencilFunc(et,Rn,Yi),W=et,K=Rn,fe=Yi)},setOp:function(et,Rn,Yi){(ge!==et||Ze!==Rn||Ut!==Yi)&&(n.stencilOp(et,Rn,Yi),ge=et,Ze=Rn,Ut=Yi)},setLocked:function(et){k=et},setClear:function(et){An!==et&&(n.clearStencil(et),An=et)},reset:function(){k=!1,me=null,W=null,K=null,fe=null,ge=null,Ze=null,Ut=null,An=null}}}let r=new e,s=new t,o=new i,a=new WeakMap,l=new WeakMap,c={},u={},h=new WeakMap,d=[],p=null,m=!1,x=null,g=null,f=null,v=null,y=null,M=null,R=null,T=new ke(0,0,0),b=0,A=!1,L=null,_=null,S=null,z=null,N=null,F=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,O=0,Z=n.getParameter(n.VERSION);Z.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(Z)[1]),X=O>=1):Z.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),X=O>=2);let G=null,re={},te=n.getParameter(n.SCISSOR_BOX),ce=n.getParameter(n.VIEWPORT),Oe=new It().fromArray(te),Fe=new It().fromArray(ce);function q(k,me,W,K){let fe=new Uint8Array(4),ge=n.createTexture();n.bindTexture(k,ge),n.texParameteri(k,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(k,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ze=0;Ze<W;Ze++)k===n.TEXTURE_3D||k===n.TEXTURE_2D_ARRAY?n.texImage3D(me,0,n.RGBA,1,1,K,0,n.RGBA,n.UNSIGNED_BYTE,fe):n.texImage2D(me+Ze,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,fe);return ge}let J={};J[n.TEXTURE_2D]=q(n.TEXTURE_2D,n.TEXTURE_2D,1),J[n.TEXTURE_CUBE_MAP]=q(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[n.TEXTURE_2D_ARRAY]=q(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),J[n.TEXTURE_3D]=q(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),ue(n.DEPTH_TEST),s.setFunc(ea),je(!1),Je(p_),ue(n.CULL_FACE),P(Qr);function ue(k){c[k]!==!0&&(n.enable(k),c[k]=!0)}function Y(k){c[k]!==!1&&(n.disable(k),c[k]=!1)}function ae(k,me){return u[k]!==me?(n.bindFramebuffer(k,me),u[k]=me,k===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=me),k===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=me),!0):!1}function he(k,me){let W=d,K=!1;if(k){W=h.get(me),W===void 0&&(W=[],h.set(me,W));let fe=k.textures;if(W.length!==fe.length||W[0]!==n.COLOR_ATTACHMENT0){for(let ge=0,Ze=fe.length;ge<Ze;ge++)W[ge]=n.COLOR_ATTACHMENT0+ge;W.length=fe.length,K=!0}}else W[0]!==n.BACK&&(W[0]=n.BACK,K=!0);K&&n.drawBuffers(W)}function we(k){return p!==k?(n.useProgram(k),p=k,!0):!1}let Ge={[Ls]:n.FUNC_ADD,[hb]:n.FUNC_SUBTRACT,[fb]:n.FUNC_REVERSE_SUBTRACT};Ge[db]=n.MIN,Ge[pb]=n.MAX;let Pe={[mb]:n.ZERO,[gb]:n.ONE,[yb]:n.SRC_COLOR,[rm]:n.SRC_ALPHA,[wb]:n.SRC_ALPHA_SATURATE,[Mb]:n.DST_COLOR,[xb]:n.DST_ALPHA,[vb]:n.ONE_MINUS_SRC_COLOR,[sm]:n.ONE_MINUS_SRC_ALPHA,[Sb]:n.ONE_MINUS_DST_COLOR,[_b]:n.ONE_MINUS_DST_ALPHA,[bb]:n.CONSTANT_COLOR,[Eb]:n.ONE_MINUS_CONSTANT_COLOR,[Tb]:n.CONSTANT_ALPHA,[Ab]:n.ONE_MINUS_CONSTANT_ALPHA};function P(k,me,W,K,fe,ge,Ze,Ut,An,et){if(k===Qr){m===!0&&(Y(n.BLEND),m=!1);return}if(m===!1&&(ue(n.BLEND),m=!0),k!==ub){if(k!==x||et!==A){if((g!==Ls||y!==Ls)&&(n.blendEquation(n.FUNC_ADD),g=Ls,y=Ls),et)switch(k){case Zo:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case m_:n.blendFunc(n.ONE,n.ONE);break;case g_:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case y_:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}else switch(k){case Zo:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case m_:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case g_:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case y_:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}f=null,v=null,M=null,R=null,T.set(0,0,0),b=0,x=k,A=et}return}fe=fe||me,ge=ge||W,Ze=Ze||K,(me!==g||fe!==y)&&(n.blendEquationSeparate(Ge[me],Ge[fe]),g=me,y=fe),(W!==f||K!==v||ge!==M||Ze!==R)&&(n.blendFuncSeparate(Pe[W],Pe[K],Pe[ge],Pe[Ze]),f=W,v=K,M=ge,R=Ze),(Ut.equals(T)===!1||An!==b)&&(n.blendColor(Ut.r,Ut.g,Ut.b,An),T.copy(Ut),b=An),x=k,A=!1}function dn(k,me){k.side===$n?Y(n.CULL_FACE):ue(n.CULL_FACE);let W=k.side===Jt;me&&(W=!W),je(W),k.blending===Zo&&k.transparent===!1?P(Qr):P(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),s.setFunc(k.depthFunc),s.setTest(k.depthTest),s.setMask(k.depthWrite),r.setMask(k.colorWrite);let K=k.stencilWrite;o.setTest(K),K&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),pt(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?ue(n.SAMPLE_ALPHA_TO_COVERAGE):Y(n.SAMPLE_ALPHA_TO_COVERAGE)}function je(k){L!==k&&(k?n.frontFace(n.CW):n.frontFace(n.CCW),L=k)}function Je(k){k!==lb?(ue(n.CULL_FACE),k!==_&&(k===p_?n.cullFace(n.BACK):k===cb?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Y(n.CULL_FACE),_=k}function Ne(k){k!==S&&(X&&n.lineWidth(k),S=k)}function pt(k,me,W){k?(ue(n.POLYGON_OFFSET_FILL),(z!==me||N!==W)&&(n.polygonOffset(me,W),z=me,N=W)):Y(n.POLYGON_OFFSET_FILL)}function ze(k){k?ue(n.SCISSOR_TEST):Y(n.SCISSOR_TEST)}function C(k){k===void 0&&(k=n.TEXTURE0+F-1),G!==k&&(n.activeTexture(k),G=k)}function w(k,me,W){W===void 0&&(G===null?W=n.TEXTURE0+F-1:W=G);let K=re[W];K===void 0&&(K={type:void 0,texture:void 0},re[W]=K),(K.type!==k||K.texture!==me)&&(G!==W&&(n.activeTexture(W),G=W),n.bindTexture(k,me||J[k]),K.type=k,K.texture=me)}function B(){let k=re[G];k!==void 0&&k.type!==void 0&&(n.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function $(){try{n.compressedTexImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Q(){try{n.compressedTexImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function j(){try{n.texSubImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function be(){try{n.texSubImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function le(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ve(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Qe(){try{n.texStorage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ne(){try{n.texStorage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function xe(){try{n.texImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function De(){try{n.texImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Ue(k){Oe.equals(k)===!1&&(n.scissor(k.x,k.y,k.z,k.w),Oe.copy(k))}function _e(k){Fe.equals(k)===!1&&(n.viewport(k.x,k.y,k.z,k.w),Fe.copy(k))}function $e(k,me){let W=l.get(me);W===void 0&&(W=new WeakMap,l.set(me,W));let K=W.get(k);K===void 0&&(K=n.getUniformBlockIndex(me,k.name),W.set(k,K))}function Be(k,me){let K=l.get(me).get(k);a.get(me)!==K&&(n.uniformBlockBinding(me,K,k.__bindingPointIndex),a.set(me,K))}function ut(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),c={},G=null,re={},u={},h=new WeakMap,d=[],p=null,m=!1,x=null,g=null,f=null,v=null,y=null,M=null,R=null,T=new ke(0,0,0),b=0,A=!1,L=null,_=null,S=null,z=null,N=null,Oe.set(0,0,n.canvas.width,n.canvas.height),Fe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:ue,disable:Y,bindFramebuffer:ae,drawBuffers:he,useProgram:we,setBlending:P,setMaterial:dn,setFlipSided:je,setCullFace:Je,setLineWidth:Ne,setPolygonOffset:pt,setScissorTest:ze,activeTexture:C,bindTexture:w,unbindTexture:B,compressedTexImage2D:$,compressedTexImage3D:Q,texImage2D:xe,texImage3D:De,updateUBOMapping:$e,uniformBlockBinding:Be,texStorage2D:Qe,texStorage3D:ne,texSubImage2D:j,texSubImage3D:be,compressedTexSubImage2D:le,compressedTexSubImage3D:ve,scissor:Ue,viewport:_e,reset:ut}}function l1(n,e,t,i){let r=OR(i);switch(t){case T1:return n*e;case R1:return n*e;case C1:return n*e*2;case D0:return n*e/r.components*r.byteLength;case U0:return n*e/r.components*r.byteLength;case P1:return n*e*2/r.components*r.byteLength;case z0:return n*e*2/r.components*r.byteLength;case A1:return n*e*3/r.components*r.byteLength;case Ai:return n*e*4/r.components*r.byteLength;case O0:return n*e*4/r.components*r.byteLength;case ju:case $u:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Zu:case Ku:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ym:case xm:return Math.max(n,16)*Math.max(e,8)/4;case gm:case vm:return Math.max(n,8)*Math.max(e,8)/2;case _m:case Mm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Sm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case wm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case bm:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Em:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Tm:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Am:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Rm:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Cm:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Pm:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Im:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Lm:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case km:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Nm:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Dm:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Um:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Ju:case zm:case Om:return Math.ceil(n/4)*Math.ceil(e/4)*16;case I1:case Fm:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Bm:case Hm:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function OR(n){switch(n){case gr:case w1:return{byteLength:1,components:1};case Cl:case b1:case Hl:return{byteLength:2,components:1};case k0:case N0:return{byteLength:2,components:4};case zs:case L0:case Fi:return{byteLength:4,components:1};case E1:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function FR(n,e,t,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new pe,u=new WeakMap,h,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,w){return p?new OffscreenCanvas(C,w):sh("canvas")}function x(C,w,B){let $=1,Q=ze(C);if((Q.width>B||Q.height>B)&&($=B/Math.max(Q.width,Q.height)),$<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let j=Math.floor($*Q.width),be=Math.floor($*Q.height);h===void 0&&(h=m(j,be));let le=w?m(j,be):h;return le.width=j,le.height=be,le.getContext("2d").drawImage(C,0,0,j,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+j+"x"+be+")."),le}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),C;return C}function g(C){return C.generateMipmaps&&C.minFilter!==hn&&C.minFilter!==Ti}function f(C){n.generateMipmap(C)}function v(C,w,B,$,Q=!1){if(C!==null){if(n[C]!==void 0)return n[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let j=w;if(w===n.RED&&(B===n.FLOAT&&(j=n.R32F),B===n.HALF_FLOAT&&(j=n.R16F),B===n.UNSIGNED_BYTE&&(j=n.R8)),w===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.R8UI),B===n.UNSIGNED_SHORT&&(j=n.R16UI),B===n.UNSIGNED_INT&&(j=n.R32UI),B===n.BYTE&&(j=n.R8I),B===n.SHORT&&(j=n.R16I),B===n.INT&&(j=n.R32I)),w===n.RG&&(B===n.FLOAT&&(j=n.RG32F),B===n.HALF_FLOAT&&(j=n.RG16F),B===n.UNSIGNED_BYTE&&(j=n.RG8)),w===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RG8UI),B===n.UNSIGNED_SHORT&&(j=n.RG16UI),B===n.UNSIGNED_INT&&(j=n.RG32UI),B===n.BYTE&&(j=n.RG8I),B===n.SHORT&&(j=n.RG16I),B===n.INT&&(j=n.RG32I)),w===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGB8UI),B===n.UNSIGNED_SHORT&&(j=n.RGB16UI),B===n.UNSIGNED_INT&&(j=n.RGB32UI),B===n.BYTE&&(j=n.RGB8I),B===n.SHORT&&(j=n.RGB16I),B===n.INT&&(j=n.RGB32I)),w===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(j=n.RGBA16UI),B===n.UNSIGNED_INT&&(j=n.RGBA32UI),B===n.BYTE&&(j=n.RGBA8I),B===n.SHORT&&(j=n.RGBA16I),B===n.INT&&(j=n.RGBA32I)),w===n.RGB&&B===n.UNSIGNED_INT_5_9_9_9_REV&&(j=n.RGB9_E5),w===n.RGBA){let be=Q?th:it.getTransfer($);B===n.FLOAT&&(j=n.RGBA32F),B===n.HALF_FLOAT&&(j=n.RGBA16F),B===n.UNSIGNED_BYTE&&(j=be===xt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT_4_4_4_4&&(j=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(j=n.RGB5_A1)}return(j===n.R16F||j===n.R32F||j===n.RG16F||j===n.RG32F||j===n.RGBA16F||j===n.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function y(C,w){let B;return C?w===null||w===zs||w===ia?B=n.DEPTH24_STENCIL8:w===Fi?B=n.DEPTH32F_STENCIL8:w===Cl&&(B=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===zs||w===ia?B=n.DEPTH_COMPONENT24:w===Fi?B=n.DEPTH_COMPONENT32F:w===Cl&&(B=n.DEPTH_COMPONENT16),B}function M(C,w){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==hn&&C.minFilter!==Ti?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function R(C){let w=C.target;w.removeEventListener("dispose",R),b(w),w.isVideoTexture&&u.delete(w)}function T(C){let w=C.target;w.removeEventListener("dispose",T),L(w)}function b(C){let w=i.get(C);if(w.__webglInit===void 0)return;let B=C.source,$=d.get(B);if($){let Q=$[w.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&A(C),Object.keys($).length===0&&d.delete(B)}i.remove(C)}function A(C){let w=i.get(C);n.deleteTexture(w.__webglTexture);let B=C.source,$=d.get(B);delete $[w.__cacheKey],o.memory.textures--}function L(C){let w=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(w.__webglFramebuffer[$]))for(let Q=0;Q<w.__webglFramebuffer[$].length;Q++)n.deleteFramebuffer(w.__webglFramebuffer[$][Q]);else n.deleteFramebuffer(w.__webglFramebuffer[$]);w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer[$])}else{if(Array.isArray(w.__webglFramebuffer))for(let $=0;$<w.__webglFramebuffer.length;$++)n.deleteFramebuffer(w.__webglFramebuffer[$]);else n.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&n.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let $=0;$<w.__webglColorRenderbuffer.length;$++)w.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(w.__webglColorRenderbuffer[$]);w.__webglDepthRenderbuffer&&n.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let B=C.textures;for(let $=0,Q=B.length;$<Q;$++){let j=i.get(B[$]);j.__webglTexture&&(n.deleteTexture(j.__webglTexture),o.memory.textures--),i.remove(B[$])}i.remove(C)}let _=0;function S(){_=0}function z(){let C=_;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),_+=1,C}function N(C){let w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function F(C,w){let B=i.get(C);if(C.isVideoTexture&&Ne(C),C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){let $=C.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Fe(B,C,w);return}}t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+w)}function X(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){Fe(B,C,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+w)}function O(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){Fe(B,C,w);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+w)}function Z(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){q(B,C,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+w)}let G={[Us]:n.REPEAT,[Ns]:n.CLAMP_TO_EDGE,[mm]:n.MIRRORED_REPEAT},re={[hn]:n.NEAREST,[zb]:n.NEAREST_MIPMAP_NEAREST,[xu]:n.NEAREST_MIPMAP_LINEAR,[Ti]:n.LINEAR,[Sp]:n.LINEAR_MIPMAP_NEAREST,[Ds]:n.LINEAR_MIPMAP_LINEAR},te={[Hb]:n.NEVER,[qb]:n.ALWAYS,[Vb]:n.LESS,[k1]:n.LEQUAL,[Gb]:n.EQUAL,[Yb]:n.GEQUAL,[Wb]:n.GREATER,[Xb]:n.NOTEQUAL};function ce(C,w){if(w.type===Fi&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Ti||w.magFilter===Sp||w.magFilter===xu||w.magFilter===Ds||w.minFilter===Ti||w.minFilter===Sp||w.minFilter===xu||w.minFilter===Ds)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,G[w.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,G[w.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,G[w.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,re[w.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,re[w.minFilter]),w.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,te[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===hn||w.minFilter!==xu&&w.minFilter!==Ds||w.type===Fi&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function Oe(C,w){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",R));let $=w.source,Q=d.get($);Q===void 0&&(Q={},d.set($,Q));let j=N(w);if(j!==C.__cacheKey){Q[j]===void 0&&(Q[j]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,B=!0),Q[j].usedTimes++;let be=Q[C.__cacheKey];be!==void 0&&(Q[C.__cacheKey].usedTimes--,be.usedTimes===0&&A(w)),C.__cacheKey=j,C.__webglTexture=Q[j].texture}return B}function Fe(C,w,B){let $=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&($=n.TEXTURE_3D);let Q=Oe(C,w),j=w.source;t.bindTexture($,C.__webglTexture,n.TEXTURE0+B);let be=i.get(j);if(j.version!==be.__version||Q===!0){t.activeTexture(n.TEXTURE0+B);let le=it.getPrimaries(it.workingColorSpace),ve=w.colorSpace===Kr?null:it.getPrimaries(w.colorSpace),Qe=w.colorSpace===Kr||le===ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Qe);let ne=x(w.image,!1,r.maxTextureSize);ne=pt(w,ne);let xe=s.convert(w.format,w.colorSpace),De=s.convert(w.type),Ue=v(w.internalFormat,xe,De,w.colorSpace,w.isVideoTexture);ce($,w);let _e,$e=w.mipmaps,Be=w.isVideoTexture!==!0,ut=be.__version===void 0||Q===!0,k=j.dataReady,me=M(w,ne);if(w.isDepthTexture)Ue=y(w.format===ra,w.type),ut&&(Be?t.texStorage2D(n.TEXTURE_2D,1,Ue,ne.width,ne.height):t.texImage2D(n.TEXTURE_2D,0,Ue,ne.width,ne.height,0,xe,De,null));else if(w.isDataTexture)if($e.length>0){Be&&ut&&t.texStorage2D(n.TEXTURE_2D,me,Ue,$e[0].width,$e[0].height);for(let W=0,K=$e.length;W<K;W++)_e=$e[W],Be?k&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,_e.width,_e.height,xe,De,_e.data):t.texImage2D(n.TEXTURE_2D,W,Ue,_e.width,_e.height,0,xe,De,_e.data);w.generateMipmaps=!1}else Be?(ut&&t.texStorage2D(n.TEXTURE_2D,me,Ue,ne.width,ne.height),k&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ne.width,ne.height,xe,De,ne.data)):t.texImage2D(n.TEXTURE_2D,0,Ue,ne.width,ne.height,0,xe,De,ne.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Be&&ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,Ue,$e[0].width,$e[0].height,ne.depth);for(let W=0,K=$e.length;W<K;W++)if(_e=$e[W],w.format!==Ai)if(xe!==null)if(Be){if(k)if(w.layerUpdates.size>0){let fe=l1(_e.width,_e.height,w.format,w.type);for(let ge of w.layerUpdates){let Ze=_e.data.subarray(ge*fe/_e.data.BYTES_PER_ELEMENT,(ge+1)*fe/_e.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,ge,_e.width,_e.height,1,xe,Ze,0,0)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,_e.width,_e.height,ne.depth,xe,_e.data,0,0)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,W,Ue,_e.width,_e.height,ne.depth,0,_e.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Be?k&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,_e.width,_e.height,ne.depth,xe,De,_e.data):t.texImage3D(n.TEXTURE_2D_ARRAY,W,Ue,_e.width,_e.height,ne.depth,0,xe,De,_e.data)}else{Be&&ut&&t.texStorage2D(n.TEXTURE_2D,me,Ue,$e[0].width,$e[0].height);for(let W=0,K=$e.length;W<K;W++)_e=$e[W],w.format!==Ai?xe!==null?Be?k&&t.compressedTexSubImage2D(n.TEXTURE_2D,W,0,0,_e.width,_e.height,xe,_e.data):t.compressedTexImage2D(n.TEXTURE_2D,W,Ue,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Be?k&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,_e.width,_e.height,xe,De,_e.data):t.texImage2D(n.TEXTURE_2D,W,Ue,_e.width,_e.height,0,xe,De,_e.data)}else if(w.isDataArrayTexture)if(Be){if(ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,Ue,ne.width,ne.height,ne.depth),k)if(w.layerUpdates.size>0){let W=l1(ne.width,ne.height,w.format,w.type);for(let K of w.layerUpdates){let fe=ne.data.subarray(K*W/ne.data.BYTES_PER_ELEMENT,(K+1)*W/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,K,ne.width,ne.height,1,xe,De,fe)}w.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ue,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(w.isData3DTexture)Be?(ut&&t.texStorage3D(n.TEXTURE_3D,me,Ue,ne.width,ne.height,ne.depth),k&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)):t.texImage3D(n.TEXTURE_3D,0,Ue,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(w.isFramebufferTexture){if(ut)if(Be)t.texStorage2D(n.TEXTURE_2D,me,Ue,ne.width,ne.height);else{let W=ne.width,K=ne.height;for(let fe=0;fe<me;fe++)t.texImage2D(n.TEXTURE_2D,fe,Ue,W,K,0,xe,De,null),W>>=1,K>>=1}}else if($e.length>0){if(Be&&ut){let W=ze($e[0]);t.texStorage2D(n.TEXTURE_2D,me,Ue,W.width,W.height)}for(let W=0,K=$e.length;W<K;W++)_e=$e[W],Be?k&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,xe,De,_e):t.texImage2D(n.TEXTURE_2D,W,Ue,xe,De,_e);w.generateMipmaps=!1}else if(Be){if(ut){let W=ze(ne);t.texStorage2D(n.TEXTURE_2D,me,Ue,W.width,W.height)}k&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,xe,De,ne)}else t.texImage2D(n.TEXTURE_2D,0,Ue,xe,De,ne);g(w)&&f($),be.__version=j.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function q(C,w,B){if(w.image.length!==6)return;let $=Oe(C,w),Q=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+B);let j=i.get(Q);if(Q.version!==j.__version||$===!0){t.activeTexture(n.TEXTURE0+B);let be=it.getPrimaries(it.workingColorSpace),le=w.colorSpace===Kr?null:it.getPrimaries(w.colorSpace),ve=w.colorSpace===Kr||be===le?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);let Qe=w.isCompressedTexture||w.image[0].isCompressedTexture,ne=w.image[0]&&w.image[0].isDataTexture,xe=[];for(let K=0;K<6;K++)!Qe&&!ne?xe[K]=x(w.image[K],!0,r.maxCubemapSize):xe[K]=ne?w.image[K].image:w.image[K],xe[K]=pt(w,xe[K]);let De=xe[0],Ue=s.convert(w.format,w.colorSpace),_e=s.convert(w.type),$e=v(w.internalFormat,Ue,_e,w.colorSpace),Be=w.isVideoTexture!==!0,ut=j.__version===void 0||$===!0,k=Q.dataReady,me=M(w,De);ce(n.TEXTURE_CUBE_MAP,w);let W;if(Qe){Be&&ut&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,$e,De.width,De.height);for(let K=0;K<6;K++){W=xe[K].mipmaps;for(let fe=0;fe<W.length;fe++){let ge=W[fe];w.format!==Ai?Ue!==null?Be?k&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,ge.width,ge.height,Ue,ge.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,$e,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Be?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,ge.width,ge.height,Ue,_e,ge.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,$e,ge.width,ge.height,0,Ue,_e,ge.data)}}}else{if(W=w.mipmaps,Be&&ut){W.length>0&&me++;let K=ze(xe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,$e,K.width,K.height)}for(let K=0;K<6;K++)if(ne){Be?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,xe[K].width,xe[K].height,Ue,_e,xe[K].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,$e,xe[K].width,xe[K].height,0,Ue,_e,xe[K].data);for(let fe=0;fe<W.length;fe++){let Ze=W[fe].image[K].image;Be?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Ze.width,Ze.height,Ue,_e,Ze.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,$e,Ze.width,Ze.height,0,Ue,_e,Ze.data)}}else{Be?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ue,_e,xe[K]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,$e,Ue,_e,xe[K]);for(let fe=0;fe<W.length;fe++){let ge=W[fe];Be?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Ue,_e,ge.image[K]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,$e,Ue,_e,ge.image[K])}}}g(w)&&f(n.TEXTURE_CUBE_MAP),j.__version=Q.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function J(C,w,B,$,Q,j){let be=s.convert(B.format,B.colorSpace),le=s.convert(B.type),ve=v(B.internalFormat,be,le,B.colorSpace);if(!i.get(w).__hasExternalTextures){let ne=Math.max(1,w.width>>j),xe=Math.max(1,w.height>>j);Q===n.TEXTURE_3D||Q===n.TEXTURE_2D_ARRAY?t.texImage3D(Q,j,ve,ne,xe,w.depth,0,be,le,null):t.texImage2D(Q,j,ve,ne,xe,0,be,le,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),Je(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,Q,i.get(B).__webglTexture,0,je(w)):(Q===n.TEXTURE_2D||Q>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,Q,i.get(B).__webglTexture,j),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(C,w,B){if(n.bindRenderbuffer(n.RENDERBUFFER,C),w.depthBuffer){let $=w.depthTexture,Q=$&&$.isDepthTexture?$.type:null,j=y(w.stencilBuffer,Q),be=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=je(w);Je(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,j,w.width,w.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,j,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,j,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,be,n.RENDERBUFFER,C)}else{let $=w.textures;for(let Q=0;Q<$.length;Q++){let j=$[Q],be=s.convert(j.format,j.colorSpace),le=s.convert(j.type),ve=v(j.internalFormat,be,le,j.colorSpace),Qe=je(w);B&&Je(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Qe,ve,w.width,w.height):Je(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Qe,ve,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,ve,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Y(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),F(w.depthTexture,0);let $=i.get(w.depthTexture).__webglTexture,Q=je(w);if(w.depthTexture.format===Ko)Je(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0);else if(w.depthTexture.format===ra)Je(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0,Q):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function ae(C){let w=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){let $=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),$){let Q=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,$.removeEventListener("dispose",Q)};$.addEventListener("dispose",Q),w.__depthDisposeCallback=Q}w.__boundDepthTexture=$}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");Y(w.__webglFramebuffer,C)}else if(B){w.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[$]),w.__webglDepthbuffer[$]===void 0)w.__webglDepthbuffer[$]=n.createRenderbuffer(),ue(w.__webglDepthbuffer[$],C,!1);else{let Q=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=w.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,Q,n.RENDERBUFFER,j)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=n.createRenderbuffer(),ue(w.__webglDepthbuffer,C,!1);else{let $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=w.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Q),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,Q)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function he(C,w,B){let $=i.get(C);w!==void 0&&J($.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&ae(C)}function we(C){let w=C.texture,B=i.get(C),$=i.get(w);C.addEventListener("dispose",T);let Q=C.textures,j=C.isWebGLCubeRenderTarget===!0,be=Q.length>1;if(be||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=w.version,o.memory.textures++),j){B.__webglFramebuffer=[];for(let le=0;le<6;le++)if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer[le]=[];for(let ve=0;ve<w.mipmaps.length;ve++)B.__webglFramebuffer[le][ve]=n.createFramebuffer()}else B.__webglFramebuffer[le]=n.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer=[];for(let le=0;le<w.mipmaps.length;le++)B.__webglFramebuffer[le]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(be)for(let le=0,ve=Q.length;le<ve;le++){let Qe=i.get(Q[le]);Qe.__webglTexture===void 0&&(Qe.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&Je(C)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let le=0;le<Q.length;le++){let ve=Q[le];B.__webglColorRenderbuffer[le]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[le]);let Qe=s.convert(ve.format,ve.colorSpace),ne=s.convert(ve.type),xe=v(ve.internalFormat,Qe,ne,ve.colorSpace,C.isXRRenderTarget===!0),De=je(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,De,xe,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,B.__webglColorRenderbuffer[le])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),ue(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(j){t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),ce(n.TEXTURE_CUBE_MAP,w);for(let le=0;le<6;le++)if(w.mipmaps&&w.mipmaps.length>0)for(let ve=0;ve<w.mipmaps.length;ve++)J(B.__webglFramebuffer[le][ve],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,ve);else J(B.__webglFramebuffer[le],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);g(w)&&f(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let le=0,ve=Q.length;le<ve;le++){let Qe=Q[le],ne=i.get(Qe);t.bindTexture(n.TEXTURE_2D,ne.__webglTexture),ce(n.TEXTURE_2D,Qe),J(B.__webglFramebuffer,C,Qe,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,0),g(Qe)&&f(n.TEXTURE_2D)}t.unbindTexture()}else{let le=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(le=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(le,$.__webglTexture),ce(le,w),w.mipmaps&&w.mipmaps.length>0)for(let ve=0;ve<w.mipmaps.length;ve++)J(B.__webglFramebuffer[ve],C,w,n.COLOR_ATTACHMENT0,le,ve);else J(B.__webglFramebuffer,C,w,n.COLOR_ATTACHMENT0,le,0);g(w)&&f(le),t.unbindTexture()}C.depthBuffer&&ae(C)}function Ge(C){let w=C.textures;for(let B=0,$=w.length;B<$;B++){let Q=w[B];if(g(Q)){let j=C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,be=i.get(Q).__webglTexture;t.bindTexture(j,be),f(j),t.unbindTexture()}}}let Pe=[],P=[];function dn(C){if(C.samples>0){if(Je(C)===!1){let w=C.textures,B=C.width,$=C.height,Q=n.COLOR_BUFFER_BIT,j=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,be=i.get(C),le=w.length>1;if(le)for(let ve=0;ve<w.length;ve++)t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let ve=0;ve<w.length;ve++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Q|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Q|=n.STENCIL_BUFFER_BIT)),le){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,be.__webglColorRenderbuffer[ve]);let Qe=i.get(w[ve]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Qe,0)}n.blitFramebuffer(0,0,B,$,0,0,B,$,Q,n.NEAREST),l===!0&&(Pe.length=0,P.length=0,Pe.push(n.COLOR_ATTACHMENT0+ve),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Pe.push(j),P.push(j),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,P)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Pe))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),le)for(let ve=0;ve<w.length;ve++){t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,be.__webglColorRenderbuffer[ve]);let Qe=i.get(w[ve]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,Qe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let w=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[w])}}}function je(C){return Math.min(r.maxSamples,C.samples)}function Je(C){let w=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Ne(C){let w=o.render.frame;u.get(C)!==w&&(u.set(C,w),C.update())}function pt(C,w){let B=C.colorSpace,$=C.format,Q=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==ss&&B!==Kr&&(it.getTransfer(B)===xt?($!==Ai||Q!==gr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),w}function ze(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=S,this.setTexture2D=F,this.setTexture2DArray=X,this.setTexture3D=O,this.setTextureCube=Z,this.rebindTextures=he,this.setupRenderTarget=we,this.updateRenderTargetMipmap=Ge,this.updateMultisampleRenderTarget=dn,this.setupDepthRenderbuffer=ae,this.setupFrameBufferTexture=J,this.useMultisampledRTT=Je}function BR(n,e){function t(i,r=Kr){let s,o=it.getTransfer(r);if(i===gr)return n.UNSIGNED_BYTE;if(i===k0)return n.UNSIGNED_SHORT_4_4_4_4;if(i===N0)return n.UNSIGNED_SHORT_5_5_5_1;if(i===E1)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===w1)return n.BYTE;if(i===b1)return n.SHORT;if(i===Cl)return n.UNSIGNED_SHORT;if(i===L0)return n.INT;if(i===zs)return n.UNSIGNED_INT;if(i===Fi)return n.FLOAT;if(i===Hl)return n.HALF_FLOAT;if(i===T1)return n.ALPHA;if(i===A1)return n.RGB;if(i===Ai)return n.RGBA;if(i===R1)return n.LUMINANCE;if(i===C1)return n.LUMINANCE_ALPHA;if(i===Ko)return n.DEPTH_COMPONENT;if(i===ra)return n.DEPTH_STENCIL;if(i===D0)return n.RED;if(i===U0)return n.RED_INTEGER;if(i===P1)return n.RG;if(i===z0)return n.RG_INTEGER;if(i===O0)return n.RGBA_INTEGER;if(i===ju||i===$u||i===Zu||i===Ku)if(o===xt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===ju)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===$u)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Zu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ku)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===ju)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===$u)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Zu)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ku)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===gm||i===ym||i===vm||i===xm)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===gm)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ym)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===vm)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===xm)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===_m||i===Mm||i===Sm)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===_m||i===Mm)return o===xt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Sm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===wm||i===bm||i===Em||i===Tm||i===Am||i===Rm||i===Cm||i===Pm||i===Im||i===Lm||i===km||i===Nm||i===Dm||i===Um)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===wm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===bm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Em)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Tm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Am)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Rm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Cm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Pm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Im)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Lm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===km)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Nm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Dm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Um)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ju||i===zm||i===Om)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Ju)return o===xt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===zm)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Om)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===I1||i===Fm||i===Bm||i===Hm)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ju)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Fm)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Bm)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Hm)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ia?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var s0=class extends Sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Zn=class extends wn{constructor(){super(),this.isGroup=!0,this.type="Group"}},HR={type:"move"},El=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let g=t.getJointPose(x,i),f=this._getHandJoint(c,x);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,m=.005;c.inputState.pinching&&d>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(HR)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Zn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},VR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,GR=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,o0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let r=new Nn,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Gi({vertexShader:VR,fragmentShader:GR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ce(new xr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},a0=class extends ns{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,p=null,m=null,x=new o0,g=t.getContextAttributes(),f=null,v=null,y=[],M=[],R=new pe,T=null,b=new Sn;b.layers.enable(1),b.viewport=new It;let A=new Sn;A.layers.enable(2),A.viewport=new It;let L=[b,A],_=new s0;_.layers.enable(1),_.layers.enable(2);let S=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let J=y[q];return J===void 0&&(J=new El,y[q]=J),J.getTargetRaySpace()},this.getControllerGrip=function(q){let J=y[q];return J===void 0&&(J=new El,y[q]=J),J.getGripSpace()},this.getHand=function(q){let J=y[q];return J===void 0&&(J=new El,y[q]=J),J.getHandSpace()};function N(q){let J=M.indexOf(q.inputSource);if(J===-1)return;let ue=y[J];ue!==void 0&&(ue.update(q.inputSource,q.frame,c||o),ue.dispatchEvent({type:q.type,data:q.inputSource}))}function F(){r.removeEventListener("select",N),r.removeEventListener("selectstart",N),r.removeEventListener("selectend",N),r.removeEventListener("squeeze",N),r.removeEventListener("squeezestart",N),r.removeEventListener("squeezeend",N),r.removeEventListener("end",F),r.removeEventListener("inputsourceschange",X);for(let q=0;q<y.length;q++){let J=M[q];J!==null&&(M[q]=null,y[q].disconnect(J))}S=null,z=null,x.reset(),e.setRenderTarget(f),p=null,d=null,h=null,r=null,v=null,Fe.stop(),i.isPresenting=!1,e.setPixelRatio(T),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(f=e.getRenderTarget(),r.addEventListener("select",N),r.addEventListener("selectstart",N),r.addEventListener("selectend",N),r.addEventListener("squeeze",N),r.addEventListener("squeezestart",N),r.addEventListener("squeezeend",N),r.addEventListener("end",F),r.addEventListener("inputsourceschange",X),g.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){let J={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,J),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new yr(p.framebufferWidth,p.framebufferHeight,{format:Ai,type:gr,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let J=null,ue=null,Y=null;g.depth&&(Y=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=g.stencil?ra:Ko,ue=g.stencil?ia:zs);let ae={colorFormat:t.RGBA8,depthFormat:Y,scaleFactor:s};h=new XRWebGLBinding(r,t),d=h.createProjectionLayer(ae),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new yr(d.textureWidth,d.textureHeight,{format:Ai,type:gr,depthTexture:new ph(d.textureWidth,d.textureHeight,ue,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Fe.setContext(r),Fe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function X(q){for(let J=0;J<q.removed.length;J++){let ue=q.removed[J],Y=M.indexOf(ue);Y>=0&&(M[Y]=null,y[Y].disconnect(ue))}for(let J=0;J<q.added.length;J++){let ue=q.added[J],Y=M.indexOf(ue);if(Y===-1){for(let he=0;he<y.length;he++)if(he>=M.length){M.push(ue),Y=he;break}else if(M[he]===null){M[he]=ue,Y=he;break}if(Y===-1)break}let ae=y[Y];ae&&ae.connect(ue)}}let O=new I,Z=new I;function G(q,J,ue){O.setFromMatrixPosition(J.matrixWorld),Z.setFromMatrixPosition(ue.matrixWorld);let Y=O.distanceTo(Z),ae=J.projectionMatrix.elements,he=ue.projectionMatrix.elements,we=ae[14]/(ae[10]-1),Ge=ae[14]/(ae[10]+1),Pe=(ae[9]+1)/ae[5],P=(ae[9]-1)/ae[5],dn=(ae[8]-1)/ae[0],je=(he[8]+1)/he[0],Je=we*dn,Ne=we*je,pt=Y/(-dn+je),ze=pt*-dn;if(J.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ze),q.translateZ(pt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ae[10]===-1)q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let C=we+pt,w=Ge+pt,B=Je-ze,$=Ne+(Y-ze),Q=Pe*Ge/w*C,j=P*Ge/w*C;q.projectionMatrix.makePerspective(B,$,Q,j,C,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function re(q,J){J===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(J.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let J=q.near,ue=q.far;x.texture!==null&&(x.depthNear>0&&(J=x.depthNear),x.depthFar>0&&(ue=x.depthFar)),_.near=A.near=b.near=J,_.far=A.far=b.far=ue,(S!==_.near||z!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),S=_.near,z=_.far);let Y=q.parent,ae=_.cameras;re(_,Y);for(let he=0;he<ae.length;he++)re(ae[he],Y);ae.length===2?G(_,b,A):_.projectionMatrix.copy(b.projectionMatrix),te(q,_,Y)};function te(q,J,ue){ue===null?q.matrix.copy(J.matrixWorld):(q.matrix.copy(ue.matrixWorld),q.matrix.invert(),q.matrix.multiply(J.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(J.projectionMatrix),q.projectionMatrixInverse.copy(J.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Wm*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(_)};let ce=null;function Oe(q,J){if(u=J.getViewerPose(c||o),m=J,u!==null){let ue=u.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let Y=!1;ue.length!==_.cameras.length&&(_.cameras.length=0,Y=!0);for(let he=0;he<ue.length;he++){let we=ue[he],Ge=null;if(p!==null)Ge=p.getViewport(we);else{let P=h.getViewSubImage(d,we);Ge=P.viewport,he===0&&(e.setRenderTargetTextures(v,P.colorTexture,d.ignoreDepthValues?void 0:P.depthStencilTexture),e.setRenderTarget(v))}let Pe=L[he];Pe===void 0&&(Pe=new Sn,Pe.layers.enable(he),Pe.viewport=new It,L[he]=Pe),Pe.matrix.fromArray(we.transform.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale),Pe.projectionMatrix.fromArray(we.projectionMatrix),Pe.projectionMatrixInverse.copy(Pe.projectionMatrix).invert(),Pe.viewport.set(Ge.x,Ge.y,Ge.width,Ge.height),he===0&&(_.matrix.copy(Pe.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),Y===!0&&_.cameras.push(Pe)}let ae=r.enabledFeatures;if(ae&&ae.includes("depth-sensing")){let he=h.getDepthInformation(ue[0]);he&&he.isValid&&he.texture&&x.init(e,he,r.renderState)}}for(let ue=0;ue<y.length;ue++){let Y=M[ue],ae=y[ue];Y!==null&&ae!==void 0&&ae.update(Y,J,c||o)}ce&&ce(q,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),m=null}let Fe=new z1;Fe.setAnimationLoop(Oe),this.setAnimationLoop=function(q){ce=q},this.dispose=function(){}}},Ps=new Hi,WR=new ot;function XR(n,e){function t(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function i(g,f){f.color.getRGB(g.fogColor.value,U1(n)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function r(g,f,v,y,M){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(g,f):f.isMeshToonMaterial?(s(g,f),h(g,f)):f.isMeshPhongMaterial?(s(g,f),u(g,f)):f.isMeshStandardMaterial?(s(g,f),d(g,f),f.isMeshPhysicalMaterial&&p(g,f,M)):f.isMeshMatcapMaterial?(s(g,f),m(g,f)):f.isMeshDepthMaterial?s(g,f):f.isMeshDistanceMaterial?(s(g,f),x(g,f)):f.isMeshNormalMaterial?s(g,f):f.isLineBasicMaterial?(o(g,f),f.isLineDashedMaterial&&a(g,f)):f.isPointsMaterial?l(g,f,v,y):f.isSpriteMaterial?c(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,t(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,t(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===Jt&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,t(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===Jt&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,t(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,t(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);let v=e.get(f),y=v.envMap,M=v.envMapRotation;y&&(g.envMap.value=y,Ps.copy(M),Ps.x*=-1,Ps.y*=-1,Ps.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Ps.y*=-1,Ps.z*=-1),g.envMapRotation.value.setFromMatrix4(WR.makeRotationFromEuler(Ps)),g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,g.aoMapTransform))}function o(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,t(f.map,g.mapTransform))}function a(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function l(g,f,v,y){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*v,g.scale.value=y*.5,f.map&&(g.map.value=f.map,t(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,t(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function u(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function h(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function d(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function p(g,f,v){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Jt&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=v.texture,g.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,f){f.matcap&&(g.matcap.value=f.matcap)}function x(g,f){let v=e.get(f).light;g.referencePosition.value.setFromMatrixPosition(v.matrixWorld),g.nearDistance.value=v.shadow.camera.near,g.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function YR(n,e,t,i){let r={},s={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,y){let M=y.program;i.uniformBlockBinding(v,M)}function c(v,y){let M=r[v.id];M===void 0&&(m(v),M=u(v),r[v.id]=M,v.addEventListener("dispose",g));let R=y.program;i.updateUBOMapping(v,R);let T=e.render.frame;s[v.id]!==T&&(d(v),s[v.id]=T)}function u(v){let y=h();v.__bindingPointIndex=y;let M=n.createBuffer(),R=v.__size,T=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,R,T),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,M),M}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let y=r[v.id],M=v.uniforms,R=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let T=0,b=M.length;T<b;T++){let A=Array.isArray(M[T])?M[T]:[M[T]];for(let L=0,_=A.length;L<_;L++){let S=A[L];if(p(S,T,L,R)===!0){let z=S.__offset,N=Array.isArray(S.value)?S.value:[S.value],F=0;for(let X=0;X<N.length;X++){let O=N[X],Z=x(O);typeof O=="number"||typeof O=="boolean"?(S.__data[0]=O,n.bufferSubData(n.UNIFORM_BUFFER,z+F,S.__data)):O.isMatrix3?(S.__data[0]=O.elements[0],S.__data[1]=O.elements[1],S.__data[2]=O.elements[2],S.__data[3]=0,S.__data[4]=O.elements[3],S.__data[5]=O.elements[4],S.__data[6]=O.elements[5],S.__data[7]=0,S.__data[8]=O.elements[6],S.__data[9]=O.elements[7],S.__data[10]=O.elements[8],S.__data[11]=0):(O.toArray(S.__data,F),F+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,z,S.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(v,y,M,R){let T=v.value,b=y+"_"+M;if(R[b]===void 0)return typeof T=="number"||typeof T=="boolean"?R[b]=T:R[b]=T.clone(),!0;{let A=R[b];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return R[b]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function m(v){let y=v.uniforms,M=0,R=16;for(let b=0,A=y.length;b<A;b++){let L=Array.isArray(y[b])?y[b]:[y[b]];for(let _=0,S=L.length;_<S;_++){let z=L[_],N=Array.isArray(z.value)?z.value:[z.value];for(let F=0,X=N.length;F<X;F++){let O=N[F],Z=x(O),G=M%R,re=G%Z.boundary,te=G+re;M+=re,te!==0&&R-te<Z.storage&&(M+=R-te),z.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=M,M+=Z.storage}}}let T=M%R;return T>0&&(M+=R-T),v.__size=M,v.__cache={},this}function x(v){let y={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(y.boundary=4,y.storage=4):v.isVector2?(y.boundary=8,y.storage=8):v.isVector3||v.isColor?(y.boundary=16,y.storage=12):v.isVector4?(y.boundary=16,y.storage=16):v.isMatrix3?(y.boundary=48,y.storage=48):v.isMatrix4?(y.boundary=64,y.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),y}function g(v){let y=v.target;y.removeEventListener("dispose",g);let M=o.indexOf(y.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(r[y.id]),delete r[y.id],delete s[y.id]}function f(){for(let v in r)n.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}var mh=class{constructor(e={}){let{canvas:t=$b(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=o;let p=new Uint32Array(4),m=new Int32Array(4),x=null,g=null,f=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=jn,this.toneMapping=es,this.toneMappingExposure=1;let y=this,M=!1,R=0,T=0,b=null,A=-1,L=null,_=new It,S=new It,z=null,N=new ke(0),F=0,X=t.width,O=t.height,Z=1,G=null,re=null,te=new It(0,0,X,O),ce=new It(0,0,X,O),Oe=!1,Fe=new Pl,q=!1,J=!1,ue=new ot,Y=new ot,ae=new I,he=new It,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ge=!1;function Pe(){return b===null?Z:1}let P=i;function dn(E,D){return t.getContext(E,D)}try{let E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r169"),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",ge,!1),P===null){let D="webgl2";if(P=dn(D,E),P===null)throw dn(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let je,Je,Ne,pt,ze,C,w,B,$,Q,j,be,le,ve,Qe,ne,xe,De,Ue,_e,$e,Be,ut,k;function me(){je=new lA(P),je.init(),Be=new BR(P,je),Je=new nA(P,je,e,Be),Ne=new zR(P),Je.reverseDepthBuffer&&Ne.buffers.depth.setReversed(!0),pt=new hA(P),ze=new bR,C=new FR(P,je,Ne,ze,Je,Be,pt),w=new rA(y),B=new aA(y),$=new vE(P),ut=new eA(P,$),Q=new cA(P,$,pt,ut),j=new dA(P,Q,$,pt),Ue=new fA(P,Je,C),ne=new iA(ze),be=new wR(y,w,B,je,Je,ut,ne),le=new XR(y,ze),ve=new TR,Qe=new LR(je),De=new Q2(y,w,B,Ne,j,d,l),xe=new DR(y,j,Je),k=new YR(P,pt,Je,Ne),_e=new tA(P,je,pt),$e=new uA(P,je,pt),pt.programs=be.programs,y.capabilities=Je,y.extensions=je,y.properties=ze,y.renderLists=ve,y.shadowMap=xe,y.state=Ne,y.info=pt}me();let W=new a0(y,P);this.xr=W,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let E=je.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=je.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(E){E!==void 0&&(Z=E,this.setSize(X,O,!1))},this.getSize=function(E){return E.set(X,O)},this.setSize=function(E,D,H=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=E,O=D,t.width=Math.floor(E*Z),t.height=Math.floor(D*Z),H===!0&&(t.style.width=E+"px",t.style.height=D+"px"),this.setViewport(0,0,E,D)},this.getDrawingBufferSize=function(E){return E.set(X*Z,O*Z).floor()},this.setDrawingBufferSize=function(E,D,H){X=E,O=D,Z=H,t.width=Math.floor(E*H),t.height=Math.floor(D*H),this.setViewport(0,0,E,D)},this.getCurrentViewport=function(E){return E.copy(_)},this.getViewport=function(E){return E.copy(te)},this.setViewport=function(E,D,H,V){E.isVector4?te.set(E.x,E.y,E.z,E.w):te.set(E,D,H,V),Ne.viewport(_.copy(te).multiplyScalar(Z).round())},this.getScissor=function(E){return E.copy(ce)},this.setScissor=function(E,D,H,V){E.isVector4?ce.set(E.x,E.y,E.z,E.w):ce.set(E,D,H,V),Ne.scissor(S.copy(ce).multiplyScalar(Z).round())},this.getScissorTest=function(){return Oe},this.setScissorTest=function(E){Ne.setScissorTest(Oe=E)},this.setOpaqueSort=function(E){G=E},this.setTransparentSort=function(E){re=E},this.getClearColor=function(E){return E.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor.apply(De,arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha.apply(De,arguments)},this.clear=function(E=!0,D=!0,H=!0){let V=0;if(E){let U=!1;if(b!==null){let ie=b.texture.format;U=ie===O0||ie===z0||ie===U0}if(U){let ie=b.texture.type,de=ie===gr||ie===zs||ie===Cl||ie===ia||ie===k0||ie===N0,Me=De.getClearColor(),Se=De.getClearAlpha(),Ie=Me.r,Le=Me.g,Ee=Me.b;de?(p[0]=Ie,p[1]=Le,p[2]=Ee,p[3]=Se,P.clearBufferuiv(P.COLOR,0,p)):(m[0]=Ie,m[1]=Le,m[2]=Ee,m[3]=Se,P.clearBufferiv(P.COLOR,0,m))}else V|=P.COLOR_BUFFER_BIT}D&&(V|=P.DEPTH_BUFFER_BIT,P.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),H&&(V|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),ve.dispose(),Qe.dispose(),ze.dispose(),w.dispose(),B.dispose(),j.dispose(),ut.dispose(),k.dispose(),be.dispose(),W.dispose(),W.removeEventListener("sessionstart",K0),W.removeEventListener("sessionend",J0),os.stop()};function K(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let E=pt.autoReset,D=xe.enabled,H=xe.autoUpdate,V=xe.needsUpdate,U=xe.type;me(),pt.autoReset=E,xe.enabled=D,xe.autoUpdate=H,xe.needsUpdate=V,xe.type=U}function ge(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ze(E){let D=E.target;D.removeEventListener("dispose",Ze),Ut(D)}function Ut(E){An(E),ze.remove(E)}function An(E){let D=ze.get(E).programs;D!==void 0&&(D.forEach(function(H){be.releaseProgram(H)}),E.isShaderMaterial&&be.releaseShaderCache(E))}this.renderBufferDirect=function(E,D,H,V,U,ie){D===null&&(D=we);let de=U.isMesh&&U.matrixWorld.determinant()<0,Me=gM(E,D,H,V,U);Ne.setMaterial(V,de);let Se=H.index,Ie=1;if(V.wireframe===!0){if(Se=Q.getWireframeAttribute(H),Se===void 0)return;Ie=2}let Le=H.drawRange,Ee=H.attributes.position,rt=Le.start*Ie,mt=(Le.start+Le.count)*Ie;ie!==null&&(rt=Math.max(rt,ie.start*Ie),mt=Math.min(mt,(ie.start+ie.count)*Ie)),Se!==null?(rt=Math.max(rt,0),mt=Math.min(mt,Se.count)):Ee!=null&&(rt=Math.max(rt,0),mt=Math.min(mt,Ee.count));let Rt=mt-rt;if(Rt<0||Rt===1/0)return;ut.setup(U,V,Me,H,Se);let zn,tt=_e;if(Se!==null&&(zn=$.get(Se),tt=$e,tt.setIndex(zn)),U.isMesh)V.wireframe===!0?(Ne.setLineWidth(V.wireframeLinewidth*Pe()),tt.setMode(P.LINES)):tt.setMode(P.TRIANGLES);else if(U.isLine){let Te=V.linewidth;Te===void 0&&(Te=1),Ne.setLineWidth(Te*Pe()),U.isLineSegments?tt.setMode(P.LINES):U.isLineLoop?tt.setMode(P.LINE_LOOP):tt.setMode(P.LINE_STRIP)}else U.isPoints?tt.setMode(P.POINTS):U.isSprite&&tt.setMode(P.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)tt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(je.get("WEBGL_multi_draw"))tt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Te=U._multiDrawStarts,qt=U._multiDrawCounts,nt=U._multiDrawCount,fi=Se?$.get(Se).bytesPerElement:1,Ws=ze.get(V).currentProgram.getUniforms();for(let On=0;On<nt;On++)Ws.setValue(P,"_gl_DrawID",On),tt.render(Te[On]/fi,qt[On])}else if(U.isInstancedMesh)tt.renderInstances(rt,Rt,U.count);else if(H.isInstancedBufferGeometry){let Te=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,qt=Math.min(H.instanceCount,Te);tt.renderInstances(rt,Rt,qt)}else tt.render(rt,Rt)};function et(E,D,H){E.transparent===!0&&E.side===$n&&E.forceSinglePass===!1?(E.side=Jt,E.needsUpdate=!0,Yl(E,D,H),E.side=ts,E.needsUpdate=!0,Yl(E,D,H),E.side=$n):Yl(E,D,H)}this.compile=function(E,D,H=null){H===null&&(H=E),g=Qe.get(H),g.init(D),v.push(g),H.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(g.pushLight(U),U.castShadow&&g.pushShadow(U))}),E!==H&&E.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(g.pushLight(U),U.castShadow&&g.pushShadow(U))}),g.setupLights();let V=new Set;return E.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let ie=U.material;if(ie)if(Array.isArray(ie))for(let de=0;de<ie.length;de++){let Me=ie[de];et(Me,H,U),V.add(Me)}else et(ie,H,U),V.add(ie)}),v.pop(),g=null,V},this.compileAsync=function(E,D,H=null){let V=this.compile(E,D,H);return new Promise(U=>{function ie(){if(V.forEach(function(de){ze.get(de).currentProgram.isReady()&&V.delete(de)}),V.size===0){U(E);return}setTimeout(ie,10)}je.get("KHR_parallel_shader_compile")!==null?ie():setTimeout(ie,10)})};let Rn=null;function Yi(E){Rn&&Rn(E)}function K0(){os.stop()}function J0(){os.start()}let os=new z1;os.setAnimationLoop(Yi),typeof self<"u"&&os.setContext(self),this.setAnimationLoop=function(E){Rn=E,W.setAnimationLoop(E),E===null?os.stop():os.start()},W.addEventListener("sessionstart",K0),W.addEventListener("sessionend",J0),this.render=function(E,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,D,b),g=Qe.get(E,v.length),g.init(D),v.push(g),Y.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Fe.setFromProjectionMatrix(Y),J=this.localClippingEnabled,q=ne.init(this.clippingPlanes,J),x=ve.get(E,f.length),x.init(),f.push(x),W.enabled===!0&&W.isPresenting===!0){let ie=y.xr.getDepthSensingMesh();ie!==null&&zh(ie,D,-1/0,y.sortObjects)}zh(E,D,0,y.sortObjects),x.finish(),y.sortObjects===!0&&x.sort(G,re),Ge=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Ge&&De.addToRenderList(x,E),this.info.render.frame++,q===!0&&ne.beginShadows();let H=g.state.shadowsArray;xe.render(H,E,D),q===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();let V=x.opaque,U=x.transmissive;if(g.setupLights(),D.isArrayCamera){let ie=D.cameras;if(U.length>0)for(let de=0,Me=ie.length;de<Me;de++){let Se=ie[de];eg(V,U,E,Se)}Ge&&De.render(E);for(let de=0,Me=ie.length;de<Me;de++){let Se=ie[de];Q0(x,E,Se,Se.viewport)}}else U.length>0&&eg(V,U,E,D),Ge&&De.render(E),Q0(x,E,D);b!==null&&(C.updateMultisampleRenderTarget(b),C.updateRenderTargetMipmap(b)),E.isScene===!0&&E.onAfterRender(y,E,D),ut.resetDefaultState(),A=-1,L=null,v.pop(),v.length>0?(g=v[v.length-1],q===!0&&ne.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,f.pop(),f.length>0?x=f[f.length-1]:x=null};function zh(E,D,H,V){if(E.visible===!1)return;if(E.layers.test(D.layers)){if(E.isGroup)H=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(D);else if(E.isLight)g.pushLight(E),E.castShadow&&g.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Fe.intersectsSprite(E)){V&&he.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Y);let de=j.update(E),Me=E.material;Me.visible&&x.push(E,de,Me,H,he.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Fe.intersectsObject(E))){let de=j.update(E),Me=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),he.copy(E.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),he.copy(de.boundingSphere.center)),he.applyMatrix4(E.matrixWorld).applyMatrix4(Y)),Array.isArray(Me)){let Se=de.groups;for(let Ie=0,Le=Se.length;Ie<Le;Ie++){let Ee=Se[Ie],rt=Me[Ee.materialIndex];rt&&rt.visible&&x.push(E,de,rt,H,he.z,Ee)}}else Me.visible&&x.push(E,de,Me,H,he.z,null)}}let ie=E.children;for(let de=0,Me=ie.length;de<Me;de++)zh(ie[de],D,H,V)}function Q0(E,D,H,V){let U=E.opaque,ie=E.transmissive,de=E.transparent;g.setupLightsView(H),q===!0&&ne.setGlobalState(y.clippingPlanes,H),V&&Ne.viewport(_.copy(V)),U.length>0&&Xl(U,D,H),ie.length>0&&Xl(ie,D,H),de.length>0&&Xl(de,D,H),Ne.buffers.depth.setTest(!0),Ne.buffers.depth.setMask(!0),Ne.buffers.color.setMask(!0),Ne.setPolygonOffset(!1)}function eg(E,D,H,V){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[V.id]===void 0&&(g.state.transmissionRenderTarget[V.id]=new yr(1,1,{generateMipmaps:!0,type:je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float")?Hl:gr,minFilter:Ds,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:it.workingColorSpace}));let ie=g.state.transmissionRenderTarget[V.id],de=V.viewport||_;ie.setSize(de.z,de.w);let Me=y.getRenderTarget();y.setRenderTarget(ie),y.getClearColor(N),F=y.getClearAlpha(),F<1&&y.setClearColor(16777215,.5),y.clear(),Ge&&De.render(H);let Se=y.toneMapping;y.toneMapping=es;let Ie=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),g.setupLightsView(V),q===!0&&ne.setGlobalState(y.clippingPlanes,V),Xl(E,H,V),C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie),je.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let Ee=0,rt=D.length;Ee<rt;Ee++){let mt=D[Ee],Rt=mt.object,zn=mt.geometry,tt=mt.material,Te=mt.group;if(tt.side===$n&&Rt.layers.test(V.layers)){let qt=tt.side;tt.side=Jt,tt.needsUpdate=!0,tg(Rt,H,V,zn,tt,Te),tt.side=qt,tt.needsUpdate=!0,Le=!0}}Le===!0&&(C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie))}y.setRenderTarget(Me),y.setClearColor(N,F),Ie!==void 0&&(V.viewport=Ie),y.toneMapping=Se}function Xl(E,D,H){let V=D.isScene===!0?D.overrideMaterial:null;for(let U=0,ie=E.length;U<ie;U++){let de=E[U],Me=de.object,Se=de.geometry,Ie=V===null?de.material:V,Le=de.group;Me.layers.test(H.layers)&&tg(Me,D,H,Se,Ie,Le)}}function tg(E,D,H,V,U,ie){E.onBeforeRender(y,D,H,V,U,ie),E.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),U.onBeforeRender(y,D,H,V,E,ie),U.transparent===!0&&U.side===$n&&U.forceSinglePass===!1?(U.side=Jt,U.needsUpdate=!0,y.renderBufferDirect(H,D,V,U,E,ie),U.side=ts,U.needsUpdate=!0,y.renderBufferDirect(H,D,V,U,E,ie),U.side=$n):y.renderBufferDirect(H,D,V,U,E,ie),E.onAfterRender(y,D,H,V,U,ie)}function Yl(E,D,H){D.isScene!==!0&&(D=we);let V=ze.get(E),U=g.state.lights,ie=g.state.shadowsArray,de=U.state.version,Me=be.getParameters(E,U.state,ie,D,H),Se=be.getProgramCacheKey(Me),Ie=V.programs;V.environment=E.isMeshStandardMaterial?D.environment:null,V.fog=D.fog,V.envMap=(E.isMeshStandardMaterial?B:w).get(E.envMap||V.environment),V.envMapRotation=V.environment!==null&&E.envMap===null?D.environmentRotation:E.envMapRotation,Ie===void 0&&(E.addEventListener("dispose",Ze),Ie=new Map,V.programs=Ie);let Le=Ie.get(Se);if(Le!==void 0){if(V.currentProgram===Le&&V.lightsStateVersion===de)return ig(E,Me),Le}else Me.uniforms=be.getUniforms(E),E.onBeforeCompile(Me,y),Le=be.acquireProgram(Me,Se),Ie.set(Se,Le),V.uniforms=Me.uniforms;let Ee=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ee.clippingPlanes=ne.uniform),ig(E,Me),V.needsLights=vM(E),V.lightsStateVersion=de,V.needsLights&&(Ee.ambientLightColor.value=U.state.ambient,Ee.lightProbe.value=U.state.probe,Ee.directionalLights.value=U.state.directional,Ee.directionalLightShadows.value=U.state.directionalShadow,Ee.spotLights.value=U.state.spot,Ee.spotLightShadows.value=U.state.spotShadow,Ee.rectAreaLights.value=U.state.rectArea,Ee.ltc_1.value=U.state.rectAreaLTC1,Ee.ltc_2.value=U.state.rectAreaLTC2,Ee.pointLights.value=U.state.point,Ee.pointLightShadows.value=U.state.pointShadow,Ee.hemisphereLights.value=U.state.hemi,Ee.directionalShadowMap.value=U.state.directionalShadowMap,Ee.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ee.spotShadowMap.value=U.state.spotShadowMap,Ee.spotLightMatrix.value=U.state.spotLightMatrix,Ee.spotLightMap.value=U.state.spotLightMap,Ee.pointShadowMap.value=U.state.pointShadowMap,Ee.pointShadowMatrix.value=U.state.pointShadowMatrix),V.currentProgram=Le,V.uniformsList=null,Le}function ng(E){if(E.uniformsList===null){let D=E.currentProgram.getUniforms();E.uniformsList=Qo.seqWithValue(D.seq,E.uniforms)}return E.uniformsList}function ig(E,D){let H=ze.get(E);H.outputColorSpace=D.outputColorSpace,H.batching=D.batching,H.batchingColor=D.batchingColor,H.instancing=D.instancing,H.instancingColor=D.instancingColor,H.instancingMorph=D.instancingMorph,H.skinning=D.skinning,H.morphTargets=D.morphTargets,H.morphNormals=D.morphNormals,H.morphColors=D.morphColors,H.morphTargetsCount=D.morphTargetsCount,H.numClippingPlanes=D.numClippingPlanes,H.numIntersection=D.numClipIntersection,H.vertexAlphas=D.vertexAlphas,H.vertexTangents=D.vertexTangents,H.toneMapping=D.toneMapping}function gM(E,D,H,V,U){D.isScene!==!0&&(D=we),C.resetTextureUnits();let ie=D.fog,de=V.isMeshStandardMaterial?D.environment:null,Me=b===null?y.outputColorSpace:b.isXRRenderTarget===!0?b.texture.colorSpace:ss,Se=(V.isMeshStandardMaterial?B:w).get(V.envMap||de),Ie=V.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Le=!!H.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ee=!!H.morphAttributes.position,rt=!!H.morphAttributes.normal,mt=!!H.morphAttributes.color,Rt=es;V.toneMapped&&(b===null||b.isXRRenderTarget===!0)&&(Rt=y.toneMapping);let zn=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,tt=zn!==void 0?zn.length:0,Te=ze.get(V),qt=g.state.lights;if(q===!0&&(J===!0||E!==L)){let Jn=E===L&&V.id===A;ne.setState(V,E,Jn)}let nt=!1;V.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==qt.state.version||Te.outputColorSpace!==Me||U.isBatchedMesh&&Te.batching===!1||!U.isBatchedMesh&&Te.batching===!0||U.isBatchedMesh&&Te.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Te.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Te.instancing===!1||!U.isInstancedMesh&&Te.instancing===!0||U.isSkinnedMesh&&Te.skinning===!1||!U.isSkinnedMesh&&Te.skinning===!0||U.isInstancedMesh&&Te.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Te.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Te.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Te.instancingMorph===!1&&U.morphTexture!==null||Te.envMap!==Se||V.fog===!0&&Te.fog!==ie||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==ne.numPlanes||Te.numIntersection!==ne.numIntersection)||Te.vertexAlphas!==Ie||Te.vertexTangents!==Le||Te.morphTargets!==Ee||Te.morphNormals!==rt||Te.morphColors!==mt||Te.toneMapping!==Rt||Te.morphTargetsCount!==tt)&&(nt=!0):(nt=!0,Te.__version=V.version);let fi=Te.currentProgram;nt===!0&&(fi=Yl(V,D,U));let Ws=!1,On=!1,Oh=!1,kt=fi.getUniforms(),Mr=Te.uniforms;if(Ne.useProgram(fi.program)&&(Ws=!0,On=!0,Oh=!0),V.id!==A&&(A=V.id,On=!0),Ws||L!==E){Je.reverseDepthBuffer?(ue.copy(E.projectionMatrix),Kb(ue),Jb(ue),kt.setValue(P,"projectionMatrix",ue)):kt.setValue(P,"projectionMatrix",E.projectionMatrix),kt.setValue(P,"viewMatrix",E.matrixWorldInverse);let Jn=kt.map.cameraPosition;Jn!==void 0&&Jn.setValue(P,ae.setFromMatrixPosition(E.matrixWorld)),Je.logarithmicDepthBuffer&&kt.setValue(P,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&kt.setValue(P,"isOrthographic",E.isOrthographicCamera===!0),L!==E&&(L=E,On=!0,Oh=!0)}if(U.isSkinnedMesh){kt.setOptional(P,U,"bindMatrix"),kt.setOptional(P,U,"bindMatrixInverse");let Jn=U.skeleton;Jn&&(Jn.boneTexture===null&&Jn.computeBoneTexture(),kt.setValue(P,"boneTexture",Jn.boneTexture,C))}U.isBatchedMesh&&(kt.setOptional(P,U,"batchingTexture"),kt.setValue(P,"batchingTexture",U._matricesTexture,C),kt.setOptional(P,U,"batchingIdTexture"),kt.setValue(P,"batchingIdTexture",U._indirectTexture,C),kt.setOptional(P,U,"batchingColorTexture"),U._colorsTexture!==null&&kt.setValue(P,"batchingColorTexture",U._colorsTexture,C));let Fh=H.morphAttributes;if((Fh.position!==void 0||Fh.normal!==void 0||Fh.color!==void 0)&&Ue.update(U,H,fi),(On||Te.receiveShadow!==U.receiveShadow)&&(Te.receiveShadow=U.receiveShadow,kt.setValue(P,"receiveShadow",U.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Mr.envMap.value=Se,Mr.flipEnvMap.value=Se.isCubeTexture&&Se.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&D.environment!==null&&(Mr.envMapIntensity.value=D.environmentIntensity),On&&(kt.setValue(P,"toneMappingExposure",y.toneMappingExposure),Te.needsLights&&yM(Mr,Oh),ie&&V.fog===!0&&le.refreshFogUniforms(Mr,ie),le.refreshMaterialUniforms(Mr,V,Z,O,g.state.transmissionRenderTarget[E.id]),Qo.upload(P,ng(Te),Mr,C)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Qo.upload(P,ng(Te),Mr,C),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&kt.setValue(P,"center",U.center),kt.setValue(P,"modelViewMatrix",U.modelViewMatrix),kt.setValue(P,"normalMatrix",U.normalMatrix),kt.setValue(P,"modelMatrix",U.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){let Jn=V.uniformsGroups;for(let Bh=0,xM=Jn.length;Bh<xM;Bh++){let rg=Jn[Bh];k.update(rg,fi),k.bind(rg,fi)}}return fi}function yM(E,D){E.ambientLightColor.needsUpdate=D,E.lightProbe.needsUpdate=D,E.directionalLights.needsUpdate=D,E.directionalLightShadows.needsUpdate=D,E.pointLights.needsUpdate=D,E.pointLightShadows.needsUpdate=D,E.spotLights.needsUpdate=D,E.spotLightShadows.needsUpdate=D,E.rectAreaLights.needsUpdate=D,E.hemisphereLights.needsUpdate=D}function vM(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return b},this.setRenderTargetTextures=function(E,D,H){ze.get(E.texture).__webglTexture=D,ze.get(E.depthTexture).__webglTexture=H;let V=ze.get(E);V.__hasExternalTextures=!0,V.__autoAllocateDepthBuffer=H===void 0,V.__autoAllocateDepthBuffer||je.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,D){let H=ze.get(E);H.__webglFramebuffer=D,H.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(E,D=0,H=0){b=E,R=D,T=H;let V=!0,U=null,ie=!1,de=!1;if(E){let Se=ze.get(E);if(Se.__useDefaultFramebuffer!==void 0)Ne.bindFramebuffer(P.FRAMEBUFFER,null),V=!1;else if(Se.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(Se.__hasExternalTextures)C.rebindTextures(E,ze.get(E.texture).__webglTexture,ze.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Ee=E.depthTexture;if(Se.__boundDepthTexture!==Ee){if(Ee!==null&&ze.has(Ee)&&(E.width!==Ee.image.width||E.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}let Ie=E.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(de=!0);let Le=ze.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Le[D])?U=Le[D][H]:U=Le[D],ie=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?U=ze.get(E).__webglMultisampledFramebuffer:Array.isArray(Le)?U=Le[H]:U=Le,_.copy(E.viewport),S.copy(E.scissor),z=E.scissorTest}else _.copy(te).multiplyScalar(Z).floor(),S.copy(ce).multiplyScalar(Z).floor(),z=Oe;if(Ne.bindFramebuffer(P.FRAMEBUFFER,U)&&V&&Ne.drawBuffers(E,U),Ne.viewport(_),Ne.scissor(S),Ne.setScissorTest(z),ie){let Se=ze.get(E.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+D,Se.__webglTexture,H)}else if(de){let Se=ze.get(E.texture),Ie=D||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Se.__webglTexture,H||0,Ie)}A=-1},this.readRenderTargetPixels=function(E,D,H,V,U,ie,de){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=ze.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&de!==void 0&&(Me=Me[de]),Me){Ne.bindFramebuffer(P.FRAMEBUFFER,Me);try{let Se=E.texture,Ie=Se.format,Le=Se.type;if(!Je.textureFormatReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Je.textureTypeReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=E.width-V&&H>=0&&H<=E.height-U&&P.readPixels(D,H,V,U,Be.convert(Ie),Be.convert(Le),ie)}finally{let Se=b!==null?ze.get(b).__webglFramebuffer:null;Ne.bindFramebuffer(P.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(E,D,H,V,U,ie,de){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=ze.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&de!==void 0&&(Me=Me[de]),Me){let Se=E.texture,Ie=Se.format,Le=Se.type;if(!Je.textureFormatReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Je.textureTypeReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=E.width-V&&H>=0&&H<=E.height-U){Ne.bindFramebuffer(P.FRAMEBUFFER,Me);let Ee=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Ee),P.bufferData(P.PIXEL_PACK_BUFFER,ie.byteLength,P.STREAM_READ),P.readPixels(D,H,V,U,Be.convert(Ie),Be.convert(Le),0);let rt=b!==null?ze.get(b).__webglFramebuffer:null;Ne.bindFramebuffer(P.FRAMEBUFFER,rt);let mt=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Zb(P,mt,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Ee),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ie),P.deleteBuffer(Ee),P.deleteSync(mt),ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,D=null,H=0){E.isTexture!==!0&&(Qu("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,E=arguments[1]);let V=Math.pow(2,-H),U=Math.floor(E.image.width*V),ie=Math.floor(E.image.height*V),de=D!==null?D.x:0,Me=D!==null?D.y:0;C.setTexture2D(E,0),P.copyTexSubImage2D(P.TEXTURE_2D,H,0,0,de,Me,U,ie),Ne.unbindTexture()},this.copyTextureToTexture=function(E,D,H=null,V=null,U=0){E.isTexture!==!0&&(Qu("WebGLRenderer: copyTextureToTexture function signature has changed."),V=arguments[0]||null,E=arguments[1],D=arguments[2],U=arguments[3]||0,H=null);let ie,de,Me,Se,Ie,Le;H!==null?(ie=H.max.x-H.min.x,de=H.max.y-H.min.y,Me=H.min.x,Se=H.min.y):(ie=E.image.width,de=E.image.height,Me=0,Se=0),V!==null?(Ie=V.x,Le=V.y):(Ie=0,Le=0);let Ee=Be.convert(D.format),rt=Be.convert(D.type);C.setTexture2D(D,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,D.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,D.unpackAlignment);let mt=P.getParameter(P.UNPACK_ROW_LENGTH),Rt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),zn=P.getParameter(P.UNPACK_SKIP_PIXELS),tt=P.getParameter(P.UNPACK_SKIP_ROWS),Te=P.getParameter(P.UNPACK_SKIP_IMAGES),qt=E.isCompressedTexture?E.mipmaps[U]:E.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,qt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,qt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Me),P.pixelStorei(P.UNPACK_SKIP_ROWS,Se),E.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,U,Ie,Le,ie,de,Ee,rt,qt.data):E.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,U,Ie,Le,qt.width,qt.height,Ee,qt.data):P.texSubImage2D(P.TEXTURE_2D,U,Ie,Le,ie,de,Ee,rt,qt),P.pixelStorei(P.UNPACK_ROW_LENGTH,mt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Rt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,zn),P.pixelStorei(P.UNPACK_SKIP_ROWS,tt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Te),U===0&&D.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),Ne.unbindTexture()},this.copyTextureToTexture3D=function(E,D,H=null,V=null,U=0){E.isTexture!==!0&&(Qu("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,V=arguments[1]||null,E=arguments[2],D=arguments[3],U=arguments[4]||0);let ie,de,Me,Se,Ie,Le,Ee,rt,mt,Rt=E.isCompressedTexture?E.mipmaps[U]:E.image;H!==null?(ie=H.max.x-H.min.x,de=H.max.y-H.min.y,Me=H.max.z-H.min.z,Se=H.min.x,Ie=H.min.y,Le=H.min.z):(ie=Rt.width,de=Rt.height,Me=Rt.depth,Se=0,Ie=0,Le=0),V!==null?(Ee=V.x,rt=V.y,mt=V.z):(Ee=0,rt=0,mt=0);let zn=Be.convert(D.format),tt=Be.convert(D.type),Te;if(D.isData3DTexture)C.setTexture3D(D,0),Te=P.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)C.setTexture2DArray(D,0),Te=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,D.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,D.unpackAlignment);let qt=P.getParameter(P.UNPACK_ROW_LENGTH),nt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),fi=P.getParameter(P.UNPACK_SKIP_PIXELS),Ws=P.getParameter(P.UNPACK_SKIP_ROWS),On=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,Rt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Rt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Se),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ie),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Le),E.isDataTexture||E.isData3DTexture?P.texSubImage3D(Te,U,Ee,rt,mt,ie,de,Me,zn,tt,Rt.data):D.isCompressedArrayTexture?P.compressedTexSubImage3D(Te,U,Ee,rt,mt,ie,de,Me,zn,Rt.data):P.texSubImage3D(Te,U,Ee,rt,mt,ie,de,Me,zn,tt,Rt),P.pixelStorei(P.UNPACK_ROW_LENGTH,qt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,nt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,fi),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ws),P.pixelStorei(P.UNPACK_SKIP_IMAGES,On),U===0&&D.generateMipmaps&&P.generateMipmap(Te),Ne.unbindTexture()},this.initRenderTarget=function(E){ze.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),Ne.unbindTexture()},this.resetState=function(){R=0,T=0,b=null,Ne.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return pr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===F0?"display-p3":"srgb",t.unpackColorSpace=it.workingColorSpace===Rh?"display-p3":"srgb"}};var gh=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new ke(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Il=class extends wn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hi,this.environmentIntensity=1,this.environmentRotation=new Hi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},yh=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Gm,this.updateRanges=[],this.version=0,this.uuid=mr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=mr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},_n=new I,Ll=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.applyMatrix4(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.applyNormalMatrix(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.transformDirection(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Oi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Oi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Oi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Oi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Oi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Dt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Fs=class extends is{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Go,xl=new I,Wo=new I,Xo=new I,Yo=new pe,_l=new pe,V1=new ot,Bu=new I,Ml=new I,Hu=new I,c1=new pe,Qp=new pe,u1=new pe,aa=class extends wn{constructor(e=new Fs){if(super(),this.isSprite=!0,this.type="Sprite",Go===void 0){Go=new Qt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new yh(t,5);Go.setIndex([0,1,2,0,2,3]),Go.setAttribute("position",new Ll(i,3,0,!1)),Go.setAttribute("uv",new Ll(i,2,3,!1))}this.geometry=Go,this.material=e,this.center=new pe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Wo.setFromMatrixScale(this.matrixWorld),V1.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Xo.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Wo.multiplyScalar(-Xo.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;Vu(Bu.set(-.5,-.5,0),Xo,o,Wo,r,s),Vu(Ml.set(.5,-.5,0),Xo,o,Wo,r,s),Vu(Hu.set(.5,.5,0),Xo,o,Wo,r,s),c1.set(0,0),Qp.set(1,0),u1.set(1,1);let a=e.ray.intersectTriangle(Bu,Ml,Hu,!1,xl);if(a===null&&(Vu(Ml.set(-.5,.5,0),Xo,o,Wo,r,s),Qp.set(0,1),a=e.ray.intersectTriangle(Bu,Hu,Ml,!1,xl),a===null))return;let l=e.ray.origin.distanceTo(xl);l<e.near||l>e.far||t.push({distance:l,point:xl.clone(),uv:Jr.getInterpolation(xl,Bu,Ml,Hu,c1,Qp,u1,new pe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Vu(n,e,t,i,r,s){Yo.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(_l.x=s*Yo.x-r*Yo.y,_l.y=r*Yo.x+s*Yo.y):_l.copy(Yo),n.copy(e),n.x+=_l.x,n.y+=_l.y,n.applyMatrix4(V1)}var l0=class extends Nn{constructor(e=null,t=1,i=1,r,s,o,a,l,c=hn,u=hn,h,d){super(null,o,a,l,c,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var kl=class extends Dt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},qo=new ot,h1=new ot,Gu=[],f1=new vr,qR=new ot,Sl=new Ce,wl=new Os,vh=class extends Ce{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new kl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,qR)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new vr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,qo),f1.copy(e.boundingBox).applyMatrix4(qo),this.boundingBox.union(f1)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Os),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,qo),wl.copy(e.boundingSphere).applyMatrix4(qo),this.boundingSphere.union(wl)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,t){let i=this.matrixWorld,r=this.count;if(Sl.geometry=this.geometry,Sl.material=this.material,Sl.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wl.copy(this.boundingSphere),wl.applyMatrix4(i),e.ray.intersectsSphere(wl)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,qo),h1.multiplyMatrices(i,qo),Sl.matrixWorld=h1,Sl.raycast(e,Gu);for(let o=0,a=Gu.length;o<a;o++){let l=Gu[o];l.instanceId=s,l.object=this,t.push(l)}Gu.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new kl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new l0(new Float32Array(r*this.count),r,this.count,D0,Fi));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Nl=class extends Nn{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},ci=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],d=i[r+1]-u,p=(o-u)/d;return(r+p)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new pe:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new I,r=[],s=[],o=[],a=new I,l=new ot;for(let p=0;p<=e;p++){let m=p/e;r[p]=this.getTangentAt(m,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(un(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,m))}o[p].crossVectors(r[p],s[p])}if(t===!0){let p=Math.acos(un(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(r[m],p*m)),o[m].crossVectors(r[m],s[m])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Dl=class extends ci{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new pe){let i=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*u-p*h+this.aX,c=d*h+p*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},c0=class extends Dl{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function H0(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,p=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,p*=u,r(o,a,d,p)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var Wu=new I,em=new H0,tm=new H0,nm=new H0,u0=class extends ci{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new I){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Wu.subVectors(r[0],r[1]).add(r[0]),c=Wu);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Wu.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Wu),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),p),x=Math.pow(h.distanceToSquared(d),p),g=Math.pow(d.distanceToSquared(u),p);x<1e-4&&(x=1),m<1e-4&&(m=x),g<1e-4&&(g=x),em.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,m,x,g),tm.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,m,x,g),nm.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,m,x,g)}else this.curveType==="catmullrom"&&(em.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),tm.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),nm.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return i.set(em.calc(l),tm.calc(l),nm.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function d1(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function jR(n,e){let t=1-n;return t*t*e}function $R(n,e){return 2*(1-n)*n*e}function ZR(n,e){return n*n*e}function Tl(n,e,t,i){return jR(n,e)+$R(n,t)+ZR(n,i)}function KR(n,e){let t=1-n;return t*t*t*e}function JR(n,e){let t=1-n;return 3*t*t*n*e}function QR(n,e){return 3*(1-n)*n*n*e}function eC(n,e){return n*n*n*e}function Al(n,e,t,i,r){return KR(n,e)+JR(n,t)+QR(n,i)+eC(n,r)}var xh=class extends ci{constructor(e=new pe,t=new pe,i=new pe,r=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new pe){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Al(e,r.x,s.x,o.x,a.x),Al(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},h0=class extends ci{constructor(e=new I,t=new I,i=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new I){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Al(e,r.x,s.x,o.x,a.x),Al(e,r.y,s.y,o.y,a.y),Al(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},_h=class extends ci{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},f0=class extends ci{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mh=class extends ci{constructor(e=new pe,t=new pe,i=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new pe){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Tl(e,r.x,s.x,o.x),Tl(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},d0=class extends ci{constructor(e=new I,t=new I,i=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new I){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Tl(e,r.x,s.x,o.x),Tl(e,r.y,s.y,o.y),Tl(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sh=class extends ci{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(d1(a,l.x,c.x,u.x,h.x),d1(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new pe().fromArray(r))}return this}},p1=Object.freeze({__proto__:null,ArcCurve:c0,CatmullRomCurve3:u0,CubicBezierCurve:xh,CubicBezierCurve3:h0,EllipseCurve:Dl,LineCurve:_h,LineCurve3:f0,QuadraticBezierCurve:Mh,QuadraticBezierCurve3:d0,SplineCurve:Sh}),p0=class extends ci{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new p1[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new p1[r.type]().fromJSON(r))}return this}},wh=class extends p0{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new _h(this.currentPoint.clone(),new pe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new Mh(this.currentPoint.clone(),new pe(e,t),new pe(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new xh(this.currentPoint.clone(),new pe(e,t),new pe(i,r),new pe(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Sh(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let c=new Dl(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var Bs=class n extends Qt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new I,u=new pe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let p=i+h/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ct(o,3)),this.setAttribute("normal",new ct(a,3)),this.setAttribute("uv",new ct(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},en=class n extends Qt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],p=[],m=0,x=[],g=i/2,f=0;v(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new ct(h,3)),this.setAttribute("normal",new ct(d,3)),this.setAttribute("uv",new ct(p,2));function v(){let M=new I,R=new I,T=0,b=(t-e)/i;for(let A=0;A<=s;A++){let L=[],_=A/s,S=_*(t-e)+e;for(let z=0;z<=r;z++){let N=z/r,F=N*l+a,X=Math.sin(F),O=Math.cos(F);R.x=S*X,R.y=-_*i+g,R.z=S*O,h.push(R.x,R.y,R.z),M.set(X,b,O).normalize(),d.push(M.x,M.y,M.z),p.push(N,1-_),L.push(m++)}x.push(L)}for(let A=0;A<r;A++)for(let L=0;L<s;L++){let _=x[L][A],S=x[L+1][A],z=x[L+1][A+1],N=x[L][A+1];e>0&&(u.push(_,S,N),T+=3),t>0&&(u.push(S,z,N),T+=3)}c.addGroup(f,T,0),f+=T}function y(M){let R=m,T=new pe,b=new I,A=0,L=M===!0?e:t,_=M===!0?1:-1;for(let z=1;z<=r;z++)h.push(0,g*_,0),d.push(0,_,0),p.push(.5,.5),m++;let S=m;for(let z=0;z<=r;z++){let F=z/r*l+a,X=Math.cos(F),O=Math.sin(F);b.x=L*O,b.y=g*_,b.z=L*X,h.push(b.x,b.y,b.z),d.push(0,_,0),T.x=X*.5+.5,T.y=O*.5*_+.5,p.push(T.x,T.y),m++}for(let z=0;z<r;z++){let N=R+z,F=S+z;M===!0?u.push(F,F+1,N):u.push(F+1,F,N),A+=3}c.addGroup(f,A,M===!0?1:2),f+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},rs=class n extends en{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},m0=class n extends Qt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new ct(s,3)),this.setAttribute("normal",new ct(s.slice(),3)),this.setAttribute("uv",new ct(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let y=new I,M=new I,R=new I;for(let T=0;T<t.length;T+=3)p(t[T+0],y),p(t[T+1],M),p(t[T+2],R),l(y,M,R,v)}function l(v,y,M,R){let T=R+1,b=[];for(let A=0;A<=T;A++){b[A]=[];let L=v.clone().lerp(M,A/T),_=y.clone().lerp(M,A/T),S=T-A;for(let z=0;z<=S;z++)z===0&&A===T?b[A][z]=L:b[A][z]=L.clone().lerp(_,z/S)}for(let A=0;A<T;A++)for(let L=0;L<2*(T-A)-1;L++){let _=Math.floor(L/2);L%2===0?(d(b[A][_+1]),d(b[A+1][_]),d(b[A][_])):(d(b[A][_+1]),d(b[A+1][_+1]),d(b[A+1][_]))}}function c(v){let y=new I;for(let M=0;M<s.length;M+=3)y.x=s[M+0],y.y=s[M+1],y.z=s[M+2],y.normalize().multiplyScalar(v),s[M+0]=y.x,s[M+1]=y.y,s[M+2]=y.z}function u(){let v=new I;for(let y=0;y<s.length;y+=3){v.x=s[y+0],v.y=s[y+1],v.z=s[y+2];let M=g(v)/2/Math.PI+.5,R=f(v)/Math.PI+.5;o.push(M,1-R)}m(),h()}function h(){for(let v=0;v<o.length;v+=6){let y=o[v+0],M=o[v+2],R=o[v+4],T=Math.max(y,M,R),b=Math.min(y,M,R);T>.9&&b<.1&&(y<.2&&(o[v+0]+=1),M<.2&&(o[v+2]+=1),R<.2&&(o[v+4]+=1))}}function d(v){s.push(v.x,v.y,v.z)}function p(v,y){let M=v*3;y.x=e[M+0],y.y=e[M+1],y.z=e[M+2]}function m(){let v=new I,y=new I,M=new I,R=new I,T=new pe,b=new pe,A=new pe;for(let L=0,_=0;L<s.length;L+=9,_+=6){v.set(s[L+0],s[L+1],s[L+2]),y.set(s[L+3],s[L+4],s[L+5]),M.set(s[L+6],s[L+7],s[L+8]),T.set(o[_+0],o[_+1]),b.set(o[_+2],o[_+3]),A.set(o[_+4],o[_+5]),R.copy(v).add(y).add(M).divideScalar(3);let S=g(R);x(T,_+0,v,S),x(b,_+2,y,S),x(A,_+4,M,S)}}function x(v,y,M,R){R<0&&v.x===1&&(o[y]=v.x-1),M.x===0&&M.z===0&&(o[y]=R/2/Math.PI+.5)}function g(v){return Math.atan2(v.z,-v.x)}function f(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var Ul=class extends wh{constructor(e){super(e),this.uuid=mr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new wh().fromJSON(r))}return this}},tC={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=G1(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,d,p;if(i&&(s=oC(n,e,s,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let m=t;m<r;m+=t)h=n[m],d=n[m+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);p=Math.max(c-a,u-l),p=p!==0?32767/p:0}return zl(s,o,t,a,l,p,0),o}};function G1(n,e,t,i,r){let s,o;if(r===yC(n,e,t,i)>0)for(s=e;s<t;s+=i)o=m1(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=m1(s,n[s],n[s+1],o);return o&&Ph(o,o.next)&&(Fl(o),o=o.next),o}function Hs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Ph(t,t.next)||At(t.prev,t,t.next)===0)){if(Fl(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function zl(n,e,t,i,r,s,o){if(!n)return;!o&&s&&hC(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?iC(n,i,r,s):nC(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),Fl(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=rC(Hs(n),e,t),zl(n,e,t,i,r,s,2)):o===2&&sC(n,e,t,i,r,s):zl(Hs(n),e,t,i,r,s,1);break}}}function nC(n){let e=n.prev,t=n,i=n.next;if(At(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,p=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=u&&m.x<=d&&m.y>=h&&m.y<=p&&$o(r,a,s,l,o,c,m.x,m.y)&&At(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function iC(n,e,t,i){let r=n.prev,s=n,o=n.next;if(At(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,p=a<l?a<c?a:c:l<c?l:c,m=u<h?u<d?u:d:h<d?h:d,x=a>l?a>c?a:c:l>c?l:c,g=u>h?u>d?u:d:h>d?h:d,f=g0(p,m,e,t,i),v=g0(x,g,e,t,i),y=n.prevZ,M=n.nextZ;for(;y&&y.z>=f&&M&&M.z<=v;){if(y.x>=p&&y.x<=x&&y.y>=m&&y.y<=g&&y!==r&&y!==o&&$o(a,u,l,h,c,d,y.x,y.y)&&At(y.prev,y,y.next)>=0||(y=y.prevZ,M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&$o(a,u,l,h,c,d,M.x,M.y)&&At(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;y&&y.z>=f;){if(y.x>=p&&y.x<=x&&y.y>=m&&y.y<=g&&y!==r&&y!==o&&$o(a,u,l,h,c,d,y.x,y.y)&&At(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;M&&M.z<=v;){if(M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&$o(a,u,l,h,c,d,M.x,M.y)&&At(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function rC(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!Ph(r,s)&&W1(r,i,i.next,s)&&Ol(r,s)&&Ol(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),Fl(i),Fl(i.next),i=n=s),i=i.next}while(i!==n);return Hs(i)}function sC(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&pC(o,a)){let l=X1(o,a);o=Hs(o,o.next),l=Hs(l,l.next),zl(o,e,t,i,r,s,0),zl(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function oC(n,e,t,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=G1(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(dC(c));for(r.sort(aC),s=0;s<r.length;s++)t=lC(r[s],t);return t}function aC(n,e){return n.x-e.x}function lC(n,e){let t=cC(n,e);if(!t)return e;let i=X1(t,n);return Hs(i,i.next),Hs(t,t.next)}function cC(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>i&&(i=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&$o(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),Ol(t,n)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&uC(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function uC(n,e){return At(n.prev,n,e.prev)<0&&At(e.next,n,n.next)<0}function hC(n,e,t,i){let r=n;do r.z===0&&(r.z=g0(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,fC(r)}function fC(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function g0(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function dC(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function $o(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function pC(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!mC(n,e)&&(Ol(n,e)&&Ol(e,n)&&gC(n,e)&&(At(n.prev,n,e.prev)||At(n,e.prev,e))||Ph(n,e)&&At(n.prev,n,n.next)>0&&At(e.prev,e,e.next)>0)}function At(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Ph(n,e){return n.x===e.x&&n.y===e.y}function W1(n,e,t,i){let r=Yu(At(n,e,t)),s=Yu(At(n,e,i)),o=Yu(At(t,i,n)),a=Yu(At(t,i,e));return!!(r!==s&&o!==a||r===0&&Xu(n,t,e)||s===0&&Xu(n,i,e)||o===0&&Xu(t,n,i)||a===0&&Xu(t,e,i))}function Xu(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Yu(n){return n>0?1:n<0?-1:0}function mC(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&W1(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Ol(n,e){return At(n.prev,n,n.next)<0?At(n,e,n.next)>=0&&At(n,n.prev,e)>=0:At(n,e,n.prev)<0||At(n,n.next,e)<0}function gC(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function X1(n,e){let t=new y0(n.i,n.x,n.y),i=new y0(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function m1(n,e,t,i){let r=new y0(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Fl(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function y0(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function yC(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var Rl=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];g1(e),y1(i,e);let o=e.length;t.forEach(g1);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,y1(i,t[l]);let a=tC.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function g1(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function y1(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Bl=class n extends m0{constructor(e=1,t=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var bh=class n extends Qt{constructor(e=new Ul([new pe(0,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new ct(r,3)),this.setAttribute("normal",new ct(s,3)),this.setAttribute("uv",new ct(o,2));function c(u){let h=r.length/3,d=u.extractPoints(t),p=d.shape,m=d.holes;Rl.isClockWise(p)===!1&&(p=p.reverse());for(let g=0,f=m.length;g<f;g++){let v=m[g];Rl.isClockWise(v)===!0&&(m[g]=v.reverse())}let x=Rl.triangulateShape(p,m);for(let g=0,f=m.length;g<f;g++){let v=m[g];p=p.concat(v)}for(let g=0,f=p.length;g<f;g++){let v=p[g];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let g=0,f=x.length;g<f;g++){let v=x[g],y=v[0]+h,M=v[1]+h,R=v[2]+h;i.push(y,M,R),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return vC(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function vC(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var Dn=class n extends Qt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new I,d=new I,p=[],m=[],x=[],g=[];for(let f=0;f<=i;f++){let v=[],y=f/i,M=0;f===0&&o===0?M=.5/t:f===i&&l===Math.PI&&(M=-.5/t);for(let R=0;R<=t;R++){let T=R/t;h.x=-e*Math.cos(r+T*s)*Math.sin(o+y*a),h.y=e*Math.cos(o+y*a),h.z=e*Math.sin(r+T*s)*Math.sin(o+y*a),m.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),g.push(T+M,1-y),v.push(c++)}u.push(v)}for(let f=0;f<i;f++)for(let v=0;v<t;v++){let y=u[f][v+1],M=u[f][v],R=u[f+1][v],T=u[f+1][v+1];(f!==0||o>0)&&p.push(y,M,T),(f!==i-1||l<Math.PI)&&p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new ct(m,3)),this.setAttribute("normal",new ct(x,3)),this.setAttribute("uv",new ct(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ui=class extends is{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=L1,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function qu(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function xC(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var la=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break t}o=t.length;break n}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},v0=class extends la{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:v_,endingEnd:v_}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case x_:s=e,a=2*t-i;break;case __:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case x_:o=e,l=2*i-t;break;case __:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(i-t)/(r-t),x=m*m,g=x*m,f=-d*g+2*d*x-d*m,v=(1+d)*g+(-1.5-2*d)*x+(-.5+d)*m+1,y=(-1-p)*g+(1.5+p)*x+.5*m,M=p*g-p*x;for(let R=0;R!==a;++R)s[R]=f*o[u+R]+v*o[c+R]+y*o[l+R]+M*o[h+R];return s}},x0=class extends la{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},_0=class extends la{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ri=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=qu(t,this.TimeBufferType),this.values=qu(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:qu(e.times,Array),values:qu(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new _0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new x0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new v0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case eh:t=this.InterpolantFactoryMethodDiscrete;break;case Vm:t=this.InterpolantFactoryMethodLinear;break;case wp:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return eh;case this.InterpolantFactoryMethodLinear:return Vm;case this.InterpolantFactoryMethodSmooth:return wp}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&xC(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===wp,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,d=h-i,p=h+i;for(let m=0;m!==i;++m){let x=t[h+m];if(x!==t[d+m]||x!==t[p+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let p=0;p!==i;++p)t[d+p]=t[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ri.prototype.TimeBufferType=Float32Array;Ri.prototype.ValueBufferType=Float32Array;Ri.prototype.DefaultInterpolation=Vm;var Vs=class extends Ri{constructor(e,t,i){super(e,t,i)}};Vs.prototype.ValueTypeName="bool";Vs.prototype.ValueBufferType=Array;Vs.prototype.DefaultInterpolation=eh;Vs.prototype.InterpolantFactoryMethodLinear=void 0;Vs.prototype.InterpolantFactoryMethodSmooth=void 0;var M0=class extends Ri{};M0.prototype.ValueTypeName="color";var S0=class extends Ri{};S0.prototype.ValueTypeName="number";var w0=class extends la{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)Bi.slerpFlat(s,0,o,c-a,o,c,l);return s}},Eh=class extends Ri{InterpolantFactoryMethodLinear(e){return new w0(this.times,this.values,this.getValueSize(),e)}};Eh.prototype.ValueTypeName="quaternion";Eh.prototype.InterpolantFactoryMethodSmooth=void 0;var Gs=class extends Ri{constructor(e,t,i){super(e,t,i)}};Gs.prototype.ValueTypeName="string";Gs.prototype.ValueBufferType=Array;Gs.prototype.DefaultInterpolation=eh;Gs.prototype.InterpolantFactoryMethodLinear=void 0;Gs.prototype.InterpolantFactoryMethodSmooth=void 0;var b0=class extends Ri{};b0.prototype.ValueTypeName="vector";var E0=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let p=c[h],m=c[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null}}},_C=new E0,T0=class{constructor(e){this.manager=e!==void 0?e:_C,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};T0.DEFAULT_MATERIAL_NAME="__DEFAULT";var A0=class extends wn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}};var im=new ot,v1=new I,x1=new I,R0=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Pl,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;v1.setFromMatrixPosition(e.matrixWorld),t.position.copy(v1),x1.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(x1),t.updateMatrixWorld(),im.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(im),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(im)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var C0=class extends R0{constructor(){super(new dh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Th=class extends A0{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(wn.DEFAULT_UP),this.updateMatrix(),this.target=new wn,this.shadow=new C0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var V0="\\[\\]\\.:\\/",MC=new RegExp("["+V0+"]","g"),G0="[^"+V0+"]",SC="[^"+V0.replace("\\.","")+"]",wC=/((?:WC+[\/:])*)/.source.replace("WC",G0),bC=/(WCOD+)?/.source.replace("WCOD",SC),EC=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",G0),TC=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",G0),AC=new RegExp("^"+wC+bC+EC+TC+"$"),RC=["material","materials","bones","map"],P0=class{constructor(e,t,i){let r=i||St.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},St=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(MC,"")}static parseTrackName(e){let t=AC.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);RC.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};St.Composite=P0;St.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};St.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};St.prototype.GetterByBindingType=[St.prototype._getValue_direct,St.prototype._getValue_array,St.prototype._getValue_arrayElement,St.prototype._getValue_toArray];St.prototype.SetterByBindingTypeAndVersioning=[[St.prototype._setValue_direct,St.prototype._setValue_direct_setNeedsUpdate,St.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[St.prototype._setValue_array,St.prototype._setValue_array_setNeedsUpdate,St.prototype._setValue_array_setMatrixWorldNeedsUpdate],[St.prototype._setValue_arrayElement,St.prototype._setValue_arrayElement_setNeedsUpdate,St.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[St.prototype._setValue_fromArray,St.prototype._setValue_fromArray_setNeedsUpdate,St.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var iP=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"169"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="169");var Vl=new I;function hi(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;Vl.copy(e),Vl[i]=0,Vl.normalize();let c=.5*o/(o+a),u=1-Vl.angleTo(n)/l;return Math.sign(Vl[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Un=class extends Vi{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new I,l=new I,c=new I(e,t,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,p=u.length/6,m=new I,x=.5/r;for(let g=0,f=0;g<u.length;g+=3,f+=2)switch(a.fromArray(u,g),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[g+0]=c.x*Math.sign(a.x)+l.x*s,u[g+1]=c.y*Math.sign(a.y)+l.y*s,u[g+2]=c.z*Math.sign(a.z)+l.z*s,h[g+0]=l.x,h[g+1]=l.y,h[g+2]=l.z,Math.floor(g/p)){case 0:m.set(1,0,0),d[f+0]=hi(m,l,"z","y",s,i),d[f+1]=1-hi(m,l,"y","z",s,t);break;case 1:m.set(-1,0,0),d[f+0]=1-hi(m,l,"z","y",s,i),d[f+1]=1-hi(m,l,"y","z",s,t);break;case 2:m.set(0,1,0),d[f+0]=1-hi(m,l,"x","z",s,e),d[f+1]=hi(m,l,"z","x",s,i);break;case 3:m.set(0,-1,0),d[f+0]=1-hi(m,l,"x","z",s,e),d[f+1]=1-hi(m,l,"z","x",s,i);break;case 4:m.set(0,0,1),d[f+0]=1-hi(m,l,"x","y",s,e),d[f+1]=1-hi(m,l,"y","x",s,t);break;case 5:m.set(0,0,-1),d[f+0]=hi(m,l,"x","y",s,e),d[f+1]=1-hi(m,l,"y","x",s,t);break}}};function W0(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Qt,c=0;for(let u=0;u<n.length;++u){let h=n[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;s[p]===void 0&&(s[p]=[]),s[p].push(h.attributes[p]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!r.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.morphAttributes[p])}if(e){let p;if(t)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(t){let u=0,h=[];for(let d=0;d<n.length;++d){let p=n[d].index;for(let m=0;m<p.count;++m)h.push(p.getX(m)+u);u+=n[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=Y1(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let p=[];for(let x=0;x<o[u].length;++x)p.push(o[u][x][d]);let m=Y1(p);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function Y1(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){let u=n[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.count*t}let o=new e(s),a=new Dt(o,t,i),l=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let d=0,p=u.count;d<p;d++)for(let m=0;m<t;m++){let x=u.getComponent(d,m);a.setComponent(d+h,m,x)}}else o.set(u.array,l);l+=u.count*t}return r!==void 0&&(a.gpuType=r),a}var Ci=.055,PC=.22,ua=.58,X0=.74,Gl=1.3,q1=.56,j1=.56,$1=2,Z1=new I(-.55,.8,.32).normalize(),Y0=34,fn={x:0,y:0,z:0,yaw:0};function _r(n,e,t){let i=document.createElement("canvas");i.width=n,i.height=e,t(i.getContext("2d"));let r=new Nl(i);return r.colorSpace=jn,r.anisotropy=4,r}function IC(n,e){let t=n.hx+e,i=n.hz+e,r=n.hy+e,s=n.hy+n.rise+e,o=Math.min(r,s)-n.hy*2-e*2,a={nbl:[-t,o,i],nbr:[t,o,i],ntl:[-t,r,i],ntr:[t,r,i],fbl:[-t,o,-i],fbr:[t,o,-i],ftl:[-t,s,-i],ftr:[t,s,-i]},l=[[a.ntl,a.ntr,a.ftr,a.ftl],[a.nbl,a.nbr,a.ntr,a.ntl],[a.fbr,a.fbl,a.ftl,a.ftr],[a.fbl,a.nbl,a.ntl,a.ftl],[a.nbr,a.fbr,a.ftr,a.ntr],[a.fbl,a.fbr,a.nbr,a.nbl]],c=[];for(let[h,d,p,m]of l)c.push(...h,...d,...p,...h,...p,...m);let u=new Qt;return u.setAttribute("position",new ct(c,3)),u.setAttribute("uv",new ct(new Array(c.length/3*2).fill(0),2)),u.computeVertexNormals(),u}function Ih(n,e){let t;if(n.shape==="cyl")n.look==="mochi"?(t=new Dn(1,28,14),t.scale(n.hx+e,.5+e,n.hx+e),t.translate(0,-n.hy,0)):t=new en(n.hx+e,n.hx+e,(n.hy+e)*2,36);else if(n.shape==="ramp")t=IC(n,e);else{let i=Math.min(.2,n.hx*.9,n.hy*.9,n.hz*.9);t=new Un((n.hx+e)*2,(n.hy+e)*2,(n.hz+e)*2,3,i+e)}return t.index?t.toNonIndexed():t}function K1(n,e,t=!1){let i=new ke(e),r=n.getAttribute("position"),s=n.getAttribute("normal"),o=r.count,a=new Float32Array(o*3),l=new Float32Array(o*2);for(let c=0;c<o;c++)a[c*3]=i.r,a[c*3+1]=i.g,a[c*3+2]=i.b,t&&s.getY(c)>.5?(l[c*2]=r.getX(c)/($1*2),l[c*2+1]=r.getZ(c)/($1*2)):l[c*2]=l[c*2+1]=.25;n.setAttribute("color",new Dt(a,3)),n.setAttribute("uv",new Dt(l,2))}function J1(n,e,t){let i=new Vi((n.hx-.12+t)*2,e+t,(n.hz-.12+t)*2,1,1,1).toNonIndexed(),r=i.getAttribute("position"),s=Math.min(.55,n.hx*.3,n.hz*.3);for(let o=0;o<r.count;o++)r.getY(o)>0||(r.setX(o,r.getX(o)-Math.sign(r.getX(o))*s),r.setZ(o,r.getZ(o)-Math.sign(r.getZ(o))*s));return i.translate(0,-n.hy-e/2,0),i.computeVertexNormals(),i}function LC(n,e,t){let i=s=>s.yaw||s.motion?Math.hypot(s.hx,s.shape==="cyl"?s.hx:s.hz)+(s.motion?6:0):0,r=i(e);for(let s of n.solids){if(s===e)continue;let o=i(s),a=o||s.hx,l=o||(s.shape==="cyl"?s.hx:s.hz);if(Math.abs(s.x-e.x)>(r||e.hx)+a||Math.abs(s.z-e.z)>(r||e.hz)+l)continue;let c=s.y+s.hy+Math.max(0,s.rise)+(s.motion?3:0),u=s.y-s.hy-(s.motion?3:0);if(c>e.y-e.hy-t-.2&&u<e.y-e.hy-.05)return!0}return!1}function Q1(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var kC=new I(0,1,0),Wi=new I,q0=new Bi,j0=new I,NC=new ot,DC=new I,Lh=class{constructor(e,t){this.level=t;this.scene=new Il;this.camera=new Sn(62,1,1.2,500);this.materials=new Map;this.ink=new bn({color:Xt,side:Jt});this.sun=new Th(16774114,1.4);this.racerParts=null;this.size={width:1,height:1,dpr:1};this.economy=0;this.frameMs=16;this.frameAt=0;this.settled=0;this.movers=[];this.ballViews=[];this.windViews=[];this.belts=[];this.spinners=[];this.racers=new Map;this.disposables=[];this.camPos=new I;this.camLook=new I;this.camReady=!1;this.portrait=!0;this.shake=0;this.renderer=new mh({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.font=typeof getComputedStyle=="function"&&getComputedStyle(document.body).fontFamily||"sans-serif";let i=t.theme;this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=I0,this.scene.background=new ke(i.fog),this.scene.fog=new gh(i.fog,70,210);let r=this.sun.shadow;r.mapSize.set(2048,2048),r.camera.left=r.camera.bottom=-Y0,r.camera.right=r.camera.top=Y0,r.camera.near=10,r.camera.far=170,r.bias=-4e-4,r.normalBias=.035,this.sun.castShadow=!0,this.scene.add(this.sun,this.sun.target),this.buildSky(),this.buildStatic(),this.buildMovers(),this.buildBalls(),this.buildWinds(),this.buildMarkers(),this.buildDecor(),this.buildClouds()}keep(e){return this.disposables.push(e),e}gloss(e,t={}){let i=e+(t.map?t.map.uuid:"")+(t.transparent?"t":""),r=this.materials.get(i);return r||(r=new ui({color:e,roughness:.32,metalness:0,map:t.map??null,transparent:!!t.transparent}),this.materials.set(i,r),this.keep(r)),r}decal(e){return this.keep(new ui({map:e,transparent:!0,depthWrite:!1,roughness:.6,metalness:0}))}solid(e){return e.castShadow=!0,e.receiveShadow=!0,e}buildSky(){let e=this.level.theme,t=new ke(e.fog),i=new ke(e.sky[0]),r=i.clone().offsetHSL(0,.35,-.2),s=new ke(e.floorAlt).lerp(t,.35),o=(m,x)=>{let g=new Dn(m,32,24),f=g.getAttribute("position"),v=new Float32Array(f.count*3),y=new ke;for(let M=0;M<f.count;M++){let R=f.getY(M)/m;R>=0?(R<.1?y.copy(t).lerp(i,R/.1):y.copy(i).lerp(r,Math.min(1,(R-.1)/.45)),x&&y.lerp(new ke(1,1,1),.82)):(y.copy(t).lerp(s,Math.min(1,-R/.5)),x&&y.lerp(new ke(1,1,1),.6).multiplyScalar(.9)),v[M*3]=y.r,v[M*3+1]=y.g,v[M*3+2]=y.b}return g.setAttribute("color",new Dt(v,3)),g},a=this.keep(new bn({vertexColors:!0,side:Jt,fog:!1,depthWrite:!1}));this.sky=new Ce(this.keep(o(450,!1)),a),this.sky.renderOrder=-10,this.sky.frustumCulled=!1,this.scene.add(this.sky);let l=new oa(this.renderer),c=new Il,u=o(20,!0);c.add(new Ce(u,a));let h=l.fromScene(c,.03);this.keep(h),this.scene.environment=h.texture,this.scene.environmentIntensity=.92,u.dispose(),l.dispose();let d=_r(128,128,m=>{let x=m.createRadialGradient(64,64,0,64,64,64);x.addColorStop(0,"rgba(255,255,255,1)"),x.addColorStop(.18,"rgba(255,250,225,0.9)"),x.addColorStop(.45,"rgba(255,244,205,0.28)"),x.addColorStop(1,"rgba(255,244,205,0)"),m.fillStyle=x,m.fillRect(0,0,128,128)});this.keep(d);let p=new aa(this.keep(new Fs({map:d,transparent:!0,depthWrite:!1,fog:!1})));p.position.copy(Z1).multiplyScalar(400),p.scale.setScalar(170),p.renderOrder=-9,this.sky.add(p)}buildClouds(){let e=Q1(this.level.id.length*131+this.level.solids.length),t=this.level.finish.z,i=this.level.killY,r=[],s=(l,c,u,h)=>{let d=4+Math.floor(e()*4);for(let p=0;p<d;p++){let m=(p/(d-1)-.5)*h*2.6,x=h*(.62+e()*.5)*(1-Math.abs(p/(d-1)-.5)*.7);r.push(l+m,c+(e()-.35)*h*.5,u+(e()-.5)*h*1.3,x)}};for(let l=40;l>t-150;l-=13+e()*9)s((e()-.5)*150,i-5-e()*7,l,4+e()*5),s((e()<.5?-1:1)*(18+e()*70),i-3-e()*6,l-6,4+e()*6);for(let l=20;l>t-120;l-=24+e()*16)for(let c of[-1,1])s(c*(42+e()*60),-2+e()*26,l+e()*12,4.5+e()*5);for(let l=0;l<12;l++)s((e()-.5)*330,4+e()*55,t-95-e()*90,9+e()*10);let o=r.length/4,a=new vh(this.keep(new Dn(1,18,12)),this.keep(new ui({color:se,roughness:1,metalness:0,emissive:se,emissiveIntensity:.16})),o);for(let l=0;l<o;l++){let c=r[l*4+3];Wi.set(r[l*4],r[l*4+1],r[l*4+2]),a.setMatrixAt(l,NC.compose(Wi,q0.identity(),DC.set(c,c*.62,c)))}a.instanceMatrix.needsUpdate=!0,a.frustumCulled=!1,this.keep(a),this.scene.add(a)}buildStatic(){let e=[],t=[],i=new ot,r=new ke;for(let o of this.level.solids){if(o.motion||o.active)continue;i.makeRotationY(o.yaw).setPosition(o.x,o.y,o.z);let a=Ih(o,0).applyMatrix4(i),l=o.look==="floor"||o.look==="finish";if(K1(a,o.color,l),e.push(a),t.push(Ih(o,Ci).applyMatrix4(i)),l&&o.shape==="box"&&Math.min(o.hx,o.hz)>=1.4){let c=Math.min(2.6,.9+Math.min(o.hx,o.hz)*.35);if(!LC(this.level,o,c)){let u=J1(o,c,0).applyMatrix4(i);K1(u,"#"+r.set(o.color).lerp(new ke(this.level.theme.accent),.3).multiplyScalar(.84).getHexString()),e.push(u);let h=J1(o,c,Ci).applyMatrix4(i);h.setAttribute("uv",new Dt(new Float32Array(h.getAttribute("position").count*2),2)),t.push(h)}}this.dress(o,this.scene,o.x,o.y,o.z,o.yaw)}if(e.length){let o=_r(128,128,l=>{l.fillStyle="#ffffff",l.fillRect(0,0,128,128),l.fillStyle="#ebe8f3",l.fillRect(64,0,64,64),l.fillRect(0,64,64,64)});o.wrapS=o.wrapT=Us,o.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),this.keep(o);let a=this.keep(new ui({vertexColors:!0,map:o,roughness:.46,metalness:0}));this.scene.add(this.solid(new Ce(this.keep(W0(e)),a))),this.scene.add(new Ce(this.keep(W0(t)),this.ink));for(let l of[...e,...t])l.dispose()}let s=new Ce(this.keep(new Bs(420,40)),this.keep(new bn({color:this.level.theme.fog})));s.rotation.x=-Math.PI/2,s.position.set(0,this.level.killY-6,-80),this.scene.add(s)}dress(e,t,i,r,s,o){let a=r+e.hy+.015,l=(c,u=0)=>(c.position.set(i,a,s),c.rotation.order="YXZ",c.rotation.set(-Math.PI/2,o+u,0),c.renderOrder=1,c.receiveShadow=!0,t.add(c),c);if(e.surface?.conveyor){let[c,u]=e.surface.conveyor,h=Math.hypot(c,u),d=Math.abs(c)>Math.abs(u),p=(d?e.hz:e.hx)*2-.5,m=(d?e.hx:e.hz)*2-.3,x=_r(64,64,f=>{f.strokeStyle="rgba(29,27,79,0.28)",f.lineWidth=9,f.lineCap="round",f.lineJoin="round",f.beginPath(),f.moveTo(14,44),f.lineTo(32,22),f.lineTo(50,44),f.stroke()});x.wrapS=x.wrapT=Us,x.repeat.set(Math.max(1,Math.round(p/1.6)),Math.max(1,Math.round(m/1.6))),this.keep(x),this.belts.push({texture:x,speed:h*x.repeat.y/m});let g=new Ce(this.keep(new xr(p,m)),this.decal(x));if(l(g,Math.atan2(-c,-u)),e.shape==="ramp"){let f=Math.atan2(e.rise,e.hz*2);g.position.y=r+e.hy+e.rise/2+.02,g.rotation.x=-Math.PI/2+f,g.scale.y=1/Math.cos(f)}}else if(e.look==="drum"){let c=_r(128,128,u=>{u.fillStyle="#fff8ec",u.beginPath(),u.arc(64,64,60,0,Math.PI*2),u.fill(),u.strokeStyle=Xt,u.lineWidth=5,u.stroke(),u.fillStyle=e.color;for(let h=0;h<3;h++){let d=h/3*Math.PI*2;u.beginPath(),u.arc(64+Math.cos(d)*15,64+Math.sin(d)*15,13,0,Math.PI*2),u.fill()}});this.keep(c),l(new Ce(this.keep(new Bs(e.hx*.92,32)),this.decal(c)))}else if(e.look==="disc"||e.look==="plate"&&e.hx>1.2){let c=e.look==="disc",u=_r(256,256,h=>{if(h.translate(128,128),c)for(let d=0;d<8;d++)h.fillStyle=d%2?"rgba(255,255,255,0.75)":"rgba(29,27,79,0.10)",h.beginPath(),h.moveTo(0,0),h.arc(0,0,120,d/8*Math.PI*2,(d+1)/8*Math.PI*2),h.fill();else h.strokeStyle=We,h.lineWidth=14,h.beginPath(),h.arc(0,0,104,0,Math.PI*2),h.stroke(),h.strokeStyle="rgba(29,27,79,0.12)",h.lineWidth=4,h.beginPath(),h.arc(0,0,70,0,Math.PI*2),h.stroke()});this.keep(u),l(new Ce(this.keep(new Bs(e.hx*.96,36)),this.decal(u)))}else if(e.look==="finish"){let c=_r(64,64,h=>{h.fillStyle=se,h.fillRect(0,0,64,64),h.fillStyle=Xt,h.fillRect(0,0,32,32),h.fillRect(32,32,32,32)});c.wrapS=c.wrapT=Us,c.repeat.set(e.hx,1),c.magFilter=hn,this.keep(c);let u=new Ce(this.keep(new xr(e.hx*2-.4,1.6)),this.keep(new ui({map:c,roughness:.6,metalness:0})));u.position.set(i,a,s+e.hz-1.3),u.rotation.x=-Math.PI/2,u.receiveShadow=!0,t.add(u)}}buildMovers(){for(let e of this.level.solids){if(!e.motion&&!e.active)continue;let t=new Zn,i=!!e.active,r=i?this.keep(new ui({color:e.color,roughness:.42,metalness:0,transparent:!0})):this.gloss(e.color),s=this.solid(new Ce(this.keep(Ih(e,0)),r)),o=new Ce(this.keep(Ih(e,Ci)),this.ink);t.add(s,o),this.dress(e,t,0,0,0,0),t.position.set(e.x,e.y,e.z),t.rotation.y=e.yaw,this.scene.add(t);let a;e.look==="geyser"&&(a=new Ce(this.keep(new en(e.hx*.4,e.hx*.82,3.6,20,1,!0)),this.keep(new bn({color:se,transparent:!0,opacity:.62,depthWrite:!1,side:$n}))),a.position.y=e.hy+1.8,t.add(a)),this.movers.push({solid:e,group:t,body:s,outline:o,timed:i,plume:a})}}buildBalls(){for(let e of this.level.balls){let t=new Zn,i;e.look==="mochi"&&(i=_r(256,128,l=>{l.fillStyle=e.color,l.fillRect(0,0,256,128),l.fillStyle=Xt;for(let c of[108,148])l.beginPath(),l.arc(c,58,5,0,Math.PI*2),l.fill();l.strokeStyle=Xt,l.lineWidth=3,l.beginPath(),l.arc(128,62,8,.15*Math.PI,.85*Math.PI),l.stroke(),l.fillStyle="rgba(255,122,182,0.45)";for(let c of[94,162])l.beginPath(),l.arc(c,68,7,0,Math.PI*2),l.fill()}),this.keep(i));let r=this.keep(new Dn(e.r,28,18)),s=this.solid(new Ce(r,i?this.gloss("#ffffff",{map:i}):this.gloss(e.color))),o=new Ce(this.keep(new Dn(e.r+Ci,20,14)),this.ink);t.add(s,o);let a;if(e.look==="lantern"&&e.anchor){s.scale.set(1,1.12,1),o.scale.set(1,1.12,1);for(let c of[e.r*1.05,-e.r*1.05]){let u=new Ce(this.keep(new en(e.r*.45,e.r*.45,.22,16)),this.gloss(Xt));u.position.y=c,s.add(u)}a=new Ce(this.keep(new en(.05,.05,1,6)),this.keep(new bn({color:Xt}))),this.scene.add(a);let l=new Ce(this.keep(new Vi(11,.35,.35)),this.gloss(this.level.theme.accent));l.position.set(e.anchor.x,e.anchor.y,e.anchor.z),this.scene.add(l)}this.scene.add(t),this.ballViews.push({ball:e,group:t,mesh:s,rope:a,last:new I(NaN,0,0)})}}buildWinds(){let e=Q1(7);for(let t of this.level.winds){let i=this.keep(new bn({color:se,transparent:!0,opacity:.7,depthWrite:!1,side:$n})),r=this.keep(new xr(1.5,.09)),s=Math.max(8,Math.min(26,Math.round((t.x1-t.x0)*(t.z1-t.z0)/7))),o=[],a=[],l=Math.atan2(-t.az,t.ax);for(let c=0;c<s;c++){let u=new Ce(r,i);u.rotation.order="YXZ",u.rotation.set(-Math.PI/2,l,0),a.push(e(),e(),e()),this.scene.add(u),o.push(u)}this.windViews.push({zone:t,streaks:o,seeds:a,material:i})}}buildMarkers(){let e=this.level.theme,t=this.keep(new en(.09,.09,2.6,8)),i=new Ul;i.moveTo(0,0),i.lineTo(1.1,-.38),i.lineTo(0,-.76);let r=this.keep(new bh(i));this.level.checkpoints.forEach((p,m)=>{if(m!==0)for(let x of[-1,1]){let g=p.x+x*(p.width/2+1.1),f=new Ce(t,this.gloss(Xt));f.position.set(g,p.y+1.3,p.z);let v=new Ce(r,this.keep(new bn({color:x<0?e.accent:e.accent2,side:$n})));v.position.set(g,p.y+2.55,p.z),x>0&&(v.scale.x=-1),this.scene.add(f,v)}});let s=this.level.finish,o=s.z+s.hz+1,a=this.keep(new en(.28,.28,5,14)),l=this.keep(new en(.28+Ci,.28+Ci,5+Ci*2,14));for(let p of[-1,1]){let m=new Ce(a,this.gloss(e.accent));m.position.set(s.x+p*(s.hx-.2),s.y+2.5,o),m.add(new Ce(l,this.ink)),this.scene.add(m)}let c=_r(1024,192,p=>{p.fillStyle=Re,p.fillRect(0,0,1024,192),p.fillStyle=Xt,p.font=`900 130px ${this.font}`,p.textAlign="center",p.textBaseline="middle",p.fillText("GOAL!  \u30B4\u30FC\u30EB!",512,104)});this.keep(c);let u=s.hx*2,h=new Ce(this.keep(new Un(u,u*.1875,.3,2,.1)),this.gloss(Re));h.position.set(s.x,s.y+5.2,o),h.add(new Ce(this.keep(new Un(u+Ci*2,u*.1875+Ci*2,.3+Ci*2,2,.1)),this.ink));let d=new Ce(this.keep(new xr(u-.2,u*.1875-.2)),this.keep(new bn({map:c})));d.position.z=.16,h.add(d),this.scene.add(h)}buildDecor(){let e=(i,r,s)=>{let o=new Ce(this.keep(i),this.gloss(r));return o.add(new Ce(this.keep(s),this.ink)),o},t=this.keep(new ui({color:se,roughness:1,metalness:0,emissive:se,emissiveIntensity:.16}));for(let i of this.level.decor){let r=new Zn;r.position.set(i.x,i.y,i.z),r.scale.setScalar(i.s);let s=0,o=0;if(i.kind==="cloud"){for(let[a,l,c]of[[-.9,0,.75],[0,.25,1],[.95,0,.7]]){let u=new Ce(this.keep(new Dn(c,18,12)),t);u.position.set(a,l,0),u.scale.y=.72,r.add(u)}o=.25}else if(i.kind==="lantern"){let a=e(new Dn(.7,16,12),i.color,new Dn(.76,14,10));a.scale.y=1.15,r.add(a);for(let l of[.78,-.78]){let c=new Ce(this.keep(new en(.32,.32,.2,12)),this.gloss(Xt));c.position.y=l,r.add(c)}o=.18}else if(i.kind==="sushi"){let a=e(new en(1.1,.9,.22,24),se,new en(1.16,.96,.3,20)),l=e(new Un(1.2,.5,.7,3,.2),se,new Un(1.3,.6,.8,2,.24));l.position.y=.36;let c=e(new Un(1.4,.28,.8,3,.12),i.color,new Un(1.5,.38,.9,2,.16));c.position.y=.68,r.add(a,l,c),s=.5,o=.2}else if(i.kind==="pinwheel"){let a=new Ce(this.keep(new en(.07,.07,3,8)),this.gloss(Xt));a.position.y=-1.5;let l=new Zn;for(let c=0;c<4;c++){let u=e(new rs(.42,1.1,3),c%2?i.color:se,new rs(.5,1.22,3));u.rotation.z=c/4*Math.PI*2,u.position.set(Math.cos(c/4*Math.PI*2+Math.PI/2)*.55,Math.sin(c/4*Math.PI*2+Math.PI/2)*.55,0),l.add(u)}r.add(a,l),this.spinners.push({obj:l,speed:-3,bob:0,baseY:0}),r.userData.axis="z"}else if(i.kind==="torii"){for(let c of[-4.2,4.2]){let u=e(new en(.3,.34,4.6,12),i.color,new en(.36,.4,4.7,12));u.position.set(c,2.3,0),r.add(u)}let a=e(new Un(11,.5,.6,2,.12),i.color,new Un(11.1,.6,.7,2,.14));a.position.y=4.7;let l=e(new Un(9.2,.36,.45,2,.1),i.color,new Un(9.3,.46,.55,2,.12));l.position.y=3.8,r.add(a,l)}else if(i.kind==="plane"){let a=e(new rs(.5,1.6,3),se,new rs(.58,1.75,3));a.rotation.set(Math.PI/2,0,Math.PI),a.scale.z=.35;let l=new Ce(this.keep(new rs(.2,1.5,3)),this.gloss(i.color));l.rotation.set(Math.PI/2,0,0),l.position.y=-.12,r.add(a,l),r.rotation.y=i.x>0?Math.PI/2:-Math.PI/2,o=.3}else i.kind==="star"&&(r.add(e(new Bl(.7),i.color,new Bl(.8))),s=1.2,o=.3);this.scene.add(r),(s||o)&&this.spinners.push({obj:r,speed:s,bob:o,baseY:i.y})}}addRacer(e,t,i,r){if(this.racers.has(e))return;let s=So(t),o=this.racerParts??={foot:this.keep(new Dn(.17,14,10)),hand:this.keep(new Dn(.125,12,8)),handHull:this.keep(new Dn(.125+Ci*.8,10,8)),shoe:this.keep(new ui({color:Xt,roughness:.5,metalness:0})),glove:this.keep(new ui({color:se,roughness:.35,metalness:0})),unseen:this.keep(new bn({colorWrite:!1,depthWrite:!1}))},a=new Zn,l=new Zn;l.position.y=ua;let c=[-1,1].map(M=>{let R=new Ce(o.hand,o.glove);return R.castShadow=!0,R.position.set(M*q1,j1-ua,0),R.add(new Ce(o.handHull,this.ink)),l.add(R),R}),u=[-1,1].map(M=>{let R=new Ce(o.foot,o.shoe);return R.castShadow=!0,R.scale.set(1,.62,1.45),R.position.set(M*.2,.1,-.04),a.add(R),R}),h=new Ce(o.foot,o.unseen);h.castShadow=!0,h.scale.set(3,3,1.6),h.position.y=X0-ua,l.add(h),a.add(l),a.visible=!1;let d=(M,R)=>{let T=document.createElement("canvas");T.width=T.height=256;let b=T.getContext("2d"),A=new Nl(T);A.colorSpace=jn,this.keep(A),b.fillStyle=s.color,b.strokeStyle=Xt,b.lineWidth=9,b.beginPath(),b.arc(128,128,100,0,Math.PI*2),b.fill(),b.stroke();let L=new Image;L.onload=()=>{b.clearRect(0,0,256,256),b.save(),b.shadowColor=se,b.shadowBlur=0;for(let[S,z]of[[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]])b.shadowOffsetX=S,b.shadowOffsetY=z,b.drawImage(L,14,14,228,228);b.restore(),b.drawImage(L,14,14,228,228),A.needsUpdate=!0};let _=!1;return L.onerror=()=>{!R||_||(_=!0,L.src=R)},L.src=M,A},p=d(sl(t)),m=d(Bx(t),sl(t)),x=new aa(this.keep(new Fs({map:m,transparent:!0,alphaTest:.08})));x.scale.setScalar(Gl),x.visible=!1;let g=r?"\u25BC":i,f=_r(384,96,M=>{if(M.font=`900 ${r?64:44}px ${this.font}`,M.textAlign="center",M.textBaseline="middle",r)M.lineWidth=12,M.lineJoin="round",M.strokeStyle=Xt,M.strokeText(g,192,50),M.fillStyle=Re,M.fillText(g,192,50);else{let R=g.length>10?g.slice(0,9)+"\u2026":g,T=Math.min(360,M.measureText(R).width+44);M.fillStyle=se,M.strokeStyle=Xt,M.lineWidth=6,M.beginPath(),M.roundRect(192-T/2,16,T,64,32),M.fill(),M.stroke(),M.fillStyle=Xt,M.fillText(R,192,50)}});this.keep(f);let v=new aa(this.keep(new Fs({map:f,transparent:!0,depthWrite:!1})));v.scale.set(r?1.5:2.2,r?.375:.55,1),v.visible=!1,v.renderOrder=5;let y=new Ce(this.keep(new Bs(.5,20)),this.keep(new bn({color:Xt,transparent:!0,opacity:.2,depthWrite:!1})));y.rotation.x=-Math.PI/2,y.visible=!1,y.renderOrder=2,this.scene.add(a,x,v,y),this.racers.set(e,{root:a,lean:l,feet:u,hands:c,head:x,front:p,back:m,showsBack:!0,flip:1,tag:v,shadow:y,me:r,phase:Math.random()*6,spin:0,yaw:0,lastX:0,lastY:0,lastZ:0,seen:!1})}removeRacer(e){let t=this.racers.get(e);t&&(this.scene.remove(t.root,t.head,t.tag,t.shadow),this.racers.delete(e))}placeRacer(e,t,i,r,s,o,a,l,c){let u=this.racers.get(e);if(!u)return;if(s===3){u.root.visible=u.head.visible=u.tag.visible=u.shadow.visible=!1,u.seen=!1;return}let h=u.seen&&c>0?(t-u.lastX)/c:0,d=u.seen&&c>0?(i-u.lastY)/c:0,p=u.seen&&c>0?(r-u.lastZ)/c:0,m=!u.seen;u.lastX=t,u.lastY=i,u.lastZ=r,u.seen=!0;let x=Math.hypot(h,p);if(m)u.yaw=0;else if(x>1){let N=Math.atan2(-h,-p)-u.yaw;N-=Math.round(N/(Math.PI*2))*Math.PI*2,u.yaw+=N*(1-Math.exp(-c*12))}let g=0,f=0,v=0,y=1,M=0,R=0,T=0;s===2?(u.spin+=c*13,g=-u.spin,v=.25,R=.3):s===1?(u.spin=0,g=-.5,y=.68,v=o?-.2:-.05,R=1):o?(u.spin=0,x>.6?(u.phase+=c*(6+x*1.3),M=Math.sin(u.phase),f=Math.sin(u.phase)*.09,v=Math.abs(Math.cos(u.phase))*.07):(u.phase+=c*2.4,y=1+Math.sin(u.phase)*.025)):(u.spin=0,y=1+Math.max(-.12,Math.min(.16,d*.014)),R=.75,T=.45,M=Math.sin(u.phase)*.4),u.root.position.set(t,i,r),u.root.rotation.y=u.yaw,u.lean.position.y=ua+v,u.lean.rotation.set(g,0,f),u.feet.forEach((N,F)=>{let X=F?1:-1,O=M*X;s===1?(N.position.set(X*.2,.14+v*.5,.42),N.rotation.x=1.2):(N.position.set(X*.2,.1+Math.max(0,-O)*.13+T*.2,-.04-O*.24+T*.12),N.rotation.x=O*.5+T*.9),N.visible=s!==2}),u.hands.forEach((N,F)=>{let X=F?1:-1,O=-M*X;N.position.set(X*(q1+R*.04),j1-ua+R*.26,-O*.22-R*.16)}),u.root.visible=!0,Wi.set(0,X0-ua,0),u.lean.updateWorldMatrix(!0,!1),Wi.applyMatrix4(u.lean.matrixWorld),u.head.position.copy(Wi),u.head.position.y-=(1-y)*Gl*.4;let b=-Math.sin(u.yaw)*(t-this.camera.position.x)-Math.cos(u.yaw)*(r-this.camera.position.z),A=Math.hypot(t-this.camera.position.x,r-this.camera.position.z)||1,L=Math.abs(b)<A*.2?u.showsBack:b>0;m?(u.showsBack=L,u.flip=1):L!==u.showsBack&&(u.showsBack=L,u.flip=1-u.flip),u.flip=Math.min(1,u.flip+c/PC);let _=(u.flip>=.5?u.showsBack:!u.showsBack)?u.back:u.front;u.head.material.map!==_&&(u.head.material.map=_);let S=Math.max(.06,Math.abs(Math.cos(u.flip*Math.PI)));u.head.scale.set(Gl/Math.sqrt(y)*S,Gl*y,1),u.head.material.rotation=s===2?u.spin:f*.8,u.head.visible=!0,u.head.material.opacity=a>.3&&Math.floor(l*12)%2===0?.45:1,u.tag.position.set(t,i+X0+Gl*.6+v+(u.me?.1+Math.sin(l*5)*.08:.12),r),u.tag.visible=!0;let z=xp(this.level,t,i,r,l);if(z>-1/0){let N=Math.max(0,i-z),F=Math.max(.35,1-N*.12);u.shadow.position.set(t,z+.03,r),u.shadow.scale.setScalar(F),u.shadow.material.opacity=.2*F,u.shadow.visible=!0}else u.shadow.visible=!1}bump(e=.35){this.shake=Math.max(this.shake,e)}resize(e,t,i){this.size={width:e,height:t,dpr:i},this.renderer.setPixelRatio(Math.min(this.economy?1.25:2,i)),this.renderer.setSize(e,t,!1),this.portrait=t>e,this.camera.aspect=e/Math.max(1,t),this.camera.fov=this.portrait?72:58,this.camera.updateProjectionMatrix()}render(e,t,i,r){for(let m of this.movers){let x=m.solid;if(or(x,e,fn),m.group.position.set(fn.x,fn.y,fn.z),m.group.rotation.y=fn.yaw,m.timed){let g=x.active(e),f=m.body.material;m.plume?(m.outline.visible=!0,f.opacity=g===0?.7:1,m.plume.visible=g!==0,m.plume.scale.set(1,(g===1?.6:.92)+.08*Math.sin(e*23),1),m.plume.position.y=x.hy+1.8*m.plume.scale.y):(m.outline.visible=g!==0,m.body.castShadow=g!==0,f.opacity=g===0?.13:g===1&&Math.floor(e*9)%2===0?.5:1,f.depthWrite=g!==0,m.group.position.y=fn.y-(g===0?.25:0))}}for(let m of this.ballViews){let x=m.ball,g=!x.active||x.active(e);if(m.group.visible=g,m.rope&&(m.rope.visible=g),!!g){if(x.pos(e,fn),Wi.set(fn.x,fn.y,fn.z),x.look!=="lantern"){if(!Number.isNaN(m.last.x)){let f=Wi.x-m.last.x,v=Wi.z-m.last.z,y=Math.hypot(f,v);y>1e-5&&y<2&&(j0.set(v/y,0,-f/y),q0.setFromAxisAngle(j0,y/x.r),m.mesh.quaternion.premultiply(q0))}}else if(x.anchor&&m.rope){let f=x.anchor.x-fn.x,v=x.anchor.y-fn.y,y=Math.hypot(f,v);m.rope.position.set((x.anchor.x+fn.x)/2,(x.anchor.y+fn.y)/2,fn.z),m.rope.scale.set(1,y,1),m.rope.quaternion.setFromUnitVectors(kC,j0.set(f/y,v/y,0)),m.group.rotation.z=fn.yaw}m.last.copy(Wi),m.group.position.copy(Wi)}}for(let m of this.windViews){let x=m.zone,g=x.pulse?x.pulse(e):1;m.material.opacity=.75*g;let f=x.x1-x.x0,v=x.z1-x.z0,y=Math.hypot(x.ax,x.az)*1.6,M=x.ax/(Math.hypot(x.ax,x.az)||1),R=x.az/(Math.hypot(x.ax,x.az)||1);m.streaks.forEach((T,b)=>{let A=m.seeds[b*3],L=m.seeds[b*3+1],_=m.seeds[b*3+2],S=e*y*(.7+_*.6),z=x.x0+((A*f+M*S)%f+f)%f,N=x.z0+((L*v+R*S)%v+v)%v,F=xp(this.level,z,50,N,e);T.position.set(z,(F>-1/0?F:x.y0+2)+.35+_*1.7,N),T.visible=g>.05})}for(let m of this.belts)m.texture.offset.y=m.speed*e%1;for(let m of this.spinners)m.speed&&(m.obj.parent?.userData.axis==="z"?m.obj.rotation.z=e*m.speed:m.obj.rotation.y=e*m.speed),m.bob&&(m.obj.position.y=m.baseY+Math.sin(e*.9+m.obj.position.z)*m.bob);let s=this.portrait?9.6:8.6,o=this.portrait?5.5:4.6,a=r*r*(3-2*r)*Math.PI,l=i.x*.82+Math.sin(a)*s,c=i.z+Math.cos(a)*s,u=i.y+o-r*2.2;this.camReady||(this.camPos.set(l,u,c),this.camLook.set(i.x*.9,i.y+1,i.z-3.5),this.camReady=!0);let h=1-Math.exp(-t*9),d=1-Math.exp(-t*3.2);this.camPos.x+=(l-this.camPos.x)*h,this.camPos.z+=(c-this.camPos.z)*h,this.camPos.y+=(u-this.camPos.y)*d;let p=4.5*(1-r);this.camLook.x+=(i.x*.9-this.camLook.x)*h,this.camLook.z+=(i.z-p-this.camLook.z)*h,this.camLook.y+=(i.y+1-this.camLook.y)*d,this.camera.position.copy(this.camPos),this.shake>.001&&(this.camera.position.x+=Math.sin(e*71)*this.shake,this.camera.position.y+=Math.cos(e*83)*this.shake*.7,this.shake*=Math.exp(-t*9)),this.camera.lookAt(this.camLook),this.sky.position.copy(this.camera.position),this.sun.target.position.set(i.x*.6,i.y,i.z-Y0*.45),this.sun.position.copy(this.sun.target.position).addScaledVector(Z1,80),this.sun.target.updateMatrixWorld(),this.renderer.render(this.scene,this.camera),this.pace()}pace(){let e=performance.now(),t=e-this.frameAt;this.frameAt=e,!(this.economy>=2||t<=0||t>100)&&(this.frameMs+=(t-this.frameMs)*.05,!(++this.settled<150)&&(this.frameMs<27||(this.economy++,this.settled=0,this.frameMs=16,this.economy===1?this.resize(this.size.width,this.size.height,this.size.dpr):this.sun.castShadow=!1)))}cut(){this.camReady=!1}dispose(){for(let e of this.disposables)e.dispose();this.ink.dispose(),this.sun.shadow.dispose(),this.renderer.dispose()}};var Xi=null,eM="enchatto_dash_muted",kh=(()=>{try{return localStorage.getItem(eM)==="1"}catch{return!1}})();function tM(){return kh}function ha(){try{if(!Xi){let n=window.AudioContext??window.webkitAudioContext;if(!n)return;Xi=new n}Xi.state==="suspended"&&Xi.resume()}catch{}En?.paused&&Nh()}function nM(n){kh=n;try{localStorage.setItem(eM,n?"1":"0")}catch{}En&&(En.muted=n),n||Nh()}var UC=.4,En=null,$0=new Map,Wl=null,zC=n=>`/music/${n}.mp3`;function iM(n){let e=$0.get(n);return e||(e=fetch(zC(n)).then(t=>t.ok?t.blob():null).then(t=>t?URL.createObjectURL(t):null).catch(()=>($0.delete(n),null)),$0.set(n,e)),e}function rM(n){iM(n)}function Nh(){!En||!Wl||kh||document.hidden||(En.muted=kh,En.play().catch(()=>{}))}async function sM(n){if(Wl===n)return;Wl=n;let e=await iM(n);!e||Wl!==n||(En||(En=new Audio,En.loop=!0,En.volume=UC,document.addEventListener("visibilitychange",()=>{document.hidden?En?.pause():Nh()})),En.src!==e&&(En.src=e),En.currentTime=0,Nh())}function oM(){Wl=null,En?.pause()}function Kn(n,e,t,i,r,s=0){if(!Xi||Xi.state!=="running")return;let o=Xi.currentTime+s,a=Xi.createOscillator(),l=Xi.createGain();a.type=i,a.frequency.setValueAtTime(n,o),a.frequency.exponentialRampToValueAtTime(Math.max(30,e),o+t),l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(r,o+.012),l.gain.exponentialRampToValueAtTime(1e-4,o+t),a.connect(l).connect(Xi.destination),a.start(o),a.stop(o+t+.03)}var Pi={jump:()=>Kn(330,620,.16,"square",.05),dive:()=>Kn(520,260,.2,"sawtooth",.04),land:()=>Kn(160,90,.08,"sine",.08),bounce:()=>{Kn(180,90,.22,"sine",.16),Kn(420,880,.2,"triangle",.06)},hit:()=>{Kn(240,70,.26,"sawtooth",.08),Kn(90,50,.2,"square",.06)},fall:()=>Kn(700,110,.5,"triangle",.07),checkpoint:()=>{Kn(660,660,.09,"triangle",.07),Kn(990,990,.16,"triangle",.07,.09)},finish:()=>[523,659,784,1047].forEach((n,e)=>Kn(n,n,.22,"triangle",.09,e*.11)),count:()=>Kn(440,440,.14,"square",.05),go:()=>Kn(880,880,.4,"square",.06)};var OC=.42,Dh=n=>Math.round(n*100)/100,Uh=class{constructor(e){this.opts=e;this.input={mx:0,mz:0,jump:!1,dive:!1};this.me=null;this.prev={x:0,y:0,z:0};this.simT=0;this.raf=0;this.last=0;this.lastSend=0;this.lastHud=0;this.lastCount=99;this.musicOn=!1;this.finishedAt=-1;this.remote=new Map;this.slots=new Map;this.keys=new Set;this.stick={x:0,y:0};this.disposed=!1;this.focus={x:0,y:0,z:0};this.scratch={x:0,y:0,z:0};this.onKeyDown=e=>{if(e.repeat)return;let t=e.target?.tagName;t==="INPUT"||t==="TEXTAREA"||(this.keys.add(e.code),(e.code==="Space"||e.code.startsWith("Arrow"))&&e.preventDefault(),ha())};this.onKeyUp=e=>this.keys.delete(e.code);this.onBlur=()=>{this.keys.clear(),this.stick.x=this.stick.y=0};this.frame=e=>{if(this.disposed)return;this.raf=requestAnimationFrame(this.frame);let t=Math.min(.1,Math.max(0,(e-this.last)/1e3));this.last=e;let i=this.opts.raceTime(),r=this.level,s=this.me,o=i<0?Math.ceil(-i):0;if(o!==this.lastCount&&(o>=1&&o<=3?Pi.count():o===0&&this.lastCount===1&&Pi.go(),this.lastCount=o),i>=0&&!this.musicOn&&(this.musicOn=!0,sM(this.level.id)),s){if(this.readInput(),i<=0)this.simT=0;else{i-this.simT>.5&&(this.simT=i-Eo);let v=0;for(;this.simT+Eo<=i&&v<8;){this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z,e_(r,s,this.input,this.simT,Eo),this.simT+=Eo,v++;let y=s.events;y&&(y&1&&Pi.jump(),y&128&&Pi.dive(),y&2&&Pi.land(),y&16&&Pi.bounce(),y&32&&Pi.checkpoint(),y&4&&(Pi.hit(),this.scene.bump(.3),navigator.userActivation?.hasBeenActive&&navigator.vibrate?.(40)),y&8&&Pi.fall(),y&64&&this.finishedAt<0&&(this.finishedAt=this.simT,Pi.finish(),this.opts.onFinish?.(this.simT))),s.mode===0&&Math.abs(s.z-this.prev.z)+Math.abs(s.x-this.prev.x)>3&&(this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z)}}let m=i<=0?1:Math.max(0,Math.min(1,(i-this.simT)/Eo)),x=this.prev.x+(s.x-this.prev.x)*m,g=this.prev.y+(s.y-this.prev.y)*m,f=this.prev.z+(s.z-this.prev.z)*m;this.scene.placeRacer(this.opts.meId,x,g,f,s.mode,s.grounded,s.shield,i,t),s.mode!==3&&(this.focus.x=x,this.focus.y=g,this.focus.z=f),i>0&&e-this.lastSend>=(this.opts.sendEvery??200)&&(this.finishedAt<0||this.simT-this.finishedAt<2)&&(this.lastSend=e,this.opts.onSend?.({x:Dh(s.x),y:Dh(s.y),z:Dh(s.z),m:s.mode,g:s.grounded,p:s.mode===4?1:Math.round(_p(r,s.x,s.y,s.z)*1e3)/1e3,rt:Dh(this.simT)}))}let a=i-OC,l={},c=null,u=-1;for(let m of this.opts.racers){if(m.id===this.opts.meId&&s){l[m.id]=s.mode===4?1:_p(r,s.x,s.y,s.z);continue}let x=this.remote.get(m.id);if(!x||x.length===0||i<=0){To(r,0,this.slots.get(m.id)??0,this.opts.racers.length,this.scratch),this.scene.placeRacer(m.id,this.scratch.x,this.scratch.y,this.scratch.z,0,!0,0,i,t),l[m.id]=0;continue}let g=x.length-1;for(;g>0&&x[g-1].rt>a;)g--;let f=x[g],v=g>0?x[g-1]:f,y=f.rt>v.rt?(a-v.rt)/(f.rt-v.rt):1;y=Math.max(0,Math.min(1,y)),(Math.abs(f.z-v.z)+Math.abs(f.x-v.x)>9||v.m===3)&&(y=y<.5?0:1);let R=v.x+(f.x-v.x)*y,T=v.y+(f.y-v.y)*y,b=v.z+(f.z-v.z)*y,A=x[x.length-1];this.scene.placeRacer(m.id,R,T,b,y<.5?v.m:f.m,y<.5?v.g:f.g,0,i,t),l[m.id]=A.p,A.m!==4&&A.p>u&&(u=A.p,c=m.id,this.scratch.x=R,this.scratch.y=T,this.scratch.z=b)}let h=null,d=!!s&&s.mode===4&&this.simT-this.finishedAt>2.5;(!s||d)&&c?(h=c,this.focus.x=this.scratch.x,this.focus.y=this.scratch.y,this.focus.z=this.scratch.z):!s&&!c&&To(r,0,0,1,this.focus);let p=i<0?Math.max(0,Math.min(1,-i/2.6)):0;if(this.scene.render(i,t,this.focus,p),this.opts.onHud&&e-this.lastHud>120){this.lastHud=e;let m=this.opts.meId?l[this.opts.meId]??0:0,x=1;for(let g of this.opts.racers)g.id!==this.opts.meId&&(l[g.id]??0)>m&&x++;this.opts.onHud({t:i,place:x,racing:this.opts.racers.length,progress:l,finished:!!s&&s.mode===4,checkpoint:s?.checkpoint??0,falls:s?.falls??0,watching:h})}};this.level=vu(e.levelIndex),this.scene=new Lh(e.canvas,this.level),e.racers.forEach((t,i)=>{this.slots.set(t.id,i),this.scene.addRacer(t.id,t.avatar,t.name,t.id===e.meId)}),e.meId&&this.slots.has(e.meId)&&(this.me=Qx(this.level,this.slots.get(e.meId),e.racers.length),e.startCheckpoint&&(this.me.checkpoint=Math.max(0,Math.min(this.level.checkpoints.length-1,e.startCheckpoint)),To(this.level,this.me.checkpoint,this.me.slot,this.me.slots,this.me)),this.prev.x=this.me.x,this.prev.y=this.me.y,this.prev.z=this.me.z),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),window.addEventListener("blur",this.onBlur),rM(this.level.id),this.resize(),this.last=performance.now(),this.raf=requestAnimationFrame(this.frame)}resize(){let e=this.opts.canvas,t=e.clientWidth||window.innerWidth,i=e.clientHeight||window.innerHeight;this.scene.resize(t,i,window.devicePixelRatio||1)}setStick(e,t){this.stick.x=e,this.stick.y=t}press(e,t){this.keys[t?"add":"delete"](e==="jump"?"Touch:jump":"Touch:dive")}setRemote(e,t){if(e===this.opts.meId)return;let i=this.remote.get(e);i||this.remote.set(e,i=[]);let r=i[i.length-1];r&&t.rt<=r.rt||(i.push(t),i.length>8&&i.shift())}readInput(){let e=this.keys,t=this.stick.x,i=this.stick.y;(e.has("ArrowLeft")||e.has("KeyA"))&&(t-=1),(e.has("ArrowRight")||e.has("KeyD"))&&(t+=1),(e.has("ArrowUp")||e.has("KeyW"))&&(i-=1),(e.has("ArrowDown")||e.has("KeyS"))&&(i+=1);let r=Math.hypot(t,i);r>1&&(t/=r,i/=r),this.input.mx=t,this.input.mz=i,this.input.jump=e.has("Space")||e.has("Touch:jump"),this.input.dive=e.has("ShiftLeft")||e.has("ShiftRight")||e.has("KeyE")||e.has("Touch:dive")}dispose(){this.disposed=!0,cancelAnimationFrame(this.raf),window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),window.removeEventListener("blur",this.onBlur),oM(),this.scene.dispose()}};var Ae=pn(Xn()),aM="enchatto_dash_cp_";function FC(n){if(!n)return 0;try{return Number(sessionStorage.getItem(aM+n)??0)||0}catch{return 0}}var BC={t:-99,place:1,racing:1,progress:{},finished:!1,checkpoint:0,falls:0,watching:null};function Z0(n){let{levelIndex:e,racers:t,meId:i,coarse:r,lang:s}=n,o=ll(s),a=(0,Lt.useRef)(null),l=(0,Lt.useRef)(null),c=(0,Lt.useRef)(null),u=(0,Lt.useRef)(n);u.current=n;let[h,d]=(0,Lt.useState)(()=>({...BC,t:n.raceTime()})),[p,m]=(0,Lt.useState)(!1),[x,g]=(0,Lt.useState)({}),[f,v]=(0,Lt.useState)(!!(r&&i)),y=(0,Lt.useRef)(!!(r&&i)),[M,R]=(0,Lt.useState)(!1),[T,b]=(0,Lt.useState)(!1);(0,Lt.useEffect)(()=>b(tM()),[]);let A=Y=>{let ae=!T;nM(ae),b(ae),Y.currentTarget.blur()},L=t.map(Y=>Y.id).join(","),_=(0,Lt.useMemo)(()=>vu(e),[e]),S=(Y,ae,he)=>{let we=c.current;we&&(we.style.display=he?"block":"none",we.style.left=`${Y}px`,we.style.top=`${ae}px`)},z=()=>{let Y=c.current;if(!Y)return;let ae=Y.parentElement?.getBoundingClientRect();if(!ae)return;let he=ae.left+Math.max(18,0)+60,we=ae.bottom-Math.max(22,0)-60;S(he,we,!0)};(0,Lt.useEffect)(()=>{let Y=!!(r&&i);y.current=Y,v(Y),R(!1),Y?requestAnimationFrame(z):c.current&&(c.current.style.display="none")},[e,i,r,L]),(0,Lt.useEffect)(()=>{let Y=a.current;if(!Y)return;let ae,he=FC(u.current.resumeKey);try{ae=new Uh({canvas:Y,levelIndex:e,racers:u.current.racers,meId:i,raceTime:()=>u.current.raceTime(),onSend:Pe=>u.current.onSend?.(Pe),onFinish:Pe=>u.current.onFinish?.(Pe),onHud:Pe=>{d(Pe);let P=u.current.resumeKey;if(P&&Pe.checkpoint>he){he=Pe.checkpoint;try{sessionStorage.setItem(aM+P,String(he))}catch{}}},sendEvery:u.current.sendEvery,startCheckpoint:Math.max(u.current.startCheckpoint??0,he)})}catch(Pe){console.error("Chatto Dash could not start:",Pe),m(!0);return}l.current=ae,u.current.onGame?.(ae);let we=()=>ae.resize();window.addEventListener("resize",we);let Ge=typeof ResizeObserver=="function"?new ResizeObserver(we):null;return Ge?.observe(Y),()=>{window.removeEventListener("resize",we),Ge?.disconnect(),u.current.onGame?.(null),l.current=null,ae.dispose()}},[e,i,L]);let N=(0,Lt.useRef)(null),F=(0,Lt.useRef)({x:0,y:0}),X=()=>{!y.current||u.current.raceTime()<0||(y.current=!1,v(!1))},O=Y=>{ha(),!(N.current!==null||!i)&&(N.current=Y.pointerId,Y.currentTarget.setPointerCapture?.(Y.pointerId),F.current={x:Y.clientX,y:Y.clientY},S(Y.clientX,Y.clientY,!0),R(!0),y.current&&l.current?.setStick(0,-1))},Z=Y=>{if(Y.pointerId!==N.current||y.current)return;let ae=46,he=(Y.clientX-F.current.x)/ae,we=(Y.clientY-F.current.y)/ae,Ge=Math.hypot(he,we);Ge>1&&(he/=Ge,we/=Ge);let Pe=Ge<.14;l.current?.setStick(Pe?0:he,Pe?0:we)},G=Y=>{if(Y.pointerId===N.current){if(N.current=null,l.current?.setStick(0,0),R(!1),y.current){X(),y.current?z():S(0,0,!1);return}S(0,0,!1)}},re=Y=>({onPointerDown:ae=>{ae.preventDefault(),ha(),ae.currentTarget.setPointerCapture?.(ae.pointerId),l.current?.press(Y,!0),g(he=>({...he,[Y]:!0}))},onPointerUp:()=>{l.current?.press(Y,!1),g(ae=>({...ae,[Y]:!1}))},onPointerCancel:()=>{l.current?.press(Y,!1),g(ae=>({...ae,[Y]:!1}))},onLostPointerCapture:()=>{l.current?.press(Y,!1),g(ae=>({...ae,[Y]:!1}))}});(0,Lt.useEffect)(()=>{(h.finished||!i||!r)&&S(0,0,!1)},[h.finished,i,r]);let te=h.t,ce=rr[e%rr.length],Oe=te<0?Math.ceil(-te):0,Fe=i?n.finishes[i]:void 0,q=Object.keys(n.finishes).length>0,J=n.endsAt?Math.max(0,Math.ceil((n.endsAt-n.serverNow())/1e3)):null,ue=i&&Fe!==void 0?1+Object.values(n.finishes).filter(Y=>Y<Fe).length:null;return(0,Ae.jsxs)("div",{className:"dash-stage",onPointerDown:ha,onContextMenu:Y=>Y.preventDefault(),children:[(0,Ae.jsx)("canvas",{ref:a}),r&&i&&(0,Ae.jsx)("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:"58%",touchAction:"none"},onPointerDown:O,onPointerMove:Z,onPointerUp:G,onPointerCancel:G,onLostPointerCapture:G}),(0,Ae.jsx)("div",{ref:c,className:`dash-pad${f?" guiding":""}${M?" held":""}`,style:{display:"none"},"aria-hidden":!0,children:(0,Ae.jsxs)("svg",{viewBox:"0 0 120 120",width:"120",height:"120",children:[(0,Ae.jsx)("circle",{cx:"60",cy:"60",r:"56",fill:"rgba(255,255,255,0.5)",stroke:"var(--ink)",strokeWidth:"3.5"}),(0,Ae.jsxs)("g",{fill:"rgba(255,255,255,0.85)",stroke:"var(--ink)",strokeWidth:"3",strokeLinejoin:"round",children:[(0,Ae.jsx)("rect",{x:"48",y:"22",width:"24",height:"76",rx:"7"}),(0,Ae.jsx)("rect",{x:"22",y:"48",width:"76",height:"24",rx:"7"})]}),(0,Ae.jsx)("circle",{cx:"60",cy:"60",r:"7",fill:"rgba(220,224,240,0.95)",stroke:"var(--ink)",strokeWidth:"2"}),(0,Ae.jsx)("path",{className:"up",d:"M60 30 L52 42 H68 Z",fill:"var(--ink)",opacity:"0.55"}),(0,Ae.jsx)("path",{d:"M60 90 L52 78 H68 Z",fill:"var(--ink)",opacity:"0.45"}),(0,Ae.jsx)("path",{d:"M30 60 L42 52 V68 Z",fill:"var(--ink)",opacity:"0.45"}),(0,Ae.jsx)("path",{d:"M90 60 L78 52 V68 Z",fill:"var(--ink)",opacity:"0.45"})]})}),(0,Ae.jsxs)("div",{className:"dash-hud",children:[(0,Ae.jsxs)("div",{className:"dash-top",children:[n.onMinimize&&(0,Ae.jsx)("button",{className:"ec-round-btn",onClick:n.onMinimize,"aria-label":o.minimize,title:o.minimize,style:{width:38,height:38,fontSize:20,boxShadow:"0 3px 0 var(--ink)"},children:"\u2013"}),(0,Ae.jsx)("span",{className:"dash-pill",style:{flexShrink:1,minWidth:0},children:(0,Ae.jsxs)("span",{className:"dash-pill-text",children:[n.round+1,"/",n.rounds," \xB7 ",s==="ja"?ce.ja:ce.en]})}),(0,Ae.jsx)("span",{style:{flex:1}}),te>0&&(0,Ae.jsx)("span",{className:"dash-pill clock",children:wo(Fe??te)}),n.canEnd&&n.onEnd&&(0,Ae.jsx)("button",{className:"dash-pill pink",onClick:n.onEnd,children:o.end})]}),(0,Ae.jsx)("div",{className:"dash-side",children:(0,Ae.jsxs)("button",{className:"ec-round-btn",onClick:A,"aria-label":T?o.soundOn:o.soundOff,"aria-pressed":T,title:T?o.soundOn:o.soundOff,style:{width:38,height:38,padding:0,position:"relative",boxShadow:"0 3px 0 var(--ink)"},children:[(0,Ae.jsx)(al,{name:"g-music",size:28,style:T?{opacity:.6,filter:"grayscale(1)"}:void 0}),T&&(0,Ae.jsx)("span",{className:"dash-mute-slash","aria-hidden":!0})]})}),i&&te>0&&!h.finished&&h.racing>1&&(0,Ae.jsxs)("div",{className:"dash-place ec-outline",children:[lp(h.place,s),(0,Ae.jsxs)("small",{children:[" / ",h.racing]})]}),(h.watching||!i)&&te>0&&(0,Ae.jsx)("div",{style:{marginTop:8},children:(0,Ae.jsxs)("span",{className:"dash-pill yellow",children:[o.watching,h.watching?`: ${t.find(Y=>Y.id===h.watching)?.name??""}`:""]})}),q&&!h.finished&&J!==null&&te>0&&(0,Ae.jsx)("div",{style:{marginTop:8},children:(0,Ae.jsxs)("span",{className:"dash-pill pink",children:[o.hurry," ",J]})})]}),t.length>0&&te>-4&&(0,Ae.jsx)("div",{className:"dash-track","aria-hidden":!0,children:t.map(Y=>(0,Ae.jsx)("span",{className:Y.id===i?"me":void 0,style:{bottom:`${Math.round((h.progress[Y.id]??0)*100)}%`},children:(0,Ae.jsx)(ol,{id:Y.avatar,size:Y.id===i?30:22,border:2,shadow:!1})},Y.id))}),(0,Ae.jsx)("div",{className:"dash-center",children:p?(0,Ae.jsx)("div",{className:"ec-card dash-card",children:(0,Ae.jsx)("p",{style:{fontWeight:900},children:o.noWebgl})}):te<-3.2?(0,Ae.jsxs)("div",{className:"ec-card dash-card",children:[(0,Ae.jsxs)("div",{className:"ec-chunky",style:{fontSize:13,opacity:.6},children:[o.round," ",n.round+1,"/",n.rounds]}),(0,Ae.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,lineHeight:1.15,margin:"4px 0 6px",textShadow:`0 3px 0 ${_.theme.accent2}`},children:s==="ja"?_.name.ja:_.name.en}),(0,Ae.jsx)("p",{style:{fontSize:14,fontWeight:900,opacity:.8},children:s==="ja"?_.tagline.ja:_.tagline.en})]}):Oe>0?(0,Ae.jsx)("div",{className:"dash-count ec-outline",children:Oe},Oe):te>=0&&te<.9?(0,Ae.jsx)("div",{className:"dash-count ec-outline",style:{fontSize:96,color:"var(--yellow)"},children:o.go}):h.finished?(0,Ae.jsxs)("div",{className:"ec-card dash-card",style:{marginBottom:"38vh"},children:[(0,Ae.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,textShadow:"0 3px 0 var(--yellow)"},children:o.finished}),ue!==null&&Fe!==void 0&&(0,Ae.jsxs)("p",{className:"ec-chunky",style:{fontSize:18,margin:"2px 0"},children:[t.length>1?`${lp(ue,s)} \xB7 `:"",wo(Fe)]}),h.racing>1&&(0,Ae.jsxs)("p",{style:{fontSize:13,fontWeight:900,opacity:.7},children:[o.waitingOthers," ",J!==null?J:""]})]}):null}),i&&r&&!h.finished&&(0,Ae.jsxs)("div",{className:"dash-buttons",children:[(0,Ae.jsx)("div",{className:`dash-button dive${x.dive?" down":""}`,...re("dive"),children:o.dive}),(0,Ae.jsx)("div",{className:`dash-button jump${x.jump?" down":""}`,...re("jump"),children:o.jump})]}),i&&!r&&te<6&&(0,Ae.jsx)("div",{className:"dash-hint",children:o.howKeys})]})}var at=pn(Xn()),HC=5,cM="enchatto_dash_bests",lM=["var(--pink-soft)","var(--yellow-soft)","var(--blue-soft)","#fff","var(--violet-soft)"];function VC(){try{let n=JSON.parse(localStorage.getItem(cM)??"{}");return n&&typeof n=="object"?n:{}}catch{return{}}}function uM({avatar:n,lang:e,coarse:t,onClose:i,startCheckpoint:r}){let s=ll(e),[o,a]=(0,Tn.useState)(null),[l,c]=(0,Tn.useState)(0),[u,h]=(0,Tn.useState)(null),[d,p]=(0,Tn.useState)({}),[m,x]=(0,Tn.useState)(void 0);(0,Tn.useEffect)(()=>p(VC()),[]);let g=(0,Tn.useRef)(0),f=b=>{g.current=performance.now()+HC*1e3,x(d[String(b)]),h(null),a(b),c(A=>A+1)},v=(0,Tn.useCallback)(()=>(performance.now()-g.current)/1e3,[]),y=(0,Tn.useMemo)(()=>[{id:"me",avatar:n,name:""}],[n]),M=(0,Tn.useMemo)(()=>u===null?{}:{me:u},[u]),R=b=>{if(h(b),o===null)return;let A=String(o);if(d[A]!==void 0&&d[A]<=b)return;let L={...d,[A]:Math.round(b*100)/100};p(L);try{localStorage.setItem(cM,JSON.stringify(L))}catch{}};if(o===null)return(0,at.jsx)(qx,{children:(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)(al,{name:Yx,size:56}),(0,at.jsxs)("h2",{className:"ec-chunky",style:{fontSize:24,margin:"2px 0 2px",textShadow:"0 3px 0 var(--yellow)"},children:[s.title," \xB7 ",s.practice]}),(0,at.jsx)("p",{style:{fontSize:12.5,fontWeight:700,opacity:.75,marginBottom:12,lineHeight:1.45},children:s.practiceBlurb}),(0,at.jsx)("div",{style:{display:"flex",justifyContent:"center",marginBottom:12},children:(0,at.jsx)(ol,{id:n,size:54})}),(0,at.jsx)("div",{className:"dash-rows",style:{marginBottom:12},children:rr.map((b,A)=>{let L=d[String(A)];return(0,at.jsxs)("button",{className:"dash-row dash-course",style:{background:lM[A%lM.length]},onClick:()=>f(A),children:[(0,at.jsx)("span",{className:"n",children:A+1}),(0,at.jsx)("span",{className:"name",children:e==="ja"?b.ja:b.en}),(0,at.jsx)("span",{className:"time",children:L!==void 0?`${s.best} ${wo(L)}`:s.noBest}),(0,at.jsx)("span",{className:"go","aria-hidden":!0,children:"\u25B6"})]},A)})}),(0,at.jsx)("p",{style:{fontSize:11.5,fontWeight:900,opacity:.6,marginBottom:i?12:0},children:t?s.howTouch:s.howKeys}),i&&(0,at.jsx)("button",{className:"ec-btn white",style:{fontSize:17},onClick:i,children:s.close})]})});let T=(o+1)%rr.length;return(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)(Z0,{levelIndex:o,round:o,rounds:rr.length,racers:y,meId:"me",raceTime:v,serverNow:Date.now,finishes:M,coarse:t,lang:e,canEnd:!1,onFinish:R,onMinimize:()=>a(null),startCheckpoint:r},`${o}:${l}`),u!==null&&(0,at.jsx)("div",{className:"dash-after",children:(0,at.jsxs)("div",{className:"ec-card dash-card",children:[(0,at.jsx)("p",{className:"ec-chunky",style:{fontSize:15,marginBottom:10},children:m===void 0||u<m?s.newBest:`${s.best} ${wo(m)}`}),(0,at.jsxs)("div",{style:{display:"flex",gap:8},children:[(0,at.jsx)("button",{className:"ec-btn white",style:{flex:1,fontSize:15},onClick:()=>f(o),children:s.again}),(0,at.jsxs)("button",{className:"ec-btn pink",style:{flex:1.6,fontSize:14,whiteSpace:"nowrap",paddingInline:6},onClick:()=>f(T),children:[s.nextNow," \u25B6"]})]}),(0,at.jsx)("button",{className:"ec-btn white",style:{marginTop:8,fontSize:14},onClick:()=>a(null),children:s.allCourses})]})})]})}var mM=pn(Xn());function fM(n){window.webkit?.messageHandlers?.enchattoDash?.postMessage(n)}var dM=new URLSearchParams(location.search),pM=dM.get("lang")==="ja"?"ja":"en";document.documentElement.lang=pM;(0,hM.createRoot)(document.getElementById("root")).render((0,mM.jsx)(uM,{avatar:dM.get("avatar")??mu[0].id,lang:pM,coarse:!0,onClose:()=>fM({type:"close"})}));fM({type:"ready"});})();
