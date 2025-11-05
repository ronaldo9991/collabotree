import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Home, FileText, Users, MessageSquare, X } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleCommand = (command: string) => {
    onOpenChange(false);
    setSearch("");
    
    switch (command) {
      case "view-orders":
        navigate("/dashboard/buyer");
        break;
      case "search-services":
        navigate("/marketplace");
        break;
      case "home":
        navigate("/");
        break;
      case "about":
        navigate("/about");
        break;
      case "how-it-works":
        navigate("/how-it-works");
        break;
      case "contact":
        navigate("/contact");
        break;
      default:
        break;
    }
  };

  const commands = [
    {
      group: "Navigation",
      items: [
        { id: "home", label: "Home", icon: Home, shortcut: "⌘H" },
        { id: "about", label: "About", icon: Users, shortcut: "⌘A" },
        { id: "how-it-works", label: "How it Works", icon: FileText, shortcut: "⌘W" },
        { id: "contact", label: "Contact", icon: MessageSquare, shortcut: "⌘C" },
      ]
    },
    {
      group: "Marketplace",
      items: [
        { id: "search-services", label: "Search Services", icon: Search, shortcut: "⌘S" },
      ]
    }
  ];

  const filteredCommands = commands.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-[#00B2FF]/20 shadow-2xl shadow-[#00B2FF]/10 rounded-2xl [&>button]:hidden">
        <Command className="rounded-2xl">
          {/* Header with Search Bar and Close Button */}
          <div className="relative border-b border-[#00B2FF]/20 bg-gradient-to-r from-[#00B2FF]/10 via-[#0096C7]/5 to-[#00B2FF]/10">
            {/* Close Button - Top Right */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-[#00B2FF]/10 hover:bg-[#00B2FF]/20 border border-[#00B2FF]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10 shadow-sm hover:shadow-md"
              aria-label="Close command palette"
              type="button"
            >
              <X className="h-5 w-5 text-[#00B2FF]" strokeWidth={2.5} />
            </button>
            
            {/* Search Bar */}
            <div className="flex items-center px-6 py-4 pr-16">
              <Search className="h-5 w-5 text-[#00B2FF] mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-white dark:bg-white border-2 border-[#00B2FF]/20 focus:border-[#00B2FF] rounded-xl px-4 py-2.5 text-black dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-500 text-sm font-medium outline-none transition-all shadow-sm focus:shadow-md focus:shadow-[#00B2FF]/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onOpenChange(false);
                  }
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="ml-3 p-1.5 rounded-full hover:bg-[#00B2FF]/10 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                  type="button"
                >
                  <X className="h-4 w-4 text-[#00B2FF]" />
                </button>
              )}
            </div>
          </div>

          {/* Command List */}
          <CommandList className="max-h-[450px] overflow-y-auto p-2">
            <CommandEmpty className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No results found.</p>
            </CommandEmpty>
            {filteredCommands.map((group, groupIndex) => (
              <div key={group.group}>
                <CommandGroup>
                  <div className="px-2 py-1.5">
                    <h3 className="text-xs font-semibold text-[#00B2FF] uppercase tracking-wider mb-1">
                      {group.group}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleCommand(item.id)}
                        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#00B2FF]/10 rounded-xl transition-all mx-1 group"
                      >
                        <item.icon className="h-5 w-5 text-[#00B2FF] flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {item.shortcut && (
                          <Badge className="bg-[#00B2FF]/10 text-[#00B2FF] border border-[#00B2FF]/30 text-xs font-mono px-2.5 py-1">
                            {item.shortcut}
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
                {groupIndex < filteredCommands.length - 1 && (
                  <div className="my-2 mx-2 border-t border-[#00B2FF]/10" />
                )}
              </div>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}