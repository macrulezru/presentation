import{d as u,b as p,e as m,f as b,n as y,o as g,g as f,t as h}from"./vue.esm-bundler-DG_qB_bL.js";const B=["disabled"],l=u({__name:"ui-button",props:{text:{},fullWidth:{type:Boolean},small:{type:Boolean},micro:{type:Boolean},disabled:{type:Boolean},gray:{type:Boolean},reset:{type:Boolean},control:{type:Boolean},variant:{}},setup(t){const e=t,c=p(()=>({"ui-button_full-width":e.fullWidth,"ui-button_small":e.small,"ui-button_micro":e.micro,"ui-button_disabled":e.disabled,"ui-button_gray":e.gray,"ui-button_reset":e.reset,"ui-button_control":e.control,[`ui-button_variant-${e.variant}`]:!!e.variant}));return(d,_)=>(g(),m("button",{class:y(["ui-button",c.value]),disabled:t.disabled},[b(d.$slots,"default",{},()=>[f(h(e.text),1)])],10,B))}});l.__docgenInfo={exportName:"default",displayName:"ui-button",description:"",tags:{},props:[{name:"text",required:!1,type:{name:"string"}},{name:"fullWidth",required:!1,type:{name:"boolean"}},{name:"small",required:!1,type:{name:"boolean"}},{name:"micro",required:!1,type:{name:"boolean"}},{name:"disabled",required:!1,type:{name:"boolean"}},{name:"gray",required:!1,type:{name:"boolean"}},{name:"reset",required:!1,type:{name:"boolean"}},{name:"control",required:!1,type:{name:"boolean"}},{name:"variant",required:!1,type:{name:"union",elements:[{name:'"primary"'},{name:'"secondary"'},{name:'"ghost"'}]}}],slots:[{name:"default"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-button/ui-button.vue"]};const x={title:"UI/Button",component:l,tags:["autodocs"],parameters:{docs:{description:{component:"Кнопка для основных действий: поддерживает размеры, состояния, вариации цвета и работу через слот."}}},argTypes:{text:{description:"Текст внутри кнопки (используется, если не задан слот)",control:"text"},variant:{description:"Цветовая схема кнопки",options:["primary","secondary","ghost"],control:{type:"inline-radio"}},fullWidth:{description:"Растягивать на всю ширину родителя",control:"boolean"},small:{description:"Компактная высота",control:"boolean"},micro:{description:"Минимальная высота и отступы",control:"boolean"},disabled:{description:"Отключенное состояние",control:"boolean"},gray:{description:"Серый фон вместо брендового",control:"boolean"},reset:{description:"Сброс базовых стилей браузера",control:"boolean"},control:{description:"Стиль для контролов (иконки и т.п.)",control:"boolean"}},args:{text:"Кнопка",variant:"primary",fullWidth:!1,small:!1,micro:!1,disabled:!1,gray:!1,reset:!1,control:!1}},a={},o={args:{variant:"secondary",text:"Вторичная"}},r={args:{variant:"ghost",text:"Ghost"}},s={args:{fullWidth:!0}},n={args:{disabled:!0,text:"Disabled"}},i={render:t=>({components:{UiButton:l},setup(){return{args:t}},template:'<UiButton v-bind="args"><span>Слот содержимое</span></UiButton>'})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    text: 'Вторичная'
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    text: 'Ghost'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    fullWidth: true
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    text: 'Disabled'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => ({
    components: {
      UiButton
    },
    setup() {
      return {
        args
      };
    },
    template: '<UiButton v-bind="args"><span>Слот содержимое</span></UiButton>'
  })
}`,...i.parameters?.docs?.source}}};const S=["Primary","Secondary","Ghost","FullWidth","Disabled","WithSlot"];export{n as Disabled,s as FullWidth,r as Ghost,a as Primary,o as Secondary,i as WithSlot,S as __namedExportsOrder,x as default};
