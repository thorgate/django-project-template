import addYears from 'date-fns/add_years';
import addQuarters from 'date-fns/add_quarters';
import addMonths from 'date-fns/add_months';
import addWeeks from 'date-fns/add_weeks';
import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import addMinutes from 'date-fns/add_minutes';
import addSeconds from 'date-fns/add_seconds';
import addMilliseconds from 'date-fns/add_milliseconds';
import is from 'is_js';


/**
 * @typedef {object} TimeDelta
 * @property {Number|undefined} years
 * @property {Number|undefined} quarters
 * @property {Number|undefined} months
 * @property {Number|undefined} weeks
 * @property {Number|undefined} days
 * @property {Number|undefined} hours
 * @property {Number|undefined} minutes
 * @property {Number|undefined} seconds
 * @property {Number|undefined} milliseconds
 */

const helperMethods = {
    years: addYears,
    quarters: addQuarters,
    months: addMonths,
    weeks: addWeeks,
    days: addDays,
    hours: addHours,
    minutes: addMinutes,
    seconds: addSeconds,
    milliseconds: addMilliseconds,
};

/**
 * Add timedelta to date using date-fns add helpers
 * @param date {Date}
 * @param delta {TimeDelta}
 * @return {Date}
 */
export const addTimedelta = (date, delta) => (
    Object.keys(helperMethods).reduce((prev, key) => {
        if (is.number(delta[key])) {
            return helperMethods[key](prev, delta[key]);
        }

        return prev;
    }, date)
);
