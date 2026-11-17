"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  DoorOpen,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";
import type { RoomListItem } from "@/components/rooms/types";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/api/responses";
import { cn, formatCount, formatRent, pluralize } from "@/lib/utils";

type Filters = {
  block?: string;
  floor?: number;
  type?: string;
  status?: string;
  q?: string;
  page: number;
  pageSize: number;
};

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
  QUAD: "Quad",
};

export function RoomsView({
  rooms,
  meta,
  filters,
  facets,
  role,
}: {
  rooms: RoomListItem[];
  meta: PaginationMeta;
  filters: Filters;
  facets: { blocks: string[]; floors: number[] };
  role: "STUDENT" | "ADMIN";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState(filters.q ?? "");
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    setQuery(filters.q ?? "");
  }, [filters.q]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const suffix = params.toString();
    router.push(suffix ? `${pathname}?${suffix}` : pathname);
  }

  useEffect(() => {
    const current = filters.q ?? "";
    if (query === current) return;
    const timer = setTimeout(() => updateParam("q", query), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  const hasFilters = Boolean(
    filters.q ||
    filters.block ||
    filters.floor !== undefined ||
    filters.type ||
    filters.status
  );

  function resetFilters() {
    router.push(pathname);
    setQuery("");
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description={
          isAdmin
            ? "Manage the hostel's rooms, capacity, rent, and availability."
            : "Browse rooms, amenities, and live availability. Allocations are handled by the hostel office."
        }
      >
        {isAdmin ? (
          <RoomFormDialog
            mode="create"
            trigger={
              <Button>
                <Plus aria-hidden />
                Add room
              </Button>
            }
          />
        ) : null}
      </PageHeader>

      <div className="border-line bg-surface shadow-card mb-5 flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-ink-tertiary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search room number"
            aria-label="Search rooms by room number"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
          <Select
            value={filters.block ?? "all"}
            onValueChange={(value) => updateParam("block", value)}
          >
            <SelectTrigger aria-label="Filter by block" className="md:w-36">
              <SelectValue placeholder="All blocks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blocks</SelectItem>
              {facets.blocks.map((block) => (
                <SelectItem key={block} value={block}>
                  Block {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.floor === undefined ? "all" : String(filters.floor)}
            onValueChange={(value) => updateParam("floor", value)}
          >
            <SelectTrigger aria-label="Filter by floor" className="md:w-36">
              <SelectValue placeholder="All floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All floors</SelectItem>
              {facets.floors.map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.type ?? "all"}
            onValueChange={(value) => updateParam("type", value)}
          >
            <SelectTrigger aria-label="Filter by room type" className="md:w-36">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) => updateParam("status", value)}
          >
            <SelectTrigger aria-label="Filter by status" className="md:w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="FULL">Full</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="col-span-2 justify-self-start md:col-span-1"
            >
              <RotateCcw aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>

        <div className="border-line bg-surface-2 hidden items-center gap-1 rounded-md border p-0.5 lg:flex">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Table view"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <List aria-hidden />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid aria-hidden />
          </Button>
        </div>
      </div>

      <p className="text-ink-tertiary mb-3 text-[12px]">
        {formatCount(meta.total)} {meta.total === 1 ? "room" : "rooms"}
      </p>

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms match these filters"
          description="Try a different block, floor, type, or status."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div key={view} className="view-in">
          {view === "table" ? (
            <div className="border-line bg-surface shadow-card hidden overflow-hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Occupancy</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Rent</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin ? (
                      <TableHead className="w-12 text-right">Actions</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <Link
                          href={`/rooms/${room.id}`}
                          className="text-ink hover:text-accent font-medium"
                        >
                          {room.roomNumber}
                        </Link>
                        <p className="text-ink-tertiary text-[12px]">
                          Floor {room.floor}
                        </p>
                      </TableCell>
                      <TableCell className="text-ink-secondary">
                        {room.block}
                      </TableCell>
                      <TableCell className="text-ink-secondary">
                        {TYPE_LABELS[room.type]}
                      </TableCell>
                      <TableCell className="tabular text-ink-secondary text-right">
                        {room.capacity}
                      </TableCell>
                      <TableCell className="tabular text-ink text-right">
                        {room.occupancy}
                      </TableCell>
                      <TableCell className="tabular text-ink-secondary text-right">
                        {room.availableBeds}
                      </TableCell>
                      <TableCell className="tabular text-ink-secondary text-right">
                        {formatRent(room.monthlyRent)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={room.status} />
                      </TableCell>
                      {isAdmin ? (
                        <TableCell className="text-right">
                          <RoomFormDialog
                            mode="edit"
                            room={room}
                            trigger={
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            }
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
              view === "table" ? "md:hidden" : ""
            )}
          >
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border-line bg-surface shadow-card rounded-lg border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="text-ink hover:text-accent text-[15px] font-semibold"
                    >
                      {room.roomNumber}
                    </Link>
                    <p className="text-ink-secondary mt-0.5 text-[12px]">
                      Block {room.block} · Floor {room.floor} ·{" "}
                      {TYPE_LABELS[room.type]}
                    </p>{" "}
                  </div>
                  <StatusBadge value={room.status} />
                </div>

                <div className="text-ink-secondary mt-4 flex items-center justify-between text-[12px]">
                  <span>Occupancy</span>
                  <span className="tabular text-ink">
                    {room.occupancy}/{room.capacity}
                  </span>
                </div>
                <Progress
                  value={(room.occupancy / room.capacity) * 100}
                  className="mt-1.5"
                  aria-label={`${room.occupancy} of ${room.capacity} beds occupied`}
                />

                <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <p className="text-ink-tertiary">Available</p>
                    <p className="tabular text-ink mt-0.5">
                      {pluralize(room.availableBeds, "bed")}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-tertiary">Rent</p>
                    <p className="tabular text-ink mt-0.5">
                      {formatRent(room.monthlyRent)}
                    </p>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="mt-4 flex justify-end">
                    <RoomFormDialog
                      mode="edit"
                      room={room}
                      trigger={
                        <Button variant="secondary" size="sm">
                          Edit room
                        </Button>
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {meta.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-ink-tertiary text-[12px]">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => router.push(pageHref(meta.page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => router.push(pageHref(meta.page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
