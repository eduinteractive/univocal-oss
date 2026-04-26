import classes from "./SVHInput.module.css"
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates"

const SVHDateTimePicker = (props: DateTimePickerProps) => {
    return (
        <DateTimePicker
            {...props}
            classNames={classes}
            my={10}
        />
    )
}

export default SVHDateTimePicker;