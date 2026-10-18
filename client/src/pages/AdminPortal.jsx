import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Film,
  FileText,
  MessageSquare,
  Search,
  RefreshCw,
  Home,
  LogOut,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Lock,
  Globe,
  AlertTriangle,
  Send,
  MessageCircle,
  Eye,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

const SUPER_ADMIN_EMAILS = [
  "yasinalhasan@gmail.com",
  "yaseenalhassan2@gmail.com",
];

export default function AdminPortal() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'bluetag' | 'messages' | 'posts'
  const [callerCanManageBlueTag, setCallerCanManageBlueTag] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [blueTagFilter, setBlueTagFilter] = useState("all"); // 'all' | 'verified' | 'unverified' | 'admins_delegated'

  // Edit user modal
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    fullName: "",
    bio: "",
    accountStatus: "verified",
    profilePrivacy: "public",
    profileType: "personal",
    role: "user",
    isBlueTag: false,
    canManageBlueTag: false,
    canSendMessages: true,
    messagingStatus: "active",
    messagePermission: "everyone",
    restrictionReason: "",
  });
  const [updatingUser, setUpdatingUser] = useState(false);

  // Dedicated Messaging Controls Modal (Super Admin)
  const [messagingModalOpen, setMessagingModalOpen] = useState(false);
  const [userForMessaging, setUserForMessaging] = useState(null);
  const [messagingForm, setMessagingForm] = useState({
    canSendMessages: true,
    messagingStatus: "active",
    messagePermission: "everyone",
    restrictionReason: "",
  });
  const [savingMessaging, setSavingMessaging] = useState(false);

  // Conversation Thread Viewer Modal
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);

  // Delete user confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Determine if current user is Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const email = (user.email || "").toLowerCase();
    return user.role === "super_admin" || SUPER_ADMIN_EMAILS.includes(email);
  }, [user]);

  // Determine if current user can manage Blue Tags (Super Admin or authorized Admin)
  const canManageBlueTag = useMemo(() => {
    if (!user) return false;
    const email = (user.email || "").toLowerCase();
    const isSuper = user.role === "super_admin" || SUPER_ADMIN_EMAILS.includes(email);
    return isSuper || callerCanManageBlueTag || Boolean(user.canManageBlueTag);
  }, [user, callerCanManageBlueTag]);

  // Load platform statistics
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/stats", { withCredentials: true });
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    }
  };

  // Load users list
  const loadUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users", { withCredentials: true });
      if (res.data?.success) {
        setUsers(res.data.users || []);
        if (res.data.callerCanManageBlueTag !== undefined) {
          setCallerCanManageBlueTag(res.data.callerCanManageBlueTag);
        }
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
      toast.error("Failed to load users list");
    }
  };

  // Load posts for moderation
  const loadPosts = async () => {
    try {
      const res = await axiosInstance.get("/admin/posts", { withCredentials: true });
      if (res.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts for moderation:", err);
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      const res = await axiosInstance.get("/admin/conversations", { withCredentials: true });
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadPosts(), loadConversations()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadUsers(), loadPosts(), loadConversations()]);
    setRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/user/logout");
      localStorage.removeItem("token");
      dispatch(setAuthUser(null));
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Filter users based on query, role, status, and blueTag
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((u) => u.accountStatus === statusFilter);
    }
    if (blueTagFilter === "verified") {
      list = list.filter((u) => Boolean(u.isBlueTag));
    } else if (blueTagFilter === "unverified") {
      list = list.filter((u) => !u.isBlueTag);
    } else if (blueTagFilter === "admins_delegated") {
      list = list.filter((u) => u.role === "admin" && Boolean(u.canManageBlueTag));
    }
    return list;
  }, [users, searchQuery, roleFilter, statusFilter, blueTagFilter]);

  // Quick Toggle Blue Tag
  const handleToggleBlueTag = async (targetUser) => {
    if (!canManageBlueTag) {
      toast.error("Only Super Admin or authorized Admins can manage Blue Tags.");
      return;
    }
    const nextStatus = !targetUser.isBlueTag;
    try {
      const res = await axiosInstance.put(
        `/admin/user/${targetUser._id}/blue-tag`,
        { isBlueTag: nextStatus },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          res.data.message ||
            (nextStatus
              ? `Blue Tag verified badge granted to @${targetUser.username}`
              : `Blue Tag removed from @${targetUser.username}`)
        );
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Blue tag toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to update Blue Tag");
    }
  };

  // Super Admin ONLY: Grant or Revoke Blue Tag Management Privileges to Other Admins
  const handleToggleAdminBlueTagAccess = async (targetAdmin) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can grant or revoke Blue Tag management permissions to other admins.");
      return;
    }
    const nextAccess = !targetAdmin.canManageBlueTag;
    try {
      const res = await axiosInstance.put(
        `/admin/user/${targetAdmin._id}/blue-tag-access`,
        { canManageBlueTag: nextAccess },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          res.data.message ||
            (nextAccess
              ? `Blue Tag management privileges granted to Admin @${targetAdmin.username}`
              : `Blue Tag management privileges revoked from Admin @${targetAdmin.username}`)
        );
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Admin blue tag access error:", err);
      toast.error(err.response?.data?.message || "Failed to update Admin Blue Tag privileges");
    }
  };

  // Open Edit User modal
  const handleOpenEditUser = (targetUser) => {
    setSelectedUser(targetUser);
    const msgOpts = targetUser.messagingOptions || {};
    setEditForm({
      username: targetUser.username || "",
      email: targetUser.email || "",
      fullName: targetUser.fullName || "",
      bio: targetUser.bio || "",
      accountStatus: targetUser.accountStatus || "verified",
      profilePrivacy: targetUser.profilePrivacy || "public",
      profileType: targetUser.profileType || "personal",
      role: targetUser.role || "user",
      isBlueTag: Boolean(targetUser.isBlueTag),
      canManageBlueTag: Boolean(targetUser.canManageBlueTag),
      canSendMessages: msgOpts.canSendMessages !== false,
      messagingStatus: msgOpts.messagingStatus || "active",
      messagePermission: msgOpts.messagePermission || "everyone",
      restrictionReason: msgOpts.restrictionReason || "",
    });
    setEditUserModalOpen(true);
  };

  // Submit User Info Update
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdatingUser(true);
      const res = await axiosInstance.put(
        `/admin/user/${selectedUser._id}`,
        editForm,
        { withCredentials: true }
      );

      // If Super Admin also updated messaging options in this modal
      if (isSuperAdmin) {
        await axiosInstance.put(
          `/admin/user/${selectedUser._id}/messaging-options`,
          {
            canSendMessages: editForm.canSendMessages,
            messagingStatus: editForm.messagingStatus,
            messagePermission: editForm.messagePermission,
            restrictionReason: editForm.restrictionReason,
          },
          { withCredentials: true }
        );
      }

      if (res.data?.success) {
        toast.success(res.data.message || "User updated successfully");
        setEditUserModalOpen(false);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Update user error:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setUpdatingUser(false);
    }
  };

  // Open Dedicated Messaging Control Modal (Super Admin)
  const handleOpenMessagingControl = (targetUser) => {
    setUserForMessaging(targetUser);
    const msgOpts = targetUser.messagingOptions || {};
    setMessagingForm({
      canSendMessages: msgOpts.canSendMessages !== false,
      messagingStatus: msgOpts.messagingStatus || "active",
      messagePermission: msgOpts.messagePermission || "everyone",
      restrictionReason: msgOpts.restrictionReason || "",
    });
    setMessagingModalOpen(true);
  };

  // Save Dedicated Messaging Options
  const handleSaveMessagingOptions = async (e) => {
    e.preventDefault();
    if (!userForMessaging) return;
    try {
      setSavingMessaging(true);
      const res = await axiosInstance.put(
        `/admin/user/${userForMessaging._id}/messaging-options`,
        messagingForm,
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          res.data.message || `Messaging controls updated for @${userForMessaging.username}`
        );
        setMessagingModalOpen(false);
        setUserForMessaging(null);
        loadUsers();
      }
    } catch (err) {
      console.error("Messaging control error:", err);
      toast.error(err.response?.data?.message || "Failed to update messaging options");
    } finally {
      setSavingMessaging(false);
    }
  };

  // Promote / Demote Role (SUPER ADMIN ONLY)
  const handleRoleToggle = async (targetUser) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin has permission to modify administrator roles.");
      return;
    }
    const isTargetSuper =
      targetUser.role === "super_admin" ||
      SUPER_ADMIN_EMAILS.includes((targetUser.email || "").toLowerCase());
    if (isTargetSuper) {
      toast.error("Super Admin role is permanent and cannot be modified.");
      return;
    }

    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      const res = await axiosInstance.put(
        `/admin/user/${targetUser._id}/role`,
        { newRole: nextRole },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(res.data.message || `User role updated to ${nextRole}`);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Role toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to change role");
    }
  };

  // Quick Suspend / Unsuspend Toggle
  const handleQuickStatusToggle = async (targetUser) => {
    const isTargetSuper =
      targetUser.role === "super_admin" ||
      SUPER_ADMIN_EMAILS.includes((targetUser.email || "").toLowerCase());
    if (isTargetSuper) {
      toast.error("Cannot suspend Super Admin account.");
      return;
    }

    const nextStatus = targetUser.accountStatus === "suspended" ? "verified" : "suspended";
    try {
      const res = await axiosInstance.put(
        `/admin/user/${targetUser._id}`,
        { accountStatus: nextStatus },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          nextStatus === "suspended"
            ? `User @${targetUser.username} has been suspended.`
            : `User @${targetUser.username} has been reactivated.`
        );
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Quick Toggle Mute/Restrict DM Sending
  const handleQuickMuteMessaging = async (targetUser) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can control users' messaging privileges.");
      return;
    }
    const currentStatus = targetUser.messagingOptions?.messagingStatus || "active";
    const nextStatus = currentStatus === "restricted" ? "active" : "restricted";
    const canSend = nextStatus === "active";

    try {
      const res = await axiosInstance.put(
        `/admin/user/${targetUser._id}/messaging-options`,
        {
          messagingStatus: nextStatus,
          canSendMessages: canSend,
          restrictionReason:
            nextStatus === "restricted" ? "Restricted by Super Admin for spam or review" : "",
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          nextStatus === "restricted"
            ? `Direct messaging MUTED for @${targetUser.username}`
            : `Direct messaging RESTORED for @${targetUser.username}`
        );
        loadUsers();
      }
    } catch (err) {
      console.error("Quick messaging toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle messaging privileges");
    }
  };

  // Delete User Confirmation & Execution
  const confirmDeleteUser = (targetUser) => {
    setUserToDelete(targetUser);
    setDeleteModalOpen(true);
  };

  const handleDeleteUserExecute = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUser(true);
      const res = await axiosInstance.delete(`/admin/user/${userToDelete._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "User and associated data removed");
        setDeleteModalOpen(false);
        setUserToDelete(null);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUser(false);
    }
  };

  // Delete Post (Content Moderation)
  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to permanently delete this post from the platform?")) {
      return;
    }
    try {
      const res = await axiosInstance.delete(`/admin/post/${postId}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Post removed by admin");
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        loadStats();
      }
    } catch (err) {
      console.error("Delete post error:", err);
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  // Inspect Conversation Messages Thread
  const handleInspectConversation = async (conv) => {
    setSelectedConv(conv);
    setThreadModalOpen(true);
    setLoadingThread(true);
    try {
      const res = await axiosInstance.get(`/admin/conversation/${conv._id}/messages`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setThreadMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error("Error loading conversation thread:", err);
      toast.error("Failed to load conversation messages");
    } finally {
      setLoadingThread(false);
    }
  };

  // Delete specific message
  const handleDeleteMessage = async (msgId) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await axiosInstance.delete(`/admin/message/${msgId}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Message deleted");
        setThreadMessages((prev) => prev.filter((m) => m._id !== msgId));
        loadConversations();
      }
    } catch (err) {
      console.error("Delete message error:", err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  // Delete entire conversation thread
  const handleDeleteConversation = async (convId) => {
    if (!confirm("Are you sure you want to delete this entire chat conversation thread?")) {
      return;
    }
    try {
      const res = await axiosInstance.delete(`/admin/conversation/${convId}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Conversation thread removed");
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (threadModalOpen && selectedConv?._id === convId) {
          setThreadModalOpen(false);
          setSelectedConv(null);
        }
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
      toast.error(err.response?.data?.message || "Failed to delete conversation");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#FACE25] shadow-sm">
            {isSuperAdmin ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Net-ly Control Console
              </h1>
              {isSuperAdmin ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FACE25] text-zinc-950 font-extrabold uppercase tracking-wider shadow-sm">
                  Super Admin (100% Control)
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold uppercase tracking-wider border border-blue-500/30">
                  Admin (90% Control)
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Logged in as <strong className="text-zinc-200">@{user?.username}</strong> ({user?.email})
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Seamless Switch to User Feed */}
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#FACE25]" />
              <span className="hidden md:inline">View Feed as Normal User</span>
              <span className="md:hidden">Feed</span>
            </Button>
          </Link>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 px-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            title="Refresh statistics and data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#FACE25]" : ""}`} />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Governance Notice Banner */}
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 backdrop-blur-md ${
          isSuperAdmin
            ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
            : "bg-blue-500/10 border-blue-500/30 text-blue-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-black/40 text-[#FACE25] mt-0.5">
              {isSuperAdmin ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                {isSuperAdmin
                  ? "⭐ Super Administrator Governance: 100% Full System Authority"
                  : "🛡️ Administrator Console: 90% Operational Authority"}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-300 mt-1 leading-relaxed">
                {isSuperAdmin
                  ? "You have full sovereign access to the platform. You can control users' direct messaging options (mute/restrict DMs, toggle message permissions, inspect conversations), promote users to Administrator, edit or delete any user profile, and moderate all content."
                  : "You have full operational access to modify user information, suspend abusive accounts, delete users, and remove inappropriate content. Messaging permissions and role assignment are reserved for the Super Admin."}
              </p>
            </div>
          </div>
        </div>

        {/* 1. KEY PLATFORM STATS */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Total Users */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#FACE25]" /> Total Users
              </span>
              <p className="text-2xl font-black text-white mt-2">{stats.totalUsers}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Platform community</span>
            </div>

            {/* Blue Tag Verified Accounts */}
            <div className="bg-zinc-900/70 border border-sky-500/30 rounded-2xl p-4 flex flex-col justify-between bg-sky-950/10">
              <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                <BlueTagBadge size="xs" /> Blue Tag Users
              </span>
              <p className="text-2xl font-black text-sky-400 mt-2">
                {stats.blueTagUsers ?? users.filter((u) => u.isBlueTag).length}
              </p>
              <span className="text-[10px] text-zinc-400 mt-1">
                {stats.adminsWithBlueTagAccess || users.filter((u) => u.canManageBlueTag).length} Admins permitted
              </span>
            </div>

            {/* Verified Users */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Status
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-2">{stats.verifiedUsers}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Active verified accounts</span>
            </div>

            {/* Direct Conversations */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> DM Threads
              </span>
              <p className="text-2xl font-black text-sky-400 mt-2">{conversations.length}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Active chat channels</span>
            </div>

            {/* Total Posts */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Posts
              </span>
              <p className="text-2xl font-black text-white mt-2">{stats.totalPosts}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Photos & thoughts</span>
            </div>

            {/* Total Reels */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" /> Reels
              </span>
              <p className="text-2xl font-black text-amber-400 mt-2">{stats.totalReels}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Short video stories</span>
            </div>

            {/* Administrators */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FACE25]" /> Staff / Admins
              </span>
              <p className="text-2xl font-black text-[#FACE25] mt-2">
                {(stats.adminUsers || 0) + (stats.superAdminUsers || 0)}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1">
                {stats.superAdminUsers} Super, {stats.adminUsers} Admin
              </span>
            </div>
          </div>
        )}

        {/* 2. NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "users"
                ? "bg-[#FACE25] text-zinc-950 shadow-md"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bluetag")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "bluetag"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white"
            }`}
          >
            <BlueTagBadge size="xs" />
            <span>Blue Tag Authority ({users.filter((u) => u.isBlueTag).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "messages"
                ? "bg-[#FACE25] text-zinc-950 shadow-md"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages & DM Oversight ({conversations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "posts"
                ? "bg-[#FACE25] text-zinc-950 shadow-md"
                : "bg-zinc-900/80 text-zinc-400 hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Content Moderation ({posts.length})</span>
          </button>
        </div>

        {/* 3. TAB 1: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by @username, email, or name..."
                  className="bg-zinc-950 border-zinc-800 text-xs text-white pl-9 h-9 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {/* Role filter */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-36 bg-zinc-950 border-zinc-800 text-xs text-white h-9 rounded-xl">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Regular Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="super_admin">Super Admins</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-zinc-950 border-zinc-800 text-xs text-white h-9 rounded-xl">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Blue Tag filter */}
                <Select value={blueTagFilter} onValueChange={setBlueTagFilter}>
                  <SelectTrigger className="w-40 bg-zinc-950 border-zinc-800 text-xs text-white h-9 rounded-xl">
                    <SelectValue placeholder="Blue Tag: All" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="all">All Blue Tag</SelectItem>
                      <SelectItem value="verified">Verified Blue Tag (Only)</SelectItem>
                      <SelectItem value="unverified">No Blue Tag</SelectItem>
                      <SelectItem value="admins_delegated">Admins with Tag Access</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users Table / Grid */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="p-3.5 pl-5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Blue Tag</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">DM Controls</th>
                      <th className="p-3.5">Privacy</th>
                      <th className="p-3.5">Stats</th>
                      <th className="p-3.5 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-zinc-500">
                          No users matched your query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((targetUser) => {
                        const isTargetSuper =
                          targetUser.role === "super_admin" ||
                          SUPER_ADMIN_EMAILS.includes(
                            (targetUser.email || "").toLowerCase()
                          );
                        const isTargetAdmin = targetUser.role === "admin";
                        const msgOpts = targetUser.messagingOptions || {};
                        const isMsgRestricted =
                          msgOpts.canSendMessages === false ||
                          msgOpts.messagingStatus === "restricted" ||
                          msgOpts.messagingStatus === "disabled";

                        return (
                          <tr
                            key={targetUser._id}
                            className="hover:bg-zinc-850/60 transition group"
                          >
                            {/* User Avatar + Username + Full Name */}
                            <td className="p-3.5 pl-5">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-zinc-700">
                                  <AvatarImage src={targetUser.profilePicture} />
                                  <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
                                    {targetUser.username?.[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Link
                                      to={`/profile/${targetUser._id}`}
                                      className="font-bold text-white hover:text-[#FACE25] transition"
                                      title="View Public Profile"
                                    >
                                      @{targetUser.username}
                                    </Link>
                                    {Boolean(targetUser.isBlueTag) && (
                                      <BlueTagBadge size="xs" />
                                    )}
                                    {isTargetSuper && (
                                      <Crown className="w-3.5 h-3.5 text-[#FACE25]" title="Super Admin" />
                                    )}
                                  </div>
                                  <span className="text-[11px] text-zinc-400 block">
                                    {targetUser.fullName || "—"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="p-3.5 text-zinc-300 font-mono text-[11px]">
                              {targetUser.email || "—"}
                            </td>

                            {/* Role Badge */}
                            <td className="p-3.5">
                              {isTargetSuper ? (
                                <Badge className="bg-[#FACE25] text-zinc-950 font-bold text-[10px] uppercase gap-1">
                                  <Crown className="w-3 h-3" /> Super Admin
                                </Badge>
                              ) : isTargetAdmin ? (
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px] uppercase gap-1">
                                  <Shield className="w-3 h-3" /> Admin
                                </Badge>
                              ) : (
                                <Badge className="bg-zinc-800 text-zinc-300 font-medium text-[10px] uppercase">
                                  User
                                </Badge>
                              )}
                            </td>

                            {/* Blue Tag Status & Delegation */}
                            <td className="p-3.5">
                              <div className="flex flex-col gap-1 items-start">
                                {targetUser.isBlueTag ? (
                                  <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] gap-1 shadow-sm font-semibold">
                                    <BlueTagBadge size="xs" />
                                    <span>Verified</span>
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-zinc-500 font-medium">None</span>
                                )}
                                {isTargetAdmin && (
                                  targetUser.canManageBlueTag ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30"
                                      title="This Admin is authorized by Super Admin to give & revoke Blue Tags"
                                    >
                                      ✓ Tag Manager
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded"
                                      title="This Admin cannot manage Blue Tags without Super Admin delegation"
                                    >
                                      No Tag Access
                                    </span>
                                  )
                                )}
                              </div>
                            </td>

                            {/* Account Status Badge */}
                            <td className="p-3.5">
                              {targetUser.accountStatus === "suspended" ? (
                                <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                                  Suspended
                                </Badge>
                              ) : targetUser.accountStatus === "verified" ? (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                                  Active (Verified)
                                </Badge>
                              ) : (
                                <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">
                                  Active
                                </Badge>
                              )}
                            </td>

                            {/* DM Controls Badge */}
                            <td className="p-3.5">
                              {isMsgRestricted ? (
                                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>{msgOpts.messagingStatus === "disabled" ? "DMs Off" : "DMs Muted"}</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>DMs Active</span>
                                </Badge>
                              )}
                            </td>

                            {/* Privacy */}
                            <td className="p-3.5">
                              {targetUser.profilePrivacy === "private" ? (
                                <span className="text-[11px] text-amber-300 flex items-center gap-1 font-medium">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                                  <Globe className="w-3 h-3" /> Public
                                </span>
                              )}
                            </td>

                            {/* Stats */}
                            <td className="p-3.5 text-zinc-400 text-[11px]">
                              <span>{targetUser.postsCount || 0} posts</span> ·{" "}
                              <span>{targetUser.followersCount || 0} followers</span>
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 text-right pr-5">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Blue Tag Toggle Button (Super Admin or authorized Admin) */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!canManageBlueTag}
                                  onClick={() => handleToggleBlueTag(targetUser)}
                                  className={`h-7 px-2 text-xs rounded-lg cursor-pointer ${
                                    !canManageBlueTag
                                      ? "text-zinc-600 cursor-not-allowed opacity-40"
                                      : targetUser.isBlueTag
                                      ? "text-rose-400 hover:bg-rose-500/10"
                                      : "text-sky-300 hover:bg-sky-500/15"
                                  }`}
                                  title={
                                    !canManageBlueTag
                                      ? "Only Super Admin or authorized Admins can give or remove Blue Tags"
                                      : targetUser.isBlueTag
                                      ? "Remove Blue Tag from this user"
                                      : "Give official Blue Tag to this user"
                                  }
                                >
                                  {targetUser.isBlueTag ? (
                                    <span>Remove Tag</span>
                                  ) : (
                                    <>
                                      <BlueTagBadge size="xs" className="mr-1" />
                                      <span>Give Tag</span>
                                    </>
                                  )}
                                </Button>

                                {/* Super Admin ONLY: Blue Tag Delegation for other Admins */}
                                {isSuperAdmin && isTargetAdmin && !isTargetSuper && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleAdminBlueTagAccess(targetUser)}
                                    className={`h-7 px-2 text-xs rounded-lg cursor-pointer ${
                                      targetUser.canManageBlueTag
                                        ? "text-cyan-300 hover:bg-cyan-500/15 border border-cyan-500/30"
                                        : "text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800"
                                    }`}
                                    title={
                                      targetUser.canManageBlueTag
                                        ? "Revoke Blue Tag delegation from this Admin (they will not be able to give Blue Tags)"
                                        : "Grant Blue Tag delegation to this Admin (they will be able to give Blue Tags)"
                                    }
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                    <span>{targetUser.canManageBlueTag ? "Tag Access: Yes" : "Grant Tag Access"}</span>
                                  </Button>
                                )}
                                {/* Super Admin: Control DMs */}
                                {isSuperAdmin && !isTargetSuper && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenMessagingControl(targetUser)}
                                    className={`h-7 px-2 text-xs rounded-lg cursor-pointer ${
                                      isMsgRestricted
                                        ? "text-amber-300 hover:bg-amber-500/15"
                                        : "text-sky-300 hover:bg-sky-500/15"
                                    }`}
                                    title="Control User Messaging Options"
                                  >
                                    <Sliders className="w-3.5 h-3.5 mr-1" />
                                    <span>DM Opts</span>
                                  </Button>
                                )}

                                {/* Quick Mute / Unmute DMs (Super Admin Only) */}
                                {isSuperAdmin && !isTargetSuper && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuickMuteMessaging(targetUser)}
                                    className={`h-7 px-2 text-xs rounded-lg cursor-pointer ${
                                      isMsgRestricted
                                        ? "text-emerald-400 hover:bg-emerald-500/10"
                                        : "text-amber-400 hover:bg-amber-500/10"
                                    }`}
                                    title={isMsgRestricted ? "Restore Direct Messaging" : "Mute/Restrict Direct Messaging"}
                                  >
                                    {isMsgRestricted ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        <span>Unmute DMs</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="w-3.5 h-3.5 mr-1" />
                                        <span>Mute DMs</span>
                                      </>
                                    )}
                                  </Button>
                                )}

                                {/* Edit User Details */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditUser(targetUser)}
                                  className="h-7 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                                  title="Edit User Info"
                                >
                                  <Edit3 className="w-3.5 h-3.5 mr-1 text-[#FACE25]" />
                                  <span>Edit</span>
                                </Button>

                                {/* Promote / Demote Role (SUPER ADMIN ONLY) */}
                                {isSuperAdmin && !isTargetSuper && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRoleToggle(targetUser)}
                                    className={`h-7 px-2 text-xs rounded-lg cursor-pointer ${
                                      isTargetAdmin
                                        ? "text-amber-300 hover:bg-amber-500/10"
                                        : "text-blue-300 hover:bg-blue-500/10"
                                    }`}
                                    title={
                                      isTargetAdmin
                                        ? "Demote Admin to User"
                                        : "Promote User to Admin"
                                    }
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                    <span>{isTargetAdmin ? "Demote" : "Make Admin"}</span>
                                  </Button>
                                )}

                                {/* Delete User */}
                                {!isTargetSuper && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isTargetAdmin && !isSuperAdmin}
                                    onClick={() => confirmDeleteUser(targetUser)}
                                    className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                    title={
                                      isTargetAdmin && !isSuperAdmin
                                        ? "Only Super Admin can delete admins"
                                        : "Delete User & Data"
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BLUE TAG AUTHORITY & DELEGATION (Super Admin & Authorized Admins) */}
        {activeTab === "bluetag" && (
          <div className="space-y-6">
            {/* Header / Policy Card */}
            <div className="bg-gradient-to-r from-sky-950/40 via-zinc-900/70 to-blue-950/30 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 mt-0.5 shadow-lg shadow-sky-500/10">
                    <BlueTagBadge size="md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                        Blue Tag Verification & Authority Governance
                      </h3>
                      {isSuperAdmin ? (
                        <Badge className="bg-[#FACE25] text-zinc-950 font-bold text-[10px] uppercase gap-1">
                          <Crown className="w-3 h-3" /> Sovereign Super Admin
                        </Badge>
                      ) : canManageBlueTag ? (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] uppercase gap-1">
                          <ShieldCheck className="w-3 h-3" /> Delegated Admin Manager
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-800 text-zinc-400 text-[10px] uppercase">
                          Standard Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed max-w-2xl">
                      The official Blue Tag is the verified seal awarded to authentic creators and public figures.
                      <strong className="text-sky-300 font-semibold ml-1">
                        Only Super Admin has default authority to issue Blue Tags, and Super Admin can delegate access to other trusted Admins.
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl px-4 py-3 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                      Blue Tag Users
                    </span>
                    <span className="text-xl font-black text-sky-400">
                      {users.filter((u) => u.isBlueTag).length}
                    </span>
                  </div>
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl px-4 py-3 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                      Admin Managers
                    </span>
                    <span className="text-xl font-black text-cyan-300">
                      {users.filter((u) => (u.role === "admin" && u.canManageBlueTag) || u.role === "super_admin").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              <div className="text-xs rounded-xl p-3.5 flex items-center justify-between gap-3 flex-wrap border bg-zinc-950/60 border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>
                    {isSuperAdmin
                      ? "As Super Administrator, you can grant or revoke Blue Tags for any user, and grant or revoke Blue Tag management permissions to other Admins below."
                      : canManageBlueTag
                      ? "You have been authorized by the Super Admin with Blue Tag management privileges. You can grant or remove Blue Tags for users."
                      : "You currently do not have permission to give Blue Tags. Ask a Super Administrator to grant you Blue Tag delegation privileges."}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. ADMIN DELEGATION PANEL (Super Admin Controls) */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Admin Blue Tag Delegation Privileges
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isSuperAdmin
                      ? "Super Admin can toggle whether each Admin is authorized to issue Blue Tags to users."
                      : "List of platform administrators and their Blue Tag authorization status."}
                  </p>
                </div>
                <Badge className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1">
                  {users.filter((u) => u.role === "admin").length} Platform Admins
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users
                  .filter((u) => u.role === "admin")
                  .map((adminUser) => {
                    const isDelegated = Boolean(adminUser.canManageBlueTag);

                    return (
                      <div
                        key={adminUser._id}
                        className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-zinc-700">
                            <AvatarImage src={adminUser.profilePicture} />
                            <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
                              {adminUser.username?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-white truncate">
                                @{adminUser.username}
                              </span>
                              {Boolean(adminUser.isBlueTag) && <BlueTagBadge size="xs" />}
                            </div>
                            <span className="text-[11px] text-zinc-400 block truncate">
                              {adminUser.fullName || adminUser.email}
                            </span>
                            <div className="mt-1">
                              {isDelegated ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                  ✓ Can Issue Blue Tags
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">
                                  Access Restricted
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Super Admin Action Button */}
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAdminBlueTagAccess(adminUser)}
                            className={`h-8 px-3 text-xs rounded-xl cursor-pointer transition shadow-sm ${
                              isDelegated
                                ? "border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                                : "border-cyan-500/30 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20"
                            }`}
                            title={
                              isDelegated
                                ? "Revoke Blue Tag granting privileges from this Admin"
                                : "Grant this Admin permission to give Blue Tags to users"
                            }
                          >
                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                            <span>{isDelegated ? "Revoke Access" : "Grant Access"}</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>

              {users.filter((u) => u.role === "admin").length === 0 && (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No other administrators registered on the platform yet.
                </div>
              )}
            </div>

            {/* 2. ALL USERS BLUE TAG DIRECTORY */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BlueTagBadge size="xs" />
                    User Blue Tag Directory & Fast Issuance
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Search any user to grant or revoke their official verified Blue Tag badge.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search @username or name..."
                      className="bg-zinc-950 border-zinc-800 text-xs text-white pl-9 h-9 rounded-xl"
                    />
                  </div>

                  <Select value={blueTagFilter} onValueChange={setBlueTagFilter}>
                    <SelectTrigger className="w-36 bg-zinc-950 border-zinc-800 text-xs text-white h-9 rounded-xl">
                      <SelectValue placeholder="All Blue Tag" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectGroup>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="verified">Blue Tag Only</SelectItem>
                        <SelectItem value="unverified">No Blue Tag</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users list */}
              <div className="space-y-2">
                {filteredUsers.map((targetUser) => {
                  const isTargetSuper =
                    targetUser.role === "super_admin" ||
                    SUPER_ADMIN_EMAILS.includes((targetUser.email || "").toLowerCase());

                  return (
                    <div
                      key={targetUser._id}
                      className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-zinc-700">
                          <AvatarImage src={targetUser.profilePicture} />
                          <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
                            {targetUser.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              to={`/profile/${targetUser._id}`}
                              className="font-bold text-sm text-white hover:text-sky-400 transition"
                            >
                              @{targetUser.username}
                            </Link>
                            {Boolean(targetUser.isBlueTag) && <BlueTagBadge size="xs" />}
                            {isTargetSuper && (
                              <Crown className="w-3.5 h-3.5 text-[#FACE25]" title="Super Admin" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            <span>{targetUser.fullName || "User"}</span>
                            <span>·</span>
                            <span>{targetUser.email}</span>
                            <span>·</span>
                            <span className="capitalize">{targetUser.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-2">
                        {targetUser.isBlueTag ? (
                          <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] gap-1 shadow-sm font-semibold mr-1">
                            <BlueTagBadge size="xs" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-800 text-zinc-500 text-[10px] mr-1">
                            Standard
                          </Badge>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canManageBlueTag}
                          onClick={() => handleToggleBlueTag(targetUser)}
                          className={`h-8 px-3 text-xs rounded-xl cursor-pointer transition shadow-sm ${
                            !canManageBlueTag
                              ? "opacity-50 cursor-not-allowed border-zinc-800 text-zinc-600"
                              : targetUser.isBlueTag
                              ? "border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
                              : "border-sky-500/40 text-white bg-sky-600 hover:bg-sky-500 shadow-sky-500/20"
                          }`}
                          title={
                            !canManageBlueTag
                              ? "Super Admin authority or Blue Tag delegation required"
                              : targetUser.isBlueTag
                              ? "Revoke Blue Tag from user"
                              : "Award Blue Tag to user"
                          }
                        >
                          {targetUser.isBlueTag ? (
                            <span>Revoke Blue Tag</span>
                          ) : (
                            <>
                              <BlueTagBadge size="xs" className="mr-1.5" />
                              <span>Give Blue Tag</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB 2: MESSAGES & DM OVERSIGHT (Super Admin Controls) */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#FACE25]" />
                    Direct Messaging Oversight & User Message Controls
                  </h3>
                  {isSuperAdmin && (
                    <Badge className="bg-[#FACE25] text-zinc-950 font-bold text-[10px] uppercase">
                      Super Admin Authority
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Super Admin has complete authority to configure user messaging options (mute spam senders, restrict DM privileges, block incoming DMs), inspect platform chat threads, and delete inappropriate direct messages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1">
                  {conversations.length} Active Conversations
                </Badge>
              </div>
            </div>

            {/* Quick User Messaging Options Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#FACE25]" />
                  User Direct Message Permission Management
                </h4>
                <span className="text-[11px] text-zinc-400">
                  Select any user below to configure their messaging privileges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isUsuper =
                    u.role === "super_admin" ||
                    SUPER_ADMIN_EMAILS.includes((u.email || "").toLowerCase());
                  const uMsg = u.messagingOptions || {};
                  const isMuted =
                    uMsg.canSendMessages === false ||
                    uMsg.messagingStatus === "restricted" ||
                    uMsg.messagingStatus === "disabled";

                  return (
                    <div
                      key={u._id}
                      className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border border-zinc-700 flex-shrink-0">
                          <AvatarImage src={u.profilePicture} />
                          <AvatarFallback className="bg-zinc-800 text-xs font-bold text-[#FACE25]">
                            {u.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">@{u.username}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isMuted ? (
                              <span className="text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
                                <Lock className="w-2.5 h-2.5" /> Muted DMs
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-2.5 h-2.5" /> DMs Active
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500">· {uMsg.messagePermission || "everyone"}</span>
                          </div>
                        </div>
                      </div>

                      {isSuperAdmin && !isUsuper && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickMuteMessaging(u)}
                            className={`h-7 px-2 text-[11px] rounded-lg cursor-pointer ${
                              isMuted
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-amber-400 hover:bg-amber-500/10"
                            }`}
                            title={isMuted ? "Restore messaging" : "Mute messaging"}
                          >
                            {isMuted ? "Unmute" : "Mute"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMessagingControl(u)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                            title="Edit Options"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#FACE25]" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Conversations Stream */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#FACE25]" />
                All Platform Direct Message Channels
              </h4>

              {conversations.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No active direct message conversations found on the platform yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conversations.map((conv) => {
                    const p1 = conv.participants?.[0] || { username: "User 1" };
                    const p2 = conv.participants?.[1] || { username: "User 2" };

                    return (
                      <div
                        key={conv._id}
                        className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between gap-3 shadow-md hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Participants Avatars & Usernames */}
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-3 overflow-hidden">
                              <Avatar className="h-9 w-9 border-2 border-zinc-950">
                                <AvatarImage src={p1.profilePicture} />
                                <AvatarFallback className="bg-zinc-800 text-[#FACE25] text-xs font-bold">
                                  {p1.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <Avatar className="h-9 w-9 border-2 border-zinc-950">
                                <AvatarImage src={p2.profilePicture} />
                                <AvatarFallback className="bg-zinc-800 text-sky-400 text-xs font-bold">
                                  {p2.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white">
                                @{p1.username} <span className="text-zinc-500">↔</span> @{p2.username}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {conv.messagesCount || 0} messages exchanged
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInspectConversation(conv)}
                              className="h-7 px-2.5 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg cursor-pointer"
                              title="Inspect Message History"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-[#FACE25]" />
                              <span>Inspect</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConversation(conv._id)}
                              className="h-7 w-7 p-0 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                              title="Delete Entire Chat Thread"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Last message snippet */}
                        {conv.lastMessage ? (
                          <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-850 text-xs text-zinc-300">
                            <p className="line-clamp-2 italic leading-relaxed">
                              "{conv.lastMessage.content}"
                            </p>
                            <span className="text-[10px] text-zinc-500 mt-1 block">
                              Last active: {new Date(conv.lastMessage.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-zinc-500 italic">No messages yet.</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. TAB 3: CONTENT MODERATION (Posts & Reels) */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Platform Content Stream</h3>
                <p className="text-xs text-zinc-400">
                  Review and remove any infringing or inappropriate photos, reels, and thoughts.
                </p>
              </div>
              <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                {posts.length} Active Posts
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-zinc-700">
                        <AvatarImage src={post.author?.profilePicture} />
                        <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
                          {post.author?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-xs text-white">@{post.author?.username || "unknown"}</p>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      className="h-8 px-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span>Delete</span>
                    </Button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                      "{post.caption}"
                    </p>
                  )}

                  {/* Media preview */}
                  {post.video ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                      <video src={post.video} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-[#FACE25]">
                        <Film className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : post.image ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                      <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  {/* Likes and comments counts */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                    <span>{post.likes?.length || 0} likes</span>
                    <span>{post.comments?.length || 0} comments</span>
                    <span className="font-mono text-[10px] text-zinc-500">ID: {post._id.slice(-6)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 6. DEDICATED SUPER ADMIN MESSAGING CONTROLS MODAL */}
      <Dialog open={messagingModalOpen} onOpenChange={setMessagingModalOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FACE25]" /> Control Messaging Options for @{userForMessaging?.username}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveMessagingOptions} className="space-y-4 mt-2">
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#FACE25] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                As Super Admin, you can mute abusive senders, restrict who can message this user, or completely turn off their direct messaging inbox.
              </p>
            </div>

            {/* Messaging Status */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Direct Messaging Status
              </label>
              <Select
                value={messagingForm.messagingStatus}
                onValueChange={(val) =>
                  setMessagingForm({
                    ...messagingForm,
                    messagingStatus: val,
                    canSendMessages: val === "active",
                  })
                }
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectGroup>
                    <SelectItem value="active">Active (Normal - Can send & receive DMs)</SelectItem>
                    <SelectItem value="restricted">Restricted (Cannot send new DMs - Muted)</SelectItem>
                    <SelectItem value="disabled">Disabled (Completely turned off)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Who can message this user */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Incoming DM Permissions
              </label>
              <Select
                value={messagingForm.messagePermission}
                onValueChange={(val) =>
                  setMessagingForm({ ...messagingForm, messagePermission: val })
                }
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectGroup>
                    <SelectItem value="everyone">Everyone (Mutual Followers / Following)</SelectItem>
                    <SelectItem value="followers_only">Followers Only</SelectItem>
                    <SelectItem value="no_one">No One (Block all incoming DMs)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Restriction Reason */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Restriction Reason / User Notice
              </label>
              <Input
                type="text"
                value={messagingForm.restrictionReason}
                onChange={(e) =>
                  setMessagingForm({ ...messagingForm, restrictionReason: e.target.value })
                }
                placeholder="e.g. Excessive spamming, Harassment report, Under review..."
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Shown to the user if they try to send messages while restricted.
              </span>
            </div>

            <DialogFooter className="pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMessagingModalOpen(false)}
                className="border-zinc-800 text-zinc-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingMessaging}
                className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold text-xs"
              >
                {savingMessaging ? "Saving..." : "Apply DM Options"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. CONVERSATION THREAD INSPECTOR MODAL */}
      <Dialog open={threadModalOpen} onOpenChange={setThreadModalOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FACE25]" />
                <span>
                  Chat Inspector: @{selectedConv?.participants?.[0]?.username} ↔ @
                  {selectedConv?.participants?.[1]?.username}
                </span>
              </div>
              <Badge className="bg-zinc-900 border-zinc-700 text-zinc-300 text-xs font-normal">
                {threadMessages.length} Messages
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 my-2 scrollbar-thin scrollbar-thumb-zinc-700">
            {loadingThread ? (
              <div className="py-12 text-center text-zinc-500 text-xs">Loading message history...</div>
            ) : threadMessages.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No messages found in this chat thread.
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isUser0 =
                  msg.senderId?._id === selectedConv?.participants?.[0]?._id ||
                  msg.senderId === selectedConv?.participants?.[0]?._id;
                const senderName =
                  msg.senderId?.username ||
                  (isUser0
                    ? selectedConv?.participants?.[0]?.username
                    : selectedConv?.participants?.[1]?.username) ||
                  "User";

                return (
                  <div
                    key={msg._id}
                    className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-start justify-between gap-3 group hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#FACE25]">@{senderName}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {msg.content || msg.message}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Delete this message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteConversation(selectedConv?._id)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Entire Thread
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setThreadModalOpen(false)}
              className="border-zinc-800 text-zinc-300 text-xs"
            >
              Close Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 8. EDIT USER MODAL (Admin & Super Admin) */}
      <Dialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
        <DialogContent className="max-w-lg bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#FACE25]" /> Edit User @{selectedUser?.username}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateUserSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Bio
              </label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={2}
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Account Status */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Status
                </label>
                <Select
                  value={editForm.accountStatus}
                  onValueChange={(val) => setEditForm({ ...editForm, accountStatus: val })}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Privacy */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Privacy
                </label>
                <Select
                  value={editForm.profilePrivacy}
                  onValueChange={(val) => setEditForm({ ...editForm, profilePrivacy: val })}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Type */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Profile Mode
                </label>
                <Select
                  value={editForm.profileType}
                  onValueChange={(val) => setEditForm({ ...editForm, profileType: val })}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectGroup>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Super Admin Section: Messaging Options & Role */}
            {isSuperAdmin && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Super Admin Authority: Messaging & Role Controls</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Direct Messaging Privileges
                    </label>
                    <Select
                      value={editForm.messagingStatus}
                      onValueChange={(val) =>
                        setEditForm({
                          ...editForm,
                          messagingStatus: val,
                          canSendMessages: val === "active",
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectGroup>
                          <SelectItem value="active">Active (Normal)</SelectItem>
                          <SelectItem value="restricted">Restricted (Muted)</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      User Role
                    </label>
                    <Select
                      value={editForm.role}
                      onValueChange={(val) => setEditForm({ ...editForm, role: val })}
                    >
                      <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectGroup>
                          <SelectItem value="user">Regular User</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="super_admin">Super Administrator</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    DM Restriction Reason / Note
                  </label>
                  <Input
                    type="text"
                    value={editForm.restrictionReason}
                    onChange={(e) => setEditForm({ ...editForm, restrictionReason: e.target.value })}
                    placeholder="e.g. Muted for spam"
                    className="bg-zinc-900 border-zinc-800 text-xs text-white h-8"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUserModalOpen(false)}
                className="border-zinc-800 text-zinc-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingUser}
                className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold text-xs"
              >
                {updatingUser ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. DELETE USER CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-sm bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Confirm User Deletion
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            Are you sure you want to permanently delete <strong>@{userToDelete?.username}</strong>?
            This will permanently erase their account, photos, reels, comments, and messages.
          </p>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletingUser}
              onClick={() => setDeleteModalOpen(false)}
              className="border-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deletingUser}
              onClick={handleDeleteUserExecute}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {deletingUser ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
