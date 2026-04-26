import {
    EDIMultiSelect,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import {
    Button,
    Card,
    Container,
    Divider,
    Flex,
    Text,
    Title,
} from '@mantine/core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import SVHTitle from '../components/common/SVHTitle';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import SVHLoader from '../components/common/SVHLoader';
import HTTP_403 from './error/HTTP_403';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const EventRegistration = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [customFields, setCustomFields] = useState<{ [key: string]: any }>(
        {}
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const eventQuery = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => SAPI.EVENT.PUBLIC.getPublicEvent({ eventId: eventId! }),
    });

    const createRegistrationMutation = useMutation({
        mutationFn: SAPI.EVENT.PUBLIC.createEventRegistration,
        onSuccess: () => {
            setIsLoading(false);
            setIsFinished(true);
        },
        onError: (err) => {
            setIsLoading(false);
            NotificationHandler.showAxiosError(err as AxiosError);
        },
    });

    const handleSubmit = () => {
        if (!firstName || !lastName || !email || !eventId) {
            NotificationHandler.showError(t('PAGES.EVENT.REGISTRATION.ERRORS.FILL_ALL_FIELDS'));
            return;
        }

        createRegistrationMutation.mutate({
            eventId,
            body: {
                personal: {
                    firstName,
                    lastName,
                    email,
                },
                customFields,
            },
        });

        setIsLoading(true);
    };

    if (eventQuery.isLoading) {
        return <SVHLoader />;
    }

    if (eventQuery.isError) {
        return <HTTP_403 />;
    }

    if (!eventQuery.data?.config?.registration.enabled) {
        return (
            <HTTP_403
                title={t('PAGES.EVENT.REGISTRATION.NO_ACCESS_TITLE')}
                description={t('PAGES.EVENT.REGISTRATION.NO_ACCESS_DESCRIPTION')}
            />
        );
    }

    return (
        <Container h="100%" size="xl" w="100%" mt="xl" pb="xl">
            <Flex direction="column" gap="md" pb="xl">
                <Card withBorder p="sm" radius="md" shadow="sm" w="100%">
                    <SVHTitle />
                    {isFinished && (
                        <Text size="sm" ta="center" fw="bold" pb="md">
                            {t('PAGES.EVENT.REGISTRATION.THANKS')}
                        </Text>
                    )}
                    {isLoading && <SVHLoader />}
                </Card>
            </Flex>
            {!isFinished && !isLoading && (
                <Card withBorder p="xl" radius="md" shadow="sm" w="100%">
                    <Title order={3}>{eventQuery.data?.title}</Title>
                    <Title order={6} c="dimmed">
                        {dayjs(eventQuery.data?.startDate).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                        {eventQuery.data?.endDate &&
                            ` - ${dayjs(eventQuery.data?.endDate).format(
                                'DD.MM.YYYY HH:mm'
                            )}`}
                    </Title>
                    <Text size="sm">{eventQuery.data?.description}</Text>
                    <Divider my="md" />
                    <Text c="dimmed" size="sm" fw="bold">
                        {t('PAGES.EVENT.REGISTRATION.SECTION_TITLE')}
                    </Text>
                    <EDITextInput
                        label={t('PAGES.EVENT.REGISTRATION.FIELDS.FIRST_NAME')}
                        placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.FIRST_NAME_PLACEHOLDER')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.currentTarget.value)}
                        required
                    />
                    <EDITextInput
                        label={t('PAGES.EVENT.REGISTRATION.FIELDS.LAST_NAME')}
                        placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.LAST_NAME_PLACEHOLDER')}
                        value={lastName}
                        onChange={(e) => setLastName(e.currentTarget.value)}
                        required
                    />
                    <EDITextInput
                        label={t('PAGES.EVENT.REGISTRATION.FIELDS.EMAIL')}
                        placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.EMAIL_PLACEHOLDER')}
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        required
                    />
                    {eventQuery.data?.config?.registration.fields.map(
                        (field) => {
                            if (atob(field.value.split('.')[0]) === 'text') {
                                return (
                                    <EDITextInput
                                        key={field.key}
                                        label={atob(field.key)}
                                        placeholder={atob(field.key)}
                                        value={customFields[field.key]}
                                        onChange={(e) =>
                                            setCustomFields({
                                                ...customFields,
                                                [field.key]:
                                                    e.currentTarget.value,
                                            })
                                        }
                                    />
                                );
                            } else if (atob(field.value.split('.')[0]) === "single_choice") {
                                return (
                                    <EDISelect
                                        key={field.key}
                                        label={atob(field.key)}
                                        placeholder={atob(field.key)}
                                        value={customFields[field.key]}
                                        data={field.value.split('.').slice(1).map((option: string) => ({
                                            label: atob(option),
                                            value: option,
                                        }))}
                                        onChange={(e) =>
                                            setCustomFields({
                                                ...customFields,
                                                [field.key]:
                                                    e as string,
                                            })
                                        }
                                    />
                                );
                            } else if (atob(field.value.split('.')[0]) === "multiple_choice") {
                                return (
                                    <EDIMultiSelect
                                        key={field.key}
                                        label={atob(field.key)}
                                        placeholder={atob(field.key)}
                                        value={customFields[field.key]}
                                        data={field.value.split('.').slice(1).map((option: string) => ({
                                            label: atob(option),
                                            value: option,
                                        }))}
                                        onChange={(e) =>
                                            setCustomFields({
                                                ...customFields,
                                                [field.key]:
                                                    e as string[],
                                            })
                                        }
                                    />
                                )
                            }
                        }
                    )}
                    <Button w="100%" mt="md" onClick={handleSubmit}>
                        {t('PAGES.EVENT.REGISTRATION.SUBMIT')}
                    </Button>
                </Card>
            )}
        </Container>
    );
};

export default EventRegistration;
