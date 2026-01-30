'use client';
import dynamic from 'next/dynamic';
const Player = dynamic(() => import('lottie-react'), {
  ssr: false,
});

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import useTheme from '@/stores/theme';
import warningAnimation from '@/public/animations/warning.json';

export default function ModalDelete() {
  // variables
  const { modalDelete, setModalDelete } = useTheme();

  // functions
  const handleAction = async () => {
    if (modalDelete.action) {
      await modalDelete.action();
      setModalDelete({
        open: false,
        title: '',
        message: '',
        action: () => {},
      });
    }
  };

  return (
    <Dialog
      open={modalDelete.open}
      onOpenChange={() =>
        setModalDelete({
          open: false,
        })
      }
    >
      <DialogContent className="sm:max-w-[425px] flex flex-col justify-center items-center gap-4">
        <Player
          autoplay
          loop
          animationData={warningAnimation}
          style={{ height: '180px', width: '180px' }}
        />
        <div className="flex flex-col gap-1">
          <DialogTitle className="font-semibold text-center">
            {modalDelete.title || 'Delete Confirmation'}
          </DialogTitle>
          <p className="text-xs text-center text-gray-400">
            {modalDelete.message ||
              'Are you sure you want to delete this data? This action cannot be undone.'}
          </p>
        </div>
        <Button
          onClick={() => handleAction()}
          className="w-full"
          variant={'destructive'}
        >
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
}
