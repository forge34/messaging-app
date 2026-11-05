import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getMe } from "@/lib/queries/auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Zap, Users, CircleDot, Bell, CheckCheck, MessageCircle, User, Settings, LogOut, Search, ArrowLeft, Smile } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Messaging",
    description:
      "Real-time message delivery powered by Socket.io — messages arrive as you type.",
  },
  {
    icon: Users,
    title: "Group Chats",
    description:
      "Create group conversations with your team, friends, or community.",
  },
  {
    icon: CircleDot,
    title: "Live Presence",
    description:
      "See who's online, typing, and available with real-time presence indicators.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Stay in the loop with instant alerts for messages and activity.",
  },
];

export function LandingPage() {
  const { data } = useQuery(getMe());
  const user = data?.data;

  return (
    <div>
      <div className="min-h-screen bg-[url(/bg.jpg)] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />

        <nav className="flex justify-between items-center px-8 py-4 relative z-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Echo
          </h1>
          {!user && (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="text-white text-xl hover:text-white/80"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                size="lg"
                className="text-xl bg-white text-black hover:brightness-90 hover:bg-white"
                asChild
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="flex flex-col items-center justify-center text-center min-h-[70vh] relative z-10 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-6"
          >
            Your Voice, Amplified
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-xl md:text-2xl text-white/90 drop-shadow-md mb-8 max-w-2xl"
          >
            Echo is the platform where your thoughts come alive. Connect, create,
            and collaborate effortlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              className="text-white text-xl px-8 py-4"
              asChild
            >
              <Link to={user ? "/app/conversations" : "/signup"}>
                Get Started
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Everything you need to stay connected
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
          >
            Powerful messaging features for seamless communication
          </motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <feature.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for modern communication
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clean, intuitive interface designed for teams and individuals
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border shadow-lg overflow-hidden max-w-5xl mx-auto"
          >
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-red-500" />
              <div className="size-2.5 rounded-full bg-yellow-500" />
              <div className="size-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground ml-2">Echo</span>
            </div>
            <div className="flex h-[28rem]">
              {/* Sidebar */}
              <div className="w-14 border-r bg-background flex-col items-center py-3 gap-1 hidden md:flex">
                {[
                  { icon: MessageCircle, active: true },
                  { icon: Users, active: false },
                  { icon: Bell, active: false },
                  { icon: User, active: false },
                  { icon: Settings, active: false },
                ].map((item) => (
                  <div
                    key={item.icon.name}
                    className={`size-9 rounded-lg flex items-center justify-center transition-colors ${
                      item.active
                        ? "bg-muted/50 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="size-5" />
                  </div>
                ))}
                <div className="mt-auto text-muted-foreground hover:text-red-500 hover:bg-muted/50 size-9 rounded-lg flex items-center justify-center transition-colors cursor-default">
                  <LogOut className="size-5" />
                </div>
              </div>

              {/* DM List */}
              <div className="w-60 border-r bg-card flex-col hidden sm:flex">
                <div className="p-3 border-b">
                  <Input icon={<Search className="h-4 w-4" />} placeholder="Search conversations" className="bg-background rounded-md h-9 text-sm" />
                </div>
                <div className="flex-1 overflow-hidden">
                  {[
                    { initials: "JD", name: "Jane Doe", preview: "Sounds good!", time: "10:32 AM", online: false, active: false },
                    { initials: "SK", name: "Sam Kim", preview: "See you there", time: "10:15 AM", online: true, active: true },
                    { initials: "AL", name: "Alex Lee", preview: "On it 🔥", time: "9:48 AM", online: false, active: false },
                    { initials: "MR", name: "Morgan Ray", preview: "Almost done", time: "9:12 AM", online: false, active: false },
                  ].map((item) => (
                    <div
                      key={item.initials}
                      className={`flex items-center gap-3 px-3 py-3 w-full text-left transition-all ${
                        item.active ? "bg-muted/20" : "hover:bg-muted/10"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="size-10">
                          <AvatarFallback className="text-xs">{item.initials}</AvatarFallback>
                        </Avatar>
                        {item.online && (
                          <span className="w-3 h-3 rounded-full bg-green-500 absolute top-0 right-0 ring-2 ring-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{item.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation View */}
              <div className="flex-1 bg-background flex flex-col min-w-0">
                <div className="flex items-center gap-2 py-3 px-4 border-b">
                  <div className="p-1 hover:bg-accent rounded-md transition-colors cursor-default">
                    <ArrowLeft className="size-5" />
                  </div>
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">SK</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-lg font-semibold truncate">Sam Kim</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <CircleDot className="size-2.5 fill-green-500 text-green-500" />
                      Online
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                  <div className="flex justify-start">
                    <div className="max-w-[70%] rounded-2xl rounded-tl-none bg-secondary text-secondary-foreground px-4 py-2 text-sm shadow-sm">
                      Hey! Are you coming to the meeting?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[70%] rounded-2xl rounded-tr-none bg-primary text-primary-foreground px-4 py-2 text-sm shadow-sm">
                      Yes, I'll be there in 5 minutes!
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[70%] rounded-2xl rounded-tl-none bg-secondary text-secondary-foreground px-4 py-2 text-sm shadow-sm">
                      Perfect. See you soon 🚀
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCheck className="size-3.5" />
                      <span>Read</span>
                    </div>
                  </div>
                </div>

                <div className="border-t px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Smile className="size-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Type a message...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-background text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to amplify your voice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Echo today and experience messaging the way it should be.
          </p>
          {!user && (
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/signup">Create your account</Link>
            </Button>
          )}
        </motion.div>
      </section>

      <footer className="border-t py-12 px-4 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extrabold">Echo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your voice, amplified.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Echo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
