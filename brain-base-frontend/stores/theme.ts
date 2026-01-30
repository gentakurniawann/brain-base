import { create } from 'zustand';

import { IThemeStore } from '@/types';

const useTheme = create<IThemeStore>((set) => ({
  // state
  isLoading: false,
  modalSuccess: {
    open: false,
    title: '',
    message: '',
    actionMessage: 'Ok, Back',
    actionVariant: 'outline',
    animation: 'success',
  },
  modalDelete: {
    open: false,
    type: '',
    action: () => {},
  },
  modalQuestion: false,
  modalSwapToken: false,

  // actions
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  setModalSuccess: ({ open, title, message, action, actionMessage, actionVariant, animation }) =>
    set({
      modalSuccess: {
        open,
        title,
        message,
        action,
        actionMessage,
        actionVariant,
        animation,
      },
    }),
  setModalDelete: (modal) => {
    set({ modalDelete: modal });
  },
  setModalQuestion: (open) => {
    set({ modalQuestion: open });
  },
  setModalSwapToken: (open) => {
    set({ modalSwapToken: open });
  },
}));

export default useTheme;
