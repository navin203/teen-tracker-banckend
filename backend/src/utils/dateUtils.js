/**
 * Date helper functions for expense filtering, budget periods, and analytics
 */

export const formatDateToISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = () => {
  return formatDateToISO(new Date());
};

export const getStartOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return formatDateToISO(start);
};

export const getEndOfWeek = (d = new Date()) => {
  const start = new Date(getStartOfWeek(d));
  start.setDate(start.getDate() + 6);
  return formatDateToISO(start);
};

export const getStartOfMonth = (d = new Date()) => {
  const date = new Date(d);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDateToISO(start);
};

export const getEndOfMonth = (d = new Date()) => {
  const date = new Date(d);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return formatDateToISO(end);
};

export const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    start: formatDateToISO(start),
    end: formatDateToISO(end),
  };
};

export const isValidDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};
