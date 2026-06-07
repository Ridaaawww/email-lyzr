import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Campaign {
  name: string; status: string; sent: number; openRate: number; replyRate: number; meetings: number; owner: string;
}

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Paused: "bg-warning/10 text-warning-foreground border-warning/20",
  Completed: "bg-muted text-muted-foreground border-border",
  Draft: "bg-info/10 text-info border-info/20",
};

export function CampaignTable({ data, limit }: { data: Campaign[]; limit?: number }) {
  const rows = limit ? data.slice(0, limit) : data;
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
        No campaigns match the current filters.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Sent</TableHead>
            <TableHead className="text-right">Open</TableHead>
            <TableHead className="text-right">Reply</TableHead>
            <TableHead className="text-right">Opps</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.name}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("font-medium", statusStyle[c.status])}>{c.status}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{c.sent.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums">{c.openRate}%</TableCell>
              <TableCell className="text-right tabular-nums">{c.replyRate}%</TableCell>
              <TableCell className="text-right tabular-nums">{c.meetings}</TableCell>
              <TableCell className="text-muted-foreground">{c.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
