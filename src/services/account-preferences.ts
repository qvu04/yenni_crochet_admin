const REMEMBERED_ADMIN_EMAIL_KEY = 'yenni-crochet-admin-email'

const canUseLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const accountPreferenceServices = {
  getRememberedAdminEmail: (): string => {
    if (!canUseLocalStorage()) return ''

    return window.localStorage.getItem(REMEMBERED_ADMIN_EMAIL_KEY) ?? ''
  },

  saveRememberedAdminEmail: (email: string): void => {
    if (!canUseLocalStorage()) return

    window.localStorage.setItem(REMEMBERED_ADMIN_EMAIL_KEY, email)
  },

  clearRememberedAdminEmail: (): void => {
    if (!canUseLocalStorage()) return

    window.localStorage.removeItem(REMEMBERED_ADMIN_EMAIL_KEY)
  },
}
