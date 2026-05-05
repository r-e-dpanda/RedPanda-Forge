import React from "react";
import { Check, LayoutTemplate, CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { MOCK_MATCHES } from "../lib/mockData";
import { Sport, Ratio, Match, Template } from "../types/template";
import { useTranslation } from "../lib/i18n";
import { resolveAssetPath } from "../lib/assetResolver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { MatchCard } from "./MatchCard";

interface LeftSidebarProps {
  selectedSport: Sport;
  onSportChange: (sport: Sport) => void;
  selectedRatio: Ratio | "All";
  selectedCompetition: string;
  setSelectedRatio: (val: Ratio | "All") => void;
  templates: Template[];
  isTemplatesLoaded: boolean;
  setEditorTemplate: (template: Template) => void;
  activeTemplate: Template | null;
  activeMatch: Match | null;
  setEditorMatch: (match: Match) => void;
}

export const LeftSidebar = ({
  selectedSport,
  onSportChange,
  selectedRatio,
  selectedCompetition,
  setSelectedRatio,
  templates,
  isTemplatesLoaded,
  setEditorTemplate,
  activeTemplate,
  activeMatch,
  setEditorMatch,
}: LeftSidebarProps) => {
  const { t } = useTranslation();
  
  const getTemplateSelectorLabel = () => {
    if (activeTemplate) return `${activeTemplate.name} (${activeTemplate.ratio})`;
    if (!isTemplatesLoaded) return "Loading templates...";
    if (templates.length === 0) return "No templates found";
    if (filteredTemplates.length === 0) return t.sidebar.filters.noTemplates;
    return t.sidebar.filters.selectTemplate;
  };
  
  const [matchFilterType, setMatchFilterType] = React.useState<"all" | "fixtures" | "results" | "date">("all");
  const [matchDateValue, setMatchDateValue] = React.useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  const filteredMatches = MOCK_MATCHES.filter(m => {
    if (m.sport !== selectedSport) return false;
    if (selectedCompetition !== "All" && m.league !== selectedCompetition) return false;
    
    if (matchFilterType === "all") return true;
    const hasScoreOrFT = m.status === "FT" || m.status === "Finished" || (typeof m.score === "string" && m.score.trim() !== "") || (typeof m.score === "object" && m.score !== null) || !!m.sets;
    if (matchFilterType === "fixtures") return !hasScoreOrFT;
    if (matchFilterType === "results") return hasScoreOrFT;
    if (matchFilterType === "date") {
      if (matchDateValue && m.date) {
        const d = new Date(m.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const localDateString = `${yyyy}-${mm}-${dd}`;
        return localDateString === matchDateValue;
      }
    }
    return true;
  });

  const datesWithMatches = React.useMemo(() => {
    const dates = new Set<string>();
    MOCK_MATCHES.forEach(m => {
       if (m.sport !== selectedSport) return;
       if (selectedCompetition !== "All" && m.league !== selectedCompetition) return;
       if (m.date) {
         const d = new Date(m.date);
         const yyyy = d.getFullYear();
         const mm = String(d.getMonth() + 1).padStart(2, '0');
         const dd = String(d.getDate()).padStart(2, '0');
         dates.add(`${yyyy}-${mm}-${dd}`);
       }
    });
    return dates;
  }, [selectedSport, selectedCompetition]);

  const filteredTemplates = templates.filter((t: any) => {
    if (!t.sport) return false;
    const tSport = t.sport.trim().toLowerCase();
    const sSport = selectedSport.trim().toLowerCase();
    if (tSport === sSport) return true;
    if ((tSport === 'soccer' && sSport === 'football') || (tSport === 'football' && sSport === 'soccer')) return true;
    return false;
  }).filter(t => selectedRatio === "All" || t.ratio?.trim() === selectedRatio.trim());

  const groupedMatches = React.useMemo(() => {
    const order: string[] = [];
    MOCK_MATCHES.forEach(m => {
      const compId = m.competition?.id || m.league || 'other';
      if (!order.includes(compId)) order.push(compId);
    });
    const groups: Record<string, { competition: any; matches: Match[] }> = {};
    filteredMatches.forEach(m => {
      const compId = m.competition?.id || m.league || 'other';
      if (!groups[compId]) {
        groups[compId] = {
          competition: m.competition || { id: compId, name: m.league },
          matches: []
        };
      }
      groups[compId].matches.push(m);
    });
    return Object.entries(groups)
      .map(([id, group]) => ({ id, ...group }))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [filteredMatches]);

  return (
    <div className="w-[17.5rem] bg-app-sidebar border-r border-app-border flex flex-col shrink-0 z-10 font-sans relative">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col gap-4 relative h-full">
          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-ui-xs text-app-muted font-normal">{t.common.sport || "Sport"}</span>
              <Select value={selectedSport} onValueChange={(val) => onSportChange(val as Sport)}>
                <SelectTrigger className="w-full bg-app-card capitalize">
                  <SelectValue placeholder="Select sport..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="esports">Esports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-ui-xs text-app-muted font-normal">{t.sidebar.filters.ratio}</span>
              <Select value={selectedRatio} onValueChange={(val) => setSelectedRatio(val as Ratio | "All")}>
                <SelectTrigger className="w-full bg-app-card">
                  <SelectValue placeholder="Select ratio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t.sidebar.filters.allRatios}</SelectItem>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <span className={cn(
                "text-ui-xs font-normal transition-colors",
                !activeTemplate ? "text-app-accent animate-pulse" : "text-app-muted"
              )}>
                {t.sidebar.filters.template} {!activeTemplate && "*"}
              </span>
              <Select 
                key={`${selectedSport}-${selectedRatio}`}
                value={activeTemplate?.id || ""} 
                onValueChange={(val) => {
                  const tpl = templates.find((t: any) => t.id === val);
                  if (tpl) setEditorTemplate(tpl);
                }}
                disabled={filteredTemplates.length === 0}
              >
                <SelectTrigger 
                  disabled={filteredTemplates.length === 0}
                  className={cn(
                  "w-full bg-app-card transition-all",
                  !activeTemplate && "border-app-accent/50 ring-1 ring-app-accent/10"
                )}>
                  <SelectValue>{getTemplateSelectorLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{`${t.name} (${t.ratio})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Match list */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-ui-xs text-app-muted font-normal">{t.sidebar.matches.header}</h3>
                {!activeTemplate && (
                  <span className="text-ui-xs text-app-accent flex items-center gap-1 animate-pulse">
                    <LayoutTemplate size={12} />
                    {t.sidebar.matches.selectTemplateFirst}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {(["all", "fixtures", "results"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setMatchFilterType(status)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all border",
                      matchFilterType === status 
                        ? "bg-app-accent/15 border-app-accent/40 text-app-accent" 
                        : "bg-transparent border-app-border text-app-muted hover:border-app-accent/50 hover:text-app-text"
                    )}
                  >
                    {status === 'all' ? 'All' : status === 'fixtures' ? 'Fixtures' : 'Results'}
                  </button>
                ))}

                <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                  <PopoverTrigger
                    onClick={() => {
                      setMatchFilterType("date")
                      setIsPickerOpen(true)
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 border rounded-full transition-all",
                      matchFilterType === "date" 
                        ? "bg-app-accent/15 border-app-accent/40 text-app-accent" 
                        : "bg-transparent border-app-border text-app-muted hover:border-app-accent/50 hover:text-app-text"
                    )}
                  >
                    <CalendarDays size={12} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold tracking-wide mt-px">
                      {matchFilterType === "date" ? matchDateValue.split('-').reverse().slice(0, 2).join('/') : 'Date'}
                    </span>
                    <ChevronDown size={10} className={cn("transition-transform opacity-70", isPickerOpen && "rotate-180")} />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 overflow-hidden bg-app-bg border border-app-border shadow-xl rounded-lg text-app-text" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(matchDateValue + "T12:00:00")}
                      onSelect={(date) => {
                        if (date) {
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(2, '0');
                          const dd = String(date.getDate()).padStart(2, '0');
                          setMatchDateValue(`${yyyy}-${mm}-${dd}`);
                          setMatchFilterType("date");
                          setIsPickerOpen(false);
                        }
                      }}
                      initialFocus
                      modifiers={{
                        hasMatches: (date) => {
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(2, '0');
                          const dd = String(date.getDate()).padStart(2, '0');
                          return datesWithMatches.has(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                      modifiersClassNames={{
                        hasMatches: "after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-app-accent data-[selected=true]:after:bg-white after:rounded-full font-bold"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className={cn("flex flex-col gap-5", !activeTemplate && "opacity-40 grayscale pointer-events-none select-none")}>
              {groupedMatches.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-app-border rounded-lg">
                  <p className="text-app-muted text-ui-xs">{t.sidebar.matches.noMatchesFound}</p>
                </div>
              ) : (
                groupedMatches.map(group => (
                  <div key={group.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-1 pb-1 pt-1">
                      {group.competition.logo && (
                        <img src={resolveAssetPath(group.competition.logo, { packId: "", templateId: "" })} className="w-6 h-6 object-contain drop-shadow-sm" alt="" />
                      )}
                      <span className="text-[13px] font-bold text-app-text tracking-wide uppercase">{group.competition.name || group.id}</span>
                      <div className="flex-1 h-[2px] bg-app-border/40 ml-2 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {group.matches.map(m => (
                        <MatchCard key={m.id} match={m} activeTemplate={activeTemplate} activeMatch={activeMatch} setEditorMatch={setEditorMatch} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
