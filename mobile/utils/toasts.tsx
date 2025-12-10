import * as Burnt from 'burnt';

export const showSuccessToast = (message: string) => {
  Burnt.toast({
    title: '🎉 Success!',
    preset: 'done',
    message: message,
    duration: 3,
    from: 'bottom',
    haptic: 'success',
    shouldDismissByDrag: true,
  });
};

export const showErrorToast = (message: string) => {
  Burnt.toast({
    title: '😨 Oh no!',
    preset: 'error',
    message: message,
    duration: 3,
    from: 'bottom',
    haptic: 'error',
    shouldDismissByDrag: true,
  });
};
