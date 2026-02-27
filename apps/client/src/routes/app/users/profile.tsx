import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getUserById } from "@/lib/queries/user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Ban, Bookmark } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMe } from "@/lib/queries/auth";
import { useBreakpoint } from "@/lib/hooks/use-match-media";

export const Route = createFileRoute("/app/users/profile")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData(getMe());
    if (!data?.data) return;
    await queryClient.ensureQueryData(getUserById(data?.data?.id));
  },
});

function RouteComponent() {
  const { md } = useBreakpoint();
  const { data: getMeData } = useQuery(getMe());
  const currentUser = getMeData?.data;
  const { data, isLoading } = useQuery(getUserById(currentUser?.id ?? ""));

  if (!currentUser || isLoading)
    return <div className="p-6">Loading profile...</div>;

  const user = data?.data;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    /* Changed w-3/4 to w-full with max-width and responsive padding */
    <div className="w-full max-w-4xl mx-auto py-4 md:py-8 px-4">
      <Card className="rounded-2xl shadow-sm border-none md:border md:shadow-md">
        <CardContent className="py-6 px-4 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Larger avatar on mobile, standard on desktop */}
          <Avatar className="h-24 w-24 md:h-28  ring-4 ring-background shadow-sm">
            <AvatarImage src={user?.imgUrl} />
            <AvatarFallback className="text-3xl">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
              <Badge variant="secondary" className="w-fit">
                {user?.blockedBy?.length > 0 ? "Restricted" : "Active"}
              </Badge>
            </div>

            <p className="text-muted-foreground mt-3 text-sm md:text-base whitespace-pre-wrap max-w-prose">
              {user?.bio || "No bio yet."}
            </p>

            {/* Stats Grid: 2 columns on mobile, flex on desktop */}
            <div className="grid grid-cols-2 md:flex md:gap-6 mt-6 gap-4 text-sm text-muted-foreground border-t md:border-none pt-4 md:pt-0">
              <StatItem
                label="Conversations"
                count={user?.conversations?.length}
              />
              <StatItem label="Messages" count={user?.messages?.length} />
              <StatItem label="Bookmarks" count={user?.bookmarks?.length} />
              <StatItem label="Blocked" count={user?.blocked?.length} />
            </div>
          </div>

          {/* Full width button on mobile */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Button
              variant="outline"
              className="w-full md:w-auto gap-2 rounded-xl"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bookmarks" className="mt-6 md:mt-8">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="bookmarks" className="gap-2 rounded-lg">
            <Bookmark className="h-4 w-4" />
            <span className="hidden xs:inline">Bookmarks</span>
            {md && (
              <span className="ml-1 text-xs opacity-50">
                ({user?.bookmarks?.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2 rounded-lg">
            <Ban className="h-4 w-4" />
            <span className="hidden xs:inline">Blocked</span>
            {md && (
              <span className="ml-1 text-xs opacity-50">
                ({user?.blocked?.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks">
          <Card className="rounded-2xl mt-4 border-none md:border shadow-none md:shadow-sm">
            <CardHeader className="px-4">
              <CardTitle className="text-lg">Bookmarked Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[50vh] md:h-80">
                <div className="divide-y border-t">
                  {user?.bookmarks?.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 hover:bg-muted/50 transition cursor-pointer"
                    >
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked">
          <Card className="rounded-2xl mt-4 border-none md:border shadow-none md:shadow-sm">
            <CardHeader className="px-4">
              <CardTitle className="text-lg">Blocked Users</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {user?.blocked?.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-transparent hover:border-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={blockedUser.imgUrl} />
                      <AvatarFallback>
                        {blockedUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {blockedUser.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Unblock
                  </Button>
                </div>
              ))}
              {user?.blocked?.length === 0 && (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  Your block list is empty.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex flex-col items-center md:items-start">
      <strong className="text-foreground text-base md:text-lg">
        {count || 0}
      </strong>
      <span className="text-[10px] uppercase tracking-wider md:normal-case md:text-sm font-medium">
        {label}
      </span>
    </div>
  );
}
