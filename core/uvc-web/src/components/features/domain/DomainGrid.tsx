import { ActionIcon, Card, Divider, Flex, Group, SimpleGrid, Title } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Domain } from "@eduinteractive/uvc-api";

interface DomainGridProps {
    data: Domain[];
}

const DomainGrid = (props: DomainGridProps) => {
    const navigate = useNavigate();

    return (
        <SimpleGrid cols={{ base: 1, xs: 1, sm: 1, md: 3 }} spacing="md">
            {props.data.map((domain) => (
                <Card shadow="sm" withBorder key={domain._id}>
                    <Card.Section p="md" h={75}>
                        <Group justify="space-between" wrap="nowrap">
                            <Flex direction="column">
                                <Title order={6} mt="0" lineClamp={1}>
                                    {domain.title}
                                </Title>
                                <Title order={6} c="dimmed">
                                    {domain.shortcode}
                                </Title>
                            </Flex>
                        </Group>
                    </Card.Section>
                    <Card.Section>
                        <Divider w="100%" />
                        <Group justify="right" p="sm">
                            <Group gap="sm">
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() =>
                                        navigate(
                                            `/d_admin/domains/${domain._id}`
                                        )
                                    }
                                >
                                    <IconEye size={24} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Card.Section>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default DomainGrid;