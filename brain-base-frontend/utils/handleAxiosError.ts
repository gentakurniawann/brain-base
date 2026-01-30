import { AxiosError } from 'axios';

import { toast } from 'sonner';
import { TResponseMessage } from '@/types';
import { deleteCookie } from './cookie';

type NotificationType = 'success' | 'warning' | 'error' | 'info';

const DEFAULT_ERROR_MESSAGE = 'Terjadi kesalahan yang tidak diketahui.';
const NETWORK_ERROR_MESSAGE =
  'Terjadi masalah saat menghubungkan ke server. Harap periksa koneksi Anda atau hubungi admin.';

const showNotification = (type: NotificationType, message: string, description: string) => {
  toast[type](`${message}`, {
    description,
  });
};

const getErrorDescription = (error: AxiosError<TResponseMessage>): string => {
  return error.response?.data?.message || error.message || DEFAULT_ERROR_MESSAGE;
};

const handleSpecificError = (
  status: number,
  description: string,
): { message: string; errorMessage: string } => {
  switch (status) {
    case 400:
      return { message: 'Terjadi kesalahan', errorMessage: description };
    case 401:
      return {
        message: 'Unauthorized',
        errorMessage: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
      };
    case 403:
      return {
        message: 'Unauthorized',
        errorMessage: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
      };
    case 404:
      return { message: 'Halaman Tidak Ditemukan', errorMessage: description };
    case 500:
      return {
        message: 'Server Error',
        errorMessage:
          description ||
          'Terjadi kesalahan pada server. Silakan hubungi admin dan coba lagi nanti.',
      };
    default:
      return { message: 'Error', errorMessage: DEFAULT_ERROR_MESSAGE };
  }
};

export const handleAxiosError = async (err: AxiosError<TResponseMessage>) => {
  console.error('Error: ', err);
  if (err.response?.status === 403 || err.response?.status === 401) {
    deleteCookie('isLoggedIn');
    window.location.href = '/auth/sign-in';
  }
  if (!err.response) {
    showNotification('error', 'Masalah Jaringan', NETWORK_ERROR_MESSAGE);
    return { error: true, message: NETWORK_ERROR_MESSAGE };
  }

  const { status } = err.response;
  const description = getErrorDescription(err);
  const { message, errorMessage } = handleSpecificError(status, description);

  showNotification('error', message, errorMessage);

  return { error: true, message: errorMessage };
};
