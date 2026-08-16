import { notFound } from "next/navigation";
import { DailyDashboard } from "@/components/daily-dashboard";
import { loadAppData } from "@/lib/data";
import { dateInTimeZone } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T12:00:00Z`).getTime())) {
    notFound();
  }
  const data = await loadAppData();
  const today = dateInTimeZone(
    new Date(),
    process.env.APP_TIMEZONE || "America/Chicago",
  );
  return <DailyDashboard data={data} date={date} today={today} />;
}
