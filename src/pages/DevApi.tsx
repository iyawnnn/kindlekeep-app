// src/pages/DevApi.tsx
import { ApiKeyList } from '../features/dev/components/ApiKeyList';
import { GithubWebhookPanel } from '../features/dev/components/GithubWebhookPanel';

export const DevApi = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold text-black mb-8">
        Dev / API
      </h1>

      <div className="flex flex-col gap-8">
        <ApiKeyList />
        <GithubWebhookPanel />
      </div>
    </div>
  );
};
