import{d,e as u,o as i,m as c,p as g,f as p,n as b,j as f,w as v}from"./vue.esm-bundler-DG_qB_bL.js";const h=["aria-label"],_={key:0,class:"ui-tumbler__label"},n=d({__name:"ui-tumbler",props:{shortcut:{default:""},active:{type:Boolean,default:!1},ariaLabel:{default:""}},emits:["toggle"],setup(e,{emit:a}){const l=e,s=a,m=()=>s("toggle");return(r,o)=>(i(),u("button",{class:b(["ui-tumbler",{"ui-tumbler--active":l.active}]),type:"button","aria-label":l.ariaLabel||void 0,onClick:m},[o[0]||(o[0]=c("span",{class:"ui-tumbler__badge","aria-hidden":"true"},[c("span",{class:"ui-tumbler__dot"})],-1)),r.$slots.default?(i(),u("span",_,[p(r.$slots,"default")])):g("",!0)],10,h))}});n.__docgenInfo={exportName:"default",displayName:"ui-tumbler",description:"",tags:{},props:[{name:"shortcut",required:!1,type:{name:"string"},defaultValue:{func:!1,value:"''"}},{name:"active",required:!1,type:{name:"boolean"},defaultValue:{func:!1,value:"false"}},{name:"ariaLabel",required:!1,type:{name:"string"},defaultValue:{func:!1,value:"''"}}],events:[{name:"toggle"}],slots:[{name:"default"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-tumbler/ui-tumbler.vue"]};const y={title:"UI/Tumbler",component:n,tags:["autodocs"],parameters:{docs:{description:{component:"Переключатель с индикатором и опциональной подписью. Эмитит событие toggle по клику."}}},argTypes:{active:{description:"Текущее состояние переключателя",control:"boolean"},shortcut:{description:"Текстовый шорткат (отображается в title или подсказках)",control:"text"},ariaLabel:{description:"Подпись для ассистивных технологий",control:"text"},toggle:{action:"toggle"}},args:{active:!1,shortcut:"Shift+T",ariaLabel:"Переключить режим"}},t={render:e=>({components:{UiTumbler:n},setup(){const a=f(!!e.active);return v(()=>e.active,s=>{a.value=!!s}),{args:e,state:a,handleToggle:()=>{a.value=!a.value,e.toggle?.()}}},template:`
      <UiTumbler
        :active="state"
        :shortcut="args.shortcut"
        :aria-label="args.ariaLabel"
        @toggle="handleToggle"
      >
        Уведомления
      </UiTumbler>
    `})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => ({
    components: {
      UiTumbler
    },
    setup() {
      const state = ref(!!args.active);
      watch(() => args.active, value => {
        state.value = !!value;
      });
      const handleToggle = () => {
        state.value = !state.value;
        args.toggle?.();
      };
      return {
        args,
        state,
        handleToggle
      };
    },
    template: \`
      <UiTumbler
        :active="state"
        :shortcut="args.shortcut"
        :aria-label="args.ariaLabel"
        @toggle="handleToggle"
      >
        Уведомления
      </UiTumbler>
    \`
  })
}`,...t.parameters?.docs?.source}}};const L=["Default"];export{t as Default,L as __namedExportsOrder,y as default};
