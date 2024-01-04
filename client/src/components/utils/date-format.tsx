import { format, parseISO } from 'date-fns';

const DateFormat = (
  {dateStr}: { dateStr?: string }
) => {
  if ( !dateStr ) {
    return <>Not Set</>
  }

  return <>{format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')}</>
}

export default DateFormat;
