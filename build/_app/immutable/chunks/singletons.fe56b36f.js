import{w as u}from"./index.834d9e00.js";var _;const k=((_=globalThis.__sveltekit_17pl7ox)==null?void 0:_.base)??"";var h;const m=((h=globalThis.__sveltekit_17pl7ox)==null?void 0:h.assets)??k,w="1699382824985",T="sveltekit:snapshot",x="sveltekit:scroll",y="sveltekit:index",f={tap:1,hover:2,viewport:3,eager:4,off:-1};function I(e){let t=e.baseURI;if(!t){const n=e.getElementsByTagName("base");t=n.length?n[0].href:e.URL}return t}function S(){return{x:pageXOffset,y:pageYOffset}}function c(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const d={...f,"":f.hover};function g(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function O(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=g(e)}}function U(e,t){let n;try{n=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI)}catch{}const a=e instanceof SVGAElement?e.target.baseVal:e.target,l=!n||!!a||A(n,t)||(e.getAttribute("rel")||"").split(/\s+/).includes("external"),r=(n==null?void 0:n.origin)===location.origin&&e.hasAttribute("download");return{url:n,external:l,target:a,download:r}}function L(e){let t=null,n=null,a=null,l=null,r=null,o=null,s=e;for(;s&&s!==document.documentElement;)a===null&&(a=c(s,"preload-code")),l===null&&(l=c(s,"preload-data")),t===null&&(t=c(s,"keepfocus")),n===null&&(n=c(s,"noscroll")),r===null&&(r=c(s,"reload")),o===null&&(o=c(s,"replacestate")),s=g(s);function i(v){switch(v){case"":case"true":return!0;case"off":case"false":return!1;default:return null}}return{preload_code:d[a??"off"],preload_data:d[l??"off"],keep_focus:i(t),noscroll:i(n),reload:i(r),replace_state:i(o)}}function p(e){const t=u(e);let n=!0;function a(){n=!0,t.update(o=>o)}function l(o){n=!1,t.set(o)}function r(o){let s;return t.subscribe(i=>{(s===void 0||n&&i!==s)&&o(s=i)})}return{notify:a,set:l,subscribe:r}}function E(){const{set:e,subscribe:t}=u(!1);let n;async function a(){clearTimeout(n);try{const l=await fetch(`${m}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(!l.ok)return!1;const o=(await l.json()).version!==w;return o&&(e(!0),clearTimeout(n)),o}catch{return!1}}return{subscribe:t,check:a}}function A(e,t){return e.origin!==location.origin||!e.pathname.startsWith(t)}let b;function N(e){b=e.client}function P(e){return(...t)=>b[e](...t)}const V={url:p({}),page:p({}),navigating:u(null),updated:E()};export{y as I,f as P,x as S,T as a,U as b,L as c,V as d,k as e,O as f,I as g,N as h,A as i,P as j,S as s};
