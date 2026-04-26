import React, { Fragment, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ActionIcon,
    Box,
    Group,
    Indicator,
    NavLink,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
} from '@mantine/core';
import classes from './SVHNavLinksGroup.module.css';
import { SidebarContext } from '../../layouts/SVHAppShell';

interface SVHNavLinksGroupProps {
    icon: React.FC;
    label: string;
    initiallyOpened?: boolean;
    links?: {
        label: string;
        link: string;
        indicator?: string;
        icon?: React.FC;
        color?: string;
    }[];
    link: string;
    visible: boolean;
    color?: string;
    onNavigate: () => void;
    translateLabel?: (label: string) => string;
}

const SVHNavLinksGroup = ({
    icon: Icon,
    color,
    label,
    links,
    link,
    visible,
    onNavigate,
    translateLabel,
}: SVHNavLinksGroupProps) => {
    const { mobileOpened, desktopOpened } = useContext(SidebarContext);
    const route = useLocation();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const hasLinks = Array.isArray(links);

    const items = (hasLinks ? links : []).map((linkItem) => {
        return (
            <Fragment key={linkItem.link}>
                {(mobileOpened || desktopOpened) && (
                    <NavLink
                        py="sm"
                        component={Link}
                        key={linkItem.label}
                        to={linkItem.link}
                        label={translateLabel ? translateLabel(linkItem.label) : linkItem.label}
                        style={{
                            fontSize: theme.fontSizes.xs,
                            borderLeft: route.pathname.includes(linkItem.link)
                                ? `3px solid var(--mantine-color-blue-light-color)`
                                : 'none',
                        }}
                        className={classes.navLink}
                        leftSection={
                            linkItem.icon && (
                                <ThemeIcon
                                    variant="subtle"
                                    size="xs"
                                    color={
                                        linkItem.color
                                            ? linkItem.color
                                            : theme.primaryColor
                                    }
                                >
                                    <linkItem.icon />
                                </ThemeIcon>
                            )
                        }
                        rightSection={
                            linkItem.indicator ? (
                                <Box
                                    style={{
                                        backgroundColor: theme.colors.red[6],
                                        color: theme.colors.red[0],
                                        padding: '2px 4px',
                                        borderRadius: 4,
                                    }}
                                >
                                    <Text size="xs" fw="bold">
                                        {linkItem.indicator}
                                    </Text>
                                </Box>
                            ) : null
                        }
                        onClick={() => onNavigate()}
                    />
                )}
                {!mobileOpened && !desktopOpened && linkItem.icon && (
                    <Group justify="center" py="sm" px="md">
                        <Indicator
                            disabled={!route.pathname.includes(linkItem.link)}
                            color={
                                linkItem.color
                                    ? linkItem.color
                                    : theme.primaryColor
                            }
                            position='bottom-center'
                            size={5}
                        >
                            <ActionIcon
                                variant="subtle"
                                key={linkItem.label}
                                onClick={() => {
                                    navigate(linkItem.link)
                                    onNavigate()
                                }}
                                color={
                                    linkItem.color
                                        ? linkItem.color
                                        : theme.primaryColor
                                }
                            >
                                <linkItem.icon />
                            </ActionIcon>
                        </Indicator>
                    </Group>
                )}
            </Fragment>
        );
    });

    return (
        <>
            {hasLinks && (
                <>
                    {visible && (mobileOpened || desktopOpened) && (
                        <UnstyledButton mt="md">
                            <Group justify="space-between">
                                <Box
                                    component={Link}
                                    to={link}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        padding: '8px',
                                    }}
                                >
                                    <ThemeIcon
                                        variant="subtle"
                                        size="xs"
                                        color={
                                            color ? color : theme.primaryColor
                                        }
                                    >
                                        <Icon />
                                    </ThemeIcon>
                                    <Text
                                        size="xs"
                                        fw="bold"
                                        style={{ marginLeft: theme.spacing.xs }}
                                        c={color ? color : theme.primaryColor}
                                    >
                                        {(translateLabel ? translateLabel(label) : label).toUpperCase()}
                                    </Text>
                                </Box>
                            </Group>
                        </UnstyledButton>
                    )}
                    {items}
                </>
            )}
        </>
    );
};

export default SVHNavLinksGroup;
