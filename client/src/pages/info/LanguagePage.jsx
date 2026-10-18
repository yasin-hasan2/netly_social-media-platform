import { useState, useEffect } from "react";
import InfoLayout from "./InfoLayout";
import { Globe, Check, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", name: "English (US)", native: "English", greeting: "Welcome to Net-ly", reels: "Watch Reels", chat: "Messages" },
  { code: "bn", name: "Bengali", native: "বাংলা", greeting: "নেট-লিতে স্বাগতম", reels: "রিলস দেখুন", chat: "বার্তা" },
  { code: "es", name: "Spanish", native: "Español", greeting: "Bienvenido a Net-ly", reels: "Ver Reels", chat: "Mensajes" },
  { code: "fr", name: "French", native: "Français", greeting: "Bienvenue sur Net-ly", reels: "Regarder des Reels", chat: "Messages" },
  { code: "de", name: "German", native: "Deutsch", greeting: "Willkommen bei Net-ly", reels: "Reels ansehen", chat: "Nachrichten" },
  { code: "ja", name: "Japanese", native: "日本語", greeting: "Net-lyへようこそ", reels: "リールを見る", chat: "メッセージ" },
  { code: "hi", name: "Hindi", native: "हिन्दी", greeting: "नेट-ली में आपका स्वागत है", reels: "रील्स देखें", chat: "संदेश" },
  { code: "ar", name: "Arabic", native: "العربية", greeting: "مرحباً بكم في نت-لي", reels: "مشاهدة ريلز", chat: "الرسائل" },
  { code: "pt", name: "Portuguese", native: "Português", greeting: "Bem-vindo ao Net-ly", reels: "Assistir Reels", chat: "Mensagens" },
  { code: "ko", name: "Korean", native: "한국어", greeting: "Net-ly에 오신 것을 환영합니다", reels: "릴스 보기", chat: "메시지" },
  { code: "it", name: "Italian", native: "Italiano", greeting: "Benvenuto su Net-ly", reels: "Guarda i Reels", chat: "Messaggi" },
  { code: "tr", name: "Turkish", native: "Türkçe", greeting: "Net-ly'ye Hoş Geldiniz", reels: "Reels İzle", chat: "Mesajlar" },
  { code: "zh", name: "Chinese (Simplified)", native: "简体中文", greeting: "欢迎来到 Net-ly", reels: "观看短视频", chat: "消息" },
  { code: "ru", name: "Russian", native: "Русский", greeting: "Добро пожаловать в Net-ly", reels: "Смотреть рилсы", chat: "Сообщения" },
  { code: "ur", name: "Urdu", native: "اردو", greeting: "نیٹ-لی میں خوش آمدید", reels: "ریلس دیکھیں", chat: "پیغامات" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", greeting: "Selamat datang di Net-ly", reels: "Tonton Reels", chat: "Pesan" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", greeting: "Chào mừng đến với Net-ly", reels: "Xem Reels", chat: "Tin nhắn" },
];

export default function LanguagePage() {
  const [selectedCode, setSelectedCode] = useState(() => {
    return localStorage.getItem("netly_locale") || "en";
  });

  const currentLang = LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];

  const handleSelectLanguage = (lang) => {
    setSelectedCode(lang.code);
    localStorage.setItem("netly_locale", lang.code);
    toast.success(`Language set to ${lang.name} (${lang.native})`);
  };

  return (
    <InfoLayout
      title="Language & Regional Settings"
      subtitle="Choose your preferred display language for captions, UI controls, notifications, and navigation."
      icon={Globe}
    >
      <div className="space-y-10">
        {/* Active Language Live Preview Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#111726] to-sky-500/15 border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Current Active Language
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {currentLang.name} · <span className="font-normal text-zinc-300">{currentLang.native}</span>
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              Saved in Preferences
            </span>
          </div>

          {/* Live Translation Preview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
            <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Feed Welcome</span>
              <span className="text-xs font-bold text-white mt-1 block">
                {currentLang.greeting}
              </span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Reels Action</span>
              <span className="text-xs font-bold text-amber-400 mt-1 block">
                {currentLang.reels}
              </span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Direct Chat</span>
              <span className="text-xs font-bold text-sky-400 mt-1 block">
                {currentLang.chat}
              </span>
            </div>
          </div>
        </div>

        {/* Language Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Select a Global Language</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedCode === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-400/50 shadow-md shadow-amber-500/10"
                      : "bg-[#111726]/60 border-white/[0.06] hover:border-white/[0.15] text-zinc-300"
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{lang.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{lang.native}</p>
                  </div>

                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-[#FACE25] text-zinc-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </InfoLayout>
  );
}
