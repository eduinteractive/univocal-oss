import { Center, Flex } from '@mantine/core';
import SVHTitle from '../../common/SVHTitle';

interface AuthWrapperProps {
    children?: React.ReactNode;
}

const AuthWrapper = (props: AuthWrapperProps) => {
    return (
        <Flex
            direction="column"
            mih="100vh"
            style={{ overflow: 'hidden' }}
            maw={920}
            mx="auto"
        >
            <Flex
                direction="column"
                flex={1}
                mih="100%"
                bg="blue.1"
                pos="absolute"
                style={{
                    overflow: 'hidden',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    backgroundImage: 'url(https://medienzentrum-frankfurt.de/images/easyblog_articles/1282/SV-Hub_202303_1024x768Px_72ppi.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(5px)',
                }}
            />
            <Flex
                direction="column"
                flex={1}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Center
                    mih="100%"
                    w="100%"
                    style={{
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <Flex
                        direction="column"
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            maxWidth: '90%',
                            width: '90%',
                        }}
                        px="md"
                    >
                        <SVHTitle />
                        {props.children}
                    </Flex>
                </Center>
            </Flex>
        </Flex>
    );
};

export default AuthWrapper;
