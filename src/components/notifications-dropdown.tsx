import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { markNotificationAsRead } from "@/lib/firebase/notifications";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/firebase/notifications";

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const notificationsRef = collection(db, `users/${user.uid}/notifications`);
    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Notification[];

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open && notifications.length > 0) {
      // Mark all as read when opening
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => markNotificationAsRead(user!.uid, n.id!))
      );
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes("Created")) return <Plus className="h-4 w-4 text-green-500" />;
    if (title.includes("Deleted")) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (title.includes("Welcome")) return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={handleOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[350px] mt-2"
          style={{ zIndex: 1000 }}
          align="end"
        >
          <div className="py-2 px-4 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-xs text-gray-500">No new notifications</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-default ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium truncate">{notification.title}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(notification.createdAt instanceof Date ? notification.createdAt : new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}