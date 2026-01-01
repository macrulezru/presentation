import{d as E,b as p,j as b,w as k,H as B,G as A,e as f,p as P,f as S,o as g,k as V,m as w,F as L,y as N,n as R,t as z,P as x}from"./vue.esm-bundler-DG_qB_bL.js";const C=Symbol("tshTabsAddTab"),D=Symbol("tshTabsUpdateTab"),$=Symbol("tshTabsActiveHash"),F=["id","aria-labelledby"],H=E({__name:"ui-tab",props:{title:{},id:{}},setup(v){const i=v,_=A(C),T=A(D),n=A($),a=p(()=>`#${i.title.toLowerCase().replace(/ /g,"-")}`),o=p(()=>i.id?i.id:a.value.replace("#","")),c=p(()=>`tab-${o.value}`),r=p(()=>`panel-${o.value}`),l=b(!1),y=b("");return k(()=>n?.value,()=>{l.value=n?.value===a.value}),B(()=>{y.value=a.value,_?.({title:i.title,id:i.id,hash:a.value,tabId:c.value,panelId:r.value})}),k(()=>i.title,(u,m)=>{const e=`#${m.toLowerCase().replace(/ /g,"-")}`,s=a.value;T?.(e,{title:u,id:i.id,hash:s,tabId:c.value,panelId:r.value})}),(u,m)=>l.value?(g(),f("div",{key:0,id:r.value,class:"ui-tab",role:"tabpanel","aria-labelledby":c.value},[S(u.$slots,"default")],8,F)):P("",!0)}});H.__docgenInfo={exportName:"default",displayName:"ui-tab",description:"",tags:{},props:[{name:"title",required:!0,type:{name:"string"}},{name:"id",required:!1,type:{name:"string"}}],slots:[{name:"default"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-tabs/parts/ui-tab/ui-tab.vue"]};const G={class:"ui-tabs"},K={class:"ui-tabs__wrapper"},j=["id","aria-selected","tabindex","aria-controls","onClick"],Y={class:"ui-tabs__content"},I=E({__name:"ui-tabs",emits:["mounted"],setup(v,{expose:i,emit:_}){const T=_,n=b(""),a=b([]),o=e=>{n.value=e.hash},c=e=>{const s=a.value.find(t=>t.id===e);s&&o(s)};x(C,e=>{a.value.push(e)===1&&(n.value=e.hash)}),x(D,(e,s)=>{const t=a.value.findIndex(d=>d.hash===e);t!==-1&&(a.value[t]=s,n.value===e&&(n.value=s.hash))}),x($,n);const r=p(()=>a.value.findIndex(e=>e.hash===n.value)),l=b([]),y=(e,s)=>{e&&"$el"in e?l.value[s]=e.$el:l.value[s]=e},u=e=>{l.value[e]?.focus()},m=e=>{if(!a.value.length)return;const s=r.value===-1?0:r.value;let t=s;switch(e.key){case"ArrowRight":case"ArrowDown":t=(s+1)%a.value.length,e.preventDefault();break;case"ArrowLeft":case"ArrowUp":t=(s-1+a.value.length)%a.value.length,e.preventDefault();break;case"Home":t=0,e.preventDefault();break;case"End":t=a.value.length-1,e.preventDefault();break;default:return}const d=a.value[t];d&&(o(d),u(t))};return i({preselectTab:c}),V(()=>{T("mounted")}),(e,s)=>(g(),f("div",G,[w("div",K,[w("div",{class:"ui-tabs__navbar",role:"tablist",onKeydown:m},[(g(!0),f(L,null,N(a.value,(t,d)=>(g(),f("div",{id:t.tabId,key:t.hash,ref_for:!0,ref:U=>y(U,d),class:R(["ui-tabs__navbar-item",{"ui-tabs__navbar-item_active":t.hash===n.value}]),role:"tab","aria-selected":t.hash===n.value,tabindex:t.hash===n.value?0:-1,"aria-controls":t.panelId,onClick:U=>o(t)},z(t.title),11,j))),128))],32)]),w("div",Y,[S(e.$slots,"default")])]))}});I.__docgenInfo={exportName:"default",displayName:"ui-tabs",description:"",tags:{},expose:[{name:"preselectTab"}],events:[{name:"mounted"}],slots:[{name:"default"}],sourceFiles:["C:/work/presentation/src/view/ui/ui-tabs/ui-tabs.vue"]};const M={title:"UI/Tabs",component:I,tags:["autodocs"],parameters:{docs:{description:{component:"Контейнер вкладок с клавиатурной навигацией (Arrow/Home/End). Добавляйте панели через вложенный компонент UiTab."}}},argTypes:{tabs:{description:"Массив вкладок { title, content, id? }",control:"object"},mounted:{action:"mounted"}},args:{tabs:[{title:"Общее",content:`Добро пожаловать в раздел с общей информацией о продукте.

Наш продукт создан с использованием современных технологий и следует лучшим практикам разработки. Мы уделяем особое внимание производительности, доступности и пользовательскому опыту.

**Основные преимущества:**
- Высокая производительность и оптимизация
- Адаптивный дизайн для всех устройств
- Доступность (WCAG 2.1 AA)
- Современный стек технологий

Мы постоянно работаем над улучшением продукта и внедрением новых функций на основе обратной связи от пользователей.`},{title:"Характеристики",content:`**Технические характеристики:**

Frontend:
- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia для state management
- Vue Router для навигации

UI компоненты:
- Собственная библиотека UI-компонентов
- Поддержка темной/светлой темы
- Адаптивная сетка и layouts
- Анимации и transitions

Производительность:
- Lazy loading компонентов и изображений
- Code splitting
- Tree shaking
- Оптимизация bundle size

Доступность:
- Клавиатурная навигация
- ARIA атрибуты
- Screen reader поддержка
- Контрастность и читаемость`},{title:"API",content:`**REST API интеграция:**

Наш продукт интегрирован с несколькими внешними API для демонстрации работы с асинхронными запросами и обработкой данных.

Endpoints:
- GET /api/product - получение случайного продукта
- GET /api/person - получение данных о случайном человеке
- GET /api/joke - получение случайной шутки

Особенности:
- Обработка ошибок и retry логика
- Кэширование запросов
- Optimistic updates
- Loading states
- Error boundaries

Метрики:
- Отслеживание времени выполнения запросов
- Мониторинг успешных/неуспешных запросов
- Визуализация в реальном времени`},{title:"Отзывы",content:`**Отзывы пользователей:**

⭐⭐⭐⭐⭐ "Отличный продукт! Очень удобный интерфейс и быстрая работа. Особенно понравилась адаптация под мобильные устройства."
— Анна К., frontend разработчик

⭐⭐⭐⭐⭐ "Впечатляющая реализация! Код чистый, документация подробная. Легко разобраться и начать использовать."
— Дмитрий М., tech lead

⭐⭐⭐⭐ "Хорошее решение для быстрого старта проекта. Есть все необходимые компоненты. Было бы здорово добавить больше примеров использования."
— Елена С., UI/UX designer

⭐⭐⭐⭐⭐ "Отличная типизация на TypeScript, продуманная архитектура. Рекомендую для изучения лучших практик Vue 3."
— Александр В., senior developer`}]}},h={render:v=>({components:{UiTabs:I,UiTab:H},setup(){return{args:v}},template:`
      <div style="max-width: 920px; padding: 2rem; background: linear-gradient(135deg, #1b232b 0%, #0f1419 100%); border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
        <UiTabs @mounted="args.mounted">
          <UiTab
            v-for="tab in args.tabs"
            :key="tab.id || tab.title"
            :title="tab.title"
            :id="tab.id"
          >
            <div style="padding: 1.5rem; color: #e8eaed; line-height: 1.7; white-space: pre-wrap; font-size: 14px;">{{ tab.content }}</div>
          </UiTab>
        </UiTabs>
      </div>
    `})};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => ({
    components: {
      UiTabs,
      UiTab
    },
    setup() {
      return {
        args
      };
    },
    template: \`
      <div style="max-width: 920px; padding: 2rem; background: linear-gradient(135deg, #1b232b 0%, #0f1419 100%); border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
        <UiTabs @mounted="args.mounted">
          <UiTab
            v-for="tab in args.tabs"
            :key="tab.id || tab.title"
            :title="tab.title"
            :id="tab.id"
          >
            <div style="padding: 1.5rem; color: #e8eaed; line-height: 1.7; white-space: pre-wrap; font-size: 14px;">{{ tab.content }}</div>
          </UiTab>
        </UiTabs>
      </div>
    \`
  })
}`,...h.parameters?.docs?.source}}};const O=["Default"];export{h as Default,O as __namedExportsOrder,M as default};
