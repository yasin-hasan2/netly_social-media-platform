import { useRef, useState, useEffect } from "react";
import {
  Loader2,
  Lock,
  Globe,
  Sparkles,
  Briefcase,
  User,
  ArrowLeft,
  Camera,
  MapPin,
  Link as LinkIcon,
  Mail,
  Phone,
  Check,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Shield,
  ShieldCheck,
  Info,
  KeyRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";

const POPULAR_CATEGORIES = [
  "Digital Creator",
  "Software Engineer",
  "Photographer",
  "Artist & Designer",
  "Writer & Journalist",
  "Entrepreneur",
  "Musician / Band",
  "Fitness & Health",
  "Fashion & Style",
  "Gamer",
];

export default function EditProfile() {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePicture || "");
  const [photoFile, setPhotoFile] = useState(null);

  const [input, setInput] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    gender: user?.gender || "prefer_not_to_say",
    profileType: user?.profileType || "personal", // 'personal' | 'creator' | 'business'
    category: user?.category || "",
    location: user?.location || "",
    websiteLink: user?.websiteLink || user?.contactInfo?.websiteLink || "",
    profilePrivacy: user?.profilePrivacy || "public", // 'public' | 'private'
    relationshipStatus: user?.relationshipStatus || "single",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
    phone: user?.contactInfo?.phone || "",
    contactEmail: user?.contactInfo?.email || user?.email || "",
    socialFacebook: user?.contactInfo?.socialLinks?.facebook || "",
    socialTwitter: user?.contactInfo?.socialLinks?.twitter || "",
    socialInstagram: user?.contactInfo?.socialLinks?.instagram || "",
    socialLinkedin: user?.contactInfo?.socialLinks?.linkedin || "",
    socialGithub: user?.contactInfo?.socialLinks?.github || "",
    socialYoutube: user?.contactInfo?.socialLinks?.youtube || "",
  });

  // Keep state updated if user changes
  useEffect(() => {
    if (user) {
      setPhotoPreview(user.profilePicture || "");
      setInput((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        bio: user.bio || "",
        gender: user.gender || "prefer_not_to_say",
        profileType: user.profileType || "personal",
        category: user.category || "",
        location: user.location || "",
        websiteLink: user.websiteLink || user.contactInfo?.websiteLink || "",
        profilePrivacy: user.profilePrivacy || "public",
        relationshipStatus: user.relationshipStatus || "single",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
        phone: user.contactInfo?.phone || "",
        contactEmail: user.contactInfo?.email || user.email || "",
        socialFacebook: user.contactInfo?.socialLinks?.facebook || "",
        socialTwitter: user.contactInfo?.socialLinks?.twitter || "",
        socialInstagram: user.contactInfo?.socialLinks?.instagram || "",
        socialLinkedin: user.contactInfo?.socialLinks?.linkedin || "",
        socialGithub: user.contactInfo?.socialLinks?.github || "",
        socialYoutube: user.contactInfo?.socialLinks?.youtube || "",
      }));
    }
  }, [user]);

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleModeChange = (mode) => {
    setInput((prev) => ({
      ...prev,
      profileType: mode,
      // If moving to personal and category is empty, leave it, else default suggestion
      category: mode !== "personal" && !prev.category ? "Digital Creator" : prev.category,
    }));
  };

  const handlePrivacyToggle = (privacy) => {
    setInput((prev) => ({ ...prev, profilePrivacy: privacy }));
  };

  const editProfileHandler = async (e) => {
    e?.preventDefault();
    const formData = new FormData();
    formData.append("fullName", input.fullName);
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    formData.append("profileType", input.profileType);
    formData.append("category", input.category);
    formData.append("location", input.location);
    formData.append("websiteLink", input.websiteLink);
    formData.append("profilePrivacy", input.profilePrivacy);
    formData.append("relationshipStatus", input.relationshipStatus);
    if (input.dateOfBirth) formData.append("dateOfBirth", input.dateOfBirth);
    formData.append("phone", input.phone);
    formData.append("contactEmail", input.contactEmail);
    formData.append("socialFacebook", input.socialFacebook);
    formData.append("socialTwitter", input.socialTwitter);
    formData.append("socialInstagram", input.socialInstagram);
    formData.append("socialLinkedin", input.socialLinkedin);
    formData.append("socialGithub", input.socialGithub);
    formData.append("socialYoutube", input.socialYoutube);

    if (photoFile) {
      formData.append("profilePhoto", photoFile);
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.success && res.data.user) {
        const updatedUser = res.data.user;
        dispatch(setAuthUser(updatedUser));
        dispatch(setUserProfile(updatedUser));
        toast.success(res.data.message || "Profile updated successfully!");
        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      console.error("Edit profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 text-zinc-100">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer border border-zinc-800"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-xl md:text-2xl text-white flex items-center gap-2">
              Edit Profile
              {input.profilePrivacy === "private" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-semibold border border-amber-400/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your profile mode, privacy settings, bio, and social connections
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={editProfileHandler}
          disabled={loading}
          className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold px-5 h-9 rounded-xl shadow-md transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <form onSubmit={editProfileHandler} className="space-y-6">
        {/* Photo & Basic Identity Card */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-[#FACE25] shadow-lg">
                <AvatarImage src={photoPreview} alt="User Avatar" className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xl">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => imageRef?.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 text-[#FACE25]" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">@{user?.username}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono">
                  {input.profileType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {user?.email || "Member of Net-ly"}
              </p>
              <input
                ref={imageRef}
                onChange={fileChangeHandler}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageRef?.current?.click()}
              className="w-full sm:w-auto border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5 text-[#FACE25]" /> Change Photo
            </Button>
          </div>
        </div>

        {/* 1. PROFILE MODE & CATEGORY (Personal / Creator / Business) */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FACE25]" /> Account Mode
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Choose the mode that best describes your profile on Net-ly.
              </p>
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Personal Mode */}
            <div
              onClick={() => handleModeChange("personal")}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                input.profileType === "personal"
                  ? "bg-zinc-900 border-[#FACE25] shadow-sm ring-1 ring-[#FACE25]/50"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                  <User className="w-4 h-4" />
                </div>
                {input.profileType === "personal" && (
                  <Check className="w-4 h-4 text-[#FACE25]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Personal Mode</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Everyday profile for connecting with friends, family, and following community creators.
                </p>
              </div>
            </div>

            {/* Creator Mode */}
            <div
              onClick={() => handleModeChange("creator")}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                input.profileType === "creator"
                  ? "bg-zinc-900 border-[#FACE25] shadow-sm ring-1 ring-[#FACE25]/50"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-[#FACE25]">
                  <Sparkles className="w-4 h-4" />
                </div>
                {input.profileType === "creator" && (
                  <Check className="w-4 h-4 text-[#FACE25]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Creator Mode</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  For content creators, artists, developers, and influencers. Displays a creator badge and niche.
                </p>
              </div>
            </div>

            {/* Business Mode */}
            <div
              onClick={() => handleModeChange("business")}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                input.profileType === "business"
                  ? "bg-zinc-900 border-[#FACE25] shadow-sm ring-1 ring-[#FACE25]/50"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                {input.profileType === "business" && (
                  <Check className="w-4 h-4 text-[#FACE25]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Business Mode</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  For brands, startups, agencies, and online stores. Highlights professional contact links and location.
                </p>
              </div>
            </div>
          </div>

          {/* Category Input (visible for Creator / Business) */}
          {input.profileType !== "personal" && (
            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Category / Professional Title
              </label>
              <Input
                type="text"
                value={input.category}
                onChange={(e) => setInput({ ...input, category: e.target.value })}
                placeholder="e.g. Digital Creator, Software Engineer, Photographer..."
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-zinc-500 mr-1">Suggestions:</span>
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setInput({ ...input, category: cat })}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                      input.category === cat
                        ? "bg-[#FACE25] text-zinc-950 font-bold border-[#FACE25]"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. PRIVACY & PROFILE LOCK (Instagram-Style) */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FACE25]" /> Profile Privacy & Lock
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Lock your profile just like Instagram to keep your content exclusive to your followers.
              </p>
            </div>
          </div>

          {/* Privacy Options Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Public Option */}
            <div
              onClick={() => handlePrivacyToggle("public")}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                input.profilePrivacy === "public"
                  ? "bg-zinc-900 border-[#FACE25] shadow-sm ring-1 ring-[#FACE25]/50"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                {input.profilePrivacy === "public" && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Public Account
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Anyone on Net-ly can see your photos, reels, thoughts, and profile information.
                </p>
              </div>
            </div>

            {/* Private (Locked) Option */}
            <div
              onClick={() => handlePrivacyToggle("private")}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                input.profilePrivacy === "private"
                  ? "bg-zinc-900 border-amber-400 shadow-sm ring-1 ring-amber-400/50"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                {input.profilePrivacy === "private" && (
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Private Account (Locked Profile)
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Only people who follow you can view your posts and reels. Your avatar and bio remain visible.
                </p>
              </div>
            </div>
          </div>

          {/* Informational Box */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#FACE25] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              When your profile is locked, users who don't follow you see an Instagram-style lock screen (<strong>"This Account is Private"</strong>) prompting them to follow you to view your media.
            </p>
          </div>
        </div>

        {/* 3. BASIC PROFILE INFORMATION */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                value={input.fullName}
                onChange={(e) => setInput({ ...input, fullName: e.target.value })}
                placeholder="e.g. Alex Chen"
                className="bg-zinc-900 border-zinc-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={input.location}
                  onChange={(e) => setInput({ ...input, location: e.target.value })}
                  placeholder="e.g. New York, USA"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">Bio</label>
              <span className="text-[10px] text-zinc-500">
                {input.bio.length} / 250
              </span>
            </div>
            <Textarea
              value={input.bio}
              onChange={(e) =>
                setInput({ ...input, bio: e.target.value.slice(0, 250) })
              }
              placeholder="Tell the community about yourself, your passions, or what you build..."
              rows={3}
              className="bg-zinc-900 border-zinc-800 text-xs text-white focus-visible:ring-1 focus-visible:ring-[#FACE25]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Website / Portfolio Link
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <Input
                  type="url"
                  value={input.websiteLink}
                  onChange={(e) => setInput({ ...input, websiteLink: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Gender
              </label>
              <Select
                value={input.gender || "prefer_not_to_say"}
                onValueChange={(val) => setInput({ ...input, gender: val })}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectGroup>
                    <SelectItem value="male">Male (He/Him)</SelectItem>
                    <SelectItem value="female">Female (She/Her)</SelectItem>
                    <SelectItem value="non_binary">Non-binary (They/Them)</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Relationship Status
              </label>
              <Select
                value={input.relationshipStatus || "single"}
                onValueChange={(val) => setInput({ ...input, relationshipStatus: val })}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs text-white">
                  <SelectValue placeholder="Relationship status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectGroup>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="in a relationship">In a relationship</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="engaged">Engaged</SelectItem>
                    <SelectItem value="it's complicated">It's complicated</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 4. CONTACT & SOCIAL CONNECTIONS */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FACE25]" /> Contact & Social Links
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              These will appear as interactive buttons on your public profile header.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Public Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <Input
                  type="email"
                  value={input.contactEmail}
                  onChange={(e) => setInput({ ...input, contactEmail: e.target.value })}
                  placeholder="contact@yourname.com"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <Input
                  type="tel"
                  value={input.phone}
                  onChange={(e) => setInput({ ...input, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Instagram Handle / URL
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={input.socialInstagram}
                  onChange={(e) => setInput({ ...input, socialInstagram: e.target.value })}
                  placeholder="@username or url"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Twitter / X Handle / URL
              </label>
              <div className="relative">
                <Twitter className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={input.socialTwitter}
                  onChange={(e) => setInput({ ...input, socialTwitter: e.target.value })}
                  placeholder="@username or url"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                GitHub Username / URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-zinc-300 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={input.socialGithub}
                  onChange={(e) => setInput({ ...input, socialGithub: e.target.value })}
                  placeholder="github.com/username"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                LinkedIn URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
                <Input
                  type="text"
                  value={input.socialLinkedin}
                  onChange={(e) => setInput({ ...input, socialLinkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Security & Password */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Account Security & Password
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Need to change or reset your Net-ly account password?
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/forgot-password`)}
              className="border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-xs h-9 rounded-xl cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              Reset Password via Email
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold px-6 h-10 text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
