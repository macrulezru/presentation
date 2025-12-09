<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import emailjs from 'emailjs-com'

  const { t, tm } = useI18n()

  const contacts = computed(() => [
    {
      icon: 'email',
      label: t('contacts.emails.label'),
      emails: tm('contacts.emails.values'),
    },
    {
      icon: 'phone',
      label: t('contacts.phone.label'),
      value: t('contacts.phone.value'),
      href: 'tel:+79636972662',
    },
    {
      icon: 'telegram',
      label: t('contacts.telegram.label'),
      value: `@${t('contacts.telegram.value')}`,
      href: 'https://t.me/Danil_Anapa',
    },
    {
      icon: 'ya-messenger',
      label: t('contacts.ya-messenger.label'),
      value: `@${t('contacts.ya-messenger.value')}`,
      href: 'https://yandex.ru/chat/p/41a53011-0ac3-4de7-b032-918fabf51dae?utm_source=invite',
    },
  ])

  // Данные формы
  const formData = ref({
    name: '',
    email: '',
    message: '',
  })

  // Фиксированная тема
  const formSubject = computed(() => t('form.default_subject'))

  // Состояние формы
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const errorMessage = ref('')

  // Конфигурация EmailJS
  const EMAILJS_CONFIG = {
    serviceId: 'service_iuf5wq8',
    templateId: 'template_8hit7kl',
    publicKey: 'S-DbEWH7CYmFUekVS',
    recipientEmail: 'macrulezru@gmail.com',
  }

  // Валидация формы
  const validateForm = () => {
    if (!formData.value.name.trim()) {
      return t('form.errors.name_required')
    }
    if (!formData.value.email.trim()) {
      return t('form.errors.email_required')
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
      return t('form.errors.email_invalid')
    }
    if (!formData.value.message.trim()) {
      return t('form.errors.message_required')
    }
    return null
  }

  // Отправка формы через EmailJS
  const submitForm = async () => {
    const validationError = validateForm()
    if (validationError) {
      errorMessage.value = validationError
      return
    }

    isSubmitting.value = true
    errorMessage.value = ''
    isSuccess.value = false

    try {
      const templateParams = {
        to_email: EMAILJS_CONFIG.recipientEmail,
        from_name: formData.value.name,
        from_email: formData.value.email,
        subject: formSubject.value,
        message: formData.value.message,
        reply_to: formData.value.email,
        date: new Date().toLocaleString('ru-RU'),
        page_url: window.location.href,
      }

      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey,
      )

      if (result.status === 200) {
        isSuccess.value = true
        setTimeout(() => {
          formData.value = { name: '', email: '', message: '' }
          isSuccess.value = false
        }, 3000)
      } else {
        throw new Error('EmailJS returned non-200 status')
      }
    } catch (error) {
      console.error('EmailJS error:', error)
      errorMessage.value = t('form.errors.submission_failed')

      // Fallback через mailto
      setTimeout(() => {
        if (errorMessage.value === t('form.errors.submission_failed')) {
          const subject = encodeURIComponent(
            `${formSubject.value} от ${formData.value.name}`,
          )

          const body = encodeURIComponent(`
${t('form.fields.name')}: ${formData.value.name}
${t('form.fields.email')}: ${formData.value.email}
${t('form.fields.subject')}: ${formSubject.value}

${t('form.fields.message')}:
${formData.value.message}

---
${t('form.sent_from')}: ${window.location.href}
        `)

          window.location.href = `mailto:${EMAILJS_CONFIG.recipientEmail}?subject=${subject}&body=${body}`
        }
      }, 1000)
    } finally {
      isSubmitting.value = false
    }
  }

  // Сброс формы
  const resetForm = () => {
    formData.value = { name: '', email: '', message: '' }
    errorMessage.value = ''
    isSuccess.value = false
  }
</script>

