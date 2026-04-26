import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { useEffect, useRef, useState } from 'react';
import {
    IconColumnInsertRight,
    IconColumnRemove,
    IconRowInsertBottom,
    IconRowRemove,
    IconTable,
    IconTrash,
} from '@tabler/icons-react';
import { ScrollArea } from '@mantine/core';
import './SVHTextEditor.css';

interface SVHTextEditorProps {
    text: string;
    onChange: (text: string) => void;
}

const SVHTextEditor = (props: SVHTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link,
            Underline,
            Table.configure({
                resizable: true,
                cellMinWidth: 50,
                handleWidth: 5,
                HTMLAttributes: {
                    class: 'rt_table'
                }
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: props.text,
        onUpdate: ({ editor }) => {
            props.onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (props.text !== editor?.getHTML()) {
            editor?.commands.setContent(props.text);
        }
    }, [props.text, editor]);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const tableCell = event.target as HTMLElement;
        if (tableCell.closest('td')) {
            const editorBounds = editorRef.current?.getBoundingClientRect();
            if (editorBounds) {
                setContextMenu({
                    x: event.clientX - editorBounds.left,
                    y: event.clientY - editorBounds.top,
                });
            }
        }
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleMenuClick = (action: () => void) => {
        action();
        handleCloseContextMenu();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                contextMenuRef.current &&
                !contextMenuRef.current.contains(event.target as Node)
            ) {
                handleCloseContextMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={editorRef}
            onContextMenu={handleContextMenu}
            style={{ position: 'relative' }}
        >
            <RichTextEditor
                editor={editor}
                w="100%"
                onContextMenu={handleContextMenu}
                className='rt_table'
            >
                <RichTextEditor.Toolbar>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .insertTable({ rows: 3, cols: 3 })
                                    .run()
                            }
                            title="Insert Table"
                        >
                            <IconTable size={16} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor?.chain().focus().addColumnAfter().run()
                            }
                            title="Add Column"
                        >
                            <IconColumnInsertRight size={16} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor?.chain().focus().addRowAfter().run()
                            }
                            title="Add Row"
                        >
                            <IconRowInsertBottom size={16} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor?.chain().focus().deleteColumn().run()
                            }
                            title="Delete Column"
                        >
                            <IconColumnRemove size={16} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor?.chain().focus().deleteRow().run()
                            }
                            title="Delete Row"
                        >
                            <IconRowRemove size={16} />
                        </RichTextEditor.Control>
                        <RichTextEditor.Control
                            onClick={() =>
                                editor?.chain().focus().deleteTable().run()
                            }
                            title="Delete Table"
                        >
                            <IconTrash size={16} />
                        </RichTextEditor.Control>
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Undo />
                        <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <ScrollArea>
                    <RichTextEditor.Content />
                </ScrollArea>
            </RichTextEditor>
            {contextMenu && (
                <div
                    style={{
                        position: 'absolute',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                        zIndex: 9999,
                        padding: '5px',
                        borderRadius: '3px',
                    }}
                    ref={contextMenuRef}
                >
                    <div
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() =>
                            handleMenuClick(
                                () =>
                                    editor
                                        ?.chain()
                                        .focus()
                                        .addColumnAfter()
                                        .run()
                            )
                        }
                    >
                        <IconColumnInsertRight size={16} /> Add Column
                    </div>
                    <div
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() =>
                            handleMenuClick(
                                () =>
                                    editor?.chain().focus().deleteColumn().run()
                            )
                        }
                    >
                        <IconColumnRemove size={16} /> Delete Column
                    </div>
                    <div
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() =>
                            handleMenuClick(
                                () =>
                                    editor?.chain().focus().addRowAfter().run()
                            )
                        }
                    >
                        <IconRowInsertBottom size={16} /> Add Row
                    </div>
                    <div
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() =>
                            handleMenuClick(
                                () => editor?.chain().focus().deleteRow().run()
                            )
                        }
                    >
                        <IconRowRemove size={16} /> Delete Row
                    </div>
                    <div
                        style={{ padding: '5px', cursor: 'pointer' }}
                        onClick={() =>
                            handleMenuClick(
                                () =>
                                    editor?.chain().focus().deleteTable().run()
                            )
                        }
                    >
                        <IconTrash size={16} /> Delete Table
                    </div>
                </div>
            )}
        </div>
    );
};

export default SVHTextEditor;
