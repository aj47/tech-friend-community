"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Bell, CheckCheck, Filter, Loader2, Trash2 } from "lucide-react";

function formatTimeAgo(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNotificationHref(notification: {
  type: string;
  relatedProjectId?: string;
}) {
  if (notification.relatedProjectId) {
    return `/projects/${notification.relatedProjectId}`;
  }

  if (notification.type === "reward_redeemed" || notification.type === "reward_fulfilled") {
    return "/rewards";
  }

  if (notification.type === "new_project") {
    return "/projects";
  }

  return "/profile";
}

export default function NotificationsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notifications = useQuery(api.notifications.getMyNotifications, {
    limit: 50,
    unreadOnly,
  });

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const unreadCount = useMemo(
    () => (notifications ? notifications.filter((n) => !n.isRead).length : 0),
    [notifications]
  );

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead({});
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-10 h-10 text-[#00FF41] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your notifications...</p>
        </div>
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Bell className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to view notifications
          </h1>
          <p className="text-gray-400 mb-8">
            Get updates when contributions are reviewed and rewards are redeemed.
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">
              Stay updated on your contributions, rewards, and project activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUnreadOnly((v) => !v)}
              className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
                unreadOnly
                  ? "border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41]"
                  : "border-[#222222] bg-[#111111] text-gray-300 hover:border-[#333333]"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Unread only
            </button>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isMarkingAll || unreadCount === 0}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-[#00FF41] text-black text-sm font-medium hover:bg-[#00DD35] disabled:opacity-50 disabled:cursor-not-allowed"
              title={unreadCount === 0 ? "No unread notifications" : "Mark all as read"}
            >
              {isMarkingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all read
                </>
              )}
            </button>
          </div>
        </div>

        {/* List */}
        {!notifications ? (
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#00FF41] animate-spin" />
            </div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const href = getNotificationHref({
                type: notification.type,
                relatedProjectId: notification.relatedProjectId
                  ? String(notification.relatedProjectId)
                  : undefined,
              });

              return (
                <Link
                  key={notification._id}
                  href={href}
                  onClick={() => {
                    if (!notification.isRead) {
                      void markAsRead({ notificationId: notification._id });
                    }
                  }}
                  className={`block bg-[#111111] border rounded-lg p-4 transition-colors ${
                    notification.isRead
                      ? "border-[#222222] hover:border-[#333333]"
                      : "border-[#00FF41]/30 bg-[#00FF41]/5 hover:border-[#00FF41]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#00FF41]" />
                        )}
                        <p className="text-white font-medium truncate">
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-600 text-xs mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void deleteNotification({
                          notificationId: notification._id,
                        });
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#0A0A0A]"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111111] border border-[#222222] rounded-lg">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No notifications yet</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
              >
                Browse projects
              </Link>
              <Link
                href="/issues"
                className="inline-flex items-center justify-center px-4 py-2 border border-[#333333] text-white rounded-lg hover:border-[#00FF41]"
              >
                Browse issues
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
