import { parseISO, format as formatDate } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

export function format(date: string, pattern = 'dd MMM yyyy') {
  return formatDate(parseISO(date), pattern, {
    locale: pt,
  });
}
