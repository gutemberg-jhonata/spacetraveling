import { parseISO, format as formatDate } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

export function format(date: string) {
  return formatDate(parseISO(date), 'dd MMM yyyy', {
    locale: pt,
  });
}
