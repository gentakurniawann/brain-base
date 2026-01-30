import dynamic from 'next/dynamic';
const Player = dynamic(() => import('lottie-react'), {
  ssr: false,
});

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import useTheme from '@/stores/theme';
import successAnimation from '@/public/animations/success.json';

function ModalSuccess() {
  // variables
  const { modalSuccess, setModalSuccess } = useTheme();

  // functions
  const handleAction = () => {
    if (modalSuccess.action) {
      modalSuccess.action();
    }
    setModalSuccess({
      open: false,
      title: '',
      message: '',
      actionMessage: 'Ok, Back',
      actionVariant: 'outline',
      action: () => {},
      animation: 'success',
    });
  };

  const renderAnimation = () => {
    return successAnimation;
  };

  return (
    <Dialog
      open={modalSuccess.open}
      onOpenChange={() => setModalSuccess({ ...modalSuccess, open: false })}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Player
          autoplay
          loop
          animationData={renderAnimation()}
          style={{ height: '150px' }}
        />
        <div className="flex flex-col gap-1">
          <DialogTitle className="font-semibold text-center">{modalSuccess.title}</DialogTitle>
          <p className="text-xs text-center text-gray-400">{modalSuccess.message}</p>
        </div>
        <Button
          onClick={() => handleAction()}
          className="w-full"
          variant={modalSuccess.actionVariant || 'outline'}
        >
          {modalSuccess.actionMessage || 'Ok, Back'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ModalSuccess;
