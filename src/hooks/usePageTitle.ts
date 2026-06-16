import { useEffect } from 'react';

const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    const base = 'Your Choice Creation';
    if (!pageTitle) {
      document.title = base;
    } else if (pageTitle.includes(base)) {
      document.title = pageTitle;
    } else {
      document.title = `${pageTitle} — ${base}`;
    }
    return () => {
      document.title = base;
    };
  }, [pageTitle]);
};

export default usePageTitle;
