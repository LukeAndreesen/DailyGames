import { DailyDashboard } from "@/components/daily-dashboard";
import { loadAppData } from "@/lib/data";
import { dateInTimeZone } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await loadAppData();
  const timeZone = process.env.APP_TIMEZONE || "America/Chicago";
  const today = dateInTimeZone(new Date(), timeZone);
  return <DailyDashboard data={data} date={today} today={today} />;
}
