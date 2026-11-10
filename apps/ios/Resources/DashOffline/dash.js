"use strict";(()=>{var Q1=Object.create;var J0=Object.defineProperty;var eM=Object.getOwnPropertyDescriptor;var tM=Object.getOwnPropertyNames;var nM=Object.getPrototypeOf,iM=Object.prototype.hasOwnProperty;var Vi=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var rM=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of tM(e))!iM.call(t,r)&&r!==n&&J0(t,r,{get:()=>e[r],enumerable:!(i=eM(e,r))||i.enumerable});return t};var ln=(t,e,n)=>(n=t!=null?Q1(nM(t)):{},rM(e||!t||!t.__esModule?J0(n,"default",{value:t,enumerable:!0}):n,t));var ug=Vi(He=>{"use strict";var oa=Symbol.for("react.element"),sM=Symbol.for("react.portal"),oM=Symbol.for("react.fragment"),aM=Symbol.for("react.strict_mode"),lM=Symbol.for("react.profiler"),cM=Symbol.for("react.provider"),uM=Symbol.for("react.context"),hM=Symbol.for("react.forward_ref"),fM=Symbol.for("react.suspense"),dM=Symbol.for("react.memo"),pM=Symbol.for("react.lazy"),Q0=Symbol.iterator;function mM(t){return t===null||typeof t!="object"?null:(t=Q0&&t[Q0]||t["@@iterator"],typeof t=="function"?t:null)}var ng={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ig=Object.assign,rg={};function Hs(t,e,n){this.props=t,this.context=e,this.refs=rg,this.updater=n||ng}Hs.prototype.isReactComponent={};Hs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Hs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function sg(){}sg.prototype=Hs.prototype;function Lh(t,e,n){this.props=t,this.context=e,this.refs=rg,this.updater=n||ng}var Nh=Lh.prototype=new sg;Nh.constructor=Lh;ig(Nh,Hs.prototype);Nh.isPureReactComponent=!0;var eg=Array.isArray,og=Object.prototype.hasOwnProperty,kh={current:null},ag={key:!0,ref:!0,__self:!0,__source:!0};function lg(t,e,n){var i,r={},s=null,o=null;if(e!=null)for(i in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)og.call(e,i)&&!ag.hasOwnProperty(i)&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var l=Array(a),c=0;c<a;c++)l[c]=arguments[c+2];r.children=l}if(t&&t.defaultProps)for(i in a=t.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return{$$typeof:oa,type:t,key:s,ref:o,props:r,_owner:kh.current}}function gM(t,e){return{$$typeof:oa,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Dh(t){return typeof t=="object"&&t!==null&&t.$$typeof===oa}function vM(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var tg=/\/+/g;function Ih(t,e){return typeof t=="object"&&t!==null&&t.key!=null?vM(""+t.key):e.toString(36)}function zl(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case oa:case sM:o=!0}}if(o)return o=t,r=r(o),t=i===""?"."+Ih(o,0):i,eg(r)?(n="",t!=null&&(n=t.replace(tg,"$&/")+"/"),zl(r,e,n,"",function(c){return c})):r!=null&&(Dh(r)&&(r=gM(r,n+(!r.key||o&&o.key===r.key?"":(""+r.key).replace(tg,"$&/")+"/")+t)),e.push(r)),1;if(o=0,i=i===""?".":i+":",eg(t))for(var a=0;a<t.length;a++){s=t[a];var l=i+Ih(s,a);o+=zl(s,e,n,l,r)}else if(l=mM(t),typeof l=="function")for(t=l.call(t),a=0;!(s=t.next()).done;)s=s.value,l=i+Ih(s,a++),o+=zl(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Ul(t,e,n){if(t==null)return t;var i=[],r=0;return zl(t,i,"","",function(s){return e.call(n,s,r++)}),i}function yM(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var cn={current:null},Ol={transition:null},xM={ReactCurrentDispatcher:cn,ReactCurrentBatchConfig:Ol,ReactCurrentOwner:kh};function cg(){throw Error("act(...) is not supported in production builds of React.")}He.Children={map:Ul,forEach:function(t,e,n){Ul(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ul(t,function(){e++}),e},toArray:function(t){return Ul(t,function(e){return e})||[]},only:function(t){if(!Dh(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};He.Component=Hs;He.Fragment=oM;He.Profiler=lM;He.PureComponent=Lh;He.StrictMode=aM;He.Suspense=fM;He.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=xM;He.act=cg;He.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=ig({},t.props),r=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=kh.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var a=t.type.defaultProps;for(l in e)og.call(e,l)&&!ag.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&a!==void 0?a[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){a=Array(l);for(var c=0;c<l;c++)a[c]=arguments[c+2];i.children=a}return{$$typeof:oa,type:t.type,key:r,ref:s,props:i,_owner:o}};He.createContext=function(t){return t={$$typeof:uM,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:cM,_context:t},t.Consumer=t};He.createElement=lg;He.createFactory=function(t){var e=lg.bind(null,t);return e.type=t,e};He.createRef=function(){return{current:null}};He.forwardRef=function(t){return{$$typeof:hM,render:t}};He.isValidElement=Dh;He.lazy=function(t){return{$$typeof:pM,_payload:{_status:-1,_result:t},_init:yM}};He.memo=function(t,e){return{$$typeof:dM,type:t,compare:e===void 0?null:e}};He.startTransition=function(t){var e=Ol.transition;Ol.transition={};try{t()}finally{Ol.transition=e}};He.unstable_act=cg;He.useCallback=function(t,e){return cn.current.useCallback(t,e)};He.useContext=function(t){return cn.current.useContext(t)};He.useDebugValue=function(){};He.useDeferredValue=function(t){return cn.current.useDeferredValue(t)};He.useEffect=function(t,e){return cn.current.useEffect(t,e)};He.useId=function(){return cn.current.useId()};He.useImperativeHandle=function(t,e,n){return cn.current.useImperativeHandle(t,e,n)};He.useInsertionEffect=function(t,e){return cn.current.useInsertionEffect(t,e)};He.useLayoutEffect=function(t,e){return cn.current.useLayoutEffect(t,e)};He.useMemo=function(t,e){return cn.current.useMemo(t,e)};He.useReducer=function(t,e,n){return cn.current.useReducer(t,e,n)};He.useRef=function(t){return cn.current.useRef(t)};He.useState=function(t){return cn.current.useState(t)};He.useSyncExternalStore=function(t,e,n){return cn.current.useSyncExternalStore(t,e,n)};He.useTransition=function(){return cn.current.useTransition()};He.version="18.3.1"});var aa=Vi((SC,hg)=>{"use strict";hg.exports=ug()});var Mg=Vi(at=>{"use strict";function Fh(t,e){var n=t.length;t.push(e);e:for(;0<n;){var i=n-1>>>1,r=t[i];if(0<Fl(r,e))t[i]=e,t[n]=r,n=i;else break e}}function ui(t){return t.length===0?null:t[0]}function Hl(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var i=0,r=t.length,s=r>>>1;i<s;){var o=2*(i+1)-1,a=t[o],l=o+1,c=t[l];if(0>Fl(a,n))l<r&&0>Fl(c,a)?(t[i]=c,t[l]=n,i=l):(t[i]=a,t[o]=n,i=o);else if(l<r&&0>Fl(c,n))t[i]=c,t[l]=n,i=l;else break e}}return e}function Fl(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}typeof performance=="object"&&typeof performance.now=="function"?(fg=performance,at.unstable_now=function(){return fg.now()}):(Uh=Date,dg=Uh.now(),at.unstable_now=function(){return Uh.now()-dg});var fg,Uh,dg,Ti=[],vr=[],_M=1,$n=null,$t=3,Vl=!1,rs=!1,ca=!1,gg=typeof setTimeout=="function"?setTimeout:null,vg=typeof clearTimeout=="function"?clearTimeout:null,pg=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Bh(t){for(var e=ui(vr);e!==null;){if(e.callback===null)Hl(vr);else if(e.startTime<=t)Hl(vr),e.sortIndex=e.expirationTime,Fh(Ti,e);else break;e=ui(vr)}}function Hh(t){if(ca=!1,Bh(t),!rs)if(ui(Ti)!==null)rs=!0,Gh(Vh);else{var e=ui(vr);e!==null&&Wh(Hh,e.startTime-t)}}function Vh(t,e){rs=!1,ca&&(ca=!1,vg(ua),ua=-1),Vl=!0;var n=$t;try{for(Bh(e),$n=ui(Ti);$n!==null&&(!($n.expirationTime>e)||t&&!_g());){var i=$n.callback;if(typeof i=="function"){$n.callback=null,$t=$n.priorityLevel;var r=i($n.expirationTime<=e);e=at.unstable_now(),typeof r=="function"?$n.callback=r:$n===ui(Ti)&&Hl(Ti),Bh(e)}else Hl(Ti);$n=ui(Ti)}if($n!==null)var s=!0;else{var o=ui(vr);o!==null&&Wh(Hh,o.startTime-e),s=!1}return s}finally{$n=null,$t=n,Vl=!1}}var Gl=!1,Bl=null,ua=-1,yg=5,xg=-1;function _g(){return!(at.unstable_now()-xg<yg)}function zh(){if(Bl!==null){var t=at.unstable_now();xg=t;var e=!0;try{e=Bl(!0,t)}finally{e?la():(Gl=!1,Bl=null)}}else Gl=!1}var la;typeof pg=="function"?la=function(){pg(zh)}:typeof MessageChannel<"u"?(Oh=new MessageChannel,mg=Oh.port2,Oh.port1.onmessage=zh,la=function(){mg.postMessage(null)}):la=function(){gg(zh,0)};var Oh,mg;function Gh(t){Bl=t,Gl||(Gl=!0,la())}function Wh(t,e){ua=gg(function(){t(at.unstable_now())},e)}at.unstable_IdlePriority=5;at.unstable_ImmediatePriority=1;at.unstable_LowPriority=4;at.unstable_NormalPriority=3;at.unstable_Profiling=null;at.unstable_UserBlockingPriority=2;at.unstable_cancelCallback=function(t){t.callback=null};at.unstable_continueExecution=function(){rs||Vl||(rs=!0,Gh(Vh))};at.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):yg=0<t?Math.floor(1e3/t):5};at.unstable_getCurrentPriorityLevel=function(){return $t};at.unstable_getFirstCallbackNode=function(){return ui(Ti)};at.unstable_next=function(t){switch($t){case 1:case 2:case 3:var e=3;break;default:e=$t}var n=$t;$t=e;try{return t()}finally{$t=n}};at.unstable_pauseExecution=function(){};at.unstable_requestPaint=function(){};at.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=$t;$t=t;try{return e()}finally{$t=n}};at.unstable_scheduleCallback=function(t,e,n){var i=at.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:_M++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>i?(t.sortIndex=n,Fh(vr,t),ui(Ti)===null&&t===ui(vr)&&(ca?(vg(ua),ua=-1):ca=!0,Wh(Hh,n-i))):(t.sortIndex=r,Fh(Ti,t),rs||Vl||(rs=!0,Gh(Vh))),t};at.unstable_shouldYield=_g;at.unstable_wrapCallback=function(t){var e=$t;return function(){var n=$t;$t=e;try{return t.apply(this,arguments)}finally{$t=n}}}});var wg=Vi((EC,Sg)=>{"use strict";Sg.exports=Mg()});var Ax=Vi(On=>{"use strict";var MM=aa(),Un=wg();function Q(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Pv=new Set,La={};function vs(t,e){lo(t,e),lo(t+"Capture",e)}function lo(t,e){for(La[t]=e,t=0;t<e.length;t++)Pv.add(e[t])}var $i=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),pf=Object.prototype.hasOwnProperty,SM=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Eg={},bg={};function wM(t){return pf.call(bg,t)?!0:pf.call(Eg,t)?!1:SM.test(t)?bg[t]=!0:(Eg[t]=!0,!1)}function EM(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function bM(t,e,n,i){if(e===null||typeof e>"u"||EM(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function fn(t,e,n,i,r,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var Gt={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Gt[t]=new fn(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Gt[e]=new fn(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Gt[t]=new fn(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Gt[t]=new fn(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Gt[t]=new fn(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Gt[t]=new fn(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Gt[t]=new fn(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Gt[t]=new fn(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Gt[t]=new fn(t,5,!1,t.toLowerCase(),null,!1,!1)});var od=/[\-:]([a-z])/g;function ad(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(od,ad);Gt[e]=new fn(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(od,ad);Gt[e]=new fn(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(od,ad);Gt[e]=new fn(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Gt[t]=new fn(t,1,!1,t.toLowerCase(),null,!1,!1)});Gt.xlinkHref=new fn("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Gt[t]=new fn(t,1,!1,t.toLowerCase(),null,!0,!0)});function ld(t,e,n,i){var r=Gt.hasOwnProperty(e)?Gt[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(bM(e,n,r,i)&&(n=null),i||r===null?wM(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var Ji=MM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Wl=Symbol.for("react.element"),Ws=Symbol.for("react.portal"),Xs=Symbol.for("react.fragment"),cd=Symbol.for("react.strict_mode"),mf=Symbol.for("react.profiler"),Iv=Symbol.for("react.provider"),Lv=Symbol.for("react.context"),ud=Symbol.for("react.forward_ref"),gf=Symbol.for("react.suspense"),vf=Symbol.for("react.suspense_list"),hd=Symbol.for("react.memo"),xr=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var Nv=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var Tg=Symbol.iterator;function ha(t){return t===null||typeof t!="object"?null:(t=Tg&&t[Tg]||t["@@iterator"],typeof t=="function"?t:null)}var _t=Object.assign,Xh;function xa(t){if(Xh===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Xh=e&&e[1]||""}return`
`+Xh+t}var Yh=!1;function qh(t,e){if(!t||Yh)return"";Yh=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){i=c}t.call(e.prototype)}else{try{throw Error()}catch(c){i=c}t()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),o=r.length-1,a=s.length-1;1<=o&&0<=a&&r[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(r[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||r[o]!==s[a]){var l=`
`+r[o].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=o&&0<=a);break}}}finally{Yh=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?xa(t):""}function TM(t){switch(t.tag){case 5:return xa(t.type);case 16:return xa("Lazy");case 13:return xa("Suspense");case 19:return xa("SuspenseList");case 0:case 2:case 15:return t=qh(t.type,!1),t;case 11:return t=qh(t.type.render,!1),t;case 1:return t=qh(t.type,!0),t;default:return""}}function yf(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Xs:return"Fragment";case Ws:return"Portal";case mf:return"Profiler";case cd:return"StrictMode";case gf:return"Suspense";case vf:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Lv:return(t.displayName||"Context")+".Consumer";case Iv:return(t._context.displayName||"Context")+".Provider";case ud:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case hd:return e=t.displayName||null,e!==null?e:yf(t.type)||"Memo";case xr:e=t._payload,t=t._init;try{return yf(t(e))}catch{}}return null}function AM(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return yf(e);case 8:return e===cd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Nr(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function kv(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function RM(t){var e=kv(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(o){i=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(o){i=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Xl(t){t._valueTracker||(t._valueTracker=RM(t))}function Dv(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=kv(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function xc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function xf(t,e){var n=e.checked;return _t({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Ag(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=Nr(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Uv(t,e){e=e.checked,e!=null&&ld(t,"checked",e,!1)}function _f(t,e){Uv(t,e);var n=Nr(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?Mf(t,e.type,n):e.hasOwnProperty("defaultValue")&&Mf(t,e.type,Nr(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function Rg(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function Mf(t,e,n){(e!=="number"||xc(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var _a=Array.isArray;function no(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+Nr(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Sf(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(Q(91));return _t({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function Cg(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(Q(92));if(_a(n)){if(1<n.length)throw Error(Q(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Nr(n)}}function zv(t,e){var n=Nr(e.value),i=Nr(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function Pg(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function Ov(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function wf(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?Ov(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Yl,Fv=(function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t})(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Yl=Yl||document.createElement("div"),Yl.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Yl.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function Na(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var wa={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},CM=["Webkit","ms","Moz","O"];Object.keys(wa).forEach(function(t){CM.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),wa[e]=wa[t]})});function Bv(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||wa.hasOwnProperty(t)&&wa[t]?(""+e).trim():e+"px"}function Hv(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=Bv(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var PM=_t({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Ef(t,e){if(e){if(PM[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(Q(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(Q(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(Q(61))}if(e.style!=null&&typeof e.style!="object")throw Error(Q(62))}}function bf(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Tf=null;function fd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Af=null,io=null,ro=null;function Ig(t){if(t=Ka(t)){if(typeof Af!="function")throw Error(Q(280));var e=t.stateNode;e&&(e=qc(e),Af(t.stateNode,t.type,e))}}function Vv(t){io?ro?ro.push(t):ro=[t]:io=t}function Gv(){if(io){var t=io,e=ro;if(ro=io=null,Ig(t),e)for(t=0;t<e.length;t++)Ig(e[t])}}function Wv(t,e){return t(e)}function Xv(){}var $h=!1;function Yv(t,e,n){if($h)return t(e,n);$h=!0;try{return Wv(t,e,n)}finally{$h=!1,(io!==null||ro!==null)&&(Xv(),Gv())}}function ka(t,e){var n=t.stateNode;if(n===null)return null;var i=qc(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(Q(231,e,typeof n));return n}var Rf=!1;if($i)try{Vs={},Object.defineProperty(Vs,"passive",{get:function(){Rf=!0}}),window.addEventListener("test",Vs,Vs),window.removeEventListener("test",Vs,Vs)}catch{Rf=!1}var Vs;function IM(t,e,n,i,r,s,o,a,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(u){this.onError(u)}}var Ea=!1,_c=null,Mc=!1,Cf=null,LM={onError:function(t){Ea=!0,_c=t}};function NM(t,e,n,i,r,s,o,a,l){Ea=!1,_c=null,IM.apply(LM,arguments)}function kM(t,e,n,i,r,s,o,a,l){if(NM.apply(this,arguments),Ea){if(Ea){var c=_c;Ea=!1,_c=null}else throw Error(Q(198));Mc||(Mc=!0,Cf=c)}}function ys(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function qv(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Lg(t){if(ys(t)!==t)throw Error(Q(188))}function DM(t){var e=t.alternate;if(!e){if(e=ys(t),e===null)throw Error(Q(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return Lg(r),t;if(s===i)return Lg(r),e;s=s.sibling}throw Error(Q(188))}if(n.return!==i.return)n=r,i=s;else{for(var o=!1,a=r.child;a;){if(a===n){o=!0,n=r,i=s;break}if(a===i){o=!0,i=r,n=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===n){o=!0,n=s,i=r;break}if(a===i){o=!0,i=s,n=r;break}a=a.sibling}if(!o)throw Error(Q(189))}}if(n.alternate!==i)throw Error(Q(190))}if(n.tag!==3)throw Error(Q(188));return n.stateNode.current===n?t:e}function $v(t){return t=DM(t),t!==null?jv(t):null}function jv(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=jv(t);if(e!==null)return e;t=t.sibling}return null}var Zv=Un.unstable_scheduleCallback,Ng=Un.unstable_cancelCallback,UM=Un.unstable_shouldYield,zM=Un.unstable_requestPaint,At=Un.unstable_now,OM=Un.unstable_getCurrentPriorityLevel,dd=Un.unstable_ImmediatePriority,Kv=Un.unstable_UserBlockingPriority,Sc=Un.unstable_NormalPriority,FM=Un.unstable_LowPriority,Jv=Un.unstable_IdlePriority,Gc=null,Pi=null;function BM(t){if(Pi&&typeof Pi.onCommitFiberRoot=="function")try{Pi.onCommitFiberRoot(Gc,t,void 0,(t.current.flags&128)===128)}catch{}}var mi=Math.clz32?Math.clz32:GM,HM=Math.log,VM=Math.LN2;function GM(t){return t>>>=0,t===0?32:31-(HM(t)/VM|0)|0}var ql=64,$l=4194304;function Ma(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function wc(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var a=o&~r;a!==0?i=Ma(a):(s&=o,s!==0&&(i=Ma(s)))}else o=n&~r,o!==0?i=Ma(o):s!==0&&(i=Ma(s));if(i===0)return 0;if(e!==0&&e!==i&&(e&r)===0&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if((i&4)!==0&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-mi(e),r=1<<n,i|=t[n],e&=~r;return i}function WM(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function XM(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-mi(s),a=1<<o,l=r[o];l===-1?((a&n)===0||(a&i)!==0)&&(r[o]=WM(a,e)):l<=e&&(t.expiredLanes|=a),s&=~a}}function Pf(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function Qv(){var t=ql;return ql<<=1,(ql&4194240)===0&&(ql=64),t}function jh(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ja(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-mi(e),t[e]=n}function YM(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-mi(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function pd(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-mi(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var tt=0;function ey(t){return t&=-t,1<t?4<t?(t&268435455)!==0?16:536870912:4:1}var ty,md,ny,iy,ry,If=!1,jl=[],br=null,Tr=null,Ar=null,Da=new Map,Ua=new Map,Mr=[],qM="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function kg(t,e){switch(t){case"focusin":case"focusout":br=null;break;case"dragenter":case"dragleave":Tr=null;break;case"mouseover":case"mouseout":Ar=null;break;case"pointerover":case"pointerout":Da.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ua.delete(e.pointerId)}}function fa(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Ka(e),e!==null&&md(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function $M(t,e,n,i,r){switch(e){case"focusin":return br=fa(br,t,e,n,i,r),!0;case"dragenter":return Tr=fa(Tr,t,e,n,i,r),!0;case"mouseover":return Ar=fa(Ar,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return Da.set(s,fa(Da.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,Ua.set(s,fa(Ua.get(s)||null,t,e,n,i,r)),!0}return!1}function sy(t){var e=as(t.target);if(e!==null){var n=ys(e);if(n!==null){if(e=n.tag,e===13){if(e=qv(n),e!==null){t.blockedOn=e,ry(t.priority,function(){ny(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function cc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Lf(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);Tf=i,n.target.dispatchEvent(i),Tf=null}else return e=Ka(n),e!==null&&md(e),t.blockedOn=n,!1;e.shift()}return!0}function Dg(t,e,n){cc(t)&&n.delete(e)}function jM(){If=!1,br!==null&&cc(br)&&(br=null),Tr!==null&&cc(Tr)&&(Tr=null),Ar!==null&&cc(Ar)&&(Ar=null),Da.forEach(Dg),Ua.forEach(Dg)}function da(t,e){t.blockedOn===e&&(t.blockedOn=null,If||(If=!0,Un.unstable_scheduleCallback(Un.unstable_NormalPriority,jM)))}function za(t){function e(r){return da(r,t)}if(0<jl.length){da(jl[0],t);for(var n=1;n<jl.length;n++){var i=jl[n];i.blockedOn===t&&(i.blockedOn=null)}}for(br!==null&&da(br,t),Tr!==null&&da(Tr,t),Ar!==null&&da(Ar,t),Da.forEach(e),Ua.forEach(e),n=0;n<Mr.length;n++)i=Mr[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Mr.length&&(n=Mr[0],n.blockedOn===null);)sy(n),n.blockedOn===null&&Mr.shift()}var so=Ji.ReactCurrentBatchConfig,Ec=!0;function ZM(t,e,n,i){var r=tt,s=so.transition;so.transition=null;try{tt=1,gd(t,e,n,i)}finally{tt=r,so.transition=s}}function KM(t,e,n,i){var r=tt,s=so.transition;so.transition=null;try{tt=4,gd(t,e,n,i)}finally{tt=r,so.transition=s}}function gd(t,e,n,i){if(Ec){var r=Lf(t,e,n,i);if(r===null)nf(t,e,i,bc,n),kg(t,i);else if($M(r,t,e,n,i))i.stopPropagation();else if(kg(t,i),e&4&&-1<qM.indexOf(t)){for(;r!==null;){var s=Ka(r);if(s!==null&&ty(s),s=Lf(t,e,n,i),s===null&&nf(t,e,i,bc,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else nf(t,e,i,null,n)}}var bc=null;function Lf(t,e,n,i){if(bc=null,t=fd(i),t=as(t),t!==null)if(e=ys(t),e===null)t=null;else if(n=e.tag,n===13){if(t=qv(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return bc=t,null}function oy(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(OM()){case dd:return 1;case Kv:return 4;case Sc:case FM:return 16;case Jv:return 536870912;default:return 16}default:return 16}}var wr=null,vd=null,uc=null;function ay(){if(uc)return uc;var t,e=vd,n=e.length,i,r="value"in wr?wr.value:wr.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var o=n-t;for(i=1;i<=o&&e[n-i]===r[s-i];i++);return uc=r.slice(t,1<i?1-i:void 0)}function hc(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Zl(){return!0}function Ug(){return!1}function zn(t){function e(n,i,r,s,o){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in t)t.hasOwnProperty(a)&&(n=t[a],this[a]=n?n(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Zl:Ug,this.isPropagationStopped=Ug,this}return _t(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Zl)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Zl)},persist:function(){},isPersistent:Zl}),e}var go={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},yd=zn(go),Za=_t({},go,{view:0,detail:0}),JM=zn(Za),Zh,Kh,pa,Wc=_t({},Za,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:xd,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==pa&&(pa&&t.type==="mousemove"?(Zh=t.screenX-pa.screenX,Kh=t.screenY-pa.screenY):Kh=Zh=0,pa=t),Zh)},movementY:function(t){return"movementY"in t?t.movementY:Kh}}),zg=zn(Wc),QM=_t({},Wc,{dataTransfer:0}),eS=zn(QM),tS=_t({},Za,{relatedTarget:0}),Jh=zn(tS),nS=_t({},go,{animationName:0,elapsedTime:0,pseudoElement:0}),iS=zn(nS),rS=_t({},go,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),sS=zn(rS),oS=_t({},go,{data:0}),Og=zn(oS),aS={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},lS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},cS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function uS(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=cS[t])?!!e[t]:!1}function xd(){return uS}var hS=_t({},Za,{key:function(t){if(t.key){var e=aS[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=hc(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?lS[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:xd,charCode:function(t){return t.type==="keypress"?hc(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?hc(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),fS=zn(hS),dS=_t({},Wc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Fg=zn(dS),pS=_t({},Za,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:xd}),mS=zn(pS),gS=_t({},go,{propertyName:0,elapsedTime:0,pseudoElement:0}),vS=zn(gS),yS=_t({},Wc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),xS=zn(yS),_S=[9,13,27,32],_d=$i&&"CompositionEvent"in window,ba=null;$i&&"documentMode"in document&&(ba=document.documentMode);var MS=$i&&"TextEvent"in window&&!ba,ly=$i&&(!_d||ba&&8<ba&&11>=ba),Bg=" ",Hg=!1;function cy(t,e){switch(t){case"keyup":return _S.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function uy(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ys=!1;function SS(t,e){switch(t){case"compositionend":return uy(e);case"keypress":return e.which!==32?null:(Hg=!0,Bg);case"textInput":return t=e.data,t===Bg&&Hg?null:t;default:return null}}function wS(t,e){if(Ys)return t==="compositionend"||!_d&&cy(t,e)?(t=ay(),uc=vd=wr=null,Ys=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return ly&&e.locale!=="ko"?null:e.data;default:return null}}var ES={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Vg(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!ES[t.type]:e==="textarea"}function hy(t,e,n,i){Vv(i),e=Tc(e,"onChange"),0<e.length&&(n=new yd("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var Ta=null,Oa=null;function bS(t){Sy(t,0)}function Xc(t){var e=js(t);if(Dv(e))return t}function TS(t,e){if(t==="change")return e}var fy=!1;$i&&($i?(Jl="oninput"in document,Jl||(Qh=document.createElement("div"),Qh.setAttribute("oninput","return;"),Jl=typeof Qh.oninput=="function"),Kl=Jl):Kl=!1,fy=Kl&&(!document.documentMode||9<document.documentMode));var Kl,Jl,Qh;function Gg(){Ta&&(Ta.detachEvent("onpropertychange",dy),Oa=Ta=null)}function dy(t){if(t.propertyName==="value"&&Xc(Oa)){var e=[];hy(e,Oa,t,fd(t)),Yv(bS,e)}}function AS(t,e,n){t==="focusin"?(Gg(),Ta=e,Oa=n,Ta.attachEvent("onpropertychange",dy)):t==="focusout"&&Gg()}function RS(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Xc(Oa)}function CS(t,e){if(t==="click")return Xc(e)}function PS(t,e){if(t==="input"||t==="change")return Xc(e)}function IS(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var vi=typeof Object.is=="function"?Object.is:IS;function Fa(t,e){if(vi(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!pf.call(e,r)||!vi(t[r],e[r]))return!1}return!0}function Wg(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Xg(t,e){var n=Wg(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Wg(n)}}function py(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?py(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function my(){for(var t=window,e=xc();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=xc(t.document)}return e}function Md(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function LS(t){var e=my(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&py(n.ownerDocument.documentElement,n)){if(i!==null&&Md(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Xg(n,s);var o=Xg(n,i);r&&o&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var NS=$i&&"documentMode"in document&&11>=document.documentMode,qs=null,Nf=null,Aa=null,kf=!1;function Yg(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;kf||qs==null||qs!==xc(i)||(i=qs,"selectionStart"in i&&Md(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Aa&&Fa(Aa,i)||(Aa=i,i=Tc(Nf,"onSelect"),0<i.length&&(e=new yd("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=qs)))}function Ql(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var $s={animationend:Ql("Animation","AnimationEnd"),animationiteration:Ql("Animation","AnimationIteration"),animationstart:Ql("Animation","AnimationStart"),transitionend:Ql("Transition","TransitionEnd")},ef={},gy={};$i&&(gy=document.createElement("div").style,"AnimationEvent"in window||(delete $s.animationend.animation,delete $s.animationiteration.animation,delete $s.animationstart.animation),"TransitionEvent"in window||delete $s.transitionend.transition);function Yc(t){if(ef[t])return ef[t];if(!$s[t])return t;var e=$s[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in gy)return ef[t]=e[n];return t}var vy=Yc("animationend"),yy=Yc("animationiteration"),xy=Yc("animationstart"),_y=Yc("transitionend"),My=new Map,qg="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Dr(t,e){My.set(t,e),vs(e,[t])}for(ec=0;ec<qg.length;ec++)tc=qg[ec],$g=tc.toLowerCase(),jg=tc[0].toUpperCase()+tc.slice(1),Dr($g,"on"+jg);var tc,$g,jg,ec;Dr(vy,"onAnimationEnd");Dr(yy,"onAnimationIteration");Dr(xy,"onAnimationStart");Dr("dblclick","onDoubleClick");Dr("focusin","onFocus");Dr("focusout","onBlur");Dr(_y,"onTransitionEnd");lo("onMouseEnter",["mouseout","mouseover"]);lo("onMouseLeave",["mouseout","mouseover"]);lo("onPointerEnter",["pointerout","pointerover"]);lo("onPointerLeave",["pointerout","pointerover"]);vs("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));vs("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));vs("onBeforeInput",["compositionend","keypress","textInput","paste"]);vs("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));vs("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));vs("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Sa="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),kS=new Set("cancel close invalid load scroll toggle".split(" ").concat(Sa));function Zg(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,kM(i,e,void 0,t),t.currentTarget=null}function Sy(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var o=i.length-1;0<=o;o--){var a=i[o],l=a.instance,c=a.currentTarget;if(a=a.listener,l!==s&&r.isPropagationStopped())break e;Zg(r,a,c),s=l}else for(o=0;o<i.length;o++){if(a=i[o],l=a.instance,c=a.currentTarget,a=a.listener,l!==s&&r.isPropagationStopped())break e;Zg(r,a,c),s=l}}}if(Mc)throw t=Cf,Mc=!1,Cf=null,t}function ft(t,e){var n=e[Ff];n===void 0&&(n=e[Ff]=new Set);var i=t+"__bubble";n.has(i)||(wy(e,t,2,!1),n.add(i))}function tf(t,e,n){var i=0;e&&(i|=4),wy(n,t,i,e)}var nc="_reactListening"+Math.random().toString(36).slice(2);function Ba(t){if(!t[nc]){t[nc]=!0,Pv.forEach(function(n){n!=="selectionchange"&&(kS.has(n)||tf(n,!1,t),tf(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[nc]||(e[nc]=!0,tf("selectionchange",!1,e))}}function wy(t,e,n,i){switch(oy(e)){case 1:var r=ZM;break;case 4:r=KM;break;default:r=gd}n=r.bind(null,e,n,t),r=void 0,!Rf||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function nf(t,e,n,i,r){var s=i;if((e&1)===0&&(e&2)===0&&i!==null)e:for(;;){if(i===null)return;var o=i.tag;if(o===3||o===4){var a=i.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(o===4)for(o=i.return;o!==null;){var l=o.tag;if((l===3||l===4)&&(l=o.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;o=o.return}for(;a!==null;){if(o=as(a),o===null)return;if(l=o.tag,l===5||l===6){i=s=o;continue e}a=a.parentNode}}i=i.return}Yv(function(){var c=s,u=fd(n),h=[];e:{var d=My.get(t);if(d!==void 0){var p=yd,m=t;switch(t){case"keypress":if(hc(n)===0)break e;case"keydown":case"keyup":p=fS;break;case"focusin":m="focus",p=Jh;break;case"focusout":m="blur",p=Jh;break;case"beforeblur":case"afterblur":p=Jh;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=zg;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=eS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=mS;break;case vy:case yy:case xy:p=iS;break;case _y:p=vS;break;case"scroll":p=JM;break;case"wheel":p=xS;break;case"copy":case"cut":case"paste":p=sS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Fg}var x=(e&4)!==0,g=!x&&t==="scroll",f=x?d!==null?d+"Capture":null:d;x=[];for(var y=c,v;y!==null;){v=y;var M=v.stateNode;if(v.tag===5&&M!==null&&(v=M,f!==null&&(M=ka(y,f),M!=null&&x.push(Ha(y,M,v)))),g)break;y=y.return}0<x.length&&(d=new p(d,m,null,n,u),h.push({event:d,listeners:x}))}}if((e&7)===0){e:{if(d=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",d&&n!==Tf&&(m=n.relatedTarget||n.fromElement)&&(as(m)||m[ji]))break e;if((p||d)&&(d=u.window===u?u:(d=u.ownerDocument)?d.defaultView||d.parentWindow:window,p?(m=n.relatedTarget||n.toElement,p=c,m=m?as(m):null,m!==null&&(g=ys(m),m!==g||m.tag!==5&&m.tag!==6)&&(m=null)):(p=null,m=c),p!==m)){if(x=zg,M="onMouseLeave",f="onMouseEnter",y="mouse",(t==="pointerout"||t==="pointerover")&&(x=Fg,M="onPointerLeave",f="onPointerEnter",y="pointer"),g=p==null?d:js(p),v=m==null?d:js(m),d=new x(M,y+"leave",p,n,u),d.target=g,d.relatedTarget=v,M=null,as(u)===c&&(x=new x(f,y+"enter",m,n,u),x.target=v,x.relatedTarget=g,M=x),g=M,p&&m)t:{for(x=p,f=m,y=0,v=x;v;v=Gs(v))y++;for(v=0,M=f;M;M=Gs(M))v++;for(;0<y-v;)x=Gs(x),y--;for(;0<v-y;)f=Gs(f),v--;for(;y--;){if(x===f||f!==null&&x===f.alternate)break t;x=Gs(x),f=Gs(f)}x=null}else x=null;p!==null&&Kg(h,d,p,x,!1),m!==null&&g!==null&&Kg(h,g,m,x,!0)}}e:{if(d=c?js(c):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var R=TS;else if(Vg(d))if(fy)R=PS;else{R=RS;var T=AS}else(p=d.nodeName)&&p.toLowerCase()==="input"&&(d.type==="checkbox"||d.type==="radio")&&(R=CS);if(R&&(R=R(t,c))){hy(h,R,n,u);break e}T&&T(t,d,c),t==="focusout"&&(T=d._wrapperState)&&T.controlled&&d.type==="number"&&Mf(d,"number",d.value)}switch(T=c?js(c):window,t){case"focusin":(Vg(T)||T.contentEditable==="true")&&(qs=T,Nf=c,Aa=null);break;case"focusout":Aa=Nf=qs=null;break;case"mousedown":kf=!0;break;case"contextmenu":case"mouseup":case"dragend":kf=!1,Yg(h,n,u);break;case"selectionchange":if(NS)break;case"keydown":case"keyup":Yg(h,n,u)}var E;if(_d)e:{switch(t){case"compositionstart":var A="onCompositionStart";break e;case"compositionend":A="onCompositionEnd";break e;case"compositionupdate":A="onCompositionUpdate";break e}A=void 0}else Ys?cy(t,n)&&(A="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(ly&&n.locale!=="ko"&&(Ys||A!=="onCompositionStart"?A==="onCompositionEnd"&&Ys&&(E=ay()):(wr=u,vd="value"in wr?wr.value:wr.textContent,Ys=!0)),T=Tc(c,A),0<T.length&&(A=new Og(A,t,null,n,u),h.push({event:A,listeners:T}),E?A.data=E:(E=uy(n),E!==null&&(A.data=E)))),(E=MS?SS(t,n):wS(t,n))&&(c=Tc(c,"onBeforeInput"),0<c.length&&(u=new Og("onBeforeInput","beforeinput",null,n,u),h.push({event:u,listeners:c}),u.data=E))}Sy(h,e)})}function Ha(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Tc(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=ka(t,n),s!=null&&i.unshift(Ha(t,s,r)),s=ka(t,e),s!=null&&i.push(Ha(t,s,r))),t=t.return}return i}function Gs(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Kg(t,e,n,i,r){for(var s=e._reactName,o=[];n!==null&&n!==i;){var a=n,l=a.alternate,c=a.stateNode;if(l!==null&&l===i)break;a.tag===5&&c!==null&&(a=c,r?(l=ka(n,s),l!=null&&o.unshift(Ha(n,l,a))):r||(l=ka(n,s),l!=null&&o.push(Ha(n,l,a)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var DS=/\r\n?/g,US=/\u0000|\uFFFD/g;function Jg(t){return(typeof t=="string"?t:""+t).replace(DS,`
`).replace(US,"")}function ic(t,e,n){if(e=Jg(e),Jg(t)!==e&&n)throw Error(Q(425))}function Ac(){}var Df=null,Uf=null;function zf(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Of=typeof setTimeout=="function"?setTimeout:void 0,zS=typeof clearTimeout=="function"?clearTimeout:void 0,Qg=typeof Promise=="function"?Promise:void 0,OS=typeof queueMicrotask=="function"?queueMicrotask:typeof Qg<"u"?function(t){return Qg.resolve(null).then(t).catch(FS)}:Of;function FS(t){setTimeout(function(){throw t})}function rf(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),za(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);za(e)}function Rr(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function ev(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var vo=Math.random().toString(36).slice(2),Ci="__reactFiber$"+vo,Va="__reactProps$"+vo,ji="__reactContainer$"+vo,Ff="__reactEvents$"+vo,BS="__reactListeners$"+vo,HS="__reactHandles$"+vo;function as(t){var e=t[Ci];if(e)return e;for(var n=t.parentNode;n;){if(e=n[ji]||n[Ci]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=ev(t);t!==null;){if(n=t[Ci])return n;t=ev(t)}return e}t=n,n=t.parentNode}return null}function Ka(t){return t=t[Ci]||t[ji],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function js(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(Q(33))}function qc(t){return t[Va]||null}var Bf=[],Zs=-1;function Ur(t){return{current:t}}function dt(t){0>Zs||(t.current=Bf[Zs],Bf[Zs]=null,Zs--)}function lt(t,e){Zs++,Bf[Zs]=t.current,t.current=e}var kr={},Jt=Ur(kr),En=Ur(!1),fs=kr;function co(t,e){var n=t.type.contextTypes;if(!n)return kr;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function bn(t){return t=t.childContextTypes,t!=null}function Rc(){dt(En),dt(Jt)}function tv(t,e,n){if(Jt.current!==kr)throw Error(Q(168));lt(Jt,e),lt(En,n)}function Ey(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(Q(108,AM(t)||"Unknown",r));return _t({},n,i)}function Cc(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||kr,fs=Jt.current,lt(Jt,t),lt(En,En.current),!0}function nv(t,e,n){var i=t.stateNode;if(!i)throw Error(Q(169));n?(t=Ey(t,e,fs),i.__reactInternalMemoizedMergedChildContext=t,dt(En),dt(Jt),lt(Jt,t)):dt(En),lt(En,n)}var Wi=null,$c=!1,sf=!1;function by(t){Wi===null?Wi=[t]:Wi.push(t)}function VS(t){$c=!0,by(t)}function zr(){if(!sf&&Wi!==null){sf=!0;var t=0,e=tt;try{var n=Wi;for(tt=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}Wi=null,$c=!1}catch(r){throw Wi!==null&&(Wi=Wi.slice(t+1)),Zv(dd,zr),r}finally{tt=e,sf=!1}}return null}var Ks=[],Js=0,Pc=null,Ic=0,jn=[],Zn=0,ds=null,Xi=1,Yi="";function ss(t,e){Ks[Js++]=Ic,Ks[Js++]=Pc,Pc=t,Ic=e}function Ty(t,e,n){jn[Zn++]=Xi,jn[Zn++]=Yi,jn[Zn++]=ds,ds=t;var i=Xi;t=Yi;var r=32-mi(i)-1;i&=~(1<<r),n+=1;var s=32-mi(e)+r;if(30<s){var o=r-r%5;s=(i&(1<<o)-1).toString(32),i>>=o,r-=o,Xi=1<<32-mi(e)+r|n<<r|i,Yi=s+t}else Xi=1<<s|n<<r|i,Yi=t}function Sd(t){t.return!==null&&(ss(t,1),Ty(t,1,0))}function wd(t){for(;t===Pc;)Pc=Ks[--Js],Ks[Js]=null,Ic=Ks[--Js],Ks[Js]=null;for(;t===ds;)ds=jn[--Zn],jn[Zn]=null,Yi=jn[--Zn],jn[Zn]=null,Xi=jn[--Zn],jn[Zn]=null}var Dn=null,kn=null,gt=!1,pi=null;function Ay(t,e){var n=Kn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function iv(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Dn=t,kn=Rr(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Dn=t,kn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=ds!==null?{id:Xi,overflow:Yi}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Kn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Dn=t,kn=null,!0):!1;default:return!1}}function Hf(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Vf(t){if(gt){var e=kn;if(e){var n=e;if(!iv(t,e)){if(Hf(t))throw Error(Q(418));e=Rr(n.nextSibling);var i=Dn;e&&iv(t,e)?Ay(i,n):(t.flags=t.flags&-4097|2,gt=!1,Dn=t)}}else{if(Hf(t))throw Error(Q(418));t.flags=t.flags&-4097|2,gt=!1,Dn=t}}}function rv(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Dn=t}function rc(t){if(t!==Dn)return!1;if(!gt)return rv(t),gt=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!zf(t.type,t.memoizedProps)),e&&(e=kn)){if(Hf(t))throw Ry(),Error(Q(418));for(;e;)Ay(t,e),e=Rr(e.nextSibling)}if(rv(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(Q(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){kn=Rr(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}kn=null}}else kn=Dn?Rr(t.stateNode.nextSibling):null;return!0}function Ry(){for(var t=kn;t;)t=Rr(t.nextSibling)}function uo(){kn=Dn=null,gt=!1}function Ed(t){pi===null?pi=[t]:pi.push(t)}var GS=Ji.ReactCurrentBatchConfig;function ma(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(Q(309));var i=n.stateNode}if(!i)throw Error(Q(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var a=r.refs;o===null?delete a[s]:a[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(Q(284));if(!n._owner)throw Error(Q(290,t))}return t}function sc(t,e){throw t=Object.prototype.toString.call(e),Error(Q(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function sv(t){var e=t._init;return e(t._payload)}function Cy(t){function e(f,y){if(t){var v=f.deletions;v===null?(f.deletions=[y],f.flags|=16):v.push(y)}}function n(f,y){if(!t)return null;for(;y!==null;)e(f,y),y=y.sibling;return null}function i(f,y){for(f=new Map;y!==null;)y.key!==null?f.set(y.key,y):f.set(y.index,y),y=y.sibling;return f}function r(f,y){return f=Lr(f,y),f.index=0,f.sibling=null,f}function s(f,y,v){return f.index=v,t?(v=f.alternate,v!==null?(v=v.index,v<y?(f.flags|=2,y):v):(f.flags|=2,y)):(f.flags|=1048576,y)}function o(f){return t&&f.alternate===null&&(f.flags|=2),f}function a(f,y,v,M){return y===null||y.tag!==6?(y=ff(v,f.mode,M),y.return=f,y):(y=r(y,v),y.return=f,y)}function l(f,y,v,M){var R=v.type;return R===Xs?u(f,y,v.props.children,M,v.key):y!==null&&(y.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===xr&&sv(R)===y.type)?(M=r(y,v.props),M.ref=ma(f,y,v),M.return=f,M):(M=yc(v.type,v.key,v.props,null,f.mode,M),M.ref=ma(f,y,v),M.return=f,M)}function c(f,y,v,M){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=df(v,f.mode,M),y.return=f,y):(y=r(y,v.children||[]),y.return=f,y)}function u(f,y,v,M,R){return y===null||y.tag!==7?(y=hs(v,f.mode,M,R),y.return=f,y):(y=r(y,v),y.return=f,y)}function h(f,y,v){if(typeof y=="string"&&y!==""||typeof y=="number")return y=ff(""+y,f.mode,v),y.return=f,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Wl:return v=yc(y.type,y.key,y.props,null,f.mode,v),v.ref=ma(f,null,y),v.return=f,v;case Ws:return y=df(y,f.mode,v),y.return=f,y;case xr:var M=y._init;return h(f,M(y._payload),v)}if(_a(y)||ha(y))return y=hs(y,f.mode,v,null),y.return=f,y;sc(f,y)}return null}function d(f,y,v,M){var R=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return R!==null?null:a(f,y,""+v,M);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Wl:return v.key===R?l(f,y,v,M):null;case Ws:return v.key===R?c(f,y,v,M):null;case xr:return R=v._init,d(f,y,R(v._payload),M)}if(_a(v)||ha(v))return R!==null?null:u(f,y,v,M,null);sc(f,v)}return null}function p(f,y,v,M,R){if(typeof M=="string"&&M!==""||typeof M=="number")return f=f.get(v)||null,a(y,f,""+M,R);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case Wl:return f=f.get(M.key===null?v:M.key)||null,l(y,f,M,R);case Ws:return f=f.get(M.key===null?v:M.key)||null,c(y,f,M,R);case xr:var T=M._init;return p(f,y,v,T(M._payload),R)}if(_a(M)||ha(M))return f=f.get(v)||null,u(y,f,M,R,null);sc(y,M)}return null}function m(f,y,v,M){for(var R=null,T=null,E=y,A=y=0,L=null;E!==null&&A<v.length;A++){E.index>A?(L=E,E=null):L=E.sibling;var _=d(f,E,v[A],M);if(_===null){E===null&&(E=L);break}t&&E&&_.alternate===null&&e(f,E),y=s(_,y,A),T===null?R=_:T.sibling=_,T=_,E=L}if(A===v.length)return n(f,E),gt&&ss(f,A),R;if(E===null){for(;A<v.length;A++)E=h(f,v[A],M),E!==null&&(y=s(E,y,A),T===null?R=E:T.sibling=E,T=E);return gt&&ss(f,A),R}for(E=i(f,E);A<v.length;A++)L=p(E,f,A,v[A],M),L!==null&&(t&&L.alternate!==null&&E.delete(L.key===null?A:L.key),y=s(L,y,A),T===null?R=L:T.sibling=L,T=L);return t&&E.forEach(function(S){return e(f,S)}),gt&&ss(f,A),R}function x(f,y,v,M){var R=ha(v);if(typeof R!="function")throw Error(Q(150));if(v=R.call(v),v==null)throw Error(Q(151));for(var T=R=null,E=y,A=y=0,L=null,_=v.next();E!==null&&!_.done;A++,_=v.next()){E.index>A?(L=E,E=null):L=E.sibling;var S=d(f,E,_.value,M);if(S===null){E===null&&(E=L);break}t&&E&&S.alternate===null&&e(f,E),y=s(S,y,A),T===null?R=S:T.sibling=S,T=S,E=L}if(_.done)return n(f,E),gt&&ss(f,A),R;if(E===null){for(;!_.done;A++,_=v.next())_=h(f,_.value,M),_!==null&&(y=s(_,y,A),T===null?R=_:T.sibling=_,T=_);return gt&&ss(f,A),R}for(E=i(f,E);!_.done;A++,_=v.next())_=p(E,f,A,_.value,M),_!==null&&(t&&_.alternate!==null&&E.delete(_.key===null?A:_.key),y=s(_,y,A),T===null?R=_:T.sibling=_,T=_);return t&&E.forEach(function(U){return e(f,U)}),gt&&ss(f,A),R}function g(f,y,v,M){if(typeof v=="object"&&v!==null&&v.type===Xs&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Wl:e:{for(var R=v.key,T=y;T!==null;){if(T.key===R){if(R=v.type,R===Xs){if(T.tag===7){n(f,T.sibling),y=r(T,v.props.children),y.return=f,f=y;break e}}else if(T.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===xr&&sv(R)===T.type){n(f,T.sibling),y=r(T,v.props),y.ref=ma(f,T,v),y.return=f,f=y;break e}n(f,T);break}else e(f,T);T=T.sibling}v.type===Xs?(y=hs(v.props.children,f.mode,M,v.key),y.return=f,f=y):(M=yc(v.type,v.key,v.props,null,f.mode,M),M.ref=ma(f,y,v),M.return=f,f=M)}return o(f);case Ws:e:{for(T=v.key;y!==null;){if(y.key===T)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){n(f,y.sibling),y=r(y,v.children||[]),y.return=f,f=y;break e}else{n(f,y);break}else e(f,y);y=y.sibling}y=df(v,f.mode,M),y.return=f,f=y}return o(f);case xr:return T=v._init,g(f,y,T(v._payload),M)}if(_a(v))return m(f,y,v,M);if(ha(v))return x(f,y,v,M);sc(f,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,y!==null&&y.tag===6?(n(f,y.sibling),y=r(y,v),y.return=f,f=y):(n(f,y),y=ff(v,f.mode,M),y.return=f,f=y),o(f)):n(f,y)}return g}var ho=Cy(!0),Py=Cy(!1),Lc=Ur(null),Nc=null,Qs=null,bd=null;function Td(){bd=Qs=Nc=null}function Ad(t){var e=Lc.current;dt(Lc),t._currentValue=e}function Gf(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function oo(t,e){Nc=t,bd=Qs=null,t=t.dependencies,t!==null&&t.firstContext!==null&&((t.lanes&e)!==0&&(wn=!0),t.firstContext=null)}function Qn(t){var e=t._currentValue;if(bd!==t)if(t={context:t,memoizedValue:e,next:null},Qs===null){if(Nc===null)throw Error(Q(308));Qs=t,Nc.dependencies={lanes:0,firstContext:t}}else Qs=Qs.next=t;return e}var ls=null;function Rd(t){ls===null?ls=[t]:ls.push(t)}function Iy(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,Rd(e)):(n.next=r.next,r.next=n),e.interleaved=n,Zi(t,i)}function Zi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var _r=!1;function Cd(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ly(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function qi(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Cr(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,(Ye&2)!==0){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,Zi(t,n)}return r=i.interleaved,r===null?(e.next=e,Rd(i)):(e.next=r.next,r.next=e),i.interleaved=e,Zi(t,n)}function fc(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,pd(t,n)}}function ov(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function kc(t,e,n,i){var r=t.updateQueue;_r=!1;var s=r.firstBaseUpdate,o=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,c=l.next;l.next=null,o===null?s=c:o.next=c,o=l;var u=t.alternate;u!==null&&(u=u.updateQueue,a=u.lastBaseUpdate,a!==o&&(a===null?u.firstBaseUpdate=c:a.next=c,u.lastBaseUpdate=l))}if(s!==null){var h=r.baseState;o=0,u=c=l=null,a=s;do{var d=a.lane,p=a.eventTime;if((i&d)===d){u!==null&&(u=u.next={eventTime:p,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var m=t,x=a;switch(d=e,p=n,x.tag){case 1:if(m=x.payload,typeof m=="function"){h=m.call(p,h,d);break e}h=m;break e;case 3:m.flags=m.flags&-65537|128;case 0:if(m=x.payload,d=typeof m=="function"?m.call(p,h,d):m,d==null)break e;h=_t({},h,d);break e;case 2:_r=!0}}a.callback!==null&&a.lane!==0&&(t.flags|=64,d=r.effects,d===null?r.effects=[a]:d.push(a))}else p={eventTime:p,lane:d,tag:a.tag,payload:a.payload,callback:a.callback,next:null},u===null?(c=u=p,l=h):u=u.next=p,o|=d;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;d=a,a=d.next,d.next=null,r.lastBaseUpdate=d,r.shared.pending=null}}while(!0);if(u===null&&(l=h),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do o|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);ms|=o,t.lanes=o,t.memoizedState=h}}function av(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(Q(191,r));r.call(i)}}}var Ja={},Ii=Ur(Ja),Ga=Ur(Ja),Wa=Ur(Ja);function cs(t){if(t===Ja)throw Error(Q(174));return t}function Pd(t,e){switch(lt(Wa,e),lt(Ga,t),lt(Ii,Ja),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:wf(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=wf(e,t)}dt(Ii),lt(Ii,e)}function fo(){dt(Ii),dt(Ga),dt(Wa)}function Ny(t){cs(Wa.current);var e=cs(Ii.current),n=wf(e,t.type);e!==n&&(lt(Ga,t),lt(Ii,n))}function Id(t){Ga.current===t&&(dt(Ii),dt(Ga))}var yt=Ur(0);function Dc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var of=[];function Ld(){for(var t=0;t<of.length;t++)of[t]._workInProgressVersionPrimary=null;of.length=0}var dc=Ji.ReactCurrentDispatcher,af=Ji.ReactCurrentBatchConfig,ps=0,xt=null,Lt=null,Ut=null,Uc=!1,Ra=!1,Xa=0,WS=0;function jt(){throw Error(Q(321))}function Nd(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!vi(t[n],e[n]))return!1;return!0}function kd(t,e,n,i,r,s){if(ps=s,xt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,dc.current=t===null||t.memoizedState===null?$S:jS,t=n(i,r),Ra){s=0;do{if(Ra=!1,Xa=0,25<=s)throw Error(Q(301));s+=1,Ut=Lt=null,e.updateQueue=null,dc.current=ZS,t=n(i,r)}while(Ra)}if(dc.current=zc,e=Lt!==null&&Lt.next!==null,ps=0,Ut=Lt=xt=null,Uc=!1,e)throw Error(Q(300));return t}function Dd(){var t=Xa!==0;return Xa=0,t}function Ri(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ut===null?xt.memoizedState=Ut=t:Ut=Ut.next=t,Ut}function ei(){if(Lt===null){var t=xt.alternate;t=t!==null?t.memoizedState:null}else t=Lt.next;var e=Ut===null?xt.memoizedState:Ut.next;if(e!==null)Ut=e,Lt=t;else{if(t===null)throw Error(Q(310));Lt=t,t={memoizedState:Lt.memoizedState,baseState:Lt.baseState,baseQueue:Lt.baseQueue,queue:Lt.queue,next:null},Ut===null?xt.memoizedState=Ut=t:Ut=Ut.next=t}return Ut}function Ya(t,e){return typeof e=="function"?e(t):e}function lf(t){var e=ei(),n=e.queue;if(n===null)throw Error(Q(311));n.lastRenderedReducer=t;var i=Lt,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var o=r.next;r.next=s.next,s.next=o}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var a=o=null,l=null,c=s;do{var u=c.lane;if((ps&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:t(i,c.action);else{var h={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(a=l=h,o=i):l=l.next=h,xt.lanes|=u,ms|=u}c=c.next}while(c!==null&&c!==s);l===null?o=i:l.next=a,vi(i,e.memoizedState)||(wn=!0),e.memoizedState=i,e.baseState=o,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,xt.lanes|=s,ms|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function cf(t){var e=ei(),n=e.queue;if(n===null)throw Error(Q(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var o=r=r.next;do s=t(s,o.action),o=o.next;while(o!==r);vi(s,e.memoizedState)||(wn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function ky(){}function Dy(t,e){var n=xt,i=ei(),r=e(),s=!vi(i.memoizedState,r);if(s&&(i.memoizedState=r,wn=!0),i=i.queue,Ud(Oy.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Ut!==null&&Ut.memoizedState.tag&1){if(n.flags|=2048,qa(9,zy.bind(null,n,i,r,e),void 0,null),zt===null)throw Error(Q(349));(ps&30)!==0||Uy(n,e,r)}return r}function Uy(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=xt.updateQueue,e===null?(e={lastEffect:null,stores:null},xt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function zy(t,e,n,i){e.value=n,e.getSnapshot=i,Fy(e)&&By(t)}function Oy(t,e,n){return n(function(){Fy(e)&&By(t)})}function Fy(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!vi(t,n)}catch{return!0}}function By(t){var e=Zi(t,1);e!==null&&gi(e,t,1,-1)}function lv(t){var e=Ri();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ya,lastRenderedState:t},e.queue=t,t=t.dispatch=qS.bind(null,xt,t),[e.memoizedState,t]}function qa(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=xt.updateQueue,e===null?(e={lastEffect:null,stores:null},xt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function Hy(){return ei().memoizedState}function pc(t,e,n,i){var r=Ri();xt.flags|=t,r.memoizedState=qa(1|e,n,void 0,i===void 0?null:i)}function jc(t,e,n,i){var r=ei();i=i===void 0?null:i;var s=void 0;if(Lt!==null){var o=Lt.memoizedState;if(s=o.destroy,i!==null&&Nd(i,o.deps)){r.memoizedState=qa(e,n,s,i);return}}xt.flags|=t,r.memoizedState=qa(1|e,n,s,i)}function cv(t,e){return pc(8390656,8,t,e)}function Ud(t,e){return jc(2048,8,t,e)}function Vy(t,e){return jc(4,2,t,e)}function Gy(t,e){return jc(4,4,t,e)}function Wy(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Xy(t,e,n){return n=n!=null?n.concat([t]):null,jc(4,4,Wy.bind(null,e,t),n)}function zd(){}function Yy(t,e){var n=ei();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Nd(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function qy(t,e){var n=ei();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Nd(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function $y(t,e,n){return(ps&21)===0?(t.baseState&&(t.baseState=!1,wn=!0),t.memoizedState=n):(vi(n,e)||(n=Qv(),xt.lanes|=n,ms|=n,t.baseState=!0),e)}function XS(t,e){var n=tt;tt=n!==0&&4>n?n:4,t(!0);var i=af.transition;af.transition={};try{t(!1),e()}finally{tt=n,af.transition=i}}function jy(){return ei().memoizedState}function YS(t,e,n){var i=Ir(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},Zy(t))Ky(e,n);else if(n=Iy(t,e,n,i),n!==null){var r=hn();gi(n,t,i,r),Jy(n,e,i)}}function qS(t,e,n){var i=Ir(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(Zy(t))Ky(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,a=s(o,n);if(r.hasEagerState=!0,r.eagerState=a,vi(a,o)){var l=e.interleaved;l===null?(r.next=r,Rd(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=Iy(t,e,r,i),n!==null&&(r=hn(),gi(n,t,i,r),Jy(n,e,i))}}function Zy(t){var e=t.alternate;return t===xt||e!==null&&e===xt}function Ky(t,e){Ra=Uc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Jy(t,e,n){if((n&4194240)!==0){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,pd(t,n)}}var zc={readContext:Qn,useCallback:jt,useContext:jt,useEffect:jt,useImperativeHandle:jt,useInsertionEffect:jt,useLayoutEffect:jt,useMemo:jt,useReducer:jt,useRef:jt,useState:jt,useDebugValue:jt,useDeferredValue:jt,useTransition:jt,useMutableSource:jt,useSyncExternalStore:jt,useId:jt,unstable_isNewReconciler:!1},$S={readContext:Qn,useCallback:function(t,e){return Ri().memoizedState=[t,e===void 0?null:e],t},useContext:Qn,useEffect:cv,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,pc(4194308,4,Wy.bind(null,e,t),n)},useLayoutEffect:function(t,e){return pc(4194308,4,t,e)},useInsertionEffect:function(t,e){return pc(4,2,t,e)},useMemo:function(t,e){var n=Ri();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Ri();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=YS.bind(null,xt,t),[i.memoizedState,t]},useRef:function(t){var e=Ri();return t={current:t},e.memoizedState=t},useState:lv,useDebugValue:zd,useDeferredValue:function(t){return Ri().memoizedState=t},useTransition:function(){var t=lv(!1),e=t[0];return t=XS.bind(null,t[1]),Ri().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=xt,r=Ri();if(gt){if(n===void 0)throw Error(Q(407));n=n()}else{if(n=e(),zt===null)throw Error(Q(349));(ps&30)!==0||Uy(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,cv(Oy.bind(null,i,s,t),[t]),i.flags|=2048,qa(9,zy.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Ri(),e=zt.identifierPrefix;if(gt){var n=Yi,i=Xi;n=(i&~(1<<32-mi(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=Xa++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=WS++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},jS={readContext:Qn,useCallback:Yy,useContext:Qn,useEffect:Ud,useImperativeHandle:Xy,useInsertionEffect:Vy,useLayoutEffect:Gy,useMemo:qy,useReducer:lf,useRef:Hy,useState:function(){return lf(Ya)},useDebugValue:zd,useDeferredValue:function(t){var e=ei();return $y(e,Lt.memoizedState,t)},useTransition:function(){var t=lf(Ya)[0],e=ei().memoizedState;return[t,e]},useMutableSource:ky,useSyncExternalStore:Dy,useId:jy,unstable_isNewReconciler:!1},ZS={readContext:Qn,useCallback:Yy,useContext:Qn,useEffect:Ud,useImperativeHandle:Xy,useInsertionEffect:Vy,useLayoutEffect:Gy,useMemo:qy,useReducer:cf,useRef:Hy,useState:function(){return cf(Ya)},useDebugValue:zd,useDeferredValue:function(t){var e=ei();return Lt===null?e.memoizedState=t:$y(e,Lt.memoizedState,t)},useTransition:function(){var t=cf(Ya)[0],e=ei().memoizedState;return[t,e]},useMutableSource:ky,useSyncExternalStore:Dy,useId:jy,unstable_isNewReconciler:!1};function fi(t,e){if(t&&t.defaultProps){e=_t({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Wf(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:_t({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Zc={isMounted:function(t){return(t=t._reactInternals)?ys(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=hn(),r=Ir(t),s=qi(i,r);s.payload=e,n!=null&&(s.callback=n),e=Cr(t,s,r),e!==null&&(gi(e,t,r,i),fc(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=hn(),r=Ir(t),s=qi(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=Cr(t,s,r),e!==null&&(gi(e,t,r,i),fc(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=hn(),i=Ir(t),r=qi(n,i);r.tag=2,e!=null&&(r.callback=e),e=Cr(t,r,i),e!==null&&(gi(e,t,i,n),fc(e,t,i))}};function uv(t,e,n,i,r,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,o):e.prototype&&e.prototype.isPureReactComponent?!Fa(n,i)||!Fa(r,s):!0}function Qy(t,e,n){var i=!1,r=kr,s=e.contextType;return typeof s=="object"&&s!==null?s=Qn(s):(r=bn(e)?fs:Jt.current,i=e.contextTypes,s=(i=i!=null)?co(t,r):kr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Zc,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function hv(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Zc.enqueueReplaceState(e,e.state,null)}function Xf(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},Cd(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Qn(s):(s=bn(e)?fs:Jt.current,r.context=co(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Wf(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&Zc.enqueueReplaceState(r,r.state,null),kc(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function po(t,e){try{var n="",i=e;do n+=TM(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function uf(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Yf(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var KS=typeof WeakMap=="function"?WeakMap:Map;function ex(t,e,n){n=qi(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){Fc||(Fc=!0,nd=i),Yf(t,e)},n}function tx(t,e,n){n=qi(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Yf(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Yf(t,e),typeof i!="function"&&(Pr===null?Pr=new Set([this]):Pr.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function fv(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new KS;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=hw.bind(null,t,e,n),e.then(t,t))}function dv(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function pv(t,e,n,i,r){return(t.mode&1)===0?(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=qi(-1,1),e.tag=2,Cr(n,e,1))),n.lanes|=1),t):(t.flags|=65536,t.lanes=r,t)}var JS=Ji.ReactCurrentOwner,wn=!1;function un(t,e,n,i){e.child=t===null?Py(e,null,n,i):ho(e,t.child,n,i)}function mv(t,e,n,i,r){n=n.render;var s=e.ref;return oo(e,r),i=kd(t,e,n,i,s,r),n=Dd(),t!==null&&!wn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,Ki(t,e,r)):(gt&&n&&Sd(e),e.flags|=1,un(t,e,i,r),e.child)}function gv(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!Xd(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,nx(t,e,s,i,r)):(t=yc(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,(t.lanes&r)===0){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:Fa,n(o,i)&&t.ref===e.ref)return Ki(t,e,r)}return e.flags|=1,t=Lr(s,i),t.ref=e.ref,t.return=e,e.child=t}function nx(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(Fa(s,i)&&t.ref===e.ref)if(wn=!1,e.pendingProps=i=s,(t.lanes&r)!==0)(t.flags&131072)!==0&&(wn=!0);else return e.lanes=t.lanes,Ki(t,e,r)}return qf(t,e,n,i,r)}function ix(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if((e.mode&1)===0)e.memoizedState={baseLanes:0,cachePool:null,transitions:null},lt(to,Nn),Nn|=n;else{if((n&1073741824)===0)return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,lt(to,Nn),Nn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,lt(to,Nn),Nn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,lt(to,Nn),Nn|=i;return un(t,e,r,n),e.child}function rx(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function qf(t,e,n,i,r){var s=bn(n)?fs:Jt.current;return s=co(e,s),oo(e,r),n=kd(t,e,n,i,s,r),i=Dd(),t!==null&&!wn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,Ki(t,e,r)):(gt&&i&&Sd(e),e.flags|=1,un(t,e,n,r),e.child)}function vv(t,e,n,i,r){if(bn(n)){var s=!0;Cc(e)}else s=!1;if(oo(e,r),e.stateNode===null)mc(t,e),Qy(e,n,i),Xf(e,n,i,r),i=!0;else if(t===null){var o=e.stateNode,a=e.memoizedProps;o.props=a;var l=o.context,c=n.contextType;typeof c=="object"&&c!==null?c=Qn(c):(c=bn(n)?fs:Jt.current,c=co(e,c));var u=n.getDerivedStateFromProps,h=typeof u=="function"||typeof o.getSnapshotBeforeUpdate=="function";h||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==i||l!==c)&&hv(e,o,i,c),_r=!1;var d=e.memoizedState;o.state=d,kc(e,i,o,r),l=e.memoizedState,a!==i||d!==l||En.current||_r?(typeof u=="function"&&(Wf(e,n,u,i),l=e.memoizedState),(a=_r||uv(e,n,a,i,d,l,c))?(h||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),o.props=i,o.state=l,o.context=c,i=a):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{o=e.stateNode,Ly(t,e),a=e.memoizedProps,c=e.type===e.elementType?a:fi(e.type,a),o.props=c,h=e.pendingProps,d=o.context,l=n.contextType,typeof l=="object"&&l!==null?l=Qn(l):(l=bn(n)?fs:Jt.current,l=co(e,l));var p=n.getDerivedStateFromProps;(u=typeof p=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==h||d!==l)&&hv(e,o,i,l),_r=!1,d=e.memoizedState,o.state=d,kc(e,i,o,r);var m=e.memoizedState;a!==h||d!==m||En.current||_r?(typeof p=="function"&&(Wf(e,n,p,i),m=e.memoizedState),(c=_r||uv(e,n,c,i,d,m,l)||!1)?(u||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(i,m,l),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(i,m,l)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=m),o.props=i,o.state=m,o.context=l,i=c):(typeof o.componentDidUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),i=!1)}return $f(t,e,n,i,s,r)}function $f(t,e,n,i,r,s){rx(t,e);var o=(e.flags&128)!==0;if(!i&&!o)return r&&nv(e,n,!1),Ki(t,e,s);i=e.stateNode,JS.current=e;var a=o&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&o?(e.child=ho(e,t.child,null,s),e.child=ho(e,null,a,s)):un(t,e,a,s),e.memoizedState=i.state,r&&nv(e,n,!0),e.child}function sx(t){var e=t.stateNode;e.pendingContext?tv(t,e.pendingContext,e.pendingContext!==e.context):e.context&&tv(t,e.context,!1),Pd(t,e.containerInfo)}function yv(t,e,n,i,r){return uo(),Ed(r),e.flags|=256,un(t,e,n,i),e.child}var jf={dehydrated:null,treeContext:null,retryLane:0};function Zf(t){return{baseLanes:t,cachePool:null,transitions:null}}function ox(t,e,n){var i=e.pendingProps,r=yt.current,s=!1,o=(e.flags&128)!==0,a;if((a=o)||(a=t!==null&&t.memoizedState===null?!1:(r&2)!==0),a?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),lt(yt,r&1),t===null)return Vf(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?((e.mode&1)===0?e.lanes=1:t.data==="$!"?e.lanes=8:e.lanes=1073741824,null):(o=i.children,t=i.fallback,s?(i=e.mode,s=e.child,o={mode:"hidden",children:o},(i&1)===0&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Qc(o,i,0,null),t=hs(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Zf(n),e.memoizedState=jf,t):Od(e,o));if(r=t.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return QS(t,e,o,i,a,r,n);if(s){s=i.fallback,o=e.mode,r=t.child,a=r.sibling;var l={mode:"hidden",children:i.children};return(o&1)===0&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=Lr(r,l),i.subtreeFlags=r.subtreeFlags&14680064),a!==null?s=Lr(a,s):(s=hs(s,o,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,o=t.child.memoizedState,o=o===null?Zf(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=jf,i}return s=t.child,t=s.sibling,i=Lr(s,{mode:"visible",children:i.children}),(e.mode&1)===0&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Od(t,e){return e=Qc({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function oc(t,e,n,i){return i!==null&&Ed(i),ho(e,t.child,null,n),t=Od(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function QS(t,e,n,i,r,s,o){if(n)return e.flags&256?(e.flags&=-257,i=uf(Error(Q(422))),oc(t,e,o,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=Qc({mode:"visible",children:i.children},r,0,null),s=hs(s,r,o,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,(e.mode&1)!==0&&ho(e,t.child,null,o),e.child.memoizedState=Zf(o),e.memoizedState=jf,s);if((e.mode&1)===0)return oc(t,e,o,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var a=i.dgst;return i=a,s=Error(Q(419)),i=uf(s,i,void 0),oc(t,e,o,i)}if(a=(o&t.childLanes)!==0,wn||a){if(i=zt,i!==null){switch(o&-o){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=(r&(i.suspendedLanes|o))!==0?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,Zi(t,r),gi(i,t,r,-1))}return Wd(),i=uf(Error(Q(421))),oc(t,e,o,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=fw.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,kn=Rr(r.nextSibling),Dn=e,gt=!0,pi=null,t!==null&&(jn[Zn++]=Xi,jn[Zn++]=Yi,jn[Zn++]=ds,Xi=t.id,Yi=t.overflow,ds=e),e=Od(e,i.children),e.flags|=4096,e)}function xv(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Gf(t.return,e,n)}function hf(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function ax(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(un(t,e,i.children,n),i=yt.current,(i&2)!==0)i=i&1|2,e.flags|=128;else{if(t!==null&&(t.flags&128)!==0)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&xv(t,n,e);else if(t.tag===19)xv(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(lt(yt,i),(e.mode&1)===0)e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&Dc(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),hf(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&Dc(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}hf(e,!0,n,null,s);break;case"together":hf(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function mc(t,e){(e.mode&1)===0&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Ki(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),ms|=e.lanes,(n&e.childLanes)===0)return null;if(t!==null&&e.child!==t.child)throw Error(Q(153));if(e.child!==null){for(t=e.child,n=Lr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Lr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function ew(t,e,n){switch(e.tag){case 3:sx(e),uo();break;case 5:Ny(e);break;case 1:bn(e.type)&&Cc(e);break;case 4:Pd(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;lt(Lc,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(lt(yt,yt.current&1),e.flags|=128,null):(n&e.child.childLanes)!==0?ox(t,e,n):(lt(yt,yt.current&1),t=Ki(t,e,n),t!==null?t.sibling:null);lt(yt,yt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,(t.flags&128)!==0){if(i)return ax(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),lt(yt,yt.current),i)break;return null;case 22:case 23:return e.lanes=0,ix(t,e,n)}return Ki(t,e,n)}var lx,Kf,cx,ux;lx=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Kf=function(){};cx=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,cs(Ii.current);var s=null;switch(n){case"input":r=xf(t,r),i=xf(t,i),s=[];break;case"select":r=_t({},r,{value:void 0}),i=_t({},i,{value:void 0}),s=[];break;case"textarea":r=Sf(t,r),i=Sf(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=Ac)}Ef(n,i);var o;n=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var a=r[c];for(o in a)a.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(La.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(a=r?.[c],i.hasOwnProperty(c)&&l!==a&&(l!=null||a!=null))if(c==="style")if(a){for(o in a)!a.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in l)l.hasOwnProperty(o)&&a[o]!==l[o]&&(n||(n={}),n[o]=l[o])}else n||(s||(s=[]),s.push(c,n)),n=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(La.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&ft("scroll",t),s||a===l||(s=[])):(s=s||[]).push(c,l))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};ux=function(t,e,n,i){n!==i&&(e.flags|=4)};function ga(t,e){if(!gt)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function Zt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function tw(t,e,n){var i=e.pendingProps;switch(wd(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Zt(e),null;case 1:return bn(e.type)&&Rc(),Zt(e),null;case 3:return i=e.stateNode,fo(),dt(En),dt(Jt),Ld(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(rc(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,pi!==null&&(sd(pi),pi=null))),Kf(t,e),Zt(e),null;case 5:Id(e);var r=cs(Wa.current);if(n=e.type,t!==null&&e.stateNode!=null)cx(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(Q(166));return Zt(e),null}if(t=cs(Ii.current),rc(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Ci]=e,i[Va]=s,t=(e.mode&1)!==0,n){case"dialog":ft("cancel",i),ft("close",i);break;case"iframe":case"object":case"embed":ft("load",i);break;case"video":case"audio":for(r=0;r<Sa.length;r++)ft(Sa[r],i);break;case"source":ft("error",i);break;case"img":case"image":case"link":ft("error",i),ft("load",i);break;case"details":ft("toggle",i);break;case"input":Ag(i,s),ft("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},ft("invalid",i);break;case"textarea":Cg(i,s),ft("invalid",i)}Ef(n,s),r=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?i.textContent!==a&&(s.suppressHydrationWarning!==!0&&ic(i.textContent,a,t),r=["children",a]):typeof a=="number"&&i.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&ic(i.textContent,a,t),r=["children",""+a]):La.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&ft("scroll",i)}switch(n){case"input":Xl(i),Rg(i,s,!0);break;case"textarea":Xl(i),Pg(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=Ac)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{o=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=Ov(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=o.createElement(n,{is:i.is}):(t=o.createElement(n),n==="select"&&(o=t,i.multiple?o.multiple=!0:i.size&&(o.size=i.size))):t=o.createElementNS(t,n),t[Ci]=e,t[Va]=i,lx(t,e,!1,!1),e.stateNode=t;e:{switch(o=bf(n,i),n){case"dialog":ft("cancel",t),ft("close",t),r=i;break;case"iframe":case"object":case"embed":ft("load",t),r=i;break;case"video":case"audio":for(r=0;r<Sa.length;r++)ft(Sa[r],t);r=i;break;case"source":ft("error",t),r=i;break;case"img":case"image":case"link":ft("error",t),ft("load",t),r=i;break;case"details":ft("toggle",t),r=i;break;case"input":Ag(t,i),r=xf(t,i),ft("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=_t({},i,{value:void 0}),ft("invalid",t);break;case"textarea":Cg(t,i),r=Sf(t,i),ft("invalid",t);break;default:r=i}Ef(n,r),a=r;for(s in a)if(a.hasOwnProperty(s)){var l=a[s];s==="style"?Hv(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Fv(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&Na(t,l):typeof l=="number"&&Na(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(La.hasOwnProperty(s)?l!=null&&s==="onScroll"&&ft("scroll",t):l!=null&&ld(t,s,l,o))}switch(n){case"input":Xl(t),Rg(t,i,!1);break;case"textarea":Xl(t),Pg(t);break;case"option":i.value!=null&&t.setAttribute("value",""+Nr(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?no(t,!!i.multiple,s,!1):i.defaultValue!=null&&no(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=Ac)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Zt(e),null;case 6:if(t&&e.stateNode!=null)ux(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(Q(166));if(n=cs(Wa.current),cs(Ii.current),rc(e)){if(i=e.stateNode,n=e.memoizedProps,i[Ci]=e,(s=i.nodeValue!==n)&&(t=Dn,t!==null))switch(t.tag){case 3:ic(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&ic(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Ci]=e,e.stateNode=i}return Zt(e),null;case 13:if(dt(yt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(gt&&kn!==null&&(e.mode&1)!==0&&(e.flags&128)===0)Ry(),uo(),e.flags|=98560,s=!1;else if(s=rc(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(Q(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(Q(317));s[Ci]=e}else uo(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;Zt(e),s=!1}else pi!==null&&(sd(pi),pi=null),s=!0;if(!s)return e.flags&65536?e:null}return(e.flags&128)!==0?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,(e.mode&1)!==0&&(t===null||(yt.current&1)!==0?Nt===0&&(Nt=3):Wd())),e.updateQueue!==null&&(e.flags|=4),Zt(e),null);case 4:return fo(),Kf(t,e),t===null&&Ba(e.stateNode.containerInfo),Zt(e),null;case 10:return Ad(e.type._context),Zt(e),null;case 17:return bn(e.type)&&Rc(),Zt(e),null;case 19:if(dt(yt),s=e.memoizedState,s===null)return Zt(e),null;if(i=(e.flags&128)!==0,o=s.rendering,o===null)if(i)ga(s,!1);else{if(Nt!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(o=Dc(t),o!==null){for(e.flags|=128,ga(s,!1),i=o.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return lt(yt,yt.current&1|2),e.child}t=t.sibling}s.tail!==null&&At()>mo&&(e.flags|=128,i=!0,ga(s,!1),e.lanes=4194304)}else{if(!i)if(t=Dc(o),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),ga(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!gt)return Zt(e),null}else 2*At()-s.renderingStartTime>mo&&n!==1073741824&&(e.flags|=128,i=!0,ga(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=At(),e.sibling=null,n=yt.current,lt(yt,i?n&1|2:n&1),e):(Zt(e),null);case 22:case 23:return Gd(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&(e.mode&1)!==0?(Nn&1073741824)!==0&&(Zt(e),e.subtreeFlags&6&&(e.flags|=8192)):Zt(e),null;case 24:return null;case 25:return null}throw Error(Q(156,e.tag))}function nw(t,e){switch(wd(e),e.tag){case 1:return bn(e.type)&&Rc(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return fo(),dt(En),dt(Jt),Ld(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 5:return Id(e),null;case 13:if(dt(yt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(Q(340));uo()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return dt(yt),null;case 4:return fo(),null;case 10:return Ad(e.type._context),null;case 22:case 23:return Gd(),null;case 24:return null;default:return null}}var ac=!1,Kt=!1,iw=typeof WeakSet=="function"?WeakSet:Set,pe=null;function eo(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){wt(t,e,i)}else n.current=null}function Jf(t,e,n){try{n()}catch(i){wt(t,e,i)}}var _v=!1;function rw(t,e){if(Df=Ec,t=my(),Md(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,a=-1,l=-1,c=0,u=0,h=t,d=null;t:for(;;){for(var p;h!==n||r!==0&&h.nodeType!==3||(a=o+r),h!==s||i!==0&&h.nodeType!==3||(l=o+i),h.nodeType===3&&(o+=h.nodeValue.length),(p=h.firstChild)!==null;)d=h,h=p;for(;;){if(h===t)break t;if(d===n&&++c===r&&(a=o),d===s&&++u===i&&(l=o),(p=h.nextSibling)!==null)break;h=d,d=h.parentNode}h=p}n=a===-1||l===-1?null:{start:a,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Uf={focusedElem:t,selectionRange:n},Ec=!1,pe=e;pe!==null;)if(e=pe,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,pe=t;else for(;pe!==null;){e=pe;try{var m=e.alternate;if((e.flags&1024)!==0)switch(e.tag){case 0:case 11:case 15:break;case 1:if(m!==null){var x=m.memoizedProps,g=m.memoizedState,f=e.stateNode,y=f.getSnapshotBeforeUpdate(e.elementType===e.type?x:fi(e.type,x),g);f.__reactInternalSnapshotBeforeUpdate=y}break;case 3:var v=e.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(Q(163))}}catch(M){wt(e,e.return,M)}if(t=e.sibling,t!==null){t.return=e.return,pe=t;break}pe=e.return}return m=_v,_v=!1,m}function Ca(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Jf(e,n,s)}r=r.next}while(r!==i)}}function Kc(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Qf(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function hx(t){var e=t.alternate;e!==null&&(t.alternate=null,hx(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Ci],delete e[Va],delete e[Ff],delete e[BS],delete e[HS])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function fx(t){return t.tag===5||t.tag===3||t.tag===4}function Mv(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||fx(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function ed(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Ac));else if(i!==4&&(t=t.child,t!==null))for(ed(t,e,n),t=t.sibling;t!==null;)ed(t,e,n),t=t.sibling}function td(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(td(t,e,n),t=t.sibling;t!==null;)td(t,e,n),t=t.sibling}var Ht=null,di=!1;function yr(t,e,n){for(n=n.child;n!==null;)dx(t,e,n),n=n.sibling}function dx(t,e,n){if(Pi&&typeof Pi.onCommitFiberUnmount=="function")try{Pi.onCommitFiberUnmount(Gc,n)}catch{}switch(n.tag){case 5:Kt||eo(n,e);case 6:var i=Ht,r=di;Ht=null,yr(t,e,n),Ht=i,di=r,Ht!==null&&(di?(t=Ht,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Ht.removeChild(n.stateNode));break;case 18:Ht!==null&&(di?(t=Ht,n=n.stateNode,t.nodeType===8?rf(t.parentNode,n):t.nodeType===1&&rf(t,n),za(t)):rf(Ht,n.stateNode));break;case 4:i=Ht,r=di,Ht=n.stateNode.containerInfo,di=!0,yr(t,e,n),Ht=i,di=r;break;case 0:case 11:case 14:case 15:if(!Kt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,o=s.destroy;s=s.tag,o!==void 0&&((s&2)!==0||(s&4)!==0)&&Jf(n,e,o),r=r.next}while(r!==i)}yr(t,e,n);break;case 1:if(!Kt&&(eo(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(a){wt(n,e,a)}yr(t,e,n);break;case 21:yr(t,e,n);break;case 22:n.mode&1?(Kt=(i=Kt)||n.memoizedState!==null,yr(t,e,n),Kt=i):yr(t,e,n);break;default:yr(t,e,n)}}function Sv(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new iw),e.forEach(function(i){var r=dw.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function hi(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,o=e,a=o;e:for(;a!==null;){switch(a.tag){case 5:Ht=a.stateNode,di=!1;break e;case 3:Ht=a.stateNode.containerInfo,di=!0;break e;case 4:Ht=a.stateNode.containerInfo,di=!0;break e}a=a.return}if(Ht===null)throw Error(Q(160));dx(s,o,r),Ht=null,di=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){wt(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)px(e,t),e=e.sibling}function px(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(hi(e,t),Ai(t),i&4){try{Ca(3,t,t.return),Kc(3,t)}catch(x){wt(t,t.return,x)}try{Ca(5,t,t.return)}catch(x){wt(t,t.return,x)}}break;case 1:hi(e,t),Ai(t),i&512&&n!==null&&eo(n,n.return);break;case 5:if(hi(e,t),Ai(t),i&512&&n!==null&&eo(n,n.return),t.flags&32){var r=t.stateNode;try{Na(r,"")}catch(x){wt(t,t.return,x)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,a=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&Uv(r,s),bf(a,o);var c=bf(a,s);for(o=0;o<l.length;o+=2){var u=l[o],h=l[o+1];u==="style"?Hv(r,h):u==="dangerouslySetInnerHTML"?Fv(r,h):u==="children"?Na(r,h):ld(r,u,h,c)}switch(a){case"input":_f(r,s);break;case"textarea":zv(r,s);break;case"select":var d=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?no(r,!!s.multiple,p,!1):d!==!!s.multiple&&(s.defaultValue!=null?no(r,!!s.multiple,s.defaultValue,!0):no(r,!!s.multiple,s.multiple?[]:"",!1))}r[Va]=s}catch(x){wt(t,t.return,x)}}break;case 6:if(hi(e,t),Ai(t),i&4){if(t.stateNode===null)throw Error(Q(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(x){wt(t,t.return,x)}}break;case 3:if(hi(e,t),Ai(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{za(e.containerInfo)}catch(x){wt(t,t.return,x)}break;case 4:hi(e,t),Ai(t);break;case 13:hi(e,t),Ai(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Hd=At())),i&4&&Sv(t);break;case 22:if(u=n!==null&&n.memoizedState!==null,t.mode&1?(Kt=(c=Kt)||u,hi(e,t),Kt=c):hi(e,t),Ai(t),i&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!u&&(t.mode&1)!==0)for(pe=t,u=t.child;u!==null;){for(h=pe=u;pe!==null;){switch(d=pe,p=d.child,d.tag){case 0:case 11:case 14:case 15:Ca(4,d,d.return);break;case 1:eo(d,d.return);var m=d.stateNode;if(typeof m.componentWillUnmount=="function"){i=d,n=d.return;try{e=i,m.props=e.memoizedProps,m.state=e.memoizedState,m.componentWillUnmount()}catch(x){wt(i,n,x)}}break;case 5:eo(d,d.return);break;case 22:if(d.memoizedState!==null){Ev(h);continue}}p!==null?(p.return=d,pe=p):Ev(h)}u=u.sibling}e:for(u=null,h=t;;){if(h.tag===5){if(u===null){u=h;try{r=h.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=h.stateNode,l=h.memoizedProps.style,o=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=Bv("display",o))}catch(x){wt(t,t.return,x)}}}else if(h.tag===6){if(u===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(x){wt(t,t.return,x)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===t)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===t)break e;for(;h.sibling===null;){if(h.return===null||h.return===t)break e;u===h&&(u=null),h=h.return}u===h&&(u=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:hi(e,t),Ai(t),i&4&&Sv(t);break;case 21:break;default:hi(e,t),Ai(t)}}function Ai(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(fx(n)){var i=n;break e}n=n.return}throw Error(Q(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(Na(r,""),i.flags&=-33);var s=Mv(t);td(t,s,r);break;case 3:case 4:var o=i.stateNode.containerInfo,a=Mv(t);ed(t,a,o);break;default:throw Error(Q(161))}}catch(l){wt(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function sw(t,e,n){pe=t,mx(t,e,n)}function mx(t,e,n){for(var i=(t.mode&1)!==0;pe!==null;){var r=pe,s=r.child;if(r.tag===22&&i){var o=r.memoizedState!==null||ac;if(!o){var a=r.alternate,l=a!==null&&a.memoizedState!==null||Kt;a=ac;var c=Kt;if(ac=o,(Kt=l)&&!c)for(pe=r;pe!==null;)o=pe,l=o.child,o.tag===22&&o.memoizedState!==null?bv(r):l!==null?(l.return=o,pe=l):bv(r);for(;s!==null;)pe=s,mx(s,e,n),s=s.sibling;pe=r,ac=a,Kt=c}wv(t,e,n)}else(r.subtreeFlags&8772)!==0&&s!==null?(s.return=r,pe=s):wv(t,e,n)}}function wv(t){for(;pe!==null;){var e=pe;if((e.flags&8772)!==0){var n=e.alternate;try{if((e.flags&8772)!==0)switch(e.tag){case 0:case 11:case 15:Kt||Kc(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Kt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:fi(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&av(e,s,i);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}av(e,o,n)}break;case 5:var a=e.stateNode;if(n===null&&e.flags&4){n=a;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var h=u.dehydrated;h!==null&&za(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(Q(163))}Kt||e.flags&512&&Qf(e)}catch(d){wt(e,e.return,d)}}if(e===t){pe=null;break}if(n=e.sibling,n!==null){n.return=e.return,pe=n;break}pe=e.return}}function Ev(t){for(;pe!==null;){var e=pe;if(e===t){pe=null;break}var n=e.sibling;if(n!==null){n.return=e.return,pe=n;break}pe=e.return}}function bv(t){for(;pe!==null;){var e=pe;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Kc(4,e)}catch(l){wt(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){wt(e,r,l)}}var s=e.return;try{Qf(e)}catch(l){wt(e,s,l)}break;case 5:var o=e.return;try{Qf(e)}catch(l){wt(e,o,l)}}}catch(l){wt(e,e.return,l)}if(e===t){pe=null;break}var a=e.sibling;if(a!==null){a.return=e.return,pe=a;break}pe=e.return}}var ow=Math.ceil,Oc=Ji.ReactCurrentDispatcher,Fd=Ji.ReactCurrentOwner,Jn=Ji.ReactCurrentBatchConfig,Ye=0,zt=null,Pt=null,Vt=0,Nn=0,to=Ur(0),Nt=0,$a=null,ms=0,Jc=0,Bd=0,Pa=null,Sn=null,Hd=0,mo=1/0,Gi=null,Fc=!1,nd=null,Pr=null,lc=!1,Er=null,Bc=0,Ia=0,id=null,gc=-1,vc=0;function hn(){return(Ye&6)!==0?At():gc!==-1?gc:gc=At()}function Ir(t){return(t.mode&1)===0?1:(Ye&2)!==0&&Vt!==0?Vt&-Vt:GS.transition!==null?(vc===0&&(vc=Qv()),vc):(t=tt,t!==0||(t=window.event,t=t===void 0?16:oy(t.type)),t)}function gi(t,e,n,i){if(50<Ia)throw Ia=0,id=null,Error(Q(185));ja(t,n,i),((Ye&2)===0||t!==zt)&&(t===zt&&((Ye&2)===0&&(Jc|=n),Nt===4&&Sr(t,Vt)),Tn(t,i),n===1&&Ye===0&&(e.mode&1)===0&&(mo=At()+500,$c&&zr()))}function Tn(t,e){var n=t.callbackNode;XM(t,e);var i=wc(t,t===zt?Vt:0);if(i===0)n!==null&&Ng(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&Ng(n),e===1)t.tag===0?VS(Tv.bind(null,t)):by(Tv.bind(null,t)),OS(function(){(Ye&6)===0&&zr()}),n=null;else{switch(ey(i)){case 1:n=dd;break;case 4:n=Kv;break;case 16:n=Sc;break;case 536870912:n=Jv;break;default:n=Sc}n=wx(n,gx.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function gx(t,e){if(gc=-1,vc=0,(Ye&6)!==0)throw Error(Q(327));var n=t.callbackNode;if(ao()&&t.callbackNode!==n)return null;var i=wc(t,t===zt?Vt:0);if(i===0)return null;if((i&30)!==0||(i&t.expiredLanes)!==0||e)e=Hc(t,i);else{e=i;var r=Ye;Ye|=2;var s=yx();(zt!==t||Vt!==e)&&(Gi=null,mo=At()+500,us(t,e));do try{cw();break}catch(a){vx(t,a)}while(!0);Td(),Oc.current=s,Ye=r,Pt!==null?e=0:(zt=null,Vt=0,e=Nt)}if(e!==0){if(e===2&&(r=Pf(t),r!==0&&(i=r,e=rd(t,r))),e===1)throw n=$a,us(t,0),Sr(t,i),Tn(t,At()),n;if(e===6)Sr(t,i);else{if(r=t.current.alternate,(i&30)===0&&!aw(r)&&(e=Hc(t,i),e===2&&(s=Pf(t),s!==0&&(i=s,e=rd(t,s))),e===1))throw n=$a,us(t,0),Sr(t,i),Tn(t,At()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(Q(345));case 2:os(t,Sn,Gi);break;case 3:if(Sr(t,i),(i&130023424)===i&&(e=Hd+500-At(),10<e)){if(wc(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){hn(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Of(os.bind(null,t,Sn,Gi),e);break}os(t,Sn,Gi);break;case 4:if(Sr(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var o=31-mi(i);s=1<<o,o=e[o],o>r&&(r=o),i&=~s}if(i=r,i=At()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*ow(i/1960))-i,10<i){t.timeoutHandle=Of(os.bind(null,t,Sn,Gi),i);break}os(t,Sn,Gi);break;case 5:os(t,Sn,Gi);break;default:throw Error(Q(329))}}}return Tn(t,At()),t.callbackNode===n?gx.bind(null,t):null}function rd(t,e){var n=Pa;return t.current.memoizedState.isDehydrated&&(us(t,e).flags|=256),t=Hc(t,e),t!==2&&(e=Sn,Sn=n,e!==null&&sd(e)),t}function sd(t){Sn===null?Sn=t:Sn.push.apply(Sn,t)}function aw(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!vi(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Sr(t,e){for(e&=~Bd,e&=~Jc,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-mi(e),i=1<<n;t[n]=-1,e&=~i}}function Tv(t){if((Ye&6)!==0)throw Error(Q(327));ao();var e=wc(t,0);if((e&1)===0)return Tn(t,At()),null;var n=Hc(t,e);if(t.tag!==0&&n===2){var i=Pf(t);i!==0&&(e=i,n=rd(t,i))}if(n===1)throw n=$a,us(t,0),Sr(t,e),Tn(t,At()),n;if(n===6)throw Error(Q(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,os(t,Sn,Gi),Tn(t,At()),null}function Vd(t,e){var n=Ye;Ye|=1;try{return t(e)}finally{Ye=n,Ye===0&&(mo=At()+500,$c&&zr())}}function gs(t){Er!==null&&Er.tag===0&&(Ye&6)===0&&ao();var e=Ye;Ye|=1;var n=Jn.transition,i=tt;try{if(Jn.transition=null,tt=1,t)return t()}finally{tt=i,Jn.transition=n,Ye=e,(Ye&6)===0&&zr()}}function Gd(){Nn=to.current,dt(to)}function us(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,zS(n)),Pt!==null)for(n=Pt.return;n!==null;){var i=n;switch(wd(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Rc();break;case 3:fo(),dt(En),dt(Jt),Ld();break;case 5:Id(i);break;case 4:fo();break;case 13:dt(yt);break;case 19:dt(yt);break;case 10:Ad(i.type._context);break;case 22:case 23:Gd()}n=n.return}if(zt=t,Pt=t=Lr(t.current,null),Vt=Nn=e,Nt=0,$a=null,Bd=Jc=ms=0,Sn=Pa=null,ls!==null){for(e=0;e<ls.length;e++)if(n=ls[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var o=s.next;s.next=r,i.next=o}n.pending=i}ls=null}return t}function vx(t,e){do{var n=Pt;try{if(Td(),dc.current=zc,Uc){for(var i=xt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}Uc=!1}if(ps=0,Ut=Lt=xt=null,Ra=!1,Xa=0,Fd.current=null,n===null||n.return===null){Nt=1,$a=e,Pt=null;break}e:{var s=t,o=n.return,a=n,l=e;if(e=Vt,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=a,h=u.tag;if((u.mode&1)===0&&(h===0||h===11||h===15)){var d=u.alternate;d?(u.updateQueue=d.updateQueue,u.memoizedState=d.memoizedState,u.lanes=d.lanes):(u.updateQueue=null,u.memoizedState=null)}var p=dv(o);if(p!==null){p.flags&=-257,pv(p,o,a,s,e),p.mode&1&&fv(s,c,e),e=p,l=c;var m=e.updateQueue;if(m===null){var x=new Set;x.add(l),e.updateQueue=x}else m.add(l);break e}else{if((e&1)===0){fv(s,c,e),Wd();break e}l=Error(Q(426))}}else if(gt&&a.mode&1){var g=dv(o);if(g!==null){(g.flags&65536)===0&&(g.flags|=256),pv(g,o,a,s,e),Ed(po(l,a));break e}}s=l=po(l,a),Nt!==4&&(Nt=2),Pa===null?Pa=[s]:Pa.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var f=ex(s,l,e);ov(s,f);break e;case 1:a=l;var y=s.type,v=s.stateNode;if((s.flags&128)===0&&(typeof y.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(Pr===null||!Pr.has(v)))){s.flags|=65536,e&=-e,s.lanes|=e;var M=tx(s,a,e);ov(s,M);break e}}s=s.return}while(s!==null)}_x(n)}catch(R){e=R,Pt===n&&n!==null&&(Pt=n=n.return);continue}break}while(!0)}function yx(){var t=Oc.current;return Oc.current=zc,t===null?zc:t}function Wd(){(Nt===0||Nt===3||Nt===2)&&(Nt=4),zt===null||(ms&268435455)===0&&(Jc&268435455)===0||Sr(zt,Vt)}function Hc(t,e){var n=Ye;Ye|=2;var i=yx();(zt!==t||Vt!==e)&&(Gi=null,us(t,e));do try{lw();break}catch(r){vx(t,r)}while(!0);if(Td(),Ye=n,Oc.current=i,Pt!==null)throw Error(Q(261));return zt=null,Vt=0,Nt}function lw(){for(;Pt!==null;)xx(Pt)}function cw(){for(;Pt!==null&&!UM();)xx(Pt)}function xx(t){var e=Sx(t.alternate,t,Nn);t.memoizedProps=t.pendingProps,e===null?_x(t):Pt=e,Fd.current=null}function _x(t){var e=t;do{var n=e.alternate;if(t=e.return,(e.flags&32768)===0){if(n=tw(n,e,Nn),n!==null){Pt=n;return}}else{if(n=nw(n,e),n!==null){n.flags&=32767,Pt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Nt=6,Pt=null;return}}if(e=e.sibling,e!==null){Pt=e;return}Pt=e=t}while(e!==null);Nt===0&&(Nt=5)}function os(t,e,n){var i=tt,r=Jn.transition;try{Jn.transition=null,tt=1,uw(t,e,n,i)}finally{Jn.transition=r,tt=i}return null}function uw(t,e,n,i){do ao();while(Er!==null);if((Ye&6)!==0)throw Error(Q(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(Q(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(YM(t,s),t===zt&&(Pt=zt=null,Vt=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||lc||(lc=!0,wx(Sc,function(){return ao(),null})),s=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||s){s=Jn.transition,Jn.transition=null;var o=tt;tt=1;var a=Ye;Ye|=4,Fd.current=null,rw(t,n),px(n,t),LS(Uf),Ec=!!Df,Uf=Df=null,t.current=n,sw(n,t,r),zM(),Ye=a,tt=o,Jn.transition=s}else t.current=n;if(lc&&(lc=!1,Er=t,Bc=r),s=t.pendingLanes,s===0&&(Pr=null),BM(n.stateNode,i),Tn(t,At()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(Fc)throw Fc=!1,t=nd,nd=null,t;return(Bc&1)!==0&&t.tag!==0&&ao(),s=t.pendingLanes,(s&1)!==0?t===id?Ia++:(Ia=0,id=t):Ia=0,zr(),null}function ao(){if(Er!==null){var t=ey(Bc),e=Jn.transition,n=tt;try{if(Jn.transition=null,tt=16>t?16:t,Er===null)var i=!1;else{if(t=Er,Er=null,Bc=0,(Ye&6)!==0)throw Error(Q(331));var r=Ye;for(Ye|=4,pe=t.current;pe!==null;){var s=pe,o=s.child;if((pe.flags&16)!==0){var a=s.deletions;if(a!==null){for(var l=0;l<a.length;l++){var c=a[l];for(pe=c;pe!==null;){var u=pe;switch(u.tag){case 0:case 11:case 15:Ca(8,u,s)}var h=u.child;if(h!==null)h.return=u,pe=h;else for(;pe!==null;){u=pe;var d=u.sibling,p=u.return;if(hx(u),u===c){pe=null;break}if(d!==null){d.return=p,pe=d;break}pe=p}}}var m=s.alternate;if(m!==null){var x=m.child;if(x!==null){m.child=null;do{var g=x.sibling;x.sibling=null,x=g}while(x!==null)}}pe=s}}if((s.subtreeFlags&2064)!==0&&o!==null)o.return=s,pe=o;else e:for(;pe!==null;){if(s=pe,(s.flags&2048)!==0)switch(s.tag){case 0:case 11:case 15:Ca(9,s,s.return)}var f=s.sibling;if(f!==null){f.return=s.return,pe=f;break e}pe=s.return}}var y=t.current;for(pe=y;pe!==null;){o=pe;var v=o.child;if((o.subtreeFlags&2064)!==0&&v!==null)v.return=o,pe=v;else e:for(o=y;pe!==null;){if(a=pe,(a.flags&2048)!==0)try{switch(a.tag){case 0:case 11:case 15:Kc(9,a)}}catch(R){wt(a,a.return,R)}if(a===o){pe=null;break e}var M=a.sibling;if(M!==null){M.return=a.return,pe=M;break e}pe=a.return}}if(Ye=r,zr(),Pi&&typeof Pi.onPostCommitFiberRoot=="function")try{Pi.onPostCommitFiberRoot(Gc,t)}catch{}i=!0}return i}finally{tt=n,Jn.transition=e}}return!1}function Av(t,e,n){e=po(n,e),e=ex(t,e,1),t=Cr(t,e,1),e=hn(),t!==null&&(ja(t,1,e),Tn(t,e))}function wt(t,e,n){if(t.tag===3)Av(t,t,n);else for(;e!==null;){if(e.tag===3){Av(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Pr===null||!Pr.has(i))){t=po(n,t),t=tx(e,t,1),e=Cr(e,t,1),t=hn(),e!==null&&(ja(e,1,t),Tn(e,t));break}}e=e.return}}function hw(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=hn(),t.pingedLanes|=t.suspendedLanes&n,zt===t&&(Vt&n)===n&&(Nt===4||Nt===3&&(Vt&130023424)===Vt&&500>At()-Hd?us(t,0):Bd|=n),Tn(t,e)}function Mx(t,e){e===0&&((t.mode&1)===0?e=1:(e=$l,$l<<=1,($l&130023424)===0&&($l=4194304)));var n=hn();t=Zi(t,e),t!==null&&(ja(t,e,n),Tn(t,n))}function fw(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Mx(t,n)}function dw(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(Q(314))}i!==null&&i.delete(e),Mx(t,n)}var Sx;Sx=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||En.current)wn=!0;else{if((t.lanes&n)===0&&(e.flags&128)===0)return wn=!1,ew(t,e,n);wn=(t.flags&131072)!==0}else wn=!1,gt&&(e.flags&1048576)!==0&&Ty(e,Ic,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;mc(t,e),t=e.pendingProps;var r=co(e,Jt.current);oo(e,n),r=kd(null,e,i,t,r,n);var s=Dd();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,bn(i)?(s=!0,Cc(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Cd(e),r.updater=Zc,e.stateNode=r,r._reactInternals=e,Xf(e,i,t,n),e=$f(null,e,i,!0,s,n)):(e.tag=0,gt&&s&&Sd(e),un(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(mc(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=mw(i),t=fi(i,t),r){case 0:e=qf(null,e,i,t,n);break e;case 1:e=vv(null,e,i,t,n);break e;case 11:e=mv(null,e,i,t,n);break e;case 14:e=gv(null,e,i,fi(i.type,t),n);break e}throw Error(Q(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:fi(i,r),qf(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:fi(i,r),vv(t,e,i,r,n);case 3:e:{if(sx(e),t===null)throw Error(Q(387));i=e.pendingProps,s=e.memoizedState,r=s.element,Ly(t,e),kc(e,i,null,n);var o=e.memoizedState;if(i=o.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=po(Error(Q(423)),e),e=yv(t,e,i,n,r);break e}else if(i!==r){r=po(Error(Q(424)),e),e=yv(t,e,i,n,r);break e}else for(kn=Rr(e.stateNode.containerInfo.firstChild),Dn=e,gt=!0,pi=null,n=Py(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(uo(),i===r){e=Ki(t,e,n);break e}un(t,e,i,n)}e=e.child}return e;case 5:return Ny(e),t===null&&Vf(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,o=r.children,zf(i,r)?o=null:s!==null&&zf(i,s)&&(e.flags|=32),rx(t,e),un(t,e,o,n),e.child;case 6:return t===null&&Vf(e),null;case 13:return ox(t,e,n);case 4:return Pd(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=ho(e,null,i,n):un(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:fi(i,r),mv(t,e,i,r,n);case 7:return un(t,e,e.pendingProps,n),e.child;case 8:return un(t,e,e.pendingProps.children,n),e.child;case 12:return un(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,o=r.value,lt(Lc,i._currentValue),i._currentValue=o,s!==null)if(vi(s.value,o)){if(s.children===r.children&&!En.current){e=Ki(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var l=a.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=qi(-1,n&-n),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Gf(s.return,n,e),a.lanes|=n;break}l=l.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(Q(341));o.lanes|=n,a=o.alternate,a!==null&&(a.lanes|=n),Gf(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}un(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,oo(e,n),r=Qn(r),i=i(r),e.flags|=1,un(t,e,i,n),e.child;case 14:return i=e.type,r=fi(i,e.pendingProps),r=fi(i.type,r),gv(t,e,i,r,n);case 15:return nx(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:fi(i,r),mc(t,e),e.tag=1,bn(i)?(t=!0,Cc(e)):t=!1,oo(e,n),Qy(e,i,r),Xf(e,i,r,n),$f(null,e,i,!0,t,n);case 19:return ax(t,e,n);case 22:return ix(t,e,n)}throw Error(Q(156,e.tag))};function wx(t,e){return Zv(t,e)}function pw(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Kn(t,e,n,i){return new pw(t,e,n,i)}function Xd(t){return t=t.prototype,!(!t||!t.isReactComponent)}function mw(t){if(typeof t=="function")return Xd(t)?1:0;if(t!=null){if(t=t.$$typeof,t===ud)return 11;if(t===hd)return 14}return 2}function Lr(t,e){var n=t.alternate;return n===null?(n=Kn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function yc(t,e,n,i,r,s){var o=2;if(i=t,typeof t=="function")Xd(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Xs:return hs(n.children,r,s,e);case cd:o=8,r|=8;break;case mf:return t=Kn(12,n,e,r|2),t.elementType=mf,t.lanes=s,t;case gf:return t=Kn(13,n,e,r),t.elementType=gf,t.lanes=s,t;case vf:return t=Kn(19,n,e,r),t.elementType=vf,t.lanes=s,t;case Nv:return Qc(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Iv:o=10;break e;case Lv:o=9;break e;case ud:o=11;break e;case hd:o=14;break e;case xr:o=16,i=null;break e}throw Error(Q(130,t==null?t:typeof t,""))}return e=Kn(o,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function hs(t,e,n,i){return t=Kn(7,t,i,e),t.lanes=n,t}function Qc(t,e,n,i){return t=Kn(22,t,i,e),t.elementType=Nv,t.lanes=n,t.stateNode={isHidden:!1},t}function ff(t,e,n){return t=Kn(6,t,null,e),t.lanes=n,t}function df(t,e,n){return e=Kn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function gw(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=jh(0),this.expirationTimes=jh(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=jh(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Yd(t,e,n,i,r,s,o,a,l){return t=new gw(t,e,n,a,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Kn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Cd(s),t}function vw(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Ws,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Ex(t){if(!t)return kr;t=t._reactInternals;e:{if(ys(t)!==t||t.tag!==1)throw Error(Q(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(bn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(Q(171))}if(t.tag===1){var n=t.type;if(bn(n))return Ey(t,n,e)}return e}function bx(t,e,n,i,r,s,o,a,l){return t=Yd(n,i,!0,t,r,s,o,a,l),t.context=Ex(null),n=t.current,i=hn(),r=Ir(n),s=qi(i,r),s.callback=e??null,Cr(n,s,r),t.current.lanes=r,ja(t,r,i),Tn(t,i),t}function eu(t,e,n,i){var r=e.current,s=hn(),o=Ir(r);return n=Ex(n),e.context===null?e.context=n:e.pendingContext=n,e=qi(s,o),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=Cr(r,e,o),t!==null&&(gi(t,r,o,s),fc(t,r,o)),o}function Vc(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Rv(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function qd(t,e){Rv(t,e),(t=t.alternate)&&Rv(t,e)}function yw(){return null}var Tx=typeof reportError=="function"?reportError:function(t){console.error(t)};function $d(t){this._internalRoot=t}tu.prototype.render=$d.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(Q(409));eu(t,e,null,null)};tu.prototype.unmount=$d.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;gs(function(){eu(null,t,null,null)}),e[ji]=null}};function tu(t){this._internalRoot=t}tu.prototype.unstable_scheduleHydration=function(t){if(t){var e=iy();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Mr.length&&e!==0&&e<Mr[n].priority;n++);Mr.splice(n,0,t),n===0&&sy(t)}};function jd(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function nu(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Cv(){}function xw(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=Vc(o);s.call(c)}}var o=bx(e,i,t,0,null,!1,!1,"",Cv);return t._reactRootContainer=o,t[ji]=o.current,Ba(t.nodeType===8?t.parentNode:t),gs(),o}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var a=i;i=function(){var c=Vc(l);a.call(c)}}var l=Yd(t,0,!1,null,null,!1,!1,"",Cv);return t._reactRootContainer=l,t[ji]=l.current,Ba(t.nodeType===8?t.parentNode:t),gs(function(){eu(e,l,n,i)}),l}function iu(t,e,n,i,r){var s=n._reactRootContainer;if(s){var o=s;if(typeof r=="function"){var a=r;r=function(){var l=Vc(o);a.call(l)}}eu(e,o,t,r)}else o=xw(n,e,t,r,i);return Vc(o)}ty=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Ma(e.pendingLanes);n!==0&&(pd(e,n|1),Tn(e,At()),(Ye&6)===0&&(mo=At()+500,zr()))}break;case 13:gs(function(){var i=Zi(t,1);if(i!==null){var r=hn();gi(i,t,1,r)}}),qd(t,1)}};md=function(t){if(t.tag===13){var e=Zi(t,134217728);if(e!==null){var n=hn();gi(e,t,134217728,n)}qd(t,134217728)}};ny=function(t){if(t.tag===13){var e=Ir(t),n=Zi(t,e);if(n!==null){var i=hn();gi(n,t,e,i)}qd(t,e)}};iy=function(){return tt};ry=function(t,e){var n=tt;try{return tt=t,e()}finally{tt=n}};Af=function(t,e,n){switch(e){case"input":if(_f(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=qc(i);if(!r)throw Error(Q(90));Dv(i),_f(i,r)}}}break;case"textarea":zv(t,n);break;case"select":e=n.value,e!=null&&no(t,!!n.multiple,e,!1)}};Wv=Vd;Xv=gs;var _w={usingClientEntryPoint:!1,Events:[Ka,js,qc,Vv,Gv,Vd]},va={findFiberByHostInstance:as,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Mw={bundleType:va.bundleType,version:va.version,rendererPackageName:va.rendererPackageName,rendererConfig:va.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Ji.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=$v(t),t===null?null:t.stateNode},findFiberByHostInstance:va.findFiberByHostInstance||yw,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ya=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ya.isDisabled&&ya.supportsFiber))try{Gc=ya.inject(Mw),Pi=ya}catch{}var ya;On.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=_w;On.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!jd(e))throw Error(Q(200));return vw(t,e,null,n)};On.createRoot=function(t,e){if(!jd(t))throw Error(Q(299));var n=!1,i="",r=Tx;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Yd(t,1,!1,null,null,n,!1,i,r),t[ji]=e.current,Ba(t.nodeType===8?t.parentNode:t),new $d(e)};On.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(Q(188)):(t=Object.keys(t).join(","),Error(Q(268,t)));return t=$v(e),t=t===null?null:t.stateNode,t};On.flushSync=function(t){return gs(t)};On.hydrate=function(t,e,n){if(!nu(e))throw Error(Q(200));return iu(null,t,e,!0,n)};On.hydrateRoot=function(t,e,n){if(!jd(t))throw Error(Q(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",o=Tx;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=bx(e,null,t,1,n??null,r,!1,s,o),t[ji]=e.current,Ba(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new tu(e)};On.render=function(t,e,n){if(!nu(e))throw Error(Q(200));return iu(null,t,e,!1,n)};On.unmountComponentAtNode=function(t){if(!nu(t))throw Error(Q(40));return t._reactRootContainer?(gs(function(){iu(null,null,t,!1,function(){t._reactRootContainer=null,t[ji]=null})}),!0):!1};On.unstable_batchedUpdates=Vd;On.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!nu(n))throw Error(Q(200));if(t==null||t._reactInternals===void 0)throw Error(Q(38));return iu(t,e,n,!1,i)};On.version="18.3.1-next-f1338f8080-20240426"});var Px=Vi((TC,Cx)=>{"use strict";function Rx(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rx)}catch(t){console.error(t)}}Rx(),Cx.exports=Ax()});var Lx=Vi(Zd=>{"use strict";var Ix=Px();Zd.createRoot=Ix.createRoot,Zd.hydrateRoot=Ix.hydrateRoot;var AC});var kx=Vi(ou=>{"use strict";var Sw=aa(),ww=Symbol.for("react.element"),Ew=Symbol.for("react.fragment"),bw=Object.prototype.hasOwnProperty,Tw=Sw.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Aw={key:!0,ref:!0,__self:!0,__source:!0};function Nx(t,e,n){var i,r={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(i in e)bw.call(e,i)&&!Aw.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:ww,type:t,key:s,ref:o,props:r,_owner:Tw.current}}ou.Fragment=Ew;ou.jsx=Nx;ou.jsxs=Nx});var Fn=Vi((DC,Dx)=>{"use strict";Dx.exports=kx()});var W1=ln(Lx());var xn=ln(aa());var ru=[{id:"rabbit",label:"Bunny",icon:"bunny",emoji:"\u{1F430}",color:"#ffd0e4"},{id:"panda",label:"Panda",icon:"panda",emoji:"\u{1F43C}",color:"#e5e7eb"},{id:"bear",label:"Bear",icon:"bear",emoji:"\u{1F43B}",color:"#f3dcc8"},{id:"owl",label:"Ghost",icon:"ghost",emoji:"\u{1F47B}",color:"#d9e4ff"},{id:"penguin",label:"Chick",icon:"chick",emoji:"\u{1F425}",color:"#fff4c4"},{id:"octopus",label:"Jelly",icon:"jelly",emoji:"\u{1FABC}",color:"#dcfaef"},{id:"dog",label:"Puppy",icon:"puppy",emoji:"\u{1F436}",color:"#fed7aa"},{id:"fox",label:"Hamster",icon:"hamster",emoji:"\u{1F439}",color:"#fde68a"},{id:"cat",label:"Cat",icon:"cat",emoji:"\u{1F431}",color:"#d9e4ff"},{id:"tiger",label:"Blue Cat",icon:"bluecat",emoji:"\u{1F63A}",color:"#fff4c4"},{id:"dolphin",label:"Turtle",icon:"turtle",emoji:"\u{1F422}",color:"#efe6ff"},{id:"koala",label:"Seal",icon:"seal",emoji:"\u{1F9AD}",color:"#c7d2fe"},{id:"butterfly",label:"Bee",icon:"bee",emoji:"\u{1F41D}",color:"#a5f3fc"},{id:"unicorn",label:"Sheep",icon:"sheep",emoji:"\u{1F411}",color:"#e9d5ff"},{id:"dragon",label:"Piggy",icon:"pig",emoji:"\u{1F437}",color:"#dcfaef"},{id:"alien",label:"Heart",icon:"heart",emoji:"\u{1F497}",color:"#d1fae5"},{id:"whale",label:"Whale",icon:"whale",emoji:"\u{1F433}",color:"#cfe8ff"},{id:"crab",label:"Crab",icon:"crab",emoji:"\u{1F980}",color:"#ffe1d6"},{id:"octo",label:"Octopus",icon:"octo",emoji:"\u{1F419}",color:"#ffe4f1"},{id:"jellyfish",label:"Jellyfish",icon:"jellyfish",emoji:"\u{1FABC}",color:"#dff3ff"},{id:"mole",label:"Mole",icon:"mole",emoji:"\u{1F43E}",color:"#ecdfd0"},{id:"caterpillar",label:"Caterpillar",icon:"caterpillar",emoji:"\u{1F41B}",color:"#e3f9d5"},{id:"ant",label:"Ant",icon:"ant",emoji:"\u{1F41C}",color:"#e2e8f0"},{id:"worm",label:"Worm",icon:"worm",emoji:"\u{1FAB1}",color:"#ffedd5"},{id:"cloud",label:"Cloud",icon:"cloud",emoji:"\u2601\uFE0F",color:"#dbeafe"},{id:"cupcake",label:"Cupcake",icon:"cupcake",emoji:"\u{1F9C1}",color:"#fce7f3"},{id:"snowman",label:"Snowman",icon:"snowman",emoji:"\u26C4",color:"#e0f2fe"},{id:"moon",label:"Moon",icon:"moon",emoji:"\u{1F319}",color:"#ede9fe"},{id:"sun",label:"Sun",icon:"sun",emoji:"\u2600\uFE0F",color:"#fff1c1"},{id:"toast",label:"Toast",icon:"toast",emoji:"\u{1F35E}",color:"#fef3c7"},{id:"melon",label:"Melon",icon:"melon",emoji:"\u{1F349}",color:"#dcfce7"},{id:"flower",label:"Flower",icon:"flower",emoji:"\u{1F338}",color:"#fde2ef"},{id:"floaty",label:"Floaty",icon:"floaty",emoji:"\u{1F6DF}",color:"#dbeafe"},{id:"pearl",label:"Pearl",icon:"pearl",emoji:"\u{1F9AA}",color:"#fef3c7"},{id:"sunflower",label:"Sunflower",icon:"sunflower",emoji:"\u{1F33B}",color:"#dcfce7"},{id:"muncher",label:"Muncher",icon:"muncher",emoji:"\u{1F36A}",color:"#e0f2fe"},{id:"swimbunny",label:"Swim Bunny",icon:"swimbunny",emoji:"\u{1F407}",color:"#fff4c4"},{id:"sunny",label:"Sunny Cloud",icon:"sunny",emoji:"\u26C5",color:"#fff1c1"},{id:"smiley",label:"Smiley",icon:"smiley",emoji:"\u{1F642}",color:"#e9d5ff"},{id:"puff",label:"Puff",icon:"puff",emoji:"\u{1F4AD}",color:"#fecdd3"},{id:"pretzel",label:"Pretzel",icon:"pretzel",emoji:"\u{1F968}",color:"#fef9c3"},{id:"computer",label:"Computer",icon:"computer",emoji:"\u{1F4BB}",color:"#ddd6fe"},{id:"squid",label:"Squid",icon:"squid",emoji:"\u{1F991}",color:"#fbcfe8"},{id:"boo",label:"Boo",icon:"boo",emoji:"\u{1F47B}",color:"#c7d2fe"},{id:"blush",label:"Blush",icon:"blush",emoji:"\u{1F60A}",color:"#ccfbf1"},{id:"lovey",label:"Lovey",icon:"lovey",emoji:"\u{1F60D}",color:"#fef3c7"},{id:"cheeky",label:"Cheeky",icon:"cheeky",emoji:"\u{1F61C}",color:"#dbeafe"},{id:"grumpy",label:"Grumpy",icon:"grumpy",emoji:"\u{1F620}",color:"#e2e8f0"}];function Qa(t){return ru.find(e=>e.id===t)??ru[0]}function su(t){return`/icons/av-${Qa(t).icon}.png`}var Kd=ln(Fn());function el({id:t,size:e=40,border:n=e>=36?3:2,shadow:i=e>=36,style:r,className:s}){let o=Qa(t);return(0,Kd.jsx)("span",{className:s,style:{display:"inline-grid",placeItems:"center",flex:"none",width:e,height:e,borderRadius:"50%",border:`${n}px solid var(--ink)`,background:o.color,boxShadow:i?`0 ${Math.max(2,Math.round(e/14))}px 0 var(--ink)`:void 0,overflow:"hidden",...r},children:(0,Kd.jsx)("img",{src:su(t),alt:o.label,draggable:!1,style:{width:"84%",height:"84%",objectFit:"contain",pointerEvents:"none"}})})}var Ux=t=>`/icons/${t}.png`;var zx=ln(Fn());function Jd({name:t,size:e,alt:n="",style:i,className:r}){return(0,zx.jsx)("img",{src:Ux(t),alt:n,draggable:!1,className:`ec-icon${r?` ${r}`:""}`,style:e!==void 0?{width:e,height:e,...i}:i})}var Qi=[{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"}];var Rw={title:"Chatto Dash",blurb:"Race through five wild obstacle courses. Points for every finish. Most points wins!",players:"Racers",join:"JOIN THE RACE!",leave:"Leave",start:"START!",cancel:"Cancel",waitingHost:"Waiting for the host to start\u2026",courses:"The five courses",howTouch:"Left thumb to run \xB7 JUMP \xB7 DIVE",howKeys:"WASD or arrows to run \xB7 Space to jump \xB7 Shift to dive",round:"Round",getReady:"Get ready!",go:"GO!",jump:"JUMP",dive:"DIVE",finished:"FINISHED!",waitingOthers:"Waiting for the others\u2026",hurry:"Hurry!",watching:"Watching",end:"End",endConfirm:"End the game for everyone?",results:"Results",standings:"Standings",nextIn:"Next course in",nextNow:"Next course",practice:"Practice",practiceBlurb:"Any course, by yourself, against the clock. No connection needed.",best:"Best",noBest:"not run yet",newBest:"New best!",again:"Again",allCourses:"Courses",dnf:"did not finish",pts:"pts",winner:"WINNER!",tie:"IT'S A TIE!",finalResults:"Final results",playAgain:"PLAY AGAIN",close:"Close",minimize:"Minimize",resume:"Resume Chatto Dash",loading:"Building the course\u2026",noWebgl:"This device can't draw the 3D course.",raceOn:"A race is on!",watch:"WATCH"},Cw={title:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5",blurb:"5\u3064\u306E\u30CF\u30C1\u30E3\u30E1\u30C1\u30E3\u969C\u5BB3\u7269\u30B3\u30FC\u30B9\u3092\u8D70\u308A\u306C\u3051\uFF01\u30B4\u30FC\u30EB\u3059\u308B\u305F\u3073\u30DD\u30A4\u30F3\u30C8\u3002\u3044\u3061\u3070\u3093\u591A\u3044\u4EBA\u304C\u512A\u52DD\uFF01",players:"\u30E9\u30F3\u30CA\u30FC",join:"\u30EC\u30FC\u30B9\u306B\u53C2\u52A0\uFF01",leave:"\u306C\u3051\u308B",start:"\u30B9\u30BF\u30FC\u30C8\uFF01",cancel:"\u30AD\u30E3\u30F3\u30BB\u30EB",waitingHost:"\u30DB\u30B9\u30C8\u306E\u30B9\u30BF\u30FC\u30C8\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",courses:"5\u3064\u306E\u30B3\u30FC\u30B9",howTouch:"\u5DE6\u306E\u89AA\u6307\u3067\u8D70\u308B \xB7 \u30B8\u30E3\u30F3\u30D7 \xB7 \u30C0\u30A4\u30D6",howKeys:"WASD\u30FB\u77E2\u5370\u3067\u8D70\u308B \xB7 \u30B9\u30DA\u30FC\u30B9\u3067\u30B8\u30E3\u30F3\u30D7 \xB7 \u30B7\u30D5\u30C8\u3067\u30C0\u30A4\u30D6",round:"\u30E9\u30A6\u30F3\u30C9",getReady:"\u3088\u30FC\u3044\u2026",go:"\u30C9\u30F3\uFF01",jump:"\u30B8\u30E3\u30F3\u30D7",dive:"\u30C0\u30A4\u30D6",finished:"\u30B4\u30FC\u30EB\uFF01",waitingOthers:"\u307F\u3093\u306A\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",hurry:"\u3044\u305D\u3052\uFF01",watching:"\u89B3\u6226\u4E2D",end:"\u7D42\u4E86",endConfirm:"\u307F\u3093\u306A\u306E\u30B2\u30FC\u30E0\u3092\u7D42\u4E86\u3057\u307E\u3059\u304B\uFF1F",results:"\u7D50\u679C",standings:"\u7DCF\u5408\u9806\u4F4D",nextIn:"\u6B21\u306E\u30B3\u30FC\u30B9\u307E\u3067",nextNow:"\u6B21\u306E\u30B3\u30FC\u30B9\u3078",practice:"\u308C\u3093\u3057\u3085\u3046",practiceBlurb:"\u597D\u304D\u306A\u30B3\u30FC\u30B9\u3092\u3072\u3068\u308A\u3067\u30BF\u30A4\u30E0\u30A2\u30BF\u30C3\u30AF\u3002\u901A\u4FE1\u306A\u3057\u3067\u904A\u3079\u307E\u3059\u3002",best:"\u30D9\u30B9\u30C8",noBest:"\u307E\u3060\u8D70\u3063\u3066\u3044\u307E\u305B\u3093",newBest:"\u30D9\u30B9\u30C8\u66F4\u65B0\uFF01",again:"\u3082\u3046\u4E00\u56DE",allCourses:"\u30B3\u30FC\u30B9\u4E00\u89A7",dnf:"\u30B4\u30FC\u30EB\u3067\u304D\u305A",pts:"\u70B9",winner:"\u512A\u52DD\uFF01",tie:"\u5F15\u304D\u5206\u3051\uFF01",finalResults:"\u6700\u7D42\u7D50\u679C",playAgain:"\u3082\u3046\u4E00\u56DE",close:"\u9589\u3058\u308B",minimize:"\u6700\u5C0F\u5316",resume:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5\u3092\u518D\u958B",loading:"\u30B3\u30FC\u30B9\u3092\u6E96\u5099\u4E2D\u2026",noWebgl:"\u3053\u306E\u7AEF\u672B\u3067\u306F3D\u30B3\u30FC\u30B9\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093\u3002",raceOn:"\u30EC\u30FC\u30B9\u4E2D\uFF01",watch:"\u89B3\u6226\u3059\u308B"},tl=t=>t==="ja"?Cw:Rw;function Qd(t,e){if(e==="ja")return`${t}\u4F4D`;let n=t%100;return n>=11&&n<=13?`${t}th`:`${t}${["th","st","nd","rd"][t%10]??"th"}`}function yo(t){let e=Math.max(0,t),n=Math.floor(e/60),i=e-n*60;return`${n}:${i<10?"0":""}${i.toFixed(1)}`}var nl=ln(Fn()),Ox="o-shootingstar";function Fx({children:t,onBackdrop:e}){return(0,nl.jsx)("div",{className:"ec-sheet-backdrop",style:{zIndex:95,alignItems:"center",padding:16},onClick:e,children:(0,nl.jsx)("div",{className:"ec-card",style:{width:"100%",maxWidth:380,maxHeight:"92dvh",overflowY:"auto",padding:"20px 16px 16px",textAlign:"center",background:"var(--paper)",animation:"ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)"},onClick:n=>n.stopPropagation(),children:t})})}var on=ln(aa());var _o=1/60,Pw=30,Iw=11,Lw=6.4,Bx=8.6,il=.42,Hx=.26,ep=1.15,Nw=50,kw=22,Dw=6,Uw=.4,zw=.35,Ow=8,dn={x:0,y:0,z:0,yaw:0},ct={x:0,y:0,z:0,yaw:0},tp={x:0,y:0,z:0,yaw:0},xo={x:0,y:0,z:0,yaw:0};function tr(t,e,n){return t.motion?t.motion(e,n):(n.x=t.x,n.y=t.y,n.z=t.z,n.yaw=t.yaw),n}function Gx(t,e,n){if(t.shape!=="ramp")return e.y+t.hy;let i=Math.max(-t.hz,Math.min(t.hz,n));return e.y+t.hy+t.rise*(t.hz-i)/(2*t.hz)}function Wx(t,e){let n=Math.floor((e-t.bucketZ0)/8);return t.buckets[n]??Fw}var Fw=[];function Mo(t,e,n,i,r){let s=t.checkpoints[Math.max(0,Math.min(t.checkpoints.length-1,e))],o=Math.min(Ow,Math.max(1,i)),a=Math.floor(n/o),l=n%o;r.x=s.x+((l+.5)/o-.5)*s.width,r.y=s.y+.02,r.z=s.z+.6+a*1.1}function Xx(t,e=0,n=1){let i={x:0,y:0,z:0,vx:0,vy:0,vz:0,fx:0,fz:-1,grounded:!1,ground:-1,coyote:0,jumpBuffer:0,jumpHeld:!1,diveHeld:!1,mode:0,modeT:0,diveCooldown:0,shield:0,checkpoint:0,slot:e,slots:n,events:0,falls:0};return Mo(t,0,e,n,i),i}function Vx(t,e,n,i,r,s,o,a){t.vx=e*i+r*.7,t.vz=n*i+s*.7,t.vy=o,t.grounded=!1,t.ground=-1,t.coyote=0,t.events|=4,a&&t.mode!==4?(t.mode=2,t.modeT=.75,t.shield=.35):t.shield=.2}function Yx(t,e,n,i,r){e.events=0;let s=i+r;if(e.mode===3){e.modeT-=r,e.modeT<=0&&(Mo(t,e.checkpoint,e.slot,e.slots,e),e.vx=e.vy=e.vz=0,e.fx=0,e.fz=-1,e.mode=0,e.shield=1.2,e.grounded=!1,e.ground=-1);return}e.coyote=Math.max(0,e.coyote-r),e.jumpBuffer=Math.max(0,e.jumpBuffer-r),e.diveCooldown=Math.max(0,e.diveCooldown-r),e.shield=Math.max(0,e.shield-r);let o=t.solids,a=0,l=0,c=0,u=1,h=!1;if(e.grounded&&e.ground>=0){let A=o[e.ground];if(A.motion){tr(A,i,dn),tr(A,s,ct);let _=e.x-dn.x,S=e.z-dn.z,U=Math.cos(dn.yaw),z=Math.sin(dn.yaw),H=_*U-S*z,Y=_*z+S*U,O=Math.cos(ct.yaw),G=Math.sin(ct.yaw),F=ct.x+H*O+Y*G,ee=ct.z-H*G+Y*O;Math.abs(F-e.x)+Math.abs(ee-e.z)+Math.abs(ct.y-dn.y)<1.5&&(a=(F-e.x)/r,c=(ee-e.z)/r,l=(ct.y-dn.y)/r,e.x=F,e.z=ee,e.y+=ct.y-dn.y);let ne=ct.yaw-dn.yaw;if(ne!==0){let re=Math.cos(ne),Ee=Math.sin(ne),Be=e.fx*re+e.fz*Ee;e.fz=-e.fx*Ee+e.fz*re,e.fx=Be}}else ct.yaw=A.yaw;let L=A.surface;if(L){if(L.conveyor){let _=Math.cos(ct.yaw),S=Math.sin(ct.yaw),U=L.conveyor[0]*_+L.conveyor[1]*S,z=-L.conveyor[0]*S+L.conveyor[1]*_;e.x+=U*r,e.z+=z*r,a+=U,c+=z}L.speed!==void 0&&(u=L.speed),L.ice&&(h=!0)}}n.jump&&!e.jumpHeld&&(e.jumpBuffer=.14);let d=n.dive&&!e.diveHeld;e.jumpHeld=n.jump,e.diveHeld=n.dive;let p=n.mx,m=n.mz,x=Math.hypot(p,m);x>1&&(p/=x,m/=x);let g=e.mode===0,f=!1;if(g){let A=(e.grounded?h?Dw:Nw:kw)*r,L=Lw*(e.grounded?u:1),_=p*L,S=m*L,U=_-e.vx,z=S-e.vz,H=Math.hypot(U,z);if(H<=A||H===0?(e.vx=_,e.vz=S):(e.vx+=U/H*A,e.vz+=z/H*A),x>.15&&(e.fx=p/Math.min(1,x),e.fz=m/Math.min(1,x)),e.jumpBuffer>0&&(e.grounded||e.coyote>0)&&(e.vy=Iw+Math.max(0,l),e.vx+=a,e.vz+=c,e.grounded=!1,e.ground=-1,e.coyote=0,e.jumpBuffer=0,e.events|=1,f=!0),d&&e.diveCooldown<=0){let Y=x>.2?p/x:e.fx,O=x>.2?m/x:e.fz;e.vx=Y*Bx+(e.grounded?a:0),e.vz=O*Bx+(e.grounded?c:0),e.vy=e.grounded?5:Math.max(e.vy,3),e.fx=Y,e.fz=O,e.mode=1,e.modeT=0,e.grounded=!1,e.ground=-1,e.coyote=0,e.events|=128,f=!0}}else if(e.grounded){let A=(h?3:e.mode===4?30:e.mode===1?16:11)*r,L=Math.hypot(e.vx,e.vz),_=L>A?(L-A)/L:0;e.vx*=_,e.vz*=_,e.modeT-=r,e.mode===1?e.modeT<-.5&&(e.mode=0,e.diveCooldown=.3):e.mode===2&&e.modeT<=0&&(e.mode=0)}else e.mode===2&&(e.modeT-=r);e.vy=Math.max(-45,e.vy-Pw*r);for(let A of t.winds){if(e.x<A.x0||e.x>A.x1||e.z<A.z0||e.z>A.z1||e.y<A.y0||e.y>A.y1)continue;let L=(A.pulse?A.pulse(i):1)*(e.grounded?.8:1)*r;e.x+=A.ax*L,e.z+=A.az*L}let y=e.grounded&&!f,v=e.y;e.x+=e.vx*r,e.y+=e.vy*r,e.z+=e.vz*r;let M=-1/0,R=-1,T=0,E=Wx(t,e.z);for(let A=0;A<2;A++){for(let L=0;L<E.length;L++){let _=o[E[L]];if(e.z<_.zMin-1||e.z>_.zMax+1||_.active&&_.active(s)===0)continue;tr(_,s,ct);let S=e.x-ct.x,U=e.z-ct.z,z=Math.cos(ct.yaw),H=Math.sin(ct.yaw),Y=S*z-U*H,O=S*H+U*z,G=0,F=0,ee=0,ne=0;if(_.shape==="cyl")ne=Math.hypot(Y,O),ee=Math.max(0,ne-_.hx),ne>0?(G=Y/ne,F=O/ne):G=1;else{let we=Math.max(-_.hx,Math.min(_.hx,Y)),Ue=Math.max(-_.hz,Math.min(_.hz,O));G=Y-we,F=O-Ue,ee=Math.hypot(G,F),ee>0&&(G/=ee,F/=ee)}if(ee>=il)continue;let re=Gx(_,ct,O),Ee=ct.y-_.hy,Be=0;_.motion&&(tr(_,i,dn),Be=ct.y-dn.y);let q=y?Uw:.08;if(A===0){ee<Hx&&e.vy<=Math.max(0,Be/r)+.01&&v>=re-q-Math.max(0,Be)&&e.y<=re+(y?zw:0)&&re>M&&(M=re,R=_.index,T=Be);continue}if(_.index===R||e.y>=re-.02||e.y+ep<=Ee||!_.bumper&&re-e.y<=q)continue;if(v+ep<=Ee+.06&&e.vy>0&&ee<Hx){e.y=Ee-ep,e.vy=0;continue}let K=il-ee;if(ee===0)if(_.shape==="cyl")K=_.hx-ne+il;else{let we=_.hx-Math.abs(Y),Ue=_.hz-Math.abs(O);we<Ue?(G=Y<0?-1:1,F=0,K=we+il):(G=0,F=O<0?-1:1,K=Ue+il)}let de=G*z+F*H,ae=-G*H+F*z;e.x+=de*K,e.z+=ae*K;let Re=e.vx*de+e.vz*ae;if(Re<0&&(e.vx-=de*Re,e.vz-=ae*Re),_.bumper&&e.shield<=0){let we=0,Ue=0;if(_.motion){let je=Math.cos(dn.yaw),Ve=Math.sin(dn.yaw),I=dn.x+Y*je+O*Ve,an=dn.z-Y*Ve+O*je;we=(e.x-de*K-I)/r,Ue=(e.z-ae*K-an)/r}Vx(e,de,ae,_.bumper,we,Ue,_.tumble?7:5.5,!!_.tumble)}}if(A===0&&R>=0){let L=o[R];e.y=M,L.surface?.bounce?(e.vy=L.surface.bounce,e.grounded=!1,e.ground=-1,e.events|=16,e.mode===1&&(e.mode=0,e.diveCooldown=.2),R=-1):(y||(e.events|=2,e.mode===1&&(e.modeT=0)),e.vy=Math.max(0,T/r),e.grounded=!0,e.ground=R,e.coyote=.1)}else A===0&&(e.grounded=!1,e.ground=-1)}if(e.grounded||(e.ground=-1),e.shield<=0&&e.mode!==4)for(let A of t.balls){if(e.z<A.zMin-2||e.z>A.zMax+2||A.active&&!A.active(s))continue;A.pos(s,xo);let L=e.x-xo.x,_=e.y+.6-xo.y,S=e.z-xo.z,U=A.r+.5;if(L*L+_*_+S*S>=U*U)continue;A.pos(i,tp);let z=(xo.x-tp.x)/r,H=(xo.z-tp.z)/r,Y=L,O=S,G=Math.hypot(Y,O);G<.05&&(Y=z,O=H,G=Math.hypot(Y,O)||1),Vx(e,Y/G,O/G,A.power*.6,z,H,7.5,!0),e.modeT=.8,e.shield=.45;break}if(e.y<t.killY){e.events|=8,e.falls++,e.mode!==4?(e.mode=3,e.modeT=.55):(e.x=t.finish.x,e.y=t.finish.y+.05,e.z=t.finish.z,e.vx=e.vy=e.vz=0);return}if(e.grounded&&e.mode!==4){let A=t.checkpoints;for(let _=A.length-1;_>e.checkpoint;_--){let S=A[_];if(Math.abs(e.z-S.z)<2.6&&Math.abs(e.x-S.x)<S.width/2+1.2&&Math.abs(e.y-S.y)<1.2){e.checkpoint=_,e.events|=32;break}}let L=t.finish;Math.abs(e.x-L.x)<=L.hx&&Math.abs(e.z-L.z)<=L.hz&&Math.abs(e.y-L.y)<1.5&&(e.mode=4,e.events|=64)}}function up(t,e,n,i,r){let s=-1/0,o=Wx(t,i);for(let a=0;a<o.length;a++){let l=t.solids[o[a]];if(l.active&&l.active(r)===0)continue;tr(l,r,ct);let c=e-ct.x,u=i-ct.z,h=Math.cos(ct.yaw),d=Math.sin(ct.yaw),p=c*h-u*d,m=c*d+u*h;if(l.shape==="cyl"){if(p*p+m*m>l.hx*l.hx)continue}else if(Math.abs(p)>l.hx||Math.abs(m)>l.hz)continue;let x=Gx(l,ct,m);x<=n+.45&&x>s&&(s=x)}return s}function hp(t,e,n,i){let r=t.path,s=1/0,o=0;for(let a=0;a<r.length-1;a++){let l=r[a],c=r[a+1],u=c.x-l.x,h=c.y-l.y,d=c.z-l.z,p=u*u+h*h+d*d||1,m=((e-l.x)*u+(n-l.y)*h+(i-l.z)*d)/p;m=Math.max(0,Math.min(1,m));let x=e-(l.x+u*m),g=(n-(l.y+h*m))*.5,f=i-(l.z+d*m),y=x*x+g*g+f*f;y<s&&(s=y,o=t.pathLen[a]+Math.sqrt(p)*m)}return Math.max(0,Math.min(1,o/t.pathTotal))}var Ot="#1d1b4f",Br="#fff8ec",dp="#3b6bff",Hr="#d9e4ff",Et="#ff7ab6",Wt="#ffd0e4",pt="#ffd23f",Xt="#fff4c4",So="#3fdcb0",pn="#dcfaef",au="#a77bff",lu="#efe6ff",Bn="#ff4f6d",Ae="#ffffff",fp=Math.PI*2;function Hn(t,e,n=0){let{x:i,y:r,z:s,yaw:o}=t;return t.motion=(a,l)=>{l.x=i,l.y=r,l.z=s,l.yaw=o+n+e*a},t}function ii(t,e,n,i,r,s=0){let{x:o,y:a,z:l,yaw:c}=t;return t.motion=(u,h)=>{let d=.5-.5*Math.cos(fp*(u/r+s));h.x=o+e*d,h.y=a+n*d,h.z=l-i*d,h.yaw=c},t}function qx(t,e,n,i=0,r=!1){let{x:s,y:o,z:a,yaw:l}=t;return t.motion=(c,u)=>{let h=i+n*c;u.x=s+Math.cos(h)*e,u.y=o,u.z=a-Math.sin(h)*e,u.yaw=r?l+h:l},t}function pp(t,e,n=0){return i=>{let r=((i+n*t)%t+t)%t;return r>=e?0:r>=e-.7?1:2}}var ni=class{constructor(e,n,i,r,s,o=-9){this.id=e;this.name=n;this.tagline=i;this.theme=r;this.timeLimit=s;this.killY=o;this.solids=[];this.balls=[];this.winds=[];this.checkpoints=[];this.decor=[];this.path=[];this.finishBox=null}add(e,n,i,r,s,o,a,l,c){let u={shape:e,x:n,y:i,z:r,hx:s,hy:o,hz:a,rise:l,yaw:c.yaw??0,color:c.color??this.theme.floor,look:c.look??"floor",surface:c.surface,bumper:c.bumper,tumble:c.tumble,motion:c.motion,active:c.active,zMin:0,zMax:0,index:this.solids.length};return this.solids.push(u),u}box(e,n,i,r,s,o,a={}){return this.add("box",e,n-s/2,-i,r/2,s/2,o/2,0,a)}cyl(e,n,i,r,s,o={}){return this.add("cyl",e,n-s/2,-i,r,s/2,r,0,o)}ramp(e,n,i,r,s,o,a={}){return this.add("ramp",e,r-.6/2,-(n+i)/2,o/2,.6/2,(i-n)/2,s-r,a)}roller(e,n,i,r,s,o={}){let[a,l,c]=n,[u,h,d]=i,p={r:e,power:11,color:Ae,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=((m/r+s)%1+1)%1;x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(d-c)*g),x.yaw=g*Math.hypot(u-a,d-c)/e},...o};return this.balls.push(p),p}shuttle(e,n,i,r,s,o={}){let[a,l,c]=n,[u,h,d]=i,p={r:e,power:11,color:Ae,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=.5-.5*Math.cos(fp*(m/r+s));x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(d-c)*g),x.yaw=g*Math.hypot(u-a,d-c)/e},...o};return this.balls.push(p),p}lantern(e,n,i,r,s,o,a,l){let c={r:.85,power:12,color:l,look:"lantern",zMin:0,zMax:0,anchor:{x:e,y:n,z:-i},pos:(u,h)=>{let d=s*Math.sin(fp*(u/o+a));h.x=e+Math.sin(d)*r,h.y=n-Math.cos(d)*r,h.z=-i,h.yaw=d}};return this.balls.push(c),c}wind(e,n,i,r,s,o,a,l,c){let u={x0:e,x1:n,y0:s,y1:o,z0:-r,z1:-i,ax:a,az:-l,pulse:c};return this.winds.push(u),u}checkpoint(e,n,i,r){this.checkpoints.push({x:e,y:n,z:-i,width:r}),this.way(e,n,i)}finish(e,n,i,r,s){this.finishBox={x:e,y:n,z:-i,hx:r/2,hz:s/2},this.way(e,n,i)}way(e,n,i){this.path.push({x:e,y:n,z:-i})}deco(e,n,i,r,s=1,o=Ae){this.decor.push({kind:e,x:n,y:i,z:-r,s,color:o})}build(){if(!this.finishBox)throw new Error(`${this.id}: no finish`);if(this.checkpoints.length===0)throw new Error(`${this.id}: no start`);let e={x:0,y:0,z:0,yaw:0},n=1/0,i=-1/0;for(let l of this.solids){let c=l.shape==="cyl"?l.hx:Math.hypot(l.hx,l.hz);l.zMin=1/0,l.zMax=-1/0;for(let u=0;u<=(l.motion?60:0);u+=.05)tr(l,u,e),l.zMin=Math.min(l.zMin,e.z-c),l.zMax=Math.max(l.zMax,e.z+c);n=Math.min(n,l.zMin),i=Math.max(i,l.zMax)}for(let l of this.balls){l.zMin=1/0,l.zMax=-1/0;for(let c=0;c<=60;c+=.05)l.pos(c,e),l.zMin=Math.min(l.zMin,e.z-l.r),l.zMax=Math.max(l.zMax,e.z+l.r)}let r=Math.floor(n/8)*8-8,s=Math.ceil((i-r)/8)+2,o=Array.from({length:s},()=>[]);for(let l of this.solids){let c=Math.max(0,Math.floor((l.zMin-1.5-r)/8)),u=Math.min(s-1,Math.floor((l.zMax+1.5-r)/8));for(let h=c;h<=u;h++)o[h].push(l.index)}let a=[0];for(let l=1;l<this.path.length;l++){let c=this.path[l-1],u=this.path[l];a.push(a[l-1]+Math.hypot(u.x-c.x,u.y-c.y,u.z-c.z))}return{id:this.id,name:this.name,tagline:this.tagline,theme:this.theme,solids:this.solids,balls:this.balls,winds:this.winds,checkpoints:this.checkpoints,finish:this.finishBox,path:this.path,killY:this.killY,decor:this.decor,timeLimit:this.timeLimit,buckets:o,bucketZ0:r,pathLen:a,pathTotal:a[a.length-1]||1}}};function $x(){let t=new ni("kaiten-rush",{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Ride the belts. Mind the plates!",ja:"\u30D9\u30EB\u30C8\u306B\u4E57\u3063\u3066\u9032\u3081\u3002\u304A\u76BF\u306B\u6CE8\u610F\uFF01"},{sky:["#ffd9e8",Br],fog:"#fff1e6",floor:Xt,floorAlt:Wt,accent:Et,accent2:So},110);t.box(0,0,3.5,12,1,13,{color:Wt}),t.checkpoint(0,0,3.5,9),t.box(-3.6,0,25,3.2,1,30,{look:"belt",color:pn,surface:{conveyor:[0,-3]}}),t.box(0,0,25,3.2,1,30,{look:"belt",color:Wt,surface:{conveyor:[0,3]}}),t.box(3.6,0,25,3.2,1,30,{look:"belt",color:Hr,surface:{conveyor:[0,-1.2]}});for(let[n,i]of[[-4.3,17],[-2.9,26],[-4.3,35]])t.cyl(n,.9,i,.7,.9,{look:"plate",color:Ae,bumper:7});t.box(-5.4,.9,25,.4,.9,30,{look:"rail",color:Et});for(let[n,i]of[[18,0],[28,.5]])ii(t.box(6.4,1.1,n,2.4,1.1,2.2,{look:"pusher",color:Et}),-3.4,0,0,2.6,i);t.way(-3.6,0,11),t.way(-2.7,0,17),t.way(-4.5,0,26),t.way(-2.7,0,35),t.box(0,0,43,12,1,6,{color:Wt}),t.checkpoint(0,0,42.5,8),[4,-4,-4,4,4,-4,4,-4,-4,4].forEach((n,i)=>{t.box(0,0,47.5+i*3,11,1,3,{look:"belt",color:i%2?pn:Xt,surface:{conveyor:[n,0]}})});for(let[n,i]of[[-2,52],[2.5,58],[-3,64],[1,70],[-.5,61]])t.cyl(n,1.1,i,.5,1.1,{look:"bumper",color:Bn,bumper:6.5});t.box(0,0,79,12,1,6,{color:Wt}),t.checkpoint(0,0,78.5,8),ii(t.cyl(-3.5,0,86,2.2,.6,{look:"plate",color:Ae}),7,0,0,5.2,0),t.box(0,0,92,5,1,3.5,{color:pn}),ii(t.cyl(-3.5,0,98,2.2,.6,{look:"plate",color:Ae}),7,0,0,4.6,.4),t.box(0,0,104,5,1,3.5,{color:pn}),ii(t.cyl(-3.5,0,110,2.2,.6,{look:"plate",color:Ae}),7,0,0,5.6,.75),t.way(0,0,86),t.way(0,0,92),t.way(0,0,98),t.way(0,0,104),t.way(0,0,110),t.box(0,0,116,12,1,6,{color:Wt}),t.checkpoint(0,0,115.5,8),t.box(0,0,134.5,9,1,31,{look:"belt",color:pn,surface:{conveyor:[0,-4.5]}});for(let[n,i]of[[126,1.8],[135,-2.1],[144,2]])Hn(t.box(0,.8,n,8.6,.72,.5,{look:"bar",color:pt,bumper:9,tumble:!0}),i,n),t.cyl(0,1.2,n,.5,1.2,{look:"bumper",color:Et});t.box(0,0,155,12,1,10,{look:"finish",color:Ae}),t.finish(0,0,156,12,8);for(let n=8;n<160;n+=19)t.deco("sushi",n%2?-11:11,1+n%5,n,1.6,n%3?Et:So),t.deco("cloud",n%2?13:-13,6+n%4,n+8,2.2,Ae);return t.build()}function jx(){let t="#f1f5ff",e="#cfe8ff",n=new ni("mochi-mountain",{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Climb! Dodge the rolling mochi!",ja:"\u306E\u307C\u308C\uFF01\u3053\u308D\u304C\u308B\u304A\u3082\u3061\u3092\u3088\u3051\u308D\uFF01"},{sky:["#dfe9ff","#ffffff"],fog:"#f3f6ff",floor:t,floorAlt:Wt,accent:Et,accent2:"#9ad0ff"},130);n.box(0,0,3.5,12,1,13,{color:Wt}),n.checkpoint(0,0,3.5,9),n.ramp(0,10,45,0,6.5,10.5),[-3.2,0,3.2].forEach((s,o)=>{n.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17,{color:o===1?Wt:Ae}),n.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17+.5,{color:o===1?Ae:"#e3f9d5"})}),n.box(0,6.5,48.5,10.5,1,7,{color:Wt}),n.checkpoint(0,6.5,48,8),n.box(0,6.5,68,12,1,32),[55.5,59.5,63.5,67.5,71.5,75.5,79.5].forEach((s,o)=>{let a=o%2?[-5.5,-1.5,2.5]:[-3.5,.5,4.5];for(let l of a)n.cyl(l,6.62,s,1.65,.3,{look:"mochi",color:o%3?Wt:"#e3f9d5",surface:{speed:.42}})}),n.shuttle(1.1,[-5.6,6.5,61.5],[5.6,6.5,61.5],3.8,0,{color:Ae}),n.shuttle(1.1,[5.6,6.5,73.5],[-5.6,6.5,73.5],3.4,.3,{color:Wt}),n.box(0,6.5,87,10.5,1,6,{color:Wt}),n.checkpoint(0,6.5,86.5,8);let r=[[-2,7.6,94],[2,8.7,101],[-2,9.8,108],[2,10.9,115]];for(let[s,o,a]of r)n.box(s,o,a,5.6,1,5.5,{look:"ice",color:e,surface:{ice:!0}}),n.way(s,o,a);n.cyl(2,10,101,.5,1.3,{look:"bumper",color:Et,bumper:6}),n.cyl(-2,11.1,108,.5,1.3,{look:"bumper",color:pt,bumper:6}),n.box(0,12,122.6,10,1,6.8,{color:Wt}),n.checkpoint(0,12,122,8),n.ramp(0,126,152,12,16,9.5),[-3,0,3].forEach((s,o)=>{n.roller(1.4,[s,16,152],[s,12,126],4.4,o*.33,{color:o===1?Wt:Ae})}),n.box(0,16,157,12,1,10,{look:"finish",color:Ae}),n.finish(0,16,158,12,8);for(let s=6;s<165;s+=15){let o=s<45?s/45*6:s<90?6.5:s<126?6.5+(s-90)/36*5.5:12+(s-126)/30*4;n.deco("star",s%2?-10:10,o+2+s%3,s,1.1,s%3?Et:pt),n.deco("cloud",s%2?13:-13,o+6+s%4,s+6,2.6,Ae)}return n.build()}function Zx(){let t="#f4ecff",e=new ni("origami-sky",{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"},{en:"The floor folds away. Keep moving!",ja:"\u3086\u304B\u304C\u6D88\u3048\u308B\uFF01\u6B62\u307E\u308B\u306A\uFF01"},{sky:["#e2d4ff",Br],fog:"#f6efff",floor:t,floorAlt:Xt,accent:au,accent2:pt},140);e.box(0,0,3.5,12,1,13,{color:Xt}),e.checkpoint(0,0,3.5,9);for(let i=0;i<8;i++)for(let r=0;r<4;r++){let s=(i+r)%2===0;e.box(-4.05+r*2.7,0,12+i*3.7,2.4,.5,3.4,{look:"tile",color:s?lu:Xt,active:pp(4.4,2.7,s?0:.5)})}e.box(0,0,43,12,1,6,{color:Xt}),e.checkpoint(0,0,42.5,8),e.box(0,0,62,5,1,32),[51,57,63,69,75].forEach((i,r)=>{let s=r%2?10:-10;e.roller(.7,[s,.25,i],[-s,.25,i],2.1,r*.37,{look:"shot",color:r%2?pt:Ae,power:12}),e.deco("plane",s*1.12,.6,i,1.4,r%2?Et:au)}),ii(e.box(5.2,1.1,54,2.4,1.1,1.8,{look:"pusher",color:Et}),-3.6,0,0,2.8,.2),ii(e.box(-5.2,1.1,66,2.4,1.1,1.8,{look:"pusher",color:Et}),3.6,0,0,2.8,.6),e.box(0,0,81,12,1,6,{color:Xt}),e.checkpoint(0,0,80.5,8),[[90,0,.7],[100,1.2,-.8],[110,2.4,.9]].forEach(([i,r,s],o)=>{let a=o%2?Xt:lu;Hn(e.box(0,r,i,8,.6,1.9,{look:"tile",color:a}),s,o),Hn(e.box(0,r,i,1.9,.6,8,{look:"tile",color:a}),s,o),e.way(0,r,i)}),e.box(0,3,119,9,1,6,{color:Xt}),e.checkpoint(0,3,118.5,7),e.box(0,3,126,8,1,8),Hn(e.box(0,3.8,126,7.4,.72,.5,{look:"bar",color:Bn,bumper:9,tumble:!0}),2.2,1),e.cyl(0,4.2,126,.5,1.2,{look:"bumper",color:pt});for(let i=0;i<4;i++)for(let r=0;r<2;r++){let s=(i+r)%2===0;e.box(r?1.45:-1.45,3,131.6+i*3,2.7,.5,2.8,{look:"tile",color:s?lu:pn,active:pp(3.6,2.3,s?0:.5)})}e.box(0,3,146,7,1,7),e.cyl(0,3.3,147.3,1.6,1.2,{look:"drum",color:Bn,surface:{bounce:14.5}}),e.way(0,3,131),e.way(0,3,142.5),e.way(0,3.3,147.3),e.box(0,5.5,157,11,1,10,{look:"finish",color:Ae}),e.finish(0,5.5,158,11,8);for(let i=6;i<165;i+=14)e.deco("plane",i%2?-11:11,4+i%5,i,1.2,i%3?au:Et),e.deco("cloud",i%2?14:-14,8+i%4,i+5,2.4,Ae);return e.build()}function Kx(){let t="#ffe2c2",e=new ni("taiko-bounce",{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Hop the sticks, bounce the drums!",ja:"\u30D0\u30C1\u3092\u3068\u3073\u3053\u3048\u3001\u592A\u9F13\u3067\u306F\u306D\u308D\uFF01"},{sky:["#ffe1cf",Br],fog:"#fff0e0",floor:t,floorAlt:Xt,accent:Bn,accent2:pt},120);e.box(0,0,3.5,12,1,13,{color:Xt}),e.checkpoint(0,0,3.5,9),e.box(0,0,25,11,1,30);for(let[n,i]of[[17,1.7],[25.5,-1.9],[34,2.2]])Hn(e.box(0,.8,n,10,.72,.5,{look:"bar",color:Bn,bumper:9,tumble:!0}),i,n*.7),e.cyl(0,2.3,n,.5,2.3,{look:"bumper",color:pt});Hn(e.box(0,2.05,25.5,.5,.6,10,{look:"bar",color:pt,bumper:9,tumble:!0}),-1.9,25.5*.7),e.box(0,0,43,12,1,6,{color:Xt}),e.checkpoint(0,0,42.5,8),e.cyl(-1.5,0,50.5,1.7,1.4,{look:"drum",color:Bn,surface:{bounce:14.5}}),e.box(1.5,1.2,56.5,3.8,.6,3.8,{look:"tile",color:Ae}),e.cyl(-1.5,1.2,62.5,1.7,1.4,{look:"drum",color:Bn,surface:{bounce:14.5}}),e.cyl(1.5,1.2,68.3,1.7,1.4,{look:"drum",color:pt,surface:{bounce:14.5}}),e.way(-1.5,0,50.5),e.way(1.5,1.2,56.5),e.way(-1.5,1.2,62.5),e.way(1.5,1.2,68.3),e.box(0,2.5,76,10,1,8,{color:Xt}),e.checkpoint(0,2.5,75,7),ii(e.box(-1.5,2.5,83,3.4,.6,3.4,{look:"tile",color:Ae}),0,1.7,0,3.6,0),ii(e.box(1.5,3.4,88,3.4,.6,3.4,{look:"tile",color:Ae}),0,1.8,0,3.6,.33),ii(e.box(-1,4.4,93,3.4,.6,3.4,{look:"tile",color:Ae}),0,1.8,0,3.6,.66),e.way(-1.5,3.3,83),e.way(1.5,4.3,88),e.way(-1,5.3,93),e.box(0,6,100,9,1,7.4,{color:Xt}),e.checkpoint(0,6,99,7),e.ramp(0,103.7,131.7,6,0,9,{look:"ice",color:"#cfe8ff",surface:{ice:!0}});for(let[n,i]of[[-2.5,110],[1.5,112.5],[-.5,117],[3,119.5],[-3,123],[.8,126.5]]){let r=6-6*(i-103.7)/28;e.cyl(n,r+1.2,i,.55,2.4,{look:"bumper",color:Et,bumper:7.5})}e.box(0,0,141,10,1,18.6),Hn(e.box(0,.8,141,9.4,.72,.5,{look:"bar",color:Bn,bumper:9,tumble:!0}),2.1,0),Hn(e.box(0,2.05,141,.5,.6,9.4,{look:"bar",color:pt,bumper:9,tumble:!0}),2.1,0),e.cyl(0,2.3,141,.5,2.3,{look:"bumper",color:pt}),e.way(0,0,133),e.box(0,0,155,12,1,10,{look:"finish",color:Ae}),e.finish(0,0,156,12,8);for(let n=6;n<160;n+=17)e.deco("lantern",n%2?-9.5:9.5,5+n%3,n,1.3,n%3?Bn:pt),e.deco("cloud",n%2?14:-14,8+n%4,n+6,2.4,Ae);return e.deco("torii",0,0,9.5,2.3,Bn),e.build()}var wo=(t,e)=>n=>Math.max(0,Math.min(1,Math.sin(Math.PI*2*(n/t+e))*2.2));function Jx(){let t=new ni("windy-pinwheels",{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Lean into the wind!",ja:"\u98A8\u306B\u307E\u3051\u308B\u306A\uFF01"},{sky:["#cfe4ff",Br],fog:"#eef5ff",floor:Ae,floorAlt:pn,accent:dp,accent2:So},120);t.box(0,0,3.5,12,1,13,{color:pn}),t.checkpoint(0,0,3.5,9);for(let n of[-4,0,4])t.box(n,0,25,1.9,1,30,{color:n===0?Ae:Hr});t.wind(-9,9,11,19.5,-2,6,5.5,0,wo(3.2,0)),t.wind(-9,9,20.5,29,-2,6,-5.5,0,wo(3.2,.5)),t.wind(-9,9,30,39,-2,6,6,0,wo(2.8,.25)),t.box(0,0,43,12,1,6,{color:pn}),t.checkpoint(0,0,42.5,8),[[0,50,1.2],[1.5,57.2,-1.4],[-1.5,64.4,1.2],[0,71.6,-1.4]].forEach(([n,i,r],s)=>{Hn(t.cyl(n,0,i,3.3,.7,{look:"disc",color:s%2?pn:Hr}),r,0),qx(t.box(n,.95,i,2.6,.95,.4,{look:"wall",color:s%2?So:dp}),1.95,r,s*1.3,!0),t.cyl(n,1.5,i,.65,1.5,{look:"bumper",color:pt,bumper:6}),t.way(n+(s%2?1.6:-1.6),0,i)}),t.box(0,0,78.7,12,1,6.6,{color:pn}),t.checkpoint(0,0,78.5,8),t.box(0,0,98,4.6,1,32),[87,92.5,98,103.5,109].forEach((n,i)=>{t.lantern(0,7.2,n,6.2,.78,2.7+i%3*.35,i*.37,i%2?Et:pt)}),t.wind(-3,3,83,113,-1,5,0,2.5),t.box(0,0,117,12,1,6,{color:pn}),t.checkpoint(0,0,116.5,8),t.box(-2.5,0,124,2.3,1,8,{color:Hr}),t.box(0,0,129,7.3,1,2.3),t.box(2.5,0,134,2.3,1,8,{color:Hr}),t.box(0,0,139,7.3,1,2.3),t.box(-2.5,0,144,2.3,1,8,{color:Hr}),t.box(0,0,149,7.3,1,2.3),t.wind(-9,9,120.5,127.5,-2,6,-5,0,wo(2.6,0)),t.wind(-9,9,130.5,137.5,-2,6,5,0,wo(2.6,.4)),t.wind(-9,9,140.5,147.5,-2,6,-5,0,wo(2.6,.8)),t.way(-2.5,0,121),t.way(-2.5,0,129),t.way(2.5,0,129),t.way(2.5,0,139),t.way(-2.5,0,139),t.way(-2.5,0,149),t.way(0,0,150),t.box(0,0,155,12,1,10,{look:"finish",color:Ae}),t.finish(0,0,156,12,8);for(let n=5;n<160;n+=16)t.deco("pinwheel",n%2?-10:10,2+n%4,n,1.6,n%3?Et:pt),t.deco("cloud",n%2?13:-13,7+n%5,n+7,2.6,Ae);return t.build()}var Qx=[$x,Kx,Jx,jx,Zx],mp=Qx.length,Bw=[];function cu(t){let e=(t%mp+mp)%mp;return Bw[e]??=Qx[e]()}var Hw=0,e_=1,Vw=2;var o1=1,b0=2,ar=3,Jr=0,Yt=1,si=2,Zr=0,Xo=1,t_=2,n_=3,i_=4,Gw=5,Rs=100,Ww=101,Xw=102,Yw=103,qw=104,$w=200,jw=201,Zw=202,Kw=203,Jp=204,Qp=205,Jw=206,Qw=207,eE=208,tE=209,nE=210,iE=211,rE=212,sE=213,oE=214,em=0,tm=1,nm=2,jo=3,im=4,rm=5,sm=6,om=7,a1=0,aE=1,lE=2,Kr=0,cE=1,uE=2,hE=3,fE=4,dE=5,pE=6,mE=7;var l1=300,Zo=301,Ko=302,am=303,lm=304,yh=306,Ls=1e3,Ps=1001,cm=1002,nn=1003,gE=1004;var uu=1005;var Mi=1006,gp=1007;var Is=1008;var hr=1009,c1=1010,u1=1011,xl=1012,T0=1013,Ns=1014,ki=1015,Il=1016,A0=1017,R0=1018,Jo=1020,h1=35902,f1=1021,d1=1022,Si=1023,p1=1024,m1=1025,Yo=1026,Qo=1027,C0=1028,P0=1029,g1=1030,I0=1031;var L0=1033,Fu=33776,Bu=33777,Hu=33778,Vu=33779,um=35840,hm=35841,fm=35842,dm=35843,pm=36196,mm=37492,gm=37496,vm=37808,ym=37809,xm=37810,_m=37811,Mm=37812,Sm=37813,wm=37814,Em=37815,bm=37816,Tm=37817,Am=37818,Rm=37819,Cm=37820,Pm=37821,Gu=36492,Im=36494,Lm=36495,v1=36283,Nm=36284,km=36285,Dm=36286;var Xu=2300,Um=2301,vp=2302,r_=2400,s_=2401,o_=2402;var vE=3200,yE=3201;var y1=0,xE=1,$r="",Wn="srgb",ns="srgb-linear",N0="display-p3",xh="display-p3-linear",Yu="linear",mt="srgb",qu="rec709",$u="p3";var Eo=7680;var a_=519,_E=512,ME=513,SE=514,x1=515,wE=516,EE=517,bE=518,TE=519,zm=35044;var l_="300 es",cr=2e3,ju=2001,Qr=class{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var yp=Math.PI/180,Om=180/Math.PI;function ur(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Qt[t&255]+Qt[t>>8&255]+Qt[t>>16&255]+Qt[t>>24&255]+"-"+Qt[e&255]+Qt[e>>8&255]+"-"+Qt[e>>16&15|64]+Qt[e>>24&255]+"-"+Qt[n&63|128]+Qt[n>>8&255]+"-"+Qt[n>>16&255]+Qt[n>>24&255]+Qt[i&255]+Qt[i>>8&255]+Qt[i>>16&255]+Qt[i>>24&255]).toLowerCase()}function tn(t,e,n){return Math.max(e,Math.min(n,t))}function AE(t,e){return(t%e+e)%e}function xp(t,e,n){return(1-n)*t+n*e}function Ni(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function rt(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}var ue=class t{constructor(e=0,n=0){t.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(tn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){let i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Oe=class t{constructor(e,n,i,r,s,o,a,l,c){t.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c)}set(e,n,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=n,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],p=i[5],m=i[8],x=r[0],g=r[3],f=r[6],y=r[1],v=r[4],M=r[7],R=r[2],T=r[5],E=r[8];return s[0]=o*x+a*y+l*R,s[3]=o*g+a*v+l*T,s[6]=o*f+a*M+l*E,s[1]=c*x+u*y+h*R,s[4]=c*g+u*v+h*T,s[7]=c*f+u*M+h*E,s[2]=d*x+p*y+m*R,s[5]=d*g+p*v+m*T,s[8]=d*f+p*M+m*E,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return n*o*u-n*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,p=c*s-o*l,m=n*h+i*d+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=d*x,e[4]=(u*n-r*l)*x,e[5]=(r*s-a*n)*x,e[6]=p*x,e[7]=(i*l-c*n)*x,e[8]=(o*n-i*s)*x,this}transpose(){let e,n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+n,0,0,1),this}scale(e,n){return this.premultiply(_p.makeScale(e,n)),this}rotate(e){return this.premultiply(_p.makeRotation(-e)),this}translate(e,n){return this.premultiply(_p.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_p=new Oe;function _1(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Zu(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function RE(){let t=Zu("canvas");return t.style.display="block",t}var c_={};function Wu(t){t in c_||(c_[t]=!0,console.warn(t))}function CE(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function PE(t){let e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function IE(t){let e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var u_=new Oe().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),h_=new Oe().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),rl={[ns]:{transfer:Yu,primaries:qu,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[Wn]:{transfer:mt,primaries:qu,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[xh]:{transfer:Yu,primaries:$u,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(h_),fromReference:t=>t.applyMatrix3(u_)},[N0]:{transfer:mt,primaries:$u,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(h_),fromReference:t=>t.applyMatrix3(u_).convertLinearToSRGB()}},LE=new Set([ns,xh]),Qe={enabled:!0,_workingColorSpace:ns,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!LE.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;let i=rl[e].toReference,r=rl[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return rl[t].primaries},getTransfer:function(t){return t===$r?Yu:rl[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(rl[e].luminanceCoefficients)}};function qo(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Mp(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}var bo,Fm=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{bo===void 0&&(bo=Zu("canvas")),bo.width=e.width,bo.height=e.height;let i=bo.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=bo}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let n=Zu("canvas");n.width=e.width,n.height=e.height;let i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=qo(s[o]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){let n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(qo(n[i]/255)*255):n[i]=qo(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},NE=0,Ku=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:NE++}),this.uuid=ur(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Sp(r[o].image)):s.push(Sp(r[o]))}else s=Sp(r);i.url=s}return n||(e.images[this.uuid]=i),i}};function Sp(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?Fm.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var kE=0,An=class t extends Qr{constructor(e=t.DEFAULT_IMAGE,n=t.DEFAULT_MAPPING,i=Ps,r=Ps,s=Mi,o=Is,a=Si,l=hr,c=t.DEFAULT_ANISOTROPY,u=$r){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:kE++}),this.uuid=ur(),this.name="",this.source=new Ku(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ue(0,0),this.repeat=new ue(1,1),this.center=new ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Oe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==l1)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ls:e.x=e.x-Math.floor(e.x);break;case Ps:e.x=e.x<0?0:1;break;case cm:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ls:e.y=e.y-Math.floor(e.y);break;case Ps:e.y=e.y<0?0:1;break;case cm:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};An.DEFAULT_IMAGE=null;An.DEFAULT_MAPPING=l1;An.DEFAULT_ANISOTROPY=1;var bt=class t{constructor(e=0,n=0,i=0,r=1){t.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*n+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*n+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*n+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*n+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],p=l[5],m=l[9],x=l[2],g=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let v=(c+1)/2,M=(p+1)/2,R=(f+1)/2,T=(u+d)/4,E=(h+x)/4,A=(m+g)/4;return v>M&&v>R?v<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(v),r=T/i,s=E/i):M>R?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=T/r,s=A/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=E/s,r=A/s),this.set(i,r,s,n),this}let y=Math.sqrt((g-m)*(g-m)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(y)<.001&&(y=1),this.x=(g-m)/y,this.y=(h-x)/y,this.z=(d-u)/y,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Bm=class extends Qr{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new bt(0,0,e,n),this.scissorTest=!1,this.viewport=new bt(0,0,e,n);let r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let s=new An(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let n=Object.assign({},e.texture.image);return this.texture.source=new Ku(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},fr=class extends Bm{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}},Ju=class extends An{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Hm=class extends An{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Di=class{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],d=s[o+0],p=s[o+1],m=s[o+2],x=s[o+3];if(a===0){e[n+0]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h;return}if(a===1){e[n+0]=d,e[n+1]=p,e[n+2]=m,e[n+3]=x;return}if(h!==x||l!==d||c!==p||u!==m){let g=1-a,f=l*d+c*p+u*m+h*x,y=f>=0?1:-1,v=1-f*f;if(v>Number.EPSILON){let R=Math.sqrt(v),T=Math.atan2(R,f*y);g=Math.sin(g*T)/R,a=Math.sin(a*T)/R}let M=a*y;if(l=l*g+d*M,c=c*g+p*M,u=u*g+m*M,h=h*g+x*M,g===1-a){let R=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=R,c*=R,u*=R,h*=R}}e[n]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h}static multiplyQuaternionsFlat(e,n,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],d=s[o+1],p=s[o+2],m=s[o+3];return e[n]=a*m+u*h+l*p-c*d,e[n+1]=l*m+u*d+c*h-a*p,e[n+2]=c*m+u*p+a*d-l*h,e[n+3]=u*m-a*h-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),d=l(i/2),p=l(r/2),m=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h-d*p*m;break;case"YXZ":this._x=d*u*h+c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h+d*p*m;break;case"ZXY":this._x=d*u*h-c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h-d*p*m;break;case"ZYX":this._x=d*u*h-c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h+d*p*m;break;case"YZX":this._x=d*u*h+c*p*m,this._y=c*p*h+d*u*m,this._z=c*u*m-d*p*h,this._w=c*u*h-d*p*m;break;case"XZY":this._x=d*u*h-c*p*m,this._y=c*p*h-d*u*m,this._z=c*u*m+d*p*h,this._w=c*u*h+d*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){let i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let n=e.elements,i=n[0],r=n[4],s=n[8],o=n[1],a=n[5],l=n[9],c=n[2],u=n[6],h=n[10],d=i+a+h;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>h){let p=2*Math.sqrt(1+i-a-h);this._w=(u-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>h){let p=2*Math.sqrt(1+a-i-h);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+h-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(tn(this.dot(e),-1,1)))}rotateTowards(e,n){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){let i=e._x,r=e._y,s=e._z,o=e._w,a=n._x,l=n._y,c=n._z,u=n._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-n;return this._w=p*o+n*this._w,this._x=p*i+n*this._x,this._y=p*r+n*this._y,this._z=p*s+n*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-n)*u)/c,d=Math.sin(n*u)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){let e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class t{constructor(e=0,n=0,i=0){t.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(f_.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(f_.setFromAxisAngle(e,n))}applyMatrix3(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let n=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*n-s*r),h=2*(s*i-o*n);return this.x=n+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){let i=e.x,r=e.y,s=e.z,o=n.x,a=n.y,l=n.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let n=e.lengthSq();if(n===0)return this.set(0,0,0);let i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return wp.copy(this).projectOnVector(e),this.sub(wp)}reflect(e){return this.sub(wp.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(tn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){let r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){let n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},wp=new P,f_=new Di,dr=class{constructor(e=new P(1/0,1/0,1/0),n=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(yi.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(yi.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){let i=yi.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,yi):yi.fromBufferAttribute(s,o),yi.applyMatrix4(e.matrixWorld),this.expandByPoint(yi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),hu.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),hu.copy(i.boundingBox)),hu.applyMatrix4(e.matrixWorld),this.union(hu)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yi),yi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(sl),fu.subVectors(this.max,sl),To.subVectors(e.a,sl),Ao.subVectors(e.b,sl),Ro.subVectors(e.c,sl),Vr.subVectors(Ao,To),Gr.subVectors(Ro,Ao),Ms.subVectors(To,Ro);let n=[0,-Vr.z,Vr.y,0,-Gr.z,Gr.y,0,-Ms.z,Ms.y,Vr.z,0,-Vr.x,Gr.z,0,-Gr.x,Ms.z,0,-Ms.x,-Vr.y,Vr.x,0,-Gr.y,Gr.x,0,-Ms.y,Ms.x,0];return!Ep(n,To,Ao,Ro,fu)||(n=[1,0,0,0,1,0,0,0,1],!Ep(n,To,Ao,Ro,fu))?!1:(du.crossVectors(Vr,Gr),n=[du.x,du.y,du.z],Ep(n,To,Ao,Ro,fu))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(nr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),nr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),nr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),nr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),nr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),nr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),nr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),nr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(nr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},nr=[new P,new P,new P,new P,new P,new P,new P,new P],yi=new P,hu=new dr,To=new P,Ao=new P,Ro=new P,Vr=new P,Gr=new P,Ms=new P,sl=new P,fu=new P,du=new P,Ss=new P;function Ep(t,e,n,i,r){for(let s=0,o=t.length-3;s<=o;s+=3){Ss.fromArray(t,s);let a=r.x*Math.abs(Ss.x)+r.y*Math.abs(Ss.y)+r.z*Math.abs(Ss.z),l=e.dot(Ss),c=n.dot(Ss),u=i.dot(Ss);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var DE=new dr,ol=new P,bp=new P,ks=class{constructor(e=new P,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){let i=this.center;n!==void 0?i.copy(n):DE.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){let i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ol.subVectors(e,this.center);let n=ol.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(ol,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bp.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ol.copy(e.center).add(bp)),this.expandByPoint(ol.copy(e.center).sub(bp))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ir=new P,Tp=new P,pu=new P,Wr=new P,Ap=new P,mu=new P,Rp=new P,Vm=class{constructor(e=new P,n=new P(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ir)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let n=ir.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ir.copy(this.origin).addScaledVector(this.direction,n),ir.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Tp.copy(e).add(n).multiplyScalar(.5),pu.copy(n).sub(e).normalize(),Wr.copy(this.origin).sub(Tp);let s=e.distanceTo(n)*.5,o=-this.direction.dot(pu),a=Wr.dot(this.direction),l=-Wr.dot(pu),c=Wr.lengthSq(),u=Math.abs(1-o*o),h,d,p,m;if(u>0)if(h=o*l-a,d=o*a-l,m=s*u,h>=0)if(d>=-m)if(d<=m){let x=1/u;h*=x,d*=x,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-m?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c):d<=m?(h=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Tp).addScaledVector(pu,d),p}intersectSphere(e,n){ir.subVectors(e.center,this.origin);let i=ir.dot(this.direction),r=ir.dot(ir)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,n):this.at(a,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){let i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){let n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,ir)!==null}intersectTriangle(e,n,i,r,s){Ap.subVectors(n,e),mu.subVectors(i,e),Rp.crossVectors(Ap,mu);let o=this.direction.dot(Rp),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Wr.subVectors(this.origin,e);let l=a*this.direction.dot(mu.crossVectors(Wr,mu));if(l<0)return null;let c=a*this.direction.dot(Ap.cross(Wr));if(c<0||l+c>o)return null;let u=-a*Wr.dot(Rp);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},nt=class t{constructor(e,n,i,r,s,o,a,l,c,u,h,d,p,m,x,g){t.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c,u,h,d,p,m,x,g)}set(e,n,i,r,s,o,a,l,c,u,h,d,p,m,x,g){let f=this.elements;return f[0]=e,f[4]=n,f[8]=i,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=m,f[11]=x,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new t().fromArray(this.elements)}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){let n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){let n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){let n=this.elements,i=e.elements,r=1/Co.setFromMatrixColumn(e,0).length(),s=1/Co.setFromMatrixColumn(e,1).length(),o=1/Co.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){let n=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,p=o*h,m=a*u,x=a*h;n[0]=l*u,n[4]=-l*h,n[8]=c,n[1]=p+m*c,n[5]=d-x*c,n[9]=-a*l,n[2]=x-d*c,n[6]=m+p*c,n[10]=o*l}else if(e.order==="YXZ"){let d=l*u,p=l*h,m=c*u,x=c*h;n[0]=d+x*a,n[4]=m*a-p,n[8]=o*c,n[1]=o*h,n[5]=o*u,n[9]=-a,n[2]=p*a-m,n[6]=x+d*a,n[10]=o*l}else if(e.order==="ZXY"){let d=l*u,p=l*h,m=c*u,x=c*h;n[0]=d-x*a,n[4]=-o*h,n[8]=m+p*a,n[1]=p+m*a,n[5]=o*u,n[9]=x-d*a,n[2]=-o*c,n[6]=a,n[10]=o*l}else if(e.order==="ZYX"){let d=o*u,p=o*h,m=a*u,x=a*h;n[0]=l*u,n[4]=m*c-p,n[8]=d*c+x,n[1]=l*h,n[5]=x*c+d,n[9]=p*c-m,n[2]=-c,n[6]=a*l,n[10]=o*l}else if(e.order==="YZX"){let d=o*l,p=o*c,m=a*l,x=a*c;n[0]=l*u,n[4]=x-d*h,n[8]=m*h+p,n[1]=h,n[5]=o*u,n[9]=-a*u,n[2]=-c*u,n[6]=p*h+m,n[10]=d-x*h}else if(e.order==="XZY"){let d=o*l,p=o*c,m=a*l,x=a*c;n[0]=l*u,n[4]=-h,n[8]=c*u,n[1]=d*h+x,n[5]=o*u,n[9]=p*h-m,n[2]=m*h-p,n[6]=a*u,n[10]=x*h+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(UE,e,zE)}lookAt(e,n,i){let r=this.elements;return Vn.subVectors(e,n),Vn.lengthSq()===0&&(Vn.z=1),Vn.normalize(),Xr.crossVectors(i,Vn),Xr.lengthSq()===0&&(Math.abs(i.z)===1?Vn.x+=1e-4:Vn.z+=1e-4,Vn.normalize(),Xr.crossVectors(i,Vn)),Xr.normalize(),gu.crossVectors(Vn,Xr),r[0]=Xr.x,r[4]=gu.x,r[8]=Vn.x,r[1]=Xr.y,r[5]=gu.y,r[9]=Vn.y,r[2]=Xr.z,r[6]=gu.z,r[10]=Vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],p=i[13],m=i[2],x=i[6],g=i[10],f=i[14],y=i[3],v=i[7],M=i[11],R=i[15],T=r[0],E=r[4],A=r[8],L=r[12],_=r[1],S=r[5],U=r[9],z=r[13],H=r[2],Y=r[6],O=r[10],G=r[14],F=r[3],ee=r[7],ne=r[11],re=r[15];return s[0]=o*T+a*_+l*H+c*F,s[4]=o*E+a*S+l*Y+c*ee,s[8]=o*A+a*U+l*O+c*ne,s[12]=o*L+a*z+l*G+c*re,s[1]=u*T+h*_+d*H+p*F,s[5]=u*E+h*S+d*Y+p*ee,s[9]=u*A+h*U+d*O+p*ne,s[13]=u*L+h*z+d*G+p*re,s[2]=m*T+x*_+g*H+f*F,s[6]=m*E+x*S+g*Y+f*ee,s[10]=m*A+x*U+g*O+f*ne,s[14]=m*L+x*z+g*G+f*re,s[3]=y*T+v*_+M*H+R*F,s[7]=y*E+v*S+M*Y+R*ee,s[11]=y*A+v*U+M*O+R*ne,s[15]=y*L+v*z+M*G+R*re,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],p=e[14],m=e[3],x=e[7],g=e[11],f=e[15];return m*(+s*l*h-r*c*h-s*a*d+i*c*d+r*a*p-i*l*p)+x*(+n*l*p-n*c*d+s*o*d-r*o*p+r*c*u-s*l*u)+g*(+n*c*h-n*a*p-s*o*h+i*o*p+s*a*u-i*c*u)+f*(-r*a*u-n*l*h+n*a*d+r*o*h-i*o*d+i*l*u)}transpose(){let e=this.elements,n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],p=e[11],m=e[12],x=e[13],g=e[14],f=e[15],y=h*g*c-x*d*c+x*l*p-a*g*p-h*l*f+a*d*f,v=m*d*c-u*g*c-m*l*p+o*g*p+u*l*f-o*d*f,M=u*x*c-m*h*c+m*a*p-o*x*p-u*a*f+o*h*f,R=m*h*l-u*x*l-m*a*d+o*x*d+u*a*g-o*h*g,T=n*y+i*v+r*M+s*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let E=1/T;return e[0]=y*E,e[1]=(x*d*s-h*g*s-x*r*p+i*g*p+h*r*f-i*d*f)*E,e[2]=(a*g*s-x*l*s+x*r*c-i*g*c-a*r*f+i*l*f)*E,e[3]=(h*l*s-a*d*s-h*r*c+i*d*c+a*r*p-i*l*p)*E,e[4]=v*E,e[5]=(u*g*s-m*d*s+m*r*p-n*g*p-u*r*f+n*d*f)*E,e[6]=(m*l*s-o*g*s-m*r*c+n*g*c+o*r*f-n*l*f)*E,e[7]=(o*d*s-u*l*s+u*r*c-n*d*c-o*r*p+n*l*p)*E,e[8]=M*E,e[9]=(m*h*s-u*x*s-m*i*p+n*x*p+u*i*f-n*h*f)*E,e[10]=(o*x*s-m*a*s+m*i*c-n*x*c-o*i*f+n*a*f)*E,e[11]=(u*a*s-o*h*s-u*i*c+n*h*c+o*i*p-n*a*p)*E,e[12]=R*E,e[13]=(u*x*r-m*h*r+m*i*d-n*x*d-u*i*g+n*h*g)*E,e[14]=(m*a*r-o*x*r-m*i*l+n*x*l+o*i*g-n*a*g)*E,e[15]=(o*h*r-u*a*r+u*i*l-n*h*l-o*i*d+n*a*d)*E,this}scale(e){let n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){let n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){let i=Math.cos(n),r=Math.sin(n),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){let r=this.elements,s=n._x,o=n._y,a=n._z,l=n._w,c=s+s,u=o+o,h=a+a,d=s*c,p=s*u,m=s*h,x=o*u,g=o*h,f=a*h,y=l*c,v=l*u,M=l*h,R=i.x,T=i.y,E=i.z;return r[0]=(1-(x+f))*R,r[1]=(p+M)*R,r[2]=(m-v)*R,r[3]=0,r[4]=(p-M)*T,r[5]=(1-(d+f))*T,r[6]=(g+y)*T,r[7]=0,r[8]=(m+v)*E,r[9]=(g-y)*E,r[10]=(1-(d+x))*E,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){let r=this.elements,s=Co.set(r[0],r[1],r[2]).length(),o=Co.set(r[4],r[5],r[6]).length(),a=Co.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],xi.copy(this);let c=1/s,u=1/o,h=1/a;return xi.elements[0]*=c,xi.elements[1]*=c,xi.elements[2]*=c,xi.elements[4]*=u,xi.elements[5]*=u,xi.elements[6]*=u,xi.elements[8]*=h,xi.elements[9]*=h,xi.elements[10]*=h,n.setFromRotationMatrix(xi),i.x=s,i.y=o,i.z=a,this}makePerspective(e,n,i,r,s,o,a=cr){let l=this.elements,c=2*s/(n-e),u=2*s/(i-r),h=(n+e)/(n-e),d=(i+r)/(i-r),p,m;if(a===cr)p=-(o+s)/(o-s),m=-2*o*s/(o-s);else if(a===ju)p=-o/(o-s),m=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,o,a=cr){let l=this.elements,c=1/(n-e),u=1/(i-r),h=1/(o-s),d=(n+e)*c,p=(i+r)*u,m,x;if(a===cr)m=(o+s)*h,x=-2*h;else if(a===ju)m=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=x,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}},Co=new P,xi=new nt,UE=new P(0,0,0),zE=new P(1,1,1),Xr=new P,gu=new P,Vn=new P,d_=new nt,p_=new Di,Ui=class t{constructor(e=0,n=0,i=0,r=t.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],p=r[10];switch(n){case"XYZ":this._y=Math.asin(tn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-tn(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(tn(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-tn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(tn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-tn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return d_.makeRotationFromQuaternion(e),this.setFromRotationMatrix(d_,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return p_.setFromEuler(this),this.setFromQuaternion(p_,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ui.DEFAULT_ORDER="XYZ";var Qu=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},OE=0,m_=new P,Po=new Di,rr=new nt,vu=new P,al=new P,FE=new P,BE=new Di,g_=new P(1,0,0),v_=new P(0,1,0),y_=new P(0,0,1),x_={type:"added"},HE={type:"removed"},Io={type:"childadded",child:null},Cp={type:"childremoved",child:null},yn=class t extends Qr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:OE++}),this.uuid=ur(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=t.DEFAULT_UP.clone();let e=new P,n=new Ui,i=new Di,r=new P(1,1,1);function s(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new nt},normalMatrix:{value:new Oe}}),this.matrix=new nt,this.matrixWorld=new nt,this.matrixAutoUpdate=t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Po.setFromAxisAngle(e,n),this.quaternion.multiply(Po),this}rotateOnWorldAxis(e,n){return Po.setFromAxisAngle(e,n),this.quaternion.premultiply(Po),this}rotateX(e){return this.rotateOnAxis(g_,e)}rotateY(e){return this.rotateOnAxis(v_,e)}rotateZ(e){return this.rotateOnAxis(y_,e)}translateOnAxis(e,n){return m_.copy(e).applyQuaternion(this.quaternion),this.position.add(m_.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(g_,e)}translateY(e){return this.translateOnAxis(v_,e)}translateZ(e){return this.translateOnAxis(y_,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(rr.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?vu.copy(e):vu.set(e,n,i);let r=this.parent;this.updateWorldMatrix(!0,!1),al.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?rr.lookAt(al,vu,this.up):rr.lookAt(vu,al,this.up),this.quaternion.setFromRotationMatrix(rr),r&&(rr.extractRotation(r.matrixWorld),Po.setFromRotationMatrix(rr),this.quaternion.premultiply(Po.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(x_),Io.child=e,this.dispatchEvent(Io),Io.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(HE),Cp.child=e,this.dispatchEvent(Cp),Cp.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),rr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),rr.multiply(e.parent.matrixWorld)),e.applyMatrix4(rr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(x_),Io.child=e,this.dispatchEvent(Io),Io.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,n);if(o!==void 0)return o}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(al,e,FE),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(al,BE,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){let n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(n){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};yn.DEFAULT_UP=new P(0,1,0);yn.DEFAULT_MATRIX_AUTO_UPDATE=!0;yn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _i=new P,sr=new P,Pp=new P,or=new P,Lo=new P,No=new P,__=new P,Ip=new P,Lp=new P,Np=new P,kp=new bt,Dp=new bt,Up=new bt,jr=class t{constructor(e=new P,n=new P,i=new P){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),_i.subVectors(e,n),r.cross(_i);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){_i.subVectors(r,n),sr.subVectors(i,n),Pp.subVectors(e,n);let o=_i.dot(_i),a=_i.dot(sr),l=_i.dot(Pp),c=sr.dot(sr),u=sr.dot(Pp),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,p=(c*l-a*u)*d,m=(o*u-a*l)*d;return s.set(1-p-m,m,p)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,or)===null?!1:or.x>=0&&or.y>=0&&or.x+or.y<=1}static getInterpolation(e,n,i,r,s,o,a,l){return this.getBarycoord(e,n,i,r,or)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,or.x),l.addScaledVector(o,or.y),l.addScaledVector(a,or.z),l)}static getInterpolatedAttribute(e,n,i,r,s,o){return kp.setScalar(0),Dp.setScalar(0),Up.setScalar(0),kp.fromBufferAttribute(e,n),Dp.fromBufferAttribute(e,i),Up.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(kp,s.x),o.addScaledVector(Dp,s.y),o.addScaledVector(Up,s.z),o}static isFrontFacing(e,n,i,r){return _i.subVectors(i,n),sr.subVectors(e,n),_i.cross(sr).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _i.subVectors(this.c,this.b),sr.subVectors(this.a,this.b),_i.cross(sr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return t.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return t.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return t.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return t.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return t.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){let i=this.a,r=this.b,s=this.c,o,a;Lo.subVectors(r,i),No.subVectors(s,i),Ip.subVectors(e,i);let l=Lo.dot(Ip),c=No.dot(Ip);if(l<=0&&c<=0)return n.copy(i);Lp.subVectors(e,r);let u=Lo.dot(Lp),h=No.dot(Lp);if(u>=0&&h<=u)return n.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),n.copy(i).addScaledVector(Lo,o);Np.subVectors(e,s);let p=Lo.dot(Np),m=No.dot(Np);if(m>=0&&p<=m)return n.copy(s);let x=p*c-l*m;if(x<=0&&c>=0&&m<=0)return a=c/(c-m),n.copy(i).addScaledVector(No,a);let g=u*m-p*h;if(g<=0&&h-u>=0&&p-m>=0)return __.subVectors(s,r),a=(h-u)/(h-u+(p-m)),n.copy(r).addScaledVector(__,a);let f=1/(g+x+d);return o=x*f,a=d*f,n.copy(i).addScaledVector(Lo,o).addScaledVector(No,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},M1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yr={h:0,s:0,l:0},yu={h:0,s:0,l:0};function zp(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}var Pe=class{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Wn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=Qe.workingColorSpace){return this.r=e,this.g=n,this.b=i,Qe.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=Qe.workingColorSpace){if(e=AE(e,1),n=tn(n,0,1),i=tn(i,0,1),n===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+n):i+n-i*n,o=2*i-s;this.r=zp(o,s,e+1/3),this.g=zp(o,s,e),this.b=zp(o,s,e-1/3)}return Qe.toWorkingColorSpace(this,r),this}setStyle(e,n=Wn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Wn){let i=M1[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qo(e.r),this.g=qo(e.g),this.b=qo(e.b),this}copyLinearToSRGB(e){return this.r=Mp(e.r),this.g=Mp(e.g),this.b=Mp(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Wn){return Qe.fromWorkingColorSpace(en.copy(this),e),Math.round(tn(en.r*255,0,255))*65536+Math.round(tn(en.g*255,0,255))*256+Math.round(tn(en.b*255,0,255))}getHexString(e=Wn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Qe.workingColorSpace){Qe.fromWorkingColorSpace(en.copy(this),n);let i=en.r,r=en.g,s=en.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,n=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(en.copy(this),n),e.r=en.r,e.g=en.g,e.b=en.b,e}getStyle(e=Wn){Qe.fromWorkingColorSpace(en.copy(this),e);let n=en.r,i=en.g,r=en.b;return e!==Wn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Yr),this.setHSL(Yr.h+e,Yr.s+n,Yr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Yr),e.getHSL(yu);let i=xp(Yr.h,yu.h,n),r=xp(Yr.s,yu.s,n),s=xp(Yr.l,yu.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},en=new Pe;Pe.NAMES=M1;var VE=0,es=class extends Qr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:VE++}),this.uuid=ur(),this.name="",this.type="Material",this.blending=Xo,this.side=Jr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Jp,this.blendDst=Qp,this.blendEquation=Rs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Pe(0,0,0),this.blendAlpha=0,this.depthFunc=jo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=a_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Eo,this.stencilZFail=Eo,this.stencilZPass=Eo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let n in e){let i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}let r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Xo&&(i.blending=this.blending),this.side!==Jr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Jp&&(i.blendSrc=this.blendSrc),this.blendDst!==Qp&&(i.blendDst=this.blendDst),this.blendEquation!==Rs&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==jo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==a_&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Eo&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Eo&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Eo&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(n){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let n=e.clippingPlanes,i=null;if(n!==null){let r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Rn=class extends es{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.combine=a1,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var It=new P,xu=new ue,Rt=class{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=zm,this.updateRanges=[],this.gpuType=ki,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)xu.fromBufferAttribute(this,n),xu.applyMatrix3(e),this.setXY(n,xu.x,xu.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)It.fromBufferAttribute(this,n),It.applyMatrix3(e),this.setXYZ(n,It.x,It.y,It.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)It.fromBufferAttribute(this,n),It.applyMatrix4(e),this.setXYZ(n,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)It.fromBufferAttribute(this,n),It.applyNormalMatrix(e),this.setXYZ(n,It.x,It.y,It.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)It.fromBufferAttribute(this,n),It.transformDirection(e),this.setXYZ(n,It.x,It.y,It.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Ni(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=rt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Ni(n,this.array)),n}setX(e,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Ni(n,this.array)),n}setY(e,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Ni(n,this.array)),n}setZ(e,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Ni(n,this.array)),n}setW(e,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array),r=rt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array),r=rt(r,this.array),s=rt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==zm&&(e.usage=this.usage),e}};var eh=class extends Rt{constructor(e,n,i){super(new Uint16Array(e),n,i)}};var th=class extends Rt{constructor(e,n,i){super(new Uint32Array(e),n,i)}};var st=class extends Rt{constructor(e,n,i){super(new Float32Array(e),n,i)}},GE=0,ri=new nt,Op=new yn,ko=new P,Gn=new dr,ll=new dr,Ft=new P,qt=class t extends Qr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:GE++}),this.uuid=ur(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(_1(e)?th:eh)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Oe().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ri.makeRotationFromQuaternion(e),this.applyMatrix4(ri),this}rotateX(e){return ri.makeRotationX(e),this.applyMatrix4(ri),this}rotateY(e){return ri.makeRotationY(e),this.applyMatrix4(ri),this}rotateZ(e){return ri.makeRotationZ(e),this.applyMatrix4(ri),this}translate(e,n,i){return ri.makeTranslation(e,n,i),this.applyMatrix4(ri),this}scale(e,n,i){return ri.makeScale(e,n,i),this.applyMatrix4(ri),this}lookAt(e){return Op.lookAt(e),Op.updateMatrix(),this.applyMatrix4(Op.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ko).negate(),this.translate(ko.x,ko.y,ko.z),this}setFromPoints(e){let n=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new st(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new dr);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){let s=n[i];Gn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ft.addVectors(this.boundingBox.min,Gn.min),this.boundingBox.expandByPoint(Ft),Ft.addVectors(this.boundingBox.max,Gn.max),this.boundingBox.expandByPoint(Ft)):(this.boundingBox.expandByPoint(Gn.min),this.boundingBox.expandByPoint(Gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ks);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(Gn.setFromBufferAttribute(e),n)for(let s=0,o=n.length;s<o;s++){let a=n[s];ll.setFromBufferAttribute(a),this.morphTargetsRelative?(Ft.addVectors(Gn.min,ll.min),Gn.expandByPoint(Ft),Ft.addVectors(Gn.max,ll.max),Gn.expandByPoint(Ft)):(Gn.expandByPoint(ll.min),Gn.expandByPoint(ll.max))}Gn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Ft.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ft));if(n)for(let s=0,o=n.length;s<o;s++){let a=n[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Ft.fromBufferAttribute(a,c),l&&(ko.fromBufferAttribute(e,c),Ft.add(ko)),r=Math.max(r,i.distanceToSquared(Ft))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Rt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<i.count;A++)a[A]=new P,l[A]=new P;let c=new P,u=new P,h=new P,d=new ue,p=new ue,m=new ue,x=new P,g=new P;function f(A,L,_){c.fromBufferAttribute(i,A),u.fromBufferAttribute(i,L),h.fromBufferAttribute(i,_),d.fromBufferAttribute(s,A),p.fromBufferAttribute(s,L),m.fromBufferAttribute(s,_),u.sub(c),h.sub(c),p.sub(d),m.sub(d);let S=1/(p.x*m.y-m.x*p.y);isFinite(S)&&(x.copy(u).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(S),g.copy(h).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(S),a[A].add(x),a[L].add(x),a[_].add(x),l[A].add(g),l[L].add(g),l[_].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let A=0,L=y.length;A<L;++A){let _=y[A],S=_.start,U=_.count;for(let z=S,H=S+U;z<H;z+=3)f(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let v=new P,M=new P,R=new P,T=new P;function E(A){R.fromBufferAttribute(r,A),T.copy(R);let L=a[A];v.copy(L),v.sub(R.multiplyScalar(R.dot(L))).normalize(),M.crossVectors(T,L);let S=M.dot(l[A])<0?-1:1;o.setXYZW(A,v.x,v.y,v.z,S)}for(let A=0,L=y.length;A<L;++A){let _=y[A],S=_.start,U=_.count;for(let z=S,H=S+U;z<H;z+=3)E(e.getX(z+0)),E(e.getX(z+1)),E(e.getX(z+2))}}computeVertexNormals(){let e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Rt(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let d=0,p=i.count;d<p;d++)i.setXYZ(d,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let d=0,p=e.count;d<p;d+=3){let m=e.getX(d+0),x=e.getX(d+1),g=e.getX(d+2);r.fromBufferAttribute(n,m),s.fromBufferAttribute(n,x),o.fromBufferAttribute(n,g),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,g),a.add(u),l.add(u),c.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,p=n.count;d<p;d+=3)r.fromBufferAttribute(n,d+0),s.fromBufferAttribute(n,d+1),o.fromBufferAttribute(n,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ft.fromBufferAttribute(e,n),Ft.normalize(),e.setXYZ(n,Ft.x,Ft.y,Ft.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),p=0,m=0;for(let x=0,g=l.length;x<g;x++){a.isInterleavedBufferAttribute?p=l[x]*a.data.stride+a.offset:p=l[x]*u;for(let f=0;f<u;f++)d[m++]=c[p++]}return new Rt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new t,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);n.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],p=e(d,i);l.push(p)}n.morphAttributes[a]=l}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let p=c[h];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(n));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(n))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(n));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},M_=new nt,ws=new Vm,_u=new ks,S_=new P,Mu=new P,Su=new P,wu=new P,Fp=new P,Eu=new P,w_=new P,bu=new P,be=class extends yn{constructor(e=new qt,n=new Rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,n){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Eu.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Fp.fromBufferAttribute(h,e),o?Eu.addScaledVector(Fp,u):Eu.addScaledVector(Fp.sub(n),u))}n.add(Eu)}return n}raycast(e,n){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),_u.copy(i.boundingSphere),_u.applyMatrix4(s),ws.copy(e.ray).recast(e.near),!(_u.containsPoint(ws.origin)===!1&&(ws.intersectSphere(_u,S_)===null||ws.origin.distanceToSquared(S_)>(e.far-e.near)**2))&&(M_.copy(s).invert(),ws.copy(e.ray).applyMatrix4(M_),!(i.boundingBox!==null&&ws.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,ws)))}_computeIntersections(e,n,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let g=d[m],f=o[g.materialIndex],y=Math.max(g.start,p.start),v=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let M=y,R=v;M<R;M+=3){let T=a.getX(M),E=a.getX(M+1),A=a.getX(M+2);r=Tu(this,f,e,i,c,u,h,T,E,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,n.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let g=m,f=x;g<f;g+=3){let y=a.getX(g),v=a.getX(g+1),M=a.getX(g+2);r=Tu(this,o,e,i,c,u,h,y,v,M),r&&(r.faceIndex=Math.floor(g/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let g=d[m],f=o[g.materialIndex],y=Math.max(g.start,p.start),v=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let M=y,R=v;M<R;M+=3){let T=M,E=M+1,A=M+2;r=Tu(this,f,e,i,c,u,h,T,E,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,n.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let g=m,f=x;g<f;g+=3){let y=g,v=g+1,M=g+2;r=Tu(this,o,e,i,c,u,h,y,v,M),r&&(r.faceIndex=Math.floor(g/3),n.push(r))}}}};function WE(t,e,n,i,r,s,o,a){let l;if(e.side===Yt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===Jr,a),l===null)return null;bu.copy(a),bu.applyMatrix4(t.matrixWorld);let c=n.ray.origin.distanceTo(bu);return c<n.near||c>n.far?null:{distance:c,point:bu.clone(),object:t}}function Tu(t,e,n,i,r,s,o,a,l,c){t.getVertexPosition(a,Mu),t.getVertexPosition(l,Su),t.getVertexPosition(c,wu);let u=WE(t,e,n,i,Mu,Su,wu,w_);if(u){let h=new P;jr.getBarycoord(w_,Mu,Su,wu,h),r&&(u.uv=jr.getInterpolatedAttribute(r,a,l,c,h,new ue)),s&&(u.uv1=jr.getInterpolatedAttribute(s,a,l,c,h,new ue)),o&&(u.normal=jr.getInterpolatedAttribute(o,a,l,c,h,new P),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new P,materialIndex:0};jr.getNormal(Mu,Su,wu,d.normal),u.face=d,u.barycoord=h}return u}var zi=class t extends qt{constructor(e=1,n=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,p=0;m("z","y","x",-1,-1,i,n,e,o,s,0),m("z","y","x",1,-1,i,n,-e,o,s,1),m("x","z","y",1,1,e,i,n,r,o,2),m("x","z","y",1,-1,e,i,-n,r,o,3),m("x","y","z",1,-1,e,n,i,r,s,4),m("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new st(c,3)),this.setAttribute("normal",new st(u,3)),this.setAttribute("uv",new st(h,2));function m(x,g,f,y,v,M,R,T,E,A,L){let _=M/E,S=R/A,U=M/2,z=R/2,H=T/2,Y=E+1,O=A+1,G=0,F=0,ee=new P;for(let ne=0;ne<O;ne++){let re=ne*S-z;for(let Ee=0;Ee<Y;Ee++){let Be=Ee*_-U;ee[x]=Be*y,ee[g]=re*v,ee[f]=H,c.push(ee.x,ee.y,ee.z),ee[x]=0,ee[g]=0,ee[f]=T>0?1:-1,u.push(ee.x,ee.y,ee.z),h.push(Ee/E),h.push(1-ne/A),G+=1}}for(let ne=0;ne<A;ne++)for(let re=0;re<E;re++){let Ee=d+re+Y*ne,Be=d+re+Y*(ne+1),q=d+(re+1)+Y*(ne+1),K=d+(re+1)+Y*ne;l.push(Ee,Be,K),l.push(Be,q,K),F+=6}a.addGroup(p,F,L),p+=F,d+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ea(t){let e={};for(let n in t){e[n]={};for(let i in t[n]){let r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function gn(t){let e={};for(let n=0;n<t.length;n++){let i=ea(t[n]);for(let r in i)e[r]=i[r]}return e}function XE(t){let e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function S1(t){let e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}var YE={clone:ea,merge:gn},qE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$E=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Oi=class extends es{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=qE,this.fragmentShader=$E,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ea(e.uniforms),this.uniformsGroups=XE(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?n.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[r]={type:"m4",value:o.toArray()}:n.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}},nh=class extends yn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nt,this.projectionMatrix=new nt,this.projectionMatrixInverse=new nt,this.coordinateSystem=cr}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},qr=new P,E_=new ue,b_=new ue,vn=class extends nh{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let n=.5*this.getFilmHeight()/e;this.fov=Om*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(yp*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Om*2*Math.atan(Math.tan(yp*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){qr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qr.x,qr.y).multiplyScalar(-e/qr.z),qr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(qr.x,qr.y).multiplyScalar(-e/qr.z)}getViewSize(e,n){return this.getViewBounds(e,E_,b_),n.subVectors(b_,E_)}setViewOffset(e,n,i,r,s,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,n=e*Math.tan(yp*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,n-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}},Do=-90,Uo=1,Gm=class extends yn{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new vn(Do,Uo,e,n);r.layers=this.layers,this.add(r);let s=new vn(Do,Uo,e,n);s.layers=this.layers,this.add(s);let o=new vn(Do,Uo,e,n);o.layers=this.layers,this.add(o);let a=new vn(Do,Uo,e,n);a.layers=this.layers,this.add(a);let l=new vn(Do,Uo,e,n);l.layers=this.layers,this.add(l);let c=new vn(Do,Uo,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,n=this.children.concat(),[i,r,s,o,a,l]=n;for(let c of n)this.remove(c);if(e===cr)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ju)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,o),e.setRenderTarget(i,2,r),e.render(n,a),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(n,u),e.setRenderTarget(h,d,p),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},ih=class extends An{constructor(e,n,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],n=n!==void 0?n:Zo,super(e,n,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Wm=class extends fr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new ih(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Mi}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new zi(5,5,5),s=new Oi({name:"CubemapFromEquirect",uniforms:ea(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Yt,blending:Zr});s.uniforms.tEquirect.value=n;let o=new be(r,s),a=n.minFilter;return n.minFilter===Is&&(n.minFilter=Mi),new Gm(1,10,this).update(e,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,n,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,r);e.setRenderTarget(s)}},Bp=new P,jE=new P,ZE=new Oe,lr=class{constructor(e=new P(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){let r=Bp.subVectors(i,n).cross(jE.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){let i=e.delta(Bp),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){let i=n||ZE.getNormalMatrix(e),r=this.coplanarPoint(Bp).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Es=new ks,Au=new P,_l=class{constructor(e=new lr,n=new lr,i=new lr,r=new lr,s=new lr,o=new lr){this.planes=[e,n,i,r,s,o]}set(e,n,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(n),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=cr){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],p=r[8],m=r[9],x=r[10],g=r[11],f=r[12],y=r[13],v=r[14],M=r[15];if(i[0].setComponents(l-s,d-c,g-p,M-f).normalize(),i[1].setComponents(l+s,d+c,g+p,M+f).normalize(),i[2].setComponents(l+o,d+u,g+m,M+y).normalize(),i[3].setComponents(l-o,d-u,g-m,M-y).normalize(),i[4].setComponents(l-a,d-h,g-x,M-v).normalize(),n===cr)i[5].setComponents(l+a,d+h,g+x,M+v).normalize();else if(n===ju)i[5].setComponents(a,h,x,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Es.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),Es.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Es)}intersectsSprite(e){return Es.center.set(0,0,0),Es.radius=.7071067811865476,Es.applyMatrix4(e.matrixWorld),this.intersectsSphere(Es)}intersectsSphere(e){let n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let n=this.planes;for(let i=0;i<6;i++){let r=n[i];if(Au.x=r.normal.x>0?e.max.x:e.min.x,Au.y=r.normal.y>0?e.max.y:e.min.y,Au.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Au)<0)return!1}return!0}containsPoint(e){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function w1(){let t=null,e=!1,n=null,i=null;function r(s,o){n(s,o),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function KE(t){let e=new WeakMap;function n(a,l){let c=a.array,u=a.usage,h=c.byteLength,d=t.createBuffer();t.bindBuffer(l,d),t.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=t.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=t.HALF_FLOAT:p=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=t.SHORT;else if(c instanceof Uint32Array)p=t.UNSIGNED_INT;else if(c instanceof Int32Array)p=t.INT;else if(c instanceof Int8Array)p=t.BYTE;else if(c instanceof Uint8Array)p=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(t.bindBuffer(c,a),h.length===0)t.bufferSubData(c,0,u);else{h.sort((p,m)=>p.start-m.start);let d=0;for(let p=1;p<h.length;p++){let m=h[d],x=h[p];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++d,h[d]=x)}h.length=d+1;for(let p=0,m=h.length;p<m;p++){let x=h[p];t.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(t.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,n(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var pr=class t extends qt{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};let s=e/2,o=n/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=n/l,p=[],m=[],x=[],g=[];for(let f=0;f<u;f++){let y=f*d-o;for(let v=0;v<c;v++){let M=v*h-s;m.push(M,-y,0),x.push(0,0,1),g.push(v/a),g.push(1-f/l)}}for(let f=0;f<l;f++)for(let y=0;y<a;y++){let v=y+c*f,M=y+c*(f+1),R=y+1+c*(f+1),T=y+1+c*f;p.push(v,M,T),p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new st(m,3)),this.setAttribute("normal",new st(x,3)),this.setAttribute("uv",new st(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.width,e.height,e.widthSegments,e.heightSegments)}},JE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,QE=`#ifdef USE_ALPHAHASH
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
#endif`,eb=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,tb=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nb=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ib=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rb=`#ifdef USE_AOMAP
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
#endif`,sb=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ob=`#ifdef USE_BATCHING
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
#endif`,ab=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,lb=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,cb=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ub=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,hb=`#ifdef USE_IRIDESCENCE
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
#endif`,fb=`#ifdef USE_BUMPMAP
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
#endif`,db=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,pb=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,mb=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,gb=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vb=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,yb=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,xb=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,_b=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Mb=`#define PI 3.141592653589793
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
} // validated`,Sb=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,wb=`vec3 transformedNormal = objectNormal;
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
#endif`,Eb=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bb=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tb=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ab=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rb="gl_FragColor = linearToOutputTexel( gl_FragColor );",Cb=`
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
}`,Pb=`#ifdef USE_ENVMAP
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
#endif`,Ib=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Lb=`#ifdef USE_ENVMAP
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
#endif`,Nb=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kb=`#ifdef USE_ENVMAP
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
#endif`,Db=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ub=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,zb=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ob=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Fb=`#ifdef USE_GRADIENTMAP
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
}`,Bb=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Hb=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vb=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gb=`uniform bool receiveShadow;
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
#endif`,Wb=`#ifdef USE_ENVMAP
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
#endif`,Xb=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Yb=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qb=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$b=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,jb=`PhysicalMaterial material;
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
#endif`,Zb=`struct PhysicalMaterial {
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
}`,Kb=`
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
#endif`,Jb=`#if defined( RE_IndirectDiffuse )
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
#endif`,Qb=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,eT=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tT=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,nT=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,iT=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rT=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,sT=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,oT=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,aT=`#if defined( USE_POINTS_UV )
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
#endif`,lT=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cT=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,uT=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,hT=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,fT=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dT=`#ifdef USE_MORPHTARGETS
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
#endif`,pT=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mT=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,gT=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,vT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xT=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,_T=`#ifdef USE_NORMALMAP
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
#endif`,MT=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ST=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wT=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ET=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,bT=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,TT=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,AT=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,RT=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,CT=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,PT=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,IT=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,LT=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,NT=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,kT=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,DT=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,UT=`float getShadowMask() {
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
}`,zT=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,OT=`#ifdef USE_SKINNING
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
#endif`,FT=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,BT=`#ifdef USE_SKINNING
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
#endif`,HT=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,VT=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,GT=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,WT=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,XT=`#ifdef USE_TRANSMISSION
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
#endif`,YT=`#ifdef USE_TRANSMISSION
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
#endif`,qT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$T=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,jT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ZT=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,KT=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,JT=`uniform sampler2D t2D;
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
}`,QT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eA=`#ifdef ENVMAP_TYPE_CUBE
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
}`,tA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nA=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,iA=`#include <common>
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
}`,rA=`#if DEPTH_PACKING == 3200
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
}`,sA=`#define DISTANCE
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
}`,oA=`#define DISTANCE
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
}`,aA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lA=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cA=`uniform float scale;
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
}`,uA=`uniform vec3 diffuse;
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
}`,hA=`#include <common>
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
}`,fA=`uniform vec3 diffuse;
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
}`,dA=`#define LAMBERT
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
}`,pA=`#define LAMBERT
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
}`,mA=`#define MATCAP
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
}`,gA=`#define MATCAP
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
}`,vA=`#define NORMAL
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
}`,yA=`#define NORMAL
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
}`,xA=`#define PHONG
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
}`,_A=`#define PHONG
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
}`,MA=`#define STANDARD
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
}`,SA=`#define STANDARD
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
}`,wA=`#define TOON
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
}`,EA=`#define TOON
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
}`,bA=`uniform float size;
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
}`,TA=`uniform vec3 diffuse;
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
}`,AA=`#include <common>
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
}`,RA=`uniform vec3 color;
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
}`,CA=`uniform float rotation;
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
}`,PA=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:JE,alphahash_pars_fragment:QE,alphamap_fragment:eb,alphamap_pars_fragment:tb,alphatest_fragment:nb,alphatest_pars_fragment:ib,aomap_fragment:rb,aomap_pars_fragment:sb,batching_pars_vertex:ob,batching_vertex:ab,begin_vertex:lb,beginnormal_vertex:cb,bsdfs:ub,iridescence_fragment:hb,bumpmap_pars_fragment:fb,clipping_planes_fragment:db,clipping_planes_pars_fragment:pb,clipping_planes_pars_vertex:mb,clipping_planes_vertex:gb,color_fragment:vb,color_pars_fragment:yb,color_pars_vertex:xb,color_vertex:_b,common:Mb,cube_uv_reflection_fragment:Sb,defaultnormal_vertex:wb,displacementmap_pars_vertex:Eb,displacementmap_vertex:bb,emissivemap_fragment:Tb,emissivemap_pars_fragment:Ab,colorspace_fragment:Rb,colorspace_pars_fragment:Cb,envmap_fragment:Pb,envmap_common_pars_fragment:Ib,envmap_pars_fragment:Lb,envmap_pars_vertex:Nb,envmap_physical_pars_fragment:Wb,envmap_vertex:kb,fog_vertex:Db,fog_pars_vertex:Ub,fog_fragment:zb,fog_pars_fragment:Ob,gradientmap_pars_fragment:Fb,lightmap_pars_fragment:Bb,lights_lambert_fragment:Hb,lights_lambert_pars_fragment:Vb,lights_pars_begin:Gb,lights_toon_fragment:Xb,lights_toon_pars_fragment:Yb,lights_phong_fragment:qb,lights_phong_pars_fragment:$b,lights_physical_fragment:jb,lights_physical_pars_fragment:Zb,lights_fragment_begin:Kb,lights_fragment_maps:Jb,lights_fragment_end:Qb,logdepthbuf_fragment:eT,logdepthbuf_pars_fragment:tT,logdepthbuf_pars_vertex:nT,logdepthbuf_vertex:iT,map_fragment:rT,map_pars_fragment:sT,map_particle_fragment:oT,map_particle_pars_fragment:aT,metalnessmap_fragment:lT,metalnessmap_pars_fragment:cT,morphinstance_vertex:uT,morphcolor_vertex:hT,morphnormal_vertex:fT,morphtarget_pars_vertex:dT,morphtarget_vertex:pT,normal_fragment_begin:mT,normal_fragment_maps:gT,normal_pars_fragment:vT,normal_pars_vertex:yT,normal_vertex:xT,normalmap_pars_fragment:_T,clearcoat_normal_fragment_begin:MT,clearcoat_normal_fragment_maps:ST,clearcoat_pars_fragment:wT,iridescence_pars_fragment:ET,opaque_fragment:bT,packing:TT,premultiplied_alpha_fragment:AT,project_vertex:RT,dithering_fragment:CT,dithering_pars_fragment:PT,roughnessmap_fragment:IT,roughnessmap_pars_fragment:LT,shadowmap_pars_fragment:NT,shadowmap_pars_vertex:kT,shadowmap_vertex:DT,shadowmask_pars_fragment:UT,skinbase_vertex:zT,skinning_pars_vertex:OT,skinning_vertex:FT,skinnormal_vertex:BT,specularmap_fragment:HT,specularmap_pars_fragment:VT,tonemapping_fragment:GT,tonemapping_pars_fragment:WT,transmission_fragment:XT,transmission_pars_fragment:YT,uv_pars_fragment:qT,uv_pars_vertex:$T,uv_vertex:jT,worldpos_vertex:ZT,background_vert:KT,background_frag:JT,backgroundCube_vert:QT,backgroundCube_frag:eA,cube_vert:tA,cube_frag:nA,depth_vert:iA,depth_frag:rA,distanceRGBA_vert:sA,distanceRGBA_frag:oA,equirect_vert:aA,equirect_frag:lA,linedashed_vert:cA,linedashed_frag:uA,meshbasic_vert:hA,meshbasic_frag:fA,meshlambert_vert:dA,meshlambert_frag:pA,meshmatcap_vert:mA,meshmatcap_frag:gA,meshnormal_vert:vA,meshnormal_frag:yA,meshphong_vert:xA,meshphong_frag:_A,meshphysical_vert:MA,meshphysical_frag:SA,meshtoon_vert:wA,meshtoon_frag:EA,points_vert:bA,points_frag:TA,shadow_vert:AA,shadow_frag:RA,sprite_vert:CA,sprite_frag:PA},se={common:{diffuse:{value:new Pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new Pe(16777215)},opacity:{value:1},center:{value:new ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},Li={basic:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Pe(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Pe(0)},specular:{value:new Pe(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:gn([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:gn([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Pe(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:gn([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:gn([se.points,se.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:gn([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:gn([se.common,se.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:gn([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:gn([se.sprite,se.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:gn([se.common,se.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:gn([se.lights,se.fog,{color:{value:new Pe(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Li.physical={uniforms:gn([Li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new Pe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new Pe(0)},specularColor:{value:new Pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};var Ru={r:0,b:0,g:0},bs=new Ui,IA=new nt;function LA(t,e,n,i,r,s,o){let a=new Pe(0),l=s===!0?0:1,c,u,h=null,d=0,p=null;function m(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?n:e).get(v)),v}function x(y){let v=!1,M=m(y);M===null?f(a,l):M&&M.isColor&&(f(M,1),v=!0);let R=t.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(t.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function g(y,v){let M=m(v);M&&(M.isCubeTexture||M.mapping===yh)?(u===void 0&&(u=new be(new zi(1,1,1),new Oi({name:"BackgroundCubeMaterial",uniforms:ea(Li.backgroundCube.uniforms),vertexShader:Li.backgroundCube.vertexShader,fragmentShader:Li.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,T,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),bs.copy(v.backgroundRotation),bs.x*=-1,bs.y*=-1,bs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(bs.y*=-1,bs.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(IA.makeRotationFromEuler(bs)),u.material.toneMapped=Qe.getTransfer(M.colorSpace)!==mt,(h!==M||d!==M.version||p!==t.toneMapping)&&(u.material.needsUpdate=!0,h=M,d=M.version,p=t.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new be(new pr(2,2),new Oi({name:"BackgroundMaterial",uniforms:ea(Li.background.uniforms),vertexShader:Li.background.vertexShader,fragmentShader:Li.background.fragmentShader,side:Jr,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(M.colorSpace)!==mt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||p!==t.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,p=t.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function f(y,v){y.getRGB(Ru,S1(t)),i.buffers.color.setClear(Ru.r,Ru.g,Ru.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(y,v=1){a.set(y),l=v,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,f(a,l)},render:x,addToRenderList:g}}function NA(t,e){let n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=d(null),s=r,o=!1;function a(_,S,U,z,H){let Y=!1,O=h(z,U,S);s!==O&&(s=O,c(s.object)),Y=p(_,z,U,H),Y&&m(_,z,U,H),H!==null&&e.update(H,t.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,M(_,S,U,z),H!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return t.createVertexArray()}function c(_){return t.bindVertexArray(_)}function u(_){return t.deleteVertexArray(_)}function h(_,S,U){let z=U.wireframe===!0,H=i[_.id];H===void 0&&(H={},i[_.id]=H);let Y=H[S.id];Y===void 0&&(Y={},H[S.id]=Y);let O=Y[z];return O===void 0&&(O=d(l()),Y[z]=O),O}function d(_){let S=[],U=[],z=[];for(let H=0;H<n;H++)S[H]=0,U[H]=0,z[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:U,attributeDivisors:z,object:_,attributes:{},index:null}}function p(_,S,U,z){let H=s.attributes,Y=S.attributes,O=0,G=U.getAttributes();for(let F in G)if(G[F].location>=0){let ne=H[F],re=Y[F];if(re===void 0&&(F==="instanceMatrix"&&_.instanceMatrix&&(re=_.instanceMatrix),F==="instanceColor"&&_.instanceColor&&(re=_.instanceColor)),ne===void 0||ne.attribute!==re||re&&ne.data!==re.data)return!0;O++}return s.attributesNum!==O||s.index!==z}function m(_,S,U,z){let H={},Y=S.attributes,O=0,G=U.getAttributes();for(let F in G)if(G[F].location>=0){let ne=Y[F];ne===void 0&&(F==="instanceMatrix"&&_.instanceMatrix&&(ne=_.instanceMatrix),F==="instanceColor"&&_.instanceColor&&(ne=_.instanceColor));let re={};re.attribute=ne,ne&&ne.data&&(re.data=ne.data),H[F]=re,O++}s.attributes=H,s.attributesNum=O,s.index=z}function x(){let _=s.newAttributes;for(let S=0,U=_.length;S<U;S++)_[S]=0}function g(_){f(_,0)}function f(_,S){let U=s.newAttributes,z=s.enabledAttributes,H=s.attributeDivisors;U[_]=1,z[_]===0&&(t.enableVertexAttribArray(_),z[_]=1),H[_]!==S&&(t.vertexAttribDivisor(_,S),H[_]=S)}function y(){let _=s.newAttributes,S=s.enabledAttributes;for(let U=0,z=S.length;U<z;U++)S[U]!==_[U]&&(t.disableVertexAttribArray(U),S[U]=0)}function v(_,S,U,z,H,Y,O){O===!0?t.vertexAttribIPointer(_,S,U,H,Y):t.vertexAttribPointer(_,S,U,z,H,Y)}function M(_,S,U,z){x();let H=z.attributes,Y=U.getAttributes(),O=S.defaultAttributeValues;for(let G in Y){let F=Y[G];if(F.location>=0){let ee=H[G];if(ee===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(ee=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(ee=_.instanceColor)),ee!==void 0){let ne=ee.normalized,re=ee.itemSize,Ee=e.get(ee);if(Ee===void 0)continue;let Be=Ee.buffer,q=Ee.type,K=Ee.bytesPerElement,de=q===t.INT||q===t.UNSIGNED_INT||ee.gpuType===T0;if(ee.isInterleavedBufferAttribute){let ae=ee.data,Re=ae.stride,we=ee.offset;if(ae.isInstancedInterleavedBuffer){for(let Ue=0;Ue<F.locationSize;Ue++)f(F.location+Ue,ae.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Ue=0;Ue<F.locationSize;Ue++)g(F.location+Ue);t.bindBuffer(t.ARRAY_BUFFER,Be);for(let Ue=0;Ue<F.locationSize;Ue++)v(F.location+Ue,re/F.locationSize,q,ne,Re*K,(we+re/F.locationSize*Ue)*K,de)}else{if(ee.isInstancedBufferAttribute){for(let ae=0;ae<F.locationSize;ae++)f(F.location+ae,ee.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let ae=0;ae<F.locationSize;ae++)g(F.location+ae);t.bindBuffer(t.ARRAY_BUFFER,Be);for(let ae=0;ae<F.locationSize;ae++)v(F.location+ae,re/F.locationSize,q,ne,re*K,re/F.locationSize*ae*K,de)}}else if(O!==void 0){let ne=O[G];if(ne!==void 0)switch(ne.length){case 2:t.vertexAttrib2fv(F.location,ne);break;case 3:t.vertexAttrib3fv(F.location,ne);break;case 4:t.vertexAttrib4fv(F.location,ne);break;default:t.vertexAttrib1fv(F.location,ne)}}}}y()}function R(){A();for(let _ in i){let S=i[_];for(let U in S){let z=S[U];for(let H in z)u(z[H].object),delete z[H];delete S[U]}delete i[_]}}function T(_){if(i[_.id]===void 0)return;let S=i[_.id];for(let U in S){let z=S[U];for(let H in z)u(z[H].object),delete z[H];delete S[U]}delete i[_.id]}function E(_){for(let S in i){let U=i[S];if(U[_.id]===void 0)continue;let z=U[_.id];for(let H in z)u(z[H].object),delete z[H];delete U[_.id]}}function A(){L(),o=!0,s!==r&&(s=r,c(s.object))}function L(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:A,resetDefaultState:L,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:E,initAttributes:x,enableAttribute:g,disableUnusedAttributes:y}}function kA(t,e,n){let i;function r(c){i=c}function s(c,u){t.drawArrays(i,c,u),n.update(u,i,1)}function o(c,u,h){h!==0&&(t.drawArraysInstanced(i,c,u,h),n.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let p=0;for(let m=0;m<h;m++)p+=u[m];n.update(p,i,1)}function l(c,u,h,d){if(h===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<c.length;m++)o(c[m],u[m],d[m]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,u,0,d,0,h);let m=0;for(let x=0;x<h;x++)m+=u[x];for(let x=0;x<d.length;x++)n.update(m,i,d[x])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function DA(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(E){return!(E!==Si&&i.convert(E)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let A=E===Il&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==hr&&i.convert(E)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==ki&&!A)}function l(E){if(E==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=n.logarithmicDepthBuffer===!0,d=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(d===!0){let E=e.get("EXT_clip_control");E.clipControlEXT(E.LOWER_LEFT_EXT,E.ZERO_TO_ONE_EXT)}let p=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),m=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=t.getParameter(t.MAX_TEXTURE_SIZE),g=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),f=t.getParameter(t.MAX_VERTEX_ATTRIBS),y=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),v=t.getParameter(t.MAX_VARYING_VECTORS),M=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),R=m>0,T=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:y,maxVaryings:v,maxFragmentUniforms:M,vertexTextures:R,maxSamples:T}}function UA(t){let e=this,n=null,i=0,r=!1,s=!1,o=new lr,a=new Oe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let p=h.length!==0||d||i!==0||r;return r=d,i=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){n=u(h,d,0)},this.setState=function(h,d,p){let m=h.clippingPlanes,x=h.clipIntersection,g=h.clipShadows,f=t.get(h);if(!r||m===null||m.length===0||s&&!g)s?u(null):c();else{let y=s?0:i,v=y*4,M=f.clippingState||null;l.value=M,M=u(m,d,v,p);for(let R=0;R!==v;++R)M[R]=n[R];f.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,p,m){let x=h!==null?h.length:0,g=null;if(x!==0){if(g=l.value,m!==!0||g===null){let f=p+x*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(g===null||g.length<f)&&(g=new Float32Array(f));for(let v=0,M=p;v!==x;++v,M+=4)o.copy(h[v]).applyMatrix4(y,a),o.normal.toArray(g,M),g[M+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}function zA(t){let e=new WeakMap;function n(o,a){return a===am?o.mapping=Zo:a===lm&&(o.mapping=Ko),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===am||a===lm)if(e.has(o)){let l=e.get(o).texture;return n(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Wm(l.height);return c.fromEquirectangularTexture(t,o),e.set(o,c),o.addEventListener("dispose",r),n(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var rh=class extends nh{constructor(e=-1,n=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+n,l=r-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},Go=4,T_=[.125,.215,.35,.446,.526,.582],Cs=20,Hp=new rh,A_=new Pe,Vp=null,Gp=0,Wp=0,Xp=!1,As=(1+Math.sqrt(5))/2,zo=1/As,R_=[new P(-As,zo,0),new P(As,zo,0),new P(-zo,0,As),new P(zo,0,As),new P(0,As,-zo),new P(0,As,zo),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],ta=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){Vp=this._renderer.getRenderTarget(),Gp=this._renderer.getActiveCubeFace(),Wp=this._renderer.getActiveMipmapLevel(),Xp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=I_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=P_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Vp,Gp,Wp),this._renderer.xr.enabled=Xp,e.scissorTest=!1,Cu(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Zo||e.mapping===Ko?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Vp=this._renderer.getRenderTarget(),Gp=this._renderer.getActiveCubeFace(),Wp=this._renderer.getActiveMipmapLevel(),Xp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Mi,minFilter:Mi,generateMipmaps:!1,type:Il,format:Si,colorSpace:ns,depthBuffer:!1},r=C_(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=C_(e,n,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=OA(s)),this._blurMaterial=FA(s,e,n)}return r}_compileMaterial(e){let n=new be(this._lodPlanes[0],e);this._renderer.compile(n,Hp)}_sceneToCubeUV(e,n,i,r){let a=new vn(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(A_),u.toneMapping=Kr,u.autoClear=!1;let p=new Rn({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1}),m=new be(new zi,p),x=!1,g=e.background;g?g.isColor&&(p.color.copy(g),e.background=null,x=!0):(p.color.copy(A_),x=!0);for(let f=0;f<6;f++){let y=f%3;y===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):y===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));let v=this._cubeSize;Cu(r,y*v,f>2?v:0,v,v),u.setRenderTarget(r),x&&u.render(m,a),u.render(e,a)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=g}_textureToCubeUV(e,n){let i=this._renderer,r=e.mapping===Zo||e.mapping===Ko;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=I_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=P_());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new be(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Cu(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(o,Hp)}_applyPMREM(e){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=R_[(r-s-1)%R_.length];this._blur(e,s-1,s,o,a)}n.autoClear=i}_blur(e,n,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,n,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new be(this._lodPlanes[r],c),d=c.uniforms,p=this._sizeLods[i]-1,m=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*Cs-1),x=s/m,g=isFinite(s)?1+Math.floor(u*x):Cs;g>Cs&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Cs}`);let f=[],y=0;for(let E=0;E<Cs;++E){let A=E/x,L=Math.exp(-A*A/2);f.push(L),E===0?y+=L:E<g&&(y+=2*L)}for(let E=0;E<f.length;E++)f[E]=f[E]/y;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:v}=this;d.dTheta.value=m,d.mipInt.value=v-i;let M=this._sizeLods[r],R=3*M*(r>v-Go?r-v+Go:0),T=4*(this._cubeSize-M);Cu(n,R,T,3*M,2*M),l.setRenderTarget(n),l.render(h,Hp)}};function OA(t){let e=[],n=[],i=[],r=t,s=t-Go+1+T_.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);n.push(a);let l=1/a;o>t-Go?l=T_[o-t+Go-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,m=6,x=3,g=2,f=1,y=new Float32Array(x*m*p),v=new Float32Array(g*m*p),M=new Float32Array(f*m*p);for(let T=0;T<p;T++){let E=T%3*2/3-1,A=T>2?0:-1,L=[E,A,0,E+2/3,A,0,E+2/3,A+1,0,E,A,0,E+2/3,A+1,0,E,A+1,0];y.set(L,x*m*T),v.set(d,g*m*T);let _=[T,T,T,T,T,T];M.set(_,f*m*T)}let R=new qt;R.setAttribute("position",new Rt(y,x)),R.setAttribute("uv",new Rt(v,g)),R.setAttribute("faceIndex",new Rt(M,f)),e.push(R),r>Go&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function C_(t,e,n){let i=new fr(t,e,n);return i.texture.mapping=yh,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Cu(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function FA(t,e,n){let i=new Float32Array(Cs),r=new P(0,1,0);return new Oi({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:k0(),fragmentShader:`

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
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function P_(){return new Oi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:k0(),fragmentShader:`

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
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function I_(){return new Oi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:k0(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function k0(){return`

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
	`}function BA(t){let e=new WeakMap,n=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===am||l===lm,u=l===Zo||l===Ko;if(c||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return n===null&&(n=new ta(t)),h=c?n.fromEquirectangular(a,h):n.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return c&&p&&p.height>0||u&&p&&r(p)?(n===null&&(n=new ta(t)),h=c?n.fromEquirectangular(a):n.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function HA(t){let e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let r=n(i);return r===null&&Wu("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function VA(t,e,n,i){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);for(let m in d.morphAttributes){let x=d.morphAttributes[m];for(let g=0,f=x.length;g<f;g++)e.remove(x[g])}d.removeEventListener("dispose",o),delete r[d.id];let p=s.get(d);p&&(e.remove(p),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,n.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,n.memory.geometries++),d}function l(h){let d=h.attributes;for(let m in d)e.update(d[m],t.ARRAY_BUFFER);let p=h.morphAttributes;for(let m in p){let x=p[m];for(let g=0,f=x.length;g<f;g++)e.update(x[g],t.ARRAY_BUFFER)}}function c(h){let d=[],p=h.index,m=h.attributes.position,x=0;if(p!==null){let y=p.array;x=p.version;for(let v=0,M=y.length;v<M;v+=3){let R=y[v+0],T=y[v+1],E=y[v+2];d.push(R,T,T,E,E,R)}}else if(m!==void 0){let y=m.array;x=m.version;for(let v=0,M=y.length/3-1;v<M;v+=3){let R=v+0,T=v+1,E=v+2;d.push(R,T,T,E,E,R)}}else return;let g=new(_1(d)?th:eh)(d,1);g.version=x;let f=s.get(h);f&&e.remove(f),s.set(h,g)}function u(h){let d=s.get(h);if(d){let p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function GA(t,e,n){let i;function r(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,p){t.drawElements(i,p,s,d*o),n.update(p,i,1)}function c(d,p,m){m!==0&&(t.drawElementsInstanced(i,p,s,d*o,m),n.update(p,i,m))}function u(d,p,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,d,0,m);let g=0;for(let f=0;f<m;f++)g+=p[f];n.update(g,i,1)}function h(d,p,m,x){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let f=0;f<d.length;f++)c(d[f]/o,p[f],x[f]);else{g.multiDrawElementsInstancedWEBGL(i,p,0,s,d,0,x,0,m);let f=0;for(let y=0;y<m;y++)f+=p[y];for(let y=0;y<x.length;y++)n.update(f,i,x[y])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function WA(t){let e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(s/3);break;case t.LINES:n.lines+=a*(s/2);break;case t.LINE_STRIP:n.lines+=a*(s-1);break;case t.LINE_LOOP:n.lines+=a*s;break;case t.POINTS:n.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function XA(t,e,n){let i=new WeakMap,r=new bt;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let L=function(){E.dispose(),i.delete(a),a.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],v=0;p===!0&&(v=1),m===!0&&(v=2),x===!0&&(v=3);let M=a.attributes.position.count*v,R=1;M>e.maxTextureSize&&(R=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let T=new Float32Array(M*R*4*h),E=new Ju(T,M,R,h);E.type=ki,E.needsUpdate=!0;let A=v*4;for(let _=0;_<h;_++){let S=g[_],U=f[_],z=y[_],H=M*R*4*_;for(let Y=0;Y<S.count;Y++){let O=Y*A;p===!0&&(r.fromBufferAttribute(S,Y),T[H+O+0]=r.x,T[H+O+1]=r.y,T[H+O+2]=r.z,T[H+O+3]=0),m===!0&&(r.fromBufferAttribute(U,Y),T[H+O+4]=r.x,T[H+O+5]=r.y,T[H+O+6]=r.z,T[H+O+7]=0),x===!0&&(r.fromBufferAttribute(z,Y),T[H+O+8]=r.x,T[H+O+9]=r.y,T[H+O+10]=r.z,T[H+O+11]=z.itemSize===4?r.w:1)}}d={count:h,texture:E,size:new ue(M,R)},i.set(a,d),a.addEventListener("dispose",L)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",o.morphTexture,n);else{let p=0;for(let x=0;x<c.length;x++)p+=c[x];let m=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(t,"morphTargetBaseInfluence",m),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",d.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",d.size)}return{update:s}}function YA(t,e,n,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:o}}var sh=class extends An{constructor(e,n,i,r,s,o,a,l,c,u=Yo){if(u!==Yo&&u!==Qo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===Yo&&(i=Ns),i===void 0&&u===Qo&&(i=Jo),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=a!==void 0?a:nn,this.minFilter=l!==void 0?l:nn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}},E1=new An,L_=new sh(1,1),b1=new Ju,T1=new Hm,A1=new ih,N_=[],k_=[],D_=new Float32Array(16),U_=new Float32Array(9),z_=new Float32Array(4);function ra(t,e,n){let i=t[0];if(i<=0||i>0)return t;let r=e*n,s=N_[r];if(s===void 0&&(s=new Float32Array(r),N_[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(s,a)}return s}function kt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Dt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function _h(t,e){let n=k_[e];n===void 0&&(n=new Int32Array(e),k_[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function qA(t,e){let n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function $A(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(kt(n,e))return;t.uniform2fv(this.addr,e),Dt(n,e)}}function jA(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(kt(n,e))return;t.uniform3fv(this.addr,e),Dt(n,e)}}function ZA(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(kt(n,e))return;t.uniform4fv(this.addr,e),Dt(n,e)}}function KA(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(kt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Dt(n,e)}else{if(kt(n,i))return;z_.set(i),t.uniformMatrix2fv(this.addr,!1,z_),Dt(n,i)}}function JA(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(kt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Dt(n,e)}else{if(kt(n,i))return;U_.set(i),t.uniformMatrix3fv(this.addr,!1,U_),Dt(n,i)}}function QA(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(kt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Dt(n,e)}else{if(kt(n,i))return;D_.set(i),t.uniformMatrix4fv(this.addr,!1,D_),Dt(n,i)}}function e2(t,e){let n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function t2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(kt(n,e))return;t.uniform2iv(this.addr,e),Dt(n,e)}}function n2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(kt(n,e))return;t.uniform3iv(this.addr,e),Dt(n,e)}}function i2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(kt(n,e))return;t.uniform4iv(this.addr,e),Dt(n,e)}}function r2(t,e){let n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function s2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(kt(n,e))return;t.uniform2uiv(this.addr,e),Dt(n,e)}}function o2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(kt(n,e))return;t.uniform3uiv(this.addr,e),Dt(n,e)}}function a2(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(kt(n,e))return;t.uniform4uiv(this.addr,e),Dt(n,e)}}function l2(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(L_.compareFunction=x1,s=L_):s=E1,n.setTexture2D(e||s,r)}function c2(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||T1,r)}function u2(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||A1,r)}function h2(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||b1,r)}function f2(t){switch(t){case 5126:return qA;case 35664:return $A;case 35665:return jA;case 35666:return ZA;case 35674:return KA;case 35675:return JA;case 35676:return QA;case 5124:case 35670:return e2;case 35667:case 35671:return t2;case 35668:case 35672:return n2;case 35669:case 35673:return i2;case 5125:return r2;case 36294:return s2;case 36295:return o2;case 36296:return a2;case 35678:case 36198:case 36298:case 36306:case 35682:return l2;case 35679:case 36299:case 36307:return c2;case 35680:case 36300:case 36308:case 36293:return u2;case 36289:case 36303:case 36311:case 36292:return h2}}function d2(t,e){t.uniform1fv(this.addr,e)}function p2(t,e){let n=ra(e,this.size,2);t.uniform2fv(this.addr,n)}function m2(t,e){let n=ra(e,this.size,3);t.uniform3fv(this.addr,n)}function g2(t,e){let n=ra(e,this.size,4);t.uniform4fv(this.addr,n)}function v2(t,e){let n=ra(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function y2(t,e){let n=ra(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function x2(t,e){let n=ra(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function _2(t,e){t.uniform1iv(this.addr,e)}function M2(t,e){t.uniform2iv(this.addr,e)}function S2(t,e){t.uniform3iv(this.addr,e)}function w2(t,e){t.uniform4iv(this.addr,e)}function E2(t,e){t.uniform1uiv(this.addr,e)}function b2(t,e){t.uniform2uiv(this.addr,e)}function T2(t,e){t.uniform3uiv(this.addr,e)}function A2(t,e){t.uniform4uiv(this.addr,e)}function R2(t,e,n){let i=this.cache,r=e.length,s=_h(n,r);kt(i,s)||(t.uniform1iv(this.addr,s),Dt(i,s));for(let o=0;o!==r;++o)n.setTexture2D(e[o]||E1,s[o])}function C2(t,e,n){let i=this.cache,r=e.length,s=_h(n,r);kt(i,s)||(t.uniform1iv(this.addr,s),Dt(i,s));for(let o=0;o!==r;++o)n.setTexture3D(e[o]||T1,s[o])}function P2(t,e,n){let i=this.cache,r=e.length,s=_h(n,r);kt(i,s)||(t.uniform1iv(this.addr,s),Dt(i,s));for(let o=0;o!==r;++o)n.setTextureCube(e[o]||A1,s[o])}function I2(t,e,n){let i=this.cache,r=e.length,s=_h(n,r);kt(i,s)||(t.uniform1iv(this.addr,s),Dt(i,s));for(let o=0;o!==r;++o)n.setTexture2DArray(e[o]||b1,s[o])}function L2(t){switch(t){case 5126:return d2;case 35664:return p2;case 35665:return m2;case 35666:return g2;case 35674:return v2;case 35675:return y2;case 35676:return x2;case 5124:case 35670:return _2;case 35667:case 35671:return M2;case 35668:case 35672:return S2;case 35669:case 35673:return w2;case 5125:return E2;case 36294:return b2;case 36295:return T2;case 36296:return A2;case 35678:case 36198:case 36298:case 36306:case 35682:return R2;case 35679:case 36299:case 36307:return C2;case 35680:case 36300:case 36308:case 36293:return P2;case 36289:case 36303:case 36311:case 36292:return I2}}var Xm=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=f2(n.type)}},Ym=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=L2(n.type)}},qm=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,n[a.id],i)}}},Yp=/(\w+)(\])?(\[|\.)?/g;function O_(t,e){t.seq.push(e),t.map[e.id]=e}function N2(t,e,n){let i=t.name,r=i.length;for(Yp.lastIndex=0;;){let s=Yp.exec(i),o=Yp.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){O_(n,c===void 0?new Xm(a,t,e):new Ym(a,t,e));break}else{let h=n.map[a];h===void 0&&(h=new qm(a),O_(n,h)),n=h}}}var $o=class{constructor(e,n){this.seq=[],this.map={};let i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(n,r),o=e.getUniformLocation(n,s.name);N2(s,o,this)}}setValue(e,n,i,r){let s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){let r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,o=n.length;s!==o;++s){let a=n[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,n){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in n&&i.push(o)}return i}};function F_(t,e,n){let i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}var k2=37297,D2=0;function U2(t,e){let n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}function z2(t){let e=Qe.getPrimaries(Qe.workingColorSpace),n=Qe.getPrimaries(t),i;switch(e===n?i="":e===$u&&n===qu?i="LinearDisplayP3ToLinearSRGB":e===qu&&n===$u&&(i="LinearSRGBToLinearDisplayP3"),t){case ns:case xh:return[i,"LinearTransferOETF"];case Wn:case N0:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function B_(t,e,n){let i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+U2(t.getShaderSource(e),o)}else return r}function O2(t,e){let n=z2(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function F2(t,e){let n;switch(e){case cE:n="Linear";break;case uE:n="Reinhard";break;case hE:n="Cineon";break;case fE:n="ACESFilmic";break;case pE:n="AgX";break;case mE:n="Neutral";break;case dE:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Pu=new P;function B2(){Qe.getLuminanceCoefficients(Pu);let t=Pu.x.toFixed(4),e=Pu.y.toFixed(4),n=Pu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function H2(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(pl).join(`
`)}function V2(t){let e=[];for(let n in t){let i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function G2(t,e){let n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=t.getActiveAttrib(e,r),o=s.name,a=1;s.type===t.FLOAT_MAT2&&(a=2),s.type===t.FLOAT_MAT3&&(a=3),s.type===t.FLOAT_MAT4&&(a=4),n[o]={type:s.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function pl(t){return t!==""}function H_(t,e){let n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function V_(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var W2=/^[ \t]*#include +<([\w\d./]+)>/gm;function $m(t){return t.replace(W2,Y2)}var X2=new Map;function Y2(t,e){let n=ze[e];if(n===void 0){let i=X2.get(e);if(i!==void 0)n=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return $m(n)}var q2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function G_(t){return t.replace(q2,$2)}function $2(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function W_(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function j2(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===o1?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===b0?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===ar&&(e="SHADOWMAP_TYPE_VSM"),e}function Z2(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Zo:case Ko:e="ENVMAP_TYPE_CUBE";break;case yh:e="ENVMAP_TYPE_CUBE_UV";break}return e}function K2(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Ko:e="ENVMAP_MODE_REFRACTION";break}return e}function J2(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case a1:e="ENVMAP_BLENDING_MULTIPLY";break;case aE:e="ENVMAP_BLENDING_MIX";break;case lE:e="ENVMAP_BLENDING_ADD";break}return e}function Q2(t){let e=t.envMapCubeUVHeight;if(e===null)return null;let n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function eR(t,e,n,i){let r=t.getContext(),s=n.defines,o=n.vertexShader,a=n.fragmentShader,l=j2(n),c=Z2(n),u=K2(n),h=J2(n),d=Q2(n),p=H2(n),m=V2(s),x=r.createProgram(),g,f,y=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(pl).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(pl).join(`
`),f.length>0&&(f+=`
`)):(g=[W_(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pl).join(`
`),f=[W_(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Kr?"#define TONE_MAPPING":"",n.toneMapping!==Kr?ze.tonemapping_pars_fragment:"",n.toneMapping!==Kr?F2("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,O2("linearToOutputTexel",n.outputColorSpace),B2(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(pl).join(`
`)),o=$m(o),o=H_(o,n),o=V_(o,n),a=$m(a),a=H_(a,n),a=V_(a,n),o=G_(o),a=G_(a),n.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",n.glslVersion===l_?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===l_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let v=y+g+o,M=y+f+a,R=F_(r,r.VERTEX_SHADER,v),T=F_(r,r.FRAGMENT_SHADER,M);r.attachShader(x,R),r.attachShader(x,T),n.index0AttributeName!==void 0?r.bindAttribLocation(x,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function E(S){if(t.debug.checkShaderErrors){let U=r.getProgramInfoLog(x).trim(),z=r.getShaderInfoLog(R).trim(),H=r.getShaderInfoLog(T).trim(),Y=!0,O=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(Y=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,x,R,T);else{let G=B_(r,R,"vertex"),F=B_(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+U+`
`+G+`
`+F)}else U!==""?console.warn("THREE.WebGLProgram: Program Info Log:",U):(z===""||H==="")&&(O=!1);O&&(S.diagnostics={runnable:Y,programLog:U,vertexShader:{log:z,prefix:g},fragmentShader:{log:H,prefix:f}})}r.deleteShader(R),r.deleteShader(T),A=new $o(r,x),L=G2(r,x)}let A;this.getUniforms=function(){return A===void 0&&E(this),A};let L;this.getAttributes=function(){return L===void 0&&E(this),L};let _=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(x,k2)),_},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=D2++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=T,this}var tR=0,jm=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let n=this.materialCache.get(e);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let n=this.materialCache,i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){let n=this.shaderCache,i=n.get(e);return i===void 0&&(i=new Zm(e),n.set(e,i)),i}},Zm=class{constructor(e){this.id=tR++,this.code=e,this.usedTimes=0}};function nR(t,e,n,i,r,s,o){let a=new Qu,l=new jm,c=new Set,u=[],h=r.logarithmicDepthBuffer,d=r.reverseDepthBuffer,p=r.vertexTextures,m=r.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function f(_,S,U,z,H){let Y=z.fog,O=H.geometry,G=_.isMeshStandardMaterial?z.environment:null,F=(_.isMeshStandardMaterial?n:e).get(_.envMap||G),ee=F&&F.mapping===yh?F.image.height:null,ne=x[_.type];_.precision!==null&&(m=r.getMaxPrecision(_.precision),m!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",m,"instead."));let re=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Ee=re!==void 0?re.length:0,Be=0;O.morphAttributes.position!==void 0&&(Be=1),O.morphAttributes.normal!==void 0&&(Be=2),O.morphAttributes.color!==void 0&&(Be=3);let q,K,de,ae;if(ne){let Mn=Li[ne];q=Mn.vertexShader,K=Mn.fragmentShader}else q=_.vertexShader,K=_.fragmentShader,l.update(_),de=l.getVertexShaderID(_),ae=l.getFragmentShaderID(_);let Re=t.getRenderTarget(),we=H.isInstancedMesh===!0,Ue=H.isBatchedMesh===!0,je=!!_.map,Ve=!!_.matcap,I=!!F,an=!!_.aoMap,Ge=!!_.lightMap,qe=!!_.bumpMap,Ie=!!_.normalMap,ut=!!_.displacementMap,ke=!!_.emissiveMap,C=!!_.metalnessMap,w=!!_.roughnessMap,B=_.anisotropy>0,j=_.clearcoat>0,J=_.dispersion>0,$=_.iridescence>0,_e=_.sheen>0,oe=_.transmission>0,me=B&&!!_.anisotropyMap,$e=j&&!!_.clearcoatMap,te=j&&!!_.clearcoatNormalMap,ge=j&&!!_.clearcoatRoughnessMap,Le=$&&!!_.iridescenceMap,Ne=$&&!!_.iridescenceThicknessMap,ve=_e&&!!_.sheenColorMap,We=_e&&!!_.sheenRoughnessMap,De=!!_.specularMap,ot=!!_.specularColorMap,N=!!_.specularIntensityMap,he=oe&&!!_.transmissionMap,X=oe&&!!_.thicknessMap,Z=!!_.gradientMap,le=!!_.alphaMap,fe=_.alphaTest>0,Xe=!!_.alphaHash,Ct=!!_.extensions,_n=Kr;_.toneMapped&&(Re===null||Re.isXRRenderTarget===!0)&&(_n=t.toneMapping);let Ze={shaderID:ne,shaderType:_.type,shaderName:_.name,vertexShader:q,fragmentShader:K,defines:_.defines,customVertexShaderID:de,customFragmentShaderID:ae,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:m,batching:Ue,batchingColor:Ue&&H._colorsTexture!==null,instancing:we,instancingColor:we&&H.instanceColor!==null,instancingMorph:we&&H.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Re===null?t.outputColorSpace:Re.isXRRenderTarget===!0?Re.texture.colorSpace:ns,alphaToCoverage:!!_.alphaToCoverage,map:je,matcap:Ve,envMap:I,envMapMode:I&&F.mapping,envMapCubeUVHeight:ee,aoMap:an,lightMap:Ge,bumpMap:qe,normalMap:Ie,displacementMap:p&&ut,emissiveMap:ke,normalMapObjectSpace:Ie&&_.normalMapType===xE,normalMapTangentSpace:Ie&&_.normalMapType===y1,metalnessMap:C,roughnessMap:w,anisotropy:B,anisotropyMap:me,clearcoat:j,clearcoatMap:$e,clearcoatNormalMap:te,clearcoatRoughnessMap:ge,dispersion:J,iridescence:$,iridescenceMap:Le,iridescenceThicknessMap:Ne,sheen:_e,sheenColorMap:ve,sheenRoughnessMap:We,specularMap:De,specularColorMap:ot,specularIntensityMap:N,transmission:oe,transmissionMap:he,thicknessMap:X,gradientMap:Z,opaque:_.transparent===!1&&_.blending===Xo&&_.alphaToCoverage===!1,alphaMap:le,alphaTest:fe,alphaHash:Xe,combine:_.combine,mapUv:je&&g(_.map.channel),aoMapUv:an&&g(_.aoMap.channel),lightMapUv:Ge&&g(_.lightMap.channel),bumpMapUv:qe&&g(_.bumpMap.channel),normalMapUv:Ie&&g(_.normalMap.channel),displacementMapUv:ut&&g(_.displacementMap.channel),emissiveMapUv:ke&&g(_.emissiveMap.channel),metalnessMapUv:C&&g(_.metalnessMap.channel),roughnessMapUv:w&&g(_.roughnessMap.channel),anisotropyMapUv:me&&g(_.anisotropyMap.channel),clearcoatMapUv:$e&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:te&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ge&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ne&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:We&&g(_.sheenRoughnessMap.channel),specularMapUv:De&&g(_.specularMap.channel),specularColorMapUv:ot&&g(_.specularColorMap.channel),specularIntensityMapUv:N&&g(_.specularIntensityMap.channel),transmissionMapUv:he&&g(_.transmissionMap.channel),thicknessMapUv:X&&g(_.thicknessMap.channel),alphaMapUv:le&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Ie||B),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!O.attributes.uv&&(je||le),fog:!!Y,useFog:_.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:d,skinning:H.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:Be,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:_.dithering,shadowMapEnabled:t.shadowMap.enabled&&U.length>0,shadowMapType:t.shadowMap.type,toneMapping:_n,decodeVideoTexture:je&&_.map.isVideoTexture===!0&&Qe.getTransfer(_.map.colorSpace)===mt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===si,flipSided:_.side===Yt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ct&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ct&&_.extensions.multiDraw===!0||Ue)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ze.vertexUv1s=c.has(1),Ze.vertexUv2s=c.has(2),Ze.vertexUv3s=c.has(3),c.clear(),Ze}function y(_){let S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(let U in _.defines)S.push(U),S.push(_.defines[U]);return _.isRawShaderMaterial===!1&&(v(S,_),M(S,_),S.push(t.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function v(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function M(_,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.alphaToCoverage&&a.enable(20),_.push(a.mask)}function R(_){let S=x[_.type],U;if(S){let z=Li[S];U=YE.clone(z.uniforms)}else U=_.uniforms;return U}function T(_,S){let U;for(let z=0,H=u.length;z<H;z++){let Y=u[z];if(Y.cacheKey===S){U=Y,++U.usedTimes;break}}return U===void 0&&(U=new eR(t,S,_,s),u.push(U)),U}function E(_){if(--_.usedTimes===0){let S=u.indexOf(_);u[S]=u[u.length-1],u.pop(),_.destroy()}}function A(_){l.remove(_)}function L(){l.dispose()}return{getParameters:f,getProgramCacheKey:y,getUniforms:R,acquireProgram:T,releaseProgram:E,releaseShaderCache:A,programs:u,dispose:L}}function iR(){let t=new WeakMap;function e(o){return t.has(o)}function n(o){let a=t.get(o);return a===void 0&&(a={},t.set(o,a)),a}function i(o){t.delete(o)}function r(o,a,l){t.get(o)[a]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function rR(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function X_(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function Y_(){let t=[],e=0,n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function o(h,d,p,m,x,g){let f=t[e];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:m,renderOrder:h.renderOrder,z:x,group:g},t[e]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=m,f.renderOrder=h.renderOrder,f.z=x,f.group=g),e++,f}function a(h,d,p,m,x,g){let f=o(h,d,p,m,x,g);p.transmission>0?i.push(f):p.transparent===!0?r.push(f):n.push(f)}function l(h,d,p,m,x,g){let f=o(h,d,p,m,x,g);p.transmission>0?i.unshift(f):p.transparent===!0?r.unshift(f):n.unshift(f)}function c(h,d){n.length>1&&n.sort(h||rR),i.length>1&&i.sort(d||X_),r.length>1&&r.sort(d||X_)}function u(){for(let h=e,d=t.length;h<d;h++){let p=t[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function sR(){let t=new WeakMap;function e(i,r){let s=t.get(i),o;return s===void 0?(o=new Y_,t.set(i,[o])):r>=s.length?(o=new Y_,s.push(o)):o=s[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}function oR(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new P,color:new Pe};break;case"SpotLight":n={position:new P,direction:new P,color:new Pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new P,color:new Pe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new P,skyColor:new Pe,groundColor:new Pe};break;case"RectAreaLight":n={color:new Pe,position:new P,halfWidth:new P,halfHeight:new P};break}return t[e.id]=n,n}}}function aR(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}var lR=0;function cR(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function uR(t){let e=new oR,n=aR(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let r=new P,s=new nt,o=new nt;function a(c){let u=0,h=0,d=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let p=0,m=0,x=0,g=0,f=0,y=0,v=0,M=0,R=0,T=0,E=0;c.sort(cR);for(let L=0,_=c.length;L<_;L++){let S=c[L],U=S.color,z=S.intensity,H=S.distance,Y=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)u+=U.r*z,h+=U.g*z,d+=U.b*z;else if(S.isLightProbe){for(let O=0;O<9;O++)i.probe[O].addScaledVector(S.sh.coefficients[O],z);E++}else if(S.isDirectionalLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let G=S.shadow,F=n.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,i.directionalShadow[p]=F,i.directionalShadowMap[p]=Y,i.directionalShadowMatrix[p]=S.shadow.matrix,y++}i.directional[p]=O,p++}else if(S.isSpotLight){let O=e.get(S);O.position.setFromMatrixPosition(S.matrixWorld),O.color.copy(U).multiplyScalar(z),O.distance=H,O.coneCos=Math.cos(S.angle),O.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),O.decay=S.decay,i.spot[x]=O;let G=S.shadow;if(S.map&&(i.spotLightMap[R]=S.map,R++,G.updateMatrices(S),S.castShadow&&T++),i.spotLightMatrix[x]=G.matrix,S.castShadow){let F=n.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,i.spotShadow[x]=F,i.spotShadowMap[x]=Y,M++}x++}else if(S.isRectAreaLight){let O=e.get(S);O.color.copy(U).multiplyScalar(z),O.halfWidth.set(S.width*.5,0,0),O.halfHeight.set(0,S.height*.5,0),i.rectArea[g]=O,g++}else if(S.isPointLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),O.distance=S.distance,O.decay=S.decay,S.castShadow){let G=S.shadow,F=n.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,F.shadowCameraNear=G.camera.near,F.shadowCameraFar=G.camera.far,i.pointShadow[m]=F,i.pointShadowMap[m]=Y,i.pointShadowMatrix[m]=S.shadow.matrix,v++}i.point[m]=O,m++}else if(S.isHemisphereLight){let O=e.get(S);O.skyColor.copy(S.color).multiplyScalar(z),O.groundColor.copy(S.groundColor).multiplyScalar(z),i.hemi[f]=O,f++}}g>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=se.LTC_FLOAT_1,i.rectAreaLTC2=se.LTC_FLOAT_2):(i.rectAreaLTC1=se.LTC_HALF_1,i.rectAreaLTC2=se.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let A=i.hash;(A.directionalLength!==p||A.pointLength!==m||A.spotLength!==x||A.rectAreaLength!==g||A.hemiLength!==f||A.numDirectionalShadows!==y||A.numPointShadows!==v||A.numSpotShadows!==M||A.numSpotMaps!==R||A.numLightProbes!==E)&&(i.directional.length=p,i.spot.length=x,i.rectArea.length=g,i.point.length=m,i.hemi.length=f,i.directionalShadow.length=y,i.directionalShadowMap.length=y,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=y,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=M+R-T,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=E,A.directionalLength=p,A.pointLength=m,A.spotLength=x,A.rectAreaLength=g,A.hemiLength=f,A.numDirectionalShadows=y,A.numPointShadows=v,A.numSpotShadows=M,A.numSpotMaps=R,A.numLightProbes=E,i.version=lR++)}function l(c,u){let h=0,d=0,p=0,m=0,x=0,g=u.matrixWorldInverse;for(let f=0,y=c.length;f<y;f++){let v=c[f];if(v.isDirectionalLight){let M=i.directional[h];M.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),h++}else if(v.isSpotLight){let M=i.spot[p];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),p++}else if(v.isRectAreaLight){let M=i.rectArea[m];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),o.identity(),s.copy(v.matrixWorld),s.premultiply(g),o.extractRotation(s),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),m++}else if(v.isPointLight){let M=i.point[d];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),d++}else if(v.isHemisphereLight){let M=i.hemi[x];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(g),x++}}}return{setup:a,setupView:l,state:i}}function q_(t){let e=new uR(t),n=[],i=[];function r(u){c.camera=u,n.length=0,i.length=0}function s(u){n.push(u)}function o(u){i.push(u)}function a(){e.setup(n)}function l(u){e.setupView(n,u)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function hR(t){let e=new WeakMap;function n(r,s=0){let o=e.get(r),a;return o===void 0?(a=new q_(t),e.set(r,[a])):s>=o.length?(a=new q_(t),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:n,dispose:i}}var Km=class extends es{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vE,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Jm=class extends es{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},fR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,dR=`uniform sampler2D shadow_pass;
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
}`;function pR(t,e,n){let i=new _l,r=new ue,s=new ue,o=new bt,a=new Km({depthPacking:yE}),l=new Jm,c={},u=n.maxTextureSize,h={[Jr]:Yt,[Yt]:Jr,[si]:si},d=new Oi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ue},radius:{value:4}},vertexShader:fR,fragmentShader:dR}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let m=new qt;m.setAttribute("position",new Rt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new be(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=o1;let f=this.type;this.render=function(T,E,A){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;let L=t.getRenderTarget(),_=t.getActiveCubeFace(),S=t.getActiveMipmapLevel(),U=t.state;U.setBlending(Zr),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let z=f!==ar&&this.type===ar,H=f===ar&&this.type!==ar;for(let Y=0,O=T.length;Y<O;Y++){let G=T[Y],F=G.shadow;if(F===void 0){console.warn("THREE.WebGLShadowMap:",G,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;r.copy(F.mapSize);let ee=F.getFrameExtents();if(r.multiply(ee),s.copy(F.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/ee.x),r.x=s.x*ee.x,F.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/ee.y),r.y=s.y*ee.y,F.mapSize.y=s.y)),F.map===null||z===!0||H===!0){let re=this.type!==ar?{minFilter:nn,magFilter:nn}:{};F.map!==null&&F.map.dispose(),F.map=new fr(r.x,r.y,re),F.map.texture.name=G.name+".shadowMap",F.camera.updateProjectionMatrix()}t.setRenderTarget(F.map),t.clear();let ne=F.getViewportCount();for(let re=0;re<ne;re++){let Ee=F.getViewport(re);o.set(s.x*Ee.x,s.y*Ee.y,s.x*Ee.z,s.y*Ee.w),U.viewport(o),F.updateMatrices(G,re),i=F.getFrustum(),M(E,A,F.camera,G,this.type)}F.isPointLightShadow!==!0&&this.type===ar&&y(F,A),F.needsUpdate=!1}f=this.type,g.needsUpdate=!1,t.setRenderTarget(L,_,S)};function y(T,E){let A=e.update(x);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new fr(r.x,r.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,t.setRenderTarget(T.mapPass),t.clear(),t.renderBufferDirect(E,null,A,d,x,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,t.setRenderTarget(T.map),t.clear(),t.renderBufferDirect(E,null,A,p,x,null)}function v(T,E,A,L){let _=null,S=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(S!==void 0)_=S;else if(_=A.isPointLight===!0?l:a,t.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){let U=_.uuid,z=E.uuid,H=c[U];H===void 0&&(H={},c[U]=H);let Y=H[z];Y===void 0&&(Y=_.clone(),H[z]=Y,E.addEventListener("dispose",R)),_=Y}if(_.visible=E.visible,_.wireframe=E.wireframe,L===ar?_.side=E.shadowSide!==null?E.shadowSide:E.side:_.side=E.shadowSide!==null?E.shadowSide:h[E.side],_.alphaMap=E.alphaMap,_.alphaTest=E.alphaTest,_.map=E.map,_.clipShadows=E.clipShadows,_.clippingPlanes=E.clippingPlanes,_.clipIntersection=E.clipIntersection,_.displacementMap=E.displacementMap,_.displacementScale=E.displacementScale,_.displacementBias=E.displacementBias,_.wireframeLinewidth=E.wireframeLinewidth,_.linewidth=E.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let U=t.properties.get(_);U.light=A}return _}function M(T,E,A,L,_){if(T.visible===!1)return;if(T.layers.test(E.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&_===ar)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let z=e.update(T),H=T.material;if(Array.isArray(H)){let Y=z.groups;for(let O=0,G=Y.length;O<G;O++){let F=Y[O],ee=H[F.materialIndex];if(ee&&ee.visible){let ne=v(T,ee,L,_);T.onBeforeShadow(t,T,E,A,z,ne,F),t.renderBufferDirect(A,null,z,ne,T,F),T.onAfterShadow(t,T,E,A,z,ne,F)}}}else if(H.visible){let Y=v(T,H,L,_);T.onBeforeShadow(t,T,E,A,z,Y,null),t.renderBufferDirect(A,null,z,Y,T,null),T.onAfterShadow(t,T,E,A,z,Y,null)}}let U=T.children;for(let z=0,H=U.length;z<H;z++)M(U[z],E,A,L,_)}function R(T){T.target.removeEventListener("dispose",R);for(let A in c){let L=c[A],_=T.target.uuid;_ in L&&(L[_].dispose(),delete L[_])}}}var mR={[em]:tm,[nm]:sm,[im]:om,[jo]:rm,[tm]:em,[sm]:nm,[om]:im,[rm]:jo};function gR(t){function e(){let N=!1,he=new bt,X=null,Z=new bt(0,0,0,0);return{setMask:function(le){X!==le&&!N&&(t.colorMask(le,le,le,le),X=le)},setLocked:function(le){N=le},setClear:function(le,fe,Xe,Ct,_n){_n===!0&&(le*=Ct,fe*=Ct,Xe*=Ct),he.set(le,fe,Xe,Ct),Z.equals(he)===!1&&(t.clearColor(le,fe,Xe,Ct),Z.copy(he))},reset:function(){N=!1,X=null,Z.set(-1,0,0,0)}}}function n(){let N=!1,he=!1,X=null,Z=null,le=null;return{setReversed:function(fe){he=fe},setTest:function(fe){fe?de(t.DEPTH_TEST):ae(t.DEPTH_TEST)},setMask:function(fe){X!==fe&&!N&&(t.depthMask(fe),X=fe)},setFunc:function(fe){if(he&&(fe=mR[fe]),Z!==fe){switch(fe){case em:t.depthFunc(t.NEVER);break;case tm:t.depthFunc(t.ALWAYS);break;case nm:t.depthFunc(t.LESS);break;case jo:t.depthFunc(t.LEQUAL);break;case im:t.depthFunc(t.EQUAL);break;case rm:t.depthFunc(t.GEQUAL);break;case sm:t.depthFunc(t.GREATER);break;case om:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}Z=fe}},setLocked:function(fe){N=fe},setClear:function(fe){le!==fe&&(t.clearDepth(fe),le=fe)},reset:function(){N=!1,X=null,Z=null,le=null}}}function i(){let N=!1,he=null,X=null,Z=null,le=null,fe=null,Xe=null,Ct=null,_n=null;return{setTest:function(Ze){N||(Ze?de(t.STENCIL_TEST):ae(t.STENCIL_TEST))},setMask:function(Ze){he!==Ze&&!N&&(t.stencilMask(Ze),he=Ze)},setFunc:function(Ze,Mn,Hi){(X!==Ze||Z!==Mn||le!==Hi)&&(t.stencilFunc(Ze,Mn,Hi),X=Ze,Z=Mn,le=Hi)},setOp:function(Ze,Mn,Hi){(fe!==Ze||Xe!==Mn||Ct!==Hi)&&(t.stencilOp(Ze,Mn,Hi),fe=Ze,Xe=Mn,Ct=Hi)},setLocked:function(Ze){N=Ze},setClear:function(Ze){_n!==Ze&&(t.clearStencil(Ze),_n=Ze)},reset:function(){N=!1,he=null,X=null,Z=null,le=null,fe=null,Xe=null,Ct=null,_n=null}}}let r=new e,s=new n,o=new i,a=new WeakMap,l=new WeakMap,c={},u={},h=new WeakMap,d=[],p=null,m=!1,x=null,g=null,f=null,y=null,v=null,M=null,R=null,T=new Pe(0,0,0),E=0,A=!1,L=null,_=null,S=null,U=null,z=null,H=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,O=0,G=t.getParameter(t.VERSION);G.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(G)[1]),Y=O>=1):G.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),Y=O>=2);let F=null,ee={},ne=t.getParameter(t.SCISSOR_BOX),re=t.getParameter(t.VIEWPORT),Ee=new bt().fromArray(ne),Be=new bt().fromArray(re);function q(N,he,X,Z){let le=new Uint8Array(4),fe=t.createTexture();t.bindTexture(N,fe),t.texParameteri(N,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(N,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let Xe=0;Xe<X;Xe++)N===t.TEXTURE_3D||N===t.TEXTURE_2D_ARRAY?t.texImage3D(he,0,t.RGBA,1,1,Z,0,t.RGBA,t.UNSIGNED_BYTE,le):t.texImage2D(he+Xe,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,le);return fe}let K={};K[t.TEXTURE_2D]=q(t.TEXTURE_2D,t.TEXTURE_2D,1),K[t.TEXTURE_CUBE_MAP]=q(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[t.TEXTURE_2D_ARRAY]=q(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),K[t.TEXTURE_3D]=q(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),de(t.DEPTH_TEST),s.setFunc(jo),Ge(!1),qe(e_),de(t.CULL_FACE),I(Zr);function de(N){c[N]!==!0&&(t.enable(N),c[N]=!0)}function ae(N){c[N]!==!1&&(t.disable(N),c[N]=!1)}function Re(N,he){return u[N]!==he?(t.bindFramebuffer(N,he),u[N]=he,N===t.DRAW_FRAMEBUFFER&&(u[t.FRAMEBUFFER]=he),N===t.FRAMEBUFFER&&(u[t.DRAW_FRAMEBUFFER]=he),!0):!1}function we(N,he){let X=d,Z=!1;if(N){X=h.get(he),X===void 0&&(X=[],h.set(he,X));let le=N.textures;if(X.length!==le.length||X[0]!==t.COLOR_ATTACHMENT0){for(let fe=0,Xe=le.length;fe<Xe;fe++)X[fe]=t.COLOR_ATTACHMENT0+fe;X.length=le.length,Z=!0}}else X[0]!==t.BACK&&(X[0]=t.BACK,Z=!0);Z&&t.drawBuffers(X)}function Ue(N){return p!==N?(t.useProgram(N),p=N,!0):!1}let je={[Rs]:t.FUNC_ADD,[Ww]:t.FUNC_SUBTRACT,[Xw]:t.FUNC_REVERSE_SUBTRACT};je[Yw]=t.MIN,je[qw]=t.MAX;let Ve={[$w]:t.ZERO,[jw]:t.ONE,[Zw]:t.SRC_COLOR,[Jp]:t.SRC_ALPHA,[nE]:t.SRC_ALPHA_SATURATE,[eE]:t.DST_COLOR,[Jw]:t.DST_ALPHA,[Kw]:t.ONE_MINUS_SRC_COLOR,[Qp]:t.ONE_MINUS_SRC_ALPHA,[tE]:t.ONE_MINUS_DST_COLOR,[Qw]:t.ONE_MINUS_DST_ALPHA,[iE]:t.CONSTANT_COLOR,[rE]:t.ONE_MINUS_CONSTANT_COLOR,[sE]:t.CONSTANT_ALPHA,[oE]:t.ONE_MINUS_CONSTANT_ALPHA};function I(N,he,X,Z,le,fe,Xe,Ct,_n,Ze){if(N===Zr){m===!0&&(ae(t.BLEND),m=!1);return}if(m===!1&&(de(t.BLEND),m=!0),N!==Gw){if(N!==x||Ze!==A){if((g!==Rs||v!==Rs)&&(t.blendEquation(t.FUNC_ADD),g=Rs,v=Rs),Ze)switch(N){case Xo:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case t_:t.blendFunc(t.ONE,t.ONE);break;case n_:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case i_:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Xo:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case t_:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case n_:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case i_:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}f=null,y=null,M=null,R=null,T.set(0,0,0),E=0,x=N,A=Ze}return}le=le||he,fe=fe||X,Xe=Xe||Z,(he!==g||le!==v)&&(t.blendEquationSeparate(je[he],je[le]),g=he,v=le),(X!==f||Z!==y||fe!==M||Xe!==R)&&(t.blendFuncSeparate(Ve[X],Ve[Z],Ve[fe],Ve[Xe]),f=X,y=Z,M=fe,R=Xe),(Ct.equals(T)===!1||_n!==E)&&(t.blendColor(Ct.r,Ct.g,Ct.b,_n),T.copy(Ct),E=_n),x=N,A=!1}function an(N,he){N.side===si?ae(t.CULL_FACE):de(t.CULL_FACE);let X=N.side===Yt;he&&(X=!X),Ge(X),N.blending===Xo&&N.transparent===!1?I(Zr):I(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),s.setFunc(N.depthFunc),s.setTest(N.depthTest),s.setMask(N.depthWrite),r.setMask(N.colorWrite);let Z=N.stencilWrite;o.setTest(Z),Z&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),ut(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?de(t.SAMPLE_ALPHA_TO_COVERAGE):ae(t.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(N){L!==N&&(N?t.frontFace(t.CW):t.frontFace(t.CCW),L=N)}function qe(N){N!==Hw?(de(t.CULL_FACE),N!==_&&(N===e_?t.cullFace(t.BACK):N===Vw?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):ae(t.CULL_FACE),_=N}function Ie(N){N!==S&&(Y&&t.lineWidth(N),S=N)}function ut(N,he,X){N?(de(t.POLYGON_OFFSET_FILL),(U!==he||z!==X)&&(t.polygonOffset(he,X),U=he,z=X)):ae(t.POLYGON_OFFSET_FILL)}function ke(N){N?de(t.SCISSOR_TEST):ae(t.SCISSOR_TEST)}function C(N){N===void 0&&(N=t.TEXTURE0+H-1),F!==N&&(t.activeTexture(N),F=N)}function w(N,he,X){X===void 0&&(F===null?X=t.TEXTURE0+H-1:X=F);let Z=ee[X];Z===void 0&&(Z={type:void 0,texture:void 0},ee[X]=Z),(Z.type!==N||Z.texture!==he)&&(F!==X&&(t.activeTexture(X),F=X),t.bindTexture(N,he||K[N]),Z.type=N,Z.texture=he)}function B(){let N=ee[F];N!==void 0&&N.type!==void 0&&(t.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function j(){try{t.compressedTexImage2D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function J(){try{t.compressedTexImage3D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function $(){try{t.texSubImage2D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function _e(){try{t.texSubImage3D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function oe(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function me(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function $e(){try{t.texStorage2D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function te(){try{t.texStorage3D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ge(){try{t.texImage2D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Le(){try{t.texImage3D.apply(t,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ne(N){Ee.equals(N)===!1&&(t.scissor(N.x,N.y,N.z,N.w),Ee.copy(N))}function ve(N){Be.equals(N)===!1&&(t.viewport(N.x,N.y,N.z,N.w),Be.copy(N))}function We(N,he){let X=l.get(he);X===void 0&&(X=new WeakMap,l.set(he,X));let Z=X.get(N);Z===void 0&&(Z=t.getUniformBlockIndex(he,N.name),X.set(N,Z))}function De(N,he){let Z=l.get(he).get(N);a.get(he)!==Z&&(t.uniformBlockBinding(he,Z,N.__bindingPointIndex),a.set(he,Z))}function ot(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),c={},F=null,ee={},u={},h=new WeakMap,d=[],p=null,m=!1,x=null,g=null,f=null,y=null,v=null,M=null,R=null,T=new Pe(0,0,0),E=0,A=!1,L=null,_=null,S=null,U=null,z=null,Ee.set(0,0,t.canvas.width,t.canvas.height),Be.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:de,disable:ae,bindFramebuffer:Re,drawBuffers:we,useProgram:Ue,setBlending:I,setMaterial:an,setFlipSided:Ge,setCullFace:qe,setLineWidth:Ie,setPolygonOffset:ut,setScissorTest:ke,activeTexture:C,bindTexture:w,unbindTexture:B,compressedTexImage2D:j,compressedTexImage3D:J,texImage2D:ge,texImage3D:Le,updateUBOMapping:We,uniformBlockBinding:De,texStorage2D:$e,texStorage3D:te,texSubImage2D:$,texSubImage3D:_e,compressedTexSubImage2D:oe,compressedTexSubImage3D:me,scissor:Ne,viewport:ve,reset:ot}}function $_(t,e,n,i){let r=vR(i);switch(n){case f1:return t*e;case p1:return t*e;case m1:return t*e*2;case C0:return t*e/r.components*r.byteLength;case P0:return t*e/r.components*r.byteLength;case g1:return t*e*2/r.components*r.byteLength;case I0:return t*e*2/r.components*r.byteLength;case d1:return t*e*3/r.components*r.byteLength;case Si:return t*e*4/r.components*r.byteLength;case L0:return t*e*4/r.components*r.byteLength;case Fu:case Bu:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Hu:case Vu:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case hm:case dm:return Math.max(t,16)*Math.max(e,8)/4;case um:case fm:return Math.max(t,8)*Math.max(e,8)/2;case pm:case mm:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case gm:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case vm:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case ym:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case xm:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case _m:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Mm:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Sm:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case wm:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case Em:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case bm:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Tm:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Am:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Rm:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Cm:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Pm:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Gu:case Im:case Lm:return Math.ceil(t/4)*Math.ceil(e/4)*16;case v1:case Nm:return Math.ceil(t/4)*Math.ceil(e/4)*8;case km:case Dm:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function vR(t){switch(t){case hr:case c1:return{byteLength:1,components:1};case xl:case u1:case Il:return{byteLength:2,components:1};case A0:case R0:return{byteLength:2,components:4};case Ns:case T0:case ki:return{byteLength:4,components:1};case h1:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function yR(t,e,n,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ue,u=new WeakMap,h,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,w){return p?new OffscreenCanvas(C,w):Zu("canvas")}function x(C,w,B){let j=1,J=ke(C);if((J.width>B||J.height>B)&&(j=B/Math.max(J.width,J.height)),j<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let $=Math.floor(j*J.width),_e=Math.floor(j*J.height);h===void 0&&(h=m($,_e));let oe=w?m($,_e):h;return oe.width=$,oe.height=_e,oe.getContext("2d").drawImage(C,0,0,$,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+$+"x"+_e+")."),oe}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function g(C){return C.generateMipmaps&&C.minFilter!==nn&&C.minFilter!==Mi}function f(C){t.generateMipmap(C)}function y(C,w,B,j,J=!1){if(C!==null){if(t[C]!==void 0)return t[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=w;if(w===t.RED&&(B===t.FLOAT&&($=t.R32F),B===t.HALF_FLOAT&&($=t.R16F),B===t.UNSIGNED_BYTE&&($=t.R8)),w===t.RED_INTEGER&&(B===t.UNSIGNED_BYTE&&($=t.R8UI),B===t.UNSIGNED_SHORT&&($=t.R16UI),B===t.UNSIGNED_INT&&($=t.R32UI),B===t.BYTE&&($=t.R8I),B===t.SHORT&&($=t.R16I),B===t.INT&&($=t.R32I)),w===t.RG&&(B===t.FLOAT&&($=t.RG32F),B===t.HALF_FLOAT&&($=t.RG16F),B===t.UNSIGNED_BYTE&&($=t.RG8)),w===t.RG_INTEGER&&(B===t.UNSIGNED_BYTE&&($=t.RG8UI),B===t.UNSIGNED_SHORT&&($=t.RG16UI),B===t.UNSIGNED_INT&&($=t.RG32UI),B===t.BYTE&&($=t.RG8I),B===t.SHORT&&($=t.RG16I),B===t.INT&&($=t.RG32I)),w===t.RGB_INTEGER&&(B===t.UNSIGNED_BYTE&&($=t.RGB8UI),B===t.UNSIGNED_SHORT&&($=t.RGB16UI),B===t.UNSIGNED_INT&&($=t.RGB32UI),B===t.BYTE&&($=t.RGB8I),B===t.SHORT&&($=t.RGB16I),B===t.INT&&($=t.RGB32I)),w===t.RGBA_INTEGER&&(B===t.UNSIGNED_BYTE&&($=t.RGBA8UI),B===t.UNSIGNED_SHORT&&($=t.RGBA16UI),B===t.UNSIGNED_INT&&($=t.RGBA32UI),B===t.BYTE&&($=t.RGBA8I),B===t.SHORT&&($=t.RGBA16I),B===t.INT&&($=t.RGBA32I)),w===t.RGB&&B===t.UNSIGNED_INT_5_9_9_9_REV&&($=t.RGB9_E5),w===t.RGBA){let _e=J?Yu:Qe.getTransfer(j);B===t.FLOAT&&($=t.RGBA32F),B===t.HALF_FLOAT&&($=t.RGBA16F),B===t.UNSIGNED_BYTE&&($=_e===mt?t.SRGB8_ALPHA8:t.RGBA8),B===t.UNSIGNED_SHORT_4_4_4_4&&($=t.RGBA4),B===t.UNSIGNED_SHORT_5_5_5_1&&($=t.RGB5_A1)}return($===t.R16F||$===t.R32F||$===t.RG16F||$===t.RG32F||$===t.RGBA16F||$===t.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function v(C,w){let B;return C?w===null||w===Ns||w===Jo?B=t.DEPTH24_STENCIL8:w===ki?B=t.DEPTH32F_STENCIL8:w===xl&&(B=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Ns||w===Jo?B=t.DEPTH_COMPONENT24:w===ki?B=t.DEPTH_COMPONENT32F:w===xl&&(B=t.DEPTH_COMPONENT16),B}function M(C,w){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==nn&&C.minFilter!==Mi?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function R(C){let w=C.target;w.removeEventListener("dispose",R),E(w),w.isVideoTexture&&u.delete(w)}function T(C){let w=C.target;w.removeEventListener("dispose",T),L(w)}function E(C){let w=i.get(C);if(w.__webglInit===void 0)return;let B=C.source,j=d.get(B);if(j){let J=j[w.__cacheKey];J.usedTimes--,J.usedTimes===0&&A(C),Object.keys(j).length===0&&d.delete(B)}i.remove(C)}function A(C){let w=i.get(C);t.deleteTexture(w.__webglTexture);let B=C.source,j=d.get(B);delete j[w.__cacheKey],o.memory.textures--}function L(C){let w=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(w.__webglFramebuffer[j]))for(let J=0;J<w.__webglFramebuffer[j].length;J++)t.deleteFramebuffer(w.__webglFramebuffer[j][J]);else t.deleteFramebuffer(w.__webglFramebuffer[j]);w.__webglDepthbuffer&&t.deleteRenderbuffer(w.__webglDepthbuffer[j])}else{if(Array.isArray(w.__webglFramebuffer))for(let j=0;j<w.__webglFramebuffer.length;j++)t.deleteFramebuffer(w.__webglFramebuffer[j]);else t.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&t.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&t.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let j=0;j<w.__webglColorRenderbuffer.length;j++)w.__webglColorRenderbuffer[j]&&t.deleteRenderbuffer(w.__webglColorRenderbuffer[j]);w.__webglDepthRenderbuffer&&t.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let B=C.textures;for(let j=0,J=B.length;j<J;j++){let $=i.get(B[j]);$.__webglTexture&&(t.deleteTexture($.__webglTexture),o.memory.textures--),i.remove(B[j])}i.remove(C)}let _=0;function S(){_=0}function U(){let C=_;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),_+=1,C}function z(C){let w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function H(C,w){let B=i.get(C);if(C.isVideoTexture&&Ie(C),C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){let j=C.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Be(B,C,w);return}}n.bindTexture(t.TEXTURE_2D,B.__webglTexture,t.TEXTURE0+w)}function Y(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){Be(B,C,w);return}n.bindTexture(t.TEXTURE_2D_ARRAY,B.__webglTexture,t.TEXTURE0+w)}function O(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){Be(B,C,w);return}n.bindTexture(t.TEXTURE_3D,B.__webglTexture,t.TEXTURE0+w)}function G(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){q(B,C,w);return}n.bindTexture(t.TEXTURE_CUBE_MAP,B.__webglTexture,t.TEXTURE0+w)}let F={[Ls]:t.REPEAT,[Ps]:t.CLAMP_TO_EDGE,[cm]:t.MIRRORED_REPEAT},ee={[nn]:t.NEAREST,[gE]:t.NEAREST_MIPMAP_NEAREST,[uu]:t.NEAREST_MIPMAP_LINEAR,[Mi]:t.LINEAR,[gp]:t.LINEAR_MIPMAP_NEAREST,[Is]:t.LINEAR_MIPMAP_LINEAR},ne={[_E]:t.NEVER,[TE]:t.ALWAYS,[ME]:t.LESS,[x1]:t.LEQUAL,[SE]:t.EQUAL,[bE]:t.GEQUAL,[wE]:t.GREATER,[EE]:t.NOTEQUAL};function re(C,w){if(w.type===ki&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Mi||w.magFilter===gp||w.magFilter===uu||w.magFilter===Is||w.minFilter===Mi||w.minFilter===gp||w.minFilter===uu||w.minFilter===Is)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(C,t.TEXTURE_WRAP_S,F[w.wrapS]),t.texParameteri(C,t.TEXTURE_WRAP_T,F[w.wrapT]),(C===t.TEXTURE_3D||C===t.TEXTURE_2D_ARRAY)&&t.texParameteri(C,t.TEXTURE_WRAP_R,F[w.wrapR]),t.texParameteri(C,t.TEXTURE_MAG_FILTER,ee[w.magFilter]),t.texParameteri(C,t.TEXTURE_MIN_FILTER,ee[w.minFilter]),w.compareFunction&&(t.texParameteri(C,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(C,t.TEXTURE_COMPARE_FUNC,ne[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===nn||w.minFilter!==uu&&w.minFilter!==Is||w.type===ki&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");t.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function Ee(C,w){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",R));let j=w.source,J=d.get(j);J===void 0&&(J={},d.set(j,J));let $=z(w);if($!==C.__cacheKey){J[$]===void 0&&(J[$]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,B=!0),J[$].usedTimes++;let _e=J[C.__cacheKey];_e!==void 0&&(J[C.__cacheKey].usedTimes--,_e.usedTimes===0&&A(w)),C.__cacheKey=$,C.__webglTexture=J[$].texture}return B}function Be(C,w,B){let j=t.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(j=t.TEXTURE_2D_ARRAY),w.isData3DTexture&&(j=t.TEXTURE_3D);let J=Ee(C,w),$=w.source;n.bindTexture(j,C.__webglTexture,t.TEXTURE0+B);let _e=i.get($);if($.version!==_e.__version||J===!0){n.activeTexture(t.TEXTURE0+B);let oe=Qe.getPrimaries(Qe.workingColorSpace),me=w.colorSpace===$r?null:Qe.getPrimaries(w.colorSpace),$e=w.colorSpace===$r||oe===me?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,$e);let te=x(w.image,!1,r.maxTextureSize);te=ut(w,te);let ge=s.convert(w.format,w.colorSpace),Le=s.convert(w.type),Ne=y(w.internalFormat,ge,Le,w.colorSpace,w.isVideoTexture);re(j,w);let ve,We=w.mipmaps,De=w.isVideoTexture!==!0,ot=_e.__version===void 0||J===!0,N=$.dataReady,he=M(w,te);if(w.isDepthTexture)Ne=v(w.format===Qo,w.type),ot&&(De?n.texStorage2D(t.TEXTURE_2D,1,Ne,te.width,te.height):n.texImage2D(t.TEXTURE_2D,0,Ne,te.width,te.height,0,ge,Le,null));else if(w.isDataTexture)if(We.length>0){De&&ot&&n.texStorage2D(t.TEXTURE_2D,he,Ne,We[0].width,We[0].height);for(let X=0,Z=We.length;X<Z;X++)ve=We[X],De?N&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ve.width,ve.height,ge,Le,ve.data):n.texImage2D(t.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ge,Le,ve.data);w.generateMipmaps=!1}else De?(ot&&n.texStorage2D(t.TEXTURE_2D,he,Ne,te.width,te.height),N&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,te.width,te.height,ge,Le,te.data)):n.texImage2D(t.TEXTURE_2D,0,Ne,te.width,te.height,0,ge,Le,te.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){De&&ot&&n.texStorage3D(t.TEXTURE_2D_ARRAY,he,Ne,We[0].width,We[0].height,te.depth);for(let X=0,Z=We.length;X<Z;X++)if(ve=We[X],w.format!==Si)if(ge!==null)if(De){if(N)if(w.layerUpdates.size>0){let le=$_(ve.width,ve.height,w.format,w.type);for(let fe of w.layerUpdates){let Xe=ve.data.subarray(fe*le/ve.data.BYTES_PER_ELEMENT,(fe+1)*le/ve.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,fe,ve.width,ve.height,1,ge,Xe,0,0)}w.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,ve.width,ve.height,te.depth,ge,ve.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,X,Ne,ve.width,ve.height,te.depth,0,ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?N&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,ve.width,ve.height,te.depth,ge,Le,ve.data):n.texImage3D(t.TEXTURE_2D_ARRAY,X,Ne,ve.width,ve.height,te.depth,0,ge,Le,ve.data)}else{De&&ot&&n.texStorage2D(t.TEXTURE_2D,he,Ne,We[0].width,We[0].height);for(let X=0,Z=We.length;X<Z;X++)ve=We[X],w.format!==Si?ge!==null?De?N&&n.compressedTexSubImage2D(t.TEXTURE_2D,X,0,0,ve.width,ve.height,ge,ve.data):n.compressedTexImage2D(t.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?N&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ve.width,ve.height,ge,Le,ve.data):n.texImage2D(t.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ge,Le,ve.data)}else if(w.isDataArrayTexture)if(De){if(ot&&n.texStorage3D(t.TEXTURE_2D_ARRAY,he,Ne,te.width,te.height,te.depth),N)if(w.layerUpdates.size>0){let X=$_(te.width,te.height,w.format,w.type);for(let Z of w.layerUpdates){let le=te.data.subarray(Z*X/te.data.BYTES_PER_ELEMENT,(Z+1)*X/te.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Z,te.width,te.height,1,ge,Le,le)}w.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,ge,Le,te.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Ne,te.width,te.height,te.depth,0,ge,Le,te.data);else if(w.isData3DTexture)De?(ot&&n.texStorage3D(t.TEXTURE_3D,he,Ne,te.width,te.height,te.depth),N&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,ge,Le,te.data)):n.texImage3D(t.TEXTURE_3D,0,Ne,te.width,te.height,te.depth,0,ge,Le,te.data);else if(w.isFramebufferTexture){if(ot)if(De)n.texStorage2D(t.TEXTURE_2D,he,Ne,te.width,te.height);else{let X=te.width,Z=te.height;for(let le=0;le<he;le++)n.texImage2D(t.TEXTURE_2D,le,Ne,X,Z,0,ge,Le,null),X>>=1,Z>>=1}}else if(We.length>0){if(De&&ot){let X=ke(We[0]);n.texStorage2D(t.TEXTURE_2D,he,Ne,X.width,X.height)}for(let X=0,Z=We.length;X<Z;X++)ve=We[X],De?N&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ge,Le,ve):n.texImage2D(t.TEXTURE_2D,X,Ne,ge,Le,ve);w.generateMipmaps=!1}else if(De){if(ot){let X=ke(te);n.texStorage2D(t.TEXTURE_2D,he,Ne,X.width,X.height)}N&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ge,Le,te)}else n.texImage2D(t.TEXTURE_2D,0,Ne,ge,Le,te);g(w)&&f(j),_e.__version=$.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function q(C,w,B){if(w.image.length!==6)return;let j=Ee(C,w),J=w.source;n.bindTexture(t.TEXTURE_CUBE_MAP,C.__webglTexture,t.TEXTURE0+B);let $=i.get(J);if(J.version!==$.__version||j===!0){n.activeTexture(t.TEXTURE0+B);let _e=Qe.getPrimaries(Qe.workingColorSpace),oe=w.colorSpace===$r?null:Qe.getPrimaries(w.colorSpace),me=w.colorSpace===$r||_e===oe?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let $e=w.isCompressedTexture||w.image[0].isCompressedTexture,te=w.image[0]&&w.image[0].isDataTexture,ge=[];for(let Z=0;Z<6;Z++)!$e&&!te?ge[Z]=x(w.image[Z],!0,r.maxCubemapSize):ge[Z]=te?w.image[Z].image:w.image[Z],ge[Z]=ut(w,ge[Z]);let Le=ge[0],Ne=s.convert(w.format,w.colorSpace),ve=s.convert(w.type),We=y(w.internalFormat,Ne,ve,w.colorSpace),De=w.isVideoTexture!==!0,ot=$.__version===void 0||j===!0,N=J.dataReady,he=M(w,Le);re(t.TEXTURE_CUBE_MAP,w);let X;if($e){De&&ot&&n.texStorage2D(t.TEXTURE_CUBE_MAP,he,We,Le.width,Le.height);for(let Z=0;Z<6;Z++){X=ge[Z].mipmaps;for(let le=0;le<X.length;le++){let fe=X[le];w.format!==Si?Ne!==null?De?N&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le,0,0,fe.width,fe.height,Ne,fe.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le,We,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):De?N&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le,0,0,fe.width,fe.height,Ne,ve,fe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le,We,fe.width,fe.height,0,Ne,ve,fe.data)}}}else{if(X=w.mipmaps,De&&ot){X.length>0&&he++;let Z=ke(ge[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,he,We,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(te){De?N&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,ge[Z].width,ge[Z].height,Ne,ve,ge[Z].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,We,ge[Z].width,ge[Z].height,0,Ne,ve,ge[Z].data);for(let le=0;le<X.length;le++){let Xe=X[le].image[Z].image;De?N&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le+1,0,0,Xe.width,Xe.height,Ne,ve,Xe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le+1,We,Xe.width,Xe.height,0,Ne,ve,Xe.data)}}else{De?N&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ne,ve,ge[Z]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,We,Ne,ve,ge[Z]);for(let le=0;le<X.length;le++){let fe=X[le];De?N&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le+1,0,0,Ne,ve,fe.image[Z]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,le+1,We,Ne,ve,fe.image[Z])}}}g(w)&&f(t.TEXTURE_CUBE_MAP),$.__version=J.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function K(C,w,B,j,J,$){let _e=s.convert(B.format,B.colorSpace),oe=s.convert(B.type),me=y(B.internalFormat,_e,oe,B.colorSpace);if(!i.get(w).__hasExternalTextures){let te=Math.max(1,w.width>>$),ge=Math.max(1,w.height>>$);J===t.TEXTURE_3D||J===t.TEXTURE_2D_ARRAY?n.texImage3D(J,$,me,te,ge,w.depth,0,_e,oe,null):n.texImage2D(J,$,me,te,ge,0,_e,oe,null)}n.bindFramebuffer(t.FRAMEBUFFER,C),qe(w)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,j,J,i.get(B).__webglTexture,0,Ge(w)):(J===t.TEXTURE_2D||J>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,j,J,i.get(B).__webglTexture,$),n.bindFramebuffer(t.FRAMEBUFFER,null)}function de(C,w,B){if(t.bindRenderbuffer(t.RENDERBUFFER,C),w.depthBuffer){let j=w.depthTexture,J=j&&j.isDepthTexture?j.type:null,$=v(w.stencilBuffer,J),_e=w.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,oe=Ge(w);qe(w)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,oe,$,w.width,w.height):B?t.renderbufferStorageMultisample(t.RENDERBUFFER,oe,$,w.width,w.height):t.renderbufferStorage(t.RENDERBUFFER,$,w.width,w.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,_e,t.RENDERBUFFER,C)}else{let j=w.textures;for(let J=0;J<j.length;J++){let $=j[J],_e=s.convert($.format,$.colorSpace),oe=s.convert($.type),me=y($.internalFormat,_e,oe,$.colorSpace),$e=Ge(w);B&&qe(w)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,$e,me,w.width,w.height):qe(w)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,$e,me,w.width,w.height):t.renderbufferStorage(t.RENDERBUFFER,me,w.width,w.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function ae(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),H(w.depthTexture,0);let j=i.get(w.depthTexture).__webglTexture,J=Ge(w);if(w.depthTexture.format===Yo)qe(w)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,j,0,J):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,j,0);else if(w.depthTexture.format===Qo)qe(w)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,j,0,J):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Re(C){let w=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){let j=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),j){let J=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,j.removeEventListener("dispose",J)};j.addEventListener("dispose",J),w.__depthDisposeCallback=J}w.__boundDepthTexture=j}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");ae(w.__webglFramebuffer,C)}else if(B){w.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(n.bindFramebuffer(t.FRAMEBUFFER,w.__webglFramebuffer[j]),w.__webglDepthbuffer[j]===void 0)w.__webglDepthbuffer[j]=t.createRenderbuffer(),de(w.__webglDepthbuffer[j],C,!1);else{let J=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,$=w.__webglDepthbuffer[j];t.bindRenderbuffer(t.RENDERBUFFER,$),t.framebufferRenderbuffer(t.FRAMEBUFFER,J,t.RENDERBUFFER,$)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=t.createRenderbuffer(),de(w.__webglDepthbuffer,C,!1);else{let j=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,J=w.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,J),t.framebufferRenderbuffer(t.FRAMEBUFFER,j,t.RENDERBUFFER,J)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function we(C,w,B){let j=i.get(C);w!==void 0&&K(j.__webglFramebuffer,C,C.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),B!==void 0&&Re(C)}function Ue(C){let w=C.texture,B=i.get(C),j=i.get(w);C.addEventListener("dispose",T);let J=C.textures,$=C.isWebGLCubeRenderTarget===!0,_e=J.length>1;if(_e||(j.__webglTexture===void 0&&(j.__webglTexture=t.createTexture()),j.__version=w.version,o.memory.textures++),$){B.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer[oe]=[];for(let me=0;me<w.mipmaps.length;me++)B.__webglFramebuffer[oe][me]=t.createFramebuffer()}else B.__webglFramebuffer[oe]=t.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer=[];for(let oe=0;oe<w.mipmaps.length;oe++)B.__webglFramebuffer[oe]=t.createFramebuffer()}else B.__webglFramebuffer=t.createFramebuffer();if(_e)for(let oe=0,me=J.length;oe<me;oe++){let $e=i.get(J[oe]);$e.__webglTexture===void 0&&($e.__webglTexture=t.createTexture(),o.memory.textures++)}if(C.samples>0&&qe(C)===!1){B.__webglMultisampledFramebuffer=t.createFramebuffer(),B.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let oe=0;oe<J.length;oe++){let me=J[oe];B.__webglColorRenderbuffer[oe]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,B.__webglColorRenderbuffer[oe]);let $e=s.convert(me.format,me.colorSpace),te=s.convert(me.type),ge=y(me.internalFormat,$e,te,me.colorSpace,C.isXRRenderTarget===!0),Le=Ge(C);t.renderbufferStorageMultisample(t.RENDERBUFFER,Le,ge,C.width,C.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+oe,t.RENDERBUFFER,B.__webglColorRenderbuffer[oe])}t.bindRenderbuffer(t.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=t.createRenderbuffer(),de(B.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if($){n.bindTexture(t.TEXTURE_CUBE_MAP,j.__webglTexture),re(t.TEXTURE_CUBE_MAP,w);for(let oe=0;oe<6;oe++)if(w.mipmaps&&w.mipmaps.length>0)for(let me=0;me<w.mipmaps.length;me++)K(B.__webglFramebuffer[oe][me],C,w,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+oe,me);else K(B.__webglFramebuffer[oe],C,w,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);g(w)&&f(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(_e){for(let oe=0,me=J.length;oe<me;oe++){let $e=J[oe],te=i.get($e);n.bindTexture(t.TEXTURE_2D,te.__webglTexture),re(t.TEXTURE_2D,$e),K(B.__webglFramebuffer,C,$e,t.COLOR_ATTACHMENT0+oe,t.TEXTURE_2D,0),g($e)&&f(t.TEXTURE_2D)}n.unbindTexture()}else{let oe=t.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(oe=C.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(oe,j.__webglTexture),re(oe,w),w.mipmaps&&w.mipmaps.length>0)for(let me=0;me<w.mipmaps.length;me++)K(B.__webglFramebuffer[me],C,w,t.COLOR_ATTACHMENT0,oe,me);else K(B.__webglFramebuffer,C,w,t.COLOR_ATTACHMENT0,oe,0);g(w)&&f(oe),n.unbindTexture()}C.depthBuffer&&Re(C)}function je(C){let w=C.textures;for(let B=0,j=w.length;B<j;B++){let J=w[B];if(g(J)){let $=C.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,_e=i.get(J).__webglTexture;n.bindTexture($,_e),f($),n.unbindTexture()}}}let Ve=[],I=[];function an(C){if(C.samples>0){if(qe(C)===!1){let w=C.textures,B=C.width,j=C.height,J=t.COLOR_BUFFER_BIT,$=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,_e=i.get(C),oe=w.length>1;if(oe)for(let me=0;me<w.length;me++)n.bindFramebuffer(t.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+me,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,_e.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+me,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let me=0;me<w.length;me++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=t.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=t.STENCIL_BUFFER_BIT)),oe){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,_e.__webglColorRenderbuffer[me]);let $e=i.get(w[me]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,$e,0)}t.blitFramebuffer(0,0,B,j,0,0,B,j,J,t.NEAREST),l===!0&&(Ve.length=0,I.length=0,Ve.push(t.COLOR_ATTACHMENT0+me),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Ve.push($),I.push($),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,I)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,Ve))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),oe)for(let me=0;me<w.length;me++){n.bindFramebuffer(t.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+me,t.RENDERBUFFER,_e.__webglColorRenderbuffer[me]);let $e=i.get(w[me]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,_e.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+me,t.TEXTURE_2D,$e,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let w=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[w])}}}function Ge(C){return Math.min(r.maxSamples,C.samples)}function qe(C){let w=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Ie(C){let w=o.render.frame;u.get(C)!==w&&(u.set(C,w),C.update())}function ut(C,w){let B=C.colorSpace,j=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==ns&&B!==$r&&(Qe.getTransfer(B)===mt?(j!==Si||J!==hr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),w}function ke(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=S,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=O,this.setTextureCube=G,this.rebindTextures=we,this.setupRenderTarget=Ue,this.updateRenderTargetMipmap=je,this.updateMultisampleRenderTarget=an,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=K,this.useMultisampledRTT=qe}function xR(t,e){function n(i,r=$r){let s,o=Qe.getTransfer(r);if(i===hr)return t.UNSIGNED_BYTE;if(i===A0)return t.UNSIGNED_SHORT_4_4_4_4;if(i===R0)return t.UNSIGNED_SHORT_5_5_5_1;if(i===h1)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===c1)return t.BYTE;if(i===u1)return t.SHORT;if(i===xl)return t.UNSIGNED_SHORT;if(i===T0)return t.INT;if(i===Ns)return t.UNSIGNED_INT;if(i===ki)return t.FLOAT;if(i===Il)return t.HALF_FLOAT;if(i===f1)return t.ALPHA;if(i===d1)return t.RGB;if(i===Si)return t.RGBA;if(i===p1)return t.LUMINANCE;if(i===m1)return t.LUMINANCE_ALPHA;if(i===Yo)return t.DEPTH_COMPONENT;if(i===Qo)return t.DEPTH_STENCIL;if(i===C0)return t.RED;if(i===P0)return t.RED_INTEGER;if(i===g1)return t.RG;if(i===I0)return t.RG_INTEGER;if(i===L0)return t.RGBA_INTEGER;if(i===Fu||i===Bu||i===Hu||i===Vu)if(o===mt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Fu)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Bu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Hu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Vu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Fu)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Bu)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Hu)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Vu)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===um||i===hm||i===fm||i===dm)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===um)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===hm)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===fm)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===dm)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===pm||i===mm||i===gm)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===pm||i===mm)return o===mt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===gm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===vm||i===ym||i===xm||i===_m||i===Mm||i===Sm||i===wm||i===Em||i===bm||i===Tm||i===Am||i===Rm||i===Cm||i===Pm)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===vm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ym)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===xm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===_m)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Mm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Sm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===wm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Em)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===bm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Tm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Am)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Rm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Cm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Pm)return o===mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Gu||i===Im||i===Lm)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Gu)return o===mt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Im)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Lm)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===v1||i===Nm||i===km||i===Dm)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Gu)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Nm)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===km)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Dm)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Jo?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}var Qm=class extends vn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Xn=class extends yn{constructor(){super(),this.isGroup=!0,this.type="Group"}},_R={type:"move"},ml=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let n=this._hand;if(n)for(let i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let g=n.getJointPose(x,i),f=this._getHandJoint(c,x);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,m=.005;c.inputState.pinching&&d>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(_R)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){let i=new Xn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}},MR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,SR=`
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

}`,e0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){let r=new An,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let n=e.cameras[0].viewport,i=new Oi({vertexShader:MR,fragmentShader:SR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new be(new pr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},t0=class extends Qr{constructor(e,n){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,p=null,m=null,x=new e0,g=n.getContextAttributes(),f=null,y=null,v=[],M=[],R=new ue,T=null,E=new vn;E.layers.enable(1),E.viewport=new bt;let A=new vn;A.layers.enable(2),A.viewport=new bt;let L=[E,A],_=new Qm;_.layers.enable(1),_.layers.enable(2);let S=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let K=v[q];return K===void 0&&(K=new ml,v[q]=K),K.getTargetRaySpace()},this.getControllerGrip=function(q){let K=v[q];return K===void 0&&(K=new ml,v[q]=K),K.getGripSpace()},this.getHand=function(q){let K=v[q];return K===void 0&&(K=new ml,v[q]=K),K.getHandSpace()};function z(q){let K=M.indexOf(q.inputSource);if(K===-1)return;let de=v[K];de!==void 0&&(de.update(q.inputSource,q.frame,c||o),de.dispatchEvent({type:q.type,data:q.inputSource}))}function H(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",H),r.removeEventListener("inputsourceschange",Y);for(let q=0;q<v.length;q++){let K=M[q];K!==null&&(M[q]=null,v[q].disconnect(K))}S=null,U=null,x.reset(),e.setRenderTarget(f),p=null,d=null,h=null,r=null,y=null,Be.stop(),i.isPresenting=!1,e.setPixelRatio(T),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(f=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",H),r.addEventListener("inputsourceschange",Y),g.xrCompatible!==!0&&await n.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){let K={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,n,K),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new fr(p.framebufferWidth,p.framebufferHeight,{format:Si,type:hr,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let K=null,de=null,ae=null;g.depth&&(ae=g.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,K=g.stencil?Qo:Yo,de=g.stencil?Jo:Ns);let Re={colorFormat:n.RGBA8,depthFormat:ae,scaleFactor:s};h=new XRWebGLBinding(r,n),d=h.createProjectionLayer(Re),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new fr(d.textureWidth,d.textureHeight,{format:Si,type:hr,depthTexture:new sh(d.textureWidth,d.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,K),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Be.setContext(r),Be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function Y(q){for(let K=0;K<q.removed.length;K++){let de=q.removed[K],ae=M.indexOf(de);ae>=0&&(M[ae]=null,v[ae].disconnect(de))}for(let K=0;K<q.added.length;K++){let de=q.added[K],ae=M.indexOf(de);if(ae===-1){for(let we=0;we<v.length;we++)if(we>=M.length){M.push(de),ae=we;break}else if(M[we]===null){M[we]=de,ae=we;break}if(ae===-1)break}let Re=v[ae];Re&&Re.connect(de)}}let O=new P,G=new P;function F(q,K,de){O.setFromMatrixPosition(K.matrixWorld),G.setFromMatrixPosition(de.matrixWorld);let ae=O.distanceTo(G),Re=K.projectionMatrix.elements,we=de.projectionMatrix.elements,Ue=Re[14]/(Re[10]-1),je=Re[14]/(Re[10]+1),Ve=(Re[9]+1)/Re[5],I=(Re[9]-1)/Re[5],an=(Re[8]-1)/Re[0],Ge=(we[8]+1)/we[0],qe=Ue*an,Ie=Ue*Ge,ut=ae/(-an+Ge),ke=ut*-an;if(K.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ke),q.translateZ(ut),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Re[10]===-1)q.projectionMatrix.copy(K.projectionMatrix),q.projectionMatrixInverse.copy(K.projectionMatrixInverse);else{let C=Ue+ut,w=je+ut,B=qe-ke,j=Ie+(ae-ke),J=Ve*je/w*C,$=I*je/w*C;q.projectionMatrix.makePerspective(B,j,J,$,C,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function ee(q,K){K===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(K.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let K=q.near,de=q.far;x.texture!==null&&(x.depthNear>0&&(K=x.depthNear),x.depthFar>0&&(de=x.depthFar)),_.near=A.near=E.near=K,_.far=A.far=E.far=de,(S!==_.near||U!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),S=_.near,U=_.far);let ae=q.parent,Re=_.cameras;ee(_,ae);for(let we=0;we<Re.length;we++)ee(Re[we],ae);Re.length===2?F(_,E,A):_.projectionMatrix.copy(E.projectionMatrix),ne(q,_,ae)};function ne(q,K,de){de===null?q.matrix.copy(K.matrixWorld):(q.matrix.copy(de.matrixWorld),q.matrix.invert(),q.matrix.multiply(K.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(K.projectionMatrix),q.projectionMatrixInverse.copy(K.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Om*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(_)};let re=null;function Ee(q,K){if(u=K.getViewerPose(c||o),m=K,u!==null){let de=u.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let ae=!1;de.length!==_.cameras.length&&(_.cameras.length=0,ae=!0);for(let we=0;we<de.length;we++){let Ue=de[we],je=null;if(p!==null)je=p.getViewport(Ue);else{let I=h.getViewSubImage(d,Ue);je=I.viewport,we===0&&(e.setRenderTargetTextures(y,I.colorTexture,d.ignoreDepthValues?void 0:I.depthStencilTexture),e.setRenderTarget(y))}let Ve=L[we];Ve===void 0&&(Ve=new vn,Ve.layers.enable(we),Ve.viewport=new bt,L[we]=Ve),Ve.matrix.fromArray(Ue.transform.matrix),Ve.matrix.decompose(Ve.position,Ve.quaternion,Ve.scale),Ve.projectionMatrix.fromArray(Ue.projectionMatrix),Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(),Ve.viewport.set(je.x,je.y,je.width,je.height),we===0&&(_.matrix.copy(Ve.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),ae===!0&&_.cameras.push(Ve)}let Re=r.enabledFeatures;if(Re&&Re.includes("depth-sensing")){let we=h.getDepthInformation(de[0]);we&&we.isValid&&we.texture&&x.init(e,we,r.renderState)}}for(let de=0;de<v.length;de++){let ae=M[de],Re=v[de];ae!==null&&Re!==void 0&&Re.update(ae,K,c||o)}re&&re(q,K),K.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:K}),m=null}let Be=new w1;Be.setAnimationLoop(Ee),this.setAnimationLoop=function(q){re=q},this.dispose=function(){}}},Ts=new Ui,wR=new nt;function ER(t,e){function n(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function i(g,f){f.color.getRGB(g.fogColor.value,S1(t)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function r(g,f,y,v,M){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(g,f):f.isMeshToonMaterial?(s(g,f),h(g,f)):f.isMeshPhongMaterial?(s(g,f),u(g,f)):f.isMeshStandardMaterial?(s(g,f),d(g,f),f.isMeshPhysicalMaterial&&p(g,f,M)):f.isMeshMatcapMaterial?(s(g,f),m(g,f)):f.isMeshDepthMaterial?s(g,f):f.isMeshDistanceMaterial?(s(g,f),x(g,f)):f.isMeshNormalMaterial?s(g,f):f.isLineBasicMaterial?(o(g,f),f.isLineDashedMaterial&&a(g,f)):f.isPointsMaterial?l(g,f,y,v):f.isSpriteMaterial?c(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,n(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,n(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===Yt&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,n(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===Yt&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,n(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,n(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,n(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);let y=e.get(f),v=y.envMap,M=y.envMapRotation;v&&(g.envMap.value=v,Ts.copy(M),Ts.x*=-1,Ts.y*=-1,Ts.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Ts.y*=-1,Ts.z*=-1),g.envMapRotation.value.setFromMatrix4(wR.makeRotationFromEuler(Ts)),g.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,n(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,n(f.aoMap,g.aoMapTransform))}function o(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,n(f.map,g.mapTransform))}function a(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function l(g,f,y,v){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*y,g.scale.value=v*.5,f.map&&(g.map.value=f.map,n(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,n(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function u(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function h(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function d(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,n(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,n(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function p(g,f,y){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,n(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,n(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,n(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,n(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,n(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Yt&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,n(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,n(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=y.texture,g.transmissionSamplerSize.value.set(y.width,y.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,n(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,n(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,n(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,n(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,n(f.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,f){f.matcap&&(g.matcap.value=f.matcap)}function x(g,f){let y=e.get(f).light;g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),g.nearDistance.value=y.shadow.camera.near,g.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function bR(t,e,n,i){let r={},s={},o=[],a=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,v){let M=v.program;i.uniformBlockBinding(y,M)}function c(y,v){let M=r[y.id];M===void 0&&(m(y),M=u(y),r[y.id]=M,y.addEventListener("dispose",g));let R=v.program;i.updateUBOMapping(y,R);let T=e.render.frame;s[y.id]!==T&&(d(y),s[y.id]=T)}function u(y){let v=h();y.__bindingPointIndex=v;let M=t.createBuffer(),R=y.__size,T=y.usage;return t.bindBuffer(t.UNIFORM_BUFFER,M),t.bufferData(t.UNIFORM_BUFFER,R,T),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,v,M),M}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let v=r[y.id],M=y.uniforms,R=y.__cache;t.bindBuffer(t.UNIFORM_BUFFER,v);for(let T=0,E=M.length;T<E;T++){let A=Array.isArray(M[T])?M[T]:[M[T]];for(let L=0,_=A.length;L<_;L++){let S=A[L];if(p(S,T,L,R)===!0){let U=S.__offset,z=Array.isArray(S.value)?S.value:[S.value],H=0;for(let Y=0;Y<z.length;Y++){let O=z[Y],G=x(O);typeof O=="number"||typeof O=="boolean"?(S.__data[0]=O,t.bufferSubData(t.UNIFORM_BUFFER,U+H,S.__data)):O.isMatrix3?(S.__data[0]=O.elements[0],S.__data[1]=O.elements[1],S.__data[2]=O.elements[2],S.__data[3]=0,S.__data[4]=O.elements[3],S.__data[5]=O.elements[4],S.__data[6]=O.elements[5],S.__data[7]=0,S.__data[8]=O.elements[6],S.__data[9]=O.elements[7],S.__data[10]=O.elements[8],S.__data[11]=0):(O.toArray(S.__data,H),H+=G.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,U,S.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function p(y,v,M,R){let T=y.value,E=v+"_"+M;if(R[E]===void 0)return typeof T=="number"||typeof T=="boolean"?R[E]=T:R[E]=T.clone(),!0;{let A=R[E];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return R[E]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function m(y){let v=y.uniforms,M=0,R=16;for(let E=0,A=v.length;E<A;E++){let L=Array.isArray(v[E])?v[E]:[v[E]];for(let _=0,S=L.length;_<S;_++){let U=L[_],z=Array.isArray(U.value)?U.value:[U.value];for(let H=0,Y=z.length;H<Y;H++){let O=z[H],G=x(O),F=M%R,ee=F%G.boundary,ne=F+ee;M+=ee,ne!==0&&R-ne<G.storage&&(M+=R-ne),U.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=M,M+=G.storage}}}let T=M%R;return T>0&&(M+=R-T),y.__size=M,y.__cache={},this}function x(y){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=48,v.storage=48):y.isMatrix4?(v.boundary=64,v.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),v}function g(y){let v=y.target;v.removeEventListener("dispose",g);let M=o.indexOf(v.__bindingPointIndex);o.splice(M,1),t.deleteBuffer(r[v.id]),delete r[v.id],delete s[v.id]}function f(){for(let y in r)t.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}var oh=class{constructor(e={}){let{canvas:n=RE(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=o;let p=new Uint32Array(4),m=new Int32Array(4),x=null,g=null,f=[],y=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Wn,this.toneMapping=Kr,this.toneMappingExposure=1;let v=this,M=!1,R=0,T=0,E=null,A=-1,L=null,_=new bt,S=new bt,U=null,z=new Pe(0),H=0,Y=n.width,O=n.height,G=1,F=null,ee=null,ne=new bt(0,0,Y,O),re=new bt(0,0,Y,O),Ee=!1,Be=new _l,q=!1,K=!1,de=new nt,ae=new nt,Re=new P,we=new bt,Ue={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},je=!1;function Ve(){return E===null?G:1}let I=i;function an(b,k){return n.getContext(b,k)}try{let b={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in n&&n.setAttribute("data-engine","three.js r169"),n.addEventListener("webglcontextlost",Z,!1),n.addEventListener("webglcontextrestored",le,!1),n.addEventListener("webglcontextcreationerror",fe,!1),I===null){let k="webgl2";if(I=an(k,b),I===null)throw an(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Ge,qe,Ie,ut,ke,C,w,B,j,J,$,_e,oe,me,$e,te,ge,Le,Ne,ve,We,De,ot,N;function he(){Ge=new HA(I),Ge.init(),De=new xR(I,Ge),qe=new DA(I,Ge,e,De),Ie=new gR(I),qe.reverseDepthBuffer&&Ie.buffers.depth.setReversed(!0),ut=new WA(I),ke=new iR,C=new yR(I,Ge,Ie,ke,qe,De,ut),w=new zA(v),B=new BA(v),j=new KE(I),ot=new NA(I,j),J=new VA(I,j,ut,ot),$=new YA(I,J,j,ut),Ne=new XA(I,qe,C),te=new UA(ke),_e=new nR(v,w,B,Ge,qe,ot,te),oe=new ER(v,ke),me=new sR,$e=new hR(Ge),Le=new LA(v,w,B,Ie,$,d,l),ge=new pR(v,$,qe),N=new bR(I,ut,qe,Ie),ve=new kA(I,Ge,ut),We=new GA(I,Ge,ut),ut.programs=_e.programs,v.capabilities=qe,v.extensions=Ge,v.properties=ke,v.renderLists=me,v.shadowMap=ge,v.state=Ie,v.info=ut}he();let X=new t0(v,I);this.xr=X,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let b=Ge.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=Ge.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(b){b!==void 0&&(G=b,this.setSize(Y,O,!1))},this.getSize=function(b){return b.set(Y,O)},this.setSize=function(b,k,V=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=b,O=k,n.width=Math.floor(b*G),n.height=Math.floor(k*G),V===!0&&(n.style.width=b+"px",n.style.height=k+"px"),this.setViewport(0,0,b,k)},this.getDrawingBufferSize=function(b){return b.set(Y*G,O*G).floor()},this.setDrawingBufferSize=function(b,k,V){Y=b,O=k,G=V,n.width=Math.floor(b*V),n.height=Math.floor(k*V),this.setViewport(0,0,b,k)},this.getCurrentViewport=function(b){return b.copy(_)},this.getViewport=function(b){return b.copy(ne)},this.setViewport=function(b,k,V,W){b.isVector4?ne.set(b.x,b.y,b.z,b.w):ne.set(b,k,V,W),Ie.viewport(_.copy(ne).multiplyScalar(G).round())},this.getScissor=function(b){return b.copy(re)},this.setScissor=function(b,k,V,W){b.isVector4?re.set(b.x,b.y,b.z,b.w):re.set(b,k,V,W),Ie.scissor(S.copy(re).multiplyScalar(G).round())},this.getScissorTest=function(){return Ee},this.setScissorTest=function(b){Ie.setScissorTest(Ee=b)},this.setOpaqueSort=function(b){F=b},this.setTransparentSort=function(b){ee=b},this.getClearColor=function(b){return b.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor.apply(Le,arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha.apply(Le,arguments)},this.clear=function(b=!0,k=!0,V=!0){let W=0;if(b){let D=!1;if(E!==null){let ie=E.texture.format;D=ie===L0||ie===I0||ie===P0}if(D){let ie=E.texture.type,ce=ie===hr||ie===Ns||ie===xl||ie===Jo||ie===A0||ie===R0,ye=Le.getClearColor(),xe=Le.getClearAlpha(),Te=ye.r,Ce=ye.g,Me=ye.b;ce?(p[0]=Te,p[1]=Ce,p[2]=Me,p[3]=xe,I.clearBufferuiv(I.COLOR,0,p)):(m[0]=Te,m[1]=Ce,m[2]=Me,m[3]=xe,I.clearBufferiv(I.COLOR,0,m))}else W|=I.COLOR_BUFFER_BIT}k&&(W|=I.DEPTH_BUFFER_BIT,I.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),V&&(W|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",Z,!1),n.removeEventListener("webglcontextrestored",le,!1),n.removeEventListener("webglcontextcreationerror",fe,!1),me.dispose(),$e.dispose(),ke.dispose(),w.dispose(),B.dispose(),$.dispose(),ot.dispose(),N.dispose(),_e.dispose(),X.dispose(),X.removeEventListener("sessionstart",W0),X.removeEventListener("sessionend",X0),is.stop()};function Z(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function le(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let b=ut.autoReset,k=ge.enabled,V=ge.autoUpdate,W=ge.needsUpdate,D=ge.type;he(),ut.autoReset=b,ge.enabled=k,ge.autoUpdate=V,ge.needsUpdate=W,ge.type=D}function fe(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Xe(b){let k=b.target;k.removeEventListener("dispose",Xe),Ct(k)}function Ct(b){_n(b),ke.remove(b)}function _n(b){let k=ke.get(b).programs;k!==void 0&&(k.forEach(function(V){_e.releaseProgram(V)}),b.isShaderMaterial&&_e.releaseShaderCache(b))}this.renderBufferDirect=function(b,k,V,W,D,ie){k===null&&(k=Ue);let ce=D.isMesh&&D.matrixWorld.determinant()<0,ye=j1(b,k,V,W,D);Ie.setMaterial(W,ce);let xe=V.index,Te=1;if(W.wireframe===!0){if(xe=J.getWireframeAttribute(V),xe===void 0)return;Te=2}let Ce=V.drawRange,Me=V.attributes.position,et=Ce.start*Te,ht=(Ce.start+Ce.count)*Te;ie!==null&&(et=Math.max(et,ie.start*Te),ht=Math.min(ht,(ie.start+ie.count)*Te)),xe!==null?(et=Math.max(et,0),ht=Math.min(ht,xe.count)):Me!=null&&(et=Math.max(et,0),ht=Math.min(ht,Me.count));let St=ht-et;if(St<0||St===1/0)return;ot.setup(D,W,ye,V,xe);let In,Ke=ve;if(xe!==null&&(In=j.get(xe),Ke=We,Ke.setIndex(In)),D.isMesh)W.wireframe===!0?(Ie.setLineWidth(W.wireframeLinewidth*Ve()),Ke.setMode(I.LINES)):Ke.setMode(I.TRIANGLES);else if(D.isLine){let Se=W.linewidth;Se===void 0&&(Se=1),Ie.setLineWidth(Se*Ve()),D.isLineSegments?Ke.setMode(I.LINES):D.isLineLoop?Ke.setMode(I.LINE_LOOP):Ke.setMode(I.LINE_STRIP)}else D.isPoints?Ke.setMode(I.POINTS):D.isSprite&&Ke.setMode(I.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)Ke.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))Ke.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{let Se=D._multiDrawStarts,Bt=D._multiDrawCounts,Je=D._multiDrawCount,ci=xe?j.get(xe).bytesPerElement:1,Bs=ke.get(W).currentProgram.getUniforms();for(let Ln=0;Ln<Je;Ln++)Bs.setValue(I,"_gl_DrawID",Ln),Ke.render(Se[Ln]/ci,Bt[Ln])}else if(D.isInstancedMesh)Ke.renderInstances(et,St,D.count);else if(V.isInstancedBufferGeometry){let Se=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Bt=Math.min(V.instanceCount,Se);Ke.renderInstances(et,St,Bt)}else Ke.render(et,St)};function Ze(b,k,V){b.transparent===!0&&b.side===si&&b.forceSinglePass===!1?(b.side=Yt,b.needsUpdate=!0,Dl(b,k,V),b.side=Jr,b.needsUpdate=!0,Dl(b,k,V),b.side=si):Dl(b,k,V)}this.compile=function(b,k,V=null){V===null&&(V=b),g=$e.get(V),g.init(k),y.push(g),V.traverseVisible(function(D){D.isLight&&D.layers.test(k.layers)&&(g.pushLight(D),D.castShadow&&g.pushShadow(D))}),b!==V&&b.traverseVisible(function(D){D.isLight&&D.layers.test(k.layers)&&(g.pushLight(D),D.castShadow&&g.pushShadow(D))}),g.setupLights();let W=new Set;return b.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;let ie=D.material;if(ie)if(Array.isArray(ie))for(let ce=0;ce<ie.length;ce++){let ye=ie[ce];Ze(ye,V,D),W.add(ye)}else Ze(ie,V,D),W.add(ie)}),y.pop(),g=null,W},this.compileAsync=function(b,k,V=null){let W=this.compile(b,k,V);return new Promise(D=>{function ie(){if(W.forEach(function(ce){ke.get(ce).currentProgram.isReady()&&W.delete(ce)}),W.size===0){D(b);return}setTimeout(ie,10)}Ge.get("KHR_parallel_shader_compile")!==null?ie():setTimeout(ie,10)})};let Mn=null;function Hi(b){Mn&&Mn(b)}function W0(){is.stop()}function X0(){is.start()}let is=new w1;is.setAnimationLoop(Hi),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(b){Mn=b,X.setAnimationLoop(b),b===null?is.stop():is.start()},X.addEventListener("sessionstart",W0),X.addEventListener("sessionend",X0),this.render=function(b,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,k,E),g=$e.get(b,y.length),g.init(k),y.push(g),ae.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Be.setFromProjectionMatrix(ae),K=this.localClippingEnabled,q=te.init(this.clippingPlanes,K),x=me.get(b,f.length),x.init(),f.push(x),X.enabled===!0&&X.isPresenting===!0){let ie=v.xr.getDepthSensingMesh();ie!==null&&Ah(ie,k,-1/0,v.sortObjects)}Ah(b,k,0,v.sortObjects),x.finish(),v.sortObjects===!0&&x.sort(F,ee),je=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,je&&Le.addToRenderList(x,b),this.info.render.frame++,q===!0&&te.beginShadows();let V=g.state.shadowsArray;ge.render(V,b,k),q===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();let W=x.opaque,D=x.transmissive;if(g.setupLights(),k.isArrayCamera){let ie=k.cameras;if(D.length>0)for(let ce=0,ye=ie.length;ce<ye;ce++){let xe=ie[ce];q0(W,D,b,xe)}je&&Le.render(b);for(let ce=0,ye=ie.length;ce<ye;ce++){let xe=ie[ce];Y0(x,b,xe,xe.viewport)}}else D.length>0&&q0(W,D,b,k),je&&Le.render(b),Y0(x,b,k);E!==null&&(C.updateMultisampleRenderTarget(E),C.updateRenderTargetMipmap(E)),b.isScene===!0&&b.onAfterRender(v,b,k),ot.resetDefaultState(),A=-1,L=null,y.pop(),y.length>0?(g=y[y.length-1],q===!0&&te.setGlobalState(v.clippingPlanes,g.state.camera)):g=null,f.pop(),f.length>0?x=f[f.length-1]:x=null};function Ah(b,k,V,W){if(b.visible===!1)return;if(b.layers.test(k.layers)){if(b.isGroup)V=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(k);else if(b.isLight)g.pushLight(b),b.castShadow&&g.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Be.intersectsSprite(b)){W&&we.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ae);let ce=$.update(b),ye=b.material;ye.visible&&x.push(b,ce,ye,V,we.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Be.intersectsObject(b))){let ce=$.update(b),ye=b.material;if(W&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),we.copy(b.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),we.copy(ce.boundingSphere.center)),we.applyMatrix4(b.matrixWorld).applyMatrix4(ae)),Array.isArray(ye)){let xe=ce.groups;for(let Te=0,Ce=xe.length;Te<Ce;Te++){let Me=xe[Te],et=ye[Me.materialIndex];et&&et.visible&&x.push(b,ce,et,V,we.z,Me)}}else ye.visible&&x.push(b,ce,ye,V,we.z,null)}}let ie=b.children;for(let ce=0,ye=ie.length;ce<ye;ce++)Ah(ie[ce],k,V,W)}function Y0(b,k,V,W){let D=b.opaque,ie=b.transmissive,ce=b.transparent;g.setupLightsView(V),q===!0&&te.setGlobalState(v.clippingPlanes,V),W&&Ie.viewport(_.copy(W)),D.length>0&&kl(D,k,V),ie.length>0&&kl(ie,k,V),ce.length>0&&kl(ce,k,V),Ie.buffers.depth.setTest(!0),Ie.buffers.depth.setMask(!0),Ie.buffers.color.setMask(!0),Ie.setPolygonOffset(!1)}function q0(b,k,V,W){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[W.id]===void 0&&(g.state.transmissionRenderTarget[W.id]=new fr(1,1,{generateMipmaps:!0,type:Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float")?Il:hr,minFilter:Is,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));let ie=g.state.transmissionRenderTarget[W.id],ce=W.viewport||_;ie.setSize(ce.z,ce.w);let ye=v.getRenderTarget();v.setRenderTarget(ie),v.getClearColor(z),H=v.getClearAlpha(),H<1&&v.setClearColor(16777215,.5),v.clear(),je&&Le.render(V);let xe=v.toneMapping;v.toneMapping=Kr;let Te=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),g.setupLightsView(W),q===!0&&te.setGlobalState(v.clippingPlanes,W),kl(b,V,W),C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let Me=0,et=k.length;Me<et;Me++){let ht=k[Me],St=ht.object,In=ht.geometry,Ke=ht.material,Se=ht.group;if(Ke.side===si&&St.layers.test(W.layers)){let Bt=Ke.side;Ke.side=Yt,Ke.needsUpdate=!0,$0(St,V,W,In,Ke,Se),Ke.side=Bt,Ke.needsUpdate=!0,Ce=!0}}Ce===!0&&(C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie))}v.setRenderTarget(ye),v.setClearColor(z,H),Te!==void 0&&(W.viewport=Te),v.toneMapping=xe}function kl(b,k,V){let W=k.isScene===!0?k.overrideMaterial:null;for(let D=0,ie=b.length;D<ie;D++){let ce=b[D],ye=ce.object,xe=ce.geometry,Te=W===null?ce.material:W,Ce=ce.group;ye.layers.test(V.layers)&&$0(ye,k,V,xe,Te,Ce)}}function $0(b,k,V,W,D,ie){b.onBeforeRender(v,k,V,W,D,ie),b.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),D.onBeforeRender(v,k,V,W,b,ie),D.transparent===!0&&D.side===si&&D.forceSinglePass===!1?(D.side=Yt,D.needsUpdate=!0,v.renderBufferDirect(V,k,W,D,b,ie),D.side=Jr,D.needsUpdate=!0,v.renderBufferDirect(V,k,W,D,b,ie),D.side=si):v.renderBufferDirect(V,k,W,D,b,ie),b.onAfterRender(v,k,V,W,D,ie)}function Dl(b,k,V){k.isScene!==!0&&(k=Ue);let W=ke.get(b),D=g.state.lights,ie=g.state.shadowsArray,ce=D.state.version,ye=_e.getParameters(b,D.state,ie,k,V),xe=_e.getProgramCacheKey(ye),Te=W.programs;W.environment=b.isMeshStandardMaterial?k.environment:null,W.fog=k.fog,W.envMap=(b.isMeshStandardMaterial?B:w).get(b.envMap||W.environment),W.envMapRotation=W.environment!==null&&b.envMap===null?k.environmentRotation:b.envMapRotation,Te===void 0&&(b.addEventListener("dispose",Xe),Te=new Map,W.programs=Te);let Ce=Te.get(xe);if(Ce!==void 0){if(W.currentProgram===Ce&&W.lightsStateVersion===ce)return Z0(b,ye),Ce}else ye.uniforms=_e.getUniforms(b),b.onBeforeCompile(ye,v),Ce=_e.acquireProgram(ye,xe),Te.set(xe,Ce),W.uniforms=ye.uniforms;let Me=W.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Me.clippingPlanes=te.uniform),Z0(b,ye),W.needsLights=K1(b),W.lightsStateVersion=ce,W.needsLights&&(Me.ambientLightColor.value=D.state.ambient,Me.lightProbe.value=D.state.probe,Me.directionalLights.value=D.state.directional,Me.directionalLightShadows.value=D.state.directionalShadow,Me.spotLights.value=D.state.spot,Me.spotLightShadows.value=D.state.spotShadow,Me.rectAreaLights.value=D.state.rectArea,Me.ltc_1.value=D.state.rectAreaLTC1,Me.ltc_2.value=D.state.rectAreaLTC2,Me.pointLights.value=D.state.point,Me.pointLightShadows.value=D.state.pointShadow,Me.hemisphereLights.value=D.state.hemi,Me.directionalShadowMap.value=D.state.directionalShadowMap,Me.directionalShadowMatrix.value=D.state.directionalShadowMatrix,Me.spotShadowMap.value=D.state.spotShadowMap,Me.spotLightMatrix.value=D.state.spotLightMatrix,Me.spotLightMap.value=D.state.spotLightMap,Me.pointShadowMap.value=D.state.pointShadowMap,Me.pointShadowMatrix.value=D.state.pointShadowMatrix),W.currentProgram=Ce,W.uniformsList=null,Ce}function j0(b){if(b.uniformsList===null){let k=b.currentProgram.getUniforms();b.uniformsList=$o.seqWithValue(k.seq,b.uniforms)}return b.uniformsList}function Z0(b,k){let V=ke.get(b);V.outputColorSpace=k.outputColorSpace,V.batching=k.batching,V.batchingColor=k.batchingColor,V.instancing=k.instancing,V.instancingColor=k.instancingColor,V.instancingMorph=k.instancingMorph,V.skinning=k.skinning,V.morphTargets=k.morphTargets,V.morphNormals=k.morphNormals,V.morphColors=k.morphColors,V.morphTargetsCount=k.morphTargetsCount,V.numClippingPlanes=k.numClippingPlanes,V.numIntersection=k.numClipIntersection,V.vertexAlphas=k.vertexAlphas,V.vertexTangents=k.vertexTangents,V.toneMapping=k.toneMapping}function j1(b,k,V,W,D){k.isScene!==!0&&(k=Ue),C.resetTextureUnits();let ie=k.fog,ce=W.isMeshStandardMaterial?k.environment:null,ye=E===null?v.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:ns,xe=(W.isMeshStandardMaterial?B:w).get(W.envMap||ce),Te=W.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Ce=!!V.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Me=!!V.morphAttributes.position,et=!!V.morphAttributes.normal,ht=!!V.morphAttributes.color,St=Kr;W.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(St=v.toneMapping);let In=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Ke=In!==void 0?In.length:0,Se=ke.get(W),Bt=g.state.lights;if(q===!0&&(K===!0||b!==L)){let qn=b===L&&W.id===A;te.setState(W,b,qn)}let Je=!1;W.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==Bt.state.version||Se.outputColorSpace!==ye||D.isBatchedMesh&&Se.batching===!1||!D.isBatchedMesh&&Se.batching===!0||D.isBatchedMesh&&Se.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&Se.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&Se.instancing===!1||!D.isInstancedMesh&&Se.instancing===!0||D.isSkinnedMesh&&Se.skinning===!1||!D.isSkinnedMesh&&Se.skinning===!0||D.isInstancedMesh&&Se.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&Se.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&Se.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&Se.instancingMorph===!1&&D.morphTexture!==null||Se.envMap!==xe||W.fog===!0&&Se.fog!==ie||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==te.numPlanes||Se.numIntersection!==te.numIntersection)||Se.vertexAlphas!==Te||Se.vertexTangents!==Ce||Se.morphTargets!==Me||Se.morphNormals!==et||Se.morphColors!==ht||Se.toneMapping!==St||Se.morphTargetsCount!==Ke)&&(Je=!0):(Je=!0,Se.__version=W.version);let ci=Se.currentProgram;Je===!0&&(ci=Dl(W,k,D));let Bs=!1,Ln=!1,Rh=!1,Tt=ci.getUniforms(),gr=Se.uniforms;if(Ie.useProgram(ci.program)&&(Bs=!0,Ln=!0,Rh=!0),W.id!==A&&(A=W.id,Ln=!0),Bs||L!==b){qe.reverseDepthBuffer?(de.copy(b.projectionMatrix),PE(de),IE(de),Tt.setValue(I,"projectionMatrix",de)):Tt.setValue(I,"projectionMatrix",b.projectionMatrix),Tt.setValue(I,"viewMatrix",b.matrixWorldInverse);let qn=Tt.map.cameraPosition;qn!==void 0&&qn.setValue(I,Re.setFromMatrixPosition(b.matrixWorld)),qe.logarithmicDepthBuffer&&Tt.setValue(I,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&Tt.setValue(I,"isOrthographic",b.isOrthographicCamera===!0),L!==b&&(L=b,Ln=!0,Rh=!0)}if(D.isSkinnedMesh){Tt.setOptional(I,D,"bindMatrix"),Tt.setOptional(I,D,"bindMatrixInverse");let qn=D.skeleton;qn&&(qn.boneTexture===null&&qn.computeBoneTexture(),Tt.setValue(I,"boneTexture",qn.boneTexture,C))}D.isBatchedMesh&&(Tt.setOptional(I,D,"batchingTexture"),Tt.setValue(I,"batchingTexture",D._matricesTexture,C),Tt.setOptional(I,D,"batchingIdTexture"),Tt.setValue(I,"batchingIdTexture",D._indirectTexture,C),Tt.setOptional(I,D,"batchingColorTexture"),D._colorsTexture!==null&&Tt.setValue(I,"batchingColorTexture",D._colorsTexture,C));let Ch=V.morphAttributes;if((Ch.position!==void 0||Ch.normal!==void 0||Ch.color!==void 0)&&Ne.update(D,V,ci),(Ln||Se.receiveShadow!==D.receiveShadow)&&(Se.receiveShadow=D.receiveShadow,Tt.setValue(I,"receiveShadow",D.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(gr.envMap.value=xe,gr.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&k.environment!==null&&(gr.envMapIntensity.value=k.environmentIntensity),Ln&&(Tt.setValue(I,"toneMappingExposure",v.toneMappingExposure),Se.needsLights&&Z1(gr,Rh),ie&&W.fog===!0&&oe.refreshFogUniforms(gr,ie),oe.refreshMaterialUniforms(gr,W,G,O,g.state.transmissionRenderTarget[b.id]),$o.upload(I,j0(Se),gr,C)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&($o.upload(I,j0(Se),gr,C),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&Tt.setValue(I,"center",D.center),Tt.setValue(I,"modelViewMatrix",D.modelViewMatrix),Tt.setValue(I,"normalMatrix",D.normalMatrix),Tt.setValue(I,"modelMatrix",D.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let qn=W.uniformsGroups;for(let Ph=0,J1=qn.length;Ph<J1;Ph++){let K0=qn[Ph];N.update(K0,ci),N.bind(K0,ci)}}return ci}function Z1(b,k){b.ambientLightColor.needsUpdate=k,b.lightProbe.needsUpdate=k,b.directionalLights.needsUpdate=k,b.directionalLightShadows.needsUpdate=k,b.pointLights.needsUpdate=k,b.pointLightShadows.needsUpdate=k,b.spotLights.needsUpdate=k,b.spotLightShadows.needsUpdate=k,b.rectAreaLights.needsUpdate=k,b.hemisphereLights.needsUpdate=k}function K1(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(b,k,V){ke.get(b.texture).__webglTexture=k,ke.get(b.depthTexture).__webglTexture=V;let W=ke.get(b);W.__hasExternalTextures=!0,W.__autoAllocateDepthBuffer=V===void 0,W.__autoAllocateDepthBuffer||Ge.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),W.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,k){let V=ke.get(b);V.__webglFramebuffer=k,V.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(b,k=0,V=0){E=b,R=k,T=V;let W=!0,D=null,ie=!1,ce=!1;if(b){let xe=ke.get(b);if(xe.__useDefaultFramebuffer!==void 0)Ie.bindFramebuffer(I.FRAMEBUFFER,null),W=!1;else if(xe.__webglFramebuffer===void 0)C.setupRenderTarget(b);else if(xe.__hasExternalTextures)C.rebindTextures(b,ke.get(b.texture).__webglTexture,ke.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Me=b.depthTexture;if(xe.__boundDepthTexture!==Me){if(Me!==null&&ke.has(Me)&&(b.width!==Me.image.width||b.height!==Me.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(b)}}let Te=b.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(ce=!0);let Ce=ke.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ce[k])?D=Ce[k][V]:D=Ce[k],ie=!0):b.samples>0&&C.useMultisampledRTT(b)===!1?D=ke.get(b).__webglMultisampledFramebuffer:Array.isArray(Ce)?D=Ce[V]:D=Ce,_.copy(b.viewport),S.copy(b.scissor),U=b.scissorTest}else _.copy(ne).multiplyScalar(G).floor(),S.copy(re).multiplyScalar(G).floor(),U=Ee;if(Ie.bindFramebuffer(I.FRAMEBUFFER,D)&&W&&Ie.drawBuffers(b,D),Ie.viewport(_),Ie.scissor(S),Ie.setScissorTest(U),ie){let xe=ke.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+k,xe.__webglTexture,V)}else if(ce){let xe=ke.get(b.texture),Te=k||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,xe.__webglTexture,V||0,Te)}A=-1},this.readRenderTargetPixels=function(b,k,V,W,D,ie,ce){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=ke.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ce!==void 0&&(ye=ye[ce]),ye){Ie.bindFramebuffer(I.FRAMEBUFFER,ye);try{let xe=b.texture,Te=xe.format,Ce=xe.type;if(!qe.textureFormatReadable(Te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(Ce)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=b.width-W&&V>=0&&V<=b.height-D&&I.readPixels(k,V,W,D,De.convert(Te),De.convert(Ce),ie)}finally{let xe=E!==null?ke.get(E).__webglFramebuffer:null;Ie.bindFramebuffer(I.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(b,k,V,W,D,ie,ce){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=ke.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ce!==void 0&&(ye=ye[ce]),ye){let xe=b.texture,Te=xe.format,Ce=xe.type;if(!qe.textureFormatReadable(Te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=b.width-W&&V>=0&&V<=b.height-D){Ie.bindFramebuffer(I.FRAMEBUFFER,ye);let Me=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Me),I.bufferData(I.PIXEL_PACK_BUFFER,ie.byteLength,I.STREAM_READ),I.readPixels(k,V,W,D,De.convert(Te),De.convert(Ce),0);let et=E!==null?ke.get(E).__webglFramebuffer:null;Ie.bindFramebuffer(I.FRAMEBUFFER,et);let ht=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await CE(I,ht,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Me),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,ie),I.deleteBuffer(Me),I.deleteSync(ht),ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,k=null,V=0){b.isTexture!==!0&&(Wu("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,b=arguments[1]);let W=Math.pow(2,-V),D=Math.floor(b.image.width*W),ie=Math.floor(b.image.height*W),ce=k!==null?k.x:0,ye=k!==null?k.y:0;C.setTexture2D(b,0),I.copyTexSubImage2D(I.TEXTURE_2D,V,0,0,ce,ye,D,ie),Ie.unbindTexture()},this.copyTextureToTexture=function(b,k,V=null,W=null,D=0){b.isTexture!==!0&&(Wu("WebGLRenderer: copyTextureToTexture function signature has changed."),W=arguments[0]||null,b=arguments[1],k=arguments[2],D=arguments[3]||0,V=null);let ie,ce,ye,xe,Te,Ce;V!==null?(ie=V.max.x-V.min.x,ce=V.max.y-V.min.y,ye=V.min.x,xe=V.min.y):(ie=b.image.width,ce=b.image.height,ye=0,xe=0),W!==null?(Te=W.x,Ce=W.y):(Te=0,Ce=0);let Me=De.convert(k.format),et=De.convert(k.type);C.setTexture2D(k,0),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,k.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,k.unpackAlignment);let ht=I.getParameter(I.UNPACK_ROW_LENGTH),St=I.getParameter(I.UNPACK_IMAGE_HEIGHT),In=I.getParameter(I.UNPACK_SKIP_PIXELS),Ke=I.getParameter(I.UNPACK_SKIP_ROWS),Se=I.getParameter(I.UNPACK_SKIP_IMAGES),Bt=b.isCompressedTexture?b.mipmaps[D]:b.image;I.pixelStorei(I.UNPACK_ROW_LENGTH,Bt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Bt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,ye),I.pixelStorei(I.UNPACK_SKIP_ROWS,xe),b.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,D,Te,Ce,ie,ce,Me,et,Bt.data):b.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,D,Te,Ce,Bt.width,Bt.height,Me,Bt.data):I.texSubImage2D(I.TEXTURE_2D,D,Te,Ce,ie,ce,Me,et,Bt),I.pixelStorei(I.UNPACK_ROW_LENGTH,ht),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,St),I.pixelStorei(I.UNPACK_SKIP_PIXELS,In),I.pixelStorei(I.UNPACK_SKIP_ROWS,Ke),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Se),D===0&&k.generateMipmaps&&I.generateMipmap(I.TEXTURE_2D),Ie.unbindTexture()},this.copyTextureToTexture3D=function(b,k,V=null,W=null,D=0){b.isTexture!==!0&&(Wu("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,W=arguments[1]||null,b=arguments[2],k=arguments[3],D=arguments[4]||0);let ie,ce,ye,xe,Te,Ce,Me,et,ht,St=b.isCompressedTexture?b.mipmaps[D]:b.image;V!==null?(ie=V.max.x-V.min.x,ce=V.max.y-V.min.y,ye=V.max.z-V.min.z,xe=V.min.x,Te=V.min.y,Ce=V.min.z):(ie=St.width,ce=St.height,ye=St.depth,xe=0,Te=0,Ce=0),W!==null?(Me=W.x,et=W.y,ht=W.z):(Me=0,et=0,ht=0);let In=De.convert(k.format),Ke=De.convert(k.type),Se;if(k.isData3DTexture)C.setTexture3D(k,0),Se=I.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)C.setTexture2DArray(k,0),Se=I.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,k.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,k.unpackAlignment);let Bt=I.getParameter(I.UNPACK_ROW_LENGTH),Je=I.getParameter(I.UNPACK_IMAGE_HEIGHT),ci=I.getParameter(I.UNPACK_SKIP_PIXELS),Bs=I.getParameter(I.UNPACK_SKIP_ROWS),Ln=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,St.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,St.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,xe),I.pixelStorei(I.UNPACK_SKIP_ROWS,Te),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Ce),b.isDataTexture||b.isData3DTexture?I.texSubImage3D(Se,D,Me,et,ht,ie,ce,ye,In,Ke,St.data):k.isCompressedArrayTexture?I.compressedTexSubImage3D(Se,D,Me,et,ht,ie,ce,ye,In,St.data):I.texSubImage3D(Se,D,Me,et,ht,ie,ce,ye,In,Ke,St),I.pixelStorei(I.UNPACK_ROW_LENGTH,Bt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Je),I.pixelStorei(I.UNPACK_SKIP_PIXELS,ci),I.pixelStorei(I.UNPACK_SKIP_ROWS,Bs),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Ln),D===0&&k.generateMipmaps&&I.generateMipmap(Se),Ie.unbindTexture()},this.initRenderTarget=function(b){ke.get(b).__webglFramebuffer===void 0&&C.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?C.setTextureCube(b,0):b.isData3DTexture?C.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?C.setTexture2DArray(b,0):C.setTexture2D(b,0),Ie.unbindTexture()},this.resetState=function(){R=0,T=0,E=null,Ie.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let n=this.getContext();n.drawingBufferColorSpace=e===N0?"display-p3":"srgb",n.unpackColorSpace=Qe.workingColorSpace===xh?"display-p3":"srgb"}};var ah=class t{constructor(e,n=1,i=1e3){this.isFog=!0,this.name="",this.color=new Pe(e),this.near=n,this.far=i}clone(){return new t(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ml=class extends yn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ui,this.environmentIntensity=1,this.environmentRotation=new Ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}},lh=class{constructor(e,n){this.isInterleavedBuffer=!0,this.array=e,this.stride=n,this.count=e!==void 0?e.length/n:0,this.usage=zm,this.updateRanges=[],this.version=0,this.uuid=ur()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,n,i){e*=this.stride,i*=n.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=n.array[i+r];return this}set(e,n=0){return this.array.set(e,n),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ur()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ur()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},mn=new P,Sl=class t{constructor(e,n,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=n,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let n=0,i=this.data.count;n<i;n++)mn.fromBufferAttribute(this,n),mn.applyMatrix4(e),this.setXYZ(n,mn.x,mn.y,mn.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)mn.fromBufferAttribute(this,n),mn.applyNormalMatrix(e),this.setXYZ(n,mn.x,mn.y,mn.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)mn.fromBufferAttribute(this,n),mn.transformDirection(e),this.setXYZ(n,mn.x,mn.y,mn.z);return this}getComponent(e,n){let i=this.array[e*this.data.stride+this.offset+n];return this.normalized&&(i=Ni(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=rt(i,this.array)),this.data.array[e*this.data.stride+this.offset+n]=i,this}setX(e,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset]=n,this}setY(e,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+1]=n,this}setZ(e,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+2]=n,this}setW(e,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+3]=n,this}getX(e){let n=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(n=Ni(n,this.array)),n}getY(e){let n=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(n=Ni(n,this.array)),n}getZ(e){let n=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(n=Ni(n,this.array)),n}getW(e){let n=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(n=Ni(n,this.array)),n}setXY(e,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this}setXYZ(e,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array),r=rt(r,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(n=rt(n,this.array),i=rt(i,this.array),r=rt(r,this.array),s=rt(s,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)n.push(this.data.array[r+s])}return new Rt(new this.array.constructor(n),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new t(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)n.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ds=class extends es{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Pe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Oo,cl=new P,Fo=new P,Bo=new P,Ho=new ue,ul=new ue,R1=new nt,Iu=new P,hl=new P,Lu=new P,j_=new ue,qp=new ue,Z_=new ue,na=class extends yn{constructor(e=new Ds){if(super(),this.isSprite=!0,this.type="Sprite",Oo===void 0){Oo=new qt;let n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new lh(n,5);Oo.setIndex([0,1,2,0,2,3]),Oo.setAttribute("position",new Sl(i,3,0,!1)),Oo.setAttribute("uv",new Sl(i,2,3,!1))}this.geometry=Oo,this.material=e,this.center=new ue(.5,.5)}raycast(e,n){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Fo.setFromMatrixScale(this.matrixWorld),R1.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Bo.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Fo.multiplyScalar(-Bo.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;Nu(Iu.set(-.5,-.5,0),Bo,o,Fo,r,s),Nu(hl.set(.5,-.5,0),Bo,o,Fo,r,s),Nu(Lu.set(.5,.5,0),Bo,o,Fo,r,s),j_.set(0,0),qp.set(1,0),Z_.set(1,1);let a=e.ray.intersectTriangle(Iu,hl,Lu,!1,cl);if(a===null&&(Nu(hl.set(-.5,.5,0),Bo,o,Fo,r,s),qp.set(0,1),a=e.ray.intersectTriangle(Iu,Lu,hl,!1,cl),a===null))return;let l=e.ray.origin.distanceTo(cl);l<e.near||l>e.far||n.push({distance:l,point:cl.clone(),uv:jr.getInterpolation(cl,Iu,hl,Lu,j_,qp,Z_,new ue),face:null,object:this})}copy(e,n){return super.copy(e,n),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Nu(t,e,n,i,r,s){Ho.subVectors(t,n).addScalar(.5).multiply(i),r!==void 0?(ul.x=s*Ho.x-r*Ho.y,ul.y=r*Ho.x+s*Ho.y):ul.copy(Ho),t.copy(e),t.x+=ul.x,t.y+=ul.y,t.applyMatrix4(R1)}var n0=class extends An{constructor(e=null,n=1,i=1,r,s,o,a,l,c=nn,u=nn,h,d){super(null,o,a,l,c,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var wl=class extends Rt{constructor(e,n,i,r=1){super(e,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Vo=new nt,K_=new nt,ku=[],J_=new dr,TR=new nt,fl=new be,dl=new ks,ch=class extends be{constructor(e,n,i){super(e,n),this.isInstancedMesh=!0,this.instanceMatrix=new wl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,TR)}computeBoundingBox(){let e=this.geometry,n=this.count;this.boundingBox===null&&(this.boundingBox=new dr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,Vo),J_.copy(e.boundingBox).applyMatrix4(Vo),this.boundingBox.union(J_)}computeBoundingSphere(){let e=this.geometry,n=this.count;this.boundingSphere===null&&(this.boundingSphere=new ks),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,Vo),dl.copy(e.boundingSphere).applyMatrix4(Vo),this.boundingSphere.union(dl)}copy(e,n){return super.copy(e,n),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,n){n.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,n){n.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,n){let i=n.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,n){let i=this.matrixWorld,r=this.count;if(fl.geometry=this.geometry,fl.material=this.material,fl.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),dl.copy(this.boundingSphere),dl.applyMatrix4(i),e.ray.intersectsSphere(dl)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Vo),K_.multiplyMatrices(i,Vo),fl.matrixWorld=K_,fl.raycast(e,ku);for(let o=0,a=ku.length;o<a;o++){let l=ku[o];l.instanceId=s,l.object=this,n.push(l)}ku.length=0}}setColorAt(e,n){this.instanceColor===null&&(this.instanceColor=new wl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),n.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,n){n.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,n){let i=n.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new n0(new Float32Array(r*this.count),r,this.count,C0,ki));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var El=class extends An{constructor(e,n,i,r,s,o,a,l,c){super(e,n,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},oi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,n){let i=this.getUtoTmapping(e);return this.getPoint(i,n)}getPoints(e=5){let n=[];for(let i=0;i<=e;i++)n.push(this.getPoint(i/e));return n}getSpacedPoints(e=5){let n=[];for(let i=0;i<=e;i++)n.push(this.getPointAt(i/e));return n}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let n=[],i,r=this.getPoint(0),s=0;n.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),n.push(s),r=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,n){let i=this.getLengths(),r=0,s=i.length,o;n?o=n:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],d=i[r+1]-u,p=(o-u)/d;return(r+p)/(s-1)}getTangent(e,n){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=n||(o.isVector2?new ue:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,n){let i=this.getUtoTmapping(e);return this.getTangent(i,n)}computeFrenetFrames(e,n){let i=new P,r=[],s=[],o=[],a=new P,l=new nt;for(let p=0;p<=e;p++){let m=p/e;r[p]=this.getTangentAt(m,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(tn(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,m))}o[p].crossVectors(r[p],s[p])}if(n===!0){let p=Math.acos(tn(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(r[m],p*m)),o[m].crossVectors(r[m],s[m])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},bl=class extends oi{constructor(e=0,n=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=n,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,n=new ue){let i=n,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*u-p*h+this.aX,c=d*h+p*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},i0=class extends bl{constructor(e,n,i,r,s,o){super(e,n,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function D0(){let t=0,e=0,n=0,i=0;function r(s,o,a,l){t=s,e=a,n=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,p=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,p*=u,r(o,a,d,p)},calc:function(s){let o=s*s,a=o*s;return t+e*s+n*o+i*a}}}var Du=new P,$p=new D0,jp=new D0,Zp=new D0,r0=class extends oi{constructor(e=[],n=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=n,this.curveType=i,this.tension=r}getPoint(e,n=new P){let i=n,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Du.subVectors(r[0],r[1]).add(r[0]),c=Du);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Du.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Du),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),p),x=Math.pow(h.distanceToSquared(d),p),g=Math.pow(d.distanceToSquared(u),p);x<1e-4&&(x=1),m<1e-4&&(m=x),g<1e-4&&(g=x),$p.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,m,x,g),jp.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,m,x,g),Zp.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,m,x,g)}else this.curveType==="catmullrom"&&($p.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),jp.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Zp.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return i.set($p.calc(l),jp.calc(l),Zp.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){let r=e.points[n];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let n=0,i=this.points.length;n<i;n++){let r=this.points[n];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){let r=e.points[n];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Q_(t,e,n,i,r){let s=(i-e)*.5,o=(r-n)*.5,a=t*t,l=t*a;return(2*n-2*i+s+o)*l+(-3*n+3*i-2*s-o)*a+s*t+n}function AR(t,e){let n=1-t;return n*n*e}function RR(t,e){return 2*(1-t)*t*e}function CR(t,e){return t*t*e}function gl(t,e,n,i){return AR(t,e)+RR(t,n)+CR(t,i)}function PR(t,e){let n=1-t;return n*n*n*e}function IR(t,e){let n=1-t;return 3*n*n*t*e}function LR(t,e){return 3*(1-t)*t*t*e}function NR(t,e){return t*t*t*e}function vl(t,e,n,i,r){return PR(t,e)+IR(t,n)+LR(t,i)+NR(t,r)}var uh=class extends oi{constructor(e=new ue,n=new ue,i=new ue,r=new ue){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=n,this.v2=i,this.v3=r}getPoint(e,n=new ue){let i=n,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(vl(e,r.x,s.x,o.x,a.x),vl(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},s0=class extends oi{constructor(e=new P,n=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=n,this.v2=i,this.v3=r}getPoint(e,n=new P){let i=n,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(vl(e,r.x,s.x,o.x,a.x),vl(e,r.y,s.y,o.y,a.y),vl(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},hh=class extends oi{constructor(e=new ue,n=new ue){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=n}getPoint(e,n=new ue){let i=n;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,n){return this.getPoint(e,n)}getTangent(e,n=new ue){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,n){return this.getTangent(e,n)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},o0=class extends oi{constructor(e=new P,n=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=n}getPoint(e,n=new P){let i=n;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,n){return this.getPoint(e,n)}getTangent(e,n=new P){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,n){return this.getTangent(e,n)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},fh=class extends oi{constructor(e=new ue,n=new ue,i=new ue){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=n,this.v2=i}getPoint(e,n=new ue){let i=n,r=this.v0,s=this.v1,o=this.v2;return i.set(gl(e,r.x,s.x,o.x),gl(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},a0=class extends oi{constructor(e=new P,n=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=n,this.v2=i}getPoint(e,n=new P){let i=n,r=this.v0,s=this.v1,o=this.v2;return i.set(gl(e,r.x,s.x,o.x),gl(e,r.y,s.y,o.y),gl(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},dh=class extends oi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,n=new ue){let i=n,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(Q_(a,l.x,c.x,u.x,h.x),Q_(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){let r=e.points[n];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let n=0,i=this.points.length;n<i;n++){let r=this.points[n];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let n=0,i=e.points.length;n<i;n++){let r=e.points[n];this.points.push(new ue().fromArray(r))}return this}},e1=Object.freeze({__proto__:null,ArcCurve:i0,CatmullRomCurve3:r0,CubicBezierCurve:uh,CubicBezierCurve3:s0,EllipseCurve:bl,LineCurve:hh,LineCurve3:o0,QuadraticBezierCurve:fh,QuadraticBezierCurve3:a0,SplineCurve:dh}),l0=class extends oi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),n=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(n)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new e1[i](n,e))}return this}getPoint(e,n){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,n)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],n=0;for(let i=0,r=this.curves.length;i<r;i++)n+=this.curves[i].getLength(),e.push(n);return this.cacheLengths=e,e}getSpacedPoints(e=40){let n=[];for(let i=0;i<=e;i++)n.push(this.getPoint(i/e));return this.autoClose&&n.push(n[0]),n}getPoints(e=12){let n=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(n.push(u),i=u)}}return this.autoClose&&n.length>1&&!n[n.length-1].equals(n[0])&&n.push(n[0]),n}copy(e){super.copy(e),this.curves=[];for(let n=0,i=e.curves.length;n<i;n++){let r=e.curves[n];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let n=0,i=this.curves.length;n<i;n++){let r=this.curves[n];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let n=0,i=e.curves.length;n<i;n++){let r=e.curves[n];this.curves.push(new e1[r.type]().fromJSON(r))}return this}},ph=class extends l0{constructor(e){super(),this.type="Path",this.currentPoint=new ue,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let n=1,i=e.length;n<i;n++)this.lineTo(e[n].x,e[n].y);return this}moveTo(e,n){return this.currentPoint.set(e,n),this}lineTo(e,n){let i=new hh(this.currentPoint.clone(),new ue(e,n));return this.curves.push(i),this.currentPoint.set(e,n),this}quadraticCurveTo(e,n,i,r){let s=new fh(this.currentPoint.clone(),new ue(e,n),new ue(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,n,i,r,s,o){let a=new uh(this.currentPoint.clone(),new ue(e,n),new ue(i,r),new ue(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let n=[this.currentPoint.clone()].concat(e),i=new dh(n);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,n,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,n+l,i,r,s,o),this}absarc(e,n,i,r,s,o){return this.absellipse(e,n,i,i,r,s,o),this}ellipse(e,n,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,n+u,i,r,s,o,a,l),this}absellipse(e,n,i,r,s,o,a,l){let c=new bl(e,n,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var Us=class t extends qt{constructor(e=1,n=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:n,thetaStart:i,thetaLength:r},n=Math.max(3,n);let s=[],o=[],a=[],l=[],c=new P,u=new ue;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=n;h++,d+=3){let p=i+h/n*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=n;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new st(o,3)),this.setAttribute("normal",new st(a,3)),this.setAttribute("uv",new st(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.radius,e.segments,e.thetaStart,e.thetaLength)}},rn=class t extends qt{constructor(e=1,n=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:n,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],p=[],m=0,x=[],g=i/2,f=0;y(),o===!1&&(e>0&&v(!0),n>0&&v(!1)),this.setIndex(u),this.setAttribute("position",new st(h,3)),this.setAttribute("normal",new st(d,3)),this.setAttribute("uv",new st(p,2));function y(){let M=new P,R=new P,T=0,E=(n-e)/i;for(let A=0;A<=s;A++){let L=[],_=A/s,S=_*(n-e)+e;for(let U=0;U<=r;U++){let z=U/r,H=z*l+a,Y=Math.sin(H),O=Math.cos(H);R.x=S*Y,R.y=-_*i+g,R.z=S*O,h.push(R.x,R.y,R.z),M.set(Y,E,O).normalize(),d.push(M.x,M.y,M.z),p.push(z,1-_),L.push(m++)}x.push(L)}for(let A=0;A<r;A++)for(let L=0;L<s;L++){let _=x[L][A],S=x[L+1][A],U=x[L+1][A+1],z=x[L][A+1];e>0&&(u.push(_,S,z),T+=3),n>0&&(u.push(S,U,z),T+=3)}c.addGroup(f,T,0),f+=T}function v(M){let R=m,T=new ue,E=new P,A=0,L=M===!0?e:n,_=M===!0?1:-1;for(let U=1;U<=r;U++)h.push(0,g*_,0),d.push(0,_,0),p.push(.5,.5),m++;let S=m;for(let U=0;U<=r;U++){let H=U/r*l+a,Y=Math.cos(H),O=Math.sin(H);E.x=L*O,E.y=g*_,E.z=L*Y,h.push(E.x,E.y,E.z),d.push(0,_,0),T.x=Y*.5+.5,T.y=O*.5*_+.5,p.push(T.x,T.y),m++}for(let U=0;U<r;U++){let z=R+U,H=S+U;M===!0?u.push(H,H+1,z):u.push(H+1,H,z),A+=3}c.addGroup(f,A,M===!0?1:2),f+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ts=class t extends rn{constructor(e=1,n=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,n,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:n,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new t(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},c0=class t extends qt{constructor(e=[],n=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new st(s,3)),this.setAttribute("normal",new st(s.slice(),3)),this.setAttribute("uv",new st(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let v=new P,M=new P,R=new P;for(let T=0;T<n.length;T+=3)p(n[T+0],v),p(n[T+1],M),p(n[T+2],R),l(v,M,R,y)}function l(y,v,M,R){let T=R+1,E=[];for(let A=0;A<=T;A++){E[A]=[];let L=y.clone().lerp(M,A/T),_=v.clone().lerp(M,A/T),S=T-A;for(let U=0;U<=S;U++)U===0&&A===T?E[A][U]=L:E[A][U]=L.clone().lerp(_,U/S)}for(let A=0;A<T;A++)for(let L=0;L<2*(T-A)-1;L++){let _=Math.floor(L/2);L%2===0?(d(E[A][_+1]),d(E[A+1][_]),d(E[A][_])):(d(E[A][_+1]),d(E[A+1][_+1]),d(E[A+1][_]))}}function c(y){let v=new P;for(let M=0;M<s.length;M+=3)v.x=s[M+0],v.y=s[M+1],v.z=s[M+2],v.normalize().multiplyScalar(y),s[M+0]=v.x,s[M+1]=v.y,s[M+2]=v.z}function u(){let y=new P;for(let v=0;v<s.length;v+=3){y.x=s[v+0],y.y=s[v+1],y.z=s[v+2];let M=g(y)/2/Math.PI+.5,R=f(y)/Math.PI+.5;o.push(M,1-R)}m(),h()}function h(){for(let y=0;y<o.length;y+=6){let v=o[y+0],M=o[y+2],R=o[y+4],T=Math.max(v,M,R),E=Math.min(v,M,R);T>.9&&E<.1&&(v<.2&&(o[y+0]+=1),M<.2&&(o[y+2]+=1),R<.2&&(o[y+4]+=1))}}function d(y){s.push(y.x,y.y,y.z)}function p(y,v){let M=y*3;v.x=e[M+0],v.y=e[M+1],v.z=e[M+2]}function m(){let y=new P,v=new P,M=new P,R=new P,T=new ue,E=new ue,A=new ue;for(let L=0,_=0;L<s.length;L+=9,_+=6){y.set(s[L+0],s[L+1],s[L+2]),v.set(s[L+3],s[L+4],s[L+5]),M.set(s[L+6],s[L+7],s[L+8]),T.set(o[_+0],o[_+1]),E.set(o[_+2],o[_+3]),A.set(o[_+4],o[_+5]),R.copy(y).add(v).add(M).divideScalar(3);let S=g(R);x(T,_+0,y,S),x(E,_+2,v,S),x(A,_+4,M,S)}}function x(y,v,M,R){R<0&&y.x===1&&(o[v]=y.x-1),M.x===0&&M.z===0&&(o[v]=R/2/Math.PI+.5)}function g(y){return Math.atan2(y.z,-y.x)}function f(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.vertices,e.indices,e.radius,e.details)}};var Tl=class extends ph{constructor(e){super(e),this.uuid=ur(),this.type="Shape",this.holes=[]}getPointsHoles(e){let n=[];for(let i=0,r=this.holes.length;i<r;i++)n[i]=this.holes[i].getPoints(e);return n}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let n=0,i=e.holes.length;n<i;n++){let r=e.holes[n];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let n=0,i=this.holes.length;n<i;n++){let r=this.holes[n];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let n=0,i=e.holes.length;n<i;n++){let r=e.holes[n];this.holes.push(new ph().fromJSON(r))}return this}},kR={triangulate:function(t,e,n=2){let i=e&&e.length,r=i?e[0]*n:t.length,s=C1(t,0,r,n,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,d,p;if(i&&(s=FR(t,e,s,n)),t.length>80*n){a=c=t[0],l=u=t[1];for(let m=n;m<r;m+=n)h=t[m],d=t[m+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);p=Math.max(c-a,u-l),p=p!==0?32767/p:0}return Al(s,o,n,a,l,p,0),o}};function C1(t,e,n,i,r){let s,o;if(r===ZR(t,e,n,i)>0)for(s=e;s<n;s+=i)o=t1(s,t[s],t[s+1],o);else for(s=n-i;s>=e;s-=i)o=t1(s,t[s],t[s+1],o);return o&&Mh(o,o.next)&&(Cl(o),o=o.next),o}function zs(t,e){if(!t)return t;e||(e=t);let n=t,i;do if(i=!1,!n.steiner&&(Mh(n,n.next)||Mt(n.prev,n,n.next)===0)){if(Cl(n),n=e=n.prev,n===n.next)break;i=!0}else n=n.next;while(i||n!==e);return e}function Al(t,e,n,i,r,s,o){if(!t)return;!o&&s&&WR(t,i,r,s);let a=t,l,c;for(;t.prev!==t.next;){if(l=t.prev,c=t.next,s?UR(t,i,r,s):DR(t)){e.push(l.i/n|0),e.push(t.i/n|0),e.push(c.i/n|0),Cl(t),t=c.next,a=c.next;continue}if(t=c,t===a){o?o===1?(t=zR(zs(t),e,n),Al(t,e,n,i,r,s,2)):o===2&&OR(t,e,n,i,r,s):Al(zs(t),e,n,i,r,s,1);break}}}function DR(t){let e=t.prev,n=t,i=t.next;if(Mt(e,n,i)>=0)return!1;let r=e.x,s=n.x,o=i.x,a=e.y,l=n.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,p=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=u&&m.x<=d&&m.y>=h&&m.y<=p&&Wo(r,a,s,l,o,c,m.x,m.y)&&Mt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function UR(t,e,n,i){let r=t.prev,s=t,o=t.next;if(Mt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,p=a<l?a<c?a:c:l<c?l:c,m=u<h?u<d?u:d:h<d?h:d,x=a>l?a>c?a:c:l>c?l:c,g=u>h?u>d?u:d:h>d?h:d,f=u0(p,m,e,n,i),y=u0(x,g,e,n,i),v=t.prevZ,M=t.nextZ;for(;v&&v.z>=f&&M&&M.z<=y;){if(v.x>=p&&v.x<=x&&v.y>=m&&v.y<=g&&v!==r&&v!==o&&Wo(a,u,l,h,c,d,v.x,v.y)&&Mt(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&Wo(a,u,l,h,c,d,M.x,M.y)&&Mt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=f;){if(v.x>=p&&v.x<=x&&v.y>=m&&v.y<=g&&v!==r&&v!==o&&Wo(a,u,l,h,c,d,v.x,v.y)&&Mt(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=y;){if(M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&Wo(a,u,l,h,c,d,M.x,M.y)&&Mt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function zR(t,e,n){let i=t;do{let r=i.prev,s=i.next.next;!Mh(r,s)&&P1(r,i,i.next,s)&&Rl(r,s)&&Rl(s,r)&&(e.push(r.i/n|0),e.push(i.i/n|0),e.push(s.i/n|0),Cl(i),Cl(i.next),i=t=s),i=i.next}while(i!==t);return zs(i)}function OR(t,e,n,i,r,s){let o=t;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&qR(o,a)){let l=I1(o,a);o=zs(o,o.next),l=zs(l,l.next),Al(o,e,n,i,r,s,0),Al(l,e,n,i,r,s,0);return}a=a.next}o=o.next}while(o!==t)}function FR(t,e,n,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:t.length,c=C1(t,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(YR(c));for(r.sort(BR),s=0;s<r.length;s++)n=HR(r[s],n);return n}function BR(t,e){return t.x-e.x}function HR(t,e){let n=VR(t,e);if(!n)return e;let i=I1(n,t);return zs(i,i.next),zs(n,n.next)}function VR(t,e){let n=e,i=-1/0,r,s=t.x,o=t.y;do{if(o<=n.y&&o>=n.next.y&&n.next.y!==n.y){let d=n.x+(o-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(d<=s&&d>i&&(i=d,r=n.x<n.next.x?n:n.next,d===s))return r}n=n.next}while(n!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;n=r;do s>=n.x&&n.x>=l&&s!==n.x&&Wo(o<c?s:i,o,l,c,o<c?i:s,o,n.x,n.y)&&(h=Math.abs(o-n.y)/(s-n.x),Rl(n,t)&&(h<u||h===u&&(n.x>r.x||n.x===r.x&&GR(r,n)))&&(r=n,u=h)),n=n.next;while(n!==a);return r}function GR(t,e){return Mt(t.prev,t,e.prev)<0&&Mt(e.next,t,t.next)<0}function WR(t,e,n,i){let r=t;do r.z===0&&(r.z=u0(r.x,r.y,e,n,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==t);r.prevZ.nextZ=null,r.prevZ=null,XR(r)}function XR(t){let e,n,i,r,s,o,a,l,c=1;do{for(n=t,t=null,s=null,o=0;n;){for(o++,i=n,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||n.z<=i.z)?(r=n,n=n.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:t=r,r.prevZ=s,s=r;n=i}s.nextZ=null,c*=2}while(o>1);return t}function u0(t,e,n,i,r){return t=(t-n)*r|0,e=(e-i)*r|0,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t|e<<1}function YR(t){let e=t,n=t;do(e.x<n.x||e.x===n.x&&e.y<n.y)&&(n=e),e=e.next;while(e!==t);return n}function Wo(t,e,n,i,r,s,o,a){return(r-o)*(e-a)>=(t-o)*(s-a)&&(t-o)*(i-a)>=(n-o)*(e-a)&&(n-o)*(s-a)>=(r-o)*(i-a)}function qR(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!$R(t,e)&&(Rl(t,e)&&Rl(e,t)&&jR(t,e)&&(Mt(t.prev,t,e.prev)||Mt(t,e.prev,e))||Mh(t,e)&&Mt(t.prev,t,t.next)>0&&Mt(e.prev,e,e.next)>0)}function Mt(t,e,n){return(e.y-t.y)*(n.x-e.x)-(e.x-t.x)*(n.y-e.y)}function Mh(t,e){return t.x===e.x&&t.y===e.y}function P1(t,e,n,i){let r=zu(Mt(t,e,n)),s=zu(Mt(t,e,i)),o=zu(Mt(n,i,t)),a=zu(Mt(n,i,e));return!!(r!==s&&o!==a||r===0&&Uu(t,n,e)||s===0&&Uu(t,i,e)||o===0&&Uu(n,t,i)||a===0&&Uu(n,e,i))}function Uu(t,e,n){return e.x<=Math.max(t.x,n.x)&&e.x>=Math.min(t.x,n.x)&&e.y<=Math.max(t.y,n.y)&&e.y>=Math.min(t.y,n.y)}function zu(t){return t>0?1:t<0?-1:0}function $R(t,e){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==e.i&&n.next.i!==e.i&&P1(n,n.next,t,e))return!0;n=n.next}while(n!==t);return!1}function Rl(t,e){return Mt(t.prev,t,t.next)<0?Mt(t,e,t.next)>=0&&Mt(t,t.prev,e)>=0:Mt(t,e,t.prev)<0||Mt(t,t.next,e)<0}function jR(t,e){let n=t,i=!1,r=(t.x+e.x)/2,s=(t.y+e.y)/2;do n.y>s!=n.next.y>s&&n.next.y!==n.y&&r<(n.next.x-n.x)*(s-n.y)/(n.next.y-n.y)+n.x&&(i=!i),n=n.next;while(n!==t);return i}function I1(t,e){let n=new h0(t.i,t.x,t.y),i=new h0(e.i,e.x,e.y),r=t.next,s=e.prev;return t.next=e,e.prev=t,n.next=r,r.prev=n,i.next=n,n.prev=i,s.next=i,i.prev=s,i}function t1(t,e,n,i){let r=new h0(t,e,n);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Cl(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ)}function h0(t,e,n){this.i=t,this.x=e,this.y=n,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function ZR(t,e,n,i){let r=0;for(let s=e,o=n-i;s<n;s+=i)r+=(t[o]-t[s])*(t[s+1]+t[o+1]),o=s;return r}var yl=class t{static area(e){let n=e.length,i=0;for(let r=n-1,s=0;s<n;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return t.area(e)<0}static triangulateShape(e,n){let i=[],r=[],s=[];n1(e),i1(i,e);let o=e.length;n.forEach(n1);for(let l=0;l<n.length;l++)r.push(o),o+=n[l].length,i1(i,n[l]);let a=kR.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function n1(t){let e=t.length;e>2&&t[e-1].equals(t[0])&&t.pop()}function i1(t,e){for(let n=0;n<e.length;n++)t.push(e[n].x),t.push(e[n].y)}var Pl=class t extends c0{constructor(e=1,n=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,n),this.type="OctahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new t(e.radius,e.detail)}};var mh=class t extends qt{constructor(e=new Tl([new ue(0,.5),new ue(-.5,-.5),new ue(.5,-.5)]),n=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:n};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new st(r,3)),this.setAttribute("normal",new st(s,3)),this.setAttribute("uv",new st(o,2));function c(u){let h=r.length/3,d=u.extractPoints(n),p=d.shape,m=d.holes;yl.isClockWise(p)===!1&&(p=p.reverse());for(let g=0,f=m.length;g<f;g++){let y=m[g];yl.isClockWise(y)===!0&&(m[g]=y.reverse())}let x=yl.triangulateShape(p,m);for(let g=0,f=m.length;g<f;g++){let y=m[g];p=p.concat(y)}for(let g=0,f=p.length;g<f;g++){let y=p[g];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let g=0,f=x.length;g<f;g++){let y=x[g],v=y[0]+h,M=y[1]+h,R=y[2]+h;i.push(v,M,R),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),n=this.parameters.shapes;return KR(n,e)}static fromJSON(e,n){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=n[e.shapes[r]];i.push(o)}return new t(i,e.curveSegments)}};function KR(t,e){if(e.shapes=[],Array.isArray(t))for(let n=0,i=t.length;n<i;n++){let r=t[n];e.shapes.push(r.uuid)}else e.shapes.push(t.uuid);return e}var Cn=class t extends qt{constructor(e=1,n=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,d=new P,p=[],m=[],x=[],g=[];for(let f=0;f<=i;f++){let y=[],v=f/i,M=0;f===0&&o===0?M=.5/n:f===i&&l===Math.PI&&(M=-.5/n);for(let R=0;R<=n;R++){let T=R/n;h.x=-e*Math.cos(r+T*s)*Math.sin(o+v*a),h.y=e*Math.cos(o+v*a),h.z=e*Math.sin(r+T*s)*Math.sin(o+v*a),m.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),g.push(T+M,1-v),y.push(c++)}u.push(y)}for(let f=0;f<i;f++)for(let y=0;y<n;y++){let v=u[f][y+1],M=u[f][y],R=u[f+1][y],T=u[f+1][y+1];(f!==0||o>0)&&p.push(v,M,T),(f!==i-1||l<Math.PI)&&p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new st(m,3)),this.setAttribute("normal",new st(x,3)),this.setAttribute("uv",new st(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ai=class extends es{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Pe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=y1,this.normalScale=new ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Ou(t,e,n){return!t||!n&&t.constructor===e?t:typeof e.BYTES_PER_ELEMENT=="number"?new e(t):Array.prototype.slice.call(t)}function JR(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}var ia=class{constructor(e,n,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let n=this.parameterPositions,i=this._cachedIndex,r=n[i],s=n[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=n[++i],e<r)break t}o=n.length;break n}if(!(e>=s)){let a=n[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=n[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<n[a]?o=a:i=a+1}if(r=n[i],s=n[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let n=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)n[o]=i[s+o];return n}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},f0=class extends ia{constructor(e,n,i,r){super(e,n,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:r_,endingEnd:r_}}intervalChanged_(e,n,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case s_:s=e,a=2*n-i;break;case o_:s=r.length-2,a=n+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case s_:o=e,l=2*i-n;break;case o_:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=n}let c=(i-n)*.5,u=this.valueSize;this._weightPrev=c/(n-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(i-n)/(r-n),x=m*m,g=x*m,f=-d*g+2*d*x-d*m,y=(1+d)*g+(-1.5-2*d)*x+(-.5+d)*m+1,v=(-1-p)*g+(1.5+p)*x+.5*m,M=p*g-p*x;for(let R=0;R!==a;++R)s[R]=f*o[u+R]+y*o[c+R]+v*o[l+R]+M*o[h+R];return s}},d0=class extends ia{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-n)/(r-n),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},p0=class extends ia{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},wi=class{constructor(e,n,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ou(n,this.TimeBufferType),this.values=Ou(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let n=e.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(e);else{i={name:e.name,times:Ou(e.times,Array),values:Ou(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new p0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new d0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new f0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let n;switch(e){case Xu:n=this.InterpolantFactoryMethodDiscrete;break;case Um:n=this.InterpolantFactoryMethodLinear;break;case vp:n=this.InterpolantFactoryMethodSmooth;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Xu;case this.InterpolantFactoryMethodLinear:return Um;case this.InterpolantFactoryMethodSmooth:return vp}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]+=e}return this}scale(e){if(e!==1){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]*=e}return this}trim(e,n){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>n;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&JR(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===vp,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,d=h-i,p=h+i;for(let m=0;m!==i;++m){let x=n[h+m];if(x!==n[d+m]||x!==n[p+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let p=0;p!==i;++p)n[d+p]=n[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)n[l+c]=n[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=n.slice(0,o*i)):(this.times=e,this.values=n),this}clone(){let e=this.times.slice(),n=this.values.slice(),i=this.constructor,r=new i(this.name,e,n);return r.createInterpolant=this.createInterpolant,r}};wi.prototype.TimeBufferType=Float32Array;wi.prototype.ValueBufferType=Float32Array;wi.prototype.DefaultInterpolation=Um;var Os=class extends wi{constructor(e,n,i){super(e,n,i)}};Os.prototype.ValueTypeName="bool";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=Xu;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;var m0=class extends wi{};m0.prototype.ValueTypeName="color";var g0=class extends wi{};g0.prototype.ValueTypeName="number";var v0=class extends ia{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-n)/(r-n),c=e*a;for(let u=c+a;c!==u;c+=4)Di.slerpFlat(s,0,o,c-a,o,c,l);return s}},gh=class extends wi{InterpolantFactoryMethodLinear(e){return new v0(this.times,this.values,this.getValueSize(),e)}};gh.prototype.ValueTypeName="quaternion";gh.prototype.InterpolantFactoryMethodSmooth=void 0;var Fs=class extends wi{constructor(e,n,i){super(e,n,i)}};Fs.prototype.ValueTypeName="string";Fs.prototype.ValueBufferType=Array;Fs.prototype.DefaultInterpolation=Xu;Fs.prototype.InterpolantFactoryMethodLinear=void 0;Fs.prototype.InterpolantFactoryMethodSmooth=void 0;var y0=class extends wi{};y0.prototype.ValueTypeName="vector";var x0=class{constructor(e,n,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let p=c[h],m=c[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null}}},QR=new x0,_0=class{constructor(e){this.manager=e!==void 0?e:QR,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){let i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};_0.DEFAULT_MATERIAL_NAME="__DEFAULT";var M0=class extends yn{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Pe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}};var Kp=new nt,r1=new P,s1=new P,S0=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ue(512,512),this.map=null,this.mapPass=null,this.matrix=new nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new _l,this._frameExtents=new ue(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let n=this.camera,i=this.matrix;r1.setFromMatrixPosition(e.matrixWorld),n.position.copy(r1),s1.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(s1),n.updateMatrixWorld(),Kp.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kp),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Kp)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var w0=class extends S0{constructor(){super(new rh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},vh=class extends M0{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(yn.DEFAULT_UP),this.updateMatrix(),this.target=new yn,this.shadow=new w0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var U0="\\[\\]\\.:\\/",eC=new RegExp("["+U0+"]","g"),z0="[^"+U0+"]",tC="[^"+U0.replace("\\.","")+"]",nC=/((?:WC+[\/:])*)/.source.replace("WC",z0),iC=/(WCOD+)?/.source.replace("WCOD",tC),rC=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",z0),sC=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",z0),oC=new RegExp("^"+nC+iC+rC+sC+"$"),aC=["material","materials","bones","map"],E0=class{constructor(e,n,i){let r=i||vt.parseTrackName(n);this._targetGroup=e,this._bindings=e.subscribe_(n,r)}getValue(e,n){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,n)}setValue(e,n){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,n)}bind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].bind()}unbind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].unbind()}},vt=class t{constructor(e,n,i){this.path=n,this.parsedPath=i||t.parseTrackName(n),this.node=t.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,n,i){return e&&e.isAnimationObjectGroup?new t.Composite(e,n,i):new t(e,n,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(eC,"")}static parseTrackName(e){let n=oC.exec(e);if(n===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);aC.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,n){if(n===void 0||n===""||n==="."||n===-1||n===e.name||n===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(n);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===n||a.uuid===n)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,n){e[n]=this.targetObject[this.propertyName]}_getValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[n++]=i[r]}_getValue_arrayElement(e,n){e[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,n){this.resolvedProperty.toArray(e,n)}_setValue_direct(e,n){this.targetObject[this.propertyName]=e[n]}_setValue_direct_setNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++]}_setValue_array_setNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,n){this.resolvedProperty[this.propertyIndex]=e[n]}_setValue_arrayElement_setNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,n){this.resolvedProperty.fromArray(e,n)}_setValue_fromArray_setNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,n){this.bind(),this.getValue(e,n)}_setValue_unbound(e,n){this.bind(),this.setValue(e,n)}bind(){let e=this.node,n=this.parsedPath,i=n.objectName,r=n.propertyName,s=n.propertyIndex;if(e||(e=t.findNode(this.rootNode,n.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=n.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};vt.Composite=E0;vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};vt.prototype.GetterByBindingType=[vt.prototype._getValue_direct,vt.prototype._getValue_array,vt.prototype._getValue_arrayElement,vt.prototype._getValue_toArray];vt.prototype.SetterByBindingTypeAndVersioning=[[vt.prototype._setValue_direct,vt.prototype._setValue_direct_setNeedsUpdate,vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_array,vt.prototype._setValue_array_setNeedsUpdate,vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_arrayElement,vt.prototype._setValue_arrayElement_setNeedsUpdate,vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_fromArray,vt.prototype._setValue_fromArray_setNeedsUpdate,vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var xP=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"169"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="169");var Ll=new P;function li(t,e,n,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;Ll.copy(e),Ll[i]=0,Ll.normalize();let c=.5*o/(o+a),u=1-Ll.angleTo(t)/l;return Math.sign(Ll[n])===1?u*c:a/(o+a)+c+c*(1-u)}var Pn=class extends zi{constructor(e=1,n=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,n/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,n,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,p=u.length/6,m=new P,x=.5/r;for(let g=0,f=0;g<u.length;g+=3,f+=2)switch(a.fromArray(u,g),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[g+0]=c.x*Math.sign(a.x)+l.x*s,u[g+1]=c.y*Math.sign(a.y)+l.y*s,u[g+2]=c.z*Math.sign(a.z)+l.z*s,h[g+0]=l.x,h[g+1]=l.y,h[g+2]=l.z,Math.floor(g/p)){case 0:m.set(1,0,0),d[f+0]=li(m,l,"z","y",s,i),d[f+1]=1-li(m,l,"y","z",s,n);break;case 1:m.set(-1,0,0),d[f+0]=1-li(m,l,"z","y",s,i),d[f+1]=1-li(m,l,"y","z",s,n);break;case 2:m.set(0,1,0),d[f+0]=1-li(m,l,"x","z",s,e),d[f+1]=li(m,l,"z","x",s,i);break;case 3:m.set(0,-1,0),d[f+0]=1-li(m,l,"x","z",s,e),d[f+1]=1-li(m,l,"z","x",s,i);break;case 4:m.set(0,0,1),d[f+0]=1-li(m,l,"x","y",s,e),d[f+1]=1-li(m,l,"y","x",s,n);break;case 5:m.set(0,0,-1),d[f+0]=li(m,l,"x","y",s,e),d[f+1]=1-li(m,l,"y","x",s,n);break}}};function O0(t,e=!1){let n=t[0].index!==null,i=new Set(Object.keys(t[0].attributes)),r=new Set(Object.keys(t[0].morphAttributes)),s={},o={},a=t[0].morphTargetsRelative,l=new qt,c=0;for(let u=0;u<t.length;++u){let h=t[u],d=0;if(n!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;s[p]===void 0&&(s[p]=[]),s[p].push(h.attributes[p]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!r.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.morphAttributes[p])}if(e){let p;if(n)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(n){let u=0,h=[];for(let d=0;d<t.length;++d){let p=t[d].index;for(let m=0;m<p.count;++m)h.push(p.getX(m)+u);u+=t[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=L1(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let p=[];for(let x=0;x<o[u].length;++x)p.push(o[u][x][d]);let m=L1(p);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function L1(t){let e,n,i,r=-1,s=0;for(let c=0;c<t.length;++c){let u=t[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(n===void 0&&(n=u.itemSize),n!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.count*n}let o=new e(s),a=new Rt(o,n,i),l=0;for(let c=0;c<t.length;++c){let u=t[c];if(u.isInterleavedBufferAttribute){let h=l/n;for(let d=0,p=u.count;d<p;d++)for(let m=0;m<n;m++){let x=u.getComponent(d,m);a.setComponent(d+h,m,x)}}else o.set(u.array,l);l+=u.count*n}return r!==void 0&&(a.gpuType=r),a}var Ei=.055,sa=.58,F0=.74,Nl=1.3,N1=.56,k1=.56,D1=2,U1=new P(-.55,.8,.32).normalize(),B0=34,sn={x:0,y:0,z:0,yaw:0};function mr(t,e,n){let i=document.createElement("canvas");i.width=t,i.height=e,n(i.getContext("2d"));let r=new El(i);return r.colorSpace=Wn,r.anisotropy=4,r}function cC(t,e){let n=t.hx+e,i=t.hz+e,r=t.hy+e,s=t.hy+t.rise+e,o=Math.min(r,s)-t.hy*2-e*2,a={nbl:[-n,o,i],nbr:[n,o,i],ntl:[-n,r,i],ntr:[n,r,i],fbl:[-n,o,-i],fbr:[n,o,-i],ftl:[-n,s,-i],ftr:[n,s,-i]},l=[[a.ntl,a.ntr,a.ftr,a.ftl],[a.nbl,a.nbr,a.ntr,a.ntl],[a.fbr,a.fbl,a.ftl,a.ftr],[a.fbl,a.nbl,a.ntl,a.ftl],[a.nbr,a.fbr,a.ftr,a.ntr],[a.fbl,a.fbr,a.nbr,a.nbl]],c=[];for(let[h,d,p,m]of l)c.push(...h,...d,...p,...h,...p,...m);let u=new qt;return u.setAttribute("position",new st(c,3)),u.setAttribute("uv",new st(new Array(c.length/3*2).fill(0),2)),u.computeVertexNormals(),u}function Sh(t,e){let n;if(t.shape==="cyl")t.look==="mochi"?(n=new Cn(1,28,14),n.scale(t.hx+e,.5+e,t.hx+e),n.translate(0,-t.hy,0)):n=new rn(t.hx+e,t.hx+e,(t.hy+e)*2,36);else if(t.shape==="ramp")n=cC(t,e);else{let i=Math.min(.2,t.hx*.9,t.hy*.9,t.hz*.9);n=new Pn((t.hx+e)*2,(t.hy+e)*2,(t.hz+e)*2,3,i+e)}return n.index?n.toNonIndexed():n}function z1(t,e,n=!1){let i=new Pe(e),r=t.getAttribute("position"),s=t.getAttribute("normal"),o=r.count,a=new Float32Array(o*3),l=new Float32Array(o*2);for(let c=0;c<o;c++)a[c*3]=i.r,a[c*3+1]=i.g,a[c*3+2]=i.b,n&&s.getY(c)>.5?(l[c*2]=r.getX(c)/(D1*2),l[c*2+1]=r.getZ(c)/(D1*2)):l[c*2]=l[c*2+1]=.25;t.setAttribute("color",new Rt(a,3)),t.setAttribute("uv",new Rt(l,2))}function O1(t,e,n){let i=new zi((t.hx-.12+n)*2,e+n,(t.hz-.12+n)*2,1,1,1).toNonIndexed(),r=i.getAttribute("position"),s=Math.min(.55,t.hx*.3,t.hz*.3);for(let o=0;o<r.count;o++)r.getY(o)>0||(r.setX(o,r.getX(o)-Math.sign(r.getX(o))*s),r.setZ(o,r.getZ(o)-Math.sign(r.getZ(o))*s));return i.translate(0,-t.hy-e/2,0),i.computeVertexNormals(),i}function uC(t,e,n){let i=s=>s.yaw||s.motion?Math.hypot(s.hx,s.shape==="cyl"?s.hx:s.hz)+(s.motion?6:0):0,r=i(e);for(let s of t.solids){if(s===e)continue;let o=i(s),a=o||s.hx,l=o||(s.shape==="cyl"?s.hx:s.hz);if(Math.abs(s.x-e.x)>(r||e.hx)+a||Math.abs(s.z-e.z)>(r||e.hz)+l)continue;let c=s.y+s.hy+Math.max(0,s.rise)+(s.motion?3:0),u=s.y-s.hy-(s.motion?3:0);if(c>e.y-e.hy-n-.2&&u<e.y-e.hy-.05)return!0}return!1}function F1(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=Math.imul(e^e>>>15,1|e);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}var hC=new P(0,1,0),Fi=new P,H0=new Di,V0=new P,fC=new nt,dC=new P,wh=class{constructor(e,n){this.level=n;this.scene=new Ml;this.camera=new vn(62,1,1.2,500);this.materials=new Map;this.ink=new Rn({color:Ot,side:Yt});this.sun=new vh(16774114,1.4);this.racerParts=null;this.size={width:1,height:1,dpr:1};this.economy=0;this.frameMs=16;this.frameAt=0;this.settled=0;this.movers=[];this.ballViews=[];this.windViews=[];this.belts=[];this.spinners=[];this.racers=new Map;this.disposables=[];this.camPos=new P;this.camLook=new P;this.camReady=!1;this.portrait=!0;this.shake=0;this.renderer=new oh({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.font=typeof getComputedStyle=="function"&&getComputedStyle(document.body).fontFamily||"sans-serif";let i=n.theme;this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=b0,this.scene.background=new Pe(i.fog),this.scene.fog=new ah(i.fog,70,210);let r=this.sun.shadow;r.mapSize.set(2048,2048),r.camera.left=r.camera.bottom=-B0,r.camera.right=r.camera.top=B0,r.camera.near=10,r.camera.far=170,r.bias=-4e-4,r.normalBias=.035,this.sun.castShadow=!0,this.scene.add(this.sun,this.sun.target),this.buildSky(),this.buildStatic(),this.buildMovers(),this.buildBalls(),this.buildWinds(),this.buildMarkers(),this.buildDecor(),this.buildClouds()}keep(e){return this.disposables.push(e),e}gloss(e,n={}){let i=e+(n.map?n.map.uuid:"")+(n.transparent?"t":""),r=this.materials.get(i);return r||(r=new ai({color:e,roughness:.32,metalness:0,map:n.map??null,transparent:!!n.transparent}),this.materials.set(i,r),this.keep(r)),r}decal(e){return this.keep(new ai({map:e,transparent:!0,depthWrite:!1,roughness:.6,metalness:0}))}solid(e){return e.castShadow=!0,e.receiveShadow=!0,e}buildSky(){let e=this.level.theme,n=new Pe(e.fog),i=new Pe(e.sky[0]),r=i.clone().offsetHSL(0,.35,-.2),s=new Pe(e.floorAlt).lerp(n,.35),o=(m,x)=>{let g=new Cn(m,32,24),f=g.getAttribute("position"),y=new Float32Array(f.count*3),v=new Pe;for(let M=0;M<f.count;M++){let R=f.getY(M)/m;R>=0?(R<.1?v.copy(n).lerp(i,R/.1):v.copy(i).lerp(r,Math.min(1,(R-.1)/.45)),x&&v.lerp(new Pe(1,1,1),.82)):(v.copy(n).lerp(s,Math.min(1,-R/.5)),x&&v.lerp(new Pe(1,1,1),.6).multiplyScalar(.9)),y[M*3]=v.r,y[M*3+1]=v.g,y[M*3+2]=v.b}return g.setAttribute("color",new Rt(y,3)),g},a=this.keep(new Rn({vertexColors:!0,side:Yt,fog:!1,depthWrite:!1}));this.sky=new be(this.keep(o(450,!1)),a),this.sky.renderOrder=-10,this.sky.frustumCulled=!1,this.scene.add(this.sky);let l=new ta(this.renderer),c=new Ml,u=o(20,!0);c.add(new be(u,a));let h=l.fromScene(c,.03);this.keep(h),this.scene.environment=h.texture,this.scene.environmentIntensity=.92,u.dispose(),l.dispose();let d=mr(128,128,m=>{let x=m.createRadialGradient(64,64,0,64,64,64);x.addColorStop(0,"rgba(255,255,255,1)"),x.addColorStop(.18,"rgba(255,250,225,0.9)"),x.addColorStop(.45,"rgba(255,244,205,0.28)"),x.addColorStop(1,"rgba(255,244,205,0)"),m.fillStyle=x,m.fillRect(0,0,128,128)});this.keep(d);let p=new na(this.keep(new Ds({map:d,transparent:!0,depthWrite:!1,fog:!1})));p.position.copy(U1).multiplyScalar(400),p.scale.setScalar(170),p.renderOrder=-9,this.sky.add(p)}buildClouds(){let e=F1(this.level.id.length*131+this.level.solids.length),n=this.level.finish.z,i=this.level.killY,r=[],s=(l,c,u,h)=>{let d=4+Math.floor(e()*4);for(let p=0;p<d;p++){let m=(p/(d-1)-.5)*h*2.6,x=h*(.62+e()*.5)*(1-Math.abs(p/(d-1)-.5)*.7);r.push(l+m,c+(e()-.35)*h*.5,u+(e()-.5)*h*1.3,x)}};for(let l=40;l>n-150;l-=13+e()*9)s((e()-.5)*150,i-5-e()*7,l,4+e()*5),s((e()<.5?-1:1)*(18+e()*70),i-3-e()*6,l-6,4+e()*6);for(let l=20;l>n-120;l-=24+e()*16)for(let c of[-1,1])s(c*(42+e()*60),-2+e()*26,l+e()*12,4.5+e()*5);for(let l=0;l<12;l++)s((e()-.5)*330,4+e()*55,n-95-e()*90,9+e()*10);let o=r.length/4,a=new ch(this.keep(new Cn(1,18,12)),this.keep(new ai({color:Ae,roughness:1,metalness:0,emissive:Ae,emissiveIntensity:.16})),o);for(let l=0;l<o;l++){let c=r[l*4+3];Fi.set(r[l*4],r[l*4+1],r[l*4+2]),a.setMatrixAt(l,fC.compose(Fi,H0.identity(),dC.set(c,c*.62,c)))}a.instanceMatrix.needsUpdate=!0,a.frustumCulled=!1,this.keep(a),this.scene.add(a)}buildStatic(){let e=[],n=[],i=new nt,r=new Pe;for(let o of this.level.solids){if(o.motion||o.active)continue;i.makeRotationY(o.yaw).setPosition(o.x,o.y,o.z);let a=Sh(o,0).applyMatrix4(i),l=o.look==="floor"||o.look==="finish";if(z1(a,o.color,l),e.push(a),n.push(Sh(o,Ei).applyMatrix4(i)),l&&o.shape==="box"&&Math.min(o.hx,o.hz)>=1.4){let c=Math.min(2.6,.9+Math.min(o.hx,o.hz)*.35);if(!uC(this.level,o,c)){let u=O1(o,c,0).applyMatrix4(i);z1(u,"#"+r.set(o.color).lerp(new Pe(this.level.theme.accent),.3).multiplyScalar(.84).getHexString()),e.push(u);let h=O1(o,c,Ei).applyMatrix4(i);h.setAttribute("uv",new Rt(new Float32Array(h.getAttribute("position").count*2),2)),n.push(h)}}this.dress(o,this.scene,o.x,o.y,o.z,o.yaw)}if(e.length){let o=mr(128,128,l=>{l.fillStyle="#ffffff",l.fillRect(0,0,128,128),l.fillStyle="#ebe8f3",l.fillRect(64,0,64,64),l.fillRect(0,64,64,64)});o.wrapS=o.wrapT=Ls,o.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),this.keep(o);let a=this.keep(new ai({vertexColors:!0,map:o,roughness:.46,metalness:0}));this.scene.add(this.solid(new be(this.keep(O0(e)),a))),this.scene.add(new be(this.keep(O0(n)),this.ink));for(let l of[...e,...n])l.dispose()}let s=new be(this.keep(new Us(420,40)),this.keep(new Rn({color:this.level.theme.fog})));s.rotation.x=-Math.PI/2,s.position.set(0,this.level.killY-6,-80),this.scene.add(s)}dress(e,n,i,r,s,o){let a=r+e.hy+.015,l=(c,u=0)=>(c.position.set(i,a,s),c.rotation.order="YXZ",c.rotation.set(-Math.PI/2,o+u,0),c.renderOrder=1,c.receiveShadow=!0,n.add(c),c);if(e.surface?.conveyor){let[c,u]=e.surface.conveyor,h=Math.hypot(c,u),d=Math.abs(c)>Math.abs(u),p=(d?e.hz:e.hx)*2-.5,m=(d?e.hx:e.hz)*2-.3,x=mr(64,64,f=>{f.strokeStyle="rgba(29,27,79,0.28)",f.lineWidth=9,f.lineCap="round",f.lineJoin="round",f.beginPath(),f.moveTo(14,44),f.lineTo(32,22),f.lineTo(50,44),f.stroke()});x.wrapS=x.wrapT=Ls,x.repeat.set(Math.max(1,Math.round(p/1.6)),Math.max(1,Math.round(m/1.6))),this.keep(x),this.belts.push({texture:x,speed:h*x.repeat.y/m});let g=new be(this.keep(new pr(p,m)),this.decal(x));l(g,Math.atan2(-c,-u))}else if(e.look==="drum"){let c=mr(128,128,u=>{u.fillStyle="#fff8ec",u.beginPath(),u.arc(64,64,60,0,Math.PI*2),u.fill(),u.strokeStyle=Ot,u.lineWidth=5,u.stroke(),u.fillStyle=e.color;for(let h=0;h<3;h++){let d=h/3*Math.PI*2;u.beginPath(),u.arc(64+Math.cos(d)*15,64+Math.sin(d)*15,13,0,Math.PI*2),u.fill()}});this.keep(c),l(new be(this.keep(new Us(e.hx*.92,32)),this.decal(c)))}else if(e.look==="disc"||e.look==="plate"&&e.hx>1.2){let c=e.look==="disc",u=mr(256,256,h=>{if(h.translate(128,128),c)for(let d=0;d<8;d++)h.fillStyle=d%2?"rgba(255,255,255,0.75)":"rgba(29,27,79,0.10)",h.beginPath(),h.moveTo(0,0),h.arc(0,0,120,d/8*Math.PI*2,(d+1)/8*Math.PI*2),h.fill();else h.strokeStyle=Et,h.lineWidth=14,h.beginPath(),h.arc(0,0,104,0,Math.PI*2),h.stroke(),h.strokeStyle="rgba(29,27,79,0.12)",h.lineWidth=4,h.beginPath(),h.arc(0,0,70,0,Math.PI*2),h.stroke()});this.keep(u),l(new be(this.keep(new Us(e.hx*.96,36)),this.decal(u)))}else if(e.look==="finish"){let c=mr(64,64,h=>{h.fillStyle=Ae,h.fillRect(0,0,64,64),h.fillStyle=Ot,h.fillRect(0,0,32,32),h.fillRect(32,32,32,32)});c.wrapS=c.wrapT=Ls,c.repeat.set(e.hx,1),c.magFilter=nn,this.keep(c);let u=new be(this.keep(new pr(e.hx*2-.4,1.6)),this.keep(new ai({map:c,roughness:.6,metalness:0})));u.position.set(i,a,s+e.hz-1.3),u.rotation.x=-Math.PI/2,u.receiveShadow=!0,n.add(u)}}buildMovers(){for(let e of this.level.solids){if(!e.motion&&!e.active)continue;let n=new Xn,i=!!e.active,r=i?this.keep(new ai({color:e.color,roughness:.42,metalness:0,transparent:!0})):this.gloss(e.color),s=this.solid(new be(this.keep(Sh(e,0)),r)),o=new be(this.keep(Sh(e,Ei)),this.ink);n.add(s,o),this.dress(e,n,0,0,0,0),n.position.set(e.x,e.y,e.z),n.rotation.y=e.yaw,this.scene.add(n),this.movers.push({solid:e,group:n,body:s,outline:o,timed:i})}}buildBalls(){for(let e of this.level.balls){let n=new Xn,i;e.look==="mochi"&&(i=mr(256,128,l=>{l.fillStyle=e.color,l.fillRect(0,0,256,128),l.fillStyle=Ot;for(let c of[108,148])l.beginPath(),l.arc(c,58,5,0,Math.PI*2),l.fill();l.strokeStyle=Ot,l.lineWidth=3,l.beginPath(),l.arc(128,62,8,.15*Math.PI,.85*Math.PI),l.stroke(),l.fillStyle="rgba(255,122,182,0.45)";for(let c of[94,162])l.beginPath(),l.arc(c,68,7,0,Math.PI*2),l.fill()}),this.keep(i));let r=this.keep(new Cn(e.r,28,18)),s=this.solid(new be(r,i?this.gloss("#ffffff",{map:i}):this.gloss(e.color))),o=new be(this.keep(new Cn(e.r+Ei,20,14)),this.ink);n.add(s,o);let a;if(e.look==="lantern"&&e.anchor){s.scale.set(1,1.12,1),o.scale.set(1,1.12,1);for(let c of[e.r*1.05,-e.r*1.05]){let u=new be(this.keep(new rn(e.r*.45,e.r*.45,.22,16)),this.gloss(Ot));u.position.y=c,s.add(u)}a=new be(this.keep(new rn(.05,.05,1,6)),this.keep(new Rn({color:Ot}))),this.scene.add(a);let l=new be(this.keep(new zi(11,.35,.35)),this.gloss(this.level.theme.accent));l.position.set(e.anchor.x,e.anchor.y,e.anchor.z),this.scene.add(l)}this.scene.add(n),this.ballViews.push({ball:e,group:n,mesh:s,rope:a,last:new P(NaN,0,0)})}}buildWinds(){let e=F1(7);for(let n of this.level.winds){let i=this.keep(new Rn({color:Ae,transparent:!0,opacity:.7,depthWrite:!1,side:si})),r=this.keep(new pr(1.5,.09)),s=Math.max(8,Math.min(26,Math.round((n.x1-n.x0)*(n.z1-n.z0)/7))),o=[],a=[],l=Math.atan2(-n.az,n.ax);for(let c=0;c<s;c++){let u=new be(r,i);u.rotation.order="YXZ",u.rotation.set(-Math.PI/2,l,0),a.push(e(),e(),e()),this.scene.add(u),o.push(u)}this.windViews.push({zone:n,streaks:o,seeds:a,material:i})}}buildMarkers(){let e=this.level.theme,n=this.keep(new rn(.09,.09,2.6,8)),i=new Tl;i.moveTo(0,0),i.lineTo(1.1,-.38),i.lineTo(0,-.76);let r=this.keep(new mh(i));this.level.checkpoints.forEach((p,m)=>{if(m!==0)for(let x of[-1,1]){let g=p.x+x*(p.width/2+1.1),f=new be(n,this.gloss(Ot));f.position.set(g,p.y+1.3,p.z);let y=new be(r,this.keep(new Rn({color:x<0?e.accent:e.accent2,side:si})));y.position.set(g,p.y+2.55,p.z),x>0&&(y.scale.x=-1),this.scene.add(f,y)}});let s=this.level.finish,o=s.z+s.hz+1,a=this.keep(new rn(.28,.28,5,14)),l=this.keep(new rn(.28+Ei,.28+Ei,5+Ei*2,14));for(let p of[-1,1]){let m=new be(a,this.gloss(e.accent));m.position.set(s.x+p*(s.hx-.2),s.y+2.5,o),m.add(new be(l,this.ink)),this.scene.add(m)}let c=mr(1024,192,p=>{p.fillStyle=pt,p.fillRect(0,0,1024,192),p.fillStyle=Ot,p.font=`900 130px ${this.font}`,p.textAlign="center",p.textBaseline="middle",p.fillText("GOAL!  \u30B4\u30FC\u30EB!",512,104)});this.keep(c);let u=s.hx*2,h=new be(this.keep(new Pn(u,u*.1875,.3,2,.1)),this.gloss(pt));h.position.set(s.x,s.y+5.2,o),h.add(new be(this.keep(new Pn(u+Ei*2,u*.1875+Ei*2,.3+Ei*2,2,.1)),this.ink));let d=new be(this.keep(new pr(u-.2,u*.1875-.2)),this.keep(new Rn({map:c})));d.position.z=.16,h.add(d),this.scene.add(h)}buildDecor(){let e=(i,r,s)=>{let o=new be(this.keep(i),this.gloss(r));return o.add(new be(this.keep(s),this.ink)),o},n=this.keep(new ai({color:Ae,roughness:1,metalness:0,emissive:Ae,emissiveIntensity:.16}));for(let i of this.level.decor){let r=new Xn;r.position.set(i.x,i.y,i.z),r.scale.setScalar(i.s);let s=0,o=0;if(i.kind==="cloud"){for(let[a,l,c]of[[-.9,0,.75],[0,.25,1],[.95,0,.7]]){let u=new be(this.keep(new Cn(c,18,12)),n);u.position.set(a,l,0),u.scale.y=.72,r.add(u)}o=.25}else if(i.kind==="lantern"){let a=e(new Cn(.7,16,12),i.color,new Cn(.76,14,10));a.scale.y=1.15,r.add(a);for(let l of[.78,-.78]){let c=new be(this.keep(new rn(.32,.32,.2,12)),this.gloss(Ot));c.position.y=l,r.add(c)}o=.18}else if(i.kind==="sushi"){let a=e(new rn(1.1,.9,.22,24),Ae,new rn(1.16,.96,.3,20)),l=e(new Pn(1.2,.5,.7,3,.2),Ae,new Pn(1.3,.6,.8,2,.24));l.position.y=.36;let c=e(new Pn(1.4,.28,.8,3,.12),i.color,new Pn(1.5,.38,.9,2,.16));c.position.y=.68,r.add(a,l,c),s=.5,o=.2}else if(i.kind==="pinwheel"){let a=new be(this.keep(new rn(.07,.07,3,8)),this.gloss(Ot));a.position.y=-1.5;let l=new Xn;for(let c=0;c<4;c++){let u=e(new ts(.42,1.1,3),c%2?i.color:Ae,new ts(.5,1.22,3));u.rotation.z=c/4*Math.PI*2,u.position.set(Math.cos(c/4*Math.PI*2+Math.PI/2)*.55,Math.sin(c/4*Math.PI*2+Math.PI/2)*.55,0),l.add(u)}r.add(a,l),this.spinners.push({obj:l,speed:-3,bob:0,baseY:0}),r.userData.axis="z"}else if(i.kind==="torii"){for(let c of[-4.2,4.2]){let u=e(new rn(.3,.34,4.6,12),i.color,new rn(.36,.4,4.7,12));u.position.set(c,2.3,0),r.add(u)}let a=e(new Pn(11,.5,.6,2,.12),i.color,new Pn(11.1,.6,.7,2,.14));a.position.y=4.7;let l=e(new Pn(9.2,.36,.45,2,.1),i.color,new Pn(9.3,.46,.55,2,.12));l.position.y=3.8,r.add(a,l)}else if(i.kind==="plane"){let a=e(new ts(.5,1.6,3),Ae,new ts(.58,1.75,3));a.rotation.set(Math.PI/2,0,Math.PI),a.scale.z=.35;let l=new be(this.keep(new ts(.2,1.5,3)),this.gloss(i.color));l.rotation.set(Math.PI/2,0,0),l.position.y=-.12,r.add(a,l),r.rotation.y=i.x>0?Math.PI/2:-Math.PI/2,o=.3}else i.kind==="star"&&(r.add(e(new Pl(.7),i.color,new Pl(.8))),s=1.2,o=.3);this.scene.add(r),(s||o)&&this.spinners.push({obj:r,speed:s,bob:o,baseY:i.y})}}addRacer(e,n,i,r){if(this.racers.has(e))return;let s=Qa(n),o=this.racerParts??={foot:this.keep(new Cn(.17,14,10)),hand:this.keep(new Cn(.125,12,8)),handHull:this.keep(new Cn(.125+Ei*.8,10,8)),shoe:this.keep(new ai({color:Ot,roughness:.5,metalness:0})),glove:this.keep(new ai({color:Ae,roughness:.35,metalness:0})),unseen:this.keep(new Rn({colorWrite:!1,depthWrite:!1}))},a=new Xn,l=new Xn;l.position.y=sa;let c=[-1,1].map(T=>{let E=new be(o.hand,o.glove);return E.castShadow=!0,E.position.set(T*N1,k1-sa,0),E.add(new be(o.handHull,this.ink)),l.add(E),E}),u=[-1,1].map(T=>{let E=new be(o.foot,o.shoe);return E.castShadow=!0,E.scale.set(1,.62,1.45),E.position.set(T*.2,.1,-.04),a.add(E),E}),h=new be(o.foot,o.unseen);h.castShadow=!0,h.scale.set(3,3,1.6),h.position.y=F0-sa,l.add(h),a.add(l),a.visible=!1;let d=document.createElement("canvas");d.width=d.height=256;let p=d.getContext("2d"),m=new El(d);m.colorSpace=Wn,this.keep(m);let x=T=>{if(p.clearRect(0,0,256,256),T){p.save(),p.shadowColor=Ae,p.shadowBlur=0;for(let[E,A]of[[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]])p.shadowOffsetX=E,p.shadowOffsetY=A,p.drawImage(T,14,14,228,228);p.restore(),p.drawImage(T,14,14,228,228)}else p.fillStyle=s.color,p.strokeStyle=Ot,p.lineWidth=9,p.beginPath(),p.arc(128,128,100,0,Math.PI*2),p.fill(),p.stroke();m.needsUpdate=!0};x();let g=new Image;g.onload=()=>x(g),g.src=su(n);let f=new na(this.keep(new Ds({map:m,transparent:!0,alphaTest:.08})));f.scale.setScalar(Nl),f.visible=!1;let y=r?"\u25BC":i,v=mr(384,96,T=>{if(T.font=`900 ${r?64:44}px ${this.font}`,T.textAlign="center",T.textBaseline="middle",r)T.lineWidth=12,T.lineJoin="round",T.strokeStyle=Ot,T.strokeText(y,192,50),T.fillStyle=pt,T.fillText(y,192,50);else{let E=y.length>10?y.slice(0,9)+"\u2026":y,A=Math.min(360,T.measureText(E).width+44);T.fillStyle=Ae,T.strokeStyle=Ot,T.lineWidth=6,T.beginPath(),T.roundRect(192-A/2,16,A,64,32),T.fill(),T.stroke(),T.fillStyle=Ot,T.fillText(E,192,50)}});this.keep(v);let M=new na(this.keep(new Ds({map:v,transparent:!0,depthWrite:!1})));M.scale.set(r?1.5:2.2,r?.375:.55,1),M.visible=!1,M.renderOrder=5;let R=new be(this.keep(new Us(.5,20)),this.keep(new Rn({color:Ot,transparent:!0,opacity:.2,depthWrite:!1})));R.rotation.x=-Math.PI/2,R.visible=!1,R.renderOrder=2,this.scene.add(a,f,M,R),this.racers.set(e,{root:a,lean:l,feet:u,hands:c,head:f,tag:M,shadow:R,me:r,phase:Math.random()*6,spin:0,yaw:0,lastX:0,lastY:0,lastZ:0,seen:!1})}removeRacer(e){let n=this.racers.get(e);n&&(this.scene.remove(n.root,n.head,n.tag,n.shadow),this.racers.delete(e))}placeRacer(e,n,i,r,s,o,a,l,c){let u=this.racers.get(e);if(!u)return;if(s===3){u.root.visible=u.head.visible=u.tag.visible=u.shadow.visible=!1,u.seen=!1;return}let h=u.seen&&c>0?(n-u.lastX)/c:0,d=u.seen&&c>0?(i-u.lastY)/c:0,p=u.seen&&c>0?(r-u.lastZ)/c:0,m=!u.seen;u.lastX=n,u.lastY=i,u.lastZ=r,u.seen=!0;let x=Math.hypot(h,p);if(m)u.yaw=0;else if(x>1){let A=Math.atan2(-h,-p)-u.yaw;A-=Math.round(A/(Math.PI*2))*Math.PI*2,u.yaw+=A*(1-Math.exp(-c*12))}let g=0,f=0,y=0,v=1,M=0,R=0,T=0;s===2?(u.spin+=c*13,g=-u.spin,y=.25,R=.3):s===1?(u.spin=0,g=-.5,v=.68,y=o?-.2:-.05,R=1):o?(u.spin=0,x>.6?(u.phase+=c*(6+x*1.3),M=Math.sin(u.phase),f=Math.sin(u.phase)*.09,y=Math.abs(Math.cos(u.phase))*.07):(u.phase+=c*2.4,v=1+Math.sin(u.phase)*.025)):(u.spin=0,v=1+Math.max(-.12,Math.min(.16,d*.014)),R=.75,T=.45,M=Math.sin(u.phase)*.4),u.root.position.set(n,i,r),u.root.rotation.y=u.yaw,u.lean.position.y=sa+y,u.lean.rotation.set(g,0,f),u.feet.forEach((A,L)=>{let _=L?1:-1,S=M*_;s===1?(A.position.set(_*.2,.14+y*.5,.42),A.rotation.x=1.2):(A.position.set(_*.2,.1+Math.max(0,-S)*.13+T*.2,-.04-S*.24+T*.12),A.rotation.x=S*.5+T*.9),A.visible=s!==2}),u.hands.forEach((A,L)=>{let _=L?1:-1,S=-M*_;A.position.set(_*(N1+R*.04),k1-sa+R*.26,-S*.22-R*.16)}),u.root.visible=!0,Fi.set(0,F0-sa,0),u.lean.updateWorldMatrix(!0,!1),Fi.applyMatrix4(u.lean.matrixWorld),u.head.position.copy(Fi),u.head.position.y-=(1-v)*Nl*.4,u.head.scale.set(Nl/Math.sqrt(v),Nl*v,1),u.head.material.rotation=s===2?u.spin:f*.8,u.head.visible=!0,u.head.material.opacity=a>.3&&Math.floor(l*12)%2===0?.45:1,u.tag.position.set(n,i+F0+Nl*.6+y+(u.me?.1+Math.sin(l*5)*.08:.12),r),u.tag.visible=!0;let E=up(this.level,n,i,r,l);if(E>-1/0){let A=Math.max(0,i-E),L=Math.max(.35,1-A*.12);u.shadow.position.set(n,E+.03,r),u.shadow.scale.setScalar(L),u.shadow.material.opacity=.2*L,u.shadow.visible=!0}else u.shadow.visible=!1}bump(e=.35){this.shake=Math.max(this.shake,e)}resize(e,n,i){this.size={width:e,height:n,dpr:i},this.renderer.setPixelRatio(Math.min(this.economy?1.25:2,i)),this.renderer.setSize(e,n,!1),this.portrait=n>e,this.camera.aspect=e/Math.max(1,n),this.camera.fov=this.portrait?72:58,this.camera.updateProjectionMatrix()}render(e,n,i,r){for(let m of this.movers){let x=m.solid;if(tr(x,e,sn),m.group.position.set(sn.x,sn.y,sn.z),m.group.rotation.y=sn.yaw,m.timed){let g=x.active(e),f=m.body.material;m.outline.visible=g!==0,m.body.castShadow=g!==0,f.opacity=g===0?.13:g===1&&Math.floor(e*9)%2===0?.5:1,f.depthWrite=g!==0,m.group.position.y=sn.y-(g===0?.25:0)}}for(let m of this.ballViews){let x=m.ball,g=!x.active||x.active(e);if(m.group.visible=g,m.rope&&(m.rope.visible=g),!!g){if(x.pos(e,sn),Fi.set(sn.x,sn.y,sn.z),x.look!=="lantern"){if(!Number.isNaN(m.last.x)){let f=Fi.x-m.last.x,y=Fi.z-m.last.z,v=Math.hypot(f,y);v>1e-5&&v<2&&(V0.set(y/v,0,-f/v),H0.setFromAxisAngle(V0,v/x.r),m.mesh.quaternion.premultiply(H0))}}else if(x.anchor&&m.rope){let f=x.anchor.x-sn.x,y=x.anchor.y-sn.y,v=Math.hypot(f,y);m.rope.position.set((x.anchor.x+sn.x)/2,(x.anchor.y+sn.y)/2,sn.z),m.rope.scale.set(1,v,1),m.rope.quaternion.setFromUnitVectors(hC,V0.set(f/v,y/v,0)),m.group.rotation.z=sn.yaw}m.last.copy(Fi),m.group.position.copy(Fi)}}for(let m of this.windViews){let x=m.zone,g=x.pulse?x.pulse(e):1;m.material.opacity=.75*g;let f=x.x1-x.x0,y=x.z1-x.z0,v=Math.hypot(x.ax,x.az)*1.6,M=x.ax/(Math.hypot(x.ax,x.az)||1),R=x.az/(Math.hypot(x.ax,x.az)||1);m.streaks.forEach((T,E)=>{let A=m.seeds[E*3],L=m.seeds[E*3+1],_=m.seeds[E*3+2],S=e*v*(.7+_*.6),U=x.x0+((A*f+M*S)%f+f)%f,z=x.z0+((L*y+R*S)%y+y)%y,H=up(this.level,U,50,z,e);T.position.set(U,(H>-1/0?H:x.y0+2)+.35+_*1.7,z),T.visible=g>.05})}for(let m of this.belts)m.texture.offset.y=m.speed*e%1;for(let m of this.spinners)m.speed&&(m.obj.parent?.userData.axis==="z"?m.obj.rotation.z=e*m.speed:m.obj.rotation.y=e*m.speed),m.bob&&(m.obj.position.y=m.baseY+Math.sin(e*.9+m.obj.position.z)*m.bob);let s=this.portrait?9.6:8.6,o=this.portrait?5.5:4.6,a=r*r*(3-2*r)*Math.PI,l=i.x*.82+Math.sin(a)*s,c=i.z+Math.cos(a)*s,u=i.y+o-r*2.2;this.camReady||(this.camPos.set(l,u,c),this.camLook.set(i.x*.9,i.y+1,i.z-3.5),this.camReady=!0);let h=1-Math.exp(-n*9),d=1-Math.exp(-n*3.2);this.camPos.x+=(l-this.camPos.x)*h,this.camPos.z+=(c-this.camPos.z)*h,this.camPos.y+=(u-this.camPos.y)*d;let p=4.5*(1-r);this.camLook.x+=(i.x*.9-this.camLook.x)*h,this.camLook.z+=(i.z-p-this.camLook.z)*h,this.camLook.y+=(i.y+1-this.camLook.y)*d,this.camera.position.copy(this.camPos),this.shake>.001&&(this.camera.position.x+=Math.sin(e*71)*this.shake,this.camera.position.y+=Math.cos(e*83)*this.shake*.7,this.shake*=Math.exp(-n*9)),this.camera.lookAt(this.camLook),this.sky.position.copy(this.camera.position),this.sun.target.position.set(i.x*.6,i.y,i.z-B0*.45),this.sun.position.copy(this.sun.target.position).addScaledVector(U1,80),this.sun.target.updateMatrixWorld(),this.renderer.render(this.scene,this.camera),this.pace()}pace(){let e=performance.now(),n=e-this.frameAt;this.frameAt=e,!(this.economy>=2||n<=0||n>100)&&(this.frameMs+=(n-this.frameMs)*.05,!(++this.settled<150)&&(this.frameMs<27||(this.economy++,this.settled=0,this.frameMs=16,this.economy===1?this.resize(this.size.width,this.size.height,this.size.dpr):this.sun.castShadow=!1)))}cut(){this.camReady=!1}dispose(){for(let e of this.disposables)e.dispose();this.ink.dispose(),this.sun.shadow.dispose(),this.renderer.dispose()}};var Bi=null,pC=!1;function Eh(){try{if(!Bi){let t=window.AudioContext??window.webkitAudioContext;if(!t)return;Bi=new t}Bi.state==="suspended"&&Bi.resume()}catch{}}function Yn(t,e,n,i,r,s=0){if(!Bi||pC||Bi.state!=="running")return;let o=Bi.currentTime+s,a=Bi.createOscillator(),l=Bi.createGain();a.type=i,a.frequency.setValueAtTime(t,o),a.frequency.exponentialRampToValueAtTime(Math.max(30,e),o+n),l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(r,o+.012),l.gain.exponentialRampToValueAtTime(1e-4,o+n),a.connect(l).connect(Bi.destination),a.start(o),a.stop(o+n+.03)}var bi={jump:()=>Yn(330,620,.16,"square",.05),dive:()=>Yn(520,260,.2,"sawtooth",.04),land:()=>Yn(160,90,.08,"sine",.08),bounce:()=>{Yn(180,90,.22,"sine",.16),Yn(420,880,.2,"triangle",.06)},hit:()=>{Yn(240,70,.26,"sawtooth",.08),Yn(90,50,.2,"square",.06)},fall:()=>Yn(700,110,.5,"triangle",.07),checkpoint:()=>{Yn(660,660,.09,"triangle",.07),Yn(990,990,.16,"triangle",.07,.09)},finish:()=>[523,659,784,1047].forEach((t,e)=>Yn(t,t,.22,"triangle",.09,e*.11)),count:()=>Yn(440,440,.14,"square",.05),go:()=>Yn(880,880,.4,"square",.06)};var mC=.42,bh=t=>Math.round(t*100)/100,Th=class{constructor(e){this.opts=e;this.input={mx:0,mz:0,jump:!1,dive:!1};this.me=null;this.prev={x:0,y:0,z:0};this.simT=0;this.raf=0;this.last=0;this.lastSend=0;this.lastHud=0;this.lastCount=99;this.finishedAt=-1;this.remote=new Map;this.slots=new Map;this.keys=new Set;this.stick={x:0,y:0};this.disposed=!1;this.focus={x:0,y:0,z:0};this.scratch={x:0,y:0,z:0};this.onKeyDown=e=>{if(e.repeat)return;let n=e.target?.tagName;n==="INPUT"||n==="TEXTAREA"||(this.keys.add(e.code),(e.code==="Space"||e.code.startsWith("Arrow"))&&e.preventDefault())};this.onKeyUp=e=>this.keys.delete(e.code);this.onBlur=()=>{this.keys.clear(),this.stick.x=this.stick.y=0};this.frame=e=>{if(this.disposed)return;this.raf=requestAnimationFrame(this.frame);let n=Math.min(.1,Math.max(0,(e-this.last)/1e3));this.last=e;let i=this.opts.raceTime(),r=this.level,s=this.me,o=i<0?Math.ceil(-i):0;if(o!==this.lastCount&&(o>=1&&o<=3?bi.count():o===0&&this.lastCount===1&&bi.go(),this.lastCount=o),s){if(this.readInput(),i<=0)this.simT=0;else{i-this.simT>.5&&(this.simT=i-_o);let y=0;for(;this.simT+_o<=i&&y<8;){this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z,Yx(r,s,this.input,this.simT,_o),this.simT+=_o,y++;let v=s.events;v&&(v&1&&bi.jump(),v&128&&bi.dive(),v&2&&bi.land(),v&16&&bi.bounce(),v&32&&bi.checkpoint(),v&4&&(bi.hit(),this.scene.bump(.3),navigator.userActivation?.hasBeenActive&&navigator.vibrate?.(40)),v&8&&bi.fall(),v&64&&this.finishedAt<0&&(this.finishedAt=this.simT,bi.finish(),this.opts.onFinish?.(this.simT))),s.mode===0&&Math.abs(s.z-this.prev.z)+Math.abs(s.x-this.prev.x)>3&&(this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z)}}let m=i<=0?1:Math.max(0,Math.min(1,(i-this.simT)/_o)),x=this.prev.x+(s.x-this.prev.x)*m,g=this.prev.y+(s.y-this.prev.y)*m,f=this.prev.z+(s.z-this.prev.z)*m;this.scene.placeRacer(this.opts.meId,x,g,f,s.mode,s.grounded,s.shield,i,n),s.mode!==3&&(this.focus.x=x,this.focus.y=g,this.focus.z=f),i>0&&e-this.lastSend>=(this.opts.sendEvery??200)&&(this.finishedAt<0||this.simT-this.finishedAt<2)&&(this.lastSend=e,this.opts.onSend?.({x:bh(s.x),y:bh(s.y),z:bh(s.z),m:s.mode,g:s.grounded,p:s.mode===4?1:Math.round(hp(r,s.x,s.y,s.z)*1e3)/1e3,rt:bh(this.simT)}))}let a=i-mC,l={},c=null,u=-1;for(let m of this.opts.racers){if(m.id===this.opts.meId&&s){l[m.id]=s.mode===4?1:hp(r,s.x,s.y,s.z);continue}let x=this.remote.get(m.id);if(!x||x.length===0||i<=0){Mo(r,0,this.slots.get(m.id)??0,this.opts.racers.length,this.scratch),this.scene.placeRacer(m.id,this.scratch.x,this.scratch.y,this.scratch.z,0,!0,0,i,n),l[m.id]=0;continue}let g=x.length-1;for(;g>0&&x[g-1].rt>a;)g--;let f=x[g],y=g>0?x[g-1]:f,v=f.rt>y.rt?(a-y.rt)/(f.rt-y.rt):1;v=Math.max(0,Math.min(1,v)),(Math.abs(f.z-y.z)+Math.abs(f.x-y.x)>9||y.m===3)&&(v=v<.5?0:1);let R=y.x+(f.x-y.x)*v,T=y.y+(f.y-y.y)*v,E=y.z+(f.z-y.z)*v,A=x[x.length-1];this.scene.placeRacer(m.id,R,T,E,v<.5?y.m:f.m,v<.5?y.g:f.g,0,i,n),l[m.id]=A.p,A.m!==4&&A.p>u&&(u=A.p,c=m.id,this.scratch.x=R,this.scratch.y=T,this.scratch.z=E)}let h=null,d=!!s&&s.mode===4&&this.simT-this.finishedAt>2.5;(!s||d)&&c?(h=c,this.focus.x=this.scratch.x,this.focus.y=this.scratch.y,this.focus.z=this.scratch.z):!s&&!c&&Mo(r,0,0,1,this.focus);let p=i<0?Math.max(0,Math.min(1,-i/2.6)):0;if(this.scene.render(i,n,this.focus,p),this.opts.onHud&&e-this.lastHud>120){this.lastHud=e;let m=this.opts.meId?l[this.opts.meId]??0:0,x=1;for(let g of this.opts.racers)g.id!==this.opts.meId&&(l[g.id]??0)>m&&x++;this.opts.onHud({t:i,place:x,racing:this.opts.racers.length,progress:l,finished:!!s&&s.mode===4,checkpoint:s?.checkpoint??0,falls:s?.falls??0,watching:h})}};this.level=cu(e.levelIndex),this.scene=new wh(e.canvas,this.level),e.racers.forEach((n,i)=>{this.slots.set(n.id,i),this.scene.addRacer(n.id,n.avatar,n.name,n.id===e.meId)}),e.meId&&this.slots.has(e.meId)&&(this.me=Xx(this.level,this.slots.get(e.meId),e.racers.length),e.startCheckpoint&&(this.me.checkpoint=Math.max(0,Math.min(this.level.checkpoints.length-1,e.startCheckpoint)),Mo(this.level,this.me.checkpoint,this.me.slot,this.me.slots,this.me)),this.prev.x=this.me.x,this.prev.y=this.me.y,this.prev.z=this.me.z),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),window.addEventListener("blur",this.onBlur),this.resize(),this.last=performance.now(),this.raf=requestAnimationFrame(this.frame)}resize(){let e=this.opts.canvas,n=e.clientWidth||window.innerWidth,i=e.clientHeight||window.innerHeight;this.scene.resize(n,i,window.devicePixelRatio||1)}setStick(e,n){this.stick.x=e,this.stick.y=n}press(e,n){this.keys[n?"add":"delete"](e==="jump"?"Touch:jump":"Touch:dive")}setRemote(e,n){if(e===this.opts.meId)return;let i=this.remote.get(e);i||this.remote.set(e,i=[]);let r=i[i.length-1];r&&n.rt<=r.rt||(i.push(n),i.length>8&&i.shift())}readInput(){let e=this.keys,n=this.stick.x,i=this.stick.y;(e.has("ArrowLeft")||e.has("KeyA"))&&(n-=1),(e.has("ArrowRight")||e.has("KeyD"))&&(n+=1),(e.has("ArrowUp")||e.has("KeyW"))&&(i-=1),(e.has("ArrowDown")||e.has("KeyS"))&&(i+=1);let r=Math.hypot(n,i);r>1&&(n/=r,i/=r),this.input.mx=n,this.input.mz=i,this.input.jump=e.has("Space")||e.has("Touch:jump"),this.input.dive=e.has("ShiftLeft")||e.has("ShiftRight")||e.has("KeyE")||e.has("Touch:dive")}dispose(){this.disposed=!0,cancelAnimationFrame(this.raf),window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),window.removeEventListener("blur",this.onBlur),this.scene.dispose()}};var Fe=ln(Fn()),B1="enchatto_dash_cp_";function gC(t){if(!t)return 0;try{return Number(sessionStorage.getItem(B1+t)??0)||0}catch{return 0}}var vC={t:-99,place:1,racing:1,progress:{},finished:!1,checkpoint:0,falls:0,watching:null};function G0(t){let{levelIndex:e,racers:n,meId:i,coarse:r,lang:s}=t,o=tl(s),a=(0,on.useRef)(null),l=(0,on.useRef)(null),c=(0,on.useRef)(null),u=(0,on.useRef)(null),h=(0,on.useRef)(t);h.current=t;let[d,p]=(0,on.useState)(()=>({...vC,t:t.raceTime()})),[m,x]=(0,on.useState)(!1),[g,f]=(0,on.useState)({}),y=n.map(G=>G.id).join(","),v=(0,on.useMemo)(()=>cu(e),[e]);(0,on.useEffect)(()=>{let G=a.current;if(!G)return;let F,ee=gC(h.current.resumeKey);try{F=new Th({canvas:G,levelIndex:e,racers:h.current.racers,meId:i,raceTime:()=>h.current.raceTime(),onSend:Ee=>h.current.onSend?.(Ee),onFinish:Ee=>h.current.onFinish?.(Ee),onHud:Ee=>{p(Ee);let Be=h.current.resumeKey;if(Be&&Ee.checkpoint>ee){ee=Ee.checkpoint;try{sessionStorage.setItem(B1+Be,String(ee))}catch{}}},sendEvery:h.current.sendEvery,startCheckpoint:Math.max(h.current.startCheckpoint??0,ee)})}catch(Ee){console.error("Chatto Dash could not start:",Ee),x(!0);return}l.current=F,h.current.onGame?.(F);let ne=()=>F.resize();window.addEventListener("resize",ne);let re=typeof ResizeObserver=="function"?new ResizeObserver(ne):null;return re?.observe(G),()=>{window.removeEventListener("resize",ne),re?.disconnect(),h.current.onGame?.(null),l.current=null,F.dispose()}},[e,i,y]);let M=(0,on.useRef)(null),R=(0,on.useRef)({x:0,y:0}),T=G=>{Eh(),!(M.current!==null||!i)&&(M.current=G.pointerId,R.current={x:G.clientX,y:G.clientY},G.currentTarget.setPointerCapture?.(G.pointerId),c.current&&(c.current.style.display="block",c.current.style.left=`${G.clientX}px`,c.current.style.top=`${G.clientY}px`),u.current&&(u.current.style.transform=""))},E=G=>{if(G.pointerId!==M.current)return;let F=46,ee=(G.clientX-R.current.x)/F,ne=(G.clientY-R.current.y)/F,re=Math.hypot(ee,ne);re>1&&(ee/=re,ne/=re);let Ee=re<.14;l.current?.setStick(Ee?0:ee,Ee?0:ne),u.current&&(u.current.style.transform=`translate(${ee*F}px, ${ne*F}px)`)},A=G=>{G.pointerId===M.current&&(M.current=null,l.current?.setStick(0,0),c.current&&(c.current.style.display="none"))},L=G=>({onPointerDown:F=>{F.preventDefault(),Eh(),F.currentTarget.setPointerCapture?.(F.pointerId),l.current?.press(G,!0),f(ee=>({...ee,[G]:!0}))},onPointerUp:()=>{l.current?.press(G,!1),f(F=>({...F,[G]:!1}))},onPointerCancel:()=>{l.current?.press(G,!1),f(F=>({...F,[G]:!1}))},onLostPointerCapture:()=>{l.current?.press(G,!1),f(F=>({...F,[G]:!1}))}}),_=d.t,S=Qi[e%Qi.length],U=_<0?Math.ceil(-_):0,z=i?t.finishes[i]:void 0,H=Object.keys(t.finishes).length>0,Y=t.endsAt?Math.max(0,Math.ceil((t.endsAt-t.serverNow())/1e3)):null,O=i&&z!==void 0?1+Object.values(t.finishes).filter(G=>G<z).length:null;return(0,Fe.jsxs)("div",{className:"dash-stage",onPointerDown:Eh,onContextMenu:G=>G.preventDefault(),children:[(0,Fe.jsx)("canvas",{ref:a}),r&&i&&(0,Fe.jsx)("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:"58%",touchAction:"none"},onPointerDown:T,onPointerMove:E,onPointerUp:A,onPointerCancel:A,onLostPointerCapture:A}),(0,Fe.jsx)("div",{ref:c,className:"dash-stick",style:{display:"none"},children:(0,Fe.jsx)("i",{ref:u})}),(0,Fe.jsxs)("div",{className:"dash-hud",children:[(0,Fe.jsxs)("div",{className:"dash-top",children:[t.onMinimize&&(0,Fe.jsx)("button",{className:"ec-round-btn",onClick:t.onMinimize,"aria-label":o.minimize,title:o.minimize,style:{width:38,height:38,fontSize:20,boxShadow:"0 3px 0 var(--ink)"},children:"\u2013"}),(0,Fe.jsxs)("span",{className:"dash-pill",style:{flexShrink:1,minWidth:0},children:[t.round+1,"/",t.rounds," \xB7 ",s==="ja"?S.ja:S.en]}),(0,Fe.jsx)("span",{style:{flex:1}}),_>0&&(0,Fe.jsx)("span",{className:"dash-pill clock",children:yo(z??_)}),t.canEnd&&t.onEnd&&(0,Fe.jsx)("button",{className:"dash-pill pink",onClick:t.onEnd,children:o.end})]}),i&&_>0&&!d.finished&&d.racing>1&&(0,Fe.jsxs)("div",{className:"dash-place ec-outline",children:[Qd(d.place,s),(0,Fe.jsxs)("small",{children:[" / ",d.racing]})]}),(d.watching||!i)&&_>0&&(0,Fe.jsx)("div",{style:{marginTop:8},children:(0,Fe.jsxs)("span",{className:"dash-pill yellow",children:[o.watching,d.watching?`: ${n.find(G=>G.id===d.watching)?.name??""}`:""]})}),H&&!d.finished&&Y!==null&&_>0&&(0,Fe.jsx)("div",{style:{marginTop:8},children:(0,Fe.jsxs)("span",{className:"dash-pill pink",children:[o.hurry," ",Y]})})]}),n.length>0&&_>-4&&(0,Fe.jsx)("div",{className:"dash-track","aria-hidden":!0,children:n.map(G=>(0,Fe.jsx)("span",{className:G.id===i?"me":void 0,style:{bottom:`${Math.round((d.progress[G.id]??0)*100)}%`},children:(0,Fe.jsx)(el,{id:G.avatar,size:G.id===i?30:22,border:2,shadow:!1})},G.id))}),(0,Fe.jsx)("div",{className:"dash-center",children:m?(0,Fe.jsx)("div",{className:"ec-card dash-card",children:(0,Fe.jsx)("p",{style:{fontWeight:900},children:o.noWebgl})}):_<-3.2?(0,Fe.jsxs)("div",{className:"ec-card dash-card",children:[(0,Fe.jsxs)("div",{className:"ec-chunky",style:{fontSize:13,opacity:.6},children:[o.round," ",t.round+1,"/",t.rounds]}),(0,Fe.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,lineHeight:1.15,margin:"4px 0 6px",textShadow:`0 3px 0 ${v.theme.accent2}`},children:s==="ja"?v.name.ja:v.name.en}),(0,Fe.jsx)("p",{style:{fontSize:14,fontWeight:900,opacity:.8},children:s==="ja"?v.tagline.ja:v.tagline.en})]}):U>0?(0,Fe.jsx)("div",{className:"dash-count ec-outline",children:U},U):_>=0&&_<.9?(0,Fe.jsx)("div",{className:"dash-count ec-outline",style:{fontSize:96,color:"var(--yellow)"},children:o.go}):d.finished?(0,Fe.jsxs)("div",{className:"ec-card dash-card",style:{marginBottom:"38vh"},children:[(0,Fe.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,textShadow:"0 3px 0 var(--yellow)"},children:o.finished}),O!==null&&z!==void 0&&(0,Fe.jsxs)("p",{className:"ec-chunky",style:{fontSize:18,margin:"2px 0"},children:[n.length>1?`${Qd(O,s)} \xB7 `:"",yo(z)]}),d.racing>1&&(0,Fe.jsxs)("p",{style:{fontSize:13,fontWeight:900,opacity:.7},children:[o.waitingOthers," ",Y!==null?Y:""]})]}):null}),i&&r&&!d.finished&&(0,Fe.jsxs)("div",{className:"dash-buttons",children:[(0,Fe.jsx)("div",{className:`dash-button dive${g.dive?" down":""}`,...L("dive"),children:o.dive}),(0,Fe.jsx)("div",{className:`dash-button jump${g.jump?" down":""}`,...L("jump"),children:o.jump})]}),i&&!r&&_<6&&(0,Fe.jsx)("div",{className:"dash-hint",children:o.howKeys})]})}var it=ln(Fn()),yC=5,V1="enchatto_dash_bests",H1=["var(--pink-soft)","var(--yellow-soft)","var(--blue-soft)","#fff","var(--violet-soft)"];function xC(){try{let t=JSON.parse(localStorage.getItem(V1)??"{}");return t&&typeof t=="object"?t:{}}catch{return{}}}function G1({avatar:t,lang:e,coarse:n,onClose:i,startCheckpoint:r}){let s=tl(e),[o,a]=(0,xn.useState)(null),[l,c]=(0,xn.useState)(0),[u,h]=(0,xn.useState)(null),[d,p]=(0,xn.useState)({}),[m,x]=(0,xn.useState)(void 0);(0,xn.useEffect)(()=>p(xC()),[]);let g=(0,xn.useRef)(0),f=E=>{g.current=performance.now()+yC*1e3,x(d[String(E)]),h(null),a(E),c(A=>A+1)},y=(0,xn.useCallback)(()=>(performance.now()-g.current)/1e3,[]),v=(0,xn.useMemo)(()=>[{id:"me",avatar:t,name:""}],[t]),M=(0,xn.useMemo)(()=>u===null?{}:{me:u},[u]),R=E=>{if(h(E),o===null)return;let A=String(o);if(d[A]!==void 0&&d[A]<=E)return;let L={...d,[A]:Math.round(E*100)/100};p(L);try{localStorage.setItem(V1,JSON.stringify(L))}catch{}};if(o===null)return(0,it.jsx)(Fx,{children:(0,it.jsxs)(it.Fragment,{children:[(0,it.jsx)(Jd,{name:Ox,size:56}),(0,it.jsxs)("h2",{className:"ec-chunky",style:{fontSize:24,margin:"2px 0 2px",textShadow:"0 3px 0 var(--yellow)"},children:[s.title," \xB7 ",s.practice]}),(0,it.jsx)("p",{style:{fontSize:12.5,fontWeight:700,opacity:.75,marginBottom:12,lineHeight:1.45},children:s.practiceBlurb}),(0,it.jsx)("div",{style:{display:"flex",justifyContent:"center",marginBottom:12},children:(0,it.jsx)(el,{id:t,size:54})}),(0,it.jsx)("div",{className:"dash-rows",style:{marginBottom:12},children:Qi.map((E,A)=>{let L=d[String(A)];return(0,it.jsxs)("button",{className:"dash-row dash-course",style:{background:H1[A%H1.length]},onClick:()=>f(A),children:[(0,it.jsx)("span",{className:"n",children:A+1}),(0,it.jsx)("span",{className:"name",children:e==="ja"?E.ja:E.en}),(0,it.jsx)("span",{className:"time",children:L!==void 0?`${s.best} ${yo(L)}`:s.noBest}),(0,it.jsx)("span",{className:"go","aria-hidden":!0,children:"\u25B6"})]},A)})}),(0,it.jsx)("p",{style:{fontSize:11.5,fontWeight:900,opacity:.6,marginBottom:i?12:0},children:n?s.howTouch:s.howKeys}),i&&(0,it.jsx)("button",{className:"ec-btn white",style:{fontSize:17},onClick:i,children:s.close})]})});let T=(o+1)%Qi.length;return(0,it.jsxs)(it.Fragment,{children:[(0,it.jsx)(G0,{levelIndex:o,round:o,rounds:Qi.length,racers:v,meId:"me",raceTime:y,serverNow:Date.now,finishes:M,coarse:n,lang:e,canEnd:!1,onFinish:R,onMinimize:()=>a(null),startCheckpoint:r},`${o}:${l}`),u!==null&&(0,it.jsx)("div",{className:"dash-after",children:(0,it.jsxs)("div",{className:"ec-card dash-card",children:[(0,it.jsx)("p",{className:"ec-chunky",style:{fontSize:15,marginBottom:10},children:m===void 0||u<m?s.newBest:`${s.best} ${yo(m)}`}),(0,it.jsxs)("div",{style:{display:"flex",gap:8},children:[(0,it.jsx)("button",{className:"ec-btn white",style:{flex:1,fontSize:15},onClick:()=>f(o),children:s.again}),(0,it.jsxs)("button",{className:"ec-btn pink",style:{flex:1.6,fontSize:14,whiteSpace:"nowrap",paddingInline:6},onClick:()=>f(T),children:[s.nextNow," \u25B6"]})]}),(0,it.jsx)("button",{className:"ec-btn white",style:{marginTop:8,fontSize:14},onClick:()=>a(null),children:s.allCourses})]})})]})}var $1=ln(Fn());function X1(t){window.webkit?.messageHandlers?.enchattoDash?.postMessage(t)}var Y1=new URLSearchParams(location.search),q1=Y1.get("lang")==="ja"?"ja":"en";document.documentElement.lang=q1;(0,W1.createRoot)(document.getElementById("root")).render((0,$1.jsx)(G1,{avatar:Y1.get("avatar")??ru[0].id,lang:q1,coarse:!0,onClose:()=>X1({type:"close"})}));X1({type:"ready"});})();
