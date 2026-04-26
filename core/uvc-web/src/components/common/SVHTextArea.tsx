import { Textarea, TextareaProps } from '@mantine/core';
import classes from './SVHInput.module.css';

const SVHTextArea = (props: TextareaProps) => {
    return (
        <Textarea classNames={classes} {...props} my={10}/>
    );
}

export default SVHTextArea;