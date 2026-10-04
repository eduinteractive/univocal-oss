import classes from "./SVHInput.module.css"
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates"
import dayjs from "dayjs"

type SVHDateTimePickerProps = Omit<DateTimePickerProps, "onChange"> & {
    onChange?: (value: Date | null) => void;
}

const SVHDateTimePicker = ({ onChange, ...props }: SVHDateTimePickerProps) => {
    return (
        <DateTimePicker
            {...props}
            onChange={(value) => onChange?.(value ? dayjs(value).toDate() : null)}
            classNames={classes}
            my={10}
        />
    )
}

export default SVHDateTimePicker;
