"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  History,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type WorkOrder = {
  id: string;
  customer: string;
  issue: string;
  zone: string;
  priority: "Emergency" | "Urgent" | "Routine";
  status: string;
  technician: string;
  score: number;
  sla: string;
  partsReady: boolean;
};

const seededOrders: WorkOrder[] = [
  {
    id: "WO-1048",
    customer: "Northline Bakery",
    issue: "Walk-in freezer above setpoint",
    zone: "Burnaby",
    priority: "Emergency",
    status: "Awaiting approval",
    technician: "Jordan Kim",
    score: 94,
    sla: "18 min",
    partsReady: true,
  },
  {
    id: "WO-1047",
    customer: "Cedar Family Dental",
    issue: "Heat pump intermittent lockout",
    zone: "Richmond",
    priority: "Urgent",
    status: "Dispatched",
    technician: "Amir Shah",
    score: 88,
    sla: "42 min",
    partsReady: true,
  },
  {
    id: "WO-1046",
    customer: "Harbourview Offices",
    issue: "Rooftop unit vibration",
    zone: "Vancouver",
    priority: "Routine",
    status: "Scheduled",
    technician: "Sofia Reyes",
    score: 81,
    sla: "2h 10m",
    partsReady: false,
  },
  {
    id: "WO-1045",
    customer: "Maple Grove Market",
    issue: "Refrigeration case icing",
    zone: "Surrey",
    priority: "Urgent",
    status: "On site",
    technician: "Noah Chen",
    score: 86,
    sla: "On track",
    partsReady: true,
  },
];

const navigation = [
  ["Dispatch control", LayoutDashboard],
  ["Work orders", ClipboardCheck],
  ["Technicians", Users],
  ["Parts readiness", Boxes],
  ["Approvals", ShieldCheck],
  ["Service assistant", Bot],
  ["Analytics", Gauge],
  ["Audit trail", History],
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
        <Gauge />
      </span>
      <span>
        <strong className="block text-[15px] tracking-tight text-white">
          NORTHSTAR
        </strong>
        <small className="text-xs text-slate-400">Field operations</small>
      </span>
    </div>
  );
}

function Priority({ value }: { value: WorkOrder["priority"] }) {
  const color =
    value === "Emergency"
      ? "border-red-200 bg-red-50 text-red-700"
      : value === "Urgent"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-sky-200 bg-sky-50 text-sky-700";
  return (
    <Badge variant="outline" className={color}>
      {value}
    </Badge>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(23,32,51,.05)]">
      <div className="flex items-start gap-4">
        <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <strong className="mt-1 block text-3xl tracking-tight text-slate-900">
            {value}
          </strong>
          <small className="text-slate-400">{note}</small>
        </div>
      </div>
    </article>
  );
}

