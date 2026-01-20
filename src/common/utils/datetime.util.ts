import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const convertDMYToYMD = (dateStr: string): string => {
	if (!dateStr) return '';

	const date = dayjs(dateStr, ['DD-MM-YYYY', 'DD/MM/YYYY'], true);

	return date.isValid() ? date.format('YYYY-MM-DD') : '';
};
