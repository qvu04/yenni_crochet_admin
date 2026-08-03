export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value)

export const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value))

export const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(value instanceof Date ? value : new Date(value))

export const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ')
export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const startOfWeek = (date: Date) => {
    const day = date.getDay() || 7
    const nextDate = startOfDay(date)
    nextDate.setDate(nextDate.getDate() - day + 1)
    return nextDate
};

export const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
};

export const addMonths = (date: Date, months: number) => {
    const nextDate = new Date(date)
    nextDate.setMonth(nextDate.getMonth() + months)
    return nextDate
};

export const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const toMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const wait = (duration: number) =>
    new Promise((resolve) => {
        window.setTimeout(resolve, duration)
    })
