import { useState, useEffect } from 'react';

export function useToggleState(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);

  return [value, () => setValue(!value)];
}

export function useBodyClassName(classes: string) {
  return useEffect(() => {
    const oldClasses = document.body.className;
    document.body.className = classes;

    return () => {
      document.body.className = oldClasses;
    };
  }, [classes]);
}
