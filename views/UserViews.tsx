import React, { useState, useEffect } from "react";
import {
  Play,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  Users,
  Music,
  Video,
  Share2,
  Heart,
  Calendar,
  Check,
  ChevronRight,
  Loader2,
  Phone,
  Bell,
  Shield,
  Pencil,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { BlogPost, Sermon, BibleVerse, User } from "../types";

/* ===================== UTILITIES ===================== */

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const match = url.match(
    /^.*(youtu.be\/|v\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/
  );
  return match && match[2].length === 11 ? match[2] : null;
};

/* ===================== HOME VIEW ===================== */

export const HomeView = ({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("https://bible-api.com/philippians+4:13")
      .then((res) => res.json())
      .then((data) =>
        setVerse({
          reference: data.reference,
          text: data.text,
          version: "WEB",
        })
      );

    supabase
      .from("sermons")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .then((r) => setSermon(r.data?.[0] || null));

    supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then((r) => setBlogs(r.data || []));
  }, []);

  return (
    <div className="p-6 space-y-10 bg-slate-50 dark:bg-slate-900 min-h-full pb-24">
      {/* Daily Verse */}
      <div className="bg-gradient-to-br from-[#0c2d58] to-[#1a3b63] p-10 rounded-[3rem] text-white shadow-2xl">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-blue-300">
          Daily Bread
        </h2>
        <p className="text-xl italic mb-6">"{verse?.text}"</p>
        <p className="text-sm font-bold text-blue-200">{verse?.reference}</p>
      </div>

      {/* Latest Sermon */}
      {sermon && (
        <section>
          <div className="flex justify-between mb-5">
            <h3 className="font-black text-xl dark:text-white">
              Latest Message
            </h3>
            <button
              onClick={() => onNavigate("sermons")}
              className="text-sm text-blue-600"
            >
              See All
            </button>
          </div>

          <div
            onClick={() => onNavigate("sermons")}
            className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow cursor-pointer"
          >
            <div className="aspect-video">
              <img
                src={`https://img.youtube.com/vi/${getYouTubeID(
                  sermon.video_url
                )}/maxresdefault.jpg`}
                className="w-full h-full object-cover"
                alt={sermon.title}
              />
            </div>

            <div className="p-6">
              <p className="text-sm text-blue-600">
                {formatDate(sermon.date_preached)}
              </p>
              <h4 className="font-bold dark:text-white">
                {sermon.title}
              </h4>
              <p className="text-sm text-slate-500">
                {sermon.preacher}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      <section>
        <div className="flex justify-between mb-5">
          <h3 className="font-black text-xl dark:text-white">
            Articles
          </h3>
          <button
            onClick={() => onNavigate("blogs")}
            className="text-sm text-blue-600"
          >
            Read More
          </button>
        </div>

        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex gap-4 items-center bg-white dark:bg-slate-800 p-5 rounded-3xl shadow"
            >
              <img
                src={blog.image_url}
                className="w-20 h-20 object-cover rounded-xl"
                alt={blog.title}
              />

              <div>
                <p className="text-xs text-slate-400">
                  {blog.category || "INSPIRATION"}
                </p>
                <h4 className="font-bold dark:text-white">
                  {blog.title}
                </h4>

                <div className="flex gap-3 mt-3">
                  <Share2 size={16} />
                  <Heart size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ===================== PLACEHOLDER VIEWS ===================== */

export const MusicView = () => (
  <div className="p-10 text-center text-slate-400">
    <Music size={40} className="mx-auto mb-4 opacity-20" />
    Media Hub loading...
  </div>
);

export const BlogView = () => (
  <div className="p-10 text-center text-slate-400">
    <FileText size={40} className="mx-auto mb-4 opacity-20" />
    Articles loading...
  </div>
);

export const CommunityView = () => (
  <div className="p-10 text-center text-slate-400">
    <Users size={40} className="mx-auto mb-4 opacity-20" />
    Groups loading...
  </div>
);

export const SermonsView = () => (
  <div className="p-10 text-center text-slate-400">
    <Video size={40} className="mx-auto mb-4 opacity-20" />
    Messages loading...
  </div>
);

export const NotificationsView = () => (
  <div className="p-10 text-center text-slate-400">
    <Bell size={40} className="mx-auto mb-4 opacity-20" />
    Notifications loading...
  </div>
);

export const ContactView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-10">
    <button
      onClick={onBack}
      className="mb-6 flex items-center gap-2 text-blue-600"
    >
      <ArrowLeft size={16} /> Back
    </button>
    <div className="text-center text-slate-400">
      Support loading...
    </div>
  </div>
);
