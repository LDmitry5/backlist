import axios from 'axios';

import type { ApiError } from '../types/api';

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Произошла ошибка.',
): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as
    | ApiError
    | undefined;

  if (
    data?.success === false &&
    data.errors?.length
  ) {
    return data.errors
      .map((errorItem) => errorItem.message)
      .join(' ');
  }

  return fallback;
};