"use strict";(()=>{var aM=Object.create;var eg=Object.defineProperty;var lM=Object.getOwnPropertyDescriptor;var cM=Object.getOwnPropertyNames;var uM=Object.getPrototypeOf,hM=Object.prototype.hasOwnProperty;var Yi=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var fM=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of cM(e))!hM.call(n,r)&&r!==t&&eg(n,r,{get:()=>e[r],enumerable:!(i=lM(e,r))||i.enumerable});return n};var pn=(n,e,t)=>(t=n!=null?aM(uM(n)):{},fM(e||!n||!n.__esModule?eg(t,"default",{value:n,enumerable:!0}):t,n));var fg=Yi(We=>{"use strict";var ca=Symbol.for("react.element"),dM=Symbol.for("react.portal"),pM=Symbol.for("react.fragment"),mM=Symbol.for("react.strict_mode"),gM=Symbol.for("react.profiler"),yM=Symbol.for("react.provider"),vM=Symbol.for("react.context"),xM=Symbol.for("react.forward_ref"),_M=Symbol.for("react.suspense"),MM=Symbol.for("react.memo"),SM=Symbol.for("react.lazy"),tg=Symbol.iterator;function wM(n){return n===null||typeof n!="object"?null:(n=tg&&n[tg]||n["@@iterator"],typeof n=="function"?n:null)}var rg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},sg=Object.assign,og={};function Ws(n,e,t){this.props=n,this.context=e,this.refs=og,this.updater=t||rg}Ws.prototype.isReactComponent={};Ws.prototype.setState=function(n,e){if(typeof n!="object"&&typeof n!="function"&&n!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,n,e,"setState")};Ws.prototype.forceUpdate=function(n){this.updater.enqueueForceUpdate(this,n,"forceUpdate")};function ag(){}ag.prototype=Ws.prototype;function zh(n,e,t){this.props=n,this.context=e,this.refs=og,this.updater=t||rg}var Oh=zh.prototype=new ag;Oh.constructor=zh;sg(Oh,Ws.prototype);Oh.isPureReactComponent=!0;var ng=Array.isArray,lg=Object.prototype.hasOwnProperty,Fh={current:null},cg={key:!0,ref:!0,__self:!0,__source:!0};function ug(n,e,t){var i,r={},s=null,o=null;if(e!=null)for(i in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)lg.call(e,i)&&!cg.hasOwnProperty(i)&&(r[i]=e[i]);var a=arguments.length-2;if(a===1)r.children=t;else if(1<a){for(var l=Array(a),c=0;c<a;c++)l[c]=arguments[c+2];r.children=l}if(n&&n.defaultProps)for(i in a=n.defaultProps,a)r[i]===void 0&&(r[i]=a[i]);return{$$typeof:ca,type:n,key:s,ref:o,props:r,_owner:Fh.current}}function bM(n,e){return{$$typeof:ca,type:n.type,key:e,ref:n.ref,props:n.props,_owner:n._owner}}function Bh(n){return typeof n=="object"&&n!==null&&n.$$typeof===ca}function EM(n){var e={"=":"=0",":":"=2"};return"$"+n.replace(/[=:]/g,function(t){return e[t]})}var ig=/\/+/g;function Uh(n,e){return typeof n=="object"&&n!==null&&n.key!=null?EM(""+n.key):e.toString(36)}function Gl(n,e,t,i,r){var s=typeof n;(s==="undefined"||s==="boolean")&&(n=null);var o=!1;if(n===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(n.$$typeof){case ca:case dM:o=!0}}if(o)return o=n,r=r(o),n=i===""?"."+Uh(o,0):i,ng(r)?(t="",n!=null&&(t=n.replace(ig,"$&/")+"/"),Gl(r,e,t,"",function(c){return c})):r!=null&&(Bh(r)&&(r=bM(r,t+(!r.key||o&&o.key===r.key?"":(""+r.key).replace(ig,"$&/")+"/")+n)),e.push(r)),1;if(o=0,i=i===""?".":i+":",ng(n))for(var a=0;a<n.length;a++){s=n[a];var l=i+Uh(s,a);o+=Gl(s,e,t,l,r)}else if(l=wM(n),typeof l=="function")for(n=l.call(n),a=0;!(s=n.next()).done;)s=s.value,l=i+Uh(s,a++),o+=Gl(s,e,t,l,r);else if(s==="object")throw e=String(n),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Vl(n,e,t){if(n==null)return n;var i=[],r=0;return Gl(n,i,"","",function(s){return e.call(t,s,r++)}),i}function TM(n){if(n._status===-1){var e=n._result;e=e(),e.then(function(t){(n._status===0||n._status===-1)&&(n._status=1,n._result=t)},function(t){(n._status===0||n._status===-1)&&(n._status=2,n._result=t)}),n._status===-1&&(n._status=0,n._result=e)}if(n._status===1)return n._result.default;throw n._result}var mn={current:null},Wl={transition:null},AM={ReactCurrentDispatcher:mn,ReactCurrentBatchConfig:Wl,ReactCurrentOwner:Fh};function hg(){throw Error("act(...) is not supported in production builds of React.")}We.Children={map:Vl,forEach:function(n,e,t){Vl(n,function(){e.apply(this,arguments)},t)},count:function(n){var e=0;return Vl(n,function(){e++}),e},toArray:function(n){return Vl(n,function(e){return e})||[]},only:function(n){if(!Bh(n))throw Error("React.Children.only expected to receive a single React element child.");return n}};We.Component=Ws;We.Fragment=pM;We.Profiler=gM;We.PureComponent=zh;We.StrictMode=mM;We.Suspense=_M;We.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=AM;We.act=hg;We.cloneElement=function(n,e,t){if(n==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+n+".");var i=sg({},n.props),r=n.key,s=n.ref,o=n._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Fh.current),e.key!==void 0&&(r=""+e.key),n.type&&n.type.defaultProps)var a=n.type.defaultProps;for(l in e)lg.call(e,l)&&!cg.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&a!==void 0?a[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=t;else if(1<l){a=Array(l);for(var c=0;c<l;c++)a[c]=arguments[c+2];i.children=a}return{$$typeof:ca,type:n.type,key:r,ref:s,props:i,_owner:o}};We.createContext=function(n){return n={$$typeof:vM,_currentValue:n,_currentValue2:n,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},n.Provider={$$typeof:yM,_context:n},n.Consumer=n};We.createElement=ug;We.createFactory=function(n){var e=ug.bind(null,n);return e.type=n,e};We.createRef=function(){return{current:null}};We.forwardRef=function(n){return{$$typeof:xM,render:n}};We.isValidElement=Bh;We.lazy=function(n){return{$$typeof:SM,_payload:{_status:-1,_result:n},_init:TM}};We.memo=function(n,e){return{$$typeof:MM,type:n,compare:e===void 0?null:e}};We.startTransition=function(n){var e=Wl.transition;Wl.transition={};try{n()}finally{Wl.transition=e}};We.unstable_act=hg;We.useCallback=function(n,e){return mn.current.useCallback(n,e)};We.useContext=function(n){return mn.current.useContext(n)};We.useDebugValue=function(){};We.useDeferredValue=function(n){return mn.current.useDeferredValue(n)};We.useEffect=function(n,e){return mn.current.useEffect(n,e)};We.useId=function(){return mn.current.useId()};We.useImperativeHandle=function(n,e,t){return mn.current.useImperativeHandle(n,e,t)};We.useInsertionEffect=function(n,e){return mn.current.useInsertionEffect(n,e)};We.useLayoutEffect=function(n,e){return mn.current.useLayoutEffect(n,e)};We.useMemo=function(n,e){return mn.current.useMemo(n,e)};We.useReducer=function(n,e,t){return mn.current.useReducer(n,e,t)};We.useRef=function(n){return mn.current.useRef(n)};We.useState=function(n){return mn.current.useState(n)};We.useSyncExternalStore=function(n,e,t){return mn.current.useSyncExternalStore(n,e,t)};We.useTransition=function(){return mn.current.useTransition()};We.version="18.3.1"});var ua=Yi((PC,dg)=>{"use strict";dg.exports=fg()});var wg=Yi(ht=>{"use strict";function Wh(n,e){var t=n.length;n.push(e);e:for(;0<t;){var i=t-1>>>1,r=n[i];if(0<Xl(r,e))n[i]=e,n[t]=r,t=i;else break e}}function fi(n){return n.length===0?null:n[0]}function ql(n){if(n.length===0)return null;var e=n[0],t=n.pop();if(t!==e){n[0]=t;e:for(var i=0,r=n.length,s=r>>>1;i<s;){var o=2*(i+1)-1,a=n[o],l=o+1,c=n[l];if(0>Xl(a,t))l<r&&0>Xl(c,a)?(n[i]=c,n[l]=t,i=l):(n[i]=a,n[o]=t,i=o);else if(l<r&&0>Xl(c,t))n[i]=c,n[l]=t,i=l;else break e}}return e}function Xl(n,e){var t=n.sortIndex-e.sortIndex;return t!==0?t:n.id-e.id}typeof performance=="object"&&typeof performance.now=="function"?(pg=performance,ht.unstable_now=function(){return pg.now()}):(Hh=Date,mg=Hh.now(),ht.unstable_now=function(){return Hh.now()-mg});var pg,Hh,mg,Pi=[],Mr=[],RM=1,Jn=null,en=3,jl=!1,os=!1,fa=!1,vg=typeof setTimeout=="function"?setTimeout:null,xg=typeof clearTimeout=="function"?clearTimeout:null,gg=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Xh(n){for(var e=fi(Mr);e!==null;){if(e.callback===null)ql(Mr);else if(e.startTime<=n)ql(Mr),e.sortIndex=e.expirationTime,Wh(Pi,e);else break;e=fi(Mr)}}function Yh(n){if(fa=!1,Xh(n),!os)if(fi(Pi)!==null)os=!0,jh(qh);else{var e=fi(Mr);e!==null&&$h(Yh,e.startTime-n)}}function qh(n,e){os=!1,fa&&(fa=!1,xg(da),da=-1),jl=!0;var t=en;try{for(Xh(e),Jn=fi(Pi);Jn!==null&&(!(Jn.expirationTime>e)||n&&!Sg());){var i=Jn.callback;if(typeof i=="function"){Jn.callback=null,en=Jn.priorityLevel;var r=i(Jn.expirationTime<=e);e=ht.unstable_now(),typeof r=="function"?Jn.callback=r:Jn===fi(Pi)&&ql(Pi),Xh(e)}else ql(Pi);Jn=fi(Pi)}if(Jn!==null)var s=!0;else{var o=fi(Mr);o!==null&&$h(Yh,o.startTime-e),s=!1}return s}finally{Jn=null,en=t,jl=!1}}var $l=!1,Yl=null,da=-1,_g=5,Mg=-1;function Sg(){return!(ht.unstable_now()-Mg<_g)}function Vh(){if(Yl!==null){var n=ht.unstable_now();Mg=n;var e=!0;try{e=Yl(!0,n)}finally{e?ha():($l=!1,Yl=null)}}else $l=!1}var ha;typeof gg=="function"?ha=function(){gg(Vh)}:typeof MessageChannel<"u"?(Gh=new MessageChannel,yg=Gh.port2,Gh.port1.onmessage=Vh,ha=function(){yg.postMessage(null)}):ha=function(){vg(Vh,0)};var Gh,yg;function jh(n){Yl=n,$l||($l=!0,ha())}function $h(n,e){da=vg(function(){n(ht.unstable_now())},e)}ht.unstable_IdlePriority=5;ht.unstable_ImmediatePriority=1;ht.unstable_LowPriority=4;ht.unstable_NormalPriority=3;ht.unstable_Profiling=null;ht.unstable_UserBlockingPriority=2;ht.unstable_cancelCallback=function(n){n.callback=null};ht.unstable_continueExecution=function(){os||jl||(os=!0,jh(qh))};ht.unstable_forceFrameRate=function(n){0>n||125<n?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):_g=0<n?Math.floor(1e3/n):5};ht.unstable_getCurrentPriorityLevel=function(){return en};ht.unstable_getFirstCallbackNode=function(){return fi(Pi)};ht.unstable_next=function(n){switch(en){case 1:case 2:case 3:var e=3;break;default:e=en}var t=en;en=e;try{return n()}finally{en=t}};ht.unstable_pauseExecution=function(){};ht.unstable_requestPaint=function(){};ht.unstable_runWithPriority=function(n,e){switch(n){case 1:case 2:case 3:case 4:case 5:break;default:n=3}var t=en;en=n;try{return e()}finally{en=t}};ht.unstable_scheduleCallback=function(n,e,t){var i=ht.unstable_now();switch(typeof t=="object"&&t!==null?(t=t.delay,t=typeof t=="number"&&0<t?i+t:i):t=i,n){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=t+r,n={id:RM++,callback:e,priorityLevel:n,startTime:t,expirationTime:r,sortIndex:-1},t>i?(n.sortIndex=t,Wh(Mr,n),fi(Pi)===null&&n===fi(Mr)&&(fa?(xg(da),da=-1):fa=!0,$h(Yh,t-i))):(n.sortIndex=r,Wh(Pi,n),os||jl||(os=!0,jh(qh))),n};ht.unstable_shouldYield=Sg;ht.unstable_wrapCallback=function(n){var e=en;return function(){var t=en;en=e;try{return n.apply(this,arguments)}finally{en=t}}}});var Eg=Yi((LC,bg)=>{"use strict";bg.exports=wg()});var Cx=Yi(Gn=>{"use strict";var CM=ua(),Hn=Eg();function Q(n){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+n,t=1;t<arguments.length;t++)e+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+n+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Ly=new Set,Da={};function xs(n,e){ho(n,e),ho(n+"Capture",e)}function ho(n,e){for(Da[n]=e,n=0;n<e.length;n++)Ly.add(e[n])}var Ji=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),xf=Object.prototype.hasOwnProperty,PM=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Tg={},Ag={};function IM(n){return xf.call(Ag,n)?!0:xf.call(Tg,n)?!1:PM.test(n)?Ag[n]=!0:(Tg[n]=!0,!1)}function LM(n,e,t,i){if(t!==null&&t.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:t!==null?!t.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function kM(n,e,t,i){if(e===null||typeof e>"u"||LM(n,e,t,i))return!0;if(i)return!1;if(t!==null)switch(t.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function vn(n,e,t,i,r,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=t,this.propertyName=n,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var $t={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){$t[n]=new vn(n,0,!1,n,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var e=n[0];$t[e]=new vn(e,1,!1,n[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(n){$t[n]=new vn(n,2,!1,n.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){$t[n]=new vn(n,2,!1,n,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){$t[n]=new vn(n,3,!1,n.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(n){$t[n]=new vn(n,3,!0,n,null,!1,!1)});["capture","download"].forEach(function(n){$t[n]=new vn(n,4,!1,n,null,!1,!1)});["cols","rows","size","span"].forEach(function(n){$t[n]=new vn(n,6,!1,n,null,!1,!1)});["rowSpan","start"].forEach(function(n){$t[n]=new vn(n,5,!1,n.toLowerCase(),null,!1,!1)});var hd=/[\-:]([a-z])/g;function fd(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var e=n.replace(hd,fd);$t[e]=new vn(e,1,!1,n,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var e=n.replace(hd,fd);$t[e]=new vn(e,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(n){var e=n.replace(hd,fd);$t[e]=new vn(e,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(n){$t[n]=new vn(n,1,!1,n.toLowerCase(),null,!1,!1)});$t.xlinkHref=new vn("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(n){$t[n]=new vn(n,1,!1,n.toLowerCase(),null,!0,!0)});function dd(n,e,t,i){var r=$t.hasOwnProperty(e)?$t[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(kM(e,t,r,i)&&(t=null),i||r===null?IM(e)&&(t===null?n.removeAttribute(e):n.setAttribute(e,""+t)):r.mustUseProperty?n[r.propertyName]=t===null?r.type===3?!1:"":t:(e=r.attributeName,i=r.attributeNamespace,t===null?n.removeAttribute(e):(r=r.type,t=r===3||r===4&&t===!0?"":""+t,i?n.setAttributeNS(i,e,t):n.setAttribute(e,t))))}var nr=CM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Zl=Symbol.for("react.element"),qs=Symbol.for("react.portal"),js=Symbol.for("react.fragment"),pd=Symbol.for("react.strict_mode"),_f=Symbol.for("react.profiler"),ky=Symbol.for("react.provider"),Ny=Symbol.for("react.context"),md=Symbol.for("react.forward_ref"),Mf=Symbol.for("react.suspense"),Sf=Symbol.for("react.suspense_list"),gd=Symbol.for("react.memo"),wr=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var Dy=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var Rg=Symbol.iterator;function pa(n){return n===null||typeof n!="object"?null:(n=Rg&&n[Rg]||n["@@iterator"],typeof n=="function"?n:null)}var Et=Object.assign,Zh;function Sa(n){if(Zh===void 0)try{throw Error()}catch(t){var e=t.stack.trim().match(/\n( *(at )?)/);Zh=e&&e[1]||""}return`
`+Zh+n}var Kh=!1;function Jh(n,e){if(!n||Kh)return"";Kh=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(n,[],e)}else{try{e.call()}catch(c){i=c}n.call(e.prototype)}else{try{throw Error()}catch(c){i=c}n()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),o=r.length-1,a=s.length-1;1<=o&&0<=a&&r[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(r[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||r[o]!==s[a]){var l=`
`+r[o].replace(" at new "," at ");return n.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",n.displayName)),l}while(1<=o&&0<=a);break}}}finally{Kh=!1,Error.prepareStackTrace=t}return(n=n?n.displayName||n.name:"")?Sa(n):""}function NM(n){switch(n.tag){case 5:return Sa(n.type);case 16:return Sa("Lazy");case 13:return Sa("Suspense");case 19:return Sa("SuspenseList");case 0:case 2:case 15:return n=Jh(n.type,!1),n;case 11:return n=Jh(n.type.render,!1),n;case 1:return n=Jh(n.type,!0),n;default:return""}}function wf(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case js:return"Fragment";case qs:return"Portal";case _f:return"Profiler";case pd:return"StrictMode";case Mf:return"Suspense";case Sf:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case Ny:return(n.displayName||"Context")+".Consumer";case ky:return(n._context.displayName||"Context")+".Provider";case md:var e=n.render;return n=n.displayName,n||(n=e.displayName||e.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case gd:return e=n.displayName||null,e!==null?e:wf(n.type)||"Memo";case wr:e=n._payload,n=n._init;try{return wf(n(e))}catch{}}return null}function DM(n){var e=n.type;switch(n.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=e.render,n=n.displayName||n.name||"",e.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return wf(e);case 8:return e===pd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function zr(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Uy(n){var e=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function UM(n){var e=Uy(n)?"checked":"value",t=Object.getOwnPropertyDescriptor(n.constructor.prototype,e),i=""+n[e];if(!n.hasOwnProperty(e)&&typeof t<"u"&&typeof t.get=="function"&&typeof t.set=="function"){var r=t.get,s=t.set;return Object.defineProperty(n,e,{configurable:!0,get:function(){return r.call(this)},set:function(o){i=""+o,s.call(this,o)}}),Object.defineProperty(n,e,{enumerable:t.enumerable}),{getValue:function(){return i},setValue:function(o){i=""+o},stopTracking:function(){n._valueTracker=null,delete n[e]}}}}function Kl(n){n._valueTracker||(n._valueTracker=UM(n))}function zy(n){if(!n)return!1;var e=n._valueTracker;if(!e)return!0;var t=e.getValue(),i="";return n&&(i=Uy(n)?n.checked?"true":"false":n.value),n=i,n!==t?(e.setValue(n),!0):!1}function Ec(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function bf(n,e){var t=e.checked;return Et({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t??n._wrapperState.initialChecked})}function Cg(n,e){var t=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;t=zr(e.value!=null?e.value:t),n._wrapperState={initialChecked:i,initialValue:t,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Oy(n,e){e=e.checked,e!=null&&dd(n,"checked",e,!1)}function Ef(n,e){Oy(n,e);var t=zr(e.value),i=e.type;if(t!=null)i==="number"?(t===0&&n.value===""||n.value!=t)&&(n.value=""+t):n.value!==""+t&&(n.value=""+t);else if(i==="submit"||i==="reset"){n.removeAttribute("value");return}e.hasOwnProperty("value")?Tf(n,e.type,t):e.hasOwnProperty("defaultValue")&&Tf(n,e.type,zr(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(n.defaultChecked=!!e.defaultChecked)}function Pg(n,e,t){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+n._wrapperState.initialValue,t||e===n.value||(n.value=e),n.defaultValue=e}t=n.name,t!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,t!==""&&(n.name=t)}function Tf(n,e,t){(e!=="number"||Ec(n.ownerDocument)!==n)&&(t==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+t&&(n.defaultValue=""+t))}var wa=Array.isArray;function so(n,e,t,i){if(n=n.options,e){e={};for(var r=0;r<t.length;r++)e["$"+t[r]]=!0;for(t=0;t<n.length;t++)r=e.hasOwnProperty("$"+n[t].value),n[t].selected!==r&&(n[t].selected=r),r&&i&&(n[t].defaultSelected=!0)}else{for(t=""+zr(t),e=null,r=0;r<n.length;r++){if(n[r].value===t){n[r].selected=!0,i&&(n[r].defaultSelected=!0);return}e!==null||n[r].disabled||(e=n[r])}e!==null&&(e.selected=!0)}}function Af(n,e){if(e.dangerouslySetInnerHTML!=null)throw Error(Q(91));return Et({},e,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function Ig(n,e){var t=e.value;if(t==null){if(t=e.children,e=e.defaultValue,t!=null){if(e!=null)throw Error(Q(92));if(wa(t)){if(1<t.length)throw Error(Q(93));t=t[0]}e=t}e==null&&(e=""),t=e}n._wrapperState={initialValue:zr(t)}}function Fy(n,e){var t=zr(e.value),i=zr(e.defaultValue);t!=null&&(t=""+t,t!==n.value&&(n.value=t),e.defaultValue==null&&n.defaultValue!==t&&(n.defaultValue=t)),i!=null&&(n.defaultValue=""+i)}function Lg(n){var e=n.textContent;e===n._wrapperState.initialValue&&e!==""&&e!==null&&(n.value=e)}function By(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Rf(n,e){return n==null||n==="http://www.w3.org/1999/xhtml"?By(e):n==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Jl,Hy=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,t,i,r){MSApp.execUnsafeLocalFunction(function(){return n(e,t,i,r)})}:n})(function(n,e){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=e;else{for(Jl=Jl||document.createElement("div"),Jl.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Jl.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;e.firstChild;)n.appendChild(e.firstChild)}});function Ua(n,e){if(e){var t=n.firstChild;if(t&&t===n.lastChild&&t.nodeType===3){t.nodeValue=e;return}}n.textContent=e}var Ta={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},zM=["Webkit","ms","Moz","O"];Object.keys(Ta).forEach(function(n){zM.forEach(function(e){e=e+n.charAt(0).toUpperCase()+n.substring(1),Ta[e]=Ta[n]})});function Vy(n,e,t){return e==null||typeof e=="boolean"||e===""?"":t||typeof e!="number"||e===0||Ta.hasOwnProperty(n)&&Ta[n]?(""+e).trim():e+"px"}function Gy(n,e){n=n.style;for(var t in e)if(e.hasOwnProperty(t)){var i=t.indexOf("--")===0,r=Vy(t,e[t],i);t==="float"&&(t="cssFloat"),i?n.setProperty(t,r):n[t]=r}}var OM=Et({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Cf(n,e){if(e){if(OM[n]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(Q(137,n));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(Q(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(Q(61))}if(e.style!=null&&typeof e.style!="object")throw Error(Q(62))}}function Pf(n,e){if(n.indexOf("-")===-1)return typeof e.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var If=null;function yd(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Lf=null,oo=null,ao=null;function kg(n){if(n=el(n)){if(typeof Lf!="function")throw Error(Q(280));var e=n.stateNode;e&&(e=Qc(e),Lf(n.stateNode,n.type,e))}}function Wy(n){oo?ao?ao.push(n):ao=[n]:oo=n}function Xy(){if(oo){var n=oo,e=ao;if(ao=oo=null,kg(n),e)for(n=0;n<e.length;n++)kg(e[n])}}function Yy(n,e){return n(e)}function qy(){}var Qh=!1;function jy(n,e,t){if(Qh)return n(e,t);Qh=!0;try{return Yy(n,e,t)}finally{Qh=!1,(oo!==null||ao!==null)&&(qy(),Xy())}}function za(n,e){var t=n.stateNode;if(t===null)return null;var i=Qc(t);if(i===null)return null;t=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(n=n.type,i=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!i;break e;default:n=!1}if(n)return null;if(t&&typeof t!="function")throw Error(Q(231,e,typeof t));return t}var kf=!1;if(Ji)try{Xs={},Object.defineProperty(Xs,"passive",{get:function(){kf=!0}}),window.addEventListener("test",Xs,Xs),window.removeEventListener("test",Xs,Xs)}catch{kf=!1}var Xs;function FM(n,e,t,i,r,s,o,a,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(t,c)}catch(u){this.onError(u)}}var Aa=!1,Tc=null,Ac=!1,Nf=null,BM={onError:function(n){Aa=!0,Tc=n}};function HM(n,e,t,i,r,s,o,a,l){Aa=!1,Tc=null,FM.apply(BM,arguments)}function VM(n,e,t,i,r,s,o,a,l){if(HM.apply(this,arguments),Aa){if(Aa){var c=Tc;Aa=!1,Tc=null}else throw Error(Q(198));Ac||(Ac=!0,Nf=c)}}function _s(n){var e=n,t=n;if(n.alternate)for(;e.return;)e=e.return;else{n=e;do e=n,(e.flags&4098)!==0&&(t=e.return),n=e.return;while(n)}return e.tag===3?t:null}function $y(n){if(n.tag===13){var e=n.memoizedState;if(e===null&&(n=n.alternate,n!==null&&(e=n.memoizedState)),e!==null)return e.dehydrated}return null}function Ng(n){if(_s(n)!==n)throw Error(Q(188))}function GM(n){var e=n.alternate;if(!e){if(e=_s(n),e===null)throw Error(Q(188));return e!==n?null:n}for(var t=n,i=e;;){var r=t.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){t=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===t)return Ng(r),n;if(s===i)return Ng(r),e;s=s.sibling}throw Error(Q(188))}if(t.return!==i.return)t=r,i=s;else{for(var o=!1,a=r.child;a;){if(a===t){o=!0,t=r,i=s;break}if(a===i){o=!0,i=r,t=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===t){o=!0,t=s,i=r;break}if(a===i){o=!0,i=s,t=r;break}a=a.sibling}if(!o)throw Error(Q(189))}}if(t.alternate!==i)throw Error(Q(190))}if(t.tag!==3)throw Error(Q(188));return t.stateNode.current===t?n:e}function Zy(n){return n=GM(n),n!==null?Ky(n):null}function Ky(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var e=Ky(n);if(e!==null)return e;n=n.sibling}return null}var Jy=Hn.unstable_scheduleCallback,Dg=Hn.unstable_cancelCallback,WM=Hn.unstable_shouldYield,XM=Hn.unstable_requestPaint,kt=Hn.unstable_now,YM=Hn.unstable_getCurrentPriorityLevel,vd=Hn.unstable_ImmediatePriority,Qy=Hn.unstable_UserBlockingPriority,Rc=Hn.unstable_NormalPriority,qM=Hn.unstable_LowPriority,ev=Hn.unstable_IdlePriority,$c=null,Ni=null;function jM(n){if(Ni&&typeof Ni.onCommitFiberRoot=="function")try{Ni.onCommitFiberRoot($c,n,void 0,(n.current.flags&128)===128)}catch{}}var yi=Math.clz32?Math.clz32:KM,$M=Math.log,ZM=Math.LN2;function KM(n){return n>>>=0,n===0?32:31-($M(n)/ZM|0)|0}var Ql=64,ec=4194304;function ba(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Cc(n,e){var t=n.pendingLanes;if(t===0)return 0;var i=0,r=n.suspendedLanes,s=n.pingedLanes,o=t&268435455;if(o!==0){var a=o&~r;a!==0?i=ba(a):(s&=o,s!==0&&(i=ba(s)))}else o=t&~r,o!==0?i=ba(o):s!==0&&(i=ba(s));if(i===0)return 0;if(e!==0&&e!==i&&(e&r)===0&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if((i&4)!==0&&(i|=t&16),e=n.entangledLanes,e!==0)for(n=n.entanglements,e&=i;0<e;)t=31-yi(e),r=1<<t,i|=n[t],e&=~r;return i}function JM(n,e){switch(n){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function QM(n,e){for(var t=n.suspendedLanes,i=n.pingedLanes,r=n.expirationTimes,s=n.pendingLanes;0<s;){var o=31-yi(s),a=1<<o,l=r[o];l===-1?((a&t)===0||(a&i)!==0)&&(r[o]=JM(a,e)):l<=e&&(n.expiredLanes|=a),s&=~a}}function Df(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function tv(){var n=Ql;return Ql<<=1,(Ql&4194240)===0&&(Ql=64),n}function ef(n){for(var e=[],t=0;31>t;t++)e.push(n);return e}function Ja(n,e,t){n.pendingLanes|=e,e!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,e=31-yi(e),n[e]=t}function eS(n,e){var t=n.pendingLanes&~e;n.pendingLanes=e,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=e,n.mutableReadLanes&=e,n.entangledLanes&=e,e=n.entanglements;var i=n.eventTimes;for(n=n.expirationTimes;0<t;){var r=31-yi(t),s=1<<r;e[r]=0,i[r]=-1,n[r]=-1,t&=~s}}function xd(n,e){var t=n.entangledLanes|=e;for(n=n.entanglements;t;){var i=31-yi(t),r=1<<i;r&e|n[i]&e&&(n[i]|=e),t&=~r}}var st=0;function nv(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var iv,_d,rv,sv,ov,Uf=!1,tc=[],Cr=null,Pr=null,Ir=null,Oa=new Map,Fa=new Map,Er=[],tS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ug(n,e){switch(n){case"focusin":case"focusout":Cr=null;break;case"dragenter":case"dragleave":Pr=null;break;case"mouseover":case"mouseout":Ir=null;break;case"pointerover":case"pointerout":Oa.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Fa.delete(e.pointerId)}}function ma(n,e,t,i,r,s){return n===null||n.nativeEvent!==s?(n={blockedOn:e,domEventName:t,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=el(e),e!==null&&_d(e)),n):(n.eventSystemFlags|=i,e=n.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),n)}function nS(n,e,t,i,r){switch(e){case"focusin":return Cr=ma(Cr,n,e,t,i,r),!0;case"dragenter":return Pr=ma(Pr,n,e,t,i,r),!0;case"mouseover":return Ir=ma(Ir,n,e,t,i,r),!0;case"pointerover":var s=r.pointerId;return Oa.set(s,ma(Oa.get(s)||null,n,e,t,i,r)),!0;case"gotpointercapture":return s=r.pointerId,Fa.set(s,ma(Fa.get(s)||null,n,e,t,i,r)),!0}return!1}function av(n){var e=cs(n.target);if(e!==null){var t=_s(e);if(t!==null){if(e=t.tag,e===13){if(e=$y(t),e!==null){n.blockedOn=e,ov(n.priority,function(){rv(t)});return}}else if(e===3&&t.stateNode.current.memoizedState.isDehydrated){n.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}n.blockedOn=null}function mc(n){if(n.blockedOn!==null)return!1;for(var e=n.targetContainers;0<e.length;){var t=zf(n.domEventName,n.eventSystemFlags,e[0],n.nativeEvent);if(t===null){t=n.nativeEvent;var i=new t.constructor(t.type,t);If=i,t.target.dispatchEvent(i),If=null}else return e=el(t),e!==null&&_d(e),n.blockedOn=t,!1;e.shift()}return!0}function zg(n,e,t){mc(n)&&t.delete(e)}function iS(){Uf=!1,Cr!==null&&mc(Cr)&&(Cr=null),Pr!==null&&mc(Pr)&&(Pr=null),Ir!==null&&mc(Ir)&&(Ir=null),Oa.forEach(zg),Fa.forEach(zg)}function ga(n,e){n.blockedOn===e&&(n.blockedOn=null,Uf||(Uf=!0,Hn.unstable_scheduleCallback(Hn.unstable_NormalPriority,iS)))}function Ba(n){function e(r){return ga(r,n)}if(0<tc.length){ga(tc[0],n);for(var t=1;t<tc.length;t++){var i=tc[t];i.blockedOn===n&&(i.blockedOn=null)}}for(Cr!==null&&ga(Cr,n),Pr!==null&&ga(Pr,n),Ir!==null&&ga(Ir,n),Oa.forEach(e),Fa.forEach(e),t=0;t<Er.length;t++)i=Er[t],i.blockedOn===n&&(i.blockedOn=null);for(;0<Er.length&&(t=Er[0],t.blockedOn===null);)av(t),t.blockedOn===null&&Er.shift()}var lo=nr.ReactCurrentBatchConfig,Pc=!0;function rS(n,e,t,i){var r=st,s=lo.transition;lo.transition=null;try{st=1,Md(n,e,t,i)}finally{st=r,lo.transition=s}}function sS(n,e,t,i){var r=st,s=lo.transition;lo.transition=null;try{st=4,Md(n,e,t,i)}finally{st=r,lo.transition=s}}function Md(n,e,t,i){if(Pc){var r=zf(n,e,t,i);if(r===null)lf(n,e,i,Ic,t),Ug(n,i);else if(nS(r,n,e,t,i))i.stopPropagation();else if(Ug(n,i),e&4&&-1<tS.indexOf(n)){for(;r!==null;){var s=el(r);if(s!==null&&iv(s),s=zf(n,e,t,i),s===null&&lf(n,e,i,Ic,t),s===r)break;r=s}r!==null&&i.stopPropagation()}else lf(n,e,i,null,t)}}var Ic=null;function zf(n,e,t,i){if(Ic=null,n=yd(i),n=cs(n),n!==null)if(e=_s(n),e===null)n=null;else if(t=e.tag,t===13){if(n=$y(e),n!==null)return n;n=null}else if(t===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;n=null}else e!==n&&(n=null);return Ic=n,null}function lv(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(YM()){case vd:return 1;case Qy:return 4;case Rc:case qM:return 16;case ev:return 536870912;default:return 16}default:return 16}}var Ar=null,Sd=null,gc=null;function cv(){if(gc)return gc;var n,e=Sd,t=e.length,i,r="value"in Ar?Ar.value:Ar.textContent,s=r.length;for(n=0;n<t&&e[n]===r[n];n++);var o=t-n;for(i=1;i<=o&&e[t-i]===r[s-i];i++);return gc=r.slice(n,1<i?1-i:void 0)}function yc(n){var e=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&e===13&&(n=13)):n=e,n===10&&(n=13),32<=n||n===13?n:0}function nc(){return!0}function Og(){return!1}function Vn(n){function e(t,i,r,s,o){this._reactName=t,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in n)n.hasOwnProperty(a)&&(t=n[a],this[a]=t?t(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?nc:Og,this.isPropagationStopped=Og,this}return Et(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=nc)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=nc)},persist:function(){},isPersistent:nc}),e}var xo={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},wd=Vn(xo),Qa=Et({},xo,{view:0,detail:0}),oS=Vn(Qa),tf,nf,ya,Zc=Et({},Qa,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:bd,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==ya&&(ya&&n.type==="mousemove"?(tf=n.screenX-ya.screenX,nf=n.screenY-ya.screenY):nf=tf=0,ya=n),tf)},movementY:function(n){return"movementY"in n?n.movementY:nf}}),Fg=Vn(Zc),aS=Et({},Zc,{dataTransfer:0}),lS=Vn(aS),cS=Et({},Qa,{relatedTarget:0}),rf=Vn(cS),uS=Et({},xo,{animationName:0,elapsedTime:0,pseudoElement:0}),hS=Vn(uS),fS=Et({},xo,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),dS=Vn(fS),pS=Et({},xo,{data:0}),Bg=Vn(pS),mS={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},gS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},yS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vS(n){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(n):(n=yS[n])?!!e[n]:!1}function bd(){return vS}var xS=Et({},Qa,{key:function(n){if(n.key){var e=mS[n.key]||n.key;if(e!=="Unidentified")return e}return n.type==="keypress"?(n=yc(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?gS[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:bd,charCode:function(n){return n.type==="keypress"?yc(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?yc(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),_S=Vn(xS),MS=Et({},Zc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Hg=Vn(MS),SS=Et({},Qa,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:bd}),wS=Vn(SS),bS=Et({},xo,{propertyName:0,elapsedTime:0,pseudoElement:0}),ES=Vn(bS),TS=Et({},Zc,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),AS=Vn(TS),RS=[9,13,27,32],Ed=Ji&&"CompositionEvent"in window,Ra=null;Ji&&"documentMode"in document&&(Ra=document.documentMode);var CS=Ji&&"TextEvent"in window&&!Ra,uv=Ji&&(!Ed||Ra&&8<Ra&&11>=Ra),Vg=" ",Gg=!1;function hv(n,e){switch(n){case"keyup":return RS.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function fv(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var $s=!1;function PS(n,e){switch(n){case"compositionend":return fv(e);case"keypress":return e.which!==32?null:(Gg=!0,Vg);case"textInput":return n=e.data,n===Vg&&Gg?null:n;default:return null}}function IS(n,e){if($s)return n==="compositionend"||!Ed&&hv(n,e)?(n=cv(),gc=Sd=Ar=null,$s=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return uv&&e.locale!=="ko"?null:e.data;default:return null}}var LS={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Wg(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e==="input"?!!LS[n.type]:e==="textarea"}function dv(n,e,t,i){Wy(i),e=Lc(e,"onChange"),0<e.length&&(t=new wd("onChange","change",null,t,i),n.push({event:t,listeners:e}))}var Ca=null,Ha=null;function kS(n){bv(n,0)}function Kc(n){var e=Js(n);if(zy(e))return n}function NS(n,e){if(n==="change")return e}var pv=!1;Ji&&(Ji?(rc="oninput"in document,rc||(sf=document.createElement("div"),sf.setAttribute("oninput","return;"),rc=typeof sf.oninput=="function"),ic=rc):ic=!1,pv=ic&&(!document.documentMode||9<document.documentMode));var ic,rc,sf;function Xg(){Ca&&(Ca.detachEvent("onpropertychange",mv),Ha=Ca=null)}function mv(n){if(n.propertyName==="value"&&Kc(Ha)){var e=[];dv(e,Ha,n,yd(n)),jy(kS,e)}}function DS(n,e,t){n==="focusin"?(Xg(),Ca=e,Ha=t,Ca.attachEvent("onpropertychange",mv)):n==="focusout"&&Xg()}function US(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Kc(Ha)}function zS(n,e){if(n==="click")return Kc(e)}function OS(n,e){if(n==="input"||n==="change")return Kc(e)}function FS(n,e){return n===e&&(n!==0||1/n===1/e)||n!==n&&e!==e}var xi=typeof Object.is=="function"?Object.is:FS;function Va(n,e){if(xi(n,e))return!0;if(typeof n!="object"||n===null||typeof e!="object"||e===null)return!1;var t=Object.keys(n),i=Object.keys(e);if(t.length!==i.length)return!1;for(i=0;i<t.length;i++){var r=t[i];if(!xf.call(e,r)||!xi(n[r],e[r]))return!1}return!0}function Yg(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function qg(n,e){var t=Yg(n);n=0;for(var i;t;){if(t.nodeType===3){if(i=n+t.textContent.length,n<=e&&i>=e)return{node:t,offset:e-n};n=i}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=Yg(t)}}function gv(n,e){return n&&e?n===e?!0:n&&n.nodeType===3?!1:e&&e.nodeType===3?gv(n,e.parentNode):"contains"in n?n.contains(e):n.compareDocumentPosition?!!(n.compareDocumentPosition(e)&16):!1:!1}function yv(){for(var n=window,e=Ec();e instanceof n.HTMLIFrameElement;){try{var t=typeof e.contentWindow.location.href=="string"}catch{t=!1}if(t)n=e.contentWindow;else break;e=Ec(n.document)}return e}function Td(n){var e=n&&n.nodeName&&n.nodeName.toLowerCase();return e&&(e==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||e==="textarea"||n.contentEditable==="true")}function BS(n){var e=yv(),t=n.focusedElem,i=n.selectionRange;if(e!==t&&t&&t.ownerDocument&&gv(t.ownerDocument.documentElement,t)){if(i!==null&&Td(t)){if(e=i.start,n=i.end,n===void 0&&(n=e),"selectionStart"in t)t.selectionStart=e,t.selectionEnd=Math.min(n,t.value.length);else if(n=(e=t.ownerDocument||document)&&e.defaultView||window,n.getSelection){n=n.getSelection();var r=t.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!n.extend&&s>i&&(r=i,i=s,s=r),r=qg(t,s);var o=qg(t,i);r&&o&&(n.rangeCount!==1||n.anchorNode!==r.node||n.anchorOffset!==r.offset||n.focusNode!==o.node||n.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),n.removeAllRanges(),s>i?(n.addRange(e),n.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),n.addRange(e)))}}for(e=[],n=t;n=n.parentNode;)n.nodeType===1&&e.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof t.focus=="function"&&t.focus(),t=0;t<e.length;t++)n=e[t],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var HS=Ji&&"documentMode"in document&&11>=document.documentMode,Zs=null,Of=null,Pa=null,Ff=!1;function jg(n,e,t){var i=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;Ff||Zs==null||Zs!==Ec(i)||(i=Zs,"selectionStart"in i&&Td(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Pa&&Va(Pa,i)||(Pa=i,i=Lc(Of,"onSelect"),0<i.length&&(e=new wd("onSelect","select",null,e,t),n.push({event:e,listeners:i}),e.target=Zs)))}function sc(n,e){var t={};return t[n.toLowerCase()]=e.toLowerCase(),t["Webkit"+n]="webkit"+e,t["Moz"+n]="moz"+e,t}var Ks={animationend:sc("Animation","AnimationEnd"),animationiteration:sc("Animation","AnimationIteration"),animationstart:sc("Animation","AnimationStart"),transitionend:sc("Transition","TransitionEnd")},of={},vv={};Ji&&(vv=document.createElement("div").style,"AnimationEvent"in window||(delete Ks.animationend.animation,delete Ks.animationiteration.animation,delete Ks.animationstart.animation),"TransitionEvent"in window||delete Ks.transitionend.transition);function Jc(n){if(of[n])return of[n];if(!Ks[n])return n;var e=Ks[n],t;for(t in e)if(e.hasOwnProperty(t)&&t in vv)return of[n]=e[t];return n}var xv=Jc("animationend"),_v=Jc("animationiteration"),Mv=Jc("animationstart"),Sv=Jc("transitionend"),wv=new Map,$g="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Fr(n,e){wv.set(n,e),xs(e,[n])}for(oc=0;oc<$g.length;oc++)ac=$g[oc],Zg=ac.toLowerCase(),Kg=ac[0].toUpperCase()+ac.slice(1),Fr(Zg,"on"+Kg);var ac,Zg,Kg,oc;Fr(xv,"onAnimationEnd");Fr(_v,"onAnimationIteration");Fr(Mv,"onAnimationStart");Fr("dblclick","onDoubleClick");Fr("focusin","onFocus");Fr("focusout","onBlur");Fr(Sv,"onTransitionEnd");ho("onMouseEnter",["mouseout","mouseover"]);ho("onMouseLeave",["mouseout","mouseover"]);ho("onPointerEnter",["pointerout","pointerover"]);ho("onPointerLeave",["pointerout","pointerover"]);xs("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));xs("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));xs("onBeforeInput",["compositionend","keypress","textInput","paste"]);xs("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));xs("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));xs("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ea="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),VS=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ea));function Jg(n,e,t){var i=n.type||"unknown-event";n.currentTarget=t,VM(i,e,void 0,n),n.currentTarget=null}function bv(n,e){e=(e&4)!==0;for(var t=0;t<n.length;t++){var i=n[t],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var o=i.length-1;0<=o;o--){var a=i[o],l=a.instance,c=a.currentTarget;if(a=a.listener,l!==s&&r.isPropagationStopped())break e;Jg(r,a,c),s=l}else for(o=0;o<i.length;o++){if(a=i[o],l=a.instance,c=a.currentTarget,a=a.listener,l!==s&&r.isPropagationStopped())break e;Jg(r,a,c),s=l}}}if(Ac)throw n=Nf,Ac=!1,Nf=null,n}function gt(n,e){var t=e[Wf];t===void 0&&(t=e[Wf]=new Set);var i=n+"__bubble";t.has(i)||(Ev(e,n,2,!1),t.add(i))}function af(n,e,t){var i=0;e&&(i|=4),Ev(t,n,i,e)}var lc="_reactListening"+Math.random().toString(36).slice(2);function Ga(n){if(!n[lc]){n[lc]=!0,Ly.forEach(function(t){t!=="selectionchange"&&(VS.has(t)||af(t,!1,n),af(t,!0,n))});var e=n.nodeType===9?n:n.ownerDocument;e===null||e[lc]||(e[lc]=!0,af("selectionchange",!1,e))}}function Ev(n,e,t,i){switch(lv(e)){case 1:var r=rS;break;case 4:r=sS;break;default:r=Md}t=r.bind(null,e,t,n),r=void 0,!kf||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?n.addEventListener(e,t,{capture:!0,passive:r}):n.addEventListener(e,t,!0):r!==void 0?n.addEventListener(e,t,{passive:r}):n.addEventListener(e,t,!1)}function lf(n,e,t,i,r){var s=i;if((e&1)===0&&(e&2)===0&&i!==null)e:for(;;){if(i===null)return;var o=i.tag;if(o===3||o===4){var a=i.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(o===4)for(o=i.return;o!==null;){var l=o.tag;if((l===3||l===4)&&(l=o.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;o=o.return}for(;a!==null;){if(o=cs(a),o===null)return;if(l=o.tag,l===5||l===6){i=s=o;continue e}a=a.parentNode}}i=i.return}jy(function(){var c=s,u=yd(t),h=[];e:{var f=wv.get(n);if(f!==void 0){var p=wd,m=n;switch(n){case"keypress":if(yc(t)===0)break e;case"keydown":case"keyup":p=_S;break;case"focusin":m="focus",p=rf;break;case"focusout":m="blur",p=rf;break;case"beforeblur":case"afterblur":p=rf;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=Fg;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=lS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=wS;break;case xv:case _v:case Mv:p=hS;break;case Sv:p=ES;break;case"scroll":p=oS;break;case"wheel":p=AS;break;case"copy":case"cut":case"paste":p=dS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Hg}var x=(e&4)!==0,g=!x&&n==="scroll",d=x?f!==null?f+"Capture":null:f;x=[];for(var v=c,y;v!==null;){y=v;var M=y.stateNode;if(y.tag===5&&M!==null&&(y=M,d!==null&&(M=za(v,d),M!=null&&x.push(Wa(v,M,y)))),g)break;v=v.return}0<x.length&&(f=new p(f,m,null,t,u),h.push({event:f,listeners:x}))}}if((e&7)===0){e:{if(f=n==="mouseover"||n==="pointerover",p=n==="mouseout"||n==="pointerout",f&&t!==If&&(m=t.relatedTarget||t.fromElement)&&(cs(m)||m[Qi]))break e;if((p||f)&&(f=u.window===u?u:(f=u.ownerDocument)?f.defaultView||f.parentWindow:window,p?(m=t.relatedTarget||t.toElement,p=c,m=m?cs(m):null,m!==null&&(g=_s(m),m!==g||m.tag!==5&&m.tag!==6)&&(m=null)):(p=null,m=c),p!==m)){if(x=Fg,M="onMouseLeave",d="onMouseEnter",v="mouse",(n==="pointerout"||n==="pointerover")&&(x=Hg,M="onPointerLeave",d="onPointerEnter",v="pointer"),g=p==null?f:Js(p),y=m==null?f:Js(m),f=new x(M,v+"leave",p,t,u),f.target=g,f.relatedTarget=y,M=null,cs(u)===c&&(x=new x(d,v+"enter",m,t,u),x.target=y,x.relatedTarget=g,M=x),g=M,p&&m)t:{for(x=p,d=m,v=0,y=x;y;y=Ys(y))v++;for(y=0,M=d;M;M=Ys(M))y++;for(;0<v-y;)x=Ys(x),v--;for(;0<y-v;)d=Ys(d),y--;for(;v--;){if(x===d||d!==null&&x===d.alternate)break t;x=Ys(x),d=Ys(d)}x=null}else x=null;p!==null&&Qg(h,f,p,x,!1),m!==null&&g!==null&&Qg(h,g,m,x,!0)}}e:{if(f=c?Js(c):window,p=f.nodeName&&f.nodeName.toLowerCase(),p==="select"||p==="input"&&f.type==="file")var R=NS;else if(Wg(f))if(pv)R=OS;else{R=US;var T=DS}else(p=f.nodeName)&&p.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(R=zS);if(R&&(R=R(n,c))){dv(h,R,t,u);break e}T&&T(n,f,c),n==="focusout"&&(T=f._wrapperState)&&T.controlled&&f.type==="number"&&Tf(f,"number",f.value)}switch(T=c?Js(c):window,n){case"focusin":(Wg(T)||T.contentEditable==="true")&&(Zs=T,Of=c,Pa=null);break;case"focusout":Pa=Of=Zs=null;break;case"mousedown":Ff=!0;break;case"contextmenu":case"mouseup":case"dragend":Ff=!1,jg(h,t,u);break;case"selectionchange":if(HS)break;case"keydown":case"keyup":jg(h,t,u)}var b;if(Ed)e:{switch(n){case"compositionstart":var A="onCompositionStart";break e;case"compositionend":A="onCompositionEnd";break e;case"compositionupdate":A="onCompositionUpdate";break e}A=void 0}else $s?hv(n,t)&&(A="onCompositionEnd"):n==="keydown"&&t.keyCode===229&&(A="onCompositionStart");A&&(uv&&t.locale!=="ko"&&($s||A!=="onCompositionStart"?A==="onCompositionEnd"&&$s&&(b=cv()):(Ar=u,Sd="value"in Ar?Ar.value:Ar.textContent,$s=!0)),T=Lc(c,A),0<T.length&&(A=new Bg(A,n,null,t,u),h.push({event:A,listeners:T}),b?A.data=b:(b=fv(t),b!==null&&(A.data=b)))),(b=CS?PS(n,t):IS(n,t))&&(c=Lc(c,"onBeforeInput"),0<c.length&&(u=new Bg("onBeforeInput","beforeinput",null,t,u),h.push({event:u,listeners:c}),u.data=b))}bv(h,e)})}function Wa(n,e,t){return{instance:n,listener:e,currentTarget:t}}function Lc(n,e){for(var t=e+"Capture",i=[];n!==null;){var r=n,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=za(n,t),s!=null&&i.unshift(Wa(n,s,r)),s=za(n,e),s!=null&&i.push(Wa(n,s,r))),n=n.return}return i}function Ys(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function Qg(n,e,t,i,r){for(var s=e._reactName,o=[];t!==null&&t!==i;){var a=t,l=a.alternate,c=a.stateNode;if(l!==null&&l===i)break;a.tag===5&&c!==null&&(a=c,r?(l=za(t,s),l!=null&&o.unshift(Wa(t,l,a))):r||(l=za(t,s),l!=null&&o.push(Wa(t,l,a)))),t=t.return}o.length!==0&&n.push({event:e,listeners:o})}var GS=/\r\n?/g,WS=/\u0000|\uFFFD/g;function ey(n){return(typeof n=="string"?n:""+n).replace(GS,`
`).replace(WS,"")}function cc(n,e,t){if(e=ey(e),ey(n)!==e&&t)throw Error(Q(425))}function kc(){}var Bf=null,Hf=null;function Vf(n,e){return n==="textarea"||n==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Gf=typeof setTimeout=="function"?setTimeout:void 0,XS=typeof clearTimeout=="function"?clearTimeout:void 0,ty=typeof Promise=="function"?Promise:void 0,YS=typeof queueMicrotask=="function"?queueMicrotask:typeof ty<"u"?function(n){return ty.resolve(null).then(n).catch(qS)}:Gf;function qS(n){setTimeout(function(){throw n})}function cf(n,e){var t=e,i=0;do{var r=t.nextSibling;if(n.removeChild(t),r&&r.nodeType===8)if(t=r.data,t==="/$"){if(i===0){n.removeChild(r),Ba(e);return}i--}else t!=="$"&&t!=="$?"&&t!=="$!"||i++;t=r}while(t);Ba(e)}function Lr(n){for(;n!=null;n=n.nextSibling){var e=n.nodeType;if(e===1||e===3)break;if(e===8){if(e=n.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return n}function ny(n){n=n.previousSibling;for(var e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="$"||t==="$!"||t==="$?"){if(e===0)return n;e--}else t==="/$"&&e++}n=n.previousSibling}return null}var _o=Math.random().toString(36).slice(2),ki="__reactFiber$"+_o,Xa="__reactProps$"+_o,Qi="__reactContainer$"+_o,Wf="__reactEvents$"+_o,jS="__reactListeners$"+_o,$S="__reactHandles$"+_o;function cs(n){var e=n[ki];if(e)return e;for(var t=n.parentNode;t;){if(e=t[Qi]||t[ki]){if(t=e.alternate,e.child!==null||t!==null&&t.child!==null)for(n=ny(n);n!==null;){if(t=n[ki])return t;n=ny(n)}return e}n=t,t=n.parentNode}return null}function el(n){return n=n[ki]||n[Qi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Js(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(Q(33))}function Qc(n){return n[Xa]||null}var Xf=[],Qs=-1;function Br(n){return{current:n}}function yt(n){0>Qs||(n.current=Xf[Qs],Xf[Qs]=null,Qs--)}function ft(n,e){Qs++,Xf[Qs]=n.current,n.current=e}var Or={},sn=Br(Or),Pn=Br(!1),ps=Or;function fo(n,e){var t=n.type.contextTypes;if(!t)return Or;var i=n.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in t)r[s]=e[s];return i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=e,n.__reactInternalMemoizedMaskedChildContext=r),r}function In(n){return n=n.childContextTypes,n!=null}function Nc(){yt(Pn),yt(sn)}function iy(n,e,t){if(sn.current!==Or)throw Error(Q(168));ft(sn,e),ft(Pn,t)}function Tv(n,e,t){var i=n.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return t;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(Q(108,DM(n)||"Unknown",r));return Et({},t,i)}function Dc(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Or,ps=sn.current,ft(sn,n),ft(Pn,Pn.current),!0}function ry(n,e,t){var i=n.stateNode;if(!i)throw Error(Q(169));t?(n=Tv(n,e,ps),i.__reactInternalMemoizedMergedChildContext=n,yt(Pn),yt(sn),ft(sn,n)):yt(Pn),ft(Pn,t)}var ji=null,eu=!1,uf=!1;function Av(n){ji===null?ji=[n]:ji.push(n)}function ZS(n){eu=!0,Av(n)}function Hr(){if(!uf&&ji!==null){uf=!0;var n=0,e=st;try{var t=ji;for(st=1;n<t.length;n++){var i=t[n];do i=i(!0);while(i!==null)}ji=null,eu=!1}catch(r){throw ji!==null&&(ji=ji.slice(n+1)),Jy(vd,Hr),r}finally{st=e,uf=!1}}return null}var eo=[],to=0,Uc=null,zc=0,Qn=[],ei=0,ms=null,$i=1,Zi="";function as(n,e){eo[to++]=zc,eo[to++]=Uc,Uc=n,zc=e}function Rv(n,e,t){Qn[ei++]=$i,Qn[ei++]=Zi,Qn[ei++]=ms,ms=n;var i=$i;n=Zi;var r=32-yi(i)-1;i&=~(1<<r),t+=1;var s=32-yi(e)+r;if(30<s){var o=r-r%5;s=(i&(1<<o)-1).toString(32),i>>=o,r-=o,$i=1<<32-yi(e)+r|t<<r|i,Zi=s+n}else $i=1<<s|t<<r|i,Zi=n}function Ad(n){n.return!==null&&(as(n,1),Rv(n,1,0))}function Rd(n){for(;n===Uc;)Uc=eo[--to],eo[to]=null,zc=eo[--to],eo[to]=null;for(;n===ms;)ms=Qn[--ei],Qn[ei]=null,Zi=Qn[--ei],Qn[ei]=null,$i=Qn[--ei],Qn[ei]=null}var Bn=null,Fn=null,_t=!1,gi=null;function Cv(n,e){var t=ti(5,null,null,0);t.elementType="DELETED",t.stateNode=e,t.return=n,e=n.deletions,e===null?(n.deletions=[t],n.flags|=16):e.push(t)}function sy(n,e){switch(n.tag){case 5:var t=n.type;return e=e.nodeType!==1||t.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(n.stateNode=e,Bn=n,Fn=Lr(e.firstChild),!0):!1;case 6:return e=n.pendingProps===""||e.nodeType!==3?null:e,e!==null?(n.stateNode=e,Bn=n,Fn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(t=ms!==null?{id:$i,overflow:Zi}:null,n.memoizedState={dehydrated:e,treeContext:t,retryLane:1073741824},t=ti(18,null,null,0),t.stateNode=e,t.return=n,n.child=t,Bn=n,Fn=null,!0):!1;default:return!1}}function Yf(n){return(n.mode&1)!==0&&(n.flags&128)===0}function qf(n){if(_t){var e=Fn;if(e){var t=e;if(!sy(n,e)){if(Yf(n))throw Error(Q(418));e=Lr(t.nextSibling);var i=Bn;e&&sy(n,e)?Cv(i,t):(n.flags=n.flags&-4097|2,_t=!1,Bn=n)}}else{if(Yf(n))throw Error(Q(418));n.flags=n.flags&-4097|2,_t=!1,Bn=n}}}function oy(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Bn=n}function uc(n){if(n!==Bn)return!1;if(!_t)return oy(n),_t=!0,!1;var e;if((e=n.tag!==3)&&!(e=n.tag!==5)&&(e=n.type,e=e!=="head"&&e!=="body"&&!Vf(n.type,n.memoizedProps)),e&&(e=Fn)){if(Yf(n))throw Pv(),Error(Q(418));for(;e;)Cv(n,e),e=Lr(e.nextSibling)}if(oy(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(Q(317));e:{for(n=n.nextSibling,e=0;n;){if(n.nodeType===8){var t=n.data;if(t==="/$"){if(e===0){Fn=Lr(n.nextSibling);break e}e--}else t!=="$"&&t!=="$!"&&t!=="$?"||e++}n=n.nextSibling}Fn=null}}else Fn=Bn?Lr(n.stateNode.nextSibling):null;return!0}function Pv(){for(var n=Fn;n;)n=Lr(n.nextSibling)}function po(){Fn=Bn=null,_t=!1}function Cd(n){gi===null?gi=[n]:gi.push(n)}var KS=nr.ReactCurrentBatchConfig;function va(n,e,t){if(n=t.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(Q(309));var i=t.stateNode}if(!i)throw Error(Q(147,n));var r=i,s=""+n;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var a=r.refs;o===null?delete a[s]:a[s]=o},e._stringRef=s,e)}if(typeof n!="string")throw Error(Q(284));if(!t._owner)throw Error(Q(290,n))}return n}function hc(n,e){throw n=Object.prototype.toString.call(e),Error(Q(31,n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n))}function ay(n){var e=n._init;return e(n._payload)}function Iv(n){function e(d,v){if(n){var y=d.deletions;y===null?(d.deletions=[v],d.flags|=16):y.push(v)}}function t(d,v){if(!n)return null;for(;v!==null;)e(d,v),v=v.sibling;return null}function i(d,v){for(d=new Map;v!==null;)v.key!==null?d.set(v.key,v):d.set(v.index,v),v=v.sibling;return d}function r(d,v){return d=Ur(d,v),d.index=0,d.sibling=null,d}function s(d,v,y){return d.index=y,n?(y=d.alternate,y!==null?(y=y.index,y<v?(d.flags|=2,v):y):(d.flags|=2,v)):(d.flags|=1048576,v)}function o(d){return n&&d.alternate===null&&(d.flags|=2),d}function a(d,v,y,M){return v===null||v.tag!==6?(v=yf(y,d.mode,M),v.return=d,v):(v=r(v,y),v.return=d,v)}function l(d,v,y,M){var R=y.type;return R===js?u(d,v,y.props.children,M,y.key):v!==null&&(v.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===wr&&ay(R)===v.type)?(M=r(v,y.props),M.ref=va(d,v,y),M.return=d,M):(M=bc(y.type,y.key,y.props,null,d.mode,M),M.ref=va(d,v,y),M.return=d,M)}function c(d,v,y,M){return v===null||v.tag!==4||v.stateNode.containerInfo!==y.containerInfo||v.stateNode.implementation!==y.implementation?(v=vf(y,d.mode,M),v.return=d,v):(v=r(v,y.children||[]),v.return=d,v)}function u(d,v,y,M,R){return v===null||v.tag!==7?(v=ds(y,d.mode,M,R),v.return=d,v):(v=r(v,y),v.return=d,v)}function h(d,v,y){if(typeof v=="string"&&v!==""||typeof v=="number")return v=yf(""+v,d.mode,y),v.return=d,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Zl:return y=bc(v.type,v.key,v.props,null,d.mode,y),y.ref=va(d,null,v),y.return=d,y;case qs:return v=vf(v,d.mode,y),v.return=d,v;case wr:var M=v._init;return h(d,M(v._payload),y)}if(wa(v)||pa(v))return v=ds(v,d.mode,y,null),v.return=d,v;hc(d,v)}return null}function f(d,v,y,M){var R=v!==null?v.key:null;if(typeof y=="string"&&y!==""||typeof y=="number")return R!==null?null:a(d,v,""+y,M);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Zl:return y.key===R?l(d,v,y,M):null;case qs:return y.key===R?c(d,v,y,M):null;case wr:return R=y._init,f(d,v,R(y._payload),M)}if(wa(y)||pa(y))return R!==null?null:u(d,v,y,M,null);hc(d,y)}return null}function p(d,v,y,M,R){if(typeof M=="string"&&M!==""||typeof M=="number")return d=d.get(y)||null,a(v,d,""+M,R);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case Zl:return d=d.get(M.key===null?y:M.key)||null,l(v,d,M,R);case qs:return d=d.get(M.key===null?y:M.key)||null,c(v,d,M,R);case wr:var T=M._init;return p(d,v,y,T(M._payload),R)}if(wa(M)||pa(M))return d=d.get(y)||null,u(v,d,M,R,null);hc(v,M)}return null}function m(d,v,y,M){for(var R=null,T=null,b=v,A=v=0,L=null;b!==null&&A<y.length;A++){b.index>A?(L=b,b=null):L=b.sibling;var _=f(d,b,y[A],M);if(_===null){b===null&&(b=L);break}n&&b&&_.alternate===null&&e(d,b),v=s(_,v,A),T===null?R=_:T.sibling=_,T=_,b=L}if(A===y.length)return t(d,b),_t&&as(d,A),R;if(b===null){for(;A<y.length;A++)b=h(d,y[A],M),b!==null&&(v=s(b,v,A),T===null?R=b:T.sibling=b,T=b);return _t&&as(d,A),R}for(b=i(d,b);A<y.length;A++)L=p(b,d,A,y[A],M),L!==null&&(n&&L.alternate!==null&&b.delete(L.key===null?A:L.key),v=s(L,v,A),T===null?R=L:T.sibling=L,T=L);return n&&b.forEach(function(S){return e(d,S)}),_t&&as(d,A),R}function x(d,v,y,M){var R=pa(y);if(typeof R!="function")throw Error(Q(150));if(y=R.call(y),y==null)throw Error(Q(151));for(var T=R=null,b=v,A=v=0,L=null,_=y.next();b!==null&&!_.done;A++,_=y.next()){b.index>A?(L=b,b=null):L=b.sibling;var S=f(d,b,_.value,M);if(S===null){b===null&&(b=L);break}n&&b&&S.alternate===null&&e(d,b),v=s(S,v,A),T===null?R=S:T.sibling=S,T=S,b=L}if(_.done)return t(d,b),_t&&as(d,A),R;if(b===null){for(;!_.done;A++,_=y.next())_=h(d,_.value,M),_!==null&&(v=s(_,v,A),T===null?R=_:T.sibling=_,T=_);return _t&&as(d,A),R}for(b=i(d,b);!_.done;A++,_=y.next())_=p(b,d,A,_.value,M),_!==null&&(n&&_.alternate!==null&&b.delete(_.key===null?A:_.key),v=s(_,v,A),T===null?R=_:T.sibling=_,T=_);return n&&b.forEach(function(U){return e(d,U)}),_t&&as(d,A),R}function g(d,v,y,M){if(typeof y=="object"&&y!==null&&y.type===js&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Zl:e:{for(var R=y.key,T=v;T!==null;){if(T.key===R){if(R=y.type,R===js){if(T.tag===7){t(d,T.sibling),v=r(T,y.props.children),v.return=d,d=v;break e}}else if(T.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===wr&&ay(R)===T.type){t(d,T.sibling),v=r(T,y.props),v.ref=va(d,T,y),v.return=d,d=v;break e}t(d,T);break}else e(d,T);T=T.sibling}y.type===js?(v=ds(y.props.children,d.mode,M,y.key),v.return=d,d=v):(M=bc(y.type,y.key,y.props,null,d.mode,M),M.ref=va(d,v,y),M.return=d,d=M)}return o(d);case qs:e:{for(T=y.key;v!==null;){if(v.key===T)if(v.tag===4&&v.stateNode.containerInfo===y.containerInfo&&v.stateNode.implementation===y.implementation){t(d,v.sibling),v=r(v,y.children||[]),v.return=d,d=v;break e}else{t(d,v);break}else e(d,v);v=v.sibling}v=vf(y,d.mode,M),v.return=d,d=v}return o(d);case wr:return T=y._init,g(d,v,T(y._payload),M)}if(wa(y))return m(d,v,y,M);if(pa(y))return x(d,v,y,M);hc(d,y)}return typeof y=="string"&&y!==""||typeof y=="number"?(y=""+y,v!==null&&v.tag===6?(t(d,v.sibling),v=r(v,y),v.return=d,d=v):(t(d,v),v=yf(y,d.mode,M),v.return=d,d=v),o(d)):t(d,v)}return g}var mo=Iv(!0),Lv=Iv(!1),Oc=Br(null),Fc=null,no=null,Pd=null;function Id(){Pd=no=Fc=null}function Ld(n){var e=Oc.current;yt(Oc),n._currentValue=e}function jf(n,e,t){for(;n!==null;){var i=n.alternate;if((n.childLanes&e)!==e?(n.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),n===t)break;n=n.return}}function co(n,e){Fc=n,Pd=no=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&e)!==0&&(Cn=!0),n.firstContext=null)}function ii(n){var e=n._currentValue;if(Pd!==n)if(n={context:n,memoizedValue:e,next:null},no===null){if(Fc===null)throw Error(Q(308));no=n,Fc.dependencies={lanes:0,firstContext:n}}else no=no.next=n;return e}var us=null;function kd(n){us===null?us=[n]:us.push(n)}function kv(n,e,t,i){var r=e.interleaved;return r===null?(t.next=t,kd(e)):(t.next=r.next,r.next=t),e.interleaved=t,er(n,i)}function er(n,e){n.lanes|=e;var t=n.alternate;for(t!==null&&(t.lanes|=e),t=n,n=n.return;n!==null;)n.childLanes|=e,t=n.alternate,t!==null&&(t.childLanes|=e),t=n,n=n.return;return t.tag===3?t.stateNode:null}var br=!1;function Nd(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Nv(n,e){n=n.updateQueue,e.updateQueue===n&&(e.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ki(n,e){return{eventTime:n,lane:e,tag:0,payload:null,callback:null,next:null}}function kr(n,e,t){var i=n.updateQueue;if(i===null)return null;if(i=i.shared,(Ze&2)!==0){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,er(n,t)}return r=i.interleaved,r===null?(e.next=e,kd(i)):(e.next=r.next,r.next=e),i.interleaved=e,er(n,t)}function vc(n,e,t){if(e=e.updateQueue,e!==null&&(e=e.shared,(t&4194240)!==0)){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,xd(n,t)}}function ly(n,e){var t=n.updateQueue,i=n.alternate;if(i!==null&&(i=i.updateQueue,t===i)){var r=null,s=null;if(t=t.firstBaseUpdate,t!==null){do{var o={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};s===null?r=s=o:s=s.next=o,t=t.next}while(t!==null);s===null?r=s=e:s=s.next=e}else r=s=e;t={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},n.updateQueue=t;return}n=t.lastBaseUpdate,n===null?t.firstBaseUpdate=e:n.next=e,t.lastBaseUpdate=e}function Bc(n,e,t,i){var r=n.updateQueue;br=!1;var s=r.firstBaseUpdate,o=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,c=l.next;l.next=null,o===null?s=c:o.next=c,o=l;var u=n.alternate;u!==null&&(u=u.updateQueue,a=u.lastBaseUpdate,a!==o&&(a===null?u.firstBaseUpdate=c:a.next=c,u.lastBaseUpdate=l))}if(s!==null){var h=r.baseState;o=0,u=c=l=null,a=s;do{var f=a.lane,p=a.eventTime;if((i&f)===f){u!==null&&(u=u.next={eventTime:p,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var m=n,x=a;switch(f=e,p=t,x.tag){case 1:if(m=x.payload,typeof m=="function"){h=m.call(p,h,f);break e}h=m;break e;case 3:m.flags=m.flags&-65537|128;case 0:if(m=x.payload,f=typeof m=="function"?m.call(p,h,f):m,f==null)break e;h=Et({},h,f);break e;case 2:br=!0}}a.callback!==null&&a.lane!==0&&(n.flags|=64,f=r.effects,f===null?r.effects=[a]:f.push(a))}else p={eventTime:p,lane:f,tag:a.tag,payload:a.payload,callback:a.callback,next:null},u===null?(c=u=p,l=h):u=u.next=p,o|=f;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;f=a,a=f.next,f.next=null,r.lastBaseUpdate=f,r.shared.pending=null}}while(!0);if(u===null&&(l=h),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do o|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);ys|=o,n.lanes=o,n.memoizedState=h}}function cy(n,e,t){if(n=e.effects,e.effects=null,n!==null)for(e=0;e<n.length;e++){var i=n[e],r=i.callback;if(r!==null){if(i.callback=null,i=t,typeof r!="function")throw Error(Q(191,r));r.call(i)}}}var tl={},Di=Br(tl),Ya=Br(tl),qa=Br(tl);function hs(n){if(n===tl)throw Error(Q(174));return n}function Dd(n,e){switch(ft(qa,e),ft(Ya,n),ft(Di,tl),n=e.nodeType,n){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Rf(null,"");break;default:n=n===8?e.parentNode:e,e=n.namespaceURI||null,n=n.tagName,e=Rf(e,n)}yt(Di),ft(Di,e)}function go(){yt(Di),yt(Ya),yt(qa)}function Dv(n){hs(qa.current);var e=hs(Di.current),t=Rf(e,n.type);e!==t&&(ft(Ya,n),ft(Di,t))}function Ud(n){Ya.current===n&&(yt(Di),yt(Ya))}var wt=Br(0);function Hc(n){for(var e=n;e!==null;){if(e.tag===13){var t=e.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var hf=[];function zd(){for(var n=0;n<hf.length;n++)hf[n]._workInProgressVersionPrimary=null;hf.length=0}var xc=nr.ReactCurrentDispatcher,ff=nr.ReactCurrentBatchConfig,gs=0,bt=null,Ot=null,Vt=null,Vc=!1,Ia=!1,ja=0,JS=0;function tn(){throw Error(Q(321))}function Od(n,e){if(e===null)return!1;for(var t=0;t<e.length&&t<n.length;t++)if(!xi(n[t],e[t]))return!1;return!0}function Fd(n,e,t,i,r,s){if(gs=s,bt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,xc.current=n===null||n.memoizedState===null?nw:iw,n=t(i,r),Ia){s=0;do{if(Ia=!1,ja=0,25<=s)throw Error(Q(301));s+=1,Vt=Ot=null,e.updateQueue=null,xc.current=rw,n=t(i,r)}while(Ia)}if(xc.current=Gc,e=Ot!==null&&Ot.next!==null,gs=0,Vt=Ot=bt=null,Vc=!1,e)throw Error(Q(300));return n}function Bd(){var n=ja!==0;return ja=0,n}function Li(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Vt===null?bt.memoizedState=Vt=n:Vt=Vt.next=n,Vt}function ri(){if(Ot===null){var n=bt.alternate;n=n!==null?n.memoizedState:null}else n=Ot.next;var e=Vt===null?bt.memoizedState:Vt.next;if(e!==null)Vt=e,Ot=n;else{if(n===null)throw Error(Q(310));Ot=n,n={memoizedState:Ot.memoizedState,baseState:Ot.baseState,baseQueue:Ot.baseQueue,queue:Ot.queue,next:null},Vt===null?bt.memoizedState=Vt=n:Vt=Vt.next=n}return Vt}function $a(n,e){return typeof e=="function"?e(n):e}function df(n){var e=ri(),t=e.queue;if(t===null)throw Error(Q(311));t.lastRenderedReducer=n;var i=Ot,r=i.baseQueue,s=t.pending;if(s!==null){if(r!==null){var o=r.next;r.next=s.next,s.next=o}i.baseQueue=r=s,t.pending=null}if(r!==null){s=r.next,i=i.baseState;var a=o=null,l=null,c=s;do{var u=c.lane;if((gs&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:n(i,c.action);else{var h={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(a=l=h,o=i):l=l.next=h,bt.lanes|=u,ys|=u}c=c.next}while(c!==null&&c!==s);l===null?o=i:l.next=a,xi(i,e.memoizedState)||(Cn=!0),e.memoizedState=i,e.baseState=o,e.baseQueue=l,t.lastRenderedState=i}if(n=t.interleaved,n!==null){r=n;do s=r.lane,bt.lanes|=s,ys|=s,r=r.next;while(r!==n)}else r===null&&(t.lanes=0);return[e.memoizedState,t.dispatch]}function pf(n){var e=ri(),t=e.queue;if(t===null)throw Error(Q(311));t.lastRenderedReducer=n;var i=t.dispatch,r=t.pending,s=e.memoizedState;if(r!==null){t.pending=null;var o=r=r.next;do s=n(s,o.action),o=o.next;while(o!==r);xi(s,e.memoizedState)||(Cn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),t.lastRenderedState=s}return[s,i]}function Uv(){}function zv(n,e){var t=bt,i=ri(),r=e(),s=!xi(i.memoizedState,r);if(s&&(i.memoizedState=r,Cn=!0),i=i.queue,Hd(Bv.bind(null,t,i,n),[n]),i.getSnapshot!==e||s||Vt!==null&&Vt.memoizedState.tag&1){if(t.flags|=2048,Za(9,Fv.bind(null,t,i,r,e),void 0,null),Gt===null)throw Error(Q(349));(gs&30)!==0||Ov(t,e,r)}return r}function Ov(n,e,t){n.flags|=16384,n={getSnapshot:e,value:t},e=bt.updateQueue,e===null?(e={lastEffect:null,stores:null},bt.updateQueue=e,e.stores=[n]):(t=e.stores,t===null?e.stores=[n]:t.push(n))}function Fv(n,e,t,i){e.value=t,e.getSnapshot=i,Hv(e)&&Vv(n)}function Bv(n,e,t){return t(function(){Hv(e)&&Vv(n)})}function Hv(n){var e=n.getSnapshot;n=n.value;try{var t=e();return!xi(n,t)}catch{return!0}}function Vv(n){var e=er(n,1);e!==null&&vi(e,n,1,-1)}function uy(n){var e=Li();return typeof n=="function"&&(n=n()),e.memoizedState=e.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:n},e.queue=n,n=n.dispatch=tw.bind(null,bt,n),[e.memoizedState,n]}function Za(n,e,t,i){return n={tag:n,create:e,destroy:t,deps:i,next:null},e=bt.updateQueue,e===null?(e={lastEffect:null,stores:null},bt.updateQueue=e,e.lastEffect=n.next=n):(t=e.lastEffect,t===null?e.lastEffect=n.next=n:(i=t.next,t.next=n,n.next=i,e.lastEffect=n)),n}function Gv(){return ri().memoizedState}function _c(n,e,t,i){var r=Li();bt.flags|=n,r.memoizedState=Za(1|e,t,void 0,i===void 0?null:i)}function tu(n,e,t,i){var r=ri();i=i===void 0?null:i;var s=void 0;if(Ot!==null){var o=Ot.memoizedState;if(s=o.destroy,i!==null&&Od(i,o.deps)){r.memoizedState=Za(e,t,s,i);return}}bt.flags|=n,r.memoizedState=Za(1|e,t,s,i)}function hy(n,e){return _c(8390656,8,n,e)}function Hd(n,e){return tu(2048,8,n,e)}function Wv(n,e){return tu(4,2,n,e)}function Xv(n,e){return tu(4,4,n,e)}function Yv(n,e){if(typeof e=="function")return n=n(),e(n),function(){e(null)};if(e!=null)return n=n(),e.current=n,function(){e.current=null}}function qv(n,e,t){return t=t!=null?t.concat([n]):null,tu(4,4,Yv.bind(null,e,n),t)}function Vd(){}function jv(n,e){var t=ri();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Od(e,i[1])?i[0]:(t.memoizedState=[n,e],n)}function $v(n,e){var t=ri();e=e===void 0?null:e;var i=t.memoizedState;return i!==null&&e!==null&&Od(e,i[1])?i[0]:(n=n(),t.memoizedState=[n,e],n)}function Zv(n,e,t){return(gs&21)===0?(n.baseState&&(n.baseState=!1,Cn=!0),n.memoizedState=t):(xi(t,e)||(t=tv(),bt.lanes|=t,ys|=t,n.baseState=!0),e)}function QS(n,e){var t=st;st=t!==0&&4>t?t:4,n(!0);var i=ff.transition;ff.transition={};try{n(!1),e()}finally{st=t,ff.transition=i}}function Kv(){return ri().memoizedState}function ew(n,e,t){var i=Dr(n);if(t={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null},Jv(n))Qv(e,t);else if(t=kv(n,e,t,i),t!==null){var r=yn();vi(t,n,i,r),ex(t,e,i)}}function tw(n,e,t){var i=Dr(n),r={lane:i,action:t,hasEagerState:!1,eagerState:null,next:null};if(Jv(n))Qv(e,r);else{var s=n.alternate;if(n.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,a=s(o,t);if(r.hasEagerState=!0,r.eagerState=a,xi(a,o)){var l=e.interleaved;l===null?(r.next=r,kd(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}t=kv(n,e,r,i),t!==null&&(r=yn(),vi(t,n,i,r),ex(t,e,i))}}function Jv(n){var e=n.alternate;return n===bt||e!==null&&e===bt}function Qv(n,e){Ia=Vc=!0;var t=n.pending;t===null?e.next=e:(e.next=t.next,t.next=e),n.pending=e}function ex(n,e,t){if((t&4194240)!==0){var i=e.lanes;i&=n.pendingLanes,t|=i,e.lanes=t,xd(n,t)}}var Gc={readContext:ii,useCallback:tn,useContext:tn,useEffect:tn,useImperativeHandle:tn,useInsertionEffect:tn,useLayoutEffect:tn,useMemo:tn,useReducer:tn,useRef:tn,useState:tn,useDebugValue:tn,useDeferredValue:tn,useTransition:tn,useMutableSource:tn,useSyncExternalStore:tn,useId:tn,unstable_isNewReconciler:!1},nw={readContext:ii,useCallback:function(n,e){return Li().memoizedState=[n,e===void 0?null:e],n},useContext:ii,useEffect:hy,useImperativeHandle:function(n,e,t){return t=t!=null?t.concat([n]):null,_c(4194308,4,Yv.bind(null,e,n),t)},useLayoutEffect:function(n,e){return _c(4194308,4,n,e)},useInsertionEffect:function(n,e){return _c(4,2,n,e)},useMemo:function(n,e){var t=Li();return e=e===void 0?null:e,n=n(),t.memoizedState=[n,e],n},useReducer:function(n,e,t){var i=Li();return e=t!==void 0?t(e):e,i.memoizedState=i.baseState=e,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:e},i.queue=n,n=n.dispatch=ew.bind(null,bt,n),[i.memoizedState,n]},useRef:function(n){var e=Li();return n={current:n},e.memoizedState=n},useState:uy,useDebugValue:Vd,useDeferredValue:function(n){return Li().memoizedState=n},useTransition:function(){var n=uy(!1),e=n[0];return n=QS.bind(null,n[1]),Li().memoizedState=n,[e,n]},useMutableSource:function(){},useSyncExternalStore:function(n,e,t){var i=bt,r=Li();if(_t){if(t===void 0)throw Error(Q(407));t=t()}else{if(t=e(),Gt===null)throw Error(Q(349));(gs&30)!==0||Ov(i,e,t)}r.memoizedState=t;var s={value:t,getSnapshot:e};return r.queue=s,hy(Bv.bind(null,i,s,n),[n]),i.flags|=2048,Za(9,Fv.bind(null,i,s,t,e),void 0,null),t},useId:function(){var n=Li(),e=Gt.identifierPrefix;if(_t){var t=Zi,i=$i;t=(i&~(1<<32-yi(i)-1)).toString(32)+t,e=":"+e+"R"+t,t=ja++,0<t&&(e+="H"+t.toString(32)),e+=":"}else t=JS++,e=":"+e+"r"+t.toString(32)+":";return n.memoizedState=e},unstable_isNewReconciler:!1},iw={readContext:ii,useCallback:jv,useContext:ii,useEffect:Hd,useImperativeHandle:qv,useInsertionEffect:Wv,useLayoutEffect:Xv,useMemo:$v,useReducer:df,useRef:Gv,useState:function(){return df($a)},useDebugValue:Vd,useDeferredValue:function(n){var e=ri();return Zv(e,Ot.memoizedState,n)},useTransition:function(){var n=df($a)[0],e=ri().memoizedState;return[n,e]},useMutableSource:Uv,useSyncExternalStore:zv,useId:Kv,unstable_isNewReconciler:!1},rw={readContext:ii,useCallback:jv,useContext:ii,useEffect:Hd,useImperativeHandle:qv,useInsertionEffect:Wv,useLayoutEffect:Xv,useMemo:$v,useReducer:pf,useRef:Gv,useState:function(){return pf($a)},useDebugValue:Vd,useDeferredValue:function(n){var e=ri();return Ot===null?e.memoizedState=n:Zv(e,Ot.memoizedState,n)},useTransition:function(){var n=pf($a)[0],e=ri().memoizedState;return[n,e]},useMutableSource:Uv,useSyncExternalStore:zv,useId:Kv,unstable_isNewReconciler:!1};function pi(n,e){if(n&&n.defaultProps){e=Et({},e),n=n.defaultProps;for(var t in n)e[t]===void 0&&(e[t]=n[t]);return e}return e}function $f(n,e,t,i){e=n.memoizedState,t=t(i,e),t=t==null?e:Et({},e,t),n.memoizedState=t,n.lanes===0&&(n.updateQueue.baseState=t)}var nu={isMounted:function(n){return(n=n._reactInternals)?_s(n)===n:!1},enqueueSetState:function(n,e,t){n=n._reactInternals;var i=yn(),r=Dr(n),s=Ki(i,r);s.payload=e,t!=null&&(s.callback=t),e=kr(n,s,r),e!==null&&(vi(e,n,r,i),vc(e,n,r))},enqueueReplaceState:function(n,e,t){n=n._reactInternals;var i=yn(),r=Dr(n),s=Ki(i,r);s.tag=1,s.payload=e,t!=null&&(s.callback=t),e=kr(n,s,r),e!==null&&(vi(e,n,r,i),vc(e,n,r))},enqueueForceUpdate:function(n,e){n=n._reactInternals;var t=yn(),i=Dr(n),r=Ki(t,i);r.tag=2,e!=null&&(r.callback=e),e=kr(n,r,i),e!==null&&(vi(e,n,i,t),vc(e,n,i))}};function fy(n,e,t,i,r,s,o){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(i,s,o):e.prototype&&e.prototype.isPureReactComponent?!Va(t,i)||!Va(r,s):!0}function tx(n,e,t){var i=!1,r=Or,s=e.contextType;return typeof s=="object"&&s!==null?s=ii(s):(r=In(e)?ps:sn.current,i=e.contextTypes,s=(i=i!=null)?fo(n,r):Or),e=new e(t,s),n.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=nu,n.stateNode=e,e._reactInternals=n,i&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=s),e}function dy(n,e,t,i){n=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(t,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(t,i),e.state!==n&&nu.enqueueReplaceState(e,e.state,null)}function Zf(n,e,t,i){var r=n.stateNode;r.props=t,r.state=n.memoizedState,r.refs={},Nd(n);var s=e.contextType;typeof s=="object"&&s!==null?r.context=ii(s):(s=In(e)?ps:sn.current,r.context=fo(n,s)),r.state=n.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&($f(n,e,s,t),r.state=n.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&nu.enqueueReplaceState(r,r.state,null),Bc(n,t,r,i),r.state=n.memoizedState),typeof r.componentDidMount=="function"&&(n.flags|=4194308)}function yo(n,e){try{var t="",i=e;do t+=NM(i),i=i.return;while(i);var r=t}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:n,source:e,stack:r,digest:null}}function mf(n,e,t){return{value:n,source:null,stack:t??null,digest:e??null}}function Kf(n,e){try{console.error(e.value)}catch(t){setTimeout(function(){throw t})}}var sw=typeof WeakMap=="function"?WeakMap:Map;function nx(n,e,t){t=Ki(-1,t),t.tag=3,t.payload={element:null};var i=e.value;return t.callback=function(){Xc||(Xc=!0,ad=i),Kf(n,e)},t}function ix(n,e,t){t=Ki(-1,t),t.tag=3;var i=n.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;t.payload=function(){return i(r)},t.callback=function(){Kf(n,e)}}var s=n.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){Kf(n,e),typeof i!="function"&&(Nr===null?Nr=new Set([this]):Nr.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),t}function py(n,e,t){var i=n.pingCache;if(i===null){i=n.pingCache=new sw;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(t)||(r.add(t),n=xw.bind(null,n,e,t),e.then(n,n))}function my(n){do{var e;if((e=n.tag===13)&&(e=n.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return n;n=n.return}while(n!==null);return null}function gy(n,e,t,i,r){return(n.mode&1)===0?(n===e?n.flags|=65536:(n.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(e=Ki(-1,1),e.tag=2,kr(t,e,1))),t.lanes|=1),n):(n.flags|=65536,n.lanes=r,n)}var ow=nr.ReactCurrentOwner,Cn=!1;function gn(n,e,t,i){e.child=n===null?Lv(e,null,t,i):mo(e,n.child,t,i)}function yy(n,e,t,i,r){t=t.render;var s=e.ref;return co(e,r),i=Fd(n,e,t,i,s,r),t=Bd(),n!==null&&!Cn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,tr(n,e,r)):(_t&&t&&Ad(e),e.flags|=1,gn(n,e,i,r),e.child)}function vy(n,e,t,i,r){if(n===null){var s=t.type;return typeof s=="function"&&!Zd(s)&&s.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0?(e.tag=15,e.type=s,rx(n,e,s,i,r)):(n=bc(t.type,null,i,e,e.mode,r),n.ref=e.ref,n.return=e,e.child=n)}if(s=n.child,(n.lanes&r)===0){var o=s.memoizedProps;if(t=t.compare,t=t!==null?t:Va,t(o,i)&&n.ref===e.ref)return tr(n,e,r)}return e.flags|=1,n=Ur(s,i),n.ref=e.ref,n.return=e,e.child=n}function rx(n,e,t,i,r){if(n!==null){var s=n.memoizedProps;if(Va(s,i)&&n.ref===e.ref)if(Cn=!1,e.pendingProps=i=s,(n.lanes&r)!==0)(n.flags&131072)!==0&&(Cn=!0);else return e.lanes=n.lanes,tr(n,e,r)}return Jf(n,e,t,i,r)}function sx(n,e,t){var i=e.pendingProps,r=i.children,s=n!==null?n.memoizedState:null;if(i.mode==="hidden")if((e.mode&1)===0)e.memoizedState={baseLanes:0,cachePool:null,transitions:null},ft(ro,On),On|=t;else{if((t&1073741824)===0)return n=s!==null?s.baseLanes|t:t,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:n,cachePool:null,transitions:null},e.updateQueue=null,ft(ro,On),On|=n,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:t,ft(ro,On),On|=i}else s!==null?(i=s.baseLanes|t,e.memoizedState=null):i=t,ft(ro,On),On|=i;return gn(n,e,r,t),e.child}function ox(n,e){var t=e.ref;(n===null&&t!==null||n!==null&&n.ref!==t)&&(e.flags|=512,e.flags|=2097152)}function Jf(n,e,t,i,r){var s=In(t)?ps:sn.current;return s=fo(e,s),co(e,r),t=Fd(n,e,t,i,s,r),i=Bd(),n!==null&&!Cn?(e.updateQueue=n.updateQueue,e.flags&=-2053,n.lanes&=~r,tr(n,e,r)):(_t&&i&&Ad(e),e.flags|=1,gn(n,e,t,r),e.child)}function xy(n,e,t,i,r){if(In(t)){var s=!0;Dc(e)}else s=!1;if(co(e,r),e.stateNode===null)Mc(n,e),tx(e,t,i),Zf(e,t,i,r),i=!0;else if(n===null){var o=e.stateNode,a=e.memoizedProps;o.props=a;var l=o.context,c=t.contextType;typeof c=="object"&&c!==null?c=ii(c):(c=In(t)?ps:sn.current,c=fo(e,c));var u=t.getDerivedStateFromProps,h=typeof u=="function"||typeof o.getSnapshotBeforeUpdate=="function";h||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==i||l!==c)&&dy(e,o,i,c),br=!1;var f=e.memoizedState;o.state=f,Bc(e,i,o,r),l=e.memoizedState,a!==i||f!==l||Pn.current||br?(typeof u=="function"&&($f(e,t,u,i),l=e.memoizedState),(a=br||fy(e,t,a,i,f,l,c))?(h||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),o.props=i,o.state=l,o.context=c,i=a):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{o=e.stateNode,Nv(n,e),a=e.memoizedProps,c=e.type===e.elementType?a:pi(e.type,a),o.props=c,h=e.pendingProps,f=o.context,l=t.contextType,typeof l=="object"&&l!==null?l=ii(l):(l=In(t)?ps:sn.current,l=fo(e,l));var p=t.getDerivedStateFromProps;(u=typeof p=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==h||f!==l)&&dy(e,o,i,l),br=!1,f=e.memoizedState,o.state=f,Bc(e,i,o,r);var m=e.memoizedState;a!==h||f!==m||Pn.current||br?(typeof p=="function"&&($f(e,t,p,i),m=e.memoizedState),(c=br||fy(e,t,c,i,f,m,l)||!1)?(u||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(i,m,l),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(i,m,l)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&f===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&f===n.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=m),o.props=i,o.state=m,o.context=l,i=c):(typeof o.componentDidUpdate!="function"||a===n.memoizedProps&&f===n.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===n.memoizedProps&&f===n.memoizedState||(e.flags|=1024),i=!1)}return Qf(n,e,t,i,s,r)}function Qf(n,e,t,i,r,s){ox(n,e);var o=(e.flags&128)!==0;if(!i&&!o)return r&&ry(e,t,!1),tr(n,e,s);i=e.stateNode,ow.current=e;var a=o&&typeof t.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,n!==null&&o?(e.child=mo(e,n.child,null,s),e.child=mo(e,null,a,s)):gn(n,e,a,s),e.memoizedState=i.state,r&&ry(e,t,!0),e.child}function ax(n){var e=n.stateNode;e.pendingContext?iy(n,e.pendingContext,e.pendingContext!==e.context):e.context&&iy(n,e.context,!1),Dd(n,e.containerInfo)}function _y(n,e,t,i,r){return po(),Cd(r),e.flags|=256,gn(n,e,t,i),e.child}var ed={dehydrated:null,treeContext:null,retryLane:0};function td(n){return{baseLanes:n,cachePool:null,transitions:null}}function lx(n,e,t){var i=e.pendingProps,r=wt.current,s=!1,o=(e.flags&128)!==0,a;if((a=o)||(a=n!==null&&n.memoizedState===null?!1:(r&2)!==0),a?(s=!0,e.flags&=-129):(n===null||n.memoizedState!==null)&&(r|=1),ft(wt,r&1),n===null)return qf(e),n=e.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((e.mode&1)===0?e.lanes=1:n.data==="$!"?e.lanes=8:e.lanes=1073741824,null):(o=i.children,n=i.fallback,s?(i=e.mode,s=e.child,o={mode:"hidden",children:o},(i&1)===0&&s!==null?(s.childLanes=0,s.pendingProps=o):s=su(o,i,0,null),n=ds(n,i,t,null),s.return=e,n.return=e,s.sibling=n,e.child=s,e.child.memoizedState=td(t),e.memoizedState=ed,n):Gd(e,o));if(r=n.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return aw(n,e,o,i,a,r,t);if(s){s=i.fallback,o=e.mode,r=n.child,a=r.sibling;var l={mode:"hidden",children:i.children};return(o&1)===0&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=Ur(r,l),i.subtreeFlags=r.subtreeFlags&14680064),a!==null?s=Ur(a,s):(s=ds(s,o,t,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,o=n.child.memoizedState,o=o===null?td(t):{baseLanes:o.baseLanes|t,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=n.childLanes&~t,e.memoizedState=ed,i}return s=n.child,n=s.sibling,i=Ur(s,{mode:"visible",children:i.children}),(e.mode&1)===0&&(i.lanes=t),i.return=e,i.sibling=null,n!==null&&(t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)),e.child=i,e.memoizedState=null,i}function Gd(n,e){return e=su({mode:"visible",children:e},n.mode,0,null),e.return=n,n.child=e}function fc(n,e,t,i){return i!==null&&Cd(i),mo(e,n.child,null,t),n=Gd(e,e.pendingProps.children),n.flags|=2,e.memoizedState=null,n}function aw(n,e,t,i,r,s,o){if(t)return e.flags&256?(e.flags&=-257,i=mf(Error(Q(422))),fc(n,e,o,i)):e.memoizedState!==null?(e.child=n.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=su({mode:"visible",children:i.children},r,0,null),s=ds(s,r,o,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,(e.mode&1)!==0&&mo(e,n.child,null,o),e.child.memoizedState=td(o),e.memoizedState=ed,s);if((e.mode&1)===0)return fc(n,e,o,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var a=i.dgst;return i=a,s=Error(Q(419)),i=mf(s,i,void 0),fc(n,e,o,i)}if(a=(o&n.childLanes)!==0,Cn||a){if(i=Gt,i!==null){switch(o&-o){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=(r&(i.suspendedLanes|o))!==0?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,er(n,r),vi(i,n,r,-1))}return $d(),i=mf(Error(Q(421))),fc(n,e,o,i)}return r.data==="$?"?(e.flags|=128,e.child=n.child,e=_w.bind(null,n),r._reactRetry=e,null):(n=s.treeContext,Fn=Lr(r.nextSibling),Bn=e,_t=!0,gi=null,n!==null&&(Qn[ei++]=$i,Qn[ei++]=Zi,Qn[ei++]=ms,$i=n.id,Zi=n.overflow,ms=e),e=Gd(e,i.children),e.flags|=4096,e)}function My(n,e,t){n.lanes|=e;var i=n.alternate;i!==null&&(i.lanes|=e),jf(n.return,e,t)}function gf(n,e,t,i,r){var s=n.memoizedState;s===null?n.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:t,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=t,s.tailMode=r)}function cx(n,e,t){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(gn(n,e,i.children,t),i=wt.current,(i&2)!==0)i=i&1|2,e.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=e.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&My(n,t,e);else if(n.tag===19)My(n,t,e);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break e;for(;n.sibling===null;){if(n.return===null||n.return===e)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}i&=1}if(ft(wt,i),(e.mode&1)===0)e.memoizedState=null;else switch(r){case"forwards":for(t=e.child,r=null;t!==null;)n=t.alternate,n!==null&&Hc(n)===null&&(r=t),t=t.sibling;t=r,t===null?(r=e.child,e.child=null):(r=t.sibling,t.sibling=null),gf(e,!1,r,t,s);break;case"backwards":for(t=null,r=e.child,e.child=null;r!==null;){if(n=r.alternate,n!==null&&Hc(n)===null){e.child=r;break}n=r.sibling,r.sibling=t,t=r,r=n}gf(e,!0,t,null,s);break;case"together":gf(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Mc(n,e){(e.mode&1)===0&&n!==null&&(n.alternate=null,e.alternate=null,e.flags|=2)}function tr(n,e,t){if(n!==null&&(e.dependencies=n.dependencies),ys|=e.lanes,(t&e.childLanes)===0)return null;if(n!==null&&e.child!==n.child)throw Error(Q(153));if(e.child!==null){for(n=e.child,t=Ur(n,n.pendingProps),e.child=t,t.return=e;n.sibling!==null;)n=n.sibling,t=t.sibling=Ur(n,n.pendingProps),t.return=e;t.sibling=null}return e.child}function lw(n,e,t){switch(e.tag){case 3:ax(e),po();break;case 5:Dv(e);break;case 1:In(e.type)&&Dc(e);break;case 4:Dd(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;ft(Oc,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(ft(wt,wt.current&1),e.flags|=128,null):(t&e.child.childLanes)!==0?lx(n,e,t):(ft(wt,wt.current&1),n=tr(n,e,t),n!==null?n.sibling:null);ft(wt,wt.current&1);break;case 19:if(i=(t&e.childLanes)!==0,(n.flags&128)!==0){if(i)return cx(n,e,t);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),ft(wt,wt.current),i)break;return null;case 22:case 23:return e.lanes=0,sx(n,e,t)}return tr(n,e,t)}var ux,nd,hx,fx;ux=function(n,e){for(var t=e.child;t!==null;){if(t.tag===5||t.tag===6)n.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};nd=function(){};hx=function(n,e,t,i){var r=n.memoizedProps;if(r!==i){n=e.stateNode,hs(Di.current);var s=null;switch(t){case"input":r=bf(n,r),i=bf(n,i),s=[];break;case"select":r=Et({},r,{value:void 0}),i=Et({},i,{value:void 0}),s=[];break;case"textarea":r=Af(n,r),i=Af(n,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(n.onclick=kc)}Cf(t,i);var o;t=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var a=r[c];for(o in a)a.hasOwnProperty(o)&&(t||(t={}),t[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Da.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(a=r?.[c],i.hasOwnProperty(c)&&l!==a&&(l!=null||a!=null))if(c==="style")if(a){for(o in a)!a.hasOwnProperty(o)||l&&l.hasOwnProperty(o)||(t||(t={}),t[o]="");for(o in l)l.hasOwnProperty(o)&&a[o]!==l[o]&&(t||(t={}),t[o]=l[o])}else t||(s||(s=[]),s.push(c,t)),t=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Da.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&gt("scroll",n),s||a===l||(s=[])):(s=s||[]).push(c,l))}t&&(s=s||[]).push("style",t);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};fx=function(n,e,t,i){t!==i&&(e.flags|=4)};function xa(n,e){if(!_t)switch(n.tailMode){case"hidden":e=n.tail;for(var t=null;e!==null;)e.alternate!==null&&(t=e),e=e.sibling;t===null?n.tail=null:t.sibling=null;break;case"collapsed":t=n.tail;for(var i=null;t!==null;)t.alternate!==null&&(i=t),t=t.sibling;i===null?e||n.tail===null?n.tail=null:n.tail.sibling=null:i.sibling=null}}function nn(n){var e=n.alternate!==null&&n.alternate.child===n.child,t=0,i=0;if(e)for(var r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=n,r=r.sibling;else for(r=n.child;r!==null;)t|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=n,r=r.sibling;return n.subtreeFlags|=i,n.childLanes=t,e}function cw(n,e,t){var i=e.pendingProps;switch(Rd(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return nn(e),null;case 1:return In(e.type)&&Nc(),nn(e),null;case 3:return i=e.stateNode,go(),yt(Pn),yt(sn),zd(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(n===null||n.child===null)&&(uc(e)?e.flags|=4:n===null||n.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,gi!==null&&(ud(gi),gi=null))),nd(n,e),nn(e),null;case 5:Ud(e);var r=hs(qa.current);if(t=e.type,n!==null&&e.stateNode!=null)hx(n,e,t,i,r),n.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(Q(166));return nn(e),null}if(n=hs(Di.current),uc(e)){i=e.stateNode,t=e.type;var s=e.memoizedProps;switch(i[ki]=e,i[Xa]=s,n=(e.mode&1)!==0,t){case"dialog":gt("cancel",i),gt("close",i);break;case"iframe":case"object":case"embed":gt("load",i);break;case"video":case"audio":for(r=0;r<Ea.length;r++)gt(Ea[r],i);break;case"source":gt("error",i);break;case"img":case"image":case"link":gt("error",i),gt("load",i);break;case"details":gt("toggle",i);break;case"input":Cg(i,s),gt("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},gt("invalid",i);break;case"textarea":Ig(i,s),gt("invalid",i)}Cf(t,s),r=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?i.textContent!==a&&(s.suppressHydrationWarning!==!0&&cc(i.textContent,a,n),r=["children",a]):typeof a=="number"&&i.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&cc(i.textContent,a,n),r=["children",""+a]):Da.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&gt("scroll",i)}switch(t){case"input":Kl(i),Pg(i,s,!0);break;case"textarea":Kl(i),Lg(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=kc)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{o=r.nodeType===9?r:r.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=By(t)),n==="http://www.w3.org/1999/xhtml"?t==="script"?(n=o.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof i.is=="string"?n=o.createElement(t,{is:i.is}):(n=o.createElement(t),t==="select"&&(o=n,i.multiple?o.multiple=!0:i.size&&(o.size=i.size))):n=o.createElementNS(n,t),n[ki]=e,n[Xa]=i,ux(n,e,!1,!1),e.stateNode=n;e:{switch(o=Pf(t,i),t){case"dialog":gt("cancel",n),gt("close",n),r=i;break;case"iframe":case"object":case"embed":gt("load",n),r=i;break;case"video":case"audio":for(r=0;r<Ea.length;r++)gt(Ea[r],n);r=i;break;case"source":gt("error",n),r=i;break;case"img":case"image":case"link":gt("error",n),gt("load",n),r=i;break;case"details":gt("toggle",n),r=i;break;case"input":Cg(n,i),r=bf(n,i),gt("invalid",n);break;case"option":r=i;break;case"select":n._wrapperState={wasMultiple:!!i.multiple},r=Et({},i,{value:void 0}),gt("invalid",n);break;case"textarea":Ig(n,i),r=Af(n,i),gt("invalid",n);break;default:r=i}Cf(t,r),a=r;for(s in a)if(a.hasOwnProperty(s)){var l=a[s];s==="style"?Gy(n,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Hy(n,l)):s==="children"?typeof l=="string"?(t!=="textarea"||l!=="")&&Ua(n,l):typeof l=="number"&&Ua(n,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Da.hasOwnProperty(s)?l!=null&&s==="onScroll"&&gt("scroll",n):l!=null&&dd(n,s,l,o))}switch(t){case"input":Kl(n),Pg(n,i,!1);break;case"textarea":Kl(n),Lg(n);break;case"option":i.value!=null&&n.setAttribute("value",""+zr(i.value));break;case"select":n.multiple=!!i.multiple,s=i.value,s!=null?so(n,!!i.multiple,s,!1):i.defaultValue!=null&&so(n,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(n.onclick=kc)}switch(t){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return nn(e),null;case 6:if(n&&e.stateNode!=null)fx(n,e,n.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(Q(166));if(t=hs(qa.current),hs(Di.current),uc(e)){if(i=e.stateNode,t=e.memoizedProps,i[ki]=e,(s=i.nodeValue!==t)&&(n=Bn,n!==null))switch(n.tag){case 3:cc(i.nodeValue,t,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&cc(i.nodeValue,t,(n.mode&1)!==0)}s&&(e.flags|=4)}else i=(t.nodeType===9?t:t.ownerDocument).createTextNode(i),i[ki]=e,e.stateNode=i}return nn(e),null;case 13:if(yt(wt),i=e.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(_t&&Fn!==null&&(e.mode&1)!==0&&(e.flags&128)===0)Pv(),po(),e.flags|=98560,s=!1;else if(s=uc(e),i!==null&&i.dehydrated!==null){if(n===null){if(!s)throw Error(Q(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(Q(317));s[ki]=e}else po(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;nn(e),s=!1}else gi!==null&&(ud(gi),gi=null),s=!0;if(!s)return e.flags&65536?e:null}return(e.flags&128)!==0?(e.lanes=t,e):(i=i!==null,i!==(n!==null&&n.memoizedState!==null)&&i&&(e.child.flags|=8192,(e.mode&1)!==0&&(n===null||(wt.current&1)!==0?Ft===0&&(Ft=3):$d())),e.updateQueue!==null&&(e.flags|=4),nn(e),null);case 4:return go(),nd(n,e),n===null&&Ga(e.stateNode.containerInfo),nn(e),null;case 10:return Ld(e.type._context),nn(e),null;case 17:return In(e.type)&&Nc(),nn(e),null;case 19:if(yt(wt),s=e.memoizedState,s===null)return nn(e),null;if(i=(e.flags&128)!==0,o=s.rendering,o===null)if(i)xa(s,!1);else{if(Ft!==0||n!==null&&(n.flags&128)!==0)for(n=e.child;n!==null;){if(o=Hc(n),o!==null){for(e.flags|=128,xa(s,!1),i=o.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=t,t=e.child;t!==null;)s=t,n=i,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=n,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,n=o.dependencies,s.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t=t.sibling;return ft(wt,wt.current&1|2),e.child}n=n.sibling}s.tail!==null&&kt()>vo&&(e.flags|=128,i=!0,xa(s,!1),e.lanes=4194304)}else{if(!i)if(n=Hc(o),n!==null){if(e.flags|=128,i=!0,t=n.updateQueue,t!==null&&(e.updateQueue=t,e.flags|=4),xa(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!_t)return nn(e),null}else 2*kt()-s.renderingStartTime>vo&&t!==1073741824&&(e.flags|=128,i=!0,xa(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(t=s.last,t!==null?t.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=kt(),e.sibling=null,t=wt.current,ft(wt,i?t&1|2:t&1),e):(nn(e),null);case 22:case 23:return jd(),i=e.memoizedState!==null,n!==null&&n.memoizedState!==null!==i&&(e.flags|=8192),i&&(e.mode&1)!==0?(On&1073741824)!==0&&(nn(e),e.subtreeFlags&6&&(e.flags|=8192)):nn(e),null;case 24:return null;case 25:return null}throw Error(Q(156,e.tag))}function uw(n,e){switch(Rd(e),e.tag){case 1:return In(e.type)&&Nc(),n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 3:return go(),yt(Pn),yt(sn),zd(),n=e.flags,(n&65536)!==0&&(n&128)===0?(e.flags=n&-65537|128,e):null;case 5:return Ud(e),null;case 13:if(yt(wt),n=e.memoizedState,n!==null&&n.dehydrated!==null){if(e.alternate===null)throw Error(Q(340));po()}return n=e.flags,n&65536?(e.flags=n&-65537|128,e):null;case 19:return yt(wt),null;case 4:return go(),null;case 10:return Ld(e.type._context),null;case 22:case 23:return jd(),null;case 24:return null;default:return null}}var dc=!1,rn=!1,hw=typeof WeakSet=="function"?WeakSet:Set,me=null;function io(n,e){var t=n.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(i){Ct(n,e,i)}else t.current=null}function id(n,e,t){try{t()}catch(i){Ct(n,e,i)}}var Sy=!1;function fw(n,e){if(Bf=Pc,n=yv(),Td(n)){if("selectionStart"in n)var t={start:n.selectionStart,end:n.selectionEnd};else e:{t=(t=n.ownerDocument)&&t.defaultView||window;var i=t.getSelection&&t.getSelection();if(i&&i.rangeCount!==0){t=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{t.nodeType,s.nodeType}catch{t=null;break e}var o=0,a=-1,l=-1,c=0,u=0,h=n,f=null;t:for(;;){for(var p;h!==t||r!==0&&h.nodeType!==3||(a=o+r),h!==s||i!==0&&h.nodeType!==3||(l=o+i),h.nodeType===3&&(o+=h.nodeValue.length),(p=h.firstChild)!==null;)f=h,h=p;for(;;){if(h===n)break t;if(f===t&&++c===r&&(a=o),f===s&&++u===i&&(l=o),(p=h.nextSibling)!==null)break;h=f,f=h.parentNode}h=p}t=a===-1||l===-1?null:{start:a,end:l}}else t=null}t=t||{start:0,end:0}}else t=null;for(Hf={focusedElem:n,selectionRange:t},Pc=!1,me=e;me!==null;)if(e=me,n=e.child,(e.subtreeFlags&1028)!==0&&n!==null)n.return=e,me=n;else for(;me!==null;){e=me;try{var m=e.alternate;if((e.flags&1024)!==0)switch(e.tag){case 0:case 11:case 15:break;case 1:if(m!==null){var x=m.memoizedProps,g=m.memoizedState,d=e.stateNode,v=d.getSnapshotBeforeUpdate(e.elementType===e.type?x:pi(e.type,x),g);d.__reactInternalSnapshotBeforeUpdate=v}break;case 3:var y=e.stateNode.containerInfo;y.nodeType===1?y.textContent="":y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(Q(163))}}catch(M){Ct(e,e.return,M)}if(n=e.sibling,n!==null){n.return=e.return,me=n;break}me=e.return}return m=Sy,Sy=!1,m}function La(n,e,t){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&n)===n){var s=r.destroy;r.destroy=void 0,s!==void 0&&id(e,t,s)}r=r.next}while(r!==i)}}function iu(n,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var t=e=e.next;do{if((t.tag&n)===n){var i=t.create;t.destroy=i()}t=t.next}while(t!==e)}}function rd(n){var e=n.ref;if(e!==null){var t=n.stateNode;switch(n.tag){case 5:n=t;break;default:n=t}typeof e=="function"?e(n):e.current=n}}function dx(n){var e=n.alternate;e!==null&&(n.alternate=null,dx(e)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(e=n.stateNode,e!==null&&(delete e[ki],delete e[Xa],delete e[Wf],delete e[jS],delete e[$S])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function px(n){return n.tag===5||n.tag===3||n.tag===4}function wy(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||px(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function sd(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.nodeType===8?t.parentNode.insertBefore(n,e):t.insertBefore(n,e):(t.nodeType===8?(e=t.parentNode,e.insertBefore(n,t)):(e=t,e.appendChild(n)),t=t._reactRootContainer,t!=null||e.onclick!==null||(e.onclick=kc));else if(i!==4&&(n=n.child,n!==null))for(sd(n,e,t),n=n.sibling;n!==null;)sd(n,e,t),n=n.sibling}function od(n,e,t){var i=n.tag;if(i===5||i===6)n=n.stateNode,e?t.insertBefore(n,e):t.appendChild(n);else if(i!==4&&(n=n.child,n!==null))for(od(n,e,t),n=n.sibling;n!==null;)od(n,e,t),n=n.sibling}var qt=null,mi=!1;function Sr(n,e,t){for(t=t.child;t!==null;)mx(n,e,t),t=t.sibling}function mx(n,e,t){if(Ni&&typeof Ni.onCommitFiberUnmount=="function")try{Ni.onCommitFiberUnmount($c,t)}catch{}switch(t.tag){case 5:rn||io(t,e);case 6:var i=qt,r=mi;qt=null,Sr(n,e,t),qt=i,mi=r,qt!==null&&(mi?(n=qt,t=t.stateNode,n.nodeType===8?n.parentNode.removeChild(t):n.removeChild(t)):qt.removeChild(t.stateNode));break;case 18:qt!==null&&(mi?(n=qt,t=t.stateNode,n.nodeType===8?cf(n.parentNode,t):n.nodeType===1&&cf(n,t),Ba(n)):cf(qt,t.stateNode));break;case 4:i=qt,r=mi,qt=t.stateNode.containerInfo,mi=!0,Sr(n,e,t),qt=i,mi=r;break;case 0:case 11:case 14:case 15:if(!rn&&(i=t.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,o=s.destroy;s=s.tag,o!==void 0&&((s&2)!==0||(s&4)!==0)&&id(t,e,o),r=r.next}while(r!==i)}Sr(n,e,t);break;case 1:if(!rn&&(io(t,e),i=t.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=t.memoizedProps,i.state=t.memoizedState,i.componentWillUnmount()}catch(a){Ct(t,e,a)}Sr(n,e,t);break;case 21:Sr(n,e,t);break;case 22:t.mode&1?(rn=(i=rn)||t.memoizedState!==null,Sr(n,e,t),rn=i):Sr(n,e,t);break;default:Sr(n,e,t)}}function by(n){var e=n.updateQueue;if(e!==null){n.updateQueue=null;var t=n.stateNode;t===null&&(t=n.stateNode=new hw),e.forEach(function(i){var r=Mw.bind(null,n,i);t.has(i)||(t.add(i),i.then(r,r))})}}function di(n,e){var t=e.deletions;if(t!==null)for(var i=0;i<t.length;i++){var r=t[i];try{var s=n,o=e,a=o;e:for(;a!==null;){switch(a.tag){case 5:qt=a.stateNode,mi=!1;break e;case 3:qt=a.stateNode.containerInfo,mi=!0;break e;case 4:qt=a.stateNode.containerInfo,mi=!0;break e}a=a.return}if(qt===null)throw Error(Q(160));mx(s,o,r),qt=null,mi=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){Ct(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)gx(e,n),e=e.sibling}function gx(n,e){var t=n.alternate,i=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(di(e,n),Ii(n),i&4){try{La(3,n,n.return),iu(3,n)}catch(x){Ct(n,n.return,x)}try{La(5,n,n.return)}catch(x){Ct(n,n.return,x)}}break;case 1:di(e,n),Ii(n),i&512&&t!==null&&io(t,t.return);break;case 5:if(di(e,n),Ii(n),i&512&&t!==null&&io(t,t.return),n.flags&32){var r=n.stateNode;try{Ua(r,"")}catch(x){Ct(n,n.return,x)}}if(i&4&&(r=n.stateNode,r!=null)){var s=n.memoizedProps,o=t!==null?t.memoizedProps:s,a=n.type,l=n.updateQueue;if(n.updateQueue=null,l!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&Oy(r,s),Pf(a,o);var c=Pf(a,s);for(o=0;o<l.length;o+=2){var u=l[o],h=l[o+1];u==="style"?Gy(r,h):u==="dangerouslySetInnerHTML"?Hy(r,h):u==="children"?Ua(r,h):dd(r,u,h,c)}switch(a){case"input":Ef(r,s);break;case"textarea":Fy(r,s);break;case"select":var f=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?so(r,!!s.multiple,p,!1):f!==!!s.multiple&&(s.defaultValue!=null?so(r,!!s.multiple,s.defaultValue,!0):so(r,!!s.multiple,s.multiple?[]:"",!1))}r[Xa]=s}catch(x){Ct(n,n.return,x)}}break;case 6:if(di(e,n),Ii(n),i&4){if(n.stateNode===null)throw Error(Q(162));r=n.stateNode,s=n.memoizedProps;try{r.nodeValue=s}catch(x){Ct(n,n.return,x)}}break;case 3:if(di(e,n),Ii(n),i&4&&t!==null&&t.memoizedState.isDehydrated)try{Ba(e.containerInfo)}catch(x){Ct(n,n.return,x)}break;case 4:di(e,n),Ii(n);break;case 13:di(e,n),Ii(n),r=n.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Yd=kt())),i&4&&by(n);break;case 22:if(u=t!==null&&t.memoizedState!==null,n.mode&1?(rn=(c=rn)||u,di(e,n),rn=c):di(e,n),Ii(n),i&8192){if(c=n.memoizedState!==null,(n.stateNode.isHidden=c)&&!u&&(n.mode&1)!==0)for(me=n,u=n.child;u!==null;){for(h=me=u;me!==null;){switch(f=me,p=f.child,f.tag){case 0:case 11:case 14:case 15:La(4,f,f.return);break;case 1:io(f,f.return);var m=f.stateNode;if(typeof m.componentWillUnmount=="function"){i=f,t=f.return;try{e=i,m.props=e.memoizedProps,m.state=e.memoizedState,m.componentWillUnmount()}catch(x){Ct(i,t,x)}}break;case 5:io(f,f.return);break;case 22:if(f.memoizedState!==null){Ty(h);continue}}p!==null?(p.return=f,me=p):Ty(h)}u=u.sibling}e:for(u=null,h=n;;){if(h.tag===5){if(u===null){u=h;try{r=h.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=h.stateNode,l=h.memoizedProps.style,o=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=Vy("display",o))}catch(x){Ct(n,n.return,x)}}}else if(h.tag===6){if(u===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(x){Ct(n,n.return,x)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===n)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===n)break e;for(;h.sibling===null;){if(h.return===null||h.return===n)break e;u===h&&(u=null),h=h.return}u===h&&(u=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:di(e,n),Ii(n),i&4&&by(n);break;case 21:break;default:di(e,n),Ii(n)}}function Ii(n){var e=n.flags;if(e&2){try{e:{for(var t=n.return;t!==null;){if(px(t)){var i=t;break e}t=t.return}throw Error(Q(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(Ua(r,""),i.flags&=-33);var s=wy(n);od(n,s,r);break;case 3:case 4:var o=i.stateNode.containerInfo,a=wy(n);sd(n,a,o);break;default:throw Error(Q(161))}}catch(l){Ct(n,n.return,l)}n.flags&=-3}e&4096&&(n.flags&=-4097)}function dw(n,e,t){me=n,yx(n,e,t)}function yx(n,e,t){for(var i=(n.mode&1)!==0;me!==null;){var r=me,s=r.child;if(r.tag===22&&i){var o=r.memoizedState!==null||dc;if(!o){var a=r.alternate,l=a!==null&&a.memoizedState!==null||rn;a=dc;var c=rn;if(dc=o,(rn=l)&&!c)for(me=r;me!==null;)o=me,l=o.child,o.tag===22&&o.memoizedState!==null?Ay(r):l!==null?(l.return=o,me=l):Ay(r);for(;s!==null;)me=s,yx(s,e,t),s=s.sibling;me=r,dc=a,rn=c}Ey(n,e,t)}else(r.subtreeFlags&8772)!==0&&s!==null?(s.return=r,me=s):Ey(n,e,t)}}function Ey(n){for(;me!==null;){var e=me;if((e.flags&8772)!==0){var t=e.alternate;try{if((e.flags&8772)!==0)switch(e.tag){case 0:case 11:case 15:rn||iu(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!rn)if(t===null)i.componentDidMount();else{var r=e.elementType===e.type?t.memoizedProps:pi(e.type,t.memoizedProps);i.componentDidUpdate(r,t.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&cy(e,s,i);break;case 3:var o=e.updateQueue;if(o!==null){if(t=null,e.child!==null)switch(e.child.tag){case 5:t=e.child.stateNode;break;case 1:t=e.child.stateNode}cy(e,o,t)}break;case 5:var a=e.stateNode;if(t===null&&e.flags&4){t=a;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&t.focus();break;case"img":l.src&&(t.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var h=u.dehydrated;h!==null&&Ba(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(Q(163))}rn||e.flags&512&&rd(e)}catch(f){Ct(e,e.return,f)}}if(e===n){me=null;break}if(t=e.sibling,t!==null){t.return=e.return,me=t;break}me=e.return}}function Ty(n){for(;me!==null;){var e=me;if(e===n){me=null;break}var t=e.sibling;if(t!==null){t.return=e.return,me=t;break}me=e.return}}function Ay(n){for(;me!==null;){var e=me;try{switch(e.tag){case 0:case 11:case 15:var t=e.return;try{iu(4,e)}catch(l){Ct(e,t,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){Ct(e,r,l)}}var s=e.return;try{rd(e)}catch(l){Ct(e,s,l)}break;case 5:var o=e.return;try{rd(e)}catch(l){Ct(e,o,l)}}}catch(l){Ct(e,e.return,l)}if(e===n){me=null;break}var a=e.sibling;if(a!==null){a.return=e.return,me=a;break}me=e.return}}var pw=Math.ceil,Wc=nr.ReactCurrentDispatcher,Wd=nr.ReactCurrentOwner,ni=nr.ReactCurrentBatchConfig,Ze=0,Gt=null,Ut=null,jt=0,On=0,ro=Br(0),Ft=0,Ka=null,ys=0,ru=0,Xd=0,ka=null,Rn=null,Yd=0,vo=1/0,qi=null,Xc=!1,ad=null,Nr=null,pc=!1,Rr=null,Yc=0,Na=0,ld=null,Sc=-1,wc=0;function yn(){return(Ze&6)!==0?kt():Sc!==-1?Sc:Sc=kt()}function Dr(n){return(n.mode&1)===0?1:(Ze&2)!==0&&jt!==0?jt&-jt:KS.transition!==null?(wc===0&&(wc=tv()),wc):(n=st,n!==0||(n=window.event,n=n===void 0?16:lv(n.type)),n)}function vi(n,e,t,i){if(50<Na)throw Na=0,ld=null,Error(Q(185));Ja(n,t,i),((Ze&2)===0||n!==Gt)&&(n===Gt&&((Ze&2)===0&&(ru|=t),Ft===4&&Tr(n,jt)),Ln(n,i),t===1&&Ze===0&&(e.mode&1)===0&&(vo=kt()+500,eu&&Hr()))}function Ln(n,e){var t=n.callbackNode;QM(n,e);var i=Cc(n,n===Gt?jt:0);if(i===0)t!==null&&Dg(t),n.callbackNode=null,n.callbackPriority=0;else if(e=i&-i,n.callbackPriority!==e){if(t!=null&&Dg(t),e===1)n.tag===0?ZS(Ry.bind(null,n)):Av(Ry.bind(null,n)),YS(function(){(Ze&6)===0&&Hr()}),t=null;else{switch(nv(i)){case 1:t=vd;break;case 4:t=Qy;break;case 16:t=Rc;break;case 536870912:t=ev;break;default:t=Rc}t=Ex(t,vx.bind(null,n))}n.callbackPriority=e,n.callbackNode=t}}function vx(n,e){if(Sc=-1,wc=0,(Ze&6)!==0)throw Error(Q(327));var t=n.callbackNode;if(uo()&&n.callbackNode!==t)return null;var i=Cc(n,n===Gt?jt:0);if(i===0)return null;if((i&30)!==0||(i&n.expiredLanes)!==0||e)e=qc(n,i);else{e=i;var r=Ze;Ze|=2;var s=_x();(Gt!==n||jt!==e)&&(qi=null,vo=kt()+500,fs(n,e));do try{yw();break}catch(a){xx(n,a)}while(!0);Id(),Wc.current=s,Ze=r,Ut!==null?e=0:(Gt=null,jt=0,e=Ft)}if(e!==0){if(e===2&&(r=Df(n),r!==0&&(i=r,e=cd(n,r))),e===1)throw t=Ka,fs(n,0),Tr(n,i),Ln(n,kt()),t;if(e===6)Tr(n,i);else{if(r=n.current.alternate,(i&30)===0&&!mw(r)&&(e=qc(n,i),e===2&&(s=Df(n),s!==0&&(i=s,e=cd(n,s))),e===1))throw t=Ka,fs(n,0),Tr(n,i),Ln(n,kt()),t;switch(n.finishedWork=r,n.finishedLanes=i,e){case 0:case 1:throw Error(Q(345));case 2:ls(n,Rn,qi);break;case 3:if(Tr(n,i),(i&130023424)===i&&(e=Yd+500-kt(),10<e)){if(Cc(n,0)!==0)break;if(r=n.suspendedLanes,(r&i)!==i){yn(),n.pingedLanes|=n.suspendedLanes&r;break}n.timeoutHandle=Gf(ls.bind(null,n,Rn,qi),e);break}ls(n,Rn,qi);break;case 4:if(Tr(n,i),(i&4194240)===i)break;for(e=n.eventTimes,r=-1;0<i;){var o=31-yi(i);s=1<<o,o=e[o],o>r&&(r=o),i&=~s}if(i=r,i=kt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*pw(i/1960))-i,10<i){n.timeoutHandle=Gf(ls.bind(null,n,Rn,qi),i);break}ls(n,Rn,qi);break;case 5:ls(n,Rn,qi);break;default:throw Error(Q(329))}}}return Ln(n,kt()),n.callbackNode===t?vx.bind(null,n):null}function cd(n,e){var t=ka;return n.current.memoizedState.isDehydrated&&(fs(n,e).flags|=256),n=qc(n,e),n!==2&&(e=Rn,Rn=t,e!==null&&ud(e)),n}function ud(n){Rn===null?Rn=n:Rn.push.apply(Rn,n)}function mw(n){for(var e=n;;){if(e.flags&16384){var t=e.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var i=0;i<t.length;i++){var r=t[i],s=r.getSnapshot;r=r.value;try{if(!xi(s(),r))return!1}catch{return!1}}}if(t=e.child,e.subtreeFlags&16384&&t!==null)t.return=e,e=t;else{if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Tr(n,e){for(e&=~Xd,e&=~ru,n.suspendedLanes|=e,n.pingedLanes&=~e,n=n.expirationTimes;0<e;){var t=31-yi(e),i=1<<t;n[t]=-1,e&=~i}}function Ry(n){if((Ze&6)!==0)throw Error(Q(327));uo();var e=Cc(n,0);if((e&1)===0)return Ln(n,kt()),null;var t=qc(n,e);if(n.tag!==0&&t===2){var i=Df(n);i!==0&&(e=i,t=cd(n,i))}if(t===1)throw t=Ka,fs(n,0),Tr(n,e),Ln(n,kt()),t;if(t===6)throw Error(Q(345));return n.finishedWork=n.current.alternate,n.finishedLanes=e,ls(n,Rn,qi),Ln(n,kt()),null}function qd(n,e){var t=Ze;Ze|=1;try{return n(e)}finally{Ze=t,Ze===0&&(vo=kt()+500,eu&&Hr())}}function vs(n){Rr!==null&&Rr.tag===0&&(Ze&6)===0&&uo();var e=Ze;Ze|=1;var t=ni.transition,i=st;try{if(ni.transition=null,st=1,n)return n()}finally{st=i,ni.transition=t,Ze=e,(Ze&6)===0&&Hr()}}function jd(){On=ro.current,yt(ro)}function fs(n,e){n.finishedWork=null,n.finishedLanes=0;var t=n.timeoutHandle;if(t!==-1&&(n.timeoutHandle=-1,XS(t)),Ut!==null)for(t=Ut.return;t!==null;){var i=t;switch(Rd(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Nc();break;case 3:go(),yt(Pn),yt(sn),zd();break;case 5:Ud(i);break;case 4:go();break;case 13:yt(wt);break;case 19:yt(wt);break;case 10:Ld(i.type._context);break;case 22:case 23:jd()}t=t.return}if(Gt=n,Ut=n=Ur(n.current,null),jt=On=e,Ft=0,Ka=null,Xd=ru=ys=0,Rn=ka=null,us!==null){for(e=0;e<us.length;e++)if(t=us[e],i=t.interleaved,i!==null){t.interleaved=null;var r=i.next,s=t.pending;if(s!==null){var o=s.next;s.next=r,i.next=o}t.pending=i}us=null}return n}function xx(n,e){do{var t=Ut;try{if(Id(),xc.current=Gc,Vc){for(var i=bt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}Vc=!1}if(gs=0,Vt=Ot=bt=null,Ia=!1,ja=0,Wd.current=null,t===null||t.return===null){Ft=1,Ka=e,Ut=null;break}e:{var s=n,o=t.return,a=t,l=e;if(e=jt,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=a,h=u.tag;if((u.mode&1)===0&&(h===0||h===11||h===15)){var f=u.alternate;f?(u.updateQueue=f.updateQueue,u.memoizedState=f.memoizedState,u.lanes=f.lanes):(u.updateQueue=null,u.memoizedState=null)}var p=my(o);if(p!==null){p.flags&=-257,gy(p,o,a,s,e),p.mode&1&&py(s,c,e),e=p,l=c;var m=e.updateQueue;if(m===null){var x=new Set;x.add(l),e.updateQueue=x}else m.add(l);break e}else{if((e&1)===0){py(s,c,e),$d();break e}l=Error(Q(426))}}else if(_t&&a.mode&1){var g=my(o);if(g!==null){(g.flags&65536)===0&&(g.flags|=256),gy(g,o,a,s,e),Cd(yo(l,a));break e}}s=l=yo(l,a),Ft!==4&&(Ft=2),ka===null?ka=[s]:ka.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var d=nx(s,l,e);ly(s,d);break e;case 1:a=l;var v=s.type,y=s.stateNode;if((s.flags&128)===0&&(typeof v.getDerivedStateFromError=="function"||y!==null&&typeof y.componentDidCatch=="function"&&(Nr===null||!Nr.has(y)))){s.flags|=65536,e&=-e,s.lanes|=e;var M=ix(s,a,e);ly(s,M);break e}}s=s.return}while(s!==null)}Sx(t)}catch(R){e=R,Ut===t&&t!==null&&(Ut=t=t.return);continue}break}while(!0)}function _x(){var n=Wc.current;return Wc.current=Gc,n===null?Gc:n}function $d(){(Ft===0||Ft===3||Ft===2)&&(Ft=4),Gt===null||(ys&268435455)===0&&(ru&268435455)===0||Tr(Gt,jt)}function qc(n,e){var t=Ze;Ze|=2;var i=_x();(Gt!==n||jt!==e)&&(qi=null,fs(n,e));do try{gw();break}catch(r){xx(n,r)}while(!0);if(Id(),Ze=t,Wc.current=i,Ut!==null)throw Error(Q(261));return Gt=null,jt=0,Ft}function gw(){for(;Ut!==null;)Mx(Ut)}function yw(){for(;Ut!==null&&!WM();)Mx(Ut)}function Mx(n){var e=bx(n.alternate,n,On);n.memoizedProps=n.pendingProps,e===null?Sx(n):Ut=e,Wd.current=null}function Sx(n){var e=n;do{var t=e.alternate;if(n=e.return,(e.flags&32768)===0){if(t=cw(t,e,On),t!==null){Ut=t;return}}else{if(t=uw(t,e),t!==null){t.flags&=32767,Ut=t;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Ft=6,Ut=null;return}}if(e=e.sibling,e!==null){Ut=e;return}Ut=e=n}while(e!==null);Ft===0&&(Ft=5)}function ls(n,e,t){var i=st,r=ni.transition;try{ni.transition=null,st=1,vw(n,e,t,i)}finally{ni.transition=r,st=i}return null}function vw(n,e,t,i){do uo();while(Rr!==null);if((Ze&6)!==0)throw Error(Q(327));t=n.finishedWork;var r=n.finishedLanes;if(t===null)return null;if(n.finishedWork=null,n.finishedLanes=0,t===n.current)throw Error(Q(177));n.callbackNode=null,n.callbackPriority=0;var s=t.lanes|t.childLanes;if(eS(n,s),n===Gt&&(Ut=Gt=null,jt=0),(t.subtreeFlags&2064)===0&&(t.flags&2064)===0||pc||(pc=!0,Ex(Rc,function(){return uo(),null})),s=(t.flags&15990)!==0,(t.subtreeFlags&15990)!==0||s){s=ni.transition,ni.transition=null;var o=st;st=1;var a=Ze;Ze|=4,Wd.current=null,fw(n,t),gx(t,n),BS(Hf),Pc=!!Bf,Hf=Bf=null,n.current=t,dw(t,n,r),XM(),Ze=a,st=o,ni.transition=s}else n.current=t;if(pc&&(pc=!1,Rr=n,Yc=r),s=n.pendingLanes,s===0&&(Nr=null),jM(t.stateNode,i),Ln(n,kt()),e!==null)for(i=n.onRecoverableError,t=0;t<e.length;t++)r=e[t],i(r.value,{componentStack:r.stack,digest:r.digest});if(Xc)throw Xc=!1,n=ad,ad=null,n;return(Yc&1)!==0&&n.tag!==0&&uo(),s=n.pendingLanes,(s&1)!==0?n===ld?Na++:(Na=0,ld=n):Na=0,Hr(),null}function uo(){if(Rr!==null){var n=nv(Yc),e=ni.transition,t=st;try{if(ni.transition=null,st=16>n?16:n,Rr===null)var i=!1;else{if(n=Rr,Rr=null,Yc=0,(Ze&6)!==0)throw Error(Q(331));var r=Ze;for(Ze|=4,me=n.current;me!==null;){var s=me,o=s.child;if((me.flags&16)!==0){var a=s.deletions;if(a!==null){for(var l=0;l<a.length;l++){var c=a[l];for(me=c;me!==null;){var u=me;switch(u.tag){case 0:case 11:case 15:La(8,u,s)}var h=u.child;if(h!==null)h.return=u,me=h;else for(;me!==null;){u=me;var f=u.sibling,p=u.return;if(dx(u),u===c){me=null;break}if(f!==null){f.return=p,me=f;break}me=p}}}var m=s.alternate;if(m!==null){var x=m.child;if(x!==null){m.child=null;do{var g=x.sibling;x.sibling=null,x=g}while(x!==null)}}me=s}}if((s.subtreeFlags&2064)!==0&&o!==null)o.return=s,me=o;else e:for(;me!==null;){if(s=me,(s.flags&2048)!==0)switch(s.tag){case 0:case 11:case 15:La(9,s,s.return)}var d=s.sibling;if(d!==null){d.return=s.return,me=d;break e}me=s.return}}var v=n.current;for(me=v;me!==null;){o=me;var y=o.child;if((o.subtreeFlags&2064)!==0&&y!==null)y.return=o,me=y;else e:for(o=v;me!==null;){if(a=me,(a.flags&2048)!==0)try{switch(a.tag){case 0:case 11:case 15:iu(9,a)}}catch(R){Ct(a,a.return,R)}if(a===o){me=null;break e}var M=a.sibling;if(M!==null){M.return=a.return,me=M;break e}me=a.return}}if(Ze=r,Hr(),Ni&&typeof Ni.onPostCommitFiberRoot=="function")try{Ni.onPostCommitFiberRoot($c,n)}catch{}i=!0}return i}finally{st=t,ni.transition=e}}return!1}function Cy(n,e,t){e=yo(t,e),e=nx(n,e,1),n=kr(n,e,1),e=yn(),n!==null&&(Ja(n,1,e),Ln(n,e))}function Ct(n,e,t){if(n.tag===3)Cy(n,n,t);else for(;e!==null;){if(e.tag===3){Cy(e,n,t);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Nr===null||!Nr.has(i))){n=yo(t,n),n=ix(e,n,1),e=kr(e,n,1),n=yn(),e!==null&&(Ja(e,1,n),Ln(e,n));break}}e=e.return}}function xw(n,e,t){var i=n.pingCache;i!==null&&i.delete(e),e=yn(),n.pingedLanes|=n.suspendedLanes&t,Gt===n&&(jt&t)===t&&(Ft===4||Ft===3&&(jt&130023424)===jt&&500>kt()-Yd?fs(n,0):Xd|=t),Ln(n,e)}function wx(n,e){e===0&&((n.mode&1)===0?e=1:(e=ec,ec<<=1,(ec&130023424)===0&&(ec=4194304)));var t=yn();n=er(n,e),n!==null&&(Ja(n,e,t),Ln(n,t))}function _w(n){var e=n.memoizedState,t=0;e!==null&&(t=e.retryLane),wx(n,t)}function Mw(n,e){var t=0;switch(n.tag){case 13:var i=n.stateNode,r=n.memoizedState;r!==null&&(t=r.retryLane);break;case 19:i=n.stateNode;break;default:throw Error(Q(314))}i!==null&&i.delete(e),wx(n,t)}var bx;bx=function(n,e,t){if(n!==null)if(n.memoizedProps!==e.pendingProps||Pn.current)Cn=!0;else{if((n.lanes&t)===0&&(e.flags&128)===0)return Cn=!1,lw(n,e,t);Cn=(n.flags&131072)!==0}else Cn=!1,_t&&(e.flags&1048576)!==0&&Rv(e,zc,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Mc(n,e),n=e.pendingProps;var r=fo(e,sn.current);co(e,t),r=Fd(null,e,i,n,r,t);var s=Bd();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,In(i)?(s=!0,Dc(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Nd(e),r.updater=nu,e.stateNode=r,r._reactInternals=e,Zf(e,i,n,t),e=Qf(null,e,i,!0,s,t)):(e.tag=0,_t&&s&&Ad(e),gn(null,e,r,t),e=e.child),e;case 16:i=e.elementType;e:{switch(Mc(n,e),n=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=ww(i),n=pi(i,n),r){case 0:e=Jf(null,e,i,n,t);break e;case 1:e=xy(null,e,i,n,t);break e;case 11:e=yy(null,e,i,n,t);break e;case 14:e=vy(null,e,i,pi(i.type,n),t);break e}throw Error(Q(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:pi(i,r),Jf(n,e,i,r,t);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:pi(i,r),xy(n,e,i,r,t);case 3:e:{if(ax(e),n===null)throw Error(Q(387));i=e.pendingProps,s=e.memoizedState,r=s.element,Nv(n,e),Bc(e,i,null,t);var o=e.memoizedState;if(i=o.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=yo(Error(Q(423)),e),e=_y(n,e,i,t,r);break e}else if(i!==r){r=yo(Error(Q(424)),e),e=_y(n,e,i,t,r);break e}else for(Fn=Lr(e.stateNode.containerInfo.firstChild),Bn=e,_t=!0,gi=null,t=Lv(e,null,i,t),e.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(po(),i===r){e=tr(n,e,t);break e}gn(n,e,i,t)}e=e.child}return e;case 5:return Dv(e),n===null&&qf(e),i=e.type,r=e.pendingProps,s=n!==null?n.memoizedProps:null,o=r.children,Vf(i,r)?o=null:s!==null&&Vf(i,s)&&(e.flags|=32),ox(n,e),gn(n,e,o,t),e.child;case 6:return n===null&&qf(e),null;case 13:return lx(n,e,t);case 4:return Dd(e,e.stateNode.containerInfo),i=e.pendingProps,n===null?e.child=mo(e,null,i,t):gn(n,e,i,t),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:pi(i,r),yy(n,e,i,r,t);case 7:return gn(n,e,e.pendingProps,t),e.child;case 8:return gn(n,e,e.pendingProps.children,t),e.child;case 12:return gn(n,e,e.pendingProps.children,t),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,o=r.value,ft(Oc,i._currentValue),i._currentValue=o,s!==null)if(xi(s.value,o)){if(s.children===r.children&&!Pn.current){e=tr(n,e,t);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var l=a.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=Ki(-1,t&-t),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=t,l=s.alternate,l!==null&&(l.lanes|=t),jf(s.return,t,e),a.lanes|=t;break}l=l.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(Q(341));o.lanes|=t,a=o.alternate,a!==null&&(a.lanes|=t),jf(o,t,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}gn(n,e,r.children,t),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,co(e,t),r=ii(r),i=i(r),e.flags|=1,gn(n,e,i,t),e.child;case 14:return i=e.type,r=pi(i,e.pendingProps),r=pi(i.type,r),vy(n,e,i,r,t);case 15:return rx(n,e,e.type,e.pendingProps,t);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:pi(i,r),Mc(n,e),e.tag=1,In(i)?(n=!0,Dc(e)):n=!1,co(e,t),tx(e,i,r),Zf(e,i,r,t),Qf(null,e,i,!0,n,t);case 19:return cx(n,e,t);case 22:return sx(n,e,t)}throw Error(Q(156,e.tag))};function Ex(n,e){return Jy(n,e)}function Sw(n,e,t,i){this.tag=n,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ti(n,e,t,i){return new Sw(n,e,t,i)}function Zd(n){return n=n.prototype,!(!n||!n.isReactComponent)}function ww(n){if(typeof n=="function")return Zd(n)?1:0;if(n!=null){if(n=n.$$typeof,n===md)return 11;if(n===gd)return 14}return 2}function Ur(n,e){var t=n.alternate;return t===null?(t=ti(n.tag,e,n.key,n.mode),t.elementType=n.elementType,t.type=n.type,t.stateNode=n.stateNode,t.alternate=n,n.alternate=t):(t.pendingProps=e,t.type=n.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=n.flags&14680064,t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},t.sibling=n.sibling,t.index=n.index,t.ref=n.ref,t}function bc(n,e,t,i,r,s){var o=2;if(i=n,typeof n=="function")Zd(n)&&(o=1);else if(typeof n=="string")o=5;else e:switch(n){case js:return ds(t.children,r,s,e);case pd:o=8,r|=8;break;case _f:return n=ti(12,t,e,r|2),n.elementType=_f,n.lanes=s,n;case Mf:return n=ti(13,t,e,r),n.elementType=Mf,n.lanes=s,n;case Sf:return n=ti(19,t,e,r),n.elementType=Sf,n.lanes=s,n;case Dy:return su(t,r,s,e);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case ky:o=10;break e;case Ny:o=9;break e;case md:o=11;break e;case gd:o=14;break e;case wr:o=16,i=null;break e}throw Error(Q(130,n==null?n:typeof n,""))}return e=ti(o,t,e,r),e.elementType=n,e.type=i,e.lanes=s,e}function ds(n,e,t,i){return n=ti(7,n,i,e),n.lanes=t,n}function su(n,e,t,i){return n=ti(22,n,i,e),n.elementType=Dy,n.lanes=t,n.stateNode={isHidden:!1},n}function yf(n,e,t){return n=ti(6,n,null,e),n.lanes=t,n}function vf(n,e,t){return e=ti(4,n.children!==null?n.children:[],n.key,e),e.lanes=t,e.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},e}function bw(n,e,t,i,r){this.tag=e,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ef(0),this.expirationTimes=ef(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ef(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Kd(n,e,t,i,r,s,o,a,l){return n=new bw(n,e,t,a,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=ti(3,null,null,e),n.current=s,s.stateNode=n,s.memoizedState={element:i,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},Nd(s),n}function Ew(n,e,t){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:qs,key:i==null?null:""+i,children:n,containerInfo:e,implementation:t}}function Tx(n){if(!n)return Or;n=n._reactInternals;e:{if(_s(n)!==n||n.tag!==1)throw Error(Q(170));var e=n;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(In(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(Q(171))}if(n.tag===1){var t=n.type;if(In(t))return Tv(n,t,e)}return e}function Ax(n,e,t,i,r,s,o,a,l){return n=Kd(t,i,!0,n,r,s,o,a,l),n.context=Tx(null),t=n.current,i=yn(),r=Dr(t),s=Ki(i,r),s.callback=e??null,kr(t,s,r),n.current.lanes=r,Ja(n,r,i),Ln(n,i),n}function ou(n,e,t,i){var r=e.current,s=yn(),o=Dr(r);return t=Tx(t),e.context===null?e.context=t:e.pendingContext=t,e=Ki(s,o),e.payload={element:n},i=i===void 0?null:i,i!==null&&(e.callback=i),n=kr(r,e,o),n!==null&&(vi(n,r,o,s),vc(n,r,o)),o}function jc(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Py(n,e){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var t=n.retryLane;n.retryLane=t!==0&&t<e?t:e}}function Jd(n,e){Py(n,e),(n=n.alternate)&&Py(n,e)}function Tw(){return null}var Rx=typeof reportError=="function"?reportError:function(n){console.error(n)};function Qd(n){this._internalRoot=n}au.prototype.render=Qd.prototype.render=function(n){var e=this._internalRoot;if(e===null)throw Error(Q(409));ou(n,e,null,null)};au.prototype.unmount=Qd.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var e=n.containerInfo;vs(function(){ou(null,n,null,null)}),e[Qi]=null}};function au(n){this._internalRoot=n}au.prototype.unstable_scheduleHydration=function(n){if(n){var e=sv();n={blockedOn:null,target:n,priority:e};for(var t=0;t<Er.length&&e!==0&&e<Er[t].priority;t++);Er.splice(t,0,n),t===0&&av(n)}};function ep(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function lu(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Iy(){}function Aw(n,e,t,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=jc(o);s.call(c)}}var o=Ax(e,i,n,0,null,!1,!1,"",Iy);return n._reactRootContainer=o,n[Qi]=o.current,Ga(n.nodeType===8?n.parentNode:n),vs(),o}for(;r=n.lastChild;)n.removeChild(r);if(typeof i=="function"){var a=i;i=function(){var c=jc(l);a.call(c)}}var l=Kd(n,0,!1,null,null,!1,!1,"",Iy);return n._reactRootContainer=l,n[Qi]=l.current,Ga(n.nodeType===8?n.parentNode:n),vs(function(){ou(e,l,t,i)}),l}function cu(n,e,t,i,r){var s=t._reactRootContainer;if(s){var o=s;if(typeof r=="function"){var a=r;r=function(){var l=jc(o);a.call(l)}}ou(e,o,n,r)}else o=Aw(t,e,n,r,i);return jc(o)}iv=function(n){switch(n.tag){case 3:var e=n.stateNode;if(e.current.memoizedState.isDehydrated){var t=ba(e.pendingLanes);t!==0&&(xd(e,t|1),Ln(e,kt()),(Ze&6)===0&&(vo=kt()+500,Hr()))}break;case 13:vs(function(){var i=er(n,1);if(i!==null){var r=yn();vi(i,n,1,r)}}),Jd(n,1)}};_d=function(n){if(n.tag===13){var e=er(n,134217728);if(e!==null){var t=yn();vi(e,n,134217728,t)}Jd(n,134217728)}};rv=function(n){if(n.tag===13){var e=Dr(n),t=er(n,e);if(t!==null){var i=yn();vi(t,n,e,i)}Jd(n,e)}};sv=function(){return st};ov=function(n,e){var t=st;try{return st=n,e()}finally{st=t}};Lf=function(n,e,t){switch(e){case"input":if(Ef(n,t),e=t.name,t.type==="radio"&&e!=null){for(t=n;t.parentNode;)t=t.parentNode;for(t=t.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<t.length;e++){var i=t[e];if(i!==n&&i.form===n.form){var r=Qc(i);if(!r)throw Error(Q(90));zy(i),Ef(i,r)}}}break;case"textarea":Fy(n,t);break;case"select":e=t.value,e!=null&&so(n,!!t.multiple,e,!1)}};Yy=qd;qy=vs;var Rw={usingClientEntryPoint:!1,Events:[el,Js,Qc,Wy,Xy,qd]},_a={findFiberByHostInstance:cs,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Cw={bundleType:_a.bundleType,version:_a.version,rendererPackageName:_a.rendererPackageName,rendererConfig:_a.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:nr.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=Zy(n),n===null?null:n.stateNode},findFiberByHostInstance:_a.findFiberByHostInstance||Tw,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ma=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ma.isDisabled&&Ma.supportsFiber))try{$c=Ma.inject(Cw),Ni=Ma}catch{}var Ma;Gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Rw;Gn.createPortal=function(n,e){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ep(e))throw Error(Q(200));return Ew(n,e,null,t)};Gn.createRoot=function(n,e){if(!ep(n))throw Error(Q(299));var t=!1,i="",r=Rx;return e!=null&&(e.unstable_strictMode===!0&&(t=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Kd(n,1,!1,null,null,t,!1,i,r),n[Qi]=e.current,Ga(n.nodeType===8?n.parentNode:n),new Qd(e)};Gn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var e=n._reactInternals;if(e===void 0)throw typeof n.render=="function"?Error(Q(188)):(n=Object.keys(n).join(","),Error(Q(268,n)));return n=Zy(e),n=n===null?null:n.stateNode,n};Gn.flushSync=function(n){return vs(n)};Gn.hydrate=function(n,e,t){if(!lu(e))throw Error(Q(200));return cu(null,n,e,!0,t)};Gn.hydrateRoot=function(n,e,t){if(!ep(n))throw Error(Q(405));var i=t!=null&&t.hydratedSources||null,r=!1,s="",o=Rx;if(t!=null&&(t.unstable_strictMode===!0&&(r=!0),t.identifierPrefix!==void 0&&(s=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),e=Ax(e,null,n,1,t??null,r,!1,s,o),n[Qi]=e.current,Ga(n),i)for(n=0;n<i.length;n++)t=i[n],r=t._getVersion,r=r(t._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[t,r]:e.mutableSourceEagerHydrationData.push(t,r);return new au(e)};Gn.render=function(n,e,t){if(!lu(e))throw Error(Q(200));return cu(null,n,e,!1,t)};Gn.unmountComponentAtNode=function(n){if(!lu(n))throw Error(Q(40));return n._reactRootContainer?(vs(function(){cu(null,null,n,!1,function(){n._reactRootContainer=null,n[Qi]=null})}),!0):!1};Gn.unstable_batchedUpdates=qd;Gn.unstable_renderSubtreeIntoContainer=function(n,e,t,i){if(!lu(t))throw Error(Q(200));if(n==null||n._reactInternals===void 0)throw Error(Q(38));return cu(n,e,t,!1,i)};Gn.version="18.3.1-next-f1338f8080-20240426"});var Lx=Yi((NC,Ix)=>{"use strict";function Px(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Px)}catch(n){console.error(n)}}Px(),Ix.exports=Cx()});var Nx=Yi(tp=>{"use strict";var kx=Lx();tp.createRoot=kx.createRoot,tp.hydrateRoot=kx.hydrateRoot;var DC});var Ux=Yi(fu=>{"use strict";var Pw=ua(),Iw=Symbol.for("react.element"),Lw=Symbol.for("react.fragment"),kw=Object.prototype.hasOwnProperty,Nw=Pw.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Dw={key:!0,ref:!0,__self:!0,__source:!0};function Dx(n,e,t){var i,r={},s=null,o=null;t!==void 0&&(s=""+t),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(i in e)kw.call(e,i)&&!Dw.hasOwnProperty(i)&&(r[i]=e[i]);if(n&&n.defaultProps)for(i in e=n.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:Iw,type:n,key:s,ref:o,props:r,_owner:Nw.current}}fu.Fragment=Lw;fu.jsx=Dx;fu.jsxs=Dx});var Wn=Yi((GC,zx)=>{"use strict";zx.exports=Ux()});var J1=pn(Nx());var En=pn(ua());var uu=[{id:"rabbit",label:"Bunny",icon:"bunny",emoji:"\u{1F430}",color:"#ffd0e4"},{id:"panda",label:"Panda",icon:"panda",emoji:"\u{1F43C}",color:"#e5e7eb"},{id:"bear",label:"Bear",icon:"bear",emoji:"\u{1F43B}",color:"#f3dcc8"},{id:"owl",label:"Ghost",icon:"ghost",emoji:"\u{1F47B}",color:"#d9e4ff"},{id:"penguin",label:"Chick",icon:"chick",emoji:"\u{1F425}",color:"#fff4c4"},{id:"octopus",label:"Jelly",icon:"jelly",emoji:"\u{1FABC}",color:"#dcfaef"},{id:"dog",label:"Puppy",icon:"puppy",emoji:"\u{1F436}",color:"#fed7aa"},{id:"fox",label:"Hamster",icon:"hamster",emoji:"\u{1F439}",color:"#fde68a"},{id:"cat",label:"Cat",icon:"cat",emoji:"\u{1F431}",color:"#d9e4ff"},{id:"tiger",label:"Blue Cat",icon:"bluecat",emoji:"\u{1F63A}",color:"#fff4c4"},{id:"dolphin",label:"Turtle",icon:"turtle",emoji:"\u{1F422}",color:"#efe6ff"},{id:"koala",label:"Seal",icon:"seal",emoji:"\u{1F9AD}",color:"#c7d2fe"},{id:"butterfly",label:"Bee",icon:"bee",emoji:"\u{1F41D}",color:"#a5f3fc"},{id:"unicorn",label:"Sheep",icon:"sheep",emoji:"\u{1F411}",color:"#e9d5ff"},{id:"dragon",label:"Piggy",icon:"pig",emoji:"\u{1F437}",color:"#dcfaef"},{id:"alien",label:"Heart",icon:"heart",emoji:"\u{1F497}",color:"#d1fae5"},{id:"whale",label:"Whale",icon:"whale",emoji:"\u{1F433}",color:"#cfe8ff"},{id:"crab",label:"Crab",icon:"crab",emoji:"\u{1F980}",color:"#ffe1d6"},{id:"octo",label:"Octopus",icon:"octo",emoji:"\u{1F419}",color:"#ffe4f1"},{id:"jellyfish",label:"Jellyfish",icon:"jellyfish",emoji:"\u{1FABC}",color:"#dff3ff"},{id:"mole",label:"Mole",icon:"mole",emoji:"\u{1F43E}",color:"#ecdfd0"},{id:"caterpillar",label:"Caterpillar",icon:"caterpillar",emoji:"\u{1F41B}",color:"#e3f9d5"},{id:"ant",label:"Ant",icon:"ant",emoji:"\u{1F41C}",color:"#e2e8f0"},{id:"worm",label:"Worm",icon:"worm",emoji:"\u{1FAB1}",color:"#ffedd5"},{id:"cloud",label:"Cloud",icon:"cloud",emoji:"\u2601\uFE0F",color:"#dbeafe"},{id:"cupcake",label:"Cupcake",icon:"cupcake",emoji:"\u{1F9C1}",color:"#fce7f3"},{id:"snowman",label:"Snowman",icon:"snowman",emoji:"\u26C4",color:"#e0f2fe"},{id:"moon",label:"Moon",icon:"moon",emoji:"\u{1F319}",color:"#ede9fe"},{id:"sun",label:"Sun",icon:"sun",emoji:"\u2600\uFE0F",color:"#fff1c1"},{id:"toast",label:"Toast",icon:"toast",emoji:"\u{1F35E}",color:"#fef3c7"},{id:"melon",label:"Melon",icon:"melon",emoji:"\u{1F349}",color:"#dcfce7"},{id:"flower",label:"Flower",icon:"flower",emoji:"\u{1F338}",color:"#fde2ef"},{id:"floaty",label:"Floaty",icon:"floaty",emoji:"\u{1F6DF}",color:"#dbeafe"},{id:"bulb",label:"Light Bulb",icon:"bulb",emoji:"\u{1F4A1}",color:"#cffafe"},{id:"sunflower",label:"Sunflower",icon:"sunflower",emoji:"\u{1F33B}",color:"#dcfce7"},{id:"muncher",label:"Muncher",icon:"muncher",emoji:"\u{1F36A}",color:"#e0f2fe"},{id:"swimbunny",label:"Swim Bunny",icon:"swimbunny",emoji:"\u{1F407}",color:"#fff4c4"},{id:"sunny",label:"Sunny Cloud",icon:"sunny",emoji:"\u26C5",color:"#fff1c1"},{id:"smiley",label:"Smiley",icon:"smiley",emoji:"\u{1F642}",color:"#e9d5ff"},{id:"puff",label:"Puff",icon:"puff",emoji:"\u{1F4AD}",color:"#fecdd3"},{id:"sob",label:"Sob",icon:"sob",emoji:"\u{1F62D}",color:"#e0f2fe"},{id:"giggles",label:"Giggles",icon:"giggles",emoji:"\u{1F606}",color:"#fff4c4"},{id:"teary",label:"Teary",icon:"teary",emoji:"\u{1F97A}",color:"#ede9fe"},{id:"dizzy",label:"Dizzy",icon:"dizzy",emoji:"\u{1F635}",color:"#dcfce7"},{id:"blush",label:"Blush",icon:"blush",emoji:"\u{1F60A}",color:"#ccfbf1"},{id:"lovey",label:"Lovey",icon:"lovey",emoji:"\u{1F60D}",color:"#fef3c7"},{id:"cheeky",label:"Cheeky",icon:"cheeky",emoji:"\u{1F61C}",color:"#dbeafe"},{id:"grumpy",label:"Grumpy",icon:"grumpy",emoji:"\u{1F620}",color:"#e2e8f0"}];function nl(n){return uu.find(e=>e.id===n)??uu[0]}function hu(n){return`/icons/av-${nl(n).icon}.png`}var np=pn(Wn());function il({id:n,size:e=40,border:t=e>=36?3:2,shadow:i=e>=36,style:r,className:s}){let o=nl(n);return(0,np.jsx)("span",{className:s,style:{display:"inline-grid",placeItems:"center",flex:"none",width:e,height:e,borderRadius:"50%",border:`${t}px solid var(--ink)`,background:o.color,boxShadow:i?`0 ${Math.max(2,Math.round(e/14))}px 0 var(--ink)`:void 0,overflow:"hidden",...r},children:(0,np.jsx)("img",{src:hu(n),alt:o.label,draggable:!1,style:{width:"84%",height:"84%",objectFit:"contain",pointerEvents:"none"}})})}var Ox=n=>`/icons/${n}.png`;var Fx=pn(Wn());function ip({name:n,size:e,alt:t="",style:i,className:r}){return(0,Fx.jsx)("img",{src:Ox(n),alt:t,draggable:!1,className:`ec-icon${r?` ${r}`:""}`,style:e!==void 0?{width:e,height:e,...i}:i})}var ir=[{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"},{en:"Shinkansen Dash",ja:"\u3057\u3093\u304B\u3093\u305B\u3093\u30C0\u30C3\u30B7\u30E5"},{en:"Ninja Rooftops",ja:"\u3057\u306E\u3073\u30EB\u30FC\u30D5"},{en:"Matsuri Carousel",ja:"\u304A\u307E\u3064\u308A\u30AB\u30EB\u30FC\u30BB\u30EB"},{en:"Ramen Slide",ja:"\u30E9\u30FC\u30E1\u30F3\u30B9\u30E9\u30A4\u30C0\u30FC"},{en:"Onsen Hop",ja:"\u304A\u3093\u305B\u3093\u30DB\u30C3\u30D7"}];var Uw={title:"Chatto Dash",blurb:"Race through five wild obstacle courses. Points for every finish. Most points wins!",players:"Racers",join:"JOIN THE RACE!",leave:"Leave",start:"START!",cancel:"Cancel",waitingHost:"Waiting for the host to start\u2026",courses:"This time's five courses",howTouch:"Left thumb to run \xB7 JUMP \xB7 DIVE",howKeys:"WASD or arrows to run \xB7 Space to jump \xB7 Shift to dive",round:"Round",getReady:"Get ready!",go:"GO!",jump:"JUMP",dive:"DIVE",finished:"FINISHED!",waitingOthers:"Waiting for the others\u2026",hurry:"Hurry!",watching:"Watching",end:"End",endConfirm:"End the game for everyone?",results:"Results",standings:"Standings",nextIn:"Next course in",nextNow:"Next course",practice:"Practice",practiceBlurb:"Any course, by yourself, against the clock. No connection needed.",best:"Best",noBest:"not run yet",newBest:"New best!",again:"Again",allCourses:"Courses",dnf:"did not finish",pts:"pts",winner:"WINNER!",tie:"IT'S A TIE!",finalResults:"Final results",playAgain:"PLAY AGAIN",close:"Close",minimize:"Minimize",resume:"Resume Chatto Dash",loading:"Building the course\u2026",noWebgl:"This device can't draw the 3D course.",raceOn:"A race is on!",watch:"WATCH"},zw={title:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5",blurb:"5\u3064\u306E\u30CF\u30C1\u30E3\u30E1\u30C1\u30E3\u969C\u5BB3\u7269\u30B3\u30FC\u30B9\u3092\u8D70\u308A\u306C\u3051\uFF01\u30B4\u30FC\u30EB\u3059\u308B\u305F\u3073\u30DD\u30A4\u30F3\u30C8\u3002\u3044\u3061\u3070\u3093\u591A\u3044\u4EBA\u304C\u512A\u52DD\uFF01",players:"\u30E9\u30F3\u30CA\u30FC",join:"\u30EC\u30FC\u30B9\u306B\u53C2\u52A0\uFF01",leave:"\u306C\u3051\u308B",start:"\u30B9\u30BF\u30FC\u30C8\uFF01",cancel:"\u30AD\u30E3\u30F3\u30BB\u30EB",waitingHost:"\u30DB\u30B9\u30C8\u306E\u30B9\u30BF\u30FC\u30C8\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",courses:"\u4ECA\u56DE\u306E5\u3064\u306E\u30B3\u30FC\u30B9",howTouch:"\u5DE6\u306E\u89AA\u6307\u3067\u8D70\u308B \xB7 \u30B8\u30E3\u30F3\u30D7 \xB7 \u30C0\u30A4\u30D6",howKeys:"WASD\u30FB\u77E2\u5370\u3067\u8D70\u308B \xB7 \u30B9\u30DA\u30FC\u30B9\u3067\u30B8\u30E3\u30F3\u30D7 \xB7 \u30B7\u30D5\u30C8\u3067\u30C0\u30A4\u30D6",round:"\u30E9\u30A6\u30F3\u30C9",getReady:"\u3088\u30FC\u3044\u2026",go:"\u30C9\u30F3\uFF01",jump:"\u30B8\u30E3\u30F3\u30D7",dive:"\u30C0\u30A4\u30D6",finished:"\u30B4\u30FC\u30EB\uFF01",waitingOthers:"\u307F\u3093\u306A\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026",hurry:"\u3044\u305D\u3052\uFF01",watching:"\u89B3\u6226\u4E2D",end:"\u7D42\u4E86",endConfirm:"\u307F\u3093\u306A\u306E\u30B2\u30FC\u30E0\u3092\u7D42\u4E86\u3057\u307E\u3059\u304B\uFF1F",results:"\u7D50\u679C",standings:"\u7DCF\u5408\u9806\u4F4D",nextIn:"\u6B21\u306E\u30B3\u30FC\u30B9\u307E\u3067",nextNow:"\u6B21\u306E\u30B3\u30FC\u30B9\u3078",practice:"\u308C\u3093\u3057\u3085\u3046",practiceBlurb:"\u597D\u304D\u306A\u30B3\u30FC\u30B9\u3092\u3072\u3068\u308A\u3067\u30BF\u30A4\u30E0\u30A2\u30BF\u30C3\u30AF\u3002\u901A\u4FE1\u306A\u3057\u3067\u904A\u3079\u307E\u3059\u3002",best:"\u30D9\u30B9\u30C8",noBest:"\u307E\u3060\u8D70\u3063\u3066\u3044\u307E\u305B\u3093",newBest:"\u30D9\u30B9\u30C8\u66F4\u65B0\uFF01",again:"\u3082\u3046\u4E00\u56DE",allCourses:"\u30B3\u30FC\u30B9\u4E00\u89A7",dnf:"\u30B4\u30FC\u30EB\u3067\u304D\u305A",pts:"\u70B9",winner:"\u512A\u52DD\uFF01",tie:"\u5F15\u304D\u5206\u3051\uFF01",finalResults:"\u6700\u7D42\u7D50\u679C",playAgain:"\u3082\u3046\u4E00\u56DE",close:"\u9589\u3058\u308B",minimize:"\u6700\u5C0F\u5316",resume:"\u30C1\u30E3\u30C3\u30C8\u30C0\u30C3\u30B7\u30E5\u3092\u518D\u958B",loading:"\u30B3\u30FC\u30B9\u3092\u6E96\u5099\u4E2D\u2026",noWebgl:"\u3053\u306E\u7AEF\u672B\u3067\u306F3D\u30B3\u30FC\u30B9\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093\u3002",raceOn:"\u30EC\u30FC\u30B9\u4E2D\uFF01",watch:"\u89B3\u6226\u3059\u308B"},rl=n=>n==="ja"?zw:Uw;function rp(n,e){if(e==="ja")return`${n}\u4F4D`;let t=n%100;return t>=11&&t<=13?`${n}th`:`${n}${["th","st","nd","rd"][n%10]??"th"}`}function Mo(n){let e=Math.max(0,n),t=Math.floor(e/60),i=e-t*60;return`${t}:${i<10?"0":""}${i.toFixed(1)}`}var sl=pn(Wn()),Bx="o-shootingstar";function Hx({children:n,onBackdrop:e}){return(0,sl.jsx)("div",{className:"ec-sheet-backdrop",style:{zIndex:95,alignItems:"center",padding:16},onClick:e,children:(0,sl.jsx)("div",{className:"ec-card",style:{width:"100%",maxWidth:380,maxHeight:"92dvh",overflowY:"auto",padding:"20px 16px 16px",textAlign:"center",background:"var(--paper)",animation:"ec-pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1)"},onClick:t=>t.stopPropagation(),children:n})})}var fn=pn(ua());var wo=1/60,Ow=30,Fw=11,Bw=6.4,Vx=8.6,ol=.42,Gx=.26,sp=1.15,Hw=50,Vw=22,Gw=6,Ww=.4,Xw=.35,Yw=8,xn={x:0,y:0,z:0,yaw:0},dt={x:0,y:0,z:0,yaw:0},op={x:0,y:0,z:0,yaw:0},So={x:0,y:0,z:0,yaw:0};function sr(n,e,t){return n.motion?n.motion(e,t):(t.x=n.x,t.y=n.y,t.z=n.z,t.yaw=n.yaw),t}function Xx(n,e,t){if(n.shape!=="ramp")return e.y+n.hy;let i=Math.max(-n.hz,Math.min(n.hz,t));return e.y+n.hy+n.rise*(n.hz-i)/(2*n.hz)}function Yx(n,e){let t=Math.floor((e-n.bucketZ0)/8);return n.buckets[t]??qw}var qw=[];function bo(n,e,t,i,r){let s=n.checkpoints[Math.max(0,Math.min(n.checkpoints.length-1,e))],o=Math.min(Yw,Math.max(1,i)),a=Math.floor(t/o),l=t%o;r.x=s.x+((l+.5)/o-.5)*s.width,r.y=s.y+.02,r.z=s.z+.6+a*1.1}function qx(n,e=0,t=1){let i={x:0,y:0,z:0,vx:0,vy:0,vz:0,fx:0,fz:-1,grounded:!1,ground:-1,coyote:0,jumpBuffer:0,jumpHeld:!1,diveHeld:!1,mode:0,modeT:0,diveCooldown:0,shield:0,checkpoint:0,slot:e,slots:t,events:0,falls:0};return bo(n,0,e,t,i),i}function Wx(n,e,t,i,r,s,o,a){n.vx=e*i+r*.7,n.vz=t*i+s*.7,n.vy=o,n.grounded=!1,n.ground=-1,n.coyote=0,n.events|=4,a&&n.mode!==4?(n.mode=2,n.modeT=.75,n.shield=.35):n.shield=.2}function jx(n,e,t,i,r){e.events=0;let s=i+r;if(e.mode===3){e.modeT-=r,e.modeT<=0&&(bo(n,e.checkpoint,e.slot,e.slots,e),e.vx=e.vy=e.vz=0,e.fx=0,e.fz=-1,e.mode=0,e.shield=1.2,e.grounded=!1,e.ground=-1);return}e.coyote=Math.max(0,e.coyote-r),e.jumpBuffer=Math.max(0,e.jumpBuffer-r),e.diveCooldown=Math.max(0,e.diveCooldown-r),e.shield=Math.max(0,e.shield-r);let o=n.solids,a=0,l=0,c=0,u=1,h=!1;if(e.grounded&&e.ground>=0){let A=o[e.ground];if(A.motion){sr(A,i,xn),sr(A,s,dt);let _=e.x-xn.x,S=e.z-xn.z,U=Math.cos(xn.yaw),z=Math.sin(xn.yaw),H=_*U-S*z,Y=_*z+S*U,O=Math.cos(dt.yaw),G=Math.sin(dt.yaw),F=dt.x+H*O+Y*G,ee=dt.z-H*G+Y*O;Math.abs(F-e.x)+Math.abs(ee-e.z)+Math.abs(dt.y-xn.y)<1.5&&(a=(F-e.x)/r,c=(ee-e.z)/r,l=(dt.y-xn.y)/r,e.x=F,e.z=ee,e.y+=dt.y-xn.y);let ne=dt.yaw-xn.yaw;if(ne!==0){let re=Math.cos(ne),Ee=Math.sin(ne),He=e.fx*re+e.fz*Ee;e.fz=-e.fx*Ee+e.fz*re,e.fx=He}}else dt.yaw=A.yaw;let L=A.surface;if(L){if(L.conveyor){let _=Math.cos(dt.yaw),S=Math.sin(dt.yaw),U=L.conveyor[0]*_+L.conveyor[1]*S,z=-L.conveyor[0]*S+L.conveyor[1]*_;e.x+=U*r,e.z+=z*r,a+=U,c+=z}L.speed!==void 0&&(u=L.speed),L.ice&&(h=!0)}}t.jump&&!e.jumpHeld&&(e.jumpBuffer=.14);let f=t.dive&&!e.diveHeld;e.jumpHeld=t.jump,e.diveHeld=t.dive;let p=t.mx,m=t.mz,x=Math.hypot(p,m);x>1&&(p/=x,m/=x);let g=e.mode===0,d=!1;if(g){let A=(e.grounded?h?Gw:Hw:Vw)*r,L=Bw*(e.grounded?u:1),_=p*L,S=m*L,U=_-e.vx,z=S-e.vz,H=Math.hypot(U,z);if(H<=A||H===0?(e.vx=_,e.vz=S):(e.vx+=U/H*A,e.vz+=z/H*A),x>.15&&(e.fx=p/Math.min(1,x),e.fz=m/Math.min(1,x)),e.jumpBuffer>0&&(e.grounded||e.coyote>0)&&(e.vy=Fw+Math.max(0,l),e.vx+=a,e.vz+=c,e.grounded=!1,e.ground=-1,e.coyote=0,e.jumpBuffer=0,e.events|=1,d=!0),f&&e.diveCooldown<=0){let Y=x>.2?p/x:e.fx,O=x>.2?m/x:e.fz;e.vx=Y*Vx+(e.grounded?a:0),e.vz=O*Vx+(e.grounded?c:0),e.vy=e.grounded?5:Math.max(e.vy,3),e.fx=Y,e.fz=O,e.mode=1,e.modeT=0,e.grounded=!1,e.ground=-1,e.coyote=0,e.events|=128,d=!0}}else if(e.grounded){let A=(h?3:e.mode===4?30:e.mode===1?16:11)*r,L=Math.hypot(e.vx,e.vz),_=L>A?(L-A)/L:0;e.vx*=_,e.vz*=_,e.modeT-=r,e.mode===1?e.modeT<-.5&&(e.mode=0,e.diveCooldown=.3):e.mode===2&&e.modeT<=0&&(e.mode=0)}else e.mode===2&&(e.modeT-=r);e.vy=Math.max(-45,e.vy-Ow*r);for(let A of n.winds){if(e.x<A.x0||e.x>A.x1||e.z<A.z0||e.z>A.z1||e.y<A.y0||e.y>A.y1)continue;let L=(A.pulse?A.pulse(i):1)*(e.grounded?.8:1)*r;e.x+=A.ax*L,e.z+=A.az*L}let v=e.grounded&&!d,y=e.y;e.x+=e.vx*r,e.y+=e.vy*r,e.z+=e.vz*r;let M=-1/0,R=-1,T=0,b=Yx(n,e.z);for(let A=0;A<2;A++){for(let L=0;L<b.length;L++){let _=o[b[L]];if(e.z<_.zMin-1||e.z>_.zMax+1||_.active&&_.active(s)===0)continue;sr(_,s,dt);let S=e.x-dt.x,U=e.z-dt.z,z=Math.cos(dt.yaw),H=Math.sin(dt.yaw),Y=S*z-U*H,O=S*H+U*z,G=0,F=0,ee=0,ne=0;if(_.shape==="cyl")ne=Math.hypot(Y,O),ee=Math.max(0,ne-_.hx),ne>0?(G=Y/ne,F=O/ne):G=1;else{let be=Math.max(-_.hx,Math.min(_.hx,Y)),ze=Math.max(-_.hz,Math.min(_.hz,O));G=Y-be,F=O-ze,ee=Math.hypot(G,F),ee>0&&(G/=ee,F/=ee)}if(ee>=ol)continue;let re=Xx(_,dt,O),Ee=dt.y-_.hy,He=0;_.motion&&(sr(_,i,xn),He=dt.y-xn.y);let q=v?Ww:.08;if(A===0){ee<Gx&&e.vy<=Math.max(0,He/r)+.01&&y>=re-q-Math.max(0,He)&&e.y<=re+(v?Xw:0)&&re>M&&(M=re,R=_.index,T=He);continue}if(_.index===R||e.y>=re-.02||e.y+sp<=Ee||!_.bumper&&re-e.y<=q)continue;if(y+sp<=Ee+.06&&e.vy>0&&ee<Gx){e.y=Ee-sp,e.vy=0;continue}let K=ol-ee;if(ee===0)if(_.shape==="cyl")K=_.hx-ne+ol;else{let be=_.hx-Math.abs(Y),ze=_.hz-Math.abs(O);be<ze?(G=Y<0?-1:1,F=0,K=be+ol):(G=0,F=O<0?-1:1,K=ze+ol)}let pe=G*z+F*H,le=-G*H+F*z;e.x+=pe*K,e.z+=le*K;let Ce=e.vx*pe+e.vz*le;if(Ce<0&&(e.vx-=pe*Ce,e.vz-=le*Ce),_.bumper&&e.shield<=0){let be=0,ze=0;if(_.motion){let Qe=Math.cos(xn.yaw),Xe=Math.sin(xn.yaw),I=xn.x+Y*Qe+O*Xe,dn=xn.z-Y*Xe+O*Qe;be=(e.x-pe*K-I)/r,ze=(e.z-le*K-dn)/r}Wx(e,pe,le,_.bumper,be,ze,_.tumble?7:5.5,!!_.tumble)}}if(A===0&&R>=0){let L=o[R];e.y=M,L.surface?.bounce?(e.vy=L.surface.bounce,e.grounded=!1,e.ground=-1,e.events|=16,e.mode===1&&(e.mode=0,e.diveCooldown=.2),R=-1):(v||(e.events|=2,e.mode===1&&(e.modeT=0)),e.vy=Math.max(0,T/r),e.grounded=!0,e.ground=R,e.coyote=.1)}else A===0&&(e.grounded=!1,e.ground=-1)}if(e.grounded||(e.ground=-1),e.shield<=0&&e.mode!==4)for(let A of n.balls){if(e.z<A.zMin-2||e.z>A.zMax+2||A.active&&!A.active(s))continue;A.pos(s,So);let L=e.x-So.x,_=e.y+.6-So.y,S=e.z-So.z,U=A.r+.5;if(L*L+_*_+S*S>=U*U)continue;A.pos(i,op);let z=(So.x-op.x)/r,H=(So.z-op.z)/r,Y=L,O=S,G=Math.hypot(Y,O);G<.05&&(Y=z,O=H,G=Math.hypot(Y,O)||1),Wx(e,Y/G,O/G,A.power*.6,z,H,7.5,!0),e.modeT=.8,e.shield=.45;break}if(e.y<n.killY){e.events|=8,e.falls++,e.mode!==4?(e.mode=3,e.modeT=.55):(e.x=n.finish.x,e.y=n.finish.y+.05,e.z=n.finish.z,e.vx=e.vy=e.vz=0);return}if(e.grounded&&e.mode!==4){let A=n.checkpoints;for(let _=A.length-1;_>e.checkpoint;_--){let S=A[_];if(Math.abs(e.z-S.z)<2.6&&Math.abs(e.x-S.x)<S.width/2+1.2&&Math.abs(e.y-S.y)<1.2){e.checkpoint=_,e.events|=32;break}}let L=n.finish;Math.abs(e.x-L.x)<=L.hx&&Math.abs(e.z-L.z)<=L.hz&&Math.abs(e.y-L.y)<1.5&&(e.mode=4,e.events|=64)}}function mp(n,e,t,i,r){let s=-1/0,o=Yx(n,i);for(let a=0;a<o.length;a++){let l=n.solids[o[a]];if(l.active&&l.active(r)===0)continue;sr(l,r,dt);let c=e-dt.x,u=i-dt.z,h=Math.cos(dt.yaw),f=Math.sin(dt.yaw),p=c*h-u*f,m=c*f+u*h;if(l.shape==="cyl"){if(p*p+m*m>l.hx*l.hx)continue}else if(Math.abs(p)>l.hx||Math.abs(m)>l.hz)continue;let x=Xx(l,dt,m);x<=t+.45&&x>s&&(s=x)}return s}function gp(n,e,t,i){let r=n.path,s=1/0,o=0;for(let a=0;a<r.length-1;a++){let l=r[a],c=r[a+1],u=c.x-l.x,h=c.y-l.y,f=c.z-l.z,p=u*u+h*h+f*f||1,m=((e-l.x)*u+(t-l.y)*h+(i-l.z)*f)/p;m=Math.max(0,Math.min(1,m));let x=e-(l.x+u*m),g=(t-(l.y+h*m))*.5,d=i-(l.z+f*m),v=x*x+g*g+d*d;v<s&&(s=v,o=n.pathLen[a]+Math.sqrt(p)*m)}return Math.max(0,Math.min(1,o/n.pathTotal))}var Wt="#1d1b4f",on="#fff8ec",ws="#3b6bff",_i="#d9e4ff",Ve="#ff7ab6",Ye="#ffd0e4",Te="#ffd23f",Ge="#fff4c4",oi="#3fdcb0",Tt="#dcfaef",Mi="#a77bff",Eo="#efe6ff",Mt="#ff4f6d",se="#ffffff",du=Math.PI*2;function Zt(n,e,t=0){let{x:i,y:r,z:s,yaw:o}=n;return n.motion=(a,l)=>{l.x=i,l.y=r,l.z=s,l.yaw=o+t+e*a},n}function vt(n,e,t,i,r,s=0){let{x:o,y:a,z:l,yaw:c}=n;return n.motion=(u,h)=>{let f=.5-.5*Math.cos(du*(u/r+s));h.x=o+e*f,h.y=a+t*f,h.z=l-i*f,h.yaw=c},n}function al(n,e,t,i=0,r=!1){let{x:s,y:o,z:a,yaw:l}=n;return n.motion=(c,u)=>{let h=i+t*c;u.x=s+Math.cos(h)*e,u.y=o,u.z=a-Math.sin(h)*e,u.yaw=r?l+h:l},n}function $x(n,e,t,i,r,s=0){let{x:o,y:a,z:l,yaw:c}=n;return n.motion=(u,h)=>{let f=((u/r+s)%1+1)%1;h.x=o+e*f,h.y=a+t*f,h.z=l-i*f,h.yaw=c},n}function ll(n,e,t,i,r,s,o,a=0){let{y:l}=n;return n.motion=(c,u)=>{let h=.5-.5*Math.cos(du*(c/o+a)),f=r+(s-r)*h;u.x=e+Math.cos(f)*i/2,u.y=l,u.z=-t-Math.sin(f)*i/2,u.yaw=f},n}function Zx(n,e,t,i=0){let{x:r,y:s,z:o,yaw:a}=n;return n.motion=(l,c)=>{let u=i+t*l;c.x=r,c.y=s+Math.sin(u)*e,c.z=o-Math.cos(u)*e,c.yaw=a},n}function cl(n,e,t=0){return i=>{let r=((i+t*n)%n+n)%n;return r>=e?0:r>=e-.7?1:2}}var Pt=class{constructor(e,t,i,r,s,o=-9){this.id=e;this.name=t;this.tagline=i;this.theme=r;this.timeLimit=s;this.killY=o;this.solids=[];this.balls=[];this.winds=[];this.checkpoints=[];this.decor=[];this.path=[];this.finishBox=null}add(e,t,i,r,s,o,a,l,c){let u={shape:e,x:t,y:i,z:r,hx:s,hy:o,hz:a,rise:l,yaw:c.yaw??0,color:c.color??this.theme.floor,look:c.look??"floor",surface:c.surface,bumper:c.bumper,tumble:c.tumble,motion:c.motion,active:c.active,zMin:0,zMax:0,index:this.solids.length};return this.solids.push(u),u}box(e,t,i,r,s,o,a={}){return this.add("box",e,t-s/2,-i,r/2,s/2,o/2,0,a)}cyl(e,t,i,r,s,o={}){return this.add("cyl",e,t-s/2,-i,r,s/2,r,0,o)}ramp(e,t,i,r,s,o,a={}){return this.add("ramp",e,r-.6/2,-(t+i)/2,o/2,.6/2,(i-t)/2,s-r,a)}roller(e,t,i,r,s,o={}){let[a,l,c]=t,[u,h,f]=i,p={r:e,power:11,color:se,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=((m/r+s)%1+1)%1;x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(f-c)*g),x.yaw=g*Math.hypot(u-a,f-c)/e},...o};return this.balls.push(p),p}shuttle(e,t,i,r,s,o={}){let[a,l,c]=t,[u,h,f]=i,p={r:e,power:11,color:se,look:"mochi",zMin:0,zMax:0,pos:(m,x)=>{let g=.5-.5*Math.cos(du*(m/r+s));x.x=a+(u-a)*g,x.y=l+(h-l)*g+e,x.z=-(c+(f-c)*g),x.yaw=g*Math.hypot(u-a,f-c)/e},...o};return this.balls.push(p),p}hopper(e,t,i,r,s,o,a,l,c={}){let[u,h]=t,[f,p]=i,m={r:e,power:10,color:se,look:"mochi",zMin:0,zMax:0,pos:(x,g)=>{let d=((x/a+l)%1+1)%1;g.x=u+(f-u)*d,g.y=r+e+s*Math.abs(Math.sin(Math.PI*o*d)),g.z=-(h+(p-h)*d),g.yaw=0},...c};return this.balls.push(m),m}lantern(e,t,i,r,s,o,a,l){let c={r:.85,power:12,color:l,look:"lantern",zMin:0,zMax:0,anchor:{x:e,y:t,z:-i},pos:(u,h)=>{let f=s*Math.sin(du*(u/o+a));h.x=e+Math.sin(f)*r,h.y=t-Math.cos(f)*r,h.z=-i,h.yaw=f}};return this.balls.push(c),c}wind(e,t,i,r,s,o,a,l,c){let u={x0:e,x1:t,y0:s,y1:o,z0:-r,z1:-i,ax:a,az:-l,pulse:c};return this.winds.push(u),u}checkpoint(e,t,i,r){this.checkpoints.push({x:e,y:t,z:-i,width:r}),this.way(e,t,i)}finish(e,t,i,r,s){this.finishBox={x:e,y:t,z:-i,hx:r/2,hz:s/2},this.way(e,t,i)}way(e,t,i){this.path.push({x:e,y:t,z:-i})}deco(e,t,i,r,s=1,o=se){this.decor.push({kind:e,x:t,y:i,z:-r,s,color:o})}build(){if(!this.finishBox)throw new Error(`${this.id}: no finish`);if(this.checkpoints.length===0)throw new Error(`${this.id}: no start`);let e={x:0,y:0,z:0,yaw:0},t=1/0,i=-1/0;for(let l of this.solids){let c=l.shape==="cyl"?l.hx:Math.hypot(l.hx,l.hz);l.zMin=1/0,l.zMax=-1/0;for(let u=0;u<=(l.motion?60:0);u+=.05)sr(l,u,e),l.zMin=Math.min(l.zMin,e.z-c),l.zMax=Math.max(l.zMax,e.z+c);t=Math.min(t,l.zMin),i=Math.max(i,l.zMax)}for(let l of this.balls){l.zMin=1/0,l.zMax=-1/0;for(let c=0;c<=60;c+=.05)l.pos(c,e),l.zMin=Math.min(l.zMin,e.z-l.r),l.zMax=Math.max(l.zMax,e.z+l.r)}let r=Math.floor(t/8)*8-8,s=Math.ceil((i-r)/8)+2,o=Array.from({length:s},()=>[]);for(let l of this.solids){let c=Math.max(0,Math.floor((l.zMin-1.5-r)/8)),u=Math.min(s-1,Math.floor((l.zMax+1.5-r)/8));for(let h=c;h<=u;h++)o[h].push(l.index)}let a=[0];for(let l=1;l<this.path.length;l++){let c=this.path[l-1],u=this.path[l];a.push(a[l-1]+Math.hypot(u.x-c.x,u.y-c.y,u.z-c.z))}return{id:this.id,name:this.name,tagline:this.tagline,theme:this.theme,solids:this.solids,balls:this.balls,winds:this.winds,checkpoints:this.checkpoints,finish:this.finishBox,path:this.path,killY:this.killY,decor:this.decor,timeLimit:this.timeLimit,buckets:o,bucketZ0:r,pathLen:a,pathTotal:a[a.length-1]||1}}};function Kx(){let n=new Pt("kaiten-rush",{en:"Kaiten Rush",ja:"\u56DE\u8EE2\u305A\u3057\u30E9\u30C3\u30B7\u30E5"},{en:"Ride the belts. Mind the plates!",ja:"\u30D9\u30EB\u30C8\u306B\u4E57\u3063\u3066\u9032\u3081\u3002\u304A\u76BF\u306B\u6CE8\u610F\uFF01"},{sky:["#ffd9e8",on],fog:"#fff1e6",floor:Ge,floorAlt:Ye,accent:Ve,accent2:oi},110);n.box(0,0,3.5,12,1,13,{color:Ye}),n.checkpoint(0,0,3.5,9),n.box(-3.6,0,25,3.2,1,30,{look:"belt",color:Tt,surface:{conveyor:[0,-3]}}),n.box(0,0,25,3.2,1,30,{look:"belt",color:Ye,surface:{conveyor:[0,3]}}),n.box(3.6,0,25,3.2,1,30,{look:"belt",color:_i,surface:{conveyor:[0,-1.2]}});for(let[t,i]of[[-4.3,17],[-2.9,26],[-4.3,35]])n.cyl(t,.9,i,.7,.9,{look:"plate",color:se,bumper:7});n.box(-5.4,.9,25,.4,.9,30,{look:"rail",color:Ve});for(let[t,i]of[[18,0],[28,.5]])vt(n.box(6.4,1.1,t,2.4,1.1,2.2,{look:"pusher",color:Ve}),-3.4,0,0,2.6,i);n.way(-3.6,0,11),n.way(-2.7,0,17),n.way(-4.5,0,26),n.way(-2.7,0,35),n.box(0,0,43,12,1,6,{color:Ye}),n.checkpoint(0,0,42.5,8),[4,-4,-4,4,4,-4,4,-4,-4,4].forEach((t,i)=>{n.box(0,0,47.5+i*3,11,1,3,{look:"belt",color:i%2?Tt:Ge,surface:{conveyor:[t,0]}})});for(let[t,i]of[[-2,52],[2.5,58],[-3,64],[1,70],[-.5,61]])n.cyl(t,1.1,i,.5,1.1,{look:"bumper",color:Mt,bumper:6.5});n.box(0,0,79,12,1,6,{color:Ye}),n.checkpoint(0,0,78.5,8),vt(n.cyl(-3.5,0,86,2.2,.6,{look:"plate",color:se}),7,0,0,5.2,0),n.box(0,0,92,5,1,3.5,{color:Tt}),vt(n.cyl(-3.5,0,98,2.2,.6,{look:"plate",color:se}),7,0,0,4.6,.4),n.box(0,0,104,5,1,3.5,{color:Tt}),vt(n.cyl(-3.5,0,110,2.2,.6,{look:"plate",color:se}),7,0,0,5.6,.75),n.way(0,0,86),n.way(0,0,92),n.way(0,0,98),n.way(0,0,104),n.way(0,0,110),n.box(0,0,116,12,1,6,{color:Ye}),n.checkpoint(0,0,115.5,8),n.box(0,0,134.5,9,1,31,{look:"belt",color:Tt,surface:{conveyor:[0,-4.5]}});for(let[t,i]of[[126,1.8],[135,-2.1],[144,2]])Zt(n.box(0,.8,t,8.6,.72,.5,{look:"bar",color:Te,bumper:9,tumble:!0}),i,t),n.cyl(0,1.2,t,.5,1.2,{look:"bumper",color:Ve});n.box(0,0,155,12,1,10,{look:"finish",color:se}),n.finish(0,0,156,12,8);for(let t=8;t<160;t+=19)n.deco("sushi",t%2?-11:11,1+t%5,t,1.6,t%3?Ve:oi),n.deco("cloud",t%2?13:-13,6+t%4,t+8,2.2,se);return n.build()}function Jx(){let n="#fff0d4",e="#ff9a5c",t=new Pt("matsuri-carousel",{en:"Matsuri Carousel",ja:"\u304A\u307E\u3064\u308A\u30AB\u30EB\u30FC\u30BB\u30EB"},{en:"Ride the rides. Mind the fireworks!",ja:"\u4E57\u308A\u3082\u306E\u306B\u4E57\u3063\u3066\u9032\u3081\u3002\u82B1\u706B\u306B\u6CE8\u610F\uFF01"},{sky:["#ffc7d6",on],fog:"#fff0ea",floor:n,floorAlt:Ye,accent:e,accent2:Mi},140);t.box(0,0,3.5,12,1,13,{color:Ye}),t.checkpoint(0,0,3.5,9);let i=Math.PI*2;[[17.5,.8],[31.5,-.8]].forEach(([c,u],h)=>{t.cyl(0,0,c,1.4,1,{look:"drum",color:h?Te:Mt});for(let f=0;f<3;f++)al(t.cyl(0,0,c,1.7,.6,{look:"plate",color:f%2?Ge:se}),5,u,f/3*i+h*.6,!1);t.way(0,0,c)}),t.way(0,0,37),t.box(0,0,42.2,12,1,7.6,{color:Ye}),t.checkpoint(0,0,42.5,8),t.box(0,0,62,7,1,32),[[-2.2,2.2],[0],[-2.2,0],[2.2],[0,2.2],[-2.2]].forEach((c,u)=>{let h=51+u*5;c.forEach((f,p)=>{t.cyl(f,.2,h,.55,.2,{look:"bumper",color:u%2?Mi:e}),t.shuttle(.75,[f,-4.6,h],[f,3.6,h],2.2+u%3*.3,u*.23+p*.5,{look:"shot",color:[Te,Ve,oi][(u+p)%3],power:9})})}),t.box(0,0,81.75,12,1,7.5,{color:Ye}),t.checkpoint(0,0,80.5,8);let s=88.5,o=6;for(let c=0;c<6;c++)Zx(t.box(0,o,s,2.8,.4,2.8,{look:"tile",color:[Ye,Ge,Tt][c%3]}),o,.45,c/6*i);for(let c of[-3.3,3.3])t.box(c,o+.4,s,.5,o+7.4,.5,{look:"wall",color:e});t.box(0,o+.4,s,7.1,.8,.8,{look:"bar",color:Te}),t.box(0,6,99.2,8,1,5.6),t.way(0,0,s),t.way(0,6,s+o),t.way(0,6,99.2),t.ramp(0,102,114,6,0,8,{look:"ice",color:"#ffe3ef",surface:{ice:!0}}),t.lantern(0,10.4,106,6.4,.8,2.8,0,Ve),t.lantern(0,7.9,111,6.4,.8,2.8,.5,Te),t.box(0,0,117,12,1,6,{color:Ye}),t.checkpoint(0,0,116.5,8);let a=128;Zt(t.cyl(0,0,a,7.2,.8,{look:"disc",color:Ge}),.7,0);for(let c=0;c<4;c++)al(t.box(0,.9,a,4.4,.9,.5,{look:"wall",color:c%2?Ve:oi,bumper:5.5}),3.6,.7,c/4*i,!0);t.cyl(0,3,a,1.2,3,{look:"drum",color:Mt}),t.way(4.2,0,a),t.box(0,0,139,8,1,6),t.lantern(0,7.6,139,6.6,.8,3,.2,Mi);let l=.35;for(let c=1;c<=4;c++)t.box(0,c*l,141.4+c*1.2,8,c*l+1,1.2,{color:c%2?n:Ge});t.way(0,0,139),t.box(0,4*l,153.4,12,1,13.2,{look:"finish",color:se}),t.finish(0,4*l,156,12,8);for(let c=6;c<160;c+=15)t.deco("lantern",c%2?-9.5:9.5,5+c%3,c,1.3,c%3?Mt:Te),t.deco("flag",c%2?10:-10,3+c%4,c+6,1.3,c%3?Ve:oi),t.deco("cloud",c%2?15:-15,9+c%4,c+8,2.4,se);return t.build()}function Qx(){let n="#f1f5ff",e="#cfe8ff",t=new Pt("mochi-mountain",{en:"Mochi Mountain",ja:"\u3082\u3061\u3082\u3061\u5C71"},{en:"Climb! Dodge the rolling mochi!",ja:"\u306E\u307C\u308C\uFF01\u3053\u308D\u304C\u308B\u304A\u3082\u3061\u3092\u3088\u3051\u308D\uFF01"},{sky:["#dfe9ff","#ffffff"],fog:"#f3f6ff",floor:n,floorAlt:Ye,accent:Ve,accent2:"#9ad0ff"},130);t.box(0,0,3.5,12,1,13,{color:Ye}),t.checkpoint(0,0,3.5,9),t.ramp(0,10,45,0,6.5,10.5),[-3.2,0,3.2].forEach((s,o)=>{t.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17,{color:o===1?Ye:se}),t.roller(1.25,[s,6.5,45],[s,0,10],5.4,o*.17+.5,{color:o===1?se:"#e3f9d5"})}),t.box(0,6.5,48.5,10.5,1,7,{color:Ye}),t.checkpoint(0,6.5,48,8),t.box(0,6.5,68,12,1,32),[55.5,59.5,63.5,67.5,71.5,75.5,79.5].forEach((s,o)=>{let a=o%2?[-5.5,-1.5,2.5]:[-3.5,.5,4.5];for(let l of a)t.cyl(l,6.62,s,1.65,.3,{look:"mochi",color:o%3?Ye:"#e3f9d5",surface:{speed:.42}})}),t.shuttle(1.1,[-5.6,6.5,61.5],[5.6,6.5,61.5],3.8,0,{color:se}),t.shuttle(1.1,[5.6,6.5,73.5],[-5.6,6.5,73.5],3.4,.3,{color:Ye}),t.box(0,6.5,87,10.5,1,6,{color:Ye}),t.checkpoint(0,6.5,86.5,8);let r=[[-2,7.6,94],[2,8.7,101],[-2,9.8,108],[2,10.9,115]];for(let[s,o,a]of r)t.box(s,o,a,5.6,1,5.5,{look:"ice",color:e,surface:{ice:!0}}),t.way(s,o,a);t.cyl(2,10,101,.5,1.3,{look:"bumper",color:Ve,bumper:6}),t.cyl(-2,11.1,108,.5,1.3,{look:"bumper",color:Te,bumper:6}),t.box(0,12,122.6,10,1,6.8,{color:Ye}),t.checkpoint(0,12,122,8),t.ramp(0,126,152,12,16,9.5),[-3,0,3].forEach((s,o)=>{t.roller(1.4,[s,16,152],[s,12,126],4.4,o*.33,{color:o===1?Ye:se})}),t.box(0,16,157,12,1,10,{look:"finish",color:se}),t.finish(0,16,158,12,8);for(let s=6;s<165;s+=15){let o=s<45?s/45*6:s<90?6.5:s<126?6.5+(s-90)/36*5.5:12+(s-126)/30*4;t.deco("star",s%2?-10:10,o+2+s%3,s,1.1,s%3?Ve:Te),t.deco("cloud",s%2?13:-13,o+6+s%4,s+6,2.6,se)}return t.build()}function e_(){let n="#e4def5",e="#cfc6ec",t="#cdeccf",i=new Pt("ninja-rooftops",{en:"Ninja Rooftops",ja:"\u3057\u306E\u3073\u30EB\u30FC\u30D5"},{en:"Leap the gaps. Slip through the doors!",ja:"\u5C4B\u6839\u3092\u3068\u3073\u3053\u3048\u3001\u3075\u3059\u307E\u3092\u3059\u308A\u306C\u3051\u308D\uFF01"},{sky:["#c9c2f2","#ffe9d6"],fog:"#f1e9f7",floor:n,floorAlt:Ye,accent:Mi,accent2:Te},130);i.box(0,0,3.5,12,1,13,{color:Ye}),i.checkpoint(0,0,3.5,9),i.ramp(0,11,15,0,1.4,7,{color:e}),i.ramp(0,15,19,1.4,0,7,{color:e}),i.box(-1.5,1,24.3,5,1,5.4,{color:n}),i.ramp(1.5,29.8,33,.6,1.8,5,{color:e}),i.ramp(1.5,33,36.2,1.8,.6,5,{color:e}),i.way(0,1.4,15),i.way(-1.5,1,24.3),i.way(1.5,1.8,33),i.box(0,0,42.3,12,1,7.4,{color:Ye}),i.checkpoint(0,0,42.5,8),i.box(0,0,62,9,1,32);for(let o of[-4.7,4.7])i.box(o,1,62,.4,1,32,{look:"rail",color:Mi});[52,58.5,65,71.5].forEach((o,a)=>{let l=a%2?Ge:se;vt(i.box(-7.45,2.4,o,7.1,2.4,.5,{look:"wall",color:l}),5.2,0,0,4.2,a*.27),vt(i.box(1.85,2.4,o,6.3,2.4,.5,{look:"wall",color:l}),5.2,0,0,4.2,a*.27)}),i.box(0,0,80.5,12,1,5,{color:Ye}),i.checkpoint(0,0,80,8),[[-1.2,.4,85.4],[.9,.8,88.6],[-.7,1.2,91.8],[1.2,1.6,95],[-.9,2,98.2],[.8,2.4,101.4],[-1.1,2.8,104.6],[.7,3.2,107.8],[-.4,3.6,111]].forEach(([o,a,l],c)=>{let u=i.cyl(o,a,l,1.3,a+7,{look:"disc",color:c%2?t:"#e3f6d8"});(c===3||c===6)&&vt(u,0,-.7,0,3.4,c*.2),i.way(o,a,l)}),i.roller(.55,[-9,2,96.6],[9,2,96.6],2.6,0,{look:"shot",color:Te,power:11}),i.roller(.55,[9,3.2,106.2],[-9,3.2,106.2],2.6,.5,{look:"shot",color:Ve,power:11}),i.box(0,3.6,116,10,1,7,{color:Ye}),i.checkpoint(0,3.6,116,7),[[-1,3,124.5],[1.5,2,134],[-1,1,143.5]].forEach(([o,a,l],c)=>{i.box(o,a,l,6,1,7,{color:c%2?n:e}),i.way(o,a,l);let u=c%2?[[-1.6,-1.4],[.4,.6],[1.8,-.4],[-.4,2.2]]:[[1.5,-1.6],[-.6,.2],[-1.9,1.8],[1.2,2]];for(let[h,f]of u)i.cyl(o+h,a+.3,l+f,.35,.3,{look:"bumper",color:Mt,bumper:5.5})}),i.box(0,0,155,12,1,10,{look:"finish",color:se}),i.finish(0,0,156,12,8);for(let o=6;o<160;o+=16)i.deco("lantern",o%2?-9.5:9.5,4+o%4,o,1.2,o%3?Eo:Te),i.deco("star",o%2?12:-12,8+o%5,o+5,.9,o%3?Te:se),i.deco("cloud",o%2?15:-15,9+o%3,o+9,2.2,se);return i.build()}function t_(){let n="#eeeae0",e="#dcd6ea",t="#bfeaff",i=new Pt("onsen-hop",{en:"Onsen Hop",ja:"\u304A\u3093\u305B\u3093\u30DB\u30C3\u30D7"},{en:"Wait for the geyser. Then jump on!",ja:"\u304B\u3093\u3051\u3064\u305B\u3093\u3092\u5F85\u3063\u3066\u3001\u3068\u3073\u4E57\u308C\uFF01"},{sky:["#bfeee2",on],fog:"#ecfaf5",floor:n,floorAlt:Tt,accent:oi,accent2:Ve},140);i.box(0,0,3.5,12,1,13,{color:Tt}),i.checkpoint(0,0,3.5,9);let r=(o,a,l,c,u)=>i.cyl(o,a+.12,l,1.3,.12,{look:"geyser",color:t,surface:{bounce:15.5},active:cl(c,1.5,u)});[[0,12.5],[-2.2,16],[1.6,19.5],[-1,23.2],[2.4,26.6],[0,30.2],[-2.4,33.6],[.6,37]].forEach(([o,a],l)=>{let c=i.cyl(o,0,a,1.35,1.2,{look:"plate",color:l%2?e:n});l%2&&vt(c,0,-1.1,0,3.4,l*.17),i.way(o,0,a)}),i.shuttle(.6,[-6,0,21.3],[6,0,21.3],4,0,{look:"plum",color:Te,power:9}),i.shuttle(.6,[6,0,31.9],[-6,0,31.9],4,.4,{look:"plum",color:Te,power:9}),i.box(0,0,42.5,12,1,7,{color:Tt}),i.checkpoint(0,0,42.5,8),i.box(0,0,50.5,9,1,9),r(0,0,53,3.2,0),i.box(0,3.2,60,9,1,8,{color:e}),r(0,3.2,62.3,3.2,.5),i.way(0,0,53),i.way(0,3.2,58),i.way(0,3.2,62.3),i.way(0,6.4,67),i.box(0,6.4,73.5,12,1,16,{color:Tt}),i.checkpoint(0,6.4,78,8),i.box(0,6.4,98.25,7,1,33.5,{color:Ge}),[-2.2,0,2.2].forEach((o,a)=>{i.hopper(.85,[o,114],[o,83],6.4,2.7,7,5.2,a*.37,{color:a===1?Ye:se}),i.hopper(.85,[o,114],[o,83],6.4,2.7,7,5.2,a*.37+.5,{color:a===1?se:Ge})}),i.box(0,6.4,118.2,12,1,6.4,{color:Tt}),i.checkpoint(0,6.4,117.5,8),vt(i.box(-1.5,6.4,124.4,3.6,.6,3.6,{look:"tile",color:se}),0,-2.6,0,4,0),vt(i.box(1.5,3.8,129.4,3.6,.6,3.6,{look:"tile",color:Ye}),0,-2.6,0,4,.5),i.box(0,1.2,137.5,10,1,11,{color:e}),[-3,0,3].forEach((o,a)=>r(o,1.2,141,3.6,a/3)),i.way(-1.5,3.8,124.4),i.way(1.5,1.2,129.4),i.way(0,1.2,141),i.box(0,4.4,152,12,1,16,{look:"finish",color:se}),i.finish(0,4.4,156,12,8);for(let o=6;o<160;o+=16){let a=o<55?0:o<64?3.2:o<121?6.4:2;i.deco("lantern",o%2?-9.5:9.5,a+4+o%3,o,1.2,o%3?Ve:Te),i.deco("cloud",o%2?14:-14,a+8+o%4,o+7,2.6,se)}return i.deco("torii",0,0,9.5,2.3,Ve),i.build()}function n_(){let n="#f4ecff",e=new Pt("origami-sky",{en:"Origami Sky",ja:"\u304A\u308A\u304C\u307F\u30B9\u30AB\u30A4"},{en:"The floor folds away. Keep moving!",ja:"\u3086\u304B\u304C\u6D88\u3048\u308B\uFF01\u6B62\u307E\u308B\u306A\uFF01"},{sky:["#e2d4ff",on],fog:"#f6efff",floor:n,floorAlt:Ge,accent:Mi,accent2:Te},140);e.box(0,0,3.5,12,1,13,{color:Ge}),e.checkpoint(0,0,3.5,9);for(let i=0;i<8;i++)for(let r=0;r<4;r++){let s=(i+r)%2===0;e.box(-4.05+r*2.7,0,12+i*3.7,2.4,.5,3.4,{look:"tile",color:s?Eo:Ge,active:cl(4.4,2.7,s?0:.5)})}e.box(0,0,43,12,1,6,{color:Ge}),e.checkpoint(0,0,42.5,8),e.box(0,0,62,5,1,32),[51,57,63,69,75].forEach((i,r)=>{let s=r%2?10:-10;e.roller(.7,[s,.25,i],[-s,.25,i],2.1,r*.37,{look:"shot",color:r%2?Te:se,power:12}),e.deco("plane",s*1.12,.6,i,1.4,r%2?Ve:Mi)}),vt(e.box(5.2,1.1,54,2.4,1.1,1.8,{look:"pusher",color:Ve}),-3.6,0,0,2.8,.2),vt(e.box(-5.2,1.1,66,2.4,1.1,1.8,{look:"pusher",color:Ve}),3.6,0,0,2.8,.6),e.box(0,0,81,12,1,6,{color:Ge}),e.checkpoint(0,0,80.5,8),[[90,0,.7],[100,1.2,-.8],[110,2.4,.9]].forEach(([i,r,s],o)=>{let a=o%2?Ge:Eo;Zt(e.box(0,r,i,8,.6,1.9,{look:"tile",color:a}),s,o),Zt(e.box(0,r,i,1.9,.6,8,{look:"tile",color:a}),s,o),e.way(0,r,i)}),e.box(0,3,119,9,1,6,{color:Ge}),e.checkpoint(0,3,118.5,7),e.box(0,3,126,8,1,8),Zt(e.box(0,3.8,126,7.4,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),2.2,1),e.cyl(0,4.2,126,.5,1.2,{look:"bumper",color:Te});for(let i=0;i<4;i++)for(let r=0;r<2;r++){let s=(i+r)%2===0;e.box(r?1.45:-1.45,3,131.6+i*3,2.7,.5,2.8,{look:"tile",color:s?Eo:Tt,active:cl(3.6,2.3,s?0:.5)})}e.box(0,3,146,7,1,7),e.cyl(0,3.3,147.3,1.6,1.2,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.way(0,3,131),e.way(0,3,142.5),e.way(0,3.3,147.3),e.box(0,5.5,157,11,1,10,{look:"finish",color:se}),e.finish(0,5.5,158,11,8);for(let i=6;i<165;i+=14)e.deco("plane",i%2?-11:11,4+i%5,i,1.2,i%3?Mi:Ve),e.deco("cloud",i%2?14:-14,8+i%4,i+5,2.4,se);return e.build()}function i_(){let n="#fff0c4",e="#ffe2a6",t="#c4e4c8",i="#f1cf9c",r="#ff9a3d",s=new Pt("ramen-slide",{en:"Ramen Slide",ja:"\u30E9\u30FC\u30E1\u30F3\u30B9\u30E9\u30A4\u30C0\u30FC"},{en:"Ride the broth. Don't stop for the eggs!",ja:"\u30B9\u30FC\u30D7\u306B\u4E57\u3063\u3066\u4E0B\u308C\u3002\u305F\u307E\u3054\u306B\u8FFD\u3044\u3064\u304B\u308C\u308B\u306A\uFF01"},{sky:["#ffdcae",on],fog:"#fff3df",floor:n,floorAlt:"#ffe0c2",accent:r,accent2:Mt},130,-26);s.box(0,0,3.5,12,1,13,{color:"#ffe0c2"}),s.checkpoint(0,0,3.5,9);let o=(c,u,h,f,p)=>{s.ramp(0,c,u,h,f,9,{look:"belt",color:e,surface:{conveyor:[0,-3.5]}});for(let m of[-4.7,4.7])s.ramp(m,c,u,h+.9,f+.9,.4,{look:"rail",color:r});return[-2.6,2.6].forEach((m,x)=>{s.roller(1.05,[m,h-2*(h-f)/(u-c),c+2],[m,f,u],p,x*.5,{color:x?Ge:se})}),m=>h+(f-h)*(m-c)/(u-c)},a=o(10,40,0,-7,3.2);for(let[c,u]of[[-2.3,17],[2.3,24],[-2.3,31]])s.box(c,a(u)+.85,u,4.2,1.7,.7,{look:"bar",color:i});for(let[c,u]of[[2.6,19.5],[-2.4,27.5],[1.4,35]])s.cyl(c,a(u)+1.1,u,.7,1.6,{look:"plate",color:Ye,bumper:6});s.box(0,-7,43,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-7,42.5,8),s.box(-1.5,-7,50,4,.6,5,{look:"tile",color:t}),s.cyl(1,-7.2,56,1.7,1,{look:"drum",color:Te,surface:{bounce:13}}),Zt(s.cyl(0,-5.5,62.5,3,.7,{look:"disc",color:Ye}),1,0),s.box(-1.2,-6.3,69.75,4,.6,4.5,{look:"tile",color:t}),s.cyl(.8,-6.5,75,1.7,1,{look:"drum",color:Te,surface:{bounce:13}}),s.way(-1.5,-7,50),s.way(1,-7.2,56),s.way(0,-5.5,62.5),s.way(-1.2,-6.3,69.75),s.way(.8,-6.5,75),s.box(0,-5,81,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-5,80.5,8);let l=o(84,114,-5,-12,3.4);[92,100,108].forEach((c,u)=>{let h=u%2===0;ll(s.box(0,l(c)+.95,c,6,.7,.45,{look:"bar",color:u%2?Ve:Te,bumper:7,tumble:!0}),h?-4.5:4.5,c,6,h?0:Math.PI,Math.PI/2,2.8,u*.3)}),s.box(0,-12,117,12,1,6,{color:"#ffe0c2"}),s.checkpoint(0,-12,116.5,8);for(let c=0;c<5;c++){let u=123.2+c*5.4;vt(s.box(-1.5,-12,u,1.7,.7,5,{look:"tile",color:c%2?Ge:n}),3,0,0,3.6,c*.31),s.way(0,-12,u)}s.box(0,-12,154,12,1,12,{look:"finish",color:se}),s.finish(0,-12,156,12,8);for(let c=6;c<160;c+=17){let u=c<40?-(7*c)/40:c<84?-6:c<114?-5-7*(c-84)/30:-12;s.deco("sushi",c%2?-11:11,u+2+c%4,c,1.5,c%3?Ve:Te),s.deco("cloud",c%2?14:-14,u+7+c%4,c+8,2.4,se)}return s.build()}function r_(){let n="#eef2f8",e="#cfd6e6",t=new Pt("shinkansen-dash",{en:"Shinkansen Dash",ja:"\u3057\u3093\u304B\u3093\u305B\u3093\u30C0\u30C3\u30B7\u30E5"},{en:"Cross the tracks. Ride the roofs!",ja:"\u7DDA\u8DEF\u3092\u308F\u305F\u3063\u3066\u3001\u5C4B\u6839\u306B\u4E57\u308C\uFF01"},{sky:["#bfe0ff",on],fog:"#eef6ff",floor:n,floorAlt:Ge,accent:ws,accent2:Te},130);t.box(0,0,3.5,12,1,13,{color:Ge}),t.checkpoint(0,0,3.5,9),t.box(0,0,25,12,1,30),[15.5,21.5,27.5,33.5].forEach((s,o)=>{t.box(0,.03,s,12,.06,2.6,{look:"tile",color:e});let a=o%2===0;for(let l of[0,.5])$x(t.box(a?-17:17,2.3,s,7,2.3,2,{look:"pusher",color:o%2?_i:se,bumper:8,tumble:!0}),a?34:-34,0,0,3.4+o*.25,l+o*.21)}),t.box(0,0,43,12,1,6,{color:Ge}),t.checkpoint(0,0,42.5,8),vt(t.box(-2.5,0,51,3,1.2,8,{look:"tile",color:se}),0,0,10,6,0),vt(t.box(2.5,0,63,3,1.2,8,{look:"tile",color:_i}),0,0,10,6,.5),t.way(-2.5,0,51),t.way(-2.5,0,62),t.way(2.5,0,63),t.way(2.5,0,74),t.box(0,0,80,12,1,6,{color:Ge}),t.checkpoint(0,0,79.5,8);let i=.35;for(let s=1;s<=6;s++)t.box(0,s*i,83.6+s*1.2,7,s*i+1,1.2,{color:s%2?n:Ge});let r=6*i;t.box(0,r,99.9,6,.8,16.6),[95.5,100,104.5].forEach((s,o)=>{ll(t.box(-3,r+.8,s,2.8,.6,.4,{look:"bar",color:o%2?Te:Mt,bumper:8,tumble:!0}),-3,s,2.8,0,Math.PI/2,3.2,o*.3),ll(t.box(3,r+.8,s,2.8,.6,.4,{look:"bar",color:o%2?Te:Mt,bumper:8,tumble:!0}),3,s,2.8,Math.PI,Math.PI/2,3.2,o*.3),t.cyl(-3,r+1.3,s,.3,1.3,{look:"bumper",color:se}),t.cyl(3,r+1.3,s,.3,1.3,{look:"bumper",color:se})});for(let s=5;s>=1;s--)t.box(0,s*i,108.8+(5-s)*1.2,7,s*i+1,1.2,{color:s%2?n:Ge});t.way(0,r,92),t.way(0,r,108),t.box(0,0,117.4,12,1,6.4,{color:Ge}),t.checkpoint(0,0,117,8),t.box(0,0,135.3,5,1,29.4,{look:"belt",color:se,surface:{conveyor:[0,-5]}}),[127,133,139,145].forEach((s,o)=>{t.box(0,.75,s,5,.75,.5,{look:"bar",color:o%2?Ve:ws})}),t.box(0,0,155,12,1,10,{look:"finish",color:se}),t.finish(0,0,156,12,8);for(let s=6;s<160;s+=18)t.deco("flag",s%2?-9:9,2+s%3,s,1.4,s%3?ws:Te),t.deco("cloud",s%2?14:-14,7+s%4,s+7,2.5,se);return t.build()}function s_(){let n="#ffe2c2",e=new Pt("taiko-bounce",{en:"Taiko Bounce",ja:"\u592A\u9F13\u30B8\u30E3\u30F3\u30D7"},{en:"Hop the sticks, bounce the drums!",ja:"\u30D0\u30C1\u3092\u3068\u3073\u3053\u3048\u3001\u592A\u9F13\u3067\u306F\u306D\u308D\uFF01"},{sky:["#ffe1cf",on],fog:"#fff0e0",floor:n,floorAlt:Ge,accent:Mt,accent2:Te},120);e.box(0,0,3.5,12,1,13,{color:Ge}),e.checkpoint(0,0,3.5,9),e.box(0,0,25,11,1,30);for(let[t,i]of[[17,1.7],[25.5,-1.9],[34,2.2]])Zt(e.box(0,.8,t,10,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),i,t*.7),e.cyl(0,2.3,t,.5,2.3,{look:"bumper",color:Te});Zt(e.box(0,2.05,25.5,.5,.6,10,{look:"bar",color:Te,bumper:9,tumble:!0}),-1.9,25.5*.7),e.box(0,0,43,12,1,6,{color:Ge}),e.checkpoint(0,0,42.5,8),e.cyl(-1.5,0,50.5,1.7,1.4,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.box(1.5,1.2,56.5,3.8,.6,3.8,{look:"tile",color:se}),e.cyl(-1.5,1.2,62.5,1.7,1.4,{look:"drum",color:Mt,surface:{bounce:14.5}}),e.cyl(1.5,1.2,68.3,1.7,1.4,{look:"drum",color:Te,surface:{bounce:14.5}}),e.way(-1.5,0,50.5),e.way(1.5,1.2,56.5),e.way(-1.5,1.2,62.5),e.way(1.5,1.2,68.3),e.box(0,2.5,76,10,1,8,{color:Ge}),e.checkpoint(0,2.5,75,7),vt(e.box(-1.5,2.5,83,3.4,.6,3.4,{look:"tile",color:se}),0,1.7,0,3.6,0),vt(e.box(1.5,3.4,88,3.4,.6,3.4,{look:"tile",color:se}),0,1.8,0,3.6,.33),vt(e.box(-1,4.4,93,3.4,.6,3.4,{look:"tile",color:se}),0,1.8,0,3.6,.66),e.way(-1.5,3.3,83),e.way(1.5,4.3,88),e.way(-1,5.3,93),e.box(0,6,100,9,1,7.4,{color:Ge}),e.checkpoint(0,6,99,7),e.ramp(0,103.7,131.7,6,0,9,{look:"ice",color:"#cfe8ff",surface:{ice:!0}});for(let[t,i]of[[-2.5,110],[1.5,112.5],[-.5,117],[3,119.5],[-3,123],[.8,126.5]]){let r=6-6*(i-103.7)/28;e.cyl(t,r+1.2,i,.55,2.4,{look:"bumper",color:Ve,bumper:7.5})}e.box(0,0,141,10,1,18.6),Zt(e.box(0,.8,141,9.4,.72,.5,{look:"bar",color:Mt,bumper:9,tumble:!0}),2.1,0),Zt(e.box(0,2.05,141,.5,.6,9.4,{look:"bar",color:Te,bumper:9,tumble:!0}),2.1,0),e.cyl(0,2.3,141,.5,2.3,{look:"bumper",color:Te}),e.way(0,0,133),e.box(0,0,155,12,1,10,{look:"finish",color:se}),e.finish(0,0,156,12,8);for(let t=6;t<160;t+=17)e.deco("lantern",t%2?-9.5:9.5,5+t%3,t,1.3,t%3?Mt:Te),e.deco("cloud",t%2?14:-14,8+t%4,t+6,2.4,se);return e.deco("torii",0,0,9.5,2.3,Mt),e.build()}var To=(n,e)=>t=>Math.max(0,Math.min(1,Math.sin(Math.PI*2*(t/n+e))*2.2));function o_(){let n=new Pt("windy-pinwheels",{en:"Windy Pinwheels",ja:"\u304B\u3056\u3050\u308B\u307E\u901A\u308A"},{en:"Lean into the wind!",ja:"\u98A8\u306B\u307E\u3051\u308B\u306A\uFF01"},{sky:["#cfe4ff",on],fog:"#eef5ff",floor:se,floorAlt:Tt,accent:ws,accent2:oi},120);n.box(0,0,3.5,12,1,13,{color:Tt}),n.checkpoint(0,0,3.5,9);for(let t of[-4,0,4])n.box(t,0,25,1.9,1,30,{color:t===0?se:_i});n.wind(-9,9,11,19.5,-2,6,5.5,0,To(3.2,0)),n.wind(-9,9,20.5,29,-2,6,-5.5,0,To(3.2,.5)),n.wind(-9,9,30,39,-2,6,6,0,To(2.8,.25)),n.box(0,0,43,12,1,6,{color:Tt}),n.checkpoint(0,0,42.5,8),[[0,50,1.2],[1.5,57.2,-1.4],[-1.5,64.4,1.2],[0,71.6,-1.4]].forEach(([t,i,r],s)=>{Zt(n.cyl(t,0,i,3.3,.7,{look:"disc",color:s%2?Tt:_i}),r,0),al(n.box(t,.95,i,2.6,.95,.4,{look:"wall",color:s%2?oi:ws}),1.95,r,s*1.3,!0),n.cyl(t,1.5,i,.65,1.5,{look:"bumper",color:Te,bumper:6}),n.way(t+(s%2?1.6:-1.6),0,i)}),n.box(0,0,78.7,12,1,6.6,{color:Tt}),n.checkpoint(0,0,78.5,8),n.box(0,0,98,4.6,1,32),[87,92.5,98,103.5,109].forEach((t,i)=>{n.lantern(0,7.2,t,6.2,.78,2.7+i%3*.35,i*.37,i%2?Ve:Te)}),n.wind(-3,3,83,113,-1,5,0,2.5),n.box(0,0,117,12,1,6,{color:Tt}),n.checkpoint(0,0,116.5,8),n.box(-2.5,0,124,2.3,1,8,{color:_i}),n.box(0,0,129,7.3,1,2.3),n.box(2.5,0,134,2.3,1,8,{color:_i}),n.box(0,0,139,7.3,1,2.3),n.box(-2.5,0,144,2.3,1,8,{color:_i}),n.box(0,0,149,7.3,1,2.3),n.wind(-9,9,120.5,127.5,-2,6,-5,0,To(2.6,0)),n.wind(-9,9,130.5,137.5,-2,6,5,0,To(2.6,.4)),n.wind(-9,9,140.5,147.5,-2,6,-5,0,To(2.6,.8)),n.way(-2.5,0,121),n.way(-2.5,0,129),n.way(2.5,0,129),n.way(2.5,0,139),n.way(-2.5,0,139),n.way(-2.5,0,149),n.way(0,0,150),n.box(0,0,155,12,1,10,{look:"finish",color:se}),n.finish(0,0,156,12,8);for(let t=5;t<160;t+=16)n.deco("pinwheel",t%2?-10:10,2+t%4,t,1.6,t%3?Ve:Te),n.deco("cloud",t%2?13:-13,7+t%5,t+7,2.6,se);return n.build()}var a_=[Kx,s_,o_,Qx,n_,r_,e_,Jx,i_,t_],yp=a_.length,jw=[];function pu(n){let e=(n%yp+yp)%yp;return jw[e]??=a_[e]()}var $w=0,l_=1,Zw=2;var p1=1,A0=2,hr=3,es=0,Kt=1,jn=2,Jr=0,jo=1,c_=2,u_=3,h_=4,Kw=5,Is=100,Jw=101,Qw=102,eb=103,tb=104,nb=200,ib=201,rb=202,sb=203,em=204,tm=205,ob=206,ab=207,lb=208,cb=209,ub=210,hb=211,fb=212,db=213,pb=214,nm=0,im=1,rm=2,Jo=3,sm=4,om=5,am=6,lm=7,m1=0,mb=1,gb=2,Qr=0,yb=1,vb=2,xb=3,_b=4,Mb=5,Sb=6,wb=7;var g1=300,Qo=301,ea=302,cm=303,um=304,wh=306,Ds=1e3,ks=1001,hm=1002,un=1003,bb=1004;var mu=1005;var Ei=1006,vp=1007;var Ns=1008;var mr=1009,y1=1010,v1=1011,El=1012,R0=1013,Us=1014,Oi=1015,zl=1016,C0=1017,P0=1018,ta=1020,x1=35902,_1=1021,M1=1022,Ti=1023,S1=1024,w1=1025,$o=1026,na=1027,I0=1028,L0=1029,b1=1030,k0=1031;var N0=1033,Wu=33776,Xu=33777,Yu=33778,qu=33779,fm=35840,dm=35841,pm=35842,mm=35843,gm=36196,ym=37492,vm=37496,xm=37808,_m=37809,Mm=37810,Sm=37811,wm=37812,bm=37813,Em=37814,Tm=37815,Am=37816,Rm=37817,Cm=37818,Pm=37819,Im=37820,Lm=37821,ju=36492,km=36494,Nm=36495,E1=36283,Dm=36284,Um=36285,zm=36286;var Zu=2300,Om=2301,xp=2302,f_=2400,d_=2401,p_=2402;var Eb=3200,Tb=3201;var T1=0,Ab=1,Zr="",qn="srgb",rs="srgb-linear",D0="display-p3",bh="display-p3-linear",Ku="linear",xt="srgb",Ju="rec709",Qu="p3";var Ao=7680;var m_=519,Rb=512,Cb=513,Pb=514,A1=515,Ib=516,Lb=517,kb=518,Nb=519,Fm=35044;var g_="300 es",dr=2e3,eh=2001,ts=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},an=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var _p=Math.PI/180,Bm=180/Math.PI;function pr(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(an[n&255]+an[n>>8&255]+an[n>>16&255]+an[n>>24&255]+"-"+an[e&255]+an[e>>8&255]+"-"+an[e>>16&15|64]+an[e>>24&255]+"-"+an[t&63|128]+an[t>>8&255]+"-"+an[t>>16&255]+an[t>>24&255]+an[i&255]+an[i>>8&255]+an[i>>16&255]+an[i>>24&255]).toLowerCase()}function cn(n,e,t){return Math.max(e,Math.min(t,n))}function Db(n,e){return(n%e+e)%e}function Mp(n,e,t){return(1-t)*n+t*e}function zi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function lt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var he=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(cn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Fe=class n{constructor(e,t,i,r,s,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],p=i[5],m=i[8],x=r[0],g=r[3],d=r[6],v=r[1],y=r[4],M=r[7],R=r[2],T=r[5],b=r[8];return s[0]=o*x+a*v+l*R,s[3]=o*g+a*y+l*T,s[6]=o*d+a*M+l*b,s[1]=c*x+u*v+h*R,s[4]=c*g+u*y+h*T,s[7]=c*d+u*M+h*b,s[2]=f*x+p*v+m*R,s[5]=f*g+p*y+m*T,s[8]=f*d+p*M+m*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*s,p=c*s-o*l,m=t*h+i*f+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=f*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=p*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Sp.makeScale(e,t)),this}rotate(e){return this.premultiply(Sp.makeRotation(-e)),this}translate(e,t){return this.premultiply(Sp.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Sp=new Fe;function R1(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function th(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Ub(){let n=th("canvas");return n.style.display="block",n}var y_={};function $u(n){n in y_||(y_[n]=!0,console.warn(n))}function zb(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function Ob(n){let e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Fb(n){let e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var v_=new Fe().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),x_=new Fe().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ul={[rs]:{transfer:Ku,primaries:Ju,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n,fromReference:n=>n},[qn]:{transfer:xt,primaries:Ju,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[bh]:{transfer:Ku,primaries:Qu,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.applyMatrix3(x_),fromReference:n=>n.applyMatrix3(v_)},[D0]:{transfer:xt,primaries:Qu,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.convertSRGBToLinear().applyMatrix3(x_),fromReference:n=>n.applyMatrix3(v_).convertLinearToSRGB()}},Bb=new Set([rs,bh]),it={enabled:!0,_workingColorSpace:rs,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!Bb.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=ul[e].toReference,r=ul[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return ul[n].primaries},getTransfer:function(n){return n===Zr?Ku:ul[n].transfer},getLuminanceCoefficients:function(n,e=this._workingColorSpace){return n.fromArray(ul[e].luminanceCoefficients)}};function Zo(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function wp(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Ro,Hm=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ro===void 0&&(Ro=th("canvas")),Ro.width=e.width,Ro.height=e.height;let i=Ro.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Ro}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=th("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Zo(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Zo(t[i]/255)*255):t[i]=Zo(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Hb=0,nh=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Hb++}),this.uuid=pr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(bp(r[o].image)):s.push(bp(r[o]))}else s=bp(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function bp(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Hm.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Vb=0,kn=class n extends ts{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=ks,r=ks,s=Ei,o=Ns,a=Ti,l=mr,c=n.DEFAULT_ANISOTROPY,u=Zr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vb++}),this.uuid=pr(),this.name="",this.source=new nh(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==g1)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ds:e.x=e.x-Math.floor(e.x);break;case ks:e.x=e.x<0?0:1;break;case hm:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ds:e.y=e.y-Math.floor(e.y);break;case ks:e.y=e.y<0?0:1;break;case hm:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};kn.DEFAULT_IMAGE=null;kn.DEFAULT_MAPPING=g1;kn.DEFAULT_ANISOTROPY=1;var It=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],p=l[5],m=l[9],x=l[2],g=l[6],d=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let y=(c+1)/2,M=(p+1)/2,R=(d+1)/2,T=(u+f)/4,b=(h+x)/4,A=(m+g)/4;return y>M&&y>R?y<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(y),r=T/i,s=b/i):M>R?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=T/r,s=A/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=b/s,r=A/s),this.set(i,r,s,t),this}let v=Math.sqrt((g-m)*(g-m)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(v)<.001&&(v=1),this.x=(g-m)/v,this.y=(h-x)/v,this.z=(f-u)/v,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Vm=class extends ts{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);let r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ei,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let s=new kn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new nh(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},gr=class extends Vm{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},ih=class extends kn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Gm=class extends kn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Fi=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],f=s[o+0],p=s[o+1],m=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=m,e[t+3]=x;return}if(h!==x||l!==f||c!==p||u!==m){let g=1-a,d=l*f+c*p+u*m+h*x,v=d>=0?1:-1,y=1-d*d;if(y>Number.EPSILON){let R=Math.sqrt(y),T=Math.atan2(R,d*v);g=Math.sin(g*T)/R,a=Math.sin(a*T)/R}let M=a*v;if(l=l*g+f*M,c=c*g+p*M,u=u*g+m*M,h=h*g+x*M,g===1-a){let R=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=R,c*=R,u*=R,h*=R}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],f=s[o+1],p=s[o+2],m=s[o+3];return e[t]=a*m+u*h+l*p-c*f,e[t+1]=l*m+u*f+c*h-a*p,e[t+2]=c*m+u*p+a*f-l*h,e[t+3]=u*m-a*h-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),f=l(i/2),p=l(r/2),m=l(s/2);switch(o){case"XYZ":this._x=f*u*h+c*p*m,this._y=c*p*h-f*u*m,this._z=c*u*m+f*p*h,this._w=c*u*h-f*p*m;break;case"YXZ":this._x=f*u*h+c*p*m,this._y=c*p*h-f*u*m,this._z=c*u*m-f*p*h,this._w=c*u*h+f*p*m;break;case"ZXY":this._x=f*u*h-c*p*m,this._y=c*p*h+f*u*m,this._z=c*u*m+f*p*h,this._w=c*u*h-f*p*m;break;case"ZYX":this._x=f*u*h-c*p*m,this._y=c*p*h+f*u*m,this._z=c*u*m-f*p*h,this._w=c*u*h+f*p*m;break;case"YZX":this._x=f*u*h+c*p*m,this._y=c*p*h+f*u*m,this._z=c*u*m-f*p*h,this._w=c*u*h-f*p*m;break;case"XZY":this._x=f*u*h-c*p*m,this._y=c*p*h-f*u*m,this._z=c*u*m+f*p*h,this._w=c*u*h+f*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=i+a+h;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>h){let p=2*Math.sqrt(1+i-a-h);this._w=(u-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>h){let p=2*Math.sqrt(1+a-i-h);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+h-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(cn(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*i+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(__.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(__.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ep.copy(this).projectOnVector(e),this.sub(Ep)}reflect(e){return this.sub(Ep.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(cn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ep=new P,__=new Fi,yr=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Si.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Si.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Si.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Si):Si.fromBufferAttribute(s,o),Si.applyMatrix4(e.matrixWorld),this.expandByPoint(Si);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),gu.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),gu.copy(i.boundingBox)),gu.applyMatrix4(e.matrixWorld),this.union(gu)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Si),Si.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hl),yu.subVectors(this.max,hl),Co.subVectors(e.a,hl),Po.subVectors(e.b,hl),Io.subVectors(e.c,hl),Wr.subVectors(Po,Co),Xr.subVectors(Io,Po),bs.subVectors(Co,Io);let t=[0,-Wr.z,Wr.y,0,-Xr.z,Xr.y,0,-bs.z,bs.y,Wr.z,0,-Wr.x,Xr.z,0,-Xr.x,bs.z,0,-bs.x,-Wr.y,Wr.x,0,-Xr.y,Xr.x,0,-bs.y,bs.x,0];return!Tp(t,Co,Po,Io,yu)||(t=[1,0,0,0,1,0,0,0,1],!Tp(t,Co,Po,Io,yu))?!1:(vu.crossVectors(Wr,Xr),t=[vu.x,vu.y,vu.z],Tp(t,Co,Po,Io,yu))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Si).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Si).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(or[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),or[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),or[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),or[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),or[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),or[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),or[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),or[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(or),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},or=[new P,new P,new P,new P,new P,new P,new P,new P],Si=new P,gu=new yr,Co=new P,Po=new P,Io=new P,Wr=new P,Xr=new P,bs=new P,hl=new P,yu=new P,vu=new P,Es=new P;function Tp(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Es.fromArray(n,s);let a=r.x*Math.abs(Es.x)+r.y*Math.abs(Es.y)+r.z*Math.abs(Es.z),l=e.dot(Es),c=t.dot(Es),u=i.dot(Es);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Gb=new yr,fl=new P,Ap=new P,zs=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Gb.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fl.subVectors(e,this.center);let t=fl.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(fl,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ap.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fl.copy(e.center).add(Ap)),this.expandByPoint(fl.copy(e.center).sub(Ap))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ar=new P,Rp=new P,xu=new P,Yr=new P,Cp=new P,_u=new P,Pp=new P,Wm=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ar)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ar.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ar.copy(this.origin).addScaledVector(this.direction,t),ar.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Rp.copy(e).add(t).multiplyScalar(.5),xu.copy(t).sub(e).normalize(),Yr.copy(this.origin).sub(Rp);let s=e.distanceTo(t)*.5,o=-this.direction.dot(xu),a=Yr.dot(this.direction),l=-Yr.dot(xu),c=Yr.lengthSq(),u=Math.abs(1-o*o),h,f,p,m;if(u>0)if(h=o*l-a,f=o*a-l,m=s*u,h>=0)if(f>=-m)if(f<=m){let x=1/u;h*=x,f*=x,p=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=s,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+c;else f<=-m?(h=Math.max(0,-(-o*s+a)),f=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+f*(f+2*l)+c):f<=m?(h=0,f=Math.min(Math.max(-s,-l),s),p=f*(f+2*l)+c):(h=Math.max(0,-(o*s+a)),f=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+f*(f+2*l)+c);else f=o>0?-s:s,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Rp).addScaledVector(xu,f),p}intersectSphere(e,t){ar.subVectors(e.center,this.origin);let i=ar.dot(this.direction),r=ar.dot(ar)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,ar)!==null}intersectTriangle(e,t,i,r,s){Cp.subVectors(t,e),_u.subVectors(i,e),Pp.crossVectors(Cp,_u);let o=this.direction.dot(Pp),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Yr.subVectors(this.origin,e);let l=a*this.direction.dot(_u.crossVectors(Yr,_u));if(l<0)return null;let c=a*this.direction.dot(Cp.cross(Yr));if(c<0||l+c>o)return null;let u=-a*Yr.dot(Pp);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class n{constructor(e,t,i,r,s,o,a,l,c,u,h,f,p,m,x,g){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,h,f,p,m,x,g)}set(e,t,i,r,s,o,a,l,c,u,h,f,p,m,x,g){let d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=r,d[1]=s,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=u,d[10]=h,d[14]=f,d[3]=p,d[7]=m,d[11]=x,d[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/Lo.setFromMatrixColumn(e,0).length(),s=1/Lo.setFromMatrixColumn(e,1).length(),o=1/Lo.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let f=o*u,p=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=p+m*c,t[5]=f-x*c,t[9]=-a*l,t[2]=x-f*c,t[6]=m+p*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*u,p=l*h,m=c*u,x=c*h;t[0]=f+x*a,t[4]=m*a-p,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-m,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*u,p=l*h,m=c*u,x=c*h;t[0]=f-x*a,t[4]=-o*h,t[8]=m+p*a,t[1]=p+m*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*u,p=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=m*c-p,t[8]=f*c+x,t[1]=l*h,t[5]=x*c+f,t[9]=p*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,p=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=x-f*h,t[8]=m*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=p*h+m,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*l,p=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+x,t[5]=o*u,t[9]=p*h-m,t[2]=m*h-p,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Wb,e,Xb)}lookAt(e,t,i){let r=this.elements;return Xn.subVectors(e,t),Xn.lengthSq()===0&&(Xn.z=1),Xn.normalize(),qr.crossVectors(i,Xn),qr.lengthSq()===0&&(Math.abs(i.z)===1?Xn.x+=1e-4:Xn.z+=1e-4,Xn.normalize(),qr.crossVectors(i,Xn)),qr.normalize(),Mu.crossVectors(Xn,qr),r[0]=qr.x,r[4]=Mu.x,r[8]=Xn.x,r[1]=qr.y,r[5]=Mu.y,r[9]=Xn.y,r[2]=qr.z,r[6]=Mu.z,r[10]=Xn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],p=i[13],m=i[2],x=i[6],g=i[10],d=i[14],v=i[3],y=i[7],M=i[11],R=i[15],T=r[0],b=r[4],A=r[8],L=r[12],_=r[1],S=r[5],U=r[9],z=r[13],H=r[2],Y=r[6],O=r[10],G=r[14],F=r[3],ee=r[7],ne=r[11],re=r[15];return s[0]=o*T+a*_+l*H+c*F,s[4]=o*b+a*S+l*Y+c*ee,s[8]=o*A+a*U+l*O+c*ne,s[12]=o*L+a*z+l*G+c*re,s[1]=u*T+h*_+f*H+p*F,s[5]=u*b+h*S+f*Y+p*ee,s[9]=u*A+h*U+f*O+p*ne,s[13]=u*L+h*z+f*G+p*re,s[2]=m*T+x*_+g*H+d*F,s[6]=m*b+x*S+g*Y+d*ee,s[10]=m*A+x*U+g*O+d*ne,s[14]=m*L+x*z+g*G+d*re,s[3]=v*T+y*_+M*H+R*F,s[7]=v*b+y*S+M*Y+R*ee,s[11]=v*A+y*U+M*O+R*ne,s[15]=v*L+y*z+M*G+R*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],p=e[14],m=e[3],x=e[7],g=e[11],d=e[15];return m*(+s*l*h-r*c*h-s*a*f+i*c*f+r*a*p-i*l*p)+x*(+t*l*p-t*c*f+s*o*f-r*o*p+r*c*u-s*l*u)+g*(+t*c*h-t*a*p-s*o*h+i*o*p+s*a*u-i*c*u)+d*(-r*a*u-t*l*h+t*a*f+r*o*h-i*o*f+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],p=e[11],m=e[12],x=e[13],g=e[14],d=e[15],v=h*g*c-x*f*c+x*l*p-a*g*p-h*l*d+a*f*d,y=m*f*c-u*g*c-m*l*p+o*g*p+u*l*d-o*f*d,M=u*x*c-m*h*c+m*a*p-o*x*p-u*a*d+o*h*d,R=m*h*l-u*x*l-m*a*f+o*x*f+u*a*g-o*h*g,T=t*v+i*y+r*M+s*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let b=1/T;return e[0]=v*b,e[1]=(x*f*s-h*g*s-x*r*p+i*g*p+h*r*d-i*f*d)*b,e[2]=(a*g*s-x*l*s+x*r*c-i*g*c-a*r*d+i*l*d)*b,e[3]=(h*l*s-a*f*s-h*r*c+i*f*c+a*r*p-i*l*p)*b,e[4]=y*b,e[5]=(u*g*s-m*f*s+m*r*p-t*g*p-u*r*d+t*f*d)*b,e[6]=(m*l*s-o*g*s-m*r*c+t*g*c+o*r*d-t*l*d)*b,e[7]=(o*f*s-u*l*s+u*r*c-t*f*c-o*r*p+t*l*p)*b,e[8]=M*b,e[9]=(m*h*s-u*x*s-m*i*p+t*x*p+u*i*d-t*h*d)*b,e[10]=(o*x*s-m*a*s+m*i*c-t*x*c-o*i*d+t*a*d)*b,e[11]=(u*a*s-o*h*s-u*i*c+t*h*c+o*i*p-t*a*p)*b,e[12]=R*b,e[13]=(u*x*r-m*h*r+m*i*f-t*x*f-u*i*g+t*h*g)*b,e[14]=(m*a*r-o*x*r-m*i*l+t*x*l+o*i*g-t*a*g)*b,e[15]=(o*h*r-u*a*r+u*i*l-t*h*l-o*i*f+t*a*f)*b,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,f=s*c,p=s*u,m=s*h,x=o*u,g=o*h,d=a*h,v=l*c,y=l*u,M=l*h,R=i.x,T=i.y,b=i.z;return r[0]=(1-(x+d))*R,r[1]=(p+M)*R,r[2]=(m-y)*R,r[3]=0,r[4]=(p-M)*T,r[5]=(1-(f+d))*T,r[6]=(g+v)*T,r[7]=0,r[8]=(m+y)*b,r[9]=(g-v)*b,r[10]=(1-(f+x))*b,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=Lo.set(r[0],r[1],r[2]).length(),o=Lo.set(r[4],r[5],r[6]).length(),a=Lo.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],wi.copy(this);let c=1/s,u=1/o,h=1/a;return wi.elements[0]*=c,wi.elements[1]*=c,wi.elements[2]*=c,wi.elements[4]*=u,wi.elements[5]*=u,wi.elements[6]*=u,wi.elements[8]*=h,wi.elements[9]*=h,wi.elements[10]*=h,t.setFromRotationMatrix(wi),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=dr){let l=this.elements,c=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),f=(i+r)/(i-r),p,m;if(a===dr)p=-(o+s)/(o-s),m=-2*o*s/(o-s);else if(a===eh)p=-o/(o-s),m=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=dr){let l=this.elements,c=1/(t-e),u=1/(i-r),h=1/(o-s),f=(t+e)*c,p=(i+r)*u,m,x;if(a===dr)m=(o+s)*h,x=-2*h;else if(a===eh)m=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=x,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Lo=new P,wi=new ot,Wb=new P(0,0,0),Xb=new P(1,1,1),qr=new P,Mu=new P,Xn=new P,M_=new ot,S_=new Fi,Bi=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(cn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-cn(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(cn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-cn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(cn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-cn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return M_.makeRotationFromQuaternion(e),this.setFromRotationMatrix(M_,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return S_.setFromEuler(this),this.setFromQuaternion(S_,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Bi.DEFAULT_ORDER="XYZ";var rh=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Yb=0,w_=new P,ko=new Fi,lr=new ot,Su=new P,dl=new P,qb=new P,jb=new Fi,b_=new P(1,0,0),E_=new P(0,1,0),T_=new P(0,0,1),A_={type:"added"},$b={type:"removed"},No={type:"childadded",child:null},Ip={type:"childremoved",child:null},wn=class n extends ts{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yb++}),this.uuid=pr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new Bi,i=new Fi,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ot},normalMatrix:{value:new Fe}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ko.setFromAxisAngle(e,t),this.quaternion.multiply(ko),this}rotateOnWorldAxis(e,t){return ko.setFromAxisAngle(e,t),this.quaternion.premultiply(ko),this}rotateX(e){return this.rotateOnAxis(b_,e)}rotateY(e){return this.rotateOnAxis(E_,e)}rotateZ(e){return this.rotateOnAxis(T_,e)}translateOnAxis(e,t){return w_.copy(e).applyQuaternion(this.quaternion),this.position.add(w_.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(b_,e)}translateY(e){return this.translateOnAxis(E_,e)}translateZ(e){return this.translateOnAxis(T_,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(lr.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Su.copy(e):Su.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),dl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?lr.lookAt(dl,Su,this.up):lr.lookAt(Su,dl,this.up),this.quaternion.setFromRotationMatrix(lr),r&&(lr.extractRotation(r.matrixWorld),ko.setFromRotationMatrix(lr),this.quaternion.premultiply(ko.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(A_),No.child=e,this.dispatchEvent(No),No.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent($b),Ip.child=e,this.dispatchEvent(Ip),Ip.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),lr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),lr.multiply(e.parent.matrixWorld)),e.applyMatrix4(lr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(A_),No.child=e,this.dispatchEvent(No),No.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dl,e,qb),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dl,jb,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),p=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};wn.DEFAULT_UP=new P(0,1,0);wn.DEFAULT_MATRIX_AUTO_UPDATE=!0;wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var bi=new P,cr=new P,Lp=new P,ur=new P,Do=new P,Uo=new P,R_=new P,kp=new P,Np=new P,Dp=new P,Up=new It,zp=new It,Op=new It,Kr=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),bi.subVectors(e,t),r.cross(bi);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){bi.subVectors(r,t),cr.subVectors(i,t),Lp.subVectors(e,t);let o=bi.dot(bi),a=bi.dot(cr),l=bi.dot(Lp),c=cr.dot(cr),u=cr.dot(Lp),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let f=1/h,p=(c*l-a*u)*f,m=(o*u-a*l)*f;return s.set(1-p-m,m,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,ur)===null?!1:ur.x>=0&&ur.y>=0&&ur.x+ur.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,ur)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ur.x),l.addScaledVector(o,ur.y),l.addScaledVector(a,ur.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return Up.setScalar(0),zp.setScalar(0),Op.setScalar(0),Up.fromBufferAttribute(e,t),zp.fromBufferAttribute(e,i),Op.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Up,s.x),o.addScaledVector(zp,s.y),o.addScaledVector(Op,s.z),o}static isFrontFacing(e,t,i,r){return bi.subVectors(i,t),cr.subVectors(e,t),bi.cross(cr).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return bi.subVectors(this.c,this.b),cr.subVectors(this.a,this.b),bi.cross(cr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;Do.subVectors(r,i),Uo.subVectors(s,i),kp.subVectors(e,i);let l=Do.dot(kp),c=Uo.dot(kp);if(l<=0&&c<=0)return t.copy(i);Np.subVectors(e,r);let u=Do.dot(Np),h=Uo.dot(Np);if(u>=0&&h<=u)return t.copy(r);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(Do,o);Dp.subVectors(e,s);let p=Do.dot(Dp),m=Uo.dot(Dp);if(m>=0&&p<=m)return t.copy(s);let x=p*c-l*m;if(x<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(Uo,a);let g=u*m-p*h;if(g<=0&&h-u>=0&&p-m>=0)return R_.subVectors(s,r),a=(h-u)/(h-u+(p-m)),t.copy(r).addScaledVector(R_,a);let d=1/(g+x+f);return o=x*d,a=f*d,t.copy(i).addScaledVector(Do,o).addScaledVector(Uo,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},C1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},jr={h:0,s:0,l:0},wu={h:0,s:0,l:0};function Fp(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ie=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,it.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=it.workingColorSpace){return this.r=e,this.g=t,this.b=i,it.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=it.workingColorSpace){if(e=Db(e,1),t=cn(t,0,1),i=cn(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Fp(o,s,e+1/3),this.g=Fp(o,s,e),this.b=Fp(o,s,e-1/3)}return it.toWorkingColorSpace(this,r),this}setStyle(e,t=qn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qn){let i=C1[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Zo(e.r),this.g=Zo(e.g),this.b=Zo(e.b),this}copyLinearToSRGB(e){return this.r=wp(e.r),this.g=wp(e.g),this.b=wp(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qn){return it.fromWorkingColorSpace(ln.copy(this),e),Math.round(cn(ln.r*255,0,255))*65536+Math.round(cn(ln.g*255,0,255))*256+Math.round(cn(ln.b*255,0,255))}getHexString(e=qn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=it.workingColorSpace){it.fromWorkingColorSpace(ln.copy(this),t);let i=ln.r,r=ln.g,s=ln.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=it.workingColorSpace){return it.fromWorkingColorSpace(ln.copy(this),t),e.r=ln.r,e.g=ln.g,e.b=ln.b,e}getStyle(e=qn){it.fromWorkingColorSpace(ln.copy(this),e);let t=ln.r,i=ln.g,r=ln.b;return e!==qn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(jr),this.setHSL(jr.h+e,jr.s+t,jr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(jr),e.getHSL(wu);let i=Mp(jr.h,wu.h,t),r=Mp(jr.s,wu.s,t),s=Mp(jr.l,wu.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ln=new Ie;Ie.NAMES=C1;var Zb=0,ns=class extends ts{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Zb++}),this.uuid=pr(),this.name="",this.type="Material",this.blending=jo,this.side=es,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=em,this.blendDst=tm,this.blendEquation=Is,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=Jo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=m_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ao,this.stencilZFail=Ao,this.stencilZPass=Ao,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==jo&&(i.blending=this.blending),this.side!==es&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==em&&(i.blendSrc=this.blendSrc),this.blendDst!==tm&&(i.blendDst=this.blendDst),this.blendEquation!==Is&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Jo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==m_&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ao&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ao&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ao&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},bn=class extends ns{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.combine=m1,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var zt=new P,bu=new he,Nt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Fm,this.updateRanges=[],this.gpuType=Oi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)bu.fromBufferAttribute(this,t),bu.applyMatrix3(e),this.setXY(t,bu.x,bu.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix3(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix4(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)zt.fromBufferAttribute(this,t),zt.applyNormalMatrix(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)zt.fromBufferAttribute(this,t),zt.transformDirection(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=zi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=zi(t,this.array)),t}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=zi(t,this.array)),t}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=zi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=zi(t,this.array)),t}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fm&&(e.usage=this.usage),e}};var sh=class extends Nt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var oh=class extends Nt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var ct=class extends Nt{constructor(e,t,i){super(new Float32Array(e),t,i)}},Kb=0,ai=new ot,Bp=new wn,zo=new P,Yn=new yr,pl=new yr,Xt=new P,Jt=class n extends ts{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kb++}),this.uuid=pr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(R1(e)?oh:sh)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Fe().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return Bp.lookAt(e),Bp.updateMatrix(),this.applyMatrix4(Bp.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zo).negate(),this.translate(zo.x,zo.y,zo.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new ct(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new yr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];Yn.setFromBufferAttribute(s),this.morphTargetsRelative?(Xt.addVectors(this.boundingBox.min,Yn.min),this.boundingBox.expandByPoint(Xt),Xt.addVectors(this.boundingBox.max,Yn.max),this.boundingBox.expandByPoint(Xt)):(this.boundingBox.expandByPoint(Yn.min),this.boundingBox.expandByPoint(Yn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zs);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(Yn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];pl.setFromBufferAttribute(a),this.morphTargetsRelative?(Xt.addVectors(Yn.min,pl.min),Yn.expandByPoint(Xt),Xt.addVectors(Yn.max,pl.max),Yn.expandByPoint(Xt)):(Yn.expandByPoint(pl.min),Yn.expandByPoint(pl.max))}Yn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Xt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Xt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Xt.fromBufferAttribute(a,c),l&&(zo.fromBufferAttribute(e,c),Xt.add(zo)),r=Math.max(r,i.distanceToSquared(Xt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Nt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<i.count;A++)a[A]=new P,l[A]=new P;let c=new P,u=new P,h=new P,f=new he,p=new he,m=new he,x=new P,g=new P;function d(A,L,_){c.fromBufferAttribute(i,A),u.fromBufferAttribute(i,L),h.fromBufferAttribute(i,_),f.fromBufferAttribute(s,A),p.fromBufferAttribute(s,L),m.fromBufferAttribute(s,_),u.sub(c),h.sub(c),p.sub(f),m.sub(f);let S=1/(p.x*m.y-m.x*p.y);isFinite(S)&&(x.copy(u).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(S),g.copy(h).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(S),a[A].add(x),a[L].add(x),a[_].add(x),l[A].add(g),l[L].add(g),l[_].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let A=0,L=v.length;A<L;++A){let _=v[A],S=_.start,U=_.count;for(let z=S,H=S+U;z<H;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let y=new P,M=new P,R=new P,T=new P;function b(A){R.fromBufferAttribute(r,A),T.copy(R);let L=a[A];y.copy(L),y.sub(R.multiplyScalar(R.dot(L))).normalize(),M.crossVectors(T,L);let S=M.dot(l[A])<0?-1:1;o.setXYZW(A,y.x,y.y,y.z,S)}for(let A=0,L=v.length;A<L;++A){let _=v[A],S=_.start,U=_.count;for(let z=S,H=S+U;z<H;z+=3)b(e.getX(z+0)),b(e.getX(z+1)),b(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Nt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let f=0,p=e.count;f<p;f+=3){let m=e.getX(f+0),x=e.getX(f+1),g=e.getX(f+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,g),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,g),a.add(u),l.add(u),c.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Xt.fromBufferAttribute(e,t),Xt.normalize(),e.setXYZ(t,Xt.x,Xt.y,Xt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),p=0,m=0;for(let x=0,g=l.length;x<g;x++){a.isInterleavedBufferAttribute?p=l[x]*a.data.stride+a.offset:p=l[x]*u;for(let d=0;d<u;d++)f[m++]=c[p++]}return new Nt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],p=e(f,i);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let p=c[h];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let f=0,p=h.length;f<p;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},C_=new ot,Ts=new Wm,Eu=new zs,P_=new P,Tu=new P,Au=new P,Ru=new P,Hp=new P,Cu=new P,I_=new P,Pu=new P,Ae=class extends wn{constructor(e=new Jt,t=new bn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Cu.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Hp.fromBufferAttribute(h,e),o?Cu.addScaledVector(Hp,u):Cu.addScaledVector(Hp.sub(t),u))}t.add(Cu)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Eu.copy(i.boundingSphere),Eu.applyMatrix4(s),Ts.copy(e.ray).recast(e.near),!(Eu.containsPoint(Ts.origin)===!1&&(Ts.intersectSphere(Eu,P_)===null||Ts.origin.distanceToSquared(P_)>(e.far-e.near)**2))&&(C_.copy(s).invert(),Ts.copy(e.ray).applyMatrix4(C_),!(i.boundingBox!==null&&Ts.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ts)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,x=f.length;m<x;m++){let g=f[m],d=o[g.materialIndex],v=Math.max(g.start,p.start),y=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let M=v,R=y;M<R;M+=3){let T=a.getX(M),b=a.getX(M+1),A=a.getX(M+2);r=Iu(this,d,e,i,c,u,h,T,b,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let g=m,d=x;g<d;g+=3){let v=a.getX(g),y=a.getX(g+1),M=a.getX(g+2);r=Iu(this,o,e,i,c,u,h,v,y,M),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,x=f.length;m<x;m++){let g=f[m],d=o[g.materialIndex],v=Math.max(g.start,p.start),y=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let M=v,R=y;M<R;M+=3){let T=M,b=M+1,A=M+2;r=Iu(this,d,e,i,c,u,h,T,b,A),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{let m=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let g=m,d=x;g<d;g+=3){let v=g,y=g+1,M=g+2;r=Iu(this,o,e,i,c,u,h,v,y,M),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}};function Jb(n,e,t,i,r,s,o,a){let l;if(e.side===Kt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===es,a),l===null)return null;Pu.copy(a),Pu.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Pu);return c<t.near||c>t.far?null:{distance:c,point:Pu.clone(),object:n}}function Iu(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,Tu),n.getVertexPosition(l,Au),n.getVertexPosition(c,Ru);let u=Jb(n,e,t,i,Tu,Au,Ru,I_);if(u){let h=new P;Kr.getBarycoord(I_,Tu,Au,Ru,h),r&&(u.uv=Kr.getInterpolatedAttribute(r,a,l,c,h,new he)),s&&(u.uv1=Kr.getInterpolatedAttribute(s,a,l,c,h,new he)),o&&(u.normal=Kr.getInterpolatedAttribute(o,a,l,c,h,new P),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new P,materialIndex:0};Kr.getNormal(Tu,Au,Ru,f.normal),u.face=f,u.barycoord=h}return u}var Hi=class n extends Jt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,p=0;m("z","y","x",-1,-1,i,t,e,o,s,0),m("z","y","x",1,-1,i,t,-e,o,s,1),m("x","z","y",1,1,e,i,t,r,o,2),m("x","z","y",1,-1,e,i,-t,r,o,3),m("x","y","z",1,-1,e,t,i,r,s,4),m("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new ct(c,3)),this.setAttribute("normal",new ct(u,3)),this.setAttribute("uv",new ct(h,2));function m(x,g,d,v,y,M,R,T,b,A,L){let _=M/b,S=R/A,U=M/2,z=R/2,H=T/2,Y=b+1,O=A+1,G=0,F=0,ee=new P;for(let ne=0;ne<O;ne++){let re=ne*S-z;for(let Ee=0;Ee<Y;Ee++){let He=Ee*_-U;ee[x]=He*v,ee[g]=re*y,ee[d]=H,c.push(ee.x,ee.y,ee.z),ee[x]=0,ee[g]=0,ee[d]=T>0?1:-1,u.push(ee.x,ee.y,ee.z),h.push(Ee/b),h.push(1-ne/A),G+=1}}for(let ne=0;ne<A;ne++)for(let re=0;re<b;re++){let Ee=f+re+Y*ne,He=f+re+Y*(ne+1),q=f+(re+1)+Y*(ne+1),K=f+(re+1)+Y*ne;l.push(Ee,He,K),l.push(He,q,K),F+=6}a.addGroup(p,F,L),p+=F,f+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ia(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Mn(n){let e={};for(let t=0;t<n.length;t++){let i=ia(n[t]);for(let r in i)e[r]=i[r]}return e}function Qb(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function P1(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:it.workingColorSpace}var eE={clone:ia,merge:Mn},tE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,nE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Vi=class extends ns{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=tE,this.fragmentShader=nE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ia(e.uniforms),this.uniformsGroups=Qb(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},ah=class extends wn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=dr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},$r=new P,L_=new he,k_=new he,Sn=class extends ah{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Bm*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(_p*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bm*2*Math.atan(Math.tan(_p*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){$r.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($r.x,$r.y).multiplyScalar(-e/$r.z),$r.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set($r.x,$r.y).multiplyScalar(-e/$r.z)}getViewSize(e,t){return this.getViewBounds(e,L_,k_),t.subVectors(k_,L_)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(_p*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Oo=-90,Fo=1,Xm=class extends wn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Sn(Oo,Fo,e,t);r.layers=this.layers,this.add(r);let s=new Sn(Oo,Fo,e,t);s.layers=this.layers,this.add(s);let o=new Sn(Oo,Fo,e,t);o.layers=this.layers,this.add(o);let a=new Sn(Oo,Fo,e,t);a.layers=this.layers,this.add(a);let l=new Sn(Oo,Fo,e,t);l.layers=this.layers,this.add(l);let c=new Sn(Oo,Fo,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===dr)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===eh)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,f,p),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},lh=class extends kn{constructor(e,t,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Qo,super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ym=class extends gr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new lh(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ei}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Hi(5,5,5),s=new Vi({name:"CubemapFromEquirect",uniforms:ia(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Kt,blending:Jr});s.uniforms.tEquirect.value=t;let o=new Ae(r,s),a=t.minFilter;return t.minFilter===Ns&&(t.minFilter=Ei),new Xm(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},Vp=new P,iE=new P,rE=new Fe,fr=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Vp.subVectors(i,t).cross(iE.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Vp),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||rE.getNormalMatrix(e),r=this.coplanarPoint(Vp).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},As=new zs,Lu=new P,Tl=class{constructor(e=new fr,t=new fr,i=new fr,r=new fr,s=new fr,o=new fr){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=dr){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],f=r[7],p=r[8],m=r[9],x=r[10],g=r[11],d=r[12],v=r[13],y=r[14],M=r[15];if(i[0].setComponents(l-s,f-c,g-p,M-d).normalize(),i[1].setComponents(l+s,f+c,g+p,M+d).normalize(),i[2].setComponents(l+o,f+u,g+m,M+v).normalize(),i[3].setComponents(l-o,f-u,g-m,M-v).normalize(),i[4].setComponents(l-a,f-h,g-x,M-y).normalize(),t===dr)i[5].setComponents(l+a,f+h,g+x,M+y).normalize();else if(t===eh)i[5].setComponents(a,h,x,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),As.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),As.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(As)}intersectsSprite(e){return As.center.set(0,0,0),As.radius=.7071067811865476,As.applyMatrix4(e.matrixWorld),this.intersectsSphere(As)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Lu.x=r.normal.x>0?e.max.x:e.min.x,Lu.y=r.normal.y>0?e.max.y:e.min.y,Lu.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Lu)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function I1(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function sE(n){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(n.bindBuffer(c,a),h.length===0)n.bufferSubData(c,0,u);else{h.sort((p,m)=>p.start-m.start);let f=0;for(let p=1;p<h.length;p++){let m=h[f],x=h[p];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++f,h[f]=x)}h.length=f+1;for(let p=0,m=h.length;p<m;p++){let x=h[p];n.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var vr=class n extends Jt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,f=t/l,p=[],m=[],x=[],g=[];for(let d=0;d<u;d++){let v=d*f-o;for(let y=0;y<c;y++){let M=y*h-s;m.push(M,-v,0),x.push(0,0,1),g.push(y/a),g.push(1-d/l)}}for(let d=0;d<l;d++)for(let v=0;v<a;v++){let y=v+c*d,M=v+c*(d+1),R=v+1+c*(d+1),T=v+1+c*d;p.push(y,M,T),p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new ct(m,3)),this.setAttribute("normal",new ct(x,3)),this.setAttribute("uv",new ct(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},oE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,aE=`#ifdef USE_ALPHAHASH
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
#endif`,lE=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cE=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,uE=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hE=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,fE=`#ifdef USE_AOMAP
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
#endif`,dE=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pE=`#ifdef USE_BATCHING
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
#endif`,mE=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gE=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,yE=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,vE=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,xE=`#ifdef USE_IRIDESCENCE
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
#endif`,_E=`#ifdef USE_BUMPMAP
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
#endif`,ME=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,SE=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wE=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,bE=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,EE=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,TE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,AE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,RE=`#if defined( USE_COLOR_ALPHA )
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
#endif`,CE=`#define PI 3.141592653589793
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
} // validated`,PE=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,IE=`vec3 transformedNormal = objectNormal;
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
#endif`,LE=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,kE=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,NE=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,DE=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,UE="gl_FragColor = linearToOutputTexel( gl_FragColor );",zE=`
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
}`,OE=`#ifdef USE_ENVMAP
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
#endif`,FE=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,BE=`#ifdef USE_ENVMAP
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
#endif`,HE=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,VE=`#ifdef USE_ENVMAP
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
#endif`,GE=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,WE=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,XE=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,YE=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qE=`#ifdef USE_GRADIENTMAP
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
}`,jE=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$E=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ZE=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,KE=`uniform bool receiveShadow;
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
#endif`,JE=`#ifdef USE_ENVMAP
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
#endif`,QE=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,eT=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tT=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,nT=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,iT=`PhysicalMaterial material;
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
#endif`,rT=`struct PhysicalMaterial {
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
}`,sT=`
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
#endif`,oT=`#if defined( RE_IndirectDiffuse )
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
#endif`,aT=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lT=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cT=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,uT=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hT=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,fT=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,dT=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,pT=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,mT=`#if defined( USE_POINTS_UV )
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
#endif`,gT=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yT=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,vT=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,xT=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_T=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,MT=`#ifdef USE_MORPHTARGETS
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
#endif`,ST=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wT=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,bT=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,ET=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,TT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,AT=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,RT=`#ifdef USE_NORMALMAP
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
#endif`,CT=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,PT=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,IT=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,LT=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,kT=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,NT=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,DT=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,UT=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zT=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,OT=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,FT=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,BT=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,HT=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,VT=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,GT=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,WT=`float getShadowMask() {
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
}`,XT=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,YT=`#ifdef USE_SKINNING
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
#endif`,qT=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,jT=`#ifdef USE_SKINNING
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
#endif`,$T=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ZT=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,KT=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,JT=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,QT=`#ifdef USE_TRANSMISSION
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
#endif`,e2=`#ifdef USE_TRANSMISSION
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
#endif`,t2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,n2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,i2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,r2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,s2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,o2=`uniform sampler2D t2D;
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
}`,a2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,l2=`#ifdef ENVMAP_TYPE_CUBE
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
}`,c2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,u2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,h2=`#include <common>
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
}`,f2=`#if DEPTH_PACKING == 3200
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
}`,d2=`#define DISTANCE
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
}`,p2=`#define DISTANCE
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
}`,m2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,g2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y2=`uniform float scale;
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
}`,v2=`uniform vec3 diffuse;
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
}`,x2=`#include <common>
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
}`,_2=`uniform vec3 diffuse;
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
}`,M2=`#define LAMBERT
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
}`,S2=`#define LAMBERT
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
}`,w2=`#define MATCAP
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
}`,b2=`#define MATCAP
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
}`,E2=`#define NORMAL
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
}`,T2=`#define NORMAL
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
}`,A2=`#define PHONG
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
}`,R2=`#define PHONG
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
}`,C2=`#define STANDARD
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
}`,P2=`#define STANDARD
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
}`,I2=`#define TOON
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
}`,L2=`#define TOON
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
}`,k2=`uniform float size;
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
}`,N2=`uniform vec3 diffuse;
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
}`,D2=`#include <common>
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
}`,U2=`uniform vec3 color;
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
}`,z2=`uniform float rotation;
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
}`,O2=`uniform vec3 diffuse;
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
}`,Oe={alphahash_fragment:oE,alphahash_pars_fragment:aE,alphamap_fragment:lE,alphamap_pars_fragment:cE,alphatest_fragment:uE,alphatest_pars_fragment:hE,aomap_fragment:fE,aomap_pars_fragment:dE,batching_pars_vertex:pE,batching_vertex:mE,begin_vertex:gE,beginnormal_vertex:yE,bsdfs:vE,iridescence_fragment:xE,bumpmap_pars_fragment:_E,clipping_planes_fragment:ME,clipping_planes_pars_fragment:SE,clipping_planes_pars_vertex:wE,clipping_planes_vertex:bE,color_fragment:EE,color_pars_fragment:TE,color_pars_vertex:AE,color_vertex:RE,common:CE,cube_uv_reflection_fragment:PE,defaultnormal_vertex:IE,displacementmap_pars_vertex:LE,displacementmap_vertex:kE,emissivemap_fragment:NE,emissivemap_pars_fragment:DE,colorspace_fragment:UE,colorspace_pars_fragment:zE,envmap_fragment:OE,envmap_common_pars_fragment:FE,envmap_pars_fragment:BE,envmap_pars_vertex:HE,envmap_physical_pars_fragment:JE,envmap_vertex:VE,fog_vertex:GE,fog_pars_vertex:WE,fog_fragment:XE,fog_pars_fragment:YE,gradientmap_pars_fragment:qE,lightmap_pars_fragment:jE,lights_lambert_fragment:$E,lights_lambert_pars_fragment:ZE,lights_pars_begin:KE,lights_toon_fragment:QE,lights_toon_pars_fragment:eT,lights_phong_fragment:tT,lights_phong_pars_fragment:nT,lights_physical_fragment:iT,lights_physical_pars_fragment:rT,lights_fragment_begin:sT,lights_fragment_maps:oT,lights_fragment_end:aT,logdepthbuf_fragment:lT,logdepthbuf_pars_fragment:cT,logdepthbuf_pars_vertex:uT,logdepthbuf_vertex:hT,map_fragment:fT,map_pars_fragment:dT,map_particle_fragment:pT,map_particle_pars_fragment:mT,metalnessmap_fragment:gT,metalnessmap_pars_fragment:yT,morphinstance_vertex:vT,morphcolor_vertex:xT,morphnormal_vertex:_T,morphtarget_pars_vertex:MT,morphtarget_vertex:ST,normal_fragment_begin:wT,normal_fragment_maps:bT,normal_pars_fragment:ET,normal_pars_vertex:TT,normal_vertex:AT,normalmap_pars_fragment:RT,clearcoat_normal_fragment_begin:CT,clearcoat_normal_fragment_maps:PT,clearcoat_pars_fragment:IT,iridescence_pars_fragment:LT,opaque_fragment:kT,packing:NT,premultiplied_alpha_fragment:DT,project_vertex:UT,dithering_fragment:zT,dithering_pars_fragment:OT,roughnessmap_fragment:FT,roughnessmap_pars_fragment:BT,shadowmap_pars_fragment:HT,shadowmap_pars_vertex:VT,shadowmap_vertex:GT,shadowmask_pars_fragment:WT,skinbase_vertex:XT,skinning_pars_vertex:YT,skinning_vertex:qT,skinnormal_vertex:jT,specularmap_fragment:$T,specularmap_pars_fragment:ZT,tonemapping_fragment:KT,tonemapping_pars_fragment:JT,transmission_fragment:QT,transmission_pars_fragment:e2,uv_pars_fragment:t2,uv_pars_vertex:n2,uv_vertex:i2,worldpos_vertex:r2,background_vert:s2,background_frag:o2,backgroundCube_vert:a2,backgroundCube_frag:l2,cube_vert:c2,cube_frag:u2,depth_vert:h2,depth_frag:f2,distanceRGBA_vert:d2,distanceRGBA_frag:p2,equirect_vert:m2,equirect_frag:g2,linedashed_vert:y2,linedashed_frag:v2,meshbasic_vert:x2,meshbasic_frag:_2,meshlambert_vert:M2,meshlambert_frag:S2,meshmatcap_vert:w2,meshmatcap_frag:b2,meshnormal_vert:E2,meshnormal_frag:T2,meshphong_vert:A2,meshphong_frag:R2,meshphysical_vert:C2,meshphysical_frag:P2,meshtoon_vert:I2,meshtoon_frag:L2,points_vert:k2,points_frag:N2,shadow_vert:D2,shadow_frag:U2,sprite_vert:z2,sprite_frag:O2},oe={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},Ui={basic:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:Mn([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:Mn([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:Mn([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:Mn([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:Mn([oe.points,oe.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:Mn([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:Mn([oe.common,oe.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:Mn([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:Mn([oe.sprite,oe.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distanceRGBA:{uniforms:Mn([oe.common,oe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distanceRGBA_vert,fragmentShader:Oe.distanceRGBA_frag},shadow:{uniforms:Mn([oe.lights,oe.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};Ui.physical={uniforms:Mn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};var ku={r:0,b:0,g:0},Rs=new Bi,F2=new ot;function B2(n,e,t,i,r,s,o){let a=new Ie(0),l=s===!0?0:1,c,u,h=null,f=0,p=null;function m(v){let y=v.isScene===!0?v.background:null;return y&&y.isTexture&&(y=(v.backgroundBlurriness>0?t:e).get(y)),y}function x(v){let y=!1,M=m(v);M===null?d(a,l):M&&M.isColor&&(d(M,1),y=!0);let R=n.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(v,y){let M=m(y);M&&(M.isCubeTexture||M.mapping===wh)?(u===void 0&&(u=new Ae(new Hi(1,1,1),new Vi({name:"BackgroundCubeMaterial",uniforms:ia(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Kt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,T,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Rs.copy(y.backgroundRotation),Rs.x*=-1,Rs.y*=-1,Rs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Rs.y*=-1,Rs.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(F2.makeRotationFromEuler(Rs)),u.material.toneMapped=it.getTransfer(M.colorSpace)!==xt,(h!==M||f!==M.version||p!==n.toneMapping)&&(u.material.needsUpdate=!0,h=M,f=M.version,p=n.toneMapping),u.layers.enableAll(),v.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Ae(new vr(2,2),new Vi({name:"BackgroundMaterial",uniforms:ia(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:es,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=it.getTransfer(M.colorSpace)!==xt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||f!==M.version||p!==n.toneMapping)&&(c.material.needsUpdate=!0,h=M,f=M.version,p=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function d(v,y){v.getRGB(ku,P1(n)),i.buffers.color.setClear(ku.r,ku.g,ku.b,y,o)}return{getClearColor:function(){return a},setClearColor:function(v,y=1){a.set(v),l=y,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(a,l)},render:x,addToRenderList:g}}function H2(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=f(null),s=r,o=!1;function a(_,S,U,z,H){let Y=!1,O=h(z,U,S);s!==O&&(s=O,c(s.object)),Y=p(_,z,U,H),Y&&m(_,z,U,H),H!==null&&e.update(H,n.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,M(_,S,U,z),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return n.createVertexArray()}function c(_){return n.bindVertexArray(_)}function u(_){return n.deleteVertexArray(_)}function h(_,S,U){let z=U.wireframe===!0,H=i[_.id];H===void 0&&(H={},i[_.id]=H);let Y=H[S.id];Y===void 0&&(Y={},H[S.id]=Y);let O=Y[z];return O===void 0&&(O=f(l()),Y[z]=O),O}function f(_){let S=[],U=[],z=[];for(let H=0;H<t;H++)S[H]=0,U[H]=0,z[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:U,attributeDivisors:z,object:_,attributes:{},index:null}}function p(_,S,U,z){let H=s.attributes,Y=S.attributes,O=0,G=U.getAttributes();for(let F in G)if(G[F].location>=0){let ne=H[F],re=Y[F];if(re===void 0&&(F==="instanceMatrix"&&_.instanceMatrix&&(re=_.instanceMatrix),F==="instanceColor"&&_.instanceColor&&(re=_.instanceColor)),ne===void 0||ne.attribute!==re||re&&ne.data!==re.data)return!0;O++}return s.attributesNum!==O||s.index!==z}function m(_,S,U,z){let H={},Y=S.attributes,O=0,G=U.getAttributes();for(let F in G)if(G[F].location>=0){let ne=Y[F];ne===void 0&&(F==="instanceMatrix"&&_.instanceMatrix&&(ne=_.instanceMatrix),F==="instanceColor"&&_.instanceColor&&(ne=_.instanceColor));let re={};re.attribute=ne,ne&&ne.data&&(re.data=ne.data),H[F]=re,O++}s.attributes=H,s.attributesNum=O,s.index=z}function x(){let _=s.newAttributes;for(let S=0,U=_.length;S<U;S++)_[S]=0}function g(_){d(_,0)}function d(_,S){let U=s.newAttributes,z=s.enabledAttributes,H=s.attributeDivisors;U[_]=1,z[_]===0&&(n.enableVertexAttribArray(_),z[_]=1),H[_]!==S&&(n.vertexAttribDivisor(_,S),H[_]=S)}function v(){let _=s.newAttributes,S=s.enabledAttributes;for(let U=0,z=S.length;U<z;U++)S[U]!==_[U]&&(n.disableVertexAttribArray(U),S[U]=0)}function y(_,S,U,z,H,Y,O){O===!0?n.vertexAttribIPointer(_,S,U,H,Y):n.vertexAttribPointer(_,S,U,z,H,Y)}function M(_,S,U,z){x();let H=z.attributes,Y=U.getAttributes(),O=S.defaultAttributeValues;for(let G in Y){let F=Y[G];if(F.location>=0){let ee=H[G];if(ee===void 0&&(G==="instanceMatrix"&&_.instanceMatrix&&(ee=_.instanceMatrix),G==="instanceColor"&&_.instanceColor&&(ee=_.instanceColor)),ee!==void 0){let ne=ee.normalized,re=ee.itemSize,Ee=e.get(ee);if(Ee===void 0)continue;let He=Ee.buffer,q=Ee.type,K=Ee.bytesPerElement,pe=q===n.INT||q===n.UNSIGNED_INT||ee.gpuType===R0;if(ee.isInterleavedBufferAttribute){let le=ee.data,Ce=le.stride,be=ee.offset;if(le.isInstancedInterleavedBuffer){for(let ze=0;ze<F.locationSize;ze++)d(F.location+ze,le.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let ze=0;ze<F.locationSize;ze++)g(F.location+ze);n.bindBuffer(n.ARRAY_BUFFER,He);for(let ze=0;ze<F.locationSize;ze++)y(F.location+ze,re/F.locationSize,q,ne,Ce*K,(be+re/F.locationSize*ze)*K,pe)}else{if(ee.isInstancedBufferAttribute){for(let le=0;le<F.locationSize;le++)d(F.location+le,ee.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let le=0;le<F.locationSize;le++)g(F.location+le);n.bindBuffer(n.ARRAY_BUFFER,He);for(let le=0;le<F.locationSize;le++)y(F.location+le,re/F.locationSize,q,ne,re*K,re/F.locationSize*le*K,pe)}}else if(O!==void 0){let ne=O[G];if(ne!==void 0)switch(ne.length){case 2:n.vertexAttrib2fv(F.location,ne);break;case 3:n.vertexAttrib3fv(F.location,ne);break;case 4:n.vertexAttrib4fv(F.location,ne);break;default:n.vertexAttrib1fv(F.location,ne)}}}}v()}function R(){A();for(let _ in i){let S=i[_];for(let U in S){let z=S[U];for(let H in z)u(z[H].object),delete z[H];delete S[U]}delete i[_]}}function T(_){if(i[_.id]===void 0)return;let S=i[_.id];for(let U in S){let z=S[U];for(let H in z)u(z[H].object),delete z[H];delete S[U]}delete i[_.id]}function b(_){for(let S in i){let U=i[S];if(U[_.id]===void 0)continue;let z=U[_.id];for(let H in z)u(z[H].object),delete z[H];delete U[_.id]}}function A(){L(),o=!0,s!==r&&(s=r,c(s.object))}function L(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:A,resetDefaultState:L,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:b,initAttributes:x,enableAttribute:g,disableUnusedAttributes:v}}function V2(n,e,t){let i;function r(c){i=c}function s(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),t.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let p=0;for(let m=0;m<h;m++)p+=u[m];t.update(p,i,1)}function l(c,u,h,f){if(h===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<c.length;m++)o(c[m],u[m],f[m]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,u,0,f,0,h);let m=0;for(let x=0;x<h;x++)m+=u[x];for(let x=0;x<f.length;x++)t.update(m,i,f[x])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function G2(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(b){return!(b!==Ti&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let A=b===zl&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==mr&&i.convert(b)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==Oi&&!A)}function l(b){if(b==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(f===!0){let b=e.get("EXT_clip_control");b.clipControlEXT(b.LOWER_LEFT_EXT,b.ZERO_TO_ONE_EXT)}let p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=m>0,T=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:g,maxAttributes:d,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:M,vertexTextures:R,maxSamples:T}}function W2(n){let e=this,t=null,i=0,r=!1,s=!1,o=new fr,a=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let p=h.length!==0||f||i!==0||r;return r=f,i=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,p){let m=h.clippingPlanes,x=h.clipIntersection,g=h.clipShadows,d=n.get(h);if(!r||m===null||m.length===0||s&&!g)s?u(null):c();else{let v=s?0:i,y=v*4,M=d.clippingState||null;l.value=M,M=u(m,f,y,p);for(let R=0;R!==y;++R)M[R]=t[R];d.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,p,m){let x=h!==null?h.length:0,g=null;if(x!==0){if(g=l.value,m!==!0||g===null){let d=p+x*4,v=f.matrixWorldInverse;a.getNormalMatrix(v),(g===null||g.length<d)&&(g=new Float32Array(d));for(let y=0,M=p;y!==x;++y,M+=4)o.copy(h[y]).applyMatrix4(v,a),o.normal.toArray(g,M),g[M+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}function X2(n){let e=new WeakMap;function t(o,a){return a===cm?o.mapping=Qo:a===um&&(o.mapping=ea),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===cm||a===um)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Ym(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var ch=class extends ah{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Yo=4,N_=[.125,.215,.35,.446,.526,.582],Ls=20,Gp=new ch,D_=new Ie,Wp=null,Xp=0,Yp=0,qp=!1,Ps=(1+Math.sqrt(5))/2,Bo=1/Ps,U_=[new P(-Ps,Bo,0),new P(Ps,Bo,0),new P(-Bo,0,Ps),new P(Bo,0,Ps),new P(0,Ps,-Bo),new P(0,Ps,Bo),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],ra=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Wp=this._renderer.getRenderTarget(),Xp=this._renderer.getActiveCubeFace(),Yp=this._renderer.getActiveMipmapLevel(),qp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=F_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=O_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Wp,Xp,Yp),this._renderer.xr.enabled=qp,e.scissorTest=!1,Nu(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Qo||e.mapping===ea?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Wp=this._renderer.getRenderTarget(),Xp=this._renderer.getActiveCubeFace(),Yp=this._renderer.getActiveMipmapLevel(),qp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ei,minFilter:Ei,generateMipmaps:!1,type:zl,format:Ti,colorSpace:rs,depthBuffer:!1},r=z_(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=z_(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Y2(s)),this._blurMaterial=q2(s,e,t)}return r}_compileMaterial(e){let t=new Ae(this._lodPlanes[0],e);this._renderer.compile(t,Gp)}_sceneToCubeUV(e,t,i,r){let a=new Sn(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(D_),u.toneMapping=Qr,u.autoClear=!1;let p=new bn({name:"PMREM.Background",side:Kt,depthWrite:!1,depthTest:!1}),m=new Ae(new Hi,p),x=!1,g=e.background;g?g.isColor&&(p.color.copy(g),e.background=null,x=!0):(p.color.copy(D_),x=!0);for(let d=0;d<6;d++){let v=d%3;v===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):v===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));let y=this._cubeSize;Nu(r,v*y,d>2?y:0,y,y),u.setRenderTarget(r),x&&u.render(m,a),u.render(e,a)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=g}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===Qo||e.mapping===ea;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=F_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=O_());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new Ae(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Nu(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Gp)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=U_[(r-s-1)%U_.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Ae(this._lodPlanes[r],c),f=c.uniforms,p=this._sizeLods[i]-1,m=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*Ls-1),x=s/m,g=isFinite(s)?1+Math.floor(u*x):Ls;g>Ls&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ls}`);let d=[],v=0;for(let b=0;b<Ls;++b){let A=b/x,L=Math.exp(-A*A/2);d.push(L),b===0?v+=L:b<g&&(v+=2*L)}for(let b=0;b<d.length;b++)d[b]=d[b]/v;f.envMap.value=e.texture,f.samples.value=g,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:y}=this;f.dTheta.value=m,f.mipInt.value=y-i;let M=this._sizeLods[r],R=3*M*(r>y-Yo?r-y+Yo:0),T=4*(this._cubeSize-M);Nu(t,R,T,3*M,2*M),l.setRenderTarget(t),l.render(h,Gp)}};function Y2(n){let e=[],t=[],i=[],r=n,s=n-Yo+1+N_.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-Yo?l=N_[o-n+Yo-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,m=6,x=3,g=2,d=1,v=new Float32Array(x*m*p),y=new Float32Array(g*m*p),M=new Float32Array(d*m*p);for(let T=0;T<p;T++){let b=T%3*2/3-1,A=T>2?0:-1,L=[b,A,0,b+2/3,A,0,b+2/3,A+1,0,b,A,0,b+2/3,A+1,0,b,A+1,0];v.set(L,x*m*T),y.set(f,g*m*T);let _=[T,T,T,T,T,T];M.set(_,d*m*T)}let R=new Jt;R.setAttribute("position",new Nt(v,x)),R.setAttribute("uv",new Nt(y,g)),R.setAttribute("faceIndex",new Nt(M,d)),e.push(R),r>Yo&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function z_(n,e,t){let i=new gr(n,e,t);return i.texture.mapping=wh,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Nu(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function q2(n,e,t){let i=new Float32Array(Ls),r=new P(0,1,0);return new Vi({name:"SphericalGaussianBlur",defines:{n:Ls,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:U0(),fragmentShader:`

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
		`,blending:Jr,depthTest:!1,depthWrite:!1})}function O_(){return new Vi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:U0(),fragmentShader:`

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
		`,blending:Jr,depthTest:!1,depthWrite:!1})}function F_(){return new Vi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:U0(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Jr,depthTest:!1,depthWrite:!1})}function U0(){return`

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
	`}function j2(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===cm||l===um,u=l===Qo||l===ea;if(c||u){let h=e.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new ra(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return c&&p&&p.height>0||u&&p&&r(p)?(t===null&&(t=new ra(n)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function $2(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&$u("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Z2(n,e,t,i){let r={},s=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let m in f.attributes)e.remove(f.attributes[m]);for(let m in f.morphAttributes){let x=f.morphAttributes[m];for(let g=0,d=x.length;g<d;g++)e.remove(x[g])}f.removeEventListener("dispose",o),delete r[f.id];let p=s.get(f);p&&(e.remove(p),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let m in f)e.update(f[m],n.ARRAY_BUFFER);let p=h.morphAttributes;for(let m in p){let x=p[m];for(let g=0,d=x.length;g<d;g++)e.update(x[g],n.ARRAY_BUFFER)}}function c(h){let f=[],p=h.index,m=h.attributes.position,x=0;if(p!==null){let v=p.array;x=p.version;for(let y=0,M=v.length;y<M;y+=3){let R=v[y+0],T=v[y+1],b=v[y+2];f.push(R,T,T,b,b,R)}}else if(m!==void 0){let v=m.array;x=m.version;for(let y=0,M=v.length/3-1;y<M;y+=3){let R=y+0,T=y+1,b=y+2;f.push(R,T,T,b,b,R)}}else return;let g=new(R1(f)?oh:sh)(f,1);g.version=x;let d=s.get(h);d&&e.remove(d),s.set(h,g)}function u(h){let f=s.get(h);if(f){let p=h.index;p!==null&&f.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function K2(n,e,t){let i;function r(f){i=f}let s,o;function a(f){s=f.type,o=f.bytesPerElement}function l(f,p){n.drawElements(i,p,s,f*o),t.update(p,i,1)}function c(f,p,m){m!==0&&(n.drawElementsInstanced(i,p,s,f*o,m),t.update(p,i,m))}function u(f,p,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,f,0,m);let g=0;for(let d=0;d<m;d++)g+=p[d];t.update(g,i,1)}function h(f,p,m,x){if(m===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let d=0;d<f.length;d++)c(f[d]/o,p[d],x[d]);else{g.multiDrawElementsInstancedWEBGL(i,p,0,s,f,0,x,0,m);let d=0;for(let v=0;v<m;v++)d+=p[v];for(let v=0;v<x.length;v++)t.update(d,i,x[v])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function J2(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Q2(n,e,t){let i=new WeakMap,r=new It;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=i.get(a);if(f===void 0||f.count!==h){let L=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",L)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],y=0;p===!0&&(y=1),m===!0&&(y=2),x===!0&&(y=3);let M=a.attributes.position.count*y,R=1;M>e.maxTextureSize&&(R=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let T=new Float32Array(M*R*4*h),b=new ih(T,M,R,h);b.type=Oi,b.needsUpdate=!0;let A=y*4;for(let _=0;_<h;_++){let S=g[_],U=d[_],z=v[_],H=M*R*4*_;for(let Y=0;Y<S.count;Y++){let O=Y*A;p===!0&&(r.fromBufferAttribute(S,Y),T[H+O+0]=r.x,T[H+O+1]=r.y,T[H+O+2]=r.z,T[H+O+3]=0),m===!0&&(r.fromBufferAttribute(U,Y),T[H+O+4]=r.x,T[H+O+5]=r.y,T[H+O+6]=r.z,T[H+O+7]=0),x===!0&&(r.fromBufferAttribute(z,Y),T[H+O+8]=r.x,T[H+O+9]=r.y,T[H+O+10]=r.z,T[H+O+11]=z.itemSize===4?r.w:1)}}f={count:h,texture:b,size:new he(M,R)},i.set(a,f),a.addEventListener("dispose",L)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let p=0;for(let x=0;x<c.length;x++)p+=c[x];let m=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:s}}function eA(n,e,t,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var uh=class extends kn{constructor(e,t,i,r,s,o,a,l,c,u=$o){if(u!==$o&&u!==na)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===$o&&(i=Us),i===void 0&&u===na&&(i=ta),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:un,this.minFilter=l!==void 0?l:un,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},L1=new kn,B_=new uh(1,1),k1=new ih,N1=new Gm,D1=new lh,H_=[],V_=[],G_=new Float32Array(16),W_=new Float32Array(9),X_=new Float32Array(4);function aa(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=H_[r];if(s===void 0&&(s=new Float32Array(r),H_[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Bt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ht(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Eh(n,e){let t=V_[e];t===void 0&&(t=new Int32Array(e),V_[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function tA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function nA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;n.uniform2fv(this.addr,e),Ht(t,e)}}function iA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Bt(t,e))return;n.uniform3fv(this.addr,e),Ht(t,e)}}function rA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;n.uniform4fv(this.addr,e),Ht(t,e)}}function sA(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Bt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ht(t,e)}else{if(Bt(t,i))return;X_.set(i),n.uniformMatrix2fv(this.addr,!1,X_),Ht(t,i)}}function oA(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Bt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ht(t,e)}else{if(Bt(t,i))return;W_.set(i),n.uniformMatrix3fv(this.addr,!1,W_),Ht(t,i)}}function aA(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Bt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ht(t,e)}else{if(Bt(t,i))return;G_.set(i),n.uniformMatrix4fv(this.addr,!1,G_),Ht(t,i)}}function lA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function cA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;n.uniform2iv(this.addr,e),Ht(t,e)}}function uA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;n.uniform3iv(this.addr,e),Ht(t,e)}}function hA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;n.uniform4iv(this.addr,e),Ht(t,e)}}function fA(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function dA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;n.uniform2uiv(this.addr,e),Ht(t,e)}}function pA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;n.uniform3uiv(this.addr,e),Ht(t,e)}}function mA(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;n.uniform4uiv(this.addr,e),Ht(t,e)}}function gA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(B_.compareFunction=A1,s=B_):s=L1,t.setTexture2D(e||s,r)}function yA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||N1,r)}function vA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||D1,r)}function xA(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||k1,r)}function _A(n){switch(n){case 5126:return tA;case 35664:return nA;case 35665:return iA;case 35666:return rA;case 35674:return sA;case 35675:return oA;case 35676:return aA;case 5124:case 35670:return lA;case 35667:case 35671:return cA;case 35668:case 35672:return uA;case 35669:case 35673:return hA;case 5125:return fA;case 36294:return dA;case 36295:return pA;case 36296:return mA;case 35678:case 36198:case 36298:case 36306:case 35682:return gA;case 35679:case 36299:case 36307:return yA;case 35680:case 36300:case 36308:case 36293:return vA;case 36289:case 36303:case 36311:case 36292:return xA}}function MA(n,e){n.uniform1fv(this.addr,e)}function SA(n,e){let t=aa(e,this.size,2);n.uniform2fv(this.addr,t)}function wA(n,e){let t=aa(e,this.size,3);n.uniform3fv(this.addr,t)}function bA(n,e){let t=aa(e,this.size,4);n.uniform4fv(this.addr,t)}function EA(n,e){let t=aa(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function TA(n,e){let t=aa(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function AA(n,e){let t=aa(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function RA(n,e){n.uniform1iv(this.addr,e)}function CA(n,e){n.uniform2iv(this.addr,e)}function PA(n,e){n.uniform3iv(this.addr,e)}function IA(n,e){n.uniform4iv(this.addr,e)}function LA(n,e){n.uniform1uiv(this.addr,e)}function kA(n,e){n.uniform2uiv(this.addr,e)}function NA(n,e){n.uniform3uiv(this.addr,e)}function DA(n,e){n.uniform4uiv(this.addr,e)}function UA(n,e,t){let i=this.cache,r=e.length,s=Eh(t,r);Bt(i,s)||(n.uniform1iv(this.addr,s),Ht(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||L1,s[o])}function zA(n,e,t){let i=this.cache,r=e.length,s=Eh(t,r);Bt(i,s)||(n.uniform1iv(this.addr,s),Ht(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||N1,s[o])}function OA(n,e,t){let i=this.cache,r=e.length,s=Eh(t,r);Bt(i,s)||(n.uniform1iv(this.addr,s),Ht(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||D1,s[o])}function FA(n,e,t){let i=this.cache,r=e.length,s=Eh(t,r);Bt(i,s)||(n.uniform1iv(this.addr,s),Ht(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||k1,s[o])}function BA(n){switch(n){case 5126:return MA;case 35664:return SA;case 35665:return wA;case 35666:return bA;case 35674:return EA;case 35675:return TA;case 35676:return AA;case 5124:case 35670:return RA;case 35667:case 35671:return CA;case 35668:case 35672:return PA;case 35669:case 35673:return IA;case 5125:return LA;case 36294:return kA;case 36295:return NA;case 36296:return DA;case 35678:case 36198:case 36298:case 36306:case 35682:return UA;case 35679:case 36299:case 36307:return zA;case 35680:case 36300:case 36308:case 36293:return OA;case 36289:case 36303:case 36311:case 36292:return FA}}var qm=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=_A(t.type)}},jm=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=BA(t.type)}},$m=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},jp=/(\w+)(\])?(\[|\.)?/g;function Y_(n,e){n.seq.push(e),n.map[e.id]=e}function HA(n,e,t){let i=n.name,r=i.length;for(jp.lastIndex=0;;){let s=jp.exec(i),o=jp.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Y_(t,c===void 0?new qm(a,n,e):new jm(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new $m(a),Y_(t,h)),t=h}}}var Ko=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);HA(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function q_(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var VA=37297,GA=0;function WA(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function XA(n){let e=it.getPrimaries(it.workingColorSpace),t=it.getPrimaries(n),i;switch(e===t?i="":e===Qu&&t===Ju?i="LinearDisplayP3ToLinearSRGB":e===Ju&&t===Qu&&(i="LinearSRGBToLinearDisplayP3"),n){case rs:case bh:return[i,"LinearTransferOETF"];case qn:case D0:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function j_(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+WA(n.getShaderSource(e),o)}else return r}function YA(n,e){let t=XA(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function qA(n,e){let t;switch(e){case yb:t="Linear";break;case vb:t="Reinhard";break;case xb:t="Cineon";break;case _b:t="ACESFilmic";break;case Sb:t="AgX";break;case wb:t="Neutral";break;case Mb:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Du=new P;function jA(){it.getLuminanceCoefficients(Du);let n=Du.x.toFixed(4),e=Du.y.toFixed(4),t=Du.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function $A(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_l).join(`
`)}function ZA(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function KA(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function _l(n){return n!==""}function $_(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Z_(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var JA=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zm(n){return n.replace(JA,eR)}var QA=new Map;function eR(n,e){let t=Oe[e];if(t===void 0){let i=QA.get(e);if(i!==void 0)t=Oe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Zm(t)}var tR=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function K_(n){return n.replace(tR,nR)}function nR(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function J_(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function iR(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===p1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===A0?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===hr&&(e="SHADOWMAP_TYPE_VSM"),e}function rR(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Qo:case ea:e="ENVMAP_TYPE_CUBE";break;case wh:e="ENVMAP_TYPE_CUBE_UV";break}return e}function sR(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case ea:e="ENVMAP_MODE_REFRACTION";break}return e}function oR(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case m1:e="ENVMAP_BLENDING_MULTIPLY";break;case mb:e="ENVMAP_BLENDING_MIX";break;case gb:e="ENVMAP_BLENDING_ADD";break}return e}function aR(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function lR(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=iR(t),c=rR(t),u=sR(t),h=oR(t),f=aR(t),p=$A(t),m=ZA(s),x=r.createProgram(),g,d,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(_l).join(`
`),g.length>0&&(g+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(_l).join(`
`),d.length>0&&(d+=`
`)):(g=[J_(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_l).join(`
`),d=[J_(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Qr?"#define TONE_MAPPING":"",t.toneMapping!==Qr?Oe.tonemapping_pars_fragment:"",t.toneMapping!==Qr?qA("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,YA("linearToOutputTexel",t.outputColorSpace),jA(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(_l).join(`
`)),o=Zm(o),o=$_(o,t),o=Z_(o,t),a=Zm(a),a=$_(a,t),a=Z_(a,t),o=K_(o),a=K_(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,d=["#define varying in",t.glslVersion===g_?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===g_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let y=v+g+o,M=v+d+a,R=q_(r,r.VERTEX_SHADER,y),T=q_(r,r.FRAGMENT_SHADER,M);r.attachShader(x,R),r.attachShader(x,T),t.index0AttributeName!==void 0?r.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function b(S){if(n.debug.checkShaderErrors){let U=r.getProgramInfoLog(x).trim(),z=r.getShaderInfoLog(R).trim(),H=r.getShaderInfoLog(T).trim(),Y=!0,O=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(Y=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,x,R,T);else{let G=j_(r,R,"vertex"),F=j_(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+U+`
`+G+`
`+F)}else U!==""?console.warn("THREE.WebGLProgram: Program Info Log:",U):(z===""||H==="")&&(O=!1);O&&(S.diagnostics={runnable:Y,programLog:U,vertexShader:{log:z,prefix:g},fragmentShader:{log:H,prefix:d}})}r.deleteShader(R),r.deleteShader(T),A=new Ko(r,x),L=KA(r,x)}let A;this.getUniforms=function(){return A===void 0&&b(this),A};let L;this.getAttributes=function(){return L===void 0&&b(this),L};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(x,VA)),_},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=GA++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=T,this}var cR=0,Km=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Jm(e),t.set(e,i)),i}},Jm=class{constructor(e){this.id=cR++,this.code=e,this.usedTimes=0}};function uR(n,e,t,i,r,s,o){let a=new rh,l=new Km,c=new Set,u=[],h=r.logarithmicDepthBuffer,f=r.reverseDepthBuffer,p=r.vertexTextures,m=r.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function d(_,S,U,z,H){let Y=z.fog,O=H.geometry,G=_.isMeshStandardMaterial?z.environment:null,F=(_.isMeshStandardMaterial?t:e).get(_.envMap||G),ee=F&&F.mapping===wh?F.image.height:null,ne=x[_.type];_.precision!==null&&(m=r.getMaxPrecision(_.precision),m!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",m,"instead."));let re=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Ee=re!==void 0?re.length:0,He=0;O.morphAttributes.position!==void 0&&(He=1),O.morphAttributes.normal!==void 0&&(He=2),O.morphAttributes.color!==void 0&&(He=3);let q,K,pe,le;if(ne){let An=Ui[ne];q=An.vertexShader,K=An.fragmentShader}else q=_.vertexShader,K=_.fragmentShader,l.update(_),pe=l.getVertexShaderID(_),le=l.getFragmentShaderID(_);let Ce=n.getRenderTarget(),be=H.isInstancedMesh===!0,ze=H.isBatchedMesh===!0,Qe=!!_.map,Xe=!!_.matcap,I=!!F,dn=!!_.aoMap,qe=!!_.lightMap,Ke=!!_.bumpMap,Le=!!_.normalMap,pt=!!_.displacementMap,De=!!_.emissiveMap,C=!!_.metalnessMap,w=!!_.roughnessMap,B=_.anisotropy>0,$=_.clearcoat>0,J=_.dispersion>0,j=_.iridescence>0,Me=_.sheen>0,ae=_.transmission>0,ge=B&&!!_.anisotropyMap,Je=$&&!!_.clearcoatMap,te=$&&!!_.clearcoatNormalMap,ye=$&&!!_.clearcoatRoughnessMap,ke=j&&!!_.iridescenceMap,Ne=j&&!!_.iridescenceThicknessMap,ve=Me&&!!_.sheenColorMap,je=Me&&!!_.sheenRoughnessMap,Ue=!!_.specularMap,ut=!!_.specularColorMap,k=!!_.specularIntensityMap,fe=ae&&!!_.transmissionMap,X=ae&&!!_.thicknessMap,Z=!!_.gradientMap,ce=!!_.alphaMap,de=_.alphaTest>0,$e=!!_.alphaHash,Dt=!!_.extensions,Tn=Qr;_.toneMapped&&(Ce===null||Ce.isXRRenderTarget===!0)&&(Tn=n.toneMapping);let et={shaderID:ne,shaderType:_.type,shaderName:_.name,vertexShader:q,fragmentShader:K,defines:_.defines,customVertexShaderID:pe,customFragmentShaderID:le,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:m,batching:ze,batchingColor:ze&&H._colorsTexture!==null,instancing:be,instancingColor:be&&H.instanceColor!==null,instancingMorph:be&&H.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Ce===null?n.outputColorSpace:Ce.isXRRenderTarget===!0?Ce.texture.colorSpace:rs,alphaToCoverage:!!_.alphaToCoverage,map:Qe,matcap:Xe,envMap:I,envMapMode:I&&F.mapping,envMapCubeUVHeight:ee,aoMap:dn,lightMap:qe,bumpMap:Ke,normalMap:Le,displacementMap:p&&pt,emissiveMap:De,normalMapObjectSpace:Le&&_.normalMapType===Ab,normalMapTangentSpace:Le&&_.normalMapType===T1,metalnessMap:C,roughnessMap:w,anisotropy:B,anisotropyMap:ge,clearcoat:$,clearcoatMap:Je,clearcoatNormalMap:te,clearcoatRoughnessMap:ye,dispersion:J,iridescence:j,iridescenceMap:ke,iridescenceThicknessMap:Ne,sheen:Me,sheenColorMap:ve,sheenRoughnessMap:je,specularMap:Ue,specularColorMap:ut,specularIntensityMap:k,transmission:ae,transmissionMap:fe,thicknessMap:X,gradientMap:Z,opaque:_.transparent===!1&&_.blending===jo&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:de,alphaHash:$e,combine:_.combine,mapUv:Qe&&g(_.map.channel),aoMapUv:dn&&g(_.aoMap.channel),lightMapUv:qe&&g(_.lightMap.channel),bumpMapUv:Ke&&g(_.bumpMap.channel),normalMapUv:Le&&g(_.normalMap.channel),displacementMapUv:pt&&g(_.displacementMap.channel),emissiveMapUv:De&&g(_.emissiveMap.channel),metalnessMapUv:C&&g(_.metalnessMap.channel),roughnessMapUv:w&&g(_.roughnessMap.channel),anisotropyMapUv:ge&&g(_.anisotropyMap.channel),clearcoatMapUv:Je&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:te&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ke&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ne&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:je&&g(_.sheenRoughnessMap.channel),specularMapUv:Ue&&g(_.specularMap.channel),specularColorMapUv:ut&&g(_.specularColorMap.channel),specularIntensityMapUv:k&&g(_.specularIntensityMap.channel),transmissionMapUv:fe&&g(_.transmissionMap.channel),thicknessMapUv:X&&g(_.thicknessMap.channel),alphaMapUv:ce&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Le||B),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!O.attributes.uv&&(Qe||ce),fog:!!Y,useFog:_.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:f,skinning:H.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:He,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&U.length>0,shadowMapType:n.shadowMap.type,toneMapping:Tn,decodeVideoTexture:Qe&&_.map.isVideoTexture===!0&&it.getTransfer(_.map.colorSpace)===xt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===jn,flipSided:_.side===Kt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Dt&&_.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Dt&&_.extensions.multiDraw===!0||ze)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return et.vertexUv1s=c.has(1),et.vertexUv2s=c.has(2),et.vertexUv3s=c.has(3),c.clear(),et}function v(_){let S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(let U in _.defines)S.push(U),S.push(_.defines[U]);return _.isRawShaderMaterial===!1&&(y(S,_),M(S,_),S.push(n.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function y(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function M(_,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),_.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.alphaToCoverage&&a.enable(20),_.push(a.mask)}function R(_){let S=x[_.type],U;if(S){let z=Ui[S];U=eE.clone(z.uniforms)}else U=_.uniforms;return U}function T(_,S){let U;for(let z=0,H=u.length;z<H;z++){let Y=u[z];if(Y.cacheKey===S){U=Y,++U.usedTimes;break}}return U===void 0&&(U=new lR(n,S,_,s),u.push(U)),U}function b(_){if(--_.usedTimes===0){let S=u.indexOf(_);u[S]=u[u.length-1],u.pop(),_.destroy()}}function A(_){l.remove(_)}function L(){l.dispose()}return{getParameters:d,getProgramCacheKey:v,getUniforms:R,acquireProgram:T,releaseProgram:b,releaseShaderCache:A,programs:u,dispose:L}}function hR(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function fR(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Q_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function e1(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,f,p,m,x,g){let d=n[e];return d===void 0?(d={id:h.id,object:h,geometry:f,material:p,groupOrder:m,renderOrder:h.renderOrder,z:x,group:g},n[e]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=p,d.groupOrder=m,d.renderOrder=h.renderOrder,d.z=x,d.group=g),e++,d}function a(h,f,p,m,x,g){let d=o(h,f,p,m,x,g);p.transmission>0?i.push(d):p.transparent===!0?r.push(d):t.push(d)}function l(h,f,p,m,x,g){let d=o(h,f,p,m,x,g);p.transmission>0?i.unshift(d):p.transparent===!0?r.unshift(d):t.unshift(d)}function c(h,f){t.length>1&&t.sort(h||fR),i.length>1&&i.sort(f||Q_),r.length>1&&r.sort(f||Q_)}function u(){for(let h=e,f=n.length;h<f;h++){let p=n[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function dR(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new e1,n.set(i,[o])):r>=s.length?(o=new e1,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function pR(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ie};break;case"SpotLight":t={position:new P,direction:new P,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function mR(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var gR=0;function yR(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function vR(n){let e=new pR,t=mR(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let r=new P,s=new ot,o=new ot;function a(c){let u=0,h=0,f=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let p=0,m=0,x=0,g=0,d=0,v=0,y=0,M=0,R=0,T=0,b=0;c.sort(yR);for(let L=0,_=c.length;L<_;L++){let S=c[L],U=S.color,z=S.intensity,H=S.distance,Y=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)u+=U.r*z,h+=U.g*z,f+=U.b*z;else if(S.isLightProbe){for(let O=0;O<9;O++)i.probe[O].addScaledVector(S.sh.coefficients[O],z);b++}else if(S.isDirectionalLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let G=S.shadow,F=t.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,i.directionalShadow[p]=F,i.directionalShadowMap[p]=Y,i.directionalShadowMatrix[p]=S.shadow.matrix,v++}i.directional[p]=O,p++}else if(S.isSpotLight){let O=e.get(S);O.position.setFromMatrixPosition(S.matrixWorld),O.color.copy(U).multiplyScalar(z),O.distance=H,O.coneCos=Math.cos(S.angle),O.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),O.decay=S.decay,i.spot[x]=O;let G=S.shadow;if(S.map&&(i.spotLightMap[R]=S.map,R++,G.updateMatrices(S),S.castShadow&&T++),i.spotLightMatrix[x]=G.matrix,S.castShadow){let F=t.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,i.spotShadow[x]=F,i.spotShadowMap[x]=Y,M++}x++}else if(S.isRectAreaLight){let O=e.get(S);O.color.copy(U).multiplyScalar(z),O.halfWidth.set(S.width*.5,0,0),O.halfHeight.set(0,S.height*.5,0),i.rectArea[g]=O,g++}else if(S.isPointLight){let O=e.get(S);if(O.color.copy(S.color).multiplyScalar(S.intensity),O.distance=S.distance,O.decay=S.decay,S.castShadow){let G=S.shadow,F=t.get(S);F.shadowIntensity=G.intensity,F.shadowBias=G.bias,F.shadowNormalBias=G.normalBias,F.shadowRadius=G.radius,F.shadowMapSize=G.mapSize,F.shadowCameraNear=G.camera.near,F.shadowCameraFar=G.camera.far,i.pointShadow[m]=F,i.pointShadowMap[m]=Y,i.pointShadowMatrix[m]=S.shadow.matrix,y++}i.point[m]=O,m++}else if(S.isHemisphereLight){let O=e.get(S);O.skyColor.copy(S.color).multiplyScalar(z),O.groundColor.copy(S.groundColor).multiplyScalar(z),i.hemi[d]=O,d++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;let A=i.hash;(A.directionalLength!==p||A.pointLength!==m||A.spotLength!==x||A.rectAreaLength!==g||A.hemiLength!==d||A.numDirectionalShadows!==v||A.numPointShadows!==y||A.numSpotShadows!==M||A.numSpotMaps!==R||A.numLightProbes!==b)&&(i.directional.length=p,i.spot.length=x,i.rectArea.length=g,i.point.length=m,i.hemi.length=d,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=M+R-T,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=b,A.directionalLength=p,A.pointLength=m,A.spotLength=x,A.rectAreaLength=g,A.hemiLength=d,A.numDirectionalShadows=v,A.numPointShadows=y,A.numSpotShadows=M,A.numSpotMaps=R,A.numLightProbes=b,i.version=gR++)}function l(c,u){let h=0,f=0,p=0,m=0,x=0,g=u.matrixWorldInverse;for(let d=0,v=c.length;d<v;d++){let y=c[d];if(y.isDirectionalLight){let M=i.directional[h];M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),h++}else if(y.isSpotLight){let M=i.spot[p];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),p++}else if(y.isRectAreaLight){let M=i.rectArea[m];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),o.identity(),s.copy(y.matrixWorld),s.premultiply(g),o.extractRotation(s),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),m++}else if(y.isPointLight){let M=i.point[f];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),f++}else if(y.isHemisphereLight){let M=i.hemi[x];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(g),x++}}}return{setup:a,setupView:l,state:i}}function t1(n){let e=new vR(n),t=[],i=[];function r(u){c.camera=u,t.length=0,i.length=0}function s(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function xR(n){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new t1(n),e.set(r,[a])):s>=o.length?(a=new t1(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var Qm=class extends ns{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Eb,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},e0=class extends ns{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},_R=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,MR=`uniform sampler2D shadow_pass;
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
}`;function SR(n,e,t){let i=new Tl,r=new he,s=new he,o=new It,a=new Qm({depthPacking:Tb}),l=new e0,c={},u=t.maxTextureSize,h={[es]:Kt,[Kt]:es,[jn]:jn},f=new Vi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:_R,fragmentShader:MR}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Jt;m.setAttribute("position",new Nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ae(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=p1;let d=this.type;this.render=function(T,b,A){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;let L=n.getRenderTarget(),_=n.getActiveCubeFace(),S=n.getActiveMipmapLevel(),U=n.state;U.setBlending(Jr),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let z=d!==hr&&this.type===hr,H=d===hr&&this.type!==hr;for(let Y=0,O=T.length;Y<O;Y++){let G=T[Y],F=G.shadow;if(F===void 0){console.warn("THREE.WebGLShadowMap:",G,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;r.copy(F.mapSize);let ee=F.getFrameExtents();if(r.multiply(ee),s.copy(F.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/ee.x),r.x=s.x*ee.x,F.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/ee.y),r.y=s.y*ee.y,F.mapSize.y=s.y)),F.map===null||z===!0||H===!0){let re=this.type!==hr?{minFilter:un,magFilter:un}:{};F.map!==null&&F.map.dispose(),F.map=new gr(r.x,r.y,re),F.map.texture.name=G.name+".shadowMap",F.camera.updateProjectionMatrix()}n.setRenderTarget(F.map),n.clear();let ne=F.getViewportCount();for(let re=0;re<ne;re++){let Ee=F.getViewport(re);o.set(s.x*Ee.x,s.y*Ee.y,s.x*Ee.z,s.y*Ee.w),U.viewport(o),F.updateMatrices(G,re),i=F.getFrustum(),M(b,A,F.camera,G,this.type)}F.isPointLightShadow!==!0&&this.type===hr&&v(F,A),F.needsUpdate=!1}d=this.type,g.needsUpdate=!1,n.setRenderTarget(L,_,S)};function v(T,b){let A=e.update(x);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new gr(r.x,r.y)),f.uniforms.shadow_pass.value=T.map.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(b,null,A,f,x,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(b,null,A,p,x,null)}function y(T,b,A,L){let _=null,S=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(S!==void 0)_=S;else if(_=A.isPointLight===!0?l:a,n.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){let U=_.uuid,z=b.uuid,H=c[U];H===void 0&&(H={},c[U]=H);let Y=H[z];Y===void 0&&(Y=_.clone(),H[z]=Y,b.addEventListener("dispose",R)),_=Y}if(_.visible=b.visible,_.wireframe=b.wireframe,L===hr?_.side=b.shadowSide!==null?b.shadowSide:b.side:_.side=b.shadowSide!==null?b.shadowSide:h[b.side],_.alphaMap=b.alphaMap,_.alphaTest=b.alphaTest,_.map=b.map,_.clipShadows=b.clipShadows,_.clippingPlanes=b.clippingPlanes,_.clipIntersection=b.clipIntersection,_.displacementMap=b.displacementMap,_.displacementScale=b.displacementScale,_.displacementBias=b.displacementBias,_.wireframeLinewidth=b.wireframeLinewidth,_.linewidth=b.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let U=n.properties.get(_);U.light=A}return _}function M(T,b,A,L,_){if(T.visible===!1)return;if(T.layers.test(b.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&_===hr)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let z=e.update(T),H=T.material;if(Array.isArray(H)){let Y=z.groups;for(let O=0,G=Y.length;O<G;O++){let F=Y[O],ee=H[F.materialIndex];if(ee&&ee.visible){let ne=y(T,ee,L,_);T.onBeforeShadow(n,T,b,A,z,ne,F),n.renderBufferDirect(A,null,z,ne,T,F),T.onAfterShadow(n,T,b,A,z,ne,F)}}}else if(H.visible){let Y=y(T,H,L,_);T.onBeforeShadow(n,T,b,A,z,Y,null),n.renderBufferDirect(A,null,z,Y,T,null),T.onAfterShadow(n,T,b,A,z,Y,null)}}let U=T.children;for(let z=0,H=U.length;z<H;z++)M(U[z],b,A,L,_)}function R(T){T.target.removeEventListener("dispose",R);for(let A in c){let L=c[A],_=T.target.uuid;_ in L&&(L[_].dispose(),delete L[_])}}}var wR={[nm]:im,[rm]:am,[sm]:lm,[Jo]:om,[im]:nm,[am]:rm,[lm]:sm,[om]:Jo};function bR(n){function e(){let k=!1,fe=new It,X=null,Z=new It(0,0,0,0);return{setMask:function(ce){X!==ce&&!k&&(n.colorMask(ce,ce,ce,ce),X=ce)},setLocked:function(ce){k=ce},setClear:function(ce,de,$e,Dt,Tn){Tn===!0&&(ce*=Dt,de*=Dt,$e*=Dt),fe.set(ce,de,$e,Dt),Z.equals(fe)===!1&&(n.clearColor(ce,de,$e,Dt),Z.copy(fe))},reset:function(){k=!1,X=null,Z.set(-1,0,0,0)}}}function t(){let k=!1,fe=!1,X=null,Z=null,ce=null;return{setReversed:function(de){fe=de},setTest:function(de){de?pe(n.DEPTH_TEST):le(n.DEPTH_TEST)},setMask:function(de){X!==de&&!k&&(n.depthMask(de),X=de)},setFunc:function(de){if(fe&&(de=wR[de]),Z!==de){switch(de){case nm:n.depthFunc(n.NEVER);break;case im:n.depthFunc(n.ALWAYS);break;case rm:n.depthFunc(n.LESS);break;case Jo:n.depthFunc(n.LEQUAL);break;case sm:n.depthFunc(n.EQUAL);break;case om:n.depthFunc(n.GEQUAL);break;case am:n.depthFunc(n.GREATER);break;case lm:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Z=de}},setLocked:function(de){k=de},setClear:function(de){ce!==de&&(n.clearDepth(de),ce=de)},reset:function(){k=!1,X=null,Z=null,ce=null}}}function i(){let k=!1,fe=null,X=null,Z=null,ce=null,de=null,$e=null,Dt=null,Tn=null;return{setTest:function(et){k||(et?pe(n.STENCIL_TEST):le(n.STENCIL_TEST))},setMask:function(et){fe!==et&&!k&&(n.stencilMask(et),fe=et)},setFunc:function(et,An,Xi){(X!==et||Z!==An||ce!==Xi)&&(n.stencilFunc(et,An,Xi),X=et,Z=An,ce=Xi)},setOp:function(et,An,Xi){(de!==et||$e!==An||Dt!==Xi)&&(n.stencilOp(et,An,Xi),de=et,$e=An,Dt=Xi)},setLocked:function(et){k=et},setClear:function(et){Tn!==et&&(n.clearStencil(et),Tn=et)},reset:function(){k=!1,fe=null,X=null,Z=null,ce=null,de=null,$e=null,Dt=null,Tn=null}}}let r=new e,s=new t,o=new i,a=new WeakMap,l=new WeakMap,c={},u={},h=new WeakMap,f=[],p=null,m=!1,x=null,g=null,d=null,v=null,y=null,M=null,R=null,T=new Ie(0,0,0),b=0,A=!1,L=null,_=null,S=null,U=null,z=null,H=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,O=0,G=n.getParameter(n.VERSION);G.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(G)[1]),Y=O>=1):G.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),Y=O>=2);let F=null,ee={},ne=n.getParameter(n.SCISSOR_BOX),re=n.getParameter(n.VIEWPORT),Ee=new It().fromArray(ne),He=new It().fromArray(re);function q(k,fe,X,Z){let ce=new Uint8Array(4),de=n.createTexture();n.bindTexture(k,de),n.texParameteri(k,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(k,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let $e=0;$e<X;$e++)k===n.TEXTURE_3D||k===n.TEXTURE_2D_ARRAY?n.texImage3D(fe,0,n.RGBA,1,1,Z,0,n.RGBA,n.UNSIGNED_BYTE,ce):n.texImage2D(fe+$e,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ce);return de}let K={};K[n.TEXTURE_2D]=q(n.TEXTURE_2D,n.TEXTURE_2D,1),K[n.TEXTURE_CUBE_MAP]=q(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[n.TEXTURE_2D_ARRAY]=q(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),K[n.TEXTURE_3D]=q(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),pe(n.DEPTH_TEST),s.setFunc(Jo),qe(!1),Ke(l_),pe(n.CULL_FACE),I(Jr);function pe(k){c[k]!==!0&&(n.enable(k),c[k]=!0)}function le(k){c[k]!==!1&&(n.disable(k),c[k]=!1)}function Ce(k,fe){return u[k]!==fe?(n.bindFramebuffer(k,fe),u[k]=fe,k===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=fe),k===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=fe),!0):!1}function be(k,fe){let X=f,Z=!1;if(k){X=h.get(fe),X===void 0&&(X=[],h.set(fe,X));let ce=k.textures;if(X.length!==ce.length||X[0]!==n.COLOR_ATTACHMENT0){for(let de=0,$e=ce.length;de<$e;de++)X[de]=n.COLOR_ATTACHMENT0+de;X.length=ce.length,Z=!0}}else X[0]!==n.BACK&&(X[0]=n.BACK,Z=!0);Z&&n.drawBuffers(X)}function ze(k){return p!==k?(n.useProgram(k),p=k,!0):!1}let Qe={[Is]:n.FUNC_ADD,[Jw]:n.FUNC_SUBTRACT,[Qw]:n.FUNC_REVERSE_SUBTRACT};Qe[eb]=n.MIN,Qe[tb]=n.MAX;let Xe={[nb]:n.ZERO,[ib]:n.ONE,[rb]:n.SRC_COLOR,[em]:n.SRC_ALPHA,[ub]:n.SRC_ALPHA_SATURATE,[lb]:n.DST_COLOR,[ob]:n.DST_ALPHA,[sb]:n.ONE_MINUS_SRC_COLOR,[tm]:n.ONE_MINUS_SRC_ALPHA,[cb]:n.ONE_MINUS_DST_COLOR,[ab]:n.ONE_MINUS_DST_ALPHA,[hb]:n.CONSTANT_COLOR,[fb]:n.ONE_MINUS_CONSTANT_COLOR,[db]:n.CONSTANT_ALPHA,[pb]:n.ONE_MINUS_CONSTANT_ALPHA};function I(k,fe,X,Z,ce,de,$e,Dt,Tn,et){if(k===Jr){m===!0&&(le(n.BLEND),m=!1);return}if(m===!1&&(pe(n.BLEND),m=!0),k!==Kw){if(k!==x||et!==A){if((g!==Is||y!==Is)&&(n.blendEquation(n.FUNC_ADD),g=Is,y=Is),et)switch(k){case jo:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case c_:n.blendFunc(n.ONE,n.ONE);break;case u_:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case h_:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}else switch(k){case jo:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case c_:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case u_:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case h_:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}d=null,v=null,M=null,R=null,T.set(0,0,0),b=0,x=k,A=et}return}ce=ce||fe,de=de||X,$e=$e||Z,(fe!==g||ce!==y)&&(n.blendEquationSeparate(Qe[fe],Qe[ce]),g=fe,y=ce),(X!==d||Z!==v||de!==M||$e!==R)&&(n.blendFuncSeparate(Xe[X],Xe[Z],Xe[de],Xe[$e]),d=X,v=Z,M=de,R=$e),(Dt.equals(T)===!1||Tn!==b)&&(n.blendColor(Dt.r,Dt.g,Dt.b,Tn),T.copy(Dt),b=Tn),x=k,A=!1}function dn(k,fe){k.side===jn?le(n.CULL_FACE):pe(n.CULL_FACE);let X=k.side===Kt;fe&&(X=!X),qe(X),k.blending===jo&&k.transparent===!1?I(Jr):I(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),s.setFunc(k.depthFunc),s.setTest(k.depthTest),s.setMask(k.depthWrite),r.setMask(k.colorWrite);let Z=k.stencilWrite;o.setTest(Z),Z&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),pt(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?pe(n.SAMPLE_ALPHA_TO_COVERAGE):le(n.SAMPLE_ALPHA_TO_COVERAGE)}function qe(k){L!==k&&(k?n.frontFace(n.CW):n.frontFace(n.CCW),L=k)}function Ke(k){k!==$w?(pe(n.CULL_FACE),k!==_&&(k===l_?n.cullFace(n.BACK):k===Zw?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):le(n.CULL_FACE),_=k}function Le(k){k!==S&&(Y&&n.lineWidth(k),S=k)}function pt(k,fe,X){k?(pe(n.POLYGON_OFFSET_FILL),(U!==fe||z!==X)&&(n.polygonOffset(fe,X),U=fe,z=X)):le(n.POLYGON_OFFSET_FILL)}function De(k){k?pe(n.SCISSOR_TEST):le(n.SCISSOR_TEST)}function C(k){k===void 0&&(k=n.TEXTURE0+H-1),F!==k&&(n.activeTexture(k),F=k)}function w(k,fe,X){X===void 0&&(F===null?X=n.TEXTURE0+H-1:X=F);let Z=ee[X];Z===void 0&&(Z={type:void 0,texture:void 0},ee[X]=Z),(Z.type!==k||Z.texture!==fe)&&(F!==X&&(n.activeTexture(X),F=X),n.bindTexture(k,fe||K[k]),Z.type=k,Z.texture=fe)}function B(){let k=ee[F];k!==void 0&&k.type!==void 0&&(n.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function $(){try{n.compressedTexImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function J(){try{n.compressedTexImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function j(){try{n.texSubImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Me(){try{n.texSubImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ae(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ge(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Je(){try{n.texStorage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function te(){try{n.texStorage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ye(){try{n.texImage2D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ke(){try{n.texImage3D.apply(n,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Ne(k){Ee.equals(k)===!1&&(n.scissor(k.x,k.y,k.z,k.w),Ee.copy(k))}function ve(k){He.equals(k)===!1&&(n.viewport(k.x,k.y,k.z,k.w),He.copy(k))}function je(k,fe){let X=l.get(fe);X===void 0&&(X=new WeakMap,l.set(fe,X));let Z=X.get(k);Z===void 0&&(Z=n.getUniformBlockIndex(fe,k.name),X.set(k,Z))}function Ue(k,fe){let Z=l.get(fe).get(k);a.get(fe)!==Z&&(n.uniformBlockBinding(fe,Z,k.__bindingPointIndex),a.set(fe,Z))}function ut(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),c={},F=null,ee={},u={},h=new WeakMap,f=[],p=null,m=!1,x=null,g=null,d=null,v=null,y=null,M=null,R=null,T=new Ie(0,0,0),b=0,A=!1,L=null,_=null,S=null,U=null,z=null,Ee.set(0,0,n.canvas.width,n.canvas.height),He.set(0,0,n.canvas.width,n.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:pe,disable:le,bindFramebuffer:Ce,drawBuffers:be,useProgram:ze,setBlending:I,setMaterial:dn,setFlipSided:qe,setCullFace:Ke,setLineWidth:Le,setPolygonOffset:pt,setScissorTest:De,activeTexture:C,bindTexture:w,unbindTexture:B,compressedTexImage2D:$,compressedTexImage3D:J,texImage2D:ye,texImage3D:ke,updateUBOMapping:je,uniformBlockBinding:Ue,texStorage2D:Je,texStorage3D:te,texSubImage2D:j,texSubImage3D:Me,compressedTexSubImage2D:ae,compressedTexSubImage3D:ge,scissor:Ne,viewport:ve,reset:ut}}function n1(n,e,t,i){let r=ER(i);switch(t){case _1:return n*e;case S1:return n*e;case w1:return n*e*2;case I0:return n*e/r.components*r.byteLength;case L0:return n*e/r.components*r.byteLength;case b1:return n*e*2/r.components*r.byteLength;case k0:return n*e*2/r.components*r.byteLength;case M1:return n*e*3/r.components*r.byteLength;case Ti:return n*e*4/r.components*r.byteLength;case N0:return n*e*4/r.components*r.byteLength;case Wu:case Xu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Yu:case qu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case dm:case mm:return Math.max(n,16)*Math.max(e,8)/4;case fm:case pm:return Math.max(n,8)*Math.max(e,8)/2;case gm:case ym:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case vm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case xm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case _m:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Mm:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Sm:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case wm:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case bm:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Em:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Tm:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Am:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Rm:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Cm:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Pm:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Im:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Lm:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ju:case km:case Nm:return Math.ceil(n/4)*Math.ceil(e/4)*16;case E1:case Dm:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Um:case zm:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ER(n){switch(n){case mr:case y1:return{byteLength:1,components:1};case El:case v1:case zl:return{byteLength:2,components:1};case C0:case P0:return{byteLength:2,components:4};case Us:case R0:case Oi:return{byteLength:4,components:1};case x1:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function TR(n,e,t,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new he,u=new WeakMap,h,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,w){return p?new OffscreenCanvas(C,w):th("canvas")}function x(C,w,B){let $=1,J=De(C);if((J.width>B||J.height>B)&&($=B/Math.max(J.width,J.height)),$<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let j=Math.floor($*J.width),Me=Math.floor($*J.height);h===void 0&&(h=m(j,Me));let ae=w?m(j,Me):h;return ae.width=j,ae.height=Me,ae.getContext("2d").drawImage(C,0,0,j,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+j+"x"+Me+")."),ae}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function g(C){return C.generateMipmaps&&C.minFilter!==un&&C.minFilter!==Ei}function d(C){n.generateMipmap(C)}function v(C,w,B,$,J=!1){if(C!==null){if(n[C]!==void 0)return n[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let j=w;if(w===n.RED&&(B===n.FLOAT&&(j=n.R32F),B===n.HALF_FLOAT&&(j=n.R16F),B===n.UNSIGNED_BYTE&&(j=n.R8)),w===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.R8UI),B===n.UNSIGNED_SHORT&&(j=n.R16UI),B===n.UNSIGNED_INT&&(j=n.R32UI),B===n.BYTE&&(j=n.R8I),B===n.SHORT&&(j=n.R16I),B===n.INT&&(j=n.R32I)),w===n.RG&&(B===n.FLOAT&&(j=n.RG32F),B===n.HALF_FLOAT&&(j=n.RG16F),B===n.UNSIGNED_BYTE&&(j=n.RG8)),w===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RG8UI),B===n.UNSIGNED_SHORT&&(j=n.RG16UI),B===n.UNSIGNED_INT&&(j=n.RG32UI),B===n.BYTE&&(j=n.RG8I),B===n.SHORT&&(j=n.RG16I),B===n.INT&&(j=n.RG32I)),w===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGB8UI),B===n.UNSIGNED_SHORT&&(j=n.RGB16UI),B===n.UNSIGNED_INT&&(j=n.RGB32UI),B===n.BYTE&&(j=n.RGB8I),B===n.SHORT&&(j=n.RGB16I),B===n.INT&&(j=n.RGB32I)),w===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(j=n.RGBA16UI),B===n.UNSIGNED_INT&&(j=n.RGBA32UI),B===n.BYTE&&(j=n.RGBA8I),B===n.SHORT&&(j=n.RGBA16I),B===n.INT&&(j=n.RGBA32I)),w===n.RGB&&B===n.UNSIGNED_INT_5_9_9_9_REV&&(j=n.RGB9_E5),w===n.RGBA){let Me=J?Ku:it.getTransfer($);B===n.FLOAT&&(j=n.RGBA32F),B===n.HALF_FLOAT&&(j=n.RGBA16F),B===n.UNSIGNED_BYTE&&(j=Me===xt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT_4_4_4_4&&(j=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(j=n.RGB5_A1)}return(j===n.R16F||j===n.R32F||j===n.RG16F||j===n.RG32F||j===n.RGBA16F||j===n.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function y(C,w){let B;return C?w===null||w===Us||w===ta?B=n.DEPTH24_STENCIL8:w===Oi?B=n.DEPTH32F_STENCIL8:w===El&&(B=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Us||w===ta?B=n.DEPTH_COMPONENT24:w===Oi?B=n.DEPTH_COMPONENT32F:w===El&&(B=n.DEPTH_COMPONENT16),B}function M(C,w){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==un&&C.minFilter!==Ei?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function R(C){let w=C.target;w.removeEventListener("dispose",R),b(w),w.isVideoTexture&&u.delete(w)}function T(C){let w=C.target;w.removeEventListener("dispose",T),L(w)}function b(C){let w=i.get(C);if(w.__webglInit===void 0)return;let B=C.source,$=f.get(B);if($){let J=$[w.__cacheKey];J.usedTimes--,J.usedTimes===0&&A(C),Object.keys($).length===0&&f.delete(B)}i.remove(C)}function A(C){let w=i.get(C);n.deleteTexture(w.__webglTexture);let B=C.source,$=f.get(B);delete $[w.__cacheKey],o.memory.textures--}function L(C){let w=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(w.__webglFramebuffer[$]))for(let J=0;J<w.__webglFramebuffer[$].length;J++)n.deleteFramebuffer(w.__webglFramebuffer[$][J]);else n.deleteFramebuffer(w.__webglFramebuffer[$]);w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer[$])}else{if(Array.isArray(w.__webglFramebuffer))for(let $=0;$<w.__webglFramebuffer.length;$++)n.deleteFramebuffer(w.__webglFramebuffer[$]);else n.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&n.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let $=0;$<w.__webglColorRenderbuffer.length;$++)w.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(w.__webglColorRenderbuffer[$]);w.__webglDepthRenderbuffer&&n.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let B=C.textures;for(let $=0,J=B.length;$<J;$++){let j=i.get(B[$]);j.__webglTexture&&(n.deleteTexture(j.__webglTexture),o.memory.textures--),i.remove(B[$])}i.remove(C)}let _=0;function S(){_=0}function U(){let C=_;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),_+=1,C}function z(C){let w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function H(C,w){let B=i.get(C);if(C.isVideoTexture&&Le(C),C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){let $=C.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{He(B,C,w);return}}t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+w)}function Y(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){He(B,C,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+w)}function O(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){He(B,C,w);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+w)}function G(C,w){let B=i.get(C);if(C.version>0&&B.__version!==C.version){q(B,C,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+w)}let F={[Ds]:n.REPEAT,[ks]:n.CLAMP_TO_EDGE,[hm]:n.MIRRORED_REPEAT},ee={[un]:n.NEAREST,[bb]:n.NEAREST_MIPMAP_NEAREST,[mu]:n.NEAREST_MIPMAP_LINEAR,[Ei]:n.LINEAR,[vp]:n.LINEAR_MIPMAP_NEAREST,[Ns]:n.LINEAR_MIPMAP_LINEAR},ne={[Rb]:n.NEVER,[Nb]:n.ALWAYS,[Cb]:n.LESS,[A1]:n.LEQUAL,[Pb]:n.EQUAL,[kb]:n.GEQUAL,[Ib]:n.GREATER,[Lb]:n.NOTEQUAL};function re(C,w){if(w.type===Oi&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Ei||w.magFilter===vp||w.magFilter===mu||w.magFilter===Ns||w.minFilter===Ei||w.minFilter===vp||w.minFilter===mu||w.minFilter===Ns)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,F[w.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,F[w.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,F[w.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,ee[w.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,ee[w.minFilter]),w.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,ne[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===un||w.minFilter!==mu&&w.minFilter!==Ns||w.type===Oi&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function Ee(C,w){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",R));let $=w.source,J=f.get($);J===void 0&&(J={},f.set($,J));let j=z(w);if(j!==C.__cacheKey){J[j]===void 0&&(J[j]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,B=!0),J[j].usedTimes++;let Me=J[C.__cacheKey];Me!==void 0&&(J[C.__cacheKey].usedTimes--,Me.usedTimes===0&&A(w)),C.__cacheKey=j,C.__webglTexture=J[j].texture}return B}function He(C,w,B){let $=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&($=n.TEXTURE_3D);let J=Ee(C,w),j=w.source;t.bindTexture($,C.__webglTexture,n.TEXTURE0+B);let Me=i.get(j);if(j.version!==Me.__version||J===!0){t.activeTexture(n.TEXTURE0+B);let ae=it.getPrimaries(it.workingColorSpace),ge=w.colorSpace===Zr?null:it.getPrimaries(w.colorSpace),Je=w.colorSpace===Zr||ae===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Je);let te=x(w.image,!1,r.maxTextureSize);te=pt(w,te);let ye=s.convert(w.format,w.colorSpace),ke=s.convert(w.type),Ne=v(w.internalFormat,ye,ke,w.colorSpace,w.isVideoTexture);re($,w);let ve,je=w.mipmaps,Ue=w.isVideoTexture!==!0,ut=Me.__version===void 0||J===!0,k=j.dataReady,fe=M(w,te);if(w.isDepthTexture)Ne=y(w.format===na,w.type),ut&&(Ue?t.texStorage2D(n.TEXTURE_2D,1,Ne,te.width,te.height):t.texImage2D(n.TEXTURE_2D,0,Ne,te.width,te.height,0,ye,ke,null));else if(w.isDataTexture)if(je.length>0){Ue&&ut&&t.texStorage2D(n.TEXTURE_2D,fe,Ne,je[0].width,je[0].height);for(let X=0,Z=je.length;X<Z;X++)ve=je[X],Ue?k&&t.texSubImage2D(n.TEXTURE_2D,X,0,0,ve.width,ve.height,ye,ke,ve.data):t.texImage2D(n.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ye,ke,ve.data);w.generateMipmaps=!1}else Ue?(ut&&t.texStorage2D(n.TEXTURE_2D,fe,Ne,te.width,te.height),k&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,te.width,te.height,ye,ke,te.data)):t.texImage2D(n.TEXTURE_2D,0,Ne,te.width,te.height,0,ye,ke,te.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ue&&ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,Ne,je[0].width,je[0].height,te.depth);for(let X=0,Z=je.length;X<Z;X++)if(ve=je[X],w.format!==Ti)if(ye!==null)if(Ue){if(k)if(w.layerUpdates.size>0){let ce=n1(ve.width,ve.height,w.format,w.type);for(let de of w.layerUpdates){let $e=ve.data.subarray(de*ce/ve.data.BYTES_PER_ELEMENT,(de+1)*ce/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,X,0,0,de,ve.width,ve.height,1,ye,$e,0,0)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,X,0,0,0,ve.width,ve.height,te.depth,ye,ve.data,0,0)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,X,Ne,ve.width,ve.height,te.depth,0,ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?k&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,X,0,0,0,ve.width,ve.height,te.depth,ye,ke,ve.data):t.texImage3D(n.TEXTURE_2D_ARRAY,X,Ne,ve.width,ve.height,te.depth,0,ye,ke,ve.data)}else{Ue&&ut&&t.texStorage2D(n.TEXTURE_2D,fe,Ne,je[0].width,je[0].height);for(let X=0,Z=je.length;X<Z;X++)ve=je[X],w.format!==Ti?ye!==null?Ue?k&&t.compressedTexSubImage2D(n.TEXTURE_2D,X,0,0,ve.width,ve.height,ye,ve.data):t.compressedTexImage2D(n.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?k&&t.texSubImage2D(n.TEXTURE_2D,X,0,0,ve.width,ve.height,ye,ke,ve.data):t.texImage2D(n.TEXTURE_2D,X,Ne,ve.width,ve.height,0,ye,ke,ve.data)}else if(w.isDataArrayTexture)if(Ue){if(ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,Ne,te.width,te.height,te.depth),k)if(w.layerUpdates.size>0){let X=n1(te.width,te.height,w.format,w.type);for(let Z of w.layerUpdates){let ce=te.data.subarray(Z*X/te.data.BYTES_PER_ELEMENT,(Z+1)*X/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Z,te.width,te.height,1,ye,ke,ce)}w.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,ye,ke,te.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ne,te.width,te.height,te.depth,0,ye,ke,te.data);else if(w.isData3DTexture)Ue?(ut&&t.texStorage3D(n.TEXTURE_3D,fe,Ne,te.width,te.height,te.depth),k&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,ye,ke,te.data)):t.texImage3D(n.TEXTURE_3D,0,Ne,te.width,te.height,te.depth,0,ye,ke,te.data);else if(w.isFramebufferTexture){if(ut)if(Ue)t.texStorage2D(n.TEXTURE_2D,fe,Ne,te.width,te.height);else{let X=te.width,Z=te.height;for(let ce=0;ce<fe;ce++)t.texImage2D(n.TEXTURE_2D,ce,Ne,X,Z,0,ye,ke,null),X>>=1,Z>>=1}}else if(je.length>0){if(Ue&&ut){let X=De(je[0]);t.texStorage2D(n.TEXTURE_2D,fe,Ne,X.width,X.height)}for(let X=0,Z=je.length;X<Z;X++)ve=je[X],Ue?k&&t.texSubImage2D(n.TEXTURE_2D,X,0,0,ye,ke,ve):t.texImage2D(n.TEXTURE_2D,X,Ne,ye,ke,ve);w.generateMipmaps=!1}else if(Ue){if(ut){let X=De(te);t.texStorage2D(n.TEXTURE_2D,fe,Ne,X.width,X.height)}k&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ye,ke,te)}else t.texImage2D(n.TEXTURE_2D,0,Ne,ye,ke,te);g(w)&&d($),Me.__version=j.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function q(C,w,B){if(w.image.length!==6)return;let $=Ee(C,w),J=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+B);let j=i.get(J);if(J.version!==j.__version||$===!0){t.activeTexture(n.TEXTURE0+B);let Me=it.getPrimaries(it.workingColorSpace),ae=w.colorSpace===Zr?null:it.getPrimaries(w.colorSpace),ge=w.colorSpace===Zr||Me===ae?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge);let Je=w.isCompressedTexture||w.image[0].isCompressedTexture,te=w.image[0]&&w.image[0].isDataTexture,ye=[];for(let Z=0;Z<6;Z++)!Je&&!te?ye[Z]=x(w.image[Z],!0,r.maxCubemapSize):ye[Z]=te?w.image[Z].image:w.image[Z],ye[Z]=pt(w,ye[Z]);let ke=ye[0],Ne=s.convert(w.format,w.colorSpace),ve=s.convert(w.type),je=v(w.internalFormat,Ne,ve,w.colorSpace),Ue=w.isVideoTexture!==!0,ut=j.__version===void 0||$===!0,k=J.dataReady,fe=M(w,ke);re(n.TEXTURE_CUBE_MAP,w);let X;if(Je){Ue&&ut&&t.texStorage2D(n.TEXTURE_CUBE_MAP,fe,je,ke.width,ke.height);for(let Z=0;Z<6;Z++){X=ye[Z].mipmaps;for(let ce=0;ce<X.length;ce++){let de=X[ce];w.format!==Ti?Ne!==null?Ue?k&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce,0,0,de.width,de.height,Ne,de.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce,je,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce,0,0,de.width,de.height,Ne,ve,de.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce,je,de.width,de.height,0,Ne,ve,de.data)}}}else{if(X=w.mipmaps,Ue&&ut){X.length>0&&fe++;let Z=De(ye[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,fe,je,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(te){Ue?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,ye[Z].width,ye[Z].height,Ne,ve,ye[Z].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,je,ye[Z].width,ye[Z].height,0,Ne,ve,ye[Z].data);for(let ce=0;ce<X.length;ce++){let $e=X[ce].image[Z].image;Ue?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce+1,0,0,$e.width,$e.height,Ne,ve,$e.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce+1,je,$e.width,$e.height,0,Ne,ve,$e.data)}}else{Ue?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ne,ve,ye[Z]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,je,Ne,ve,ye[Z]);for(let ce=0;ce<X.length;ce++){let de=X[ce];Ue?k&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce+1,0,0,Ne,ve,de.image[Z]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ce+1,je,Ne,ve,de.image[Z])}}}g(w)&&d(n.TEXTURE_CUBE_MAP),j.__version=J.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function K(C,w,B,$,J,j){let Me=s.convert(B.format,B.colorSpace),ae=s.convert(B.type),ge=v(B.internalFormat,Me,ae,B.colorSpace);if(!i.get(w).__hasExternalTextures){let te=Math.max(1,w.width>>j),ye=Math.max(1,w.height>>j);J===n.TEXTURE_3D||J===n.TEXTURE_2D_ARRAY?t.texImage3D(J,j,ge,te,ye,w.depth,0,Me,ae,null):t.texImage2D(J,j,ge,te,ye,0,Me,ae,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),Ke(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,J,i.get(B).__webglTexture,0,qe(w)):(J===n.TEXTURE_2D||J>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,J,i.get(B).__webglTexture,j),t.bindFramebuffer(n.FRAMEBUFFER,null)}function pe(C,w,B){if(n.bindRenderbuffer(n.RENDERBUFFER,C),w.depthBuffer){let $=w.depthTexture,J=$&&$.isDepthTexture?$.type:null,j=y(w.stencilBuffer,J),Me=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ae=qe(w);Ke(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ae,j,w.width,w.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,ae,j,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,j,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Me,n.RENDERBUFFER,C)}else{let $=w.textures;for(let J=0;J<$.length;J++){let j=$[J],Me=s.convert(j.format,j.colorSpace),ae=s.convert(j.type),ge=v(j.internalFormat,Me,ae,j.colorSpace),Je=qe(w);B&&Ke(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Je,ge,w.width,w.height):Ke(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Je,ge,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,ge,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function le(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),H(w.depthTexture,0);let $=i.get(w.depthTexture).__webglTexture,J=qe(w);if(w.depthTexture.format===$o)Ke(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0,J):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0);else if(w.depthTexture.format===na)Ke(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0,J):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function Ce(C){let w=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){let $=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),$){let J=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,$.removeEventListener("dispose",J)};$.addEventListener("dispose",J),w.__depthDisposeCallback=J}w.__boundDepthTexture=$}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");le(w.__webglFramebuffer,C)}else if(B){w.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[$]),w.__webglDepthbuffer[$]===void 0)w.__webglDepthbuffer[$]=n.createRenderbuffer(),pe(w.__webglDepthbuffer[$],C,!1);else{let J=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=w.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,j)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=n.createRenderbuffer(),pe(w.__webglDepthbuffer,C,!1);else{let $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,J=w.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,J),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,J)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function be(C,w,B){let $=i.get(C);w!==void 0&&K($.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&Ce(C)}function ze(C){let w=C.texture,B=i.get(C),$=i.get(w);C.addEventListener("dispose",T);let J=C.textures,j=C.isWebGLCubeRenderTarget===!0,Me=J.length>1;if(Me||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=w.version,o.memory.textures++),j){B.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer[ae]=[];for(let ge=0;ge<w.mipmaps.length;ge++)B.__webglFramebuffer[ae][ge]=n.createFramebuffer()}else B.__webglFramebuffer[ae]=n.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){B.__webglFramebuffer=[];for(let ae=0;ae<w.mipmaps.length;ae++)B.__webglFramebuffer[ae]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(Me)for(let ae=0,ge=J.length;ae<ge;ae++){let Je=i.get(J[ae]);Je.__webglTexture===void 0&&(Je.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&Ke(C)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ae=0;ae<J.length;ae++){let ge=J[ae];B.__webglColorRenderbuffer[ae]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[ae]);let Je=s.convert(ge.format,ge.colorSpace),te=s.convert(ge.type),ye=v(ge.internalFormat,Je,te,ge.colorSpace,C.isXRRenderTarget===!0),ke=qe(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,ke,ye,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,B.__webglColorRenderbuffer[ae])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),pe(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(j){t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),re(n.TEXTURE_CUBE_MAP,w);for(let ae=0;ae<6;ae++)if(w.mipmaps&&w.mipmaps.length>0)for(let ge=0;ge<w.mipmaps.length;ge++)K(B.__webglFramebuffer[ae][ge],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ge);else K(B.__webglFramebuffer[ae],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);g(w)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Me){for(let ae=0,ge=J.length;ae<ge;ae++){let Je=J[ae],te=i.get(Je);t.bindTexture(n.TEXTURE_2D,te.__webglTexture),re(n.TEXTURE_2D,Je),K(B.__webglFramebuffer,C,Je,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,0),g(Je)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let ae=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ae=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ae,$.__webglTexture),re(ae,w),w.mipmaps&&w.mipmaps.length>0)for(let ge=0;ge<w.mipmaps.length;ge++)K(B.__webglFramebuffer[ge],C,w,n.COLOR_ATTACHMENT0,ae,ge);else K(B.__webglFramebuffer,C,w,n.COLOR_ATTACHMENT0,ae,0);g(w)&&d(ae),t.unbindTexture()}C.depthBuffer&&Ce(C)}function Qe(C){let w=C.textures;for(let B=0,$=w.length;B<$;B++){let J=w[B];if(g(J)){let j=C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,Me=i.get(J).__webglTexture;t.bindTexture(j,Me),d(j),t.unbindTexture()}}}let Xe=[],I=[];function dn(C){if(C.samples>0){if(Ke(C)===!1){let w=C.textures,B=C.width,$=C.height,J=n.COLOR_BUFFER_BIT,j=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Me=i.get(C),ae=w.length>1;if(ae)for(let ge=0;ge<w.length;ge++)t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ge=0;ge<w.length;ge++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=n.STENCIL_BUFFER_BIT)),ae){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Me.__webglColorRenderbuffer[ge]);let Je=i.get(w[ge]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Je,0)}n.blitFramebuffer(0,0,B,$,0,0,B,$,J,n.NEAREST),l===!0&&(Xe.length=0,I.length=0,Xe.push(n.COLOR_ATTACHMENT0+ge),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Xe.push(j),I.push(j),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,I)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Xe))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ae)for(let ge=0;ge<w.length;ge++){t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,Me.__webglColorRenderbuffer[ge]);let Je=i.get(w[ge]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,Je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let w=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[w])}}}function qe(C){return Math.min(r.maxSamples,C.samples)}function Ke(C){let w=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Le(C){let w=o.render.frame;u.get(C)!==w&&(u.set(C,w),C.update())}function pt(C,w){let B=C.colorSpace,$=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==rs&&B!==Zr&&(it.getTransfer(B)===xt?($!==Ti||J!==mr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),w}function De(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=S,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=O,this.setTextureCube=G,this.rebindTextures=be,this.setupRenderTarget=ze,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=dn,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=K,this.useMultisampledRTT=Ke}function AR(n,e){function t(i,r=Zr){let s,o=it.getTransfer(r);if(i===mr)return n.UNSIGNED_BYTE;if(i===C0)return n.UNSIGNED_SHORT_4_4_4_4;if(i===P0)return n.UNSIGNED_SHORT_5_5_5_1;if(i===x1)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===y1)return n.BYTE;if(i===v1)return n.SHORT;if(i===El)return n.UNSIGNED_SHORT;if(i===R0)return n.INT;if(i===Us)return n.UNSIGNED_INT;if(i===Oi)return n.FLOAT;if(i===zl)return n.HALF_FLOAT;if(i===_1)return n.ALPHA;if(i===M1)return n.RGB;if(i===Ti)return n.RGBA;if(i===S1)return n.LUMINANCE;if(i===w1)return n.LUMINANCE_ALPHA;if(i===$o)return n.DEPTH_COMPONENT;if(i===na)return n.DEPTH_STENCIL;if(i===I0)return n.RED;if(i===L0)return n.RED_INTEGER;if(i===b1)return n.RG;if(i===k0)return n.RG_INTEGER;if(i===N0)return n.RGBA_INTEGER;if(i===Wu||i===Xu||i===Yu||i===qu)if(o===xt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Wu)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Xu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Yu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===qu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Wu)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Xu)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Yu)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===qu)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===fm||i===dm||i===pm||i===mm)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===fm)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===dm)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===pm)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===mm)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===gm||i===ym||i===vm)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===gm||i===ym)return o===xt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===vm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===xm||i===_m||i===Mm||i===Sm||i===wm||i===bm||i===Em||i===Tm||i===Am||i===Rm||i===Cm||i===Pm||i===Im||i===Lm)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===xm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===_m)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Mm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Sm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===wm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===bm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Em)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Tm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Am)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Rm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Cm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Pm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Im)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Lm)return o===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ju||i===km||i===Nm)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===ju)return o===xt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===km)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Nm)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===E1||i===Dm||i===Um||i===zm)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===ju)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Dm)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Um)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===zm)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ta?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var t0=class extends Sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},$n=class extends wn{constructor(){super(),this.isGroup=!0,this.type="Group"}},RR={type:"move"},Ml=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $n,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $n,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $n,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let g=t.getJointPose(x,i),d=this._getHandJoint(c,x);g!==null&&(d.matrix.fromArray(g.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=g.radius),d.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),p=.02,m=.005;c.inputState.pinching&&f>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(RR)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new $n;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},CR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,PR=`
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

}`,n0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){let r=new kn,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Vi({vertexShader:CR,fragmentShader:PR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ae(new vr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},i0=class extends ts{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,p=null,m=null,x=new n0,g=t.getContextAttributes(),d=null,v=null,y=[],M=[],R=new he,T=null,b=new Sn;b.layers.enable(1),b.viewport=new It;let A=new Sn;A.layers.enable(2),A.viewport=new It;let L=[b,A],_=new t0;_.layers.enable(1),_.layers.enable(2);let S=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let K=y[q];return K===void 0&&(K=new Ml,y[q]=K),K.getTargetRaySpace()},this.getControllerGrip=function(q){let K=y[q];return K===void 0&&(K=new Ml,y[q]=K),K.getGripSpace()},this.getHand=function(q){let K=y[q];return K===void 0&&(K=new Ml,y[q]=K),K.getHandSpace()};function z(q){let K=M.indexOf(q.inputSource);if(K===-1)return;let pe=y[K];pe!==void 0&&(pe.update(q.inputSource,q.frame,c||o),pe.dispatchEvent({type:q.type,data:q.inputSource}))}function H(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",H),r.removeEventListener("inputsourceschange",Y);for(let q=0;q<y.length;q++){let K=M[q];K!==null&&(M[q]=null,y[q].disconnect(K))}S=null,U=null,x.reset(),e.setRenderTarget(d),p=null,f=null,h=null,r=null,v=null,He.stop(),i.isPresenting=!1,e.setPixelRatio(T),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",H),r.addEventListener("inputsourceschange",Y),g.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){let K={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,K),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new gr(p.framebufferWidth,p.framebufferHeight,{format:Ti,type:mr,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let K=null,pe=null,le=null;g.depth&&(le=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,K=g.stencil?na:$o,pe=g.stencil?ta:Us);let Ce={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:s};h=new XRWebGLBinding(r,t),f=h.createProjectionLayer(Ce),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new gr(f.textureWidth,f.textureHeight,{format:Ti,type:mr,depthTexture:new uh(f.textureWidth,f.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,K),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),He.setContext(r),He.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function Y(q){for(let K=0;K<q.removed.length;K++){let pe=q.removed[K],le=M.indexOf(pe);le>=0&&(M[le]=null,y[le].disconnect(pe))}for(let K=0;K<q.added.length;K++){let pe=q.added[K],le=M.indexOf(pe);if(le===-1){for(let be=0;be<y.length;be++)if(be>=M.length){M.push(pe),le=be;break}else if(M[be]===null){M[be]=pe,le=be;break}if(le===-1)break}let Ce=y[le];Ce&&Ce.connect(pe)}}let O=new P,G=new P;function F(q,K,pe){O.setFromMatrixPosition(K.matrixWorld),G.setFromMatrixPosition(pe.matrixWorld);let le=O.distanceTo(G),Ce=K.projectionMatrix.elements,be=pe.projectionMatrix.elements,ze=Ce[14]/(Ce[10]-1),Qe=Ce[14]/(Ce[10]+1),Xe=(Ce[9]+1)/Ce[5],I=(Ce[9]-1)/Ce[5],dn=(Ce[8]-1)/Ce[0],qe=(be[8]+1)/be[0],Ke=ze*dn,Le=ze*qe,pt=le/(-dn+qe),De=pt*-dn;if(K.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(De),q.translateZ(pt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Ce[10]===-1)q.projectionMatrix.copy(K.projectionMatrix),q.projectionMatrixInverse.copy(K.projectionMatrixInverse);else{let C=ze+pt,w=Qe+pt,B=Ke-De,$=Le+(le-De),J=Xe*Qe/w*C,j=I*Qe/w*C;q.projectionMatrix.makePerspective(B,$,J,j,C,w),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function ee(q,K){K===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(K.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let K=q.near,pe=q.far;x.texture!==null&&(x.depthNear>0&&(K=x.depthNear),x.depthFar>0&&(pe=x.depthFar)),_.near=A.near=b.near=K,_.far=A.far=b.far=pe,(S!==_.near||U!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),S=_.near,U=_.far);let le=q.parent,Ce=_.cameras;ee(_,le);for(let be=0;be<Ce.length;be++)ee(Ce[be],le);Ce.length===2?F(_,b,A):_.projectionMatrix.copy(b.projectionMatrix),ne(q,_,le)};function ne(q,K,pe){pe===null?q.matrix.copy(K.matrixWorld):(q.matrix.copy(pe.matrixWorld),q.matrix.invert(),q.matrix.multiply(K.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(K.projectionMatrix),q.projectionMatrixInverse.copy(K.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Bm*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(q){l=q,f!==null&&(f.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(_)};let re=null;function Ee(q,K){if(u=K.getViewerPose(c||o),m=K,u!==null){let pe=u.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let le=!1;pe.length!==_.cameras.length&&(_.cameras.length=0,le=!0);for(let be=0;be<pe.length;be++){let ze=pe[be],Qe=null;if(p!==null)Qe=p.getViewport(ze);else{let I=h.getViewSubImage(f,ze);Qe=I.viewport,be===0&&(e.setRenderTargetTextures(v,I.colorTexture,f.ignoreDepthValues?void 0:I.depthStencilTexture),e.setRenderTarget(v))}let Xe=L[be];Xe===void 0&&(Xe=new Sn,Xe.layers.enable(be),Xe.viewport=new It,L[be]=Xe),Xe.matrix.fromArray(ze.transform.matrix),Xe.matrix.decompose(Xe.position,Xe.quaternion,Xe.scale),Xe.projectionMatrix.fromArray(ze.projectionMatrix),Xe.projectionMatrixInverse.copy(Xe.projectionMatrix).invert(),Xe.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),be===0&&(_.matrix.copy(Xe.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),le===!0&&_.cameras.push(Xe)}let Ce=r.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){let be=h.getDepthInformation(pe[0]);be&&be.isValid&&be.texture&&x.init(e,be,r.renderState)}}for(let pe=0;pe<y.length;pe++){let le=M[pe],Ce=y[pe];le!==null&&Ce!==void 0&&Ce.update(le,K,c||o)}re&&re(q,K),K.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:K}),m=null}let He=new I1;He.setAnimationLoop(Ee),this.setAnimationLoop=function(q){re=q},this.dispose=function(){}}},Cs=new Bi,IR=new ot;function LR(n,e){function t(g,d){g.matrixAutoUpdate===!0&&g.updateMatrix(),d.value.copy(g.matrix)}function i(g,d){d.color.getRGB(g.fogColor.value,P1(n)),d.isFog?(g.fogNear.value=d.near,g.fogFar.value=d.far):d.isFogExp2&&(g.fogDensity.value=d.density)}function r(g,d,v,y,M){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(g,d):d.isMeshToonMaterial?(s(g,d),h(g,d)):d.isMeshPhongMaterial?(s(g,d),u(g,d)):d.isMeshStandardMaterial?(s(g,d),f(g,d),d.isMeshPhysicalMaterial&&p(g,d,M)):d.isMeshMatcapMaterial?(s(g,d),m(g,d)):d.isMeshDepthMaterial?s(g,d):d.isMeshDistanceMaterial?(s(g,d),x(g,d)):d.isMeshNormalMaterial?s(g,d):d.isLineBasicMaterial?(o(g,d),d.isLineDashedMaterial&&a(g,d)):d.isPointsMaterial?l(g,d,v,y):d.isSpriteMaterial?c(g,d):d.isShadowMaterial?(g.color.value.copy(d.color),g.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(g,d){g.opacity.value=d.opacity,d.color&&g.diffuse.value.copy(d.color),d.emissive&&g.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.bumpMap&&(g.bumpMap.value=d.bumpMap,t(d.bumpMap,g.bumpMapTransform),g.bumpScale.value=d.bumpScale,d.side===Kt&&(g.bumpScale.value*=-1)),d.normalMap&&(g.normalMap.value=d.normalMap,t(d.normalMap,g.normalMapTransform),g.normalScale.value.copy(d.normalScale),d.side===Kt&&g.normalScale.value.negate()),d.displacementMap&&(g.displacementMap.value=d.displacementMap,t(d.displacementMap,g.displacementMapTransform),g.displacementScale.value=d.displacementScale,g.displacementBias.value=d.displacementBias),d.emissiveMap&&(g.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,g.emissiveMapTransform)),d.specularMap&&(g.specularMap.value=d.specularMap,t(d.specularMap,g.specularMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest);let v=e.get(d),y=v.envMap,M=v.envMapRotation;y&&(g.envMap.value=y,Cs.copy(M),Cs.x*=-1,Cs.y*=-1,Cs.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Cs.y*=-1,Cs.z*=-1),g.envMapRotation.value.setFromMatrix4(IR.makeRotationFromEuler(Cs)),g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=d.reflectivity,g.ior.value=d.ior,g.refractionRatio.value=d.refractionRatio),d.lightMap&&(g.lightMap.value=d.lightMap,g.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,g.lightMapTransform)),d.aoMap&&(g.aoMap.value=d.aoMap,g.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,g.aoMapTransform))}function o(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform))}function a(g,d){g.dashSize.value=d.dashSize,g.totalSize.value=d.dashSize+d.gapSize,g.scale.value=d.scale}function l(g,d,v,y){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.size.value=d.size*v,g.scale.value=y*.5,d.map&&(g.map.value=d.map,t(d.map,g.uvTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function c(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.rotation.value=d.rotation,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function u(g,d){g.specular.value.copy(d.specular),g.shininess.value=Math.max(d.shininess,1e-4)}function h(g,d){d.gradientMap&&(g.gradientMap.value=d.gradientMap)}function f(g,d){g.metalness.value=d.metalness,d.metalnessMap&&(g.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,g.metalnessMapTransform)),g.roughness.value=d.roughness,d.roughnessMap&&(g.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,g.roughnessMapTransform)),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)}function p(g,d,v){g.ior.value=d.ior,d.sheen>0&&(g.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),g.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(g.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,g.sheenColorMapTransform)),d.sheenRoughnessMap&&(g.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,g.sheenRoughnessMapTransform))),d.clearcoat>0&&(g.clearcoat.value=d.clearcoat,g.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(g.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,g.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(g.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Kt&&g.clearcoatNormalScale.value.negate())),d.dispersion>0&&(g.dispersion.value=d.dispersion),d.iridescence>0&&(g.iridescence.value=d.iridescence,g.iridescenceIOR.value=d.iridescenceIOR,g.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(g.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,g.iridescenceMapTransform)),d.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),d.transmission>0&&(g.transmission.value=d.transmission,g.transmissionSamplerMap.value=v.texture,g.transmissionSamplerSize.value.set(v.width,v.height),d.transmissionMap&&(g.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,g.transmissionMapTransform)),g.thickness.value=d.thickness,d.thicknessMap&&(g.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=d.attenuationDistance,g.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(g.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(g.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=d.specularIntensity,g.specularColor.value.copy(d.specularColor),d.specularColorMap&&(g.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,g.specularColorMapTransform)),d.specularIntensityMap&&(g.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,d){d.matcap&&(g.matcap.value=d.matcap)}function x(g,d){let v=e.get(d).light;g.referencePosition.value.setFromMatrixPosition(v.matrixWorld),g.nearDistance.value=v.shadow.camera.near,g.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function kR(n,e,t,i){let r={},s={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,y){let M=y.program;i.uniformBlockBinding(v,M)}function c(v,y){let M=r[v.id];M===void 0&&(m(v),M=u(v),r[v.id]=M,v.addEventListener("dispose",g));let R=y.program;i.updateUBOMapping(v,R);let T=e.render.frame;s[v.id]!==T&&(f(v),s[v.id]=T)}function u(v){let y=h();v.__bindingPointIndex=y;let M=n.createBuffer(),R=v.__size,T=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,R,T),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,M),M}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(v){let y=r[v.id],M=v.uniforms,R=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let T=0,b=M.length;T<b;T++){let A=Array.isArray(M[T])?M[T]:[M[T]];for(let L=0,_=A.length;L<_;L++){let S=A[L];if(p(S,T,L,R)===!0){let U=S.__offset,z=Array.isArray(S.value)?S.value:[S.value],H=0;for(let Y=0;Y<z.length;Y++){let O=z[Y],G=x(O);typeof O=="number"||typeof O=="boolean"?(S.__data[0]=O,n.bufferSubData(n.UNIFORM_BUFFER,U+H,S.__data)):O.isMatrix3?(S.__data[0]=O.elements[0],S.__data[1]=O.elements[1],S.__data[2]=O.elements[2],S.__data[3]=0,S.__data[4]=O.elements[3],S.__data[5]=O.elements[4],S.__data[6]=O.elements[5],S.__data[7]=0,S.__data[8]=O.elements[6],S.__data[9]=O.elements[7],S.__data[10]=O.elements[8],S.__data[11]=0):(O.toArray(S.__data,H),H+=G.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,U,S.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(v,y,M,R){let T=v.value,b=y+"_"+M;if(R[b]===void 0)return typeof T=="number"||typeof T=="boolean"?R[b]=T:R[b]=T.clone(),!0;{let A=R[b];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return R[b]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function m(v){let y=v.uniforms,M=0,R=16;for(let b=0,A=y.length;b<A;b++){let L=Array.isArray(y[b])?y[b]:[y[b]];for(let _=0,S=L.length;_<S;_++){let U=L[_],z=Array.isArray(U.value)?U.value:[U.value];for(let H=0,Y=z.length;H<Y;H++){let O=z[H],G=x(O),F=M%R,ee=F%G.boundary,ne=F+ee;M+=ee,ne!==0&&R-ne<G.storage&&(M+=R-ne),U.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=M,M+=G.storage}}}let T=M%R;return T>0&&(M+=R-T),v.__size=M,v.__cache={},this}function x(v){let y={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(y.boundary=4,y.storage=4):v.isVector2?(y.boundary=8,y.storage=8):v.isVector3||v.isColor?(y.boundary=16,y.storage=12):v.isVector4?(y.boundary=16,y.storage=16):v.isMatrix3?(y.boundary=48,y.storage=48):v.isMatrix4?(y.boundary=64,y.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),y}function g(v){let y=v.target;y.removeEventListener("dispose",g);let M=o.indexOf(y.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(r[y.id]),delete r[y.id],delete s[y.id]}function d(){for(let v in r)n.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:d}}var hh=class{constructor(e={}){let{canvas:t=Ub(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;let p=new Uint32Array(4),m=new Int32Array(4),x=null,g=null,d=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=qn,this.toneMapping=Qr,this.toneMappingExposure=1;let y=this,M=!1,R=0,T=0,b=null,A=-1,L=null,_=new It,S=new It,U=null,z=new Ie(0),H=0,Y=t.width,O=t.height,G=1,F=null,ee=null,ne=new It(0,0,Y,O),re=new It(0,0,Y,O),Ee=!1,He=new Tl,q=!1,K=!1,pe=new ot,le=new ot,Ce=new P,be=new It,ze={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Qe=!1;function Xe(){return b===null?G:1}let I=i;function dn(E,N){return t.getContext(E,N)}try{let E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r169"),t.addEventListener("webglcontextlost",Z,!1),t.addEventListener("webglcontextrestored",ce,!1),t.addEventListener("webglcontextcreationerror",de,!1),I===null){let N="webgl2";if(I=dn(N,E),I===null)throw dn(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let qe,Ke,Le,pt,De,C,w,B,$,J,j,Me,ae,ge,Je,te,ye,ke,Ne,ve,je,Ue,ut,k;function fe(){qe=new $2(I),qe.init(),Ue=new AR(I,qe),Ke=new G2(I,qe,e,Ue),Le=new bR(I),Ke.reverseDepthBuffer&&Le.buffers.depth.setReversed(!0),pt=new J2(I),De=new hR,C=new TR(I,qe,Le,De,Ke,Ue,pt),w=new X2(y),B=new j2(y),$=new sE(I),ut=new H2(I,$),J=new Z2(I,$,pt,ut),j=new eA(I,J,$,pt),Ne=new Q2(I,Ke,C),te=new W2(De),Me=new uR(y,w,B,qe,Ke,ut,te),ae=new LR(y,De),ge=new dR,Je=new xR(qe),ke=new B2(y,w,B,Le,j,f,l),ye=new SR(y,j,Ke),k=new kR(I,pt,Ke,Le),ve=new V2(I,qe,pt),je=new K2(I,qe,pt),pt.programs=Me.programs,y.capabilities=Ke,y.extensions=qe,y.properties=De,y.renderLists=ge,y.shadowMap=ye,y.state=Le,y.info=pt}fe();let X=new i0(y,I);this.xr=X,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let E=qe.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=qe.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(Y,O,!1))},this.getSize=function(E){return E.set(Y,O)},this.setSize=function(E,N,V=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=E,O=N,t.width=Math.floor(E*G),t.height=Math.floor(N*G),V===!0&&(t.style.width=E+"px",t.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(Y*G,O*G).floor()},this.setDrawingBufferSize=function(E,N,V){Y=E,O=N,G=V,t.width=Math.floor(E*V),t.height=Math.floor(N*V),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(_)},this.getViewport=function(E){return E.copy(ne)},this.setViewport=function(E,N,V,W){E.isVector4?ne.set(E.x,E.y,E.z,E.w):ne.set(E,N,V,W),Le.viewport(_.copy(ne).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(re)},this.setScissor=function(E,N,V,W){E.isVector4?re.set(E.x,E.y,E.z,E.w):re.set(E,N,V,W),Le.scissor(S.copy(re).multiplyScalar(G).round())},this.getScissorTest=function(){return Ee},this.setScissorTest=function(E){Le.setScissorTest(Ee=E)},this.setOpaqueSort=function(E){F=E},this.setTransparentSort=function(E){ee=E},this.getClearColor=function(E){return E.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor.apply(ke,arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha.apply(ke,arguments)},this.clear=function(E=!0,N=!0,V=!0){let W=0;if(E){let D=!1;if(b!==null){let ie=b.texture.format;D=ie===N0||ie===k0||ie===L0}if(D){let ie=b.texture.type,ue=ie===mr||ie===Us||ie===El||ie===ta||ie===C0||ie===P0,xe=ke.getClearColor(),_e=ke.getClearAlpha(),Re=xe.r,Pe=xe.g,Se=xe.b;ue?(p[0]=Re,p[1]=Pe,p[2]=Se,p[3]=_e,I.clearBufferuiv(I.COLOR,0,p)):(m[0]=Re,m[1]=Pe,m[2]=Se,m[3]=_e,I.clearBufferiv(I.COLOR,0,m))}else W|=I.COLOR_BUFFER_BIT}N&&(W|=I.DEPTH_BUFFER_BIT,I.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),V&&(W|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Z,!1),t.removeEventListener("webglcontextrestored",ce,!1),t.removeEventListener("webglcontextcreationerror",de,!1),ge.dispose(),Je.dispose(),De.dispose(),w.dispose(),B.dispose(),j.dispose(),ut.dispose(),k.dispose(),Me.dispose(),X.dispose(),X.removeEventListener("sessionstart",Y0),X.removeEventListener("sessionend",q0),ss.stop()};function Z(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function ce(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let E=pt.autoReset,N=ye.enabled,V=ye.autoUpdate,W=ye.needsUpdate,D=ye.type;fe(),pt.autoReset=E,ye.enabled=N,ye.autoUpdate=V,ye.needsUpdate=W,ye.type=D}function de(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function $e(E){let N=E.target;N.removeEventListener("dispose",$e),Dt(N)}function Dt(E){Tn(E),De.remove(E)}function Tn(E){let N=De.get(E).programs;N!==void 0&&(N.forEach(function(V){Me.releaseProgram(V)}),E.isShaderMaterial&&Me.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,V,W,D,ie){N===null&&(N=ze);let ue=D.isMesh&&D.matrixWorld.determinant()<0,xe=iM(E,N,V,W,D);Le.setMaterial(W,ue);let _e=V.index,Re=1;if(W.wireframe===!0){if(_e=J.getWireframeAttribute(V),_e===void 0)return;Re=2}let Pe=V.drawRange,Se=V.attributes.position,rt=Pe.start*Re,mt=(Pe.start+Pe.count)*Re;ie!==null&&(rt=Math.max(rt,ie.start*Re),mt=Math.min(mt,(ie.start+ie.count)*Re)),_e!==null?(rt=Math.max(rt,0),mt=Math.min(mt,_e.count)):Se!=null&&(rt=Math.max(rt,0),mt=Math.min(mt,Se.count));let Rt=mt-rt;if(Rt<0||Rt===1/0)return;ut.setup(D,W,xe,V,_e);let Un,tt=ve;if(_e!==null&&(Un=$.get(_e),tt=je,tt.setIndex(Un)),D.isMesh)W.wireframe===!0?(Le.setLineWidth(W.wireframeLinewidth*Xe()),tt.setMode(I.LINES)):tt.setMode(I.TRIANGLES);else if(D.isLine){let we=W.linewidth;we===void 0&&(we=1),Le.setLineWidth(we*Xe()),D.isLineSegments?tt.setMode(I.LINES):D.isLineLoop?tt.setMode(I.LINE_LOOP):tt.setMode(I.LINE_STRIP)}else D.isPoints?tt.setMode(I.POINTS):D.isSprite&&tt.setMode(I.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)tt.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(qe.get("WEBGL_multi_draw"))tt.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{let we=D._multiDrawStarts,Yt=D._multiDrawCounts,nt=D._multiDrawCount,hi=_e?$.get(_e).bytesPerElement:1,Gs=De.get(W).currentProgram.getUniforms();for(let zn=0;zn<nt;zn++)Gs.setValue(I,"_gl_DrawID",zn),tt.render(we[zn]/hi,Yt[zn])}else if(D.isInstancedMesh)tt.renderInstances(rt,Rt,D.count);else if(V.isInstancedBufferGeometry){let we=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Yt=Math.min(V.instanceCount,we);tt.renderInstances(rt,Rt,Yt)}else tt.render(rt,Rt)};function et(E,N,V){E.transparent===!0&&E.side===jn&&E.forceSinglePass===!1?(E.side=Kt,E.needsUpdate=!0,Hl(E,N,V),E.side=es,E.needsUpdate=!0,Hl(E,N,V),E.side=jn):Hl(E,N,V)}this.compile=function(E,N,V=null){V===null&&(V=E),g=Je.get(V),g.init(N),v.push(g),V.traverseVisible(function(D){D.isLight&&D.layers.test(N.layers)&&(g.pushLight(D),D.castShadow&&g.pushShadow(D))}),E!==V&&E.traverseVisible(function(D){D.isLight&&D.layers.test(N.layers)&&(g.pushLight(D),D.castShadow&&g.pushShadow(D))}),g.setupLights();let W=new Set;return E.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;let ie=D.material;if(ie)if(Array.isArray(ie))for(let ue=0;ue<ie.length;ue++){let xe=ie[ue];et(xe,V,D),W.add(xe)}else et(ie,V,D),W.add(ie)}),v.pop(),g=null,W},this.compileAsync=function(E,N,V=null){let W=this.compile(E,N,V);return new Promise(D=>{function ie(){if(W.forEach(function(ue){De.get(ue).currentProgram.isReady()&&W.delete(ue)}),W.size===0){D(E);return}setTimeout(ie,10)}qe.get("KHR_parallel_shader_compile")!==null?ie():setTimeout(ie,10)})};let An=null;function Xi(E){An&&An(E)}function Y0(){ss.stop()}function q0(){ss.start()}let ss=new I1;ss.setAnimationLoop(Xi),typeof self<"u"&&ss.setContext(self),this.setAnimationLoop=function(E){An=E,X.setAnimationLoop(E),E===null?ss.stop():ss.start()},X.addEventListener("sessionstart",Y0),X.addEventListener("sessionend",q0),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(N),N=X.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,N,b),g=Je.get(E,v.length),g.init(N),v.push(g),le.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),He.setFromProjectionMatrix(le),K=this.localClippingEnabled,q=te.init(this.clippingPlanes,K),x=ge.get(E,d.length),x.init(),d.push(x),X.enabled===!0&&X.isPresenting===!0){let ie=y.xr.getDepthSensingMesh();ie!==null&&Lh(ie,N,-1/0,y.sortObjects)}Lh(E,N,0,y.sortObjects),x.finish(),y.sortObjects===!0&&x.sort(F,ee),Qe=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Qe&&ke.addToRenderList(x,E),this.info.render.frame++,q===!0&&te.beginShadows();let V=g.state.shadowsArray;ye.render(V,E,N),q===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();let W=x.opaque,D=x.transmissive;if(g.setupLights(),N.isArrayCamera){let ie=N.cameras;if(D.length>0)for(let ue=0,xe=ie.length;ue<xe;ue++){let _e=ie[ue];$0(W,D,E,_e)}Qe&&ke.render(E);for(let ue=0,xe=ie.length;ue<xe;ue++){let _e=ie[ue];j0(x,E,_e,_e.viewport)}}else D.length>0&&$0(W,D,E,N),Qe&&ke.render(E),j0(x,E,N);b!==null&&(C.updateMultisampleRenderTarget(b),C.updateRenderTargetMipmap(b)),E.isScene===!0&&E.onAfterRender(y,E,N),ut.resetDefaultState(),A=-1,L=null,v.pop(),v.length>0?(g=v[v.length-1],q===!0&&te.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,d.pop(),d.length>0?x=d[d.length-1]:x=null};function Lh(E,N,V,W){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)g.pushLight(E),E.castShadow&&g.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||He.intersectsSprite(E)){W&&be.setFromMatrixPosition(E.matrixWorld).applyMatrix4(le);let ue=j.update(E),xe=E.material;xe.visible&&x.push(E,ue,xe,V,be.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||He.intersectsObject(E))){let ue=j.update(E),xe=E.material;if(W&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),be.copy(E.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),be.copy(ue.boundingSphere.center)),be.applyMatrix4(E.matrixWorld).applyMatrix4(le)),Array.isArray(xe)){let _e=ue.groups;for(let Re=0,Pe=_e.length;Re<Pe;Re++){let Se=_e[Re],rt=xe[Se.materialIndex];rt&&rt.visible&&x.push(E,ue,rt,V,be.z,Se)}}else xe.visible&&x.push(E,ue,xe,V,be.z,null)}}let ie=E.children;for(let ue=0,xe=ie.length;ue<xe;ue++)Lh(ie[ue],N,V,W)}function j0(E,N,V,W){let D=E.opaque,ie=E.transmissive,ue=E.transparent;g.setupLightsView(V),q===!0&&te.setGlobalState(y.clippingPlanes,V),W&&Le.viewport(_.copy(W)),D.length>0&&Bl(D,N,V),ie.length>0&&Bl(ie,N,V),ue.length>0&&Bl(ue,N,V),Le.buffers.depth.setTest(!0),Le.buffers.depth.setMask(!0),Le.buffers.color.setMask(!0),Le.setPolygonOffset(!1)}function $0(E,N,V,W){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[W.id]===void 0&&(g.state.transmissionRenderTarget[W.id]=new gr(1,1,{generateMipmaps:!0,type:qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float")?zl:mr,minFilter:Ns,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:it.workingColorSpace}));let ie=g.state.transmissionRenderTarget[W.id],ue=W.viewport||_;ie.setSize(ue.z,ue.w);let xe=y.getRenderTarget();y.setRenderTarget(ie),y.getClearColor(z),H=y.getClearAlpha(),H<1&&y.setClearColor(16777215,.5),y.clear(),Qe&&ke.render(V);let _e=y.toneMapping;y.toneMapping=Qr;let Re=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),g.setupLightsView(W),q===!0&&te.setGlobalState(y.clippingPlanes,W),Bl(E,V,W),C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let Se=0,rt=N.length;Se<rt;Se++){let mt=N[Se],Rt=mt.object,Un=mt.geometry,tt=mt.material,we=mt.group;if(tt.side===jn&&Rt.layers.test(W.layers)){let Yt=tt.side;tt.side=Kt,tt.needsUpdate=!0,Z0(Rt,V,W,Un,tt,we),tt.side=Yt,tt.needsUpdate=!0,Pe=!0}}Pe===!0&&(C.updateMultisampleRenderTarget(ie),C.updateRenderTargetMipmap(ie))}y.setRenderTarget(xe),y.setClearColor(z,H),Re!==void 0&&(W.viewport=Re),y.toneMapping=_e}function Bl(E,N,V){let W=N.isScene===!0?N.overrideMaterial:null;for(let D=0,ie=E.length;D<ie;D++){let ue=E[D],xe=ue.object,_e=ue.geometry,Re=W===null?ue.material:W,Pe=ue.group;xe.layers.test(V.layers)&&Z0(xe,N,V,_e,Re,Pe)}}function Z0(E,N,V,W,D,ie){E.onBeforeRender(y,N,V,W,D,ie),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),D.onBeforeRender(y,N,V,W,E,ie),D.transparent===!0&&D.side===jn&&D.forceSinglePass===!1?(D.side=Kt,D.needsUpdate=!0,y.renderBufferDirect(V,N,W,D,E,ie),D.side=es,D.needsUpdate=!0,y.renderBufferDirect(V,N,W,D,E,ie),D.side=jn):y.renderBufferDirect(V,N,W,D,E,ie),E.onAfterRender(y,N,V,W,D,ie)}function Hl(E,N,V){N.isScene!==!0&&(N=ze);let W=De.get(E),D=g.state.lights,ie=g.state.shadowsArray,ue=D.state.version,xe=Me.getParameters(E,D.state,ie,N,V),_e=Me.getProgramCacheKey(xe),Re=W.programs;W.environment=E.isMeshStandardMaterial?N.environment:null,W.fog=N.fog,W.envMap=(E.isMeshStandardMaterial?B:w).get(E.envMap||W.environment),W.envMapRotation=W.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,Re===void 0&&(E.addEventListener("dispose",$e),Re=new Map,W.programs=Re);let Pe=Re.get(_e);if(Pe!==void 0){if(W.currentProgram===Pe&&W.lightsStateVersion===ue)return J0(E,xe),Pe}else xe.uniforms=Me.getUniforms(E),E.onBeforeCompile(xe,y),Pe=Me.acquireProgram(xe,_e),Re.set(_e,Pe),W.uniforms=xe.uniforms;let Se=W.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Se.clippingPlanes=te.uniform),J0(E,xe),W.needsLights=sM(E),W.lightsStateVersion=ue,W.needsLights&&(Se.ambientLightColor.value=D.state.ambient,Se.lightProbe.value=D.state.probe,Se.directionalLights.value=D.state.directional,Se.directionalLightShadows.value=D.state.directionalShadow,Se.spotLights.value=D.state.spot,Se.spotLightShadows.value=D.state.spotShadow,Se.rectAreaLights.value=D.state.rectArea,Se.ltc_1.value=D.state.rectAreaLTC1,Se.ltc_2.value=D.state.rectAreaLTC2,Se.pointLights.value=D.state.point,Se.pointLightShadows.value=D.state.pointShadow,Se.hemisphereLights.value=D.state.hemi,Se.directionalShadowMap.value=D.state.directionalShadowMap,Se.directionalShadowMatrix.value=D.state.directionalShadowMatrix,Se.spotShadowMap.value=D.state.spotShadowMap,Se.spotLightMatrix.value=D.state.spotLightMatrix,Se.spotLightMap.value=D.state.spotLightMap,Se.pointShadowMap.value=D.state.pointShadowMap,Se.pointShadowMatrix.value=D.state.pointShadowMatrix),W.currentProgram=Pe,W.uniformsList=null,Pe}function K0(E){if(E.uniformsList===null){let N=E.currentProgram.getUniforms();E.uniformsList=Ko.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function J0(E,N){let V=De.get(E);V.outputColorSpace=N.outputColorSpace,V.batching=N.batching,V.batchingColor=N.batchingColor,V.instancing=N.instancing,V.instancingColor=N.instancingColor,V.instancingMorph=N.instancingMorph,V.skinning=N.skinning,V.morphTargets=N.morphTargets,V.morphNormals=N.morphNormals,V.morphColors=N.morphColors,V.morphTargetsCount=N.morphTargetsCount,V.numClippingPlanes=N.numClippingPlanes,V.numIntersection=N.numClipIntersection,V.vertexAlphas=N.vertexAlphas,V.vertexTangents=N.vertexTangents,V.toneMapping=N.toneMapping}function iM(E,N,V,W,D){N.isScene!==!0&&(N=ze),C.resetTextureUnits();let ie=N.fog,ue=W.isMeshStandardMaterial?N.environment:null,xe=b===null?y.outputColorSpace:b.isXRRenderTarget===!0?b.texture.colorSpace:rs,_e=(W.isMeshStandardMaterial?B:w).get(W.envMap||ue),Re=W.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Pe=!!V.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Se=!!V.morphAttributes.position,rt=!!V.morphAttributes.normal,mt=!!V.morphAttributes.color,Rt=Qr;W.toneMapped&&(b===null||b.isXRRenderTarget===!0)&&(Rt=y.toneMapping);let Un=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,tt=Un!==void 0?Un.length:0,we=De.get(W),Yt=g.state.lights;if(q===!0&&(K===!0||E!==L)){let Kn=E===L&&W.id===A;te.setState(W,E,Kn)}let nt=!1;W.version===we.__version?(we.needsLights&&we.lightsStateVersion!==Yt.state.version||we.outputColorSpace!==xe||D.isBatchedMesh&&we.batching===!1||!D.isBatchedMesh&&we.batching===!0||D.isBatchedMesh&&we.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&we.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&we.instancing===!1||!D.isInstancedMesh&&we.instancing===!0||D.isSkinnedMesh&&we.skinning===!1||!D.isSkinnedMesh&&we.skinning===!0||D.isInstancedMesh&&we.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&we.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&we.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&we.instancingMorph===!1&&D.morphTexture!==null||we.envMap!==_e||W.fog===!0&&we.fog!==ie||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==te.numPlanes||we.numIntersection!==te.numIntersection)||we.vertexAlphas!==Re||we.vertexTangents!==Pe||we.morphTargets!==Se||we.morphNormals!==rt||we.morphColors!==mt||we.toneMapping!==Rt||we.morphTargetsCount!==tt)&&(nt=!0):(nt=!0,we.__version=W.version);let hi=we.currentProgram;nt===!0&&(hi=Hl(W,N,D));let Gs=!1,zn=!1,kh=!1,Lt=hi.getUniforms(),_r=we.uniforms;if(Le.useProgram(hi.program)&&(Gs=!0,zn=!0,kh=!0),W.id!==A&&(A=W.id,zn=!0),Gs||L!==E){Ke.reverseDepthBuffer?(pe.copy(E.projectionMatrix),Ob(pe),Fb(pe),Lt.setValue(I,"projectionMatrix",pe)):Lt.setValue(I,"projectionMatrix",E.projectionMatrix),Lt.setValue(I,"viewMatrix",E.matrixWorldInverse);let Kn=Lt.map.cameraPosition;Kn!==void 0&&Kn.setValue(I,Ce.setFromMatrixPosition(E.matrixWorld)),Ke.logarithmicDepthBuffer&&Lt.setValue(I,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&Lt.setValue(I,"isOrthographic",E.isOrthographicCamera===!0),L!==E&&(L=E,zn=!0,kh=!0)}if(D.isSkinnedMesh){Lt.setOptional(I,D,"bindMatrix"),Lt.setOptional(I,D,"bindMatrixInverse");let Kn=D.skeleton;Kn&&(Kn.boneTexture===null&&Kn.computeBoneTexture(),Lt.setValue(I,"boneTexture",Kn.boneTexture,C))}D.isBatchedMesh&&(Lt.setOptional(I,D,"batchingTexture"),Lt.setValue(I,"batchingTexture",D._matricesTexture,C),Lt.setOptional(I,D,"batchingIdTexture"),Lt.setValue(I,"batchingIdTexture",D._indirectTexture,C),Lt.setOptional(I,D,"batchingColorTexture"),D._colorsTexture!==null&&Lt.setValue(I,"batchingColorTexture",D._colorsTexture,C));let Nh=V.morphAttributes;if((Nh.position!==void 0||Nh.normal!==void 0||Nh.color!==void 0)&&Ne.update(D,V,hi),(zn||we.receiveShadow!==D.receiveShadow)&&(we.receiveShadow=D.receiveShadow,Lt.setValue(I,"receiveShadow",D.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(_r.envMap.value=_e,_r.flipEnvMap.value=_e.isCubeTexture&&_e.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&N.environment!==null&&(_r.envMapIntensity.value=N.environmentIntensity),zn&&(Lt.setValue(I,"toneMappingExposure",y.toneMappingExposure),we.needsLights&&rM(_r,kh),ie&&W.fog===!0&&ae.refreshFogUniforms(_r,ie),ae.refreshMaterialUniforms(_r,W,G,O,g.state.transmissionRenderTarget[E.id]),Ko.upload(I,K0(we),_r,C)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Ko.upload(I,K0(we),_r,C),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&Lt.setValue(I,"center",D.center),Lt.setValue(I,"modelViewMatrix",D.modelViewMatrix),Lt.setValue(I,"normalMatrix",D.normalMatrix),Lt.setValue(I,"modelMatrix",D.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let Kn=W.uniformsGroups;for(let Dh=0,oM=Kn.length;Dh<oM;Dh++){let Q0=Kn[Dh];k.update(Q0,hi),k.bind(Q0,hi)}}return hi}function rM(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function sM(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return b},this.setRenderTargetTextures=function(E,N,V){De.get(E.texture).__webglTexture=N,De.get(E.depthTexture).__webglTexture=V;let W=De.get(E);W.__hasExternalTextures=!0,W.__autoAllocateDepthBuffer=V===void 0,W.__autoAllocateDepthBuffer||qe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),W.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,N){let V=De.get(E);V.__webglFramebuffer=N,V.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,V=0){b=E,R=N,T=V;let W=!0,D=null,ie=!1,ue=!1;if(E){let _e=De.get(E);if(_e.__useDefaultFramebuffer!==void 0)Le.bindFramebuffer(I.FRAMEBUFFER,null),W=!1;else if(_e.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(_e.__hasExternalTextures)C.rebindTextures(E,De.get(E.texture).__webglTexture,De.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Se=E.depthTexture;if(_e.__boundDepthTexture!==Se){if(Se!==null&&De.has(Se)&&(E.width!==Se.image.width||E.height!==Se.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}let Re=E.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(ue=!0);let Pe=De.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Pe[N])?D=Pe[N][V]:D=Pe[N],ie=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?D=De.get(E).__webglMultisampledFramebuffer:Array.isArray(Pe)?D=Pe[V]:D=Pe,_.copy(E.viewport),S.copy(E.scissor),U=E.scissorTest}else _.copy(ne).multiplyScalar(G).floor(),S.copy(re).multiplyScalar(G).floor(),U=Ee;if(Le.bindFramebuffer(I.FRAMEBUFFER,D)&&W&&Le.drawBuffers(E,D),Le.viewport(_),Le.scissor(S),Le.setScissorTest(U),ie){let _e=De.get(E.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+N,_e.__webglTexture,V)}else if(ue){let _e=De.get(E.texture),Re=N||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,_e.__webglTexture,V||0,Re)}A=-1},this.readRenderTargetPixels=function(E,N,V,W,D,ie,ue){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=De.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){Le.bindFramebuffer(I.FRAMEBUFFER,xe);try{let _e=E.texture,Re=_e.format,Pe=_e.type;if(!Ke.textureFormatReadable(Re)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ke.textureTypeReadable(Pe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-W&&V>=0&&V<=E.height-D&&I.readPixels(N,V,W,D,Ue.convert(Re),Ue.convert(Pe),ie)}finally{let _e=b!==null?De.get(b).__webglFramebuffer:null;Le.bindFramebuffer(I.FRAMEBUFFER,_e)}}},this.readRenderTargetPixelsAsync=async function(E,N,V,W,D,ie,ue){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=De.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){let _e=E.texture,Re=_e.format,Pe=_e.type;if(!Ke.textureFormatReadable(Re))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ke.textureTypeReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=E.width-W&&V>=0&&V<=E.height-D){Le.bindFramebuffer(I.FRAMEBUFFER,xe);let Se=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Se),I.bufferData(I.PIXEL_PACK_BUFFER,ie.byteLength,I.STREAM_READ),I.readPixels(N,V,W,D,Ue.convert(Re),Ue.convert(Pe),0);let rt=b!==null?De.get(b).__webglFramebuffer:null;Le.bindFramebuffer(I.FRAMEBUFFER,rt);let mt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await zb(I,mt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Se),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,ie),I.deleteBuffer(Se),I.deleteSync(mt),ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,N=null,V=0){E.isTexture!==!0&&($u("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,E=arguments[1]);let W=Math.pow(2,-V),D=Math.floor(E.image.width*W),ie=Math.floor(E.image.height*W),ue=N!==null?N.x:0,xe=N!==null?N.y:0;C.setTexture2D(E,0),I.copyTexSubImage2D(I.TEXTURE_2D,V,0,0,ue,xe,D,ie),Le.unbindTexture()},this.copyTextureToTexture=function(E,N,V=null,W=null,D=0){E.isTexture!==!0&&($u("WebGLRenderer: copyTextureToTexture function signature has changed."),W=arguments[0]||null,E=arguments[1],N=arguments[2],D=arguments[3]||0,V=null);let ie,ue,xe,_e,Re,Pe;V!==null?(ie=V.max.x-V.min.x,ue=V.max.y-V.min.y,xe=V.min.x,_e=V.min.y):(ie=E.image.width,ue=E.image.height,xe=0,_e=0),W!==null?(Re=W.x,Pe=W.y):(Re=0,Pe=0);let Se=Ue.convert(N.format),rt=Ue.convert(N.type);C.setTexture2D(N,0),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,N.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,N.unpackAlignment);let mt=I.getParameter(I.UNPACK_ROW_LENGTH),Rt=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Un=I.getParameter(I.UNPACK_SKIP_PIXELS),tt=I.getParameter(I.UNPACK_SKIP_ROWS),we=I.getParameter(I.UNPACK_SKIP_IMAGES),Yt=E.isCompressedTexture?E.mipmaps[D]:E.image;I.pixelStorei(I.UNPACK_ROW_LENGTH,Yt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Yt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,xe),I.pixelStorei(I.UNPACK_SKIP_ROWS,_e),E.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,D,Re,Pe,ie,ue,Se,rt,Yt.data):E.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,D,Re,Pe,Yt.width,Yt.height,Se,Yt.data):I.texSubImage2D(I.TEXTURE_2D,D,Re,Pe,ie,ue,Se,rt,Yt),I.pixelStorei(I.UNPACK_ROW_LENGTH,mt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Rt),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Un),I.pixelStorei(I.UNPACK_SKIP_ROWS,tt),I.pixelStorei(I.UNPACK_SKIP_IMAGES,we),D===0&&N.generateMipmaps&&I.generateMipmap(I.TEXTURE_2D),Le.unbindTexture()},this.copyTextureToTexture3D=function(E,N,V=null,W=null,D=0){E.isTexture!==!0&&($u("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,W=arguments[1]||null,E=arguments[2],N=arguments[3],D=arguments[4]||0);let ie,ue,xe,_e,Re,Pe,Se,rt,mt,Rt=E.isCompressedTexture?E.mipmaps[D]:E.image;V!==null?(ie=V.max.x-V.min.x,ue=V.max.y-V.min.y,xe=V.max.z-V.min.z,_e=V.min.x,Re=V.min.y,Pe=V.min.z):(ie=Rt.width,ue=Rt.height,xe=Rt.depth,_e=0,Re=0,Pe=0),W!==null?(Se=W.x,rt=W.y,mt=W.z):(Se=0,rt=0,mt=0);let Un=Ue.convert(N.format),tt=Ue.convert(N.type),we;if(N.isData3DTexture)C.setTexture3D(N,0),we=I.TEXTURE_3D;else if(N.isDataArrayTexture||N.isCompressedArrayTexture)C.setTexture2DArray(N,0),we=I.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,N.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,N.unpackAlignment);let Yt=I.getParameter(I.UNPACK_ROW_LENGTH),nt=I.getParameter(I.UNPACK_IMAGE_HEIGHT),hi=I.getParameter(I.UNPACK_SKIP_PIXELS),Gs=I.getParameter(I.UNPACK_SKIP_ROWS),zn=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,Rt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Rt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,_e),I.pixelStorei(I.UNPACK_SKIP_ROWS,Re),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Pe),E.isDataTexture||E.isData3DTexture?I.texSubImage3D(we,D,Se,rt,mt,ie,ue,xe,Un,tt,Rt.data):N.isCompressedArrayTexture?I.compressedTexSubImage3D(we,D,Se,rt,mt,ie,ue,xe,Un,Rt.data):I.texSubImage3D(we,D,Se,rt,mt,ie,ue,xe,Un,tt,Rt),I.pixelStorei(I.UNPACK_ROW_LENGTH,Yt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,nt),I.pixelStorei(I.UNPACK_SKIP_PIXELS,hi),I.pixelStorei(I.UNPACK_SKIP_ROWS,Gs),I.pixelStorei(I.UNPACK_SKIP_IMAGES,zn),D===0&&N.generateMipmaps&&I.generateMipmap(we),Le.unbindTexture()},this.initRenderTarget=function(E){De.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),Le.unbindTexture()},this.resetState=function(){R=0,T=0,b=null,Le.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return dr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===D0?"display-p3":"srgb",t.unpackColorSpace=it.workingColorSpace===bh?"display-p3":"srgb"}};var fh=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ie(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Al=class extends wn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Bi,this.environmentIntensity=1,this.environmentRotation=new Bi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},dh=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Fm,this.updateRanges=[],this.version=0,this.uuid=pr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},_n=new P,Rl=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.applyMatrix4(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.applyNormalMatrix(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)_n.fromBufferAttribute(this,t),_n.transformDirection(e),this.setXYZ(t,_n.x,_n.y,_n.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=zi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=zi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=zi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=zi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=zi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Nt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Os=class extends ns{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ho,ml=new P,Vo=new P,Go=new P,Wo=new he,gl=new he,U1=new ot,Uu=new P,yl=new P,zu=new P,i1=new he,$p=new he,r1=new he,sa=class extends wn{constructor(e=new Os){if(super(),this.isSprite=!0,this.type="Sprite",Ho===void 0){Ho=new Jt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new dh(t,5);Ho.setIndex([0,1,2,0,2,3]),Ho.setAttribute("position",new Rl(i,3,0,!1)),Ho.setAttribute("uv",new Rl(i,2,3,!1))}this.geometry=Ho,this.material=e,this.center=new he(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Vo.setFromMatrixScale(this.matrixWorld),U1.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Go.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Vo.multiplyScalar(-Go.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;Ou(Uu.set(-.5,-.5,0),Go,o,Vo,r,s),Ou(yl.set(.5,-.5,0),Go,o,Vo,r,s),Ou(zu.set(.5,.5,0),Go,o,Vo,r,s),i1.set(0,0),$p.set(1,0),r1.set(1,1);let a=e.ray.intersectTriangle(Uu,yl,zu,!1,ml);if(a===null&&(Ou(yl.set(-.5,.5,0),Go,o,Vo,r,s),$p.set(0,1),a=e.ray.intersectTriangle(Uu,zu,yl,!1,ml),a===null))return;let l=e.ray.origin.distanceTo(ml);l<e.near||l>e.far||t.push({distance:l,point:ml.clone(),uv:Kr.getInterpolation(ml,Uu,yl,zu,i1,$p,r1,new he),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ou(n,e,t,i,r,s){Wo.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(gl.x=s*Wo.x-r*Wo.y,gl.y=r*Wo.x+s*Wo.y):gl.copy(Wo),n.copy(e),n.x+=gl.x,n.y+=gl.y,n.applyMatrix4(U1)}var r0=class extends kn{constructor(e=null,t=1,i=1,r,s,o,a,l,c=un,u=un,h,f){super(null,o,a,l,c,u,r,s,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Cl=class extends Nt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Xo=new ot,s1=new ot,Fu=[],o1=new yr,NR=new ot,vl=new Ae,xl=new zs,ph=class extends Ae{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Cl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,NR)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new yr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Xo),o1.copy(e.boundingBox).applyMatrix4(Xo),this.boundingBox.union(o1)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new zs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Xo),xl.copy(e.boundingSphere).applyMatrix4(Xo),this.boundingSphere.union(xl)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,t){let i=this.matrixWorld,r=this.count;if(vl.geometry=this.geometry,vl.material=this.material,vl.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xl.copy(this.boundingSphere),xl.applyMatrix4(i),e.ray.intersectsSphere(xl)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Xo),s1.multiplyMatrices(i,Xo),vl.matrixWorld=s1,vl.raycast(e,Fu);for(let o=0,a=Fu.length;o<a;o++){let l=Fu[o];l.instanceId=s,l.object=this,t.push(l)}Fu.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Cl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new r0(new Float32Array(r*this.count),r,this.count,I0,Oi));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Pl=class extends kn{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},li=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],f=i[r+1]-u,p=(o-u)/f;return(r+p)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new he:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new P,r=[],s=[],o=[],a=new P,l=new ot;for(let p=0;p<=e;p++){let m=p/e;r[p]=this.getTangentAt(m,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),f=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(cn(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,m))}o[p].crossVectors(r[p],s[p])}if(t===!0){let p=Math.acos(cn(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(r[m],p*m)),o[m].crossVectors(r[m],s[m])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Il=class extends li{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new he){let i=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,p=c-this.aY;l=f*u-p*h+this.aX,c=f*h+p*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},s0=class extends Il{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function z0(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let f=(o-s)/c-(a-s)/(c+u)+(a-o)/u,p=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,p*=u,r(o,a,f,p)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var Bu=new P,Zp=new z0,Kp=new z0,Jp=new z0,o0=class extends li{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Bu.subVectors(r[0],r[1]).add(r[0]),c=Bu);let h=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Bu.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Bu),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),p),x=Math.pow(h.distanceToSquared(f),p),g=Math.pow(f.distanceToSquared(u),p);x<1e-4&&(x=1),m<1e-4&&(m=x),g<1e-4&&(g=x),Zp.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,m,x,g),Kp.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,m,x,g),Jp.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,m,x,g)}else this.curveType==="catmullrom"&&(Zp.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),Kp.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),Jp.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return i.set(Zp.calc(l),Kp.calc(l),Jp.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function a1(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function DR(n,e){let t=1-n;return t*t*e}function UR(n,e){return 2*(1-n)*n*e}function zR(n,e){return n*n*e}function Sl(n,e,t,i){return DR(n,e)+UR(n,t)+zR(n,i)}function OR(n,e){let t=1-n;return t*t*t*e}function FR(n,e){let t=1-n;return 3*t*t*n*e}function BR(n,e){return 3*(1-n)*n*n*e}function HR(n,e){return n*n*n*e}function wl(n,e,t,i,r){return OR(n,e)+FR(n,t)+BR(n,i)+HR(n,r)}var mh=class extends li{constructor(e=new he,t=new he,i=new he,r=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new he){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(wl(e,r.x,s.x,o.x,a.x),wl(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},a0=class extends li{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(wl(e,r.x,s.x,o.x,a.x),wl(e,r.y,s.y,o.y,a.y),wl(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},gh=class extends li{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},l0=class extends li{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},yh=class extends li{constructor(e=new he,t=new he,i=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new he){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Sl(e,r.x,s.x,o.x),Sl(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},c0=class extends li{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(Sl(e,r.x,s.x,o.x),Sl(e,r.y,s.y,o.y),Sl(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},vh=class extends li{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(a1(a,l.x,c.x,u.x,h.x),a1(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new he().fromArray(r))}return this}},l1=Object.freeze({__proto__:null,ArcCurve:s0,CatmullRomCurve3:o0,CubicBezierCurve:mh,CubicBezierCurve3:a0,EllipseCurve:Il,LineCurve:gh,LineCurve3:l0,QuadraticBezierCurve:yh,QuadraticBezierCurve3:c0,SplineCurve:vh}),u0=class extends li{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new l1[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new l1[r.type]().fromJSON(r))}return this}},xh=class extends u0{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new gh(this.currentPoint.clone(),new he(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new yh(this.currentPoint.clone(),new he(e,t),new he(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new mh(this.currentPoint.clone(),new he(e,t),new he(i,r),new he(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new vh(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let c=new Il(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var Fs=class n extends Jt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new P,u=new he;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){let p=i+h/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[f]/e+1)/2,u.y=(o[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ct(o,3)),this.setAttribute("normal",new ct(a,3)),this.setAttribute("uv",new ct(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Qt=class n extends Jt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],f=[],p=[],m=0,x=[],g=i/2,d=0;v(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new ct(h,3)),this.setAttribute("normal",new ct(f,3)),this.setAttribute("uv",new ct(p,2));function v(){let M=new P,R=new P,T=0,b=(t-e)/i;for(let A=0;A<=s;A++){let L=[],_=A/s,S=_*(t-e)+e;for(let U=0;U<=r;U++){let z=U/r,H=z*l+a,Y=Math.sin(H),O=Math.cos(H);R.x=S*Y,R.y=-_*i+g,R.z=S*O,h.push(R.x,R.y,R.z),M.set(Y,b,O).normalize(),f.push(M.x,M.y,M.z),p.push(z,1-_),L.push(m++)}x.push(L)}for(let A=0;A<r;A++)for(let L=0;L<s;L++){let _=x[L][A],S=x[L+1][A],U=x[L+1][A+1],z=x[L][A+1];e>0&&(u.push(_,S,z),T+=3),t>0&&(u.push(S,U,z),T+=3)}c.addGroup(d,T,0),d+=T}function y(M){let R=m,T=new he,b=new P,A=0,L=M===!0?e:t,_=M===!0?1:-1;for(let U=1;U<=r;U++)h.push(0,g*_,0),f.push(0,_,0),p.push(.5,.5),m++;let S=m;for(let U=0;U<=r;U++){let H=U/r*l+a,Y=Math.cos(H),O=Math.sin(H);b.x=L*O,b.y=g*_,b.z=L*Y,h.push(b.x,b.y,b.z),f.push(0,_,0),T.x=Y*.5+.5,T.y=O*.5*_+.5,p.push(T.x,T.y),m++}for(let U=0;U<r;U++){let z=R+U,H=S+U;M===!0?u.push(H,H+1,z):u.push(H+1,H,z),A+=3}c.addGroup(d,A,M===!0?1:2),d+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},is=class n extends Qt{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},h0=class n extends Jt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new ct(s,3)),this.setAttribute("normal",new ct(s.slice(),3)),this.setAttribute("uv",new ct(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let y=new P,M=new P,R=new P;for(let T=0;T<t.length;T+=3)p(t[T+0],y),p(t[T+1],M),p(t[T+2],R),l(y,M,R,v)}function l(v,y,M,R){let T=R+1,b=[];for(let A=0;A<=T;A++){b[A]=[];let L=v.clone().lerp(M,A/T),_=y.clone().lerp(M,A/T),S=T-A;for(let U=0;U<=S;U++)U===0&&A===T?b[A][U]=L:b[A][U]=L.clone().lerp(_,U/S)}for(let A=0;A<T;A++)for(let L=0;L<2*(T-A)-1;L++){let _=Math.floor(L/2);L%2===0?(f(b[A][_+1]),f(b[A+1][_]),f(b[A][_])):(f(b[A][_+1]),f(b[A+1][_+1]),f(b[A+1][_]))}}function c(v){let y=new P;for(let M=0;M<s.length;M+=3)y.x=s[M+0],y.y=s[M+1],y.z=s[M+2],y.normalize().multiplyScalar(v),s[M+0]=y.x,s[M+1]=y.y,s[M+2]=y.z}function u(){let v=new P;for(let y=0;y<s.length;y+=3){v.x=s[y+0],v.y=s[y+1],v.z=s[y+2];let M=g(v)/2/Math.PI+.5,R=d(v)/Math.PI+.5;o.push(M,1-R)}m(),h()}function h(){for(let v=0;v<o.length;v+=6){let y=o[v+0],M=o[v+2],R=o[v+4],T=Math.max(y,M,R),b=Math.min(y,M,R);T>.9&&b<.1&&(y<.2&&(o[v+0]+=1),M<.2&&(o[v+2]+=1),R<.2&&(o[v+4]+=1))}}function f(v){s.push(v.x,v.y,v.z)}function p(v,y){let M=v*3;y.x=e[M+0],y.y=e[M+1],y.z=e[M+2]}function m(){let v=new P,y=new P,M=new P,R=new P,T=new he,b=new he,A=new he;for(let L=0,_=0;L<s.length;L+=9,_+=6){v.set(s[L+0],s[L+1],s[L+2]),y.set(s[L+3],s[L+4],s[L+5]),M.set(s[L+6],s[L+7],s[L+8]),T.set(o[_+0],o[_+1]),b.set(o[_+2],o[_+3]),A.set(o[_+4],o[_+5]),R.copy(v).add(y).add(M).divideScalar(3);let S=g(R);x(T,_+0,v,S),x(b,_+2,y,S),x(A,_+4,M,S)}}function x(v,y,M,R){R<0&&v.x===1&&(o[y]=v.x-1),M.x===0&&M.z===0&&(o[y]=R/2/Math.PI+.5)}function g(v){return Math.atan2(v.z,-v.x)}function d(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var Ll=class extends xh{constructor(e){super(e),this.uuid=pr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new xh().fromJSON(r))}return this}},VR={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=z1(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,f,p;if(i&&(s=qR(n,e,s,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let m=t;m<r;m+=t)h=n[m],f=n[m+1],h<a&&(a=h),f<l&&(l=f),h>c&&(c=h),f>u&&(u=f);p=Math.max(c-a,u-l),p=p!==0?32767/p:0}return kl(s,o,t,a,l,p,0),o}};function z1(n,e,t,i,r){let s,o;if(r===rC(n,e,t,i)>0)for(s=e;s<t;s+=i)o=c1(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=c1(s,n[s],n[s+1],o);return o&&Th(o,o.next)&&(Dl(o),o=o.next),o}function Bs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Th(t,t.next)||At(t.prev,t,t.next)===0)){if(Dl(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function kl(n,e,t,i,r,s,o){if(!n)return;!o&&s&&JR(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?WR(n,i,r,s):GR(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),Dl(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=XR(Bs(n),e,t),kl(n,e,t,i,r,s,2)):o===2&&YR(n,e,t,i,r,s):kl(Bs(n),e,t,i,r,s,1);break}}}function GR(n){let e=n.prev,t=n,i=n.next;if(At(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,f=r>s?r>o?r:o:s>o?s:o,p=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=u&&m.x<=f&&m.y>=h&&m.y<=p&&qo(r,a,s,l,o,c,m.x,m.y)&&At(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function WR(n,e,t,i){let r=n.prev,s=n,o=n.next;if(At(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,f=o.y,p=a<l?a<c?a:c:l<c?l:c,m=u<h?u<f?u:f:h<f?h:f,x=a>l?a>c?a:c:l>c?l:c,g=u>h?u>f?u:f:h>f?h:f,d=f0(p,m,e,t,i),v=f0(x,g,e,t,i),y=n.prevZ,M=n.nextZ;for(;y&&y.z>=d&&M&&M.z<=v;){if(y.x>=p&&y.x<=x&&y.y>=m&&y.y<=g&&y!==r&&y!==o&&qo(a,u,l,h,c,f,y.x,y.y)&&At(y.prev,y,y.next)>=0||(y=y.prevZ,M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&qo(a,u,l,h,c,f,M.x,M.y)&&At(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;y&&y.z>=d;){if(y.x>=p&&y.x<=x&&y.y>=m&&y.y<=g&&y!==r&&y!==o&&qo(a,u,l,h,c,f,y.x,y.y)&&At(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;M&&M.z<=v;){if(M.x>=p&&M.x<=x&&M.y>=m&&M.y<=g&&M!==r&&M!==o&&qo(a,u,l,h,c,f,M.x,M.y)&&At(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function XR(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!Th(r,s)&&O1(r,i,i.next,s)&&Nl(r,s)&&Nl(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),Dl(i),Dl(i.next),i=n=s),i=i.next}while(i!==n);return Bs(i)}function YR(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&tC(o,a)){let l=F1(o,a);o=Bs(o,o.next),l=Bs(l,l.next),kl(o,e,t,i,r,s,0),kl(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function qR(n,e,t,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=z1(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(eC(c));for(r.sort(jR),s=0;s<r.length;s++)t=$R(r[s],t);return t}function jR(n,e){return n.x-e.x}function $R(n,e){let t=ZR(n,e);if(!t)return e;let i=F1(t,n);return Bs(i,i.next),Bs(t,t.next)}function ZR(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let f=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=s&&f>i&&(i=f,r=t.x<t.next.x?t:t.next,f===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&qo(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),Nl(t,n)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&KR(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function KR(n,e){return At(n.prev,n,e.prev)<0&&At(e.next,n,n.next)<0}function JR(n,e,t,i){let r=n;do r.z===0&&(r.z=f0(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,QR(r)}function QR(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function f0(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function eC(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function qo(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function tC(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!nC(n,e)&&(Nl(n,e)&&Nl(e,n)&&iC(n,e)&&(At(n.prev,n,e.prev)||At(n,e.prev,e))||Th(n,e)&&At(n.prev,n,n.next)>0&&At(e.prev,e,e.next)>0)}function At(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Th(n,e){return n.x===e.x&&n.y===e.y}function O1(n,e,t,i){let r=Vu(At(n,e,t)),s=Vu(At(n,e,i)),o=Vu(At(t,i,n)),a=Vu(At(t,i,e));return!!(r!==s&&o!==a||r===0&&Hu(n,t,e)||s===0&&Hu(n,i,e)||o===0&&Hu(t,n,i)||a===0&&Hu(t,e,i))}function Hu(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Vu(n){return n>0?1:n<0?-1:0}function nC(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&O1(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Nl(n,e){return At(n.prev,n,n.next)<0?At(n,e,n.next)>=0&&At(n,n.prev,e)>=0:At(n,e,n.prev)<0||At(n,n.next,e)<0}function iC(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function F1(n,e){let t=new d0(n.i,n.x,n.y),i=new d0(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function c1(n,e,t,i){let r=new d0(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Dl(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function d0(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function rC(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var bl=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];u1(e),h1(i,e);let o=e.length;t.forEach(u1);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,h1(i,t[l]);let a=VR.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function u1(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function h1(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Ul=class n extends h0{constructor(e=1,t=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var _h=class n extends Jt{constructor(e=new Ll([new he(0,.5),new he(-.5,-.5),new he(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new ct(r,3)),this.setAttribute("normal",new ct(s,3)),this.setAttribute("uv",new ct(o,2));function c(u){let h=r.length/3,f=u.extractPoints(t),p=f.shape,m=f.holes;bl.isClockWise(p)===!1&&(p=p.reverse());for(let g=0,d=m.length;g<d;g++){let v=m[g];bl.isClockWise(v)===!0&&(m[g]=v.reverse())}let x=bl.triangulateShape(p,m);for(let g=0,d=m.length;g<d;g++){let v=m[g];p=p.concat(v)}for(let g=0,d=p.length;g<d;g++){let v=p[g];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let g=0,d=x.length;g<d;g++){let v=x[g],y=v[0]+h,M=v[1]+h,R=v[2]+h;i.push(y,M,R),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return sC(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function sC(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var Nn=class n extends Jt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,f=new P,p=[],m=[],x=[],g=[];for(let d=0;d<=i;d++){let v=[],y=d/i,M=0;d===0&&o===0?M=.5/t:d===i&&l===Math.PI&&(M=-.5/t);for(let R=0;R<=t;R++){let T=R/t;h.x=-e*Math.cos(r+T*s)*Math.sin(o+y*a),h.y=e*Math.cos(o+y*a),h.z=e*Math.sin(r+T*s)*Math.sin(o+y*a),m.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),g.push(T+M,1-y),v.push(c++)}u.push(v)}for(let d=0;d<i;d++)for(let v=0;v<t;v++){let y=u[d][v+1],M=u[d][v],R=u[d+1][v],T=u[d+1][v+1];(d!==0||o>0)&&p.push(y,M,T),(d!==i-1||l<Math.PI)&&p.push(M,R,T)}this.setIndex(p),this.setAttribute("position",new ct(m,3)),this.setAttribute("normal",new ct(x,3)),this.setAttribute("uv",new ct(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ci=class extends ns{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=T1,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Gu(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function oC(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var oa=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break t}o=t.length;break n}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},p0=class extends oa{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:f_,endingEnd:f_}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case d_:s=e,a=2*t-i;break;case p_:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case d_:o=e,l=2*i-t;break;case p_:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,p=this._weightNext,m=(i-t)/(r-t),x=m*m,g=x*m,d=-f*g+2*f*x-f*m,v=(1+f)*g+(-1.5-2*f)*x+(-.5+f)*m+1,y=(-1-p)*g+(1.5+p)*x+.5*m,M=p*g-p*x;for(let R=0;R!==a;++R)s[R]=d*o[u+R]+v*o[c+R]+y*o[l+R]+M*o[h+R];return s}},m0=class extends oa{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),h=1-u;for(let f=0;f!==a;++f)s[f]=o[c+f]*h+o[l+f]*u;return s}},g0=class extends oa{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ai=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Gu(t,this.TimeBufferType),this.values=Gu(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Gu(e.times,Array),values:Gu(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new g0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new m0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new p0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Zu:t=this.InterpolantFactoryMethodDiscrete;break;case Om:t=this.InterpolantFactoryMethodLinear;break;case xp:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Zu;case this.InterpolantFactoryMethodLinear:return Om;case this.InterpolantFactoryMethodSmooth:return xp}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&oC(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===xp,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,f=h-i,p=h+i;for(let m=0;m!==i;++m){let x=t[h+m];if(x!==t[f+m]||x!==t[p+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,f=o*i;for(let p=0;p!==i;++p)t[f+p]=t[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ai.prototype.TimeBufferType=Float32Array;Ai.prototype.ValueBufferType=Float32Array;Ai.prototype.DefaultInterpolation=Om;var Hs=class extends Ai{constructor(e,t,i){super(e,t,i)}};Hs.prototype.ValueTypeName="bool";Hs.prototype.ValueBufferType=Array;Hs.prototype.DefaultInterpolation=Zu;Hs.prototype.InterpolantFactoryMethodLinear=void 0;Hs.prototype.InterpolantFactoryMethodSmooth=void 0;var y0=class extends Ai{};y0.prototype.ValueTypeName="color";var v0=class extends Ai{};v0.prototype.ValueTypeName="number";var x0=class extends oa{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)Fi.slerpFlat(s,0,o,c-a,o,c,l);return s}},Mh=class extends Ai{InterpolantFactoryMethodLinear(e){return new x0(this.times,this.values,this.getValueSize(),e)}};Mh.prototype.ValueTypeName="quaternion";Mh.prototype.InterpolantFactoryMethodSmooth=void 0;var Vs=class extends Ai{constructor(e,t,i){super(e,t,i)}};Vs.prototype.ValueTypeName="string";Vs.prototype.ValueBufferType=Array;Vs.prototype.DefaultInterpolation=Zu;Vs.prototype.InterpolantFactoryMethodLinear=void 0;Vs.prototype.InterpolantFactoryMethodSmooth=void 0;var _0=class extends Ai{};_0.prototype.ValueTypeName="vector";var M0=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let p=c[h],m=c[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null}}},aC=new M0,S0=class{constructor(e){this.manager=e!==void 0?e:aC,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};S0.DEFAULT_MATERIAL_NAME="__DEFAULT";var w0=class extends wn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}};var Qp=new ot,f1=new P,d1=new P,b0=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Tl,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;f1.setFromMatrixPosition(e.matrixWorld),t.position.copy(f1),d1.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(d1),t.updateMatrixWorld(),Qp.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qp),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Qp)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var E0=class extends b0{constructor(){super(new ch(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Sh=class extends w0{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(wn.DEFAULT_UP),this.updateMatrix(),this.target=new wn,this.shadow=new E0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var O0="\\[\\]\\.:\\/",lC=new RegExp("["+O0+"]","g"),F0="[^"+O0+"]",cC="[^"+O0.replace("\\.","")+"]",uC=/((?:WC+[\/:])*)/.source.replace("WC",F0),hC=/(WCOD+)?/.source.replace("WCOD",cC),fC=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",F0),dC=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",F0),pC=new RegExp("^"+uC+hC+fC+dC+"$"),mC=["material","materials","bones","map"],T0=class{constructor(e,t,i){let r=i||St.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},St=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(lC,"")}static parseTrackName(e){let t=pC.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);mC.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};St.Composite=T0;St.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};St.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};St.prototype.GetterByBindingType=[St.prototype._getValue_direct,St.prototype._getValue_array,St.prototype._getValue_arrayElement,St.prototype._getValue_toArray];St.prototype.SetterByBindingTypeAndVersioning=[[St.prototype._setValue_direct,St.prototype._setValue_direct_setNeedsUpdate,St.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[St.prototype._setValue_array,St.prototype._setValue_array_setNeedsUpdate,St.prototype._setValue_array_setMatrixWorldNeedsUpdate],[St.prototype._setValue_arrayElement,St.prototype._setValue_arrayElement_setNeedsUpdate,St.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[St.prototype._setValue_fromArray,St.prototype._setValue_fromArray_setNeedsUpdate,St.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var V3=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"169"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="169");var Ol=new P;function ui(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;Ol.copy(e),Ol[i]=0,Ol.normalize();let c=.5*o/(o+a),u=1-Ol.angleTo(n)/l;return Math.sign(Ol[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Dn=class extends Hi{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,t,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new P,x=.5/r;for(let g=0,d=0;g<u.length;g+=3,d+=2)switch(a.fromArray(u,g),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[g+0]=c.x*Math.sign(a.x)+l.x*s,u[g+1]=c.y*Math.sign(a.y)+l.y*s,u[g+2]=c.z*Math.sign(a.z)+l.z*s,h[g+0]=l.x,h[g+1]=l.y,h[g+2]=l.z,Math.floor(g/p)){case 0:m.set(1,0,0),f[d+0]=ui(m,l,"z","y",s,i),f[d+1]=1-ui(m,l,"y","z",s,t);break;case 1:m.set(-1,0,0),f[d+0]=1-ui(m,l,"z","y",s,i),f[d+1]=1-ui(m,l,"y","z",s,t);break;case 2:m.set(0,1,0),f[d+0]=1-ui(m,l,"x","z",s,e),f[d+1]=ui(m,l,"z","x",s,i);break;case 3:m.set(0,-1,0),f[d+0]=1-ui(m,l,"x","z",s,e),f[d+1]=1-ui(m,l,"z","x",s,i);break;case 4:m.set(0,0,1),f[d+0]=1-ui(m,l,"x","y",s,e),f[d+1]=1-ui(m,l,"y","x",s,t);break;case 5:m.set(0,0,-1),f[d+0]=ui(m,l,"x","y",s,e),f[d+1]=1-ui(m,l,"y","x",s,t);break}}};function B0(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Jt,c=0;for(let u=0;u<n.length;++u){let h=n[u],f=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;s[p]===void 0&&(s[p]=[]),s[p].push(h.attributes[p]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!r.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.morphAttributes[p])}if(e){let p;if(t)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,u),c+=p}}if(t){let u=0,h=[];for(let f=0;f<n.length;++f){let p=n[f].index;for(let m=0;m<p.count;++m)h.push(p.getX(m)+u);u+=n[f].attributes.position.count}l.setIndex(h)}for(let u in s){let h=B1(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let p=[];for(let x=0;x<o[u].length;++x)p.push(o[u][x][f]);let m=B1(p);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function B1(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){let u=n[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.count*t}let o=new e(s),a=new Nt(o,t,i),l=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let f=0,p=u.count;f<p;f++)for(let m=0;m<t;m++){let x=u.getComponent(f,m);a.setComponent(f+h,m,x)}}else o.set(u.array,l);l+=u.count*t}return r!==void 0&&(a.gpuType=r),a}var Ri=.055,la=.58,H0=.74,Fl=1.3,H1=.56,V1=.56,G1=2,W1=new P(-.55,.8,.32).normalize(),V0=34,hn={x:0,y:0,z:0,yaw:0};function xr(n,e,t){let i=document.createElement("canvas");i.width=n,i.height=e,t(i.getContext("2d"));let r=new Pl(i);return r.colorSpace=qn,r.anisotropy=4,r}function yC(n,e){let t=n.hx+e,i=n.hz+e,r=n.hy+e,s=n.hy+n.rise+e,o=Math.min(r,s)-n.hy*2-e*2,a={nbl:[-t,o,i],nbr:[t,o,i],ntl:[-t,r,i],ntr:[t,r,i],fbl:[-t,o,-i],fbr:[t,o,-i],ftl:[-t,s,-i],ftr:[t,s,-i]},l=[[a.ntl,a.ntr,a.ftr,a.ftl],[a.nbl,a.nbr,a.ntr,a.ntl],[a.fbr,a.fbl,a.ftl,a.ftr],[a.fbl,a.nbl,a.ntl,a.ftl],[a.nbr,a.fbr,a.ftr,a.ntr],[a.fbl,a.fbr,a.nbr,a.nbl]],c=[];for(let[h,f,p,m]of l)c.push(...h,...f,...p,...h,...p,...m);let u=new Jt;return u.setAttribute("position",new ct(c,3)),u.setAttribute("uv",new ct(new Array(c.length/3*2).fill(0),2)),u.computeVertexNormals(),u}function Ah(n,e){let t;if(n.shape==="cyl")n.look==="mochi"?(t=new Nn(1,28,14),t.scale(n.hx+e,.5+e,n.hx+e),t.translate(0,-n.hy,0)):t=new Qt(n.hx+e,n.hx+e,(n.hy+e)*2,36);else if(n.shape==="ramp")t=yC(n,e);else{let i=Math.min(.2,n.hx*.9,n.hy*.9,n.hz*.9);t=new Dn((n.hx+e)*2,(n.hy+e)*2,(n.hz+e)*2,3,i+e)}return t.index?t.toNonIndexed():t}function X1(n,e,t=!1){let i=new Ie(e),r=n.getAttribute("position"),s=n.getAttribute("normal"),o=r.count,a=new Float32Array(o*3),l=new Float32Array(o*2);for(let c=0;c<o;c++)a[c*3]=i.r,a[c*3+1]=i.g,a[c*3+2]=i.b,t&&s.getY(c)>.5?(l[c*2]=r.getX(c)/(G1*2),l[c*2+1]=r.getZ(c)/(G1*2)):l[c*2]=l[c*2+1]=.25;n.setAttribute("color",new Nt(a,3)),n.setAttribute("uv",new Nt(l,2))}function Y1(n,e,t){let i=new Hi((n.hx-.12+t)*2,e+t,(n.hz-.12+t)*2,1,1,1).toNonIndexed(),r=i.getAttribute("position"),s=Math.min(.55,n.hx*.3,n.hz*.3);for(let o=0;o<r.count;o++)r.getY(o)>0||(r.setX(o,r.getX(o)-Math.sign(r.getX(o))*s),r.setZ(o,r.getZ(o)-Math.sign(r.getZ(o))*s));return i.translate(0,-n.hy-e/2,0),i.computeVertexNormals(),i}function vC(n,e,t){let i=s=>s.yaw||s.motion?Math.hypot(s.hx,s.shape==="cyl"?s.hx:s.hz)+(s.motion?6:0):0,r=i(e);for(let s of n.solids){if(s===e)continue;let o=i(s),a=o||s.hx,l=o||(s.shape==="cyl"?s.hx:s.hz);if(Math.abs(s.x-e.x)>(r||e.hx)+a||Math.abs(s.z-e.z)>(r||e.hz)+l)continue;let c=s.y+s.hy+Math.max(0,s.rise)+(s.motion?3:0),u=s.y-s.hy-(s.motion?3:0);if(c>e.y-e.hy-t-.2&&u<e.y-e.hy-.05)return!0}return!1}function q1(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var xC=new P(0,1,0),Gi=new P,G0=new Fi,W0=new P,_C=new ot,MC=new P,Rh=class{constructor(e,t){this.level=t;this.scene=new Al;this.camera=new Sn(62,1,1.2,500);this.materials=new Map;this.ink=new bn({color:Wt,side:Kt});this.sun=new Sh(16774114,1.4);this.racerParts=null;this.size={width:1,height:1,dpr:1};this.economy=0;this.frameMs=16;this.frameAt=0;this.settled=0;this.movers=[];this.ballViews=[];this.windViews=[];this.belts=[];this.spinners=[];this.racers=new Map;this.disposables=[];this.camPos=new P;this.camLook=new P;this.camReady=!1;this.portrait=!0;this.shake=0;this.renderer=new hh({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.font=typeof getComputedStyle=="function"&&getComputedStyle(document.body).fontFamily||"sans-serif";let i=t.theme;this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=A0,this.scene.background=new Ie(i.fog),this.scene.fog=new fh(i.fog,70,210);let r=this.sun.shadow;r.mapSize.set(2048,2048),r.camera.left=r.camera.bottom=-V0,r.camera.right=r.camera.top=V0,r.camera.near=10,r.camera.far=170,r.bias=-4e-4,r.normalBias=.035,this.sun.castShadow=!0,this.scene.add(this.sun,this.sun.target),this.buildSky(),this.buildStatic(),this.buildMovers(),this.buildBalls(),this.buildWinds(),this.buildMarkers(),this.buildDecor(),this.buildClouds()}keep(e){return this.disposables.push(e),e}gloss(e,t={}){let i=e+(t.map?t.map.uuid:"")+(t.transparent?"t":""),r=this.materials.get(i);return r||(r=new ci({color:e,roughness:.32,metalness:0,map:t.map??null,transparent:!!t.transparent}),this.materials.set(i,r),this.keep(r)),r}decal(e){return this.keep(new ci({map:e,transparent:!0,depthWrite:!1,roughness:.6,metalness:0}))}solid(e){return e.castShadow=!0,e.receiveShadow=!0,e}buildSky(){let e=this.level.theme,t=new Ie(e.fog),i=new Ie(e.sky[0]),r=i.clone().offsetHSL(0,.35,-.2),s=new Ie(e.floorAlt).lerp(t,.35),o=(m,x)=>{let g=new Nn(m,32,24),d=g.getAttribute("position"),v=new Float32Array(d.count*3),y=new Ie;for(let M=0;M<d.count;M++){let R=d.getY(M)/m;R>=0?(R<.1?y.copy(t).lerp(i,R/.1):y.copy(i).lerp(r,Math.min(1,(R-.1)/.45)),x&&y.lerp(new Ie(1,1,1),.82)):(y.copy(t).lerp(s,Math.min(1,-R/.5)),x&&y.lerp(new Ie(1,1,1),.6).multiplyScalar(.9)),v[M*3]=y.r,v[M*3+1]=y.g,v[M*3+2]=y.b}return g.setAttribute("color",new Nt(v,3)),g},a=this.keep(new bn({vertexColors:!0,side:Kt,fog:!1,depthWrite:!1}));this.sky=new Ae(this.keep(o(450,!1)),a),this.sky.renderOrder=-10,this.sky.frustumCulled=!1,this.scene.add(this.sky);let l=new ra(this.renderer),c=new Al,u=o(20,!0);c.add(new Ae(u,a));let h=l.fromScene(c,.03);this.keep(h),this.scene.environment=h.texture,this.scene.environmentIntensity=.92,u.dispose(),l.dispose();let f=xr(128,128,m=>{let x=m.createRadialGradient(64,64,0,64,64,64);x.addColorStop(0,"rgba(255,255,255,1)"),x.addColorStop(.18,"rgba(255,250,225,0.9)"),x.addColorStop(.45,"rgba(255,244,205,0.28)"),x.addColorStop(1,"rgba(255,244,205,0)"),m.fillStyle=x,m.fillRect(0,0,128,128)});this.keep(f);let p=new sa(this.keep(new Os({map:f,transparent:!0,depthWrite:!1,fog:!1})));p.position.copy(W1).multiplyScalar(400),p.scale.setScalar(170),p.renderOrder=-9,this.sky.add(p)}buildClouds(){let e=q1(this.level.id.length*131+this.level.solids.length),t=this.level.finish.z,i=this.level.killY,r=[],s=(l,c,u,h)=>{let f=4+Math.floor(e()*4);for(let p=0;p<f;p++){let m=(p/(f-1)-.5)*h*2.6,x=h*(.62+e()*.5)*(1-Math.abs(p/(f-1)-.5)*.7);r.push(l+m,c+(e()-.35)*h*.5,u+(e()-.5)*h*1.3,x)}};for(let l=40;l>t-150;l-=13+e()*9)s((e()-.5)*150,i-5-e()*7,l,4+e()*5),s((e()<.5?-1:1)*(18+e()*70),i-3-e()*6,l-6,4+e()*6);for(let l=20;l>t-120;l-=24+e()*16)for(let c of[-1,1])s(c*(42+e()*60),-2+e()*26,l+e()*12,4.5+e()*5);for(let l=0;l<12;l++)s((e()-.5)*330,4+e()*55,t-95-e()*90,9+e()*10);let o=r.length/4,a=new ph(this.keep(new Nn(1,18,12)),this.keep(new ci({color:se,roughness:1,metalness:0,emissive:se,emissiveIntensity:.16})),o);for(let l=0;l<o;l++){let c=r[l*4+3];Gi.set(r[l*4],r[l*4+1],r[l*4+2]),a.setMatrixAt(l,_C.compose(Gi,G0.identity(),MC.set(c,c*.62,c)))}a.instanceMatrix.needsUpdate=!0,a.frustumCulled=!1,this.keep(a),this.scene.add(a)}buildStatic(){let e=[],t=[],i=new ot,r=new Ie;for(let o of this.level.solids){if(o.motion||o.active)continue;i.makeRotationY(o.yaw).setPosition(o.x,o.y,o.z);let a=Ah(o,0).applyMatrix4(i),l=o.look==="floor"||o.look==="finish";if(X1(a,o.color,l),e.push(a),t.push(Ah(o,Ri).applyMatrix4(i)),l&&o.shape==="box"&&Math.min(o.hx,o.hz)>=1.4){let c=Math.min(2.6,.9+Math.min(o.hx,o.hz)*.35);if(!vC(this.level,o,c)){let u=Y1(o,c,0).applyMatrix4(i);X1(u,"#"+r.set(o.color).lerp(new Ie(this.level.theme.accent),.3).multiplyScalar(.84).getHexString()),e.push(u);let h=Y1(o,c,Ri).applyMatrix4(i);h.setAttribute("uv",new Nt(new Float32Array(h.getAttribute("position").count*2),2)),t.push(h)}}this.dress(o,this.scene,o.x,o.y,o.z,o.yaw)}if(e.length){let o=xr(128,128,l=>{l.fillStyle="#ffffff",l.fillRect(0,0,128,128),l.fillStyle="#ebe8f3",l.fillRect(64,0,64,64),l.fillRect(0,64,64,64)});o.wrapS=o.wrapT=Ds,o.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),this.keep(o);let a=this.keep(new ci({vertexColors:!0,map:o,roughness:.46,metalness:0}));this.scene.add(this.solid(new Ae(this.keep(B0(e)),a))),this.scene.add(new Ae(this.keep(B0(t)),this.ink));for(let l of[...e,...t])l.dispose()}let s=new Ae(this.keep(new Fs(420,40)),this.keep(new bn({color:this.level.theme.fog})));s.rotation.x=-Math.PI/2,s.position.set(0,this.level.killY-6,-80),this.scene.add(s)}dress(e,t,i,r,s,o){let a=r+e.hy+.015,l=(c,u=0)=>(c.position.set(i,a,s),c.rotation.order="YXZ",c.rotation.set(-Math.PI/2,o+u,0),c.renderOrder=1,c.receiveShadow=!0,t.add(c),c);if(e.surface?.conveyor){let[c,u]=e.surface.conveyor,h=Math.hypot(c,u),f=Math.abs(c)>Math.abs(u),p=(f?e.hz:e.hx)*2-.5,m=(f?e.hx:e.hz)*2-.3,x=xr(64,64,d=>{d.strokeStyle="rgba(29,27,79,0.28)",d.lineWidth=9,d.lineCap="round",d.lineJoin="round",d.beginPath(),d.moveTo(14,44),d.lineTo(32,22),d.lineTo(50,44),d.stroke()});x.wrapS=x.wrapT=Ds,x.repeat.set(Math.max(1,Math.round(p/1.6)),Math.max(1,Math.round(m/1.6))),this.keep(x),this.belts.push({texture:x,speed:h*x.repeat.y/m});let g=new Ae(this.keep(new vr(p,m)),this.decal(x));if(l(g,Math.atan2(-c,-u)),e.shape==="ramp"){let d=Math.atan2(e.rise,e.hz*2);g.position.y=r+e.hy+e.rise/2+.02,g.rotation.x=-Math.PI/2+d,g.scale.y=1/Math.cos(d)}}else if(e.look==="drum"){let c=xr(128,128,u=>{u.fillStyle="#fff8ec",u.beginPath(),u.arc(64,64,60,0,Math.PI*2),u.fill(),u.strokeStyle=Wt,u.lineWidth=5,u.stroke(),u.fillStyle=e.color;for(let h=0;h<3;h++){let f=h/3*Math.PI*2;u.beginPath(),u.arc(64+Math.cos(f)*15,64+Math.sin(f)*15,13,0,Math.PI*2),u.fill()}});this.keep(c),l(new Ae(this.keep(new Fs(e.hx*.92,32)),this.decal(c)))}else if(e.look==="disc"||e.look==="plate"&&e.hx>1.2){let c=e.look==="disc",u=xr(256,256,h=>{if(h.translate(128,128),c)for(let f=0;f<8;f++)h.fillStyle=f%2?"rgba(255,255,255,0.75)":"rgba(29,27,79,0.10)",h.beginPath(),h.moveTo(0,0),h.arc(0,0,120,f/8*Math.PI*2,(f+1)/8*Math.PI*2),h.fill();else h.strokeStyle=Ve,h.lineWidth=14,h.beginPath(),h.arc(0,0,104,0,Math.PI*2),h.stroke(),h.strokeStyle="rgba(29,27,79,0.12)",h.lineWidth=4,h.beginPath(),h.arc(0,0,70,0,Math.PI*2),h.stroke()});this.keep(u),l(new Ae(this.keep(new Fs(e.hx*.96,36)),this.decal(u)))}else if(e.look==="finish"){let c=xr(64,64,h=>{h.fillStyle=se,h.fillRect(0,0,64,64),h.fillStyle=Wt,h.fillRect(0,0,32,32),h.fillRect(32,32,32,32)});c.wrapS=c.wrapT=Ds,c.repeat.set(e.hx,1),c.magFilter=un,this.keep(c);let u=new Ae(this.keep(new vr(e.hx*2-.4,1.6)),this.keep(new ci({map:c,roughness:.6,metalness:0})));u.position.set(i,a,s+e.hz-1.3),u.rotation.x=-Math.PI/2,u.receiveShadow=!0,t.add(u)}}buildMovers(){for(let e of this.level.solids){if(!e.motion&&!e.active)continue;let t=new $n,i=!!e.active,r=i?this.keep(new ci({color:e.color,roughness:.42,metalness:0,transparent:!0})):this.gloss(e.color),s=this.solid(new Ae(this.keep(Ah(e,0)),r)),o=new Ae(this.keep(Ah(e,Ri)),this.ink);t.add(s,o),this.dress(e,t,0,0,0,0),t.position.set(e.x,e.y,e.z),t.rotation.y=e.yaw,this.scene.add(t);let a;e.look==="geyser"&&(a=new Ae(this.keep(new Qt(e.hx*.4,e.hx*.82,3.6,20,1,!0)),this.keep(new bn({color:se,transparent:!0,opacity:.62,depthWrite:!1,side:jn}))),a.position.y=e.hy+1.8,t.add(a)),this.movers.push({solid:e,group:t,body:s,outline:o,timed:i,plume:a})}}buildBalls(){for(let e of this.level.balls){let t=new $n,i;e.look==="mochi"&&(i=xr(256,128,l=>{l.fillStyle=e.color,l.fillRect(0,0,256,128),l.fillStyle=Wt;for(let c of[108,148])l.beginPath(),l.arc(c,58,5,0,Math.PI*2),l.fill();l.strokeStyle=Wt,l.lineWidth=3,l.beginPath(),l.arc(128,62,8,.15*Math.PI,.85*Math.PI),l.stroke(),l.fillStyle="rgba(255,122,182,0.45)";for(let c of[94,162])l.beginPath(),l.arc(c,68,7,0,Math.PI*2),l.fill()}),this.keep(i));let r=this.keep(new Nn(e.r,28,18)),s=this.solid(new Ae(r,i?this.gloss("#ffffff",{map:i}):this.gloss(e.color))),o=new Ae(this.keep(new Nn(e.r+Ri,20,14)),this.ink);t.add(s,o);let a;if(e.look==="lantern"&&e.anchor){s.scale.set(1,1.12,1),o.scale.set(1,1.12,1);for(let c of[e.r*1.05,-e.r*1.05]){let u=new Ae(this.keep(new Qt(e.r*.45,e.r*.45,.22,16)),this.gloss(Wt));u.position.y=c,s.add(u)}a=new Ae(this.keep(new Qt(.05,.05,1,6)),this.keep(new bn({color:Wt}))),this.scene.add(a);let l=new Ae(this.keep(new Hi(11,.35,.35)),this.gloss(this.level.theme.accent));l.position.set(e.anchor.x,e.anchor.y,e.anchor.z),this.scene.add(l)}this.scene.add(t),this.ballViews.push({ball:e,group:t,mesh:s,rope:a,last:new P(NaN,0,0)})}}buildWinds(){let e=q1(7);for(let t of this.level.winds){let i=this.keep(new bn({color:se,transparent:!0,opacity:.7,depthWrite:!1,side:jn})),r=this.keep(new vr(1.5,.09)),s=Math.max(8,Math.min(26,Math.round((t.x1-t.x0)*(t.z1-t.z0)/7))),o=[],a=[],l=Math.atan2(-t.az,t.ax);for(let c=0;c<s;c++){let u=new Ae(r,i);u.rotation.order="YXZ",u.rotation.set(-Math.PI/2,l,0),a.push(e(),e(),e()),this.scene.add(u),o.push(u)}this.windViews.push({zone:t,streaks:o,seeds:a,material:i})}}buildMarkers(){let e=this.level.theme,t=this.keep(new Qt(.09,.09,2.6,8)),i=new Ll;i.moveTo(0,0),i.lineTo(1.1,-.38),i.lineTo(0,-.76);let r=this.keep(new _h(i));this.level.checkpoints.forEach((p,m)=>{if(m!==0)for(let x of[-1,1]){let g=p.x+x*(p.width/2+1.1),d=new Ae(t,this.gloss(Wt));d.position.set(g,p.y+1.3,p.z);let v=new Ae(r,this.keep(new bn({color:x<0?e.accent:e.accent2,side:jn})));v.position.set(g,p.y+2.55,p.z),x>0&&(v.scale.x=-1),this.scene.add(d,v)}});let s=this.level.finish,o=s.z+s.hz+1,a=this.keep(new Qt(.28,.28,5,14)),l=this.keep(new Qt(.28+Ri,.28+Ri,5+Ri*2,14));for(let p of[-1,1]){let m=new Ae(a,this.gloss(e.accent));m.position.set(s.x+p*(s.hx-.2),s.y+2.5,o),m.add(new Ae(l,this.ink)),this.scene.add(m)}let c=xr(1024,192,p=>{p.fillStyle=Te,p.fillRect(0,0,1024,192),p.fillStyle=Wt,p.font=`900 130px ${this.font}`,p.textAlign="center",p.textBaseline="middle",p.fillText("GOAL!  \u30B4\u30FC\u30EB!",512,104)});this.keep(c);let u=s.hx*2,h=new Ae(this.keep(new Dn(u,u*.1875,.3,2,.1)),this.gloss(Te));h.position.set(s.x,s.y+5.2,o),h.add(new Ae(this.keep(new Dn(u+Ri*2,u*.1875+Ri*2,.3+Ri*2,2,.1)),this.ink));let f=new Ae(this.keep(new vr(u-.2,u*.1875-.2)),this.keep(new bn({map:c})));f.position.z=.16,h.add(f),this.scene.add(h)}buildDecor(){let e=(i,r,s)=>{let o=new Ae(this.keep(i),this.gloss(r));return o.add(new Ae(this.keep(s),this.ink)),o},t=this.keep(new ci({color:se,roughness:1,metalness:0,emissive:se,emissiveIntensity:.16}));for(let i of this.level.decor){let r=new $n;r.position.set(i.x,i.y,i.z),r.scale.setScalar(i.s);let s=0,o=0;if(i.kind==="cloud"){for(let[a,l,c]of[[-.9,0,.75],[0,.25,1],[.95,0,.7]]){let u=new Ae(this.keep(new Nn(c,18,12)),t);u.position.set(a,l,0),u.scale.y=.72,r.add(u)}o=.25}else if(i.kind==="lantern"){let a=e(new Nn(.7,16,12),i.color,new Nn(.76,14,10));a.scale.y=1.15,r.add(a);for(let l of[.78,-.78]){let c=new Ae(this.keep(new Qt(.32,.32,.2,12)),this.gloss(Wt));c.position.y=l,r.add(c)}o=.18}else if(i.kind==="sushi"){let a=e(new Qt(1.1,.9,.22,24),se,new Qt(1.16,.96,.3,20)),l=e(new Dn(1.2,.5,.7,3,.2),se,new Dn(1.3,.6,.8,2,.24));l.position.y=.36;let c=e(new Dn(1.4,.28,.8,3,.12),i.color,new Dn(1.5,.38,.9,2,.16));c.position.y=.68,r.add(a,l,c),s=.5,o=.2}else if(i.kind==="pinwheel"){let a=new Ae(this.keep(new Qt(.07,.07,3,8)),this.gloss(Wt));a.position.y=-1.5;let l=new $n;for(let c=0;c<4;c++){let u=e(new is(.42,1.1,3),c%2?i.color:se,new is(.5,1.22,3));u.rotation.z=c/4*Math.PI*2,u.position.set(Math.cos(c/4*Math.PI*2+Math.PI/2)*.55,Math.sin(c/4*Math.PI*2+Math.PI/2)*.55,0),l.add(u)}r.add(a,l),this.spinners.push({obj:l,speed:-3,bob:0,baseY:0}),r.userData.axis="z"}else if(i.kind==="torii"){for(let c of[-4.2,4.2]){let u=e(new Qt(.3,.34,4.6,12),i.color,new Qt(.36,.4,4.7,12));u.position.set(c,2.3,0),r.add(u)}let a=e(new Dn(11,.5,.6,2,.12),i.color,new Dn(11.1,.6,.7,2,.14));a.position.y=4.7;let l=e(new Dn(9.2,.36,.45,2,.1),i.color,new Dn(9.3,.46,.55,2,.12));l.position.y=3.8,r.add(a,l)}else if(i.kind==="plane"){let a=e(new is(.5,1.6,3),se,new is(.58,1.75,3));a.rotation.set(Math.PI/2,0,Math.PI),a.scale.z=.35;let l=new Ae(this.keep(new is(.2,1.5,3)),this.gloss(i.color));l.rotation.set(Math.PI/2,0,0),l.position.y=-.12,r.add(a,l),r.rotation.y=i.x>0?Math.PI/2:-Math.PI/2,o=.3}else i.kind==="star"&&(r.add(e(new Ul(.7),i.color,new Ul(.8))),s=1.2,o=.3);this.scene.add(r),(s||o)&&this.spinners.push({obj:r,speed:s,bob:o,baseY:i.y})}}addRacer(e,t,i,r){if(this.racers.has(e))return;let s=nl(t),o=this.racerParts??={foot:this.keep(new Nn(.17,14,10)),hand:this.keep(new Nn(.125,12,8)),handHull:this.keep(new Nn(.125+Ri*.8,10,8)),shoe:this.keep(new ci({color:Wt,roughness:.5,metalness:0})),glove:this.keep(new ci({color:se,roughness:.35,metalness:0})),unseen:this.keep(new bn({colorWrite:!1,depthWrite:!1}))},a=new $n,l=new $n;l.position.y=la;let c=[-1,1].map(T=>{let b=new Ae(o.hand,o.glove);return b.castShadow=!0,b.position.set(T*H1,V1-la,0),b.add(new Ae(o.handHull,this.ink)),l.add(b),b}),u=[-1,1].map(T=>{let b=new Ae(o.foot,o.shoe);return b.castShadow=!0,b.scale.set(1,.62,1.45),b.position.set(T*.2,.1,-.04),a.add(b),b}),h=new Ae(o.foot,o.unseen);h.castShadow=!0,h.scale.set(3,3,1.6),h.position.y=H0-la,l.add(h),a.add(l),a.visible=!1;let f=document.createElement("canvas");f.width=f.height=256;let p=f.getContext("2d"),m=new Pl(f);m.colorSpace=qn,this.keep(m);let x=T=>{if(p.clearRect(0,0,256,256),T){p.save(),p.shadowColor=se,p.shadowBlur=0;for(let[b,A]of[[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]])p.shadowOffsetX=b,p.shadowOffsetY=A,p.drawImage(T,14,14,228,228);p.restore(),p.drawImage(T,14,14,228,228)}else p.fillStyle=s.color,p.strokeStyle=Wt,p.lineWidth=9,p.beginPath(),p.arc(128,128,100,0,Math.PI*2),p.fill(),p.stroke();m.needsUpdate=!0};x();let g=new Image;g.onload=()=>x(g),g.src=hu(t);let d=new sa(this.keep(new Os({map:m,transparent:!0,alphaTest:.08})));d.scale.setScalar(Fl),d.visible=!1;let v=r?"\u25BC":i,y=xr(384,96,T=>{if(T.font=`900 ${r?64:44}px ${this.font}`,T.textAlign="center",T.textBaseline="middle",r)T.lineWidth=12,T.lineJoin="round",T.strokeStyle=Wt,T.strokeText(v,192,50),T.fillStyle=Te,T.fillText(v,192,50);else{let b=v.length>10?v.slice(0,9)+"\u2026":v,A=Math.min(360,T.measureText(b).width+44);T.fillStyle=se,T.strokeStyle=Wt,T.lineWidth=6,T.beginPath(),T.roundRect(192-A/2,16,A,64,32),T.fill(),T.stroke(),T.fillStyle=Wt,T.fillText(b,192,50)}});this.keep(y);let M=new sa(this.keep(new Os({map:y,transparent:!0,depthWrite:!1})));M.scale.set(r?1.5:2.2,r?.375:.55,1),M.visible=!1,M.renderOrder=5;let R=new Ae(this.keep(new Fs(.5,20)),this.keep(new bn({color:Wt,transparent:!0,opacity:.2,depthWrite:!1})));R.rotation.x=-Math.PI/2,R.visible=!1,R.renderOrder=2,this.scene.add(a,d,M,R),this.racers.set(e,{root:a,lean:l,feet:u,hands:c,head:d,tag:M,shadow:R,me:r,phase:Math.random()*6,spin:0,yaw:0,lastX:0,lastY:0,lastZ:0,seen:!1})}removeRacer(e){let t=this.racers.get(e);t&&(this.scene.remove(t.root,t.head,t.tag,t.shadow),this.racers.delete(e))}placeRacer(e,t,i,r,s,o,a,l,c){let u=this.racers.get(e);if(!u)return;if(s===3){u.root.visible=u.head.visible=u.tag.visible=u.shadow.visible=!1,u.seen=!1;return}let h=u.seen&&c>0?(t-u.lastX)/c:0,f=u.seen&&c>0?(i-u.lastY)/c:0,p=u.seen&&c>0?(r-u.lastZ)/c:0,m=!u.seen;u.lastX=t,u.lastY=i,u.lastZ=r,u.seen=!0;let x=Math.hypot(h,p);if(m)u.yaw=0;else if(x>1){let A=Math.atan2(-h,-p)-u.yaw;A-=Math.round(A/(Math.PI*2))*Math.PI*2,u.yaw+=A*(1-Math.exp(-c*12))}let g=0,d=0,v=0,y=1,M=0,R=0,T=0;s===2?(u.spin+=c*13,g=-u.spin,v=.25,R=.3):s===1?(u.spin=0,g=-.5,y=.68,v=o?-.2:-.05,R=1):o?(u.spin=0,x>.6?(u.phase+=c*(6+x*1.3),M=Math.sin(u.phase),d=Math.sin(u.phase)*.09,v=Math.abs(Math.cos(u.phase))*.07):(u.phase+=c*2.4,y=1+Math.sin(u.phase)*.025)):(u.spin=0,y=1+Math.max(-.12,Math.min(.16,f*.014)),R=.75,T=.45,M=Math.sin(u.phase)*.4),u.root.position.set(t,i,r),u.root.rotation.y=u.yaw,u.lean.position.y=la+v,u.lean.rotation.set(g,0,d),u.feet.forEach((A,L)=>{let _=L?1:-1,S=M*_;s===1?(A.position.set(_*.2,.14+v*.5,.42),A.rotation.x=1.2):(A.position.set(_*.2,.1+Math.max(0,-S)*.13+T*.2,-.04-S*.24+T*.12),A.rotation.x=S*.5+T*.9),A.visible=s!==2}),u.hands.forEach((A,L)=>{let _=L?1:-1,S=-M*_;A.position.set(_*(H1+R*.04),V1-la+R*.26,-S*.22-R*.16)}),u.root.visible=!0,Gi.set(0,H0-la,0),u.lean.updateWorldMatrix(!0,!1),Gi.applyMatrix4(u.lean.matrixWorld),u.head.position.copy(Gi),u.head.position.y-=(1-y)*Fl*.4,u.head.scale.set(Fl/Math.sqrt(y),Fl*y,1),u.head.material.rotation=s===2?u.spin:d*.8,u.head.visible=!0,u.head.material.opacity=a>.3&&Math.floor(l*12)%2===0?.45:1,u.tag.position.set(t,i+H0+Fl*.6+v+(u.me?.1+Math.sin(l*5)*.08:.12),r),u.tag.visible=!0;let b=mp(this.level,t,i,r,l);if(b>-1/0){let A=Math.max(0,i-b),L=Math.max(.35,1-A*.12);u.shadow.position.set(t,b+.03,r),u.shadow.scale.setScalar(L),u.shadow.material.opacity=.2*L,u.shadow.visible=!0}else u.shadow.visible=!1}bump(e=.35){this.shake=Math.max(this.shake,e)}resize(e,t,i){this.size={width:e,height:t,dpr:i},this.renderer.setPixelRatio(Math.min(this.economy?1.25:2,i)),this.renderer.setSize(e,t,!1),this.portrait=t>e,this.camera.aspect=e/Math.max(1,t),this.camera.fov=this.portrait?72:58,this.camera.updateProjectionMatrix()}render(e,t,i,r){for(let m of this.movers){let x=m.solid;if(sr(x,e,hn),m.group.position.set(hn.x,hn.y,hn.z),m.group.rotation.y=hn.yaw,m.timed){let g=x.active(e),d=m.body.material;m.plume?(m.outline.visible=!0,d.opacity=g===0?.7:1,m.plume.visible=g!==0,m.plume.scale.set(1,(g===1?.6:.92)+.08*Math.sin(e*23),1),m.plume.position.y=x.hy+1.8*m.plume.scale.y):(m.outline.visible=g!==0,m.body.castShadow=g!==0,d.opacity=g===0?.13:g===1&&Math.floor(e*9)%2===0?.5:1,d.depthWrite=g!==0,m.group.position.y=hn.y-(g===0?.25:0))}}for(let m of this.ballViews){let x=m.ball,g=!x.active||x.active(e);if(m.group.visible=g,m.rope&&(m.rope.visible=g),!!g){if(x.pos(e,hn),Gi.set(hn.x,hn.y,hn.z),x.look!=="lantern"){if(!Number.isNaN(m.last.x)){let d=Gi.x-m.last.x,v=Gi.z-m.last.z,y=Math.hypot(d,v);y>1e-5&&y<2&&(W0.set(v/y,0,-d/y),G0.setFromAxisAngle(W0,y/x.r),m.mesh.quaternion.premultiply(G0))}}else if(x.anchor&&m.rope){let d=x.anchor.x-hn.x,v=x.anchor.y-hn.y,y=Math.hypot(d,v);m.rope.position.set((x.anchor.x+hn.x)/2,(x.anchor.y+hn.y)/2,hn.z),m.rope.scale.set(1,y,1),m.rope.quaternion.setFromUnitVectors(xC,W0.set(d/y,v/y,0)),m.group.rotation.z=hn.yaw}m.last.copy(Gi),m.group.position.copy(Gi)}}for(let m of this.windViews){let x=m.zone,g=x.pulse?x.pulse(e):1;m.material.opacity=.75*g;let d=x.x1-x.x0,v=x.z1-x.z0,y=Math.hypot(x.ax,x.az)*1.6,M=x.ax/(Math.hypot(x.ax,x.az)||1),R=x.az/(Math.hypot(x.ax,x.az)||1);m.streaks.forEach((T,b)=>{let A=m.seeds[b*3],L=m.seeds[b*3+1],_=m.seeds[b*3+2],S=e*y*(.7+_*.6),U=x.x0+((A*d+M*S)%d+d)%d,z=x.z0+((L*v+R*S)%v+v)%v,H=mp(this.level,U,50,z,e);T.position.set(U,(H>-1/0?H:x.y0+2)+.35+_*1.7,z),T.visible=g>.05})}for(let m of this.belts)m.texture.offset.y=m.speed*e%1;for(let m of this.spinners)m.speed&&(m.obj.parent?.userData.axis==="z"?m.obj.rotation.z=e*m.speed:m.obj.rotation.y=e*m.speed),m.bob&&(m.obj.position.y=m.baseY+Math.sin(e*.9+m.obj.position.z)*m.bob);let s=this.portrait?9.6:8.6,o=this.portrait?5.5:4.6,a=r*r*(3-2*r)*Math.PI,l=i.x*.82+Math.sin(a)*s,c=i.z+Math.cos(a)*s,u=i.y+o-r*2.2;this.camReady||(this.camPos.set(l,u,c),this.camLook.set(i.x*.9,i.y+1,i.z-3.5),this.camReady=!0);let h=1-Math.exp(-t*9),f=1-Math.exp(-t*3.2);this.camPos.x+=(l-this.camPos.x)*h,this.camPos.z+=(c-this.camPos.z)*h,this.camPos.y+=(u-this.camPos.y)*f;let p=4.5*(1-r);this.camLook.x+=(i.x*.9-this.camLook.x)*h,this.camLook.z+=(i.z-p-this.camLook.z)*h,this.camLook.y+=(i.y+1-this.camLook.y)*f,this.camera.position.copy(this.camPos),this.shake>.001&&(this.camera.position.x+=Math.sin(e*71)*this.shake,this.camera.position.y+=Math.cos(e*83)*this.shake*.7,this.shake*=Math.exp(-t*9)),this.camera.lookAt(this.camLook),this.sky.position.copy(this.camera.position),this.sun.target.position.set(i.x*.6,i.y,i.z-V0*.45),this.sun.position.copy(this.sun.target.position).addScaledVector(W1,80),this.sun.target.updateMatrixWorld(),this.renderer.render(this.scene,this.camera),this.pace()}pace(){let e=performance.now(),t=e-this.frameAt;this.frameAt=e,!(this.economy>=2||t<=0||t>100)&&(this.frameMs+=(t-this.frameMs)*.05,!(++this.settled<150)&&(this.frameMs<27||(this.economy++,this.settled=0,this.frameMs=16,this.economy===1?this.resize(this.size.width,this.size.height,this.size.dpr):this.sun.castShadow=!1)))}cut(){this.camReady=!1}dispose(){for(let e of this.disposables)e.dispose();this.ink.dispose(),this.sun.shadow.dispose(),this.renderer.dispose()}};var Wi=null,SC=!1;function Ch(){try{if(!Wi){let n=window.AudioContext??window.webkitAudioContext;if(!n)return;Wi=new n}Wi.state==="suspended"&&Wi.resume()}catch{}}function Zn(n,e,t,i,r,s=0){if(!Wi||SC||Wi.state!=="running")return;let o=Wi.currentTime+s,a=Wi.createOscillator(),l=Wi.createGain();a.type=i,a.frequency.setValueAtTime(n,o),a.frequency.exponentialRampToValueAtTime(Math.max(30,e),o+t),l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(r,o+.012),l.gain.exponentialRampToValueAtTime(1e-4,o+t),a.connect(l).connect(Wi.destination),a.start(o),a.stop(o+t+.03)}var Ci={jump:()=>Zn(330,620,.16,"square",.05),dive:()=>Zn(520,260,.2,"sawtooth",.04),land:()=>Zn(160,90,.08,"sine",.08),bounce:()=>{Zn(180,90,.22,"sine",.16),Zn(420,880,.2,"triangle",.06)},hit:()=>{Zn(240,70,.26,"sawtooth",.08),Zn(90,50,.2,"square",.06)},fall:()=>Zn(700,110,.5,"triangle",.07),checkpoint:()=>{Zn(660,660,.09,"triangle",.07),Zn(990,990,.16,"triangle",.07,.09)},finish:()=>[523,659,784,1047].forEach((n,e)=>Zn(n,n,.22,"triangle",.09,e*.11)),count:()=>Zn(440,440,.14,"square",.05),go:()=>Zn(880,880,.4,"square",.06)};var wC=.42,Ph=n=>Math.round(n*100)/100,Ih=class{constructor(e){this.opts=e;this.input={mx:0,mz:0,jump:!1,dive:!1};this.me=null;this.prev={x:0,y:0,z:0};this.simT=0;this.raf=0;this.last=0;this.lastSend=0;this.lastHud=0;this.lastCount=99;this.finishedAt=-1;this.remote=new Map;this.slots=new Map;this.keys=new Set;this.stick={x:0,y:0};this.disposed=!1;this.focus={x:0,y:0,z:0};this.scratch={x:0,y:0,z:0};this.onKeyDown=e=>{if(e.repeat)return;let t=e.target?.tagName;t==="INPUT"||t==="TEXTAREA"||(this.keys.add(e.code),(e.code==="Space"||e.code.startsWith("Arrow"))&&e.preventDefault())};this.onKeyUp=e=>this.keys.delete(e.code);this.onBlur=()=>{this.keys.clear(),this.stick.x=this.stick.y=0};this.frame=e=>{if(this.disposed)return;this.raf=requestAnimationFrame(this.frame);let t=Math.min(.1,Math.max(0,(e-this.last)/1e3));this.last=e;let i=this.opts.raceTime(),r=this.level,s=this.me,o=i<0?Math.ceil(-i):0;if(o!==this.lastCount&&(o>=1&&o<=3?Ci.count():o===0&&this.lastCount===1&&Ci.go(),this.lastCount=o),s){if(this.readInput(),i<=0)this.simT=0;else{i-this.simT>.5&&(this.simT=i-wo);let v=0;for(;this.simT+wo<=i&&v<8;){this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z,jx(r,s,this.input,this.simT,wo),this.simT+=wo,v++;let y=s.events;y&&(y&1&&Ci.jump(),y&128&&Ci.dive(),y&2&&Ci.land(),y&16&&Ci.bounce(),y&32&&Ci.checkpoint(),y&4&&(Ci.hit(),this.scene.bump(.3),navigator.userActivation?.hasBeenActive&&navigator.vibrate?.(40)),y&8&&Ci.fall(),y&64&&this.finishedAt<0&&(this.finishedAt=this.simT,Ci.finish(),this.opts.onFinish?.(this.simT))),s.mode===0&&Math.abs(s.z-this.prev.z)+Math.abs(s.x-this.prev.x)>3&&(this.prev.x=s.x,this.prev.y=s.y,this.prev.z=s.z)}}let m=i<=0?1:Math.max(0,Math.min(1,(i-this.simT)/wo)),x=this.prev.x+(s.x-this.prev.x)*m,g=this.prev.y+(s.y-this.prev.y)*m,d=this.prev.z+(s.z-this.prev.z)*m;this.scene.placeRacer(this.opts.meId,x,g,d,s.mode,s.grounded,s.shield,i,t),s.mode!==3&&(this.focus.x=x,this.focus.y=g,this.focus.z=d),i>0&&e-this.lastSend>=(this.opts.sendEvery??200)&&(this.finishedAt<0||this.simT-this.finishedAt<2)&&(this.lastSend=e,this.opts.onSend?.({x:Ph(s.x),y:Ph(s.y),z:Ph(s.z),m:s.mode,g:s.grounded,p:s.mode===4?1:Math.round(gp(r,s.x,s.y,s.z)*1e3)/1e3,rt:Ph(this.simT)}))}let a=i-wC,l={},c=null,u=-1;for(let m of this.opts.racers){if(m.id===this.opts.meId&&s){l[m.id]=s.mode===4?1:gp(r,s.x,s.y,s.z);continue}let x=this.remote.get(m.id);if(!x||x.length===0||i<=0){bo(r,0,this.slots.get(m.id)??0,this.opts.racers.length,this.scratch),this.scene.placeRacer(m.id,this.scratch.x,this.scratch.y,this.scratch.z,0,!0,0,i,t),l[m.id]=0;continue}let g=x.length-1;for(;g>0&&x[g-1].rt>a;)g--;let d=x[g],v=g>0?x[g-1]:d,y=d.rt>v.rt?(a-v.rt)/(d.rt-v.rt):1;y=Math.max(0,Math.min(1,y)),(Math.abs(d.z-v.z)+Math.abs(d.x-v.x)>9||v.m===3)&&(y=y<.5?0:1);let R=v.x+(d.x-v.x)*y,T=v.y+(d.y-v.y)*y,b=v.z+(d.z-v.z)*y,A=x[x.length-1];this.scene.placeRacer(m.id,R,T,b,y<.5?v.m:d.m,y<.5?v.g:d.g,0,i,t),l[m.id]=A.p,A.m!==4&&A.p>u&&(u=A.p,c=m.id,this.scratch.x=R,this.scratch.y=T,this.scratch.z=b)}let h=null,f=!!s&&s.mode===4&&this.simT-this.finishedAt>2.5;(!s||f)&&c?(h=c,this.focus.x=this.scratch.x,this.focus.y=this.scratch.y,this.focus.z=this.scratch.z):!s&&!c&&bo(r,0,0,1,this.focus);let p=i<0?Math.max(0,Math.min(1,-i/2.6)):0;if(this.scene.render(i,t,this.focus,p),this.opts.onHud&&e-this.lastHud>120){this.lastHud=e;let m=this.opts.meId?l[this.opts.meId]??0:0,x=1;for(let g of this.opts.racers)g.id!==this.opts.meId&&(l[g.id]??0)>m&&x++;this.opts.onHud({t:i,place:x,racing:this.opts.racers.length,progress:l,finished:!!s&&s.mode===4,checkpoint:s?.checkpoint??0,falls:s?.falls??0,watching:h})}};this.level=pu(e.levelIndex),this.scene=new Rh(e.canvas,this.level),e.racers.forEach((t,i)=>{this.slots.set(t.id,i),this.scene.addRacer(t.id,t.avatar,t.name,t.id===e.meId)}),e.meId&&this.slots.has(e.meId)&&(this.me=qx(this.level,this.slots.get(e.meId),e.racers.length),e.startCheckpoint&&(this.me.checkpoint=Math.max(0,Math.min(this.level.checkpoints.length-1,e.startCheckpoint)),bo(this.level,this.me.checkpoint,this.me.slot,this.me.slots,this.me)),this.prev.x=this.me.x,this.prev.y=this.me.y,this.prev.z=this.me.z),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),window.addEventListener("blur",this.onBlur),this.resize(),this.last=performance.now(),this.raf=requestAnimationFrame(this.frame)}resize(){let e=this.opts.canvas,t=e.clientWidth||window.innerWidth,i=e.clientHeight||window.innerHeight;this.scene.resize(t,i,window.devicePixelRatio||1)}setStick(e,t){this.stick.x=e,this.stick.y=t}press(e,t){this.keys[t?"add":"delete"](e==="jump"?"Touch:jump":"Touch:dive")}setRemote(e,t){if(e===this.opts.meId)return;let i=this.remote.get(e);i||this.remote.set(e,i=[]);let r=i[i.length-1];r&&t.rt<=r.rt||(i.push(t),i.length>8&&i.shift())}readInput(){let e=this.keys,t=this.stick.x,i=this.stick.y;(e.has("ArrowLeft")||e.has("KeyA"))&&(t-=1),(e.has("ArrowRight")||e.has("KeyD"))&&(t+=1),(e.has("ArrowUp")||e.has("KeyW"))&&(i-=1),(e.has("ArrowDown")||e.has("KeyS"))&&(i+=1);let r=Math.hypot(t,i);r>1&&(t/=r,i/=r),this.input.mx=t,this.input.mz=i,this.input.jump=e.has("Space")||e.has("Touch:jump"),this.input.dive=e.has("ShiftLeft")||e.has("ShiftRight")||e.has("KeyE")||e.has("Touch:dive")}dispose(){this.disposed=!0,cancelAnimationFrame(this.raf),window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),window.removeEventListener("blur",this.onBlur),this.scene.dispose()}};var Be=pn(Wn()),j1="enchatto_dash_cp_";function bC(n){if(!n)return 0;try{return Number(sessionStorage.getItem(j1+n)??0)||0}catch{return 0}}var EC={t:-99,place:1,racing:1,progress:{},finished:!1,checkpoint:0,falls:0,watching:null};function X0(n){let{levelIndex:e,racers:t,meId:i,coarse:r,lang:s}=n,o=rl(s),a=(0,fn.useRef)(null),l=(0,fn.useRef)(null),c=(0,fn.useRef)(null),u=(0,fn.useRef)(null),h=(0,fn.useRef)(n);h.current=n;let[f,p]=(0,fn.useState)(()=>({...EC,t:n.raceTime()})),[m,x]=(0,fn.useState)(!1),[g,d]=(0,fn.useState)({}),v=t.map(G=>G.id).join(","),y=(0,fn.useMemo)(()=>pu(e),[e]);(0,fn.useEffect)(()=>{let G=a.current;if(!G)return;let F,ee=bC(h.current.resumeKey);try{F=new Ih({canvas:G,levelIndex:e,racers:h.current.racers,meId:i,raceTime:()=>h.current.raceTime(),onSend:Ee=>h.current.onSend?.(Ee),onFinish:Ee=>h.current.onFinish?.(Ee),onHud:Ee=>{p(Ee);let He=h.current.resumeKey;if(He&&Ee.checkpoint>ee){ee=Ee.checkpoint;try{sessionStorage.setItem(j1+He,String(ee))}catch{}}},sendEvery:h.current.sendEvery,startCheckpoint:Math.max(h.current.startCheckpoint??0,ee)})}catch(Ee){console.error("Chatto Dash could not start:",Ee),x(!0);return}l.current=F,h.current.onGame?.(F);let ne=()=>F.resize();window.addEventListener("resize",ne);let re=typeof ResizeObserver=="function"?new ResizeObserver(ne):null;return re?.observe(G),()=>{window.removeEventListener("resize",ne),re?.disconnect(),h.current.onGame?.(null),l.current=null,F.dispose()}},[e,i,v]);let M=(0,fn.useRef)(null),R=(0,fn.useRef)({x:0,y:0}),T=G=>{Ch(),!(M.current!==null||!i)&&(M.current=G.pointerId,R.current={x:G.clientX,y:G.clientY},G.currentTarget.setPointerCapture?.(G.pointerId),c.current&&(c.current.style.display="block",c.current.style.left=`${G.clientX}px`,c.current.style.top=`${G.clientY}px`),u.current&&(u.current.style.transform=""))},b=G=>{if(G.pointerId!==M.current)return;let F=46,ee=(G.clientX-R.current.x)/F,ne=(G.clientY-R.current.y)/F,re=Math.hypot(ee,ne);re>1&&(ee/=re,ne/=re);let Ee=re<.14;l.current?.setStick(Ee?0:ee,Ee?0:ne),u.current&&(u.current.style.transform=`translate(${ee*F}px, ${ne*F}px)`)},A=G=>{G.pointerId===M.current&&(M.current=null,l.current?.setStick(0,0),c.current&&(c.current.style.display="none"))},L=G=>({onPointerDown:F=>{F.preventDefault(),Ch(),F.currentTarget.setPointerCapture?.(F.pointerId),l.current?.press(G,!0),d(ee=>({...ee,[G]:!0}))},onPointerUp:()=>{l.current?.press(G,!1),d(F=>({...F,[G]:!1}))},onPointerCancel:()=>{l.current?.press(G,!1),d(F=>({...F,[G]:!1}))},onLostPointerCapture:()=>{l.current?.press(G,!1),d(F=>({...F,[G]:!1}))}}),_=f.t,S=ir[e%ir.length],U=_<0?Math.ceil(-_):0,z=i?n.finishes[i]:void 0,H=Object.keys(n.finishes).length>0,Y=n.endsAt?Math.max(0,Math.ceil((n.endsAt-n.serverNow())/1e3)):null,O=i&&z!==void 0?1+Object.values(n.finishes).filter(G=>G<z).length:null;return(0,Be.jsxs)("div",{className:"dash-stage",onPointerDown:Ch,onContextMenu:G=>G.preventDefault(),children:[(0,Be.jsx)("canvas",{ref:a}),r&&i&&(0,Be.jsx)("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:"58%",touchAction:"none"},onPointerDown:T,onPointerMove:b,onPointerUp:A,onPointerCancel:A,onLostPointerCapture:A}),(0,Be.jsx)("div",{ref:c,className:"dash-stick",style:{display:"none"},children:(0,Be.jsx)("i",{ref:u})}),(0,Be.jsxs)("div",{className:"dash-hud",children:[(0,Be.jsxs)("div",{className:"dash-top",children:[n.onMinimize&&(0,Be.jsx)("button",{className:"ec-round-btn",onClick:n.onMinimize,"aria-label":o.minimize,title:o.minimize,style:{width:38,height:38,fontSize:20,boxShadow:"0 3px 0 var(--ink)"},children:"\u2013"}),(0,Be.jsxs)("span",{className:"dash-pill",style:{flexShrink:1,minWidth:0},children:[n.round+1,"/",n.rounds," \xB7 ",s==="ja"?S.ja:S.en]}),(0,Be.jsx)("span",{style:{flex:1}}),_>0&&(0,Be.jsx)("span",{className:"dash-pill clock",children:Mo(z??_)}),n.canEnd&&n.onEnd&&(0,Be.jsx)("button",{className:"dash-pill pink",onClick:n.onEnd,children:o.end})]}),i&&_>0&&!f.finished&&f.racing>1&&(0,Be.jsxs)("div",{className:"dash-place ec-outline",children:[rp(f.place,s),(0,Be.jsxs)("small",{children:[" / ",f.racing]})]}),(f.watching||!i)&&_>0&&(0,Be.jsx)("div",{style:{marginTop:8},children:(0,Be.jsxs)("span",{className:"dash-pill yellow",children:[o.watching,f.watching?`: ${t.find(G=>G.id===f.watching)?.name??""}`:""]})}),H&&!f.finished&&Y!==null&&_>0&&(0,Be.jsx)("div",{style:{marginTop:8},children:(0,Be.jsxs)("span",{className:"dash-pill pink",children:[o.hurry," ",Y]})})]}),t.length>0&&_>-4&&(0,Be.jsx)("div",{className:"dash-track","aria-hidden":!0,children:t.map(G=>(0,Be.jsx)("span",{className:G.id===i?"me":void 0,style:{bottom:`${Math.round((f.progress[G.id]??0)*100)}%`},children:(0,Be.jsx)(il,{id:G.avatar,size:G.id===i?30:22,border:2,shadow:!1})},G.id))}),(0,Be.jsx)("div",{className:"dash-center",children:m?(0,Be.jsx)("div",{className:"ec-card dash-card",children:(0,Be.jsx)("p",{style:{fontWeight:900},children:o.noWebgl})}):_<-3.2?(0,Be.jsxs)("div",{className:"ec-card dash-card",children:[(0,Be.jsxs)("div",{className:"ec-chunky",style:{fontSize:13,opacity:.6},children:[o.round," ",n.round+1,"/",n.rounds]}),(0,Be.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,lineHeight:1.15,margin:"4px 0 6px",textShadow:`0 3px 0 ${y.theme.accent2}`},children:s==="ja"?y.name.ja:y.name.en}),(0,Be.jsx)("p",{style:{fontSize:14,fontWeight:900,opacity:.8},children:s==="ja"?y.tagline.ja:y.tagline.en})]}):U>0?(0,Be.jsx)("div",{className:"dash-count ec-outline",children:U},U):_>=0&&_<.9?(0,Be.jsx)("div",{className:"dash-count ec-outline",style:{fontSize:96,color:"var(--yellow)"},children:o.go}):f.finished?(0,Be.jsxs)("div",{className:"ec-card dash-card",style:{marginBottom:"38vh"},children:[(0,Be.jsx)("h2",{className:"ec-chunky",style:{fontSize:28,textShadow:"0 3px 0 var(--yellow)"},children:o.finished}),O!==null&&z!==void 0&&(0,Be.jsxs)("p",{className:"ec-chunky",style:{fontSize:18,margin:"2px 0"},children:[t.length>1?`${rp(O,s)} \xB7 `:"",Mo(z)]}),f.racing>1&&(0,Be.jsxs)("p",{style:{fontSize:13,fontWeight:900,opacity:.7},children:[o.waitingOthers," ",Y!==null?Y:""]})]}):null}),i&&r&&!f.finished&&(0,Be.jsxs)("div",{className:"dash-buttons",children:[(0,Be.jsx)("div",{className:`dash-button dive${g.dive?" down":""}`,...L("dive"),children:o.dive}),(0,Be.jsx)("div",{className:`dash-button jump${g.jump?" down":""}`,...L("jump"),children:o.jump})]}),i&&!r&&_<6&&(0,Be.jsx)("div",{className:"dash-hint",children:o.howKeys})]})}var at=pn(Wn()),TC=5,Z1="enchatto_dash_bests",$1=["var(--pink-soft)","var(--yellow-soft)","var(--blue-soft)","#fff","var(--violet-soft)"];function AC(){try{let n=JSON.parse(localStorage.getItem(Z1)??"{}");return n&&typeof n=="object"?n:{}}catch{return{}}}function K1({avatar:n,lang:e,coarse:t,onClose:i,startCheckpoint:r}){let s=rl(e),[o,a]=(0,En.useState)(null),[l,c]=(0,En.useState)(0),[u,h]=(0,En.useState)(null),[f,p]=(0,En.useState)({}),[m,x]=(0,En.useState)(void 0);(0,En.useEffect)(()=>p(AC()),[]);let g=(0,En.useRef)(0),d=b=>{g.current=performance.now()+TC*1e3,x(f[String(b)]),h(null),a(b),c(A=>A+1)},v=(0,En.useCallback)(()=>(performance.now()-g.current)/1e3,[]),y=(0,En.useMemo)(()=>[{id:"me",avatar:n,name:""}],[n]),M=(0,En.useMemo)(()=>u===null?{}:{me:u},[u]),R=b=>{if(h(b),o===null)return;let A=String(o);if(f[A]!==void 0&&f[A]<=b)return;let L={...f,[A]:Math.round(b*100)/100};p(L);try{localStorage.setItem(Z1,JSON.stringify(L))}catch{}};if(o===null)return(0,at.jsx)(Hx,{children:(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)(ip,{name:Bx,size:56}),(0,at.jsxs)("h2",{className:"ec-chunky",style:{fontSize:24,margin:"2px 0 2px",textShadow:"0 3px 0 var(--yellow)"},children:[s.title," \xB7 ",s.practice]}),(0,at.jsx)("p",{style:{fontSize:12.5,fontWeight:700,opacity:.75,marginBottom:12,lineHeight:1.45},children:s.practiceBlurb}),(0,at.jsx)("div",{style:{display:"flex",justifyContent:"center",marginBottom:12},children:(0,at.jsx)(il,{id:n,size:54})}),(0,at.jsx)("div",{className:"dash-rows",style:{marginBottom:12},children:ir.map((b,A)=>{let L=f[String(A)];return(0,at.jsxs)("button",{className:"dash-row dash-course",style:{background:$1[A%$1.length]},onClick:()=>d(A),children:[(0,at.jsx)("span",{className:"n",children:A+1}),(0,at.jsx)("span",{className:"name",children:e==="ja"?b.ja:b.en}),(0,at.jsx)("span",{className:"time",children:L!==void 0?`${s.best} ${Mo(L)}`:s.noBest}),(0,at.jsx)("span",{className:"go","aria-hidden":!0,children:"\u25B6"})]},A)})}),(0,at.jsx)("p",{style:{fontSize:11.5,fontWeight:900,opacity:.6,marginBottom:i?12:0},children:t?s.howTouch:s.howKeys}),i&&(0,at.jsx)("button",{className:"ec-btn white",style:{fontSize:17},onClick:i,children:s.close})]})});let T=(o+1)%ir.length;return(0,at.jsxs)(at.Fragment,{children:[(0,at.jsx)(X0,{levelIndex:o,round:o,rounds:ir.length,racers:y,meId:"me",raceTime:v,serverNow:Date.now,finishes:M,coarse:t,lang:e,canEnd:!1,onFinish:R,onMinimize:()=>a(null),startCheckpoint:r},`${o}:${l}`),u!==null&&(0,at.jsx)("div",{className:"dash-after",children:(0,at.jsxs)("div",{className:"ec-card dash-card",children:[(0,at.jsx)("p",{className:"ec-chunky",style:{fontSize:15,marginBottom:10},children:m===void 0||u<m?s.newBest:`${s.best} ${Mo(m)}`}),(0,at.jsxs)("div",{style:{display:"flex",gap:8},children:[(0,at.jsx)("button",{className:"ec-btn white",style:{flex:1,fontSize:15},onClick:()=>d(o),children:s.again}),(0,at.jsxs)("button",{className:"ec-btn pink",style:{flex:1.6,fontSize:14,whiteSpace:"nowrap",paddingInline:6},onClick:()=>d(T),children:[s.nextNow," \u25B6"]})]}),(0,at.jsx)("button",{className:"ec-btn white",style:{marginTop:8,fontSize:14},onClick:()=>a(null),children:s.allCourses})]})})]})}var nM=pn(Wn());function Q1(n){window.webkit?.messageHandlers?.enchattoDash?.postMessage(n)}var eM=new URLSearchParams(location.search),tM=eM.get("lang")==="ja"?"ja":"en";document.documentElement.lang=tM;(0,J1.createRoot)(document.getElementById("root")).render((0,nM.jsx)(K1,{avatar:eM.get("avatar")??uu[0].id,lang:tM,coarse:!0,onClose:()=>Q1({type:"close"})}));Q1({type:"ready"});})();
