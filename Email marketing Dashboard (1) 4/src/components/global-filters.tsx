import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUSES, useFilteredData, useFilters, type RangePreset } from "@/lib/filters-context";
import type { DateRange } from "react-day-picker";

const presets: { value: RangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export function GlobalFilters() {
  const { filters, setFilters, reset } = useFilters();
  const { campaignOptions, tagOptions, isLoading } = useFilteredData();

  const range: DateRange | undefined =
    filters.preset === "custom" && filters.from ? { from: filters.from, to: filters.to } : undefined;

  const customLabel =
    filters.from && filters.to
      ? `${format(filters.from, "MMM d")} – ${format(filters.to, "MMM d")}`
      : "Pick dates";

  const dirty = filters.preset !== "30d" || filters.campaign !== "all" || filters.status !== "all" || filters.tag !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.preset} onValueChange={(v) => setFilters({ preset: v as RangePreset })}>
        <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {presets.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {filters.preset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 justify-start font-normal", !range && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {customLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => setFilters({ from: r?.from, to: r?.to })}
              numberOfMonths={2}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}

      <Select value={filters.campaign} onValueChange={(v) => setFilters({ campaign: v })}>
        <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Campaign" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All campaigns</SelectItem>
          {campaignOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => setFilters({ status: v })}>
        <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.tag} onValueChange={(v) => setFilters({ tag: v })}>
        <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Tag" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tagOptions?.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {dirty && (
        <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground" onClick={reset}>
          <X className="mr-1 h-3.5 w-3.5" />Reset
        </Button>
      )}

      {isLoading && <span className="text-xs text-muted-foreground">Syncing Instantly…</span>}
    </div>
  );
}
