<script setup lang="ts">
  import emailjs from 'emailjs-com';
  import { ref, computed } from 'vue';

  import UiButton from '~/components/ui/UiButton.vue';
  import { useI18n } from '~/composables/useI18n';

  import '@/view/components/contacts/contacts.scss';

  const { t } = useI18n();

  const contacts = computed(() => [
    {
      icon: 'email',
      label: t('contacts.email.label'),
      value: t('contacts.email.value'),
      href: `mailto:${t('contacts.email.value')}`,
    },
    {
      icon: 'phone',
      label: t('contacts.phone.label'),
      value: t('contacts.phone.value'),
      href: `tel:${t('contacts.phone.value')}`,
    },
    {
      icon: 'telegram',
      label: t('contacts.telegram.label'),
      value: `@${t('contacts.telegram.value')}`,
      href: `https://t.me/${t('contacts.telegram.value')}`,
    },
    {
      icon: 'ya-messenger',
      label: t('contacts.ya-messenger.label'),
      value: `@${t('contacts.ya-messenger.value')}`,
      href: 'https://yandex.ru/chat/p/41a53011-0ac3-4de7-b032-918fabf51dae?utm_source=invite',
    },
    {
      icon: 'github',
      label: t('contacts.github.label'),
      value: `#${t('contacts.github.value')}`,
      href: `https://github.com/${t('contacts.github.value')}`,
    },
  ]);

  // Данные формы
  const formData = ref({
    name: '',
    email: '',
    message: '',
  });

  // Фиксированная тема
  const formSubject = computed(() => t('form.default_subject'));

  // Состояние формы
  const isSubmitting = ref(false);
  const isSuccess = ref(false);
  const errorMessage = ref('');

  // Конфигурация EmailJS
  const EMAILJS_CONFIG = {
    serviceId: 'service_iuf5wq8',
    templateId: 'template_8hit7kl',
    publicKey: 'S-DbEWH7CYmFUekVS',
    recipientEmail: 'danil@macrulez.ru',
  };

  // Валидация формы
  const validateForm = () => {
    if (!formData.value.name.trim()) {
      return t('form.errors.name_required');
    }
    if (!formData.value.email.trim()) {
      return t('form.errors.email_required');
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
      return t('form.errors.email_invalid');
    }
    if (!formData.value.message.trim()) {
      return t('form.errors.message_required');
    }
    return null;
  };

  // Отправка формы через EmailJS
  const submitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      errorMessage.value = validationError;
      return;
    }

    isSubmitting.value = true;
    errorMessage.value = '';
    isSuccess.value = false;

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
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey,
      );

      if (result.status === 200) {
        isSuccess.value = true;
        setTimeout(() => {
          formData.value = { name: '', email: '', message: '' };
          isSuccess.value = false;
        }, 3000);
      } else {
        throw new Error('EmailJS returned non-200 status');
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      errorMessage.value = t('form.errors.submission_failed');

      // Fallback через mailto
      setTimeout(() => {
        if (errorMessage.value === t('form.errors.submission_failed')) {
          const subject = encodeURIComponent(
            `${formSubject.value} от ${formData.value.name}`,
          );

          const body = encodeURIComponent(`
${t('form.fields.name')}: ${formData.value.name}
${t('form.fields.email')}: ${formData.value.email}
${t('form.fields.subject')}: ${formSubject.value}

${t('form.fields.message')}:
${formData.value.message}

---
${t('form.sent_from')}: ${window.location.href}
        `);

          window.location.href = `mailto:${EMAILJS_CONFIG.recipientEmail}?subject=${subject}&body=${body}`;
        }
      }, 1000);
    } finally {
      isSubmitting.value = false;
    }
  };

  // Сброс формы
  const resetForm = () => {
    formData.value = { name: '', email: '', message: '' };
    errorMessage.value = '';
    isSuccess.value = false;
  };
</script>

<template>
  <div class="contacts">
    <div class="contacts__container">
      <div class="contacts__content">
        <div class="contacts__header">
          <div class="contacts__header-title">
            <div class="contacts__title">{{ t('contacts.title') }}</div>
            <div class="contacts__subtitle">{{ t('contacts.subtitle') }}</div>
          </div>
          <div class="contacts__avatar" />
        </div>

        <div class="contacts__section-wrapper">
          <div class="contacts__list-section">
            <div class="contacts__list">
              <a
                v-for="contact in contacts"
                :key="contact.label"
                class="contacts__list-item"
                :href="contact.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="contacts__item">
                  <span
                    class="contacts__item-icon"
                    :class="[`contacts__item-icon_${contact.icon}`]"
                  />
                  <span class="contacts__item-content">
                    <span class="contacts__item-value">{{ contact.value }}</span>
                  </span>
                </span>
              </a>
            </div>
          </div>

          <div class="contacts__form-section">
            <div class="contacts__form-header">
              <div class="contacts__form-title">{{ t('form.title') }}</div>
              <div class="contacts__form-description">{{ t('form.description') }}</div>
            </div>

            <form class="contacts__form" @submit.prevent="submitForm">
              <div class="contacts__form-group">
                <label for="name" class="contacts__form-label">
                  {{ t('form.fields.name') }}
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  :placeholder="t('form.placeholders.name')"
                  class="contacts__form-input"
                  :disabled="isSubmitting"
                  required
                  autocomplete="name"
                />
              </div>

              <div class="contacts__form-group">
                <label for="email" class="contacts__form-label">
                  {{ t('form.fields.email') }}
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  :placeholder="t('form.placeholders.email')"
                  class="contacts__form-input"
                  :disabled="isSubmitting"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="contacts__form-group contacts__form-group--message">
                <label for="message" class="contacts__form-label">
                  {{ t('form.fields.message') }}
                </label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  :placeholder="t('form.placeholders.message')"
                  class="contacts__form-textarea"
                  :disabled="isSubmitting"
                  required
                  autocomplete="off"
                ></textarea>
              </div>

              <input type="hidden" name="subject" :value="formSubject" />

              <div v-if="errorMessage" class="contacts__form-error">
                {{ errorMessage }}
              </div>

              <div v-if="isSuccess" class="contacts__form-success">
                {{ t('form.success_message') }}
              </div>

              <div class="contacts__form-actions">
                <UiButton
                  :class="{ 'contacts__form-submit--loading': isSubmitting }"
                  type="submit"
                  small
                  :disabled="isSubmitting"
                  :text="!isSubmitting ? t('form.submit') : t('form.sending')"
                />
                <UiButton
                  gray
                  small
                  :disabled="isSubmitting"
                  :text="t('form.reset')"
                  @click="resetForm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
