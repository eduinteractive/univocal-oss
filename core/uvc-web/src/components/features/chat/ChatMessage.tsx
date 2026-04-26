import {
    ActionIcon,
    Group,
    Menu,
    Paper,
    Text,
    Stack,
    Image,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
    IconDotsVertical,
    IconDownload,
    IconFile,
    IconPhoto,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface ChatMessageProps {
    message: string;
    author: string;
    timestamp: Date;
    isOwnMessage: boolean;
    onReport: () => void;
    files?: {
        title: string;
        link: string;
        mimetype: string;
    }[];
}

const ChatMessage = (props: ChatMessageProps) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState(props.message);

    const isImageFile = (mimetype: string) => {
        return mimetype.startsWith('image/');
    };

    const getFileIcon = (mimetype: string) => {
        if (isImageFile(mimetype)) {
            return <IconPhoto size={16} />;
        }
        return <IconFile size={16} />;
    };

    useEffect(() => {
        let formattedMessage = props.message;

        // Linkify URLs
        const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g;
        formattedMessage = formattedMessage.replace(urlRegex, (url) => {
            const href = url.startsWith('http') ? url : `http://${url}`;
            return `<a href="${href}" target="_blank" style="color: #fff">${url}</a>`;
        });

        // Bold text wrapped with **
        const boldRegex = /\*\*(.*?)\*\*/g;
        formattedMessage = formattedMessage.replace(boldRegex, (_match, p1) => {
            return `<strong>${p1}</strong>`;
        });

        const sanitizedMessage = DOMPurify.sanitize(formattedMessage);
        setMessage(sanitizedMessage);

        setMessage(formattedMessage);
    }, [props.message]);

    return (
        <Group align="center">
            <Paper
                mb="sm"
                shadow="xs"
                radius="md"
                p="md"
                style={{
                    width: 'fit-content',
                    maxWidth: '70%',
                    marginLeft: props.isOwnMessage ? 'auto' : '0', // Rechtsbündig, wenn eigene Nachricht
                }}
                bg={props.isOwnMessage ? '#1E96FC' : 'gray'}
                c="white"
            >
                <Stack gap="xs">
                    <Text size="xs" c="white">
                        {props.author}
                    </Text>

                    {/* Files Display */}
                    {props.files && props.files.length > 0 && (
                        <Stack gap="xs">
                            {props.files.map((file, index) => (
                                <Paper
                                    key={index}
                                    p="xs"
                                    radius="sm"
                                    style={{
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <Group gap="xs" wrap="nowrap">
                                        {isImageFile(file.mimetype) ? (
                                            <Image
                                                src={`${
                                                    import.meta.env
                                                        .VITE_KUBERNETES_HOST
                                                }/api/chat/private/stream/${encodeURIComponent(
                                                    file.link as string
                                                )}`}
                                                alt={file.title}
                                                w={60}
                                                h={60}
                                                fit="cover"
                                                radius="sm"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/api/chat/private/stream/${encodeURIComponent(
                                                            file.link as string
                                                        )}`,
                                                        '_blank'
                                                    )
                                                }
                                            />
                                        ) : (
                                            <ActionIcon
                                                variant="light"
                                                size="lg"
                                                color="white"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(255, 255, 255, 0.2)',
                                                }}
                                            >
                                                {getFileIcon(file.mimetype)}
                                            </ActionIcon>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text size="sm" c="white" truncate>
                                                {file.title}
                                            </Text>
                                            <Text
                                                size="xs"
                                                c="rgba(255, 255, 255, 0.7)"
                                            >
                                                {file.mimetype}
                                            </Text>
                                        </div>
                                        <ActionIcon
                                            variant="subtle"
                                            color="white"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    `${
                                                        import.meta.env
                                                            .VITE_KUBERNETES_HOST
                                                    }/api/chat/private/download/${encodeURIComponent(
                                                        file.link as string
                                                    )}`,
                                                    '_blank'
                                                )
                                            }
                                        >
                                            <IconDownload size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {/* Message Content */}
                    {message && (
                        <Text
                            size="sm"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    )}

                    <Text size="xs" c="white" ta="end">
                        {new Date(props.timestamp).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </Stack>
            </Paper>
            {!props.isOwnMessage && (
                <Menu>
                    <Menu.Target>
                        <ActionIcon
                            variant="filled"
                            color="gray.5"
                            size="sm"
                            radius="xl"
                            mb="sm"
                        >
                            <IconDotsVertical />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={props.onReport}>
                            {t('CHAT.REPORT_MESSAGE')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )}
        </Group>
    );
};

export default ChatMessage;
