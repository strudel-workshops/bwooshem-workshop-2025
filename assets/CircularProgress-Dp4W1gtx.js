import{g as N,a as U,d as w,e as z,_ as E,b as o,j as g,s as v,h as I,i as n,k as F,bb as D,bc as _}from"./index-CcL4YOBG.js";function K(r){return N("MuiCircularProgress",r)}U("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const W=["className","color","disableShrink","size","style","thickness","value","variant"];let l=r=>r,P,b,S,$;const t=44,B=_(P||(P=l`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),G=_(b||(b=l`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),L=r=>{const{classes:e,variant:s,color:a,disableShrink:d}=r,u={root:["root",s,`color${n(a)}`],svg:["svg"],circle:["circle",`circle${n(s)}`,d&&"circleDisableShrink"]};return F(u,K,e)},V=v("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.root,e[s.variant],e[`color${n(s.color)}`]]}})(({ownerState:r,theme:e})=>o({display:"inline-block"},r.variant==="determinate"&&{transition:e.transitions.create("transform")},r.color!=="inherit"&&{color:(e.vars||e).palette[r.color].main}),({ownerState:r})=>r.variant==="indeterminate"&&D(S||(S=l`
      animation: ${0} 1.4s linear infinite;
    `),B)),Z=v("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(r,e)=>e.svg})({display:"block"}),q=v("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.circle,e[`circle${n(s.variant)}`],s.disableShrink&&e.circleDisableShrink]}})(({ownerState:r,theme:e})=>o({stroke:"currentColor"},r.variant==="determinate"&&{transition:e.transitions.create("stroke-dashoffset")},r.variant==="indeterminate"&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink&&D($||($=l`
      animation: ${0} 1.4s ease-in-out infinite;
    `),G)),H=w.forwardRef(function(e,s){const a=z({props:e,name:"MuiCircularProgress"}),{className:d,color:u="primary",disableShrink:M=!1,size:m=40,style:R,thickness:i=3.6,value:h=0,variant:k="indeterminate"}=a,j=E(a,W),c=o({},a,{color:u,disableShrink:M,size:m,thickness:i,value:h,variant:k}),p=L(c),f={},x={},y={};if(k==="determinate"){const C=2*Math.PI*((t-i)/2);f.strokeDasharray=C.toFixed(3),y["aria-valuenow"]=Math.round(h),f.strokeDashoffset=`${((100-h)/100*C).toFixed(3)}px`,x.transform="rotate(-90deg)"}return g.jsx(V,o({className:I(p.root,d),style:o({width:m,height:m},x,R),ownerState:c,ref:s,role:"progressbar"},y,j,{children:g.jsx(Z,{className:p.svg,ownerState:c,viewBox:`${t/2} ${t/2} ${t} ${t}`,children:g.jsx(q,{className:p.circle,style:f,ownerState:c,cx:t,cy:t,r:(t-i)/2,fill:"none",strokeWidth:i})})}))});export{H as C};
