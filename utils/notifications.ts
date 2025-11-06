// VAPID public key for push notifications. In a real app, this would be from your server.
const VAPID_PUBLIC_KEY = 'BElz5_w0_yYxFAMk7yJf83nEa_2USSpBxqoyxx1Cqf-gY2yGgK1D7MNv3i5zO45JgwpVp2og4pRp2p7kd0iKZ_U';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeUserToPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // User is already subscribed. In a real app, you might re-send the subscription to your server.
      return;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // In a real app, you'd send this subscription object to your server
    // await api.savePushSubscription(subscription);
  } catch (error) {
    console.error('Failed to subscribe the user to push notifications: ', error);
  }
};
