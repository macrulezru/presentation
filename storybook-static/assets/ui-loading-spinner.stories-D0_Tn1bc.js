import{d as u,e as o,m,p,t as c,f as g,n as f,o as r}from"./vue.esm-bundler-DG_qB_bL.js";import{i as x}from"./index-DC-Hl7yM.js";const y={key:0,class:"ui-loading-spinner__text"},S={key:1,class:"ui-loading-spinner__text"},i=u({__name:"ui-loading-spinner",props:{size:{default:"medium"},showText:{type:Boolean,default:!0},textKey:{default:"common.loading"}},setup(e){const d=(...n)=>x.global.t(...n);return(n,l)=>(r(),o("div",{class:f(["ui-loading-spinner",e.size])},[l[0]||(l[0]=m("div",{class:"ui-loading-spinner__spinner"},null,-1)),e.showText?(r(),o("p",y,c(d(e.textKey)),1)):n.$slots.default?(r(),o("p",S,[g(n.$slots,"default")])):p("",!0)],2))}});i.__docgenInfo={exportName:"default",displayName:"ui-loading-spinner",description:"",tags:{},props:[{name:"size",description:"Размер индикатора",required:!1,type:{name:"union",elements:[{name:'"small"'},{name:'"medium"'},{name:'"large"'}]},defaultValue:{func:!1,value:"'medium'"}},{name:"showText",description:"Показывать текст загрузки",required:!1,type:{name:"boolean"},defaultValue:{func:!1,value:"true"}},{name:"textKey",description:"Ключ перевода для текста",required:!1,type:{name:"string"},defaultValue:{func:!1,value:"'common.loading'"}}],slots:[{name:"default"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-loading-spinner/ui-loading-spinner.vue"]};const T={title:"UI/LoadingSpinner",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"Компактный спиннер с локализованной подписью. Можно скрыть текст или передать свой слот."}}},argTypes:{size:{description:"Размер спиннера",options:["small","medium","large"],control:{type:"inline-radio"}},showText:{description:"Показывать подпись под спиннером",control:"boolean"},textKey:{description:"Ключ перевода для подписи",control:"text"}},args:{size:"medium",showText:!0,textKey:"common.loading"}},s={},t={args:{showText:!1}},a={render:e=>({components:{UiLoadingSpinner:i},setup(){return{args:e}},template:`
      <UiLoadingSpinner v-bind="args">
        Скачиваем данные...
      </UiLoadingSpinner>
    `})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    showText: false
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => ({
    components: {
      UiLoadingSpinner
    },
    setup() {
      return {
        args
      };
    },
    template: \`
      <UiLoadingSpinner v-bind="args">
        Скачиваем данные...
      </UiLoadingSpinner>
    \`
  })
}`,...a.parameters?.docs?.source}}};const v=["Default","WithoutText","CustomSlot"];export{a as CustomSlot,s as Default,t as WithoutText,v as __namedExportsOrder,T as default};
