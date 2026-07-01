import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  KeyRound,
  LogOut,
  Activity,
  Sliders,
  Clock
} from "lucide-react";

// Explicit type safety definition matching your Supabase backend structure
interface UserPayload {
  email: string;
  firstname: string;
  lastname: string;
  hashedpassword?: string;
  created_at: string;
  updated_at: string;
}

// Active user data explicitly typed to match your incoming JSON payload context
type NavigationTab = "overview" | "security" | "preferences";

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("overview");
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        console.log(authToken)
        const response = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        console.log(response)
        setUser(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  // Helper formatting for your raw Supabase database timestamp string
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 antialiased flex flex-col font-sans">

      {/* Structural Top Line Header Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-sm">
            <span>Pxe Photos</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md hover:bg-zinc-800">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Structural Page Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 md:py-16">

        {/* Profile Hero Overview Section Banner */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-800 pb-8 mb-8 gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-inner relative group">
              <User className="h-8 w-8 md:h-10 md:w-10 text-zinc-400" />
              <div className="absolute inset-0 rounded-full bg-zinc-100/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                {user.firstname} {user.lastname}
              </h1>
              <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Session Account</span>
          </div>
        </section>

        {/* Modular Grid System Content Partitioning */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Left Vertical Sub-Navigation Sidebar Column */}
          <aside className="md:col-span-1 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-md transition-all text-left ${activeTab === 'overview' ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
            >
              <Activity className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-md transition-all text-left ${activeTab === 'security' ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
            >
              <KeyRound className="h-4 w-4" />
              Security Settings
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-md transition-all text-left ${activeTab === 'preferences' ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
            >
              <Sliders className="h-4 w-4" />
              System Config
            </button>
          </aside>

          {/* Right Dynamic Tab Output Context Window Display */}
          <div className="md:col-span-3 space-y-6">

            {activeTab === "overview" && (
              <>
                {/* Secondary Cards Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Registration Date</p>
                      <p className="text-sm font-medium mt-1 text-zinc-200">{formatDate(user.created_at)}</p>
                    </div>
                    <Calendar className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Last Token Activity</p>
                      <p className="text-sm font-medium mt-1 text-zinc-200">{formatDate(user.updated_at)}</p>
                    </div>
                    <Clock className="h-5 w-5 text-zinc-600" />
                  </div>
                </div>

                {/* Primary Shadow Structured Form Block Elements */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
                  <div className="border-b border-zinc-900 px-5 py-4 bg-zinc-900/20">
                    <h3 className="text-sm font-medium tracking-tight">Account Parameters</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Read-only identity attributes parsed directly from authorization payload records.</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 font-medium block mb-1.5">First Name</label>
                        <input type="text" readOnly value={user.firstname} className="w-full bg-zinc-950 border border-zinc-800 text-xs px-3 py-2 rounded-md text-zinc-300 focus:outline-none cursor-default" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 font-medium block mb-1.5">Last Name</label>
                        <input type="text" readOnly value={user.lastname} className="w-full bg-zinc-950 border border-zinc-800 text-xs px-3 py-2 rounded-md text-zinc-300 focus:outline-none cursor-default" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 font-medium block mb-1.5">Authorized Identity Email</label>
                      <input type="text" readOnly value={user.email} className="w-full bg-zinc-950 border border-zinc-800 text-xs px-3 py-2 rounded-md text-zinc-300 focus:outline-none cursor-default" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-medium tracking-tight">System Hash Matrix</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Database storage layer payload records.</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Salted Bcrypt Password Signature</span>
                  <code className="text-xs font-mono text-zinc-400 break-all select-all block">{user.hashedpassword || "N/A"}</code>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 text-center py-12 shadow-xl border-dashed">
                <p className="text-xs text-zinc-400 font-medium">No system customisations available for this tier scope.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Contact structural configuration administrators to shift active access scopes.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
