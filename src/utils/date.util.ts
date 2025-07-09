import dayjs from 'dayjs';

export function calculateExpiryDate(durationString: string): Date {
    const amount = parseInt(durationString); // "30d" -> 30
    const unit = durationString.slice(-1);   // "30d" -> "d"

    let dayjsUnit: dayjs.ManipulateType;

    switch (unit) {
        case 'd':
            dayjsUnit = 'day';
            break;
        case 'm':
            dayjsUnit = 'minute';
            break;
        case 'h':
            dayjsUnit = 'hour';
            break;
        default:
            throw new Error(`Invalid duration unit: ${unit}`);
    }

    return dayjs().add(amount, dayjsUnit).toDate();
}

