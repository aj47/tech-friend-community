"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const notifications = useQuery(api.notifications.getMyNotifications, {
    limit: 50,
  });

  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Bell className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to view notifications
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your GitHub account to keep up with project activity and
            rewards.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">
              {typeof unreadCount === "number"
                ? unreadCount === 0
                  ? "You're all caught up."
                  : `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
                : "Loading unread count..."}
            </p>
          </div>

          {typeof unreadCount === "number" && unreadCount > 0 && (
            <button
              onClick={() => void handleMarkAllAsRead()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] border border-[#222222] text-white rounded-lg hover:border-[#00FF41]/50 transition-all"
            >
              <CheckCheck className="w-4 h-4 text-[#00FF41]" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        {!notifications ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00FF41] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-[#111111] border border-[#222222] rounded-lg">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`bg-[#111111] border rounded-lg p-6 transition-all ${
                  n.isRead
                    ? "border-[#222222]"
                    : "border-[#00FF41]/40 hover:border-[#00FF41]/60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#00FF41] flex-shrink-0" />
                      )}
                      <h2 className="text-white font-semibold truncate">
                        {n.title}
                      </h2>
                    </div>

                    <p className="text-gray-400 mt-2">{n.message}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-500">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.relatedProjectId && (
                        <Link
                          href={`/projects/${n.relatedProjectId}`}
                          className="text-[#00FF41] hover:underline"
                        >
                          View project
                        </Link>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => void handleMarkAsRead(n._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] border border-[#222222] text-gray-200 rounded-lg hover:border-[#00FF41]/50 hover:text-white transition-all flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-[#00FF41]" />
                      <span className="hidden sm:inline">Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

