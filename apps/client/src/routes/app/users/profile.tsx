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

export const Route = createFileRoute("/app/users/profile")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData(getMe());

    if (!data?.data) return;
    await queryClient.ensureQueryData(getUserById(data?.data?.id));
  },
});

function RouteComponent() {
  const { data: getMeData } = useQuery(getMe());
  const currentUser = getMeData?.data;
  const { data } = useQuery(getUserById(currentUser!.id));
  if (!currentUser) return <div className="p-6">User not found</div>;
  const user = data!.data!;

  return (
    <div className="w-3/4 mx-auto py-8 px-4">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="py-2 px-4 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-28 w-28">
            <AvatarImage src={user?.imgUrl} />
            <AvatarFallback className="text-3xl">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <Badge variant="secondary">
                {user?.blockedBy?.length > 0 ? "Restricted" : "Active"}
              </Badge>
            </div>

            <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
              {user?.bio || "No bio yet."}
            </p>

            <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {user?.conversations?.length || 0}
                </strong>{" "}
                Conversations
              </span>
              <span>
                <strong className="text-foreground">
                  {user?.messages?.length || 0}
                </strong>{" "}
                Messages
              </span>
              <span>
                <strong className="text-foreground">
                  {user?.bookmarks?.length || 0}
                </strong>{" "}
                Bookmarks
              </span>
              <span>
                <strong className="text-foreground">
                  {user?.blocked?.length || 0}
                </strong>{" "}
                Blocked
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="bookmarks" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <Ban className="h-4 w-4" />
            Blocked
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks">
          <Card className="rounded-2xl mt-4">
            <CardHeader>
              <CardTitle>Bookmarked Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="divide-y">
                  {user?.bookmarks?.map((msg) => (
                    <div key={msg.id} className="p-4 hover:bg-muted transition">
                      <p className="text-sm">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked">
          <Card className="rounded-2xl mt-4">
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {user?.blocked?.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between bg-muted p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={blockedUser.imgUrl} />
                      <AvatarFallback>
                        {blockedUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{blockedUser.name}</span>
                  </div>

                  <Button size="sm" variant="outline">
                    Unblock
                  </Button>
                </div>
              ))}

              {user?.blocked?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No blocked users.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
