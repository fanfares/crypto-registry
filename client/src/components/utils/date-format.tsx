import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr: string) => format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')

const DateFormat = (
  {dateStr}: { dateStr?: string }
) => {
  if ( !dateStr ) {
    return <>Not Set</>
  }

  return <>{formatDate(dateStr)}</>
}

export default DateFormat;
