<script setup lang="ts">
  import '@/view/components/contacts/contacts.scss'

  import LocationMap from '@/view/components/contacts/parts/map/location-map.vue'
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
  <div class="contacts">
    <div class="contacts__container">
      <header class="contacts__header">
        <h2 class="contacts__title">{{ t('contacts.title') }}</h2>
        <p class="contacts__subtitle">{{ t('contacts.subtitle') }}</p>
      </header>

      <div class="contacts__content">
        <div class="contacts__list-section">
          <div class="contacts__list">
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

        <div class="contacts__form-section">
          <h3 class="contacts__form-title">{{ t('form.title') }}</h3>
          <p class="contacts__form-description">{{ t('form.description') }}</p>

          <form @submit.prevent="submitForm" class="contacts__form">
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

            <div class="form-group form-group--message">
              <label for="message" class="form-label">
                {{ t('form.fields.message') }}
              </label>
              <textarea
                id="message"
                v-model="formData.message"
                :placeholder="t('form.placeholders.message')"
                class="form-textarea"
                :disabled="isSubmitting"
                required
                autocomplete="off"
              ></textarea>
            </div>

            <input type="hidden" name="subject" :value="formSubject" />

            <div v-if="errorMessage" class="form-error">
              {{ errorMessage }}
            </div>

            <div v-if="isSuccess" class="form-success">
              {{ t('form.success_message') }}
            </div>

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

        <a
          class="contacts__item contacts__item_git"
          href="https://github.com/macrulezru"
          target="_blank"
        >
          <span class="contacts__github-icon" />
          <span class="contacts__item-value">github.com/macrulezru</span>
        </a>
      </div>
      <LocationMap />
    </div>
  </div>
</template>
