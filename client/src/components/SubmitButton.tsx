import React from 'react';
import classNames from 'classnames';
export const SubmitButton: React.FC<{
  text: string;
  isSubmitting: boolean;
  canSubmit: boolean;
}> = ({ isSubmitting, canSubmit, text }) => (
  <button
    className={classNames('btn', isSubmitting && 'loading')}
    type="submit"
    disabled={isSubmitting || !canSubmit}
  >
    {isSubmitting ? '' : text}
  </button>
);
