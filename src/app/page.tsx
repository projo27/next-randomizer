import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab =
    typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'list';

  redirect(`/tool/${tab}`);
}
