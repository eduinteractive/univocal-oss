import classes from "./SVHInput.module.css"
import { DateInput, DateInputProps } from "@mantine/dates"
import dayjs from "dayjs"

type SVHDateInputProps = Omit<DateInputProps, "onChange"> & {
    onChange?: (value: Date | null) => void;
}

const SVHDateInput = ({ onChange, ...props }: SVHDateInputProps) => {
    return (
        <DateInput
            {...props}
            onChange={(value) => onChange?.(value ? dayjs(value).toDate() : null)}
            classNames={classes}
            my={10}
        />
    )
}

export default SVHDateInput;
