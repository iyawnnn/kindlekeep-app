// src/pages/DevApi.tsx
import { Box, Flex, Text } from '@radix-ui/themes';
import { ApiKeyList } from '../features/dev/components/ApiKeyList';
import { GithubWebhookPanel } from '../features/dev/components/GithubWebhookPanel';

export const DevApi = () => {
  return (
    <Box className="max-w-3xl mx-auto py-10 px-6 font-onest">
      <Text className="font-unbounded font-bold text-3xl text-black block mb-8">
        Dev / API
      </Text>

      <Flex direction="column" gap="8">
        <ApiKeyList />
        <GithubWebhookPanel />
      </Flex>
    </Box>
  );
};
