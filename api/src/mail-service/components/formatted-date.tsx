import * as React from 'react';
import { format } from 'date-fns';

const FormattedDate = (
  { dateValue} : { dateValue: Date | null }
) => {
  if ( !dateValue ) {
    return <div>Undefined</div>;
  }
  return <span>{format(dateValue, 'HH:mm z \'on\' dd MMM yyyy')}</span>
}

export default FormattedDate
