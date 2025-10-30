export async function detectIncognito(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if third-party cookies are blocked (common in incognito)
    const testKey = 'test-cookie-' + Date.now();
    
    try {
      // Try to set a cookie
      document.cookie = `${testKey}=1; SameSite=None; Secure`;
      const cookieSet = document.cookie.includes(testKey);
      
      // Clean up
      if (cookieSet) {
        document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure`;
      }
      
      // In incognito, filesystem quota is often reduced
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(({ quota }) => {
          // Incognito often has less than 120MB quota
          const isIncognito = quota && quota < 120000000;
          resolve(isIncognito);
        }).catch(() => resolve(false));
      } else {
        resolve(!cookieSet);
      }
    } catch {
      resolve(true);
    }
  });
}

export function getIncognitoWarningMessage(): string {
  return `It looks like you're browsing in private/incognito mode. 
    Due to enhanced privacy settings, login may not persist across page refreshes. 
    For the best experience, please use normal browsing mode or add mydscvr.ai to your trusted sites.`;
}
