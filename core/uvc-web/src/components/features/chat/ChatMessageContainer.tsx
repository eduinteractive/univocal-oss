import {
    ActionIcon,
    Button,
    Flex,
    Group,
    Paper,
    ScrollArea,
    Text,
    Textarea,
    Stack,
    CloseButton,
    Image,
} from '@mantine/core';
import { IconSend, IconPaperclip } from '@tabler/icons-react';
import { GroupMessage, PrivateMessage, UserContact } from '@eduinteractive/uvc-api';
import {
    Fragment,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { SidebarContext } from '../../../layouts/SVHAppShell';
import { TenantUser } from '@eduinteractive/uvc-api';
import { User } from '@eduinteractive/uvc-api';
import ChatMessage from './ChatMessage';
import { useAuth } from '../../../context/AuthContext';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface ChatMessageContainerProps {
    messages: PrivateMessage[] | GroupMessage[];
    users?: TenantUser[] | User;
    private: boolean;
    onSend: (message: string, files?: File[]) => void;
    onReport: (messageId: string, name?: string) => void;
}

const ChatMessageContainer = (props: ChatMessageContainerProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { desktopOpened } = useContext(SidebarContext);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [messages, setMessages] = useState<GroupMessage[] | PrivateMessage[]>(
        []
    );
    const [currentText, setCurrentText] = useState<string>('');
    const [reportedMessage, setReportedMessage] = useState<string | null>(null);
    const [reportedName, setReportedName] = useState<string | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const editorWidth = useMemo(
        () => (desktopOpened ? 'calc(100% - 240px)' : 'calc(100% - 60px)'),
        [desktopOpened]
    );

    const getUserNameById = (userId: string) => {
        if (props.users) {
            if (props.private) {
                if (userId === authData?._id) {
                    return (
                        (authData.contact as UserContact).first_name +
                        ' ' +
                        (authData.contact as UserContact).last_name
                    );
                } else {
                    return (
                        (props.users as User).firstName +
                        ' ' +
                        (props.users as User).lastName
                    );
                }
            } else {
                const user = (props.users as TenantUser[]).find(
                    (user) => user._id === userId
                );
                if (user) {
                    return user.firstName + ' ' + user.lastName;
                }
            }
        }
        return t('CHAT.UNKNOWN_SENDER');
    };

    const handleFileUpload = (files: File[] | null) => {
        if (files) {
            setAttachedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImageFile = (file: File) => {
        return file.type.startsWith('image/');
    };

    useEffect(() => {
        setMessages(props.messages);
    }, [props.messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const messagesByDate = useMemo(() => {
        const groups: { [key: string]: Array<GroupMessage | PrivateMessage> } =
            {};
        messages.forEach((msg) => {
            const dateKey = new Date(msg.creationDate).toLocaleDateString(
                'de-DE'
            );
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        return groups;
    }, [messages]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '80vh',
            }}
        >
            <EDIModal
                visible={reportedMessage !== null}
                onClose={() => setReportedMessage(null)}
                title="Nachricht melden"
                type="CUSTOM"
                footer={
                    <Group justify="right">
                        <Button variant="outline" onClick={() => setReportedMessage(null)}>
                            Abbrechen
                        </Button>
                        <Button variant="filled" color="red" onClick={() => {
                            props.onReport(reportedMessage!, reportedName || undefined);
                            setReportedMessage(null);
                        }}>
                            {t('CHAT.REPORT_MESSAGE')}
                        </Button>
                    </Group>
                }
            >
                <Text>{t('CHAT.REPORT_MESSAGE_DESCRIPTION')}</Text>
            </EDIModal>
            <ScrollArea
                style={{ overflowY: 'hidden', flexGrow: 1 }}
                scrollbarSize={0}
            >
                <Flex direction="column" pb={45}>
                    {/* Add Date if message is on a new day */}
                    {Object.entries(messagesByDate).map(([date, msgs]) => (
                        <Fragment key={date}>
                            <Paper w="100%">
                                <Text ta="center" size="xs" mt="sm" mb="sm">
                                    {new Date(
                                        msgs[0].creationDate
                                    ).toLocaleDateString('de-DE', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </Paper>
                            {msgs.map((msg) => (
                                <ChatMessage
                                    key={msg._id}
                                    message={msg.content}
                                    author={getUserNameById(msg.authorId)}
                                    timestamp={msg.creationDate}
                                    isOwnMessage={
                                        msg.authorId === authData?._id
                                    }
                                    files={msg.files}
                                    onReport={() => {
                                        setReportedMessage(msg._id);
                                        setReportedName(getUserNameById(msg.authorId));
                                    }}
                                />
                            ))}
                        </Fragment>
                    ))}
                    {messages.length === 0 && (
                        <Text>
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                    <div ref={messagesEndRef} />
                </Flex>
            </ScrollArea>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    props.onSend(currentText, attachedFiles.length > 0 ? attachedFiles : undefined);
                    setCurrentText('');
                    setAttachedFiles([]);
                }}
            >
                <Stack
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        zIndex: 10,
                        padding: '0px 15px 10px 15px',
                        width: editorWidth,
                    }}
                    gap="xs"
                >
                    {/* File Preview Section - Compact inline preview */}
                    {attachedFiles.length > 0 && (
                        <Paper p="xs" withBorder radius="md" style={{ width: '100%' }}>
                            <Group gap="xs" wrap="wrap">
                                {attachedFiles.map((file, index) => (
                                    <Group key={index} gap="xs" style={{ maxWidth: '200px' }}>
                                        {isImageFile(file) ? (
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                w={30}
                                                h={30}
                                                fit="cover"
                                                radius="sm"
                                            />
                                        ) : (
                                            <ActionIcon variant="light" size="sm">
                                                <IconPaperclip size={12} />
                                            </ActionIcon>
                                        )}
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <Text size="xs" truncate>
                                                {file.name}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {formatFileSize(file.size)}
                                            </Text>
                                        </div>
                                        <CloseButton
                                            size="xs"
                                            onClick={() => removeFile(index)}
                                            aria-label={t('COMMON.REMOVE')}
                                        />
                                    </Group>
                                ))}
                            </Group>
                        </Paper>
                    )}
                    
                    <Textarea
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        mih={50}
                        mah={100}
                        w="100%"
                        leftSection={
                            <ActionIcon
                                variant="subtle"
                                size="lg"
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.accept = 'image/*,.pdf,.doc,.docx,.txt,.zip,.rar';
                                    input.onchange = (e) => {
                                        const files = Array.from((e.target as HTMLInputElement).files || []);
                                        handleFileUpload(files);
                                    };
                                    input.click();
                                }}
                            >
                                <IconPaperclip size={16} />
                            </ActionIcon>
                        }
                        leftSectionWidth={50}
                        rightSection={
                            <ActionIcon
                                h={35}
                                w={35}
                                variant="filled"
                                type='submit'
                            >
                                <IconSend />
                            </ActionIcon>
                        }
                        rightSectionWidth={50}
                    />
                </Stack>
            </form>
        </div>
    );
};

export default ChatMessageContainer;
