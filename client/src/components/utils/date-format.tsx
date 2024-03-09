import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr: string) => {
  let formattedDate: string;
  try {
    formattedDate =  format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')
  } catch ( err ) {
    formattedDate = 'invalid date:' + dateStr
  }
 return formattedDate;
}

const DateFormat = (
  {dateStr}: { dateStr?: string }
) => {
  if ( !dateStr ) {
    return <>Not Set</>
  }
  return <>{formatDate(dateStr)}</>
}

export default DateFormat;
