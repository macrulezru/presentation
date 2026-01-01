import{d as I,j as f,b as S,k as L,s as M,e as m,m as c,v as B,f as N,t as b,x as T,T as j,n as h,o as v,p as A,F as $,y as q,z as F,w as z}from"./vue.esm-bundler-DG_qB_bL.js";const K=["aria-expanded"],H={class:"ui-select__selected"},R=["aria-activedescendant"],G=["id","aria-selected","onClick","onMouseenter"],w=I({__name:"ui-select",props:{modelValue:{default:void 0},options:{},placeholder:{default:"Select..."}},emits:["update:modelValue","change"],setup(a,{emit:d}){const n=a,o=d,l=f(!1),t=f(-1),D=S(()=>n.options.find(e=>e.value===n.modelValue?.value)),V=S(()=>n.options.findIndex(e=>e.value===n.modelValue?.value)),r=e=>{e<0||e>=n.options.length?t.value=-1:t.value=e},p=()=>{l.value=!0,r(V.value>=0?V.value:0)},O=()=>{l.value?i():p()},i=()=>{l.value=!1,t.value=-1,setTimeout(()=>{const e=document.activeElement;e&&e.classList.contains("ui-select__trigger")&&e.blur()},0)},_=e=>{o("update:modelValue",e),o("change",e),i()},k=e=>`ui-select-option-${e}`,C=e=>{switch(e.key){case"ArrowDown":case"Down":e.preventDefault(),l.value?r(t.value===-1?0:(t.value+1)%n.options.length):p();break;case"ArrowUp":case"Up":e.preventDefault(),l.value?r(t.value<=0?n.options.length-1:t.value-1):p();break;case"Enter":case" ":{if(!l.value)e.preventDefault(),p();else if(t.value>=0&&t.value<n.options.length){e.preventDefault();const s=n.options[t.value];s&&_(s)}break}case"Escape":i();break}},x=e=>{e.target.closest(".ui-select")||i()};return L(()=>{document.addEventListener("click",x)}),M(()=>{document.removeEventListener("click",x)}),(e,s)=>(v(),m("div",{class:h(["ui-select",{"ui-select--open":l.value}])},[c("div",{class:"ui-select__trigger",tabindex:"0",role:"button","aria-expanded":l.value,"aria-haspopup":!0,onClick:O,onKeydown:C,onBlur:i},[c("span",H,b(D.value?.name||a.placeholder),1),N(e.$slots,"arrow",{},()=>[c("div",{class:h(["ui-select__arrow",{"ui-select__arrow--open":l.value}]),"aria-hidden":"true"},[...s[1]||(s[1]=[c("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[c("path",{d:"M4.5 6.5L8 10L11.5 6.5",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"})],-1)])],2)])],40,K),B(j,{name:"ui-select-dropdown-fade"},{default:T(()=>[l.value?(v(),m("div",{key:0,class:"ui-select__dropdown",role:"listbox","aria-activedescendant":t.value>=0?k(t.value):void 0,tabindex:"-1"},[(v(!0),m($,null,q(a.options,(u,y)=>(v(),m("div",{id:k(y),key:u.value,class:h(["ui-select__option",{"ui-select__option--selected":u.value===a.modelValue?.value}]),role:"option","aria-selected":u.value===a.modelValue?.value,onClick:E=>_(u),onMouseenter:E=>r(y),onMousedown:s[0]||(s[0]=F(()=>{},["prevent"]))},b(u.name),43,G))),128))],8,R)):A("",!0)]),_:1})],2))}});w.__docgenInfo={exportName:"default",displayName:"ui-select",description:"",tags:{},props:[{name:"modelValue",description:"Текущее выбранное значение (v-model)",required:!1,type:{name:"SelectOption"},defaultValue:{func:!1,value:"undefined"}},{name:"options",description:"Массив доступных опций",required:!0,type:{name:"Array",elements:[{name:"SelectOption"}]}},{name:"placeholder",description:"Текст плейсхолдера",required:!1,type:{name:"string"},defaultValue:{func:!1,value:"'Select...'"}}],events:[{name:"update:modelValue",type:{names:["SelectOption"]},description:"Событие обновления значения (v-model)"},{name:"change",type:{names:["SelectOption"]},description:"Событие изменения значения"}],slots:[{name:"arrow"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-select/ui-select.vue"]};const U=[{value:"vue",name:"Vue 3"},{value:"react",name:"React"},{value:"svelte",name:"Svelte"},{value:"angular",name:"Angular"}],P={title:"UI/Select",component:w,tags:["autodocs"],parameters:{docs:{description:{component:"Кастомный выпадающий список с клавиатурной навигацией, подсветкой активного пункта и v-model."}}},argTypes:{modelValue:{description:"Текущее выбранное значение (SelectOption) для v-model",control:"object"},options:{description:"Массив доступных опций { value, name }",control:"object"},placeholder:{description:"Текст плейсхолдера",control:"text"},"update:modelValue":{action:"update:modelValue"},change:{action:"change"}},args:{modelValue:U[0],options:U,placeholder:"Выберите фреймворк"}},g={render:a=>({components:{UiSelect:w},setup(){const d=f(a.modelValue);return z(()=>a.modelValue,o=>{d.value=o}),{args:a,model:d,handleUpdate:o=>{d.value=o,a["update:modelValue"]?.(o),a.change?.(o)}}},template:`
      <div style="max-width: 320px;">
        <UiSelect
          v-bind="args"
          :model-value="model"
          @update:modelValue="handleUpdate"
          @change="args.change"
        />
      </div>
    `})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => ({
    components: {
      UiSelect
    },
    setup() {
      const model = ref(args.modelValue);
      watch(() => args.modelValue, value => {
        model.value = value;
      });
      const handleUpdate = (value: SelectOption) => {
        model.value = value;
        args['update:modelValue']?.(value);
        args.change?.(value);
      };
      return {
        args,
        model,
        handleUpdate
      };
    },
    template: \`
      <div style="max-width: 320px;">
        <UiSelect
          v-bind="args"
          :model-value="model"
          @update:modelValue="handleUpdate"
          @change="args.change"
        />
      </div>
    \`
  })
}`,...g.parameters?.docs?.source}}};const Q=["Default"];export{g as Default,Q as __namedExportsOrder,P as default};
