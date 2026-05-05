import React from "react";
import { Check, Library, Image as ImageIcon, X, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "../lib/i18n";
import { Template } from "../types/template";

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onImport: () => void;
}

export const LibraryModal = ({
  isOpen,
  onClose,
  templates,
  onImport
}: LibraryModalProps) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = React.useState<'templates' | 'database'>('templates');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-6">
      <div className="bg-app-sidebar border border-app-border w-full max-w-6xl h-[88vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-app-border shrink-0 bg-app-sidebar/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-app-accent/15 rounded-xl flex items-center justify-center text-app-accent">
              <Library size={22} />
            </div>
            <div>
              <h2 className="text-ui-base font-bold text-app-text leading-none mb-1">{t.sidebar.tabs.library}</h2>
              <p className="text-ui-xs text-app-muted">Centralized management for templates and global entities</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-card rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation */}
          <div className="w-[240px] bg-app-sidebar/30 flex flex-col p-4 gap-1.5 border-r border-app-border/50">
            <button
              onClick={() => setActiveSubTab('templates')}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-ui-sm font-semibold transition-all",
                activeSubTab === 'templates'
                  ? "bg-app-accent text-accent-foreground shadow-sm shadow-app-accent/10"
                  : "text-app-muted hover:text-app-text hover:bg-app-card/50"
              )}
            >
              <Library size={18} />
              {t.sidebar.library.templates}
            </button>
            <button
              onClick={() => setActiveSubTab('database')}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-ui-sm font-semibold transition-all",
                activeSubTab === 'database'
                  ? "bg-app-accent text-accent-foreground shadow-sm shadow-app-accent/10"
                  : "text-app-muted hover:text-app-text hover:bg-app-card/50"
              )}
            >
              <ImageIcon size={18} />
              {t.sidebar.library.database}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-app-bg/50">
            {activeSubTab === 'templates' ? (
              <div className="p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-ui-base font-bold text-app-text mb-1">Template Packs</h3>
                    <p className="text-ui-xs text-app-muted">Manage your design bundles, themes, and localized assets</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-5 py-2 bg-app-card border border-app-border text-app-text text-ui-sm font-semibold rounded-xl hover:bg-app-sidebar transition-all"
                    >
                      Browse Store
                    </button>
                    <button
                      onClick={onImport}
                      className="flex items-center gap-2 px-5 py-2 bg-app-accent text-accent-foreground text-ui-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm shadow-app-accent/10"
                    >
                      <Check size={18} />
                      {t.sidebar.templates.importBtn}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-app-card border border-app-border rounded-2xl overflow-hidden flex flex-col group hover:border-app-accent/30 transition-all cursor-default"
                    >
                      <div className="relative aspect-[16/9] bg-black/5 flex items-center justify-center overflow-hidden">
                        {template.thumbnail ? (
                          <img
                            src={template.thumbnail}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            alt=""
                          />
                        ) : (
                          <Library className="w-12 h-12 text-app-muted opacity-20" />
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                           <span className="bg-app-sidebar/80 backdrop-blur-md text-app-text text-[10px] font-bold px-2 py-1 rounded-lg border border-app-border uppercase tracking-wide">
                            {template.ratio}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <div className="flex gap-2">
                              {[1, 2, 3].map(i => (
                                 <div key={i} className="w-12 h-8 rounded bg-white/20 backdrop-blur-md border border-white/10" />
                              ))}
                              <div className="w-12 h-8 rounded bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] text-white font-bold">+5</div>
                           </div>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex-1 min-w-0">
                              <h4 className="text-ui-sm font-bold text-app-text truncate mb-1">{template.name}</h4>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] bg-app-accent/10 text-app-accent font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Pack</span>
                                 <span className="text-[11px] text-app-muted font-medium uppercase tracking-tight">{template.sport}</span>
                              </div>
                           </div>
                           <div className="w-9 h-9 rounded-xl bg-app-bg border border-app-border flex items-center justify-center text-app-muted hover:text-app-text transition-colors cursor-pointer">
                              <Info size={16} />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-app-border/40">
                           <div>
                              <div className="text-[9px] text-app-muted font-bold uppercase tracking-widest mb-0.5">Author</div>
                              <div className="text-ui-xs text-app-text font-medium">RedPanda Design</div>
                           </div>
                           <div>
                              <div className="text-[9px] text-app-muted font-bold uppercase tracking-widest mb-0.5">Assets</div>
                              <div className="text-ui-xs text-app-text font-medium">12 Layers · 4 Local</div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-8 pb-4 shrink-0 flex items-end justify-between gap-6">
                  <div>
                    <h3 className="text-ui-base font-bold text-app-text mb-1">Domain Entities</h3>
                    <p className="text-ui-xs text-app-muted">Manage Clubs, Players and generic sports data</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-app-card border border-app-border rounded-xl text-ui-sm font-semibold text-app-text hover:bg-app-sidebar transition-all">
                      Add New
                    </button>
                    <button 
                      onClick={() => alert("Synchronizing with RedPanda Intelligence API...")}
                      className="px-4 py-2 bg-app-accent text-accent-foreground text-ui-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm shadow-app-accent/10 active:scale-95"
                    >
                      Sync Intelligence
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-8 py-4 grid grid-cols-4 gap-4 shrink-0">
                   {[
                     { label: 'Clubs', count: 48, theme: 'text-app-text' },
                     { label: 'Players', count: 1240, theme: 'text-app-text' },
                     { label: 'Competitions', count: 12, theme: 'text-app-text' },
                     { label: 'Common Assets', count: 210, theme: 'text-app-accent' }
                   ].map(stat => (
                      <div key={stat.label} className="bg-app-card/40 border border-app-border/40 p-4 rounded-2xl flex flex-col gap-0.5">
                        <div className={cn("text-ui-lg font-bold leading-tight", stat.theme)}>{stat.count.toLocaleString()}</div>
                        <div className="text-[10px] text-app-muted font-semibold uppercase tracking-wider">{stat.label}</div>
                      </div>
                   ))}
                </div>

                {/* Navigation & List */}
                <div className="flex-1 min-h-0 flex flex-col px-8 pb-8">
                   <div className="flex items-center gap-8 mb-6 border-b border-app-border shrink-0">
                      {(['Clubs & Kits', 'Players', 'Competitions', 'Flags & Icons'] as const).map((tab, idx) => (
                        <button 
                          key={tab} 
                          className={cn(
                            "text-ui-sm font-semibold pb-3 transition-all relative",
                            idx === 0 
                              ? "text-app-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-app-accent" 
                              : "text-app-muted hover:text-app-text"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                   </div>
                   
                   <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { name: 'Manchester City', league: 'Premier League', colors: ['#6CABDD', '#FFFFFF'], kit: 'Home' },
                           { name: 'Real Madrid', league: 'La Liga', colors: ['#FFFFFF', '#FEBE10'], kit: 'White' },
                           { name: 'Liverpool', league: 'Premier League', colors: ['#C8102E', '#FFFFFF'], kit: 'Home' },
                           { name: 'Arsenal', league: 'Premier League', colors: ['#EF0107', '#FFFFFF'], kit: 'Home' },
                           { name: 'Chelsea', league: 'Premier League', colors: ['#034694', '#FFFFFF'], kit: 'Blue' },
                           { name: 'Bayern Munich', league: 'Bundesliga', colors: ['#DC052D', '#FFFFFF'], kit: 'Red' },
                         ].map(team => (
                            <div key={team.name} className="p-4 bg-app-card/30 rounded-2xl flex items-center justify-between group hover:bg-app-card transition-all border border-app-border/30 hover:border-app-accent/20">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-app-sidebar rounded-xl border border-app-border flex items-center justify-center text-app-muted overflow-hidden relative">
                                     <ImageIcon size={22} className="opacity-20" />
                                     <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: team.colors[0] }} />
                                  </div>
                                  <div>
                                     <div className="text-ui-sm font-bold text-app-text mb-0.5">{team.name}</div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-app-muted font-medium">{team.league}</span>
                                        <span className="w-1 h-1 bg-app-border rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                           <div className="w-2 h-2 rounded-full border border-white/5" style={{ backgroundColor: team.colors[0] }} />
                                           <span className="text-[10px] text-app-accent font-bold uppercase italic tracking-tighter">{team.kit}</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                               <button className="opacity-0 group-hover:opacity-100 px-4 py-1.5 bg-app-bg border border-app-border rounded-xl text-ui-xs font-semibold text-app-muted hover:text-app-text transition-all">
                                  Edit
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
