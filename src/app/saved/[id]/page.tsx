import SavedRecordPage from "@/components/SavedRecordPage";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SavedRecordPage params={params} />;
}
