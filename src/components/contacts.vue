<script setup lang="ts">
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
</script>

<template>
  <section class="contacts">
    <div class="contacts__container">
      <header class="contacts__header">
        <h2 class="contacts__title">{{ t('contacts.title') }}</h2>
        <p class="contacts__subtitle">{{ t('contacts.subtitle') }}</p>
      </header>

      <div class="contacts__content">
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
    max-width: var(--container-md);
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
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
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
    background-image: url('@/assets/images/mail-icon.svg');
  }

  .contacts__item-icon_telegram {
    background-image: url('@/assets/images/telegram-icon.svg');
  }

  .contacts__item-icon_phone {
    background-image: url('@/assets/images/phone-icon.svg');
  }

  .contacts__item-icon_ya-messenger {
    background-image: url('@/assets/images/ya-messenger-icon.svg');
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

  /* Адаптивность */
  @media (max-width: 768px) {
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

    .contacts__list {
      grid-template-columns: 1fr;
    }

    .contacts__item {
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
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
  }
</style>
