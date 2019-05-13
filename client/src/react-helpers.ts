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

export function useAsync<A>(fn: () => Promise<A>): [A | null, boolean, boolean] {
  const [working, setWorking] = useState(false);
  const [hasError, setError] = useState(false);
  const [value, setValue] = useState<A | null>(null);

  useEffect(() => {
    const aux = async () => {
      setError(false);
      setWorking(true);
      try {
        const value = await fn();
        setValue(value);
      } catch {
        setError(true);
      } finally {
        setWorking(false);
      }
    };
    aux();
  }, [fn]);

  return [value, working, hasError];
}
