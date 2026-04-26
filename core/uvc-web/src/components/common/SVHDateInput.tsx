import classes from "./SVHInput.module.css"
import { DateInput, DateInputProps } from "@mantine/dates"

const SVHDateInput = (props: DateInputProps) => {
    return (
        <DateInput
            {...props}
            classNames={classes}
            my={10}
        />
    )
}

export default SVHDateInput;