<template>
  <section class="contacts">
    <div class="contacts__container">
      <header class="contacts__header">
        <h2 class="contacts__title">{{ t('contacts.title') }}</h2>
        <p class="contacts__subtitle">{{ t('contacts.subtitle') }}</p>
      </header>

      <div class="contacts__content">
        <!-- Контакты -->
        <div class="contacts__list-section">
          <div class="contacts__list">
            <!-- Email блок с двумя кликабельными адресами -->
            <div class="contacts__item">
              <div class="contacts__item-icon contacts__item-icon_mail" />
              <div class="contacts__item-content">
                <span class="contacts__item-label">{{ contacts[0]?.label }}</span>
                <div class="contacts__item-emails">
                  <a
                    v-for="(email, index) in contacts[0]?.emails"
                    :key="index"
                    :href="`mailto:${email}`"
                    class="contacts__email-link"
                  >
                    {{ email }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Telegram и Phone как ссылки -->
            <a
              v-for="contact in contacts.slice(1)"
              :key="contact.label"
              :href="contact.href"
              class="contacts__item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                class="contacts__item-icon"
                :class="[`contacts__item-icon_${contact.icon}`]"
              />
              <div class="contacts__item-content">
                <span class="contacts__item-label">{{ contact.label }}</span>
                <span class="contacts__item-value">{{ contact.value }}</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Форма обратной связи -->
        <div class="contacts__form-section">
          <h3 class="contacts__form-title">{{ t('form.title') }}</h3>
          <p class="contacts__form-description">{{ t('form.description') }}</p>

          <form @submit.prevent="submitForm" class="contacts__form">
            <!-- Имя -->
            <div class="form-group">
              <label for="name" class="form-label">
                {{ t('form.fields.name') }}
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                :placeholder="t('form.placeholders.name')"
                class="form-input"
                :disabled="isSubmitting"
                required
                autocomplete="name"
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                {{ t('form.fields.email') }}
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                :placeholder="t('form.placeholders.email')"
                class="form-input"
                :disabled="isSubmitting"
                required
                autocomplete="email"
              />
            </div>

            <!-- Сообщение -->
            <div class="form-group">
              <label for="message" class="form-label">
                {{ t('form.fields.message') }}
              </label>
              <textarea
                id="message"
                v-model="formData.message"
                :placeholder="t('form.placeholders.message')"
                class="form-textarea"
                :disabled="isSubmitting"
                rows="5"
                required
                autocomplete="off"
              ></textarea>
            </div>

            <!-- Скрытое поле с темой -->
            <input type="hidden" name="subject" :value="formSubject" />

            <!-- Сообщения об ошибках и успехе -->
            <div v-if="errorMessage" class="form-error">
              {{ errorMessage }}
            </div>

            <div v-if="isSuccess" class="form-success">
              {{ t('form.success_message') }}
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <button
                type="submit"
                class="form-submit"
                :disabled="isSubmitting"
                :class="{ 'form-submit--loading': isSubmitting }"
              >
                <span v-if="!isSubmitting">{{ t('form.submit') }}</span>
                <span v-else>{{ t('form.sending') }}</span>
              </button>

              <button
                type="button"
                @click="resetForm"
                class="form-reset"
                :disabled="isSubmitting"
              >
                {{ t('form.reset') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .contacts {
    padding: var(--spacing-3xl) 0 5rem;
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-light);
  }

  .contacts__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .contacts__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .contacts__title {
    font-size: 2.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .contacts__subtitle {
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
    font-weight: var(--font-weight-medium);
  }

  .contacts__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
  }

  .contacts__list-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .contacts__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }

  .contacts__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-normal);
    border: 1px solid var(--color-border);
    position: relative;
  }

  .contacts__item:hover {
    transform: translateY(-2px);
    border-color: var(--color-secondary);
  }

  .contacts__item-icon {
    width: var(--icon-size-xl);
    height: var(--icon-size-xl);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .contacts__item-icon_mail {
    background-image: url('@/view/assets/images/mail-icon.svg');
  }

  .contacts__item-icon_telegram {
    background-image: url('@/view/assets/images/telegram-icon.svg');
  }

  .contacts__item-icon_phone {
    background-image: url('@/view/assets/images/phone-icon.svg');
  }

  .contacts__item-icon_ya-messenger {
    background-image: url('@/view/assets/images/ya-messenger-icon.svg');
  }

  .contacts__item-content {
    flex: 1;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .contacts__item-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .contacts__item-value {
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    line-height: 1.4;
  }

  .contacts__item-emails {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contacts__email-link {
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    line-height: 1.4;
    text-decoration: none;
    transition: color var(--transition-normal);
    padding: 0.25rem 0;
  }

  .contacts__email-link:hover {
    color: var(--color-secondary);
  }

  .contacts__form-section {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
  }

  .contacts__form-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
  }

  .contacts__form-description {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
  }

  .contacts__form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-label {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .form-input,
  .form-textarea {
    padding: var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-family: inherit;
    transition: all var(--transition-normal);
    background: var(--color-bg-primary);
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--color-secondary);
  }

  .form-input:disabled,
  .form-textarea:disabled {
    background: var(--color-bg-tertiary);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
  }

  .form-error {
    padding: var(--spacing-md);
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid var(--color-accent-red);
    border-radius: var(--radius-md);
    color: var(--color-accent-red);
    font-size: var(--font-size-base);
  }

  .form-success {
    padding: var(--spacing-md);
    background: rgba(39, 174, 96, 0.1);
    border: 1px solid var(--color-accent-green);
    border-radius: var(--radius-md);
    color: var(--color-accent-green);
    font-size: var(--font-size-base);
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .form-submit {
    flex: 1;
    padding: var(--spacing-md) var(--spacing-xl);
    background: var(--color-secondary);
    color: var(--color-text-light);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .form-submit:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
  }

  .form-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .form-submit--loading {
    position: relative;
    color: transparent;
  }

  .form-submit--loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--color-text-light);
    border-radius: 50%;
    animation: form-spinner 0.6s linear infinite;
  }

  @keyframes form-spinner {
    to {
      transform: rotate(360deg);
    }
  }

  .form-reset {
    padding: var(--spacing-md) var(--spacing-xl);
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .form-reset:hover:not(:disabled) {
    background: var(--color-border);
  }

  .form-reset:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @mixin media-tablet {
    .contacts {
      padding: var(--spacing-xl) 0;
    }

    .contacts__container {
      padding: 0 var(--spacing-lg);
    }

    .contacts__title {
      font-size: var(--font-size-3xl);
    }

    .contacts__subtitle {
      font-size: var(--font-size-lg);
    }

    .contacts__content {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }

    .contacts__list {
      grid-template-columns: 1fr;
    }

    .contacts__item {
      padding: var(--spacing-md);
    }

    .contacts__form-section {
      padding: var(--spacing-md);
    }

    .form-actions {
      flex-direction: column;
    }

    .form-submit,
    .form-reset {
      width: 100%;
    }
  }

  @mixin media-mobile {
    .contacts__container {
      padding: 0 var(--spacing-md);
    }

    .contacts__title {
      font-size: var(--font-size-2xl);
    }

    .contacts__item {
      gap: var(--spacing-md);
    }

    .contacts__item-icon {
      width: var(--icon-size-md);
      height: var(--icon-size-md);
    }

    .contacts__item-value,
    .contacts__email-link {
      font-size: var(--font-size-lg);
    }
  }
</style>
