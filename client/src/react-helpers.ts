import { useState } from 'react';

export function useToggleState(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);

  return [value, () => setValue(!value)];
}