function NewOrder({ add }: { add: (order: WorkOrder) => void }) {
  const [open, setOpen] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    add({
      id: `WO-${1050 + Math.floor(Math.random() * 40)}`,
      customer: String(data.get("customer")),
      issue: String(data.get("issue")),
      zone: String(data.get("zone")),
      priority: String(data.get("priority")) as WorkOrder["priority"],
      status: "New intake",
      technician: "Unassigned",
      score: 0,
      sla: "Untriaged",
      partsReady: false,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 bg-orange-500 text-white hover:bg-orange-600">
          <Plus /> New work order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New service request</DialogTitle>
            <DialogDescription>
              Capture symptoms and context. Dispatch remains a human-controlled
              decision.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Customer
              <Input
                name="customer"
                required
                placeholder="Business or resident"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Service zone
              <Select name="zone" defaultValue="Vancouver">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vancouver">Vancouver</SelectItem>
                  <SelectItem value="Burnaby">Burnaby</SelectItem>
                  <SelectItem value="Richmond">Richmond</SelectItem>
                  <SelectItem value="Surrey">Surrey</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Reported issue
              <Input
                name="issue"
                required
                placeholder="Describe symptoms, not a diagnosis"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Priority
              <Select name="priority" defaultValue="Routine">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              Create intake
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Orders({ orders }: { orders: WorkOrder[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Work order</TableHead>
          <TableHead>Customer / issue</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignment</TableHead>
          <TableHead>Parts</TableHead>
          <TableHead>SLA</TableHead>
          <TableHead className="text-right">Fit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <strong>{order.id}</strong>
              <small className="block text-slate-500">{order.zone}</small>
            </TableCell>
            <TableCell className="max-w-[280px] whitespace-normal">
              <strong className="block">{order.customer}</strong>
              <small className="line-clamp-1 text-slate-500">
                {order.issue}
              </small>
            </TableCell>
            <TableCell>
              <Priority value={order.priority} />
            </TableCell>
            <TableCell>
              <span className="block">{order.technician}</span>
              <small className="text-slate-500">{order.status}</small>
            </TableCell>
            <TableCell>
              {order.partsReady ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="size-4" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <AlertTriangle className="size-4" /> Review
                </span>
              )}
            </TableCell>
            <TableCell>{order.sla}</TableCell>
            <TableCell className="text-right">
              <b className="inline-grid min-w-9 place-items-center rounded-lg bg-cyan-50 px-2 py-1 text-cyan-700">
                {order.score || "—"}
              </b>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function WorkspaceView({ index }: { index: number }) {
  const [decision, setDecision] = useState("Pending");
  const [question, setQuestion] = useState(
    "How should I prepare for a filter replacement?",
  );
  const [answer, setAnswer] = useState("");
  const title = navigation[index]?.[0] ?? "Operations";
  if (index === 4)
    return (
      <section>
        <p className="eyebrow">Human control</p>
        <h1 className="page-title">Approval queue</h1>
        <div className="workspace-grid">
          <article className="panel">
            <Badge className="bg-red-100 text-red-700">Safety escalation</Badge>
            <h2 className="mt-4 text-xl font-bold">
              WO-1048 · Northline Bakery
            </h2>
            <p className="mt-2 text-slate-500">
              Commercial refrigeration outage. Parts are ready; assignment
              requires dispatcher confirmation.
            </p>
            <div className="evidence">
              <span>
                Required skill <b>Matched</b>
              </span>
              <span>
                Travel <b>8 km</b>
              </span>
              <span>
                Parts <b>Ready</b>
              </span>
              <span>
                Recommended fit <b>94 / 100</b>
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                onClick={() => setDecision("Approved")}
                className="bg-emerald-600 text-white"
              >
                Approve dispatch
              </Button>
              <Button onClick={() => setDecision("Rejected")} variant="outline">
                Reject
              </Button>
            </div>
            <p className="mt-4 text-sm font-semibold">
              Decision:{" "}
              <span
                className={
                  decision === "Approved"
                    ? "text-emerald-700"
                    : decision === "Rejected"
                      ? "text-red-700"
                      : "text-orange-600"
                }
              >
                {decision}
              </span>
            </p>
          </article>
          <article className="panel">
            <h2 className="text-lg font-bold">Control boundary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The assistant prepares evidence and a deterministic scorer ranks
              eligible technicians. It cannot assign, contact a customer, or
              release inventory without the approved workflow state.
            </p>
            <ShieldCheck className="mt-6 size-16 text-cyan-600" />
          </article>
        </div>
      </section>
    );
  if (index === 5)
    return (
      <section>
        <p className="eyebrow">Approved knowledge only</p>
        <h1 className="page-title">Service assistant</h1>
        <div className="workspace-grid">
          <article className="panel">
            <label className="text-sm font-semibold">
              Ask an operational question
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-3 min-h-28"
            />
            <Button
              className="mt-4 bg-slate-900 text-white"
              onClick={() =>
                setAnswer(
                  /gas|smoke|fire|carbon monoxide/i.test(question)
                    ? "Safety boundary triggered. Stop remote troubleshooting and escalate to the on-call dispatcher."
                    : "Confirm the equipment model and filter dimensions. Power-down guidance must come from the approved service procedure. Source: KB-102.",
                )
              }
            >
              Ask with guardrails
            </Button>
            {answer && (
              <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-slate-700">
                {answer}
              </div>
            )}
          </article>
          <article className="panel">
            <Bot className="size-10 text-orange-500" />
            <h2 className="mt-4 text-lg font-bold">Grounding policy</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-500">
              <li>• Approved articles only</li>
              <li>• Citation required for supported answers</li>
              <li>• Insufficient evidence triggers escalation</li>
              <li>
                • Gas, CO, fire, electrical and refrigerant hazards stop
                automation
              </li>
            </ul>
          </article>
        </div>
      </section>
    );
  const content: Record<
    number,
    { stat: string; note: string; rows: string[][] }
  > = {
    1: {
      stat: "23 open",
      note: "5 need assignment · 92% SLA on track",
      rows: [
        ["WO-1048", "Emergency", "Awaiting approval"],
        ["WO-1047", "Urgent", "Dispatched"],
        ["WO-1046", "Routine", "Scheduled"],
      ],
    },
    2: {
      stat: "11 / 14 active",
      note: "Skills, capacity and expiry visibility",
      rows: [
        ["Jordan Kim", "Refrigeration", "62% load"],
        ["Amir Shah", "Heat pumps", "48% load"],
        ["Sofia Reyes", "RTU + refrigeration", "35% load"],
      ],
    },
    3: {
      stat: "84% ready",
      note: "3 work orders blocked by parts",
      rows: [
        ["CNT-2P-40A", "8 on hand", "Ready"],
        ["FLT-16X25", "21 on hand", "Ready"],
        ["CAP-45-5", "2 on hand", "Reorder"],
      ],
    },
    6: {
      stat: "91.7% first-time fix",
      note: "+3.2 points over 30 days",
      rows: [
        ["SLA compliance", "92%", "Target 90%"],
        ["Median travel", "24 min", "Target 30 min"],
        ["Repeat visits", "8.3%", "Down 2.1%"],
      ],
    },
    7: {
      stat: "Immutable events",
      note: "Who did what, when, and against which entity",
      rows: [
        ["07:41", "dispatcher", "Approval requested"],
        ["07:36", "workflow", "Parts reserved"],
        ["07:31", "assistant", "Evidence extracted"],
      ],
    },
  };
  const data = content[index] ?? content[1];
  return (
    <section>
      <p className="eyebrow">Northstar operations</p>
      <h1 className="page-title">{title}</h1>
      <article className="panel">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <span>
            <strong className="block text-3xl tracking-tight">
              {data.stat}
            </strong>
            <small className="text-slate-500">{data.note}</small>
          </span>
          <Button variant="outline">Export current view</Button>
        </div>
        <Table>
          <TableBody>
            {data.rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell
                    key={j}
                    className={j === 0 ? "font-semibold" : "text-slate-600"}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </article>
    </section>
  );
}

export default function Home() {
  const [orders, setOrders] = useState(seededOrders);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        Object.values(o).join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, query],
  );
  return (
    <SidebarProvider>
      <Sidebar className="border-r-0">
        <SidebarHeader className="border-b border-white/10 px-5 py-5">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="px-3 py-5">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(([label, Icon], index) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      onClick={() => setCurrent(index)}
                      isActive={index === current}
                      tooltip={label}
                      className="h-11"
                    >
                      <Icon />
                      <span>{label}</span>
                      {label === "Approvals" && (
                        <b className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-[11px] text-white">
                          3
                        </b>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-slate-800 text-xs font-bold text-white">
              MC
            </span>
            <span>
              <strong className="block text-sm text-white">Maya Chen</strong>
              <small className="text-slate-400">Dispatch manager</small>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b bg-white/95 px-7 backdrop-blur">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span>
              <small className="block text-slate-500">Operations</small>
              <strong>{navigation[current]?.[0]}</strong>
            </span>
          </div>
          <label className="flex w-[min(430px,42vw)] items-center gap-2 rounded-xl bg-slate-100 px-3 text-slate-400">
            <Search className="size-4" />
            <Input
              aria-label="Search operations"
              placeholder="Search orders, customers, technicians…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent shadow-none"
            />
          </label>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Notifications"
            className="relative"
          >
            <Bell />
            <i className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </Button>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-7">
          {current !== 0 ? (
            <WorkspaceView index={current} />
          ) : (
            <>
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-orange-600">
                <Radio className="size-4" /> Live operations · Greater Vancouver
              </span>
              <h1 className="mt-1 text-4xl font-extrabold tracking-[-.045em] text-slate-900">
                Dispatch control
              </h1>
              <p className="mt-1 text-slate-500">
                Tuesday, September 2 · 07:42 local time
              </p>
            </div>
            <NewOrder add={(o) => setOrders([o, ...orders])} />
          </div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={ClipboardCheck}
              label="Open work orders"
              value={String(orders.length + 19)}
              note="5 need assignment"
              tone="bg-orange-50 text-orange-600"
            />
            <Metric
              icon={Truck}
              label="Technicians active"
              value="11 / 14"
              note="3 currently available"
              tone="bg-cyan-50 text-cyan-700"
            />
            <Metric
              icon={CalendarClock}
              label="SLA on track"
              value="92%"
              note="+4.8% vs last week"
              tone="bg-emerald-50 text-emerald-700"
            />
            <Metric
              icon={PackageCheck}
              label="Parts ready"
              value="84%"
              note="3 orders blocked"
              tone="bg-violet-50 text-violet-700"
            />
          </section>
          <section className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_.66fr]">
            <article className="rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(23,32,51,.05)]">
              <div className="flex items-start justify-between">
                <span>
                  <small className="text-slate-500">Service coverage</small>
                  <h2 className="text-lg font-bold">Live territory</h2>
                </span>
                <Badge className="bg-emerald-100 text-emerald-700">
                  11 online
                </Badge>
              </div>
              <div className="territory">
                <span className="zone z1">VAN</span>
                <span className="zone z2">BBY</span>
                <span className="zone z3">RMD</span>
                <span className="zone z4">SRY</span>
                {["d1", "d2", "d3", "d4"].map((x) => (
                  <span className={`tech ${x}`} key={x}>
                    <Truck />
                  </span>
                ))}
                <span className="incident">
                  <AlertTriangle /> Emergency intake
                </span>
                <small className="map-note">
                  <MapPin /> Operational visualization · not GPS tracking
                </small>
              </div>
              <div className="grid grid-cols-3 divide-x pt-4 text-center">
                <span>
                  <small className="block text-slate-500">Median travel</small>
                  <b>24 min</b>
                </span>
                <span>
                  <small className="block text-slate-500">Coverage gaps</small>
                  <b>1 zone</b>
                </span>
                <span>
                  <small className="block text-slate-500">
                    Emergency capacity
                  </small>
                  <b>2 crews</b>
                </span>
              </div>
            </article>
            <article className="rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(23,32,51,.05)]">
              <div className="flex justify-between">
                <span>
                  <small className="text-slate-500">Decision support</small>
                  <h2 className="text-lg font-bold">Next best dispatch</h2>
                </span>
                <Sparkles className="text-orange-500" />
              </div>
              <div className="mt-5">
                <div className="flex justify-between">
                  <Priority value="Emergency" />
                  <code className="text-xs text-slate-500">WO-1048</code>
                </div>
                <h3 className="mt-5 text-xl font-bold">Northline Bakery</h3>
                <p className="text-sm text-slate-500">
                  Walk-in freezer above setpoint
                </p>
                <div className="my-5 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-slate-800 text-xs font-bold text-white">
                    JK
                  </span>
                  <span className="flex-1">
                    <b className="block">Jordan Kim</b>
                    <small className="text-slate-500">
                      Commercial refrigeration
                    </small>
                  </span>
                  <strong className="text-xl text-orange-600">94</strong>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ["Required skill", "Matched"],
                    ["Travel distance", "8 km"],
                    ["Parts readiness", "Ready"],
                    ["Current workload", "62%"],
                  ].map((x) => (
                    <div
                      key={x[0]}
                      className="flex justify-between border-b border-dashed pb-2"
                    >
                      <span className="text-slate-500">{x[0]}</span>
                      <b>{x[1]}</b>
                    </div>
                  ))}
                </div>
                <Button className="mt-5 w-full bg-slate-900 text-white">
                  <ShieldCheck /> Review human approval
                </Button>
                <small className="mt-3 block text-center leading-5 text-slate-500">
                  AI structures evidence. A dispatcher makes the final
                  assignment.
                </small>
              </div>
            </article>
          </section>
          <article className="mt-4 rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(23,32,51,.05)]">
            <div className="mb-3">
              <small className="text-slate-500">Current queue</small>
              <h2 className="text-lg font-bold">Priority work orders</h2>
            </div>
            <Orders orders={filtered} />
          </article>
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
