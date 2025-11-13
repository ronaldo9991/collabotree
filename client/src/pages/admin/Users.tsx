import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  GraduationCap,
  Briefcase,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "BUYER" | "ADMIN";
  createdAt: string;
}

interface UsersResponse {
  data: AdminUser[];
  pagination: {
    limit: number;
    hasNext: boolean;
    cursor?: string;
  };
}

const ROLE_FILTERS = [
  { label: "All Users", value: "ALL" },
  { label: "Students", value: "STUDENT" },
  { label: "Buyers", value: "BUYER" },
];

export default function AdminUsers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["value"]>("ALL");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(false);

  const loadUsers = async (options?: { reset?: boolean; cursor?: string }) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { limit: 25 };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "ALL") {
        params.role = roleFilter;
      }

      if (!options?.reset && options?.cursor) {
        params.cursor = options.cursor;
      }

      const response = await api.getAllUsers(params);
      if (response.success) {
        const payload = response.data as UsersResponse;
        const nextUsers = payload?.data ?? [];
        setUsers((prev) => (options?.reset ? nextUsers : [...prev, ...nextUsers]));
        setHasNext(payload?.pagination?.hasNext ?? false);
        setCursor(payload?.pagination?.cursor);
      } else {
        throw new Error(response.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Unable to load users right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/admin/signin");
      return;
    }

    if (user.role !== "ADMIN") {
      toast({
        title: "Access denied",
        description: "You need admin privileges to view this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUsers([]);
    setCursor(undefined);
    setHasNext(false);
    loadUsers({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roleFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }
    const query = search.toLowerCase();
    return users.filter((u) => {
      const name = u.name ?? "";
      return (
        name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const studentCount = filteredUsers.filter((u) => u.role === "STUDENT").length;
  const buyerCount = filteredUsers.filter((u) => u.role === "BUYER").length;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 section-padding-y">
      <div className="container-unified space-y-8">
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
          <Button
            variant="ghost"
            className="w-fit max-md:w-full flex items-center gap-2"
            onClick={() => navigate("/dashboard/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <div className="text-right max-md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">User Directory</h1>
            <p className="text-muted-foreground">
              Browse all registered users, filter by role, and review their onboarding status.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="glass-card bg-card/60 border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Users
              </CardTitle>
              <CardDescription>Active accounts across all roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{filteredUsers.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {studentCount} Students • {buyerCount} Buyers
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/60 border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Students
              </CardTitle>
              <CardDescription>Student creators offering services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{studentCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((studentCount / Math.max(filteredUsers.length, 1)) * 100)}% of platform users
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-card/60 border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Buyers
              </CardTitle>
              <CardDescription>Clients hiring talent on CollaboTree</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{buyerCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((buyerCount / Math.max(filteredUsers.length, 1)) * 100)}% of platform users
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="glass-card bg-card/60 border border-primary/20">
          <CardHeader className="border-b border-border/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Directory
                </CardTitle>
                <CardDescription>
                  Search, filter, and export the latest platform users.
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={roleFilter}
                  onValueChange={(value) =>
                    setRoleFilter(value as typeof roleFilter)
                  }
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => loadUsers({ reset: true })}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="max-h-[60vh]">
              {loading && users.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Filter className="h-8 w-8" />
                  <div className="text-center space-y-1">
                    <p className="font-medium">No users match your filters</p>
                    <p className="text-sm">
                      Try adjusting your search or role filters to see more results.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredUsers.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {account.name || "Unnamed User"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {account.email}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <Badge
                          variant={
                            account.role === "STUDENT"
                              ? "default"
                              : account.role === "BUYER"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {account.role}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                          }).format(new Date(account.createdAt))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() =>
                            toast({
                              title: "Feature coming soon",
                              description:
                                "User detail view is under development.",
                            })
                          }
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <div className="flex items-center justify-between gap-3 py-4 px-6 border-t border-border/40">
            <div className="text-xs text-muted-foreground">
              Showing {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || !hasNext}
                onClick={() => {
                  if (cursor) {
                    loadUsers({ cursor });
                  }
                }}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : hasNext ? (
                  <>
                    Load More
                  </>
                ) : (
                  "Up to date"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

