import { Flex, Grid } from '@mantine/core';
import de from '../../../lang/de';
import TenantIntegration from './TenantIntegration';
import { Tenant } from '@eduinteractive/uvc-api';

interface TenantIntegrationOnUpdate {
    integrations: {
        [key: string]: boolean;
    };
}

interface TenantIntegrationsProps {
    tenant: Tenant;
    onUpdate: (values: TenantIntegrationOnUpdate) => void;
}

const TenantIntegrations = (props: TenantIntegrationsProps) => {
    return (
        <>
            <Flex align="stretch" justify="stretch">
                <Grid columns={3}>
                    {de.TENANT_INTEGRATIONS.map((integration, index) => (
                        <Grid.Col span={1} key={index} style={{ alignItems: 'stretch'}}>
                            <TenantIntegration
                                title={integration.title}
                                subtitle={integration.subtitle}
                                description={integration.description}
                                active={
                                    props.tenant.integrations[
                                        integration.key as keyof Tenant['integrations']
                                    ]
                                }
                                onClick={() => {
                                    props.onUpdate({
                                        integrations: {
                                            [integration.key as keyof Tenant['integrations']]:
                                                !props.tenant.integrations[
                                                    integration.key as keyof Tenant['integrations']
                                                ],
                                        },
                                    });
                                }}
                            />
                        </Grid.Col>
                    ))}
                </Grid>
            </Flex>
        </>
    );
};

export default TenantIntegrations;
